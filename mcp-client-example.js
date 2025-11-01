#!/usr/bin/env node

/**
 * MCP Client Example - Memory Workflow Integration
 * Shows how to integrate the Memory Workflow MCP Server into applications
 */

import { spawn } from 'child_process';

class MCPWorkflowClient {
    constructor() {
        this.serverProcess = null;
        this.requestId = 1;
        this.pendingRequests = new Map();
    }

    async connect() {
        console.log('🔌 Connecting to Memory Workflow MCP Server...');

        return new Promise((resolve, reject) => {
            this.serverProcess = spawn('node', ['memory-workflow-mcp-server.js'], {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let connected = false;

            this.serverProcess.stdout.on('data', (data) => {
                const output = data.toString();

                if (output.includes('Memory Workflow MCP Server initialized') && !connected) {
                    connected = true;
                    console.log('✅ Connected to MCP server');
                    resolve();
                }

                // Handle responses
                this.handleServerResponse(output);
            });

            this.serverProcess.stderr.on('data', (data) => {
                console.error('Server error:', data.toString());
            });

            this.serverProcess.on('close', (code) => {
                if (!connected) {
                    reject(new Error(`Server exited with code ${code}`));
                }
            });

            // Timeout after 10 seconds
            setTimeout(() => {
                if (!connected) {
                    reject(new Error('Connection timeout'));
                }
            }, 10000);
        });
    }

    handleServerResponse(data) {
        try {
            const response = JSON.parse(data.trim());

            if (response.id && this.pendingRequests.has(response.id)) {
                const { resolve, reject } = this.pendingRequests.get(response.id);
                this.pendingRequests.delete(response.id);

                if (response.result) {
                    resolve(response.result);
                } else if (response.error) {
                    reject(new Error(response.error.message));
                }
            }
        } catch (error) {
            // Not a JSON response, ignore
        }
    }

    async call(method, params) {
        const id = this.requestId++;
        const request = {
            jsonrpc: "2.0",
            id,
            method,
            params
        };

        return new Promise((resolve, reject) => {
            this.pendingRequests.set(id, { resolve, reject });

            this.serverProcess.stdin.write(JSON.stringify(request) + '\n');

            // Timeout after 30 seconds
            setTimeout(() => {
                if (this.pendingRequests.has(id)) {
                    this.pendingRequests.delete(id);
                    reject(new Error('Request timeout'));
                }
            }, 30000);
        });
    }

    async executeWorkflow(workflowType, context, requirements) {
        console.log(`🔄 Executing ${workflowType} workflow...`);

        const result = await this.call('workflow/execute', {
            workflowType,
            context,
            requirements
        });

        console.log(`✅ Workflow completed: ${result.workflowId}`);
        console.log(`   Execution time: ${result.executionTime}ms`);
        console.log(`   Success rate: ${(result.successRate * 100).toFixed(1)}%`);
        console.log(`   Cost savings: $${result.costSavings.monetarySavings.toFixed(2)}`);

        return result;
    }

    async queryMemory(query, limit = 5) {
        console.log(`🧠 Querying memory for: ${query}`);

        const result = await this.call('memory/query', {
            query,
            limit
        });

        console.log(`📊 Found ${result.results.length} memory patterns`);
        return result.results;
    }

    async optimizeBundle(bundleConfig, historicalData) {
        console.log('🔧 Optimizing API bundle...');

        const result = await this.call('bundle/optimize', {
            bundleConfig,
            historicalData
        });

        console.log('📈 Optimization complete:');
        console.log(`   Time reduction: ${result.predictedSavings.timeReduction}%`);
        console.log(`   Cost reduction: ${result.predictedSavings.costReduction}%`);

        return result;
    }

    disconnect() {
        if (this.serverProcess) {
            console.log('🔌 Disconnecting from MCP server...');
            this.serverProcess.kill('SIGINT');
        }
    }
}

// Example usage
async function exampleUsage() {
    const client = new MCPWorkflowClient();

    try {
        // Connect to the server
        await client.connect();

        console.log('\n🎯 Memory Workflow MCP Client Examples\n');

        // Example 1: Execute a content generation workflow
        console.log('📝 Example 1: Content Generation Workflow');
        const contentResult = await client.executeWorkflow(
            'content_generation',
            {
                domain: 'marketing',
                user: 'demo_user',
                preferences: {
                    tone: 'professional',
                    length: 'medium'
                }
            },
            {
                output: 'blog_post',
                topic: 'AI-powered workflow optimization',
                audience: 'technical_decision_makers'
            }
        );

        // Example 2: Query memory patterns
        console.log('\n🧠 Example 2: Memory Pattern Query');
        const memoryPatterns = await client.queryMemory('content_generation');

        // Example 3: Optimize API bundle
        console.log('\n🔧 Example 3: Bundle Optimization');
        const bundleResult = await client.optimizeBundle(
            {
                endpoints: [
                    '/api/auth/login',
                    '/api/content/generate',
                    '/api/content/optimize',
                    '/api/analytics/track'
                ],
                strategy: 'parallel'
            },
            {
                avgResponseTime: 2100,
                successRate: 0.78,
                errorPatterns: ['timeout', 'rate_limit']
            }
        );

        // Example 4: Data synchronization workflow
        console.log('\n🔄 Example 4: Data Synchronization Workflow');
        const syncResult = await client.executeWorkflow(
            'data_sync',
            {
                domain: 'user_management',
                source: 'legacy_system',
                target: 'new_platform'
            },
            {
                dataTypes: ['user_profiles', 'preferences', 'history'],
                syncMode: 'incremental',
                conflictResolution: 'latest_wins'
            }
        );

        console.log('\n🎉 All examples completed successfully!');
        console.log('\n💡 Key insights from this session:');
        console.log(`   • Average success rate: ${((contentResult.successRate + syncResult.successRate) / 2 * 100).toFixed(1)}%`);
        console.log(`   • Average execution time: ${((contentResult.executionTime + syncResult.executionTime) / 2).toFixed(0)}ms`);
        console.log(`   • Memory patterns found: ${memoryPatterns.length}`);
        console.log(`   • Bundle optimization savings: ${bundleResult.predictedSavings.timeReduction}%`);

    } catch (error) {
        console.error('❌ Example failed:', error.message);
    } finally {
        client.disconnect();
    }
}

// Utility function for batch workflow execution
async function executeBatchWorkflows(client, workflows) {
    const results = [];

    for (const workflow of workflows) {
        try {
            const result = await client.executeWorkflow(
                workflow.type,
                workflow.context,
                workflow.requirements
            );
            results.push(result);
        } catch (error) {
            console.error(`❌ Workflow ${workflow.type} failed:`, error.message);
        }
    }

    return results;
}

// Performance benchmarking function
async function benchmarkWorkflows(client, iterations = 5) {
    console.log(`\n📊 Benchmarking ${iterations} workflow executions...\n`);

    const workflows = [];
    for (let i = 0; i < iterations; i++) {
        workflows.push({
            type: 'benchmark_test',
            context: { iteration: i, timestamp: Date.now() },
            requirements: { operation: 'performance_test' }
        });
    }

    const startTime = Date.now();
    const results = await executeBatchWorkflows(client, workflows);
    const totalTime = Date.now() - startTime;

    const successfulResults = results.filter(r => r && r.success);
    const avgExecutionTime = successfulResults.reduce((sum, r) => sum + r.executionTime, 0) / successfulResults.length;
    const avgSuccessRate = successfulResults.reduce((sum, r) => sum + r.successRate, 0) / successfulResults.length;

    console.log('\n📈 Benchmark Results:');
    console.log(`   Total time: ${totalTime}ms`);
    console.log(`   Successful executions: ${successfulResults.length}/${iterations}`);
    console.log(`   Average execution time: ${avgExecutionTime.toFixed(0)}ms`);
    console.log(`   Average success rate: ${(avgSuccessRate * 100).toFixed(1)}%`);
    console.log(`   Throughput: ${(iterations / (totalTime / 1000)).toFixed(2)} workflows/second`);

    return {
        totalTime,
        successfulExecutions: successfulResults.length,
        avgExecutionTime,
        avgSuccessRate,
        throughput: iterations / (totalTime / 1000)
    };
}

// Run examples if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const command = process.argv[2];

    switch (command) {
        case 'benchmark':
            const client = new MCPWorkflowClient();
            client.connect()
                .then(() => benchmarkWorkflows(client, parseInt(process.argv[3]) || 5))
                .then(() => client.disconnect())
                .catch(console.error);
            break;

        case 'batch':
            const batchClient = new MCPWorkflowClient();
            const batchWorkflows = [
                {
                    type: 'content_generation',
                    context: { domain: 'marketing' },
                    requirements: { output: 'social_post' }
                },
                {
                    type: 'data_sync',
                    context: { domain: 'user_data' },
                    requirements: { syncMode: 'full' }
                },
                {
                    type: 'analytics',
                    context: { domain: 'performance' },
                    requirements: { timeRange: '24h' }
                }
            ];

            batchClient.connect()
                .then(() => executeBatchWorkflows(batchClient, batchWorkflows))
                .then(() => batchClient.disconnect())
                .catch(console.error);
            break;

        default:
            exampleUsage().catch(console.error);
            break;
    }
}

export default MCPWorkflowClient;
