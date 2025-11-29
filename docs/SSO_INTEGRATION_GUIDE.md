# SSO Integration Guide - GitHub & Google OAuth

## Overview

This guide provides step-by-step instructions for implementing Single Sign-On (SSO) authentication using GitHub and Google OAuth 2.0 in the LightDom platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [GitHub OAuth Setup](#github-oauth-setup)
3. [Google OAuth Setup](#google-oauth-setup)
4. [Database Schema](#database-schema)
5. [Implementation](#implementation)
6. [Security Considerations](#security-considerations)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Packages

```bash
npm install passport passport-github2 passport-google-oauth20
npm install express-session connect-pg-simple
```

### Environment Variables

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Session
SESSION_SECRET=your_secret_key_here
SESSION_MAX_AGE=604800000

# Application URLs
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:3001
```

---

## GitHub OAuth Setup

### Step 1: Create OAuth App on GitHub

1. Go to **GitHub Settings** → **Developer settings** → **OAuth Apps**
2. Click **"New OAuth App"**
3. Fill in the application details:
   - **Application name**: LightDom Platform
   - **Homepage URL**: `http://localhost:3000` (or your production URL)
   - **Authorization callback URL**: `http://localhost:3001/api/auth/github/callback`
4. Click **"Register application"**
5. Copy the **Client ID** and **Client Secret**

### Step 2: Configure Environment Variables

Add to `.env`:
```bash
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback
```

### Step 3: GitHub Scopes

The following scopes are used:
- `user:email` - Access user's email addresses
- `read:user` - Access user profile information

---

## Google OAuth Setup

### Step 1: Create OAuth Credentials on Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth client ID"**
5. Configure consent screen:
   - User Type: External
   - App name: LightDom Platform
   - Support email: your@email.com
   - Scopes: `email`, `profile`, `openid`
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3001/api/auth/google/callback`
7. Copy the **Client ID** and **Client Secret**

### Step 2: Configure Environment Variables

Add to `.env`:
```bash
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

---

## Database Schema

```sql
-- OAuth accounts table
CREATE TABLE IF NOT EXISTS oauth_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'github', 'google', 'facebook', etc.
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    profile_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

-- User sessions table (for session storage)
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(255) PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes
CREATE INDEX idx_oauth_accounts_user_id ON oauth_accounts(user_id);
CREATE INDEX idx_oauth_accounts_provider ON oauth_accounts(provider);
CREATE INDEX idx_user_sessions_expire ON user_sessions(expire);

-- Update timestamp trigger
CREATE TRIGGER update_oauth_accounts_updated_at BEFORE UPDATE ON oauth_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Implementation

### Passport Configuration

```javascript
// config/passport.js
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

export function configurePassport(db) {
  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      const result = await db.query(
        'SELECT id, email, username, first_name, last_name FROM users WHERE id = $1',
        [id]
      );
      done(null, result.rows[0]);
    } catch (error) {
      done(error, null);
    }
  });

  // GitHub Strategy
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope: ['user:email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateOAuthUser(db, {
            provider: 'github',
            profile,
            accessToken,
            refreshToken
          });
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );

  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateOAuthUser(db, {
            provider: 'google',
            profile,
            accessToken,
            refreshToken
          });
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );

  return passport;
}

/**
 * Find or create user from OAuth profile
 */
