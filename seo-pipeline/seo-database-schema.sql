-- SEO Pipeline Database Schema Extensions
-- Extends the existing optimization schema with SEO-specific tables

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- SEO ANALYSIS TABLES
-- =====================================================

-- SEO analysis results table
CREATE TABLE seo_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    analysis_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    core_web_vitals JSONB NOT NULL,
    content_metrics JSONB NOT NULL,
    technical_seo JSONB NOT NULL,
    backlink_metrics JSONB NOT NULL,
    schema_metrics JSONB NOT NULL,
    seo_score DECIMAL(5, 2) NOT NULL CHECK (seo_score >= 0 AND seo_score <= 100),
    recommendations JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(url, analysis_timestamp)
);

-- Domain-level SEO metrics aggregation
CREATE TABLE domain_seo_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain TEXT UNIQUE NOT NULL,
    last_analysis TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    avg_seo_score DECIMAL(5, 2) NOT NULL DEFAULT 0,
    total_pages_analyzed INTEGER NOT NULL DEFAULT 0,
    performance_trend DECIMAL(5, 2) DEFAULT 0,
    content_trend DECIMAL(5, 2) DEFAULT 0,
    technical_trend DECIMAL(5, 2) DEFAULT 0,
    backlink_trend DECIMAL(5, 2) DEFAULT 0,
    schema_trend DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEO insights for AI training
CREATE TABLE seo_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    analysis_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    insights_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(url, analysis_timestamp)
);

-- =====================================================
-- API MANAGEMENT TABLES
-- =====================================================

-- API keys for SEO service access
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_hash VARCHAR(64) UNIQUE NOT NULL,
    owner_email VARCHAR(255) NOT NULL,
    requests_used INTEGER DEFAULT 0,
    requests_limit INTEGER DEFAULT 1000,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- API usage tracking
CREATE TABLE api_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    response_time_ms INTEGER,
    status_code INTEGER,
    request_size_bytes INTEGER,
    response_size_bytes INTEGER,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SEO RECOMMENDATIONS TABLES
-- =====================================================

-- SEO recommendations tracking
CREATE TABLE seo_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    impact VARCHAR(20) NOT NULL,
    predicted_improvement DECIMAL(5, 2),
    implementation_status VARCHAR(20) DEFAULT 'pending',
    implemented_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI model predictions
CREATE TABLE ai_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    prediction_type VARCHAR(50) NOT NULL,
    input_data JSONB NOT NULL,
    predicted_score DECIMAL(5, 2) NOT NULL,
    confidence DECIMAL(5, 2) NOT NULL,
    model_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- COMPETITIVE ANALYSIS TABLES
-- =====================================================

-- Domain comparisons
CREATE TABLE domain_comparisons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comparison_name VARCHAR(255) NOT NULL,
    domains TEXT[] NOT NULL,
    comparison_data JSONB NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEO benchmarks
CREATE TABLE seo_benchmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    industry VARCHAR(100) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    benchmark_value DECIMAL(10, 2) NOT NULL,
    percentile INTEGER NOT NULL CHECK (percentile >= 0 AND percentile <= 100),
    sample_size INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TREND ANALYSIS TABLES
-- =====================================================

-- SEO trends tracking
CREATE TABLE seo_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain TEXT NOT NULL,
    trend_date DATE NOT NULL,
    avg_seo_score DECIMAL(5, 2) NOT NULL,
    page_count INTEGER NOT NULL,
    avg_lcp DECIMAL(10, 2),
    avg_fid DECIMAL(10, 2),
    avg_cls DECIMAL(5, 4),
    avg_load_time DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(domain, trend_date)
);

-- Performance trends
CREATE TABLE performance_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    trend_date DATE NOT NULL,
    lcp DECIMAL(10, 2),
    fid DECIMAL(10, 2),
    cls DECIMAL(5, 4),
    load_time DECIMAL(10, 2),
    seo_score DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(url, trend_date)
);

-- =====================================================
-- MODEL MANAGEMENT TABLES
-- =====================================================

-- AI model versions
CREATE TABLE ai_model_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version VARCHAR(50) UNIQUE NOT NULL,
    model_path TEXT NOT NULL,
    training_samples INTEGER NOT NULL,
    validation_accuracy DECIMAL(5, 4),
    training_loss DECIMAL(10, 6),
    validation_loss DECIMAL(10, 6),
    feature_count INTEGER NOT NULL,
    training_duration_seconds INTEGER,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model training logs
CREATE TABLE model_training_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_version VARCHAR(50) NOT NULL,
    epoch INTEGER NOT NULL,
    training_loss DECIMAL(10, 6),
    validation_loss DECIMAL(10, 6),
    training_accuracy DECIMAL(5, 4),
    validation_accuracy DECIMAL(5, 4),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- SEO analysis indexes
