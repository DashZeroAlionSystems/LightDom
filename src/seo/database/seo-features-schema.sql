-- ============================================================================
-- Complete SEO Features Database Schema
-- PostgreSQL schema for storing all 194 SEO features
-- Optimized for time-series analysis and ML training
-- ============================================================================

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS seo_features;

-- Main features table with all 194 columns
CREATE TABLE IF NOT EXISTS seo_features.complete_features (
    -- Metadata
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    query TEXT,
    collected_at TIMESTAMP DEFAULT NOW(),
    collection_phase VARCHAR(20) DEFAULT 'mvp', -- mvp, phase1, phase2, phase3
    
    -- ========================================================================
    -- 1. ON-PAGE SEO FEATURES (35 features)
    -- ========================================================================
    
    -- Title Tag Features (6)
    title_text TEXT,                       -- 1
    title_length INTEGER,                  -- 2
    title_word_count INTEGER,              -- 3
    title_optimal_length BOOLEAN,          -- 4
    title_has_keyword BOOLEAN,             -- 5
    title_keyword_position INTEGER,        -- 6

    -- Meta Description Features (5)
    meta_description TEXT,                 -- 7
    meta_desc_length INTEGER,              -- 8
    meta_desc_optimal BOOLEAN,             -- 9
    meta_desc_has_keyword BOOLEAN,         -- 10
    meta_desc_has_cta BOOLEAN,             -- 11

    -- Heading Structure (9)
    h1_count INTEGER,                      -- 12
    h1_text TEXT,                          -- 13
    h1_length INTEGER,                     -- 14
    h1_has_keyword BOOLEAN,                -- 15
    h2_count INTEGER,                      -- 16
    h3_count INTEGER,                      -- 17
    h4_count INTEGER,                      -- 18
    h5_count INTEGER,                      -- 19
    h6_count INTEGER,                      -- 20

    -- URL Features (8)
    url_full TEXT,                         -- 21
    url_length INTEGER,                    -- 22
    url_depth INTEGER,                     -- 23
    url_has_keyword BOOLEAN,               -- 24
    url_has_numbers BOOLEAN,               -- 25
    url_has_special_chars INTEGER,         -- 26
    url_slug_length INTEGER,               -- 27
    url_is_https BOOLEAN,                  -- 28

    -- Keyword Usage (7)
    keyword_density DECIMAL(5,2),          -- 29
    keyword_in_first_100_words BOOLEAN,    -- 30
    keyword_in_url BOOLEAN,                -- 31
    keyword_in_h1 BOOLEAN,                 -- 32
    keyword_in_h2 BOOLEAN,                 -- 33
    keyword_in_meta BOOLEAN,               -- 34
    keyword_exact_match_count INTEGER,     -- 35

    -- ========================================================================
    -- 2. TECHNICAL SEO FEATURES (28 features)
    -- ========================================================================
    
    -- Page Performance (8)
    page_size_kb INTEGER,                  -- 36
    html_size_kb INTEGER,                  -- 37
    image_size_kb INTEGER,                 -- 38
    css_size_kb INTEGER,                   -- 39
    js_size_kb INTEGER,                    -- 40
    total_requests INTEGER,                -- 41
    time_to_first_byte INTEGER,            -- 42
    dom_content_loaded INTEGER,            -- 43

    -- Mobile Optimization (6)
    is_mobile_friendly BOOLEAN,            -- 44
    viewport_configured BOOLEAN,           -- 45
    responsive_images BOOLEAN,             -- 46
    mobile_page_speed_score INTEGER,       -- 47
    mobile_usability_issues INTEGER,       -- 48
    tap_targets_appropriate BOOLEAN,       -- 49

    -- Structured Data (6)
    has_schema_markup BOOLEAN,             -- 50
    schema_types TEXT[],                   -- 51 (Array of schema types)
    schema_count INTEGER,                  -- 52
    has_organization_schema BOOLEAN,       -- 53
    has_article_schema BOOLEAN,            -- 54
    has_breadcrumb_schema BOOLEAN,         -- 55

    -- Indexability (8)
    is_indexable BOOLEAN,                  -- 56
    robots_meta_tag TEXT,                  -- 57
    canonical_url TEXT,                    -- 58
    has_canonical BOOLEAN,                 -- 59
    canonical_is_self BOOLEAN,             -- 60
    has_hreflang BOOLEAN,                  -- 61
    xml_sitemap_listed BOOLEAN,            -- 62
    robots_txt_allowed BOOLEAN,            -- 63

    -- ========================================================================
    -- 3. CORE WEB VITALS FEATURES (18 features)
    -- ========================================================================
    
    -- Largest Contentful Paint (6)
    lcp_ms INTEGER,                        -- 64
    lcp_score DECIMAL(3,2),                -- 65
    lcp_good BOOLEAN,                      -- 66
    lcp_needs_improvement BOOLEAN,         -- 67
    lcp_poor BOOLEAN,                      -- 68
    lcp_element_type VARCHAR(50),          -- 69

    -- Interaction to Next Paint (6)
    inp_ms INTEGER,                        -- 70
    inp_score DECIMAL(3,2),                -- 71
    inp_good BOOLEAN,                      -- 72
    inp_needs_improvement BOOLEAN,         -- 73
    inp_poor BOOLEAN,                      -- 74
    long_tasks_count INTEGER,              -- 75

    -- Cumulative Layout Shift (6)
    cls_score DECIMAL(5,3),                -- 76
    cls_normalized DECIMAL(3,2),           -- 77
    cls_good BOOLEAN,                      -- 78
    cls_needs_improvement BOOLEAN,         -- 79
    cls_poor BOOLEAN,                      -- 80
    cls_elements_count INTEGER,            -- 81

    -- ========================================================================
    -- 4. OFF-PAGE/AUTHORITY FEATURES (32 features)
    -- ========================================================================
    
    -- Backlink Profile (12)
    total_backlinks INTEGER,               -- 82
    referring_domains INTEGER,             -- 83
    dofollow_backlinks INTEGER,            -- 84
    nofollow_backlinks INTEGER,            -- 85
    dofollow_ratio DECIMAL(3,2),           -- 86
    avg_domain_rating DECIMAL(5,2),        -- 87
    avg_url_rating DECIMAL(5,2),           -- 88
    backlink_velocity_30d INTEGER,         -- 89
    lost_backlinks_30d INTEGER,            -- 90
    broken_backlinks INTEGER,              -- 91
    redirect_backlinks INTEGER,            -- 92
    edu_backlinks INTEGER,                 -- 93

    -- Anchor Text Distribution (8)
    exact_match_anchors INTEGER,           -- 94
    partial_match_anchors INTEGER,         -- 95
    branded_anchors INTEGER,               -- 96
    generic_anchors INTEGER,               -- 97
    naked_url_anchors INTEGER,             -- 98
    image_anchors INTEGER,                 -- 99
    anchor_text_diversity DECIMAL(5,3),    -- 100
    exact_match_ratio DECIMAL(3,2),        -- 101

    -- Domain Authority (7)
    domain_authority INTEGER,              -- 102
    page_authority INTEGER,                -- 103
    domain_rating INTEGER,                 -- 104
    url_rating INTEGER,                    -- 105
    trust_flow INTEGER,                    -- 106
    citation_flow INTEGER,                 -- 107
    spam_score INTEGER,                    -- 108

    -- Social Signals (5)
    facebook_shares INTEGER,               -- 109
    twitter_shares INTEGER,                -- 110
    linkedin_shares INTEGER,               -- 111
    pinterest_pins INTEGER,                -- 112
    reddit_mentions INTEGER,               -- 113

    -- ========================================================================
    -- 5. USER ENGAGEMENT FEATURES (24 features)
    -- ========================================================================
    
    -- Search Console Metrics (8)
    clicks INTEGER,                        -- 114
    impressions INTEGER,                   -- 115
    ctr DECIMAL(5,4),                      -- 116
    average_position DECIMAL(5,2),         -- 117
    clicks_7d INTEGER,                     -- 118
    clicks_30d INTEGER,                    -- 119
    impressions_7d INTEGER,                -- 120
    impressions_30d INTEGER,               -- 121

    -- Google Analytics Metrics (10)
    pageviews INTEGER,                     -- 122
    unique_pageviews INTEGER,              -- 123
    avg_time_on_page DECIMAL(10,2),        -- 124
    bounce_rate DECIMAL(5,2),              -- 125
    exit_rate DECIMAL(5,2),                -- 126
    pages_per_session DECIMAL(5,2),        -- 127
    engagement_rate DECIMAL(5,2),          -- 128
    scroll_depth_avg DECIMAL(5,2),         -- 129
    conversion_rate DECIMAL(5,4),          -- 130
    revenue_per_pageview DECIMAL(10,2),    -- 131

    -- CTR Performance (6)
    expected_ctr DECIMAL(5,4),             -- 132
    ctr_vs_expected DECIMAL(5,2),          -- 133
    ctr_performance_category VARCHAR(20),  -- 134
    position_1_3_impressions INTEGER,      -- 135
    position_4_10_impressions INTEGER,     -- 136
    featured_snippet_impressions INTEGER,  -- 137

    -- ========================================================================
    -- 6. CONTENT QUALITY FEATURES (22 features)
    -- ========================================================================
    
    -- Content Length & Structure (8)
    word_count INTEGER,                    -- 138
    paragraph_count INTEGER,               -- 139
    sentence_count INTEGER,                -- 140
    avg_sentence_length DECIMAL(5,2),      -- 141
    avg_paragraph_length DECIMAL(5,2),     -- 142
    reading_time_minutes DECIMAL(5,2),     -- 143
    flesch_reading_ease DECIMAL(5,2),      -- 144
    flesch_kincaid_grade DECIMAL(5,2),     -- 145

    -- Media Elements (6)
    image_count INTEGER,                   -- 146
    images_with_alt INTEGER,               -- 147
    images_without_alt INTEGER,            -- 148
    video_count INTEGER,                   -- 149
    infographic_count INTEGER,             -- 150
    image_alt_optimization_rate DECIMAL(3,2), -- 151

    -- Content Freshness (4)
    published_date DATE,                   -- 152
    last_modified_date DATE,               -- 153
    content_age_days INTEGER,              -- 154
    days_since_update INTEGER,             -- 155

    -- Semantic Content (4)
    lsi_keyword_count INTEGER,             -- 156
    entity_count INTEGER,                  -- 157
    entity_density DECIMAL(5,2),           -- 158
    content_depth_score DECIMAL(3,2),      -- 159

    -- ========================================================================
    -- 7. TEMPORAL/TREND FEATURES (15 features)
    -- ========================================================================
    
    -- Rolling Averages (6)
    clicks_7d_avg DECIMAL(10,2),           -- 160
    clicks_30d_avg DECIMAL(10,2),          -- 161
    position_7d_avg DECIMAL(5,2),          -- 162
    position_30d_avg DECIMAL(5,2),         -- 163
    ctr_7d_avg DECIMAL(5,4),               -- 164
    ctr_30d_avg DECIMAL(5,4),              -- 165

    -- Trends & Momentum (6)
    clicks_trend_7d DECIMAL(6,2),          -- 166
    position_trend_7d DECIMAL(6,2),        -- 167
    clicks_trend_30d DECIMAL(6,2),         -- 168
    position_trend_30d DECIMAL(6,2),       -- 169
    traffic_momentum DECIMAL(6,2),         -- 170
    ranking_momentum DECIMAL(6,2),         -- 171

    -- Seasonality (3)
    day_of_week INTEGER,                   -- 172
    month INTEGER,                         -- 173
    is_weekend BOOLEAN,                    -- 174

    -- ========================================================================
    -- 8. INTERACTION FEATURES (12 features)
    -- ========================================================================
    
    -- Quality × Authority
    content_quality_authority_interaction DECIMAL(10,3), -- 175
    technical_authority_interaction DECIMAL(10,3),       -- 176

    -- Engagement × Position
    engagement_position_interaction DECIMAL(10,3),       -- 177
    time_position_interaction DECIMAL(10,3),             -- 178

    -- Technical × Content
    technical_content_interaction DECIMAL(10,3),         -- 179
    speed_content_interaction DECIMAL(10,3),             -- 180

    -- Mobile × Speed
    mobile_speed_interaction DECIMAL(10,3),              -- 181
    mobile_usability_interaction DECIMAL(10,3),          -- 182

    -- Backlinks × Content
    backlinks_quality_interaction DECIMAL(10,3),         -- 183
    authority_freshness_interaction DECIMAL(10,3),       -- 184

    -- CTR × Quality
    ctr_quality_interaction DECIMAL(10,3),               -- 185
    engagement_quality_interaction DECIMAL(10,3),        -- 186

    -- ========================================================================
    -- 9. COMPOSITE SCORES (8 features)
    -- ========================================================================
    
    technical_health_score DECIMAL(3,2),   -- 187
    onpage_optimization_score DECIMAL(3,2), -- 188
    content_quality_score DECIMAL(3,2),    -- 189
    authority_score DECIMAL(3,2),          -- 190
    engagement_score DECIMAL(3,2),         -- 191
    cwv_composite_score DECIMAL(3,2),      -- 192
    overall_seo_score DECIMAL(3,2),        -- 193
    ranking_potential_score DECIMAL(3,2),  -- 194

    -- Constraints
    CONSTRAINT url_query_unique UNIQUE (url, query, collected_at)
);

