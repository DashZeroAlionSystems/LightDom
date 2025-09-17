"use strict";
/**
 * Headless Browser Service - Advanced Chrome DevTools Protocol integration
 * Provides headless browser automation for DOM optimization and analysis
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.headlessBrowserService = exports.HeadlessBrowserService = void 0;
var events_1 = require("events");
var puppeteer_1 = __importDefault(require("puppeteer"));
var HeadlessBrowserService = /** @class */ (function (_super) {
    __extends(HeadlessBrowserService, _super);
    function HeadlessBrowserService(config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this) || this;
        _this.browser = null;
        _this.pages = new Map();
        _this.cdpSessions = new Map();
        _this.isRunning = false;
        _this.pageCounter = 0;
        _this.config = __assign({ headless: true, devtools: false, args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-features=TranslateUI',
                '--disable-ipc-flooding-protection',
                '--enable-features=NetworkService,NetworkServiceLogging',
                '--force-color-profile=srgb',
                '--metrics-recording-only',
                '--use-mock-keychain',
                '--disable-extensions',
                '--disable-plugins',
                '--disable-images', // Disable images for faster loading
                '--disable-javascript', // Disable JS for initial analysis
                '--disable-css', // Disable CSS for initial analysis
                '--disable-fonts', // Disable fonts for initial analysis
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ], defaultViewport: {
                width: 1920,
                height: 1080
            }, timeout: 30000, maxConcurrentPages: 10, enableServiceWorker: true, enableCache: true }, config);
        _this.serviceWorkerConfig = {
            enabled: true,
            cacheStrategy: 'cacheFirst',
            cacheName: 'lightdom-cache',
            maxCacheSize: 50 * 1024 * 1024, // 50MB
            offlineSupport: true
        };
        return _this;
    }
    /**
     * Initialize the browser service
     */
    HeadlessBrowserService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.isRunning) {
                            console.log('⚠️ Headless browser service is already running');
                            return [2 /*return*/];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        console.log('🚀 Initializing headless browser service...');
                        // Launch browser with configuration
                        _a = this;
                        return [4 /*yield*/, puppeteer_1.default.launch({
                                headless: this.config.headless ? 'new' : false,
                                devtools: this.config.devtools,
                                args: this.config.args,
                                defaultViewport: this.config.defaultViewport,
                                timeout: this.config.timeout
                            })];
                    case 2:
                        // Launch browser with configuration
                        _a.browser = _b.sent();
                        // Set up browser event handlers
                        this.setupBrowserEventHandlers();
                        this.isRunning = true;
                        this.emit('initialized');
                        console.log('✅ Headless browser service initialized successfully');
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        console.error('❌ Failed to initialize headless browser service:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a new page for optimization
     */
    HeadlessBrowserService.prototype.createPage = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var page, pageId, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.browser) {
                            throw new Error('Browser not initialized');
                        }
                        if (this.pages.size >= this.config.maxConcurrentPages) {
                            throw new Error('Maximum concurrent pages reached');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.browser.newPage()];
                    case 2:
                        page = _a.sent();
                        pageId = "page_".concat(++this.pageCounter, "_").concat(Date.now());
                        // Configure page
                        return [4 /*yield*/, this.configurePage(page, url)];
                    case 3:
                        // Configure page
                        _a.sent();
                        // Store page
                        this.pages.set(pageId, page);
                        // Set up page event handlers
                        this.setupPageEventHandlers(page, pageId);
                        this.emit('pageCreated', { pageId: pageId, url: url });
                        return [2 /*return*/, page];
                    case 4:
                        error_2 = _a.sent();
                        console.error('❌ Failed to create page:', error_2);
                        throw error_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Configure page for optimization
     */
    HeadlessBrowserService.prototype.configurePage = function (page, url) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.userAgent) return [3 /*break*/, 2];
                        return [4 /*yield*/, page.setUserAgent(this.config.userAgent)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!this.serviceWorkerConfig.enabled) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.setupServiceWorker(page)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: 
                    // Set up request interception for optimization
                    return [4 /*yield*/, page.setRequestInterception(true)];
                    case 5:
                        // Set up request interception for optimization
                        _a.sent();
                        page.on('request', function (request) {
                            var resourceType = request.resourceType();
                            // Block unnecessary resources for initial analysis
                            if (['image', 'media', 'font', 'stylesheet'].includes(resourceType)) {
                                request.abort();
                            }
                            else {
                                request.continue();
                            }
                        });
                        // Set up response interception for analysis
                        page.on('response', function (response) {
                            _this.analyzeResponse(response);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Set up service worker for caching and offline support
     */
    HeadlessBrowserService.prototype.setupServiceWorker = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            var serviceWorkerScript;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        serviceWorkerScript = "\n      const CACHE_NAME = '".concat(this.serviceWorkerConfig.cacheName, "';\n      const MAX_CACHE_SIZE = ").concat(this.serviceWorkerConfig.maxCacheSize, ";\n      \n      // Install service worker\n      self.addEventListener('install', (event) => {\n        console.log('LightDom Service Worker installed');\n        self.skipWaiting();\n      });\n      \n      // Activate service worker\n      self.addEventListener('activate', (event) => {\n        console.log('LightDom Service Worker activated');\n        event.waitUntil(self.clients.claim());\n      });\n      \n      // Handle fetch requests\n      self.addEventListener('fetch', (event) => {\n        const request = event.request;\n        const url = new URL(request.url);\n        \n        // Only handle same-origin requests\n        if (url.origin !== location.origin) {\n          return;\n        }\n        \n        event.respondWith(handleRequest(request));\n      });\n      \n      async function handleRequest(request) {\n        const cache = await caches.open(CACHE_NAME);\n        const cachedResponse = await cache.match(request);\n        \n        if (cachedResponse) {\n          // Return cached response\n          return cachedResponse;\n        }\n        \n        try {\n          // Fetch from network\n          const networkResponse = await fetch(request);\n          \n          // Cache the response\n          if (networkResponse.ok) {\n            cache.put(request, networkResponse.clone());\n          }\n          \n          return networkResponse;\n        } catch (error) {\n          console.error('Network request failed:', error);\n          return new Response('Offline', { status: 503 });\n        }\n      }\n      \n      // Clean up old caches\n      self.addEventListener('message', (event) => {\n        if (event.data.action === 'cleanup') {\n          cleanupCaches();\n        }\n      });\n      \n      async function cleanupCaches() {\n        const cacheNames = await caches.keys();\n        const oldCaches = cacheNames.filter(name => name !== CACHE_NAME);\n        \n        await Promise.all(\n          oldCaches.map(name => caches.delete(name))\n        );\n      }\n    ");
                        // Inject service worker script
                        return [4 /*yield*/, page.evaluateOnNewDocument(serviceWorkerScript)];
                    case 1:
                        // Inject service worker script
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Analyze response for optimization opportunities
     */
    HeadlessBrowserService.prototype.analyzeResponse = function (response) {
        var url = response.url();
        var status = response.status();
        var headers = response.headers();
        var contentLength = headers['content-length'];
        if (status === 200 && contentLength) {
            var size = parseInt(contentLength);
            var contentType = headers['content-type'] || '';
            // Analyze different resource types
            if (contentType.includes('text/html')) {
                this.analyzeHTMLResponse(url, size, response);
            }
            else if (contentType.includes('text/css')) {
                this.analyzeCSSResponse(url, size, response);
            }
            else if (contentType.includes('application/javascript')) {
                this.analyzeJSResponse(url, size, response);
            }
        }
    };
    /**
     * Analyze HTML response
     */
    HeadlessBrowserService.prototype.analyzeHTMLResponse = function (url, size, response) {
        return __awaiter(this, void 0, void 0, function () {
            var content, optimizations, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, response.text()];
                    case 1:
                        content = _a.sent();
                        optimizations = this.analyzeHTML(content);
                        if (optimizations.length > 0) {
                            this.emit('htmlOptimization', {
                                url: url,
                                originalSize: size,
                                optimizations: optimizations
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Error analyzing HTML response:', error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Analyze CSS response
     */
    HeadlessBrowserService.prototype.analyzeCSSResponse = function (url, size, response) {
        return __awaiter(this, void 0, void 0, function () {
            var content, optimizations, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, response.text()];
                    case 1:
                        content = _a.sent();
                        optimizations = this.analyzeCSS(content);
                        if (optimizations.length > 0) {
                            this.emit('cssOptimization', {
                                url: url,
                                originalSize: size,
                                optimizations: optimizations
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error('Error analyzing CSS response:', error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Analyze JavaScript response
     */
    HeadlessBrowserService.prototype.analyzeJSResponse = function (url, size, response) {
        return __awaiter(this, void 0, void 0, function () {
            var content, optimizations, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, response.text()];
                    case 1:
                        content = _a.sent();
                        optimizations = this.analyzeJS(content);
                        if (optimizations.length > 0) {
                            this.emit('jsOptimization', {
                                url: url,
                                originalSize: size,
                                optimizations: optimizations
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Error analyzing JS response:', error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Analyze HTML content for optimization opportunities
     */
    HeadlessBrowserService.prototype.analyzeHTML = function (content) {
        var optimizations = [];
        // Remove unnecessary whitespace
        var originalLength = content.length;
        var minified = content
            .replace(/\s+/g, ' ')
            .replace(/>\s+</g, '><')
            .trim();
        var spaceSaved = originalLength - minified.length;
        if (spaceSaved > 0) {
            optimizations.push({
                type: 'html',
                description: 'Remove unnecessary whitespace',
                spaceSaved: spaceSaved,
                impact: spaceSaved > 1000 ? 'high' : 'medium',
                implementation: 'Minify HTML by removing extra whitespace'
            });
        }
        // Remove comments
        var commentRegex = /<!--[\s\S]*?-->/g;
        var withoutComments = content.replace(commentRegex, '');
        var commentSpaceSaved = content.length - withoutComments.length;
        if (commentSpaceSaved > 0) {
            optimizations.push({
                type: 'html',
                description: 'Remove HTML comments',
                spaceSaved: commentSpaceSaved,
                impact: commentSpaceSaved > 500 ? 'medium' : 'low',
                implementation: 'Remove HTML comments from production builds'
            });
        }
        // Optimize attributes
        var attributeOptimizations = this.optimizeHTMLAttributes(content);
        optimizations.push.apply(optimizations, attributeOptimizations);
        return optimizations;
    };
    /**
     * Analyze CSS content for optimization opportunities
     */
    HeadlessBrowserService.prototype.analyzeCSS = function (content) {
        var optimizations = [];
        // Remove unnecessary whitespace and comments
        var originalLength = content.length;
        var minified = content
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
            .replace(/\s+/g, ' ') // Collapse whitespace
            .replace(/;\s*}/g, '}') // Remove semicolons before closing braces
            .replace(/\s*{\s*/g, '{') // Remove spaces around opening braces
            .replace(/\s*}\s*/g, '}') // Remove spaces around closing braces
            .replace(/;\s*;/g, ';') // Remove duplicate semicolons
            .trim();
        var spaceSaved = originalLength - minified.length;
        if (spaceSaved > 0) {
            optimizations.push({
                type: 'css',
                description: 'Minify CSS',
                spaceSaved: spaceSaved,
                impact: spaceSaved > 2000 ? 'high' : 'medium',
                implementation: 'Minify CSS by removing comments and unnecessary whitespace'
            });
        }
        // Remove unused CSS rules
        var unusedRules = this.findUnusedCSSRules(content);
        if (unusedRules.length > 0) {
            optimizations.push({
                type: 'css',
                description: "Remove ".concat(unusedRules.length, " unused CSS rules"),
                spaceSaved: unusedRules.reduce(function (sum, rule) { return sum + rule.length; }, 0),
                impact: 'medium',
                implementation: 'Remove unused CSS rules using tools like PurgeCSS'
            });
        }
        return optimizations;
    };
    /**
     * Analyze JavaScript content for optimization opportunities
     */
    HeadlessBrowserService.prototype.analyzeJS = function (content) {
        var optimizations = [];
        // Remove unnecessary whitespace and comments
        var originalLength = content.length;
        var minified = content
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
            .replace(/\/\/.*$/gm, '') // Remove line comments
            .replace(/\s+/g, ' ') // Collapse whitespace
            .replace(/\s*([{}();,])\s*/g, '$1') // Remove spaces around operators
            .trim();
        var spaceSaved = originalLength - minified.length;
        if (spaceSaved > 0) {
            optimizations.push({
                type: 'js',
                description: 'Minify JavaScript',
                spaceSaved: spaceSaved,
                impact: spaceSaved > 5000 ? 'high' : 'medium',
                implementation: 'Minify JavaScript using tools like Terser'
            });
        }
        // Remove unused code
        var unusedCode = this.findUnusedJSCode(content);
        if (unusedCode.length > 0) {
            optimizations.push({
                type: 'js',
                description: "Remove ".concat(unusedCode.length, " unused functions/variables"),
                spaceSaved: unusedCode.reduce(function (sum, code) { return sum + code.length; }, 0),
                impact: 'medium',
                implementation: 'Remove unused code using tree-shaking'
            });
        }
        return optimizations;
    };
    /**
     * Optimize HTML attributes
     */
    HeadlessBrowserService.prototype.optimizeHTMLAttributes = function (content) {
        var optimizations = [];
        // Remove unnecessary attributes
        var unnecessaryAttributes = [
            /type="text\/javascript"/g,
            /type="text\/css"/g,
            /language="javascript"/g
        ];
        var totalSpaceSaved = 0;
        unnecessaryAttributes.forEach(function (regex) {
            var matches = content.match(regex);
            if (matches) {
                totalSpaceSaved += matches.reduce(function (sum, match) { return sum + match.length; }, 0);
            }
        });
        if (totalSpaceSaved > 0) {
            optimizations.push({
                type: 'html',
                description: 'Remove unnecessary attributes',
                spaceSaved: totalSpaceSaved,
                impact: 'low',
                implementation: 'Remove unnecessary type and language attributes'
            });
        }
        return optimizations;
    };
    /**
     * Find unused CSS rules (simplified implementation)
     */
    HeadlessBrowserService.prototype.findUnusedCSSRules = function (content) {
        // This is a simplified implementation
        // In a real scenario, you would need to analyze the HTML to see which selectors are actually used
        var unusedRules = [];
        // Find CSS rules that are likely unused
        var cssRules = content.match(/[^{}]+{[^}]*}/g) || [];
        cssRules.forEach(function (rule) {
            // Check for common unused patterns
            if (rule.includes('display: none') ||
                rule.includes('visibility: hidden') ||
                rule.includes('opacity: 0')) {
                unusedRules.push(rule);
            }
        });
        return unusedRules;
    };
    /**
     * Find unused JavaScript code (simplified implementation)
     */
    HeadlessBrowserService.prototype.findUnusedJSCode = function (content) {
        // This is a simplified implementation
        // In a real scenario, you would need to analyze the code to find truly unused functions
        var unusedCode = [];
        // Find function declarations
        var functions = content.match(/function\s+\w+\s*\([^)]*\)\s*{[^}]*}/g) || [];
        functions.forEach(function (func) {
            var _a;
            var functionName = (_a = func.match(/function\s+(\w+)/)) === null || _a === void 0 ? void 0 : _a[1];
            if (functionName) {
                // Check if function is called elsewhere in the code
                var callRegex = new RegExp("\\b".concat(functionName, "\\s*\\("), 'g');
                var calls = content.match(callRegex) || [];
                if (calls.length <= 1) { // Only the declaration, no calls
                    unusedCode.push(func);
                }
            }
        });
        return unusedCode;
    };
    /**
     * Set up browser event handlers
     */
    HeadlessBrowserService.prototype.setupBrowserEventHandlers = function () {
        var _this = this;
        if (!this.browser)
            return;
        this.browser.on('disconnected', function () {
            console.log('🔌 Browser disconnected');
            _this.isRunning = false;
            _this.emit('disconnected');
        });
        this.browser.on('targetcreated', function (target) {
            console.log('🎯 New target created:', target.url());
        });
        this.browser.on('targetdestroyed', function (target) {
            console.log('🗑️ Target destroyed:', target.url());
        });
    };
    /**
     * Set up page event handlers
     */
    HeadlessBrowserService.prototype.setupPageEventHandlers = function (page, pageId) {
        var _this = this;
        page.on('load', function () {
            console.log("\uD83D\uDCC4 Page loaded: ".concat(pageId));
            _this.emit('pageLoaded', { pageId: pageId });
        });
        page.on('error', function (error) {
            console.error("\u274C Page error (".concat(pageId, "):"), error);
            _this.emit('pageError', { pageId: pageId, error: error });
        });
        page.on('close', function () {
            console.log("\uD83D\uDD12 Page closed: ".concat(pageId));
            _this.pages.delete(pageId);
            _this.emit('pageClosed', { pageId: pageId });
        });
    };
    /**
     * Get browser status
     */
    HeadlessBrowserService.prototype.getStatus = function () {
        return {
            running: this.isRunning,
            pages: this.pages.size,
            maxPages: this.config.maxConcurrentPages,
            config: this.config
        };
    };
    /**
     * Close the browser service
     */
    HeadlessBrowserService.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, _b, pageId, page, error_6;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.isRunning) {
                            return [2 /*return*/];
                        }
                        console.log('🛑 Closing headless browser service...');
                        _i = 0, _a = this.pages;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        _b = _a[_i], pageId = _b[0], page = _b[1];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, page.close()];
                    case 3:
                        _c.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_6 = _c.sent();
                        console.error("Error closing page ".concat(pageId, ":"), error_6);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        this.pages.clear();
                        if (!this.browser) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.browser.close()];
                    case 7:
                        _c.sent();
                        this.browser = null;
                        _c.label = 8;
                    case 8:
                        this.isRunning = false;
                        this.emit('closed');
                        console.log('✅ Headless browser service closed');
                        return [2 /*return*/];
                }
            });
        });
    };
    return HeadlessBrowserService;
}(events_1.EventEmitter));
exports.HeadlessBrowserService = HeadlessBrowserService;
// Export singleton instance
exports.headlessBrowserService = new HeadlessBrowserService();