CREATE INDEX idx_seo_analysis_url ON seo_analysis(url);
CREATE INDEX idx_seo_analysis_domain ON seo_analysis(domain);
CREATE INDEX idx_seo_analysis_timestamp ON seo_analysis(analysis_timestamp DESC);
CREATE INDEX idx_seo_analysis_score ON seo_analysis(seo_score DESC);
CREATE INDEX idx_seo_analysis_url_timestamp ON seo_analysis(url, analysis_timestamp DESC);

-- Domain metrics indexes
CREATE INDEX idx_domain_seo_metrics_domain ON domain_seo_metrics(domain);
CREATE INDEX idx_domain_seo_metrics_score ON domain_seo_metrics(avg_seo_score DESC);
CREATE INDEX idx_domain_seo_metrics_last_analysis ON domain_seo_metrics(last_analysis DESC);

-- SEO insights indexes
CREATE INDEX idx_seo_insights_url ON seo_insights(url);
CREATE INDEX idx_seo_insights_domain ON seo_insights(domain);
CREATE INDEX idx_seo_insights_timestamp ON seo_insights(analysis_timestamp DESC);

-- API management indexes
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_owner ON api_keys(owner_email);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);
CREATE INDEX idx_api_usage_logs_key_id ON api_usage_logs(api_key_id);
CREATE INDEX idx_api_usage_logs_timestamp ON api_usage_logs(created_at DESC);
CREATE INDEX idx_api_usage_logs_endpoint ON api_usage_logs(endpoint);

-- Recommendations indexes
CREATE INDEX idx_seo_recommendations_url ON seo_recommendations(url);
CREATE INDEX idx_seo_recommendations_domain ON seo_recommendations(domain);
CREATE INDEX idx_seo_recommendations_category ON seo_recommendations(category);
CREATE INDEX idx_seo_recommendations_priority ON seo_recommendations(priority);
CREATE INDEX idx_seo_recommendations_status ON seo_recommendations(implementation_status);

-- AI predictions indexes
CREATE INDEX idx_ai_predictions_url ON ai_predictions(url);
CREATE INDEX idx_ai_predictions_domain ON ai_predictions(domain);
CREATE INDEX idx_ai_predictions_type ON ai_predictions(prediction_type);
CREATE INDEX idx_ai_predictions_timestamp ON ai_predictions(created_at DESC);

-- Trends indexes
CREATE INDEX idx_seo_trends_domain ON seo_trends(domain);
CREATE INDEX idx_seo_trends_date ON seo_trends(trend_date DESC);
CREATE INDEX idx_seo_trends_domain_date ON seo_trends(domain, trend_date DESC);
CREATE INDEX idx_performance_trends_url ON performance_trends(url);
CREATE INDEX idx_performance_trends_date ON performance_trends(trend_date DESC);
CREATE INDEX idx_performance_trends_url_date ON performance_trends(url, trend_date DESC);

-- Model management indexes
CREATE INDEX idx_ai_model_versions_version ON ai_model_versions(version);
CREATE INDEX idx_ai_model_versions_active ON ai_model_versions(is_active);
CREATE INDEX idx_ai_model_versions_created ON ai_model_versions(created_at DESC);
CREATE INDEX idx_model_training_logs_version ON model_training_logs(model_version);
CREATE INDEX idx_model_training_logs_timestamp ON model_training_logs(timestamp DESC);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update domain metrics after SEO analysis
CREATE OR REPLACE FUNCTION update_domain_seo_metrics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO domain_seo_metrics (
        domain, last_analysis, avg_seo_score, total_pages_analyzed,
        performance_trend, content_trend, technical_trend
    ) VALUES (
        NEW.domain, NEW.analysis_timestamp, NEW.seo_score, 1,
        (NEW.core_web_vitals->>'lcp')::decimal,
        (NEW.content_metrics->>'title')::jsonb->>'score'::decimal,
        (NEW.technical_seo->>'pageSpeed')::jsonb->>'score'::decimal
    )
    ON CONFLICT (domain) DO UPDATE SET
        last_analysis = EXCLUDED.last_analysis,
        avg_seo_score = (domain_seo_metrics.avg_seo_score * domain_seo_metrics.total_pages_analyzed + EXCLUDED.avg_seo_score) / (domain_seo_metrics.total_pages_analyzed + 1),
        total_pages_analyzed = domain_seo_metrics.total_pages_analyzed + 1,
        performance_trend = EXCLUDED.performance_trend,
        content_trend = EXCLUDED.content_trend,
        technical_trend = EXCLUDED.technical_trend,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update domain metrics
