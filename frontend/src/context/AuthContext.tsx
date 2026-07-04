'use strict';
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  role: 'student' | 'recruiter' | 'admin';
  name: string;
  profilePic?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  verifyOtp: (email: string, otp: string) => Promise<any>;
  logout: () => void;
  mockLogin: (role: 'student' | 'recruiter' | 'admin') => void;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setAccessToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    let token = accessToken || localStorage.getItem('accessToken');
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>)
    };
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      let response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
      });

      // Auto-refresh token if expired (401/403) and not calling login or token endpoint
      if ((response.status === 401 || response.status === 403) && endpoint !== '/auth/login' && endpoint !== '/auth/refresh-token') {
        const refresh = localStorage.getItem('refreshToken');
        
        const forceRelogin = () => {
          if (typeof window !== 'undefined' && !(window as any)._isRedirectingToLogin) {
            (window as any)._isRedirectingToLogin = true;
            console.warn('Session expired or mock token detected. Redirecting to login...');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setAccessToken(null);
            setUser(null);
            router.push('/login');
            // reset after a small delay in case they navigate back
            setTimeout(() => { (window as any)._isRedirectingToLogin = false; }, 2000);
          }
          return new Promise(() => {}); // Halt execution to prevent Next.js error overlay
        };

        if (refresh && !refresh.startsWith('mock_')) {
          try {
            const refreshRes = await fetch(`${API_URL}/auth/refresh-token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: refresh })
            });

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              localStorage.setItem('accessToken', refreshData.accessToken);
              localStorage.setItem('refreshToken', refreshData.refreshToken);
              setAccessToken(refreshData.accessToken);

              // Retry the original query with the new token
              headers['Authorization'] = `Bearer ${refreshData.accessToken}`;
              response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers
              });
            } else {
              return forceRelogin();
            }
          } catch (e: any) {
            console.error('Failed to auto-refresh session:', e);
          }
        } else {
          return forceRelogin();
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      console.warn(`API Connection to ${endpoint} failed. Falling back to local data simulations.`);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAccessToken(data.accessToken);
      setUser(data.user);
      return data;
    } catch (err) {
      // Fallback local matching
      if (email === 'student@example.com' && password === 'Password@123') {
        const localUser: User = { id: 'usr_student_1', email, role: 'student', name: 'Alex Rivera', profilePic: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150' };
        localStorage.setItem('accessToken', 'mock_token_student');
        localStorage.setItem('user', JSON.stringify(localUser));
        setAccessToken('mock_token_student');
        setUser(localUser);
        return { user: localUser };
      } 
      if (email === 'recruiter@stripe.com' && password === 'Password@123') {
        const localUser: User = { id: 'usr_recruiter_1', email, role: 'recruiter', name: 'Sarah Chen', profilePic: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' };
        localStorage.setItem('accessToken', 'mock_token_recruiter');
        localStorage.setItem('user', JSON.stringify(localUser));
        setAccessToken('mock_token_recruiter');
        setUser(localUser);
        return { user: localUser };
      }
      if (email === 'admin@portal.com' && password === 'Password@123') {
        const localUser: User = { id: 'usr_admin_1', email, role: 'admin', name: 'Chief Administrator', profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' };
        localStorage.setItem('accessToken', 'mock_token_admin');
        localStorage.setItem('user', JSON.stringify(localUser));
        setAccessToken('mock_token_admin');
        setUser(localUser);
        return { user: localUser };
      }
      throw err;
    }
  };

  const register = async (formData: any) => {
    try {
      return await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
    } catch (err) {
      // Offline fallback simulation
      return {
        message: 'Registration simulated offline.',
        email: formData.email,
        otp: '123456'
      };
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const data = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp })
      });

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAccessToken(data.accessToken);
      setUser(data.user);
      return data;
    } catch (err) {
      if (otp === '123456' || otp === 'default') {
        const role = email.includes('recruiter') ? 'recruiter' : email.includes('admin') ? 'admin' : 'student';
        const localUser: User = {
          id: 'usr_' + Math.random().toString(36).substr(2, 9),
          email,
          role,
          name: email.split('@')[0]
        };
        localStorage.setItem('accessToken', 'mock_token');
        localStorage.setItem('user', JSON.stringify(localUser));
        setAccessToken('mock_token');
        setUser(localUser);
        return { user: localUser };
      }
      throw err;
    }
  };

  const mockLogin = (role: 'student' | 'recruiter' | 'admin') => {
    const mockUser: User = {
      id: role === 'student' ? 'usr_student_1' : role === 'recruiter' ? 'usr_recruiter_1' : 'usr_admin_1',
      email: `${role}@example.com`,
      role,
      name: role === 'student' ? 'Alex Rivera' : role === 'recruiter' ? 'Sarah Chen' : 'Portal Administrator',
      profilePic: role === 'student' 
        ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
        : role === 'recruiter'
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
        : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    };

    localStorage.setItem('accessToken', `mock_token_${role}`);
    localStorage.setItem('user', JSON.stringify(mockUser));
    setAccessToken(`mock_token_${role}`);
    setUser(mockUser);

    router.push(`/dashboard/${role}`);
  };

  const logout = () => {
    const refresh = localStorage.getItem('refreshToken');
    if (refresh && !refresh.startsWith('mock_')) {
      apiFetch('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ token: refresh })
      }).catch(() => {});
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setAccessToken(null);
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, verifyOtp, logout, mockLogin, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