async function findOrCreateOAuthUser(db, { provider, profile, accessToken, refreshToken }) {
  const providerId = profile.id;
  const email = provider === 'github' 
    ? profile.emails?.[0]?.value 
    : profile.emails?.[0]?.value;
  
  // Check if OAuth account exists
  let result = await db.query(
    'SELECT user_id FROM oauth_accounts WHERE provider = $1 AND provider_user_id = $2',
    [provider, providerId]
  );

  let userId;

  if (result.rows.length > 0) {
    // OAuth account exists
    userId = result.rows[0].user_id;
    
    // Update tokens
    await db.query(
      `UPDATE oauth_accounts 
       SET access_token = $1, refresh_token = $2, updated_at = CURRENT_TIMESTAMP
       WHERE provider = $3 AND provider_user_id = $4`,
      [accessToken, refreshToken, provider, providerId]
    );
  } else {
    // Check if user exists by email
    result = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length > 0) {
      // Link to existing user
      userId = result.rows[0].id;
    } else {
      // Create new user
      const displayName = profile.displayName || '';
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const userResult = await db.query(
        `INSERT INTO users 
         (email, username, first_name, last_name, is_verified, avatar_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          email,
          profile.username || email.split('@')[0],
          firstName,
          lastName,
          true, // Email is verified by OAuth provider
          profile.photos?.[0]?.value || null
        ]
      );

      userId = userResult.rows[0].id;

      // Create user profile
      await db.query(
        `INSERT INTO user_profiles (user_id) VALUES ($1)`,
        [userId]
      );
    }

    // Create OAuth account
    await db.query(
      `INSERT INTO oauth_accounts 
       (user_id, provider, provider_user_id, access_token, refresh_token, profile_data)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        provider,
        providerId,
        accessToken,
        refreshToken,
        JSON.stringify(profile._json)
      ]
    );
  }

  // Get user data
  result = await db.query(
    'SELECT id, email, username, first_name, last_name, avatar_url FROM users WHERE id = $1',
    [userId]
  );

  return result.rows[0];
}
```

### Express Session Setup

```javascript
// config/session.js
import session from 'express-session';
import connectPg from 'connect-pg-simple';

const PgSession = connectPg(session);

export function configureSession(db) {
  return session({
    store: new PgSession({
      pool: db,
      tableName: 'user_sessions',
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: parseInt(process.env.SESSION_MAX_AGE) || 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  });
}
```

### API Routes

```javascript
// api/auth-routes.js
import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login?error=github_auth_failed' }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { userId: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=google_auth_failed' }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { userId: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Session destruction failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
});

// Get current user
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.user });
});

