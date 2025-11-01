-- ============================================================================
-- UX/UI Pattern System Database Schema
-- Material Design 3 compliant pattern library with motion and sound integration
-- Supports AI-generated patterns, schema reuse, and dynamic navigation
-- ============================================================================

-- Drop existing objects if they exist
DROP MATERIALIZED VIEW IF EXISTS pattern_popularity_metrics CASCADE;
DROP MATERIALIZED VIEW IF EXISTS pattern_quality_metrics CASCADE;
DROP TABLE IF EXISTS ai_pattern_generations CASCADE;
DROP TABLE IF EXISTS pattern_templates CASCADE;
DROP TABLE IF EXISTS pattern_sound_links CASCADE;
DROP TABLE IF EXISTS pattern_motion_links CASCADE;
DROP TABLE IF EXISTS sound_design_tokens CASCADE;
DROP TABLE IF EXISTS navigation_sections CASCADE;
DROP TABLE IF EXISTS ui_component_instances CASCADE;
DROP TABLE IF EXISTS ux_pattern_definitions CASCADE;
DROP TYPE IF EXISTS pattern_type CASCADE;
DROP TYPE IF EXISTS component_instance_type CASCADE;
DROP TYPE IF EXISTS navigation_section_type CASCADE;
DROP TYPE IF EXISTS sound_category CASCADE;

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE pattern_type AS ENUM (
    'navigation',
    'feedback',
    'data_entry',
    'content_display',
    'interactive',
    'admin_dashboard',
    'user_dashboard',
    'workflow_management',
    'data_visualization',
    'form',
    'custom'
);

CREATE TYPE component_instance_type AS ENUM (
    'workflow_list',
    'stat_card',
    'chart',
    'table',
    'list',
    'progress',
    'timeline',
    'form',
    'button',
    'input',
    'dialog',
    'menu',
    'navigation',
    'breadcrumb',
    'tab',
    'card',
    'custom'
);

CREATE TYPE navigation_section_type AS ENUM (
    'permanent',
    'temporary',
    'user_specific',
    'role_specific',
    'contextual'
);

CREATE TYPE sound_category AS ENUM (
    'tap',
    'success',
    'error',
    'warning',
    'notification',
    'focus',
    'navigation',
    'selection',
    'deselection',
    'expand',
    'collapse',
    'completion'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- UX Pattern Definitions
-- Stores pre-built and AI-generated UX/UI patterns
CREATE TABLE ux_pattern_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    pattern_type pattern_type NOT NULL,
    description TEXT,
    
    -- Pattern structure
    layout_config JSONB DEFAULT '{}'::jsonb,
    component_schema JSONB DEFAULT '{}'::jsonb, -- Array of components to create
    data_binding_schema JSONB DEFAULT '{}'::jsonb, -- Data source configurations
    
    -- UX considerations
    accessibility_features JSONB DEFAULT '{}'::jsonb,
    responsive_config JSONB DEFAULT '{}'::jsonb,
    interaction_patterns JSONB DEFAULT '{}'::jsonb,
    
    -- Material Design 3 compliance
    md3_compliant BOOLEAN DEFAULT TRUE,
    design_tokens_used TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Metadata
    is_official BOOLEAN DEFAULT FALSE, -- Official MD3 pattern
    is_reusable BOOLEAN DEFAULT TRUE,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    avg_user_rating DECIMAL(3,2) DEFAULT 0.00,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    
    -- Indexes
    CONSTRAINT unique_pattern_name UNIQUE (name)
);

CREATE INDEX idx_ux_patterns_type ON ux_pattern_definitions(pattern_type);
CREATE INDEX idx_ux_patterns_official ON ux_pattern_definitions(is_official);
CREATE INDEX idx_ux_patterns_tags ON ux_pattern_definitions USING GIN(tags);
CREATE INDEX idx_ux_patterns_usage ON ux_pattern_definitions(usage_count DESC);

