import request from 'supertest';
import { Express } from 'express';

// Mock the Express app
const mockApp = {
  post: jest.fn(),
  get: jest.fn(),
  use: jest.fn(),
  listen: jest.fn(),
} as unknown as Express;

// Mock database
const mockDb = {
  query: jest.fn(),
};

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password, hash) => Promise.resolve(hash === `hashed_${password}`)),
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-jwt-token'),
  verify: jest.fn(() => ({ userId: 'user_1' })),
}));

describe('Auth API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const mockUser = {
        id: 'user_1',
        email: userData.email,
        username: userData.username,
        wallet_address: null,
        created_at: new Date().toISOString(),
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [], // No existing user
      }).mockResolvedValueOnce({
        rows: [mockUser],
      });

      const response = await request(mockApp)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        user: {
          id: expect.any(String),
          email: userData.email,
          username: userData.username,
          wallet_address: null,
          created_at: expect.any(String),
        },
        token: expect.any(String),
      });

      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = $1 OR username = $2',
        [userData.email, userData.username]
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        'INSERT INTO users (email, username, password_hash, wallet_address) VALUES ($1, $2, $3, $4) RETURNING *',
        [userData.email, userData.username, expect.any(String), null]
      );
    });

    it('should return error if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        username: 'newuser',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const existingUser = {
        id: 'user_1',
        email: userData.email,
        username: 'existinguser',
        wallet_address: null,
        created_at: new Date().toISOString(),
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [existingUser],
      });

      const response = await request(mockApp)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Email or username already exists',
      });
    });

    it('should return error if username already exists', async () => {
      const userData = {
        email: 'new@example.com',
        username: 'existinguser',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const existingUser = {
        id: 'user_1',
        email: 'existing@example.com',
        username: userData.username,
        wallet_address: null,
        created_at: new Date().toISOString(),
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [existingUser],
      });

      const response = await request(mockApp)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Email or username already exists',
      });
    });

    it('should return error if passwords do not match', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'differentpassword',
      };

      const response = await request(mockApp)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Passwords do not match',
      });
    });

    it('should return error for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const response = await request(mockApp)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid email format',
      });
    });

    it('should return error for weak password', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: '123',
        confirmPassword: '123',
      };

      const response = await request(mockApp)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Password must be at least 8 characters long',
      });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with email', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user_1',
        email: loginData.email,
        username: 'testuser',
        password_hash: 'hashed_password123',
        wallet_address: null,
        created_at: new Date().toISOString(),
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [mockUser],
      });

      const response = await request(mockApp)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          wallet_address: mockUser.wallet_address,
          created_at: mockUser.created_at,
        },
        token: expect.any(String),
      });

      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = $1',
        [loginData.email]
      );
    });

    it('should login successfully with username', async () => {
      const loginData = {
        username: 'testuser',
        password: 'password123',
      };

      const mockUser = {
        id: 'user_1',
        email: 'test@example.com',
        username: loginData.username,
        password_hash: 'hashed_password123',
        wallet_address: null,
        created_at: new Date().toISOString(),
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [mockUser],
      });

      const response = await request(mockApp)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          wallet_address: mockUser.wallet_address,
          created_at: mockUser.created_at,
        },
        token: expect.any(String),
      });

      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE username = $1',
        [loginData.username]
      );
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: 'user_1',
        email: loginData.email,
        username: 'testuser',
        password_hash: 'hashed_password123',
        wallet_address: null,
        created_at: new Date().toISOString(),
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [mockUser],
      });

      const response = await request(mockApp)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid credentials',
      });
    });

    it('should return error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [],
      });

      const response = await request(mockApp)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid credentials',
      });
    });

    it('should return error for missing credentials', async () => {
      const response = await request(mockApp)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Email/username and password are required',
      });
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(mockApp)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Logged out successfully',
      });
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const mockUser = {
        id: 'user_1',
        email: 'test@example.com',
        username: 'testuser',
        wallet_address: '0x123...',
        created_at: new Date().toISOString(),
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [mockUser],
      });

      const response = await request(mockApp)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        user: mockUser,
      });

      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT id, email, username, wallet_address, created_at FROM users WHERE id = $1',
        ['user_1']
      );
    });

    it('should return error for invalid token', async () => {
      const response = await request(mockApp)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid token',
      });
    });

    it('should return error for missing token', async () => {
      const response = await request(mockApp)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: 'No token provided',
      });
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        username: 'newusername',
        email: 'newemail@example.com',
      };

      const updatedUser = {
        id: 'user_1',
        email: updateData.email,
        username: updateData.username,
        wallet_address: '0x123...',
        created_at: new Date().toISOString(),
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [], // No conflicts
      }).mockResolvedValueOnce({
        rows: [updatedUser],
      });

      const response = await request(mockApp)
        .put('/api/auth/profile')
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        user: updatedUser,
      });
    });

    it('should return error for conflicting username', async () => {
      const updateData = {
        username: 'existingusername',
      };

      const existingUser = {
        id: 'user_2',
        email: 'other@example.com',
        username: updateData.username,
        wallet_address: null,
        created_at: new Date().toISOString(),
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [existingUser],
      });

      const response = await request(mockApp)
        .put('/api/auth/profile')
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(updateData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Username already exists',
      });
    });
  });

  describe('POST /api/auth/connect-wallet', () => {
    it('should connect wallet successfully', async () => {
      const walletData = {
        wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
      };

      const updatedUser = {
        id: 'user_1',
        email: 'test@example.com',
        username: 'testuser',
        wallet_address: walletData.wallet_address,
        created_at: new Date().toISOString(),
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [], // No conflicts
      }).mockResolvedValueOnce({
        rows: [updatedUser],
      });

      const response = await request(mockApp)
        .post('/api/auth/connect-wallet')
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(walletData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        user: updatedUser,
      });
    });

    it('should return error for invalid wallet address', async () => {
      const walletData = {
        wallet_address: 'invalid-address',
      };

      const response = await request(mockApp)
        .post('/api/auth/connect-wallet')
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(walletData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid wallet address format',
      });
    });

    it('should return error for already connected wallet', async () => {
      const walletData = {
        wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
      };

      const existingUser = {
        id: 'user_2',
        email: 'other@example.com',
        username: 'otheruser',
        wallet_address: walletData.wallet_address,
        created_at: new Date().toISOString(),
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [existingUser],
      });

      const response = await request(mockApp)
        .post('/api/auth/connect-wallet')
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(walletData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Wallet address already connected to another account',
      });
    });
  });
});