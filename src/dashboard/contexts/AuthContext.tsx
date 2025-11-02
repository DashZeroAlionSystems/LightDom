/**
 * Authentication Context
 * 
 * Manages user authentication state across the dashboard
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // API base URL
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Set default axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(() => {
      refreshToken().catch(console.error);
    }, 23 * 60 * 60 * 1000); // Refresh every 23 hours (token expires in 24h)

    return () => clearInterval(refreshInterval);
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password,
      });

      const { token, user: userData } = response.data;

      // Store token and user
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/signup`, {
        email,
        password,
        name,
      });

      const { token, user: userData } = response.data;

      // Store token and user
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(userData);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');

    // Clear axios header
    delete axios.defaults.headers.common['Authorization'];

    setUser(null);
  };

  const refreshToken = async () => {
    try {
      const currentToken = localStorage.getItem('auth_token');
      if (!currentToken) return;

      const response = await axios.post(`${API_BASE}/auth/refresh`, {
        token: currentToken,
      });

      const { token: newToken } = response.data;

      // Update stored token
      localStorage.setItem('auth_token', newToken);

      // Update axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
