#!/usr/bin/env node

/**
 * Codebase Indexing CLI
 * 
 * Command-line tool for indexing codebases using high-quality embeddings
 * and making the index available for semantic search.
 * 
 * Usage:
 *   node codebase-index-cli.js index [path]     - Index a codebase
 *   node codebase-index-cli.js search <query>   - Search the index
 *   node codebase-index-cli.js context <query>  - Get context for AI
 *   node codebase-index-cli.js similar <file>   - Find similar files
 *   node codebase-index-cli.js stats            - Show index statistics
 *   node codebase-index-cli.js models           - List embedding models
 *   node codebase-index-cli.js switch <model>   - Switch embedding model
 *   node codebase-index-cli.js clear            - Clear the index
 */

import { createCodebaseEmbeddingIndexer } from './services/rag/codebase-embedding-indexer.js';
import { EMBEDDING_MODELS, DEFAULT_MODELS } from './services/rag/ollama-embedding-service.js';
import { createInterface } from 'readline';
import path from 'path';

const args = process.argv.slice(2);
const command = args[0];

// Help text
function showHelp() {
    console.log(`
🔍 Codebase Indexing CLI - High-Quality Semantic Search

USAGE:
    codebase-index-cli <command> [options]

COMMANDS:
    index [path]           Index a codebase (default: current directory)
    search <query>         Search the indexed codebase
    context <query>        Get context for AI models
    similar <file>         Find files similar to the given file
    related <code>         Find code related to a snippet
    stats                  Show index statistics
    files                  List indexed files
    models                 List available embedding models
    switch <model>         Switch to a different embedding model
    clear                  Clear the index
    export <path>          Export index to a file
    import <path>          Import index from a file
    help                   Show this help

OPTIONS:
    --incremental, -i      Only index changed files
    --model, -m <name>     Use specific embedding model
    --topk, -k <n>         Number of results to return (default: 10)
    --threshold, -t <n>    Minimum similarity threshold (default: 0.5)

EXAMPLES:
    # Index the current directory
    codebase-index-cli index

    # Index a specific project
    codebase-index-cli index /path/to/project

    # Search for authentication code
    codebase-index-cli search "user authentication"

    # Get context for AI
    codebase-index-cli context "how does the API handle errors"

    # Find files similar to a component
    codebase-index-cli similar src/components/Auth.tsx

    # Switch to fast embedding model
    codebase-index-cli switch nomic-embed-text

EMBEDDING MODELS:
    mxbai-embed-large     Best quality (1024 dims) - RECOMMENDED for indexing
    nomic-embed-text      Fast, general purpose (768 dims)
    all-minilm            Lightweight (384 dims)

NOTE:
    The default model (mxbai-embed-large) provides the highest quality
    embeddings for semantic search. For faster indexing with slightly
    lower quality, use nomic-embed-text.
`);
}

async function main() {
    if (!command || command === 'help' || command === '--help' || command === '-h') {
        showHelp();
        process.exit(0);
    }

    // Parse options
    const options = {
        incremental: args.includes('--incremental') || args.includes('-i'),
        model: null,
        topK: 10,
        threshold: 0.5,
    };

    // Parse model option
    const modelIdx = args.findIndex(a => a === '--model' || a === '-m');
    if (modelIdx !== -1 && args[modelIdx + 1]) {
        options.model = args[modelIdx + 1];
    }

    // Parse topK option
    const topkIdx = args.findIndex(a => a === '--topk' || a === '-k');
    if (topkIdx !== -1 && args[topkIdx + 1]) {
        options.topK = parseInt(args[topkIdx + 1]);
    }

    // Parse threshold option
    const threshIdx = args.findIndex(a => a === '--threshold' || a === '-t');
    if (threshIdx !== -1 && args[threshIdx + 1]) {
        options.threshold = parseFloat(args[threshIdx + 1]);
    }

    try {
        switch (command) {
            case 'index':
                await indexCommand(args[1], options);
                break;

            case 'search':
                await searchCommand(args.slice(1).filter(a => !a.startsWith('-')).join(' '), options);
                break;

            case 'context':
                await contextCommand(args.slice(1).filter(a => !a.startsWith('-')).join(' '), options);
                break;

            case 'similar':
                await similarCommand(args[1], options);
                break;

            case 'related':
                await relatedCommand(args.slice(1).filter(a => !a.startsWith('-')).join(' '), options);
                break;

            case 'stats':
                await statsCommand(options);
                break;

            case 'files':
                await filesCommand(options);
                break;

            case 'models':
                modelsCommand();
                break;

            case 'switch':
                await switchCommand(args[1], options);
                break;

            case 'clear':
                await clearCommand(options);
                break;

            case 'export':
                await exportCommand(args[1], options);
                break;

            case 'import':
                await importCommand(args[1], options);
                break;

            default:
                console.error(`Unknown command: ${command}`);
                showHelp();
                process.exit(1);
        }
    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        process.exit(1);
    }
}

