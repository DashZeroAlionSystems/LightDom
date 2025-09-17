#!/usr/bin/env node

/**
 * Seed devnet with test data
 */

const { ethers } = require('ethers');
const fs = require('fs');

async function seedDevnet() {
  console.log('🌱 Seeding devnet with test data...');

  try {
    // Load environment
    require('dotenv').config();

    if (!process.env.RPC_URL || !process.env.PRIVATE_KEY) {
      console.log('❌ Please run deploy-devnet.js first');
      process.exit(1);
    }

    // Connect to devnet
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log('📡 Connected to devnet');
    console.log(`💰 Wallet: ${wallet.address}`);
    console.log(`💎 Balance: ${ethers.formatEther(await provider.getBalance(wallet.address))} ETH`);

    // Load contract ABIs
    const pooABI = JSON.parse(fs.readFileSync('blockchain/abi/ProofOfOptimization.json', 'utf8'));
    const pooContract = new ethers.Contract(process.env.POO_CONTRACT_ADDRESS, pooABI, wallet);

    // Submit test PoO
    console.log('📝 Submitting test PoO...');
    const testPoO = {
      crawlId: ethers.keccak256(ethers.toUtf8Bytes('test-crawl-' + Date.now())),
      merkleRoot: ethers.keccak256(ethers.toUtf8Bytes('test-merkle-root')),
      bytesSaved: 1024,
      backlinksCount: 5,
      artifactCID: 'ipfs://test-cid-123',
    };

    const tx = await pooContract.submitPoO(
      testPoO.crawlId,
      testPoO.merkleRoot,
      testPoO.bytesSaved,
      testPoO.backlinksCount,
      testPoO.artifactCID
    );

    await tx.wait();
    console.log(`✅ Test PoO submitted: ${tx.hash}`);

    // Create test artifacts
    console.log('📁 Creating test artifacts...');
    const artifactsDir = './artifacts';
    if (!fs.existsSync(artifactsDir)) {
      fs.mkdirSync(artifactsDir, { recursive: true });
    }

    const testArtifact = {
      id: testPoO.crawlId,
      url: 'https://example.com',
      timestamp: new Date().toISOString(),
      spaceSaved: testPoO.bytesSaved,
      optimizations: [
        { type: 'unused-css', bytes: 512 },
        { type: 'orphaned-js', bytes: 256 },
        { type: 'dead-elements', bytes: 256 },
      ],
      domStats: {
        totalElements: 150,
        unusedElements: 25,
        deadCSS: 10,
        orphanedJS: 5,
      },
      performance: {
        loadTime: 1200,
        domContentLoaded: 800,
        firstPaint: 600,
      },
      merkleRoot: testPoO.merkleRoot,
      backlinks: [
        { source: 'https://site1.com', target: 'https://example.com', strength: 0.8 },
        { source: 'https://site2.com', target: 'https://example.com', strength: 0.6 },
      ],
      schemas: [
        { type: 'WebPage', confidence: 0.9 },
        { type: 'Organization', confidence: 0.8 },
      ],
    };

    fs.writeFileSync(
      `${artifactsDir}/${testPoO.crawlId}.json`,
      JSON.stringify(testArtifact, null, 2)
    );

    console.log('✅ Test artifact created');

    // Create test outbox items
    console.log('📦 Creating test outbox items...');
    const outboxDir = './outbox';
    if (!fs.existsSync(outboxDir)) {
      fs.mkdirSync(outboxDir, { recursive: true });
    }

    const testOutboxItem = {
      id: 'test-outbox-' + Date.now(),
      operation: 'crawl',
      data: {
        url: 'https://test-site.com',
        depth: 1,
        priority: 8.5,
        discoveredAt: new Date().toISOString(),
      },
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    };

    fs.writeFileSync(
      `${outboxDir}/${testOutboxItem.id}.json`,
      JSON.stringify(testOutboxItem, null, 2)
    );

    console.log('✅ Test outbox item created');

    console.log('🎉 Devnet seeded successfully!');
    console.log('');
    console.log('🚀 You can now:');
    console.log('  1. Start the API: yarn start');
    console.log('  2. Start the frontend: yarn web');
    console.log('  3. View metrics: http://localhost:3001/metrics');
    console.log('  4. Check health: http://localhost:3001/api/health/detailed');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDevnet();
