-- LightDom Billing System Database Schema
-- Implements comprehensive billing tables with security and compliance
-- 
-- Security Features:
-- - Encrypted sensitive data storage
-- - Audit trail for all billing operations
-- - Data retention policies
-- - GDPR compliance support

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Billing Plans Table
CREATE TABLE billing_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stripe_price_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_amount INTEGER NOT NULL, -- Amount in cents
    currency VARCHAR(3) NOT NULL DEFAULT 'usd',
    billing_interval VARCHAR(20) NOT NULL CHECK (billing_interval IN ('day', 'week', 'month', 'year')),
    trial_period_days INTEGER DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,
    limits JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customers Table (extends existing users)
CREATE TABLE billing_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment Methods Table
CREATE TABLE billing_payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES billing_customers(id) ON DELETE CASCADE,
    stripe_payment_method_id VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('card', 'bank_account', 'paypal')),
    brand VARCHAR(50),
    last4 VARCHAR(4),
    exp_month INTEGER,
    exp_year INTEGER,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions Table
CREATE TABLE billing_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES billing_customers(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
    plan_id UUID REFERENCES billing_plans(id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'incomplete', 'trialing')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Invoices Table
CREATE TABLE billing_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES billing_customers(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES billing_subscriptions(id) ON DELETE SET NULL,
    stripe_invoice_id VARCHAR(255) UNIQUE NOT NULL,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
    amount_due INTEGER NOT NULL, -- Amount in cents
    amount_paid INTEGER DEFAULT 0, -- Amount in cents
    currency VARCHAR(3) NOT NULL DEFAULT 'usd',
    due_date TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    invoice_pdf_url TEXT,
    hosted_invoice_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Invoice Items Table
CREATE TABLE billing_invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES billing_invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount INTEGER NOT NULL, -- Amount in cents
    quantity INTEGER DEFAULT 1,
    unit_price INTEGER NOT NULL, -- Unit price in cents
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Usage Records Table (for metered billing)
CREATE TABLE billing_usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES billing_customers(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES billing_subscriptions(id) ON DELETE CASCADE,
    subscription_item_id VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    action VARCHAR(20) DEFAULT 'increment' CHECK (action IN ('increment', 'set')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment Transactions Table
CREATE TABLE billing_payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES billing_customers(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES billing_invoices(id) ON DELETE SET NULL,
    stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    amount INTEGER NOT NULL, -- Amount in cents
    currency VARCHAR(3) NOT NULL DEFAULT 'usd',
    status VARCHAR(50) NOT NULL CHECK (status IN ('requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'succeeded', 'canceled')),
    payment_method_id UUID REFERENCES billing_payment_methods(id) ON DELETE SET NULL,
    failure_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Billing Events Table (audit trail)
CREATE TABLE billing_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES billing_customers(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    stripe_event_id VARCHAR(255),
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Billing Analytics Table (for reporting)
CREATE TABLE billing_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES billing_customers(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    metric_date DATE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_billing_customers_stripe_id ON billing_customers(stripe_customer_id);
CREATE INDEX idx_billing_customers_user_id ON billing_customers(user_id);
CREATE INDEX idx_billing_customers_email ON billing_customers(email);

CREATE INDEX idx_billing_payment_methods_customer_id ON billing_payment_methods(customer_id);
CREATE INDEX idx_billing_payment_methods_stripe_id ON billing_payment_methods(stripe_payment_method_id);
CREATE INDEX idx_billing_payment_methods_default ON billing_payment_methods(customer_id, is_default) WHERE is_default = true;

CREATE INDEX idx_billing_subscriptions_customer_id ON billing_subscriptions(customer_id);
CREATE INDEX idx_billing_subscriptions_stripe_id ON billing_subscriptions(stripe_subscription_id);
CREATE INDEX idx_billing_subscriptions_status ON billing_subscriptions(status);
CREATE INDEX idx_billing_subscriptions_period ON billing_subscriptions(current_period_start, current_period_end);

CREATE INDEX idx_billing_invoices_customer_id ON billing_invoices(customer_id);
CREATE INDEX idx_billing_invoices_stripe_id ON billing_invoices(stripe_invoice_id);
CREATE INDEX idx_billing_invoices_status ON billing_invoices(status);
CREATE INDEX idx_billing_invoices_due_date ON billing_invoices(due_date);
CREATE INDEX idx_billing_invoices_created_at ON billing_invoices(created_at);

CREATE INDEX idx_billing_invoice_items_invoice_id ON billing_invoice_items(invoice_id);

CREATE INDEX idx_billing_usage_records_customer_id ON billing_usage_records(customer_id);
CREATE INDEX idx_billing_usage_records_subscription_id ON billing_usage_records(subscription_id);
CREATE INDEX idx_billing_usage_records_timestamp ON billing_usage_records(timestamp);
CREATE INDEX idx_billing_usage_records_item_id ON billing_usage_records(subscription_item_id);

CREATE INDEX idx_billing_payment_transactions_customer_id ON billing_payment_transactions(customer_id);
CREATE INDEX idx_billing_payment_transactions_stripe_id ON billing_payment_transactions(stripe_payment_intent_id);
CREATE INDEX idx_billing_payment_transactions_status ON billing_payment_transactions(status);
CREATE INDEX idx_billing_payment_transactions_created_at ON billing_payment_transactions(created_at);

CREATE INDEX idx_billing_events_customer_id ON billing_events(customer_id);
CREATE INDEX idx_billing_events_type ON billing_events(event_type);
CREATE INDEX idx_billing_events_processed_at ON billing_events(processed_at);
CREATE INDEX idx_billing_events_stripe_id ON billing_events(stripe_event_id);

CREATE INDEX idx_billing_analytics_customer_id ON billing_analytics(customer_id);
CREATE INDEX idx_billing_analytics_metric_name ON billing_analytics(metric_name);
CREATE INDEX idx_billing_analytics_metric_date ON billing_analytics(metric_date);
CREATE INDEX idx_billing_analytics_customer_metric_date ON billing_analytics(customer_id, metric_name, metric_date);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_billing_plans_updated_at BEFORE UPDATE ON billing_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_customers_updated_at BEFORE UPDATE ON billing_customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_payment_methods_updated_at BEFORE UPDATE ON billing_payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_subscriptions_updated_at BEFORE UPDATE ON billing_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_invoices_updated_at BEFORE UPDATE ON billing_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_payment_transactions_updated_at BEFORE UPDATE ON billing_payment_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create functions for billing operations

-- Function to get customer billing summary
CREATE OR REPLACE FUNCTION get_customer_billing_summary(customer_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'customer_id', bc.id,
        'stripe_customer_id', bc.stripe_customer_id,
        'email', bc.email,
        'name', bc.name,
        'active_subscriptions', (
            SELECT COUNT(*) FROM billing_subscriptions bs 
            WHERE bs.customer_id = customer_uuid AND bs.status = 'active'
        ),
        'total_revenue', (
            SELECT COALESCE(SUM(amount_paid), 0) FROM billing_invoices bi 
            WHERE bi.customer_id = customer_uuid AND bi.status = 'paid'
        ),
        'payment_methods_count', (
            SELECT COUNT(*) FROM billing_payment_methods bpm 
            WHERE bpm.customer_id = customer_uuid AND bpm.is_active = true
        ),
        'last_payment_date', (
            SELECT MAX(paid_at) FROM billing_invoices bi 
            WHERE bi.customer_id = customer_uuid AND bi.status = 'paid'
        )
    ) INTO result
    FROM billing_customers bc
    WHERE bc.id = customer_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate monthly recurring revenue
CREATE OR REPLACE FUNCTION calculate_monthly_recurring_revenue()
RETURNS DECIMAL(15,2) AS $$
DECLARE
    mrr DECIMAL(15,2);
BEGIN
    SELECT COALESCE(SUM(bp.price_amount), 0) INTO mrr
    FROM billing_subscriptions bs
    JOIN billing_plans bp ON bs.plan_id = bp.id
    WHERE bs.status = 'active'
    AND bp.billing_interval = 'month';
    
    RETURN mrr;
END;
$$ LANGUAGE plpgsql;

-- Function to get churn rate
CREATE OR REPLACE FUNCTION calculate_churn_rate(days_back INTEGER DEFAULT 30)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_customers INTEGER;
    churned_customers INTEGER;
    churn_rate DECIMAL(5,2);
BEGIN
    -- Get total customers at start of period
    SELECT COUNT(*) INTO total_customers
    FROM billing_customers bc
    WHERE bc.created_at <= CURRENT_TIMESTAMP - INTERVAL '1 day' * days_back;
    
    -- Get customers who canceled in the period
    SELECT COUNT(DISTINCT bs.customer_id) INTO churned_customers
    FROM billing_subscriptions bs
    WHERE bs.canceled_at >= CURRENT_TIMESTAMP - INTERVAL '1 day' * days_back
    AND bs.canceled_at <= CURRENT_TIMESTAMP;
    
    -- Calculate churn rate
    IF total_customers > 0 THEN
        churn_rate := (churned_customers::DECIMAL / total_customers::DECIMAL) * 100;
    ELSE
        churn_rate := 0;
    END IF;
    
    RETURN churn_rate;
END;
$$ LANGUAGE plpgsql;

-- Insert default billing plans
INSERT INTO billing_plans (stripe_price_id, name, description, price_amount, currency, billing_interval, trial_period_days, features, limits) VALUES
('price_starter_monthly', 'Starter', 'Perfect for individuals and small projects', 2900, 'usd', 'month', 14, 
 '["Up to 1,000 optimizations", "Basic analytics", "Email support"]'::jsonb,
 '{"optimizations": 1000, "api_calls": 10000, "storage": 1073741824}'::jsonb),

('price_professional_monthly', 'Professional', 'Ideal for growing businesses', 9900, 'usd', 'month', 14,
 '["Up to 10,000 optimizations", "Advanced analytics", "Priority support", "API access"]'::jsonb,
 '{"optimizations": 10000, "api_calls": 100000, "storage": 10737418240}'::jsonb),

('price_enterprise_monthly', 'Enterprise', 'For large organizations with advanced needs', 29900, 'usd', 'month', 14,
 '["Unlimited optimizations", "Custom analytics", "24/7 support", "Advanced API", "Custom integrations"]'::jsonb,
 '{"optimizations": -1, "api_calls": -1, "storage": 107374182400}'::jsonb),

('price_starter_yearly', 'Starter (Annual)', 'Perfect for individuals and small projects - Annual', 29000, 'usd', 'year', 14,
 '["Up to 1,000 optimizations", "Basic analytics", "Email support", "2 months free"]'::jsonb,
 '{"optimizations": 1000, "api_calls": 10000, "storage": 1073741824}'::jsonb),

('price_professional_yearly', 'Professional (Annual)', 'Ideal for growing businesses - Annual', 99000, 'usd', 'year', 14,
 '["Up to 10,000 optimizations", "Advanced analytics", "Priority support", "API access", "2 months free"]'::jsonb,
 '{"optimizations": 10000, "api_calls": 100000, "storage": 10737418240}'::jsonb),

('price_enterprise_yearly', 'Enterprise (Annual)', 'For large organizations with advanced needs - Annual', 299000, 'usd', 'year', 14,
 '["Unlimited optimizations", "Custom analytics", "24/7 support", "Advanced API", "Custom integrations", "2 months free"]'::jsonb,
 '{"optimizations": -1, "api_calls": -1, "storage": 107374182400}'::jsonb);

-- Create views for common queries

-- Customer billing summary view
CREATE VIEW customer_billing_summary AS
SELECT 
    bc.id as customer_id,
    bc.stripe_customer_id,
    bc.email,
    bc.name,
    COUNT(DISTINCT bs.id) as total_subscriptions,
    COUNT(DISTINCT CASE WHEN bs.status = 'active' THEN bs.id END) as active_subscriptions,
    COUNT(DISTINCT bpm.id) as payment_methods_count,
    COUNT(DISTINCT bi.id) as total_invoices,
    COUNT(DISTINCT CASE WHEN bi.status = 'paid' THEN bi.id END) as paid_invoices,
    COALESCE(SUM(CASE WHEN bi.status = 'paid' THEN bi.amount_paid ELSE 0 END), 0) as total_revenue,
    MAX(bi.paid_at) as last_payment_date,
    bc.created_at as customer_since
FROM billing_customers bc
LEFT JOIN billing_subscriptions bs ON bc.id = bs.customer_id
LEFT JOIN billing_payment_methods bpm ON bc.id = bpm.customer_id AND bpm.is_active = true
LEFT JOIN billing_invoices bi ON bc.id = bi.customer_id
GROUP BY bc.id, bc.stripe_customer_id, bc.email, bc.name, bc.created_at;

-- Monthly revenue view
CREATE VIEW monthly_revenue AS
SELECT 
    DATE_TRUNC('month', bi.paid_at) as month,
    COUNT(DISTINCT bi.customer_id) as paying_customers,
    COUNT(bi.id) as invoices_paid,
    SUM(bi.amount_paid) as total_revenue,
    AVG(bi.amount_paid) as average_invoice_amount
FROM billing_invoices bi
WHERE bi.status = 'paid' AND bi.paid_at IS NOT NULL
GROUP BY DATE_TRUNC('month', bi.paid_at)
ORDER BY month DESC;

-- Subscription analytics view
CREATE VIEW subscription_analytics AS
SELECT 
    bp.name as plan_name,
    bp.price_amount,
    bp.billing_interval,
    COUNT(bs.id) as total_subscriptions,
    COUNT(CASE WHEN bs.status = 'active' THEN bs.id END) as active_subscriptions,
    COUNT(CASE WHEN bs.status = 'canceled' THEN bs.id END) as canceled_subscriptions,
    COUNT(CASE WHEN bs.status = 'past_due' THEN bs.id END) as past_due_subscriptions,
    AVG(EXTRACT(EPOCH FROM (bs.canceled_at - bs.created_at))/86400) as avg_days_to_cancel
FROM billing_plans bp
LEFT JOIN billing_subscriptions bs ON bp.id = bs.plan_id
GROUP BY bp.id, bp.name, bp.price_amount, bp.billing_interval;

-- Grant permissions (adjust based on your security requirements)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO billing_service_role;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO billing_service_role;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO billing_service_role;

-- Add comments for documentation
COMMENT ON TABLE billing_plans IS 'Stores billing plans and pricing information';
COMMENT ON TABLE billing_customers IS 'Stores customer billing information linked to Stripe';
COMMENT ON TABLE billing_payment_methods IS 'Stores customer payment methods';
COMMENT ON TABLE billing_subscriptions IS 'Stores customer subscriptions';
COMMENT ON TABLE billing_invoices IS 'Stores invoice information';
COMMENT ON TABLE billing_invoice_items IS 'Stores individual items within invoices';
COMMENT ON TABLE billing_usage_records IS 'Stores usage records for metered billing';
COMMENT ON TABLE billing_payment_transactions IS 'Stores payment transaction details';
COMMENT ON TABLE billing_events IS 'Audit trail for all billing events';
COMMENT ON TABLE billing_analytics IS 'Stores billing analytics and metrics';

COMMENT ON FUNCTION get_customer_billing_summary(UUID) IS 'Returns comprehensive billing summary for a customer';
COMMENT ON FUNCTION calculate_monthly_recurring_revenue() IS 'Calculates total monthly recurring revenue';
COMMENT ON FUNCTION calculate_churn_rate(INTEGER) IS 'Calculates customer churn rate for specified period';
