/**
 * Daily Lead Export Service
 * 
 * Automatically exports qualified medical insurance leads to CSV/Excel
 * Runs daily at 6 AM (configurable)
 * Supports multiple campaigns and custom filters
 */

const fs = require('fs').promises;
const path = require('path');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const { Pool } = require('pg');

class DailyLeadExportService {
  constructor(config = {}) {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres@localhost/dom_space_harvester'
    });
    
    this.exportDir = config.exportDir || path.join(__dirname, '../exports/leads');
    this.defaultFormat = config.defaultFormat || 'csv';
    this.timezone = config.timezone || 'Africa/Johannesburg';
  }

  /**
   * Export leads for a specific campaign and date
   */
  async exportLeads(options = {}) {
    const {
      campaignId = 'sa-medical-insurance-leads-24-7',
      format = this.defaultFormat,
      dateFrom = null,
      dateTo = null,
      minScore = 60,
      status = 'qualified',
      templateId = null
    } = options;

    try {
      console.log(`Starting lead export for campaign: ${campaignId}`);
      
      // Create export record
      const exportRecord = await this.createExportRecord(campaignId, format, options);
      
      // Fetch leads from database
      const leads = await this.fetchLeads({
        campaignId,
        dateFrom,
        dateTo,
        minScore,
        status
      });

      console.log(`Found ${leads.length} leads to export`);

      // Apply template if specified
      const columns = templateId ? await this.getTemplateColumns(templateId) : this.getDefaultColumns();
      
      // Generate export file
      const filePath = await this.generateExportFile(leads, format, exportRecord.id, columns);
      
      // Update export record
      await this.updateExportRecord(exportRecord.id, {
        lead_count: leads.length,
        qualified_count: leads.filter(l => l.qualification_status === 'qualified').length,
        average_score: this.calculateAverageScore(leads),
        file_path: filePath,
        file_size_mb: await this.getFileSize(filePath),
        status: 'completed',
        completed_at: new Date()
      });

      // Log activity for each lead
      await this.logLeadActivities(leads.map(l => l.id), 'exported', exportRecord.id);

      console.log(`Export completed successfully: ${filePath}`);
      
      return {
        success: true,
        exportId: exportRecord.id,
        filePath,
        leadCount: leads.length
      };
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  /**
   * Fetch leads from database with filters
   */
  async fetchLeads(filters) {
    const query = `
      SELECT 
        id,
        campaign_id,
        company_name,
        contact_email,
        contact_phone,
        address,
        city,
        province,
        country,
        website_url,
        description,
        services_offered,
        coverage_types,
        pricing_info,
        lead_score,
        qualification_status,
        data_completeness,
        discovered_at,
        last_updated
      FROM medical_leads
      WHERE campaign_id = $1
        AND ($2::date IS NULL OR DATE(discovered_at) >= $2)
        AND ($3::date IS NULL OR DATE(discovered_at) <= $3)
        AND lead_score >= $4
        AND qualification_status = $5
      ORDER BY lead_score DESC, discovered_at DESC
    `;

    const result = await this.pool.query(query, [
      filters.campaignId,
      filters.dateFrom,
      filters.dateTo,
      filters.minScore,
      filters.status
    ]);

    return result.rows;
  }

  /**
   * Generate CSV export file
   */
  async generateCSV(leads, columns, exportId) {
    const fields = columns.map(col => ({
      label: col.label,
      value: col.field
    }));

    const parser = new Parser({ fields });
    const csv = parser.parse(leads);

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `medical_leads_export_${exportId}_${timestamp}.csv`;
    const filePath = path.join(this.exportDir, filename);

    await fs.mkdir(this.exportDir, { recursive: true });
    await fs.writeFile(filePath, csv, 'utf8');

    return filePath;
  }

  /**
   * Generate Excel export file
   */
  async generateExcel(leads, columns, exportId) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Medical Insurance Leads');

    // Set up columns
    worksheet.columns = columns.map(col => ({
      header: col.label,
      key: col.field,
      width: col.width || 20
    }));

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Add data rows
    leads.forEach(lead => {
      worksheet.addRow(lead);
    });

    // Add conditional formatting for lead score
    worksheet.getColumn('lead_score').eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        const score = cell.value;
        if (score >= 80) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF92D050' }
          };
        } else if (score >= 60) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFC000' }
          };
        }
      }
    });

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `medical_leads_export_${exportId}_${timestamp}.xlsx`;
    const filePath = path.join(this.exportDir, filename);

    await fs.mkdir(this.exportDir, { recursive: true });
    await workbook.xlsx.writeFile(filePath);

    return filePath;
  }

  /**
   * Generate export file (CSV or Excel)
   */
  async generateExportFile(leads, format, exportId, columns) {
    if (format === 'excel' || format === 'xlsx') {
      return await this.generateExcel(leads, columns, exportId);
    } else {
      return await this.generateCSV(leads, columns, exportId);
    }
  }

  /**
   * Create export record in database
   */
  async createExportRecord(campaignId, format, options) {
    const query = `
      INSERT INTO lead_exports (
        campaign_id,
        format,
        export_type,
        filters_applied,
        status
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at
    `;

    const result = await this.pool.query(query, [
      campaignId,
      format,
      options.exportType || 'scheduled',
      JSON.stringify(options),
      'processing'
    ]);

    return result.rows[0];
  }

  /**
   * Update export record with results
   */
  async updateExportRecord(exportId, updates) {
    const query = `
      UPDATE lead_exports
      SET 
        lead_count = $2,
        qualified_count = $3,
        average_score = $4,
        file_path = $5,
        file_size_mb = $6,
        status = $7,
        completed_at = $8
      WHERE id = $1
    `;

    await this.pool.query(query, [
      exportId,
      updates.lead_count,
      updates.qualified_count,
      updates.average_score,
      updates.file_path,
      updates.file_size_mb,
      updates.status,
      updates.completed_at
    ]);
  }

  /**
   * Log activities for exported leads
   */
  async logLeadActivities(leadIds, activityType, exportId) {
    if (leadIds.length === 0) return;

    const values = leadIds.map(id => `(${id}, '${activityType}', 'Export ID: ${exportId}', 'system', 'automated')`).join(',');
    
    const query = `
      INSERT INTO lead_activity_log (lead_id, activity_type, activity_description, performed_by, performed_via)
      VALUES ${values}
    `;

    await this.pool.query(query);
  }

  /**
   * Get default export columns
   */
  getDefaultColumns() {
    return [
      { field: 'id', label: 'Lead ID', width: 10 },
      { field: 'company_name', label: 'Company Name', width: 30 },
      { field: 'contact_email', label: 'Email', width: 30 },
      { field: 'contact_phone', label: 'Phone', width: 15 },
      { field: 'address', label: 'Address', width: 40 },
      { field: 'city', label: 'City', width: 20 },
      { field: 'province', label: 'Province', width: 20 },
      { field: 'website_url', label: 'Website', width: 35 },
      { field: 'lead_score', label: 'Lead Score', width: 12 },
      { field: 'qualification_status', label: 'Status', width: 15 },
      { field: 'data_completeness', label: 'Data Completeness %', width: 18 },
      { field: 'discovered_at', label: 'Discovered Date', width: 20 }
    ];
  }

  /**
   * Get template columns from database
   */
  async getTemplateColumns(templateId) {
    const query = 'SELECT columns FROM export_templates WHERE id = $1';
    const result = await this.pool.query(query, [templateId]);
    
    if (result.rows.length === 0) {
      return this.getDefaultColumns();
    }

    return result.rows[0].columns;
  }

  /**
   * Calculate average lead score
   */
  calculateAverageScore(leads) {
    if (leads.length === 0) return 0;
    const sum = leads.reduce((acc, lead) => acc + (lead.lead_score || 0), 0);
    return (sum / leads.length).toFixed(2);
  }

  /**
   * Get file size in MB
   */
  async getFileSize(filePath) {
    const stats = await fs.stat(filePath);
    return (stats.size / (1024 * 1024)).toFixed(2);
  }

  /**
   * Run daily export for all active campaigns
   */
  async runDailyExport() {
    console.log('Starting daily lead export...');
    
    try {
      // Get all active campaigns
      const campaigns = await this.getActiveCampaigns();
      
      for (const campaign of campaigns) {
        await this.exportLeads({
          campaignId: campaign.id,
          format: 'csv',
          exportType: 'scheduled',
          dateFrom: this.getYesterday(),
          dateTo: this.getToday(),
          minScore: 60,
          status: 'qualified'
        });
      }

      console.log('Daily export completed successfully');
    } catch (error) {
      console.error('Daily export failed:', error);
      throw error;
    }
  }

  /**
   * Get active campaigns
   */
  async getActiveCampaigns() {
    const query = `
      SELECT id, name
      FROM crawler_campaigns
      WHERE status = 'active'
        AND configuration->>'target_region' = 'South Africa'
    `;

    const result = await this.pool.query(query);
    return result.rows;
  }

  /**
   * Helper methods for dates
   */
  getToday() {
    return new Date().toISOString().split('T')[0];
  }

  getYesterday() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

  /**
   * Close database connection
   */
  async close() {
    await this.pool.end();
  }
}

module.exports = DailyLeadExportService;

// CLI usage
if (require.main === module) {
  const service = new DailyLeadExportService();
  
  service.runDailyExport()
    .then(() => {
      console.log('Export completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Export failed:', error);
      process.exit(1);
    });
}
