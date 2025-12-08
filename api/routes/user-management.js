/**
 * User Management API Routes
 * Comprehensive CRUD endpoints for user, role, and plan management
 * Created: 2025-11-06
 */

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * Middleware to authenticate requests
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'lightdom-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

/**
 * Middleware to check admin permissions
 */
const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { rows } = await req.db.query(
      `SELECT ur.role_name FROM users u 
       JOIN user_roles ur ON u.role_id = ur.id 
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (rows.length === 0 || rows[0].role_name !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Failed to verify permissions' });
  }
};

/**
 * Initialize routes with database connection
 */
export default function createUserRoutes(db) {
  // Attach database to requests
  router.use((req, res, next) => {
    req.db = db;
    next();
  });

  // =========================================================================
  // USER CRUD ENDPOINTS
  // =========================================================================

  /**
   * GET /api/users
   * List all users with pagination and filtering
   */
  router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        role = '',
        plan = '',
        status = '',
        sort = 'created_at',
        order = 'DESC'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      // Build WHERE clause
      const conditions = ['u.deleted_at IS NULL'];
      const params = [];
      let paramCount = 1;

      if (search) {
        conditions.push(`(u.email ILIKE $${paramCount} OR u.username ILIKE $${paramCount} OR u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount})`);
        params.push(`%${search}%`);
        paramCount++;
      }

      if (role) {
        conditions.push(`ur.role_name = $${paramCount}`);
        params.push(role);
        paramCount++;
      }

      if (plan) {
        conditions.push(`up.plan_name = $${paramCount}`);
        params.push(plan);
        paramCount++;
      }

      if (status) {
        conditions.push(`u.account_status = $${paramCount}`);
        params.push(status);
        paramCount++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
      // Validate sort column to prevent SQL injection
      const validSortColumns = ['created_at', 'updated_at', 'email', 'username', 'reputation_score'];
      const sortColumn = validSortColumns.includes(sort) ? sort : 'created_at';
      const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) 
        FROM users u
        LEFT JOIN user_roles ur ON u.role_id = ur.id
        LEFT JOIN user_plans up ON u.plan_id = up.id
        ${whereClause}
      `;
      
      const { rows: [{ count: total }] } = await db.query(countQuery, params);

      // Get users
      params.push(parseInt(limit));
      params.push(offset);
      
      const query = `
        SELECT 
          u.id,
          u.wallet_address,
          u.username,
          u.email,
          u.first_name,
          u.last_name,
          u.avatar_url,
          u.bio,
          u.phone,
          u.company,
          u.location,
          u.timezone,
          u.language,
          u.email_verified,
          u.account_status,
          u.subscription_status,
          u.subscription_started_at,
          u.subscription_expires_at,
          u.last_login_at,
          u.login_count,
          u.reputation_score,
          u.total_space_harvested,
          u.optimization_count,
          u.created_at,
          u.updated_at,
          ur.role_name,
          ur.role_label,
          up.plan_name,
          up.plan_label
        FROM users u
        LEFT JOIN user_roles ur ON u.role_id = ur.id
        LEFT JOIN user_plans up ON u.plan_id = up.id
        ${whereClause}
        ORDER BY u.${sortColumn} ${sortOrder}
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;

      const { rows: users } = await db.query(query, params);

      res.json({
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total),
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  /**
   * GET /api/users/:id
   * Get single user by ID
   */
  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Users can view their own profile, admins can view any profile
      const isAdmin = req.user.role === 'admin';
      if (!isAdmin && req.user.id !== id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { rows } = await db.query(
        `SELECT * FROM user_details_view WHERE id = $1`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user: rows[0] });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  /**
   * POST /api/users
   * Create new user
   */
  router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const {
        email,
        username,
        password,
        wallet_address,
        first_name,
        last_name,
        role_name = 'free',
        plan_name = 'free',
        phone,
        company,
        location,
        bio
      } = req.body;

      // Validate required fields
      if (!email || !username) {
        return res.status(400).json({ error: 'Email and username are required' });
      }

      // Check if user already exists
      const { rows: existing } = await db.query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );

      if (existing.length > 0) {
        return res.status(409).json({ error: 'User with this email or username already exists' });
      }

      // Get role and plan IDs
      const { rows: [role] } = await db.query(
        'SELECT id FROM user_roles WHERE role_name = $1',
        [role_name]
      );

      const { rows: [plan] } = await db.query(
        'SELECT id, trial_period_days FROM user_plans WHERE plan_name = $1',
        [plan_name]
      );

      if (!role || !plan) {
        return res.status(400).json({ error: 'Invalid role or plan specified' });
      }

      // Hash password if provided
      let passwordHash = null;
      if (password) {
        passwordHash = await bcrypt.hash(password, 10);
      }

      // Calculate subscription dates
      const now = new Date();
      const subscriptionStarted = now;
      const trialEnds = plan.trial_period_days > 0 
        ? new Date(now.getTime() + plan.trial_period_days * 24 * 60 * 60 * 1000)
        : null;

      // Create user
      const { rows: [newUser] } = await db.query(
        `INSERT INTO users (
          email, username, password_hash, wallet_address,
          first_name, last_name, role_id, plan_id,
          phone, company, location, bio,
          subscription_status, subscription_started_at, trial_ends_at,
          account_status, email_verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *`,
        [
          email, username, passwordHash, wallet_address || null,
          first_name || null, last_name || null, role.id, plan.id,
          phone || null, company || null, location || null, bio || null,
          trialEnds ? 'trial' : 'active', subscriptionStarted, trialEnds,
          'active', false
        ]
      );

      // Log activity
      await db.query(
        `INSERT INTO user_activity_logs (user_id, action, resource, details)
         VALUES ($1, $2, $3, $4)`,
        [newUser.id, 'user_created', 'user', JSON.stringify({ created_by: req.user.id, role: role_name, plan: plan_name })]
      );

      // Fetch complete user data
      const { rows: [user] } = await db.query(
        'SELECT * FROM user_details_view WHERE id = $1',
        [newUser.id]
      );

      res.status(201).json({ 
        user,
        message: 'User created successfully'
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  /**
   * PUT /api/users/:id
   * Update user
   */
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Users can update their own profile, admins can update any profile
      const isAdmin = req.user.role === 'admin';
      if (!isAdmin && req.user.id !== id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updateFields = [];
      const values = [];
      let paramCount = 1;

      // Fields that any user can update
      const userEditableFields = ['first_name', 'last_name', 'bio', 'avatar_url', 'phone', 'company', 'location', 'timezone', 'language', 'preferences'];
      
      // Fields only admins can update
      const adminOnlyFields = ['role_id', 'plan_id', 'account_status', 'subscription_status', 'email_verified'];

      for (const [key, value] of Object.entries(req.body)) {
        if (userEditableFields.includes(key) || (isAdmin && adminOnlyFields.includes(key))) {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      values.push(id);

      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount} AND deleted_at IS NULL
        RETURNING *
      `;

      const { rows } = await db.query(query, values);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Log activity
      await db.query(
        `INSERT INTO user_activity_logs (user_id, action, resource, resource_id, details)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.user.id, 'user_updated', 'user', id, JSON.stringify({ fields: Object.keys(req.body) })]
      );

      // Fetch complete user data
      const { rows: [user] } = await db.query(
        'SELECT * FROM user_details_view WHERE id = $1',
        [id]
      );

      res.json({ 
        user,
        message: 'User updated successfully'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  /**
   * DELETE /api/users/:id
   * Soft delete user
   */
  router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      // Prevent self-deletion
      if (req.user.id === id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      const { rows } = await db.query(
        `UPDATE users 
         SET deleted_at = CURRENT_TIMESTAMP, 
             account_status = 'deleted',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING *`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Log activity
      await db.query(
        `INSERT INTO user_activity_logs (user_id, action, resource, resource_id, details)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.user.id, 'user_deleted', 'user', id, JSON.stringify({ deleted_by: req.user.id })]
      );

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // =========================================================================
  // PLAN MANAGEMENT ENDPOINTS
  // =========================================================================

  /**
   * GET /api/users/plans/list
   * Get all available plans
   */
  router.get('/plans/list', async (req, res) => {
    try {
      const { public_only = true } = req.query;
      
      const query = public_only === 'true'
        ? 'SELECT * FROM user_plans WHERE is_active = true AND is_public = true ORDER BY sort_order'
        : 'SELECT * FROM user_plans WHERE is_active = true ORDER BY sort_order';

      const { rows: plans } = await db.query(query);

      res.json({ plans });
    } catch (error) {
      console.error('Error fetching plans:', error);
      res.status(500).json({ error: 'Failed to fetch plans' });
    }
  });

  /**
   * POST /api/users/:id/assign-plan
   * Assign a plan to a user
   */
  router.post('/:id/assign-plan', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { plan_name } = req.body;

      if (!plan_name) {
        return res.status(400).json({ error: 'Plan name is required' });
      }

      // Get plan
      const { rows: [plan] } = await db.query(
        'SELECT id, trial_period_days FROM user_plans WHERE plan_name = $1 AND is_active = true',
        [plan_name]
      );

      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      // Calculate new subscription dates
      const now = new Date();
      const trialEnds = plan.trial_period_days > 0
        ? new Date(now.getTime() + plan.trial_period_days * 24 * 60 * 60 * 1000)
        : null;

      // Update user plan
      const { rows } = await db.query(
        `UPDATE users 
         SET plan_id = $1,
             subscription_status = $2,
             subscription_started_at = $3,
             trial_ends_at = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5 AND deleted_at IS NULL
         RETURNING *`,
        [plan.id, trialEnds ? 'trial' : 'active', now, trialEnds, id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Log activity
      await db.query(
        `INSERT INTO user_activity_logs (user_id, action, resource, resource_id, details)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.user.id, 'plan_assigned', 'user', id, JSON.stringify({ plan: plan_name, assigned_by: req.user.id })]
      );

      // Fetch complete user data
      const { rows: [user] } = await db.query(
        'SELECT * FROM user_details_view WHERE id = $1',
        [id]
      );

      res.json({ 
        user,
        message: 'Plan assigned successfully'
      });
    } catch (error) {
      console.error('Error assigning plan:', error);
      res.status(500).json({ error: 'Failed to assign plan' });
    }
  });

  // =========================================================================
  // ROLE MANAGEMENT ENDPOINTS
  // =========================================================================

  /**
   * GET /api/users/roles/list
   * Get all available roles
   */
  router.get('/roles/list', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { rows: roles } = await db.query(
        'SELECT * FROM user_roles ORDER BY role_name'
      );

      res.json({ roles });
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ error: 'Failed to fetch roles' });
    }
  });

  /**
   * POST /api/users/:id/assign-role
   * Assign a role to a user
   */
  router.post('/:id/assign-role', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { role_name } = req.body;

      if (!role_name) {
        return res.status(400).json({ error: 'Role name is required' });
      }

      // Get role
      const { rows: [role] } = await db.query(
        'SELECT id FROM user_roles WHERE role_name = $1',
        [role_name]
      );

      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      // Update user role
      const { rows } = await db.query(
        `UPDATE users 
         SET role_id = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND deleted_at IS NULL
         RETURNING *`,
        [role.id, id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Log activity
      await db.query(
        `INSERT INTO user_activity_logs (user_id, action, resource, resource_id, details)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.user.id, 'role_assigned', 'user', id, JSON.stringify({ role: role_name, assigned_by: req.user.id })]
      );

      // Fetch complete user data
      const { rows: [user] } = await db.query(
        'SELECT * FROM user_details_view WHERE id = $1',
        [id]
      );

      res.json({ 
        user,
        message: 'Role assigned successfully'
      });
    } catch (error) {
      console.error('Error assigning role:', error);
      res.status(500).json({ error: 'Failed to assign role' });
    }
  });

  // =========================================================================
  // STATISTICS & ANALYTICS
  // =========================================================================

  /**
   * GET /api/users/stats/overview
   * Get user statistics overview
   */
  router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { rows: [stats] } = await db.query(`
        SELECT 
          COUNT(*) FILTER (WHERE deleted_at IS NULL) as total_users,
          COUNT(*) FILTER (WHERE deleted_at IS NULL AND account_status = 'active') as active_users,
          COUNT(*) FILTER (WHERE deleted_at IS NULL AND account_status = 'suspended') as suspended_users,
          COUNT(*) FILTER (WHERE deleted_at IS NULL AND created_at > CURRENT_TIMESTAMP - INTERVAL '30 days') as new_users_30d,
          COUNT(*) FILTER (WHERE deleted_at IS NULL AND last_login_at > CURRENT_TIMESTAMP - INTERVAL '7 days') as active_users_7d
        FROM users
      `);

      const { rows: planStats } = await db.query(`
        SELECT 
          up.plan_name,
          up.plan_label,
          COUNT(u.id) as user_count
        FROM user_plans up
        LEFT JOIN users u ON u.plan_id = up.id AND u.deleted_at IS NULL
        GROUP BY up.id, up.plan_name, up.plan_label
        ORDER BY up.sort_order
      `);

      const { rows: roleStats } = await db.query(`
        SELECT 
          ur.role_name,
          ur.role_label,
          COUNT(u.id) as user_count
        FROM user_roles ur
        LEFT JOIN users u ON u.role_id = ur.id AND u.deleted_at IS NULL
        GROUP BY ur.id, ur.role_name, ur.role_label
        ORDER BY ur.role_name
      `);

      res.json({
        overview: stats,
        by_plan: planStats,
        by_role: roleStats
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });

  return router;
}
