-- SEO Training Data Migrations
-- Creates tables for managing SEO training data contributions and model training

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS seo_features;

-- Training Contributions Table
CREATE TABLE IF NOT EXISTS seo_features.training_contributions (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    keyword TEXT NOT NULL,
    contributor_address VARCHAR(42) NOT NULL,
    features_provided JSONB NOT NULL,
    quality_score INTEGER NOT NULL CHECK (quality_score >= 0 AND quality_score <= 100),
    reward_amount VARCHAR(78) DEFAULT '0',
    blockchain_tx_hash VARCHAR(66),
    data_hash VARCHAR(66) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_url_keyword_contributor UNIQUE (url, keyword, contributor_address)
);

-- Model Training Runs Table
CREATE TABLE IF NOT EXISTS seo_features.model_training_runs (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(255) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    dataset_size INTEGER NOT NULL,
    features_used JSONB NOT NULL,
    hyperparameters JSONB NOT NULL,
    training_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    training_end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, training, completed, failed
    accuracy_score DECIMAL(5,4), -- NDCG@10 or similar metric
    model_hash VARCHAR(66), -- IPFS hash or similar
    blockchain_tx_hash VARCHAR(66), -- Transaction that deployed model to blockchain
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_model_version UNIQUE (model_name, model_version)
);

-- Model Predictions Cache Table
CREATE TABLE IF NOT EXISTS seo_features.model_predictions (
    id SERIAL PRIMARY KEY,
    model_id INTEGER REFERENCES seo_features.model_training_runs(id),
    url TEXT NOT NULL,
    keyword TEXT NOT NULL,
    current_position INTEGER,
    predicted_position INTEGER NOT NULL,
    ranking_score DECIMAL(6,4) NOT NULL,
    confidence_score DECIMAL(6,4) NOT NULL,
    feature_importance JSONB,
    recommendations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT unique_prediction UNIQUE (model_id, url, keyword)
);

