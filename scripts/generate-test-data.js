#!/usr/bin/env node

/**
 * Test Data Generator for LightDom Blockchain
 * 
 * Generates mock data for testing the blockchain system including:
 * - Optimization records
 * - Proof submissions
 * - Virtual land NFTs
 * - Token balances
 */

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

class TestDataGenerator {
  constructor() {
    this.data = {
      optimizations: [],
      proofs: [],
      lands: [],
      users: []
    };
  }

  generateUsers(count = 10) {
    console.log(`👥 Generating ${count} test users...`);
    
    for (let i = 0; i < count; i++) {
      const wallet = ethers.Wallet.createRandom();
      this.data.users.push({
        id: i + 1,
        address: wallet.address,
        privateKey: wallet.privateKey,
        name: `Test User ${i + 1}`,
        email: `user${i + 1}@lightdom.test`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    console.log(`✅ Generated ${count} users\n`);
  }

  generateOptimizations(count = 50) {
    console.log(`📊 Generating ${count} test optimizations...`);
    
    const urls = [
      'https://example.com',
      'https://test-site.com',
      'https://my-blog.com',
      'https://e-commerce-store.com',
      'https://portfolio-site.com',
      'https://news-website.com',
      'https://corporate-site.com',
      'https://social-platform.com',
      'https://documentation.com',
      'https://landing-page.com'
    ];

    const biomes = [
      'e-commerce',
      'blog',
      'corporate',
      'portfolio',
      'news',
      'social',
      'documentation',
      'landing'
    ];

    for (let i = 0; i < count; i++) {
      const user = this.data.users[Math.floor(Math.random() * this.data.users.length)];
      const url = urls[Math.floor(Math.random() * urls.length)];
      const biome = biomes[Math.floor(Math.random() * biomes.length)];
      const spaceBytes = Math.floor(Math.random() * 50000) + 1000;
      
      this.data.optimizations.push({
        id: i + 1,
        url: url,
        harvester: user.address,
        spaceBytes: spaceBytes,
        biomeType: biome,
        proofHash: ethers.id(`proof-${i}-${Date.now()}`),
        metadata: JSON.stringify({
          domElementsRemoved: Math.floor(Math.random() * 100),
          cssReduced: Math.floor(Math.random() * 10000),
          jsReduced: Math.floor(Math.random() * 20000),
          imagesOptimized: Math.floor(Math.random() * 20)
        }),
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: Math.random() > 0.1 ? 'verified' : 'pending'
      });
    }
    
    console.log(`✅ Generated ${count} optimizations\n`);
  }

  generateProofs(count = 30) {
    console.log(`🔐 Generating ${count} proof submissions...`);
    
    for (let i = 0; i < count; i++) {
      const user = this.data.users[Math.floor(Math.random() * this.data.users.length)];
      const bytesSaved = Math.floor(Math.random() * 100000) + 5000;
      const backlinksCount = Math.floor(Math.random() * 200);
      
      this.data.proofs.push({
        id: i + 1,
        crawlId: ethers.id(`crawl-${i}-${Date.now()}`),
        submitter: user.address,
        merkleRoot: ethers.id(`merkle-${i}-${Date.now()}`),
        bytesSaved: bytesSaved,
        backlinksCount: backlinksCount,
        artifactCID: `Qm${Math.random().toString(36).substring(2, 15)}`,
        submittedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
        challengeWindowEnds: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        finalized: Math.random() > 0.3,
        slashed: Math.random() < 0.05
      });
    }
    
    console.log(`✅ Generated ${count} proofs\n`);
  }

  generateVirtualLands(count = 20) {
    console.log(`🏞️  Generating ${count} virtual land parcels...`);
    
    const biomes = [
      'Digital Forest',
      'Cyber Desert',
      'Data Ocean',
      'Code Mountains',
      'Binary Plains',
      'Algorithm Valley',
      'Network Tundra',
      'Cloud Peaks'
    ];

    for (let i = 0; i < count; i++) {
      const user = this.data.users[Math.floor(Math.random() * this.data.users.length)];
      const size = Math.floor(Math.random() * 500) + 50;
      const biome = biomes[Math.floor(Math.random() * biomes.length)];
      
      this.data.lands.push({
        tokenId: i + 1,
        owner: user.address,
        coordinates: {
          x: Math.floor(Math.random() * 1000) - 500,
          y: Math.floor(Math.random() * 1000) - 500
        },
        size: size,
        biome: biome,
        optimizationScore: Math.floor(Math.random() * 1000),
        tokenURI: `ipfs://Qm${Math.random().toString(36).substring(2, 15)}`,
        mintedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        staked: Math.random() > 0.7
      });
    }
    
    console.log(`✅ Generated ${count} virtual lands\n`);
  }

  generateStatistics() {
    console.log('📈 Generating statistics...');
    
    const totalSpaceSaved = this.data.optimizations.reduce(
      (sum, opt) => sum + opt.spaceBytes,
      0
    );

    const totalBytesSaved = this.data.proofs.reduce(
      (sum, proof) => sum + proof.bytesSaved,
      0
    );

    const biomeStats = {};
    this.data.optimizations.forEach(opt => {
      if (!biomeStats[opt.biomeType]) {
        biomeStats[opt.biomeType] = { count: 0, totalSpace: 0 };
      }
      biomeStats[opt.biomeType].count++;
      biomeStats[opt.biomeType].totalSpace += opt.spaceBytes;
    });

    this.data.statistics = {
      users: {
        total: this.data.users.length,
        active: Math.floor(this.data.users.length * 0.7)
      },
      optimizations: {
        total: this.data.optimizations.length,
        verified: this.data.optimizations.filter(o => o.status === 'verified').length,
        pending: this.data.optimizations.filter(o => o.status === 'pending').length,
        totalSpaceSaved: totalSpaceSaved
      },
      proofs: {
        total: this.data.proofs.length,
        finalized: this.data.proofs.filter(p => p.finalized).length,
        slashed: this.data.proofs.filter(p => p.slashed).length,
        totalBytesSaved: totalBytesSaved
      },
      lands: {
        total: this.data.lands.length,
        staked: this.data.lands.filter(l => l.staked).length,
        totalSize: this.data.lands.reduce((sum, l) => sum + l.size, 0)
      },
      biomeStats: biomeStats
    };
    
    console.log('✅ Statistics generated\n');
  }

  saveToFile(filename = 'test-data.json') {
    console.log('💾 Saving test data...');
    
    const dataDir = path.join(__dirname, '../test-data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const filepath = path.join(dataDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(this.data, null, 2));
    
    console.log(`✅ Test data saved to: ${filepath}\n`);
  }

  displaySummary() {
    console.log('='.repeat(60));
    console.log('📊 Test Data Summary');
    console.log('='.repeat(60));
    console.log(`Users: ${this.data.users.length}`);
    console.log(`Optimizations: ${this.data.optimizations.length}`);
    console.log(`Proofs: ${this.data.proofs.length}`);
    console.log(`Virtual Lands: ${this.data.lands.length}`);
    console.log('\nStatistics:');
    console.log(`  Total Space Saved: ${(this.data.statistics.optimizations.totalSpaceSaved / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Total Bytes Saved (Proofs): ${(this.data.statistics.proofs.totalBytesSaved / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Finalized Proofs: ${this.data.statistics.proofs.finalized}/${this.data.statistics.proofs.total}`);
    console.log(`  Staked Lands: ${this.data.statistics.lands.staked}/${this.data.statistics.lands.total}`);
    console.log('='.repeat(60));
  }

  async generateAll() {
    console.log('🎲 Generating comprehensive test data...\n');
    console.log('='.repeat(60));
    
    this.generateUsers(10);
    this.generateOptimizations(50);
    this.generateProofs(30);
    this.generateVirtualLands(20);
    this.generateStatistics();
    
    console.log('='.repeat(60));
    console.log('✅ All test data generated!\n');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';

  const generator = new TestDataGenerator();

  switch (command) {
    case 'all':
      await generator.generateAll();
      generator.saveToFile();
      generator.displaySummary();
      break;
    
    case 'users':
      const userCount = parseInt(args[1]) || 10;
      generator.generateUsers(userCount);
      generator.saveToFile('users.json');
      break;
    
    case 'optimizations':
      const optCount = parseInt(args[1]) || 50;
      generator.generateUsers(10);
      generator.generateOptimizations(optCount);
      generator.saveToFile('optimizations.json');
      break;
    
    case 'proofs':
      const proofCount = parseInt(args[1]) || 30;
      generator.generateUsers(10);
      generator.generateProofs(proofCount);
      generator.saveToFile('proofs.json');
      break;
    
    case 'lands':
      const landCount = parseInt(args[1]) || 20;
      generator.generateUsers(10);
      generator.generateVirtualLands(landCount);
      generator.saveToFile('lands.json');
      break;
    
    default:
      console.log('Usage: node generate-test-data.js [command] [count]');
      console.log('\nCommands:');
      console.log('  all              Generate all test data (default)');
      console.log('  users [count]    Generate test users');
      console.log('  optimizations [count]  Generate optimizations');
      console.log('  proofs [count]   Generate proof submissions');
      console.log('  lands [count]    Generate virtual lands');
      break;
  }

  console.log('\n💡 Test data can be used for:');
  console.log('  - Frontend development');
  console.log('  - API testing');
  console.log('  - Database seeding');
  console.log('  - Performance testing\n');
}

main().catch(console.error);
