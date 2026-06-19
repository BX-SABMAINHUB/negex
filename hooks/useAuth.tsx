'use client';
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
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

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const data = await getUserByUid(firebaseUser.uid);
          setUserData(data ? (data as UserData) : buildFallbackUser(firebaseUser));
        } catch {
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
    // loading se pondrá en false cuando onAuthChange se dispare
  }, []);

  const signup = useCallback(async (email: string, password: string, username: string) => {
    // 1. Crear usuario en Auth
    const fbUser = await signUp(email, password, username);
    // 2. Intentar guardar en Firestore (no bloqueante)
    try {
      await createUser(fbUser.uid, {
        uid: fbUser.uid,
        email,
        username,
        displayName: username,
        avatarUrl: '',
      });
    } catch (e) {
      console.warn('Documento en Firestore no creado, usando datos locales', e);
    }
    // 3. Establecer estado inmediatamente para que la app sepa que ya estamos listos
    const localData = buildFallbackUser(fbUser);
    localData.username = username;
    localData.displayName = username;
    setUser(fbUser);
    setUserData(localData);
    setLoading(false);               // <--- aquí se evita el "Cargando..." eterno
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
