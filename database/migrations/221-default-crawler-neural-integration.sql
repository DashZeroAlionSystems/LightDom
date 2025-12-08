-- Default crawler neural integration upgrade
-- Enhances crawled_sites storage and adds neural analysis persistence

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Extend crawled_sites with neural analysis columns
ALTER TABLE crawled_sites
  ADD COLUMN IF NOT EXISTS dom_paint_metrics JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS render_layers JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS neural_topics JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS neural_recommendations JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS neural_embeddings JSONB DEFAULT '{}'::jsonb;

-- Table storing detailed neural analysis outputs from crawler pipeline
CREATE TABLE IF NOT EXISTS crawler_neural_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crawler_id VARCHAR(255),
  url TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  analyses JSONB NOT NULL,
  predictions JSONB,
  recommendations JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crawler_neural_analysis_url
  ON crawler_neural_analysis(url);
CREATE INDEX IF NOT EXISTS idx_crawler_neural_analysis_timestamp
  ON crawler_neural_analysis(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_crawler_neural_analysis_crawler
  ON crawler_neural_analysis(crawler_id);

-- Link crawlee results to stored neural analysis
ALTER TABLE crawlee_results
  ADD COLUMN IF NOT EXISTS neural_analysis_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'crawlee_results_neural_analysis_id_fkey'
      AND table_name = 'crawlee_results'
  ) THEN
    ALTER TABLE crawlee_results
      ADD CONSTRAINT crawlee_results_neural_analysis_id_fkey
      FOREIGN KEY (neural_analysis_id)
      REFERENCES crawler_neural_analysis(id)
      ON DELETE SET NULL;
  END IF;
END$$;

-- Helpful indexes for new crawled_sites columns
CREATE INDEX IF NOT EXISTS idx_crawled_sites_neural_topics
  ON crawled_sites USING GIN (neural_topics);
CREATE INDEX IF NOT EXISTS idx_crawled_sites_neural_recommendations
  ON crawled_sites USING GIN (neural_recommendations);
