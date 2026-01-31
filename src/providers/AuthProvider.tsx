'use client';

import { createContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { api, getToken, setToken, clearToken } from '@/lib/api';
import type { AdminDto } from '@/types/api';

interface AuthContextValue {
  admin: AdminDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [admin, setAdmin] = useState<AdminDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      api.auth.me()
        .then((response) => {
          setAdmin(response.admin);
        })
        .catch(() => {
          clearToken();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.auth.login(email, password);
    setToken(response.token);
    setAdmin(response.admin);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({
      admin,
      isLoading,
      isAuthenticated: !!admin,
      login,
      logout,
    }),
    [admin, isLoading, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