-- Create indexes for performance
CREATE INDEX idx_seo_features_url ON seo_features.complete_features(url);
CREATE INDEX idx_seo_features_query ON seo_features.complete_features(query);
CREATE INDEX idx_seo_features_collected_at ON seo_features.complete_features(collected_at);
CREATE INDEX idx_seo_features_overall_score ON seo_features.complete_features(overall_seo_score);
CREATE INDEX idx_seo_features_position ON seo_features.complete_features(average_position);
CREATE INDEX idx_seo_features_phase ON seo_features.complete_features(collection_phase);

-- Partial indexes for better query performance
CREATE INDEX idx_seo_features_high_score ON seo_features.complete_features(overall_seo_score) 
    WHERE overall_seo_score > 0.7;
CREATE INDEX idx_seo_features_top_10 ON seo_features.complete_features(average_position) 
    WHERE average_position <= 10;

-- ============================================================================
-- MVP Features View (20 features only)
-- ============================================================================

CREATE OR REPLACE VIEW seo_features.mvp_features AS
SELECT 
    id,
    url,
    query,
    collected_at,
    
    -- Web scraping features (8)
    title_length,
    meta_desc_length,
    word_count,
    h1_count,
    h2_count,
    image_count,
    has_schema_markup AS has_schema,
    url_depth,
    
    -- PageSpeed features (3)
    lcp_ms,
    inp_ms,
    cls_score,
    
    -- Search Console features (4)
    clicks,
    impressions,
    ctr,
    average_position AS position,
    
    -- Derived features (5)
    title_optimal_length AS title_optimal,
    cwv_composite_score AS cwv_composite,
    content_quality_score AS content_quality,
    technical_health_score AS technical_health,
    overall_seo_score
