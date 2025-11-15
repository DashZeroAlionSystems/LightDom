/**
 * DeepSeek Codebase Integration Service
 * 
 * Integrates DeepSeek with codebase intelligence for:
 * - Semantic code search
 * - Code review and analysis
 * - Bug detection and fixes
 * - Code generation
 * - Documentation generation
 * - Refactoring suggestions
 * 
 * Research based on:
 * - DeepSeek Coder capabilities
 * - Microsoft's IntelliCode
 * - Amazon CodeWhisperer
 * - GitHub Copilot
 */

import { EventEmitter } from 'events';

export class DeepSeekCodebaseIntegration extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      model: config.model || 'deepseek-coder',
      baseURL: config.baseURL || process.env.DEEPSEEK_BASE_URL,
      apiKey: config.apiKey || process.env.DEEPSEEK_API_KEY,
      maxTokens: config.maxTokens || 4000,
      temperature: config.temperature || 0.2, // Lower for code tasks
      ...config,
    };

    this.db = config.db;
    
    // Cache for recent analyses
    this.analysisCache = new Map();
    this.maxCacheSize = 100;
  }

  /**
   * Analyze code entity for issues
   */
  async analyzeEntity(entity, context = {}) {
    const cacheKey = `analyze_${entity.entity_id}`;
    
    // Check cache
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey);
    }
    
    const prompt = this.buildAnalysisPrompt(entity, context);
    
    try {
      const response = await this.callDeepSeek({
        prompt,
        systemPrompt: 'You are an expert code reviewer. Analyze code for bugs, performance issues, security vulnerabilities, and best practices.',
      });
      
      const analysis = this.parseAnalysisResponse(response);
      
      // Cache result
      this.cacheResult(cacheKey, analysis);
      
      return analysis;
      
    } catch (error) {
      console.error('Failed to analyze entity:', error);
      return null;
    }
  }

  /**
   * Generate code fix
   */
  async generateFix(issue, context = {}) {
    const prompt = this.buildFixPrompt(issue, context);
    
    try {
      const response = await this.callDeepSeek({
        prompt,
        systemPrompt: 'You are an expert software engineer. Generate clean, working code that fixes the described issue.',
      });
      
      const fix = this.parseFixResponse(response);
      
      return fix;
      
    } catch (error) {
      console.error('Failed to generate fix:', error);
      return null;
    }
  }

  /**
   * Generate documentation
   */
  async generateDocumentation(entity, context = {}) {
    const prompt = this.buildDocPrompt(entity, context);
    
    try {
      const response = await this.callDeepSeek({
        prompt,
        systemPrompt: 'You are a technical documentation expert. Generate clear, comprehensive documentation.',
      });
      
      const docs = this.parseDocResponse(response);
      
      return docs;
      
    } catch (error) {
      console.error('Failed to generate documentation:', error);
      return null;
    }
  }

  /**
   * Semantic code search
   */
  async semanticSearch(query, options = {}) {
    const {
      limit = 10,
      entityTypes = null,
      minSimilarity = 0.7,
    } = options;
    
    if (!this.db) {
      throw new Error('Database required for semantic search');
    }
    
    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);
    
    if (!queryEmbedding) {
      throw new Error('Failed to generate query embedding');
    }
    
    // Search in database
    let sql = `
      SELECT 
        entity_id,
        name,
        entity_type,
        file_path,
        signature,
        description,
        1 - (embedding <=> $1::vector) as similarity
      FROM code_entities
      WHERE embedding IS NOT NULL
    `;
    
    const params = [JSON.stringify(queryEmbedding)];
    
    if (entityTypes) {
      sql += ` AND entity_type = ANY($2)`;
      params.push(entityTypes);
    }
    
    sql += `
      AND 1 - (embedding <=> $1::vector) > $${params.length + 1}
      ORDER BY similarity DESC
      LIMIT $${params.length + 2}
    `;
    
    params.push(minSimilarity, limit);
    
    const result = await this.db.query(sql, params);
    
    return result.rows;
  }

  /**
   * Find similar code entities
   */
  async findSimilarCode(entityId, options = {}) {
    const { limit = 5 } = options;
    
    if (!this.db) {
      throw new Error('Database required for similarity search');
    }
    
    const result = await this.db.query(`
      SELECT 
        ce2.entity_id,
        ce2.name,
        ce2.entity_type,
        ce2.file_path,
        1 - (ce1.embedding <=> ce2.embedding) as similarity
      FROM code_entities ce1
      CROSS JOIN code_entities ce2
      WHERE ce1.entity_id = $1
      AND ce2.entity_id != $1
      AND ce1.embedding IS NOT NULL
      AND ce2.embedding IS NOT NULL
      ORDER BY similarity DESC
      LIMIT $2
    `, [entityId, limit]);
    
    return result.rows;
  }

  /**
   * Suggest refactorings
   */
  async suggestRefactorings(entity, context = {}) {
    const prompt = this.buildRefactoringPrompt(entity, context);
    
    try {
      const response = await this.callDeepSeek({
        prompt,
        systemPrompt: 'You are a code refactoring expert. Suggest improvements while maintaining functionality.',
      });
      
      const suggestions = this.parseRefactoringResponse(response);
      
      return suggestions;
      
    } catch (error) {
      console.error('Failed to suggest refactorings:', error);
      return null;
    }
  }

  /**
   * Explain code
   */
  async explainCode(code, context = {}) {
    const prompt = `Explain what this code does:\n\n\`\`\`\n${code}\n\`\`\`\n\nProvide a clear explanation.`;
    
    try {
      const response = await this.callDeepSeek({
        prompt,
        systemPrompt: 'You are a code educator. Explain code clearly and concisely.',
      });
      
      return response;
      
    } catch (error) {
      console.error('Failed to explain code:', error);
      return null;
    }
  }

  /**
   * Generate embedding for text
   */
  async generateEmbedding(text) {
    // This would integrate with an embedding service
    // For now, return null (requires separate embedding API)
    console.log('⚠️  Embedding generation not implemented');
    return null;
  }

  /**
   * Call DeepSeek API
   */
  async callDeepSeek(options = {}) {
    const {
      prompt,
      systemPrompt = 'You are a helpful AI assistant.',
      temperature = this.config.temperature,
      maxTokens = this.config.maxTokens,
    } = options;
    
    // This is a placeholder - actual implementation would call DeepSeek API
    // Using fetch or axios to call the API
    
    try {
      const response = await fetch(`${this.config.baseURL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature,
          max_tokens: maxTokens,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
      
    } catch (error) {
      console.error('DeepSeek API call failed:', error);
      throw error;
    }
  }

  /**
   * Build prompts
   */
  
  buildAnalysisPrompt(entity, context) {
    return `
Analyze this code entity for issues:

**Type**: ${entity.entity_type}
**Name**: ${entity.name}
**File**: ${entity.file_path}
**Code**: 
\`\`\`
${context.code || entity.signature || ''}
\`\`\`

Identify:
1. Bugs or errors
2. Performance issues
3. Security vulnerabilities
4. Code smell
5. Best practice violations

Provide findings in JSON format:
{
  "issues": [
    {
      "severity": "critical|high|medium|low",
      "category": "bug|performance|security|style",
      "title": "...",
      "description": "...",
      "suggestion": "...",
      "confidence": 0.0-1.0
    }
  ]
}
`.trim();
  }

  buildFixPrompt(issue, context) {
    return `
Fix this code issue:

**Issue**: ${issue.title}
**Description**: ${issue.description}
**File**: ${issue.file_path}
**Suggestion**: ${issue.suggestion || 'Fix appropriately'}

${context.code ? `**Current Code**:\n\`\`\`\n${context.code}\n\`\`\`\n` : ''}

Generate:
1. Complete fixed code
2. Explanation of changes
3. Why this fix resolves the issue

Respond in JSON:
{
  "code": "...",
  "explanation": "...",
  "reasoning": "...",
  "confidence": 0.0-1.0
}
`.trim();
  }

  buildDocPrompt(entity, context) {
    return `
Generate documentation for this code:

**Type**: ${entity.entity_type}
**Name**: ${entity.name}
**Signature**: ${entity.signature || ''}

${context.code ? `**Code**:\n\`\`\`\n${context.code}\n\`\`\`\n` : ''}

Generate comprehensive JSDoc/TSDoc documentation including:
1. Description
2. Parameters (if applicable)
3. Return value (if applicable)
4. Examples
5. Notes/warnings

Format as properly formatted documentation comments.
`.trim();
  }

  buildRefactoringPrompt(entity, context) {
    return `
Suggest refactorings for this code:

**Type**: ${entity.entity_type}
**Name**: ${entity.name}
**File**: ${entity.file_path}

${context.code ? `**Code**:\n\`\`\`\n${context.code}\n\`\`\`\n` : ''}

Suggest improvements for:
1. Readability
2. Maintainability
3. Performance
4. Testability

Provide in JSON:
{
  "suggestions": [
    {
      "type": "...",
      "title": "...",
      "description": "...",
      "priority": "high|medium|low",
      "effort": "low|medium|high"
    }
  ]
}
`.trim();
  }

  /**
   * Parse responses
   */
  
  parseAnalysisResponse(response) {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: return as text
      return {
        issues: [],
        rawResponse: response,
      };
      
    } catch (error) {
      console.error('Failed to parse analysis response:', error);
      return { issues: [], error: error.message };
    }
  }

  parseFixResponse(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Try to extract code block
      const codeMatch = response.match(/```(?:javascript|typescript)?\n([\s\S]*?)\n```/);
      if (codeMatch) {
        return {
          code: codeMatch[1],
          reasoning: response,
          confidence: 0.7,
        };
      }
      
      return {
        code: response,
        confidence: 0.5,
      };
      
    } catch (error) {
      console.error('Failed to parse fix response:', error);
      return null;
    }
  }

  parseDocResponse(response) {
    // Extract documentation from response
    return response.trim();
  }

  parseRefactoringResponse(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        suggestions: [],
        rawResponse: response,
      };
      
    } catch (error) {
      console.error('Failed to parse refactoring response:', error);
      return { suggestions: [] };
    }
  }

  /**
   * Cache management
   */
  
  cacheResult(key, result) {
    // Simple LRU cache
    if (this.analysisCache.size >= this.maxCacheSize) {
      const firstKey = this.analysisCache.keys().next().value;
      this.analysisCache.delete(firstKey);
    }
    
    this.analysisCache.set(key, result);
  }

  clearCache() {
    this.analysisCache.clear();
  }
}

export default DeepSeekCodebaseIntegration;
