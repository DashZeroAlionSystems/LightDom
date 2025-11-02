/**
 * Enhance prompt templates with schema_refs field
 * Adds database schema context to each template
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const templatePath = join(__dirname, '../../workflows/automation/ollama-prompts/prompt-templates.json');
const templates = JSON.parse(readFileSync(templatePath, 'utf8'));

// Schema mappings for each template
const schemaMap = {
  'analyze_dom_structure': ['dom_elements', 'dom_metrics', 'dom_analysis_runs'],
  'generate_optimization_plan': ['optimization_recommendations', 'performance_metrics'],
  'suggest_caching_strategy': ['cache_policies', 'resource_metadata'],
  'create_workflow_from_description': ['workflows', 'workflow_templates', 'workflow_instances'],
  'optimize_existing_workflow': ['workflows', 'workflow_execution_logs'],
  'generate_webhook_handler': ['workflows', 'webhook_configs'],
  'generate_crawler_script': ['crawler_tasks', 'crawler_results'],
  'generate_api_endpoint': ['api_endpoints', 'api_schemas'],
  'generate_test_suite': ['test_suites', 'test_cases'],
  'generate_api_docs': ['api_endpoints', 'api_documentation'],
  'generate_workflow_docs': ['workflows', 'workflow_documentation'],
  'code_review': ['code_reviews', 'code_quality_metrics'],
  'performance_analysis': ['performance_metrics', 'bottleneck_analysis'],
  'generate_component': ['component_definitions', 'atom_definitions', 'design_tokens'],
  'generate_dashboard_workflow': ['dashboard_definitions', 'component_definitions', 'workflow_dashboards'],
  'enhance_component_reusability': ['component_definitions', 'reusability_metrics'],
  'generate_component_variants': ['component_definitions', 'component_variants']
};

// Add schema_refs to each template
for (const category of Object.values(templates.categories)) {
  for (const template of category.templates) {
    template.schema_refs = schemaMap[template.id] || [];
    template.training_data_source = `ml_training_data WHERE template_id = '${template.id}'`;
  }
}

// Update version
templates.version = '2.0.0';
templates.schema_aware = true;

// Save updated templates
writeFileSync(templatePath, JSON.stringify(templates, null, 2));
console.log('✅ Templates enhanced with schema_refs');
console.log(`Updated ${Object.values(templates.categories).reduce((sum, cat) => sum + cat.templates.length, 0)} templates`);
