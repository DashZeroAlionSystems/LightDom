/**
 * Integration Tests for Schema Component Mapper
 * Tests component selection and schema management
 */

import { describe, it, expect, beforeAll } from 'vitest';
import SchemaComponentMapper from '../../src/schema/SchemaComponentMapper';

describe('SchemaComponentMapper Integration Tests', () => {
  let mapper: SchemaComponentMapper;

  beforeAll(async () => {
    mapper = new SchemaComponentMapper();
    await mapper.initialize();
  });

  it('should initialize with default schemas', () => {
    const schemas = mapper.getAllSchemas();
    expect(schemas.length).toBeGreaterThan(0);
    expect(schemas.length).toBe(6); // 6 default schemas
  });

  it('should select appropriate component for use case', async () => {
    const match = await mapper.selectComponent('dashboard with analytics and charts');

    expect(match).toBeDefined();
    expect(match?.schema).toBeDefined();
    expect(match?.score).toBeGreaterThan(0);
    expect(match?.reasons).toBeDefined();
    expect(Array.isArray(match?.reasons)).toBe(true);
  });

  it('should score dashboard higher for analytics use case', async () => {
    const match = await mapper.selectComponent('analytics dashboard with metrics');

    expect(match?.schema['@type']).toBe('WebPage');
    expect(match?.schema.name).toContain('Dashboard');
    expect(match?.score).toBeGreaterThan(50);
  });

  it('should select product card for ecommerce use case', async () => {
    const match = await mapper.selectComponent('product card for online shop');

    expect(match?.schema['@type']).toBe('Product');
    expect(match?.schema.name).toContain('Product');
  });

  it('should select data table for list use case', async () => {
    const match = await mapper.selectComponent('table to display data with sorting');

    expect(match?.schema['@type']).toBe('ItemList');
    expect(match?.schema.name).toContain('Table');
  });

  it('should select chart for visualization use case', async () => {
    const match = await mapper.selectComponent('chart to visualize data');

    expect(match?.schema['@type']).toBe('Chart');
  });

  it('should select button for action use case', async () => {
    const match = await mapper.selectComponent('button to submit form');

    expect(match?.schema['@type']).toBe('Button');
  });

  it('should consider context in selection', async () => {
    const match = await mapper.selectComponent('component for listing items', {
      category: 'organism',
    });

    expect(match?.schema['lightdom:category']).toBe('organism');
  });

  it('should handle unknown use cases gracefully', async () => {
    const match = await mapper.selectComponent('completely unknown random use case xyz123');

    // Should still try to find best match or return null
    if (match) {
      expect(match.schema).toBeDefined();
    }
  });

  it('should get components by type', () => {
    const pages = mapper.getComponentsByType('page');
    const atoms = mapper.getComponentsByType('atom');
    const organisms = mapper.getComponentsByType('organism');

    expect(Array.isArray(pages)).toBe(true);
    expect(Array.isArray(atoms)).toBe(true);
    expect(Array.isArray(organisms)).toBe(true);

    expect(atoms.length).toBeGreaterThan(0);
    expect(organisms.length).toBeGreaterThan(0);
  });

  it('should get components by category', () => {
    const pageCategory = mapper.getComponentsByCategory('page');
    const atomCategory = mapper.getComponentsByCategory('atom');

    expect(Array.isArray(pageCategory)).toBe(true);
    expect(Array.isArray(atomCategory)).toBe(true);
  });

  it('should get component by ID', () => {
    const component = mapper.getComponentById('lightdom:dashboard-page');

    expect(component).toBeDefined();
    expect(component?.name).toBe('Dashboard Page');
    expect(component?.['@id']).toBe('lightdom:dashboard-page');
  });

  it('should save custom schema', async () => {
    const customSchema = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      '@id': 'lightdom:test-video-player',
      name: 'Test Video Player',
      description: 'Test video player component',
      'lightdom:componentType': 'organism' as const,
      'lightdom:reactComponent': 'TestVideoPlayer',
      'lightdom:props': [
        {
          name: 'src',
          type: 'string' as const,
          required: true,
        },
      ],
      'lightdom:linkedSchemas': [],
      'lightdom:useCase': ['video', 'test'],
      'lightdom:semanticMeaning': 'Test video player',
      'lightdom:priority': 5,
      'lightdom:category': 'organism',
    };

    await mapper.saveSchema(customSchema);

    const retrieved = mapper.getComponentById('lightdom:test-video-player');
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Test Video Player');
  });

  it('should calculate statistics correctly', () => {
    const stats = mapper.getStatistics();

    expect(stats).toHaveProperty('totalSchemas');
    expect(stats).toHaveProperty('byType');
    expect(stats).toHaveProperty('byCategory');

    expect(stats.totalSchemas).toBeGreaterThan(0);
    expect(typeof stats.byType).toBe('object');
    expect(typeof stats.byCategory).toBe('object');
  });

  it('should emit events on schema updates', (done) => {
    mapper.once('schemaUpdated', (schema) => {
      expect(schema).toBeDefined();
      expect(schema['@id']).toBe('lightdom:test-event-schema');
      done();
    });

    mapper.saveSchema({
      '@context': 'https://schema.org',
      '@type': 'Thing',
      '@id': 'lightdom:test-event-schema',
      name: 'Test Event Schema',
      description: 'Test schema for event testing',
      'lightdom:componentType': 'atom' as const,
      'lightdom:reactComponent': 'TestComponent',
      'lightdom:props': [],
      'lightdom:linkedSchemas': [],
      'lightdom:useCase': ['test'],
      'lightdom:semanticMeaning': 'Test',
      'lightdom:priority': 1,
      'lightdom:category': 'atom',
    });
  });

  it('should handle linked schemas', async () => {
    const dashboardSchema = mapper.getComponentById('lightdom:dashboard-page');

    expect(dashboardSchema).toBeDefined();
    expect(dashboardSchema?.['lightdom:linkedSchemas']).toBeDefined();
    expect(Array.isArray(dashboardSchema?.['lightdom:linkedSchemas'])).toBe(true);
    expect(dashboardSchema?.['lightdom:linkedSchemas'].length).toBeGreaterThan(0);
  });
});