-- UI Component Instances
-- Tracks actual component usage in patterns with data bindings
CREATE TABLE ui_component_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_id UUID REFERENCES ux_pattern_definitions(id) ON DELETE CASCADE,
    
    -- Component details
    component_type component_instance_type NOT NULL,
    component_name TEXT NOT NULL,
    
    -- Data binding
    data_source JSONB DEFAULT '{}'::jsonb, -- API endpoint, query params, etc.
    data_refresh_interval INTEGER, -- milliseconds, NULL = no auto-refresh
    data_filters JSONB DEFAULT '{}'::jsonb,
    
    -- Configuration
    props JSONB DEFAULT '{}'::jsonb,
    style_overrides JSONB DEFAULT '{}'::jsonb,
    
    -- Layout
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    width INTEGER,
    height INTEGER,
    grid_area TEXT,
    
    -- Behavior
    event_handlers JSONB DEFAULT '{}'::jsonb,
    state_management JSONB DEFAULT '{}'::jsonb,
    
    -- Accessibility
    aria_label TEXT,
    aria_described_by TEXT,
    role TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_component_instances_pattern ON ui_component_instances(pattern_id);
CREATE INDEX idx_component_instances_type ON ui_component_instances(component_type);

-- Navigation Sections
-- Dynamic navigation management including temporary user-specific sections
CREATE TABLE navigation_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Section details
    section_name TEXT NOT NULL,
    section_type navigation_section_type NOT NULL,
    
    -- Display
    label TEXT NOT NULL,
    icon TEXT,
    path TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    
    -- Context
    user_id UUID, -- For user-specific sections
    role TEXT, -- For role-specific sections
    parent_section_id UUID REFERENCES navigation_sections(id),
    
    -- Behavior
    is_active BOOLEAN DEFAULT TRUE,
    is_visible BOOLEAN DEFAULT TRUE,
    badge_count INTEGER DEFAULT 0,
    badge_config JSONB DEFAULT '{}'::jsonb,
    
    -- Temporary sections
    is_temporary BOOLEAN DEFAULT FALSE,
    auto_cleanup BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Associated pattern (if created by pattern)
    pattern_id UUID REFERENCES ux_pattern_definitions(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_navigation_sections_type ON navigation_sections(section_type);
CREATE INDEX idx_navigation_sections_user ON navigation_sections(user_id);
CREATE INDEX idx_navigation_sections_active ON navigation_sections(is_active, is_visible);
CREATE INDEX idx_navigation_sections_temporary ON navigation_sections(is_temporary, expires_at);

-- Sound Design Tokens
-- Material Design 3 audio feedback specifications
CREATE TABLE sound_design_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Sound details
    token_name TEXT NOT NULL UNIQUE,
    category sound_category NOT NULL,
    
    -- Audio properties
    frequency_hz INTEGER, -- Dominant frequency
    duration_ms INTEGER NOT NULL,
    volume_db INTEGER DEFAULT -20, -- Relative volume in decibels
    timbre TEXT, -- Description of sound quality
    
    -- Audio file reference (optional)
    audio_file_url TEXT,
    audio_format TEXT, -- mp3, wav, ogg, etc.
    
    -- Material Design 3 specification
    md3_official BOOLEAN DEFAULT TRUE,
    description TEXT,
    use_cases TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Accessibility
    has_visual_alternative BOOLEAN DEFAULT TRUE,
    is_optional BOOLEAN DEFAULT TRUE, -- Can be disabled by user
    
    -- Usage
    usage_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sound_tokens_category ON sound_design_tokens(category);
CREATE INDEX idx_sound_tokens_official ON sound_design_tokens(md3_official);

-- Pattern Motion Links
-- Links UX patterns to animation templates
CREATE TABLE pattern_motion_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_id UUID REFERENCES ux_pattern_definitions(id) ON DELETE CASCADE,
    animation_id UUID, -- References animation_templates from motion schema
    
    -- Motion context
    trigger_event TEXT NOT NULL, -- hover, focus, enter, exit, etc.
    target_component_type component_instance_type,
    
    -- Configuration
    delay_ms INTEGER DEFAULT 0,
    duration_override_ms INTEGER,
    easing_override TEXT,
    
    -- Choreography (for multiple animations)
    sequence_order INTEGER DEFAULT 0,
    stagger_delay_ms INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pattern_motion_pattern ON pattern_motion_links(pattern_id);
CREATE INDEX idx_pattern_motion_animation ON pattern_motion_links(animation_id);
CREATE INDEX idx_pattern_motion_trigger ON pattern_motion_links(trigger_event);

-- Pattern Sound Links
-- Links UX patterns to sound design tokens
CREATE TABLE pattern_sound_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_id UUID REFERENCES ux_pattern_definitions(id) ON DELETE CASCADE,
    sound_token_id UUID REFERENCES sound_design_tokens(id) ON DELETE CASCADE,
    
    -- Sound context
    trigger_event TEXT NOT NULL, -- click, success, error, etc.
    target_component_type component_instance_type,
    
    -- Configuration
    delay_ms INTEGER DEFAULT 0,
    volume_override_db INTEGER,
    
    -- Choreography with motion
    synchronized_with_animation_id UUID, -- Sync with motion
    sync_at_keyframe DECIMAL(3,2), -- Play at 0.0-1.0 of animation
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pattern_sound_pattern ON pattern_sound_links(pattern_id);
CREATE INDEX idx_pattern_sound_token ON pattern_sound_links(sound_token_id);
CREATE INDEX idx_pattern_sound_trigger ON pattern_sound_links(trigger_event);

-- AI Pattern Generations
-- Track AI-generated patterns for learning and improvement
CREATE TABLE ai_pattern_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Input
    prompt TEXT NOT NULL,
    context JSONB DEFAULT '{}'::jsonb, -- user role, preferences, etc.
    
    -- Generated pattern
    generated_pattern_id UUID REFERENCES ux_pattern_definitions(id),
    generated_schema JSONB NOT NULL,
    ai_reasoning TEXT,
    
    -- User feedback
    user_edits JSONB DEFAULT '{}'::jsonb,
    accepted BOOLEAN DEFAULT FALSE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    
    -- AI model info
    model_name TEXT DEFAULT 'deepseek-r1',
    model_version TEXT,
    generation_time_ms INTEGER,
    
    -- Quality metrics
    schema_validity BOOLEAN DEFAULT TRUE,
    pattern_deployed BOOLEAN DEFAULT FALSE,
    deployment_success BOOLEAN,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_pattern_gens_prompt ON ai_pattern_generations USING GIN(to_tsvector('english', prompt));
CREATE INDEX idx_ai_pattern_gens_accepted ON ai_pattern_generations(accepted);
CREATE INDEX idx_ai_pattern_gens_rating ON ai_pattern_generations(rating);
CREATE INDEX idx_ai_pattern_gens_pattern ON ai_pattern_generations(generated_pattern_id);

-- Pattern Templates
-- Reusable pattern configurations that can be instantiated with parameters
CREATE TABLE pattern_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Template details
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT,
    
    -- Base pattern
    base_pattern_id UUID REFERENCES ux_pattern_definitions(id),
    
    -- Template schema with parameters
    template_schema JSONB NOT NULL, -- Schema with parameter placeholders
    parameter_schema JSONB NOT NULL, -- Defines available parameters
    
    -- Examples
    example_parameters JSONB[] DEFAULT ARRAY[]::JSONB[],
    
    -- Usage
    instantiation_count INTEGER DEFAULT 0,
    avg_deployment_time_ms INTEGER,
    
    -- Metadata
    is_official BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

CREATE INDEX idx_pattern_templates_category ON pattern_templates(category);
CREATE INDEX idx_pattern_templates_tags ON pattern_templates USING GIN(tags);
CREATE INDEX idx_pattern_templates_usage ON pattern_templates(instantiation_count DESC);

-- ============================================================================
-- MATERIALIZED VIEWS
-- ============================================================================

-- Pattern Popularity Metrics
CREATE MATERIALIZED VIEW pattern_popularity_metrics AS
SELECT 
    p.id,
    p.name,
    p.pattern_type,
    p.usage_count,
    p.success_rate,
    p.avg_user_rating,
    COUNT(DISTINCT c.id) AS component_count,
    COUNT(DISTINCT n.id) AS navigation_sections_count,
    COUNT(DISTINCT m.id) AS motion_links_count,
    COUNT(DISTINCT s.id) AS sound_links_count,
    COUNT(DISTINCT g.id) AS ai_generations_count,
    AVG(g.rating) AS avg_ai_generation_rating
FROM ux_pattern_definitions p
LEFT JOIN ui_component_instances c ON p.id = c.pattern_id
LEFT JOIN navigation_sections n ON p.id = n.pattern_id
LEFT JOIN pattern_motion_links m ON p.id = m.pattern_id
LEFT JOIN pattern_sound_links s ON p.id = s.pattern_id
LEFT JOIN ai_pattern_generations g ON p.id = g.generated_pattern_id
GROUP BY p.id, p.name, p.pattern_type, p.usage_count, p.success_rate, p.avg_user_rating;

CREATE UNIQUE INDEX idx_pattern_popularity_id ON pattern_popularity_metrics(id);

-- Pattern Quality Metrics
CREATE MATERIALIZED VIEW pattern_quality_metrics AS
SELECT 
    p.id,
    p.name,
    p.md3_compliant,
    p.success_rate,
    p.avg_user_rating,
    COUNT(DISTINCT CASE WHEN g.accepted = TRUE THEN g.id END) AS accepted_generations,
    COUNT(DISTINCT g.id) AS total_generations,
    CASE 
        WHEN COUNT(DISTINCT g.id) > 0 
        THEN (COUNT(DISTINCT CASE WHEN g.accepted = TRUE THEN g.id END)::DECIMAL / COUNT(DISTINCT g.id)) * 100 
        ELSE 0 
    END AS acceptance_rate,
    AVG(g.generation_time_ms) AS avg_generation_time,
    COUNT(DISTINCT CASE WHEN g.deployment_success = TRUE THEN g.id END) AS successful_deployments
FROM ux_pattern_definitions p
LEFT JOIN ai_pattern_generations g ON p.id = g.generated_pattern_id
GROUP BY p.id, p.name, p.md3_compliant, p.success_rate, p.avg_user_rating;

CREATE UNIQUE INDEX idx_pattern_quality_id ON pattern_quality_metrics(id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to create pattern from AI prompt
CREATE OR REPLACE FUNCTION create_pattern_from_prompt(
    p_prompt TEXT,
    p_context JSONB,
    p_generated_schema JSONB
) RETURNS UUID AS $$
DECLARE
    v_pattern_id UUID;
    v_generation_id UUID;
BEGIN
    -- Create pattern definition
    INSERT INTO ux_pattern_definitions (
        name,
        pattern_type,
        description,
        layout_config,
        component_schema,
        data_binding_schema,
        md3_compliant,
        is_official,
        is_reusable
    ) VALUES (
        (p_generated_schema->>'name')::TEXT,
        (p_generated_schema->>'patternType')::pattern_type,
        (p_generated_schema->>'description')::TEXT,
        (p_generated_schema->'layoutConfig')::JSONB,
        (p_generated_schema->'components')::JSONB,
        (p_generated_schema->'dataBindings')::JSONB,
        TRUE,
        FALSE,
        TRUE
    ) RETURNING id INTO v_pattern_id;
    
    -- Track AI generation
    INSERT INTO ai_pattern_generations (
        prompt,
        context,
        generated_pattern_id,
        generated_schema,
        schema_validity
    ) VALUES (
        p_prompt,
        p_context,
        v_pattern_id,
        p_generated_schema,
        TRUE
    ) RETURNING id INTO v_generation_id;
    
    RETURN v_pattern_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add temporary navigation section
CREATE OR REPLACE FUNCTION add_temp_navigation_section(
    p_pattern_id UUID,
    p_user_id UUID,
    p_label TEXT,
    p_icon TEXT,
    p_path TEXT,
    p_expires_hours INTEGER DEFAULT 24
) RETURNS UUID AS $$
DECLARE
    v_section_id UUID;
BEGIN
    INSERT INTO navigation_sections (
        pattern_id,
        section_name,
        section_type,
        label,
        icon,
        path,
        user_id,
        is_temporary,
        auto_cleanup,
        expires_at,
        is_active,
        is_visible
    ) VALUES (
        p_pattern_id,
        LOWER(REPLACE(p_label, ' ', '_')),
        'user_specific',
        p_label,
        p_icon,
        p_path,
        p_user_id,
        TRUE,
        TRUE,
        NOW() + (p_expires_hours || ' hours')::INTERVAL,
        TRUE,
        TRUE
    ) RETURNING id INTO v_section_id;
    
    RETURN v_section_id;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired temporary sections
CREATE OR REPLACE FUNCTION cleanup_expired_navigation_sections() RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM navigation_sections
        WHERE is_temporary = TRUE
          AND auto_cleanup = TRUE
          AND expires_at < NOW()
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted_count FROM deleted;
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh pattern analytics
CREATE OR REPLACE FUNCTION refresh_pattern_analytics() RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY pattern_popularity_metrics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY pattern_quality_metrics;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PRE-SEEDED DATA
-- ============================================================================

-- Official Material Design 3 Sound Tokens
INSERT INTO sound_design_tokens (token_name, category, frequency_hz, duration_ms, volume_db, timbre, md3_official, description, use_cases) VALUES
('md3-sound-tap', 'tap', 1000, 100, -20, 'Short, crisp click', TRUE, 'Standard tap/click interaction', ARRAY['button_press', 'link_click', 'checkbox_toggle']),
('md3-sound-success', 'success', 800, 200, -18, 'Ascending chime', TRUE, 'Successful action completion', ARRAY['form_submit', 'save_success', 'upload_complete']),
('md3-sound-error', 'error', 500, 250, -15, 'Descending tone', TRUE, 'Error or failed action', ARRAY['form_error', 'validation_fail', 'request_failed']),
('md3-sound-warning', 'warning', 700, 250, -18, 'Steady mid tone', TRUE, 'Warning or caution alert', ARRAY['confirm_delete', 'unsaved_changes', 'quota_warning']),
('md3-sound-notification', 'notification', 1200, 150, -20, 'Bright, attention-getting', TRUE, 'Incoming notification or message', ARRAY['new_message', 'system_alert', 'reminder']),
('md3-sound-focus', 'focus', 900, 50, -25, 'Soft, gentle tone', TRUE, 'Input field focus', ARRAY['focus_input', 'keyboard_navigation', 'screen_reader_cue']),
('md3-sound-navigation', 'navigation', 1100, 100, -22, 'Neutral transition', TRUE, 'Screen or page transition', ARRAY['page_change', 'tab_switch', 'drawer_open']),
('md3-sound-selection', 'selection', 950, 80, -23, 'Quick, positive click', TRUE, 'Item selection', ARRAY['list_select', 'dropdown_choose', 'radio_select']),
('md3-sound-deselection', 'deselection', 850, 80, -25, 'Muted, negative click', TRUE, 'Item deselection or removal', ARRAY['uncheck', 'remove_item', 'clear_selection']),
('md3-sound-expand', 'expand', 900, 120, -22, 'Rising tone', TRUE, 'Panel or section expansion', ARRAY['accordion_open', 'menu_expand', 'details_show']),
('md3-sound-collapse', 'collapse', 800, 120, -22, 'Falling tone', TRUE, 'Panel or section collapse', ARRAY['accordion_close', 'menu_collapse', 'details_hide']),
('md3-sound-completion', 'completion', 1000, 300, -15, 'Celebration chime', TRUE, 'Task or process completion', ARRAY['wizard_finish', 'upload_done', 'process_complete']);

-- Official Material Design 3 UX Patterns
INSERT INTO ux_pattern_definitions (name, pattern_type, description, layout_config, component_schema, md3_compliant, is_official, is_reusable, tags) VALUES
('Top App Bar', 'navigation', 'Material Design 3 top app bar with actions and navigation', 
 '{"position": "top", "height": 64, "elevation": 0}'::jsonb,
 '[{"type": "navigation", "variant": "top_app_bar", "slots": ["leading", "title", "trailing"]}]'::jsonb,
 TRUE, TRUE, TRUE, ARRAY['navigation', 'app_bar', 'header']),

('Navigation Drawer', 'navigation', 'Side navigation drawer with sections and items',
 '{"position": "left", "width": 360, "type": "modal"}'::jsonb,
 '[{"type": "navigation", "variant": "drawer", "sections": ["primary", "secondary"]}]'::jsonb,
 TRUE, TRUE, TRUE, ARRAY['navigation', 'drawer', 'sidebar']),

('Bottom Navigation', 'navigation', 'Bottom navigation bar with 3-5 destinations',
 '{"position": "bottom", "height": 80, "maxItems": 5}'::jsonb,
 '[{"type": "navigation", "variant": "bottom", "showLabels": true}]'::jsonb,
 TRUE, TRUE, TRUE, ARRAY['navigation', 'bottom_nav', 'mobile']),

('Snackbar', 'feedback', 'Temporary message with optional action',
 '{"position": "bottom_center", "duration": 4000, "maxWidth": 344}'::jsonb,
 '[{"type": "feedback", "variant": "snackbar", "action": "optional"}]'::jsonb,
 TRUE, TRUE, TRUE, ARRAY['feedback', 'snackbar', 'toast']),

('Linear Progress', 'feedback', 'Horizontal progress indicator',
 '{"height": 4, "width": "100%", "type": "linear"}'::jsonb,
 '[{"type": "progress", "variant": "linear", "determinate": true}]'::jsonb,
 TRUE, TRUE, TRUE, ARRAY['feedback', 'progress', 'loading']),

('Admin Workflow Dashboard', 'admin_dashboard', 'Live workflow monitoring for administrators',
 '{"type": "grid", "columns": 3, "gap": 16}'::jsonb,
 '[{"type": "workflow_list", "dataSource": {"endpoint": "/api/workflow-processes/instances"}, "refresh": 5000}]'::jsonb,
 TRUE, FALSE, TRUE, ARRAY['admin', 'workflow', 'monitoring', 'dashboard']);

-- Pattern Templates for Reuse
INSERT INTO pattern_templates (name, description, category, template_schema, parameter_schema, is_official, tags, example_parameters) VALUES
('User Workflow Dashboard', 'Dashboard showing live workflow list for specific user', 'admin_dashboard',
 '{
   "patternType": "admin_dashboard",
   "components": [{
     "type": "workflow_list",
     "dataSource": {
       "endpoint": "/api/workflow-processes/instances",
       "filter": {"user": "{{userName}}"},
       "refresh": 5000
     }
   }],
   "navigation": {
     "section": "temp",
     "label": "{{userName}} Workflows",
     "icon": "activity",
     "path": "/dashboard/user-{{userName}}-workflows"
   }
 }'::jsonb,
 '{
   "userName": {"type": "string", "required": true, "description": "Username to filter workflows"},
   "refreshInterval": {"type": "integer", "default": 5000, "description": "Auto-refresh interval in ms"},
   "filter": {"type": "object", "default": {}, "description": "Additional filter criteria"}
 }'::jsonb,
 TRUE, ARRAY['admin', 'workflow', 'user_specific'],
 ARRAY['{"userName": "john", "refreshInterval": 5000}'::jsonb, '{"userName": "alice", "refreshInterval": 3000}'::jsonb]);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ux_patterns_updated_at BEFORE UPDATE ON ux_pattern_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_component_instances_updated_at BEFORE UPDATE ON ui_component_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_navigation_sections_updated_at BEFORE UPDATE ON navigation_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sound_tokens_updated_at BEFORE UPDATE ON sound_design_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pattern_templates_updated_at BEFORE UPDATE ON pattern_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- GRANTS (Adjust based on your role structure)
