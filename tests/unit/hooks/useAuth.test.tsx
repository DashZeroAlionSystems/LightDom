import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../../../src/hooks/useAuth';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  describe('initial state', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should load user from localStorage on mount', () => {
      const mockUser = {
        id: 'user_1',
        email: 'test@example.com',
        username: 'testuser',
        wallet_address: '0x123...',
        created_at: '2023-01-01T00:00:00Z',
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockUser = {
        id: 'user_1',
        email: 'test@example.com',
        username: 'testuser',
        wallet_address: '0x123...',
        created_at: '2023-01-01T00:00:00Z',
      };
      const mockResponse = {
        success: true,
        user: mockUser,
        token: 'mock-jwt-token',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'mock-jwt-token');
    });

    it('should handle login error', async () => {
      const mockError = { message: 'Invalid credentials' };
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(mockError),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login('test@example.com', 'wrongpassword');
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Invalid credentials');
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Network error');
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const mockUser = {
        id: 'user_1',
        email: 'test@example.com',
        username: 'testuser',
        wallet_address: '0x123...',
        created_at: '2023-01-01T00:00:00Z',
      };
      const mockResponse = {
        success: true,
        user: mockUser,
        token: 'mock-jwt-token',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.register({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
          confirmPassword: 'password123',
        });
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle registration error', async () => {
      const mockError = { message: 'Email already exists' };
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(mockError),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.register({
          email: 'existing@example.com',
          username: 'existinguser',
          password: 'password123',
          confirmPassword: 'password123',
        });
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Email already exists');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const mockUser = {
        id: 'user_1',
        email: 'test@example.com',
        username: 'testuser',
        wallet_address: '0x123...',
        created_at: '2023-01-01T00:00:00Z',
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const mockUser = {
        id: 'user_1',
        email: 'test@example.com',
        username: 'testuser',
        wallet_address: '0x123...',
        created_at: '2023-01-01T00:00:00Z',
      };
      const updatedUser = {
        ...mockUser,
        username: 'updateduser',
      };
      const mockResponse = {
        success: true,
        user: updatedUser,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser));
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.updateProfile({ username: 'updateduser' });
      });

      expect(result.current.user).toEqual(updatedUser);
      expect(result.current.error).toBeNull();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(updatedUser));
    });

    it('should handle profile update error', async () => {
      const mockUser = {
        id: 'user_1',
        email: 'test@example.com',
        username: 'testuser',
        wallet_address: '0x123...',
        created_at: '2023-01-01T00:00:00Z',
      };
      const mockError = { message: 'Username already taken' };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser));
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(mockError),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.updateProfile({ username: 'takenusername' });
      });

      expect(result.current.user).toEqual(mockUser); // Should remain unchanged
      expect(result.current.error).toBe('Username already taken');
    });
  });

  describe('connectWallet', () => {
    it('should connect wallet successfully', async () => {
      const mockUser = {
        id: 'user_1',
        email: 'test@example.com',
        username: 'testuser',
        wallet_address: null,
        created_at: '2023-01-01T00:00:00Z',
      };
      const updatedUser = {
        ...mockUser,
        wallet_address: '0x123...',
      };
      const mockResponse = {
        success: true,
        user: updatedUser,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser));
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.connectWallet('0x123...');
      });

      expect(result.current.user).toEqual(updatedUser);
      expect(result.current.error).toBeNull();
    });

    it('should handle wallet connection error', async () => {
      const mockUser = {
        id: 'user_1',
        email: 'test@example.com',
        username: 'testuser',
        wallet_address: null,
        created_at: '2023-01-01T00:00:00Z',
      };
      const mockError = { message: 'Invalid wallet address' };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser));
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(mockError),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.connectWallet('invalid-address');
      });

      expect(result.current.user).toEqual(mockUser); // Should remain unchanged
      expect(result.current.error).toBe('Invalid wallet address');
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});