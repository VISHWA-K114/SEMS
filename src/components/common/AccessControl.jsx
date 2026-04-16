import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * AccessControl Component
 * 
 * @param {Array} roles - List of roles that can see the children (e.g., ['admin', 'hr'])
 * @param {React.ReactNode} children - The UI elements to render if authorized
 * @param {React.ReactNode} fallback - (Optional) UI to render if not authorized
 */
const AccessControl = ({ roles, children, fallback = null }) => {
  const { user } = useAuth();

  if (!user) return fallback;

  // If no roles specified, or user role is in the list, render children
  if (!roles || roles.length === 0 || roles.includes(user.role)) {
    return <>{children}</>;
  }

  return fallback;
};

export default AccessControl;
