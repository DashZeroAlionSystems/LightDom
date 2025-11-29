-- Bridge Migration: Align seeding service tables with latest schema expectations
-- Created: 2025-11-20

BEGIN;

-- Ensure domain_authority table has modern columns and constraints
ALTER TABLE domain_authority
    ADD COLUMN IF NOT EXISTS id SERIAL,
    ADD COLUMN IF NOT EXISTS authority INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS trust_flow DECIMAL(5,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS citation_flow DECIMAL(5,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'domain_authority' AND column_name = 'authority_score'
    ) THEN
        EXECUTE 'UPDATE domain_authority SET authority = COALESCE(authority, authority_score)';
    END IF;
END;
$$;

UPDATE domain_authority
SET authority = COALESCE(authority, 0),
    trust_flow = COALESCE(trust_flow, 0),
    citation_flow = COALESCE(citation_flow, 0),
    updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'domain_authority' AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE domain_authority ADD CONSTRAINT domain_authority_pkey PRIMARY KEY (id);
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'domain_authority' AND constraint_name = 'domain_authority_domain_key'
    ) THEN
        ALTER TABLE domain_authority ADD CONSTRAINT domain_authority_domain_key UNIQUE (domain);
    END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_domain_authority_domain ON domain_authority(domain);
CREATE INDEX IF NOT EXISTS idx_domain_authority_score ON domain_authority(authority DESC);

COMMIT;
