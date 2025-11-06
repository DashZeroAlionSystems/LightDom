/**
 * Authentication Service
 * Business logic for user authentication and management
 */

import { ApiError } from '../utils/ApiError.js';
import { getDatabase } from '../../config/database.js';
import config from '../../config/index.js';

// Dynamically import jsonwebtoken only when needed
let jwt = null;
const getJWT = async () => {
  if (!jwt) {
    try {
      const module = await import('jsonwebtoken');
      jwt = module.default;
    } catch (error) {
      console.warn('jsonwebtoken not installed, using mock tokens');
      // Return a mock JWT implementation
      jwt = {
        sign: (payload) => Buffer.from(JSON.stringify(payload)).toString('base64'),
        verify: (token) => JSON.parse(Buffer.from(token, 'base64').toString()),
      };
    }
  }
  return jwt;
};

/**
 * Create a new user
 */
export const createUser = async ({ name, email, password, walletAddress }) => {
  const db = getDatabase();
  
  // Check if user already exists
  const existingUser = await checkUserExists(email);
  if (existingUser) {
    throw new ApiError(400, 'User already exists with this email');
  }
  
  // In a real implementation, hash the password with bcrypt
  // const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);
  
  // Create new user object
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    walletAddress: walletAddress || null,
    createdAt: new Date().toISOString(),
    isVerified: false,
    profile: {
      avatar: null,
      bio: '',
      location: '',
      website: ''
    },
    stats: {
      totalOptimizations: 0,
      tokensEarned: 0,
      spaceSaved: 0,
      reputation: 0,
      level: 1
    },
    preferences: {
      notifications: true,
      emailUpdates: true,
      darkMode: false
    }
  };
  
  // In a real implementation, save to database
  // await db.query('INSERT INTO users ...', [newUser]);
  
  // Generate JWT token
  const token = generateJWT(newUser);
  
  // Send verification email (mock)
  await sendVerificationEmail(email, newUser.id);
  
  return {
    token,
    user: newUser
  };
};

/**
 * Login user
 */
export const loginUser = async (email, password) => {
  // Mock authentication - in real implementation, verify password with bcrypt
  const user = await authenticateUser(email, password);
  
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }
  
  // Generate JWT token
  const token = generateJWT(user);
  
  // Update last login
  user.lastLogin = new Date().toISOString();
  
  return {
    token,
    user
  };
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (email) => {
  // Check if user exists
  const user = await checkUserExists(email);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  // Generate reset token
  const resetToken = generateResetToken(user.id);
  
  // Send reset email (mock)
  await sendPasswordResetEmail(email, resetToken);
  
  return true;
};

/**
 * Reset password with token
 */
export const resetPassword = async (token, password) => {
  // Validate reset token
  const userId = await validateResetToken(token);
  if (!userId) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }
  
  // Update password (in real implementation, hash with bcrypt)
  await updateUserPassword(userId, password);
  
  return true;
};

/**
 * Verify email with token
 */
export const verifyEmail = async (token) => {
  // Validate verification token
  const userId = await validateVerificationToken(token);
  if (!userId) {
    throw new ApiError(400, 'Invalid or expired verification token');
  }
  
  // Mark user as verified
  await verifyUser(userId);
  
  return true;
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
  const db = getDatabase();
  
  // In real implementation, get from database
  // const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  
  // Mock user data
  return {
    id: userId,
    name: 'Mock User',
    email: 'user@example.com',
    isVerified: true,
    profile: {
      avatar: null,
      bio: '',
      location: '',
      website: ''
    },
    stats: {
      totalOptimizations: 0,
      tokensEarned: 0,
      spaceSaved: 0,
      reputation: 0,
      level: 1
    }
  };
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
  const db = getDatabase();
  
  // In real implementation, update database
  // await db.query('UPDATE users SET ... WHERE id = $1', [userId]);
  
  // Get updated user
  const user = await getUserProfile(userId);
  
  // Apply updates (mock)
  return {
    ...user,
    profile: {
      ...user.profile,
      ...updates.profile
    },
    preferences: {
      ...user.preferences,
      ...updates.preferences
    }
  };
};

// Helper functions

/**
 * Check if user exists by email
 */
const checkUserExists = async (email) => {
  const db = getDatabase();
  
  // In real implementation, query database
  // const result = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  // return result.rows.length > 0 ? result.rows[0] : null;
  
  // Mock - return null (user doesn't exist)
  return null;
};

/**
 * Authenticate user with email and password
 */
const authenticateUser = async (email, password) => {
  const db = getDatabase();
  
  // In real implementation:
  // 1. Get user from database by email
  // 2. Compare password with bcrypt.compare(password, user.hashedPassword)
  // 3. Return user if valid, null otherwise
  
  // Mock - return a fake user for testing
  return {
    id: '1',
    name: 'Test User',
    email: email,
    isVerified: true,
    profile: {
      avatar: null,
      bio: '',
      location: '',
      website: ''
    },
    stats: {
      totalOptimizations: 0,
      tokensEarned: 0,
      spaceSaved: 0,
      reputation: 0,
      level: 1
    }
  };
};

/**
 * Generate JWT token for user
 */
const generateJWT = async (user) => {
  if (!config.security.jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }
  
  const jwtLib = await getJWT();
  
  return jwtLib.sign(
    {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin || false,
    },
    config.security.jwtSecret,
    {
      expiresIn: config.security.jwtExpiresIn,
    }
  );
};

/**
 * Generate password reset token
 */
const generateResetToken = async (userId) => {
  const jwtLib = await getJWT();
  // In real implementation, generate a secure token and store in database
  return jwtLib.sign({ userId, type: 'reset' }, config.security.jwtSecret, {
    expiresIn: '1h',
  });
};

/**
 * Validate reset token
 */
const validateResetToken = async (token) => {
  try {
    const jwtLib = await getJWT();
    const decoded = jwtLib.verify(token, config.security.jwtSecret);
    if (decoded.type !== 'reset') {
      return null;
    }
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

/**
 * Generate verification token
 */
const generateVerificationToken = async (userId) => {
  const jwtLib = await getJWT();
  return jwtLib.sign({ userId, type: 'verify' }, config.security.jwtSecret, {
    expiresIn: '24h',
  });
};

/**
 * Validate verification token
 */
const validateVerificationToken = async (token) => {
  try {
    const jwtLib = await getJWT();
    const decoded = jwtLib.verify(token, config.security.jwtSecret);
    if (decoded.type !== 'verify') {
      return null;
    }
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

/**
 * Update user password
 */
const updateUserPassword = async (userId, password) => {
  const db = getDatabase();
  
  // In real implementation:
  // 1. Hash password with bcrypt
  // 2. Update in database
  // await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
  
  return true;
};

/**
 * Mark user as verified
 */
const verifyUser = async (userId) => {
  const db = getDatabase();
  
  // In real implementation:
  // await db.query('UPDATE users SET is_verified = true WHERE id = $1', [userId]);
  
  return true;
};

/**
 * Send verification email
 */
const sendVerificationEmail = async (email, userId) => {
  // In real implementation, send email with verification link
  const token = generateVerificationToken(userId);
  console.log(`Verification email would be sent to ${email} with token: ${token}`);
  return true;
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, token) => {
  // In real implementation, send email with reset link
  console.log(`Password reset email would be sent to ${email} with token: ${token}`);
  return true;
};

export default {
  createUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  getUserProfile,
  updateUserProfile,
};
