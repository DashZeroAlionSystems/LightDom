/**
 * Entity Service
 * 
 * Handles CRUD operations for entities with flexible JSONB storage
 */

import { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import { EventEmitter } from 'events';

const prisma = new PrismaClient();
const ajv = new Ajv({ allErrors: true });

class EntityService extends EventEmitter {
  constructor() {
    super();
    this.schemas = new Map();
  }

  /**
   * Register schema for entity type
   */
  registerSchema(entityType, schema) {
    const validate = ajv.compile(schema);
    this.schemas.set(entityType, { schema, validate });
  }

  /**
   * Create entity
   */
  async create(data) {
    const { entityType, data: entityData, metadata = {}, relationships = [] } = data;

    // Validate if schema exists
    if (this.schemas.has(entityType)) {
      const { validate } = this.schemas.get(entityType);
      const valid = validate(entityData);
      
      if (!valid) {
        throw new Error(`Validation failed: ${JSON.stringify(validate.errors)}`);
      }
    }

    // Create entity
    const entity = await prisma.entity.create({
      data: {
        entityType,
        data: entityData,
        metadata,
        version: 1
      }
    });

    // Create relationships if provided
    if (relationships.length > 0) {
      for (const rel of relationships) {
        await prisma.relationship.create({
          data: {
            sourceEntityId: entity.id,
            targetEntityId: rel.targetEntityId,
            relationshipType: rel.relationshipType,
            properties: rel.properties || {},
            strength: rel.strength || 1.0
          }
        });
      }
    }

    this.emit('created', entity);
    
    return entity;
  }

  /**
   * Get entity by ID
   */
  async getById(id, include = '') {
    const includeRelations = include.split(',').reduce((acc, item) => {
      if (item === 'relationships') {
        acc.sourceRels = true;
        acc.targetRels = true;
      }
      return acc;
    }, {});

    return await prisma.entity.findUnique({
      where: { id },
      include: includeRelations
    });
  }

  /**
   * Update entity
   */
  async update(id, data) {
    const entity = await prisma.entity.findUnique({ where: { id } });
    
    if (!entity) {
      throw new Error('Entity not found');
    }

    // Validate if schema exists
    if (this.schemas.has(entity.entityType) && data.data) {
      const { validate } = this.schemas.get(entity.entityType);
      const valid = validate(data.data);
      
      if (!valid) {
        throw new Error(`Validation failed: ${JSON.stringify(validate.errors)}`);
      }
    }

    const updated = await prisma.entity.update({
      where: { id },
      data: {
        data: data.data || entity.data,
        metadata: data.metadata || entity.metadata,
        version: { increment: 1 },
        updatedAt: new Date()
      }
    });

    this.emit('updated', updated);
    
    return updated;
  }

  /**
   * Delete entity (soft delete)
   */
  async delete(id) {
    await prisma.entity.update({
      where: { id },
      data: {
        metadata: {
          deleted: true,
          deletedAt: new Date().toISOString()
        }
      }
    });

    this.emit('deleted', { id });
  }

  /**
   * Query entities
   */
  async query(options = {}) {
    const { entityType, limit = 50, offset = 0, where = {} } = options;

    const filter = {
      ...where,
      ...(entityType && { entityType })
    };

    return await prisma.entity.findMany({
      where: filter,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Health check
   */
  async checkHealth() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return false;
    }
  }
}

export { EntityService };
