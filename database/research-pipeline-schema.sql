-- Research Pipeline Database Schema
-- Comprehensive schema for storing research articles, topics, and mining data

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Research articles table
CREATE TABLE IF NOT EXISTS research_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_number INTEGER UNIQUE,
  title TEXT NOT NULL,
  url TEXT,
  arxiv_url TEXT,
  github_url TEXT,
  category VARCHAR(100) NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium', -- high, medium, low
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, extracted, failed
  content TEXT,
  summary TEXT,
  key_innovations JSONB DEFAULT '[]'::jsonb,
  technical_details JSONB DEFAULT '{}'::jsonb,
  lightdom_applications JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  extracted_at TIMESTAMP,
  extraction_attempts INTEGER DEFAULT 0,
  last_error TEXT
);

-- Research topics table
CREATE TABLE IF NOT EXISTS research_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100),
  parent_topic_id UUID REFERENCES research_topics(id),
  article_count INTEGER DEFAULT 0,
  priority_score DECIMAL(5,2) DEFAULT 0,
  lightdom_relevance VARCHAR(20) DEFAULT 'medium', -- high, medium, low
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Article-Topic relationships (many-to-many)
CREATE TABLE IF NOT EXISTS article_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES research_articles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES research_topics(id) ON DELETE CASCADE,
  relevance_score DECIMAL(5,2) DEFAULT 0,
  extracted_keywords JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(article_id, topic_id)
);

-- Research seeds (URLs to crawl for content)
CREATE TABLE IF NOT EXISTS research_seeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  source_type VARCHAR(50), -- arxiv, github, dev.to, papers-with-code, etc.
  status VARCHAR(50) DEFAULT 'pending', -- pending, crawled, failed, skipped
  priority INTEGER DEFAULT 5, -- 1-10 scale
  article_id UUID REFERENCES research_articles(id),
  content TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  crawled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  retry_count INTEGER DEFAULT 0,
  last_error TEXT
);

-- Mining sessions (tracking extraction runs)
CREATE TABLE IF NOT EXISTS mining_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_name VARCHAR(255),
  start_time TIMESTAMP DEFAULT NOW(),
  end_time TIMESTAMP,
  status VARCHAR(50) DEFAULT 'running', -- running, completed, failed, stopped
  articles_processed INTEGER DEFAULT 0,
  articles_extracted INTEGER DEFAULT 0,
  articles_failed INTEGER DEFAULT 0,
  topics_identified INTEGER DEFAULT 0,
  seeds_crawled INTEGER DEFAULT 0,
  config JSONB DEFAULT '{}'::jsonb,
  results JSONB DEFAULT '{}'::jsonb,
  error_log TEXT
);

-- DeepSeek content suggestions
CREATE TABLE IF NOT EXISTS deepseek_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES research_topics(id),
  article_id UUID REFERENCES research_articles(id),
  suggestion_type VARCHAR(50), -- new-article, related-topic, integration-idea, use-case
  title TEXT NOT NULL,
  description TEXT,
  reasoning TEXT,
  confidence_score DECIMAL(5,2),
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'new', -- new, reviewed, accepted, rejected, implemented
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by VARCHAR(255)
);

-- Content updates queue (new content for DeepSeek to read)
CREATE TABLE IF NOT EXISTS content_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(50), -- article, topic, code-example, use-case
  content_id UUID,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT,
  priority INTEGER DEFAULT 5,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent-to-deepseek, processed, failed
  sent_at TIMESTAMP,
  processed_at TIMESTAMP,
  deepseek_response JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crawling queue
