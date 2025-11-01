#!/usr/bin/env node

/**
 * Knowledge Graph Monitor
 * Monitoring and analytics service for the knowledge graph system
 */

import express from 'express';
import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class KnowledgeGraphMonitor {
    constructor() {
        this.app = express();
        this.app.use(express.json());

        this.dbConfig = {
            host: process.env.POSTGRES_HOST || 'localhost',
            port: process.env.POSTGRES_PORT || 5432,
            database: process.env.POSTGRES_DB || 'knowledge_graph',
            user: process.env.POSTGRES_USER || 'kg_user',
            password: process.env.POSTGRES_PASSWORD || 'kg_password',
        };

        this.pool = null;
        this.metrics = new Map();

        this.setupRoutes();
        this.initializeDatabase();
        this.startMetricsCollection();
    }

    async initializeDatabase() {
        try {
            this.pool = new pg.Pool(this.dbConfig);
            console.log('✅ Monitor connected to PostgreSQL');
        } catch (error) {
            console.error('❌ Database connection failed:', error);
        }
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                service: 'knowledge-graph-monitor',
                timestamp: new Date().toISOString(),
                metricsCollected: this.metrics.size
            });
        });

        // Get current metrics
        this.app.get('/metrics', async (req, res) => {
            try {
                const metrics = await this.collectCurrentMetrics();
                res.json(metrics);
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to collect metrics',
                    message: error.message
                });
            }
        });

        // Get metrics history
        this.app.get('/metrics/history', async (req, res) => {
            try {
                const { hours = 24 } = req.query;
                const history = await this.getMetricsHistory(hours);
                res.json(history);
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to get metrics history',
                    message: error.message
                });
            }
        });

        // Get alerts
        this.app.get('/alerts', async (req, res) => {
            try {
                const alerts = await this.checkAlerts();
                res.json(alerts);
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to check alerts',
                    message: error.message
                });
            }
        });

        // Performance dashboard
        this.app.get('/dashboard', async (req, res) => {
            try {
                const dashboard = await this.generateDashboard();
                res.json(dashboard);
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to generate dashboard',
                    message: error.message
                });
            }
        });
    }

    async collectCurrentMetrics() {
        const metrics = {
            timestamp: new Date().toISOString(),
            system: {},
            knowledge_graph: {},
            performance: {}
        };

        if (this.pool) {
            const client = await this.pool.connect();
            try {
                // System metrics
                const systemResult = await client.query(`
                    SELECT
                        (SELECT COUNT(*) FROM knowledge_nodes) as total_nodes,
                        (SELECT COUNT(*) FROM knowledge_relationships) as total_relationships,
                        (SELECT COUNT(DISTINCT node_type) FROM knowledge_nodes) as node_types,
                        (SELECT COUNT(DISTINCT relationship_type) FROM knowledge_relationships) as relationship_types
                `);

                metrics.knowledge_graph = systemResult.rows[0];

                // Performance metrics (last 1 hour)
                const perfResult = await client.query(`
                    SELECT
                        AVG(execution_time) as avg_operation_time,
                        COUNT(*) as operations_last_hour,
                        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as success_rate
                    FROM knowledge_operations
                    WHERE created_at >= NOW() - INTERVAL '1 hour'
                `);

                metrics.performance = perfResult.rows[0];

                // System health
                const healthResult = await client.query(`
                    SELECT
                        (SELECT COUNT(*) FROM knowledge_sessions WHERE status = 'active') as active_sessions,
                        (SELECT COUNT(*) FROM workflow_executions WHERE status = 'running') as running_workflows,
                        (SELECT MAX(created_at) FROM knowledge_operations) as last_operation
                `);

                metrics.system = healthResult.rows[0];

            } finally {
                client.release();
            }
        }

        // Store metrics
        this.metrics.set(metrics.timestamp, metrics);

        return metrics;
    }

    async getMetricsHistory(hours = 24) {
        if (this.pool) {
            const client = await this.pool.connect();
            try {
                const result = await client.query(`
                    SELECT * FROM performance_metrics
                    WHERE timestamp >= NOW() - INTERVAL '${hours} hours'
                    ORDER BY timestamp DESC
                `);

                return result.rows.map(row => ({
                    ...row,
                    context: JSON.parse(row.context || '{}')
                }));
            } finally {
                client.release();
            }
        }

        return [];
    }

    async checkAlerts() {
        const alerts = [];
        const metrics = await this.collectCurrentMetrics();

        // Check for issues
        if (metrics.performance.success_rate < 80) {
            alerts.push({
                level: 'warning',
                message: `Low success rate: ${metrics.performance.success_rate.toFixed(1)}%`,
                timestamp: new Date().toISOString()
            });
        }

        if (metrics.system.active_sessions === 0) {
            alerts.push({
                level: 'info',
                message: 'No active sessions detected',
                timestamp: new Date().toISOString()
            });
        }

        // Check for performance degradation
        const recentMetrics = Array.from(this.metrics.values()).slice(-5);
        if (recentMetrics.length >= 2) {
            const avgTime = recentMetrics.reduce((sum, m) => sum + (m.performance.avg_operation_time || 0), 0) / recentMetrics.length;
            const currentTime = metrics.performance.avg_operation_time || 0;

            if (currentTime > avgTime * 1.5) {
                alerts.push({
                    level: 'warning',
                    message: `Performance degradation detected: ${((currentTime - avgTime) / avgTime * 100).toFixed(1)}% slower`,
                    timestamp: new Date().toISOString()
                });
            }
        }

        return alerts;
    }

    async generateDashboard() {
        const currentMetrics = await this.collectCurrentMetrics();
        const alerts = await this.checkAlerts();
        const history = await this.getMetricsHistory(1); // Last hour

        return {
            timestamp: new Date().toISOString(),
            current: currentMetrics,
            alerts,
            history: history.slice(0, 20), // Last 20 data points
            summary: {
                health_score: this.calculateHealthScore(currentMetrics, alerts),
                trends: this.analyzeTrends(history),
                recommendations: this.generateRecommendations(currentMetrics, alerts)
            }
        };
    }

    calculateHealthScore(metrics, alerts) {
        let score = 100;

        // Deduct for alerts
        score -= alerts.filter(a => a.level === 'warning').length * 10;
        score -= alerts.filter(a => a.level === 'error').length * 25;

        // Deduct for low success rate
        if (metrics.performance.success_rate < 90) {
            score -= (90 - metrics.performance.success_rate) * 0.5;
        }

        // Deduct for no recent activity
        const lastOperation = new Date(metrics.system.last_operation);
        const hoursSinceLastOp = (Date.now() - lastOperation.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastOp > 1) {
            score -= Math.min(hoursSinceLastOp * 2, 20);
        }

        return Math.max(0, Math.min(100, score));
    }

    analyzeTrends(history) {
        if (history.length < 2) return { trend: 'insufficient_data' };

        const recent = history.slice(0, 5);
        const older = history.slice(5, 10);

        if (older.length === 0) return { trend: 'new_system' };

        const recentAvg = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
        const olderAvg = older.reduce((sum, m) => sum + m.value, 0) / older.length;

        const change = ((recentAvg - olderAvg) / olderAvg) * 100;

        return {
            trend: Math.abs(change) < 5 ? 'stable' : change > 0 ? 'increasing' : 'decreasing',
            change_percent: change.toFixed(1),
            direction: change > 0 ? 'up' : 'down'
        };
    }

    generateRecommendations(metrics, alerts) {
        const recommendations = [];

        if (metrics.performance.success_rate < 90) {
            recommendations.push({
                priority: 'high',
                message: 'Investigate low success rates in operations',
                action: 'Review error logs and operation parameters'
            });
        }

        if (alerts.some(a => a.level === 'warning')) {
            recommendations.push({
                priority: 'medium',
                message: 'Address system warnings',
                action: 'Check system resources and configuration'
            });
        }

        if (metrics.knowledge_graph.total_nodes < 10) {
            recommendations.push({
                priority: 'low',
                message: 'Consider expanding knowledge graph',
                action: 'Add more nodes and relationships to improve coverage'
            });
        }

        return recommendations;
    }

    startMetricsCollection() {
        // Collect metrics every 5 minutes
        setInterval(async () => {
            try {
                await this.collectCurrentMetrics();
                console.log('📊 Metrics collected');
            } catch (error) {
                console.error('Failed to collect metrics:', error.message);
            }
        }, 5 * 60 * 1000); // 5 minutes

        // Initial collection
        setTimeout(() => this.collectCurrentMetrics(), 1000);
    }

    start(port = 3004) {
        this.app.listen(port, () => {
            console.log(`📊 Knowledge Graph Monitor running on port ${port}`);
            console.log(`📈 Available endpoints:`);
            console.log(`   GET  /health - Health check`);
            console.log(`   GET  /metrics - Current metrics`);
            console.log(`   GET  /metrics/history - Metrics history`);
            console.log(`   GET  /alerts - System alerts`);
            console.log(`   GET  /dashboard - Performance dashboard`);
            console.log('');
            console.log('📊 Collecting metrics every 5 minutes...');
        });
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
        }
    }
}

// Start the monitor if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const monitor = new KnowledgeGraphMonitor();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('🛑 Shutting down Monitor...');
        await monitor.close();
        process.exit(0);
    });

    const port = process.env.PORT || 3004;
    monitor.start(port);
}

export default KnowledgeGraphMonitor;
