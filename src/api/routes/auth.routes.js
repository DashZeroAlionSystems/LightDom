/**
 * Authentication Routes
 * User authentication and profile management endpoints
 */

import express from 'express';
import { catchAsync } from '../utils/response.js';
import { auth } from '../middlewares/auth.js';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', catchAsync(authController.signup));

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', catchAsync(authController.login));

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', catchAsync(authController.forgotPassword));

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', catchAsync(authController.resetPassword));

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.post('/verify-email', catchAsync(authController.verifyEmail));

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile
 * @access  Protected
 */
router.get('/profile', auth, catchAsync(authController.getProfile));

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Protected
 */
router.put('/profile', auth, catchAsync(authController.updateProfile));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Protected
 */
router.post('/logout', auth, catchAsync(authController.logout));

export default router;
