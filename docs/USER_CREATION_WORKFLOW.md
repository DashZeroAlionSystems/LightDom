# User Creation Workflow Rules & Documentation

## Overview

This document defines the complete workflow rules, validation logic, and business processes for creating and managing users in the LightDom platform. These rules ensure data integrity, security, and proper user lifecycle management.

## User Creation Workflows

### 1. Admin Creates User Workflow

**Actors:** System Administrator, Platform Administrator

**Preconditions:**
- Admin must be authenticated
- Admin must have 'admin' role
- Admin has valid JWT token

**Steps:**
1. Admin navigates to User Management page
2. Admin clicks "Create User" button
3. System displays user creation form
4. Admin fills in required fields:
   - Email (unique, valid format)
   - Username (unique, 3-50 characters)
   - Password (8+ characters, if not using wallet auth)
   - Role selection
   - Plan selection
5. Admin optionally fills profile fields:
   - First name, last name
   - Phone, company, location
   - Bio, timezone, language
6. Admin clicks "Create User" button
7. System validates all inputs
8. System checks for existing email/username
9. System creates user record:
   - Hash password with bcrypt
   - Assign selected role and plan
   - Set subscription dates based on plan trial period
   - Set account_status = 'active'
   - Set email_verified = false
10. System creates activity log entry
11. System returns success response with user data
12. UI shows success message
13. UI navigates back to user list

**Postconditions:**
- New user exists in database
- User has assigned role and plan
- Activity log entry created
- User can log in (if password provided)

**Validation Rules:**
- Email must be valid format (RFC 5322)
- Email must be unique across all users
- Username must be unique
- Username must be 3-50 alphanumeric characters
- Password must be 8+ characters (if provided)
- Role must exist in user_roles table
- Plan must exist in user_plans table
- Phone must be valid format (if provided)
- Timezone must be valid IANA timezone (if provided)

**Error Scenarios:**
- Email already exists → 409 Conflict
- Username already exists → 409 Conflict
- Invalid email format → 400 Bad Request
- Invalid role/plan → 400 Bad Request
- Missing required fields → 400 Bad Request
- Insufficient permissions → 403 Forbidden
- Invalid/expired token → 401 Unauthorized

### 2. Self-Service User Registration

**Actors:** New User (Public)

**Preconditions:**
- User visits registration page
- User agrees to terms of service

**Steps:**
1. User navigates to signup page
2. User fills registration form:
   - Email
   - Username
   - Password (min 8 chars)
   - Optional: Wallet address
3. User agrees to terms and conditions
4. User clicks "Sign Up" button
5. System validates inputs
6. System checks email/username uniqueness
7. System creates user with:
   - role = 'free' (default)
   - plan = 'free' (default)
   - account_status = 'pending' or 'active'
   - email_verified = false
8. System sends verification email
9. System creates session token
10. System returns success with token
11. UI redirects to dashboard
12. User sees "Verify Email" banner

**Postconditions:**
- User account created with free plan
- Verification email sent
- User logged in with active session
- Activity log entry created

**Validation Rules:**
- Same as admin creation
- Must accept terms of service
- ReCAPTCHA validation (if enabled)
- Rate limiting: Max 5 signups per IP per hour

### 3. DeepSeek User Creation

**Actors:** System Administrator

**Purpose:** Create automated AI user for workflows

**Special Requirements:**
- Role must be 'deepseek'
- Plan must be 'deepseek'
- No password (API key authentication)
- No email verification required
- API key generated automatically

**Steps:**
1. Admin creates user with role='deepseek'
2. System generates API key
3. System stores hashed API key
4. System returns API key to admin (one-time display)
5. Admin configures DeepSeek integration with API key

**Postconditions:**
- DeepSeek user created
- API key generated and stored
- User can authenticate via API key
- Unlimited API access enabled

### 4. Enterprise/Paid User Onboarding

**Actors:** Sales Team, New Enterprise Customer

**Preconditions:**
- Sales process completed
- Payment method on file
- Contract signed

**Steps:**
1. Sales team creates user account
2. Assigns 'enterprise' or 'pro' role
3. Assigns corresponding paid plan
4. Sets trial_ends_at if trial period
5. System sends welcome email with setup instructions
6. User receives login credentials
7. User logs in and completes profile
8. System tracks onboarding progress

