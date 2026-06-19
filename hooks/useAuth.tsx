'use client';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
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

function buildFallbackUser(user: User): UserData {
  const email = user.email || '';
  const fallbackUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_') || 'user';
  return {
    uid: user.uid,
    email,
    username: fallbackUsername,
    displayName: user.displayName || fallbackUsername,
    avatarUrl: '',
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Refrescar userData cuando el usuario cambie
  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const data = await getUserByUid(firebaseUser.uid);
          if (data) {
            setUserData(data as UserData);
          } else {
            // Si no existe documento en Firestore, usamos un usuario temporal
            setUserData(buildFallbackUser(firebaseUser));
          }
        } catch {
          // Si falla la consulta, también usamos fallback
          setUserData(buildFallbackUser(firebaseUser));
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await logIn(email, password);
  }, []);

  const signup = useCallback(async (email: string, password: string, username: string) => {
    // 1. Crear usuario en Auth
    const fbUser = await signUp(email, password, username);
    // 2. Intentar crear documento en Firestore (sin detener el flujo si falla)
    try {
      await createUser(fbUser.uid, {
        uid: fbUser.uid,
        email,
        username,
        displayName: username,
        avatarUrl: '',
      });
    } catch (e) {
      console.warn('No se pudo guardar el documento en Firestore, usando datos locales', e);
      // No lanzamos error; el usuario ya está autenticado
    }
    // 3. Forzar la actualización del estado con los datos locales
    const fallbackData: UserData = {
      uid: fbUser.uid,
      email,
      username,
      displayName: username,
      avatarUrl: '',
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
    };
    setUser(fbUser);
    setUserData(fallbackData);
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    await logOut();
    setUser(null);
    setUserData(null);
  }, []);

  const resetPass = useCallback(async (email: string) => {
    await resetPassword(email);
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, signup, logout, resetPass }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
