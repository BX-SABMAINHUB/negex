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
        } catch (error) {
          console.error('Error fetching user data:', error);
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
    await logIn(email, password);
  };

  const signup = async (email: string, password: string, username: string) => {
    try {
      const fbUser = await signUp(email, password, username);
      console.log('Usuario creado en Auth:', fbUser.uid);
      await createUser(fbUser.uid, {
        uid: fbUser.uid,
        email,
        username,
        displayName: username,
        avatarUrl: '',
      });
      console.log('Documento de usuario creado en Firestore');
    } catch (error: any) {
      console.error('Error en signup:', error);
      // Si ocurre un error después de crear el usuario en Auth, podríamos eliminarlo,
      // pero normalmente el fallo en createUser lanza excepción y se maneja en el formulario.
      throw error; // Re-lanzamos para que el formulario pueda mostrar el mensaje
    }
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
