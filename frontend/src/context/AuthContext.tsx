'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { triggerGlobalToast } from './SocketContext';

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
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  verifyOtp: (email: string, otp: string) => Promise<any>;
  logout: () => void;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const router = useRouter();

  const getBaseUrl = () => {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return rawUrl.replace(/\/$/, '');
  };

  const API_URL = process.env.NODE_ENV === 'production' 
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api` 
    : `${getBaseUrl()}/api`;

  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setAccessToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);

    // Detect if running in demo mode
    const hasBackend = !!process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== 'http://localhost:5000';
    if (!hasBackend) {
      setIsDemoMode(true);
    }

    const handleServerUnavailable = () => {
      setIsDemoMode(true);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('server-unavailable', handleServerUnavailable);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('server-unavailable', handleServerUnavailable);
      }
    };
  }, []);

  const apiFetch = async (endpoint: string, options: RequestInit = {}, retryCount = 1): Promise<any> => {
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

    // Abort controller for timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      let response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      // Auto-refresh token if expired (401/403) and not calling login or token endpoint
      if ((response.status === 401 || response.status === 403) && endpoint !== '/auth/login' && endpoint !== '/auth/refresh-token') {
        const refresh = localStorage.getItem('refreshToken');
        
        const forceRelogin = () => {
          if (typeof window !== 'undefined' && !(window as any)._isRedirectingToLogin) {
            (window as any)._isRedirectingToLogin = true;
            console.warn('Session expired. Redirecting to login...');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setAccessToken(null);
            setUser(null);
            router.push('/login');
            setTimeout(() => { (window as any)._isRedirectingToLogin = false; }, 2000);
          }
          return new Promise(() => {}); // Halt execution
        };

        if (refresh) {
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
        const errMsg = errorData.error || `HTTP error! Status: ${response.status}`;
        triggerGlobalToast("API Error", errMsg, "alert");
        throw new Error(errMsg);
      }

      return await response.json();
    } catch (err: any) {
      clearTimeout(timeoutId);
      
      // Retry once on failure
      if (retryCount > 0) {
        console.warn(`Retrying API fetch to: ${endpoint}`);
        return apiFetch(endpoint, options, retryCount - 1);
      }

      // Check if it is a server availability / network error
      const isNetworkError = err.name === 'AbortError' || err.message === 'Failed to fetch' || err.message?.includes('NetworkError');
      if (isNetworkError) {
        console.warn(`Server unavailable. Falling back to offline/demo simulation.`);
        setIsDemoMode(true);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('server-unavailable'));
        }
      } else {
        triggerGlobalToast("Fetch Error", err.message || "Network request failed.", "alert");
      }
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
      throw err;
    }
  };

  const register = async (formData: any) => {
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      // Auto-login: backend now returns tokens on registration
      if (data.accessToken && data.refreshToken && data.user) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        setAccessToken(data.accessToken);
        setUser(data.user);
      }

      return data;
    } catch (err) {
      throw err;
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
      throw err;
    }
  };

  const logout = () => {
    const refresh = localStorage.getItem('refreshToken');
    if (refresh) {
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
    <AuthContext.Provider value={{ user, accessToken, loading, isDemoMode, login, register, verifyOtp, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
