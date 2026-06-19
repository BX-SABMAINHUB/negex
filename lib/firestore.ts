import { doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, collection, query, where, orderBy, limit, Timestamp, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Project } from '@/types';

export const createUser = async (uid: string, data: any) => {
  await setDoc(doc(db, 'users', uid), { ...data, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
};

export const getUserByUid = async (uid: string) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

export const getUserByUsername = async (username: string) => {
  const q = query(collection(db, 'users'), where('username', '==', username), limit(1));
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].data();
};

export const getTemplates = async (category?: string) => {
  let q = collection(db, 'plantillas');
  if (category) {
    q = query(q, where('category', '==', category)) as any;
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getProjectsByUser = async (userId: string) => {
  const q = query(collection(db, 'projects'), where('userId', '==', userId), orderBy('updatedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Project));
};

export const createProject = async (userId: string, data: Partial<Project>) => {
  const ref = await addDoc(collection(db, 'projects'), {
    ...data,
    userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return ref.id;
};

export const updateProject = async (projectId: string, data: Partial<Project>) => {
  await updateDoc(doc(db, 'projects', projectId), { ...data, updatedAt: Timestamp.now() });
};

export const deleteProject = async (projectId: string) => {
  await deleteDoc(doc(db, 'projects', projectId));
};

export const getProjectById = async (projectId: string): Promise<Project | null> => {
  const snap = await getDoc(doc(db, 'projects', projectId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Project;
};