**Postconditions:**
- Paid user account active
- Subscription billing scheduled
- Welcome email sent
- Onboarding tracking initiated

## User Update Workflows

### 1. User Updates Own Profile

**Allowed Fields:**
- first_name, last_name
- bio, avatar_url
- phone, company, location
- timezone, language
- preferences (JSON)

**Restrictions:**
- Cannot change email
- Cannot change username
- Cannot change role
- Cannot change plan
- Cannot change account_status

**Workflow:**
1. User navigates to profile settings
2. User modifies editable fields
3. User clicks "Save Changes"
4. System validates inputs
5. System updates user record
6. System logs activity
7. System returns updated user data
8. UI shows success message

### 2. Admin Updates User

**Allowed Fields:**
- All user editable fields
- Plus: role_id, plan_id
- Plus: account_status
- Plus: email_verified
- Plus: subscription_status

**Workflow:**
1. Admin selects user
2. Admin clicks "Edit"
3. Admin modifies fields
4. Admin clicks "Update User"
5. System validates admin permissions
6. System validates inputs
7. System updates user record
8. System logs activity (including admin ID)
9. System returns updated user
10. UI shows success message

### 3. Plan Assignment

**Workflow:**
1. Admin views user details
2. Admin clicks "Change Plan"
3. System shows available plans
4. Admin selects new plan
5. System calculates:
   - Subscription start date = now
   - Trial end date = now + plan.trial_period_days
   - Subscription status = 'trial' or 'active'
6. System updates user:
   - plan_id = new plan
   - subscription_started_at = now
   - trial_ends_at = calculated date
   - subscription_status = calculated status
7. System logs plan change
8. System returns updated user
9. UI shows success with plan details

**Business Rules:**
- Cannot downgrade from paid to free without confirmation
- Changing plan resets trial period if plan has trial
- Previous plan benefits end immediately
- New plan benefits activate immediately
- Billing adjustments handled separately

### 4. Role Assignment

**Workflow:**
1. Admin views user details
2. Admin clicks "Change Role"
3. System shows available roles
4. Admin selects new role
5. System validates role exists
6. System updates user.role_id
7. System logs role change
8. System returns updated user
9. UI shows success with new permissions

**Business Rules:**
- Admin cannot remove their own admin role
- At least one admin must exist in system
- Role change immediate, no grace period
- User sees new permissions on next login/refresh
- Active sessions may need re-authentication

## User Deletion Workflow

### Soft Delete (Default)

**Workflow:**
1. Admin selects user
2. Admin clicks "Delete"
3. System shows confirmation modal
4. Admin confirms deletion
5. System checks: Cannot delete self
6. System updates user:
   - deleted_at = current timestamp
   - account_status = 'deleted'
7. System invalidates all user sessions
8. System logs deletion (including admin ID)
9. System returns success
10. UI removes user from list

**Postconditions:**
- User record preserved in database
- User cannot log in
- User data available for reporting
- Can be restored by admin if needed

### Hard Delete (Restricted)

**When Allowed:**
- GDPR right to be forgotten request
- Data retention policy expiration
- Legal requirement

**Workflow:**
1. Admin initiates hard delete
2. System requires additional confirmation
3. System checks for dependencies:
   - Optimizations
   - Activity logs
   - API keys
   - Sessions
4. System archives related data
5. System deletes user record
6. System logs deletion
7. System returns success

**Postconditions:**
- User record removed from database
- Related records archived or deleted
- Action logged for compliance
- Cannot be undone

## Validation Rules

