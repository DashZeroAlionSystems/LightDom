-- =====================================================
-- Advanced Workflow Tools & Neural Network Schema Research
-- Phase 8: Complete Prompt-to-Workflow Automation
-- =====================================================
--
-- This schema implements advanced tools for automated workflow
-- creation from prompts using neural network-driven schema linking,
-- template matching, and intelligent composition.
--
-- Research Integration:
-- - Graph Neural Networks for schema relationship modeling
-- - Workflow pattern embeddings for similarity matching
-- - Automated schema composition using attention mechanisms
-- - Dependency resolution via constraint satisfaction networks
--
-- Tools Implemented (12 new):
-- 1. workflow_template_generator
-- 2. schema_linker
-- 3. task_decomposer
-- 4. dependency_resolver
-- 5. automation_orchestrator
-- 6. ux_flow_designer
-- 7. neural_schema_mapper
-- 8. template_matcher
-- 9. workflow_composer
-- 10. parallel_optimizer
-- 11. data_flow_analyzer
-- 12. workflow_validator

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE workflow_template_category AS ENUM (
    'data_processing',
    'web_automation',
    'content_generation',
    'analytics',
    'integration',
    'monitoring',
    'deployment',
    'testing',
    'machine_learning',
    'custom'
);

CREATE TYPE schema_link_type AS ENUM (
    'composition',      -- Component uses another component
    'dependency',       -- Component depends on another
    'data_flow',        -- Data flows from one to another
    'inheritance',      -- Component inherits from another
    'aggregation',      -- Component aggregates others
    'association'       -- Loose association
);

CREATE TYPE task_decomposition_strategy AS ENUM (
    'sequential',       -- Break into sequential steps
    'parallel',         -- Break into parallel tasks
    'hierarchical',     -- Break into hierarchical subtasks
    'pipeline',         -- Break into pipeline stages
    'map_reduce'        -- Break into map-reduce pattern
);

CREATE TYPE validation_severity AS ENUM (
    'error',            -- Must fix before deployment
    'warning',          -- Should fix but not blocking
    'info',             -- Informational only
    'suggestion'        -- Optimization suggestion
);

-- =====================================================
-- WORKFLOW TEMPLATE LIBRARY
-- =====================================================

CREATE TABLE workflow_template_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name TEXT NOT NULL,
    category workflow_template_category NOT NULL,
    description TEXT,
    
    -- Template structure
    template_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
    task_templates JSONB NOT NULL DEFAULT '[]'::jsonb,
    default_parameters JSONB DEFAULT '{}'::jsonb,
    
    -- Neural network embeddings for similarity matching
    embedding_vector REAL[] DEFAULT NULL,
    
    -- Usage and quality metrics
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    average_execution_time_ms BIGINT DEFAULT 0,
    
    -- Metadata
    author TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_official BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_success_rate CHECK (success_rate >= 0 AND success_rate <= 100)
);

CREATE INDEX idx_workflow_template_category ON workflow_template_library(category);
CREATE INDEX idx_workflow_template_tags ON workflow_template_library USING GIN(tags);
CREATE INDEX idx_workflow_template_embedding ON workflow_template_library USING GIN(embedding_vector gin__int_ops) WHERE embedding_vector IS NOT NULL;

-- =====================================================
-- SCHEMA LINKING SYSTEM
-- =====================================================

CREATE TABLE schema_link_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Source and target schemas
    source_schema_id UUID NOT NULL,
    source_schema_type TEXT NOT NULL,  -- component, workflow, pattern, dashboard
    target_schema_id UUID NOT NULL,
    target_schema_type TEXT NOT NULL,
    
    -- Link characteristics
    link_type schema_link_type NOT NULL,
    link_strength DECIMAL(3,2) DEFAULT 1.0,  -- 0.0 to 1.0
    
    -- Data flow information
    data_mapping JSONB DEFAULT '{}'::jsonb,
    transformation_rules JSONB DEFAULT '{}'::jsonb,
    
    -- Neural network confidence
    nn_confidence_score DECIMAL(5,4) DEFAULT 0,
    nn_reasoning TEXT,
    
    -- Validation
    is_validated BOOLEAN DEFAULT FALSE,
    validated_by TEXT,
    validated_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_link_strength CHECK (link_strength >= 0 AND link_strength <= 1),
    CONSTRAINT valid_nn_confidence CHECK (nn_confidence_score >= 0 AND nn_confidence_score <= 1)
);

