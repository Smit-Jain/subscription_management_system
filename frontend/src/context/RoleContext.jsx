// ─── AuthContext — replaces the old mock RoleContext ─────────────────────────
// Exposes: user, role, isAuthenticated, logout()
// Also keeps useRole() for backward-compat with pages that used it.
// ─────────────────────────────────────────────────────────────────────────────
import { createContext, useContext, useState, useCallback } from 'react';

const TOKEN_KEY = 'brightloop_token';
const USER_KEY  = 'brightloop_user';

const AuthContext = createContext(null);

export const ROLES = {
  ADMIN:    'admin',
  STAFF:    'staff',
  CUSTOMER: 'customer',
};

function readUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
}

function readToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(() => readUser());
  const [token, setToken] = useState(() => readToken());

  const isAuthenticated = !!token && !!user;
  // Normalize role to lowercase for nav filtering
  const role = user?.role?.toLowerCase() || 'guest';

  const saveAuth = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY,  JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken('');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, role, isAuthenticated, saveAuth, logout, ROLES }}>
      {children}
    </AuthContext.Provider>
  );
}

// Primary hook
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Backward-compat alias — AdminLayout and pages use useRole()
export function useRole() {
  return useAuth();
}

// Keep old RoleProvider name so Providers.jsx import still works
export const RoleProvider = AuthProvider;
