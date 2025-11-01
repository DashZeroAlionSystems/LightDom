import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Material Design 3 Motion Animation API Routes
 * Endpoints for managing animations, transitions, and motion tokens
 */

// ============================================================================
// ANIMATION TEMPLATES
// ============================================================================

/**
 * Generate animation from AI prompt
 * POST /api/animations/generate
 */
router.post('/generate', async (req: Request, res: Response) => {
  const { prompt, componentContext, category, patternType } = req.body;

  try {
    // Call Ollama API for AI generation
    const ollamaResponse = await fetch(`${process.env.VITE_OLLAMA_API_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.VITE_OLLAMA_MODEL || 'deepseek-r1:latest',
        prompt: `You are a Material Design 3 motion expert. Create an animation based on this description:

Prompt: ${prompt}
Component: ${componentContext || 'generic element'}
Category: ${category}
Pattern Type: ${patternType}

Generate a JSON object with these properties:
{
  "name": "animation-name (kebab-case)",
  "description": "brief description",
  "category": "${category}",
  "patternType": "${patternType}",
  "durationType": "medium1|short1|long1|etc",
  "easing": "emphasized|emphasized_decelerate|emphasized_accelerate|standard",
  "keyframes": [
    {"offset": 0, "property": "value", ...},
    {"offset": 1, "property": "value", ...}
  ],
  "animationProperties": {"fill-mode": "both"},
  "tags": ["tag1", "tag2"],
  "reasoning": "explanation of design choices"
}

Follow Material Design 3 motion principles:
- Use appropriate durations (small elements: 100-250ms, large: 300-500ms)
- Use emphasized easing for spatial motion
- Use decelerate for incoming, accelerate for outgoing
- Animate only transform and opacity for performance
- Ensure accessibility (no rapid flashing)

Return ONLY valid JSON, no additional text.`,
        stream: false
      })
    });

    const aiData = await ollamaResponse.json();
    let generatedContent = aiData.response;

    // Parse JSON from AI response
    const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI did not return valid JSON');
    }

    const animationData = JSON.parse(jsonMatch[0]);

    // Save to AI generations table
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO ai_animation_generations (
          prompt, component_context, generated_animation, 
          generation_reasoning, model_name
        ) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          prompt,
          componentContext,
          animationData,
          animationData.reasoning || '',
          process.env.VITE_OLLAMA_MODEL || 'deepseek-r1:latest'
        ]
      );

      res.json({
        animation: animationData,
        reasoning: animationData.reasoning,
        generationId: result.rows[0].id
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Animation generation error:', error);
    res.status(500).json({ error: 'Failed to generate animation' });
  }
});

/**
 * Create new animation template
 * POST /api/animations
 */
router.post('/', async (req: Request, res: Response) => {
  const {
    name,
    description,
    category,
    patternType,
    durationType,
    customDuration,
    easing,
    keyframes,
    animationProperties,
    tags,
    generatedFromPrompt,
    aiGenerated
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO md3_animation_templates (
        name, description, category, pattern_type, duration_type,
        custom_duration, easing, keyframes, animation_properties,
        tags, is_official
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        name,
        description,
        category,
        patternType,
        durationType,
        customDuration,
        easing,
        JSON.stringify(keyframes),
        JSON.stringify(animationProperties || {}),
        tags || [],
        false // User-created animations are not official
      ]
    );

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create animation error:', error);
    res.status(500).json({ error: 'Failed to create animation' });
  } finally {
    client.release();
  }
});

/**
 * List animation templates
 * GET /api/animations
 */
router.get('/', async (req: Request, res: Response) => {
  const {
    category,
    pattern,
    search,
    isOfficial,
    page = 1,
    limit = 20
  } = req.query;

  try {
    let query = 'SELECT * FROM md3_animation_templates WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category = $${paramCount++}`;
      params.push(category);
    }

    if (pattern) {
      query += ` AND pattern_type = $${paramCount++}`;
      params.push(pattern);
    }

    if (search) {
      query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (isOfficial !== undefined) {
      query += ` AND is_official = $${paramCount++}`;
      params.push(isOfficial === 'true');
    }

    query += ` ORDER BY usage_count DESC, created_at DESC`;
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount}`;
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM md3_animation_templates WHERE 1=1';
    const countParams = params.slice(0, -2); // Remove limit and offset
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      animations: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error('List animations error:', error);
    res.status(500).json({ error: 'Failed to list animations' });
  }
});

/**
 * Get animation template by ID
 * GET /api/animations/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM md3_animation_templates WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Animation not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get animation error:', error);
    res.status(500).json({ error: 'Failed to get animation' });
  }
});

/**
 * Update animation template
 * PUT /api/animations/:id
 */
router.put('/:id', async (req: Request, res: Response) => {
  const {
    name,
    description,
    durationType,
    customDuration,
    easing,
    keyframes,
    animationProperties,
    tags
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE md3_animation_templates SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        duration_type = COALESCE($3, duration_type),
        custom_duration = COALESCE($4, custom_duration),
        easing = COALESCE($5, easing),
        keyframes = COALESCE($6, keyframes),
        animation_properties = COALESCE($7, animation_properties),
        tags = COALESCE($8, tags),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *`,
      [
        name,
        description,
        durationType,
        customDuration,
        easing,
        keyframes ? JSON.stringify(keyframes) : null,
        animationProperties ? JSON.stringify(animationProperties) : null,
        tags,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Animation not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update animation error:', error);
    res.status(500).json({ error: 'Failed to update animation' });
  }
});

/**
 * Delete animation template
 * DELETE /api/animations/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM md3_animation_templates WHERE id = $1 AND is_official = false RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Animation not found or cannot be deleted (official animation)' });
    }

    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error('Delete animation error:', error);
    res.status(500).json({ error: 'Failed to delete animation' });
  }
});

/**
 * Generate CSS for animation
 * GET /api/animations/:id/css
 */
router.get('/:id/css', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT generate_animation_css($1) as css',
      [req.params.id]
    );

    res.setHeader('Content-Type', 'text/css');
    res.send(result.rows[0].css);
  } catch (error) {
    console.error('Generate CSS error:', error);
    res.status(500).json({ error: 'Failed to generate CSS' });
  }
});