CREATE INDEX idx_schema_link_source ON schema_link_registry(source_schema_id, source_schema_type);
CREATE INDEX idx_schema_link_target ON schema_link_registry(target_schema_id, target_schema_type);
CREATE INDEX idx_schema_link_type ON schema_link_registry(link_type);

-- =====================================================
-- TASK DECOMPOSITION SYSTEM
-- =====================================================

CREATE TABLE task_decomposition_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Original complex task
    original_task_description TEXT NOT NULL,
    original_task_schema JSONB NOT NULL,
    complexity_score DECIMAL(5,2) DEFAULT 0,
    
    -- Decomposition strategy
    strategy task_decomposition_strategy NOT NULL,
    
    -- Generated subtasks
    subtasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtask_dependencies JSONB DEFAULT '{}'::jsonb,
    
    -- Neural network analysis
    nn_decomposition_reasoning TEXT,
    nn_confidence DECIMAL(5,4) DEFAULT 0,
    
    -- Quality metrics
    decomposition_quality_score DECIMAL(5,2) DEFAULT 0,
    user_feedback_rating INTEGER CHECK (user_feedback_rating >= 1 AND user_feedback_rating <= 5),
    
    -- Execution tracking
    was_executed BOOLEAN DEFAULT FALSE,
    execution_success_rate DECIMAL(5,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_nn_confidence CHECK (nn_confidence >= 0 AND nn_confidence <= 1)
);

CREATE INDEX idx_task_decomposition_strategy ON task_decomposition_history(strategy);
CREATE INDEX idx_task_decomposition_quality ON task_decomposition_history(decomposition_quality_score DESC);

-- =====================================================
-- AUTOMATION ORCHESTRATION
-- =====================================================

CREATE TABLE automation_orchestration_chains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Chain definition
    chain_name TEXT NOT NULL,
    description TEXT,
    trigger_conditions JSONB DEFAULT '{}'::jsonb,
    
    -- Workflow sequence
    workflow_sequence UUID[] NOT NULL,  -- Ordered list of workflow IDs
    conditional_branching JSONB DEFAULT '{}'::jsonb,
    error_handling_strategy JSONB DEFAULT '{}'::jsonb,
    
    -- Data flow between workflows
    inter_workflow_data_mapping JSONB DEFAULT '{}'::jsonb,
    
    -- Execution settings
    is_active BOOLEAN DEFAULT TRUE,
    max_concurrent_executions INTEGER DEFAULT 1,
    timeout_minutes INTEGER DEFAULT 60,
    
    -- Analytics
    total_executions INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    average_execution_time_ms BIGINT DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_automation_chain_active ON automation_orchestration_chains(is_active);

-- =====================================================
-- UX FLOW DESIGN
-- =====================================================

CREATE TABLE ux_flow_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Associated workflow
    workflow_id UUID NOT NULL,
    
    -- UX flow definition
    flow_name TEXT NOT NULL,
    flow_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- UI components for each step
    step_ui_components JSONB NOT NULL DEFAULT '{}'::jsonb,
    navigation_pattern TEXT NOT NULL,  -- wizard, stepper, tabs, accordion
    
    -- Interaction patterns
    user_interactions JSONB DEFAULT '{}'::jsonb,
    validation_rules JSONB DEFAULT '{}'::jsonb,
    error_handling_ui JSONB DEFAULT '{}'::jsonb,
    
    -- Motion and sound
    motion_patterns JSONB DEFAULT '{}'::jsonb,
    sound_feedback JSONB DEFAULT '{}'::jsonb,
    
    -- Accessibility
    accessibility_features JSONB DEFAULT '{}'::jsonb,
    
    -- Neural network design
    nn_generated BOOLEAN DEFAULT FALSE,
    nn_design_reasoning TEXT,
    
    -- User feedback
    usability_score DECIMAL(5,2) DEFAULT 0,
    user_satisfaction_rating DECIMAL(3,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ux_flow_workflow ON ux_flow_designs(workflow_id);

-- =====================================================
-- NEURAL SCHEMA MAPPING
-- =====================================================

CREATE TABLE neural_schema_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Schema reference
    schema_id UUID NOT NULL,
    schema_type TEXT NOT NULL,
    schema_content JSONB NOT NULL,
    
    -- Neural network embeddings (768 dimensions typical for BERT)
    embedding_vector REAL[] NOT NULL,
    embedding_model TEXT NOT NULL,  -- bert-base, gpt-3.5-turbo, etc.
    
    -- Metadata for similarity search
    schema_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
    semantic_category TEXT,
    
    -- Quality metrics
    embedding_quality_score DECIMAL(5,4) DEFAULT 0,
    
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_embedding_quality CHECK (embedding_quality_score >= 0 AND embedding_quality_score <= 1)
);