FROM seo_features.complete_features;

-- ============================================================================
-- Phase 1 Features View (50 features)
-- ============================================================================

CREATE OR REPLACE VIEW seo_features.phase1_features AS
SELECT 
    id, url, query, collected_at,
    
    -- Essential on-page (15)
    title_text, title_length, title_has_keyword, title_optimal_length,
    meta_description, meta_desc_length, meta_desc_has_keyword,
    h1_count, h1_text, h1_has_keyword,
    h2_count, h3_count,
    word_count, paragraph_count, sentence_count,
    
    -- URL features (5)
    url_length, url_depth, url_has_keyword, url_is_https, url_slug_length,
    
    -- Keyword features (5)
    keyword_density, keyword_in_first_100_words, keyword_in_h1, 
    keyword_exact_match_count, keyword_in_meta,
    
    -- Core Web Vitals (9)
    lcp_ms, lcp_good, lcp_score,
    inp_ms, inp_good, inp_score,
    cls_score, cls_good, cls_normalized,
    
    -- Search Console (8)
    clicks, impressions, ctr, average_position,
    clicks_7d, clicks_30d, impressions_7d, impressions_30d,
    
    -- Basic authority (5)
    domain_authority, page_authority, total_backlinks, 
    referring_domains, dofollow_ratio,
    
    -- Content basics (8)
    image_count, images_with_alt, video_count,
    flesch_reading_ease, content_age_days,
    has_schema_markup, is_mobile_friendly,
    
    -- Composite scores (5)
    technical_health_score, content_quality_score, 
    authority_score, cwv_composite_score, overall_seo_score
