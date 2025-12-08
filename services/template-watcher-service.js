import chokidar from 'chokidar';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const DEFAULT_DIRECTORIES = [
  path.resolve(process.cwd(), 'n8n', 'templates'),
  path.resolve(process.cwd(), 'schemas', 'workflow-templates'),
];

function slugify(value, fallback = 'item') {
  if (!value) return fallback;
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '') || fallback;
}

function normalizeSubcategory(subcategory) {
  if (!subcategory) return '';
  return subcategory.toString().trim();
}

export class TemplateWatcherService {
  constructor({ db, io, directories = DEFAULT_DIRECTORIES, logger = console } = {}) {
    this.db = db;
    this.io = io;
    this.directories = directories;
    this.logger = logger;
    this.watcher = null;
    this.tablesEnsured = false;
  }

  async start() {
    if (this.watcher) {
      return;
    }

    const existingDirs = [];
    for (const dir of this.directories) {
      try {
        if (existsSync(dir)) {
          const stat = await fs.stat(dir);
          if (stat.isDirectory()) {
            existingDirs.push(dir);
          }
        }
      } catch (error) {
        this.logger.warn(`TemplateWatcherService: unable to access directory ${dir}:`, error.message || error);
      }
    }

    if (existingDirs.length === 0) {
      this.logger.warn('TemplateWatcherService: no template directories found to watch');
      return;
    }

    await this.ensureTables();

    this.watcher = chokidar.watch(existingDirs, {
      ignoreInitial: false,
      depth: 5,
      awaitWriteFinish: {
        stabilityThreshold: 250,
        pollInterval: 100,
      },
    });

    this.watcher
      .on('add', (filePath) => this.handleFileEvent('add', filePath))
      .on('change', (filePath) => this.handleFileEvent('change', filePath))
      .on('unlink', (filePath) => this.handleFileEvent('unlink', filePath))
      .on('error', (error) => {
        this.logger.error('TemplateWatcherService: watcher error', error);
      });

    this.logger.log(`TemplateWatcherService: watching directories:\n - ${existingDirs.join('\n - ')}`);
  }

  async stop() {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
  }

