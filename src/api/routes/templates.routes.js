import { Router } from 'express';
import { readFile, readdir, stat } from 'fs/promises';
import yaml from 'js-yaml';
import { join, relative } from 'path';
// Optional n8n adapter: if present, we can import scanned templates into n8n
let n8nService = null;
try {
  // eslint-disable-next-line import/no-unresolved, node/no-missing-import
  n8nService = await import('../../services/n8n-workflow-creator.js')
    .then(m => m.default)
    .catch(() => null);
} catch (e) {
  // ignore if n8n adapter not available in environment
  n8nService = null;
}

function ensureArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return [v];
}

async function scanDirForTemplates(baseDir) {
  const results = [];

  async function walk(dir) {
    let entries = [];
    try {
      entries = await readdir(dir);
    } catch (e) {
      return;
    }

    for (const name of entries) {
      const full = join(dir, name);
      let s;
      try {
        s = await stat(full);
      } catch (e) {
        continue;
      }

      if (s.isDirectory()) {
        await walk(full);
      } else if (s.isFile()) {
        const ext = name.split('.').pop()?.toLowerCase();
        if (!['json', 'yml', 'yaml'].includes(ext)) continue;

        try {
          const raw = await readFile(full, 'utf-8');
          let parsed = null;
          if (ext === 'json') parsed = JSON.parse(raw);
          else parsed = yaml.load(raw);

          const arr = [];
          if (Array.isArray(parsed)) arr.push(...parsed);
          else if (parsed && parsed.templates && Array.isArray(parsed.templates))
            arr.push(...parsed.templates);
          else if (parsed && (parsed.id || parsed.workflow)) arr.push(parsed);

          for (const t of arr) {
            if (!t) continue;
            const id = t.id || `tmpl_${Math.random().toString(36).slice(2, 9)}`;
            const rel = relative(baseDir, full).split(/[\\/]/).filter(Boolean);
            const category =
              t.category || (rel.length > 1 ? rel[rel.length - 2] : rel[0]) || 'default';
            results.push({
              id,
              name: t.name || t.workflow?.name || id,
              category,
              path: full,
              content: t,
            });
          }
        } catch (e) {
          // ignore parse errors
        }
      }
    }
  }

  await walk(baseDir);
  return results;
}

// Export scanner for programmatic use (e.g., server startup watchers)
export { scanDirForTemplates };

