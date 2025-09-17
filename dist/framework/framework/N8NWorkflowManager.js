"use strict";
/**
 * N8N Workflow Manager
 * Manages n8n workflows for LightDom app automation
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.n8nWorkflowManager = exports.N8NWorkflowManager = void 0;
var events_1 = require("events");
var axios_1 = __importDefault(require("axios"));
var promises_1 = __importDefault(require("fs/promises"));
var path_1 = __importDefault(require("path"));
var N8NWorkflowManager = /** @class */ (function (_super) {
    __extends(N8NWorkflowManager, _super);
    function N8NWorkflowManager(config) {
        var _this = _super.call(this) || this;
        _this.workflows = new Map();
        _this.templates = new Map();
        _this.executions = new Map();
        _this.isRunning = false;
        _this.monitoringInterval = null;
        _this.config = config;
        _this.api = axios_1.default.create({
            baseURL: config.baseUrl,
            timeout: config.timeout,
            headers: {
                'X-N8N-API-KEY': config.apiKey,
                'Content-Type': 'application/json'
            }
        });
        _this.setupInterceptors();
        _this.setupEventHandlers();
        return _this;
    }
    /**
     * Initialize the N8N Workflow Manager
     */
    N8NWorkflowManager.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🔧 Initializing N8N Workflow Manager...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        // Test N8N connection
                        return [4 /*yield*/, this.testConnection()];
                    case 2:
                        // Test N8N connection
                        _a.sent();
                        // Load workflow templates
                        return [4 /*yield*/, this.loadWorkflowTemplates()];
                    case 3:
                        // Load workflow templates
                        _a.sent();
                        // Load existing workflows
                        return [4 /*yield*/, this.loadWorkflows()];
                    case 4:
                        // Load existing workflows
                        _a.sent();
                        // Start monitoring
                        this.startMonitoring();
                        this.isRunning = true;
                        this.emit('initialized');
                        console.log('✅ N8N Workflow Manager initialized successfully');
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        console.error('❌ Failed to initialize N8N Workflow Manager:', error_1);
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Test N8N connection
     */
    N8NWorkflowManager.prototype.testConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.api.get('/health')];
                    case 1:
                        response = _a.sent();
                        if (response.status !== 200) {
                            throw new Error('N8N health check failed');
                        }
                        console.log('✅ N8N connection successful');
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error('❌ N8N connection failed:', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Load workflow templates
     */
    N8NWorkflowManager.prototype.loadWorkflowTemplates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var templatesPath, templatesData, workflows, _i, workflows_1, workflow, template, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        templatesPath = path_1.default.join(__dirname, 'n8n-workflows.json');
                        return [4 /*yield*/, promises_1.default.readFile(templatesPath, 'utf8')];
                    case 1:
                        templatesData = _a.sent();
                        workflows = JSON.parse(templatesData).workflows;
                        for (_i = 0, workflows_1 = workflows; _i < workflows_1.length; _i++) {
                            workflow = workflows_1[_i];
                            template = {
                                id: workflow.id,
                                name: workflow.name,
                                description: workflow.description,
                                category: this.categorizeWorkflow(workflow),
                                tags: this.extractTags(workflow),
                                template: workflow,
                                variables: this.extractVariables(workflow),
                                requirements: this.extractRequirements(workflow)
                            };
                            this.templates.set(template.id, template);
                        }
                        console.log("\u2705 Loaded ".concat(this.templates.size, " workflow templates"));
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('❌ Failed to load workflow templates:', error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Categorize workflow based on name and description
     */
    N8NWorkflowManager.prototype.categorizeWorkflow = function (workflow) {
        var name = workflow.name.toLowerCase();
        var description = workflow.description.toLowerCase();
        if (name.includes('optimization') || description.includes('optimization')) {
            return 'optimization';
        }
        else if (name.includes('monitoring') || description.includes('monitoring')) {
            return 'monitoring';
        }
        else if (name.includes('deployment') || description.includes('deployment')) {
            return 'deployment';
        }
        else if (name.includes('mining') || description.includes('mining')) {
            return 'mining';
        }
        else if (name.includes('storage') || description.includes('storage')) {
            return 'storage';
        }
        return 'monitoring';
    };
    /**
     * Extract tags from workflow
     */
    N8NWorkflowManager.prototype.extractTags = function (workflow) {
        var tags = ['lightdom'];
        if (workflow.name.toLowerCase().includes('auto')) {
            tags.push('automation');
        }
        if (workflow.name.toLowerCase().includes('monitor')) {
            tags.push('monitoring');
        }
        if (workflow.name.toLowerCase().includes('deploy')) {
            tags.push('deployment');
        }
        if (workflow.name.toLowerCase().includes('mining')) {
            tags.push('mining');
        }
        if (workflow.name.toLowerCase().includes('storage')) {
            tags.push('storage');
        }
        return tags;
    };
    /**
     * Extract variables from workflow
     */
    N8NWorkflowManager.prototype.extractVariables = function (workflow) {
        var variables = [];
        // Extract variables from HTTP request nodes
        for (var _i = 0, _a = workflow.nodes; _i < _a.length; _i++) {
            var node = _a[_i];
            if (node.type === 'n8n-nodes-base.httpRequest') {
                if (node.parameters.url && node.parameters.url.includes('{{')) {
                    var urlVar = node.parameters.url.match(/\{\{([^}]+)\}\}/g);
                    if (urlVar) {
                        variables.push({
                            name: 'api_url',
                            type: 'string',
                            description: 'LightDom API URL',
                            required: true,
                            default: 'http://localhost:3000'
                        });
                    }
                }
            }
        }
        return variables;
    };
    /**
     * Extract requirements from workflow
     */
    N8NWorkflowManager.prototype.extractRequirements = function (workflow) {
        var requirements = ['LightDom Framework API'];
        // Check for specific node types that require external services
        for (var _i = 0, _a = workflow.nodes; _i < _a.length; _i++) {
            var node = _a[_i];
            if (node.type === 'n8n-nodes-base.slack') {
                requirements.push('Slack API');
            }
            if (node.type === 'n8n-nodes-base.webhook') {
                requirements.push('Webhook endpoint');
            }
            if (node.type === 'n8n-nodes-base.cron') {
                requirements.push('Cron scheduler');
            }
        }
        return requirements;
    };
    /**
     * Load existing workflows from N8N
     */
    N8NWorkflowManager.prototype.loadWorkflows = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, workflows, _i, workflows_2, workflow, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.api.get('/workflows')];
                    case 1:
                        response = _a.sent();
                        workflows = response.data.data || response.data;
                        for (_i = 0, workflows_2 = workflows; _i < workflows_2.length; _i++) {
                            workflow = workflows_2[_i];
                            this.workflows.set(workflow.id, workflow);
                        }
                        console.log("\u2705 Loaded ".concat(this.workflows.size, " existing workflows"));
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error('❌ Failed to load workflows:', error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Deploy a workflow template
     */
    N8NWorkflowManager.prototype.deployWorkflow = function (templateId_1) {
        return __awaiter(this, arguments, void 0, function (templateId, variables) {
            var template, workflow, response, deployedWorkflow, error_5;
            if (variables === void 0) { variables = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        template = this.templates.get(templateId);
                        if (!template) {
                            throw new Error("Template ".concat(templateId, " not found"));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        workflow = this.applyVariables(template.template, variables);
                        return [4 /*yield*/, this.api.post('/workflows', workflow)];
                    case 2:
                        response = _a.sent();
                        deployedWorkflow = response.data;
                        this.workflows.set(deployedWorkflow.id, deployedWorkflow);
                        this.emit('workflowDeployed', deployedWorkflow);
                        console.log("\u2705 Deployed workflow: ".concat(deployedWorkflow.name));
                        return [2 /*return*/, deployedWorkflow];
                    case 3:
                        error_5 = _a.sent();
                        console.error('❌ Failed to deploy workflow:', error_5);
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Apply variables to workflow template
     */
    N8NWorkflowManager.prototype.applyVariables = function (template, variables) {
        var workflow = JSON.parse(JSON.stringify(template));
        // Replace variables in node parameters
        for (var _i = 0, _a = workflow.nodes; _i < _a.length; _i++) {
            var node = _a[_i];
            if (node.parameters) {
                this.replaceVariablesInObject(node.parameters, variables);
            }
        }
        return workflow;
    };
    /**
     * Replace variables in object recursively
     */
    N8NWorkflowManager.prototype.replaceVariablesInObject = function (obj, variables) {
        for (var key in obj) {
            if (typeof obj[key] === 'string') {
                obj[key] = obj[key].replace(/\{\{([^}]+)\}\}/g, function (match, varName) {
                    return variables[varName] || match;
                });
            }
            else if (typeof obj[key] === 'object' && obj[key] !== null) {
                this.replaceVariablesInObject(obj[key], variables);
            }
        }
    };
    /**
     * Execute a workflow
     */
    N8NWorkflowManager.prototype.executeWorkflow = function (workflowId, input) {
        return __awaiter(this, void 0, void 0, function () {
            var response, execution, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.api.post("/workflows/".concat(workflowId, "/execute"), {
                                data: input
                            })];
                    case 1:
                        response = _a.sent();
                        execution = response.data;
                        this.executions.set(execution.id, execution);
                        this.emit('workflowExecuted', execution);
                        console.log("\uD83D\uDE80 Executed workflow: ".concat(workflowId));
                        return [2 /*return*/, execution];
                    case 2:
                        error_6 = _a.sent();
                        console.error('❌ Failed to execute workflow:', error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get workflow execution status
     */
    N8NWorkflowManager.prototype.getExecutionStatus = function (executionId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, execution, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.api.get("/executions/".concat(executionId))];
                    case 1:
                        response = _a.sent();
                        execution = response.data;
                        this.executions.set(execution.id, execution);
                        return [2 /*return*/, execution];
                    case 2:
                        error_7 = _a.sent();
                        console.error('❌ Failed to get execution status:', error_7);
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Activate a workflow
     */
    N8NWorkflowManager.prototype.activateWorkflow = function (workflowId) {
        return __awaiter(this, void 0, void 0, function () {
            var workflow, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.api.patch("/workflows/".concat(workflowId), { active: true })];
                    case 1:
                        _a.sent();
                        workflow = this.workflows.get(workflowId);
                        if (workflow) {
                            workflow.active = true;
                            this.workflows.set(workflowId, workflow);
                        }
                        this.emit('workflowActivated', workflowId);
                        console.log("\u2705 Activated workflow: ".concat(workflowId));
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _a.sent();
                        console.error('❌ Failed to activate workflow:', error_8);
                        throw error_8;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Deactivate a workflow
     */
    N8NWorkflowManager.prototype.deactivateWorkflow = function (workflowId) {
        return __awaiter(this, void 0, void 0, function () {
            var workflow, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.api.patch("/workflows/".concat(workflowId), { active: false })];
                    case 1:
                        _a.sent();
                        workflow = this.workflows.get(workflowId);
                        if (workflow) {
                            workflow.active = false;
                            this.workflows.set(workflowId, workflow);
                        }
                        this.emit('workflowDeactivated', workflowId);
                        console.log("\u2705 Deactivated workflow: ".concat(workflowId));
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _a.sent();
                        console.error('❌ Failed to deactivate workflow:', error_9);
                        throw error_9;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete a workflow
     */
    N8NWorkflowManager.prototype.deleteWorkflow = function (workflowId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.api.delete("/workflows/".concat(workflowId))];
                    case 1:
                        _a.sent();
                        this.workflows.delete(workflowId);
                        this.emit('workflowDeleted', workflowId);
                        console.log("\u2705 Deleted workflow: ".concat(workflowId));
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _a.sent();
                        console.error('❌ Failed to delete workflow:', error_10);
                        throw error_10;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Deploy all LightDom workflows
     */
    N8NWorkflowManager.prototype.deployAllLightDomWorkflows = function () {
        return __awaiter(this, void 0, void 0, function () {
            var deployedWorkflows, _i, _a, template, workflow, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('🚀 Deploying all LightDom workflows...');
                        deployedWorkflows = [];
                        _i = 0, _a = this.templates.values();
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        template = _a[_i];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, this.deployWorkflow(template.id, {
                                api_url: 'http://localhost:3000',
                                slack_webhook: process.env.SLACK_WEBHOOK_URL || '',
                                git_webhook: process.env.GIT_WEBHOOK_URL || ''
                            })];
                    case 3:
                        workflow = _b.sent();
                        deployedWorkflows.push(workflow);
                        // Activate the workflow
                        return [4 /*yield*/, this.activateWorkflow(workflow.id)];
                    case 4:
                        // Activate the workflow
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_11 = _b.sent();
                        console.error("\u274C Failed to deploy workflow ".concat(template.name, ":"), error_11);
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7:
                        console.log("\u2705 Deployed ".concat(deployedWorkflows.length, " workflows"));
                        return [2 /*return*/, deployedWorkflows];
                }
            });
        });
    };
    /**
     * Start monitoring workflow executions
     */
    N8NWorkflowManager.prototype.startMonitoring = function () {
        var _this = this;
        this.monitoringInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isRunning)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.monitorExecutions()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_12 = _a.sent();
                        console.error('Monitoring error:', error_12);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); }, 30000); // Check every 30 seconds
    };
    /**
     * Monitor workflow executions
     */
    N8NWorkflowManager.prototype.monitorExecutions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, executions, _i, executions_1, execution, error_13;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.api.get('/executions', {
                                params: {
                                    limit: 50,
                                    status: 'running'
                                }
                            })];
                    case 1:
                        response = _b.sent();
                        executions = response.data.data || response.data;
                        for (_i = 0, executions_1 = executions; _i < executions_1.length; _i++) {
                            execution = executions_1[_i];
                            if (!this.executions.has(execution.id)) {
                                this.executions.set(execution.id, execution);
                                this.emit('executionStarted', execution);
                            }
                            // Check if execution completed
                            if (execution.finished && !((_a = this.executions.get(execution.id)) === null || _a === void 0 ? void 0 : _a.finished)) {
                                this.executions.set(execution.id, execution);
                                this.emit('executionCompleted', execution);
                            }
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_13 = _b.sent();
                        console.error('Failed to monitor executions:', error_13);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Setup interceptors
     */
    N8NWorkflowManager.prototype.setupInterceptors = function () {
        this.api.interceptors.request.use(function (config) {
            var _a;
            console.log("[N8N] ".concat((_a = config.method) === null || _a === void 0 ? void 0 : _a.toUpperCase(), " ").concat(config.url));
            return config;
        }, function (error) {
            console.error('[N8N] Request error:', error);
            return Promise.reject(error);
        });
        this.api.interceptors.response.use(function (response) {
            console.log("[N8N] Response: ".concat(response.status, " ").concat(response.statusText));
            return response;
        }, function (error) {
            console.error('[N8N] Response error:', error);
            return Promise.reject(error);
        });
    };
    /**
     * Setup event handlers
     */
    N8NWorkflowManager.prototype.setupEventHandlers = function () {
        this.on('workflowDeployed', function (workflow) {
            console.log("\uD83D\uDCCB Workflow deployed: ".concat(workflow.name));
        });
        this.on('workflowActivated', function (workflowId) {
            console.log("\u2705 Workflow activated: ".concat(workflowId));
        });
        this.on('workflowDeactivated', function (workflowId) {
            console.log("\u23F8\uFE0F Workflow deactivated: ".concat(workflowId));
        });
        this.on('workflowExecuted', function (execution) {
            console.log("\uD83D\uDE80 Workflow executed: ".concat(execution.id));
        });
        this.on('executionStarted', function (execution) {
            console.log("\u25B6\uFE0F Execution started: ".concat(execution.id));
        });
        this.on('executionCompleted', function (execution) {
            console.log("\u2705 Execution completed: ".concat(execution.id, " - ").concat(execution.status));
        });
    };
    /**
     * Get workflow by ID
     */
    N8NWorkflowManager.prototype.getWorkflow = function (workflowId) {
        return this.workflows.get(workflowId);
    };
    /**
     * Get all workflows
     */
    N8NWorkflowManager.prototype.getAllWorkflows = function () {
        return Array.from(this.workflows.values());
    };
    /**
     * Get workflow template by ID
     */
    N8NWorkflowManager.prototype.getTemplate = function (templateId) {
        return this.templates.get(templateId);
    };
    /**
     * Get all workflow templates
     */
    N8NWorkflowManager.prototype.getAllTemplates = function () {
        return Array.from(this.templates.values());
    };
    /**
     * Get templates by category
     */
    N8NWorkflowManager.prototype.getTemplatesByCategory = function (category) {
        return Array.from(this.templates.values()).filter(function (t) { return t.category === category; });
    };
    /**
     * Get execution by ID
     */
    N8NWorkflowManager.prototype.getExecution = function (executionId) {
        return this.executions.get(executionId);
    };
    /**
     * Get all executions
     */
    N8NWorkflowManager.prototype.getAllExecutions = function () {
        return Array.from(this.executions.values());
    };
    /**
     * Stop the N8N Workflow Manager
     */
    N8NWorkflowManager.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('🛑 Stopping N8N Workflow Manager...');
                this.isRunning = false;
                if (this.monitoringInterval) {
                    clearInterval(this.monitoringInterval);
                    this.monitoringInterval = null;
                }
                this.emit('stopped');
                console.log('✅ N8N Workflow Manager stopped');
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get status
     */
    N8NWorkflowManager.prototype.getStatus = function () {
        return {
            running: this.isRunning,
            workflows: this.workflows.size,
            templates: this.templates.size,
            executions: this.executions.size
        };
    };
    return N8NWorkflowManager;
}(events_1.EventEmitter));
exports.N8NWorkflowManager = N8NWorkflowManager;
// Export singleton instance
exports.n8nWorkflowManager = new N8NWorkflowManager({
    baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678/api/v1',
    apiKey: process.env.N8N_API_KEY || 'demo-key',
    timeout: 30000,
    retryAttempts: 3
});