CREATE INDEX idx_neural_schema_type ON neural_schema_embeddings(schema_type);
CREATE INDEX idx_neural_schema_keywords ON neural_schema_embeddings USING GIN(schema_keywords);

-- =====================================================
-- WORKFLOW VALIDATION SYSTEM
-- =====================================================

CREATE TABLE workflow_validation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Rule definition
    rule_name TEXT NOT NULL UNIQUE,
    rule_category TEXT NOT NULL,
    description TEXT,
    
    -- Validation logic
    validation_function TEXT NOT NULL,  -- SQL function name or JS function
    parameters_schema JSONB DEFAULT '{}'::jsonb,
    
    -- Severity and impact
    severity validation_severity NOT NULL,
    auto_fix_available BOOLEAN DEFAULT FALSE,
    auto_fix_function TEXT,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    execution_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workflow_validation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Validated workflow
    workflow_id UUID NOT NULL,
    workflow_version TEXT,
    
    -- Validation execution
    validation_rule_id UUID REFERENCES workflow_validation_rules(id),
    
    -- Results
    passed BOOLEAN NOT NULL,
    severity validation_severity NOT NULL,
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    
    -- Auto-fix
    auto_fix_applied BOOLEAN DEFAULT FALSE,
    auto_fix_changes JSONB,
    
    validated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_validation_results_workflow ON workflow_validation_results(workflow_id);
CREATE INDEX idx_validation_results_severity ON workflow_validation_results(severity);

-- =====================================================
-- DEPENDENCY RESOLUTION
-- =====================================================

CREATE TABLE dependency_resolution_graph (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Workflow or component being analyzed
    entity_id UUID NOT NULL,
    entity_type TEXT NOT NULL,
    
    -- Dependency graph (adjacency list format)
    dependencies JSONB NOT NULL DEFAULT '{}'::jsonb,
    dependency_levels JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Resolution strategy
    resolution_strategy TEXT NOT NULL,  -- topological_sort, critical_path, etc.
    optimal_execution_order UUID[] NOT NULL,
    
    -- Parallelization opportunities
    parallel_groups JSONB DEFAULT '[]'::jsonb,
    max_parallelism INTEGER DEFAULT 1,
    
    -- Circular dependency detection
    has_circular_dependencies BOOLEAN DEFAULT FALSE,
    circular_dependency_chains JSONB,
    
    -- Neural network optimization
    nn_optimized BOOLEAN DEFAULT FALSE,
    nn_optimization_reasoning TEXT,
    
    resolved_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dependency_graph_entity ON dependency_resolution_graph(entity_id, entity_type);

-- =====================================================
-- ADVANCED TOOL DEFINITIONS (Ollama Integration)
-- =====================================================

INSERT INTO ollama_tool_definitions (tool_name, ml_model_type, description, parameters_schema, returns_schema) VALUES

-- Tool 9: workflow_template_generator
('workflow_template_generator', 'nlp_generator', 
 'Generates complete workflow templates from natural language descriptions',
 '{
   "type": "object",
   "properties": {
     "description": {"type": "string", "description": "Natural language description of the workflow"},
     "category": {"type": "string", "enum": ["data_processing", "web_automation", "content_generation", "analytics", "integration", "monitoring", "deployment", "testing", "machine_learning", "custom"]},
     "requirements": {"type": "array", "items": {"type": "string"}, "description": "Specific requirements or constraints"}
   },
   "required": ["description", "category"]
 }'::jsonb,
 '{
   "type": "object",
   "properties": {
     "template_id": {"type": "string", "format": "uuid"},
     "template_name": {"type": "string"},
     "task_templates": {"type": "array"},
     "default_parameters": {"type": "object"},
     "estimated_complexity": {"type": "number"}
   }
 }'::jsonb),

