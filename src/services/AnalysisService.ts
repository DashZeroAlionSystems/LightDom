/**
 * AnalysisService
 * 
 * Performs competitive analysis and schema comparison
 * Uses in-memory graph analysis (can be extended with graphology or Neo4j)
 * 
 * @module AnalysisService
 */

import { getDatabaseService } from './DatabaseService.js';

export interface SchemaNode {
  id: string;
  type: string;
  properties: Record<string, any>;
  source: string; // 'competitor' or 'our'
}

export interface SchemaCoverageResult {
  missingInOurs: SchemaNode[];
  missingInCompetitor: SchemaNode[];
  common: SchemaNode[];
  coverageScore: number; // 0-100
}

export interface CompetitorAnalysisReport {
  reportId: string;
  competitorName: string;
  ourDataSource: string;
  analysisType: string;
  results: SchemaCoverageResult;
  recommendations: string[];
  metadata: Record<string, any>;
  createdAt: string;
}

export class AnalysisService {
  private dbService: ReturnType<typeof getDatabaseService>;

  constructor() {
    this.dbService = getDatabaseService();
  }

  /**
   * Compare schema coverage between our data and competitor data
   * Implements COMPARE_SCHEMA_COVERAGE directive
   */
  async compareSchemaGoverage(
    ourData: SchemaNode[],
    competitorData: SchemaNode[],
    competitorName: string
  ): Promise<CompetitorAnalysisReport> {
    console.log(`🔍 Analyzing schema coverage against ${competitorName}...`);

    // Build maps for efficient lookup
    const ourMap = new Map<string, SchemaNode>();
    const competitorMap = new Map<string, SchemaNode>();

    ourData.forEach((node) => ourMap.set(node.id, node));
    competitorData.forEach((node) => competitorMap.set(node.id, node));

    // Find differences
    const missingInOurs: SchemaNode[] = [];
    const missingInCompetitor: SchemaNode[] = [];
    const common: SchemaNode[] = [];

    // Check what's in competitor but not in ours
    for (const [id, node] of competitorMap.entries()) {
      if (!ourMap.has(id)) {
        missingInOurs.push(node);
      } else {
        common.push(node);
      }
    }

    // Check what's in ours but not in competitor
    for (const [id, node] of ourMap.entries()) {
      if (!competitorMap.has(id)) {
        missingInCompetitor.push(node);
      }
    }

    // Calculate coverage score
    const totalUnique = ourMap.size + competitorMap.size - common.length;
    const coverageScore = totalUnique > 0 ? Math.round((common.length / totalUnique) * 100) : 0;

    // Generate recommendations
    const recommendations = this.generateRecommendations(missingInOurs, missingInCompetitor);

    // Build analysis report
    const report: CompetitorAnalysisReport = {
      reportId: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      competitorName,
      ourDataSource: 'LightDom Platform',
      analysisType: 'COMPARE_SCHEMA_COVERAGE',
      results: {
        missingInOurs,
        missingInCompetitor,
        common,
        coverageScore,
      },
      recommendations,
      metadata: {
        analyzedAt: new Date().toISOString(),
        totalOurNodes: ourData.length,
        totalCompetitorNodes: competitorData.length,
        commonNodes: common.length,
      },
      createdAt: new Date().toISOString(),
    };

    console.log(`✅ Analysis complete. Coverage score: ${coverageScore}%`);

    // Save to database
    await this.saveReport(report);

    return report;
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(
    missingInOurs: SchemaNode[],
    missingInCompetitor: SchemaNode[]
  ): string[] {
    const recommendations: string[] = [];

    if (missingInOurs.length > 0) {
      recommendations.push(
        `Consider implementing ${missingInOurs.length} features found in competitor but missing in our platform`
      );

      // Group by type
      const byType = new Map<string, number>();
      missingInOurs.forEach((node) => {
        byType.set(node.type, (byType.get(node.type) || 0) + 1);
      });

      for (const [type, count] of byType.entries()) {
        recommendations.push(`  - Add ${count} ${type} features`);
      }
    }

    if (missingInCompetitor.length > 0) {
      recommendations.push(
        `We have ${missingInCompetitor.length} unique features not found in competitor - potential competitive advantages`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Complete feature parity with competitor');
    }

    return recommendations;
  }

  /**
   * Save analysis report to database
   */
  async saveReport(report: CompetitorAnalysisReport): Promise<void> {
    await this.dbService.query(
      `INSERT INTO content_entities (type, title, description, content, metadata, tags)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'ld:CompetitorAnalysisReport',
        `Analysis: ${report.competitorName}`,
        `Schema coverage analysis comparing LightDom with ${report.competitorName}`,
        JSON.stringify(report),
        JSON.stringify(report.metadata),
        ['analysis', 'competitor', report.competitorName.toLowerCase()],
      ]
    );
  }

  /**
   * Get all analysis reports
   */
  async getAllReports(): Promise<CompetitorAnalysisReport[]> {
    const result = await this.dbService.query<any>(
      `SELECT content FROM content_entities 
       WHERE type = 'ld:CompetitorAnalysisReport' 
       ORDER BY created_at DESC`
    );

    return result.rows.map((row) => row.content as CompetitorAnalysisReport);
  }

  /**
   * Get a specific report by ID
   */
  async getReport(reportId: string): Promise<CompetitorAnalysisReport | null> {
    const result = await this.dbService.query<any>(
      `SELECT content FROM content_entities 
       WHERE type = 'ld:CompetitorAnalysisReport' 
       AND content->>'reportId' = $1`,
      [reportId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].content as CompetitorAnalysisReport;
  }

  /**
   * Parse crawled data into graph nodes
   * Helper function to convert crawled website data into SchemaNode format
   */
  parseCrawledData(
    crawledData: any[],
    source: 'competitor' | 'our'
  ): SchemaNode[] {
    return crawledData.map((item, index) => ({
      id: item.id || `node-${index}`,
      type: item.type || 'unknown',
      properties: item.properties || item,
      source,
    }));
  }

  /**
   * Run a sample competitor analysis
   */
  async runSampleAnalysis(): Promise<CompetitorAnalysisReport> {
    // Sample data representing our platform features
    const ourData: SchemaNode[] = [
      { id: 'feature-validation', type: 'validation', properties: { name: 'Schema Validation' }, source: 'our' },
      { id: 'feature-db', type: 'database', properties: { name: 'PostgreSQL Integration' }, source: 'our' },
      { id: 'feature-wiki', type: 'wiki', properties: { name: 'Research Topics' }, source: 'our' },
      { id: 'feature-components', type: 'components', properties: { name: 'Component Library' }, source: 'our' },
    ];

    // Sample competitor data
    const competitorData: SchemaNode[] = [
      { id: 'feature-validation', type: 'validation', properties: { name: 'Schema Validation' }, source: 'competitor' },
      { id: 'feature-db', type: 'database', properties: { name: 'MySQL Integration' }, source: 'competitor' },
      { id: 'feature-auth', type: 'auth', properties: { name: 'Authentication' }, source: 'competitor' },
      { id: 'feature-analytics', type: 'analytics', properties: { name: 'Analytics Dashboard' }, source: 'competitor' },
    ];

    return this.compareSchemaGoverage(ourData, competitorData, 'Example Competitor');
  }
}

// Singleton instance
export const analysisService = new AnalysisService();

export default AnalysisService;
