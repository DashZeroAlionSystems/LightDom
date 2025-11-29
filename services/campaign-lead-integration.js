/**
 * Campaign Lead Integration Service
 * Integrates crawler campaigns with lead generation
 * Automatically captures leads when campaigns complete or process results
 */

import campaignService from './crawler-campaign-service.js';
import LeadGenerationService from './lead-generation-service.js';

class CampaignLeadIntegration {
  constructor(db, io = null) {
    this.db = db;
    this.io = io;
    this.leadService = new LeadGenerationService(db, io);
    this.campaignService = campaignService;

    // Set up event listeners
    this.setupEventListeners();

    console.log('✅ Campaign-Lead integration initialized');
  }

  /**
   * Set up event listeners for campaign events
   * @private
   */
  setupEventListeners() {
    // Listen for campaign events
    this.campaignService.on('campaignStarted', campaign => {
      console.log(`📊 Campaign started: ${campaign.id}, lead capture enabled`);
      this.onCampaignStarted(campaign);
    });

    this.campaignService.on('campaignStopped', campaign => {
      console.log(`📊 Campaign stopped: ${campaign.id}, processing final leads`);
      this.onCampaignStopped(campaign);
    });

    this.campaignService.on('crawlerStarted', crawler => {
      this.onCrawlerStarted(crawler);
    });

    this.campaignService.on('crawlerStopped', crawler => {
      this.onCrawlerStopped(crawler);
    });
  }

  /**
   * Handle campaign start event
   * @param {Object} campaign - Campaign that started
   * @private
   */
  async onCampaignStarted(campaign) {
    try {
      // Log campaign start as a lead source
      await this.db.query(
        `INSERT INTO lead_sources (source_name, source_type, source_config, is_active)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (source_name) DO UPDATE
         SET is_active = true, updated_at = CURRENT_TIMESTAMP`,
        [
          campaign.id,
          'crawler_campaign',
          JSON.stringify({
            campaignName: campaign.name,
            clientSiteUrl: campaign.clientSiteUrl,
            startedAt: new Date().toISOString(),
          }),
          true,
        ]
      );
    } catch (error) {
      console.error('Error logging campaign start for leads:', error);
    }
  }

  /**
   * Handle campaign stop event
   * @param {Object} campaign - Campaign that stopped
   * @private
   */
  async onCampaignStopped(campaign) {
    try {
      // Mark lead source as inactive
      await this.db.query(
        `UPDATE lead_sources 
         SET is_active = false, updated_at = CURRENT_TIMESTAMP
         WHERE source_name = $1`,
        [campaign.id]
      );

      // If campaign has results stored, process them for leads
      if (campaign.results && Array.isArray(campaign.results)) {
        await this.processCampaignResults(campaign.id, campaign.results);
      }
    } catch (error) {
      console.error('Error processing campaign stop for leads:', error);
    }
  }

  /**
   * Handle crawler start event
   * @param {Object} crawler - Crawler instance
   * @private
   */
  async onCrawlerStarted(crawler) {
    // Could log crawler-level metrics if needed
    console.log(`🕷️ Crawler started: ${crawler.id} for campaign ${crawler.campaignId}`);
  }

  /**
   * Handle crawler stop event
   * @param {Object} crawler - Crawler instance
   * @private
   */
  async onCrawlerStopped(crawler) {
    // Process any results from this crawler
    if (crawler.results && Array.isArray(crawler.results)) {
      await this.processCrawlerResults(crawler.campaignId, crawler.results);
    }
  }

  /**
   * Process campaign results and extract leads
   * @param {string} campaignId - Campaign ID
   * @param {Array} results - Campaign results
   * @returns {Promise<Array>} Captured leads
   */
  async processCampaignResults(campaignId, results) {
    try {
      console.log(
        `📧 Processing ${results.length} results from campaign ${campaignId} for lead capture`
      );

      const leads = await this.leadService.captureLeadsFromCrawler(campaignId, results);

      console.log(`✅ Captured ${leads.length} leads from campaign ${campaignId}`);

      // Emit event for real-time updates
      if (this.io) {
        this.io.emit('campaign:leads_captured', {
          campaignId,
          leadsCount: leads.length,
          leads: leads.slice(0, 10), // Send first 10 for preview
        });
      }

      return leads;
    } catch (error) {
      console.error('Error processing campaign results for leads:', error);
      return [];
    }
  }

