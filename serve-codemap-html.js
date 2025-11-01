#!/usr/bin/env node

/**
 * Simple HTTP Server for Memory CodeMap
 * Serves the interactive HTML file so it can be opened in a browser
 */

import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 8080;

const server = createServer(async (req, res) => {
    try {
        if (req.url === '/' || req.url === '/memory-codemap-interactive.html') {
            const filePath = join(__dirname, 'memory-codemap-interactive.html');
            const content = await readFile(filePath, 'utf8');

            res.writeHead(200, {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache'
            });
            res.end(content);
        } else if (req.url === '/memory-codemap-advanced-d3.html') {
            const filePath = join(__dirname, 'memory-codemap-advanced-d3.html');
            const content = await readFile(filePath, 'utf8');

            res.writeHead(200, {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache'
            });
            res.end(content);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
        }
    } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal server error');
    }
});

server.listen(PORT, () => {
    console.log(`🌐 Memory CodeMap HTML Server running at:`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   http://localhost:${PORT}/memory-codemap-interactive.html`);
    console.log(`   http://localhost:${PORT}/memory-codemap-advanced-d3.html`);
    console.log('');
    console.log('🎯 This serves the interactive CodeMap HTML files.');
    console.log('📊 The CodeMap connects to the API server at http://localhost:3002');
    console.log('');
    console.log('🛑 Press Ctrl+C to stop this server');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 HTML Server stopped');
    server.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 HTML Server stopped');
    server.close();
    process.exit(0);
});
