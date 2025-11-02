/**
 * Ollama R1 Integration Service
 * Provides AI-powered reasoning, code generation, and task delegation
 * 
 * Features:
 * - Chat interface with conversation history
 * - Code generation for multiple languages
 * - Task analysis and delegation
 * - Workflow planning
 * - SEO content optimization
 * - Component generation assistance
 * 
 * @module OllamaService
 */

import axios, { AxiosInstance } from 'axios';
import { getDatabaseService } from '../DatabaseService.js';

export interface OllamaConfig {
    baseURL: string;
    model: string;
    temperature: number;
    maxTokens: number;
    timeout: number;
}

export interface OllamaMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface OllamaResponse {
    model: string;
    created_at: string;
    message: OllamaMessage;
    done: boolean;
}

export interface GenerateOptions {
    prompt: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    system?: string;
}

export interface TaskDelegationResult {
    task: string;
    analysis: string;
    steps: string[];
    estimatedTime: string;
    dependencies: string[];
}

export class OllamaService {
    private config: OllamaConfig;
    private conversationHistory: OllamaMessage[] = [];
    private client: AxiosInstance;
    private maxHistoryLength: number = 20; // Last 10 exchanges
    
    constructor(config?: Partial<OllamaConfig>) {
        this.config = {
            baseURL: process.env.OLLAMA_API_URL || 'http://localhost:11434',
            model: config?.model || 'r1',
            temperature: config?.temperature || 0.7,
            maxTokens: config?.maxTokens || 2000,
            timeout: config?.timeout || 120000 // 2 minutes
        };
        
        this.client = axios.create({
            baseURL: this.config.baseURL,
            timeout: this.config.timeout,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    
    /**
     * Check if Ollama service is available
     */
    async isAvailable(): Promise<boolean> {
        try {
            const response = await this.client.get('/api/tags');
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * List available models
     */
    async listModels(): Promise<string[]> {
        try {
            const response = await this.client.get('/api/tags');
            return response.data.models?.map((m: any) => m.name) || [];
        } catch (error) {
            console.error('Failed to list Ollama models:', error);
            return [];
        }
    }
    
    /**
     * Send a chat message to Ollama
     */
    async chat(message: string, systemPrompt?: string): Promise<string> {
        const messages: OllamaMessage[] = [];
        
        // Add system prompt if provided
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        
        // Add conversation history
        messages.push(...this.conversationHistory);
        
        // Add user message
        messages.push({ role: 'user', content: message });
        
        try {
            const response = await this.client.post<OllamaResponse>(
                '/api/chat',
                {
                    model: this.config.model,
                    messages,
                    stream: false,
                    options: {
                        temperature: this.config.temperature,
                        num_predict: this.config.maxTokens
                    }
                }
            );
            
            const assistantMessage = response.data.message.content;
            
            // Update conversation history
            this.conversationHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: assistantMessage }
            );
            
            // Keep history manageable
            if (this.conversationHistory.length > this.maxHistoryLength) {
                this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
            }
            
            return assistantMessage;
        } catch (error) {
            console.error('Ollama chat error:', error);
            throw new Error('Failed to communicate with Ollama');
        }
    }
    
    /**
     * Log AI interaction to database
     */
    async logInteraction(
        prompt: string,
        response: string,
        options?: {
            model?: string;
            context?: Record<string, any>;
            metadata?: Record<string, any>;
            service?: string;
            userId?: string;
            sessionId?: string;
            durationMs?: number;
            success?: boolean;
            error?: string;
        }
    ): Promise<void> {
        try {
            const dbService = getDatabaseService();
            
            await dbService.query(
                `INSERT INTO ai_interactions 
                (model, prompt, response, context, metadata, service, user_id, session_id, duration_ms, success, error)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [
                    options?.model || this.config.model,
                    prompt,
                    response,
                    JSON.stringify(options?.context || {}),
                    JSON.stringify(options?.metadata || {}),
                    options?.service || 'OllamaService',
                    options?.userId || null,
                    options?.sessionId || null,
                    options?.durationMs || null,
                    options?.success !== undefined ? options.success : true,
                    options?.error || null,
                ]
            );
        } catch (error) {
            console.error('Failed to log AI interaction:', error);
            // Don't throw - logging failures shouldn't break the main flow
        }
    }
    
    /**
     * Generate code using Ollama
     */
    async generateCode(prompt: string, language: string = 'typescript'): Promise<string> {
        const systemPrompt = `You are an expert ${language} developer. Generate clean, well-documented, production-ready code following best practices and design patterns.`;
        const fullPrompt = `Generate ${language} code for: ${prompt}\n\nProvide only the code with inline comments, no explanations.`;
        
        return this.chat(fullPrompt, systemPrompt);
    }
    
    /**
     * Generate React component
     */
    async generateReactComponent(description: string, designSystem: string = 'Material Design 3'): Promise<string> {
        const systemPrompt = `You are a senior React developer specializing in ${designSystem}. Create TypeScript React components with proper typing, accessibility, and responsive design.`;
        const prompt = `Create a React component: ${description}\n\nRequirements:\n- TypeScript with proper types\n- ${designSystem} compliance\n- WCAG 2.1 AA accessibility\n- Responsive design\n- Clean, maintainable code`;
        
        return this.chat(prompt, systemPrompt);
    }
    
    /**
     * Delegate task to Ollama for analysis
     */
    async delegateTask(task: string, context?: Record<string, any>): Promise<TaskDelegationResult> {
        const systemPrompt = 'You are an AI task coordinator and project manager. Analyze tasks and provide detailed execution plans with steps, dependencies, and time estimates.';
        const contextStr = context ? `\n\nContext: ${JSON.stringify(context, null, 2)}` : '';
        const fullPrompt = `Task: ${task}${contextStr}\n\nProvide a detailed execution plan in JSON format with:\n1. Task analysis\n2. Step-by-step breakdown\n3. Estimated time for completion\n4. Dependencies\n\nFormat as JSON: { "task": string, "analysis": string, "steps": string[], "estimatedTime": string, "dependencies": string[] }`;
        
        const response = await this.chat(fullPrompt, systemPrompt);
        
        try {
            // Extract JSON from response (might be wrapped in markdown code blocks)
            const jsonMatch = response.match(/```json\n?([\s\S]+?)\n?```/) || response.match(/\{[\s\S]+\}/);
            if (jsonMatch) {
                const jsonStr = jsonMatch[1] || jsonMatch[0];
                return JSON.parse(jsonStr);
            }
            
            // Fallback: return response as analysis
            return {
                task,
                analysis: response,
                steps: ['Review analysis and create manual plan'],
                estimatedTime: 'Unknown',
                dependencies: []
            };
        } catch (error) {
            console.error('Failed to parse task delegation response:', error);
            return {
                task,
                analysis: response,
                steps: ['Review analysis and create manual plan'],
                estimatedTime: 'Unknown',
                dependencies: []
            };
        }
    }
    
    /**
     * Optimize SEO content
     */
    async optimizeSEO(content: string, keywords: string[], targetAudience?: string): Promise<{
        title: string;
        metaDescription: string;
        optimizedContent: string;
        recommendations: string[];
    }> {
        const systemPrompt = 'You are an SEO expert specializing in content optimization and keyword integration.';
        const audienceContext = targetAudience ? `\nTarget audience: ${targetAudience}` : '';
        const prompt = `Optimize this content for SEO:\n\n${content}\n\nTarget keywords: ${keywords.join(', ')}${audienceContext}\n\nProvide:\n1. Optimized title (60 chars max)\n2. Meta description (160 chars max)\n3. Optimized content with natural keyword integration\n4. SEO recommendations\n\nFormat as JSON: { "title": string, "metaDescription": string, "optimizedContent": string, "recommendations": string[] }`;
        
        const response = await this.chat(prompt, systemPrompt);
        
        try {
            const jsonMatch = response.match(/```json\n?([\s\S]+?)\n?```/) || response.match(/\{[\s\S]+\}/);
            if (jsonMatch) {
                const jsonStr = jsonMatch[1] || jsonMatch[0];
                return JSON.parse(jsonStr);
            }
        } catch (error) {
            console.error('Failed to parse SEO optimization response:', error);
        }
        
        // Fallback
        return {
            title: 'Optimized Title',
            metaDescription: 'Optimized meta description',
            optimizedContent: content,
            recommendations: ['Review SEO response manually']
        };
    }
    
    /**
     * Create workflow from description
     */
    async createWorkflow(description: string, platform: 'n8n' | 'generic' = 'n8n'): Promise<{
        name: string;
        description: string;
        nodes: any[];
        connections: any[];
    }> {
        const systemPrompt = `You are a workflow automation expert specializing in ${platform}. Create efficient, maintainable workflow definitions.`;
        const prompt = `Create a ${platform} workflow: ${description}\n\nProvide workflow definition as JSON with nodes and connections.`;
        
        const response = await this.chat(prompt, systemPrompt);
        
        try {
            const jsonMatch = response.match(/```json\n?([\s\S]+?)\n?```/) || response.match(/\{[\s\S]+\}/);
            if (jsonMatch) {
                const jsonStr = jsonMatch[1] || jsonMatch[0];
                return JSON.parse(jsonStr);
            }
        } catch (error) {
            console.error('Failed to parse workflow response:', error);
        }
        
        return {
            name: 'Generated Workflow',
            description,
            nodes: [],
            connections: []
        };
    }
    
    /**
     * Analyze code for improvements
     */
    async analyzeCode(code: string, language: string = 'typescript'): Promise<{
        quality: number;
        issues: string[];
        suggestions: string[];
        refactoredCode?: string;
    }> {
        const systemPrompt = `You are a senior software engineer specializing in code review and refactoring.`;
        const prompt = `Analyze this ${language} code and provide:\n1. Quality score (0-10)\n2. Issues found\n3. Improvement suggestions\n4. Refactored code (optional)\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nFormat as JSON: { "quality": number, "issues": string[], "suggestions": string[], "refactoredCode": string }`;
        
        const response = await this.chat(prompt, systemPrompt);
        
        try {
            const jsonMatch = response.match(/```json\n?([\s\S]+?)\n?```/) || response.match(/\{[\s\S]+\}/);
            if (jsonMatch) {
                const jsonStr = jsonMatch[1] || jsonMatch[0];
                return JSON.parse(jsonStr);
            }
        } catch (error) {
            console.error('Failed to parse code analysis response:', error);
        }
        
        return {
            quality: 7,
            issues: ['Could not parse analysis'],
            suggestions: ['Review response manually'],
        };
    }
    
    /**
     * Clear conversation history
     */
    clearHistory(): void {
        this.conversationHistory = [];
    }
    
    /**
     * Get conversation history
     */
    getHistory(): OllamaMessage[] {
        return [...this.conversationHistory];
    }
    
    /**
     * Set max history length
     */
    setMaxHistoryLength(length: number): void {
        this.maxHistoryLength = length;
        if (this.conversationHistory.length > length) {
            this.conversationHistory = this.conversationHistory.slice(-length);
        }
    }
}

// Singleton instance
export const ollamaService = new OllamaService();

// Export for testing/custom instances
export default OllamaService;
