// Focused test for training pipeline Ollama metadata + context window helpers
import assert from 'assert';
import {
  buildModelfileSections,
  normalizeOllamaTrainingConfig
} from '../services/pretrained-model-training-helpers.js';

console.log('🧪 Validating training pipeline Ollama context helpers...');

// Test 1: Ensure all default sections are present and merge examples
const mergedSections = buildModelfileSections(
  [
    { key: 'system', examples: ['SYSTEM """Custom system"""'] },
    { key: 'parameter', examples: ['PARAMETER num_ctx 12000'] }
  ],
  ['MESSAGE user hello']
);

const sectionKeys = mergedSections.map(s => s.key);
assert(sectionKeys.includes('system'), 'System section missing');
assert(sectionKeys.includes('template'), 'Template section missing');
assert(sectionKeys.includes('parameter'), 'Parameter section missing');
assert(
  mergedSections.find(s => s.key === 'system')?.examples.some(e => e.includes('Custom')),
  'Custom examples not merged into system section'
);
assert(
  mergedSections.every(s => s.examples.some(e => e.includes('hello'))),
  'Global examples should be added to every section'
);

// Test 2: Normalize config and honor context window + examples
const normalized = normalizeOllamaTrainingConfig(
  { contextWindow: 8192, trainingExamples: ['EXAMPLE_ONE'], modelSections: mergedSections },
  { defaultModel: 'llama3', defaultContextWindow: 4096 }
);

assert.equal(normalized.contextWindow, 8192, 'Context window should respect override');
assert.equal(normalized.model, 'llama3', 'Default model fallback failed');
assert(normalized.trainingExamples.includes('EXAMPLE_ONE'), 'Training examples not retained');
assert.equal(
  normalized.modelfileSections.length,
  mergedSections.length,
  'Section count should be preserved'
);

console.log('✅ Training pipeline Ollama context helpers are working as expected.');