### Email Validation
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return error('Invalid email format');
}
```

### Username Validation
```javascript
const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
if (!usernameRegex.test(username)) {
  return error('Username must be 3-50 alphanumeric characters');
}
```

### Password Validation
```javascript
if (password.length < 8) {
  return error('Password must be at least 8 characters');
}
// Additional checks:
// - At least one uppercase letter
// - At least one lowercase letter
// - At least one number
// - At least one special character (optional)
```

### Phone Validation
```javascript
const phoneRegex = /^\+?[1-9]\d{1,14}$/;
if (phone && !phoneRegex.test(phone)) {
  return error('Invalid phone number format');
}
```

## Business Rules

### Account Status Transitions

```
pending → active (email verified)
pending → suspended (admin action)
active → suspended (admin action)
active → deleted (admin action)
suspended → active (admin action)
deleted → (no transitions, terminal state)
```

### Subscription Status Transitions

```
trial → active (trial ends, payment successful)
trial → expired (trial ends, no payment)
active → past_due (payment failed)
active → cancelled (user/admin cancels)
past_due → active (payment recovered)
past_due → cancelled (grace period ends)
cancelled → (no automatic transitions)
```

### Plan Upgrade/Downgrade Rules

**Upgrade (Free → Pro → Enterprise):**
- Immediate access to new features
- Prorated billing adjustment
- No data loss
- Trial period not applicable

**Downgrade (Enterprise → Pro → Free):**
- Requires confirmation
- Schedule for end of billing period
- Warn about feature loss
- May require data reduction

### Role Permission Matrix

| Action | Guest | Free | Pro | Enterprise | DeepSeek | Admin |
|--------|-------|------|-----|------------|----------|-------|
| View own profile | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit own profile | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create optimizations | ✗ | Limited | ✓ | ✓ | ✓ | ✓ |
| Access API | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Manage team | ✗ | ✗ | Limited | ✓ | ✗ | ✓ |
| View all users | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Create users | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Edit users | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Delete users | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Assign roles/plans | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

## Security Rules

### Password Requirements
- Minimum 8 characters
- Cannot be common password
- Cannot be username or email
- Hashed with bcrypt (salt rounds: 10)
- Never stored in plain text
- Never logged or exposed in API

### Session Management
- JWT token expires after 24 hours
- Refresh token valid for 7 days
- Maximum 5 concurrent sessions per user
- Automatic logout after 30 minutes inactivity
- Session invalidated on password change
- Session invalidated on role change

### API Key Management
- Generated using crypto.randomBytes(32)
- Stored as SHA-256 hash
- Prefix shown for identification
- Rate limited per key
- Can be revoked by user or admin
- Expires after configured period

### Rate Limiting
- Signup: 5 per hour per IP
- Login: 10 per hour per IP
- Password reset: 3 per hour per email
- API calls: Based on plan limits
- Admin actions: 100 per minute

## Audit Logging

### What to Log
- User creation (who, when, role, plan)
- User updates (who, when, what changed)
- User deletion (who, when, reason)
- Login attempts (success/failure)
- Password changes
- Role/plan changes
- Session creation/destruction
- API key creation/revocation

### Log Format
```json
{
  "user_id": "uuid",
  "action": "user_created",
  "resource": "user",
  "resource_id": "uuid",
  "details": {
    "created_by": "admin_uuid",
    "role": "pro",
    "plan": "pro"
  },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "created_at": "2025-11-06T13:00:00Z"
}
```

## Error Handling

### Error Response Format
```json
{
  "error": "User with this email already exists",
  "code": "USER_EXISTS",
  "status": 409,
  "details": {
    "field": "email",
    "value": "user@example.com"
  }
}
```

### Error Codes
- `USER_EXISTS` - Email or username already exists
- `INVALID_EMAIL` - Email format invalid
- `INVALID_USERNAME` - Username format invalid
- `WEAK_PASSWORD` - Password doesn't meet requirements
- `INVALID_ROLE` - Role doesn't exist
- `INVALID_PLAN` - Plan doesn't exist
- `PERMISSION_DENIED` - Insufficient permissions
- `AUTHENTICATION_REQUIRED` - Not authenticated
- `VALIDATION_ERROR` - Input validation failed
- `USER_NOT_FOUND` - User doesn't exist
- `CANNOT_DELETE_SELF` - Admin cannot delete own account

## Testing Scenarios

### Unit Tests Required
- Email validation
- Username validation
- Password hashing
- Token generation
- Permission checks
- Plan limit calculations

### Integration Tests Required
- User creation flow
- User update flow
- Plan assignment flow
- Role assignment flow
- Deletion flow
- Authentication flow

### End-to-End Tests Required
- Admin creates user
- User self-registration
- DeepSeek user creation
- Plan upgrade/downgrade
- User deletion and restoration

## Compliance & Privacy

### GDPR Compliance
- Right to access: User can export their data
- Right to rectification: User can update profile
- Right to erasure: User can request deletion
- Right to portability: User can export data
- Right to object: User can opt out of marketing

### Data Retention
- Active users: Retained indefinitely
- Deleted users: 30-day soft delete period
- After 30 days: Hard delete or archive
- Activity logs: 90 days
- Audit logs: 7 years

Last Updated: November 6, 2025
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