async function getIndexer(options = {}) {
    const indexer = createCodebaseEmbeddingIndexer({
        rootPath: options.rootPath || process.cwd(),
        model: options.model || DEFAULT_MODELS['codebase-indexing'],
    });
    
    await indexer.initialize();
    return indexer;
}

async function indexCommand(targetPath, options) {
    const rootPath = targetPath ? path.resolve(targetPath) : process.cwd();
    
    console.log(`\n📂 Indexing codebase: ${rootPath}`);
    console.log(`🧠 Embedding model: ${options.model || DEFAULT_MODELS['codebase-indexing']}`);
    console.log(`📊 Mode: ${options.incremental ? 'incremental' : 'full'}\n`);

    const indexer = await getIndexer({ ...options, rootPath });
    
    // Set up progress listener
    indexer.on('indexing:progress', (progress) => {
        process.stdout.write(`\rProgress: ${progress.processed}/${progress.total} files (${progress.percent}%)`);
    });

    const stats = await indexer.buildIndex({ incremental: options.incremental });
    
    console.log(`\n\n✅ Indexing complete!`);
    console.log(`📊 Statistics:`);
    console.log(`   Files: ${stats.totalFiles}`);
    console.log(`   Chunks: ${stats.totalChunks}`);
    console.log(`   Duration: ${(stats.indexDuration / 1000).toFixed(2)}s`);
}

async function searchCommand(query, options) {
    if (!query) {
        console.error('❌ Search query is required');
        process.exit(1);
    }

    console.log(`\n🔍 Searching for: "${query}"\n`);

    const indexer = await getIndexer(options);
    const results = await indexer.search(query, {
        topK: options.topK,
        threshold: options.threshold,
    });

    if (results.results.length === 0) {
        console.log('No results found. Try a different query or lower the threshold.');
        return;
    }

    console.log(`Found ${results.totalMatches} matches (showing top ${results.results.length}):\n`);

    for (const result of results.results) {
        console.log(`📄 ${result.relativePath} (lines ${result.startLine}-${result.endLine})`);
        console.log(`   Similarity: ${(result.similarity * 100).toFixed(1)}%`);
        console.log(`   Preview: ${result.content.substring(0, 100).replace(/\n/g, ' ')}...`);
        console.log();
    }
}

async function contextCommand(query, options) {
    if (!query) {
        console.error('❌ Query is required');
        process.exit(1);
    }

    console.log(`\n🔍 Getting context for: "${query}"\n`);

    const indexer = await getIndexer(options);
    const context = await indexer.getContext(query, {
        maxTokens: 4000,
        topK: options.topK,
    });

    console.log(`📄 Context (${context.tokenEstimate} estimated tokens):`);
    console.log(`📁 Files included: ${context.files.join(', ')}`);
    console.log(`\n${'='.repeat(60)}\n`);
    console.log(context.context);
    console.log(`\n${'='.repeat(60)}`);
}

async function similarCommand(filePath, options) {
    if (!filePath) {
        console.error('❌ File path is required');
        process.exit(1);
    }

    console.log(`\n🔍 Finding files similar to: ${filePath}\n`);

    const indexer = await getIndexer(options);
    const results = await indexer.getSimilarFiles(path.resolve(filePath), {
        topK: options.topK,
        threshold: options.threshold,
    });

    if (results.results.length === 0) {
        console.log('No similar files found.');
        return;
    }

    console.log(`Found ${results.results.length} similar files:\n`);

    for (const result of results.results) {
        console.log(`📄 ${result.relativePath}`);
        console.log(`   Similarity: ${(result.similarity * 100).toFixed(1)}%`);
        console.log();
    }
}

async function relatedCommand(code, options) {
    if (!code) {
        console.error('❌ Code snippet is required');
        process.exit(1);
    }

    console.log(`\n🔍 Finding related code...\n`);

    const indexer = await getIndexer(options);
    const results = await indexer.getRelatedCode(code, {
        topK: options.topK,
        threshold: options.threshold,
    });

    if (results.results.length === 0) {
        console.log('No related code found.');
        return;
    }

    console.log(`Found ${results.totalMatches} related snippets (showing top ${results.results.length}):\n`);

    for (const result of results.results) {
        console.log(`📄 ${result.relativePath} (lines ${result.startLine}-${result.endLine})`);
        console.log(`   Similarity: ${(result.similarity * 100).toFixed(1)}%`);
        console.log(`   Preview: ${result.content.substring(0, 100).replace(/\n/g, ' ')}...`);
        console.log();
    }
}

