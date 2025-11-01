#!/usr/bin/env node

/**
 * Memory Workflow MCP Server Tests
 * Validates core functionality and performance metrics
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WorkflowTests {
    constructor() {
        this.serverProcess = null;
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            duration: 0
        };
    }

    async runTests() {
        console.log('🧪 Memory Workflow MCP Server Tests');
        console.log('=====================================\n');

        const startTime = Date.now();

        try {
            // Test 1: Server startup
            await this.testServerStartup();

            // Test 2: Basic workflow execution
            await this.testBasicWorkflow();

            // Test 3: Memory storage and retrieval
            await this.testMemoryOperations();

            // Test 4: Bundle optimization
            await this.testBundleOptimization();

            // Test 5: Performance metrics
            await this.testPerformanceMetrics();

            // Test 6: Error handling
            await this.testErrorHandling();

        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
            this.recordFailure('Test Suite Failure', error.message);
        } finally {
            await this.stopServer();
        }

        this.testResults.duration = Date.now() - startTime;
        this.printResults();
    }

    async testServerStartup() {
        console.log('Test 1: Server Startup');
        console.log('-'.repeat(25));

        try {
            await this.startServer();
            await this.waitForServerReady(5000);
            this.recordSuccess('Server Startup');
        } catch (error) {
            this.recordFailure('Server Startup', error.message);
        }
    }

    async testBasicWorkflow() {
        console.log('\nTest 2: Basic Workflow Execution');
        console.log('-'.repeat(35));

        const testWorkflow = {
            jsonrpc: "2.0",
            id: 100,
            method: "workflow/execute",
            params: {
                workflowType: "test_workflow",
                context: {
                    domain: "testing",
                    user: "test_user"
                },
                requirements: {
                    operation: "basic_test",
                    expectedResult: "success"
                }
            }
        };

        try {
            const result = await this.sendRequest(testWorkflow);

            if (result.success && result.workflowId && result.executionTime > 0) {
                this.recordSuccess('Basic Workflow Execution');
                console.log(`   ✓ Workflow completed in ${result.executionTime}ms`);
                console.log(`   ✓ Success rate: ${(result.successRate * 100).toFixed(1)}%`);
            } else {
                this.recordFailure('Basic Workflow Execution', 'Invalid response structure');
            }
        } catch (error) {
            this.recordFailure('Basic Workflow Execution', error.message);
        }
    }

    async testMemoryOperations() {
        console.log('\nTest 3: Memory Operations');
        console.log('-'.repeat(25));

        try {
            // Test memory query
            const queryRequest = {
                jsonrpc: "2.0",
                id: 101,
                method: "memory/query",
                params: {
                    query: "test_workflow",
                    limit: 5
                }
            };

            const queryResult = await this.sendRequest(queryRequest);

            if (queryResult.results && Array.isArray(queryResult.results)) {
                this.recordSuccess('Memory Query');
                console.log(`   ✓ Found ${queryResult.results.length} memory entries`);

                // Verify memory persistence
                const memoryPath = path.join(__dirname, 'memory-store.json');
                const memoryData = await fs.readFile(memoryPath, 'utf8');
                const memoryStore = JSON.parse(memoryData);

                if (Object.keys(memoryStore).length > 0) {
                    this.recordSuccess('Memory Persistence');
                    console.log(`   ✓ Memory store contains ${Object.keys(memoryStore).length} entries`);
                } else {
                    this.recordFailure('Memory Persistence', 'Memory store is empty');
                }
            } else {
                this.recordFailure('Memory Query', 'Invalid query response');
            }
        } catch (error) {
            this.recordFailure('Memory Operations', error.message);
        }
    }

    async testBundleOptimization() {
        console.log('\nTest 4: Bundle Optimization');
        console.log('-'.repeat(27));

        const optimizeRequest = {
            jsonrpc: "2.0",
            id: 102,
            method: "bundle/optimize",
            params: {
                bundleConfig: {
                    endpoints: ["/api/test/1", "/api/test/2", "/api/test/3"],
                    strategy: "parallel"
                },
                historicalData: {
                    avgResponseTime: 1500,
                    successRate: 0.82,
                    errorPatterns: ["timeout"]
                }
            }
        };

        try {
            const result = await this.sendRequest(optimizeRequest);

            if (result.optimizedConfig && result.predictedSavings) {
                this.recordSuccess('Bundle Optimization');
                console.log(`   ✓ Optimization suggestions: ${result.improvements?.join(', ') || 'none'}`);
                console.log(`   ✓ Predicted time reduction: ${result.predictedSavings?.timeReduction || 0}%`);
            } else {
                this.recordFailure('Bundle Optimization', 'Invalid optimization response');
            }
        } catch (error) {
            this.recordFailure('Bundle Optimization', error.message);
        }
    }

    async testPerformanceMetrics() {
        console.log('\nTest 5: Performance Metrics');
        console.log('-'.repeat(27));

        try {
            // Run multiple workflows to generate performance data
            const workflows = [];
            for (let i = 0; i < 3; i++) {
                workflows.push({
                    jsonrpc: "2.0",
                    id: 200 + i,
                    method: "workflow/execute",
                    params: {
                        workflowType: "performance_test",
                        context: { domain: "metrics", iteration: i },
                        requirements: { operation: "performance_check" }
                    }
                });
            }

            const results = [];
            for (const workflow of workflows) {
                try {
                    const result = await this.sendRequest(workflow);
                    results.push(result);
                } catch (error) {
                    console.log(`   ⚠️  Workflow ${workflow.id} failed: ${error.message}`);
                }
            }

            if (results.length > 0) {
                const avgExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
                const avgSuccessRate = results.reduce((sum, r) => sum + r.successRate, 0) / results.length;

                this.recordSuccess('Performance Metrics');
                console.log(`   ✓ Average execution time: ${avgExecutionTime.toFixed(0)}ms`);
                console.log(`   ✓ Average success rate: ${(avgSuccessRate * 100).toFixed(1)}%`);

                // Validate against expected performance
                if (avgExecutionTime < 2000 && avgSuccessRate > 0.8) {
                    this.recordSuccess('Performance Validation');
                    console.log('   ✓ Performance meets expectations');
                } else {
                    this.recordFailure('Performance Validation', 'Performance below expectations');
                }
            } else {
                this.recordFailure('Performance Metrics', 'No successful workflows');
            }
        } catch (error) {
            this.recordFailure('Performance Metrics', error.message);
        }
    }

    async testErrorHandling() {
        console.log('\nTest 6: Error Handling');
        console.log('-'.repeat(20));

        const errorWorkflow = {
            jsonrpc: "2.0",
            id: 103,
            method: "workflow/execute",
            params: {
                workflowType: "error_test",
                context: { domain: "testing", triggerError: true },
                requirements: { operation: "error_simulation" }
            }
        };

        try {
            const result = await this.sendRequest(errorWorkflow, 10000); // Longer timeout for error recovery

            if (result.success === false || result.error) {
                // This might be expected - check if error was handled gracefully
                this.recordSuccess('Error Handling');
                console.log('   ✓ Error handled gracefully');
            } else if (result.success && result.recoveryApplied) {
                this.recordSuccess('Error Recovery');
                console.log('   ✓ Error recovery mechanism worked');
            } else {
                this.recordFailure('Error Handling', 'Unexpected error response');
            }
        } catch (error) {
            // Request timeout or connection error
            this.recordFailure('Error Handling', `Request failed: ${error.message}`);
        }
    }

    async startServer() {
        return new Promise((resolve, reject) => {
            this.serverProcess = spawn('node', ['memory-workflow-mcp-server.js'], {
                stdio: ['pipe', 'pipe', 'pipe'],
                cwd: __dirname
            });

            this.serverProcess.stdout.on('data', (data) => {
                if (data.toString().includes('Memory Workflow MCP Server initialized')) {
                    resolve();
                }
            });

            this.serverProcess.stderr.on('data', (data) => {
                console.error('Server stderr:', data.toString().trim());
            });

            setTimeout(() => reject(new Error('Server startup timeout')), 10000);
        });
    }

    async waitForServerReady(delay) {
        await this.wait(delay);
    }

    async sendRequest(request, timeout = 8000) {
        return new Promise((resolve, reject) => {
            const requestJson = JSON.stringify(request) + '\n';
            let responseReceived = false;

            const responseHandler = (data) => {
                const response = data.toString().trim();

                try {
                    const parsed = JSON.parse(response);
                    if (parsed.id === request.id) {
                        responseReceived = true;
                        this.serverProcess.stdout.off('data', responseHandler);

                        if (parsed.result) {
                            resolve(parsed.result);
                        } else if (parsed.error) {
                            reject(new Error(parsed.error.message));
                        } else {
                            reject(new Error('Invalid response format'));
                        }
                    }
                } catch (error) {
                    // Not a complete JSON response, continue listening
                }
            };

            this.serverProcess.stdout.on('data', responseHandler);
            this.serverProcess.stdin.write(requestJson);

            setTimeout(() => {
                if (!responseReceived) {
                    this.serverProcess.stdout.off('data', responseHandler);
                    reject(new Error(`Request timeout after ${timeout}ms`));
                }
            }, timeout);
        });
    }

    async stopServer() {
        if (this.serverProcess) {
            this.serverProcess.kill('SIGINT');
            await this.wait(1000);
        }
    }

    recordSuccess(testName) {
        this.testResults.passed++;
        this.testResults.total++;
        console.log(`   ✅ ${testName}: PASSED`);
    }

    recordFailure(testName, reason) {
        this.testResults.failed++;
        this.testResults.total++;
        console.log(`   ❌ ${testName}: FAILED - ${reason}`);
    }

    printResults() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 Test Results Summary');
        console.log('='.repeat(50));
        console.log(`Total Tests: ${this.testResults.total}`);
        console.log(`Passed: ${this.testResults.passed}`);
        console.log(`Failed: ${this.testResults.failed}`);
        console.log(`Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
        console.log(`Duration: ${this.testResults.duration}ms`);

        if (this.testResults.failed === 0) {
            console.log('\n🎉 All tests passed! The Memory Workflow MCP Server is working correctly.');
        } else {
            console.log(`\n⚠️  ${this.testResults.failed} test(s) failed. Check the output above for details.`);
        }

        console.log('\n💡 Next steps:');
        console.log('   • Run the demo: node demo-workflow.js');
        console.log('   • Start the server: node memory-workflow-mcp-server.js');
        console.log('   • Check documentation: README-MCP.md');
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tests = new WorkflowTests();
    tests.runTests().catch(console.error);
}

export default WorkflowTests;
