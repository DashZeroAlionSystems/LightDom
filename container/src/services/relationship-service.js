/**
 * Relationship Service
 * 
 * Handles relationship operations and graph traversal
 */

import { PrismaClient } from '@prisma/client';
import Graph from 'graphology';
import { EventEmitter } from 'events';

const prisma = new PrismaClient();

class RelationshipService extends EventEmitter {
  constructor() {
    super();
    this.graph = new Graph();
  }

  /**
   * Create relationship
   */
  async create(data) {
    const {
      sourceEntityId,
      targetEntityId,
      relationshipType,
      properties = {},
      strength = 1.0
    } = data;

    const relationship = await prisma.relationship.create({
      data: {
        sourceEntityId,
        targetEntityId,
        relationshipType,
        properties,
        strength
      }
    });

    // Update in-memory graph
    if (!this.graph.hasNode(sourceEntityId)) {
      this.graph.addNode(sourceEntityId);
    }
    if (!this.graph.hasNode(targetEntityId)) {
      this.graph.addNode(targetEntityId);
    }
    
    this.graph.addEdge(sourceEntityId, targetEntityId, {
      type: relationshipType,
      strength,
      id: relationship.id
    });

    this.emit('created', relationship);
    
    return relationship;
  }

  /**
   * Traverse relationships from entity
   */
  async traverse(entityId, relationshipType = null, depth = 1) {
    const visited = new Set();
    const result = {
      nodes: [],
      edges: []
    };

    const traverse = async (currentId, currentDepth) => {
      if (currentDepth > depth || visited.has(currentId)) {
        return;
      }

      visited.add(currentId);

      // Get entity
      const entity = await prisma.entity.findUnique({
        where: { id: currentId }
      });

      if (entity) {
        result.nodes.push(entity);
      }

      // Get relationships
      const where = {
        sourceEntityId: currentId,
        ...(relationshipType && { relationshipType })
      };

      const relationships = await prisma.relationship.findMany({
        where,
        include: {
          targetEntity: true
        }
      });

      for (const rel of relationships) {
        result.edges.push({
          source: rel.sourceEntityId,
          target: rel.targetEntityId,
          type: rel.relationshipType,
          strength: rel.strength
        });

        // Recurse
        await traverse(rel.targetEntityId, currentDepth + 1);
      }
    };

    await traverse(entityId, 0);

    return result;
  }

  /**
   * Get neighbors of entity
   */
  async getNeighbors(entityId, relationshipType = null) {
    const where = {
      sourceEntityId: entityId,
      ...(relationshipType && { relationshipType })
    };

    const relationships = await prisma.relationship.findMany({
      where,
      include: {
        targetEntity: true
      }
    });

    return relationships.map(r => r.targetEntity);
  }

  /**
   * Calculate centrality (simplified)
   */
  async calculateCentrality(entityId) {
    const inDegree = await prisma.relationship.count({
      where: { targetEntityId: entityId }
    });

    const outDegree = await prisma.relationship.count({
      where: { sourceEntityId: entityId }
    });

    return {
      inDegree,
      outDegree,
      totalDegree: inDegree + outDegree
    };
  }

  /**
   * Build graph from database
   */
  async buildGraph() {
    const entities = await prisma.entity.findMany();
    const relationships = await prisma.relationship.findMany();

    this.graph.clear();

    // Add nodes
    for (const entity of entities) {
      this.graph.addNode(entity.id, {
        entityType: entity.entityType,
        data: entity.data
      });
    }

    // Add edges
    for (const rel of relationships) {
      if (this.graph.hasNode(rel.sourceEntityId) && this.graph.hasNode(rel.targetEntityId)) {
        this.graph.addEdge(rel.sourceEntityId, rel.targetEntityId, {
          type: rel.relationshipType,
          strength: rel.strength,
          id: rel.id
        });
      }
    }

    return this.graph;
  }
}

export { RelationshipService };
