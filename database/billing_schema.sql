-- Billing System Database Schema for LightDom Platform
-- This schema supports subscription management, payment processing, and usage tracking

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Billing Plans Table
CREATE TABLE billing_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- Price in cents
    currency VARCHAR(3) NOT NULL DEFAULT 'usd',
    interval VARCHAR(10) NOT NULL CHECK (interval IN ('month', 'year')),
    features JSONB NOT NULL DEFAULT '[]',
    limits JSONB NOT NULL DEFAULT '{}',
    metadata JSONB NOT NULL DEFAULT '{}',
    stripe_product_id VARCHAR(255),
    stripe_price_id VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    plan_id UUID NOT NULL REFERENCES billing_plans(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    canceled_at TIMESTAMP WITH TIME ZONE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Payment Methods Table
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('card', 'bank_account', 'paypal')),
    brand VARCHAR(50), -- Visa, Mastercard, etc.
    last4 VARCHAR(4),
    exp_month INTEGER,
    exp_year INTEGER,
    is_default BOOLEAN NOT NULL DEFAULT false,
    stripe_payment_method_id VARCHAR(255) UNIQUE,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Invoices Table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
    amount INTEGER NOT NULL, -- Amount in cents
    currency VARCHAR(3) NOT NULL DEFAULT 'usd',
    description TEXT,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    stripe_invoice_id VARCHAR(255) UNIQUE,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Invoice Items Table
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount INTEGER NOT NULL, -- Amount in cents
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price INTEGER NOT NULL, -- Unit price in cents
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Usage Records Table
CREATE TABLE usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    period VARCHAR(7) NOT NULL, -- YYYY-MM format
    metrics JSONB NOT NULL DEFAULT '{}',
    limits JSONB NOT NULL DEFAULT '{}',
    overages JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, subscription_id, period)
);

-- Payment Intents Table
CREATE TABLE payment_intents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    amount INTEGER NOT NULL, -- Amount in cents
    currency VARCHAR(3) NOT NULL DEFAULT 'usd',
    status VARCHAR(30) NOT NULL CHECK (status IN (
        'requires_payment_method', 'requires_confirmation', 'requires_action',
        'processing', 'requires_capture', 'canceled', 'succeeded'
    )),
    description TEXT,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Webhook Events Table
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(100) NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    processed BOOLEAN NOT NULL DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Billing Audit Trail Table
CREATE TABLE billing_audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- subscription, invoice, payment_method, etc.
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB NOT NULL DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_current_period_end ON subscriptions(current_period_end);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_stripe_payment_method_id ON payment_methods(stripe_payment_method_id);
CREATE INDEX idx_payment_methods_is_default ON payment_methods(is_default);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);

CREATE INDEX idx_usage_records_user_id ON usage_records(user_id);
CREATE INDEX idx_usage_records_subscription_id ON usage_records(subscription_id);
CREATE INDEX idx_usage_records_period ON usage_records(period);

CREATE INDEX idx_payment_intents_user_id ON payment_intents(user_id);
CREATE INDEX idx_payment_intents_status ON payment_intents(status);
CREATE INDEX idx_payment_intents_stripe_payment_intent_id ON payment_intents(stripe_payment_intent_id);

CREATE INDEX idx_webhook_events_type ON webhook_events(type);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at);

