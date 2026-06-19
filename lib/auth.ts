import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged, updateProfile, User } from 'firebase/auth';
import { auth } from './firebase';

export const signUp = async (email: string, password: string, displayName: string) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  return cred.user;
};
export const logIn = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);
export const logOut = () => signOut(auth);
export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);
export const onAuthChange = (callback: (user: User | null) => void) => onAuthStateChanged(auth, callback);
