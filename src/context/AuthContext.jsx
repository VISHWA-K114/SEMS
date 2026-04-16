import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true on first load to check token

  // On mount — restore user from localStorage or verify token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('sems_token');
      const stored = localStorage.getItem('sems_user');

      if (token && stored) {
        try {
          setUser(JSON.parse(stored));
          // Optionally re-verify token with the server
          const data = await authService.getMe();
          setUser(data.user);
          localStorage.setItem('sems_user', JSON.stringify(data.user));
        } catch {
          localStorage.removeItem('sems_token');
          localStorage.removeItem('sems_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login({ email, password });
    localStorage.setItem('sems_token', data.token);
    localStorage.setItem('sems_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (fullName, email, password) => {
    const data = await authService.register({ fullName, email, password });
    localStorage.setItem('sems_token', data.token);
    localStorage.setItem('sems_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sems_token');
    localStorage.removeItem('sems_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;
