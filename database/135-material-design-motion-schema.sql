-- Material Design 3 Motion and Animation System Schema
-- Implements Material Design motion guidelines with schema templates
-- Includes easing curves, durations, transitions, and animation patterns

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Animation easing functions from Material Design 3
CREATE TYPE animation_easing AS ENUM (
  'emphasized',           -- cubic-bezier(0.2, 0.0, 0, 1.0) - Default for most animations
  'emphasized_decelerate', -- cubic-bezier(0.05, 0.7, 0.1, 1.0) - Incoming elements
  'emphasized_accelerate', -- cubic-bezier(0.3, 0.0, 0.8, 0.15) - Outgoing elements
  'standard',             -- cubic-bezier(0.2, 0.0, 0, 1.0) - Standard motion
  'standard_decelerate',  -- cubic-bezier(0.0, 0.0, 0, 1.0) - Deceleration
  'standard_accelerate',  -- cubic-bezier(0.3, 0.0, 1, 1.0) - Acceleration
  'linear',               -- linear - Constant velocity
  'ease_in',              -- ease-in
  'ease_out',             -- ease-out
  'ease_in_out'           -- ease-in-out
);

-- Duration categories from Material Design 3
CREATE TYPE animation_duration_type AS ENUM (
  'extra_short1',  -- 50ms - Small utility changes
  'extra_short2',  -- 100ms - Simple icon changes
  'short1',        -- 150ms - Small area changes
  'short2',        -- 200ms - Area changes
  'short3',        -- 250ms - Larger area changes
  'medium1',       -- 300ms - Default medium motion
  'medium2',       -- 350ms - Area transitions
  'medium3',       -- 400ms - Large area transitions
  'medium4',       -- 450ms - Complex transitions
  'long1',         -- 500ms - Large, complex motion
  'long2',         -- 600ms - Very large motion
  'long3',         -- 700ms - Full screen transitions
  'long4',         -- 800ms - Complex full screen
  'extra_long1',   -- 900ms - Special cases
  'extra_long2',   -- 1000ms - Special large motion
  'custom'         -- Custom duration
);

-- Motion pattern types
CREATE TYPE motion_pattern_type AS ENUM (
  'container_transform',  -- Container transformations
  'shared_axis',         -- Shared axis transitions
  'fade_through',        -- Fade through transitions
  'fade',                -- Simple fades
  'elevation_change',    -- Elevation changes
  'navigation',          -- Navigation transitions
  'dialog',              -- Dialog animations
  'snackbar',            -- Snackbar/toast animations
  'tooltip',             -- Tooltip animations
  'ripple',              -- Ripple effect
  'reveal',              -- Reveal animations
  'collapse',            -- Collapse/expand
  'slide',               -- Slide transitions
  'zoom',                -- Zoom transitions
  'flip',                -- Flip transitions
  'rotate',              -- Rotate transitions
  'scale',               -- Scale transitions
  'morph',               -- Shape morphing
  'custom'               -- Custom pattern
);

