#!/usr/bin/env node

/**
 * Codebase Knowledge Graph Generator
 * 
 * Analyzes the entire codebase to create a comprehensive knowledge graph showing:
 * - All files and their relationships
 * - Function definitions and usage
 * - Import/export dependencies
 * - Cross-file function call patterns
 * - Component hierarchies
 * - Service dependencies
 * 
 * Outputs:
 * - JSON knowledge graph data
 * - Interactive HTML visualization
 * - Neo4j-compatible import files
 * - Architecture analysis report
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import parser from '@babel/parser';
import traverse from '@babel/traverse';
import glob from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

class CodebaseKnowledgeGraph {
    constructor() {
        this.files = new Map();
        this.functions = new Map();
        this.imports = new Map();
        this.exports = new Map();
        this.functionCalls = new Map();
        this.dependencies = new Map();
        this.components = new Map();
        this.services = new Map();
        
        this.statistics = {
            totalFiles: 0,
            totalFunctions: 0,
            totalImports: 0,
            totalExports: 0,
            totalCalls: 0,
            fileTypes: {},
            mostUsedFunctions: [],
            mostConnectedFiles: [],
            circularDependencies: []
        };
    }

    /**
     * Analyze the entire codebase
     */
    async analyze() {
        console.log('🔍 Starting codebase analysis...');
        
        const patterns = [
            'src/**/*.{js,jsx,ts,tsx}',
            'api/**/*.{js,ts}',
            'scripts/**/*.{js,ts}',
            'services/**/*.{js,ts}',
            'electron/**/*.{js,ts}',
            'cli/**/*.{js,ts}',
            '*.{js,ts}'
        ];

        const allFiles = new Set();
        
        for (const pattern of patterns) {
            const files = glob.sync(pattern, {
                cwd: PROJECT_ROOT,
                ignore: [
                    '**/node_modules/**',
                    '**/dist/**',
                    '**/build/**',
                    '**/*.test.{js,ts,jsx,tsx}',
                    '**/*.spec.{js,ts,jsx,tsx}'
                ],
                absolute: true
            });
            files.forEach(f => allFiles.add(f));
        }

        console.log(`📁 Found ${allFiles.size} files to analyze`);

        let processed = 0;
        for (const filePath of allFiles) {
            try {
                await this.analyzeFile(filePath);
                processed++;
                if (processed % 50 === 0) {
                    console.log(`   Processed ${processed}/${allFiles.size} files...`);
                }
            } catch (error) {
                console.warn(`   ⚠️  Error analyzing ${filePath}: ${error.message}`);
            }
        }

        console.log(`✅ Analyzed ${processed} files successfully`);
        
        this.calculateStatistics();
        this.detectPatterns();
        
        return this.generateOutput();
    }

    /**
     * Analyze a single file
     */
    async analyzeFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relativePath = path.relative(PROJECT_ROOT, filePath);
        
        const fileInfo = {
            path: relativePath,
            absolutePath: filePath,
            type: this.getFileType(filePath),
            size: content.length,
            lines: content.split('\n').length,
            functions: [],
            imports: [],
            exports: [],
            calls: [],
            dependencies: []
        };

        try {
            const ast = parser.parse(content, {
                sourceType: 'module',
                plugins: [
                    'jsx',
                    'typescript',
                    'decorators-legacy',
                    'classProperties',
                    'dynamicImport',
                    'objectRestSpread'
                ]
            });

            traverse.default(ast, {
                // Track function declarations
                FunctionDeclaration: (nodePath) => {
                    const functionName = nodePath.node.id?.name;
                    if (functionName) {
                        const functionInfo = {
                            name: functionName,
                            file: relativePath,
                            line: nodePath.node.loc?.start.line || 0,
                            type: 'function',
                            async: nodePath.node.async,
                            params: nodePath.node.params.length
                        };
                        fileInfo.functions.push(functionInfo);
                        this.registerFunction(functionName, functionInfo);
                    }
                },

                // Track arrow functions and function expressions assigned to variables
                VariableDeclarator: (nodePath) => {
                    const name = nodePath.node.id?.name;
                    const init = nodePath.node.init;
                    
                    if (name && (init?.type === 'ArrowFunctionExpression' || init?.type === 'FunctionExpression')) {
                        const functionInfo = {
                            name,
                            file: relativePath,
                            line: nodePath.node.loc?.start.line || 0,
                            type: init.type === 'ArrowFunctionExpression' ? 'arrow' : 'expression',
                            async: init.async,
                            params: init.params?.length || 0
                        };
                        fileInfo.functions.push(functionInfo);
                        this.registerFunction(name, functionInfo);
                    }
                },

                // Track class methods
                ClassMethod: (nodePath) => {
                    const methodName = nodePath.node.key?.name;
                    const className = nodePath.parentPath.parent?.id?.name;
                    
                    if (methodName) {
                        const fullName = className ? `${className}.${methodName}` : methodName;
                        const functionInfo = {
                            name: fullName,
                            file: relativePath,
                            line: nodePath.node.loc?.start.line || 0,
                            type: 'method',
                            className,
                            async: nodePath.node.async,
                            static: nodePath.node.static,
                            params: nodePath.node.params.length
                        };
                        fileInfo.functions.push(functionInfo);
                        this.registerFunction(fullName, functionInfo);
                    }
                },

                // Track imports
                ImportDeclaration: (nodePath) => {
                    const source = nodePath.node.source.value;
                    const specifiers = nodePath.node.specifiers.map(spec => {
                        if (spec.type === 'ImportDefaultSpecifier') {
                            return { name: spec.local.name, type: 'default' };
                        } else if (spec.type === 'ImportNamespaceSpecifier') {
                            return { name: spec.local.name, type: 'namespace' };
                        } else {
                            return { name: spec.local.name, imported: spec.imported?.name, type: 'named' };
                        }
                    });

                    const importInfo = {
                        source,
                        specifiers,
                        line: nodePath.node.loc?.start.line || 0
                    };
                    
                    fileInfo.imports.push(importInfo);
                    fileInfo.dependencies.push(source);
                    this.registerImport(relativePath, source, specifiers);
                },

                // Track exports
                ExportNamedDeclaration: (nodePath) => {
                    const declaration = nodePath.node.declaration;
                    const exportInfo = {
                        type: 'named',
                        line: nodePath.node.loc?.start.line || 0
                    };

                    if (declaration?.type === 'FunctionDeclaration') {
                        exportInfo.name = declaration.id?.name;
                    } else if (declaration?.type === 'VariableDeclaration') {
                        exportInfo.names = declaration.declarations.map(d => d.id?.name).filter(Boolean);
                    }

                    if (exportInfo.name || exportInfo.names) {
                        fileInfo.exports.push(exportInfo);
                        this.registerExport(relativePath, exportInfo);
                    }
                },

                ExportDefaultDeclaration: (nodePath) => {
                    const exportInfo = {
                        type: 'default',
                        line: nodePath.node.loc?.start.line || 0
                    };
                    
                    fileInfo.exports.push(exportInfo);
                    this.registerExport(relativePath, exportInfo);
                },

                // Track function calls
                CallExpression: (nodePath) => {
                    let calleeName = null;
                    
                    if (nodePath.node.callee.type === 'Identifier') {
                        calleeName = nodePath.node.callee.name;
                    } else if (nodePath.node.callee.type === 'MemberExpression') {
                        const object = nodePath.node.callee.object?.name;
                        const property = nodePath.node.callee.property?.name;
                        calleeName = object && property ? `${object}.${property}` : property;
                    }

                    if (calleeName) {
                        const callInfo = {
                            name: calleeName,
                            line: nodePath.node.loc?.start.line || 0,
                            args: nodePath.node.arguments.length
                        };
                        fileInfo.calls.push(callInfo);
                        this.registerFunctionCall(relativePath, calleeName);
                    }
                }
            });

        } catch (error) {
            // For files that can't be parsed, store basic info
            console.warn(`   Cannot parse ${relativePath}: ${error.message}`);
        }

        this.files.set(relativePath, fileInfo);
        this.statistics.totalFiles++;
        
        const ext = path.extname(filePath);
        this.statistics.fileTypes[ext] = (this.statistics.fileTypes[ext] || 0) + 1;
    }

    getFileType(filePath) {
        const ext = path.extname(filePath);
        const baseName = path.basename(filePath, ext);
        
        if (filePath.includes('/components/')) return 'component';
        if (filePath.includes('/services/')) return 'service';
        if (filePath.includes('/api/')) return 'api';
        if (filePath.includes('/scripts/')) return 'script';
        if (filePath.includes('/utils/') || filePath.includes('/lib/')) return 'utility';
        if (baseName.endsWith('.test') || baseName.endsWith('.spec')) return 'test';
        if (ext === '.tsx' || ext === '.jsx') return 'component';
        
        return 'module';
    }

    registerFunction(name, info) {
        if (!this.functions.has(name)) {
            this.functions.set(name, []);
        }
        this.functions.get(name).push(info);
        this.statistics.totalFunctions++;
    }

    registerImport(fromFile, toModule, specifiers) {
        const key = `${fromFile}::${toModule}`;
        this.imports.set(key, { fromFile, toModule, specifiers });
        this.statistics.totalImports++;
    }

    registerExport(file, exportInfo) {
        if (!this.exports.has(file)) {
            this.exports.set(file, []);
        }
        this.exports.get(file).push(exportInfo);
        this.statistics.totalExports++;
    }

    registerFunctionCall(fromFile, functionName) {
        const key = `${fromFile}::${functionName}`;
        if (!this.functionCalls.has(key)) {
            this.functionCalls.set(key, { count: 0, fromFile, functionName });
        }
        this.functionCalls.get(key).count++;
        this.statistics.totalCalls++;
    }

    calculateStatistics() {
        console.log('\n📊 Calculating statistics...');

        // Most used functions
        const functionUsage = new Map();
        for (const [key, callInfo] of this.functionCalls) {
            const count = functionUsage.get(callInfo.functionName) || 0;
            functionUsage.set(callInfo.functionName, count + callInfo.count);
        }

        this.statistics.mostUsedFunctions = Array.from(functionUsage.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 50)
            .map(([name, count]) => ({ name, count }));

        // Most connected files (by imports)
        const fileConnections = new Map();
        for (const [relativePath, fileInfo] of this.files) {
            const connections = fileInfo.imports.length + fileInfo.exports.length;
            fileConnections.set(relativePath, connections);
        }

        this.statistics.mostConnectedFiles = Array.from(fileConnections.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 50)
            .map(([path, connections]) => ({ path, connections }));
    }

    detectPatterns() {
        console.log('🔍 Detecting architectural patterns...');

        // Detect services
        for (const [filePath, fileInfo] of this.files) {
            if (fileInfo.type === 'service' || filePath.includes('service')) {
                this.services.set(filePath, {
                    ...fileInfo,
                    endpoints: fileInfo.exports.length,
                    dependencies: fileInfo.imports.length
                });
            }

            if (fileInfo.type === 'component') {
                this.components.set(filePath, {
                    ...fileInfo,
                    exports: fileInfo.exports.length
                });
            }
        }
    }

    /**
     * Generate all output files
     */
    generateOutput() {
        const outputDir = path.join(PROJECT_ROOT, 'knowledge-graph-output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        console.log('\n📝 Generating outputs...');

        // 1. Knowledge graph JSON
        const knowledgeGraph = this.generateKnowledgeGraphJSON();
        fs.writeFileSync(
            path.join(outputDir, 'knowledge-graph.json'),
            JSON.stringify(knowledgeGraph, null, 2)
        );
        console.log('   ✅ knowledge-graph.json');

        // 2. Statistics report
        fs.writeFileSync(
            path.join(outputDir, 'statistics.json'),
            JSON.stringify(this.statistics, null, 2)
        );
        console.log('   ✅ statistics.json');

        // 3. Interactive HTML visualization
        const htmlViz = this.generateHTMLVisualization(knowledgeGraph);
        fs.writeFileSync(
            path.join(outputDir, 'knowledge-graph.html'),
            htmlViz
        );
        console.log('   ✅ knowledge-graph.html');

        // 4. Neo4j import files
        this.generateNeo4jImports(outputDir);
        console.log('   ✅ Neo4j import files');

        // 5. Architecture analysis report
        const report = this.generateArchitectureReport();
        fs.writeFileSync(
            path.join(outputDir, 'architecture-analysis.md'),
            report
        );
        console.log('   ✅ architecture-analysis.md');

        // 6. Dependency graph
        const depGraph = this.generateDependencyGraph();
        fs.writeFileSync(
            path.join(outputDir, 'dependency-graph.json'),
            JSON.stringify(depGraph, null, 2)
        );
        console.log('   ✅ dependency-graph.json');

        console.log(`\n✨ All outputs generated in: ${outputDir}`);
        
        return {
            outputDir,
            knowledgeGraph,
            statistics: this.statistics
        };
    }

    generateKnowledgeGraphJSON() {
        const nodes = [];
        const edges = [];
        let nodeId = 0;
        let edgeId = 0;

        // Create file nodes
        const fileNodeMap = new Map();
        for (const [relativePath, fileInfo] of this.files) {
            const node = {
                id: `file_${nodeId++}`,
                label: relativePath,
                type: 'file',
                fileType: fileInfo.type,
                size: fileInfo.size,
                lines: fileInfo.lines,
                functionCount: fileInfo.functions.length,
                importCount: fileInfo.imports.length,
                exportCount: fileInfo.exports.length
            };
            nodes.push(node);
            fileNodeMap.set(relativePath, node.id);
        }

        // Create function nodes
        const functionNodeMap = new Map();
        for (const [functionName, occurrences] of this.functions) {
            const node = {
                id: `func_${nodeId++}`,
                label: functionName,
                type: 'function',
                occurrences: occurrences.length,
                files: occurrences.map(o => o.file)
            };
            nodes.push(node);
            functionNodeMap.set(functionName, node.id);

            // Link functions to their files
            occurrences.forEach(occ => {
                const fileNodeId = fileNodeMap.get(occ.file);
                if (fileNodeId) {
                    edges.push({
                        id: `edge_${edgeId++}`,
                        source: fileNodeId,
                        target: node.id,
                        type: 'defines',
                        line: occ.line
                    });
                }
            });
        }

        // Create import/dependency edges
        for (const [relativePath, fileInfo] of this.files) {
            const sourceNodeId = fileNodeMap.get(relativePath);
            
            fileInfo.imports.forEach(imp => {
                // Try to find the target file
                const possibleTargets = [
                    imp.source,
                    imp.source + '.js',
                    imp.source + '.ts',
                    imp.source + '.tsx',
                    imp.source + '/index.js',
                    imp.source + '/index.ts'
                ];

                for (const target of possibleTargets) {
                    const normalizedTarget = target.startsWith('.') 
                        ? path.normalize(path.join(path.dirname(relativePath), target))
                        : target;
                    
                    const targetNodeId = fileNodeMap.get(normalizedTarget);
                    if (targetNodeId) {
                        edges.push({
                            id: `edge_${edgeId++}`,
                            source: sourceNodeId,
                            target: targetNodeId,
                            type: 'imports',
                            specifiers: imp.specifiers.map(s => s.name)
                        });
                        break;
                    }
                }
            });
        }

        // Create function call edges
        for (const [key, callInfo] of this.functionCalls) {
            const sourceNodeId = fileNodeMap.get(callInfo.fromFile);
            const targetNodeId = functionNodeMap.get(callInfo.functionName);
            
            if (sourceNodeId && targetNodeId) {
                edges.push({
                    id: `edge_${edgeId++}`,
                    source: sourceNodeId,
                    target: targetNodeId,
                    type: 'calls',
                    count: callInfo.count
                });
            }
        }

        return {
            nodes,
            edges,
            metadata: {
                generatedAt: new Date().toISOString(),
                totalNodes: nodes.length,
                totalEdges: edges.length,
                statistics: this.statistics
            }
        };
    }

    generateHTMLVisualization(knowledgeGraph) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LightDom Codebase Knowledge Graph</title>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #0a0e27;
            color: #fff;
            overflow: hidden;
        }
        #container {
            display: flex;
            height: 100vh;
        }
        #sidebar {
            width: 350px;
            background: #151932;
            padding: 20px;
            overflow-y: auto;
            border-right: 1px solid #2a2f4a;
        }
        #graph {
            flex: 1;
            position: relative;
        }
        h1 {
            font-size: 24px;
            margin-bottom: 20px;
            color: #00d4ff;
        }
        h2 {
            font-size: 18px;
            margin: 20px 0 10px;
            color: #00d4ff;
        }
        .stat {
            padding: 10px;
            margin: 5px 0;
            background: #1a1f3a;
            border-radius: 5px;
            display: flex;
            justify-content: space-between;
        }
        .stat-label {
            color: #a0a5c0;
        }
        .stat-value {
            color: #00d4ff;
            font-weight: bold;
        }
        .list-item {
            padding: 8px;
            margin: 3px 0;
            background: #1a1f3a;
            border-radius: 3px;
            font-size: 12px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .list-item:hover {
            background: #252a45;
        }
        .controls {
            margin: 20px 0;
        }
        button {
            background: #00d4ff;
            color: #0a0e27;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
            font-weight: bold;
        }
        button:hover {
            background: #00b8e6;
        }
        .node {
            cursor: pointer;
            stroke: #fff;
            stroke-width: 1.5px;
        }
        .node.file { fill: #4CAF50; }
        .node.function { fill: #2196F3; }
        .node.component { fill: #FF9800; }
        .node.service { fill: #9C27B0; }
        .link {
            stroke: #999;
            stroke-opacity: 0.6;
        }
        .link.imports { stroke: #00d4ff; }
        .link.calls { stroke: #ff6b6b; }
        .link.defines { stroke: #51cf66; }
        text {
            font-size: 10px;
            fill: #fff;
            pointer-events: none;
        }
        #tooltip {
            position: absolute;
            padding: 10px;
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid #00d4ff;
            border-radius: 5px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s;
            font-size: 12px;
            max-width: 300px;
        }
        .legend {
            margin: 20px 0;
        }
        .legend-item {
            display: flex;
            align-items: center;
            margin: 5px 0;
            font-size: 12px;
        }
        .legend-color {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <div id="container">
        <div id="sidebar">
            <h1>📊 Knowledge Graph</h1>
            
            <div class="controls">
                <button onclick="resetZoom()">Reset View</button>
                <button onclick="toggleLabels()">Toggle Labels</button>
            </div>

            <h2>Statistics</h2>
            <div class="stat">
                <span class="stat-label">Total Files</span>
                <span class="stat-value">${this.statistics.totalFiles}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Total Functions</span>
                <span class="stat-value">${this.statistics.totalFunctions}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Total Imports</span>
                <span class="stat-value">${this.statistics.totalImports}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Total Exports</span>
                <span class="stat-value">${this.statistics.totalExports}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Total Function Calls</span>
                <span class="stat-value">${this.statistics.totalCalls}</span>
            </div>

            <h2>Legend</h2>
            <div class="legend">
                <div class="legend-item">
                    <div class="legend-color" style="background: #4CAF50;"></div>
                    <span>Files</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #2196F3;"></div>
                    <span>Functions</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #FF9800;"></div>
                    <span>Components</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #9C27B0;"></div>
                    <span>Services</span>
                </div>
            </div>

            <h2>Most Used Functions</h2>
            <div id="top-functions">
                ${this.statistics.mostUsedFunctions.slice(0, 10).map(f => 
                    `<div class="list-item">${f.name} <span style="float: right; color: #00d4ff;">${f.count}</span></div>`
                ).join('')}
            </div>

            <h2>Most Connected Files</h2>
            <div id="top-files">
                ${this.statistics.mostConnectedFiles.slice(0, 10).map(f => 
                    `<div class="list-item" title="${f.path}">${path.basename(f.path)} <span style="float: right; color: #00d4ff;">${f.connections}</span></div>`
                ).join('')}
            </div>
        </div>
        
        <div id="graph">
            <div id="tooltip"></div>
        </div>
    </div>

    <script>
        const data = ${JSON.stringify(knowledgeGraph)};
        
        const width = window.innerWidth - 350;
        const height = window.innerHeight;
        
        let showLabels = true;

        const svg = d3.select('#graph')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g');

        const zoom = d3.zoom()
            .scaleExtent([0.1, 10])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);

        const simulation = d3.forceSimulation(data.nodes)
            .force('link', d3.forceLink(data.edges).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(30));

        const link = g.append('g')
            .selectAll('line')
            .data(data.edges)
            .enter()
            .append('line')
            .attr('class', d => 'link ' + d.type)
            .attr('stroke-width', d => d.count ? Math.sqrt(d.count) : 1);

        const node = g.append('g')
            .selectAll('circle')
            .data(data.nodes)
            .enter()
            .append('circle')
            .attr('class', d => 'node ' + d.type)
            .attr('r', d => {
                if (d.type === 'file') return 5 + (d.functionCount || 0) * 0.5;
                if (d.type === 'function') return 3 + (d.occurrences || 0) * 0.5;
                return 5;
            })
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended))
            .on('mouseover', showTooltip)
            .on('mouseout', hideTooltip);

        const label = g.append('g')
            .selectAll('text')
            .data(data.nodes.filter(d => d.type === 'file'))
            .enter()
            .append('text')
            .text(d => d.label.split('/').pop())
            .attr('x', 8)
            .attr('y', 3);

        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

            label
                .attr('x', d => d.x + 8)
                .attr('y', d => d.y + 3);
        });

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        function showTooltip(event, d) {
            const tooltip = d3.select('#tooltip');
            let content = '<strong>' + d.label + '</strong><br>';
            content += 'Type: ' + d.type + '<br>';
            
            if (d.type === 'file') {
                content += 'Lines: ' + d.lines + '<br>';
                content += 'Functions: ' + d.functionCount + '<br>';
                content += 'Imports: ' + d.importCount + '<br>';
                content += 'Exports: ' + d.exportCount;
            } else if (d.type === 'function') {
                content += 'Occurrences: ' + d.occurrences + '<br>';
                content += 'Files: ' + d.files.join(', ');
            }
            
            tooltip
                .html(content)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 10) + 'px')
                .style('opacity', 1);
        }

        function hideTooltip() {
            d3.select('#tooltip').style('opacity', 0);
        }

        function resetZoom() {
            svg.transition().duration(750).call(
                zoom.transform,
                d3.zoomIdentity.translate(width / 2, height / 2).scale(1).translate(-width / 2, -height / 2)
            );
        }

        function toggleLabels() {
            showLabels = !showLabels;
            label.style('opacity', showLabels ? 1 : 0);
        }
    </script>
</body>
</html>`;
    }

    generateNeo4jImports(outputDir) {
        // Nodes CSV
        const nodesCSV = ['id:ID,label,type,:LABEL\n'];
        for (const [relativePath, fileInfo] of this.files) {
            nodesCSV.push(`"${relativePath}","${relativePath}","${fileInfo.type}",File\n`);
        }
        for (const [functionName] of this.functions) {
            nodesCSV.push(`"func_${functionName}","${functionName}","function",Function\n`);
        }
        fs.writeFileSync(path.join(outputDir, 'neo4j-nodes.csv'), nodesCSV.join(''));

        // Relationships CSV
        const relsCSV = [':START_ID,:END_ID,:TYPE\n'];
        for (const [key, importInfo] of this.imports) {
            relsCSV.push(`"${importInfo.fromFile}","${importInfo.toModule}",IMPORTS\n`);
        }
        for (const [key, callInfo] of this.functionCalls) {
            relsCSV.push(`"${callInfo.fromFile}","func_${callInfo.functionName}",CALLS\n`);
        }
        fs.writeFileSync(path.join(outputDir, 'neo4j-relationships.csv'), relsCSV.join(''));
    }

    generateArchitectureReport() {
        let report = `# LightDom Codebase Architecture Analysis\n\n`;
        report += `Generated: ${new Date().toISOString()}\n\n`;
        
        report += `## Overview\n\n`;
        report += `- **Total Files**: ${this.statistics.totalFiles}\n`;
        report += `- **Total Functions**: ${this.statistics.totalFunctions}\n`;
        report += `- **Total Imports**: ${this.statistics.totalImports}\n`;
        report += `- **Total Exports**: ${this.statistics.totalExports}\n`;
        report += `- **Total Function Calls**: ${this.statistics.totalCalls}\n\n`;

        report += `## File Type Distribution\n\n`;
        for (const [ext, count] of Object.entries(this.statistics.fileTypes)) {
            report += `- ${ext}: ${count} files\n`;
        }

        report += `\n## Most Used Functions (Top 20)\n\n`;
        report += `| Function | Usage Count |\n`;
        report += `|----------|-------------|\n`;
        this.statistics.mostUsedFunctions.slice(0, 20).forEach(f => {
            report += `| ${f.name} | ${f.count} |\n`;
        });

        report += `\n## Most Connected Files (Top 20)\n\n`;
        report += `| File | Connections |\n`;
        report += `|------|-------------|\n`;
        this.statistics.mostConnectedFiles.slice(0, 20).forEach(f => {
            report += `| ${f.path} | ${f.connections} |\n`;
        });

        report += `\n## Services Detected\n\n`;
        report += `Total Services: ${this.services.size}\n\n`;
        for (const [path, service] of Array.from(this.services.entries()).slice(0, 20)) {
            report += `- **${path}**\n`;
            report += `  - Endpoints: ${service.endpoints}\n`;
            report += `  - Dependencies: ${service.dependencies}\n\n`;
        }

        report += `\n## Components Detected\n\n`;
        report += `Total Components: ${this.components.size}\n\n`;

        report += `\n## Recommendations\n\n`;
        report += `Based on the analysis:\n\n`;
        report += `1. **High Coupling**: Files with >50 connections may need refactoring\n`;
        report += `2. **Function Reuse**: Top functions should be well-documented and tested\n`;
        report += `3. **Service Architecture**: ${this.services.size} services detected - consider microservices pattern\n`;
        report += `4. **Component Library**: ${this.components.size} components - standardize and document\n`;

        return report;
    }

    generateDependencyGraph() {
        const graph = {
            nodes: [],
            links: []
        };

        // Add file nodes
        for (const [relativePath, fileInfo] of this.files) {
            graph.nodes.push({
                id: relativePath,
                type: fileInfo.type,
                group: this.getFileGroup(relativePath)
            });
        }

        // Add dependency links
        for (const [relativePath, fileInfo] of this.files) {
            fileInfo.dependencies.forEach(dep => {
                graph.links.push({
                    source: relativePath,
                    target: dep,
                    type: 'dependency'
                });
            });
        }

        return graph;
    }

    getFileGroup(filePath) {
        if (filePath.startsWith('src/components')) return 'components';
        if (filePath.startsWith('src/services')) return 'services';
        if (filePath.startsWith('src/api') || filePath.startsWith('api/')) return 'api';
        if (filePath.startsWith('scripts/')) return 'scripts';
        if (filePath.startsWith('electron/')) return 'electron';
        return 'other';
    }
}

// Run the analyzer
(async () => {
    try {
        const analyzer = new CodebaseKnowledgeGraph();
        const result = await analyzer.analyze();
        
        console.log('\n' + '='.repeat(60));
        console.log('✨ Knowledge Graph Generation Complete!');
        console.log('='.repeat(60));
        console.log(`\n📁 Output directory: ${result.outputDir}`);
        console.log(`\n🌐 Open the visualization:`);
        console.log(`   file://${path.join(result.outputDir, 'knowledge-graph.html')}\n`);
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
})();
