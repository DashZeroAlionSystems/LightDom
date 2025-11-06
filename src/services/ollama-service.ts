/**
 * Ollama Service Integration
 * 
 * Client for interacting with Ollama DeepSeek-R1 API
 * Handles service startup check, generation requests, and error handling
 */

export interface OllamaGenerateOptions {
  prompt: string;
  model?: string;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}

export interface OllamaGenerateResponse {
  response: string;
  model: string;
  created_at: string;
  done: boolean;
}

export class OllamaService {
  private baseUrl: string;
  private defaultModel: string;

  constructor(baseUrl = 'http://localhost:11434', defaultModel = 'deepseek-r1') {
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
  }

  /**
   * Check if Ollama service is running
   */
  async checkServiceHealth(): Promise<boolean> {
    try {
      const response = await fetch(`\${this.baseUrl}/api/tags`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('Ollama service not available:', error);
      return false;
    }
  }

  /**
   * Generate text from prompt using Ollama
   */
  async generate(options: OllamaGenerateOptions): Promise<string> {
    const isHealthy = await this.checkServiceHealth();
    if (!isHealthy) {
      throw new Error('Ollama service is not running. Please start it with: ollama serve');
    }

    try {
      const response = await fetch(`\${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: options.model || this.defaultModel,
          prompt: options.prompt,
          stream: false,
          options: {
            temperature: options.temperature ?? 0.7,
            top_p: options.top_p ?? 0.9,
            num_predict: options.max_tokens,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: \${response.statusText}`);
      }

      const data: OllamaGenerateResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Ollama generation error:', error);
      throw error;
    }
  }

  /**
   * Generate workflow configuration from prompt
   */
  async generateWorkflowConfig(prompt: string, selectedParts: string[]): Promise<any> {
    const systemPrompt = `You are a workflow configuration expert. Generate a valid JSON workflow configuration based on the user's requirements.

Selected workflow parts: \${selectedParts.join(', ')}

User request: \${prompt}

Generate a JSON configuration with this structure:
{
  "name": "workflow-name",
  "description": "Brief description",
  "steps": [
    {
      "id": "step-1",
      "name": "Step Name",
      "type": "dataMining|seoAnalysis|contentGen|monitoring",
      "config": {}
    }
  ],
  "schemas": {},
  "errorHandling": {
    "retries": 3,
    "timeout": 300000
  }
}

Return ONLY the JSON, no additional text.`;

    const response = await this.generate({ prompt: systemPrompt });
    
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Failed to parse workflow config:', error);
      throw new Error('Failed to generate valid workflow configuration');
    }
  }

  /**
   * Generate component bundle configuration from prompt
   */
  async generateComponentBundleConfig(
    prompt: string,
    selectedComponents: string[],
    mockDataEnabled: boolean
  ): Promise<any> {
    const systemPrompt = `You are a component configuration expert. Generate a valid JSON component bundle configuration.

Selected components: \${selectedComponents.join(', ')}
Mock data enabled: \${mockDataEnabled}

User request: \${prompt}

Generate a JSON configuration with this structure:
{
  "name": "bundle-name",
  "description": "Brief description",
  "components": [
    {
      "id": "component-id",
      "type": "stat-card|chart|table|form",
      "config": {
        "dataSource": "schema-id",
        "fields": [],
        "layout": {}
      }
    }
  ],
  "dataSources": [],
  "mockData": \${mockDataEnabled}
}

Return ONLY the JSON, no additional text.`;

    const response = await this.generate({ prompt: systemPrompt });
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Failed to parse component config:', error);
      throw new Error('Failed to generate valid component configuration');
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`\${this.baseUrl}/api/tags`);
      if (!response.ok) {
        return [this.defaultModel];
      }
      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [this.defaultModel];
    } catch (error) {
      return [this.defaultModel];
    }
  }
}

// Export singleton instance
export const ollamaService = new OllamaService();

// Export service check function for UI
export async function checkOllamaService(): Promise<{
  available: boolean;
  message: string;
}> {
  const service = new OllamaService();
  const isAvailable = await service.checkServiceHealth();
  
  return {
    available: isAvailable,
    message: isAvailable
      ? 'Ollama service is running'
      : 'Ollama service not available. Start it with: ollama serve',
  };
}