FROM seo_features.complete_features;

-- ============================================================================
-- Time Series Table for Tracking Changes
-- ============================================================================

CREATE TABLE IF NOT EXISTS seo_features.feature_time_series (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    query TEXT,
    collected_date DATE NOT NULL,
    
    -- Key metrics to track over time
    average_position DECIMAL(5,2),
    clicks INTEGER,
    impressions INTEGER,
    ctr DECIMAL(5,4),
    
    -- Scores
    overall_seo_score DECIMAL(3,2),
    technical_health_score DECIMAL(3,2),
    content_quality_score DECIMAL(3,2),
    authority_score DECIMAL(3,2),
    
    -- Core Web Vitals
    lcp_ms INTEGER,
    inp_ms INTEGER,
    cls_score DECIMAL(5,3),
    
    -- Changes
    position_change DECIMAL(5,2),
    clicks_change INTEGER,
    score_change DECIMAL(3,2),
    
    CONSTRAINT url_query_date_unique UNIQUE (url, query, collected_date)
);

CREATE INDEX idx_time_series_url_date ON seo_features.feature_time_series(url, collected_date);
CREATE INDEX idx_time_series_position ON seo_features.feature_time_series(average_position);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to calculate expected CTR
CREATE OR REPLACE FUNCTION seo_features.get_expected_ctr(position DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    RETURN CASE 
        WHEN position <= 1 THEN 0.316
        WHEN position <= 2 THEN 0.177
        WHEN position <= 3 THEN 0.112
        WHEN position <= 4 THEN 0.080
        WHEN position <= 5 THEN 0.061
        WHEN position <= 6 THEN 0.047
        WHEN position <= 7 THEN 0.037
        WHEN position <= 8 THEN 0.030
        WHEN position <= 9 THEN 0.025
        WHEN position <= 10 THEN 0.021
        WHEN position <= 15 THEN 0.010
        WHEN position <= 20 THEN 0.005
        ELSE 0.003
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to insert time series data automatically
CREATE OR REPLACE FUNCTION seo_features.update_time_series()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO seo_features.feature_time_series (
        url, query, collected_date,
        average_position, clicks, impressions, ctr,
        overall_seo_score, technical_health_score,
        content_quality_score, authority_score,
        lcp_ms, inp_ms, cls_score
    )
    VALUES (
        NEW.url, NEW.query, DATE(NEW.collected_at),
        NEW.average_position, NEW.clicks, NEW.impressions, NEW.ctr,
        NEW.overall_seo_score, NEW.technical_health_score,
        NEW.content_quality_score, NEW.authority_score,
        NEW.lcp_ms, NEW.inp_ms, NEW.cls_score
    )
    ON CONFLICT (url, query, collected_date) 
    DO UPDATE SET
        average_position = EXCLUDED.average_position,
        clicks = EXCLUDED.clicks,
        impressions = EXCLUDED.impressions,
        ctr = EXCLUDED.ctr,
        overall_seo_score = EXCLUDED.overall_seo_score,
        technical_health_score = EXCLUDED.technical_health_score,
        content_quality_score = EXCLUDED.content_quality_score,
        authority_score = EXCLUDED.authority_score,
        lcp_ms = EXCLUDED.lcp_ms,
        inp_ms = EXCLUDED.inp_ms,
        cls_score = EXCLUDED.cls_score;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic time series updates
CREATE TRIGGER update_seo_time_series
AFTER INSERT ON seo_features.complete_features
FOR EACH ROW
EXECUTE FUNCTION seo_features.update_time_series();

-- ============================================================================
-- Useful Queries
-- ============================================================================

-- Query: Get latest features for all URLs
/*
SELECT DISTINCT ON (url, query) 
    url, query, collected_at, overall_seo_score, average_position
FROM seo_features.complete_features
ORDER BY url, query, collected_at DESC;
*/

-- Query: Track position changes over time
/*
SELECT 
    url,
    collected_date,
    average_position,
    average_position - LAG(average_position) OVER (PARTITION BY url ORDER BY collected_date) AS position_change,
    clicks,
    clicks - LAG(clicks) OVER (PARTITION BY url ORDER BY collected_date) AS clicks_change
FROM seo_features.feature_time_series
WHERE url = 'https://example.com'
ORDER BY collected_date DESC;
*/

-- Query: Find pages with best improvement potential
/*
SELECT 
    url,
    query,
    average_position,
    ctr,
    seo_features.get_expected_ctr(average_position) AS expected_ctr,
    ctr / seo_features.get_expected_ctr(average_position) AS ctr_ratio,
    overall_seo_score,
    ranking_potential_score
FROM seo_features.complete_features
WHERE collected_at >= NOW() - INTERVAL '7 days'
    AND average_position BETWEEN 4 AND 20
    AND ctr < seo_features.get_expected_ctr(average_position) * 0.8
ORDER BY ranking_potential_score DESC
LIMIT 50;
*/