-- Contributor Statistics Table
CREATE TABLE IF NOT EXISTS seo_features.contributor_statistics (
    contributor_address VARCHAR(42) PRIMARY KEY,
    total_contributions INTEGER DEFAULT 0,
    total_rewards VARCHAR(78) DEFAULT '0',
    avg_quality_score DECIMAL(5,2) DEFAULT 0,
    unique_urls_count INTEGER DEFAULT 0,
    first_contribution_date TIMESTAMP WITH TIME ZONE,
    last_contribution_date TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature Usage Statistics Table
CREATE TABLE IF NOT EXISTS seo_features.feature_usage_stats (
    feature_name VARCHAR(255) PRIMARY KEY,
    usage_count INTEGER DEFAULT 0,
    importance_score DECIMAL(6,4) DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model Performance Metrics Table
CREATE TABLE IF NOT EXISTS seo_features.model_performance_metrics (
    id SERIAL PRIMARY KEY,
    model_id INTEGER REFERENCES seo_features.model_training_runs(id),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,6) NOT NULL,
    test_dataset_size INTEGER,
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_model_metric UNIQUE (model_id, metric_name, measured_at)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_contributions_contributor ON seo_features.training_contributions(contributor_address);
CREATE INDEX IF NOT EXISTS idx_contributions_timestamp ON seo_features.training_contributions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_contributions_quality ON seo_features.training_contributions(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_contributions_url ON seo_features.training_contributions(url);
CREATE INDEX IF NOT EXISTS idx_contributions_keyword ON seo_features.training_contributions(keyword);

CREATE INDEX IF NOT EXISTS idx_training_runs_status ON seo_features.model_training_runs(status);
CREATE INDEX IF NOT EXISTS idx_training_runs_created ON seo_features.model_training_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_training_runs_model_name ON seo_features.model_training_runs(model_name);

CREATE INDEX IF NOT EXISTS idx_predictions_model ON seo_features.model_predictions(model_id);
CREATE INDEX IF NOT EXISTS idx_predictions_url ON seo_features.model_predictions(url);
CREATE INDEX IF NOT EXISTS idx_predictions_created ON seo_features.model_predictions(created_at DESC);

-- Triggers for maintaining statistics
CREATE OR REPLACE FUNCTION seo_features.update_contributor_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO seo_features.contributor_statistics (
        contributor_address,
        total_contributions,
        total_rewards,
        avg_quality_score,
        unique_urls_count,
        first_contribution_date,
        last_contribution_date
    )
    VALUES (
        NEW.contributor_address,
        1,
        NEW.reward_amount,
        NEW.quality_score,
        1,
        NEW.timestamp,
        NEW.timestamp
    )
    ON CONFLICT (contributor_address) DO UPDATE SET
        total_contributions = seo_features.contributor_statistics.total_contributions + 1,
        total_rewards = (CAST(seo_features.contributor_statistics.total_rewards AS NUMERIC) + CAST(NEW.reward_amount AS NUMERIC))::TEXT,
        avg_quality_score = (
            (seo_features.contributor_statistics.avg_quality_score * seo_features.contributor_statistics.total_contributions + NEW.quality_score) /
            (seo_features.contributor_statistics.total_contributions + 1)
        ),
        last_contribution_date = NEW.timestamp,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contributor_stats
    AFTER INSERT ON seo_features.training_contributions
    FOR EACH ROW
    EXECUTE FUNCTION seo_features.update_contributor_stats();

-- Function to get dataset readiness
CREATE OR REPLACE FUNCTION seo_features.get_dataset_readiness()
RETURNS TABLE (
    total_contributions BIGINT,
    unique_contributors BIGINT,
    avg_quality_score DECIMAL,
    is_ready BOOLEAN,
    min_samples_required INTEGER,
    missing_features TEXT[]
) AS $$
DECLARE
    min_samples CONSTANT INTEGER := 1000;
    current_samples BIGINT;
BEGIN
    SELECT COUNT(*) INTO current_samples
    FROM seo_features.training_contributions
    WHERE quality_score >= 70;
    
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_contributions,
        COUNT(DISTINCT contributor_address)::BIGINT as unique_contributors,
        AVG(quality_score)::DECIMAL as avg_quality_score,
        (current_samples >= min_samples)::BOOLEAN as is_ready,
        min_samples as min_samples_required,
        ARRAY[]::TEXT[] as missing_features
    FROM seo_features.training_contributions;
END;
$$ LANGUAGE plpgsql;

-- Function to get top contributors
CREATE OR REPLACE FUNCTION seo_features.get_top_contributors(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    contributor_address VARCHAR,
    total_contributions INTEGER,
    total_rewards VARCHAR,
    avg_quality_score DECIMAL,
    rank INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cs.contributor_address,
        cs.total_contributions,
        cs.total_rewards,
        cs.avg_quality_score,
        ROW_NUMBER() OVER (ORDER BY cs.total_contributions DESC)::INTEGER as rank
    FROM seo_features.contributor_statistics cs
    ORDER BY cs.total_contributions DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- View for training data overview
CREATE OR REPLACE VIEW seo_features.training_data_overview AS
SELECT 
    DATE_TRUNC('day', timestamp) as date,
    COUNT(*) as contributions_count,
    AVG(quality_score) as avg_quality_score,
    COUNT(DISTINCT contributor_address) as unique_contributors,
    SUM(CAST(reward_amount AS NUMERIC)) as total_rewards
FROM seo_features.training_contributions
GROUP BY DATE_TRUNC('day', timestamp)
ORDER BY date DESC;

-- View for model performance summary
CREATE OR REPLACE VIEW seo_features.model_performance_summary AS
SELECT 
    mtr.id,
    mtr.model_name,
    mtr.model_version,
    mtr.status,
    mtr.accuracy_score,
    mtr.dataset_size,
    mtr.training_start_date,
    mtr.training_end_date,
    EXTRACT(EPOCH FROM (mtr.training_end_date - mtr.training_start_date)) / 3600 as training_hours,
    COUNT(mp.id) as total_predictions
FROM seo_features.model_training_runs mtr
LEFT JOIN seo_features.model_predictions mp ON mtr.id = mp.model_id
GROUP BY mtr.id, mtr.model_name, mtr.model_version, mtr.status, 
         mtr.accuracy_score, mtr.dataset_size, mtr.training_start_date, 
         mtr.training_end_date
ORDER BY mtr.created_at DESC;

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON SCHEMA seo_features TO lightdom_app;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA seo_features TO lightdom_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA seo_features TO lightdom_app;

COMMENT ON TABLE seo_features.training_contributions IS 'Stores SEO data contributions for ML model training';
COMMENT ON TABLE seo_features.model_training_runs IS 'Tracks ML model training runs and their configurations';
COMMENT ON TABLE seo_features.model_predictions IS 'Caches model predictions for URLs and keywords';
COMMENT ON TABLE seo_features.contributor_statistics IS 'Aggregated statistics for data contributors';
COMMENT ON TABLE seo_features.feature_usage_stats IS 'Tracks usage and importance of individual SEO features';
COMMENT ON TABLE seo_features.model_performance_metrics IS 'Stores detailed performance metrics for trained models';
