'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, logOut, logIn, signUp, resetPassword } from '@/lib/auth';
import { getUserByUid, createUser } from '@/lib/firestore';

interface AuthContextType {
  user: User | null;
  userData: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPass: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      setUser(u);
      if (u) setUserData(await getUserByUid(u.uid));
      else setUserData(null);
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => { await logIn(email, password); };
  const signup = async (email: string, password: string, username: string) => {
    const fbUser = await signUp(email, password, username);
    await createUser(fbUser.uid, { uid: fbUser.uid, email, username, displayName: username, avatarUrl: '' });
  };
  const logout = async () => { await logOut(); setUser(null); setUserData(null); };
  const resetPass = async (email: string) => { await resetPassword(email); };

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, signup, logout, resetPass }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