-- ============================================================================

-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_role;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_role;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_app_role;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE ux_pattern_definitions IS 'Stores UX/UI pattern definitions with Material Design 3 compliance';
COMMENT ON TABLE ui_component_instances IS 'Tracks component instances within patterns with data bindings';
COMMENT ON TABLE navigation_sections IS 'Manages dynamic navigation including temporary user-specific sections';
COMMENT ON TABLE sound_design_tokens IS 'Material Design 3 audio feedback specifications';
COMMENT ON TABLE pattern_motion_links IS 'Links patterns to animation templates';
COMMENT ON TABLE pattern_sound_links IS 'Links patterns to sound design tokens';
COMMENT ON TABLE ai_pattern_generations IS 'Tracks AI-generated patterns for learning';
COMMENT ON TABLE pattern_templates IS 'Reusable pattern configurations with parameters';

COMMENT ON FUNCTION create_pattern_from_prompt IS 'Creates a new pattern from AI-generated schema';
COMMENT ON FUNCTION add_temp_navigation_section IS 'Adds a temporary navigation section for a user';
COMMENT ON FUNCTION cleanup_expired_navigation_sections IS 'Removes expired temporary navigation sections';
COMMENT ON FUNCTION refresh_pattern_analytics IS 'Refreshes materialized views for pattern analytics';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
