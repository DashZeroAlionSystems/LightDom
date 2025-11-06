#!/usr/bin/env node

/**
 * Memory Workflow CodeMap - Development Task Manager
 * Use the memory workflow system to manage and execute parallel development tasks
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DevelopmentTaskManager {
    constructor() {
        this.tasks = new Map();
        this.activeTasks = new Map();
        this.memoryWorkflow = null;
        this.isInitialized = false;
    }

    async initialize() {
        console.log('🧠 Initializing Memory Workflow Development Task Manager...');

        // Start Memory Workflow CodeMap server
        await this.startMemoryWorkflowServer();

        // Wait for server to be ready
        await this.waitForServer(5000);

        // Initialize memory with development tasks
        await this.initializeDevelopmentTasks();

        this.isInitialized = true;
        console.log('✅ Development Task Manager ready with Memory Workflow integration');
    }

    async startMemoryWorkflowServer() {
        console.log('🚀 Starting Memory Workflow CodeMap server...');

        // For now, we'll simulate the server. In real usage, this would start the Docker container
        console.log('📝 Note: Run "npm run docker:start" in another terminal to start the full system');
        console.log('🔧 Using simulated memory workflow for development tasks');

        // Initialize simulated memory workflow
        this.memoryWorkflow = {
            executeWorkflow: async (params) => {
                console.log(`🔄 Executing workflow: ${params.workflowType}`);
                return await this.simulateWorkflowExecution(params);
            },
            queryMemory: async (query) => {
                return await this.simulateMemoryQuery(query);
            },
            storeResult: async (taskId, result) => {
                console.log(`💾 Storing result for task: ${taskId}`);
                // In real implementation, this would store in the memory workflow system
            }
        };
    }

    async waitForServer(timeout) {
        // Simulate waiting for server
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ Memory Workflow server ready');
    }

    async initializeDevelopmentTasks() {
        console.log('📋 Initializing development task templates...');

        // Define development task templates
        this.taskTemplates = {
            build_frontend: {
                name: "Build Frontend",
                type: "build",
                command: "npm run build",
                dependencies: [],
                estimatedTime: 120,
                resources: { cpu: 2, memory: 1024 }
            },
            run_tests: {
                name: "Run Test Suite",
                type: "test",
                command: "npm run test",
                dependencies: ["build_frontend"],
                estimatedTime: 180,
                resources: { cpu: 1, memory: 512 }
            },
            lint_code: {
                name: "Lint Codebase",
                type: "quality",
                command: "npm run lint",
                dependencies: [],
                estimatedTime: 45,
                resources: { cpu: 1, memory: 256 }
            },
            start_dev_server: {
                name: "Start Dev Server",
                type: "development",
                command: "npm run dev",
                dependencies: ["build_frontend"],
                estimatedTime: 300, // Long-running
                resources: { cpu: 1, memory: 512 }
            },
            docker_build: {
                name: "Build Docker Images",
                type: "deployment",
                command: "npm run docker:build",
                dependencies: ["run_tests"],
                estimatedTime: 240,
                resources: { cpu: 2, memory: 2048 }
            },
            deploy_staging: {
                name: "Deploy to Staging",
                type: "deployment",
                command: "npm run deploy:staging",
                dependencies: ["docker_build", "run_tests"],
                estimatedTime: 180,
                resources: { cpu: 1, memory: 256 }
            }
        };

        console.log(`📝 Loaded ${Object.keys(this.taskTemplates).length} task templates`);
    }

    async executeParallelTasks(taskIds, options = {}) {
        console.log(`\n🔄 Starting parallel execution of ${taskIds.length} tasks:`);
        taskIds.forEach(id => console.log(`   • ${id}`));

        // Analyze dependencies and create execution plan
        const executionPlan = await this.analyzeDependencies(taskIds);

        console.log('\n📊 Execution Plan:');
        executionPlan.forEach((phase, index) => {
            console.log(`   Phase ${index + 1}: ${phase.map(t => t.id).join(', ')}`);
        });

        // Execute tasks in phases
        const results = [];
        for (let phase = 0; phase < executionPlan.length; phase++) {
            console.log(`\n🚀 Executing Phase ${phase + 1}/${executionPlan.length}`);

            const phaseTasks = executionPlan[phase];
            const phaseResults = await this.executePhaseTasks(phaseTasks, options);

            results.push(...phaseResults);

            // Check for failures that should stop execution
            const failures = phaseResults.filter(r => !r.success);
            if (failures.length > 0 && !options.continueOnFailure) {
                console.log('❌ Phase failed, stopping execution');
                break;
            }
        }

        // Generate summary
        await this.generateExecutionSummary(results);

        return results;
    }

    async analyzeDependencies(taskIds) {
        const taskConfigs = taskIds.map(id => ({
            id,
            ...this.taskTemplates[id]
        }));

        // Simple topological sort for dependencies
        const phases = [];
        const processed = new Set();
        const processing = new Set();

        const getPhase = (taskId) => {
            if (processed.has(taskId)) return;
            if (processing.has(taskId)) {
                throw new Error(`Circular dependency detected: ${taskId}`);
            }

            processing.add(taskId);
            const task = taskConfigs.find(t => t.id === taskId);

            // Process dependencies first
            task.dependencies.forEach(dep => getPhase(dep));

            processing.delete(taskId);

            // Find appropriate phase
            let phaseIndex = 0;
            for (let i = 0; i < phases.length; i++) {
                const canAddToPhase = phases[i].every(existingTask =>
                    !task.dependencies.includes(existingTask.id) &&
                    !existingTask.dependencies.includes(task.id)
                );
                if (canAddToPhase) {
                    phaseIndex = i;
                    break;
                } else {
                    phaseIndex = i + 1;
                }
            }

            if (!phases[phaseIndex]) {
                phases[phaseIndex] = [];
            }
            phases[phaseIndex].push(task);
            processed.add(taskId);
        };

        taskIds.forEach(taskId => getPhase(taskId));

        return phases;
    }

    async executePhaseTasks(phaseTasks, options) {
        const promises = phaseTasks.map(task => this.executeTask(task, options));
        return await Promise.all(promises);
    }

    async executeTask(task, options) {
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = Date.now();

        console.log(`   📋 Starting: ${task.name} (${taskId})`);

        // Check with memory workflow for optimization suggestions
        const memorySuggestion = await this.getMemoryOptimization(task);

        if (memorySuggestion.shouldOptimize) {
            console.log(`   💡 Memory suggestion: ${memorySuggestion.reason}`);
        }

        // Simulate task execution (in real implementation, this would run the actual command)
        const result = await this.simulateTaskExecution(task, memorySuggestion);

        const executionTime = Date.now() - startTime;
        const success = result.exitCode === 0;

        console.log(`   ${success ? '✅' : '❌'} Completed: ${task.name} (${executionTime}ms)`);

        // Store result in memory workflow
        await this.memoryWorkflow.storeResult(taskId, {
            taskId,
            task: task.id,
            success,
            executionTime,
            result: result.output,
            timestamp: new Date().toISOString()
        });

        return {
            taskId,
            task: task.id,
            success,
            executionTime,
            output: result.output,
            memoryOptimization: memorySuggestion
        };
    }

    async getMemoryOptimization(task) {
        // Query memory workflow for optimization suggestions
        const memoryResults = await this.memoryWorkflow.queryMemory(task.id);

        if (memoryResults.length > 0) {
            const recentResults = memoryResults.slice(0, 5);
            const avgSuccessRate = recentResults.reduce((sum, r) => sum + (r.result?.success ? 1 : 0), 0) / recentResults.length;
            const avgExecutionTime = recentResults.reduce((sum, r) => sum + (r.result?.executionTime || 0), 0) / recentResults.length;

            if (avgSuccessRate > 0.8) {
                return {
                    shouldOptimize: true,
                    reason: `High success rate (${(avgSuccessRate * 100).toFixed(1)}%) from ${recentResults.length} executions`,
                    predictedTime: avgExecutionTime,
                    confidence: avgSuccessRate
                };
            }
        }

        return {
            shouldOptimize: false,
            reason: "No optimization data available",
            predictedTime: task.estimatedTime,
            confidence: 0.5
        };
    }

    async simulateTaskExecution(task, memorySuggestion) {
        // Simulate different task execution times and outcomes
        const baseTime = task.estimatedTime;

        // Apply memory optimization
        const optimizedTime = memorySuggestion.shouldOptimize ?
            baseTime * 0.8 : baseTime; // 20% improvement with memory

        // Simulate execution
        await new Promise(resolve => setTimeout(resolve, Math.min(optimizedTime, 2000))); // Cap at 2s for demo

        // Simulate occasional failures
        const exitCode = Math.random() > 0.85 ? 1 : 0; // 15% failure rate
        const output = exitCode === 0 ?
            `Task ${task.name} completed successfully` :
            `Task ${task.name} failed with error code ${exitCode}`;

        return { exitCode, output };
    }

    async generateExecutionSummary(results) {
        console.log('\n📊 Execution Summary:');
        console.log('='.repeat(50));

        const totalTasks = results.length;
        const successfulTasks = results.filter(r => r.success).length;
        const failedTasks = totalTasks - successfulTasks;
        const totalTime = results.reduce((sum, r) => sum + r.executionTime, 0);
        const avgTime = totalTime / totalTasks;

        console.log(`Total Tasks: ${totalTasks}`);
        console.log(`Successful: ${successfulTasks}`);
        console.log(`Failed: ${failedTasks}`);
        console.log(`Total Time: ${totalTime}ms`);
        console.log(`Average Time: ${avgTime.toFixed(0)}ms`);

        // Memory optimizations summary
        const optimizedTasks = results.filter(r => r.memoryOptimization?.shouldOptimize).length;
        if (optimizedTasks > 0) {
            console.log(`Memory Optimized: ${optimizedTasks} tasks`);
            const avgOptimization = results
                .filter(r => r.memoryOptimization?.shouldOptimize)
                .reduce((sum, r) => sum + r.memoryOptimization.confidence, 0) / optimizedTasks;
            console.log(`Average Optimization Confidence: ${(avgOptimization * 100).toFixed(1)}%`);
        }

        // Performance analysis
        if (successfulTasks > 0) {
            const successRate = (successfulTasks / totalTasks) * 100;
            console.log(`Success Rate: ${successRate.toFixed(1)}%`);

            if (successRate > 80) {
                console.log('🎉 Excellent performance! Tasks executed successfully.');
            } else if (successRate > 60) {
                console.log('👍 Good performance with some failures to address.');
            } else {
                console.log('⚠️ Performance needs improvement. Check task configurations.');
            }
        }

        // Store summary in memory workflow
        await this.memoryWorkflow.storeResult('execution_summary', {
            summary: {
                totalTasks,
                successfulTasks,
                failedTasks,
                totalTime,
                avgTime,
                optimizedTasks,
                timestamp: new Date().toISOString()
            }
        });
    }

    async simulateWorkflowExecution(params) {
        // Simulate workflow execution for memory workflow integration
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            workflowId: `wf_${Date.now()}`,
            executionTime: Math.floor(Math.random() * 2000) + 500,
            successRate: Math.random() * 0.3 + 0.7, // 70-100% success rate
            status: 'completed'
        };
    }

    async simulateMemoryQuery(query) {
        // Simulate memory query results
        const mockResults = [
            {
                workflowType: query,
                result: {
                    success: Math.random() > 0.2,
                    executionTime: Math.floor(Math.random() * 2000) + 500
                },
                timestamp: new Date().toISOString()
            }
        ];

        return mockResults;
    }

    // Public API methods
    async runDevelopmentWorkflow(workflowName) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        const workflows = {
            full_build: ['lint_code', 'build_frontend', 'run_tests'],
            quick_test: ['lint_code', 'run_tests'],
            deployment: ['lint_code', 'run_tests', 'docker_build', 'deploy_staging'],
            development: ['lint_code', 'start_dev_server']
        };

        const taskIds = workflows[workflowName];
        if (!taskIds) {
            throw new Error(`Unknown workflow: ${workflowName}. Available: ${Object.keys(workflows).join(', ')}`);
        }

        return await this.executeParallelTasks(taskIds, { continueOnFailure: workflowName === 'full_build' });
    }

    async runCustomTasks(taskIds, options = {}) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        // Validate task IDs
        const invalidTasks = taskIds.filter(id => !this.taskTemplates[id]);
        if (invalidTasks.length > 0) {
            throw new Error(`Unknown tasks: ${invalidTasks.join(', ')}`);
        }

        return await this.executeParallelTasks(taskIds, options);
    }

    getAvailableTasks() {
        return Object.entries(this.taskTemplates).map(([id, config]) => ({
            id,
            name: config.name,
            type: config.type,
            dependencies: config.dependencies,
            estimatedTime: config.estimatedTime
        }));
    }

    getAvailableWorkflows() {
        return {
            full_build: {
                name: "Full Build Pipeline",
                tasks: ['lint_code', 'build_frontend', 'run_tests'],
                description: "Complete build and test pipeline"
            },
            quick_test: {
                name: "Quick Test Suite",
                tasks: ['lint_code', 'run_tests'],
                description: "Fast quality checks"
            },
            deployment: {
                name: "Deployment Pipeline",
                tasks: ['lint_code', 'run_tests', 'docker_build', 'deploy_staging'],
                description: "Full deployment pipeline"
            },
            development: {
                name: "Development Setup",
                tasks: ['lint_code', 'start_dev_server'],
                description: "Start development environment"
            }
        };
    }
}

// CLI Interface
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Memory Workflow Development Task Manager
========================================

Manage and execute parallel development tasks using memory-driven workflow orchestration.

WORKFLOWS:
  full_build      Complete build and test pipeline (lint, build, test)
  quick_test      Fast quality checks (lint, test)
  deployment      Full deployment pipeline (lint, test, build, deploy)
  development     Start development environment (lint, dev server)

CUSTOM TASKS:
  lint_code       Run code linting
  build_frontend  Build frontend assets
  run_tests       Execute test suite
  start_dev_server Start development server
  docker_build    Build Docker images
  deploy_staging  Deploy to staging environment

USAGE:
  node dev-task-manager.js workflow <name>          # Run predefined workflow
  node dev-task-manager.js tasks <task1> <task2>     # Run custom tasks
  node dev-task-manager.js list                      # List available tasks/workflows
  node dev-task-manager.js --help                    # Show this help

EXAMPLES:
  node dev-task-manager.js workflow full_build
  node dev-task-manager.js tasks lint_code run_tests
  node dev-task-manager.js workflow development

MEMORY INTEGRATION:
- Tasks are analyzed for dependencies and optimal execution order
- Memory patterns improve success rates and execution times
- Results are stored for continuous learning and optimization
- Parallel execution maximizes efficiency

Note: Run "npm run docker:start" first to enable full memory workflow capabilities.
`);
    process.exit(0);
}

async function main() {
    const taskManager = new DevelopmentTaskManager();

    try {
        if (args[0] === 'workflow' && args[1]) {
            const results = await taskManager.runDevelopmentWorkflow(args[1]);
            console.log('\n🎉 Workflow completed!');

            // Summary
            const successCount = results.filter(r => r.success).length;
            console.log(`✅ ${successCount}/${results.length} tasks successful`);

        } else if (args[0] === 'tasks' && args.length > 1) {
            const taskIds = args.slice(1);
            const results = await taskManager.runCustomTasks(taskIds);
            console.log('\n🎉 Custom tasks completed!');

            const successCount = results.filter(r => r.success).length;
            console.log(`✅ ${successCount}/${results.length} tasks successful`);

        } else if (args[0] === 'list') {
            console.log('\n📋 Available Tasks:');
            const tasks = taskManager.getAvailableTasks();
            tasks.forEach(task => {
                console.log(`  ${task.id.padEnd(15)} ${task.name} (${task.estimatedTime}ms)`);
            });

            console.log('\n🚀 Available Workflows:');
            const workflows = taskManager.getAvailableWorkflows();
            Object.entries(workflows).forEach(([id, config]) => {
                console.log(`  ${id.padEnd(15)} ${config.name}`);
                console.log(`                    ${config.description}`);
                console.log(`                    Tasks: ${config.tasks.join(', ')}\n`);
            });

        } else {
            console.log('❌ Invalid command. Use --help for usage information.');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run CLI if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default DevelopmentTaskManager;
