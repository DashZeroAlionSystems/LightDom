BEGIN;

ALTER TABLE crawled_sites
  ADD COLUMN IF NOT EXISTS raw_content TEXT,
  ADD COLUMN IF NOT EXISTS content_hash VARCHAR(96),
  ADD COLUMN IF NOT EXISTS devtools_payload JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS resource_summary JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS schema_candidates JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS extraction_status VARCHAR(50) DEFAULT 'raw';

CREATE INDEX IF NOT EXISTS idx_crawled_sites_content_hash ON crawled_sites(content_hash);

COMMIT;