// Link OAuth account to existing user
router.post('/link/:provider', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { provider } = req.params;
  const { accessToken, refreshToken, profile } = req.body;

  try {
    await req.app.locals.db.query(
      `INSERT INTO oauth_accounts 
       (user_id, provider, provider_user_id, access_token, refresh_token, profile_data)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (provider, provider_user_id) DO NOTHING`,
      [
        req.user.id,
        provider,
        profile.id,
        accessToken,
        refreshToken,
        JSON.stringify(profile)
      ]
    );

    res.json({ message: `${provider} account linked successfully` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to link account' });
  }
});

// Unlink OAuth account
router.delete('/unlink/:provider', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { provider } = req.params;

  try {
    await req.app.locals.db.query(
      'DELETE FROM oauth_accounts WHERE user_id = $1 AND provider = $2',
      [req.user.id, provider]
    );

    res.json({ message: `${provider} account unlinked successfully` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unlink account' });
  }
});

export default router;
```

### Server Setup

```javascript
// api-server-express.js (add to existing file)
import { configurePassport } from './config/passport.js';
import { configureSession } from './config/session.js';
import authRoutes from './api/auth-routes.js';

// ... existing code ...

// Configure session
app.use(configureSession(db));

// Configure passport
const passport = configurePassport(db);
app.use(passport.initialize());
app.use(passport.session());

// Auth routes
app.use('/api/auth', authRoutes);
```

---

## Frontend Integration

### React Components

```jsx
// components/SSOButtons.jsx
import React from 'react';
import { Button } from 'antd';
import { GithubOutlined, GoogleOutlined } from '@ant-design/icons';

export const SSOButtons = () => {
  const handleGitHubLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/github`;
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
  };

  return (
    <div className="sso-buttons">
      <Button
        type="default"
        icon={<GithubOutlined />}
        onClick={handleGitHubLogin}
        block
        size="large"
        style={{ marginBottom: '12px' }}
      >
        Continue with GitHub
      </Button>
      
      <Button
        type="default"
        icon={<GoogleOutlined />}
        onClick={handleGoogleLogin}
        block
        size="large"
      >
        Continue with Google
      </Button>
    </div>
  );
};
```

```jsx
// pages/AuthCallback.jsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin } from 'antd';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Store token
      localStorage.setItem('authToken', token);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      // Handle error
      navigate('/login?error=auth_failed');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <Spin size="large" tip="Completing sign in..." />
    </div>
  );
};
```

```jsx
// pages/Login.jsx
import React, { useState } from 'react';
import { Form, Input, Button, Divider, Alert } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { SSOButtons } from '../components/SSOButtons';

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.session.accessToken);
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Sign In</h1>
        
        {error && (
          <Alert 
            message={error} 
            type="error" 
            closable 
            style={{ marginBottom: 16 }}
          />
        )}

        <SSOButtons />

        <Divider>OR</Divider>

        <Form onFinish={onFinish} layout="vertical">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
```

---

## Security Considerations

### 1. CSRF Protection

```javascript
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

// Add CSRF token to response
app.get('/api/auth/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

### 2. Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later'
});

app.use('/api/auth', authLimiter);
```

### 3. Secure Sessions

```javascript
// Production session config
cookie: {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: 'strict',
  domain: process.env.COOKIE_DOMAIN
}
```

### 4. Token Security

- Store access tokens encrypted in database
- Use short-lived access tokens (15 minutes)
- Implement token refresh mechanism
- Rotate refresh tokens on use
- Revoke tokens on logout

---

## Testing

### Test GitHub OAuth Flow

```javascript
// test/auth/github-oauth.test.js
import { expect } from 'chai';
import request from 'supertest';
import app from '../app.js';

describe('GitHub OAuth', () => {
  it('should redirect to GitHub authorization', async () => {
    const res = await request(app)
      .get('/api/auth/github')
      .expect(302);

    expect(res.headers.location).to.include('github.com/login/oauth/authorize');
  });

  it('should handle callback and create user', async () => {
    // Mock GitHub OAuth callback
    const res = await request(app)
      .get('/api/auth/github/callback')
      .query({ code: 'mock_code' })
      .expect(302);

    expect(res.headers.location).to.include('/auth/callback?token=');
  });
});
```

### Test Google OAuth Flow

```javascript
// test/auth/google-oauth.test.js
import { expect } from 'chai';
import request from 'supertest';
import app from '../app.js';

describe('Google OAuth', () => {
  it('should redirect to Google authorization', async () => {
    const res = await request(app)
      .get('/api/auth/google')
      .expect(302);

    expect(res.headers.location).to.include('accounts.google.com/o/oauth2');
  });
});
```

---

## Troubleshooting

### Common Issues

#### 1. Redirect URI Mismatch

**Error**: "redirect_uri_mismatch"

**Solution**: Ensure the callback URL in your OAuth app settings exactly matches the one in your environment variables.

#### 2. Missing Email

**Error**: Email is null for OAuth user

**Solution**: 
- For GitHub: Ensure the user has a public email or request `user:email` scope
- For Google: Ensure `email` scope is included

#### 3. Session Not Persisting

**Error**: User is not authenticated after callback

**Solution**:
- Check session secret is set
- Verify database connection
- Check cookie settings (secure, sameSite)

#### 4. CORS Issues

**Error**: CORS error during OAuth flow

**Solution**:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

---

## Best Practices

1. **Always use HTTPS in production**
2. **Store OAuth tokens encrypted**
3. **Implement proper error handling**
4. **Log OAuth events for security**
5. **Allow users to unlink OAuth accounts**
6. **Implement account linking for existing users**
7. **Use state parameter to prevent CSRF**
8. **Validate email addresses from OAuth providers**
9. **Implement rate limiting on auth endpoints**
10. **Regular security audits of OAuth implementation**

---

## Production Checklist

- [ ] Update callback URLs to production domains
- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Configure proper CORS settings
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Setup error monitoring
- [ ] Test OAuth flows thoroughly
- [ ] Document user flows
- [ ] Setup OAuth app verification (Google)

---

## Next Steps

- Setup [Stripe Payment Integration](./STRIPE_INTEGRATION_GUIDE.md)
- Implement [Error Handling](./ERROR_HANDLING_GUIDE.md)
- Configure [User Roles & Permissions](./RBAC_GUIDE.md)
