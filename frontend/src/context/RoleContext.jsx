import { createContext, useContext, useState, useEffect } from 'react';

// TODO(A): Replace this entire context with real auth context once authentication is implemented.
// The real context should expose: user, role, login(), logout(), isAuthenticated.
// Keep the same useRole() hook signature so pages don't need to change.

const RoleContext = createContext(null);

export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  CUSTOMER: 'customer',
};

export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => {
    return localStorage.getItem('brightloop_demo_role') || ROLES.ADMIN;
  });

  const switchRole = (newRole) => {
    setRole(newRole);
    localStorage.setItem('brightloop_demo_role', newRole);
  };

  return (
    <RoleContext.Provider value={{ role, switchRole, ROLES }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
