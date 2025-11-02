/**
 * N8N Workflow Integration Service
 * Manages automated workflows using N8N workflow automation platform
 * 
 * Features:
 * - Create and manage N8N workflows
 * - Execute workflows programmatically
 * - Monitor workflow execution
 * - Webhook management
 * - Template-based workflow creation
 * - SEO optimization workflows
 * - Data pipeline automation
 * 
 * @module N8NWorkflowService
 */

import axios, { AxiosInstance } from 'axios';
import Logger from '@/utils/Logger';

export interface N8NConfig {
    baseURL: string;
    apiKey: string;
    timeout: number;
}

export interface WorkflowNode {
    id: string;
    name: string;
    type: string;
    typeVersion: number;
    position: [number, number];
    parameters: Record<string, any>;
    credentials?: Record<string, any>;
}

export interface WorkflowConnection {
    node: string;
    type: string;
    index: number;
}

export interface WorkflowDefinition {
    name: string;
    nodes: WorkflowNode[];
    connections: Record<string, Record<string, WorkflowConnection[][]>>;
    active: boolean;
    settings?: {
        executionOrder?: 'v0' | 'v1';
        saveManualExecutions?: boolean;
        callerPolicy?: string;
    };
}

export interface WorkflowExecution {
    id: string;
    finished: boolean;
    mode: 'manual' | 'webhook' | 'trigger';
    retryOf?: string;
    retrySuccessId?: string;
    startedAt: Date;
    stoppedAt?: Date;
    workflowId: string;
    data: any;
}

export interface WorkflowExecutionResult {
    success: boolean;
    executionId: string;
    data?: any;
    error?: string;
}

export class N8NWorkflowService {
    private config: N8NConfig;
    private client: AxiosInstance;
    
    constructor(config?: Partial<N8NConfig>) {
        this.config = {
            baseURL: process.env.N8N_API_URL || 'http://localhost:5678',
            apiKey: process.env.N8N_API_KEY || '',
            timeout: config?.timeout || 30000
        };
        
        this.client = axios.create({
            baseURL: `${this.config.baseURL}/api/v1`,
            timeout: this.config.timeout,
            headers: {
                'X-N8N-API-KEY': this.config.apiKey,
                'Content-Type': 'application/json'
            }
        });
    }
    
