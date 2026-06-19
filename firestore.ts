import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { UserData, Project, Plantilla } from '@/types';

export const createUser = async (uid: string, data: Partial<UserData>) => {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};

export const getUserByUid = async (uid: string): Promise<UserData | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserData) : null;
};

export const getUserByUsername = async (username: string): Promise<UserData | null> => {
  const q = query(collection(db, 'users'), where('username', '==', username), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as UserData;
};

export const getTemplates = async (category?: string): Promise<Plantilla[]> => {
  let q = collection(db, 'plantillas');
  if (category) {
    q = query(q, where('category', '==', category)) as any;
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Plantilla));
};

export const getProjectsByUser = async (userId: string): Promise<Project[]> => {
  const q = query(
    collection(db, 'projects'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Project));
};

export const createProject = async (userId: string, data: Partial<Project>): Promise<string> => {
  const ref = await addDoc(collection(db, 'projects'), {
    ...data,
    userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return ref.id;
};

export const updateProject = async (projectId: string, data: Partial<Project>) => {
  const ref = doc(db, 'projects', projectId);
  await updateDoc(ref, { ...data, updatedAt: Timestamp.now() });
};

export const deleteProject = async (projectId: string) => {
  await deleteDoc(doc(db, 'projects', projectId));
};

export const getProjectById = async (projectId: string): Promise<Project | null> => {
  const snap = await getDoc(doc(db, 'projects', projectId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Project) : null;
};
