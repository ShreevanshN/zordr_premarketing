import { createContext, useContext, useState, useEffect } from 'react';
import { seedUser } from '../data/seed';
import { LS_KEYS } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(LS_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  });

  const login = (email, password) => {
    if (email === seedUser.email && password === seedUser.password) {
      const u = { id: seedUser.id, name: seedUser.name, email: seedUser.email, role: seedUser.role };
      localStorage.setItem(LS_KEYS.USER, JSON.stringify(u));
      setUser(u);
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password.' };
  };

  const logout = () => {
    localStorage.removeItem(LS_KEYS.USER);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
