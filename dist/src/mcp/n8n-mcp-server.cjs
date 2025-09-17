#!/usr/bin/env node
"use strict";
/**
 * n8n MCP Server for Cursor Integration
 *
 * This MCP server provides integration between Cursor and n8n workflows,
 * allowing developers to create, manage, and execute n8n workflows directly
 * from the Cursor IDE.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8nMCPServer = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs/promises"));
// Removed unused interfaces
class N8nMCPServer {
    constructor(config) {
        this.config = config;
        this.server = new index_js_1.Server({
            name: 'n8n-mcp-server',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupHandlers();
    }
    setupHandlers() {
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'list_workflows',
                        description: 'List all n8n workflows',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                active: {
                                    type: 'boolean',
                                    description: 'Filter by active status',
                                },
                            },
                        },
                    },
                    {
                        name: 'get_workflow',
                        description: 'Get a specific workflow by ID',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                workflowId: {
                                    type: 'string',
                                    description: 'The workflow ID',
                                },
                            },
                            required: ['workflowId'],
                        },
                    },
                    {
                        name: 'create_workflow',
                        description: 'Create a new n8n workflow',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string',
                                    description: 'Workflow name',
                                },
                                nodes: {
                                    type: 'array',
                                    description: 'Workflow nodes',
                                },
                                connections: {
                                    type: 'object',
                                    description: 'Node connections',
                                },
                                active: {
                                    type: 'boolean',
                                    description: 'Whether to activate the workflow',
                                    default: false,
                                },
                            },
                            required: ['name', 'nodes', 'connections'],
                        },
                    },
                    {
                        name: 'update_workflow',
                        description: 'Update an existing workflow',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                workflowId: {
                                    type: 'string',
                                    description: 'The workflow ID to update',
                                },
                                name: {
                                    type: 'string',
                                    description: 'New workflow name',
                                },
                                nodes: {
                                    type: 'array',
                                    description: 'Updated workflow nodes',
                                },
                                connections: {
                                    type: 'object',
                                    description: 'Updated node connections',
                                },
                                active: {
                                    type: 'boolean',
                                    description: 'Whether to activate the workflow',
                                },
                            },
                            required: ['workflowId'],
                        },
                    },
                    {
                        name: 'delete_workflow',
                        description: 'Delete a workflow',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                workflowId: {
                                    type: 'string',
                                    description: 'The workflow ID to delete',
                                },
                            },
                            required: ['workflowId'],
                        },
                    },
                    {
                        name: 'execute_workflow',
                        description: 'Execute a workflow',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                workflowId: {
                                    type: 'string',
                                    description: 'The workflow ID to execute',
                                },
                                inputData: {
                                    type: 'object',
                                    description: 'Input data for the workflow',
                                },
                            },
                            required: ['workflowId'],
                        },
                    },
                    {
                        name: 'get_execution',
                        description: 'Get execution details',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                executionId: {
                                    type: 'string',
                                    description: 'The execution ID',
                                },
                            },
                            required: ['executionId'],
                        },
                    },
                    {
                        name: 'list_executions',
                        description: 'List workflow executions',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                workflowId: {
                                    type: 'string',
                                    description: 'Filter by workflow ID',
                                },
                                limit: {
                                    type: 'number',
                                    description: 'Maximum number of executions to return',
                                    default: 20,
                                },
                            },
                        },
                    },
                    {
                        name: 'create_webhook',
                        description: 'Create a webhook for a workflow',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                workflowId: {
                                    type: 'string',
                                    description: 'The workflow ID',
                                },
                                httpMethod: {
                                    type: 'string',
                                    enum: ['GET', 'POST', 'PUT', 'DELETE'],
                                    description: 'HTTP method for the webhook',
                                    default: 'POST',
                                },
                                path: {
                                    type: 'string',
                                    description: 'Webhook path',
                                },
                            },
                            required: ['workflowId'],
                        },
                    },
                    {
                        name: 'trigger_webhook',
                        description: 'Trigger a workflow via webhook',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                webhookUrl: {
                                    type: 'string',
                                    description: 'The webhook URL',
                                },
                                method: {
                                    type: 'string',
                                    enum: ['GET', 'POST', 'PUT', 'DELETE'],
                                    description: 'HTTP method',
                                    default: 'POST',
                                },
                                data: {
                                    type: 'object',
                                    description: 'Data to send to the webhook',
                                },
                                headers: {
                                    type: 'object',
                                    description: 'Additional headers',
                                },
                            },
                            required: ['webhookUrl'],
                        },
                    },
                    {
                        name: 'export_workflow',
                        description: 'Export workflow as JSON',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                workflowId: {
                                    type: 'string',
                                    description: 'The workflow ID to export',
                                },
                                filePath: {
                                    type: 'string',
                                    description: 'File path to save the export',
                                },
                            },
                            required: ['workflowId'],
                        },
                    },
                    {
                        name: 'import_workflow',
                        description: 'Import workflow from JSON file',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                filePath: {
                                    type: 'string',
                                    description: 'Path to the workflow JSON file',
                                },
                                name: {
                                    type: 'string',
                                    description: 'New name for the imported workflow',
                                },
                            },
                            required: ['filePath'],
                        },
                    },
                    {
                        name: 'validate_workflow',
                        description: 'Validate workflow configuration',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                workflow: {
                                    type: 'object',
                                    description: 'Workflow definition to validate',
                                },
                            },
                            required: ['workflow'],
                        },
                    },
                    {
                        name: 'get_workflow_statistics',
                        description: 'Get workflow execution statistics',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                workflowId: {
                                    type: 'string',
                                    description: 'The workflow ID',
                                },
                                timeRange: {
                                    type: 'string',
                                    enum: ['hour', 'day', 'week', 'month'],
                                    description: 'Time range for statistics',
                                    default: 'day',
                                },
                            },
                            required: ['workflowId'],
                        },
                    },
                ],
            };
        });
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'list_workflows':
                        return await this.listWorkflows(args);
                    case 'get_workflow':
                        return await this.getWorkflow(args);
                    case 'create_workflow':
                        return await this.createWorkflow(args);
                    case 'update_workflow':
                        return await this.updateWorkflow(args);
                    case 'delete_workflow':
                        return await this.deleteWorkflow(args);
                    case 'execute_workflow':
                        return await this.executeWorkflow(args);
                    case 'get_execution':
                        return await this.getExecution(args);
                    case 'list_executions':
                        return await this.listExecutions(args);
                    case 'create_webhook':
                        return await this.createWebhook(args);
                    case 'trigger_webhook':
                        return await this.triggerWebhook(args);
                    case 'export_workflow':
                        return await this.exportWorkflow(args);
                    case 'import_workflow':
                        return await this.importWorkflow(args);
                    case 'validate_workflow':
                        return await this.validateWorkflow(args);
                    case 'get_workflow_statistics':
                        return await this.getWorkflowStatistics(args);
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                };
            }
        });
    }
    async makeRequest(endpoint, options = {}) {
        const url = `${this.config.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        if (this.config.apiKey) {
            headers['X-N8N-API-KEY'] = this.config.apiKey;
        }
        const response = await (0, axios_1.default)({
            url,
            method: options.method || 'GET',
            headers,
            data: options.data,
            timeout: this.config.timeout,
        });
        return response.data;
    }
    async listWorkflows(args) {
        const workflows = await this.makeRequest('/api/v1/workflows');
        let filteredWorkflows = workflows.data || workflows;
        if (args.active !== undefined) {
            filteredWorkflows = filteredWorkflows.filter((w) => w.active === args.active);
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(filteredWorkflows, null, 2),
                },
            ],
        };
    }
    async getWorkflow(args) {
        const workflow = await this.makeRequest(`/api/v1/workflows/${args.workflowId}`);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(workflow, null, 2),
                },
            ],
        };
    }
    async createWorkflow(args) {
        const workflowData = {
            name: args.name,
            nodes: args.nodes,
            connections: args.connections,
            active: args.active || false,
        };
        const workflow = await this.makeRequest('/api/v1/workflows', {
            method: 'POST',
            data: workflowData,
        });
        return {
            content: [
                {
                    type: 'text',
                    text: `Workflow created successfully: ${JSON.stringify(workflow, null, 2)}`,
                },
            ],
        };
    }
    async updateWorkflow(args) {
        const updateData = {};
        if (args.name)
            updateData.name = args.name;
        if (args.nodes)
            updateData.nodes = args.nodes;
        if (args.connections)
            updateData.connections = args.connections;
        if (args.active !== undefined)
            updateData.active = args.active;
        const workflow = await this.makeRequest(`/api/v1/workflows/${args.workflowId}`, {
            method: 'PUT',
            data: updateData,
        });
        return {
            content: [
                {
                    type: 'text',
                    text: `Workflow updated successfully: ${JSON.stringify(workflow, null, 2)}`,
                },
            ],
        };
    }
    async deleteWorkflow(args) {
        await this.makeRequest(`/api/v1/workflows/${args.workflowId}`, {
            method: 'DELETE',
        });
        return {
            content: [
                {
                    type: 'text',
                    text: `Workflow ${args.workflowId} deleted successfully`,
                },
            ],
        };
    }
    async executeWorkflow(args) {
        const execution = await this.makeRequest(`/api/v1/workflows/${args.workflowId}/execute`, {
            method: 'POST',
            data: args.inputData || {},
        });
        return {
            content: [
                {
                    type: 'text',
                    text: `Workflow execution started: ${JSON.stringify(execution, null, 2)}`,
                },
            ],
        };
    }
    async getExecution(args) {
        const execution = await this.makeRequest(`/api/v1/executions/${args.executionId}`);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(execution, null, 2),
                },
            ],
        };
    }
    async listExecutions(args) {
        let endpoint = '/api/v1/executions';
        const params = new URLSearchParams();
        if (args.workflowId) {
            params.append('workflowId', args.workflowId);
        }
        if (args.limit) {
            params.append('limit', args.limit.toString());
        }
        if (params.toString()) {
            endpoint += `?${params.toString()}`;
        }
        const executions = await this.makeRequest(endpoint);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(executions.data || executions, null, 2),
                },
            ],
        };
    }
    async createWebhook(args) {
        const webhookData = {
            httpMethod: args.httpMethod || 'POST',
            path: args.path || `webhook-${args.workflowId}`,
        };
        const webhook = await this.makeRequest(`/api/v1/workflows/${args.workflowId}/webhook`, {
            method: 'POST',
            data: webhookData,
        });
        return {
            content: [
                {
                    type: 'text',
                    text: `Webhook created: ${JSON.stringify(webhook, null, 2)}`,
                },
            ],
        };
    }
    async triggerWebhook(args) {
        const response = await (0, axios_1.default)({
            url: args.webhookUrl,
            method: (args.method || 'POST'),
            data: args.data || {},
            headers: args.headers || {},
            timeout: this.config.timeout,
        });
        return {
            content: [
                {
                    type: 'text',
                    text: `Webhook triggered successfully: ${JSON.stringify(response.data, null, 2)}`,
                },
            ],
        };
    }
    async exportWorkflow(args) {
        const workflow = await this.makeRequest(`/api/v1/workflows/${args.workflowId}`);
        const exportData = {
            workflow,
            exportedAt: new Date().toISOString(),
            version: '1.0.0',
        };
        if (args.filePath) {
            await fs.writeFile(args.filePath, JSON.stringify(exportData, null, 2));
            return {
                content: [
                    {
                        type: 'text',
                        text: `Workflow exported to ${args.filePath}`,
                    },
                ],
            };
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(exportData, null, 2),
                },
            ],
        };
    }
    async importWorkflow(args) {
        const fileContent = await fs.readFile(args.filePath, 'utf-8');
        const importData = JSON.parse(fileContent);
        const workflowData = {
            name: args.name || importData.workflow.name || `Imported-${Date.now()}`,
            nodes: importData.workflow.nodes,
            connections: importData.workflow.connections,
            active: false,
        };
        const workflow = await this.makeRequest('/api/v1/workflows', {
            method: 'POST',
            data: workflowData,
        });
        return {
            content: [
                {
                    type: 'text',
                    text: `Workflow imported successfully: ${JSON.stringify(workflow, null, 2)}`,
                },
            ],
        };
    }
    async validateWorkflow(args) {
        const validation = {
            valid: true,
            errors: [],
            warnings: [],
        };
        // Basic validation
        if (!args.workflow.name) {
            validation.errors.push('Workflow name is required');
            validation.valid = false;
        }
        if (!args.workflow.nodes || !Array.isArray(args.workflow.nodes)) {
            validation.errors.push('Workflow must have nodes array');
            validation.valid = false;
        }
        if (!args.workflow.connections) {
            validation.errors.push('Workflow must have connections object');
            validation.valid = false;
        }
        // Check for at least one trigger node
        const hasTrigger = args.workflow.nodes?.some((node) => node.type && node.type.includes('Trigger'));
        if (!hasTrigger) {
            validation.warnings.push('Workflow should have at least one trigger node');
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(validation, null, 2),
                },
            ],
        };
    }
    async getWorkflowStatistics(args) {
        // Get executions for the time range
        const executions = await this.listExecutions({
            workflowId: args.workflowId,
            limit: 1000,
        });
        const executionData = JSON.parse(executions.content[0].text);
        const executionsList = executionData.data || executionData;
        // Calculate statistics
        const stats = {
            totalExecutions: executionsList.length,
            successfulExecutions: executionsList.filter((e) => e.finished && !e.stoppedAt).length,
            failedExecutions: executionsList.filter((e) => e.finished && e.stoppedAt).length,
            averageExecutionTime: 0,
            timeRange: args.timeRange || 'day',
        };
        // Calculate average execution time
        const finishedExecutions = executionsList.filter((e) => e.finished);
        if (finishedExecutions.length > 0) {
            const totalTime = finishedExecutions.reduce((sum, e) => {
                const start = new Date(e.startedAt).getTime();
                const end = new Date(e.finishedAt || e.stoppedAt).getTime();
                return sum + (end - start);
            }, 0);
            stats.averageExecutionTime = totalTime / finishedExecutions.length;
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(stats, null, 2),
                },
            ],
        };
    }
    async run() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
        console.error('n8n MCP Server running on stdio');
    }
}
exports.N8nMCPServer = N8nMCPServer;
// Main execution
async function main() {
    const config = {
        baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
        apiKey: process.env.N8N_API_KEY,
        webhookUrl: process.env.N8N_WEBHOOK_URL,
        timeout: parseInt(process.env.N8N_TIMEOUT || '30000'),
    };
    const server = new N8nMCPServer(config);
    await server.run();
}
if (require.main === module) {
    main().catch((error) => {
        console.error('Failed to start n8n MCP Server:', error);
        process.exit(1);
    });
}
