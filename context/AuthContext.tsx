import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { storageService } from '../services/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as any);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storageService.getCurrentUser().then(u => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const login = async (email: string, pass: string) => {
    const u = await storageService.login(email, pass);
    setUser(u);
  };

  const register = async (name: string, email: string, pass: string) => {
    const u = await storageService.register(name, email, pass);
    setUser(u);
  };

  const logout = () => {
    storageService.logout().then(() => setUser(null));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};