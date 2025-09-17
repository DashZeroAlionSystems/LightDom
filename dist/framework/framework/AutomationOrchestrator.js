"use strict";
/**
 * Automation Orchestrator
 * Coordinates between Cursor API and n8n for comprehensive app management
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.automationOrchestrator = exports.AutomationOrchestrator = void 0;
var events_1 = require("events");
var CursorAPIIntegration_1 = require("./CursorAPIIntegration");
var N8NWorkflowManager_1 = require("./N8NWorkflowManager");
var LightDomFramework_1 = require("./LightDomFramework");
var AutomationOrchestrator = /** @class */ (function (_super) {
    __extends(AutomationOrchestrator, _super);
    function AutomationOrchestrator(config) {
        var _this = _super.call(this) || this;
        _this.events = new Map();
        _this.isRunning = false;
        _this.monitoringInterval = null;
        _this.startTime = 0;
        _this.config = __assign({ enableCursorAPI: true, enableN8N: true, enableLightDomIntegration: true, monitoringInterval: 30000, alertThresholds: {
                cpuUsage: 80,
                memoryUsage: 85,
                diskUsage: 90,
                errorRate: 10,
                responseTime: 5000,
                storageUtilization: 80,
                miningSuccessRate: 70
            }, automationRules: [] }, config);
        _this.setupEventHandlers();
        return _this;
    }
    /**
     * Initialize the automation orchestrator
     */
    AutomationOrchestrator.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🎭 Initializing Automation Orchestrator...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        this.startTime = Date.now();
                        if (!this.config.enableCursorAPI) return [3 /*break*/, 3];
                        return [4 /*yield*/, CursorAPIIntegration_1.cursorAPIIntegration.initialize()];
                    case 2:
                        _a.sent();
                        console.log('✅ Cursor API integration initialized');
                        _a.label = 3;
                    case 3:
                        if (!this.config.enableN8N) return [3 /*break*/, 5];
                        return [4 /*yield*/, N8NWorkflowManager_1.n8nWorkflowManager.initialize()];
                    case 4:
                        _a.sent();
                        console.log('✅ N8N workflow manager initialized');
                        _a.label = 5;
                    case 5: 
                    // Deploy default workflows
                    return [4 /*yield*/, this.deployDefaultWorkflows()];
                    case 6:
                        // Deploy default workflows
                        _a.sent();
                        // Start monitoring
                        this.startMonitoring();
                        this.isRunning = true;
                        this.emit('initialized');
                        console.log('✅ Automation Orchestrator initialized successfully');
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _a.sent();
                        console.error('❌ Failed to initialize Automation Orchestrator:', error_1);
                        throw error_1;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Deploy default workflows
     */
    AutomationOrchestrator.prototype.deployDefaultWorkflows = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🚀 Deploying default automation workflows...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        if (!this.config.enableCursorAPI) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.deployCursorWorkflows()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!this.config.enableN8N) return [3 /*break*/, 5];
                        return [4 /*yield*/, N8NWorkflowManager_1.n8nWorkflowManager.deployAllLightDomWorkflows()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        console.log('✅ Default workflows deployed successfully');
                        return [3 /*break*/, 7];
                    case 6:
                        error_2 = _a.sent();
                        console.error('❌ Failed to deploy default workflows:', error_2);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Deploy Cursor API workflows
     */
    AutomationOrchestrator.prototype.deployCursorWorkflows = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Performance monitoring workflow
                    return [4 /*yield*/, CursorAPIIntegration_1.cursorAPIIntegration.createWorkflow({
                            name: 'LightDom Performance Monitor',
                            description: 'Monitors LightDom performance and triggers optimizations',
                            trigger: {
                                type: 'schedule',
                                config: { interval: 300000 }, // 5 minutes
                                enabled: true
                            },
                            status: 'active',
                            actions: [
                                {
                                    id: 'check_performance',
                                    type: 'code_execution',
                                    name: 'Check Performance Metrics',
                                    config: {
                                        language: 'javascript',
                                        code: "\n              const status = lightDomFramework.getStatus();\n              const performance = status.performance;\n              \n              if (performance.averageProcessingTime > 5000) {\n                console.log('High processing time detected, triggering optimization');\n                await lightDomFramework.optimizePerformance();\n              }\n              \n              if (performance.errorRate > 10) {\n                console.log('High error rate detected, triggering error handling');\n                await lightDomFramework.handleHighErrorRate();\n              }\n            "
                                    },
                                    enabled: true,
                                    order: 1
                                }
                            ]
                        })];
                    case 1:
                        // Performance monitoring workflow
                        _a.sent();
                        // Storage optimization workflow
                        return [4 /*yield*/, CursorAPIIntegration_1.cursorAPIIntegration.createWorkflow({
                                name: 'LightDom Storage Optimizer',
                                description: 'Automatically optimizes storage usage',
                                trigger: {
                                    type: 'schedule',
                                    config: { interval: 600000 }, // 10 minutes
                                    enabled: true
                                },
                                status: 'active',
                                actions: [
                                    {
                                        id: 'check_storage',
                                        type: 'code_execution',
                                        name: 'Check Storage Usage',
                                        config: {
                                            language: 'javascript',
                                            code: "\n              const metrics = lightDomFramework.getStorageMetrics();\n              \n              if (metrics.utilizationRate > 80) {\n                console.log('High storage utilization detected, triggering cleanup');\n                const nodes = lightDomFramework.getStorageNodes();\n                \n                for (const node of nodes) {\n                  if (node.used / node.capacity > 0.8) {\n                    await lightDomFramework.optimizeStorageNode(node.id);\n                  }\n                }\n              }\n            "
                                        },
                                        enabled: true,
                                        order: 1
                                    }
                                ]
                            })];
                    case 2:
                        // Storage optimization workflow
                        _a.sent();
                        // Mining automation workflow
                        return [4 /*yield*/, CursorAPIIntegration_1.cursorAPIIntegration.createWorkflow({
                                name: 'LightDom Mining Automation',
                                description: 'Automates web address mining process',
                                trigger: {
                                    type: 'schedule',
                                    config: { interval: 1800000 }, // 30 minutes
                                    enabled: true
                                },
                                status: 'active',
                                actions: [
                                    {
                                        id: 'check_mining_queue',
                                        type: 'code_execution',
                                        name: 'Check Mining Queue',
                                        config: {
                                            language: 'javascript',
                                            code: "\n              const jobs = lightDomFramework.getAllMiningJobs();\n              const pendingJobs = jobs.filter(job => job.status === 'pending');\n              \n              if (pendingJobs.length > 0) {\n                console.log(`Found ${pendingJobs.length} pending mining jobs`);\n                \n                // Process jobs in batches\n                const batchSize = 5;\n                for (let i = 0; i < pendingJobs.length; i += batchSize) {\n                  const batch = pendingJobs.slice(i, i + batchSize);\n                  console.log(`Processing batch of ${batch.length} jobs`);\n                  \n                  // Process batch (simplified)\n                  for (const job of batch) {\n                    console.log(`Processing job: ${job.url}`);\n                  }\n                }\n              }\n            "
                                        },
                                        enabled: true,
                                        order: 1
                                    }
                                ]
                            })];
                    case 3:
                        // Mining automation workflow
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create automation rule
     */
    AutomationOrchestrator.prototype.createAutomationRule = function (rule) {
        return __awaiter(this, void 0, void 0, function () {
            var automationRule, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, CursorAPIIntegration_1.cursorAPIIntegration.createAutomationRule(rule)];
                    case 1:
                        automationRule = _a.sent();
                        this.emit('automationRuleCreated', automationRule);
                        console.log("\u2705 Created automation rule: ".concat(automationRule.name));
                        return [2 /*return*/, automationRule];
                    case 2:
                        error_3 = _a.sent();
                        console.error('❌ Failed to create automation rule:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute automation rule
     */
    AutomationOrchestrator.prototype.executeAutomationRule = function (ruleId, context) {
        return __awaiter(this, void 0, void 0, function () {
            var rule, shouldExecute, _i, _a, action, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        rule = CursorAPIIntegration_1.cursorAPIIntegration.getAutomationRule(ruleId);
                        if (!rule) {
                            throw new Error("Automation rule ".concat(ruleId, " not found"));
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 7, , 8]);
                        console.log("\uD83E\uDD16 Executing automation rule: ".concat(rule.name));
                        return [4 /*yield*/, this.evaluateRuleConditions(rule, context)];
                    case 2:
                        shouldExecute = _b.sent();
                        if (!shouldExecute) {
                            console.log("\u23ED\uFE0F Rule conditions not met: ".concat(rule.name));
                            return [2 /*return*/];
                        }
                        _i = 0, _a = rule.actions;
                        _b.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        action = _a[_i];
                        return [4 /*yield*/, this.executeAction(action, context)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        rule.triggerCount++;
                        this.emit('automationRuleExecuted', rule);
                        console.log("\u2705 Automation rule executed: ".concat(rule.name));
                        return [3 /*break*/, 8];
                    case 7:
                        error_4 = _b.sent();
                        console.error("\u274C Failed to execute automation rule ".concat(rule.name, ":"), error_4);
                        this.emit('automationRuleFailed', { rule: rule, error: error_4 });
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Evaluate rule conditions
     */
    AutomationOrchestrator.prototype.evaluateRuleConditions = function (rule, context) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, condition, value, threshold;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = rule.conditions;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        condition = _a[_i];
                        return [4 /*yield*/, this.getConditionValue(condition, context)];
                    case 2:
                        value = _b.sent();
                        threshold = condition.threshold || condition.value;
                        if (!this.evaluateCondition(condition.operator, value, threshold)) {
                            return [2 /*return*/, false];
                        }
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Get condition value
     */
    AutomationOrchestrator.prototype.getConditionValue = function (condition, context) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = condition.type;
                        switch (_a) {
                            case 'metric': return [3 /*break*/, 1];
                            case 'event': return [3 /*break*/, 3];
                            case 'schedule': return [3 /*break*/, 4];
                            case 'webhook': return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 6];
                    case 1: return [4 /*yield*/, this.getMetricValue(condition.metric)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [2 /*return*/, (context === null || context === void 0 ? void 0 : context.event) || null];
                    case 4: return [2 /*return*/, new Date().toISOString()];
                    case 5: return [2 /*return*/, (context === null || context === void 0 ? void 0 : context.webhook) || null];
                    case 6: return [2 /*return*/, null];
                }
            });
        });
    };
    /**
     * Get metric value
     */
    AutomationOrchestrator.prototype.getMetricValue = function (metric) {
        return __awaiter(this, void 0, void 0, function () {
            var status_1, storageMetrics, miningStats;
            return __generator(this, function (_a) {
                switch (metric) {
                    case 'cpu_usage':
                        return [2 /*return*/, this.getCPUUsage()];
                    case 'memory_usage':
                        return [2 /*return*/, this.getMemoryUsage()];
                    case 'disk_usage':
                        return [2 /*return*/, this.getDiskUsage()];
                    case 'error_rate':
                        status_1 = LightDomFramework_1.lightDomFramework.getStatus();
                        return [2 /*return*/, status_1.performance.errorRate];
                    case 'response_time':
                        return [2 /*return*/, status_1.performance.averageProcessingTime];
                    case 'storage_utilization':
                        storageMetrics = LightDomFramework_1.lightDomFramework.getStorageMetrics();
                        return [2 /*return*/, storageMetrics.utilizationRate];
                    case 'mining_success_rate':
                        miningStats = LightDomFramework_1.lightDomFramework.getMiningStats();
                        return [2 /*return*/, miningStats.successRate];
                    default:
                        return [2 /*return*/, 0];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get CPU usage
     */
    AutomationOrchestrator.prototype.getCPUUsage = function () {
        // Simplified CPU usage calculation
        return Math.random() * 100;
    };
    /**
     * Get memory usage
     */
    AutomationOrchestrator.prototype.getMemoryUsage = function () {
        // Simplified memory usage calculation
        return Math.random() * 100;
    };
    /**
     * Get disk usage
     */
    AutomationOrchestrator.prototype.getDiskUsage = function () {
        // Simplified disk usage calculation
        return Math.random() * 100;
    };
    /**
     * Evaluate condition
     */
    AutomationOrchestrator.prototype.evaluateCondition = function (operator, value, threshold) {
        switch (operator) {
            case 'greater_than':
                return value > threshold;
            case 'less_than':
                return value < threshold;
            case 'equals':
                return value === threshold;
            case 'contains':
                return String(value).includes(String(threshold));
            case 'matches':
                return new RegExp(threshold).test(String(value));
            default:
                return false;
        }
    };
    /**
     * Execute action
     */
    AutomationOrchestrator.prototype.executeAction = function (action, context) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = action.type;
                        switch (_a) {
                            case 'cursor_workflow': return [3 /*break*/, 1];
                            case 'n8n_workflow': return [3 /*break*/, 3];
                            case 'lightdom_action': return [3 /*break*/, 5];
                            case 'notification': return [3 /*break*/, 7];
                            case 'webhook': return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 11];
                    case 1: return [4 /*yield*/, this.executeCursorWorkflow(action.workflowId, context)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 3: return [4 /*yield*/, this.executeN8NWorkflow(action.workflowId, context)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 5: return [4 /*yield*/, this.executeLightDomAction(action.action, action.config, context)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 7: return [4 /*yield*/, this.sendNotification(action.config, context)];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 9: return [4 /*yield*/, this.sendWebhook(action.config, context)];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        console.log("Unknown action type: ".concat(action.type));
                        _b.label = 12;
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute Cursor workflow
     */
    AutomationOrchestrator.prototype.executeCursorWorkflow = function (workflowId, context) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, CursorAPIIntegration_1.cursorAPIIntegration.executeWorkflow(workflowId, context)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error("Failed to execute Cursor workflow ".concat(workflowId, ":"), error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute N8N workflow
     */
    AutomationOrchestrator.prototype.executeN8NWorkflow = function (workflowId, context) {
        return __awaiter(this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, N8NWorkflowManager_1.n8nWorkflowManager.executeWorkflow(workflowId, context)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        console.error("Failed to execute N8N workflow ".concat(workflowId, ":"), error_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute LightDom action
     */
    AutomationOrchestrator.prototype.executeLightDomAction = function (action, config, context) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, nodes, _i, nodes_1, node;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = action;
                        switch (_a) {
                            case 'optimize_performance': return [3 /*break*/, 1];
                            case 'cleanup_storage': return [3 /*break*/, 3];
                            case 'restart_services': return [3 /*break*/, 8];
                            case 'scale_resources': return [3 /*break*/, 10];
                        }
                        return [3 /*break*/, 11];
                    case 1: return [4 /*yield*/, LightDomFramework_1.lightDomFramework.optimizePerformance()];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 3:
                        nodes = LightDomFramework_1.lightDomFramework.getStorageNodes();
                        _i = 0, nodes_1 = nodes;
                        _b.label = 4;
                    case 4:
                        if (!(_i < nodes_1.length)) return [3 /*break*/, 7];
                        node = nodes_1[_i];
                        return [4 /*yield*/, LightDomFramework_1.lightDomFramework.optimizeStorageNode(node.id)];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [3 /*break*/, 12];
                    case 8: return [4 /*yield*/, LightDomFramework_1.lightDomFramework.restart()];
                    case 9:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 10: 
                    // Implement resource scaling
                    return [3 /*break*/, 12];
                    case 11:
                        console.log("Unknown LightDom action: ".concat(action));
                        _b.label = 12;
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send notification
     */
    AutomationOrchestrator.prototype.sendNotification = function (config, context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("\uD83D\uDCE2 Sending notification: ".concat(config.message));
                return [2 /*return*/];
            });
        });
    };
    /**
     * Send webhook
     */
    AutomationOrchestrator.prototype.sendWebhook = function (config, context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("\uD83D\uDD17 Sending webhook to: ".concat(config.url));
                return [2 /*return*/];
            });
        });
    };
    /**
     * Start monitoring
     */
    AutomationOrchestrator.prototype.startMonitoring = function () {
        var _this = this;
        this.monitoringInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isRunning)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.monitorSystemHealth()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.checkAutomationRules()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_7 = _a.sent();
                        console.error('Monitoring error:', error_7);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); }, this.config.monitoringInterval);
    };
    /**
     * Monitor system health
     */
    AutomationOrchestrator.prototype.monitorSystemHealth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var status_2, storageMetrics, miningStats, alerts, _i, alerts_1, alert_1, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        status_2 = LightDomFramework_1.lightDomFramework.getStatus();
                        storageMetrics = LightDomFramework_1.lightDomFramework.getStorageMetrics();
                        miningStats = LightDomFramework_1.lightDomFramework.getMiningStats();
                        alerts = [];
                        if (status_2.performance.averageProcessingTime > this.config.alertThresholds.responseTime) {
                            alerts.push({
                                type: 'response_time',
                                message: "High response time: ".concat(status_2.performance.averageProcessingTime, "ms"),
                                severity: 'warning'
                            });
                        }
                        if (status_2.performance.errorRate > this.config.alertThresholds.errorRate) {
                            alerts.push({
                                type: 'error_rate',
                                message: "High error rate: ".concat(status_2.performance.errorRate, "%"),
                                severity: 'error'
                            });
                        }
                        if (storageMetrics.utilizationRate > this.config.alertThresholds.storageUtilization) {
                            alerts.push({
                                type: 'storage_utilization',
                                message: "High storage utilization: ".concat(storageMetrics.utilizationRate, "%"),
                                severity: 'warning'
                            });
                        }
                        if (miningStats.successRate < this.config.alertThresholds.miningSuccessRate) {
                            alerts.push({
                                type: 'mining_success_rate',
                                message: "Low mining success rate: ".concat(miningStats.successRate, "%"),
                                severity: 'warning'
                            });
                        }
                        _i = 0, alerts_1 = alerts;
                        _a.label = 1;
                    case 1:
                        if (!(_i < alerts_1.length)) return [3 /*break*/, 4];
                        alert_1 = alerts_1[_i];
                        return [4 /*yield*/, this.processAlert(alert_1)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_8 = _a.sent();
                        console.error('Health monitoring error:', error_8);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process alert
     */
    AutomationOrchestrator.prototype.processAlert = function (alert) {
        return __awaiter(this, void 0, void 0, function () {
            var event;
            return __generator(this, function (_a) {
                event = {
                    id: "event_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
                    type: 'metric_alert',
                    source: 'lightdom',
                    timestamp: new Date().toISOString(),
                    data: alert,
                    severity: alert.severity,
                    resolved: false
                };
                this.events.set(event.id, event);
                this.emit('alert', event);
                console.log("\uD83D\uDEA8 Alert: ".concat(alert.message));
                return [2 /*return*/];
            });
        });
    };
    /**
     * Check automation rules
     */
    AutomationOrchestrator.prototype.checkAutomationRules = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rules, _i, rules_1, rule, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rules = CursorAPIIntegration_1.cursorAPIIntegration.getAllAutomationRules();
                        _i = 0, rules_1 = rules;
                        _a.label = 1;
                    case 1:
                        if (!(_i < rules_1.length)) return [3 /*break*/, 6];
                        rule = rules_1[_i];
                        if (!rule.enabled)
                            return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.executeAutomationRule(rule.id)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_9 = _a.sent();
                        console.error("Error checking automation rule ".concat(rule.name, ":"), error_9);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Setup event handlers
     */
    AutomationOrchestrator.prototype.setupEventHandlers = function () {
        this.on('alert', function (event) {
            console.log("\uD83D\uDEA8 Alert: ".concat(event.data.message));
        });
        this.on('automationRuleCreated', function (rule) {
            console.log("\uD83E\uDD16 Automation rule created: ".concat(rule.name));
        });
        this.on('automationRuleExecuted', function (rule) {
            console.log("\u2705 Automation rule executed: ".concat(rule.name));
        });
        this.on('automationRuleFailed', function (_a) {
            var rule = _a.rule, error = _a.error;
            console.error("\u274C Automation rule failed: ".concat(rule.name, " - ").concat(error));
        });
    };
    /**
     * Get automation statistics
     */
    AutomationOrchestrator.prototype.getAutomationStats = function () {
        var events = Array.from(this.events.values());
        var executions = events.filter(function (e) { return e.type === 'workflow_execution'; });
        var successfulExecutions = executions.filter(function (e) { var _a; return ((_a = e.data) === null || _a === void 0 ? void 0 : _a.status) === 'completed'; }).length;
        var failedExecutions = executions.filter(function (e) { var _a; return ((_a = e.data) === null || _a === void 0 ? void 0 : _a.status) === 'failed'; }).length;
        var averageExecutionTime = executions.length > 0 ?
            executions.reduce(function (total, e) { var _a; return total + (((_a = e.data) === null || _a === void 0 ? void 0 : _a.duration) || 0); }, 0) / executions.length : 0;
        var lastExecution = executions.length > 0 ? Math.max.apply(Math, executions.map(function (e) { return new Date(e.timestamp).getTime(); })) : 0;
        return {
            totalEvents: events.length,
            activeWorkflows: this.getActiveWorkflowCount(),
            successfulExecutions: successfulExecutions,
            failedExecutions: failedExecutions,
            averageExecutionTime: averageExecutionTime,
            lastExecution: lastExecution > 0 ? new Date(lastExecution).toISOString() : '',
            uptime: this.isRunning ? Date.now() - this.startTime : 0
        };
    };
    /**
     * Get active workflow count
     */
    AutomationOrchestrator.prototype.getActiveWorkflowCount = function () {
        var count = 0;
        if (this.config.enableCursorAPI) {
            count += CursorAPIIntegration_1.cursorAPIIntegration.getAllWorkflows().filter(function (w) { return w.status === 'active'; }).length;
        }
        if (this.config.enableN8N) {
            count += N8NWorkflowManager_1.n8nWorkflowManager.getAllWorkflows().filter(function (w) { return w.active; }).length;
        }
        return count;
    };
    /**
     * Get all events
     */
    AutomationOrchestrator.prototype.getAllEvents = function () {
        return Array.from(this.events.values()).sort(function (a, b) {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
    };
    /**
     * Get events by type
     */
    AutomationOrchestrator.prototype.getEventsByType = function (type) {
        return this.getAllEvents().filter(function (e) { return e.type === type; });
    };
    /**
     * Get events by severity
     */
    AutomationOrchestrator.prototype.getEventsBySeverity = function (severity) {
        return this.getAllEvents().filter(function (e) { return e.severity === severity; });
    };
    /**
     * Stop the automation orchestrator
     */
    AutomationOrchestrator.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🛑 Stopping Automation Orchestrator...');
                        this.isRunning = false;
                        if (this.monitoringInterval) {
                            clearInterval(this.monitoringInterval);
                            this.monitoringInterval = null;
                        }
                        if (!this.config.enableCursorAPI) return [3 /*break*/, 2];
                        return [4 /*yield*/, CursorAPIIntegration_1.cursorAPIIntegration.stop()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!this.config.enableN8N) return [3 /*break*/, 4];
                        return [4 /*yield*/, N8NWorkflowManager_1.n8nWorkflowManager.stop()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        this.emit('stopped');
                        console.log('✅ Automation Orchestrator stopped');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get status
     */
    AutomationOrchestrator.prototype.getStatus = function () {
        return {
            running: this.isRunning,
            config: this.config,
            stats: this.getAutomationStats()
        };
    };
    return AutomationOrchestrator;
}(events_1.EventEmitter));
exports.AutomationOrchestrator = AutomationOrchestrator;
// Export singleton instance
exports.automationOrchestrator = new AutomationOrchestrator();