CREATE INDEX idx_billing_audit_trail_user_id ON billing_audit_trail(user_id);
CREATE INDEX idx_billing_audit_trail_action ON billing_audit_trail(action);
CREATE INDEX idx_billing_audit_trail_entity_type ON billing_audit_trail(entity_type);
CREATE INDEX idx_billing_audit_trail_entity_id ON billing_audit_trail(entity_id);
CREATE INDEX idx_billing_audit_trail_created_at ON billing_audit_trail(created_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_billing_plans_updated_at BEFORE UPDATE ON billing_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoice_items_updated_at BEFORE UPDATE ON invoice_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usage_records_updated_at BEFORE UPDATE ON usage_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_intents_updated_at BEFORE UPDATE ON payment_intents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit trigger for billing operations
CREATE OR REPLACE FUNCTION billing_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO billing_audit_trail (
        user_id,
        action,
        entity_type,
        entity_id,
        old_values,
        new_values,
        metadata
    ) VALUES (
        COALESCE(NEW.user_id, OLD.user_id),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
        '{}'
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply audit triggers to billing tables
CREATE TRIGGER billing_plans_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON billing_plans FOR EACH ROW EXECUTE FUNCTION billing_audit_trigger();
CREATE TRIGGER subscriptions_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON subscriptions FOR EACH ROW EXECUTE FUNCTION billing_audit_trigger();
CREATE TRIGGER payment_methods_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON payment_methods FOR EACH ROW EXECUTE FUNCTION billing_audit_trigger();
CREATE TRIGGER invoices_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON invoices FOR EACH ROW EXECUTE FUNCTION billing_audit_trigger();
CREATE TRIGGER invoice_items_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON invoice_items FOR EACH ROW EXECUTE FUNCTION billing_audit_trigger();
CREATE TRIGGER usage_records_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON usage_records FOR EACH ROW EXECUTE FUNCTION billing_audit_trigger();
CREATE TRIGGER payment_intents_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON payment_intents FOR EACH ROW EXECUTE FUNCTION billing_audit_trigger();

-- Insert default billing plans
INSERT INTO billing_plans (id, name, description, price, currency, interval, features, limits, metadata) VALUES
(
    uuid_generate_v4(),
    'Basic',
    'Perfect for small projects',
    2900, -- $29.00
    'usd',
    'month',
    '["1,000 optimizations/month", "10,000 API calls/month", "1GB storage", "5GB bandwidth", "5 domains", "Email support"]',
    '{"optimizations": 1000, "storage": 1000, "apiCalls": 10000, "users": 1, "domains": 5}',
    '{"popular": false}'
),
(
    uuid_generate_v4(),
    'Professional',
    'Ideal for growing businesses',
    9900, -- $99.00
    'usd',
    'month',
    '["10,000 optimizations/month", "100,000 API calls/month", "10GB storage", "50GB bandwidth", "25 domains", "Priority support", "Advanced analytics", "Custom integrations"]',
    '{"optimizations": 10000, "storage": 10000, "apiCalls": 100000, "users": 5, "domains": 25}',
    '{"popular": true}'
),
(
    uuid_generate_v4(),
    'Enterprise',
    'For large organizations',
    29900, -- $299.00
    'usd',
    'month',
    '["Unlimited optimizations", "Unlimited API calls", "100GB storage", "500GB bandwidth", "Unlimited domains", "24/7 phone support", "Advanced analytics", "Custom integrations", "SSO integration", "Dedicated account manager"]',
    '{"optimizations": -1, "storage": 100000, "apiCalls": -1, "users": -1, "domains": -1}',
    '{"recommended": true}'
);

-- Create views for common queries
CREATE VIEW active_subscriptions AS
SELECT 
    s.*,
    bp.name as plan_name,
    bp.description as plan_description,
    bp.price as plan_price,
    bp.currency as plan_currency,
    bp.interval as plan_interval,
    bp.features as plan_features,
    bp.limits as plan_limits
FROM subscriptions s
JOIN billing_plans bp ON s.plan_id = bp.id
WHERE s.status = 'active';

CREATE VIEW subscription_usage_summary AS
SELECT 
    s.user_id,
    s.id as subscription_id,
    bp.name as plan_name,
    ur.period,
    ur.metrics,
    ur.limits,
    ur.overages,
    CASE 
        WHEN ur.metrics->>'optimizations' IS NOT NULL 
        THEN (ur.metrics->>'optimizations')::integer 
        ELSE 0 
    END as optimizations_used,
    CASE 
        WHEN ur.limits->>'optimizations' IS NOT NULL 
        THEN (ur.limits->>'optimizations')::integer 
        ELSE 0 
    END as optimizations_limit
FROM subscriptions s
JOIN billing_plans bp ON s.plan_id = bp.id
LEFT JOIN usage_records ur ON s.id = ur.subscription_id
WHERE s.status = 'active';

CREATE VIEW billing_revenue_summary AS
SELECT 
    DATE_TRUNC('month', i.created_at) as month,
    COUNT(*) as total_invoices,
    SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END) as total_revenue,
    SUM(CASE WHEN i.status = 'paid' THEN 1 ELSE 0 END) as paid_invoices,
    SUM(CASE WHEN i.status = 'open' THEN 1 ELSE 0 END) as pending_invoices,
    SUM(CASE WHEN i.status = 'uncollectible' THEN 1 ELSE 0 END) as failed_invoices
FROM invoices i
GROUP BY DATE_TRUNC('month', i.created_at)
ORDER BY month DESC;

-- Create functions for billing operations
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
RETURNS TABLE (
    subscription_id UUID,
    plan_id UUID,
    plan_name VARCHAR(255),
    status VARCHAR(20),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.plan_id,
        bp.name,
        s.status,
        s.current_period_start,
        s.current_period_end,
        s.trial_end,
        s.cancel_at_period_end
    FROM subscriptions s
    JOIN billing_plans bp ON s.plan_id = bp.id
    WHERE s.user_id = p_user_id
    AND s.status IN ('active', 'trialing')
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_usage(p_user_id UUID, p_period VARCHAR(7))
RETURNS TABLE (
    optimizations INTEGER,
    api_calls INTEGER,
    storage_used INTEGER,
    bandwidth_used INTEGER,
    domains_scanned INTEGER,
    optimizations_limit INTEGER,
    api_calls_limit INTEGER,
    storage_limit INTEGER,
    bandwidth_limit INTEGER,
    domains_limit INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE((ur.metrics->>'optimizations')::integer, 0),
        COALESCE((ur.metrics->>'apiCalls')::integer, 0),
        COALESCE((ur.metrics->>'storageUsed')::integer, 0),
        COALESCE((ur.metrics->>'bandwidthUsed')::integer, 0),
        COALESCE((ur.metrics->>'domainsScanned')::integer, 0),
        COALESCE((ur.limits->>'optimizations')::integer, 0),
        COALESCE((ur.limits->>'apiCalls')::integer, 0),
        COALESCE((ur.limits->>'storage')::integer, 0),
        COALESCE((ur.limits->>'bandwidth')::integer, 0),
        COALESCE((ur.limits->>'domains')::integer, 0)
    FROM usage_records ur
    JOIN subscriptions s ON ur.subscription_id = s.id
    WHERE s.user_id = p_user_id
    AND ur.period = p_period
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lightdom_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO lightdom_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO lightdom_user;