-- Tool 10: schema_linker
('schema_linker', 'pattern_recommender',
 'Automatically links schemas across components, workflows, and patterns based on semantic similarity and data flow',
 '{
   "type": "object",
   "properties": {
     "source_schemas": {"type": "array", "items": {"type": "object"}},
     "link_strategy": {"type": "string", "enum": ["composition", "dependency", "data_flow", "inheritance", "aggregation", "association"]},
     "auto_resolve_conflicts": {"type": "boolean", "default": true}
   },
   "required": ["source_schemas"]
 }'::jsonb,
 '{
   "type": "object",
   "properties": {
     "schema_links": {"type": "array"},
     "data_mappings": {"type": "object"},
     "confidence_scores": {"type": "object"},
     "suggestions": {"type": "array"}
   }
 }'::jsonb),

-- Tool 11: task_decomposer
('task_decomposer', 'optimization_suggester',
 'Breaks complex tasks into atomic, executable sub-tasks using intelligent decomposition strategies',
 '{
   "type": "object",
   "properties": {
     "task_description": {"type": "string"},
     "complexity_threshold": {"type": "number", "default": 7},
     "strategy": {"type": "string", "enum": ["sequential", "parallel", "hierarchical", "pipeline", "map_reduce"]},
     "max_subtasks": {"type": "integer", "default": 10}
   },
   "required": ["task_description"]
 }'::jsonb,
 '{
   "type": "object",
   "properties": {
     "subtasks": {"type": "array"},
     "dependencies": {"type": "object"},
     "execution_order": {"type": "array"},
     "parallelization_opportunities": {"type": "array"}
   }
 }'::jsonb),

-- Tool 12: dependency_resolver
('dependency_resolver', 'workflow_predictor',
 'Resolves and optimizes dependencies between workflow steps using constraint satisfaction',
 '{
   "type": "object",
   "properties": {
     "workflow_id": {"type": "string", "format": "uuid"},
     "tasks": {"type": "array", "items": {"type": "object"}},
     "optimize_for": {"type": "string", "enum": ["speed", "resource_efficiency", "reliability"], "default": "speed"}
   },
   "required": ["tasks"]
 }'::jsonb,
 '{
   "type": "object",
   "properties": {
     "optimal_execution_order": {"type": "array"},
     "parallel_groups": {"type": "array"},
     "circular_dependencies": {"type": "array"},
     "critical_path": {"type": "array"}
   }
 }'::jsonb),

-- Tool 13: automation_orchestrator
('automation_orchestrator', 'workflow_predictor',
 'Orchestrates multi-workflow automation chains with conditional branching and error handling',
 '{
   "type": "object",
   "properties": {
     "workflows": {"type": "array", "items": {"type": "string", "format": "uuid"}},
     "trigger_conditions": {"type": "object"},
     "branching_logic": {"type": "object"},
     "error_handling": {"type": "string", "enum": ["retry", "skip", "fallback", "abort"], "default": "retry"}
   },
   "required": ["workflows"]
 }'::jsonb,
 '{
   "type": "object",
   "properties": {
     "orchestration_id": {"type": "string", "format": "uuid"},
     "execution_plan": {"type": "array"},
     "estimated_duration_ms": {"type": "integer"},
     "risk_factors": {"type": "array"}
   }
 }'::jsonb),

-- Tool 14: ux_flow_designer
('ux_flow_designer', 'pattern_recommender',
 'Designs optimal UX flows for workflow interaction based on user research and best practices',
 '{
   "type": "object",
   "properties": {
     "workflow_id": {"type": "string", "format": "uuid"},
     "user_role": {"type": "string"},
     "complexity": {"type": "string", "enum": ["simple", "moderate", "complex"]},
     "accessibility_level": {"type": "string", "enum": ["AA", "AAA"], "default": "AA"}
   },
   "required": ["workflow_id"]
 }'::jsonb,
 '{
   "type": "object",
   "properties": {
     "flow_design_id": {"type": "string", "format": "uuid"},
     "navigation_pattern": {"type": "string"},
     "ui_components": {"type": "array"},
     "motion_patterns": {"type": "object"},
     "accessibility_features": {"type": "array"}
   }
 }'::jsonb),

