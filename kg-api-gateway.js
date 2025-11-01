#!/usr/bin/env node

/**
 * Knowledge Graph API Gateway
 * RESTful API interface to the Knowledge Graph MCP Server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import pg from 'pg';

class KnowledgeGraphAPIGateway {
    constructor() {
        this.app = express();
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(morgan('combined'));
        this.app.use(express.json({ limit: '10mb' }));

        this.dbConfig = {
            host: process.env.POSTGRES_HOST || 'localhost',
            port: process.env.POSTGRES_PORT || 5432,
            database: process.env.POSTGRES_DB || 'knowledge_graph',
            user: process.env.POSTGRES_USER || 'kg_user',
            password: process.env.POSTGRES_PASSWORD || 'kg_password',
        };

        this.pool = null;
        this.mcpServerHost = process.env.MCP_SERVER_HOST || 'localhost';

        this.initializeDatabase();
        this.setupRoutes();
    }

    async initializeDatabase() {
        try {
            this.pool = new pg.Pool(this.dbConfig);
            console.log('✅ API Gateway connected to PostgreSQL');
        } catch (error) {
            console.error('❌ Database connection failed:', error);
        }
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                service: 'knowledge-graph-api-gateway',
                timestamp: new Date().toISOString(),
                database: this.pool ? 'connected' : 'disconnected'
            });
        });

        // Knowledge Graph Operations
        this.app.post('/api/nodes', this.createNode.bind(this));
        this.app.get('/api/nodes', this.queryNodes.bind(this));
        this.app.get('/api/nodes/:id', this.getNode.bind(this));
        this.app.put('/api/nodes/:id', this.updateNode.bind(this));
        this.app.delete('/api/nodes/:id', this.deleteNode.bind(this));

        this.app.post('/api/relationships', this.createRelationship.bind(this));
        this.app.get('/api/relationships', this.queryRelationships.bind(this));
        this.app.delete('/api/relationships/:id', this.deleteRelationship.bind(this));

        // Search and Analysis
        this.app.get('/api/search', this.search.bind(this));
        this.app.get('/api/analyze/:type', this.analyze.bind(this));

        // Workflow Operations
        this.app.post('/api/workflows/:type', this.executeWorkflow.bind(this));
        this.app.get('/api/workflows', this.getWorkflowHistory.bind(this));

        // MCP Integration
        this.app.post('/api/mcp/integrate', this.integrateMCPs.bind(this));

        // Statistics and Monitoring
        this.app.get('/api/stats', this.getStats.bind(this));
        this.app.get('/api/metrics', this.getMetrics.bind(this));

        // Error handling
        this.app.use((error, req, res, next) => {
            console.error('API Error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        });
    }

    // Node operations
    async createNode(req, res) {
        try {
            const { nodeId, nodeType, label, properties } = req.body;

            if (this.pool) {
                const client = await this.pool.connect();
                try {
                    const result = await client.query(`
                        INSERT INTO knowledge_nodes (node_id, node_type, label, properties)
                        VALUES ($1, $2, $3, $4)
                        RETURNING *
                    `, [nodeId, nodeType, label, JSON.stringify(properties || {})]);

                    res.json({
                        success: true,
                        node: result.rows[0]
                    });
                } finally {
                    client.release();
                }
            } else {
                res.status(503).json({
                    error: 'Database unavailable'
                });
            }
        } catch (error) {
            res.status(400).json({
                error: 'Failed to create node',
                message: error.message
            });
        }
    }

    async queryNodes(req, res) {
        try {
            const { nodeType, label, limit = 10 } = req.query;

            if (this.pool) {
                const client = await this.pool.connect();
                try {
                    let query = 'SELECT * FROM knowledge_nodes WHERE 1=1';
                    const params = [];
                    let paramIndex = 1;

                    if (nodeType) {
                        query += ` AND node_type = $${paramIndex}`;
                        params.push(nodeType);
                        paramIndex++;
                    }

                    if (label) {
                        query += ` AND label ILIKE $${paramIndex}`;
                        params.push(`%${label}%`);
                        paramIndex++;
                    }

                    query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
                    params.push(parseInt(limit));

                    const result = await client.query(query, params);

                    const nodes = result.rows.map(row => ({
                        ...row,
                        properties: JSON.parse(row.properties || '{}')
                    }));

                    res.json({
                        success: true,
                        nodes,
                        count: nodes.length
                    });
                } finally {
                    client.release();
                }
            } else {
                res.status(503).json({
                    error: 'Database unavailable'
                });
            }
        } catch (error) {
            res.status(500).json({
                error: 'Failed to query nodes',
                message: error.message
            });
        }
    }

    async getNode(req, res) {
        try {
            const { id } = req.params;

            if (this.pool) {
                const client = await this.pool.connect();
                try {
                    const result = await client.query(`
                        SELECT * FROM knowledge_nodes WHERE node_id = $1
                    `, [id]);

                    if (result.rows.length === 0) {
                        return res.status(404).json({
                            error: 'Node not found'
                        });
                    }

                    const node = result.rows[0];
                    node.properties = JSON.parse(node.properties || '{}');

                    res.json({
                        success: true,
                        node
                    });
                } finally {
                    client.release();
                }
            } else {
                res.status(503).json({
                    error: 'Database unavailable'
                });
            }
        } catch (error) {
            res.status(500).json({
                error: 'Failed to get node',
                message: error.message
            });
        }
    }

    // Relationship operations
    async createRelationship(req, res) {
        try {
            const { fromNodeId, toNodeId, relationshipType, properties, weight } = req.body;

            if (this.pool) {
                const client = await this.pool.connect();
                try {
                    const relationshipId = `${fromNodeId}_${relationshipType}_${toNodeId}`;

                    const result = await client.query(`
                        INSERT INTO knowledge_relationships
                        (relationship_id, from_node_id, to_node_id, relationship_type, properties, weight)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        RETURNING *
                    `, [
                        relationshipId,
                        fromNodeId,
                        toNodeId,
                        relationshipType,
                        JSON.stringify(properties || {}),
                        weight || 1.0
                    ]);

                    res.json({
                        success: true,
                        relationship: result.rows[0]
                    });
                } finally {
                    client.release();
                }
            } else {
                res.status(503).json({
                    error: 'Database unavailable'
                });
            }
        } catch (error) {
            res.status(400).json({
                error: 'Failed to create relationship',
                message: error.message
            });
        }
    }

    async queryRelationships(req, res) {
        try {
            const { nodeId, relationshipType, limit = 20 } = req.query;

            if (this.pool) {
                const client = await this.pool.connect();
                try {
                    let query = `
                        SELECT r.*, n1.label as from_label, n2.label as to_label
                        FROM knowledge_relationships r
                        JOIN knowledge_nodes n1 ON r.from_node_id = n1.node_id
                        JOIN knowledge_nodes n2 ON r.to_node_id = n2.node_id
                        WHERE 1=1
                    `;
                    const params = [];
                    let paramIndex = 1;

                    if (nodeId) {
                        query += ` AND (r.from_node_id = $${paramIndex} OR r.to_node_id = $${paramIndex})`;
                        params.push(nodeId);
                        paramIndex++;
                    }

                    if (relationshipType) {
                        query += ` AND r.relationship_type = $${paramIndex}`;
                        params.push(relationshipType);
                        paramIndex++;
                    }

                    query += ` ORDER BY r.created_at DESC LIMIT $${paramIndex}`;
                    params.push(parseInt(limit));

                    const result = await client.query(query, params);

                    res.json({
                        success: true,
                        relationships: result.rows,
                        count: result.rows.length
                    });
                } finally {
                    client.release();
                }
            } else {
                res.status(503).json({
                    error: 'Database unavailable'
                });
            }
        } catch (error) {
            res.status(500).json({
                error: 'Failed to query relationships',
                message: error.message
            });
        }
    }

    // Search operations
    async search(req, res) {
        try {
            const { q: query, type: nodeType, limit = 10 } = req.query;

            if (this.pool) {
                const client = await this.pool.connect();
                try {
                    let sql = `
                        SELECT n.*, COUNT(r.id) as connection_count
                        FROM knowledge_nodes n
                        LEFT JOIN knowledge_relationships r ON n.node_id = r.from_node_id OR n.node_id = r.to_node_id
                        WHERE 1=1
                    `;
                    const params = [];
                    let paramIndex = 1;

                    if (query) {
                        sql += ` AND (n.label ILIKE $${paramIndex} OR n.node_type ILIKE $${paramIndex})`;
                        params.push(`%${query}%`);
                        paramIndex++;
                    }

                    if (nodeType) {
                        sql += ` AND n.node_type = $${paramIndex}`;
                        params.push(nodeType);
                        paramIndex++;
                    }

                    sql += ` GROUP BY n.id, n.node_id, n.node_type, n.label, n.properties, n.embedding, n.created_at, n.updated_at
                             ORDER BY n.created_at DESC LIMIT $${paramIndex}`;
                    params.push(parseInt(limit));

                    const result = await client.query(sql, params);

                    const results = result.rows.map(row => ({
                        ...row,
                        properties: JSON.parse(row.properties || '{}'),
                        relevanceScore: query ?
                            (row.label.toLowerCase().includes(query.toLowerCase()) ? 100 :
                             row.node_type.toLowerCase().includes(query.toLowerCase()) ? 80 : 60) : 100
                    }));

                    res.json({
                        success: true,
                        query,
                        results,
                        count: results.length
                    });
                } finally {
                    client.release();
                }
            } else {
                res.status(503).json({
                    error: 'Database unavailable'
                });
            }
        } catch (error) {
            res.status(500).json({
                error: 'Search failed',
                message: error.message
            });
        }
    }

    // Analysis operations
    async analyze(req, res) {
        try {
            const { type } = req.params;

            if (this.pool) {
                const client = await this.pool.connect();
                try {
                    let analysis = {};

                    switch (type) {
                        case 'stats':
                            const statsResult = await client.query('SELECT * FROM knowledge_graph_stats');
                            analysis = statsResult.rows[0];
                            break;

                        case 'centrality':
                            const centralityResult = await client.query(`
                                SELECT * FROM node_connectivity
                                ORDER BY total_connections DESC
                                LIMIT 10
                            `);
                            analysis.topNodes = centralityResult.rows;
                            break;

                        case 'clusters':
                            const clusterResult = await client.query(`
                                SELECT node_type, COUNT(*) as count
                                FROM knowledge_nodes
                                GROUP BY node_type
                                ORDER BY count DESC
                            `);
                            analysis.clusters = clusterResult.rows;
                            break;

                        default:
                            return res.status(400).json({
                                error: 'Unknown analysis type',
                                supported: ['stats', 'centrality', 'clusters']
                            });
                    }

                    res.json({
                        success: true,
                        analysisType: type,
                        analysis
                    });
                } finally {
                    client.release();
                }
            } else {
                res.status(503).json({
                    error: 'Database unavailable'
                });
            }
        } catch (error) {
            res.status(500).json({
                error: 'Analysis failed',
                message: error.message
            });
        }
    }

    // Workflow operations
    async executeWorkflow(req, res) {
        try {
            const { type } = req.params;
            const { context } = req.body;

            // Call workflow automator service
            const workflowResponse = await fetch('http://localhost:3005/execute/' + type, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ context })
            });

            const result = await workflowResponse.json();

            res.json(result);
        } catch (error) {
            res.status(500).json({
                error: 'Workflow execution failed',
                message: error.message
            });
        }
    }

    async getWorkflowHistory(req, res) {
        try {
            if (this.pool) {
                const client = await this.pool.connect();
                try {
                    const result = await client.query(`
                        SELECT * FROM workflow_executions
                        ORDER BY start_time DESC
                        LIMIT 20
                    `);

                    const executions = result.rows.map(row => ({
                        ...row,
                        context: JSON.parse(row.context || '{}'),
                        requirements: JSON.parse(row.requirements || '{}'),
                        memory_optimizations: JSON.parse(row.memory_optimizations || '[]')
                    }));

                    res.json({
                        success: true,
                        executions,
                        count: executions.length
                    });
                } finally {
                    client.release();
                }
            } else {
                res.status(503).json({
                    error: 'Database unavailable'
                });
            }
        } catch (error) {
            res.status(500).json({
                error: 'Failed to get workflow history',
                message: error.message
            });
        }
    }

    // MCP Integration
    async integrateMCPs(req, res) {
        try {
            const { operation, useSequentialThinking, useMemory, usePostgres, parameters } = req.body;

            // Call MCP integration through workflow automator
            const mcpResponse = await fetch('http://localhost:3005/integrate-mcps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    operation,
                    useSequentialThinking: useSequentialThinking !== false,
                    useMemory: useMemory !== false,
                    usePostgres: usePostgres !== false,
                    parameters
                })
            });

            const result = await mcpResponse.json();
            res.json(result);
        } catch (error) {
            res.status(500).json({
                error: 'MCP integration failed',
                message: error.message
            });
        }
    }

    // Statistics and metrics
    async getStats(req, res) {
        try {
            if (this.pool) {
                const client = await this.pool.connect();
                try {
                    const statsResult = await client.query('SELECT * FROM knowledge_graph_stats');
                    const stats = statsResult.rows[0];

                    res.json({
                        success: true,
                        stats
                    });
                } finally {
                    client.release();
                }
            } else {
                res.status(503).json({
                    error: 'Database unavailable'
                });
            }
        } catch (error) {
            res.status(500).json({
                error: 'Failed to get stats',
                message: error.message
            });
        }
    }

    async getMetrics(req, res) {
        try {
            if (this.pool) {
                const client = await this.pool.connect();
                try {
                    // Get performance metrics
                    const perfResult = await client.query(`
                        SELECT metric_type, metric_name, value, unit, timestamp
                        FROM performance_metrics
                        ORDER BY timestamp DESC
                        LIMIT 50
                    `);

                    const metrics = perfResult.rows.map(row => ({
                        ...row,
                        context: JSON.parse(row.context || '{}')
                    }));

                    res.json({
                        success: true,
                        metrics,
                        count: metrics.length
                    });
                } finally {
                    client.release();
                }
            } else {
                res.status(503).json({
                    error: 'Database unavailable'
                });
            }
        } catch (error) {
            res.status(500).json({
                error: 'Failed to get metrics',
                message: error.message
            });
        }
    }

    start(port = 3003) {
        this.app.listen(port, () => {
            console.log(`🚀 Knowledge Graph API Gateway running on port ${port}`);
            console.log(`📊 Available endpoints:`);
            console.log(`   POST /api/nodes - Create knowledge node`);
            console.log(`   GET  /api/nodes - Query knowledge nodes`);
            console.log(`   POST /api/relationships - Create relationship`);
            console.log(`   GET  /api/search - Search knowledge graph`);
            console.log(`   POST /api/workflows/:type - Execute workflow`);
            console.log(`   GET  /api/stats - Get knowledge graph statistics`);
        });
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
        }
    }
}

// Start the API Gateway if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const gateway = new KnowledgeGraphAPIGateway();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('🛑 Shutting down API Gateway...');
        await gateway.close();
        process.exit(0);
    });

    const port = process.env.PORT || 3003;
    gateway.start(port);
}

export default KnowledgeGraphAPIGateway;
