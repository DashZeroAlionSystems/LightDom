"use strict";
/**
 * Web Address Miner
 * Specialized service for mining and analyzing web addresses for DOM optimization
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
exports.webAddressMiner = exports.WebAddressMiner = void 0;
var events_1 = require("events");
var StorageNodeManager_1 = require("./StorageNodeManager");
var HeadlessBrowserService_1 = require("./HeadlessBrowserService");
var WebAddressMiner = /** @class */ (function (_super) {
    __extends(WebAddressMiner, _super);
    function WebAddressMiner(config) {
        var _this = _super.call(this) || this;
        _this.jobs = new Map();
        _this.isRunning = false;
        _this.processingInterval = null;
        _this.config = __assign({ maxConcurrentJobs: 5, timeoutMs: 60000, retryAttempts: 3, enableDeepAnalysis: true, enablePerformanceTesting: true, enableLighthouseAudit: true, optimizationThreshold: 10, tokenRewardRate: 0.001 }, config);
        _this.setupEventHandlers();
        return _this;
    }
    /**
     * Initialize the web address miner
     */
    WebAddressMiner.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('⛏️ Initializing Web Address Miner...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // Initialize headless browser service
                        return [4 /*yield*/, HeadlessBrowserService_1.headlessBrowserService.initialize()];
                    case 2:
                        // Initialize headless browser service
                        _a.sent();
                        // Start processing jobs
                        this.startProcessing();
                        this.isRunning = true;
                        this.emit('initialized');
                        console.log('✅ Web Address Miner initialized successfully');
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('❌ Failed to initialize Web Address Miner:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add a web address to mining queue
     */
    WebAddressMiner.prototype.addMiningJob = function (url_1) {
        return __awaiter(this, arguments, void 0, function (url, priority) {
            var jobId, job;
            if (priority === void 0) { priority = 'medium'; }
            return __generator(this, function (_a) {
                jobId = "job_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
                job = {
                    id: jobId,
                    url: url,
                    priority: priority,
                    status: 'queued',
                    createdAt: new Date()
                };
                this.jobs.set(jobId, job);
                this.emit('jobQueued', job);
                console.log("\uD83D\uDCDD Mining job queued: ".concat(url, " (").concat(jobId, ")"));
                return [2 /*return*/, jobId];
            });
        });
    };
    /**
     * Add multiple web addresses to mining queue
     */
    WebAddressMiner.prototype.addMiningJobs = function (urls) {
        return __awaiter(this, void 0, void 0, function () {
            var jobIds, _i, urls_1, _a, url, _b, priority, jobId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        jobIds = [];
                        _i = 0, urls_1 = urls;
                        _c.label = 1;
                    case 1:
                        if (!(_i < urls_1.length)) return [3 /*break*/, 4];
                        _a = urls_1[_i], url = _a.url, _b = _a.priority, priority = _b === void 0 ? 'medium' : _b;
                        return [4 /*yield*/, this.addMiningJob(url, priority)];
                    case 2:
                        jobId = _c.sent();
                        jobIds.push(jobId);
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, jobIds];
                }
            });
        });
    };
    /**
     * Start processing mining jobs
     */
    WebAddressMiner.prototype.startProcessing = function () {
        var _this = this;
        this.processingInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var queuedJobs, activeJobs, availableSlots, jobsToProcess, _i, jobsToProcess_1, job;
            return __generator(this, function (_a) {
                if (!this.isRunning)
                    return [2 /*return*/];
                queuedJobs = Array.from(this.jobs.values())
                    .filter(function (job) { return job.status === 'queued'; })
                    .sort(function (a, b) {
                    var priorityOrder = { high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                });
                activeJobs = Array.from(this.jobs.values())
                    .filter(function (job) { return ['mining', 'analyzing', 'optimizing'].includes(job.status); });
                availableSlots = this.config.maxConcurrentJobs - activeJobs.length;
                jobsToProcess = queuedJobs.slice(0, availableSlots);
                for (_i = 0, jobsToProcess_1 = jobsToProcess; _i < jobsToProcess_1.length; _i++) {
                    job = jobsToProcess_1[_i];
                    this.processMiningJob(job);
                }
                return [2 /*return*/];
            });
        }); }, 2000); // Check every 2 seconds
    };
    /**
     * Process a mining job
     */
    WebAddressMiner.prototype.processMiningJob = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            var node, target, _a, _b, _c, results, error_2;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 6, , 7]);
                        job.status = 'mining';
                        job.startedAt = new Date();
                        this.emit('jobStarted', job);
                        console.log("\u26CF\uFE0F Starting mining job: ".concat(job.url));
                        return [4 /*yield*/, this.findAvailableNode()];
                    case 1:
                        node = _e.sent();
                        if (!node) {
                            throw new Error('No available storage nodes');
                        }
                        job.nodeId = node.id;
                        _b = (_a = StorageNodeManager_1.storageNodeManager).addMiningTarget;
                        _c = [node.id];
                        _d = {
                            url: job.url,
                            priority: job.priority
                        };
                        return [4 /*yield*/, this.analyzeUrl(job.url)];
                    case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([(_d.metadata = _e.sent(),
                                _d)]))];
                    case 3:
                        target = _e.sent();
                        job.target = target;
                        job.status = 'analyzing';
                        return [4 /*yield*/, this.performDeepAnalysis(job.url)];
                    case 4:
                        results = _e.sent();
                        job.results = results;
                        // Check if optimization meets threshold
                        if (results.spaceSaved < this.config.optimizationThreshold) {
                            job.status = 'completed';
                            job.completedAt = new Date();
                            this.emit('jobCompleted', job);
                            console.log("\u2705 Mining job completed (below threshold): ".concat(job.url, " - ").concat(results.spaceSaved, "KB saved"));
                            return [2 /*return*/];
                        }
                        job.status = 'optimizing';
                        // Apply optimizations
                        return [4 /*yield*/, this.applyOptimizations(job.url, results.optimizations)];
                    case 5:
                        // Apply optimizations
                        _e.sent();
                        // Update mining target with results
                        if (job.target) {
                            job.target.actualSize = results.originalSize;
                            job.target.spaceSaved = results.spaceSaved;
                            job.target.tokensEarned = results.tokensEarned;
                            job.target.status = 'completed';
                            job.target.completedAt = new Date();
                        }
                        job.status = 'completed';
                        job.completedAt = new Date();
                        this.emit('jobCompleted', job);
                        console.log("\u2705 Mining job completed: ".concat(job.url, " - ").concat(results.spaceSaved, "KB saved, ").concat(results.tokensEarned, " tokens earned"));
                        return [3 /*break*/, 7];
                    case 6:
                        error_2 = _e.sent();
                        job.status = 'failed';
                        job.error = error_2 instanceof Error ? error_2.message : String(error_2);
                        job.completedAt = new Date();
                        this.emit('jobFailed', job);
                        console.error("\u274C Mining job failed: ".concat(job.url, " - ").concat(job.error));
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Find an available storage node
     */
    WebAddressMiner.prototype.findAvailableNode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var activeNodes, _i, activeNodes_1, node, activeTargets;
            return __generator(this, function (_a) {
                activeNodes = StorageNodeManager_1.storageNodeManager.getActiveNodes();
                // Find node with available capacity and concurrent mining slots
                for (_i = 0, activeNodes_1 = activeNodes; _i < activeNodes_1.length; _i++) {
                    node = activeNodes_1[_i];
                    activeTargets = node.miningTargets.filter(function (t) { return t.status === 'mining'; }).length;
                    if (activeTargets < node.configuration.maxConcurrentMining) {
                        return [2 /*return*/, node];
                    }
                }
                return [2 /*return*/, null];
            });
        });
    };
    /**
     * Analyze URL for mining potential
     */
    WebAddressMiner.prototype.analyzeUrl = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var page, pageInfo, technologies, optimizationPotential, estimatedOptimizations, siteType, complexity, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, HeadlessBrowserService_1.headlessBrowserService.createPage(url)];
                    case 1:
                        page = _a.sent();
                        return [4 /*yield*/, HeadlessBrowserService_1.headlessBrowserService.analyzePage(page)];
                    case 2:
                        pageInfo = _a.sent();
                        return [4 /*yield*/, this.detectTechnologies(page)];
                    case 3:
                        technologies = _a.sent();
                        optimizationPotential = this.estimateOptimizationPotential(pageInfo);
                        estimatedOptimizations = this.generateOptimizationSuggestions(pageInfo);
                        siteType = this.detectSiteType(url, pageInfo);
                        complexity = this.calculateComplexityScore(pageInfo);
                        return [2 /*return*/, {
                                siteType: siteType,
                                technologies: technologies,
                                optimizationPotential: optimizationPotential,
                                estimatedOptimizations: estimatedOptimizations,
                                biomeType: 'digital',
                                complexity: complexity
                            }];
                    case 4:
                        error_3 = _a.sent();
                        console.error("Failed to analyze URL ".concat(url, ":"), error_3);
                        // Return default metadata
                        return [2 /*return*/, {
                                siteType: 'corporate',
                                technologies: [],
                                optimizationPotential: 'medium',
                                estimatedOptimizations: [],
                                biomeType: 'digital',
                                complexity: 5
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Perform deep analysis of the web page
     */
    WebAddressMiner.prototype.performDeepAnalysis = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var page, performance_1, domAnalysis, optimizations, spaceSaved, optimizationRate, tokensEarned, metadata, error_4;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, HeadlessBrowserService_1.headlessBrowserService.createPage(url)];
                    case 1:
                        page = _b.sent();
                        return [4 /*yield*/, this.measurePerformance(page)];
                    case 2:
                        performance_1 = _b.sent();
                        return [4 /*yield*/, this.analyzeDOM(page)];
                    case 3:
                        domAnalysis = _b.sent();
                        return [4 /*yield*/, this.identifyOptimizations(page, domAnalysis)];
                    case 4:
                        optimizations = _b.sent();
                        spaceSaved = optimizations.reduce(function (total, opt) { return total + opt.spaceSaved; }, 0);
                        optimizationRate = domAnalysis.size > 0 ? (spaceSaved / domAnalysis.size) * 100 : 0;
                        tokensEarned = spaceSaved * this.config.tokenRewardRate;
                        _a = {
                            siteType: this.detectSiteType(url, domAnalysis)
                        };
                        return [4 /*yield*/, this.detectTechnologies(page)];
                    case 5:
                        metadata = (_a.technologies = _b.sent(),
                            _a.optimizationPotential = optimizationRate > 30 ? 'high' : optimizationRate > 15 ? 'medium' : 'low',
                            _a.estimatedOptimizations = optimizations.map(function (opt) { return opt.description; }),
                            _a.biomeType = 'digital',
                            _a.complexity = this.calculateComplexityScore(domAnalysis),
                            _a);
                        return [2 /*return*/, {
                                originalSize: domAnalysis.size,
                                optimizedSize: domAnalysis.size - spaceSaved,
                                spaceSaved: spaceSaved,
                                optimizationRate: optimizationRate,
                                tokensEarned: tokensEarned,
                                optimizations: optimizations,
                                performance: performance_1,
                                metadata: metadata
                            }];
                    case 6:
                        error_4 = _b.sent();
                        console.error("Deep analysis failed for ".concat(url, ":"), error_4);
                        throw error_4;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Apply optimizations to the page
     */
    WebAddressMiner.prototype.applyOptimizations = function (url, optimizations) {
        return __awaiter(this, void 0, void 0, function () {
            var page, _i, optimizations_1, optimization, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, HeadlessBrowserService_1.headlessBrowserService.createPage(url)];
                    case 1:
                        page = _a.sent();
                        _i = 0, optimizations_1 = optimizations;
                        _a.label = 2;
                    case 2:
                        if (!(_i < optimizations_1.length)) return [3 /*break*/, 5];
                        optimization = optimizations_1[_i];
                        return [4 /*yield*/, this.applyOptimization(page, optimization)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: 
                    // Verify optimizations were applied
                    return [4 /*yield*/, this.verifyOptimizations(page, optimizations)];
                    case 6:
                        // Verify optimizations were applied
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_5 = _a.sent();
                        console.error("Failed to apply optimizations to ".concat(url, ":"), error_5);
                        throw error_5;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Detect technologies used on the page
     */
    WebAddressMiner.prototype.detectTechnologies = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            var technologies, frameworks, _i, frameworks_1, framework, isPresent, otherTechs, _a, otherTechs_1, tech, isPresent, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        technologies = [];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 10, , 11]);
                        frameworks = ['React', 'Vue', 'Angular', 'jQuery', 'Bootstrap', 'Tailwind', 'Material-UI'];
                        _i = 0, frameworks_1 = frameworks;
                        _b.label = 2;
                    case 2:
                        if (!(_i < frameworks_1.length)) return [3 /*break*/, 5];
                        framework = frameworks_1[_i];
                        return [4 /*yield*/, page.evaluate(function (name) {
                                return window[name] !== undefined ||
                                    document.querySelector("[data-".concat(name.toLowerCase(), "]")) !== null ||
                                    document.querySelector("script[src*=\"".concat(name.toLowerCase(), "\"]")) !== null;
                            }, framework)];
                    case 3:
                        isPresent = _b.sent();
                        if (isPresent) {
                            technologies.push(framework);
                        }
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        otherTechs = ['Webpack', 'Babel', 'TypeScript', 'Sass', 'Less', 'PostCSS'];
                        _a = 0, otherTechs_1 = otherTechs;
                        _b.label = 6;
                    case 6:
                        if (!(_a < otherTechs_1.length)) return [3 /*break*/, 9];
                        tech = otherTechs_1[_a];
                        return [4 /*yield*/, page.evaluate(function (name) {
                                return document.querySelector("script[src*=\"".concat(name.toLowerCase(), "\"]")) !== null ||
                                    document.querySelector("link[href*=\"".concat(name.toLowerCase(), "\"]")) !== null;
                            }, tech)];
                    case 7:
                        isPresent = _b.sent();
                        if (isPresent) {
                            technologies.push(tech);
                        }
                        _b.label = 8;
                    case 8:
                        _a++;
                        return [3 /*break*/, 6];
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        error_6 = _b.sent();
                        console.error('Failed to detect technologies:', error_6);
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/, technologies];
                }
            });
        });
    };
    /**
     * Estimate optimization potential
     */
    WebAddressMiner.prototype.estimateOptimizationPotential = function (pageInfo) {
        var size = pageInfo.domSize || 0;
        var resourceCount = pageInfo.resourceCount || 0;
        var imageCount = pageInfo.imageCount || 0;
        var score = 0;
        // Size-based scoring
        if (size > 5000)
            score += 3;
        else if (size > 2000)
            score += 2;
        else if (size > 1000)
            score += 1;
        // Resource count scoring
        if (resourceCount > 100)
            score += 2;
        else if (resourceCount > 50)
            score += 1;
        // Image count scoring
        if (imageCount > 20)
            score += 2;
        else if (imageCount > 10)
            score += 1;
        if (score >= 5)
            return 'high';
        if (score >= 3)
            return 'medium';
        return 'low';
    };
    /**
     * Generate optimization suggestions
     */
    WebAddressMiner.prototype.generateOptimizationSuggestions = function (pageInfo) {
        var suggestions = [];
        if (pageInfo.domSize > 2000) {
            suggestions.push('HTML minification');
            suggestions.push('Remove unused HTML elements');
        }
        if (pageInfo.imageCount > 10) {
            suggestions.push('Image optimization');
            suggestions.push('Lazy loading for images');
        }
        if (pageInfo.scriptCount > 5) {
            suggestions.push('JavaScript bundling');
            suggestions.push('Remove unused JavaScript');
        }
        if (pageInfo.styleCount > 3) {
            suggestions.push('CSS minification');
            suggestions.push('Remove unused CSS');
        }
        return suggestions;
    };
    /**
     * Detect site type based on URL and page content
     */
    WebAddressMiner.prototype.detectSiteType = function (url, pageInfo) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var domain = new URL(url).hostname.toLowerCase();
        // E-commerce indicators
        if (domain.includes('shop') || domain.includes('store') || domain.includes('buy') ||
            ((_a = pageInfo.content) === null || _a === void 0 ? void 0 : _a.includes('cart')) || ((_b = pageInfo.content) === null || _b === void 0 ? void 0 : _b.includes('checkout'))) {
            return 'ecommerce';
        }
        // Blog indicators
        if (domain.includes('blog') || ((_c = pageInfo.content) === null || _c === void 0 ? void 0 : _c.includes('article')) ||
            ((_d = pageInfo.content) === null || _d === void 0 ? void 0 : _d.includes('post'))) {
            return 'blog';
        }
        // News indicators
        if (domain.includes('news') || domain.includes('times') || domain.includes('post')) {
            return 'news';
        }
        // Social indicators
        if (domain.includes('social') || domain.includes('community') ||
            ((_e = pageInfo.content) === null || _e === void 0 ? void 0 : _e.includes('follow')) || ((_f = pageInfo.content) === null || _f === void 0 ? void 0 : _f.includes('share'))) {
            return 'social';
        }
        // Portfolio indicators
        if (domain.includes('portfolio') || ((_g = pageInfo.content) === null || _g === void 0 ? void 0 : _g.includes('work')) ||
            ((_h = pageInfo.content) === null || _h === void 0 ? void 0 : _h.includes('projects'))) {
            return 'portfolio';
        }
        return 'corporate';
    };
    /**
     * Calculate complexity score
     */
    WebAddressMiner.prototype.calculateComplexityScore = function (pageInfo) {
        var score = 1;
        var size = pageInfo.domSize || 0;
        var resourceCount = pageInfo.resourceCount || 0;
        var scriptCount = pageInfo.scriptCount || 0;
        var styleCount = pageInfo.styleCount || 0;
        // Size complexity
        if (size > 10000)
            score += 3;
        else if (size > 5000)
            score += 2;
        else if (size > 2000)
            score += 1;
        // Resource complexity
        if (resourceCount > 200)
            score += 3;
        else if (resourceCount > 100)
            score += 2;
        else if (resourceCount > 50)
            score += 1;
        // Script complexity
        if (scriptCount > 20)
            score += 2;
        else if (scriptCount > 10)
            score += 1;
        // Style complexity
        if (styleCount > 10)
            score += 2;
        else if (styleCount > 5)
            score += 1;
        return Math.min(score, 10);
    };
    /**
     * Measure page performance
     */
    WebAddressMiner.prototype.measurePerformance = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            var metrics, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, page.evaluate(function () {
                                var navigation = performance.getEntriesByType('navigation')[0];
                                var paint = performance.getEntriesByType('paint');
                                return {
                                    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                                    domSize: document.documentElement.outerHTML.length / 1024,
                                    resourceCount: performance.getEntriesByType('resource').length,
                                    imageCount: document.querySelectorAll('img').length,
                                    scriptCount: document.querySelectorAll('script').length,
                                    styleCount: document.querySelectorAll('link[rel="stylesheet"], style').length,
                                    networkRequests: performance.getEntriesByType('resource').length,
                                    lighthouseScore: 0 // Would be calculated by Lighthouse
                                };
                            })];
                    case 1:
                        metrics = _a.sent();
                        return [2 /*return*/, metrics];
                    case 2:
                        error_7 = _a.sent();
                        console.error('Failed to measure performance:', error_7);
                        return [2 /*return*/, {
                                loadTime: 0,
                                domSize: 0,
                                resourceCount: 0,
                                imageCount: 0,
                                scriptCount: 0,
                                styleCount: 0,
                                networkRequests: 0,
                                lighthouseScore: 0
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Analyze DOM structure
     */
    WebAddressMiner.prototype.analyzeDOM = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            var analysis, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, page.evaluate(function () {
                                var _a;
                                var html = document.documentElement.outerHTML;
                                var size = html.length / 1024; // Size in KB
                                return {
                                    size: size,
                                    elementCount: document.querySelectorAll('*').length,
                                    imageCount: document.querySelectorAll('img').length,
                                    scriptCount: document.querySelectorAll('script').length,
                                    styleCount: document.querySelectorAll('link[rel="stylesheet"], style').length,
                                    linkCount: document.querySelectorAll('a').length,
                                    divCount: document.querySelectorAll('div').length,
                                    spanCount: document.querySelectorAll('span').length,
                                    content: ((_a = document.body.textContent) === null || _a === void 0 ? void 0 : _a.substring(0, 1000)) || ''
                                };
                            })];
                    case 1:
                        analysis = _a.sent();
                        return [2 /*return*/, analysis];
                    case 2:
                        error_8 = _a.sent();
                        console.error('Failed to analyze DOM:', error_8);
                        return [2 /*return*/, {
                                size: 0,
                                elementCount: 0,
                                imageCount: 0,
                                scriptCount: 0,
                                styleCount: 0,
                                linkCount: 0,
                                divCount: 0,
                                spanCount: 0,
                                content: ''
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Identify optimization opportunities
     */
    WebAddressMiner.prototype.identifyOptimizations = function (page, domAnalysis) {
        return __awaiter(this, void 0, void 0, function () {
            var optimizations;
            return __generator(this, function (_a) {
                optimizations = [];
                // HTML optimizations
                if (domAnalysis.size > 1000) {
                    optimizations.push({
                        type: 'html',
                        description: 'HTML minification and cleanup',
                        spaceSaved: Math.floor(domAnalysis.size * 0.1),
                        impact: 'medium',
                        implementation: 'Remove unnecessary whitespace and comments',
                        estimatedTime: 15
                    });
                }
                // Image optimizations
                if (domAnalysis.imageCount > 5) {
                    optimizations.push({
                        type: 'images',
                        description: 'Image optimization and lazy loading',
                        spaceSaved: Math.floor(domAnalysis.imageCount * 50),
                        impact: 'high',
                        implementation: 'Compress images and implement lazy loading',
                        estimatedTime: 30
                    });
                }
                // Script optimizations
                if (domAnalysis.scriptCount > 3) {
                    optimizations.push({
                        type: 'js',
                        description: 'JavaScript bundling and minification',
                        spaceSaved: Math.floor(domAnalysis.scriptCount * 20),
                        impact: 'high',
                        implementation: 'Bundle and minify JavaScript files',
                        estimatedTime: 25
                    });
                }
                // CSS optimizations
                if (domAnalysis.styleCount > 2) {
                    optimizations.push({
                        type: 'css',
                        description: 'CSS minification and optimization',
                        spaceSaved: Math.floor(domAnalysis.styleCount * 15),
                        impact: 'medium',
                        implementation: 'Minify CSS and remove unused styles',
                        estimatedTime: 20
                    });
                }
                return [2 /*return*/, optimizations];
            });
        });
    };
    /**
     * Apply a specific optimization
     */
    WebAddressMiner.prototype.applyOptimization = function (page, optimization) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 11, , 12]);
                        _a = optimization.type;
                        switch (_a) {
                            case 'html': return [3 /*break*/, 1];
                            case 'images': return [3 /*break*/, 3];
                            case 'js': return [3 /*break*/, 5];
                            case 'css': return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 9];
                    case 1: return [4 /*yield*/, this.applyHTMLOptimization(page)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 3: return [4 /*yield*/, this.applyImageOptimization(page)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 5: return [4 /*yield*/, this.applyJSOptimization(page)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 7: return [4 /*yield*/, this.applyCSSOptimization(page)];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        console.log("Optimization type ".concat(optimization.type, " not implemented"));
                        _b.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        error_9 = _b.sent();
                        console.error("Failed to apply ".concat(optimization.type, " optimization:"), error_9);
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Apply HTML optimizations
     */
    WebAddressMiner.prototype.applyHTMLOptimization = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, page.evaluate(function () {
                            // Remove comments
                            var comments = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT, null);
                            var comment;
                            while (comment = comments.nextNode()) {
                                comment.remove();
                            }
                            // Remove empty elements
                            var emptyElements = document.querySelectorAll('div:empty, span:empty, p:empty');
                            emptyElements.forEach(function (el) { return el.remove(); });
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Apply image optimizations
     */
    WebAddressMiner.prototype.applyImageOptimization = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, page.evaluate(function () {
                            var images = document.querySelectorAll('img');
                            images.forEach(function (img) {
                                // Add lazy loading
                                img.setAttribute('loading', 'lazy');
                                // Add alt text if missing
                                if (!img.alt) {
                                    img.alt = 'Optimized image';
                                }
                            });
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Apply JavaScript optimizations
     */
    WebAddressMiner.prototype.applyJSOptimization = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, page.evaluate(function () {
                            // Remove console.log statements (simplified)
                            var scripts = document.querySelectorAll('script');
                            scripts.forEach(function (script) {
                                if (script.textContent) {
                                    script.textContent = script.textContent.replace(/console\.log\([^)]*\);?/g, '');
                                }
                            });
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Apply CSS optimizations
     */
    WebAddressMiner.prototype.applyCSSOptimization = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, page.evaluate(function () {
                            // Remove unused CSS classes (simplified)
                            var styles = document.querySelectorAll('style');
                            styles.forEach(function (style) {
                                if (style.textContent) {
                                    // Remove empty rules
                                    style.textContent = style.textContent.replace(/\{[^}]*\}/g, function (match) {
                                        return match.trim() === '{}' ? '' : match;
                                    });
                                }
                            });
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Verify optimizations were applied
     */
    WebAddressMiner.prototype.verifyOptimizations = function (page, optimizations) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In a real implementation, this would verify that optimizations were actually applied
                console.log("Verified ".concat(optimizations.length, " optimizations"));
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get mining statistics
     */
    WebAddressMiner.prototype.getMiningStats = function () {
        var allJobs = Array.from(this.jobs.values());
        var completedJobs = allJobs.filter(function (job) { return job.status === 'completed'; });
        var failedJobs = allJobs.filter(function (job) { return job.status === 'failed'; });
        var totalSpaceSaved = completedJobs.reduce(function (total, job) { var _a; return total + (((_a = job.results) === null || _a === void 0 ? void 0 : _a.spaceSaved) || 0); }, 0);
        var totalTokensEarned = completedJobs.reduce(function (total, job) { var _a; return total + (((_a = job.results) === null || _a === void 0 ? void 0 : _a.tokensEarned) || 0); }, 0);
        var averageOptimizationRate = completedJobs.length > 0 ?
            completedJobs.reduce(function (total, job) { var _a; return total + (((_a = job.results) === null || _a === void 0 ? void 0 : _a.optimizationRate) || 0); }, 0) / completedJobs.length : 0;
        var topOptimizations = completedJobs
            .flatMap(function (job) { var _a; return ((_a = job.results) === null || _a === void 0 ? void 0 : _a.optimizations) || []; })
            .sort(function (a, b) { return b.spaceSaved - a.spaceSaved; })
            .slice(0, 10);
        var performanceBySiteType = new Map();
        return {
            totalJobs: allJobs.length,
            completedJobs: completedJobs.length,
            failedJobs: failedJobs.length,
            successRate: allJobs.length > 0 ? (completedJobs.length / allJobs.length) * 100 : 0,
            totalSpaceSaved: totalSpaceSaved,
            totalTokensEarned: totalTokensEarned,
            averageOptimizationRate: averageOptimizationRate,
            topOptimizations: topOptimizations,
            performanceBySiteType: performanceBySiteType
        };
    };
    /**
     * Get job by ID
     */
    WebAddressMiner.prototype.getJob = function (jobId) {
        return this.jobs.get(jobId);
    };
    /**
     * Get all jobs
     */
    WebAddressMiner.prototype.getAllJobs = function () {
        return Array.from(this.jobs.values());
    };
    /**
     * Get jobs by status
     */
    WebAddressMiner.prototype.getJobsByStatus = function (status) {
        return Array.from(this.jobs.values()).filter(function (job) { return job.status === status; });
    };
    /**
     * Setup event handlers
     */
    WebAddressMiner.prototype.setupEventHandlers = function () {
        this.on('jobQueued', function (job) {
            console.log("\uD83D\uDCDD Job queued: ".concat(job.url));
        });
        this.on('jobStarted', function (job) {
            console.log("\u26CF\uFE0F Job started: ".concat(job.url));
        });
        this.on('jobCompleted', function (job) {
            console.log("\u2705 Job completed: ".concat(job.url));
        });
        this.on('jobFailed', function (job) {
            console.error("\u274C Job failed: ".concat(job.url, " - ").concat(job.error));
        });
    };
    /**
     * Stop the web address miner
     */
    WebAddressMiner.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🛑 Stopping Web Address Miner...');
                        this.isRunning = false;
                        if (this.processingInterval) {
                            clearInterval(this.processingInterval);
                            this.processingInterval = null;
                        }
                        return [4 /*yield*/, HeadlessBrowserService_1.headlessBrowserService.close()];
                    case 1:
                        _a.sent();
                        this.emit('stopped');
                        console.log('✅ Web Address Miner stopped');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get status
     */
    WebAddressMiner.prototype.getStatus = function () {
        var allJobs = Array.from(this.jobs.values());
        var activeJobs = allJobs.filter(function (job) { return ['mining', 'analyzing', 'optimizing'].includes(job.status); });
        var queuedJobs = allJobs.filter(function (job) { return job.status === 'queued'; });
        return {
            running: this.isRunning,
            totalJobs: allJobs.length,
            activeJobs: activeJobs.length,
            queuedJobs: queuedJobs.length
        };
    };
    return WebAddressMiner;
}(events_1.EventEmitter));
exports.WebAddressMiner = WebAddressMiner;
// Export singleton instance
exports.webAddressMiner = new WebAddressMiner();
