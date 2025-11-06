-- Component Hierarchy Schema
-- Stores hierarchical component organization using atomic design methodology

-- Component hierarchies table
CREATE TABLE IF NOT EXISTS component_hierarchies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  root_component_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Component nodes table
CREATE TABLE IF NOT EXISTS component_nodes (
  id SERIAL PRIMARY KEY,
  hierarchy_id INTEGER REFERENCES component_hierarchies(id) ON DELETE CASCADE,
  node_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('atom', 'molecule', 'organism', 'template', 'page')) NOT NULL,
  level INTEGER NOT NULL DEFAULT 0,
  parent_id VARCHAR(255),
  description TEXT,
  tags TEXT[], -- Array of tags
  category VARCHAR(100),
  props JSONB, -- Component props as JSON
  dependencies TEXT[], -- Array of dependency IDs
  schema JSONB, -- Component schema
  code TEXT, -- Component code
  story TEXT, -- Storybook story code
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(hierarchy_id, node_id)
);

-- Component node relationships table (for tracking parent-child relationships)
CREATE TABLE IF NOT EXISTS component_node_relationships (
  id SERIAL PRIMARY KEY,
  hierarchy_id INTEGER REFERENCES component_hierarchies(id) ON DELETE CASCADE,
  parent_node_id VARCHAR(255) NOT NULL,
  child_node_id VARCHAR(255) NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(hierarchy_id, parent_node_id, child_node_id)
);

-- Component hierarchy statistics table
CREATE TABLE IF NOT EXISTS component_hierarchy_stats (
  id SERIAL PRIMARY KEY,
  hierarchy_id INTEGER REFERENCES component_hierarchies(id) ON DELETE CASCADE,
  total_nodes INTEGER DEFAULT 0,
  atoms_count INTEGER DEFAULT 0,
  molecules_count INTEGER DEFAULT 0,
  organisms_count INTEGER DEFAULT 0,
  templates_count INTEGER DEFAULT 0,
  pages_count INTEGER DEFAULT 0,
  max_depth INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(hierarchy_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_component_nodes_hierarchy_id ON component_nodes(hierarchy_id);
CREATE INDEX IF NOT EXISTS idx_component_nodes_type ON component_nodes(type);
CREATE INDEX IF NOT EXISTS idx_component_nodes_parent_id ON component_nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_component_nodes_node_id ON component_nodes(node_id);
CREATE INDEX IF NOT EXISTS idx_component_node_relationships_hierarchy ON component_node_relationships(hierarchy_id);
CREATE INDEX IF NOT EXISTS idx_component_node_relationships_parent ON component_node_relationships(parent_node_id);
CREATE INDEX IF NOT EXISTS idx_component_node_relationships_child ON component_node_relationships(child_node_id);
CREATE INDEX IF NOT EXISTS idx_component_nodes_tags ON component_nodes USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_component_nodes_props ON component_nodes USING gin(props);

-- Function to update hierarchy statistics
CREATE OR REPLACE FUNCTION update_hierarchy_stats(h_id INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO component_hierarchy_stats (
    hierarchy_id,
    total_nodes,
    atoms_count,
    molecules_count,
    organisms_count,
    templates_count,
    pages_count
  )
  SELECT
    h_id,
    COUNT(*),
    COUNT(*) FILTER (WHERE type = 'atom'),
    COUNT(*) FILTER (WHERE type = 'molecule'),
    COUNT(*) FILTER (WHERE type = 'organism'),
    COUNT(*) FILTER (WHERE type = 'template'),
    COUNT(*) FILTER (WHERE type = 'page')
  FROM component_nodes
  WHERE hierarchy_id = h_id
  ON CONFLICT (hierarchy_id) DO UPDATE SET
    total_nodes = EXCLUDED.total_nodes,
    atoms_count = EXCLUDED.atoms_count,
    molecules_count = EXCLUDED.molecules_count,
    organisms_count = EXCLUDED.organisms_count,
    templates_count = EXCLUDED.templates_count,
    pages_count = EXCLUDED.pages_count,
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update statistics
CREATE OR REPLACE FUNCTION trigger_update_hierarchy_stats()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_hierarchy_stats(NEW.hierarchy_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_node_insert
AFTER INSERT OR UPDATE OR DELETE ON component_nodes
FOR EACH ROW
EXECUTE FUNCTION trigger_update_hierarchy_stats();

-- Function to get component path (from atom to page)
CREATE OR REPLACE FUNCTION get_component_path(h_id INTEGER, n_id VARCHAR)
RETURNS TABLE (
  node_id VARCHAR,
  name VARCHAR,
  type VARCHAR,
  level INTEGER
) AS $$
WITH RECURSIVE path AS (
  SELECT
    cn.node_id,
    cn.name,
    cn.type,
    cn.level,
    cn.parent_id,
    0 AS depth
  FROM component_nodes cn
  WHERE cn.hierarchy_id = h_id AND cn.node_id = n_id

  UNION ALL

  SELECT
    cn.node_id,
    cn.name,
    cn.type,
    cn.level,
    cn.parent_id,
    p.depth + 1
  FROM component_nodes cn
  INNER JOIN path p ON cn.node_id = p.parent_id
  WHERE cn.hierarchy_id = h_id
)
SELECT
  path.node_id,
  path.name,
  path.type,
  path.level
FROM path
ORDER BY depth DESC;
$$ LANGUAGE SQL;

-- Function to get all child components
CREATE OR REPLACE FUNCTION get_child_components(h_id INTEGER, n_id VARCHAR)
RETURNS TABLE (
  node_id VARCHAR,
  name VARCHAR,
  type VARCHAR,
  level INTEGER,
  depth INTEGER
) AS $$
WITH RECURSIVE children AS (
  SELECT
    cn.node_id,
    cn.name,
    cn.type,
    cn.level,
    0 AS depth
  FROM component_nodes cn
  WHERE cn.hierarchy_id = h_id AND cn.node_id = n_id

  UNION ALL

  SELECT
    cn.node_id,
    cn.name,
    cn.type,
    cn.level,
    c.depth + 1
  FROM component_nodes cn
  INNER JOIN children c ON cn.parent_id = c.node_id
  WHERE cn.hierarchy_id = h_id
)
SELECT
  children.node_id,
  children.name,
  children.type,
  children.level,
  children.depth
FROM children
ORDER BY depth, type;
$$ LANGUAGE SQL;

COMMENT ON TABLE component_hierarchies IS 'Stores component hierarchy definitions';
COMMENT ON TABLE component_nodes IS 'Stores individual component nodes in hierarchies';
COMMENT ON TABLE component_node_relationships IS 'Tracks parent-child relationships between components';
COMMENT ON TABLE component_hierarchy_stats IS 'Cached statistics for component hierarchies';
