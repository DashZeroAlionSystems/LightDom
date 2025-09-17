"use strict";
/**
 * Storage Optimizer
 * Manages storage optimization, cleanup, and maintenance for mining nodes
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
exports.storageOptimizer = exports.StorageOptimizer = void 0;
var events_1 = require("events");
var StorageNodeManager_1 = require("./StorageNodeManager");
var StorageOptimizer = /** @class */ (function (_super) {
    __extends(StorageOptimizer, _super);
    function StorageOptimizer(policy) {
        var _this = _super.call(this) || this;
        _this.optimizations = new Map();
        _this.isRunning = false;
        _this.optimizationInterval = null;
        _this.policy = __assign({ maxStorageUsage: 85, cleanupThreshold: 75, compressionThreshold: 60, archivalThreshold: 80, retentionPeriod: 30, enableCompression: true, enableDeduplication: true, enableArchival: true, enableMigration: false, compressionLevel: 6, archivalFormat: 'zip' }, policy);
        _this.cleanupStrategies = _this.initializeCleanupStrategies();
        _this.setupEventHandlers();
        return _this;
    }
    /**
     * Initialize the storage optimizer
     */
    StorageOptimizer.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('🔧 Initializing Storage Optimizer...');
                try {
                    // Start optimization monitoring
                    this.startOptimizationMonitoring();
                    this.isRunning = true;
                    this.emit('initialized');
                    console.log('✅ Storage Optimizer initialized successfully');
                }
                catch (error) {
                    console.error('❌ Failed to initialize Storage Optimizer:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Start optimization monitoring
     */
    StorageOptimizer.prototype.startOptimizationMonitoring = function () {
        var _this = this;
        this.optimizationInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isRunning)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.checkAndOptimizeNodes()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Storage optimization monitoring error:', error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); }, 60000); // Check every minute
    };
    /**
     * Check and optimize nodes that need optimization
     */
    StorageOptimizer.prototype.checkAndOptimizeNodes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var nodes, _i, nodes_1, node, utilizationRate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nodes = StorageNodeManager_1.storageNodeManager.getAllNodes();
                        _i = 0, nodes_1 = nodes;
                        _a.label = 1;
                    case 1:
                        if (!(_i < nodes_1.length)) return [3 /*break*/, 4];
                        node = nodes_1[_i];
                        if (node.status !== 'active')
                            return [3 /*break*/, 3];
                        utilizationRate = (node.used / node.capacity) * 100;
                        if (!(utilizationRate >= this.policy.cleanupThreshold)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.optimizeNode(node)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Optimize a specific node
     */
    StorageOptimizer.prototype.optimizeNode = function (node) {
        return __awaiter(this, void 0, void 0, function () {
            var optimizationId, optimization, utilizationRate, optimizationType, results, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        optimizationId = "opt_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
                        optimization = {
                            id: optimizationId,
                            nodeId: node.id,
                            type: 'cleanup',
                            status: 'pending',
                            spaceSaved: 0,
                            spaceBefore: node.used,
                            spaceAfter: node.used,
                            optimizationRate: 0,
                            createdAt: new Date(),
                            details: {
                                targetsProcessed: 0,
                                filesCompressed: 0,
                                duplicatesRemoved: 0,
                                archivesCreated: 0,
                                migrationsCompleted: 0,
                                performanceImpact: 'low',
                                estimatedTimeRemaining: 0
                            }
                        };
                        this.optimizations.set(optimizationId, optimization);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        optimization.status = 'running';
                        optimization.startedAt = new Date();
                        this.emit('optimizationStarted', optimization);
                        console.log("\uD83D\uDD27 Starting optimization for node ".concat(node.name, " (").concat(node.id, ")"));
                        utilizationRate = (node.used / node.capacity) * 100;
                        optimizationType = void 0;
                        if (utilizationRate >= this.policy.archivalThreshold) {
                            optimizationType = 'archival';
                        }
                        else if (utilizationRate >= this.policy.compressionThreshold) {
                            optimizationType = 'compression';
                        }
                        else {
                            optimizationType = 'cleanup';
                        }
                        optimization.type = optimizationType;
                        return [4 /*yield*/, this.executeOptimization(node, optimizationType)];
                    case 2:
                        results = _a.sent();
                        // Update optimization results
                        optimization.spaceSaved = results.spaceSaved;
                        optimization.spaceAfter = node.used - results.spaceSaved;
                        optimization.optimizationRate = results.spaceSaved > 0 ?
                            (results.spaceSaved / optimization.spaceBefore) * 100 : 0;
                        optimization.details = results.details;
                        optimization.status = 'completed';
                        optimization.completedAt = new Date();
                        // Update node storage
                        node.used = optimization.spaceAfter;
                        node.available = node.capacity - node.used;
                        this.emit('optimizationCompleted', optimization);
                        console.log("\u2705 Optimization completed for node ".concat(node.name, ": ").concat(optimization.spaceSaved, "MB saved"));
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        optimization.status = 'failed';
                        optimization.error = error_2 instanceof Error ? error_2.message : String(error_2);
                        optimization.completedAt = new Date();
                        this.emit('optimizationFailed', optimization);
                        console.error("\u274C Optimization failed for node ".concat(node.name, ": ").concat(optimization.error));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, optimization];
                }
            });
        });
    };
    /**
     * Execute optimization based on type
     */
    StorageOptimizer.prototype.executeOptimization = function (node, type) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = type;
                        switch (_a) {
                            case 'cleanup': return [3 /*break*/, 1];
                            case 'compression': return [3 /*break*/, 3];
                            case 'deduplication': return [3 /*break*/, 5];
                            case 'archival': return [3 /*break*/, 7];
                            case 'migration': return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 11];
                    case 1: return [4 /*yield*/, this.executeCleanup(node)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.executeCompression(node)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.executeDeduplication(node)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.executeArchival(node)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9: return [4 /*yield*/, this.executeMigration(node)];
                    case 10: return [2 /*return*/, _b.sent()];
                    case 11: throw new Error("Unknown optimization type: ".concat(type));
                }
            });
        });
    };
    /**
     * Execute cleanup optimization
     */
    StorageOptimizer.prototype.executeCleanup = function (node) {
        return __awaiter(this, void 0, void 0, function () {
            var spaceBefore, targetsProcessed, spaceSaved, cutoffTime, oldTargets, _i, oldTargets_1, target;
            return __generator(this, function (_a) {
                console.log("\uD83E\uDDF9 Executing cleanup for node ".concat(node.name));
                spaceBefore = node.used;
                targetsProcessed = 0;
                spaceSaved = 0;
                cutoffTime = new Date(Date.now() - this.policy.retentionPeriod * 24 * 60 * 60 * 1000);
                oldTargets = node.miningTargets.filter(function (target) {
                    return target.status === 'completed' &&
                        target.completedAt &&
                        target.completedAt < cutoffTime;
                });
                for (_i = 0, oldTargets_1 = oldTargets; _i < oldTargets_1.length; _i++) {
                    target = oldTargets_1[_i];
                    // Remove target data (simplified)
                    spaceSaved += target.spaceSaved / 1024; // Convert KB to MB
                    targetsProcessed++;
                }
                // Remove old targets from node
                node.miningTargets = node.miningTargets.filter(function (target) {
                    return !oldTargets.includes(target);
                });
                return [2 /*return*/, {
                        spaceSaved: spaceSaved,
                        details: {
                            targetsProcessed: targetsProcessed,
                            filesCompressed: 0,
                            duplicatesRemoved: 0,
                            archivesCreated: 0,
                            migrationsCompleted: 0,
                            performanceImpact: 'low',
                            estimatedTimeRemaining: 0
                        }
                    }];
            });
        });
    };
    /**
     * Execute compression optimization
     */
    StorageOptimizer.prototype.executeCompression = function (node) {
        return __awaiter(this, void 0, void 0, function () {
            var spaceSaved, filesCompressed, _i, _a, target, compressionRate, additionalSavings;
            return __generator(this, function (_b) {
                console.log("\uD83D\uDDDC\uFE0F Executing compression for node ".concat(node.name));
                spaceSaved = 0;
                filesCompressed = 0;
                // Simulate compression of mining targets
                for (_i = 0, _a = node.miningTargets; _i < _a.length; _i++) {
                    target = _a[_i];
                    if (target.status === 'completed' && target.spaceSaved > 0) {
                        compressionRate = 0.2 + Math.random() * 0.2;
                        additionalSavings = (target.spaceSaved / 1024) * compressionRate;
                        spaceSaved += additionalSavings;
                        filesCompressed++;
                    }
                }
                return [2 /*return*/, {
                        spaceSaved: spaceSaved,
                        details: {
                            targetsProcessed: 0,
                            filesCompressed: filesCompressed,
                            duplicatesRemoved: 0,
                            archivesCreated: 0,
                            migrationsCompleted: 0,
                            performanceImpact: 'medium',
                            estimatedTimeRemaining: 0
                        }
                    }];
            });
        });
    };
    /**
     * Execute deduplication optimization
     */
    StorageOptimizer.prototype.executeDeduplication = function (node) {
        return __awaiter(this, void 0, void 0, function () {
            var spaceSaved, duplicatesRemoved, domainGroups, _i, _a, target, domain, _loop_1, _b, domainGroups_1, _c, domain, targets;
            return __generator(this, function (_d) {
                console.log("\uD83D\uDD04 Executing deduplication for node ".concat(node.name));
                spaceSaved = 0;
                duplicatesRemoved = 0;
                domainGroups = new Map();
                for (_i = 0, _a = node.miningTargets; _i < _a.length; _i++) {
                    target = _a[_i];
                    domain = target.domain;
                    if (!domainGroups.has(domain)) {
                        domainGroups.set(domain, []);
                    }
                    domainGroups.get(domain).push(target);
                }
                _loop_1 = function (domain, targets) {
                    if (targets.length > 1) {
                        // Sort by completion date (most recent first)
                        targets.sort(function (a, b) {
                            var _a, _b;
                            var aTime = ((_a = a.completedAt) === null || _a === void 0 ? void 0 : _a.getTime()) || 0;
                            var bTime = ((_b = b.completedAt) === null || _b === void 0 ? void 0 : _b.getTime()) || 0;
                            return bTime - aTime;
                        });
                        // Keep the first (most recent) and remove the rest
                        var duplicates_2 = targets.slice(1);
                        for (var _e = 0, duplicates_1 = duplicates_2; _e < duplicates_1.length; _e++) {
                            var duplicate = duplicates_1[_e];
                            spaceSaved += duplicate.spaceSaved / 1024; // Convert KB to MB
                            duplicatesRemoved++;
                        }
                        // Remove duplicates from node
                        node.miningTargets = node.miningTargets.filter(function (target) { return !duplicates_2.includes(target); });
                    }
                };
                // Remove duplicates (keep the most recent one)
                for (_b = 0, domainGroups_1 = domainGroups; _b < domainGroups_1.length; _b++) {
                    _c = domainGroups_1[_b], domain = _c[0], targets = _c[1];
                    _loop_1(domain, targets);
                }
                return [2 /*return*/, {
                        spaceSaved: spaceSaved,
                        details: {
                            targetsProcessed: 0,
                            filesCompressed: 0,
                            duplicatesRemoved: duplicatesRemoved,
                            archivesCreated: 0,
                            migrationsCompleted: 0,
                            performanceImpact: 'low',
                            estimatedTimeRemaining: 0
                        }
                    }];
            });
        });
    };
    /**
     * Execute archival optimization
     */
    StorageOptimizer.prototype.executeArchival = function (node) {
        return __awaiter(this, void 0, void 0, function () {
            var spaceSaved, archivesCreated, cutoffTime, oldTargets, archivalRate_1, _i, oldTargets_2, target;
            return __generator(this, function (_a) {
                console.log("\uD83D\uDCE6 Executing archival for node ".concat(node.name));
                spaceSaved = 0;
                archivesCreated = 0;
                cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                oldTargets = node.miningTargets.filter(function (target) {
                    return target.status === 'completed' &&
                        target.completedAt &&
                        target.completedAt < cutoffTime;
                });
                if (oldTargets.length > 0) {
                    archivalRate_1 = 0.5 + Math.random() * 0.2;
                    spaceSaved = oldTargets.reduce(function (total, target) {
                        return total + (target.spaceSaved / 1024) * archivalRate_1;
                    }, 0);
                    archivesCreated = Math.ceil(oldTargets.length / 10); // Group into archives
                    // Mark targets as archived (simplified)
                    for (_i = 0, oldTargets_2 = oldTargets; _i < oldTargets_2.length; _i++) {
                        target = oldTargets_2[_i];
                        target.metadata.biomeType = 'archived';
                    }
                }
                return [2 /*return*/, {
                        spaceSaved: spaceSaved,
                        details: {
                            targetsProcessed: 0,
                            filesCompressed: 0,
                            duplicatesRemoved: 0,
                            archivesCreated: archivesCreated,
                            migrationsCompleted: 0,
                            performanceImpact: 'high',
                            estimatedTimeRemaining: 0
                        }
                    }];
            });
        });
    };
    /**
     * Execute migration optimization
     */
    StorageOptimizer.prototype.executeMigration = function (node) {
        return __awaiter(this, void 0, void 0, function () {
            var spaceSaved;
            return __generator(this, function (_a) {
                console.log("\uD83D\uDE9A Executing migration for node ".concat(node.name));
                spaceSaved = Math.random() * 10;
                return [2 /*return*/, {
                        spaceSaved: spaceSaved,
                        details: {
                            targetsProcessed: 0,
                            filesCompressed: 0,
                            duplicatesRemoved: 0,
                            archivesCreated: 0,
                            migrationsCompleted: 1,
                            performanceImpact: 'medium',
                            estimatedTimeRemaining: 0
                        }
                    }];
            });
        });
    };
    /**
     * Get storage metrics
     */
    StorageOptimizer.prototype.getStorageMetrics = function () {
        var nodes = StorageNodeManager_1.storageNodeManager.getAllNodes();
        var optimizations = Array.from(this.optimizations.values());
        var totalCapacity = nodes.reduce(function (total, node) { return total + node.capacity; }, 0);
        var totalUsed = nodes.reduce(function (total, node) { return total + node.used; }, 0);
        var totalAvailable = totalCapacity - totalUsed;
        var utilizationRate = totalCapacity > 0 ? (totalUsed / totalCapacity) * 100 : 0;
        var completedOptimizations = optimizations.filter(function (opt) { return opt.status === 'completed'; });
        var optimizationRate = completedOptimizations.length > 0 ?
            completedOptimizations.reduce(function (total, opt) { return total + opt.optimizationRate; }, 0) / completedOptimizations.length : 0;
        var spaceSaved = completedOptimizations.reduce(function (total, opt) { return total + opt.spaceSaved; }, 0);
        var nodesOptimized = new Set(completedOptimizations.map(function (opt) { return opt.nodeId; })).size;
        var averageOptimizationTime = completedOptimizations.length > 0 ?
            completedOptimizations.reduce(function (total, opt) {
                if (opt.startedAt && opt.completedAt) {
                    return total + (opt.completedAt.getTime() - opt.startedAt.getTime()) / (1000 * 60);
                }
                return total;
            }, 0) / completedOptimizations.length : 0;
        var topOptimizations = completedOptimizations
            .sort(function (a, b) { return b.spaceSaved - a.spaceSaved; })
            .slice(0, 10);
        var nodeUtilization = new Map();
        for (var _i = 0, nodes_2 = nodes; _i < nodes_2.length; _i++) {
            var node = nodes_2[_i];
            var utilization = (node.used / node.capacity) * 100;
            nodeUtilization.set(node.id, utilization);
        }
        return {
            totalCapacity: totalCapacity,
            totalUsed: totalUsed,
            totalAvailable: totalAvailable,
            utilizationRate: utilizationRate,
            optimizationRate: optimizationRate,
            spaceSaved: spaceSaved,
            nodesOptimized: nodesOptimized,
            optimizationsCompleted: completedOptimizations.length,
            averageOptimizationTime: averageOptimizationTime,
            topOptimizations: topOptimizations,
            nodeUtilization: nodeUtilization
        };
    };
    /**
     * Get optimization by ID
     */
    StorageOptimizer.prototype.getOptimization = function (optimizationId) {
        return this.optimizations.get(optimizationId);
    };
    /**
     * Get all optimizations
     */
    StorageOptimizer.prototype.getAllOptimizations = function () {
        return Array.from(this.optimizations.values());
    };
    /**
     * Get optimizations by node
     */
    StorageOptimizer.prototype.getOptimizationsByNode = function (nodeId) {
        return Array.from(this.optimizations.values()).filter(function (opt) { return opt.nodeId === nodeId; });
    };
    /**
     * Get optimizations by status
     */
    StorageOptimizer.prototype.getOptimizationsByStatus = function (status) {
        return Array.from(this.optimizations.values()).filter(function (opt) { return opt.status === status; });
    };
    /**
     * Initialize cleanup strategies
     */
    StorageOptimizer.prototype.initializeCleanupStrategies = function () {
        return [
            {
                name: 'Old Data Cleanup',
                description: 'Remove data older than retention period',
                priority: 'high',
                spaceSavings: 100,
                timeRequired: 5,
                riskLevel: 'low',
                conditions: [
                    {
                        type: 'age',
                        operator: 'greater_than',
                        value: this.policy.retentionPeriod,
                        unit: 'days'
                    }
                ]
            },
            {
                name: 'Duplicate Removal',
                description: 'Remove duplicate mining targets',
                priority: 'medium',
                spaceSavings: 50,
                timeRequired: 10,
                riskLevel: 'low',
                conditions: [
                    {
                        type: 'duplicate',
                        operator: 'equals',
                        value: true
                    }
                ]
            },
            {
                name: 'Compression',
                description: 'Compress stored data',
                priority: 'medium',
                spaceSavings: 200,
                timeRequired: 15,
                riskLevel: 'low',
                conditions: [
                    {
                        type: 'size',
                        operator: 'greater_than',
                        value: 1000,
                        unit: 'mb'
                    }
                ]
            },
            {
                name: 'Archival',
                description: 'Archive old data to compressed format',
                priority: 'low',
                spaceSavings: 500,
                timeRequired: 30,
                riskLevel: 'medium',
                conditions: [
                    {
                        type: 'age',
                        operator: 'greater_than',
                        value: 7,
                        unit: 'days'
                    }
                ]
            }
        ];
    };
    /**
     * Get cleanup strategies
     */
    StorageOptimizer.prototype.getCleanupStrategies = function () {
        return this.cleanupStrategies;
    };
    /**
     * Update storage policy
     */
    StorageOptimizer.prototype.updatePolicy = function (newPolicy) {
        this.policy = __assign(__assign({}, this.policy), newPolicy);
        this.emit('policyUpdated', this.policy);
        console.log('📋 Storage policy updated');
    };
    /**
     * Get current policy
     */
    StorageOptimizer.prototype.getPolicy = function () {
        return __assign({}, this.policy);
    };
    /**
     * Setup event handlers
     */
    StorageOptimizer.prototype.setupEventHandlers = function () {
        this.on('optimizationStarted', function (optimization) {
            console.log("\uD83D\uDD27 Optimization started: ".concat(optimization.type, " for node ").concat(optimization.nodeId));
        });
        this.on('optimizationCompleted', function (optimization) {
            console.log("\u2705 Optimization completed: ".concat(optimization.spaceSaved, "MB saved"));
        });
        this.on('optimizationFailed', function (optimization) {
            console.error("\u274C Optimization failed: ".concat(optimization.error));
        });
        this.on('policyUpdated', function (policy) {
            console.log('📋 Storage policy updated');
        });
    };
    /**
     * Stop the storage optimizer
     */
    StorageOptimizer.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('🛑 Stopping Storage Optimizer...');
                this.isRunning = false;
                if (this.optimizationInterval) {
                    clearInterval(this.optimizationInterval);
                    this.optimizationInterval = null;
                }
                this.emit('stopped');
                console.log('✅ Storage Optimizer stopped');
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get status
     */
    StorageOptimizer.prototype.getStatus = function () {
        var allOptimizations = Array.from(this.optimizations.values());
        var activeOptimizations = allOptimizations.filter(function (opt) { return opt.status === 'running'; });
        return {
            running: this.isRunning,
            totalOptimizations: allOptimizations.length,
            activeOptimizations: activeOptimizations.length
        };
    };
    return StorageOptimizer;
}(events_1.EventEmitter));
exports.StorageOptimizer = StorageOptimizer;
// Export singleton instance
exports.storageOptimizer = new StorageOptimizer();
