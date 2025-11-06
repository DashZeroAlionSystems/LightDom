/**
 * Authentication Controllers
 * Handle user authentication and profile management
 */

import { successResponse, createdResponse } from '../utils/response.js';
import { ApiError } from '../utils/ApiError.js';
import * as authService from '../services/auth.service.js';

/**
 * User signup
 */
export const signup = async (req, res) => {
  const { name, email, password, walletAddress, agreeToTerms } = req.body;
  
  // Validate required fields
  if (!name || !email || !password || !agreeToTerms) {
    throw new ApiError(400, 'Missing required fields');
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, 'Invalid email format');
  }
  
  // Validate password strength
  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }
  
  const result = await authService.createUser({
    name,
    email,
    password,
    walletAddress,
  });
  
  createdResponse(res, result, 'Account created successfully');
};

/**
 * User login
 */
export const login = async (req, res) => {
  const { email, password, remember } = req.body;
  
  // Validate required fields
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }
  
  const result = await authService.loginUser(email, password);
  
  successResponse(res, result, 'Login successful');
};

/**
 * Forgot password
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    throw new ApiError(400, 'Email is required');
  }
  
  await authService.requestPasswordReset(email);
  
  successResponse(res, {}, 'Password reset email sent');
};

/**
 * Reset password
 */
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  
  if (!token || !password) {
    throw new ApiError(400, 'Token and password are required');
  }
  
  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }
  
  await authService.resetPassword(token, password);
  
  successResponse(res, {}, 'Password reset successfully');
};

/**
 * Verify email
 */
export const verifyEmail = async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    throw new ApiError(400, 'Verification token is required');
  }
  
  await authService.verifyEmail(token);
  
  successResponse(res, {}, 'Email verified successfully');
};

/**
 * Get user profile
 */
export const getProfile = async (req, res) => {
  const userId = req.user.id;
  
  const user = await authService.getUserProfile(userId);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  successResponse(res, { user }, 'Profile retrieved');
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const updates = req.body;
  
  const updatedUser = await authService.updateUserProfile(userId, updates);
  
  successResponse(res, { user: updatedUser }, 'Profile updated successfully');
};

/**
 * Logout user
 */
export const logout = async (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // Here we could invalidate tokens if using a token blacklist
  
  successResponse(res, {}, 'Logout successful');
};

export default {
  signup,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getProfile,
  updateProfile,
  logout,
};
