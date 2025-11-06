#!/usr/bin/env node

/**
 * Memory Database Manager
 * SQLite database management for persistent memory storage
 */

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MemoryDatabaseManager {
    constructor(dbPath = null) {
        this.dbPath = dbPath || path.join(__dirname, 'memory-workflow.db');
        this.db = null;
        this.initialized = false;
    }

    async initialize() {
        try {
            console.log('🗄️  Initializing Memory Database...');

            // Open database connection
            this.db = await open({
                filename: this.dbPath,
                driver: sqlite3.Database
            });

            // Enable foreign keys
            await this.db.exec('PRAGMA foreign_keys = ON;');

            // Initialize schema
            await this.initializeSchema();

            // Initialize default data
            await this.initializeDefaultData();

            this.initialized = true;
            console.log('✅ Memory Database initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize database:', error);
            throw error;
        }
    }

    async initializeSchema() {
        console.log('📋 Creating database schema...');

        // Read schema file
        const schemaPath = path.join(__dirname, 'memory-database-schema.sql');
        const schemaSQL = await fs.readFile(schemaPath, 'utf8');

        // Execute schema
        await this.db.exec(schemaSQL);

        // Read views file
        const viewsPath = path.join(__dirname, 'memory-database-views.sql');
        const viewsSQL = await fs.readFile(viewsPath, 'utf8');

        // Execute views
        await this.db.exec(viewsSQL);

        console.log('✅ Database schema and views created');
    }

    async initializeDefaultData() {
        console.log('📚 Initializing default research domains...');

        const defaultDomains = [
            {
                domain_key: 'memory_systems',
                name: 'Memory Systems Research',
                category: 'cognitive_science',
                description: 'Research on human memory systems, cognitive processes, and learning optimization'
            },
            {
                domain_key: 'ai_optimization',
                name: 'AI Optimization Research',
                category: 'artificial_intelligence',
                description: 'Research on artificial intelligence optimization, machine learning techniques, and AI system performance'
            },
            {
                domain_key: 'workflow_orchestration',
                name: 'Workflow Orchestration Research',
                category: 'automation',
                description: 'Research on workflow automation, process optimization, and system orchestration'
            },
            {
                domain_key: 'performance_analytics',
                name: 'Performance Analytics Research',
                category: 'metrics',
                description: 'Research on system performance analysis, metrics collection, and optimization analytics'
            },
            {
                domain_key: 'development_methodology',
                name: 'Development Methodology Research',
                category: 'engineering',
                description: 'Research on software development methodologies, best practices, and engineering processes'
            }
        ];

        for (const domain of defaultDomains) {
            await this.db.run(`
                INSERT OR IGNORE INTO research_domains (domain_key, name, category, description)
                VALUES (?, ?, ?, ?)
            `, [domain.domain_key, domain.name, domain.category, domain.description]);
        }

        console.log('✅ Default research domains initialized');
    }

    // Research Domain Management
    async createResearchDomain(domainData) {
        const result = await this.db.run(`
            INSERT INTO research_domains (domain_key, name, category, description)
            VALUES (?, ?, ?, ?)
        `, [domainData.domain_key, domainData.name, domainData.category, domainData.description]);

        return result.lastID;
    }

    async getResearchDomain(domainKey) {
        return await this.db.get(`
            SELECT * FROM research_domains WHERE domain_key = ?
        `, [domainKey]);
    }

    async getAllResearchDomains() {
        return await this.db.all(`
            SELECT * FROM research_domains ORDER BY name
        `);
    }

    // Research Insights Management
    async storeResearchInsight(domainKey, insightData) {
        const domain = await this.getResearchDomain(domainKey);
        if (!domain) {
            throw new Error(`Research domain '${domainKey}' not found`);
        }

        const result = await this.db.run(`
            INSERT INTO research_insights (
                domain_id, insight_id, title, topic, content, category, confidence,
                success_rate, execution_time, cost_savings, tags, key_findings, source, version
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            domain.id,
            insightData.id || `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            insightData.title,
            insightData.topic || insightData.title,
            insightData.content,
            insightData.category || 'uncategorized',
            insightData.confidence || 0.8,
            insightData.success_rate || null,
            insightData.execution_time || null,
            insightData.cost_savings || null,
            JSON.stringify(insightData.tags || []),
            JSON.stringify(insightData.key_findings || []),
            insightData.source || 'cascade_ai',
            insightData.version || '1.0'
        ]);

        return result.lastID;
    }

    async getResearchInsight(insightId) {
        return await this.db.get(`
            SELECT ri.*, rd.name as domain_name, rd.category as domain_category
            FROM research_insights ri
            INNER JOIN research_domains rd ON ri.domain_id = rd.id
            WHERE ri.insight_id = ?
        `, [insightId]);
    }

    async getResearchInsightsByDomain(domainKey, limit = null, offset = 0) {
        const domain = await this.getResearchDomain(domainKey);
        if (!domain) {
            return [];
        }

        const sql = `
            SELECT ri.*, rd.name as domain_name, rd.category as domain_category
            FROM research_insights ri
            INNER JOIN research_domains rd ON ri.domain_id = rd.id
            WHERE ri.domain_id = ?
            ORDER BY ri.confidence DESC, ri.created_at DESC
            ${limit ? 'LIMIT ? OFFSET ?' : ''}
        `;

        const params = limit ? [domain.id, limit, offset] : [domain.id];
        return await this.db.all(sql, params);
    }

    async searchResearchInsights(query, filters = {}, limit = 10) {
        let whereConditions = [];
        let params = [];

        // Text search conditions
        if (query) {
            whereConditions.push(`(
                ri.title LIKE ? OR
                ri.topic LIKE ? OR
                ri.content LIKE ? OR
                ri.tags LIKE ?
            )`);
            const searchTerm = `%${query}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // Domain filter
        if (filters.domain) {
            whereConditions.push('rd.domain_key = ?');
            params.push(filters.domain);
        }

        // Category filter
        if (filters.category) {
            whereConditions.push('ri.category = ?');
            params.push(filters.category);
        }

        // Confidence threshold
        if (filters.minConfidence) {
            whereConditions.push('ri.confidence >= ?');
            params.push(filters.minConfidence);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const sql = `
            SELECT ri.*, rd.name as domain_name, rd.category as domain_category,
                   CASE
                       WHEN ri.title LIKE ? THEN 100
                       WHEN ri.topic LIKE ? THEN 80
                       WHEN ri.content LIKE ? THEN 60
                       WHEN ri.tags LIKE ? THEN 40
                       ELSE 20
                   END +
                   CASE
                       WHEN ri.confidence > 0.9 THEN 20
                       WHEN ri.confidence > 0.8 THEN 10
                       ELSE 0
                   END as relevance_score
            FROM research_insights ri
            INNER JOIN research_domains rd ON ri.domain_id = rd.id
            ${whereClause}
            ORDER BY relevance_score DESC, ri.confidence DESC, ri.created_at DESC
            LIMIT ?
        `;

        // Add relevance scoring parameters
        const relevanceParams = query ? [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`] : ['', '', '', ''];
        params = [...relevanceParams, ...params, limit];

        return await this.db.all(sql, params);
    }

    // Research Relationships Management
    async createResearchRelationship(relationshipData) {
        const result = await this.db.run(`
            INSERT INTO research_relationships (
                from_insight_id, to_insight_id, relationship_type, strength, description
            ) VALUES (?, ?, ?, ?, ?)
        `, [
            relationshipData.from,
            relationshipData.to,
            relationshipData.type,
            relationshipData.strength || 0.8,
            relationshipData.description || null
        ]);

        return result.lastID;
    }

    async getResearchRelationships(insightId = null) {
        let sql, params;

        if (insightId) {
            sql = `
                SELECT rr.*, ri1.title as from_title, ri2.title as to_title
                FROM research_relationships rr
                INNER JOIN research_insights ri1 ON rr.from_insight_id = ri1.insight_id
                INNER JOIN research_insights ri2 ON rr.to_insight_id = ri2.insight_id
                WHERE rr.from_insight_id = ? OR rr.to_insight_id = ?
                ORDER BY rr.strength DESC
            `;
            params = [insightId, insightId];
        } else {
            sql = `
                SELECT rr.*, ri1.title as from_title, ri2.title as to_title
                FROM research_relationships rr
                INNER JOIN research_insights ri1 ON rr.from_insight_id = ri1.insight_id
                INNER JOIN research_insights ri2 ON rr.to_insight_id = ri2.insight_id
                ORDER BY rr.strength DESC
            `;
            params = [];
        }

        return await this.db.all(sql, params);
    }

    // Workflow Execution Management
    async recordWorkflowExecution(executionData) {
        const result = await this.db.run(`
            INSERT INTO workflow_executions (
                execution_id, workflow_type, context, requirements, status,
                start_time, execution_time, success_rate, cost_savings,
                memory_optimizations
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            executionData.executionId || `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            executionData.workflowType,
            JSON.stringify(executionData.context || {}),
            JSON.stringify(executionData.requirements || {}),
            executionData.status || 'completed',
            executionData.startTime || new Date().toISOString(),
            executionData.executionTime || null,
            executionData.successRate || null,
            executionData.costSavings || null,
            JSON.stringify(executionData.optimizations || [])
        ]);

        return result.lastID;
    }

    async getWorkflowExecutions(workflowType = null, limit = 20) {
        let sql, params;

        if (workflowType) {
            sql = `
                SELECT * FROM workflow_executions
                WHERE workflow_type = ?
                ORDER BY start_time DESC
                LIMIT ?
            `;
            params = [workflowType, limit];
        } else {
            sql = `
                SELECT * FROM workflow_executions
                ORDER BY start_time DESC
                LIMIT ?
            `;
            params = [limit];
        }

        const executions = await this.db.all(sql, params);

        // Parse JSON fields
        return executions.map(exec => ({
            ...exec,
            context: JSON.parse(exec.context || '{}'),
            requirements: JSON.parse(exec.requirements || '{}'),
            memory_optimizations: JSON.parse(exec.memory_optimizations || '[]')
        }));
    }

    // Performance Metrics Management
    async recordPerformanceMetric(metricData) {
        const result = await this.db.run(`
            INSERT INTO performance_metrics (
                metric_type, metric_name, value, unit, context
            ) VALUES (?, ?, ?, ?, ?)
        `, [
            metricData.type,
            metricData.name,
            metricData.value,
            metricData.unit || null,
            JSON.stringify(metricData.context || {})
        ]);

        return result.lastID;
    }

    async getPerformanceMetrics(metricType = null, limit = 50) {
        let sql, params;

        if (metricType) {
            sql = `
                SELECT * FROM performance_metrics
                WHERE metric_type = ?
                ORDER BY timestamp DESC
                LIMIT ?
            `;
            params = [metricType, limit];
        } else {
            sql = `
                SELECT * FROM performance_metrics
                ORDER BY timestamp DESC
                LIMIT ?
            `;
            params = [limit];
        }

        const metrics = await this.db.all(sql, params);

        // Parse context JSON
        return metrics.map(metric => ({
            ...metric,
            context: JSON.parse(metric.context || '{}')
        }));
    }

    // Memory Query Logging
    async logMemoryQuery(queryData) {
        const result = await this.db.run(`
            INSERT INTO memory_queries (
                query_text, query_type, filters, results_count, execution_time, user_context
            ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
            queryData.query,
            queryData.type || 'search',
            JSON.stringify(queryData.filters || {}),
            queryData.resultsCount || 0,
            queryData.executionTime || null,
            JSON.stringify(queryData.userContext || {})
        ]);

        return result.lastID;
    }

    // CodeMap Views - Direct access to pre-computed views
    async getCodeMapMemoryData() {
        const result = await this.db.get('SELECT * FROM codemap_memory_data');
        return JSON.parse(result.memory_data);
    }

    async getCodeMapPerformanceMetrics() {
        const result = await this.db.get('SELECT * FROM codemap_performance_metrics');
        return JSON.parse(result.metrics_data);
    }

    async getCodeMapResearchSummary() {
        const result = await this.db.get('SELECT * FROM codemap_research_summary');
        return JSON.parse(result.summary_data);
    }

    async executeCodeMapMemoryQuery(query, filters = {}, limit = 10) {
        const startTime = Date.now();

        // Log the query
        await this.logMemoryQuery({
            query,
            type: 'search',
            filters: { ...filters, limit },
            userContext: { source: 'codemap' }
        });

        // Execute search
        const results = await this.searchResearchInsights(query, filters, limit);

        const executionTime = Date.now() - startTime;

        // Update query log with results
        await this.db.run(`
            UPDATE memory_queries
            SET results_count = ?, execution_time = ?
            WHERE id = (SELECT MAX(id) FROM memory_queries)
        `, [results.length, executionTime]);

        return {
            results: results.map(result => ({
                id: result.insight_id,
                title: result.title,
                name: result.title,
                topic: result.topic,
                content: result.content,
                confidence: result.confidence,
                tags: JSON.parse(result.tags || '[]'),
                category: result.category,
                relevanceScore: result.relevance_score
            })),
            query,
            totalFound: results.length,
            executionTime
        };
    }

    // Utility Methods
    async getDatabaseStats() {
        const stats = await this.db.all(`
            SELECT
                'research_domains' as table_name, COUNT(*) as count FROM research_domains
            UNION ALL
            SELECT 'research_insights', COUNT(*) FROM research_insights
            UNION ALL
            SELECT 'research_relationships', COUNT(*) FROM research_relationships
            UNION ALL
            SELECT 'workflow_executions', COUNT(*) FROM workflow_executions
            UNION ALL
            SELECT 'performance_metrics', COUNT(*) FROM performance_metrics
            UNION ALL
            SELECT 'memory_queries', COUNT(*) FROM memory_queries
        `);

        return stats.reduce((acc, stat) => {
            acc[stat.table_name] = stat.count;
            return acc;
        }, {});
    }

    async cleanupOldData(daysToKeep = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        // Clean up old workflow executions (keep last 1000)
        await this.db.run(`
            DELETE FROM workflow_executions
            WHERE id NOT IN (
                SELECT id FROM workflow_executions
                ORDER BY start_time DESC
                LIMIT 1000
            )
        `);

        // Clean up old performance metrics (keep last 10000)
        await this.db.run(`
            DELETE FROM performance_metrics
            WHERE id NOT IN (
                SELECT id FROM performance_metrics
                ORDER BY timestamp DESC
                LIMIT 10000
            )
        `);

        // Clean up old memory queries (keep last 5000)
        await this.db.run(`
            DELETE FROM memory_queries
            WHERE id NOT IN (
                SELECT id FROM memory_queries
                ORDER BY timestamp DESC
                LIMIT 5000
            )
        `);

        console.log(`🧹 Cleaned up old data (keeping last ${daysToKeep} days of detailed records)`);
    }

    async close() {
        if (this.db) {
            await this.db.close();
            this.db = null;
            this.initialized = false;
            console.log('🗄️  Memory Database connection closed');
        }
    }

    // Migration helpers (for future schema updates)
    async runMigration(migrationSQL) {
        await this.db.exec(migrationSQL);
        console.log('✅ Database migration completed');
    }
}

// Export for use in other modules
export default MemoryDatabaseManager;

// CLI interface for testing
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);
    const command = args[0];

    async function runCLI() {
        const dbManager = new MemoryDatabaseManager();

        try {
            await dbManager.initialize();

            switch (command) {
                case 'stats':
                    const stats = await dbManager.getDatabaseStats();
                    console.log('📊 Database Statistics:');
                    Object.entries(stats).forEach(([table, count]) => {
                        console.log(`  ${table}: ${count} records`);
                    });
                    break;

                case 'domains':
                    const domains = await dbManager.getAllResearchDomains();
                    console.log('📂 Research Domains:');
                    domains.forEach(domain => {
                        console.log(`  ${domain.domain_key}: ${domain.name} (${domain.insights_count} insights)`);
                    });
                    break;

                case 'insights':
                    const domain = args[1] || 'memory_systems';
                    const insights = await dbManager.getResearchInsightsByDomain(domain, 5);
                    console.log(`💡 Recent insights in ${domain}:`);
                    insights.forEach(insight => {
                        console.log(`  ${insight.title} (${(insight.confidence * 100).toFixed(1)}% confidence)`);
                    });
                    break;

                case 'search':
                    const query = args.slice(1).join(' ');
                    const results = await dbManager.executeCodeMapMemoryQuery(query);
                    console.log(`🔍 Search results for "${query}":`);
                    results.results.slice(0, 5).forEach(result => {
                        console.log(`  ${result.title} (${result.relevanceScore} relevance)`);
                    });
                    break;

                case 'cleanup':
                    await dbManager.cleanupOldData();
                    break;

                case 'init-data':
                    // Initialize with sample data (would normally be called from research storage)
                    console.log('📚 Initializing sample research data...');
                    // This would be handled by the research storage system
                    break;

                default:
                    console.log('Memory Database Manager CLI');
                    console.log('Usage: node memory-database-manager.js <command>');
                    console.log('');
                    console.log('Commands:');
                    console.log('  stats     Show database statistics');
                    console.log('  domains   List all research domains');
                    console.log('  insights [domain]  Show insights from domain');
                    console.log('  search <query>     Search research insights');
                    console.log('  cleanup   Remove old data');
                    console.log('  init-data Initialize sample data');
            }

        } catch (error) {
            console.error('❌ CLI Error:', error.message);
        } finally {
            await dbManager.close();
        }
    }

    runCLI().catch(console.error);
}
