#!/usr/bin/env node

/**
 * Campaign Management CLI
 * 
 * Command-line interface for managing data mining campaigns
 */

import { CampaignManagementService, CAMPAIGN_TYPES } from '../services/campaign-management-service.js';
import { program } from 'commander';

const campaignMgr = new CampaignManagementService();

program
  .name('manage-campaigns')
  .description('Manage data mining campaigns')
  .version('1.0.0');

program
  .command('create')
  .description('Create a new campaign')
  .option('--type <type>', 'Campaign type', 'storybook_discovery')
  .option('--name <name>', 'Campaign name', 'Unnamed Campaign')
  .option('--goal <goal>', 'Goal in format key:value', 'minComponents:1000')
  .option('--workers <number>', 'Max workers', '4')
  .option('--priority <number>', 'Priority 1-10', '5')
  .action(async (options) => {
    const [goalKey, goalValue] = options.goal.split(':');
    
    const campaign = await campaignMgr.createCampaign({
      name: options.name,
      type: options.type,
      priority: parseInt(options.priority),
      goals: { [goalKey]: parseInt(goalValue) },
      resources: { maxWorkers: parseInt(options.workers) },
    });
    
    console.log('✅ Campaign created:', campaign.id);
    console.log('   Name:', campaign.name);
    console.log('   Type:', campaign.type);
    console.log('   Status:', campaign.status);
  });

program
  .command('list')
  .description('List all campaigns')
  .option('--status <status>', 'Filter by status')
  .option('--type <type>', 'Filter by type')
  .action((options) => {
    const campaigns = campaignMgr.listCampaigns(options);
    
    console.log(`📋 Campaigns (${campaigns.length}):\n`);
    
    for (const campaign of campaigns) {
      console.log(`${campaign.id}`);
      console.log(`  Name: ${campaign.name}`);
      console.log(`  Type: ${campaign.type}`);
      console.log(`  Status: ${campaign.status}`);
      console.log(`  Progress: ${campaign.metrics.progressPercent.toFixed(1)}%`);
      console.log('');
    }
  });

program
  .command('status <id>')
  .description('Get campaign status')
  .action((id) => {
    const campaign = campaignMgr.getCampaign(id);
    
    if (!campaign) {
      console.error('❌ Campaign not found:', id);
      process.exit(1);
    }
    
    console.log('📊 Campaign Status\n');
    console.log('ID:', campaign.id);
    console.log('Name:', campaign.name);
    console.log('Type:', campaign.type);
    console.log('Status:', campaign.status);
    console.log('Priority:', campaign.priority);
    console.log('\nProgress:');
    console.log('  Percent:', campaign.metrics.progressPercent.toFixed(1) + '%');
    console.log('  Processed:', campaign.metrics.itemsProcessed);
    console.log('  Succeeded:', campaign.metrics.itemsSucceeded);
    console.log('  Failed:', campaign.metrics.itemsFailed);
    
    if (campaign.status === 'completed') {
      console.log('\nDuration:', campaign.metrics.duration + 'ms');
    }
  });

program
  .command('metrics')
  .description('Get system metrics')
  .action(() => {
    const metrics = campaignMgr.getMetrics();
    
    console.log('📈 System Metrics\n');
    console.log('Campaigns Created:', metrics.campaignsCreated);
    console.log('Campaigns Completed:', metrics.campaignsCompleted);
    console.log('Campaigns Failed:', metrics.campaignsFailed);
    console.log('Active Campaigns:', metrics.activeCampaigns);
    console.log('Queued Campaigns:', metrics.queuedCampaigns);
    console.log('Total Data Mined:', metrics.totalDataMined);
    console.log('Average Duration:', (metrics.averageDuration / 1000).toFixed(1) + 's');
    console.log('\nResource Utilization:');
    console.log('  CPU:', metrics.resourceUtilization.cpu.toFixed(1) + '%');
    console.log('  Memory:', metrics.resourceUtilization.memory.toFixed(1) + '%');
    console.log('  Workers:', metrics.resourceUtilization.workers);
  });

program
  .command('pause <id>')
  .description('Pause a running campaign')
  .action(async (id) => {
    await campaignMgr.pauseCampaign(id);
    console.log('⏸️  Campaign paused:', id);
  });

program
  .command('resume <id>')
  .description('Resume a paused campaign')
  .action(async (id) => {
    await campaignMgr.resumeCampaign(id);
    console.log('▶️  Campaign resumed:', id);
  });

program
  .command('cancel <id>')
  .description('Cancel a campaign')
  .action(async (id) => {
    await campaignMgr.cancelCampaign(id);
    console.log('❌ Campaign cancelled:', id);
  });

program.parse();
