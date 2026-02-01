
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCRMStore } from './store';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  isLocked: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('crm_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const savedLock = localStorage.getItem('crm_lock_until');
    if (savedLock) {
      const until = parseInt(savedLock, 10);
      if (until > Date.now()) {
        setLockUntil(until);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (lockUntil && lockUntil > Date.now()) {
      return { success: false, error: `Too many failed attempts. Try again in ${Math.ceil((lockUntil - Date.now()) / 60000)} minutes.` };
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    const users = useCRMStore.getState().users;
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (foundUser && foundUser.password === password) {
      const { password: _, ...userSession } = foundUser;
      setUser(userSession);
      setAttempts(0);
      localStorage.setItem('crm_session', JSON.stringify(userSession));
      localStorage.removeItem('crm_lock_until');
      return { success: true };
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCK_TIME;
        setLockUntil(until);
        localStorage.setItem('crm_lock_until', until.toString());
        return { success: false, error: "Account locked for 15 minutes due to multiple failures." };
      }
      return { success: false, error: `Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempts remaining.` };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('crm_session');
  };

  const isLocked = !!(lockUntil && lockUntil > Date.now());

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isLocked }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
