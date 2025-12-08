#!/usr/bin/env node

/**
 * Styleguide Library Crawler Seeder
 *
 * Seeds Radix UI documentation into the crawler_campaigns tables and
 * generates a frontend registry for Storybook/design system automation.
 */

import fs from 'fs/promises';
import crypto from 'node:crypto';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..');

const DEFAULT_DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'dom_space_harvester',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

function slugify(value, fallback = 'item') {
  if (!value) return fallback;
  return (
    value
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '') || fallback
  );
}

async function loadCatalog() {
  const catalogPath = path.join(__dirname, 'radix-component-catalog.json');
  const raw = await fs.readFile(catalogPath, 'utf-8');
  const entries = JSON.parse(raw);
  return entries.map(entry => ({
    slug: entry.name,
    name: entry.displayName,
    category: entry.category,
    docUrl: entry.docUrl,
    radixPackage: entry.radixPackage,
    tags: entry.tags || [],
  }));
}

function buildLibraryDefinition(components) {
  const now = new Date();
  const version = `${now.getUTCFullYear()}.${String(now.getUTCMonth() + 1).padStart(2, '0')}.${String(
    now.getUTCDate()
  ).padStart(2, '0')}`;

  const uniqueSeedUrls = Array.from(
    new Set(
      components
        .map(component => component.docUrl)
        .filter(Boolean)
        .concat([
          'https://www.radix-ui.com/primitives/docs/overview/introduction',
          'https://www.radix-ui.com/primitives/docs/components/overview',
        ])
    )
  );

  return {
    name: 'Radix UI',
    slug: 'radix-ui',
    baseUrl: 'https://www.radix-ui.com',
    docIndexUrl: 'https://www.radix-ui.com/primitives/docs/components/overview',
    storybookUrl: 'https://www.radix-ui.com/primitives/docs/overview/getting-started',
    version,
    topics: ['component-library', 'radix', 'design-system-mining'],
    components,
    seedUrls: uniqueSeedUrls,
  };
}

async function ensureStyleguideSchema(client, library) {
  const schemaData = {
    library: library.name,
    slug: library.slug,
    baseUrl: library.baseUrl,
    docIndexUrl: library.docIndexUrl,
    version: library.version,
    componentCount: library.components.length,
    components: library.components.map(component => ({
      name: component.name,
      slug: component.slug,
      docUrl: component.docUrl,
      category: component.category,
      radixPackage: component.radixPackage,
      tags: component.tags,
    })),
    topics: library.topics,
    automation: {
      campaignId: `styleguide-${library.slug}`,
      ragStreamEndpoint: '/api/rag/chat/stream',
      parallelAttributeStreams: Number(process.env.RADIX_ATTRIBUTE_STREAMS || 4),
    },
    lastSyncedAt: new Date().toISOString(),
  };

  const existing = await client.query('SELECT id FROM styleguide_schemas WHERE name = $1', [
    library.name,
  ]);

  if (existing.rowCount > 0) {
    const id = existing.rows[0].id;
    await client.query(
      `UPDATE styleguide_schemas
         SET version = $1,
             schema_data = $2::jsonb,
             storybook_url = $3,
             last_mined_at = NOW(),
             is_active = TRUE
       WHERE id = $4`,
      [library.version, JSON.stringify(schemaData), library.storybookUrl, id]
    );
    return id;
  }

  const id = crypto.randomUUID();
  await client.query(
    `INSERT INTO styleguide_schemas (id, name, version, schema_data, storybook_url, last_mined_at, is_active)
     VALUES ($1, $2, $3, $4::jsonb, $5, NOW(), TRUE)`,
    [id, library.name, library.version, JSON.stringify(schemaData), library.storybookUrl]
  );
  return id;
}

function buildCrawlerPrompt(library) {
  return [
    `You are coordinating the LightDom styleguide crawler for ${library.name}.`,
    'Harvest component APIs, accessibility notes, design tokens, and cross-links from each seeded documentation URL.',
    'Stream per-component attribute enrichments via the /api/rag/chat/stream endpoint using the `attributeConfigs` payload,',
    'ensuring parallel processing without overwhelming the provider.',
    'Return structured summaries that map to our design system taxonomy (Atoms > Molecules > Organisms).',
  ].join(' ');
}

function buildCrawlerWorkflow(library) {
  return {
    version: '1.0',
    topic: 'styleguide-component-mining',
    steps: [
      { name: 'fetch-docs', type: 'crawler', concurrency: 4 },
      { name: 'parse-components', type: 'parser', extractor: 'styleguide-property-scraper' },
      { name: 'rag-attribute-stream', type: 'rag', endpoint: '/api/rag/chat/stream' },
      { name: 'persist-styleguide', type: 'database', table: 'component_patterns' },
    ],
  };
}

function buildCrawlerConfiguration(library) {
  return {
    topic: 'styleguide-component-mining',
    library: library.name,
    allowedDomains: [new URL(library.baseUrl).hostname],
    parallelAttributeStreams: Number(process.env.RADIX_ATTRIBUTE_STREAMS || 4),
    rag: {
      streamEndpoint: '/api/rag/chat/stream',
      attributePayloadTemplate: {
        attributeConfigs: [],
      },
    },
    crawler: {
      maxDepth: 3,
      respectRobots: true,
      userAgent: 'LightDomStyleguideSeeder/1.0',
    },
  };
}

function buildCrawlerSchema(library) {
  return {
    componentFields: ['name', 'slug', 'category', 'docUrl', 'radixPackage', 'tags'],
    taxonomy: {
      atoms: library.components.filter(component => component.category),
    },
  };
}