export function createTemplatesRoutes(db) {
  const router = Router();

  // GET /api/templates - list templates from JSON manifest and n8n/templates dir
  router.get('/', async (req, res) => {
    try {
      const baseDir = join(process.cwd(), 'n8n/templates');
      const filePath = join(process.cwd(), 'workflows/deepseek-workflow-templates.json');
      const templatesMap = new Map();

      // Load manifest file if exists
      try {
        const raw = await readFile(filePath, 'utf-8');
        const data = JSON.parse(raw);
        const list = Array.isArray(data.templates) ? data.templates : [];
        for (const t of list) {
          if (!t) continue;
          const id = t.id || `tmpl_${Math.random().toString(36).slice(2, 9)}`;
          templatesMap.set(id, {
            id,
            name: t.name || id,
            category: t.category || 'default',
            content: t,
            path: filePath,
          });
        }
      } catch (e) {
        // ignore missing file
      }

      // Scan directory
      const scanned = await scanDirForTemplates(baseDir).catch(() => []);
      for (const s of scanned) {
        templatesMap.set(s.id, s);
      }

      // Optional filter by category
      const category = req.query.category;
      let result = Array.from(templatesMap.values());
      if (category) result = result.filter(t => t.category === category);

      res.json({ success: true, templates: result });
    } catch (error) {
      console.error('Failed to list templates:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/templates - create a lightweight category/template record (best-effort)
  router.post('/', async (req, res) => {
    try {
      const body = req.body || {};
      const id = body.id || `cat_${Math.random().toString(36).slice(2, 9)}`;

      if (db) {
        try {
          await db.query(
            `CREATE TABLE IF NOT EXISTS workflow_templates (id TEXT PRIMARY KEY, name TEXT, category TEXT, path TEXT, content JSONB, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`
          );
          await db.query(
            `INSERT INTO workflow_templates (id, name, category, path, content, updated_at) VALUES ($1,$2,$3,$4,$5,NOW()) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, category=EXCLUDED.category, path=EXCLUDED.path, content=EXCLUDED.content, updated_at=NOW()`,
            [id, body.name || null, body.category || 'category', null, JSON.stringify(body)]
          );
        } catch (e) {
          console.warn('Failed to persist new template/category to DB:', e.message || e);
        }
      }

      res.status(201).json({ success: true, id, data: body });
    } catch (error) {
      console.error('Failed to create template/category:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // PUT /api/templates/:id - update metadata
  router.put('/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const body = req.body || {};

      if (db) {
        try {
          await db.query(
            `INSERT INTO workflow_templates (id, name, category, path, content, updated_at) VALUES ($1,$2,$3,$4,$5,NOW()) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, category=EXCLUDED.category, path=EXCLUDED.path, content=EXCLUDED.content, updated_at=NOW()`,
            [id, body.name || null, body.category || null, null, JSON.stringify(body)]
          );
        } catch (e) {
          console.warn('Failed to upsert template metadata to DB:', e.message || e);
        }
      }

      res.json({ success: true, id, data: body });
    } catch (error) {
      console.error('Failed to update template/category:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // DELETE /api/templates/:id - delete a template/category
  router.delete('/:id', async (req, res) => {
    try {
      const id = req.params.id;
      if (db) {
        try {
          await db.query(`DELETE FROM workflow_templates WHERE id = $1`, [id]);
        } catch (e) {
          console.warn('Failed to delete template from DB:', e.message || e);
        }
      }
      res.json({ success: true, id });
    } catch (error) {
      console.error('Failed to delete template/category:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /api/templates/meta/categories
  // GET /api/templates/meta/categories
  // Returns an array of full Category objects (id, name, description, services, workflows)
  router.get('/meta/categories', async (req, res) => {
    try {
      const baseDir = join(process.cwd(), 'n8n/templates');
      const scanned = await scanDirForTemplates(baseDir).catch(() => []);

      // Also include templates from the manifest file if present
      const filePath = join(process.cwd(), 'workflows/deepseek-workflow-templates.json');
      try {
        const raw = await readFile(filePath, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.templates)) {
          for (const t of data.templates) {
            scanned.push({
              id: t.id || `tmpl_${Math.random().toString(36).slice(2, 9)}`,
              name: t.name || t.workflow?.name || 'template',
              category: t.category || 'default',
              path: filePath,
              content: t,
            });
          }
        }
      } catch (e) {
        // ignore
      }

      const cats = new Map();
      for (const tpl of scanned) {
        const cat = tpl.category || 'default';
        if (!cats.has(cat)) {
          cats.set(cat, {
            id: `cat_${cat}`,
            name: String(cat)
              .replace(/[-_]/g, ' ')
              .replace(/\b\w/g, ch => ch.toUpperCase()),
            description: '',
            services: [
              {
                id: 'svc-n8n',
                name: 'n8n (orchestrator)',
                baseEndpoint: '/api/n8n',
                isEnabled: true,
              },
            ],
            workflows: [],
            tags: [],
            created_at: new Date().toISOString(),
          });
        }

        const entry = cats.get(cat);
        entry.workflows.push({
          id: tpl.id,
          name: tpl.name || tpl.content?.name || tpl.id,
          isTemplate: true,
        });
      }

      res.json(Array.from(cats.values()));
    } catch (error) {
      console.error('Failed to list template categories:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/templates/scan - trigger a manual scan and optionally persist to DB
  router.post('/scan', async (req, res) => {
    try {
      const baseDir = join(process.cwd(), 'n8n/templates');
      const scanned = await scanDirForTemplates(baseDir).catch(() => []);

      // Optionally import to n8n if requested by client (e.g., { importToN8N: true })
      const importToN8N = req.body && req.body.importToN8N === true;

      if (db) {
        try {
          await db.query(
            `CREATE TABLE IF NOT EXISTS workflow_templates (id TEXT PRIMARY KEY, name TEXT, category TEXT, path TEXT, content JSONB, n8n_workflow_id TEXT NULL, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`
          );
          for (const s of scanned) {
            // If import requested and adapter is available, attempt import and store mapping
            let n8nId = null;
            if (importToN8N && n8nService) {
              try {
                const created = await n8nService.createWorkflowFromSchema(s.content || {}, {
                  name: s.name,
                });
                // created may be an object or array depending on n8n version
                n8nId =
                  created && (created.id || created.data?.id || created.workflow?.id)
                    ? created.id || created.data?.id || created.workflow?.id
                    : null;
              } catch (e) {
                console.warn('Failed to import template to n8n for', s.id, e.message || e);
              }
            }

            await db.query(
              `INSERT INTO workflow_templates (id, name, category, path, content, n8n_workflow_id, updated_at) VALUES ($1,$2,$3,$4,$5,$6,NOW()) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, category=EXCLUDED.category, path=EXCLUDED.path, content=EXCLUDED.content, n8n_workflow_id=EXCLUDED.n8n_workflow_id, updated_at=NOW()`,
              [s.id, s.name, s.category, s.path, JSON.stringify(s.content), n8nId]
            );
          }
        } catch (e) {
          console.warn('Failed to persist templates to DB:', e.message || e);
        }
      }

      res.json({ success: true, scanned: scanned.length });
    } catch (error) {
      console.error('Failed to scan templates:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

export default createTemplatesRoutes;