-- Tool 15: neural_schema_mapper
('neural_schema_mapper', 'nlp_generator',
 'Maps neural network patterns to workflow schemas using embedding similarity',
 '{
   "type": "object",
   "properties": {
     "input_schemas": {"type": "array"},
     "target_domain": {"type": "string"},
     "similarity_threshold": {"type": "number", "default": 0.7}
   },
   "required": ["input_schemas"]
 }'::jsonb,
 '{
   "type": "object",
   "properties": {
     "schema_mappings": {"type": "array"},
     "similarity_scores": {"type": "object"},
     "embedding_vectors": {"type": "array"},
     "suggested_transformations": {"type": "array"}
   }
 }'::jsonb),

-- Tool 16: template_matcher
('template_matcher', 'pattern_recommender',
 'Finds and suggests matching workflow templates based on requirements',
 '{
   "type": "object",
   "properties": {
     "requirements": {"type": "string"},
     "category": {"type": "string"},
     "min_similarity": {"type": "number", "default": 0.6},
     "max_results": {"type": "integer", "default": 5}
   },
   "required": ["requirements"]
 }'::jsonb,
 '{
   "type": "object",
   "properties": {
     "matched_templates": {"type": "array"},
     "similarity_scores": {"type": "array"},
     "customization_suggestions": {"type": "array"}
   }
 }'::jsonb),

-- Tool 17: workflow_composer
('workflow_composer', 'nlp_generator',
 'Composes complete workflows from atomic components with intelligent integration',
 '{
   "type": "object",
   "properties": {
     "components": {"type": "array"},
     "composition_strategy": {"type": "string", "enum": ["sequential", "parallel", "hybrid"], "default": "hybrid"},
     "optimization_goals": {"type": "array"}
   },
   "required": ["components"]
 }'::jsonb,
 '{
   "type": "object",
   "properties": {
     "composed_workflow": {"type": "object"},
     "integration_points": {"type": "array"},
     "optimization_metrics": {"type": "object"},
     "warnings": {"type": "array"}
   }
 }'::jsonb),

-- Tool 18: parallel_optimizer
('parallel_optimizer', 'resource_estimator',
 'Optimizes task parallelization for maximum performance within resource constraints',
 '{
   "type": "object",
   "properties": {
     "workflow_id": {"type": "string", "format": "uuid"},
     "max_parallel_tasks": {"type": "integer", "default": 10},
     "resource_constraints": {"type": "object"}
   },
   "required": ["workflow_id"]
 }'::jsonb,
 '{
   "type": "object",
   "properties": {
     "parallel_groups": {"type": "array"},
     "estimated_speedup": {"type": "number"},
     "resource_usage": {"type": "object"},
     "bottlenecks": {"type": "array"}
   }
 }'::jsonb),

-- Tool 19: data_flow_analyzer
('data_flow_analyzer', 'anomaly_detector',
 'Analyzes and optimizes data flow between workflow tasks',
 '{
   "type": "object",
   "properties": {
     "workflow_id": {"type": "string", "format": "uuid"},
     "optimize_transfers": {"type": "boolean", "default": true},
     "detect_bottlenecks": {"type": "boolean", "default": true}
   },
   "required": ["workflow_id"]
 }'::jsonb,
 '{
   "type": "object",
   "properties": {
     "data_flow_graph": {"type": "object"},
     "bottlenecks": {"type": "array"},
     "optimization_suggestions": {"type": "array"},
     "estimated_data_volume": {"type": "integer"}
   }
 }'::jsonb),

-- Tool 20: workflow_validator
('workflow_validator', 'failure_predictor',
 'Validates workflow completeness, correctness, and predicts potential failures',
 '{
   "type": "object",
   "properties": {
     "workflow_id": {"type": "string", "format": "uuid"},
     "validation_level": {"type": "string", "enum": ["basic", "standard", "strict"], "default": "standard"},
     "auto_fix": {"type": "boolean", "default": false}
   },
   "required": ["workflow_id"]
 }'::jsonb,
 '{
   "type": "object",
   "properties": {
     "is_valid": {"type": "boolean"},
     "errors": {"type": "array"},
     "warnings": {"type": "array"},
     "suggestions": {"type": "array"},
     "auto_fixes_applied": {"type": "array"}
   }
 }'::jsonb);

