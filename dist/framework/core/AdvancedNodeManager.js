"use strict";
/**
 * Advanced Node Manager - Manages nodes and storage utilization from mined space
 * Enables setting up new nodes, running additional nodes, and optimizing storage usage
 */
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
exports.advancedNodeManager = exports.AdvancedNodeManager = void 0;
var AdvancedNodeManager = /** @class */ (function () {
    function AdvancedNodeManager() {
        this.nodes = new Map();
        this.storageAllocations = new Map();
        this.optimizationTasks = new Map();
        this.nodeCounter = 0;
        this.allocationCounter = 0;
        this.taskCounter = 0;
        // Node type configurations
        this.nodeConfigs = {
            ai_consensus: {
                baseStorage: 1000, // 1MB base
                computePower: 100,
                rewardRate: 0.1, // 0.1 DSH per day per KB
                maxStorage: 10000 // 10MB max
            },
            storage_shard: {
                baseStorage: 500, // 500KB base
                computePower: 50,
                rewardRate: 0.05, // 0.05 DSH per day per KB
                maxStorage: 50000 // 50MB max
            },
            bridge: {
                baseStorage: 2000, // 2MB base
                computePower: 200,
                rewardRate: 0.2, // 0.2 DSH per day per KB
                maxStorage: 20000 // 20MB max
            },
            optimization: {
                baseStorage: 100, // 100KB base
                computePower: 25,
                rewardRate: 0.15, // 0.15 DSH per day per KB
                maxStorage: 5000 // 5MB max
            },
            mining: {
                baseStorage: 300, // 300KB base
                computePower: 75,
                rewardRate: 0.08, // 0.08 DSH per day per KB
                maxStorage: 15000 // 15MB max
            }
        };
    }
    /**
     * Create a new node from mined storage
     */
    AdvancedNodeManager.prototype.createNode = function (type, storageCapacity, biomeType, sourceOptimizations) {
        if (sourceOptimizations === void 0) { sourceOptimizations = []; }
        var config = this.nodeConfigs[type];
        var nodeId = "node_".concat(++this.nodeCounter, "_").concat(Date.now());
        var node = {
            id: nodeId,
            type: type,
            status: 'active',
            storageCapacity: Math.min(storageCapacity, config.maxStorage),
            usedStorage: config.baseStorage,
            availableStorage: Math.min(storageCapacity, config.maxStorage) - config.baseStorage,
            computePower: config.computePower,
            rewardRate: config.rewardRate,
            biomeType: biomeType,
            sourceOptimizations: sourceOptimizations,
            createdAt: Date.now(),
            lastActivity: Date.now(),
            performance: {
                uptime: 100,
                efficiency: 85,
                tasksCompleted: 0,
                rewardsEarned: 0
            }
        };
        this.nodes.set(nodeId, node);
        return node;
    };
    /**
     * Allocate storage to a specific purpose
     */
    AdvancedNodeManager.prototype.allocateStorage = function (nodeId, optimizationId, spaceAllocated, purpose, priority, expiresAt) {
        if (priority === void 0) { priority = 'medium'; }
        var node = this.nodes.get(nodeId);
        if (!node) {
            throw new Error("Node ".concat(nodeId, " not found"));
        }
        if (spaceAllocated > node.availableStorage) {
            throw new Error("Insufficient storage. Available: ".concat(node.availableStorage, "KB, Requested: ").concat(spaceAllocated, "KB"));
        }
        var allocationId = "alloc_".concat(++this.allocationCounter, "_").concat(Date.now());
        var allocation = {
            id: allocationId,
            nodeId: nodeId,
            optimizationId: optimizationId,
            spaceAllocated: spaceAllocated,
            purpose: purpose,
            priority: priority,
            createdAt: Date.now(),
            expiresAt: expiresAt
        };
        // Update node storage
        node.usedStorage += spaceAllocated;
        node.availableStorage -= spaceAllocated;
        node.lastActivity = Date.now();
        this.storageAllocations.set(allocationId, allocation);
        return allocation;
    };
    /**
     * Deallocate storage
     */
    AdvancedNodeManager.prototype.deallocateStorage = function (allocationId) {
        var allocation = this.storageAllocations.get(allocationId);
        if (!allocation) {
            return false;
        }
        var node = this.nodes.get(allocation.nodeId);
        if (node) {
            node.usedStorage -= allocation.spaceAllocated;
            node.availableStorage += allocation.spaceAllocated;
            node.lastActivity = Date.now();
        }
        this.storageAllocations.delete(allocationId);
        return true;
    };
    /**
     * Create an optimization task for a node
     */
    AdvancedNodeManager.prototype.createOptimizationTask = function (nodeId, type, targetUrl) {
        var node = this.nodes.get(nodeId);
        if (!node) {
            throw new Error("Node ".concat(nodeId, " not found"));
        }
        if (node.status !== 'active') {
            throw new Error("Node ".concat(nodeId, " is not active"));
        }
        var taskId = "task_".concat(++this.taskCounter, "_").concat(Date.now());
        var task = {
            id: taskId,
            nodeId: nodeId,
            type: type,
            targetUrl: targetUrl,
            status: 'pending',
            spaceSaved: 0,
            tokensEarned: 0,
            createdAt: Date.now()
        };
        this.optimizationTasks.set(taskId, task);
        return task;
    };
    /**
     * Process an optimization task
     */
    AdvancedNodeManager.prototype.processOptimizationTask = function (taskId) {
        return __awaiter(this, void 0, void 0, function () {
            var task, node, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        task = this.optimizationTasks.get(taskId);
                        if (!task) {
                            throw new Error("Task ".concat(taskId, " not found"));
                        }
                        node = this.nodes.get(task.nodeId);
                        if (!node) {
                            throw new Error("Node ".concat(task.nodeId, " not found"));
                        }
                        task.status = 'processing';
                        node.lastActivity = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // Simulate optimization processing
                        return [4 /*yield*/, this.simulateOptimizationProcessing(task, node)];
                    case 2:
                        // Simulate optimization processing
                        _a.sent();
                        task.status = 'completed';
                        task.completedAt = Date.now();
                        // Update node performance
                        node.performance.tasksCompleted++;
                        node.performance.rewardsEarned += task.tokensEarned;
                        node.performance.efficiency = Math.min(100, node.performance.efficiency + 1);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        task.status = 'failed';
                        task.error = error_1 instanceof Error ? error_1.message : 'Unknown error';
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, task];
                }
            });
        });
    };
    /**
     * Simulate optimization processing
     */
    AdvancedNodeManager.prototype.simulateOptimizationProcessing = function (task, node) {
        return __awaiter(this, void 0, void 0, function () {
            var processingTime, baseSpaceSaved, performanceMultiplier, storageMultiplier;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        processingTime = Math.max(1000, 5000 - (node.computePower * 10));
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, processingTime); })];
                    case 1:
                        _a.sent();
                        baseSpaceSaved = this.getBaseSpaceSavedForTaskType(task.type);
                        performanceMultiplier = node.performance.efficiency / 100;
                        storageMultiplier = Math.min(2, node.usedStorage / 1000);
                        task.spaceSaved = Math.floor(baseSpaceSaved * performanceMultiplier * storageMultiplier);
                        task.tokensEarned = (task.spaceSaved * node.rewardRate) / 1000; // Convert KB to DSH
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get base space saved for task type
     */
    AdvancedNodeManager.prototype.getBaseSpaceSavedForTaskType = function (type) {
        var baseRates = {
            dom_analysis: 50, // 50KB base
            css_optimization: 30, // 30KB base
            js_minification: 40, // 40KB base
            image_compression: 100, // 100KB base
            bundle_optimization: 80 // 80KB base
        };
        return baseRates[type] || 25;
    };
    /**
     * Scale up a node with additional storage
     */
    AdvancedNodeManager.prototype.scaleUpNode = function (nodeId, additionalStorage) {
        var node = this.nodes.get(nodeId);
        if (!node) {
            return false;
        }
        var config = this.nodeConfigs[node.type];
        var newCapacity = node.storageCapacity + additionalStorage;
        if (newCapacity > config.maxStorage) {
            return false; // Exceeds maximum capacity
        }
        node.storageCapacity = newCapacity;
        node.availableStorage += additionalStorage;
        node.computePower += Math.floor(additionalStorage / 100); // 1 compute power per 100KB
        node.lastActivity = Date.now();
        return true;
    };
    /**
     * Merge multiple nodes into a more powerful node
     */
    AdvancedNodeManager.prototype.mergeNodes = function (nodeIds, newType) {
        var _this = this;
        if (newType === void 0) { newType = 'optimization'; }
        if (nodeIds.length < 2) {
            return null;
        }
        var nodes = nodeIds.map(function (id) { return _this.nodes.get(id); }).filter(Boolean);
        if (nodes.length !== nodeIds.length) {
            return null; // Some nodes not found
        }
        // Calculate combined resources
        var totalStorage = nodes.reduce(function (sum, node) { return sum + node.storageCapacity; }, 0);
        var totalCompute = nodes.reduce(function (sum, node) { return sum + node.computePower; }, 0);
        var totalRewards = nodes.reduce(function (sum, node) { return sum + node.performance.rewardsEarned; }, 0);
        var totalTasks = nodes.reduce(function (sum, node) { return sum + node.performance.tasksCompleted; }, 0);
        var allSourceOptimizations = nodes.flatMap(function (node) { return node.sourceOptimizations; });
        // Create merged node
        var mergedNode = this.createNode(newType, totalStorage, nodes[0].biomeType, // Use first node's biome
        allSourceOptimizations);
        // Update merged node with combined stats
        mergedNode.computePower = totalCompute;
        mergedNode.performance.rewardsEarned = totalRewards;
        mergedNode.performance.tasksCompleted = totalTasks;
        mergedNode.performance.efficiency = Math.min(100, nodes.reduce(function (sum, node) { return sum + node.performance.efficiency; }, 0) / nodes.length);
        // Deactivate original nodes
        nodes.forEach(function (node) {
            node.status = 'offline';
            node.lastActivity = Date.now();
        });
        return mergedNode;
    };
    /**
     * Get node statistics
     */
    AdvancedNodeManager.prototype.getNodeStats = function (nodeId) {
        var node = this.nodes.get(nodeId);
        if (!node) {
            return null;
        }
        var allocations = Array.from(this.storageAllocations.values())
            .filter(function (alloc) { return alloc.nodeId === nodeId; });
        var tasks = Array.from(this.optimizationTasks.values())
            .filter(function (task) { return task.nodeId === nodeId; });
        return {
            node: node,
            allocations: allocations.length,
            totalAllocatedSpace: allocations.reduce(function (sum, alloc) { return sum + alloc.spaceAllocated; }, 0),
            activeTasks: tasks.filter(function (task) { return task.status === 'processing'; }).length,
            completedTasks: tasks.filter(function (task) { return task.status === 'completed'; }).length,
            totalSpaceProcessed: tasks.reduce(function (sum, task) { return sum + task.spaceSaved; }, 0),
            totalTokensEarned: tasks.reduce(function (sum, task) { return sum + task.tokensEarned; }, 0)
        };
    };
    /**
     * Get all nodes
     */
    AdvancedNodeManager.prototype.getAllNodes = function () {
        return Array.from(this.nodes.values());
    };
    /**
     * Get nodes by type
     */
    AdvancedNodeManager.prototype.getNodesByType = function (type) {
        return Array.from(this.nodes.values()).filter(function (node) { return node.type === type; });
    };
    /**
     * Get available storage across all nodes
     */
    AdvancedNodeManager.prototype.getTotalAvailableStorage = function () {
        return Array.from(this.nodes.values())
            .reduce(function (sum, node) { return sum + node.availableStorage; }, 0);
    };
    /**
     * Get total compute power
     */
    AdvancedNodeManager.prototype.getTotalComputePower = function () {
        return Array.from(this.nodes.values())
            .reduce(function (sum, node) { return sum + node.computePower; }, 0);
    };
    /**
     * Get daily rewards estimate
     */
    AdvancedNodeManager.prototype.getDailyRewardsEstimate = function () {
        return Array.from(this.nodes.values())
            .reduce(function (sum, node) {
            var dailyReward = (node.usedStorage * node.rewardRate) / 1000;
            return sum + dailyReward;
        }, 0);
    };
    /**
     * Optimize storage allocation across nodes
     */
    AdvancedNodeManager.prototype.optimizeStorageAllocation = function () {
        var nodes = this.getAllNodes().filter(function (node) { return node.status === 'active'; });
        var allocations = Array.from(this.storageAllocations.values());
        // Sort nodes by efficiency (descending)
        nodes.sort(function (a, b) { return b.performance.efficiency - a.performance.efficiency; });
        var _loop_1 = function (node) {
            if (node.availableStorage > 0) {
                // Find low-priority allocations on less efficient nodes
                var lowPriorityAllocations = allocations
                    .filter(function (alloc) { return alloc.priority === 'low' && alloc.nodeId !== node.id; })
                    .sort(function (a, b) { return a.createdAt - b.createdAt; });
                for (var _a = 0, lowPriorityAllocations_1 = lowPriorityAllocations; _a < lowPriorityAllocations_1.length; _a++) {
                    var allocation = lowPriorityAllocations_1[_a];
                    if (node.availableStorage >= allocation.spaceAllocated) {
                        // Move allocation to more efficient node
                        this_1.deallocateStorage(allocation.id);
                        this_1.allocateStorage(node.id, allocation.optimizationId, allocation.spaceAllocated, allocation.purpose, allocation.priority, allocation.expiresAt);
                        break;
                    }
                }
            }
        };
        var this_1 = this;
        // Rebalance storage based on efficiency
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            _loop_1(node);
        }
    };
    /**
     * Get system-wide statistics
     */
    AdvancedNodeManager.prototype.getSystemStats = function () {
        var nodes = this.getAllNodes();
        var tasks = Array.from(this.optimizationTasks.values());
        var allocations = Array.from(this.storageAllocations.values());
        return {
            totalNodes: nodes.length,
            activeNodes: nodes.filter(function (node) { return node.status === 'active'; }).length,
            totalStorage: nodes.reduce(function (sum, node) { return sum + node.storageCapacity; }, 0),
            usedStorage: nodes.reduce(function (sum, node) { return sum + node.usedStorage; }, 0),
            availableStorage: nodes.reduce(function (sum, node) { return sum + node.availableStorage; }, 0),
            totalComputePower: nodes.reduce(function (sum, node) { return sum + node.computePower; }, 0),
            totalTasks: tasks.length,
            completedTasks: tasks.filter(function (task) { return task.status === 'completed'; }).length,
            totalSpaceProcessed: tasks.reduce(function (sum, task) { return sum + task.spaceSaved; }, 0),
            totalTokensEarned: tasks.reduce(function (sum, task) { return sum + task.tokensEarned; }, 0),
            dailyRewardsEstimate: this.getDailyRewardsEstimate(),
            storageUtilization: nodes.length > 0 ?
                (nodes.reduce(function (sum, node) { return sum + node.usedStorage; }, 0) /
                    nodes.reduce(function (sum, node) { return sum + node.storageCapacity; }, 0)) * 100 : 0
        };
    };
    /**
     * Get all tasks
     */
    AdvancedNodeManager.prototype.getAllTasks = function () {
        return Array.from(this.optimizationTasks.values());
    };
    return AdvancedNodeManager;
}());
exports.AdvancedNodeManager = AdvancedNodeManager;
// Export singleton instance
exports.advancedNodeManager = new AdvancedNodeManager();
