import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { deriveBaseUrl } from '../services/githubClient';
import type { AuthState } from '../types';

interface AuthContextValue {
  authState: AuthState | null;
  login: (token: string, enterprise: string, hostname?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Token is stored ONLY in React state — never in localStorage, sessionStorage, or cookies.
  const [authState, setAuthState] = useState<AuthState | null>(null);

  // Keep a mutable ref so the beforeunload handler can clear it without stale closures.
  const authRef = useRef<AuthState | null>(null);
  authRef.current = authState;

  const logout = useCallback(() => {
    setAuthState(null);
  }, []);

  const login = useCallback(
    (token: string, enterprise: string, hostname = 'github.com') => {
      const baseUrl = deriveBaseUrl(hostname);
      setAuthState({ token, enterprise, baseUrl });
    },
    []
  );

  // Zero out the token from memory when the user closes or navigates away from the tab.
  useEffect(() => {
    const handleUnload = () => {
      logout();
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [logout]);

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to consume the auth context. Throws if used outside AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