  /**
   * Process crawler results and extract leads
   * @param {string} campaignId - Campaign ID
   * @param {Array} results - Crawler results
   * @returns {Promise<Array>} Captured leads
   */
  async processCrawlerResults(campaignId, results) {
    return this.processCampaignResults(campaignId, results);
  }

  /**
   * Manually trigger lead capture for a campaign
   * @param {string} campaignId - Campaign ID
   * @param {Array} results - Results to process
   * @returns {Promise<Object>} Capture results
   */
  async captureCampaignLeads(campaignId, results) {
    try {
      const leads = await this.processCampaignResults(campaignId, results);

      return {
        success: true,
        campaignId,
        resultsProcessed: results.length,
        leadsCaptured: leads.length,
        leads,
      };
    } catch (error) {
      console.error('Error capturing campaign leads:', error);
      throw error;
    }
  }

  /**
   * Get leads for a specific campaign
   * @param {string} campaignId - Campaign ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Leads data
   */
  async getCampaignLeads(campaignId, options = {}) {
    return this.leadService.getLeads({
      ...options,
      sourceType: 'crawler_campaign',
      sourceId: campaignId,
    });
  }

  /**
   * Get campaign lead statistics
   * @param {string} campaignId - Campaign ID
   * @returns {Promise<Object>} Campaign lead stats
   */
  async getCampaignLeadStats(campaignId) {
    try {
      const result = await this.db.query(
        `SELECT 
          COUNT(*) as total_leads,
          COUNT(CASE WHEN status = 'new' THEN 1 END) as new_leads,
          COUNT(CASE WHEN status = 'qualified' THEN 1 END) as qualified_leads,
          COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_leads,
          AVG(score) as avg_score,
          COUNT(CASE WHEN quality = 'high' THEN 1 END) as high_quality_leads
         FROM leads
         WHERE source_type = 'crawler_campaign' AND source_id = $1`,
        [campaignId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error getting campaign lead stats:', error);
      throw error;
    }
  }

  /**
   * Enable/disable lead capture for a campaign
   * @param {string} campaignId - Campaign ID
   * @param {boolean} enabled - Whether to enable lead capture
   * @returns {Promise<void>}
   */
  async setCampaignLeadCapture(campaignId, enabled) {
    try {
      await this.db.query(
        `UPDATE lead_sources 
         SET is_active = $1, updated_at = CURRENT_TIMESTAMP
         WHERE source_name = $2`,
        [enabled, campaignId]
      );

      console.log(
        `Lead capture ${enabled ? 'enabled' : 'disabled'} for campaign ${campaignId}`
      );
    } catch (error) {
      console.error('Error updating campaign lead capture setting:', error);
      throw error;
    }
  }

  /**
   * Get all campaign lead sources with performance
   * @returns {Promise<Array>} Campaign lead sources
   */
  async getAllCampaignLeadSources() {
    try {
      const result = await this.db.query(
        `SELECT 
          ls.*,
          lsp.total_leads,
          lsp.converted,
          lsp.conversion_rate,
          lsp.avg_lead_score,
          lsp.high_quality_count,
          lsp.last_lead_captured
         FROM lead_sources ls
         LEFT JOIN lead_source_performance lsp 
           ON ls.source_name = lsp.source_id AND lsp.source_type = 'crawler_campaign'
         WHERE ls.source_type = 'crawler_campaign'
         ORDER BY lsp.total_leads DESC NULLS LAST`
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting campaign lead sources:', error);
      throw error;
    }
  }
}

// Create singleton instance
let integrationInstance = null;

/**
 * Initialize the campaign-lead integration
 * @param {Object} db - Database pool
 * @param {Object} io - Socket.io instance
 * @returns {CampaignLeadIntegration} Integration instance
 */
export function initializeCampaignLeadIntegration(db, io = null) {
  if (!integrationInstance) {
    integrationInstance = new CampaignLeadIntegration(db, io);
  }
  return integrationInstance;
}

/**
 * Get the campaign-lead integration instance
 * @returns {CampaignLeadIntegration|null} Integration instance or null
 */
export function getCampaignLeadIntegration() {
  return integrationInstance;
}

export default CampaignLeadIntegration;