// ============================================================================
// MOTION TOKENS
// ============================================================================

/**
 * List motion tokens
 * GET /api/animations/tokens
 */
router.get('/tokens/list', async (req: Request, res: Response) => {
  const { category } = req.query;

  try {
    let query = 'SELECT * FROM md3_motion_tokens';
    const params: any[] = [];

    if (category) {
      query += ' WHERE token_category = $1';
      params.push(category);
    }

    query += ' ORDER BY token_name';

    const result = await pool.query(query, params);
    res.json({ tokens: result.rows });
  } catch (error) {
    console.error('List tokens error:', error);
    res.status(500).json({ error: 'Failed to list tokens' });
  }
});

/**
 * Generate CSS custom properties for all tokens
 * GET /api/animations/tokens/css
 */
router.get('/tokens/css', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT css_variable, token_value FROM md3_motion_tokens ORDER BY token_name'
    );

    let css = ':root {\n';
    result.rows.forEach(row => {
      css += `  ${row.css_variable}: ${row.token_value};\n`;
    });
    css += '}\n';

    res.setHeader('Content-Type', 'text/css');
    res.send(css);
  } catch (error) {
    console.error('Generate tokens CSS error:', error);
    res.status(500).json({ error: 'Failed to generate CSS' });
  }
});

// ============================================================================
// TRANSITIONS
// ============================================================================

/**
 * Create transition definition
 * POST /api/animations/transitions
 */
