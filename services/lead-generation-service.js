/**
 * Lead Generation Service
 * Handles capturing, enriching, scoring, and managing leads from various sources
 * Integrates with crawler campaigns, SEO campaigns, and other data sources
 */

import { EventEmitter } from 'events';

export class LeadGenerationService extends EventEmitter {
  constructor(db, io = null) {
    super();
    this.db = db;
    this.io = io; // Socket.io for real-time updates
  }

  /**
   * Capture a new lead from any source
   * @param {Object} leadData - Lead information
   * @returns {Promise<Object>} Created lead
   */
  async captureLead(leadData) {
    const {
      email,
      name,
      company,
      phone,
      website,
      jobTitle,
      sourceType,
      sourceId,
      sourceUrl,
      sourceMetadata = {},
      address,
      city,
      state,
      country,
      zipCode,
      customFields = {},
    } = leadData;

    try {
      // Check if lead already exists
      const existing = await this.db.query('SELECT * FROM leads WHERE email = $1', [email]);

      let lead;
      if (existing.rows.length > 0) {
        // Update existing lead
        lead = await this.updateLead(existing.rows[0].id, {
          name: name || existing.rows[0].name,
          company: company || existing.rows[0].company,
          phone: phone || existing.rows[0].phone,
          website: website || existing.rows[0].website,
          job_title: jobTitle || existing.rows[0].job_title,
          source_metadata: { ...existing.rows[0].source_metadata, ...sourceMetadata },
          custom_fields: { ...existing.rows[0].custom_fields, ...customFields },
        });

        // Log activity
        await this.logActivity(lead.id, 'lead_updated', 'Lead information updated from new source', {
          source: sourceType,
          previousSource: existing.rows[0].source_type,
        });
      } else {
        // Calculate initial lead score
        const initialScore = this.calculateLeadScore({
          email,
          name,
          company,
          phone,
          website,
          jobTitle,
        });

        // Determine initial quality
        const quality = this.determineQuality(initialScore);

        // Insert new lead
        const result = await this.db.query(
          `INSERT INTO leads (
            email, name, company, phone, website, job_title,
            source_type, source_id, source_url, source_metadata,
            address, city, state, country, zip_code,
            score, quality, custom_fields
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          RETURNING *`,
          [
            email,
            name,
            company,
            phone,
            website,
            jobTitle,
            sourceType,
            sourceId,
            sourceUrl,
            JSON.stringify(sourceMetadata),
            address,
            city,
            state,
            country,
            zipCode,
            initialScore,
            quality,
            JSON.stringify(customFields),
          ]
        );

        lead = result.rows[0];

        // Log capture activity
        await this.logActivity(lead.id, 'lead_captured', 'New lead captured', {
          source: sourceType,
          sourceId,
        });

        // Update source stats
        await this.updateSourceStats(sourceType, sourceId);
      }

      // Emit real-time event
      if (this.io) {
        this.io.emit('lead:captured', lead);
      }

      this.emit('leadCaptured', lead);

      return lead;
    } catch (error) {
      console.error('Error capturing lead:', error);
      throw error;
    }
  }