CREATE TRIGGER update_domain_seo_metrics_trigger
    AFTER INSERT ON seo_analysis
    FOR EACH ROW EXECUTE FUNCTION update_domain_seo_metrics();

-- Function to update SEO trends
CREATE OR REPLACE FUNCTION update_seo_trends()
RETURNS TRIGGER AS $$
DECLARE
    trend_date DATE := DATE(NEW.analysis_timestamp);
BEGIN
    INSERT INTO seo_trends (
        domain, trend_date, avg_seo_score, page_count,
        avg_lcp, avg_fid, avg_cls, avg_load_time
    ) VALUES (
        NEW.domain, trend_date, NEW.seo_score, 1,
        (NEW.core_web_vitals->>'lcp')::decimal,
        (NEW.core_web_vitals->>'fid')::decimal,
        (NEW.core_web_vitals->>'cls')::decimal,
        (NEW.technical_seo->>'pageSpeed')::jsonb->>'loadTime'::decimal
    )
    ON CONFLICT (domain, trend_date) DO UPDATE SET
        avg_seo_score = (seo_trends.avg_seo_score * seo_trends.page_count + NEW.seo_score) / (seo_trends.page_count + 1),
        page_count = seo_trends.page_count + 1,
        avg_lcp = (seo_trends.avg_lcp * seo_trends.page_count + (NEW.core_web_vitals->>'lcp')::decimal) / (seo_trends.page_count + 1),
        avg_fid = (seo_trends.avg_fid * seo_trends.page_count + (NEW.core_web_vitals->>'fid')::decimal) / (seo_trends.page_count + 1),
        avg_cls = (seo_trends.avg_cls * seo_trends.page_count + (NEW.core_web_vitals->>'cls')::decimal) / (seo_trends.page_count + 1),
        avg_load_time = (seo_trends.avg_load_time * seo_trends.page_count + (NEW.technical_seo->>'pageSpeed')::jsonb->>'loadTime'::decimal) / (seo_trends.page_count + 1);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update SEO trends
CREATE TRIGGER update_seo_trends_trigger
    AFTER INSERT ON seo_analysis
    FOR EACH ROW EXECUTE FUNCTION update_seo_trends();

-- Function to update performance trends
CREATE OR REPLACE FUNCTION update_performance_trends()
RETURNS TRIGGER AS $$
DECLARE
    trend_date DATE := DATE(NEW.analysis_timestamp);
BEGIN
    INSERT INTO performance_trends (
        url, trend_date, lcp, fid, cls, load_time, seo_score
    ) VALUES (
        NEW.url, trend_date,
        (NEW.core_web_vitals->>'lcp')::decimal,
        (NEW.core_web_vitals->>'fid')::decimal,
        (NEW.core_web_vitals->>'cls')::decimal,
        (NEW.technical_seo->>'pageSpeed')::jsonb->>'loadTime'::decimal,
        NEW.seo_score
    )
    ON CONFLICT (url, trend_date) DO UPDATE SET
        lcp = EXCLUDED.lcp,
        fid = EXCLUDED.fid,
        cls = EXCLUDED.cls,
        load_time = EXCLUDED.load_time,
        seo_score = EXCLUDED.seo_score;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update performance trends
CREATE TRIGGER update_performance_trends_trigger
    AFTER INSERT ON seo_analysis
    FOR EACH ROW EXECUTE FUNCTION update_performance_trends();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- SEO analysis summary view
CREATE VIEW seo_analysis_summary AS
SELECT 
    sa.url,
    sa.domain,
    sa.analysis_timestamp,
    sa.seo_score,
    (sa.core_web_vitals->>'lcp')::decimal as lcp_score,
    (sa.core_web_vitals->>'fid')::decimal as fid_score,
    (sa.core_web_vitals->>'cls')::decimal as cls_score,
    (sa.content_metrics->>'title')::jsonb->>'score'::decimal as title_score,
    (sa.content_metrics->>'description')::jsonb->>'score'::decimal as description_score,
    (sa.technical_seo->>'pageSpeed')::jsonb->>'score'::decimal as page_speed_score,
    (sa.backlink_metrics->>'score')::decimal as backlink_score,
    (sa.schema_metrics->>'score')::decimal as schema_score,
    jsonb_array_length(sa.recommendations) as recommendation_count
FROM seo_analysis sa
ORDER BY sa.analysis_timestamp DESC;

-- Domain SEO leaderboard view
CREATE VIEW domain_seo_leaderboard AS
SELECT 
    dsm.domain,
    dsm.avg_seo_score,
    dsm.total_pages_analyzed,
    dsm.last_analysis,
    dsm.performance_trend,
    dsm.content_trend,
    dsm.technical_trend,
    RANK() OVER (ORDER BY dsm.avg_seo_score DESC) as rank_by_score,
    RANK() OVER (ORDER BY dsm.total_pages_analyzed DESC) as rank_by_pages
