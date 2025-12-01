#!/usr/bin/env node
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'lightdom_dev',
  user: process.env.DB_USER || 'lightdom_user',
  password: process.env.DB_PASSWORD || 'lightdom_password',
});

async function run() {
  try {
    console.log('Bootstrapping minimal dev tables...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS seo_attributes_config (
        id SERIAL PRIMARY KEY,
        attribute_name TEXT UNIQUE NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        priority INTEGER DEFAULT 0,
        scoring_rules JSONB DEFAULT '{}',
        default_value JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS seo_analytics (
        id SERIAL PRIMARY KEY,
        client_id TEXT,
        url TEXT NOT NULL,
        page_title TEXT,
        meta_description TEXT,
        core_web_vitals JSONB,
        seo_score NUMERIC,
        performance_score NUMERIC,
        technical_score NUMERIC,
        content_score NUMERIC,
        ux_score NUMERIC,
        user_behavior JSONB,
        optimization_applied JSONB,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS seo_training_data (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        domain TEXT,
        page_title TEXT,
        meta_description TEXT,
        seo_score NUMERIC,
        performance_score NUMERIC,
        technical_score NUMERIC,
        content_score NUMERIC,
        headings JSONB,
        keywords TEXT,
        word_count INTEGER,
        paragraph_count INTEGER,
        social_media JSONB,
        structured_data JSONB,
        dom_info JSONB,
        crawled_at TIMESTAMP WITH TIME ZONE,
        features JSONB,
        feature_vector DOUBLE PRECISION[] DEFAULT '{}'::double precision[],
        feature_names TEXT[] DEFAULT '{}'::text[],
        feature_version TEXT,
        schema_types TEXT[] DEFAULT '{}'::text[],
        rich_snippet_targets TEXT[] DEFAULT '{}'::text[],
        seo_score_before NUMERIC,
        seo_score_after NUMERIC,
        optimization_type TEXT,
        optimization_details JSONB,
        effectiveness_score NUMERIC,
        verified BOOLEAN DEFAULT false,
        quality_score NUMERIC,
        blockchain_proof_hash TEXT,
        blockchain_tx_hash TEXT,
        reward_amount NUMERIC,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS seo_mining_results (
        id SERIAL PRIMARY KEY,
        url TEXT UNIQUE NOT NULL,
        attributes JSONB,
        seo_score NUMERIC,
        sampled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // URL Seeding / Crawl tables (minimal set for dev)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS url_seeds (
        id SERIAL PRIMARY KEY,
        instance_id VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        source VARCHAR(100),
        priority INTEGER DEFAULT 5,
        search_algorithm VARCHAR(100),
        attributes JSONB,
        status VARCHAR(50) DEFAULT 'active',
        crawl_count INTEGER DEFAULT 0,
        last_crawled TIMESTAMP,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(instance_id, url)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS seeding_configs (
        id SERIAL PRIMARY KEY,
        instance_id VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        client_id VARCHAR(255),
        campaign_id VARCHAR(255),
        config_data JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'created',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS backlinks (
        id SERIAL PRIMARY KEY,
        instance_id VARCHAR(255),
        client_id VARCHAR(255),
        source_url TEXT NOT NULL,
        target_url TEXT NOT NULL,
        relevance DECIMAL(3,2) DEFAULT 0.5,
        anchor_text TEXT,
        context TEXT,
        discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(instance_id, source_url, target_url)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS crawl_targets (
        id SERIAL PRIMARY KEY,
        url TEXT UNIQUE NOT NULL,
        domain TEXT NOT NULL,
        discovered_at TIMESTAMP DEFAULT NOW(),
        last_crawled TIMESTAMP,
        crawl_depth INTEGER DEFAULT 0,
        priority INTEGER DEFAULT 1,
        robots_allowed BOOLEAN DEFAULT TRUE,
        sitemap_entry BOOLEAN DEFAULT FALSE,
        status TEXT DEFAULT 'pending',
        error_count INTEGER DEFAULT 0,
        metadata JSONB DEFAULT '{}'
      );
    `);

    // ML / structured patterns tables (dev convenience)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS structured_patterns (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        pattern_definition JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS page_pattern_instances (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        pattern_id INTEGER REFERENCES structured_patterns(id),
        features JSONB,
        feature_vector JSONB,
        detected_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS seo_ml_recommendations (
        id SERIAL PRIMARY KEY,
        client_id TEXT,
        url TEXT NOT NULL,
        model_type TEXT,
        model_version TEXT,
        recommendation JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Insert a minimal attribute if table is empty
    const { rows } = await pool.query('SELECT COUNT(*)::int as c FROM seo_attributes_config');
    if (rows && rows[0] && rows[0].c === 0) {
      await pool.query(
        `INSERT INTO seo_attributes_config (attribute_name, description, is_active, priority) VALUES ($1,$2,$3,$4)`,
        ['url_length', 'Length of the URL', true, 100]
      );
      console.log('Inserted sample seo_attributes_config row');
    }

    console.log('Bootstrap complete');
  } catch (err) {
    console.error('Bootstrap failed', err && err.message ? err.message : err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
