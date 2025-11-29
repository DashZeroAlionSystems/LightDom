/**
 * Enhanced Authentication with SSO Support
 * Google OAuth, GitHub OAuth, and traditional email/password
 */

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const router = express.Router();

// Mock user database - replace with actual DB in production
const users = new Map();

// Initialize test user
users.set('phoneste29@gmail.com', {
  id: crypto.randomUUID(),
  email: 'phoneste29@gmail.com',
  username: 'stephan',
  name: 'Stephan',
  password: bcrypt.hashSync('password', 10),
  role: 'admin',
  plan: 'enterprise',
  createdAt: new Date().toISOString(),
  verified: true
});

/**
 * Register new user (email/password)
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, username } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['email', 'password', 'name']
      });
    }

    // Check if user already exists
    if (users.has(email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: crypto.randomUUID(),
      email,
      username: username || email.split('@')[0],
      name,
      password: hashedPassword,
      role: 'user',
      plan: 'free',
      createdAt: new Date().toISOString(),
      verified: false,
      onboardingCompleted: false
    };

    users.set(email, user);

    // Generate verification token
    const verificationToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'lightdom-secret-key',
      { expiresIn: '24h' }
    );

    // In production, send verification email here
    console.log(`Verification link: /api/auth/verify-email?token=${verificationToken}`);

    // Generate auth token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'lightdom-secret-key',
      { expiresIn: '7d' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      user: userWithoutPassword,
      token,
      verificationRequired: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * Login with email/password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date().toISOString();

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'lightdom-secret-key',
      { expiresIn: '7d' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword,
      token,
      requiresOnboarding: !user.onboardingCompleted
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * Google OAuth initialization
 */
router.get('/google', (req, res) => {
  // In production, redirect to Google OAuth
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback')}&` +
    `response_type=code&` +
    `scope=email profile&` +
    `state=${crypto.randomBytes(16).toString('hex')}`;

  res.json({
    authUrl: googleAuthUrl,
    message: 'Redirect user to authUrl for Google authentication'
  });
});

/**
 * Google OAuth callback
 */
router.get('/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    // In production, exchange code for tokens with Google
    // Mock user data for demo
    const googleUser = {
      email: 'user@example.com',
      name: 'Google User',
      picture: 'https://lh3.googleusercontent.com/a/default-user',
      verified: true
    };

    // Check if user exists
    let user = users.get(googleUser.email);

    if (!user) {
      // Create new user from Google data
      user = {
        id: crypto.randomUUID(),
        email: googleUser.email,
        username: googleUser.email.split('@')[0],
        name: googleUser.name,
        avatar: googleUser.picture,
        role: 'user',
        plan: 'free',
        provider: 'google',
        createdAt: new Date().toISOString(),
        verified: true,
        onboardingCompleted: false
      };

      users.set(googleUser.email, user);
    }

    // Update last login
    user.lastLogin = new Date().toISOString();

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'lightdom-secret-key',
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token
    res.redirect(`http://localhost:3000/auth/callback?token=${token}`);

  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect('http://localhost:3000/login?error=oauth_failed');
  }
});

/**
 * GitHub OAuth initialization
 */
router.get('/github', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${process.env.GITHUB_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.GITHUB_REDIRECT_URI || 'http://localhost:3001/api/auth/github/callback')}&` +
    `scope=user:email&` +
    `state=${crypto.randomBytes(16).toString('hex')}`;

  res.json({
    authUrl: githubAuthUrl,
    message: 'Redirect user to authUrl for GitHub authentication'
  });
});

/**
 * GitHub OAuth callback
 */
router.get('/github/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    // In production, exchange code for tokens with GitHub
    // Mock user data for demo
    const githubUser = {
      email: 'user@example.com',
      name: 'GitHub User',
      avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
      verified: true
    };

    // Similar logic to Google OAuth
    let user = users.get(githubUser.email);

    if (!user) {
      user = {
        id: crypto.randomUUID(),
        email: githubUser.email,
        username: githubUser.email.split('@')[0],
        name: githubUser.name,
        avatar: githubUser.avatar_url,
        role: 'user',
        plan: 'free',
        provider: 'github',
        createdAt: new Date().toISOString(),
        verified: true,
        onboardingCompleted: false
      };

      users.set(githubUser.email, user);
    }

    user.lastLogin = new Date().toISOString();

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'lightdom-secret-key',
      { expiresIn: '7d' }
    );

    res.redirect(`http://localhost:3000/auth/callback?token=${token}`);

  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.redirect('http://localhost:3000/login?error=oauth_failed');
  }
});

/**
 * Verify email token
 */
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token required' });
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'lightdom-secret-key'
    );

    // Find and update user
    const user = Array.from(users.values()).find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.verified = true;
    user.verifiedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(400).json({ error: 'Invalid or expired verification token' });
  }
});

/**
 * Get current user
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = Array.from(users.values()).find(u => u.id === req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

/**
 * Logout (client-side token removal, server-side token blacklist in production)
 */
router.post('/logout', authenticateToken, async (req, res) => {
  // In production, add token to blacklist/Redis
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * Authentication middleware
 */
function authenticateToken(req, res, next) {
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
}

export default router;
export { authenticateToken };
