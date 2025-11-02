/**
 * AI Layout Generation API Routes
 * Integrates with Ollama and DeepSeek APIs for intelligent component placement
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');

// Ollama API configuration
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';

// DeepSeek API configuration
const DEEPSEEK_API_URL = 'https://api.deepseek.com';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

/**
 * Generate layout using AI based on prompt and selected components
 * POST /api/ai/generate-layout
 */
router.post('/generate-layout', async (req, res) => {
  try {
    const { prompt, selectedComponents, currentLayout, provider = 'ollama', schema } = req.body;

    if (!prompt || !selectedComponents || selectedComponents.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields: prompt and selectedComponents'
      });
    }

    // Build AI prompt with context
    const aiPrompt = buildLayoutPrompt(prompt, selectedComponents, currentLayout, schema);

    // Call appropriate AI provider
    let layout;
    if (provider === 'deepseek' && DEEPSEEK_API_KEY) {
      layout = await generateWithDeepSeek(aiPrompt, selectedComponents);
    } else {
      layout = await generateWithOllama(aiPrompt, selectedComponents);
    }

    res.json({
      success: true,
      layout,
      provider: provider === 'deepseek' && DEEPSEEK_API_KEY ? 'deepseek' : 'ollama'
    });

  } catch (error) {
    console.error('AI layout generation error:', error);
    res.status(500).json({
      error: 'Failed to generate layout',
      message: error.message
    });
  }
});

/**
 * Check API status for both providers
 * GET /api/ai/status
 */
router.get('/status', async (req, res) => {
  const status = {
    ollama: { available: false, models: [] },
    deepseek: { available: false, configured: !!DEEPSEEK_API_KEY }
  };

  // Check Ollama
  try {
    const response = await axios.get(`${OLLAMA_API_URL}/api/tags`, { timeout: 3000 });
    status.ollama.available = true;
    status.ollama.models = response.data.models?.map(m => m.name) || [];
  } catch (error) {
    console.log('Ollama not available:', error.message);
  }

  // Check DeepSeek
  if (DEEPSEEK_API_KEY) {
    try {
      const response = await axios.get(`${DEEPSEEK_API_URL}/v1/models`, {
        headers: { 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
        timeout: 3000
      });
      status.deepseek.available = true;
      status.deepseek.models = response.data.data?.map(m => m.id) || [];
    } catch (error) {
      console.log('DeepSeek not available:', error.message);
    }
  }

  res.json(status);
});

/**
 * Generate workflow based on schema
 * POST /api/ai/generate-workflow
 */
router.post('/generate-workflow', async (req, res) => {
  try {
    const { description, schema, provider = 'ollama' } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const aiPrompt = buildWorkflowPrompt(description, schema);

    let workflow;
    if (provider === 'deepseek' && DEEPSEEK_API_KEY) {
      workflow = await generateWorkflowWithDeepSeek(aiPrompt, schema);
    } else {
      workflow = await generateWorkflowWithOllama(aiPrompt, schema);
    }

    res.json({
      success: true,
      workflow,
      provider: provider === 'deepseek' && DEEPSEEK_API_KEY ? 'deepseek' : 'ollama'
    });

  } catch (error) {
    console.error('Workflow generation error:', error);
    res.status(500).json({
      error: 'Failed to generate workflow',
      message: error.message
    });
  }
});

// Helper functions

function buildLayoutPrompt(userPrompt, components, currentLayout, schema) {
  const componentsList = components.map(id => {
    // Find component details from your component library
    return id; // Simplified for now
  }).join(', ');

  const schemaInfo = schema ? `\nDatabase Schema Context:\n${JSON.stringify(schema, null, 2)}` : '';

  return `You are a UI/UX expert. Generate an intelligent layout configuration for a dashboard.

User Request: "${userPrompt}"

Available Components: ${componentsList}

Current Layout Slots:
- Header: Top navigation area
- Sidebar: Left navigation/menu area
- Main: Primary content area
- Footer: Bottom action/info area

${schemaInfo}

Placement Guidelines:
1. Search bars and navigation go in Header
2. Filters and menus go in Sidebar  
3. Data displays, stats, and main content go in Main
4. Action buttons and footer info go in Footer
5. Consider the workflow: input → process → output
6. Group related components together
7. Use schema relationships to inform placement

Return a JSON array of layout slots with component assignments:
[
  { "id": "header", "name": "Header", "components": ["component-id-1"] },
  { "id": "sidebar", "name": "Sidebar", "components": [] },
  { "id": "main", "name": "Main Content", "components": ["component-id-2", "component-id-3"] },
  { "id": "footer", "name": "Footer", "components": ["component-id-4"] }
]

ONLY return valid JSON, no additional text.`;
}

function buildWorkflowPrompt(description, schema) {
  const schemaInfo = schema ? `\nDatabase Schema:\n${JSON.stringify(schema, null, 2)}` : '';

  return `Generate a complete workflow configuration for: "${description}"

${schemaInfo}

Create an n8n-compatible workflow with:
1. Nodes for each workflow step
2. Connections between nodes
3. Configuration for each node
4. Error handling
5. Schema-aware data transformations

Return valid JSON workflow definition.`;
}

async function generateWithOllama(prompt, context) {
  try {
    const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
      model: 'llama2',
      prompt: prompt,
      stream: false,
      format: 'json'
    }, {
      timeout: 60000 // 60 second timeout
    });

    // Parse the JSON response
    const layout = JSON.parse(response.data.response);
    return layout;

  } catch (error) {
    console.error('Ollama generation error:', error);
    throw new Error(`Ollama API error: ${error.message}`);
  }
}

async function generateWithDeepSeek(prompt, context) {
  try {
    const response = await axios.post(`${DEEPSEEK_API_URL}/v1/chat/completions`, {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a UI/UX expert that generates layout configurations in JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });

    const layout = JSON.parse(response.data.choices[0].message.content);
    return layout;

  } catch (error) {
    console.error('DeepSeek generation error:', error);
    throw new Error(`DeepSeek API error: ${error.message}`);
  }
}

async function generateWorkflowWithOllama(prompt, schema) {
  try {
    const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
      model: 'llama2',
      prompt: prompt,
      stream: false,
      format: 'json'
    }, {
      timeout: 90000 // 90 seconds for workflow generation
    });

    return JSON.parse(response.data.response);

  } catch (error) {
    console.error('Ollama workflow generation error:', error);
    throw new Error(`Ollama API error: ${error.message}`);
  }
}

async function generateWorkflowWithDeepSeek(prompt, schema) {
  try {
    const response = await axios.post(`${DEEPSEEK_API_URL}/v1/chat/completions`, {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a workflow automation expert that generates n8n workflow configurations in JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 90000
    });

    return JSON.parse(response.data.choices[0].message.content);

  } catch (error) {
    console.error('DeepSeek workflow generation error:', error);
    throw new Error(`DeepSeek API error: ${error.message}`);
  }
}

module.exports = router;
