import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, getAuthToken, setAuthToken, removeAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile if we have a token
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      // Decode JWT roughly to know type, or just call /parent/profile
      // We'll call /parent/profile to get verified status too
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await apiFetch('/parent/profile');
      setUser(data);
    } catch (err) {
      console.error('Failed to load profile', err);
      removeAuthToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setAuthToken(res.token);
    
    // Only fetch profile if it's a parent/past_student.
    if (res.type === 'parent' || res.type === 'past_student' || !res.type) {
      await fetchProfile();
    } else {
      setUser({ type: res.type, role: res.role });
    }
    return res;
  };

  const register = async (userData) => {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    return res;
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