router.post('/transitions', async (req: Request, res: Response) => {
  const {
    name,
    description,
    patternType,
    direction,
    stages,
    parallelStages,
    staggerDelay
  } = req.body;

  try {
    // Calculate total duration from stages
    const totalDuration = stages.reduce((max: number, stage: any) => {
      const delay = stage.delay || 0;
      const duration = stage.duration || 300;
      return Math.max(max, delay + duration);
    }, 0);

    const result = await pool.query(
      `INSERT INTO md3_transition_definitions (
        name, description, pattern_type, direction, stages,
        total_duration, parallel_stages, stagger_delay
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        name,
        description,
        patternType,
        direction,
        JSON.stringify(stages),
        totalDuration,
        parallelStages,
        staggerDelay
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create transition error:', error);
    res.status(500).json({ error: 'Failed to create transition' });
  }
});

/**
 * List transitions
 * GET /api/animations/transitions
 */
router.get('/transitions', async (req: Request, res: Response) => {
  const { pattern, direction } = req.query;

  try {
    let query = 'SELECT * FROM md3_transition_definitions WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (pattern) {
      query += ` AND pattern_type = $${paramCount++}`;
      params.push(pattern);
    }

    if (direction) {
      query += ` AND direction = $${paramCount++}`;
      params.push(direction);
    }

    query += ' ORDER BY usage_count DESC';

    const result = await pool.query(query, params);
    res.json({ transitions: result.rows });
  } catch (error) {
    console.error('List transitions error:', error);
    res.status(500).json({ error: 'Failed to list transitions' });
  }
});

// ============================================================================
// GUIDELINES (Do's and Don'ts)
// ============================================================================

/**
 * List motion guidelines
 * GET /api/animations/guidelines
 */
router.get('/guidelines', async (req: Request, res: Response) => {
  const { category } = req.query;

  try {
    let query = 'SELECT * FROM md3_motion_guidelines';
    const params: any[] = [];

    if (category) {
      query += ' WHERE guideline_category = $1';
      params.push(category);
    }

    query += ' ORDER BY importance_level DESC, created_at DESC';

    const result = await pool.query(query, params);
    res.json({ guidelines: result.rows });
  } catch (error) {
    console.error('List guidelines error:', error);
    res.status(500).json({ error: 'Failed to list guidelines' });
  }
});

// ============================================================================
// COMPONENT ANIMATIONS
// ============================================================================

/**
 * Link animation to component
 * POST /api/animations/components
 */
router.post('/components', async (req: Request, res: Response) => {
  const {
    componentId,
    componentName,
    componentType,
    defaultAnimations,
    stateAnimations,
    microInteractions,
    reducedMotionAlternative
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO md3_component_animation_schemas (
        component_id, component_name, component_type,
        default_animations, state_animations, micro_interactions,
        reduced_motion_alternative
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        componentId,
        componentName,
        componentType,
        JSON.stringify(defaultAnimations),
        JSON.stringify(stateAnimations || {}),
        JSON.stringify(microInteractions || {}),
        JSON.stringify(reducedMotionAlternative || {})
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Link animation error:', error);
    res.status(500).json({ error: 'Failed to link animation' });
  }
});

/**
 * Get component animations
 * GET /api/animations/components/:componentName
 */
router.get('/components/:componentName', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM md3_component_animation_schemas WHERE component_name = $1',
      [req.params.componentName]
    );

    res.json({ animations: result.rows });
  } catch (error) {
    console.error('Get component animations error:', error);
    res.status(500).json({ error: 'Failed to get animations' });
  }
});

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get popular animations
 * GET /api/animations/analytics/popular
 */
router.get('/analytics/popular', async (req: Request, res: Response) => {
  try {
    await pool.query('REFRESH MATERIALIZED VIEW popular_animations');
    const result = await pool.query(
      'SELECT * FROM popular_animations LIMIT 20'
    );

    res.json({ animations: result.rows });
  } catch (error) {
    console.error('Get popular animations error:', error);
    res.status(500).json({ error: 'Failed to get popular animations' });
  }
});

/**
 * Get animation quality metrics
 * GET /api/animations/analytics/quality
 */
router.get('/analytics/quality', async (req: Request, res: Response) => {
  try {
    await pool.query('REFRESH MATERIALIZED VIEW animation_quality_metrics');
    const result = await pool.query(
      'SELECT * FROM animation_quality_metrics WHERE generation_count > 0 ORDER BY avg_rating DESC NULLS LAST LIMIT 20'
    );

    res.json({ metrics: result.rows });
  } catch (error) {
    console.error('Get quality metrics error:', error);
    res.status(500).json({ error: 'Failed to get quality metrics' });
  }
});

export default router;