  async ensureTables() {
    if (this.tablesEnsured || !this.db || typeof this.db.query !== 'function') {
      return;
    }

    const createCategoriesTable = `
      CREATE TABLE IF NOT EXISTS admin_nav_categories (
        category_id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        subcategory TEXT DEFAULT '',
        icon TEXT,
        sort_order INTEGER DEFAULT 0,
        schema_version TEXT,
        knowledge_graph_attributes JSONB DEFAULT '{}'::jsonb,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (category, subcategory)
      );
    `;

    const createTemplatesTable = `
      CREATE TABLE IF NOT EXISTS admin_nav_templates (
        template_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        subcategory TEXT DEFAULT '',
        icon TEXT,
        sort_order INTEGER DEFAULT 0,
        schema_version TEXT,
        knowledge_graph_attributes JSONB DEFAULT '{}'::jsonb,
        status_steps JSONB DEFAULT '[]'::jsonb,
        workflow_summary JSONB DEFAULT '{}'::jsonb,
        source_path TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    try {
      await this.db.query(createCategoriesTable);
      await this.db.query(createTemplatesTable);
      this.tablesEnsured = true;
      this.logger.log('TemplateWatcherService: admin navigation tables ensured');
    } catch (error) {
      this.logger.error('TemplateWatcherService: failed to ensure tables', error);
    }
  }

  async handleFileEvent(event, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext !== '.json') {
      return;
    }

    try {
      if (event === 'unlink') {
        await this.markTemplateInactive(filePath);
      } else {
        const metadata = await this.parseTemplate(filePath);
        if (metadata) {
          await this.upsertCategory(metadata);
          await this.upsertTemplate(metadata, filePath);
          this.emitEvent('template-upserted', metadata);
        }
      }
    } catch (error) {
      this.logger.error(`TemplateWatcherService: failed to process ${event} for ${filePath}`, error);
    }
  }

  async markTemplateInactive(filePath) {
    if (!this.db) return;

    const templateId = slugify(path.basename(filePath, path.extname(filePath)));

    try {
      await this.db.query(
        `UPDATE admin_nav_templates SET is_active = FALSE, updated_at = NOW() WHERE template_id = $1`,
        [templateId]
      );
      this.emitEvent('template-removed', { templateId, sourcePath: filePath });
      this.logger.log(`TemplateWatcherService: marked template ${templateId} as inactive`);
    } catch (error) {
      this.logger.error('TemplateWatcherService: failed to mark template inactive', error);
    }
  }

  async upsertCategory(metadata) {
    if (!this.db) return;

    const categorySlug = slugify(metadata.category, 'general');
    const subcategoryNormalized = normalizeSubcategory(metadata.subcategory);
    const categoryId = subcategoryNormalized
      ? `${categorySlug}-${slugify(subcategoryNormalized)}`
      : categorySlug;

    try {
      await this.db.query(
        `INSERT INTO admin_nav_categories (
          category_id, category, subcategory, icon, sort_order, schema_version,
          knowledge_graph_attributes, is_active, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, NOW())
        ON CONFLICT (category, subcategory)
        DO UPDATE SET
          icon = EXCLUDED.icon,
          sort_order = EXCLUDED.sort_order,
          schema_version = EXCLUDED.schema_version,
          knowledge_graph_attributes = EXCLUDED.knowledge_graph_attributes,
          is_active = TRUE,
          updated_at = NOW()
      `,
        [
          categoryId,
          metadata.category,
          subcategoryNormalized,
          metadata.icon || null,
          metadata.sortOrder ?? 0,
          metadata.schemaVersion || '1.0.0',
          JSON.stringify(metadata.knowledgeGraphAttributes || {}),
        ]
      );
    } catch (error) {
      this.logger.error('TemplateWatcherService: failed to upsert category', error);
    }
  }

  async upsertTemplate(metadata, filePath) {
    if (!this.db) return;

    const templateId = metadata.templateId || slugify(path.basename(filePath, path.extname(filePath)));

    try {
      await this.db.query(
        `INSERT INTO admin_nav_templates (
          template_id, name, description, category, subcategory, icon, sort_order,
          schema_version, knowledge_graph_attributes, status_steps, workflow_summary,
          source_path, is_active, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, TRUE, NOW())
        ON CONFLICT (template_id)
        DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          subcategory = EXCLUDED.subcategory,
          icon = EXCLUDED.icon,
          sort_order = EXCLUDED.sort_order,
          schema_version = EXCLUDED.schema_version,
          knowledge_graph_attributes = EXCLUDED.knowledge_graph_attributes,
          status_steps = EXCLUDED.status_steps,
          workflow_summary = EXCLUDED.workflow_summary,
          source_path = EXCLUDED.source_path,
          is_active = TRUE,
          updated_at = NOW()
      `,
        [
          templateId,
          metadata.name || metadata.templateId || templateId,
          metadata.description || null,
          metadata.category,
          normalizeSubcategory(metadata.subcategory),
          metadata.icon || null,
          metadata.sortOrder ?? 0,
          metadata.schemaVersion || '1.0.0',
          JSON.stringify(metadata.knowledgeGraphAttributes || {}),
          JSON.stringify(metadata.statusSteps || []),
          JSON.stringify(metadata.workflowSummary || {}),
          filePath,
        ]
      );
    } catch (error) {
      this.logger.error('TemplateWatcherService: failed to upsert template', error);
    }
  }

  async parseTemplate(filePath) {
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(raw);
      const meta = data.metadata || {};
      const nav = meta.navigation || data.navigation || {};
      const workflow = data.workflow || data;

      const category = nav.category || data.category || 'General';
      const subcategory = nav.subcategory || nav.subCategory || data.subcategory || null;
      const icon = nav.icon || data.icon || null;
      const sortOrder = nav.sortOrder ?? nav.order ?? data.sortOrder ?? 0;
      const schemaVersion = data.schemaVersion || data.version || meta.schemaVersion || '1.0.0';
      const templateId = data.id || data.templateId || meta.templateId || slugify(path.basename(filePath, path.extname(filePath)));

      const attributes = workflow.attributes || data.attributes || [];
      const stepsSource = workflow.tasks || workflow.steps || [];
      const statusSteps = Array.isArray(stepsSource)
        ? stepsSource.map((step, index) => ({
            index,
            id: step.id || step.taskId || slugify(step.name || step.label || `step-${index + 1}`),
            title: step.name || step.label || `Step ${index + 1}`,
            description: step.description || '',
            status: step.status || 'pending',
          }))
        : [];

      const knowledgeGraphAttributes = {
        attributes,
        tags: data.tags || meta.tags || [],
        category,
        subcategory,
        schemaVersion,
        icon,
        workflowAttributes: workflow.attributeMappings || workflow.attribute_mappings || null,
      };

      const workflowSummary = {
        stepCount: statusSteps.length,
        lastUpdated: new Date().toISOString(),
        lastChangedBy: meta.lastChangedBy || 'template-watcher',
      };

      return {
        templateId,
        name: data.name || workflow.name || templateId,
        description: data.description || workflow.description || meta.description || null,
        category,
        subcategory,
        icon,
        sortOrder,
        schemaVersion,
        knowledgeGraphAttributes,
        statusSteps,
        workflowSummary,
      };
    } catch (error) {
      this.logger.error(`TemplateWatcherService: failed to parse template at ${filePath}`, error);
      return null;
    }
  }

  emitEvent(event, payload) {
    if (!this.io) {
      return;
    }

    try {
      this.io.emit('admin-nav:update', {
        event,
        payload,
        timestamp: new Date().toISOString(),
        source: 'template-watcher',
      });
    } catch (error) {
      this.logger.error('TemplateWatcherService: failed to emit Socket.IO event', error);
    }
  }
}

export default TemplateWatcherService;
