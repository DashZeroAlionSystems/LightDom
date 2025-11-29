import express from 'express';

export function createAdminNavigationRoutes(db) {
  const router = express.Router();

  router.get('/navigation', async (req, res) => {
    try {
      const { rows: categories } = await db.query(
        `SELECT category_id, category, subcategory, icon, sort_order, schema_version,
                knowledge_graph_attributes, is_active, created_at, updated_at
           FROM admin_nav_categories
          WHERE is_active = TRUE
          ORDER BY sort_order ASC, category ASC, subcategory ASC`
      );

      const { rows: templates } = await db.query(
        `SELECT template_id, name, description, category, subcategory, icon, sort_order,
                schema_version, knowledge_graph_attributes, status_steps, workflow_summary,
                source_path, is_active, created_at, updated_at
           FROM admin_nav_templates
          WHERE is_active = TRUE
          ORDER BY sort_order ASC, name ASC`
      );

      const grouped = categories.map((category) => {
        const categoryTemplates = templates.filter(
          (template) =>
            template.category === category.category &&
            (template.subcategory || '') === (category.subcategory || '')
        );

        const subcategories = categoryTemplates.reduce((acc, template) => {
          const normalized = template.subcategory || '';
          if (!acc[normalized]) {
            acc[normalized] = [];
          }
          acc[normalized].push(template);
          return acc;
        }, {});

        return {
          ...category,
          templates: categoryTemplates,
          subcategories,
        };
      });

      res.json({
        success: true,
        categories: grouped,
      });
    } catch (error) {
      console.error('Admin navigation query failed:', error);
      res.status(500).json({ success: false, error: 'Failed to load admin navigation' });
    }
  });

  return router;
}

export default function createRouter(db) {
  return createAdminNavigationRoutes(db);
}
