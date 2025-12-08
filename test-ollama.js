// Test script for simplified Ollama integration

// Simple Ollama client for testing
class SimpleOllamaClient {
  constructor(options = {}) {
    this.endpoint = options.endpoint || 'http://localhost:11500';
    this.model = options.model || 'deepseek-coder';
    this.temperature = options.temperature || 0.7;
  }

  async chat(message, options = {}) {
    try {
      const response = await fetch(`${this.endpoint}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: message,
          stream: false,
          options: {
            temperature: this.temperature,
            ...options,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const result = await response.json();
      return result.response || 'No response from Ollama';
    } catch (error) {
      console.error('Ollama chat error:', error);
      throw new Error(`Failed to communicate with Ollama: ${error.message}`);
    }
  }

  async generate(prompt, options = {}) {
    try {
      const response = await fetch(`${this.endpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          options: {
            temperature: this.temperature,
            ...options,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const result = await response.json();
      return result.response || 'No response from Ollama';
    } catch (error) {
      console.error('Ollama generate error:', error);
      throw new Error(`Failed to communicate with Ollama: ${error.message}`);
    }
  }

  getStatus() {
    return {
      endpoint: this.endpoint,
      model: this.model,
      temperature: this.temperature,
      status: 'ready',
    };
  }
}

async function testOllamaIntegration() {
  console.log('🧪 Testing Ollama DeepSeek integration...');

  try {
    const client = new SimpleOllamaClient({
      endpoint: 'http://localhost:11500',
      model: 'deepseek-coder',
      temperature: 0.7,
    });

    console.log('📊 Client status:', client.getStatus());

    console.log('🔄 Testing chat endpoint...');
    const chatResponse = await client.chat('Hello, can you help me with JavaScript code?');
    console.log('💬 Chat response:', chatResponse);

    console.log('🔄 Testing generate endpoint...');
    const generateResponse = await client.generate(
      'Write a simple function to add two numbers in JavaScript'
    );
    console.log('📝 Generate response:', generateResponse);

    console.log('✅ Ollama integration test completed successfully!');
  } catch (error) {
    console.error('❌ Ollama integration test failed:', error.message);
  }
}

testOllamaIntegration();
