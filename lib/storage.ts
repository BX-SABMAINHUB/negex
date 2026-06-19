import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export const uploadImage = (file: File, path: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);
    task.on(
      'state_changed',
      null,
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
};

export const deleteImage = async (path: string) => {
  await deleteObject(ref(storage, path));
};

export const getURL = async (path: string) => {
  return getDownloadURL(ref(storage, path));
};