function buildSeeds(library) {
  return library.seedUrls.map(url => ({
    url,
    type: 'documentation',
    topic: library.slug,
    priority: 7,
    refresh: 'daily',
  }));
}

async function ensureCrawlerCampaign(client, library) {
  const campaignId = `styleguide-${slugify(library.slug)}`;
  const workflow = buildCrawlerWorkflow(library);
  const configuration = buildCrawlerConfiguration(library);
  const schema = buildCrawlerSchema(library);
  const seeds = buildSeeds(library);
  const prompt = buildCrawlerPrompt(library);
  const description = `${library.name} component library mining campaign`;
  const schedule = { frequency: 'daily', time: '03:00', enabled: true };

  await client.query(
    `INSERT INTO crawler_campaigns (
        id, name, description, client_site_url, prompt, status,
        workflow, seeds, schema, configuration, schedule, analytics
     ) VALUES (
        $1, $2, $3, $4, $5, 'created',
        $6::jsonb, $7::jsonb, $8::jsonb, $9::jsonb, $10::jsonb,
        $11::jsonb
     )
     ON CONFLICT (id)
     DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        client_site_url = EXCLUDED.client_site_url,
        prompt = EXCLUDED.prompt,
        workflow = EXCLUDED.workflow,
        seeds = EXCLUDED.seeds,
        schema = EXCLUDED.schema,
        configuration = EXCLUDED.configuration,
        schedule = EXCLUDED.schedule,
        updated_at = CURRENT_TIMESTAMP`,
    [
      campaignId,
      `${library.name} Component Library Mining`,
      description,
      library.baseUrl,
      prompt,
      JSON.stringify(workflow),
      JSON.stringify(seeds),
      JSON.stringify(schema),
      JSON.stringify(configuration),
      JSON.stringify(schedule),
      JSON.stringify({ totalPages: 0, pagesProcessed: 0, errorCount: 0, successRate: 100 }),
    ]
  );

  return campaignId;
}

async function ensureCrawlTargets(client, library, campaignId) {
  const domain = new URL(library.baseUrl).hostname;
  let inserted = 0;

  for (const component of library.components) {
    if (!component.docUrl) continue;

    const existing = await client.query(
      'SELECT id FROM crawl_targets WHERE campaign_id = $1 AND url = $2 LIMIT 1',
      [campaignId, component.docUrl]
    );

    if (existing.rowCount > 0) {
      continue;
    }

    await client.query(
      `INSERT INTO crawl_targets (
         campaign_id, url, domain, category, priority, status, schema_key
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        campaignId,
        component.docUrl,
        domain,
        component.category ? component.category.toLowerCase() : null,
        7,
        'pending',
        library.slug,
      ]
    );

    inserted += 1;
  }

  return inserted;
}

async function writeFrontendRegistry(library) {
  const outputDir = path.join(projectRoot, 'frontend', 'src', 'data');
  await fs.mkdir(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, 'radix-components.generated.ts');

  const descriptor = library.components
    .map(component => ({
      name: component.name,
      slug: component.slug,
      category: component.category,
      docUrl: component.docUrl,
      radixPackage: component.radixPackage,
      tags: component.tags,
      topic: library.slug,
      status: 'seeded',
      lastUpdated: new Date().toISOString(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const header = `// Automatically generated by scripts/styleguide/styleguide-library-crawler.js
// Do not edit manually.

import type { RadixComponentDescriptor } from '@/components/ui/radix/types';

export const RADIX_COMPONENTS: RadixComponentDescriptor[] = ${JSON.stringify(descriptor, null, 2)};
`;

  await fs.writeFile(outputPath, header, 'utf-8');
  return outputPath;
}

async function updateDesignStyleguide(library) {
  const designPath = path.join(projectRoot, 'design', 'styleguide.json');
  const raw = await fs.readFile(designPath, 'utf-8');
  const data = JSON.parse(raw);

  if (!data.components) {
    data.components = {};
  }

  if (!Array.isArray(data.components.sources)) {
    data.components.sources = [];
  }

  const sources = data.components.sources.filter(source => source.slug !== library.slug);
  sources.push({
    name: library.name,
    slug: library.slug,
    topic: 'styleguide-component-mining',
    campaignId: `styleguide-${library.slug}`,
    docIndexUrl: library.docIndexUrl,
    seedCount: library.seedUrls.length,
    componentCount: library.components.length,
    version: library.version,
    lastSeededAt: new Date().toISOString(),
  });

  data.components.sources = sources;

  await fs.writeFile(designPath, JSON.stringify(data, null, 2));
  return designPath;
}

async function main() {
  console.log('📚 Seeding Radix UI styleguide campaign...');

  const components = await loadCatalog();
  const library = buildLibraryDefinition(components);

  const pool = new Pool(DEFAULT_DB_CONFIG);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const schemaId = await ensureStyleguideSchema(client, library);
    const campaignId = await ensureCrawlerCampaign(client, library);
    const newTargets = await ensureCrawlTargets(client, library, campaignId);

    await client.query('COMMIT');

    const registryPath = await writeFrontendRegistry(library);
    const designPath = await updateDesignStyleguide(library);

    console.log('✅ Styleguide schema ID:', schemaId);
    console.log('✅ Crawler campaign ID:', campaignId);
    console.log('✅ New crawl targets queued:', newTargets);
    console.log('🗂️  Registry written to:', path.relative(projectRoot, registryPath));
    console.log('🗂️  Design styleguide updated:', path.relative(projectRoot, designPath));
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}