async function statsCommand(options) {
    const indexer = await getIndexer(options);
    const stats = indexer.getStats();
    const embeddingStats = indexer.embeddingService.getStats();

    console.log(`\n📊 Index Statistics\n${'='.repeat(40)}`);
    console.log(`Model:           ${stats.model}`);
    console.log(`Dimensions:      ${stats.dimensions}`);
    console.log(`Files:           ${stats.fileCount}`);
    console.log(`Chunks:          ${stats.chunkCount}`);
    console.log(`Created:         ${stats.createdAt || 'N/A'}`);
    console.log(`Updated:         ${stats.updatedAt || 'N/A'}`);
    
    console.log(`\n📈 Embedding Service Statistics\n${'='.repeat(40)}`);
    console.log(`Total embeddings: ${embeddingStats.totalEmbeddings}`);
    console.log(`Cache hits:       ${embeddingStats.cacheHits}`);
    console.log(`Cache misses:     ${embeddingStats.cacheMisses}`);
    console.log(`Model switches:   ${embeddingStats.modelSwitches}`);
    console.log(`Errors:           ${embeddingStats.errors}`);
}

async function filesCommand(options) {
    const indexer = await getIndexer(options);
    const files = indexer.getIndexedFiles();

    console.log(`\n📁 Indexed Files (${files.length} total)\n${'='.repeat(40)}`);

    for (const file of files) {
        console.log(`${file.relativePath} (${file.chunkCount} chunks)`);
    }
}

function modelsCommand() {
    console.log(`\n🧠 Available Embedding Models\n${'='.repeat(50)}`);

    for (const [name, info] of Object.entries(EMBEDDING_MODELS)) {
        const recommended = info.recommended ? ' ⭐ RECOMMENDED' : '';
        console.log(`\n${name}${recommended}`);
        console.log(`  Description: ${info.description}`);
        console.log(`  Dimensions:  ${info.dimensions}`);
        console.log(`  Use case:    ${info.useCase}`);
        console.log(`  Performance: ${info.performance}`);
    }

    console.log(`\n📌 Default Models:`);
    for (const [useCase, model] of Object.entries(DEFAULT_MODELS)) {
        console.log(`  ${useCase}: ${model}`);
    }
}

async function switchCommand(modelName, options) {
    if (!modelName) {
        console.error('❌ Model name is required');
        console.log('Available models:', Object.keys(EMBEDDING_MODELS).join(', '));
        process.exit(1);
    }

    console.log(`\n🔄 Switching to model: ${modelName}`);

    const indexer = await getIndexer(options);
    
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const answer = await new Promise((resolve) => {
        rl.question('Reindex with new model? (y/N): ', resolve);
    });
    rl.close();

    const reindex = answer.toLowerCase() === 'y';
    
    const result = await indexer.switchModel(modelName, { reindex });
    
    console.log(`\n✅ Switched from ${result.previousModel} to ${result.currentModel}`);
    
    if (result.modelInfo) {
        console.log(`   Dimensions: ${result.modelInfo.dimensions}`);
        console.log(`   Description: ${result.modelInfo.description}`);
    }
}

async function clearCommand(options) {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const answer = await new Promise((resolve) => {
        rl.question('⚠️  This will delete the entire index. Are you sure? (y/N): ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'y') {
        console.log('Cancelled.');
        return;
    }

    const indexer = await getIndexer(options);
    await indexer.clearIndex();
    
    console.log('\n🗑️ Index cleared successfully.');
}

async function exportCommand(outputPath, options) {
    if (!outputPath) {
        console.error('❌ Output path is required');
        process.exit(1);
    }

    const indexer = await getIndexer(options);
    await indexer.exportIndex(path.resolve(outputPath));
    
    console.log(`\n✅ Index exported to: ${outputPath}`);
}

async function importCommand(inputPath, options) {
    if (!inputPath) {
        console.error('❌ Input path is required');
        process.exit(1);
    }

    const indexer = await getIndexer(options);
    const stats = await indexer.importIndex(path.resolve(inputPath));
    
    console.log(`\n✅ Index imported from: ${inputPath}`);
    console.log(`   Files: ${stats.totalFiles}`);
    console.log(`   Chunks: ${stats.totalChunks}`);
}

main().catch((error) => {
    console.error(`\n❌ Fatal error: ${error.message}`);
    process.exit(1);
});
