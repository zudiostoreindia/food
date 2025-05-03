'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      loadUser(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUser = async (authToken: string) => {
    try {
      setIsLoading(true);
      
      const config = {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      };
      
      const response = await axios.get(`${API_URL}/auth/me`, config);
      
      setUser(response.data);
      setToken(authToken);
      setError(null);
    } catch (err) {
      console.error('Error loading user:', err);
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      
      setUser(user);
      setToken(token);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        phone,
        password
      });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      
      setUser(user);
      setToken(token);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
