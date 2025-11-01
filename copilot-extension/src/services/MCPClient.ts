import WebSocket from 'ws';

export interface MCPMessage {
  type: 'request' | 'response' | 'notification';
  method: string;
  params?: any;
  id?: string;
  result?: any;
  error?: any;
}

export interface DOMOptimizationRequest {
  code: string;
  language: string;
  context?: {
    filePath: string;
    selection: { start: { line: number; character: number }; end: { line: number; character: number } };
    surroundingCode: string;
  };
}

export interface DOMOptimizationResponse {
  optimizations: Array<{
    type: 'performance' | 'accessibility' | 'seo' | 'structure';
    description: string;
    code: string;
    confidence: number;
  }>;
  analysis: {
    complexity: number;
    performanceScore: number;
    accessibilityScore: number;
  };
}

export class MCPClient {
  private connection: WebSocket | null = null;
  private messageHandlers: Map<string, (response: any) => void> = new Map();
  private requestId = 0;

  constructor(private serverUrl: string) {}

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.connection = new WebSocket(this.serverUrl);

        this.connection.onopen = () => {
          console.log('MCP Client connected to server');
          resolve();
        };

        this.connection.onmessage = (event) => {
          try {
            const message: MCPMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse MCP message:', error);
          }
        };

        this.connection.onerror = (error) => {
          console.error('MCP Client connection error:', error);
          reject(error);
        };

        this.connection.onclose = () => {
          console.log('MCP Client connection closed');
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
  }

  async optimizeDOM(request: DOMOptimizationRequest): Promise<DOMOptimizationResponse> {
    return this.sendRequest('dom.optimize', request);
  }

  async analyzePerformance(code: string, language: string): Promise<any> {
    return this.sendRequest('dom.analyzePerformance', { code, language });
  }

  async generateTests(code: string, language: string): Promise<any> {
    return this.sendRequest('dom.generateTests', { code, language });
  }

  async reviewCode(code: string, language: string): Promise<any> {
    return this.sendRequest('dom.reviewCode', { code, language });
  }

  private async sendRequest(method: string, params: any): Promise<any> {
    if (!this.connection || this.connection.readyState !== WebSocket.OPEN) {
      throw new Error('MCP Client not connected');
    }

    const id = (++this.requestId).toString();
    const message: MCPMessage = {
      type: 'request',
      method,
      params,
      id
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.messageHandlers.delete(id);
        reject(new Error('Request timeout'));
      }, 30000); // 30 second timeout

      this.messageHandlers.set(id, (response) => {
        clearTimeout(timeout);
        if (response.error) {
          reject(new Error(response.error.message || 'MCP request failed'));
        } else {
          resolve(response.result);
        }
      });

      this.connection!.send(JSON.stringify(message));
    });
  }

  private handleMessage(message: MCPMessage): void {
    if (message.type === 'response' && message.id) {
      const handler = this.messageHandlers.get(message.id);
      if (handler) {
        handler(message);
        this.messageHandlers.delete(message.id);
      }
    }
  }

  isConnected(): boolean {
    return this.connection?.readyState === WebSocket.OPEN;
  }

  dispose(): void {
    this.disconnect();
  }
}