  /**
   * Calculate lead score based on available information
   * @param {Object} leadInfo - Lead information
   * @returns {number} Score from 0-100
   */
  calculateLeadScore(leadInfo) {
    let score = 0;

    // Email present (required) - 10 points
    if (leadInfo.email) score += 10;

    // Name present - 15 points
    if (leadInfo.name && leadInfo.name.trim()) score += 15;

    // Company present - 20 points
    if (leadInfo.company && leadInfo.company.trim()) score += 20;

    // Phone present - 15 points
    if (leadInfo.phone && leadInfo.phone.trim()) score += 15;

    // Website present - 15 points
    if (leadInfo.website && leadInfo.website.trim()) score += 15;

    // Job title present - 15 points
    if (leadInfo.jobTitle && leadInfo.jobTitle.trim()) score += 15;

    // Bonus for professional email domain - 10 points
    if (leadInfo.email && !leadInfo.email.match(/@(gmail|yahoo|hotmail|outlook|aol)\./i)) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  /**
   * Determine lead quality based on score
   * @param {number} score - Lead score
   * @returns {string} Quality level
   */
  determineQuality(score) {
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  /**
   * Update an existing lead
   * @param {number} leadId - Lead ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated lead
   */
  async updateLead(leadId, updates) {
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(typeof value === 'object' ? JSON.stringify(value) : value);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(leadId);

    const query = `
      UPDATE leads 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.db.query(query, values);

    if (this.io) {
      this.io.emit('lead:updated', result.rows[0]);
    }

    return result.rows[0];
  }

  /**
   * Log an activity for a lead
   * @param {number} leadId - Lead ID
   * @param {string} activityType - Type of activity
   * @param {string} description - Activity description
   * @param {Object} activityData - Additional data
   * @returns {Promise<Object>} Created activity
   */
  async logActivity(leadId, activityType, description, activityData = {}) {
    const result = await this.db.query(
      `INSERT INTO lead_activities (lead_id, activity_type, activity_description, activity_data)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [leadId, activityType, description, JSON.stringify(activityData)]
    );

    return result.rows[0];
  }

  /**
   * Get all leads with filtering and pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Leads and pagination info
   */
  async getLeads(options = {}) {
    const {
      status,
      quality,
      sourceType,
      sourceId,
      assignedTo,
      minScore,
      search,
      page = 1,
      limit = 50,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = options;

    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (status) {
      conditions.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (quality) {
      conditions.push(`quality = $${paramCount}`);
      values.push(quality);
      paramCount++;
    }

    if (sourceType) {
      conditions.push(`source_type = $${paramCount}`);
      values.push(sourceType);
      paramCount++;
    }

    if (sourceId) {
      conditions.push(`source_id = $${paramCount}`);
      values.push(sourceId);
      paramCount++;
    }

    if (assignedTo) {
      conditions.push(`assigned_to = $${paramCount}`);
      values.push(assignedTo);
      paramCount++;
    }

    if (minScore) {
      conditions.push(`score >= $${paramCount}`);
      values.push(minScore);
      paramCount++;
    }

    if (search) {
      conditions.push(`(email ILIKE $${paramCount} OR name ILIKE $${paramCount} OR company ILIKE $${paramCount})`);
      values.push(`%${search}%`);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await this.db.query(`SELECT COUNT(*) FROM leads ${whereClause}`, values);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const offset = (page - 1) * limit;
    values.push(limit, offset);

    const query = `
      SELECT * FROM leads
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const result = await this.db.query(query, values);

    return {
      leads: result.rows,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single lead by ID
   * @param {number} leadId - Lead ID
   * @returns {Promise<Object>} Lead with activities
   */
  async getLead(leadId) {
    const leadResult = await this.db.query('SELECT * FROM leads WHERE id = $1', [leadId]);

    if (leadResult.rows.length === 0) {
      throw new Error('Lead not found');
    }

    const lead = leadResult.rows[0];

    // Get activities
    const activitiesResult = await this.db.query(
      'SELECT * FROM lead_activities WHERE lead_id = $1 ORDER BY created_at DESC LIMIT 50',
      [leadId]
    );

    // Get tags
    const tagsResult = await this.db.query('SELECT tag FROM lead_tags WHERE lead_id = $1', [leadId]);

    return {
      ...lead,
      activities: activitiesResult.rows,
      tags: tagsResult.rows.map(r => r.tag),
    };
  }

  /**
   * Update lead status
   * @param {number} leadId - Lead ID
   * @param {string} newStatus - New status
   * @returns {Promise<Object>} Updated lead
   */
  async updateStatus(leadId, newStatus) {
    const result = await this.db.query('UPDATE leads SET status = $1 WHERE id = $2 RETURNING *', [
      newStatus,
      leadId,
    ]);

    await this.logActivity(leadId, 'status_changed', `Status changed to ${newStatus}`, {
      newStatus,
    });

    if (newStatus === 'converted') {
      await this.db.query('UPDATE leads SET conversion_date = CURRENT_TIMESTAMP WHERE id = $1', [
        leadId,
      ]);
    }

    if (this.io) {
      this.io.emit('lead:status_changed', result.rows[0]);
    }

    return result.rows[0];
  }

  /**
   * Assign lead to a user
   * @param {number} leadId - Lead ID
   * @param {string} userId - User ID or email
   * @returns {Promise<Object>} Updated lead
   */
  async assignLead(leadId, userId) {
    const result = await this.db.query(
      'UPDATE leads SET assigned_to = $1, assigned_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [userId, leadId]
    );

    await this.logActivity(leadId, 'assigned', `Lead assigned to ${userId}`, {
      assignedTo: userId,
    });

    if (this.io) {
      this.io.emit('lead:assigned', result.rows[0]);
    }

    return result.rows[0];
  }

  /**
   * Add tags to a lead
   * @param {number} leadId - Lead ID
   * @param {string[]} tags - Tags to add
   * @returns {Promise<void>}
   */
  async addTags(leadId, tags) {
    for (const tag of tags) {
      await this.db.query(
        'INSERT INTO lead_tags (lead_id, tag) VALUES ($1, $2) ON CONFLICT (lead_id, tag) DO NOTHING',
        [leadId, tag]
      );
    }

    await this.logActivity(leadId, 'tags_added', `Tags added: ${tags.join(', ')}`, { tags });
  }

  /**
   * Get lead statistics
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics() {
    const result = await this.db.query('SELECT * FROM lead_statistics');
    return result.rows[0];
  }

  /**
   * Get source performance metrics
   * @returns {Promise<Array>} Source performance data
   */
  async getSourcePerformance() {
    const result = await this.db.query('SELECT * FROM lead_source_performance ORDER BY total_leads DESC');
    return result.rows;
  }

  /**
   * Update source statistics
   * @param {string} sourceType - Source type
   * @param {string} sourceId - Source ID
   * @private
   */
  async updateSourceStats(sourceType, sourceId) {
    await this.db.query(
      `INSERT INTO lead_sources (source_name, source_type)
       VALUES ($1, $2)
       ON CONFLICT (source_name) DO NOTHING`,
      [`${sourceType}:${sourceId}`, sourceType]
    );

    // Update stats from lead_source_performance view
    const stats = await this.db.query(
      'SELECT * FROM lead_source_performance WHERE source_type = $1 AND source_id = $2',
      [sourceType, sourceId]
    );

    if (stats.rows.length > 0) {
      const stat = stats.rows[0];
      await this.db.query(
        `UPDATE lead_sources 
         SET total_leads = $1, conversion_rate = $2, updated_at = CURRENT_TIMESTAMP
         WHERE source_name = $3`,
        [stat.total_leads, stat.conversion_rate, `${sourceType}:${sourceId}`]
      );
    }
  }

  /**
   * Capture leads from crawler campaign results
   * @param {string} campaignId - Campaign ID
   * @param {Array} crawlerResults - Results from crawler
   * @returns {Promise<Array>} Captured leads
   */
  async captureLeadsFromCrawler(campaignId, crawlerResults) {
    const leads = [];

    for (const result of crawlerResults) {
      // Extract potential lead information from crawler data
      const leadInfo = this.extractLeadInfoFromCrawlerResult(result);

      if (leadInfo && leadInfo.email) {
        try {
          const lead = await this.captureLead({
            ...leadInfo,
            sourceType: 'crawler_campaign',
            sourceId: campaignId,
            sourceUrl: result.url,
            sourceMetadata: {
              crawlTimestamp: result.timestamp,
              pageTitle: result.title,
              domScore: result.domScore,
            },
          });
          leads.push(lead);
        } catch (error) {
          console.error('Error capturing lead from crawler result:', error);
        }
      }
    }

    return leads;
  }

  /**
   * Extract lead information from crawler result
   * @param {Object} crawlerResult - Crawler result data
   * @returns {Object|null} Lead information or null
   * @private
   */
  extractLeadInfoFromCrawlerResult(crawlerResult) {
    // Look for email patterns in the page content
    const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const emails = crawlerResult.content?.match(emailPattern) || [];

    if (emails.length === 0) return null;

    // Use first found email
    const email = emails[0];

    // Try to extract other information
    const leadInfo = {
      email,
      name: this.extractNameFromContent(crawlerResult.content),
      company: this.extractCompanyFromContent(crawlerResult.content, crawlerResult.url),
      website: crawlerResult.url,
    };

    return leadInfo;
  }

  /**
   * Extract name from content
   * @param {string} content - Page content
   * @returns {string|null} Extracted name
   * @private
   */
  extractNameFromContent(content) {
    // Simple name extraction - look for common patterns
    // This is a basic implementation, can be enhanced with ML
    const namePatterns = [
      /name[:\s]+([A-Z][a-z]+\s[A-Z][a-z]+)/i,
      /contact[:\s]+([A-Z][a-z]+\s[A-Z][a-z]+)/i,
      /author[:\s]+([A-Z][a-z]+\s[A-Z][a-z]+)/i,
    ];

    for (const pattern of namePatterns) {
      const match = content?.match(pattern);
      if (match && match[1]) return match[1];
    }

    return null;
  }

  /**
   * Extract company name from content or URL
   * @param {string} content - Page content
   * @param {string} url - Page URL
   * @returns {string|null} Extracted company name
   * @private
   */
  extractCompanyFromContent(content, url) {
    // Try to extract from URL first
    try {
      const hostname = new URL(url).hostname;
      const domain = hostname.replace(/^www\./, '').split('.')[0];
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch (error) {
      // Fall back to content extraction
      const companyPatterns = [
        /company[:\s]+([A-Z][a-zA-Z\s]+)/i,
        /organization[:\s]+([A-Z][a-zA-Z\s]+)/i,
      ];

      for (const pattern of companyPatterns) {
        const match = content?.match(pattern);
        if (match && match[1]) return match[1].trim();
      }
    }

    return null;
  }

  /**
   * Bulk import leads from CSV data
   * @param {Array} csvData - Array of lead objects
   * @param {string} sourceType - Source type
   * @param {string} sourceId - Source ID
   * @returns {Promise<Object>} Import results
   */
  async bulkImport(csvData, sourceType = 'bulk_import', sourceId = 'csv') {
    const results = {
      total: csvData.length,
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const row of csvData) {
      try {
        await this.captureLead({
          ...row,
          sourceType,
          sourceId,
        });
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          email: row.email,
          error: error.message,
        });
      }
    }

    return results;
  }
}

export default LeadGenerationService;