-- =====================================================
-- PRE-BUILT WORKFLOW TEMPLATES
-- =====================================================

INSERT INTO workflow_template_library (template_name, category, description, template_schema, task_templates, tags, is_official, is_published) VALUES

('SEO Content Pipeline', 'content_generation', 
 'Complete pipeline for SEO-optimized content creation from keyword research to publishing',
 '{"version": "1.0", "complexity": 6}'::jsonb,
 '[
   {"name": "Keyword Research", "type": "data_gathering", "order": 1},
   {"name": "Topic Analysis", "type": "analysis", "order": 2},
   {"name": "Content Outline", "type": "generation", "order": 3},
   {"name": "Content Writing", "type": "generation", "order": 4},
   {"name": "SEO Optimization", "type": "optimization", "order": 5},
   {"name": "Publishing", "type": "deployment", "order": 6}
 ]'::jsonb,
 ARRAY['seo', 'content', 'automated'], TRUE, TRUE),

('Web Data Extraction', 'web_automation',
 'Extract structured data from websites with crawling, scraping, and data cleaning',
 '{"version": "1.0", "complexity": 7}'::jsonb,
 '[
   {"name": "URL Discovery", "type": "crawling", "order": 1},
   {"name": "Page Fetching", "type": "http_request", "order": 2, "can_parallel": true},
   {"name": "Content Extraction", "type": "scraping", "order": 3, "can_parallel": true},
   {"name": "Data Cleaning", "type": "transformation", "order": 4},
   {"name": "Storage", "type": "persistence", "order": 5}
 ]'::jsonb,
 ARRAY['web', 'scraping', 'data'], TRUE, TRUE),

('ETL Pipeline', 'data_processing',
 'Extract, Transform, Load pipeline for data integration',
 '{"version": "1.0", "complexity": 8}'::jsonb,
 '[
   {"name": "Data Extraction", "type": "extraction", "order": 1, "can_parallel": true},
   {"name": "Data Validation", "type": "validation", "order": 2},
   {"name": "Transformation", "type": "transformation", "order": 3},
   {"name": "Quality Check", "type": "validation", "order": 4},
   {"name": "Load to Destination", "type": "loading", "order": 5}
 ]'::jsonb,
 ARRAY['etl', 'data', 'integration'], TRUE, TRUE),

('CI/CD Deployment', 'deployment',
 'Continuous integration and deployment pipeline',
 '{"version": "1.0", "complexity": 7}'::jsonb,
 '[
   {"name": "Code Checkout", "type": "git", "order": 1},
   {"name": "Build", "type": "build", "order": 2},
   {"name": "Unit Tests", "type": "testing", "order": 3, "can_parallel": true},
   {"name": "Integration Tests", "type": "testing", "order": 4},
   {"name": "Deploy to Staging", "type": "deployment", "order": 5},
   {"name": "Smoke Tests", "type": "testing", "order": 6},
   {"name": "Deploy to Production", "type": "deployment", "order": 7}
 ]'::jsonb,
 ARRAY['ci/cd', 'deployment', 'automation'], TRUE, TRUE),

('ML Training Pipeline', 'machine_learning',
 'End-to-end machine learning model training and deployment',
 '{"version": "1.0", "complexity": 9}'::jsonb,
 '[
   {"name": "Data Collection", "type": "data_gathering", "order": 1},
   {"name": "Feature Engineering", "type": "transformation", "order": 2},
   {"name": "Model Training", "type": "ml_training", "order": 3},
   {"name": "Model Evaluation", "type": "ml_evaluation", "order": 4},
   {"name": "Hyperparameter Tuning", "type": "ml_optimization", "order": 5},
   {"name": "Model Deployment", "type": "deployment", "order": 6},
   {"name": "Monitoring Setup", "type": "monitoring", "order": 7}
 ]'::jsonb,
 ARRAY['machine-learning', 'ai', 'mlops'], TRUE, TRUE);

-- =====================================================
-- VALIDATION RULES
-- =====================================================

