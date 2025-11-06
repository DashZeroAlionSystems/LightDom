# User Creation Workflow Guide

## Overview

This guide provides a comprehensive workflow for creating and managing users in the LightDom platform. It covers user registration, authentication, SSO integration, payment processing, and profile management.

## Table of Contents

1. [User Creation Flow](#user-creation-flow)
2. [Registration Methods](#registration-methods)
3. [Authentication & SSO](#authentication--sso)
4. [Payment Integration](#payment-integration)
5. [User Profile Management](#user-profile-management)
6. [Portfolio Management](#portfolio-management)
7. [Configuration Schema](#configuration-schema)
8. [Workflow Automation](#workflow-automation)
9. [API Reference](#api-reference)
10. [Examples](#examples)

---

## User Creation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Registration Flow                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
         ┌──────────────────┴──────────────────┐
         │                                     │
    Email/Password                            SSO
         │                                     │
         ├─────────────┬─────────────┐        │
         │             │             │        │
    Validate      Create User    Send Email  │
         │             │             │        │
         └─────────────┴─────────────┘        │
                       │                      │
                       └──────────┬───────────┘
                                  ↓
                       ┌──────────────────┐
                       │  User Created    │
                       └──────────────────┘
                                  ↓
                       ┌──────────────────┐
                       │  Setup Profile   │
                       └──────────────────┘
                                  ↓
                       ┌──────────────────┐
                       │  Link Payment    │
                       └──────────────────┘
                                  ↓
                       ┌──────────────────┐
                       │  Assign Plan     │
                       └──────────────────┘
                                  ↓
                       ┌──────────────────┐
                       │  Send Welcome    │
                       └──────────────────┘
```

---

## Registration Methods

### 1. Email & Password Registration

#### Database Schema

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    company VARCHAR(255),
    job_title VARCHAR(255),
    website VARCHAR(500),
    location VARCHAR(255),
    timezone VARCHAR(100) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    preferences JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email verification tokens
CREATE TABLE IF NOT EXISTS verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    token_type VARCHAR(50) NOT NULL, -- 'email_verification', 'password_reset'
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX idx_verification_tokens_user_id ON verification_tokens(user_id);

-- Update timestamp trigger
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Implementation

```javascript
// services/user-creation-service.js
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export class UserCreationService {
  constructor(dbPool, emailService) {
    this.db = dbPool;
    this.emailService = emailService;
    this.saltRounds = 10;
  }

  /**
   * Register a new user with email and password
   */
  async registerWithEmail(userData) {
    const {
      email,
      password,
      username,
      first_name,
      last_name,
      metadata = {}
    } = userData;

    // Validate email
    await this.validateEmail(email);

    // Validate password strength
    this.validatePassword(password);

    // Hash password
    const password_hash = await bcrypt.hash(password, this.saltRounds);

    // Create user
    const userResult = await this.db.query(
      `INSERT INTO users 
       (email, username, password_hash, first_name, last_name, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, username, first_name, last_name, created_at`,
      [email, username, password_hash, first_name, last_name, JSON.stringify(metadata)]
    );

    const user = userResult.rows[0];

    // Create user profile
    await this.createUserProfile(user.id);

    // Send verification email
    await this.sendVerificationEmail(user);

    return {
      user,
      message: 'User registered successfully. Please check your email to verify your account.'
    };
  }

  /**
   * Validate email uniqueness
   */
  async validateEmail(email) {
    const result = await this.db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length > 0) {
      throw new Error('Email already registered');
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  /**
   * Validate password strength
   */
  validatePassword(password) {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain at least one number');
    }

    if (!/[!@#$%^&*]/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }
  }

  /**
   * Create user profile
   */
  async createUserProfile(userId, profileData = {}) {
    const {
      bio = '',
      company = '',
      job_title = '',
      website = '',
      location = '',
      timezone = 'UTC',
      language = 'en',
      preferences = {}
    } = profileData;

    const result = await this.db.query(
      `INSERT INTO user_profiles 
       (user_id, bio, company, job_title, website, location, timezone, language, preferences)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, bio, company, job_title, website, location, timezone, language, JSON.stringify(preferences)]
    );

    return result.rows[0];
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(user) {
    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.db.query(
      `INSERT INTO verification_tokens 
       (user_id, token, token_type, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [user.id, token, 'email_verification', expiresAt]
    );

    // Send email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    await this.emailService.send({
      to: user.email,
      subject: 'Verify your email',
      template: 'email-verification',
      data: {
        name: user.first_name || user.username,
        verificationUrl
      }
    });
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token) {
    const result = await this.db.query(
      `SELECT * FROM verification_tokens 
       WHERE token = $1 
       AND token_type = 'email_verification'
       AND expires_at > CURRENT_TIMESTAMP
       AND used_at IS NULL`,
      [token]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid or expired verification token');
    }

    const verificationToken = result.rows[0];

    // Mark token as used
    await this.db.query(
      'UPDATE verification_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = $1',
      [verificationToken.id]
    );

    // Update user
    await this.db.query(
      `UPDATE users 
       SET is_verified = true, email_verified_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [verificationToken.user_id]
    );

    return { message: 'Email verified successfully' };
  }

  /**
   * Login user
   */
  async login(email, password) {
    const result = await this.db.query(
      `SELECT id, email, username, password_hash, is_active, is_verified
       FROM users 
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];

    if (!user.is_active) {
      throw new Error('Account is disabled');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await this.db.query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Remove password hash from response
    delete user.password_hash;

    return user;
  }
}
```

### 2. OAuth SSO Registration

See [SSO Integration Guide](./SSO_INTEGRATION_GUIDE.md) for GitHub and Google OAuth implementation.

---

## Authentication & SSO

### Session Management

```javascript
// services/session-service.js
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export class SessionService {
  constructor(dbPool) {
    this.db = dbPool;
    this.jwtSecret = process.env.JWT_SECRET;
    this.jwtExpiration = process.env.JWT_EXPIRATION || '7d';
  }

  /**
   * Create session and generate JWT
   */
  async createSession(userId, metadata = {}) {
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store session in database
    await this.db.query(
      `INSERT INTO user_sessions 
       (id, user_id, expires_at, metadata)
       VALUES ($1, $2, $3, $4)`,
      [sessionId, userId, expiresAt, JSON.stringify(metadata)]
    );

    // Generate JWT
    const token = jwt.sign(
      {
        userId,
        sessionId,
        type: 'access'
      },
      this.jwtSecret,
      { expiresIn: this.jwtExpiration }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      {
        userId,
        sessionId,
        type: 'refresh'
      },
      this.jwtSecret,
      { expiresIn: '30d' }
    );

    return {
      accessToken: token,
      refreshToken,
      expiresIn: this.jwtExpiration,
      sessionId
    };
  }

  /**
   * Verify and decode JWT
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    const decoded = this.verifyToken(refreshToken);

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }

    // Verify session exists
    const result = await this.db.query(
      `SELECT * FROM user_sessions 
       WHERE id = $1 AND user_id = $2 AND expires_at > CURRENT_TIMESTAMP`,
      [decoded.sessionId, decoded.userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Session expired');
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: decoded.userId,
        sessionId: decoded.sessionId,
        type: 'access'
      },
      this.jwtSecret,
      { expiresIn: this.jwtExpiration }
    );

    return {
      accessToken: newAccessToken,
      expiresIn: this.jwtExpiration
    };
  }

  /**
   * Destroy session
   */
  async destroySession(sessionId) {
    await this.db.query(
      'DELETE FROM user_sessions WHERE id = $1',
      [sessionId]
    );
  }
}
```

---

## Payment Integration

### User Plans & Subscriptions

```sql
-- User plans
CREATE TABLE IF NOT EXISTS user_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    description TEXT,
    price_monthly DECIMAL(10, 2),
    price_yearly DECIMAL(10, 2),
    features JSONB DEFAULT '[]',
    limits JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    stripe_price_id_monthly VARCHAR(255),
    stripe_price_id_yearly VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES user_plans(id),
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'canceled', 'past_due', 'trialing'
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'yearly'
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_method_id VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- 'card', 'bank_account'
    is_default BOOLEAN DEFAULT false,
    card_brand VARCHAR(50),
    card_last4 VARCHAR(4),
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
```

See [Stripe Integration Guide](./STRIPE_INTEGRATION_GUIDE.md) for complete payment implementation.

---

## User Profile Management

### Profile Update Service

```javascript
// services/user-profile-service.js
export class UserProfileService {
  constructor(dbPool, storageService) {
    this.db = dbPool;
    this.storage = storageService;
  }

  /**
   * Get user profile
   */
  async getProfile(userId) {
    const result = await this.db.query(
      `SELECT 
        u.id,
        u.email,
        u.username,
        u.first_name,
        u.last_name,
        u.phone,
        u.avatar_url,
        u.is_verified,
        u.last_login_at,
        u.created_at,
        up.*
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    const {
      first_name,
      last_name,
      phone,
      bio,
      company,
      job_title,
      website,
      location,
      timezone,
      language,
      preferences
    } = updates;

    // Update user table
    const userUpdates = {};
    if (first_name !== undefined) userUpdates.first_name = first_name;
    if (last_name !== undefined) userUpdates.last_name = last_name;
    if (phone !== undefined) userUpdates.phone = phone;

    if (Object.keys(userUpdates).length > 0) {
      const setClause = Object.keys(userUpdates)
        .map((key, idx) => `${key} = $${idx + 2}`)
        .join(', ');
      
      await this.db.query(
        `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [userId, ...Object.values(userUpdates)]
      );
    }

    // Update profile table
    const profileUpdates = {};
    if (bio !== undefined) profileUpdates.bio = bio;
    if (company !== undefined) profileUpdates.company = company;
    if (job_title !== undefined) profileUpdates.job_title = job_title;
    if (website !== undefined) profileUpdates.website = website;
    if (location !== undefined) profileUpdates.location = location;
    if (timezone !== undefined) profileUpdates.timezone = timezone;
    if (language !== undefined) profileUpdates.language = language;
    if (preferences !== undefined) profileUpdates.preferences = JSON.stringify(preferences);

    if (Object.keys(profileUpdates).length > 0) {
      const setClause = Object.keys(profileUpdates)
        .map((key, idx) => `${key} = $${idx + 2}`)
        .join(', ');
      
      await this.db.query(
        `UPDATE user_profiles SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1`,
        [userId, ...Object.values(profileUpdates)]
      );
    }

    return await this.getProfile(userId);
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(userId, file) {
    // Upload to storage service (S3, Cloudinary, etc.)
    const avatarUrl = await this.storage.upload(file, {
      folder: 'avatars',
      userId
    });

    // Update user
    await this.db.query(
      'UPDATE users SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [avatarUrl, userId]
    );

    return { avatarUrl };
  }
}
```

---

## Portfolio Management

```sql
-- User portfolios
CREATE TABLE IF NOT EXISTS user_portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100), -- 'project', 'website', 'campaign'
    url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio items
CREATE TABLE IF NOT EXISTS portfolio_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES user_portfolios(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    item_type VARCHAR(100),
    url VARCHAR(500),
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_portfolios_user_id ON user_portfolios(user_id);
CREATE INDEX idx_portfolio_items_portfolio_id ON portfolio_items(portfolio_id);
```

---

## Configuration Schema

### User Creation Config Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "User Creation Configuration",
  "type": "object",
  "properties": {
    "registration": {
      "type": "object",
      "properties": {
        "requireEmailVerification": {
          "type": "boolean",
          "default": true
        },
        "allowSocialSignup": {
          "type": "boolean",
          "default": true
        },
        "socialProviders": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["github", "google", "facebook", "twitter"]
          },
          "default": ["github", "google"]
        },
        "passwordPolicy": {
          "type": "object",
          "properties": {
            "minLength": {
              "type": "integer",
              "minimum": 8,
              "default": 8
            },
            "requireUppercase": {
              "type": "boolean",
              "default": true
            },
            "requireLowercase": {
              "type": "boolean",
              "default": true
            },
            "requireNumbers": {
              "type": "boolean",
              "default": true
            },
            "requireSpecialChars": {
              "type": "boolean",
              "default": true
            }
          }
        },
        "defaultPlan": {
          "type": "string",
          "default": "free"
        },
        "trialPeriodDays": {
          "type": "integer",
          "minimum": 0,
          "default": 14
        }
      }
    },
    "onboarding": {
      "type": "object",
      "properties": {
        "steps": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": { "type": "string" },
              "title": { "type": "string" },
              "component": { "type": "string" },
              "required": { "type": "boolean" }
            }
          }
        },
        "sendWelcomeEmail": {
          "type": "boolean",
          "default": true
        },
        "welcomeEmailTemplate": {
          "type": "string",
          "default": "welcome"
        }
      }
    },
    "permissions": {
      "type": "object",
      "properties": {
        "defaultRole": {
          "type": "string",
          "default": "user"
        },
        "defaultPermissions": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    }
  }
}
```

---

## Workflow Automation

### n8n Workflow for User Creation

```json
{
  "name": "User Registration Workflow",
  "nodes": [
    {
      "parameters": {},
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "operation": "create",
        "table": "users",
        "columns": "email,username,password_hash,first_name,last_name"
      },
      "name": "Create User",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "operation": "create",
        "table": "user_profiles",
        "columns": "user_id"
      },
      "name": "Create Profile",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "to": "={{$json.email}}",
        "subject": "Welcome to LightDom!",
        "emailType": "html",
        "text": "={{$json.welcomeMessage}}"
      },
      "name": "Send Welcome Email",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 1,
      "position": [850, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.plan}}",
              "value2": "paid"
            }
          ]
        }
      },
      "name": "Check if Paid Plan",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [650, 450]
    },
    {
      "parameters": {
        "resource": "customer",
        "operation": "create",
        "email": "={{$json.email}}"
      },
      "name": "Create Stripe Customer",
      "type": "n8n-nodes-base.stripe",
      "typeVersion": 1,
      "position": [850, 550]
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [[{ "node": "Create User", "type": "main", "index": 0 }]]
    },
    "Create User": {
      "main": [[{ "node": "Create Profile", "type": "main", "index": 0 }]]
    },
    "Create Profile": {
      "main": [
        [
          { "node": "Send Welcome Email", "type": "main", "index": 0 },
          { "node": "Check if Paid Plan", "type": "main", "index": 0 }
        ]
      ]
    },
    "Check if Paid Plan": {
      "main": [[{ "node": "Create Stripe Customer", "type": "main", "index": 0 }]]
    }
  }
}
```

---

## API Reference

### User Registration

```
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe"
}

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "created_at": "2025-11-06T13:00:00Z"
  },
  "message": "User registered successfully. Please check your email to verify your account."
}
```

### User Login

```
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe"
  },
  "session": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresIn": "7d"
  }
}
```

### Update Profile

```
PUT /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Software developer",
  "company": "Example Corp",
  "location": "San Francisco, CA"
}
```

---

## Examples

### Complete User Registration Flow

```javascript
// Example: Register user and setup complete profile
const userCreation = new UserCreationService(db, emailService);
const sessionService = new SessionService(db);
const profileService = new UserProfileService(db, storageService);

// 1. Register user
const { user } = await userCreation.registerWithEmail({
  email: 'john@example.com',
  password: 'SecurePass123!',
  username: 'johndoe',
  first_name: 'John',
  last_name: 'Doe'
});

// 2. Verify email (user clicks link)
await userCreation.verifyEmail(verificationToken);

// 3. Login
const loginUser = await userCreation.login('john@example.com', 'SecurePass123!');

// 4. Create session
const session = await sessionService.createSession(loginUser.id, {
  userAgent: req.headers['user-agent'],
  ip: req.ip
});

// 5. Update profile
const profile = await profileService.updateProfile(user.id, {
  bio: 'Full-stack developer',
  company: 'Tech Corp',
  location: 'San Francisco, CA',
  timezone: 'America/Los_Angeles'
});

// 6. Upload avatar
const avatar = await profileService.uploadAvatar(user.id, avatarFile);

console.log('User setup complete!', { user, profile, avatar });
```

---

## Best Practices

1. **Password Security**: Always hash passwords with bcrypt
2. **Email Verification**: Require email verification for new accounts
3. **Session Management**: Use JWT with refresh tokens
4. **Rate Limiting**: Implement rate limiting on auth endpoints
5. **Input Validation**: Validate all user inputs
6. **Error Handling**: Don't leak sensitive information in errors
7. **Audit Logging**: Log all authentication events
8. **MFA Support**: Consider implementing 2FA
9. **Password Reset**: Implement secure password reset flow
10. **GDPR Compliance**: Allow users to export/delete their data

---

## Next Steps

- Setup [SSO Integration](./SSO_INTEGRATION_GUIDE.md)
- Configure [Stripe Payments](./STRIPE_INTEGRATION_GUIDE.md)
- Implement [Header Script Injection](./HEADER_SCRIPT_INJECTION.md)
- Setup [SEO Performance Evaluation](./SEO_PERFORMANCE_GUIDE.md)
- Configure [Error Handling](./ERROR_HANDLING_GUIDE.md)
