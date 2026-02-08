import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (err) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, isAdmin = false) => {
    const endpoint = isAdmin ? '/auth/admin/login' : '/auth/vendor/login';
    const response = await api.post(endpoint, { email, password });
    const { token, user: userData } = response.data;
    localStorage.setItem('token', token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    setUser(null);
  };

  const loginAsVendor = async (vendorId) => {
    const currentToken = localStorage.getItem('token');
    localStorage.setItem('adminToken', currentToken);
    const response = await api.post(`/auth/admin/impersonate/${vendorId}`);
    const { token, user: vendorUser } = response.data;
    localStorage.setItem('token', token);
    setUser(vendorUser);
  };

  const returnToAdmin = async () => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) return;
    localStorage.setItem('token', adminToken);
    localStorage.removeItem('adminToken');
    const response = await api.get('/auth/me');
    setUser(response.data);
  };

  const isImpersonating = !!localStorage.getItem('adminToken');

  const value = {
    user,
    loading,
    login,
    logout,
    loginAsVendor,
    returnToAdmin,
    isImpersonating,
    isAuthenticated: !!user,
    isVendor: user?.role === 'vendor',
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
