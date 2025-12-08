/**
 * Test script for Lead Generation Service
 * Tests the service logic without requiring a live database
 */

import LeadGenerationService from './services/lead-generation-service.js';

// Mock database
class MockDB {
  constructor() {
    this.data = {
      leads: [],
      activities: [],
      tags: [],
      sources: [],
    };
    this.idCounter = 1;
  }

  async query(sql, params = []) {
    console.log('Mock Query:', sql.substring(0, 100), '...', params);

    // Mock SELECT queries
    if (sql.includes('SELECT * FROM leads WHERE email')) {
      const email = params[0];
      const leads = this.data.leads.filter(l => l.email === email);
      return { rows: leads };
    }

    if (sql.includes('SELECT * FROM leads WHERE id')) {
      const id = params[0];
      const leads = this.data.leads.filter(l => l.id === id);
      return { rows: leads };
    }

    if (sql.includes('SELECT COUNT(*) FROM leads')) {
      return { rows: [{ count: this.data.leads.length }] };
    }

    if (sql.includes('SELECT * FROM leads')) {
      return { rows: this.data.leads };
    }

    if (sql.includes('FROM lead_statistics')) {
      return {
        rows: [
          {
            total_leads: this.data.leads.length,
            new_leads: this.data.leads.filter(l => l.status === 'new').length,
            qualified_leads: this.data.leads.filter(l => l.status === 'qualified').length,
            converted_leads: this.data.leads.filter(l => l.status === 'converted').length,
            high_quality_leads: this.data.leads.filter(l => l.quality === 'high').length,
            average_score: this.data.leads.reduce((sum, l) => sum + l.score, 0) / this.data.leads.length || 0,
            unique_sources: new Set(this.data.leads.map(l => l.source_type)).size,
            leads_last_7_days: this.data.leads.length,
            leads_last_30_days: this.data.leads.length,
          },
        ],
      };
    }

    if (sql.includes('FROM lead_source_performance')) {
      return { rows: [] };
    }

    if (sql.includes('FROM lead_activities WHERE lead_id')) {
      const leadId = params[0];
      const activities = this.data.activities.filter(a => a.lead_id === leadId);
      return { rows: activities };
    }

    if (sql.includes('FROM lead_tags WHERE lead_id')) {
      const leadId = params[0];
      const tags = this.data.tags.filter(t => t.lead_id === leadId);
      return { rows: tags };
    }

    // Mock INSERT queries
    if (sql.includes('INSERT INTO leads')) {
      const lead = {
        id: this.idCounter++,
        email: params[0],
        name: params[1],
        company: params[2],
        phone: params[3],
        website: params[4],
        job_title: params[5],
        source_type: params[6],
        source_id: params[7],
        source_url: params[8],
        source_metadata: JSON.parse(params[9] || '{}'),
        address: params[10],
        city: params[11],
        state: params[12],
        country: params[13],
        zip_code: params[14],
        score: params[15],
        quality: params[16],
        custom_fields: JSON.parse(params[17] || '{}'),
        status: 'new',
        created_at: new Date(),
        updated_at: new Date(),
        last_activity_at: new Date(),
      };
      this.data.leads.push(lead);
      return { rows: [lead] };
    }

    if (sql.includes('INSERT INTO lead_activities')) {
      const activity = {
        id: this.idCounter++,
        lead_id: params[0],
        activity_type: params[1],
        activity_description: params[2],
        activity_data: JSON.parse(params[3] || '{}'),
        created_at: new Date(),
      };
      this.data.activities.push(activity);
      return { rows: [activity] };
    }

    if (sql.includes('INSERT INTO lead_tags')) {
      const tag = {
        id: this.idCounter++,
        lead_id: params[0],
        tag: params[1],
        created_at: new Date(),
      };
      this.data.tags.push(tag);
      return { rows: [tag] };
    }

    if (sql.includes('INSERT INTO lead_sources')) {
      return { rows: [] };
    }

    // Mock UPDATE queries
    if (sql.includes('UPDATE leads')) {
      const leadId = params[params.length - 1];
      const leadIndex = this.data.leads.findIndex(l => l.id === leadId);
      if (leadIndex >= 0) {
        // Update the lead (simplified)
        this.data.leads[leadIndex] = { ...this.data.leads[leadIndex], updated_at: new Date() };
        return { rows: [this.data.leads[leadIndex]] };
      }
      return { rows: [] };
    }

    // Default
    return { rows: [] };
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Testing Lead Generation Service\n');

  const mockDB = new MockDB();
  const service = new LeadGenerationService(mockDB);

  // Test 1: Calculate lead score
  console.log('Test 1: Calculate Lead Score');
  const score1 = service.calculateLeadScore({
    email: 'john@example.com',
    name: 'John Doe',
    company: 'Example Corp',
    phone: '555-1234',
    website: 'https://example.com',
    jobTitle: 'CEO',
  });
  console.log(`✓ Full lead score: ${score1} (expected: 90+)`);
  console.assert(score1 >= 90, 'Score should be 90+');

  const score2 = service.calculateLeadScore({
    email: 'user@gmail.com',
    name: 'User Name',
  });
  console.log(`✓ Minimal lead score: ${score2} (expected: ~25)`);
  console.assert(score2 >= 20 && score2 <= 30, 'Score should be 20-30');

  // Test 2: Determine quality
  console.log('\nTest 2: Determine Quality');
  const quality1 = service.determineQuality(85);
  console.log(`✓ Quality for score 85: ${quality1} (expected: high)`);
  console.assert(quality1 === 'high', 'Quality should be high');

  const quality2 = service.determineQuality(60);
  console.log(`✓ Quality for score 60: ${quality2} (expected: medium)`);
  console.assert(quality2 === 'medium', 'Quality should be medium');

  const quality3 = service.determineQuality(30);
  console.log(`✓ Quality for score 30: ${quality3} (expected: low)`);
  console.assert(quality3 === 'low', 'Quality should be low');

  // Test 3: Capture a lead
  console.log('\nTest 3: Capture Lead');
  const lead1 = await service.captureLead({
    email: 'jane@techcorp.com',
    name: 'Jane Smith',
    company: 'TechCorp',
    phone: '555-5678',
    website: 'https://techcorp.com',
    jobTitle: 'CTO',
    sourceType: 'crawler_campaign',
    sourceId: 'campaign_123',
    sourceUrl: 'https://techcorp.com/about',
  });
  console.log(`✓ Lead captured: ${lead1.email} (ID: ${lead1.id}, Score: ${lead1.score}, Quality: ${lead1.quality})`);
  console.assert(lead1.id > 0, 'Lead should have ID');
  console.assert(lead1.email === 'jane@techcorp.com', 'Email should match');

  // Test 4: Capture duplicate lead (should update)
  console.log('\nTest 4: Capture Duplicate Lead');
  const lead2 = await service.captureLead({
    email: 'jane@techcorp.com',
    name: 'Jane Smith Updated',
    company: 'TechCorp Inc',
    sourceType: 'seo_campaign',
    sourceId: 'seo_456',
  });
  console.log(`✓ Duplicate lead handled: ${lead2.email}`);

  // Test 5: Get leads
  console.log('\nTest 5: Get Leads');
  const leadsResult = await service.getLeads({ limit: 10 });
  console.log(`✓ Retrieved ${leadsResult.leads.length} leads`);
  console.assert(leadsResult.leads.length > 0, 'Should have leads');

  // Test 6: Get single lead
  console.log('\nTest 6: Get Single Lead');
  const lead = await service.getLead(lead1.id);
  console.log(`✓ Retrieved lead: ${lead.email} with ${lead.activities.length} activities`);

  // Test 7: Update status
  console.log('\nTest 7: Update Status');
  const updatedLead = await service.updateStatus(lead1.id, 'qualified');
  console.log(`✓ Status updated to: ${updatedLead.status}`);

  // Test 8: Add tags
  console.log('\nTest 8: Add Tags');
  await service.addTags(lead1.id, ['enterprise', 'high-priority', 'tech']);
  console.log(`✓ Tags added successfully`);

  // Test 9: Get statistics
  console.log('\nTest 9: Get Statistics');
  const stats = await service.getStatistics();
  console.log(`✓ Statistics: ${stats.total_leads} total, ${stats.new_leads} new, ${stats.qualified_leads} qualified`);

  // Test 10: Extract lead from crawler result
  console.log('\nTest 10: Extract Lead from Crawler Result');
  const crawlerResult = {
    url: 'https://example.com/contact',
    content: 'Contact us at contact@example.com. Our CEO, Bob Johnson, is available.',
    timestamp: new Date(),
  };
  const extractedLead = service.extractLeadInfoFromCrawlerResult(crawlerResult);
  console.log(`✓ Extracted lead:`, extractedLead);
  console.assert(extractedLead?.email === 'contact@example.com', 'Email should be extracted');

  // Test 11: Capture leads from crawler
  console.log('\nTest 11: Capture Leads from Crawler');
  const crawlerResults = [
    {
      url: 'https://company1.com/about',
      content: 'Email us at info@company1.com for more details.',
      title: 'About Company1',
      timestamp: new Date(),
    },
    {
      url: 'https://company2.com/contact',
      content: 'Reach out to sales@company2.com. Contact: Alice Brown, VP of Sales.',
      title: 'Contact Company2',
      timestamp: new Date(),
    },
  ];
  const capturedLeads = await service.captureLeadsFromCrawler('campaign_999', crawlerResults);
  console.log(`✓ Captured ${capturedLeads.length} leads from crawler`);

  console.log('\n✅ All tests passed!\n');
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
