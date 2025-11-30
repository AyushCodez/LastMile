import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { decodeToken } from '../utils/jwt';
import type { DecodedToken } from '../utils/jwt';

type Role = 'RIDER' | 'DRIVER';

interface AuthState {
  token: string | null;
  userId: string | null;
  role: Role | null;
  expiresAt: number | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const emptyState: AuthState = {
  token: null,
  userId: null,
  role: null,
  expiresAt: null,
  loading: true, // Start loading by default
};

const persistSession = (decoded: DecodedToken, token: string) => {
  localStorage.setItem('token', token);
  localStorage.setItem('role', decoded.role);
  localStorage.setItem('userId', decoded.sub);
};

const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');
  localStorage.removeItem('driverId');
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(emptyState);

  const bootstrap = useCallback(() => {
    const jwt = localStorage.getItem('token');
    console.log('[AuthContext] Bootstrapping. Token in localStorage:', jwt ? 'Found' : 'Missing');

    if (!jwt) {
      setState(s => ({ ...emptyState, loading: false }));
      return;
    }

    const decoded = decodeToken(jwt);
    const isExpired = !decoded || decoded.exp * 1000 < Date.now();

    console.log('[AuthContext] Token status:', {
      valid: !!decoded,
      expired: isExpired,
      exp: decoded?.exp,
      now: Date.now() / 1000
    });

    if (!decoded || isExpired) {
      console.warn('[AuthContext] Token invalid or expired. Clearing session.');
      clearSession();
      setState(s => ({ ...emptyState, loading: false }));
      return;
    }

    setState({
      token: jwt,
      userId: decoded.sub,
      role: decoded.role as Role,
      expiresAt: decoded.exp * 1000,
      loading: false,
    });
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback((token: string) => {
    console.log('[AuthContext] Login called with token');
    const decoded = decodeToken(token);
    if (!decoded) {
      console.error('[AuthContext] Failed to decode token during login');
      throw new Error('Unable to decode JWT');
    }
    persistSession(decoded, token);
    setState({
      token,
      userId: decoded.sub,
      role: decoded.role as Role,
      expiresAt: decoded.exp * 1000,
      loading: false,
    });
  }, []);

  const logout = useCallback(() => {
    console.log('[AuthContext] Logout called');
    clearSession();
    setState(s => ({ ...emptyState, loading: false }));
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    ...state,
    isAuthenticated: Boolean(state.token),
    login,
    logout,
  }), [login, logout, state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
