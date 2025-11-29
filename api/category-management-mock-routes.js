/**
 * Category Management API Routes - Mock Version (No DB Required)
 * Provides endpoints for managing categories without database dependency
 */

import express from 'express';

const router = express.Router();

// In-memory mock data
let mockCategories = [
  {
    id: 1,
    category_id: 'workflows',
    name: 'workflows',
    display_name: 'Workflows',
    description: 'Workflow automation and orchestration',
    category_type: 'workflow',
    auto_generate_crud_api: true,
    status: 'active',
    icon: '🔄',
    color: '#1890ff',
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'system',
  },
  {
    id: 2,
    category_id: 'services',
    name: 'services',
    display_name: 'Services',
    description: 'Microservices and API services',
    category_type: 'service',
    auto_generate_crud_api: true,
    status: 'active',
    icon: '⚙️',
    color: '#52c41a',
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'system',
  },
  {
    id: 3,
    category_id: 'scrapers',
    name: 'scrapers',
    display_name: 'Scrapers',
    description: 'Web scraping and data extraction',
    category_type: 'scraper',
    auto_generate_crud_api: true,
    status: 'active',
    icon: '🕷️',
    color: '#722ed1',
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'system',
  },
];

let nextId = 4;

const mockStatistics = [
  {
    category_id: 'workflows',
    name: 'workflows',
    display_name: 'Workflows',
    category_type: 'workflow',
    status: 'active',
    total_items: 12,
    total_api_routes: 5,
    auto_generate_crud_api: true,
    created_at: new Date().toISOString(),
  },
  {
    category_id: 'services',
    name: 'services',
    display_name: 'Services',
    category_type: 'service',
    status: 'active',
    total_items: 8,
    total_api_routes: 5,
    auto_generate_crud_api: true,
    created_at: new Date().toISOString(),
  },
  {
    category_id: 'scrapers',
    name: 'scrapers',
    display_name: 'Scrapers',
    category_type: 'scraper',
    status: 'active',
    total_items: 5,
    total_api_routes: 5,
    auto_generate_crud_api: true,
    created_at: new Date().toISOString(),
  },
];

/**
 * Create category management routes (mock version)
 */
export function createCategoryManagementRoutesMock() {
  
  // List all categories
  router.get('/categories', async (req, res) => {
    try {
      const { type, status = 'active' } = req.query;
      
      let filtered = [...mockCategories];
      
      if (type) {
        filtered = filtered.filter(c => c.category_type === type);
      }
      
      if (status) {
        filtered = filtered.filter(c => c.status === status);
      }
      
      filtered.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
      
      res.json({
        success: true,
        data: filtered,
        count: filtered.length
      });
    } catch (error) {
      console.error('Error listing categories:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get category by ID
  router.get('/categories/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const category = mockCategories.find(c => c.category_id === id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }
      
      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Error getting category:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Create a new category
  router.post('/categories', async (req, res) => {
    try {
      const {
        name,
        display_name,
        description,
        category_type,
        auto_generate_crud_api = true,
        icon,
        color,
        sort_order = 0,
        created_by = 'system'
      } = req.body;
      
      // Validate required fields
      if (!name || !display_name || !category_type) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: name, display_name, category_type'
        });
      }
      
      // Generate category ID
      const category_id = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      
      // Check if category already exists
      if (mockCategories.find(c => c.category_id === category_id)) {
        return res.status(409).json({
          success: false,
          error: 'Category with this name already exists'
        });
      }
      
      const newCategory = {
        id: nextId++,
        category_id,
        name,
        display_name,
        description: description || null,
        category_type,
        auto_generate_crud_api,
        icon: icon || null,
        color: color || null,
        sort_order,
        status: 'active',
        created_by,
        updated_by: created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      mockCategories.push(newCategory);
      
      res.status(201).json({
        success: true,
        data: newCategory,
        message: `Category "${display_name}" created successfully${auto_generate_crud_api ? ' with auto-generated CRUD API' : ''}`
      });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Update a category
  router.put('/categories/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const {
        display_name,
        description,
        auto_generate_crud_api,
        status,
        icon,
        color,
        sort_order,
        updated_by = 'system'
      } = req.body;
      
      const categoryIndex = mockCategories.findIndex(c => c.category_id === id);
      
      if (categoryIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }
      
      const category = mockCategories[categoryIndex];
      
      // Update fields
      if (display_name !== undefined) category.display_name = display_name;
      if (description !== undefined) category.description = description;
      if (auto_generate_crud_api !== undefined) category.auto_generate_crud_api = auto_generate_crud_api;
      if (status !== undefined) category.status = status;
      if (icon !== undefined) category.icon = icon;
      if (color !== undefined) category.color = color;
      if (sort_order !== undefined) category.sort_order = sort_order;
      category.updated_by = updated_by;
      category.updated_at = new Date().toISOString();
      
      mockCategories[categoryIndex] = category;
      
      res.json({
        success: true,
        data: category,
        message: 'Category updated successfully'
      });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Delete a category
  router.delete('/categories/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const categoryIndex = mockCategories.findIndex(c => c.category_id === id);
      
      if (categoryIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }
      
      const deleted = mockCategories.splice(categoryIndex, 1)[0];
      
      res.json({
        success: true,
        message: 'Category deleted successfully',
        data: deleted
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get all auto-generated routes
  router.get('/routes', async (req, res) => {
    try {
      const routes = mockCategories
        .filter(c => c.auto_generate_crud_api)
        .map(c => ({
          category_id: c.category_id,
          base_path: `/api/categories/${c.name}`,
          endpoints: ['GET', 'POST', 'PUT', 'DELETE'],
          status: 'active'
        }));
      
      res.json({
        success: true,
        data: routes,
        count: routes.length
      });
    } catch (error) {
      console.error('Error getting routes:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Regenerate all auto-CRUD routes
  router.post('/routes/regenerate', async (req, res) => {
    try {
      res.json({
        success: true,
        message: 'Routes regenerated successfully',
        count: mockCategories.filter(c => c.auto_generate_crud_api).length
      });
    } catch (error) {
      console.error('Error regenerating routes:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get category statistics
  router.get('/statistics', async (req, res) => {
    try {
      res.json({
        success: true,
        data: mockStatistics
      });
    } catch (error) {
      console.error('Error getting statistics:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get system configuration
  router.get('/config', async (req, res) => {
    try {
      const config = {
        auto_crud_generation: {
          enabled: true,
          auto_mount: true,
          regenerate_on_update: true
        },
        swagger_integration: {
          enabled: true,
          auto_document: true,
          ui_path: '/api-docs'
        }
      };
      
      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Error getting config:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

export default createCategoryManagementRoutesMock;
