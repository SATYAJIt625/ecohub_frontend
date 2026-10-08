'use client';

/**
 * Auth Context
 * Provides global authentication state management
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('ecohub_token');
    const saved  = localStorage.getItem('ecohub_user');
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('ecohub_token', data.token);
    localStorage.setItem('ecohub_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem('ecohub_token', data.token);
    localStorage.setItem('ecohub_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ecohub_token');
    localStorage.removeItem('ecohub_user');
    setUser(null);
  }, []);

  const isAdmin      = user?.role === 'admin';
  const isTreasurer  = user?.role === 'treasurer';
  const canEdit      = isAdmin || isTreasurer;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isTreasurer, canEdit }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
