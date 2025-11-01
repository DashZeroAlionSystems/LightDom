#!/usr/bin/env node

/**
 * Memory Workflow MCP Server Demo
 * Demonstrates workflow execution with memory-driven optimizations
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';

class WorkflowDemo {
    constructor() {
        this.serverProcess = null;
        this.demoWorkflows = [
            {
                name: "Content Generation",
                request: {
                    jsonrpc: "2.0",
                    id: 1,
                    method: "workflow/execute",
                    params: {
                        workflowType: "content_generation",
                        context: {
                            domain: "marketing",
                            user: "demo_user",
                            preferences: {
                                tone: "professional",
                                length: "medium"
                            }
                        },
                        requirements: {
                            output: "blog_post",
                            topic: "AI-powered workflow optimization",
                            audience: "technical_decision_makers"
                        }
                    }
                }
            },
            {
                name: "Data Synchronization",
                request: {
                    jsonrpc: "2.0",
                    id: 2,
                    method: "workflow/execute",
                    params: {
                        workflowType: "data_sync",
                        context: {
                            domain: "user_management",
                            source: "legacy_system",
                            target: "new_platform"
                        },
                        requirements: {
                            dataTypes: ["user_profiles", "preferences", "history"],
                            syncMode: "incremental",
                            conflictResolution: "latest_wins"
                        }
                    }
                }
            },
            {
                name: "Analytics Processing",
                request: {
                    jsonrpc: "2.0",
                    id: 3,
                    method: "workflow/execute",
                    params: {
                        workflowType: "analytics",
                        context: {
                            domain: "performance_monitoring",
                            timeRange: "last_24h",
                            granularity: "hourly"
                        },
                        requirements: {
                            metrics: ["response_time", "error_rate", "throughput"],
                            alerting: true,
                            anomalyDetection: true
                        }
                    }
                }
            }
        ];
    }

    async runDemo() {
        console.log('🎭 Memory Workflow MCP Server Demo');
        console.log('=====================================\n');

        try {
            // Start the MCP server
            console.log('🚀 Starting MCP server...');
            await this.startServer();

            // Wait for server to initialize
            await this.waitForServer(3000);

            // Run demo workflows
            for (const workflow of this.demoWorkflows) {
                console.log(`\n📋 Executing: ${workflow.name} Workflow`);
                console.log('-'.repeat(50));

                await this.executeWorkflow(workflow.request);
                await this.wait(2000); // Wait between workflows
            }

            // Query memory patterns
            console.log('\n🧠 Querying Memory Patterns');
            console.log('-'.repeat(30));
            await this.queryMemory("content_generation");

            // Demonstrate bundle optimization
            console.log('\n🔧 Optimizing API Bundle');
            console.log('-'.repeat(25));
            await this.optimizeBundle();

        } catch (error) {
            console.error('❌ Demo failed:', error.message);
        } finally {
            await this.stopServer();
        }
    }

    async startServer() {
        return new Promise((resolve, reject) => {
            // Use npm to run the server (assumes package.json is configured)
            this.serverProcess = spawn('node', ['memory-workflow-mcp-server.js'], {
                stdio: ['pipe', 'pipe', 'pipe'],
                cwd: process.cwd()
            });

            let serverReady = false;

            this.serverProcess.stdout.on('data', (data) => {
                const output = data.toString();
                console.log('📄 Server:', output.trim());

                if (output.includes('Memory Workflow MCP Server initialized') && !serverReady) {
                    serverReady = true;
                    resolve();
                }
            });

            this.serverProcess.stderr.on('data', (data) => {
                console.error('❌ Server Error:', data.toString().trim());
            });

            this.serverProcess.on('close', (code) => {
                if (!serverReady) {
                    reject(new Error(`Server exited with code ${code}`));
                }
            });

            // Timeout after 30 seconds
            setTimeout(() => {
                if (!serverReady) {
                    reject(new Error('Server startup timeout'));
                }
            }, 30000);
        });
    }

    async waitForServer(delay) {
        console.log(`⏳ Waiting ${delay}ms for server initialization...`);
        await this.wait(delay);
    }

    async executeWorkflow(request) {
        return new Promise((resolve, reject) => {
            const requestJson = JSON.stringify(request) + '\n';

            console.log('📤 Sending request:', JSON.stringify(request, null, 2));

            let responseReceived = false;

            const responseHandler = (data) => {
                const response = data.toString().trim();
                console.log('📥 Response:', response);

                try {
                    const parsed = JSON.parse(response);
                    if (parsed.id === request.id) {
                        responseReceived = true;
                        this.displayWorkflowResults(parsed.result);
                        resolve();
                    }
                } catch (error) {
                    // Not a valid JSON response, continue listening
                }
            };

            this.serverProcess.stdout.on('data', responseHandler);

            // Send the request
            this.serverProcess.stdin.write(requestJson);

            // Timeout after 30 seconds
            setTimeout(() => {
                if (!responseReceived) {
                    this.serverProcess.stdout.off('data', responseHandler);
                    reject(new Error('Workflow execution timeout'));
                }
            }, 30000);
        });
    }

    displayWorkflowResults(result) {
        console.log('\n📊 Workflow Results:');
        console.log(`   Workflow ID: ${result.workflowId}`);
        console.log(`   Execution Time: ${result.executionTime}ms`);
        console.log(`   Success Rate: ${(result.successRate * 100).toFixed(1)}%`);
        console.log(`   Cost Savings: $${result.costSavings?.monetarySavings?.toFixed(2) || '0.00'}`);
        console.log(`   Optimizations: ${result.optimizations?.join(', ') || 'none'}`);
    }

    async queryMemory(query) {
        const request = {
            jsonrpc: "2.0",
            id: 4,
            method: "memory/query",
            params: {
                query: query,
                limit: 3
            }
        };

        return new Promise((resolve, reject) => {
            const requestJson = JSON.stringify(request) + '\n';
            let responseReceived = false;

            const responseHandler = (data) => {
                const response = data.toString().trim();

                try {
                    const parsed = JSON.parse(response);
                    if (parsed.id === request.id) {
                        responseReceived = true;
                        console.log(`Found ${parsed.result.results.length} memory patterns for "${query}"`);
                        parsed.result.results.forEach((result, index) => {
                            console.log(`   ${index + 1}. ${result.workflowType} - ${(result.result?.successRate * 100 || 0).toFixed(1)}% success`);
                        });
                        resolve();
                    }
                } catch (error) {
                    // Continue listening
                }
            };

            this.serverProcess.stdout.on('data', responseHandler);
            this.serverProcess.stdin.write(requestJson);

            setTimeout(() => {
                if (!responseReceived) {
                    this.serverProcess.stdout.off('data', responseHandler);
                    reject(new Error('Memory query timeout'));
                }
            }, 10000);
        });
    }

    async optimizeBundle() {
        const request = {
            jsonrpc: "2.0",
            id: 5,
            method: "bundle/optimize",
            params: {
                bundleConfig: {
                    endpoints: [
                        "/api/auth/login",
                        "/api/auth/verify",
                        "/api/content/generate",
                        "/api/content/optimize",
                        "/api/analytics/track"
                    ],
                    strategy: "parallel"
                },
                historicalData: {
                    avgResponseTime: 2100,
                    successRate: 0.78,
                    errorPatterns: ["timeout", "rate_limit"]
                }
            }
        };

        return new Promise((resolve, reject) => {
            const requestJson = JSON.stringify(request) + '\n';
            let responseReceived = false;

            const responseHandler = (data) => {
                const response = data.toString().trim();

                try {
                    const parsed = JSON.parse(response);
                    if (parsed.id === request.id) {
                        responseReceived = true;
                        const result = parsed.result;
                        console.log('Bundle optimization complete:');
                        console.log(`   Consolidated bundles: ${result.optimizedConfig.consolidatedBundles}`);
                        console.log(`   Parallel groups: ${result.optimizedConfig.parallelGroups}`);
                        console.log(`   Time reduction: ${result.predictedSavings.timeReduction}%`);
                        console.log(`   Cost reduction: ${result.predictedSavings.costReduction}%`);
                        resolve();
                    }
                } catch (error) {
                    // Continue listening
                }
            };

            this.serverProcess.stdout.on('data', responseHandler);
            this.serverProcess.stdin.write(requestJson);

            setTimeout(() => {
                if (!responseReceived) {
                    this.serverProcess.stdout.off('data', responseHandler);
                    reject(new Error('Bundle optimization timeout'));
                }
            }, 15000);
        });
    }

    async stopServer() {
        console.log('\n🛑 Stopping demo and server...');

        if (this.serverProcess) {
            this.serverProcess.kill('SIGINT');

            // Wait for clean shutdown
            await this.wait(2000);
        }
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Run the demo if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const demo = new WorkflowDemo();
    demo.runDemo().catch(console.error);
}

export default WorkflowDemo;
