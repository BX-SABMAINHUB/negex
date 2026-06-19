'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, logOut, logIn, signUp, resetPassword } from '@/lib/auth';
import { getUserByUid, createUser } from '@/lib/firestore';
import { UserData } from '@/types';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPass: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const withTimeout = <T,>(promise: Promise<T>, ms: number, msg: string): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(msg)), ms)),
  ]);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const data = await getUserByUid(firebaseUser.uid);
          setUserData(data as UserData | null);
        } catch {
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    await withTimeout(logIn(email, password), 15000, 'Tiempo de espera agotado al iniciar sesión');
  };

  const signup = async (email: string, password: string, username: string) => {
    const fbUser = await withTimeout(
      signUp(email, password, username),
      15000,
      'Tiempo de espera agotado al crear la cuenta'
    );
    await withTimeout(
      createUser(fbUser.uid, {
        uid: fbUser.uid,
        email,
        username,
        displayName: username,
        avatarUrl: '',
      }),
      10000,
      'No se pudo guardar el perfil en la base de datos'
    );
  };

  const logout = async () => {
    await logOut();
    setUser(null);
    setUserData(null);
  };

  const resetPass = async (email: string) => {
    await resetPassword(email);
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, signup, logout, resetPass }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