FROM domain_seo_metrics dsm
WHERE dsm.total_pages_analyzed > 0
ORDER BY dsm.avg_seo_score DESC;

-- SEO recommendations summary view
CREATE VIEW seo_recommendations_summary AS
SELECT 
    sr.domain,
    sr.category,
    sr.priority,
    COUNT(*) as recommendation_count,
    AVG(sr.predicted_improvement) as avg_predicted_improvement,
    COUNT(*) FILTER (WHERE sr.implementation_status = 'implemented') as implemented_count,
    COUNT(*) FILTER (WHERE sr.implementation_status = 'pending') as pending_count
FROM seo_recommendations sr
GROUP BY sr.domain, sr.category, sr.priority
ORDER BY sr.domain, sr.category, sr.priority;

-- API usage summary view
CREATE VIEW api_usage_summary AS
SELECT 
    ak.owner_email,
    ak.requests_used,
    ak.requests_limit,
    ak.last_used_at,
    COUNT(aul.id) as total_requests,
    AVG(aul.response_time_ms) as avg_response_time,
    COUNT(*) FILTER (WHERE aul.status_code >= 200 AND aul.status_code < 300) as successful_requests,
    COUNT(*) FILTER (WHERE aul.status_code >= 400) as error_requests
FROM api_keys ak
LEFT JOIN api_usage_logs aul ON ak.id = aul.api_key_id
WHERE ak.is_active = true
GROUP BY ak.id, ak.owner_email, ak.requests_used, ak.requests_limit, ak.last_used_at
ORDER BY ak.requests_used DESC;

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample API keys
INSERT INTO api_keys (key_hash, owner_email, requests_limit) VALUES
('a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6', 'admin@example.com', 10000),
('b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7', 'user@example.com', 1000);

-- Insert sample SEO benchmarks
INSERT INTO seo_benchmarks (industry, metric_name, benchmark_value, percentile, sample_size) VALUES
('ecommerce', 'avg_seo_score', 75.5, 50, 1000),
('ecommerce', 'avg_lcp', 2500, 50, 1000),
('ecommerce', 'avg_fid', 100, 50, 1000),
('ecommerce', 'avg_cls', 0.1, 50, 1000),
('blog', 'avg_seo_score', 70.2, 50, 800),
('blog', 'avg_lcp', 3000, 50, 800),
('blog', 'avg_fid', 120, 50, 800),
('blog', 'avg_cls', 0.15, 50, 800),
('corporate', 'avg_seo_score', 78.8, 50, 600),
('corporate', 'avg_lcp', 2200, 50, 600),
('corporate', 'avg_fid', 90, 50, 600),
('corporate', 'avg_cls', 0.08, 50, 600);

-- Insert sample AI model version
INSERT INTO ai_model_versions (version, model_path, training_samples, validation_accuracy, training_loss, validation_loss, feature_count, is_active) VALUES
('1.0.0', '/models/seo-model-v1', 10000, 0.85, 0.12, 0.15, 16, true);

-- =====================================================
-- CLEANUP FUNCTIONS
-- =====================================================

-- Function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_seo_data(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Clean up old SEO analysis data
    DELETE FROM seo_analysis 
    WHERE analysis_timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Clean up old API usage logs
    DELETE FROM api_usage_logs 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    -- Clean up old trends data
    DELETE FROM seo_trends 
    WHERE trend_date < CURRENT_DATE - INTERVAL '1 day' * days_to_keep;
    
    DELETE FROM performance_trends 
    WHERE trend_date < CURRENT_DATE - INTERVAL '1 day' * days_to_keep;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get SEO statistics
CREATE OR REPLACE FUNCTION get_seo_statistics()
RETURNS TABLE (
    total_analyses BIGINT,
    total_domains BIGINT,
    avg_seo_score DECIMAL(5, 2),
    total_recommendations BIGINT,
    active_api_keys BIGINT,
    model_versions BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM seo_analysis) as total_analyses,
        (SELECT COUNT(DISTINCT domain) FROM seo_analysis) as total_domains,
        (SELECT AVG(seo_score) FROM seo_analysis) as avg_seo_score,
        (SELECT COUNT(*) FROM seo_recommendations) as total_recommendations,
        (SELECT COUNT(*) FROM api_keys WHERE is_active = true) as active_api_keys,
        (SELECT COUNT(*) FROM ai_model_versions WHERE is_active = true) as model_versions;
END;
$$ LANGUAGE plpgsql;