-- Transition directions
CREATE TYPE transition_direction AS ENUM (
  'forward',    -- Forward navigation
  'backward',   -- Backward navigation
  'up',         -- Upward motion
  'down',       -- Downward motion
  'left',       -- Left motion
  'right',      -- Right motion
  'in',         -- Coming in
  'out',        -- Going out
  'none'        -- No specific direction
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Material Design 3 animation templates
CREATE TABLE md3_animation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL, -- 'entrance', 'exit', 'transition', 'emphasis', 'utility'
  pattern_type motion_pattern_type NOT NULL,
  
  -- Animation properties
  duration_type animation_duration_type NOT NULL DEFAULT 'medium1',
  custom_duration INTEGER, -- milliseconds, if duration_type is 'custom'
  easing animation_easing NOT NULL DEFAULT 'emphasized',
  
  -- Keyframes definition (JSONB for flexibility)
  keyframes JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Example: [{"offset": 0, "transform": "translateY(100%)", "opacity": 0}, {"offset": 1, "transform": "translateY(0)", "opacity": 1}]
  
  -- CSS animation properties
  animation_properties JSONB DEFAULT '{}'::jsonb,
  -- Example: {"fill-mode": "both", "iteration-count": 1, "direction": "normal"}
  
  -- Material Design guidelines compliance
  follows_md3_guidelines BOOLEAN DEFAULT true,
  accessibility_safe BOOLEAN DEFAULT true, -- Respects prefers-reduced-motion
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  
  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_official BOOLEAN DEFAULT false, -- Official Material Design pattern
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Motion tokens (design tokens for motion)
CREATE TABLE md3_motion_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_name TEXT NOT NULL UNIQUE,
  token_category TEXT NOT NULL, -- 'duration', 'easing', 'path', 'delay'
  
  -- Token value
  token_value TEXT NOT NULL,
  token_value_ms INTEGER, -- Numeric value in milliseconds if applicable
  
  -- CSS custom property name
  css_variable TEXT NOT NULL UNIQUE, -- e.g., '--md-motion-duration-short1'
  
  -- Material Design specification
  md3_spec_reference TEXT,
  description TEXT,
  
  -- Usage
  usage_examples JSONB DEFAULT '[]'::jsonb,
  related_tokens UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Metadata
  is_official BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transition definitions linking multiple animations
CREATE TABLE md3_transition_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  
  -- Transition type and direction
  pattern_type motion_pattern_type NOT NULL,
  direction transition_direction NOT NULL DEFAULT 'none',
  
  -- Stages of the transition
  stages JSONB NOT NULL DEFAULT '[]'::jsonb,
  /* Example stages:
  [
    {
      "name": "exit",
      "animation_template_id": "uuid",
      "delay": 0,
      "targets": ["current-view"]
    },
    {
      "name": "enter",
      "animation_template_id": "uuid",
      "delay": 100,
      "targets": ["new-view"]
    }
  ]
  */
  
  -- Total duration calculation
  total_duration INTEGER, -- milliseconds
  
  -- Component schemas that use this transition
  component_schemas UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Orchestration
  parallel_stages BOOLEAN DEFAULT false, -- Can stages run in parallel?
  stagger_delay INTEGER, -- milliseconds between staggered elements
  
  -- Material Design compliance
  follows_md3_guidelines BOOLEAN DEFAULT true,
  recommended_use_cases TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  
  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Component animation schemas (links components to animations)
CREATE TABLE md3_component_animation_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID, -- References component_definitions
  component_name TEXT NOT NULL,
  component_type TEXT, -- 'atom', 'molecule', 'organism', etc.
  
  -- Animation configurations
  default_animations JSONB NOT NULL DEFAULT '{}'::jsonb,
  /* Example:
  {
    "hover": "animation_template_id",
    "focus": "animation_template_id",
    "active": "animation_template_id",
    "enter": "transition_id",
    "exit": "transition_id"
  }
  */
  
  -- State-based animations
  state_animations JSONB DEFAULT '{}'::jsonb,
  /* Example:
  {
    "loading": "animation_template_id",
    "error": "animation_template_id",
    "success": "animation_template_id"
  }
  */
  
  -- Micro-interactions
  micro_interactions JSONB DEFAULT '{}'::jsonb,
  /* Example:
  {
    "ripple": {"enabled": true, "template_id": "uuid"},
    "tooltip": {"enabled": true, "template_id": "uuid"}
  }
  */
  
  -- Accessibility
  respects_reduced_motion BOOLEAN DEFAULT true,
  reduced_motion_alternative JSONB DEFAULT '{}'::jsonb,
  
  -- Usage
  is_published BOOLEAN DEFAULT false,
  version TEXT DEFAULT '1.0.0',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Material Design Do's and Don'ts
CREATE TABLE md3_motion_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guideline_category TEXT NOT NULL, -- 'duration', 'easing', 'choreography', 'accessibility'
  
  -- Guideline content
  title TEXT NOT NULL,
  do_description TEXT NOT NULL,
  dont_description TEXT NOT NULL,
  
  -- Visual examples
  do_example_code TEXT,
  dont_example_code TEXT,
  do_animation_template_id UUID REFERENCES md3_animation_templates(id),
  dont_animation_template_id UUID REFERENCES md3_animation_templates(id),
  
  -- Explanation
  explanation TEXT,
  md3_specification_url TEXT,
  
  -- Related guidelines
  related_guidelines UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Importance
  importance_level INTEGER DEFAULT 3, -- 1-5, 5 being most important
  
  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Animation generation history (AI-generated animations)
CREATE TABLE ai_animation_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User input
  prompt TEXT NOT NULL,
  component_context TEXT, -- What component is this for?
  
  -- AI generation
  generated_animation JSONB NOT NULL,
  generation_reasoning TEXT, -- AI's explanation
  model_name TEXT DEFAULT 'deepseek-r1:latest',
  
  -- User feedback
  user_edits JSONB DEFAULT '{}'::jsonb,
  accepted BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  
  -- Saved result
  saved_template_id UUID REFERENCES md3_animation_templates(id),
  
  -- Metadata
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id TEXT
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_animation_templates_category ON md3_animation_templates(category);
CREATE INDEX idx_animation_templates_pattern ON md3_animation_templates(pattern_type);
CREATE INDEX idx_animation_templates_usage ON md3_animation_templates(usage_count DESC);
CREATE INDEX idx_animation_templates_tags ON md3_animation_templates USING GIN(tags);

CREATE INDEX idx_motion_tokens_category ON md3_motion_tokens(token_category);
CREATE INDEX idx_motion_tokens_css_var ON md3_motion_tokens(css_variable);

CREATE INDEX idx_transitions_pattern ON md3_transition_definitions(pattern_type);
CREATE INDEX idx_transitions_direction ON md3_transition_definitions(direction);
CREATE INDEX idx_transitions_usage ON md3_transition_definitions(usage_count DESC);

CREATE INDEX idx_component_animations_comp_name ON md3_component_animation_schemas(component_name);
CREATE INDEX idx_component_animations_comp_id ON md3_component_animation_schemas(component_id);

CREATE INDEX idx_guidelines_category ON md3_motion_guidelines(guideline_category);
CREATE INDEX idx_guidelines_importance ON md3_motion_guidelines(importance_level DESC);

CREATE INDEX idx_ai_animations_prompt ON ai_animation_generations USING GIN(to_tsvector('english', prompt));
CREATE INDEX idx_ai_animations_accepted ON ai_animation_generations(accepted) WHERE accepted = true;

-- ============================================================================
-- SEED DATA - Material Design 3 Official Motion Tokens
-- ============================================================================

INSERT INTO md3_motion_tokens (token_name, token_category, token_value, token_value_ms, css_variable, md3_spec_reference, description) VALUES
-- Durations
('duration.extra-short1', 'duration', '50ms', 50, '--md-motion-duration-extra-short1', 'https://m3.material.io/styles/motion/easing-and-duration/tokens-specs', 'Small utility changes (icon state change)'),
('duration.extra-short2', 'duration', '100ms', 100, '--md-motion-duration-extra-short2', 'https://m3.material.io/styles/motion/easing-and-duration/tokens-specs', 'Simple icon transitions'),
('duration.short1', 'duration', '150ms', 150, '--md-motion-duration-short1', 'https://m3.material.io/styles/motion/easing-and-duration/tokens-specs', 'Small area changes'),
('duration.short2', 'duration', '200ms', 200, '--md-motion-duration-short2', 'https://m3.material.io/styles/motion/easing-and-duration/tokens-specs', 'Area changes'),
('duration.short3', 'duration', '250ms', 250, '--md-motion-duration-short3', 'https://m3.material.io/styles/motion/easing-and-duration/tokens-specs', 'Larger area changes'),
('duration.medium1', 'duration', '300ms', 300, '--md-motion-duration-medium1', 'https://m3.material.io/styles/motion/easing-and-duration/tokens-specs', 'Default medium motion'),
('duration.medium2', 'duration', '350ms', 350, '--md-motion-duration-medium2', 'https://m3.material.io/styles/motion/easing-and-duration/tokens-specs', 'Area transitions'),
('duration.medium3', 'duration', '400ms', 400, '--md-motion-duration-medium3', 'https://m3.material.io/styles/motion/easing-and-duration/tokens-specs', 'Large area transitions'),
('duration.medium4', 'duration', '450ms', 450, '--md-motion-duration-medium4', 'https://m3.material.io/styles/motion/easing-and-duration/tokens-specs', 'Complex transitions'),
('duration.long1', 'duration', '500ms', 500, '--md-motion-duration-long1', 'https://m3.material.io/styles/motion/easing-and-duration/tokens-specs', 'Large, complex motion'),
('duration.long2', 'duration', '600ms', 600, '--md-motion-duration-long2', 'https://m3.material.io/styles/motion/easing-and-duration/tokens-specs', 'Very large motion'),
('duration.long3', 'duration', '700ms', 700, '--md-motion-duration-long3', 'https://m3.material.io/styles/motion/easing-and-duration/tokens-specs', 'Full screen transitions'),
('duration.long4', 'duration', '800ms', 800, '--md-motion-duration-long4', 'https://m3.material.io/styles/motion/easing-and-duration/tokens-specs', 'Complex full screen transitions'),

-- Easing curves
('easing.emphasized', 'easing', 'cubic-bezier(0.2, 0.0, 0, 1.0)', NULL, '--md-motion-easing-emphasized', 'https://m3.material.io/styles/motion/easing-and-duration/tokens-specs', 'Default emphasized motion'),
('easing.emphasized-decelerate', 'easing', 'cubic-bezier(0.05, 0.7, 0.1, 1.0)', NULL, '--md-motion-easing-emphasized-decelerate', 'https://m3.material.io/styles/motion/easing-and-duration/tokens-specs', 'Incoming elements'),
('easing.emphasized-accelerate', 'easing', 'cubic-bezier(0.3, 0.0, 0.8, 0.15)', NULL, '--md-motion-easing-emphasized-accelerate', 'https://m3.material.io/styles/motion/easing-and-duration/tokens-specs', 'Outgoing elements'),
('easing.standard', 'easing', 'cubic-bezier(0.2, 0.0, 0, 1.0)', NULL, '--md-motion-easing-standard', 'https://m3.material.io/styles/motion/easing-and-duration/tokens-specs', 'Standard motion curve'),
('easing.standard-decelerate', 'easing', 'cubic-bezier(0.0, 0.0, 0, 1.0)', NULL, '--md-motion-easing-standard-decelerate', 'https://m3.material.io/styles/motion/easing-and-duration/tokens-specs', 'Deceleration curve'),
('easing.standard-accelerate', 'easing', 'cubic-bezier(0.3, 0.0, 1, 1.0)', NULL, '--md-motion-easing-standard-accelerate', 'https://m3.material.io/styles/motion/easing-and-duration/tokens-specs', 'Acceleration curve'),
('easing.linear', 'easing', 'linear', NULL, '--md-motion-easing-linear', 'https://m3.material.io/styles/motion/easing-and-duration/tokens-specs', 'Constant velocity');

-- ============================================================================
-- SEED DATA - Material Design 3 Official Animation Templates
-- ============================================================================

INSERT INTO md3_animation_templates (name, description, category, pattern_type, duration_type, easing, keyframes, animation_properties, is_official, tags) VALUES
-- Fade animations
('md3-fade-in', 'Standard fade in animation', 'entrance', 'fade', 'short2', 'emphasized_decelerate', 
 '[{"offset": 0, "opacity": 0}, {"offset": 1, "opacity": 1}]'::jsonb,
 '{"fill-mode": "both"}'::jsonb, true, ARRAY['fade', 'entrance']),

('md3-fade-out', 'Standard fade out animation', 'exit', 'fade', 'short1', 'emphasized_accelerate',
 '[{"offset": 0, "opacity": 1}, {"offset": 1, "opacity": 0}]'::jsonb,
 '{"fill-mode": "both"}'::jsonb, true, ARRAY['fade', 'exit']),

-- Container transform
('md3-container-expand', 'Container expansion animation', 'transition', 'container_transform', 'medium2', 'emphasized',
 '[{"offset": 0, "transform": "scale(0.8)", "opacity": 0.8}, {"offset": 1, "transform": "scale(1)", "opacity": 1}]'::jsonb,
 '{"fill-mode": "both"}'::jsonb, true, ARRAY['container', 'expand']),

('md3-container-collapse', 'Container collapse animation', 'transition', 'container_transform', 'medium1', 'emphasized',
 '[{"offset": 0, "transform": "scale(1)", "opacity": 1}, {"offset": 1, "transform": "scale(0.8)", "opacity": 0}]'::jsonb,
 '{"fill-mode": "both"}'::jsonb, true, ARRAY['container', 'collapse']),

-- Shared axis (X-axis)
('md3-shared-axis-x-forward', 'Shared axis X forward transition', 'transition', 'shared_axis', 'medium3', 'emphasized',
 '[{"offset": 0, "transform": "translateX(30px)", "opacity": 0}, {"offset": 1, "transform": "translateX(0)", "opacity": 1}]'::jsonb,
 '{"fill-mode": "both"}'::jsonb, true, ARRAY['shared-axis', 'navigation']),

('md3-shared-axis-x-backward', 'Shared axis X backward transition', 'transition', 'shared_axis', 'medium3', 'emphasized',
 '[{"offset": 0, "transform": "translateX(-30px)", "opacity": 0}, {"offset": 1, "transform": "translateX(0)", "opacity": 1}]'::jsonb,
 '{"fill-mode": "both"}'::jsonb, true, ARRAY['shared-axis', 'navigation']),

-- Shared axis (Y-axis)
('md3-shared-axis-y-forward', 'Shared axis Y forward transition', 'transition', 'shared_axis', 'medium3', 'emphasized',
 '[{"offset": 0, "transform": "translateY(30px)", "opacity": 0}, {"offset": 1, "transform": "translateY(0)", "opacity": 1}]'::jsonb,
 '{"fill-mode": "both"}'::jsonb, true, ARRAY['shared-axis', 'vertical']),

('md3-shared-axis-y-backward', 'Shared axis Y backward transition', 'transition', 'shared_axis', 'medium3', 'emphasized',
 '[{"offset": 0, "transform": "translateY(-30px)", "opacity": 0}, {"offset": 1, "transform": "translateY(0)", "opacity": 1}]'::jsonb,
 '{"fill-mode": "both"}'::jsonb, true, ARRAY['shared-axis', 'vertical']),

-- Fade through
('md3-fade-through', 'Fade through transition', 'transition', 'fade_through', 'medium2', 'emphasized',
 '[{"offset": 0, "opacity": 1}, {"offset": 0.35, "opacity": 0}, {"offset": 0.65, "opacity": 0}, {"offset": 1, "opacity": 1}]'::jsonb,
 '{"fill-mode": "both"}'::jsonb, true, ARRAY['fade-through', 'transition']),

-- Elevation changes
('md3-elevation-rise', 'Elevation rise animation', 'emphasis', 'elevation_change', 'short3', 'emphasized',
 '[{"offset": 0, "box-shadow": "0 1px 3px rgba(0,0,0,0.12)"}, {"offset": 1, "box-shadow": "0 8px 16px rgba(0,0,0,0.15)"}]'::jsonb,
 '{"fill-mode": "both"}'::jsonb, true, ARRAY['elevation', 'emphasis']),

('md3-elevation-lower', 'Elevation lower animation', 'utility', 'elevation_change', 'short2', 'emphasized',
 '[{"offset": 0, "box-shadow": "0 8px 16px rgba(0,0,0,0.15)"}, {"offset": 1, "box-shadow": "0 1px 3px rgba(0,0,0,0.12)"}]'::jsonb,
 '{"fill-mode": "both"}'::jsonb, true, ARRAY['elevation', 'utility']),

-- Slide animations
('md3-slide-in-up', 'Slide in from bottom', 'entrance', 'slide', 'medium2', 'emphasized_decelerate',
 '[{"offset": 0, "transform": "translateY(100%)", "opacity": 0}, {"offset": 1, "transform": "translateY(0)", "opacity": 1}]'::jsonb,
 '{"fill-mode": "both"}'::jsonb, true, ARRAY['slide', 'entrance', 'bottom-sheet']),

('md3-slide-out-down', 'Slide out to bottom', 'exit', 'slide', 'medium1', 'emphasized_accelerate',
 '[{"offset": 0, "transform": "translateY(0)", "opacity": 1}, {"offset": 1, "transform": "translateY(100%)", "opacity": 0}]'::jsonb,
 '{"fill-mode": "both"}'::jsonb, true, ARRAY['slide', 'exit', 'bottom-sheet']),

-- Scale animations
('md3-scale-in', 'Scale in animation', 'entrance', 'scale', 'medium1', 'emphasized_decelerate',
 '[{"offset": 0, "transform": "scale(0)", "opacity": 0}, {"offset": 1, "transform": "scale(1)", "opacity": 1}]'::jsonb,
 '{"fill-mode": "both"}'::jsonb, true, ARRAY['scale', 'entrance', 'dialog']),

('md3-scale-out', 'Scale out animation', 'exit', 'scale', 'short3', 'emphasized_accelerate',
 '[{"offset": 0, "transform": "scale(1)", "opacity": 1}, {"offset": 1, "transform": "scale(0)", "opacity": 0}]'::jsonb,
 '{"fill-mode": "both"}'::jsonb, true, ARRAY['scale', 'exit', 'dialog']);

-- ============================================================================
-- SEED DATA - Material Design 3 Guidelines (Do's and Don'ts)
-- ============================================================================

INSERT INTO md3_motion_guidelines (guideline_category, title, do_description, dont_description, explanation, importance_level, tags) VALUES
('duration', 'Use appropriate durations for element size', 
 'Use shorter durations (100-200ms) for small elements like icons, buttons, and chips',
 'Use long durations (500ms+) for small UI elements - they will feel sluggish',
 'Material Design duration should match the visual weight and size of the element. Smaller elements need snappier animations.',
 5, ARRAY['duration', 'performance']),

('duration', 'Match duration to complexity', 
 'Use longer durations (300-500ms) for complex transitions involving multiple elements or large areas',
 'Rush complex animations with short durations - users won''t understand what happened',
 'Complex choreography needs time to be comprehensible. Simple state changes can be quick.',
 4, ARRAY['duration', 'complexity']),

('easing', 'Use emphasized easing for spatial motion', 
 'Apply emphasized easing (cubic-bezier(0.2, 0.0, 0, 1.0)) for elements moving through space',
 'Use linear easing for spatial animations - they look mechanical',
 'Emphasized easing creates natural, physical motion that users expect from real-world movement.',
 5, ARRAY['easing', 'spatial']),

('easing', 'Use decelerate for incoming elements', 
 'Apply emphasized-decelerate easing for elements entering the screen',
 'Use accelerate easing for incoming elements - they will feel like they''re crashing',
 'Elements entering should slow down as they arrive, like an object landing softly.',
 4, ARRAY['easing', 'entrance']),

('easing', 'Use accelerate for outgoing elements', 
 'Apply emphasized-accelerate easing for elements leaving the screen',
 'Use decelerate easing for exiting elements - they will feel stuck',
 'Elements leaving should speed up as they exit, gaining momentum as they depart.',
 4, ARRAY['easing', 'exit']),

('choreography', 'Stagger related elements', 
 'Stagger animations of list items or cards by 20-50ms for a cascading effect',
 'Animate all items simultaneously - it creates visual chaos',
 'Staggering helps users track individual items and creates rhythm in the interface.',
 4, ARRAY['choreography', 'lists']),

('choreography', 'Maintain spatial relationships', 
 'Keep elements moving along consistent axes (horizontal OR vertical, not both)',
 'Animate elements diagonally or in complex paths without reason',
 'Consistent directional movement helps users understand spatial relationships and navigation.',
 5, ARRAY['choreography', 'spatial']),

('choreography', 'Sequence complex transitions', 
 'For complex transitions, sequence events: fade out → transform → fade in',
 'Try to animate everything at once in complex transitions',
 'Sequencing gives the eye time to track changes and understand the transformation.',
 3, ARRAY['choreography', 'transition']),

('accessibility', 'Respect prefers-reduced-motion', 
 'Provide reduced or instant transitions for users with prefers-reduced-motion',
 'Ignore accessibility preferences - this can cause motion sickness',
 'Some users experience vestibular disorders. Always respect their motion preferences.',
 5, ARRAY['accessibility', 'a11y']),

('accessibility', 'Ensure sufficient contrast during animation', 
 'Maintain WCAG color contrast ratios throughout the entire animation',
 'Allow text to fade to low contrast during animations',
 'Users need to read content at every stage of the animation, not just the end state.',
 4, ARRAY['accessibility', 'contrast']),

('accessibility', 'Provide static alternatives', 
 'Ensure all interactive elements remain accessible without animation',
 'Make functionality dependent on completing animations',
 'Animations enhance experience but shouldn''t be required for functionality.',
 5, ARRAY['accessibility', 'functionality']),

('performance', 'Use transform and opacity', 
 'Animate only transform and opacity properties for 60fps performance',
 'Animate width, height, top, left, or other layout properties',
 'Transform and opacity are GPU-accelerated. Layout properties trigger expensive reflows.',
 5, ARRAY['performance', 'gpu']),

('performance', 'Use will-change sparingly', 
 'Apply will-change only to elements that will definitely animate soon',
 'Add will-change to every element "just in case"',
 'will-change consumes memory. Use it strategically for elements about to animate.',
 3, ARRAY['performance', 'optimization']);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Get animation template with computed duration
CREATE OR REPLACE FUNCTION get_animation_with_duration(template_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  duration_ms INTEGER,
  easing_curve TEXT,
  keyframes JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    COALESCE(t.custom_duration, tok.token_value_ms) as duration_ms,
    easing_tok.token_value as easing_curve,
    t.keyframes
  FROM md3_animation_templates t
  LEFT JOIN md3_motion_tokens tok ON tok.token_name = 'duration.' || REPLACE(t.duration_type::text, '_', '-')
  LEFT JOIN md3_motion_tokens easing_tok ON easing_tok.token_name = 'easing.' || REPLACE(t.easing::text, '_', '-')
  WHERE t.id = template_id;
END;
$$ LANGUAGE plpgsql;

-- Generate CSS for animation template
CREATE OR REPLACE FUNCTION generate_animation_css(template_id UUID)
RETURNS TEXT AS $$
DECLARE
  template RECORD;
  keyframe RECORD;
  css_output TEXT := '';
  animation_name TEXT;
BEGIN
  SELECT * INTO template FROM md3_animation_templates WHERE id = template_id;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  animation_name := REPLACE(template.name, '-', '_');
  css_output := '@keyframes ' || animation_name || ' {' || E'\n';
  
  FOR keyframe IN SELECT * FROM jsonb_array_elements(template.keyframes)
  LOOP
    css_output := css_output || '  ' || 
                  (keyframe.value->>'offset')::numeric * 100 || '% {' || E'\n';
    
    -- Add all properties except offset
    FOR prop IN SELECT * FROM jsonb_each_text(keyframe.value) WHERE key != 'offset'
    LOOP
      css_output := css_output || '    ' || prop.key || ': ' || prop.value || ';' || E'\n';
    END LOOP;
    
    css_output := css_output || '  }' || E'\n';
  END LOOP;
  
  css_output := css_output || '}';
  
  RETURN css_output;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp on modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_animation_templates_updated_at
  BEFORE UPDATE ON md3_animation_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transition_definitions_updated_at
  BEFORE UPDATE ON md3_transition_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_component_animation_schemas_updated_at
  BEFORE UPDATE ON md3_component_animation_schemas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Increment usage count when animation is used
CREATE OR REPLACE FUNCTION increment_animation_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE md3_animation_templates 
  SET usage_count = usage_count + 1
  WHERE id = (NEW.default_animations->>'hover')::UUID
     OR id = (NEW.default_animations->>'focus')::UUID
     OR id = (NEW.default_animations->>'active')::UUID
     OR id = (NEW.default_animations->>'enter')::UUID
     OR id = (NEW.default_animations->>'exit')::UUID;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_animation_usage
  AFTER INSERT ON md3_component_animation_schemas
  FOR EACH ROW
  EXECUTE FUNCTION increment_animation_usage();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Popular animations view
CREATE MATERIALIZED VIEW popular_animations AS
SELECT 
  t.id,
  t.name,
  t.category,
  t.pattern_type,
  t.usage_count,
  t.is_official,
  COUNT(DISTINCT c.id) as component_count
FROM md3_animation_templates t
LEFT JOIN md3_component_animation_schemas c ON 
  t.id::text = ANY(ARRAY[
    c.default_animations->>'hover',
    c.default_animations->>'focus',
    c.default_animations->>'enter',
    c.default_animations->>'exit'
  ])
GROUP BY t.id, t.name, t.category, t.pattern_type, t.usage_count, t.is_official
ORDER BY t.usage_count DESC, component_count DESC;

CREATE INDEX idx_popular_animations_usage ON popular_animations(usage_count DESC);

-- Animation quality metrics (from AI generations)
CREATE MATERIALIZED VIEW animation_quality_metrics AS
SELECT 
  t.id as template_id,
  t.name,
  COUNT(DISTINCT g.id) as generation_count,
  COUNT(DISTINCT g.id) FILTER (WHERE g.accepted = true) as accepted_count,
  AVG(g.rating) FILTER (WHERE g.rating IS NOT NULL) as avg_rating,
  COUNT(DISTINCT g.id) FILTER (WHERE g.accepted = true)::float / 
    NULLIF(COUNT(DISTINCT g.id), 0) as acceptance_rate
FROM md3_animation_templates t
LEFT JOIN ai_animation_generations g ON g.saved_template_id = t.id
GROUP BY t.id, t.name;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE md3_animation_templates IS 'Material Design 3 animation templates with keyframes and properties';
COMMENT ON TABLE md3_motion_tokens IS 'Design tokens for motion (durations, easing curves) from MD3 spec';
COMMENT ON TABLE md3_transition_definitions IS 'Multi-stage transition definitions linking multiple animations';
COMMENT ON TABLE md3_component_animation_schemas IS 'Component-specific animation configurations';
COMMENT ON TABLE md3_motion_guidelines IS 'Material Design 3 do''s and don''ts for motion design';
COMMENT ON TABLE ai_animation_generations IS 'AI-generated animation tracking and learning data';

-- ============================================================================
-- GRANT PERMISSIONS (adjust as needed for your setup)
-- ============================================================================

-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_app_user;