CREATE TABLE IF NOT EXISTS crawl_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  seed_id UUID REFERENCES research_seeds(id),
  priority INTEGER DEFAULT 5,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  crawl_depth INTEGER DEFAULT 0,
  parent_url TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  scheduled_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT,
  UNIQUE(url, seed_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_articles_category ON research_articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_status ON research_articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_priority ON research_articles(priority);
CREATE INDEX IF NOT EXISTS idx_articles_number ON research_articles(article_number);

CREATE INDEX IF NOT EXISTS idx_topics_name ON research_topics(name);
CREATE INDEX IF NOT EXISTS idx_topics_category ON research_topics(category);
CREATE INDEX IF NOT EXISTS idx_topics_relevance ON research_topics(lightdom_relevance);

CREATE INDEX IF NOT EXISTS idx_article_topics_article ON article_topics(article_id);
CREATE INDEX IF NOT EXISTS idx_article_topics_topic ON article_topics(topic_id);

CREATE INDEX IF NOT EXISTS idx_seeds_status ON research_seeds(status);
CREATE INDEX IF NOT EXISTS idx_seeds_priority ON research_seeds(priority);

CREATE INDEX IF NOT EXISTS idx_suggestions_status ON deepseek_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_topic ON deepseek_suggestions(topic_id);

CREATE INDEX IF NOT EXISTS idx_queue_status ON content_queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_priority ON content_queue(priority);

CREATE INDEX IF NOT EXISTS idx_crawl_queue_status ON crawl_queue(status);
CREATE INDEX IF NOT EXISTS idx_crawl_queue_priority ON crawl_queue(priority);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for articles needing extraction
CREATE OR REPLACE VIEW articles_to_extract AS
SELECT 
  a.*,
  s.url as seed_url,
  s.source_type
FROM research_articles a
LEFT JOIN research_seeds s ON s.article_id = a.id
WHERE a.status IN ('pending', 'failed')
  AND a.extraction_attempts < 3
ORDER BY a.priority DESC, a.article_number ASC;

-- View for high-priority topics
CREATE OR REPLACE VIEW high_priority_topics AS
SELECT 
  t.*,
  COUNT(DISTINCT at.article_id) as article_count,
  AVG(a.extraction_attempts) as avg_extraction_attempts
FROM research_topics t
LEFT JOIN article_topics at ON at.topic_id = t.id
LEFT JOIN research_articles a ON a.id = at.article_id
WHERE t.lightdom_relevance = 'high'
GROUP BY t.id
ORDER BY t.priority_score DESC;

-- View for mining session summary
CREATE OR REPLACE VIEW mining_session_summary AS
SELECT 
  id,
  session_name,
  start_time,
  end_time,
  status,
  articles_processed,
  articles_extracted,
  articles_failed,
  topics_identified,
  seeds_crawled,
  EXTRACT(EPOCH FROM (COALESCE(end_time, NOW()) - start_time)) as duration_seconds,
  CASE 
    WHEN articles_processed > 0 
    THEN ROUND((articles_extracted::DECIMAL / articles_processed * 100), 2)
    ELSE 0 
  END as success_rate
FROM mining_sessions
ORDER BY start_time DESC;

-- View for DeepSeek content suggestions pending review
CREATE OR REPLACE VIEW pending_suggestions AS
SELECT 
  ds.*,
  t.name as topic_name,
  t.category as topic_category,
  a.title as article_title
FROM deepseek_suggestions ds
LEFT JOIN research_topics t ON t.id = ds.topic_id
LEFT JOIN research_articles a ON a.id = ds.article_id
WHERE ds.status = 'new'
ORDER BY ds.confidence_score DESC, ds.created_at DESC;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update article status
CREATE OR REPLACE FUNCTION update_article_status(
  p_article_id UUID,
  p_status VARCHAR,
  p_content TEXT DEFAULT NULL,
  p_summary TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE research_articles 
  SET 
    status = p_status,
    content = COALESCE(p_content, content),
    summary = COALESCE(p_summary, summary),
    updated_at = NOW(),
    extracted_at = CASE WHEN p_status = 'extracted' THEN NOW() ELSE extracted_at END,
    extraction_attempts = extraction_attempts + 1
  WHERE id = p_article_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add article to topic
CREATE OR REPLACE FUNCTION link_article_to_topic(
  p_article_id UUID,
  p_topic_name VARCHAR,
  p_relevance_score DECIMAL DEFAULT 0
) RETURNS UUID AS $$
DECLARE
  v_topic_id UUID;
  v_link_id UUID;
BEGIN
  -- Get or create topic
  INSERT INTO research_topics (name, description)
  VALUES (p_topic_name, p_topic_name)
  ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
  RETURNING id INTO v_topic_id;
  
  -- Link article to topic
  INSERT INTO article_topics (article_id, topic_id, relevance_score)
  VALUES (p_article_id, v_topic_id, p_relevance_score)
  ON CONFLICT (article_id, topic_id) 
  DO UPDATE SET relevance_score = p_relevance_score, created_at = NOW()
  RETURNING id INTO v_link_id;
  
  -- Update topic article count
  UPDATE research_topics 
  SET article_count = (SELECT COUNT(*) FROM article_topics WHERE topic_id = v_topic_id)
  WHERE id = v_topic_id;
  
  RETURN v_link_id;
END;
$$ LANGUAGE plpgsql;

-- Function to queue content for DeepSeek
CREATE OR REPLACE FUNCTION queue_content_for_deepseek(
  p_content_type VARCHAR,
  p_content_id UUID,
  p_title TEXT,
  p_content TEXT,
  p_priority INTEGER DEFAULT 5
) RETURNS UUID AS $$
DECLARE
  v_queue_id UUID;
BEGIN
  INSERT INTO content_queue (
    content_type, content_id, title, content, priority
  ) VALUES (
    p_content_type, p_content_id, p_title, p_content, p_priority
  ) RETURNING id INTO v_queue_id;
  
  RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON research_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER topics_updated_at
  BEFORE UPDATE ON research_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default categories
INSERT INTO research_topics (name, category, description, lightdom_relevance, priority_score)
VALUES 
  ('Agent Systems', 'agent-systems', 'Multi-agent coordination and autonomous systems', 'high', 95),
  ('Reasoning Models', 'reasoning', 'Chain-of-thought and logical inference', 'high', 90),
  ('Reinforcement Learning', 'reinforcement-learning', 'RL algorithms and policy optimization', 'high', 85),
  ('OCR & Document Understanding', 'ocr-document', 'Optical character recognition and document parsing', 'high', 95),
  ('Code Generation', 'code-generation', 'Automated coding and analysis', 'high', 88),
  ('RAG Systems', 'rag-retrieval', 'Retrieval-augmented generation', 'high', 92),
  ('Multimodal Models', 'multimodal', 'Vision-language models', 'high', 87),
  ('Memory & Context', 'memory-context', 'Long-context handling', 'high', 83)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE research_articles IS 'Stores all research articles from the 352-article series and beyond';
COMMENT ON TABLE research_topics IS 'Hierarchical topic taxonomy for organizing research';
COMMENT ON TABLE article_topics IS 'Many-to-many relationship between articles and topics';
COMMENT ON TABLE research_seeds IS 'URLs and sources to crawl for article content';
COMMENT ON TABLE mining_sessions IS 'Tracks research extraction sessions with metrics';
COMMENT ON TABLE deepseek_suggestions IS 'AI-generated suggestions for new research areas';
COMMENT ON TABLE content_queue IS 'Queue of content to send to DeepSeek for analysis';
COMMENT ON TABLE crawl_queue IS 'Queue of URLs to crawl for research content';

-- ============================================================================
-- GRANTS (adjust user as needed)
-- ============================================================================

-- Grant permissions (uncomment and adjust for your user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_user;
