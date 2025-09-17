"use strict";
/**
 * Space Optimization Engine - Core implementation for tracking and monetizing 1KB optimizations
 * This is the heart of the LightDom space optimization system
 * Enhanced with advanced node management and storage utilization
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
exports.spaceOptimizationEngine = exports.SpaceOptimizationEngine = void 0;
var AdvancedNodeManager_1 = require("./AdvancedNodeManager");
var SpaceOptimizationEngine = /** @class */ (function () {
    function SpaceOptimizationEngine() {
        this.optimizations = new Map();
        this.harvesters = new Map();
        this.metaverseAssets = new Map();
        // Token economics constants
        this.BASE_SPACE_RATE = 1000; // 1 KB = 0.001 DSH base
        this.SPACE_MULTIPLIER = 100; // Can be adjusted
        this.MIN_OPTIMIZATION_KB = 1; // Minimum 1KB to qualify
        // Metaverse generation thresholds
        this.LAND_THRESHOLD_KB = 100; // 1 land parcel per 100KB
        this.AI_NODE_THRESHOLD_KB = 1000; // 1 AI node per 1000KB
        this.STORAGE_SHARD_THRESHOLD_KB = 500; // 1 shard per 500KB
        this.BRIDGE_THRESHOLD_KB = 2000; // 1 bridge per 2000KB
        // Reputation multipliers
        this.REPUTATION_MULTIPLIERS = {
            10000: 5.0, // 5x for top harvesters
            5000: 3.0, // 3x multiplier
            1000: 2.0, // 2x multiplier
            100: 1.5, // 1.5x multiplier
            0: 1.0 // 1x base multiplier
        };
        this.initializeDefaultHarvesters();
    }
    /**
     * Process a space optimization and generate all associated rewards
     */
    SpaceOptimizationEngine.prototype.processOptimization = function (optimization) {
        return __awaiter(this, void 0, void 0, function () {
            var spaceKB, harvesterAddress, harvesterStats, qualityScore, reputationMultiplier, baseTokens, tokenReward, metaverseAssets, result;
            var _this = this;
            return __generator(this, function (_a) {
                // Validate optimization
                if (!optimization.url || !optimization.spaceSavedBytes || optimization.spaceSavedBytes < 1024) {
                    throw new Error('Invalid optimization: must save at least 1KB');
                }
                spaceKB = Math.floor(optimization.spaceSavedBytes / 1024);
                harvesterAddress = optimization.harvesterAddress || '0x0000000000000000000000000000000000000000';
                harvesterStats = this.getOrCreateHarvester(harvesterAddress);
                qualityScore = this.calculateQualityScore(optimization);
                reputationMultiplier = this.getReputationMultiplier(harvesterStats.reputation);
                baseTokens = (spaceKB * this.SPACE_MULTIPLIER) / this.BASE_SPACE_RATE;
                tokenReward = baseTokens * reputationMultiplier * (qualityScore / 100);
                metaverseAssets = this.generateMetaverseAssets(spaceKB, optimization.biomeType || 'digital', optimization.url);
                result = {
                    url: optimization.url,
                    spaceSavedBytes: optimization.spaceSavedBytes,
                    spaceSavedKB: spaceKB,
                    optimizationType: optimization.optimizationType || 'light-dom',
                    biomeType: optimization.biomeType || 'digital',
                    timestamp: Date.now(),
                    harvesterAddress: harvesterAddress,
                    proofHash: optimization.proofHash || this.generateProofHash(optimization),
                    beforeHash: optimization.beforeHash || '',
                    afterHash: optimization.afterHash || '',
                    qualityScore: qualityScore,
                    reputationMultiplier: reputationMultiplier,
                    tokenReward: tokenReward,
                    metaverseAssets: metaverseAssets
                };
                // Store optimization
                this.optimizations.set(result.proofHash, result);
                // Update harvester stats
                this.updateHarvesterStats(harvesterAddress, result);
                // Store metaverse assets
                metaverseAssets.forEach(function (asset) {
                    _this.metaverseAssets.set(asset.id, asset);
                });
                return [2 /*return*/, result];
            });
        });
    };
    /**
     * Calculate quality score based on optimization characteristics
     */
    SpaceOptimizationEngine.prototype.calculateQualityScore = function (optimization) {
        var score = 50; // Base score
        // Size bonus (larger optimizations get higher scores)
        var spaceKB = Math.floor((optimization.spaceSavedBytes || 0) / 1024);
        if (spaceKB >= 100)
            score += 20;
        else if (spaceKB >= 50)
            score += 15;
        else if (spaceKB >= 10)
            score += 10;
        else if (spaceKB >= 5)
            score += 5;
        // Optimization type bonus
        var type = optimization.optimizationType || '';
        if (type.includes('ai'))
            score += 15;
        if (type.includes('critical'))
            score += 10;
        if (type.includes('lazy'))
            score += 5;
        // Biome type bonus
        var biome = optimization.biomeType || '';
        if (biome === 'professional')
            score += 10;
        if (biome === 'commercial')
            score += 8;
        if (biome === 'knowledge')
            score += 6;
        return Math.min(100, Math.max(0, score));
    };
    /**
     * Get reputation multiplier for harvester
     */
    SpaceOptimizationEngine.prototype.getReputationMultiplier = function (reputation) {
        for (var _i = 0, _a = Object.entries(this.REPUTATION_MULTIPLIERS).sort(function (a, b) { return Number(b[0]) - Number(a[0]); }); _i < _a.length; _i++) {
            var _b = _a[_i], threshold = _b[0], multiplier = _b[1];
            if (reputation >= Number(threshold)) {
                return multiplier;
            }
        }
        return 1.0;
    };
    /**
     * Generate metaverse assets based on space saved
     */
    SpaceOptimizationEngine.prototype.generateMetaverseAssets = function (spaceKB, biomeType, sourceUrl) {
        var assets = [];
        // Generate land parcels (1 per 100KB)
        var landParcels = Math.floor(spaceKB / this.LAND_THRESHOLD_KB);
        for (var i = 0; i < landParcels; i++) {
            assets.push({
                type: 'land',
                id: "land_".concat(Date.now(), "_").concat(i),
                biomeType: biomeType,
                size: 100, // 100 square meters per parcel
                stakingRewards: this.getBiomeStakingRate(biomeType),
                developmentLevel: 1,
                sourceUrl: sourceUrl
            });
        }
        // Generate AI nodes (1 per 1000KB)
        var aiNodes = Math.floor(spaceKB / this.AI_NODE_THRESHOLD_KB);
        for (var i = 0; i < aiNodes; i++) {
            assets.push({
                type: 'ai_node',
                id: "ai_node_".concat(Date.now(), "_").concat(i),
                biomeType: biomeType,
                size: spaceKB,
                stakingRewards: spaceKB * 0.1, // 0.1 DSH per KB per day
                developmentLevel: 1,
                sourceUrl: sourceUrl
            });
        }
        // Generate storage shards (1 per 500KB)
        var storageShards = Math.floor(spaceKB / this.STORAGE_SHARD_THRESHOLD_KB);
        for (var i = 0; i < storageShards; i++) {
            assets.push({
                type: 'storage_shard',
                id: "storage_".concat(Date.now(), "_").concat(i),
                biomeType: biomeType,
                size: spaceKB,
                stakingRewards: spaceKB * 0.05, // 0.05 DSH per KB per day
                developmentLevel: 1,
                sourceUrl: sourceUrl
            });
        }
        // Generate bridges (1 per 2000KB)
        var bridges = Math.floor(spaceKB / this.BRIDGE_THRESHOLD_KB);
        for (var i = 0; i < bridges; i++) {
            assets.push({
                type: 'bridge',
                id: "bridge_".concat(Date.now(), "_").concat(i),
                biomeType: biomeType,
                size: spaceKB,
                stakingRewards: spaceKB * 0.02, // 0.02 DSH per KB per day
                developmentLevel: 1,
                sourceUrl: sourceUrl
            });
        }
        return assets;
    };
    /**
     * Get staking rate for biome type
     */
    SpaceOptimizationEngine.prototype.getBiomeStakingRate = function (biomeType) {
        var rates = {
            'production': 3.0,
            'professional': 2.5,
            'commercial': 2.0,
            'social': 1.8,
            'knowledge': 1.5,
            'community': 1.3,
            'entertainment': 1.2,
            'digital': 1.0
        };
        return rates[biomeType] || 1.0;
    };
    /**
     * Generate proof hash for optimization
     */
    SpaceOptimizationEngine.prototype.generateProofHash = function (optimization) {
        var data = "".concat(optimization.url, "_").concat(optimization.spaceSavedBytes, "_").concat(Date.now());
        return this.simpleHash(data);
    };
    /**
     * Simple hash function (in production, use crypto.subtle.digest)
     */
    SpaceOptimizationEngine.prototype.simpleHash = function (data) {
        var hash = 0;
        for (var i = 0; i < data.length; i++) {
            var char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    };
    /**
     * Get or create harvester stats
     */
    SpaceOptimizationEngine.prototype.getOrCreateHarvester = function (address) {
        if (!this.harvesters.has(address)) {
            this.harvesters.set(address, {
                address: address,
                reputation: 0,
                totalSpaceHarvested: 0,
                totalTokensEarned: 0,
                optimizationCount: 0,
                landParcels: 0,
                aiNodes: 0,
                storageShards: 0,
                bridges: 0,
                stakingRewards: 0
            });
        }
        return this.harvesters.get(address);
    };
    /**
     * Update harvester stats after optimization
     */
    SpaceOptimizationEngine.prototype.updateHarvesterStats = function (address, result) {
        var stats = this.harvesters.get(address);
        stats.totalSpaceHarvested += result.spaceSavedBytes;
        stats.totalTokensEarned += result.tokenReward;
        stats.optimizationCount++;
        stats.reputation += result.spaceSavedKB; // 1 reputation point per KB
        // Count metaverse assets
        result.metaverseAssets.forEach(function (asset) {
            switch (asset.type) {
                case 'land':
                    stats.landParcels++;
                    break;
                case 'ai_node':
                    stats.aiNodes++;
                    break;
                case 'storage_shard':
                    stats.storageShards++;
                    break;
                case 'bridge':
                    stats.bridges++;
                    break;
            }
        });
    };
    /**
     * Initialize default harvesters for testing
     */
    SpaceOptimizationEngine.prototype.initializeDefaultHarvesters = function () {
        var _this = this;
        var defaultHarvesters = [
            '0x1234567890123456789012345678901234567890',
            '0x2345678901234567890123456789012345678901',
            '0x3456789012345678901234567890123456789012'
        ];
        defaultHarvesters.forEach(function (address) {
            _this.getOrCreateHarvester(address);
        });
    };
    /**
     * Get all optimizations
     */
    SpaceOptimizationEngine.prototype.getOptimizations = function () {
        return Array.from(this.optimizations.values());
    };
    /**
     * Get harvester stats
     */
    SpaceOptimizationEngine.prototype.getHarvesterStats = function (address) {
        return this.harvesters.get(address);
    };
    /**
     * Get all harvesters
     */
    SpaceOptimizationEngine.prototype.getAllHarvesters = function () {
        return Array.from(this.harvesters.values());
    };
    /**
     * Get metaverse assets
     */
    SpaceOptimizationEngine.prototype.getMetaverseAssets = function () {
        return Array.from(this.metaverseAssets.values());
    };
    /**
     * Get optimization by proof hash
     */
    SpaceOptimizationEngine.prototype.getOptimization = function (proofHash) {
        return this.optimizations.get(proofHash);
    };
    /**
     * Calculate total space harvested
     */
    SpaceOptimizationEngine.prototype.getTotalSpaceHarvested = function () {
        return Array.from(this.optimizations.values())
            .reduce(function (total, opt) { return total + opt.spaceSavedBytes; }, 0);
    };
    /**
     * Calculate total tokens distributed
     */
    SpaceOptimizationEngine.prototype.getTotalTokensDistributed = function () {
        return Array.from(this.optimizations.values())
            .reduce(function (total, opt) { return total + opt.tokenReward; }, 0);
    };
    /**
     * Get metaverse statistics
     */
    SpaceOptimizationEngine.prototype.getMetaverseStats = function () {
        var assets = this.getMetaverseAssets();
        return {
            totalLand: assets.filter(function (a) { return a.type === 'land'; }).length,
            totalAINodes: assets.filter(function (a) { return a.type === 'ai_node'; }).length,
            totalStorageShards: assets.filter(function (a) { return a.type === 'storage_shard'; }).length,
            totalBridges: assets.filter(function (a) { return a.type === 'bridge'; }).length,
            totalStakingRewards: assets.reduce(function (total, asset) { return total + asset.stakingRewards; }, 0)
        };
    };
    /**
     * ADVANCED OPTIMIZATION METHODS
     * New ways to optimize and use 1KB of data
     */
    /**
     * Create a new optimization node from mined storage
     */
    SpaceOptimizationEngine.prototype.createOptimizationNode = function (spaceKB, biomeType, nodeType, sourceOptimizations) {
        if (nodeType === void 0) { nodeType = 'optimization'; }
        if (sourceOptimizations === void 0) { sourceOptimizations = []; }
        return AdvancedNodeManager_1.advancedNodeManager.createNode(nodeType, spaceKB, biomeType, sourceOptimizations);
    };
    /**
     * Allocate storage for specific optimization purposes
     */
    SpaceOptimizationEngine.prototype.allocateStorageForOptimization = function (nodeId, optimizationId, spaceKB, purpose, priority) {
        if (purpose === void 0) { purpose = 'optimization'; }
        if (priority === void 0) { priority = 'medium'; }
        return AdvancedNodeManager_1.advancedNodeManager.allocateStorage(nodeId, optimizationId, spaceKB, purpose, priority);
    };
    /**
     * Create an optimization task to process more websites
     */
    SpaceOptimizationEngine.prototype.createOptimizationTask = function (nodeId, taskType, targetUrl) {
        return AdvancedNodeManager_1.advancedNodeManager.createOptimizationTask(nodeId, taskType, targetUrl);
    };
    /**
     * Process multiple optimization tasks in parallel
     */
    SpaceOptimizationEngine.prototype.processOptimizationTasks = function (taskIds) {
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, taskIds_1, taskId, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = [];
                        _i = 0, taskIds_1 = taskIds;
                        _a.label = 1;
                    case 1:
                        if (!(_i < taskIds_1.length)) return [3 /*break*/, 6];
                        taskId = taskIds_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, AdvancedNodeManager_1.advancedNodeManager.processOptimizationTask(taskId)];
                    case 3:
                        result = _a.sent();
                        results.push(result);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error("Error processing task ".concat(taskId, ":"), error_1);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * Scale up an existing node with additional storage
     */
    SpaceOptimizationEngine.prototype.scaleUpNode = function (nodeId, additionalSpaceKB) {
        return AdvancedNodeManager_1.advancedNodeManager.scaleUpNode(nodeId, additionalSpaceKB);
    };
    /**
     * Merge multiple nodes into a more powerful node
     */
    SpaceOptimizationEngine.prototype.mergeNodes = function (nodeIds, newType) {
        if (newType === void 0) { newType = 'optimization'; }
        return AdvancedNodeManager_1.advancedNodeManager.mergeNodes(nodeIds, newType);
    };
    /**
     * Get all optimization nodes
     */
    SpaceOptimizationEngine.prototype.getAllOptimizationNodes = function () {
        return AdvancedNodeManager_1.advancedNodeManager.getAllNodes();
    };
    /**
     * Get nodes by type
     */
    SpaceOptimizationEngine.prototype.getNodesByType = function (type) {
        return AdvancedNodeManager_1.advancedNodeManager.getNodesByType(type);
    };
    /**
     * Get node statistics
     */
    SpaceOptimizationEngine.prototype.getNodeStats = function (nodeId) {
        return AdvancedNodeManager_1.advancedNodeManager.getNodeStats(nodeId);
    };
    /**
     * Get system-wide node statistics
     */
    SpaceOptimizationEngine.prototype.getSystemNodeStats = function () {
        return AdvancedNodeManager_1.advancedNodeManager.getSystemStats();
    };
    /**
     * Optimize storage allocation across all nodes
     */
    SpaceOptimizationEngine.prototype.optimizeStorageAllocation = function () {
        AdvancedNodeManager_1.advancedNodeManager.optimizeStorageAllocation();
    };
    /**
     * Get available storage for new optimizations
     */
    SpaceOptimizationEngine.prototype.getAvailableStorageForOptimization = function () {
        return AdvancedNodeManager_1.advancedNodeManager.getTotalAvailableStorage();
    };
    /**
     * Get total compute power available
     */
    SpaceOptimizationEngine.prototype.getTotalComputePower = function () {
        return AdvancedNodeManager_1.advancedNodeManager.getTotalComputePower();
    };
    /**
     * Get daily rewards estimate from all nodes
     */
    SpaceOptimizationEngine.prototype.getDailyNodeRewardsEstimate = function () {
        return AdvancedNodeManager_1.advancedNodeManager.getDailyRewardsEstimate();
    };
    /**
     * Create a distributed optimization network
     */
    SpaceOptimizationEngine.prototype.createDistributedOptimizationNetwork = function (spaceKB, biomeType) {
        // Create different types of nodes based on available space
        var nodes = [];
        var remainingSpace = spaceKB;
        // Create AI consensus node (requires 1000KB)
        if (remainingSpace >= 1000) {
            var aiNode = this.createOptimizationNode(1000, biomeType, 'ai_consensus');
            nodes.push(aiNode);
            remainingSpace -= 1000;
        }
        // Create storage shards (500KB each)
        while (remainingSpace >= 500) {
            var storageNode = this.createOptimizationNode(500, biomeType, 'storage_shard');
            nodes.push(storageNode);
            remainingSpace -= 500;
        }
        // Create optimization nodes (100KB each)
        while (remainingSpace >= 100) {
            var optNode = this.createOptimizationNode(100, biomeType, 'optimization');
            nodes.push(optNode);
            remainingSpace -= 100;
        }
        // Create mining nodes with remaining space
        if (remainingSpace >= 300) {
            var miningNode = this.createOptimizationNode(remainingSpace, biomeType, 'mining');
            nodes.push(miningNode);
        }
        var totalStorage = nodes.reduce(function (sum, node) { return sum + node.storageCapacity; }, 0);
        var totalComputePower = nodes.reduce(function (sum, node) { return sum + node.computePower; }, 0);
        var estimatedDailyRewards = nodes.reduce(function (sum, node) {
            return sum + (node.usedStorage * node.rewardRate) / 1000;
        }, 0);
        return {
            nodes: nodes,
            totalStorage: totalStorage,
            totalComputePower: totalComputePower,
            estimatedDailyRewards: estimatedDailyRewards
        };
    };
    /**
     * Run continuous optimization on a node
     */
    SpaceOptimizationEngine.prototype.runContinuousOptimization = function (nodeId_1, targetUrls_1) {
        return __awaiter(this, arguments, void 0, function (nodeId, targetUrls, taskType) {
            var tasks, results, _i, targetUrls_2, url, task, batchSize, i, batch, batchResults;
            if (taskType === void 0) { taskType = 'dom_analysis'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tasks = [];
                        results = [];
                        // Create tasks for all target URLs
                        for (_i = 0, targetUrls_2 = targetUrls; _i < targetUrls_2.length; _i++) {
                            url = targetUrls_2[_i];
                            try {
                                task = this.createOptimizationTask(nodeId, taskType, url);
                                tasks.push(task);
                            }
                            catch (error) {
                                console.error("Error creating task for ".concat(url, ":"), error);
                            }
                        }
                        batchSize = 5;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < tasks.length)) return [3 /*break*/, 5];
                        batch = tasks.slice(i, i + batchSize);
                        return [4 /*yield*/, this.processOptimizationTasks(batch.map(function (task) { return task.id; }))];
                    case 2:
                        batchResults = _a.sent();
                        results.push.apply(results, batchResults);
                        // Small delay between batches
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 3:
                        // Small delay between batches
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i += batchSize;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * Get optimization recommendations based on available storage
     */
    SpaceOptimizationEngine.prototype.getOptimizationRecommendations = function (availableSpaceKB) {
        var recommendations = [];
        var remainingSpace = availableSpaceKB;
        var totalRewards = 0;
        // AI Consensus Node (highest priority)
        if (remainingSpace >= 1000) {
            var aiNode = AdvancedNodeManager_1.advancedNodeManager.createNode('ai_consensus', 1000, 'digital', []);
            recommendations.push({
                type: 'AI Consensus Node',
                storage: 1000,
                computePower: aiNode.computePower,
                dailyRewards: (1000 * aiNode.rewardRate) / 1000
            });
            totalRewards += (1000 * aiNode.rewardRate) / 1000;
            remainingSpace -= 1000;
        }
        // Storage Shards (medium priority)
        while (remainingSpace >= 500) {
            var storageNode = AdvancedNodeManager_1.advancedNodeManager.createNode('storage_shard', 500, 'digital', []);
            recommendations.push({
                type: 'Storage Shard',
                storage: 500,
                computePower: storageNode.computePower,
                dailyRewards: (500 * storageNode.rewardRate) / 1000
            });
            totalRewards += (500 * storageNode.rewardRate) / 1000;
            remainingSpace -= 500;
        }
        // Optimization Nodes (lower priority)
        while (remainingSpace >= 100) {
            var optNode = AdvancedNodeManager_1.advancedNodeManager.createNode('optimization', 100, 'digital', []);
            recommendations.push({
                type: 'Optimization Node',
                storage: 100,
                computePower: optNode.computePower,
                dailyRewards: (100 * optNode.rewardRate) / 1000
            });
            totalRewards += (100 * optNode.rewardRate) / 1000;
            remainingSpace -= 100;
        }
        var efficiency = availableSpaceKB > 0 ? (totalRewards / availableSpaceKB) * 1000 : 0;
        return {
            recommendedNodes: recommendations,
            totalEstimatedRewards: totalRewards,
            efficiency: efficiency
        };
    };
    return SpaceOptimizationEngine;
}());
exports.SpaceOptimizationEngine = SpaceOptimizationEngine;
// Export singleton instance
exports.spaceOptimizationEngine = new SpaceOptimizationEngine();