    /**
     * Check if N8N service is available
     */
    async isAvailable(): Promise<boolean> {
        try {
            const response = await this.client.get('/workflows');
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Create a new workflow
     */
    async createWorkflow(workflow: WorkflowDefinition): Promise<{ id: string; name: string }> {
        try {
            const response = await this.client.post('/workflows', workflow);
            Logger.info(`Created N8N workflow: ${response.data.id} - ${workflow.name}`);
            return {
                id: response.data.id,
                name: response.data.name
            };
        } catch (error) {
            Logger.error('Failed to create N8N workflow:', error);
            throw new Error('Failed to create workflow');
        }
    }
    
    /**
     * Get workflow by ID
     */
    async getWorkflow(workflowId: string): Promise<WorkflowDefinition> {
        try {
            const response = await this.client.get(`/workflows/${workflowId}`);
            return response.data;
        } catch (error) {
            Logger.error(`Failed to get workflow ${workflowId}:`, error);
            throw new Error('Failed to get workflow');
        }
    }
    
    /**
     * Update existing workflow
     */
    async updateWorkflow(workflowId: string, workflow: Partial<WorkflowDefinition>): Promise<void> {
        try {
            await this.client.patch(`/workflows/${workflowId}`, workflow);
            Logger.info(`Updated N8N workflow: ${workflowId}`);
        } catch (error) {
            Logger.error(`Failed to update workflow ${workflowId}:`, error);
            throw new Error('Failed to update workflow');
        }
    }
    
    /**
     * Delete workflow
     */
    async deleteWorkflow(workflowId: string): Promise<void> {
        try {
            await this.client.delete(`/workflows/${workflowId}`);
            Logger.info(`Deleted N8N workflow: ${workflowId}`);
        } catch (error) {
            Logger.error(`Failed to delete workflow ${workflowId}:`, error);
            throw new Error('Failed to delete workflow');
        }
    }
    
    /**
     * List all workflows
     */
    async listWorkflows(): Promise<Array<{ id: string; name: string; active: boolean }>> {
        try {
            const response = await this.client.get('/workflows');
            return response.data.data.map((w: any) => ({
                id: w.id,
                name: w.name,
                active: w.active
            }));
        } catch (error) {
            Logger.error('Failed to list workflows:', error);
            throw new Error('Failed to list workflows');
        }
    }
    
    /**
     * Activate workflow
     */
    async activateWorkflow(workflowId: string): Promise<void> {
        try {
            await this.client.patch(`/workflows/${workflowId}`, { active: true });
            Logger.info(`Activated workflow: ${workflowId}`);
        } catch (error) {
            Logger.error(`Failed to activate workflow ${workflowId}:`, error);
            throw new Error('Failed to activate workflow');
        }
    }
    
    /**
     * Deactivate workflow
     */
    async deactivateWorkflow(workflowId: string): Promise<void> {
        try {
            await this.client.patch(`/workflows/${workflowId}`, { active: false });
            Logger.info(`Deactivated workflow: ${workflowId}`);
        } catch (error) {
            Logger.error(`Failed to deactivate workflow ${workflowId}:`, error);
            throw new Error('Failed to deactivate workflow');
        }
    }
    
    /**
     * Execute workflow manually
     */
    async executeWorkflow(workflowId: string, data?: any): Promise<WorkflowExecutionResult> {
        try {
            const response = await this.client.post(`/workflows/${workflowId}/execute`, {
                data: data || {}
            });
            
            return {
                success: response.data.finished && !response.data.error,
                executionId: response.data.id,
                data: response.data.data,
                error: response.data.error
            };
        } catch (error) {
            Logger.error(`Failed to execute workflow ${workflowId}:`, error);
            return {
                success: false,
                executionId: '',
                error: 'Workflow execution failed'
            };
        }
    }
    
    /**
     * Get workflow execution details
     */
    async getExecution(executionId: string): Promise<WorkflowExecution> {
        try {
            const response = await this.client.get(`/executions/${executionId}`);
            return {
                id: response.data.id,
                finished: response.data.finished,
                mode: response.data.mode,
                retryOf: response.data.retryOf,
                retrySuccessId: response.data.retrySuccessId,
                startedAt: new Date(response.data.startedAt),
                stoppedAt: response.data.stoppedAt ? new Date(response.data.stoppedAt) : undefined,
                workflowId: response.data.workflowId,
                data: response.data.data
            };
        } catch (error) {
            Logger.error(`Failed to get execution ${executionId}:`, error);
            throw new Error('Failed to get execution');
        }
    }
    
    /**
     * List workflow executions
     */
    async listExecutions(workflowId?: string, limit: number = 20): Promise<WorkflowExecution[]> {
        try {
            const params: any = { limit };
            if (workflowId) {
                params.workflowId = workflowId;
            }
            
            const response = await this.client.get('/executions', { params });
            return response.data.data.map((e: any) => ({
                id: e.id,
                finished: e.finished,
                mode: e.mode,
                startedAt: new Date(e.startedAt),
                stoppedAt: e.stoppedAt ? new Date(e.stoppedAt) : undefined,
                workflowId: e.workflowId,
                data: e.data
            }));
        } catch (error) {
            Logger.error('Failed to list executions:', error);
            throw new Error('Failed to list executions');
        }
    }
    
    // ===== TEMPLATE-BASED WORKFLOWS =====
    
    /**
     * Create SEO content workflow
     */
    async createSEOContentWorkflow(name: string, keywords: string[], targetURL: string): Promise<string> {
        const workflow: WorkflowDefinition = {
            name: name || 'SEO Content Generation',
            active: false,
            nodes: [
                {
                    id: 'start',
                    name: 'Start',
                    type: 'n8n-nodes-base.start',
                    typeVersion: 1,
                    position: [250, 300],
                    parameters: {}
                },
                {
                    id: 'crawl',
                    name: 'Crawl Target URL',
                    type: 'n8n-nodes-base.httpRequest',
                    typeVersion: 1,
                    position: [450, 300],
                    parameters: {
                        url: targetURL,
                        method: 'GET',
                        options: {}
                    }
                },
                {
                    id: 'analyze',
                    name: 'Analyze Content',
                    type: 'n8n-nodes-base.code',
                    typeVersion: 1,
                    position: [650, 300],
                    parameters: {
                        jsCode: `
                            const html = $input.item.json.body;
                            const keywords = ${JSON.stringify(keywords)};
                            
                            // Analyze keyword density, structure, etc.
                            return [{
                                json: {
                                    keywords,
                                    analysis: 'SEO analysis results',
                                    html
                                }
                            }];
                        `
                    }
                },
                {
                    id: 'generate',
                    name: 'Generate Optimized Content',
                    type: 'n8n-nodes-base.httpRequest',
                    typeVersion: 1,
                    position: [850, 300],
                    parameters: {
                        url: `${process.env.API_URL || 'http://localhost:3001'}/api/seo/optimize`,
                        method: 'POST',
                        sendBody: true,
                        bodyParameters: {
                            parameters: [
                                { name: 'keywords', value: '={{$json.keywords}}' },
                                { name: 'content', value: '={{$json.html}}' }
                            ]
                        }
                    }
                },
                {
                    id: 'save',
                    name: 'Save Results',
                    type: 'n8n-nodes-base.postgres',
                    typeVersion: 1,
                    position: [1050, 300],
                    parameters: {
                        operation: 'insert',
                        table: 'seo_content',
                        columns: 'url,keywords,optimized_content,created_at',
                        values: `{{$json.url}},{{$json.keywords}},{{$json.content}},NOW()`
                    }
                }
            ],
            connections: {
                'start': {
                    'main': [[{ node: 'crawl', type: 'main', index: 0 }]]
                },
                'crawl': {
                    'main': [[{ node: 'analyze', type: 'main', index: 0 }]]
                },
                'analyze': {
                    'main': [[{ node: 'generate', type: 'main', index: 0 }]]
                },
                'generate': {
                    'main': [[{ node: 'save', type: 'main', index: 0 }]]
                }
            }
        };
        
        const result = await this.createWorkflow(workflow);
        return result.id;
    }
    
    /**
     * Create web crawler workflow
     */
    async createCrawlerWorkflow(name: string, startURL: string, maxPages: number = 100): Promise<string> {
        const workflow: WorkflowDefinition = {
            name: name || 'Web Crawler',
            active: false,
            nodes: [
                {
                    id: 'trigger',
                    name: 'Schedule Trigger',
                    type: 'n8n-nodes-base.cron',
                    typeVersion: 1,
                    position: [250, 300],
                    parameters: {
                        triggerTimes: {
                            item: [
                                { mode: 'everyHour' }
                            ]
                        }
                    }
                },
                {
                    id: 'crawl',
                    name: 'Start Crawl',
                    type: 'n8n-nodes-base.httpRequest',
                    typeVersion: 1,
                    position: [450, 300],
                    parameters: {
                        url: `${process.env.API_URL}/api/crawler/start`,
                        method: 'POST',
                        sendBody: true,
                        bodyParameters: {
                            parameters: [
                                { name: 'url', value: startURL },
                                { name: 'maxPages', value: maxPages }
                            ]
                        }
                    }
                },
                {
                    id: 'process',
                    name: 'Process Results',
                    type: 'n8n-nodes-base.code',
                    typeVersion: 1,
                    position: [650, 300],
                    parameters: {
                        jsCode: `
                            const results = $input.item.json.results;
                            // Process crawler results
                            return results.map(r => ({ json: r }));
                        `
                    }
                },
                {
                    id: 'store',
                    name: 'Store in Database',
                    type: 'n8n-nodes-base.postgres',
                    typeVersion: 1,
                    position: [850, 300],
                    parameters: {
                        operation: 'insert',
                        table: 'crawl_results'
                    }
                }
            ],
            connections: {
                'trigger': {
                    'main': [[{ node: 'crawl', type: 'main', index: 0 }]]
                },
                'crawl': {
                    'main': [[{ node: 'process', type: 'main', index: 0 }]]
                },
                'process': {
                    'main': [[{ node: 'store', type: 'main', index: 0 }]]
                }
            }
        };
        
        const result = await this.createWorkflow(workflow);
        return result.id;
    }
    
    /**
     * Create ML training workflow
     */
    async createMLTrainingWorkflow(name: string, modelType: string): Promise<string> {
        const workflow: WorkflowDefinition = {
            name: name || 'ML Model Training',
            active: false,
            nodes: [
                {
                    id: 'trigger',
                    name: 'Daily Trigger',
                    type: 'n8n-nodes-base.cron',
                    typeVersion: 1,
                    position: [250, 300],
                    parameters: {
                        triggerTimes: {
                            item: [
                                { hour: 2, minute: 0 }
                            ]
                        }
                    }
                },
                {
                    id: 'fetch-data',
                    name: 'Fetch Training Data',
                    type: 'n8n-nodes-base.postgres',
                    typeVersion: 1,
                    position: [450, 300],
                    parameters: {
                        operation: 'select',
                        table: 'ml_training_data',
                        where: 'model_type = $1',
                        values: [modelType]
                    }
                },
                {
                    id: 'train',
                    name: 'Train Model',
                    type: 'n8n-nodes-base.httpRequest',
                    typeVersion: 1,
                    position: [650, 300],
                    parameters: {
                        url: `${process.env.API_URL}/api/ml/train`,
                        method: 'POST',
                        sendBody: true,
                        bodyParameters: {
                            parameters: [
                                { name: 'modelType', value: modelType },
                                { name: 'data', value: '={{$json}}' }
                            ]
                        }
                    }
                },
                {
                    id: 'evaluate',
                    name: 'Evaluate Model',
                    type: 'n8n-nodes-base.code',
                    typeVersion: 1,
                    position: [850, 300],
                    parameters: {
                        jsCode: `
                            const metrics = $input.item.json.metrics;
                            if (metrics.accuracy < 0.8) {
                                throw new Error('Model accuracy too low');
                            }
                            return [{ json: metrics }];
                        `
                    }
                },
                {
                    id: 'deploy',
                    name: 'Deploy Model',
                    type: 'n8n-nodes-base.httpRequest',
                    typeVersion: 1,
                    position: [1050, 300],
                    parameters: {
                        url: `${process.env.API_URL}/api/ml/deploy`,
                        method: 'POST',
                        sendBody: true
                    }
                }
            ],
            connections: {
                'trigger': {
                    'main': [[{ node: 'fetch-data', type: 'main', index: 0 }]]
                },
                'fetch-data': {
                    'main': [[{ node: 'train', type: 'main', index: 0 }]]
                },
                'train': {
                    'main': [[{ node: 'evaluate', type: 'main', index: 0 }]]
                },
                'evaluate': {
                    'main': [[{ node: 'deploy', type: 'main', index: 0 }]]
                }
            }
        };
        
        const result = await this.createWorkflow(workflow);
        return result.id;
    }
}

// Singleton instance
export const n8nService = new N8NWorkflowService();

export default N8NWorkflowService;
