#!/usr/bin/env node

/**
 * URL Seeding Service Demo
 * 
 * Demonstrates the usage of the URL Seeding Service
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3001/api/seeding';

class SeedingServiceDemo {
  async run() {
    console.log('🌱 URL Seeding Service Demo\n');
    console.log('==========================================\n');

    try {
      // Step 1: Create a configuration
      console.log('1️⃣  Creating seeding configuration...');
      const config = await this.createConfig();
      console.log(`✅ Configuration created: ${config.instanceId}\n`);

      // Step 2: Start the service
      console.log('2️⃣  Starting seeding service...');
      await this.startService(config.instanceId);
      console.log(`✅ Service started\n`);

      // Step 3: Add some seeds
      console.log('3️⃣  Adding URL seeds...');
      await this.addSeeds(config.instanceId);
      console.log(`✅ Seeds added\n`);

      // Step 4: Check status
      console.log('4️⃣  Checking service status...');
      const status = await this.getStatus(config.instanceId);
      console.log(`📊 Status:`, JSON.stringify(status, null, 2), '\n');

      // Step 5: Generate backlink report
      console.log('5️⃣  Generating backlink report...');
      const report = await this.generateReport(config.clientId);
      console.log(`📈 Report generated:`, JSON.stringify(report, null, 2), '\n');

      // Step 6: Get rich snippet
      console.log('6️⃣  Getting rich snippet...');
      const snippet = await this.getRichSnippet('https://example.com');
      console.log(`🎨 Rich Snippet:`, JSON.stringify(snippet, null, 2), '\n');

      // Step 7: Stop the service
      console.log('7️⃣  Stopping seeding service...');
      await this.stopService(config.instanceId);
      console.log(`✅ Service stopped\n`);

      console.log('✨ Demo completed successfully!\n');

    } catch (error) {
      console.error('❌ Demo failed:', error.message);
      if (error.response) {
        console.error('Response:', error.response.data);
      }
    }
  }

  async createConfig() {
    const response = await axios.post(`${API_BASE}/config`, {
      prompt: `Create a URL seeding configuration for an e-commerce site selling outdoor camping gear at https://outdoorgear.example.com. 
      Focus on finding competitor backlinks and authority sites in the outdoor recreation industry.`,
      clientId: 'demo_client_001',
      clientSiteUrl: 'https://outdoorgear.example.com',
      keywords: ['camping', 'outdoor', 'hiking', 'gear'],
      competitors: ['rei.com', 'backcountry.com']
    });

    return response.data.config;
  }

  async startService(instanceId) {
    const response = await axios.post(`${API_BASE}/start/${instanceId}`);
    return response.data;
  }

  async stopService(instanceId) {
    const response = await axios.post(`${API_BASE}/stop/${instanceId}`);
    return response.data;
  }

  async addSeeds(instanceId) {
    const seeds = [
      'https://outdoorgear.example.com',
      'https://outdoorgear.example.com/tents',
      'https://outdoorgear.example.com/backpacks',
      'https://rei.com',
      'https://backcountry.com'
    ];

    for (const url of seeds) {
      await axios.post(`${API_BASE}/seeds/${instanceId}`, {
        url,
        metadata: {
          source: 'demo',
          priority: 7
        }
      });
    }
  }

  async getStatus(instanceId) {
    const response = await axios.get(`${API_BASE}/status/${instanceId}`);
    return response.data.status;
  }

  async generateReport(clientId) {
    const response = await axios.post(`${API_BASE}/backlinks/report/${clientId}`, {
      clientUrls: [
        'https://outdoorgear.example.com',
        'https://outdoorgear.example.com/tents'
      ]
    });

    return response.data.report;
  }

  async getRichSnippet(url) {
    const encodedUrl = encodeURIComponent(url);
    const response = await axios.get(
      `${API_BASE}/rich-snippets/${encodedUrl}?schemaType=Product`
    );

    return response.data;
  }
}

// Run demo if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = new SeedingServiceDemo();
  demo.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default SeedingServiceDemo;