INSERT INTO workflow_validation_rules (rule_name, rule_category, description, validation_function, severity) VALUES
('required_tasks_present', 'completeness', 'Ensures workflow has at least one task', 'validate_min_tasks', 'error'),
('no_circular_dependencies', 'correctness', 'Checks for circular dependencies in task execution', 'validate_no_cycles', 'error'),
('valid_data_mappings', 'correctness', 'Validates data mappings between tasks', 'validate_data_mappings', 'error'),
('resource_requirements', 'performance', 'Checks resource requirements are specified', 'validate_resources', 'warning'),
('timeout_configured', 'reliability', 'Ensures timeout values are set', 'validate_timeouts', 'warning'),
('error_handling_present', 'reliability', 'Checks error handling is configured', 'validate_error_handling', 'suggestion'),
('parallel_optimization', 'performance', 'Suggests parallelization opportunities', 'suggest_parallelization', 'suggestion');

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to calculate similarity between workflow templates
CREATE OR REPLACE FUNCTION calculate_template_similarity(
    template_id_1 UUID,
    template_id_2 UUID
) RETURNS DECIMAL(5,4) AS $$
DECLARE
    similarity_score DECIMAL(5,4);
    v1 REAL[];
    v2 REAL[];
BEGIN
    -- Get embedding vectors
    SELECT embedding_vector INTO v1 FROM workflow_template_library WHERE id = template_id_1;
    SELECT embedding_vector INTO v2 FROM workflow_template_library WHERE id = template_id_2;
    
    -- Calculate cosine similarity (simplified - would use proper vector operation in production)
    -- This is a placeholder for the actual vector similarity calculation
    similarity_score := 0.0;
    
    RETURN similarity_score;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-link schemas based on similarity
CREATE OR REPLACE FUNCTION auto_link_schemas(
    source_id UUID,
    source_type TEXT,
    similarity_threshold DECIMAL DEFAULT 0.7
) RETURNS TABLE(target_id UUID, link_type schema_link_type, confidence DECIMAL(5,4)) AS $$
BEGIN
    -- Neural network-based schema linking would be implemented here
    -- Returns suggested schema links with confidence scores
    RETURN QUERY
    SELECT 
        gen_random_uuid() as target_id,
        'composition'::schema_link_type as link_type,
        0.85::DECIMAL(5,4) as confidence
    LIMIT 0;  -- Placeholder
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MATERIALIZED VIEWS
-- =====================================================

CREATE MATERIALIZED VIEW workflow_template_performance AS
SELECT 
    wt.id,
    wt.template_name,
    wt.category,
    wt.usage_count,
    wt.success_rate,
    wt.average_execution_time_ms,
    COUNT(DISTINCT aigf.id) as ai_generations,
    AVG(aigf.quality_score) as avg_quality_score,
    COUNT(DISTINCT wos.id) as optimization_suggestions
FROM workflow_template_library wt
LEFT JOIN ai_generation_feedback aigf ON aigf.template_id = wt.id
LEFT JOIN workflow_optimization_suggestions wos ON wos.workflow_id::text LIKE '%' || wt.id::text || '%'
GROUP BY wt.id, wt.template_name, wt.category, wt.usage_count, wt.success_rate, wt.average_execution_time_ms;

CREATE INDEX idx_workflow_template_performance ON workflow_template_performance(success_rate DESC, usage_count DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update workflow template usage count
CREATE OR REPLACE FUNCTION update_template_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE workflow_template_library
    SET usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE id = NEW.template_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE workflow_template_library IS 'Library of pre-built workflow templates with neural network embeddings for similarity matching';
COMMENT ON TABLE schema_link_registry IS 'Registry of schema relationships with automated linking via neural networks';
COMMENT ON TABLE task_decomposition_history IS 'History of complex task decompositions with strategy tracking';
COMMENT ON TABLE automation_orchestration_chains IS 'Multi-workflow automation chains with conditional branching';
COMMENT ON TABLE ux_flow_designs IS 'UX flow designs for workflow interaction with motion and sound';
COMMENT ON TABLE neural_schema_embeddings IS 'Neural network embeddings for schema similarity search';
COMMENT ON TABLE workflow_validation_rules IS 'Validation rules for workflow correctness and quality';
COMMENT ON TABLE dependency_resolution_graph IS 'Dependency resolution graphs with parallelization optimization';

-- =====================================================
-- GRANTS (Adjust as needed for your security model)
-- =====================================================

-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_app_user;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
