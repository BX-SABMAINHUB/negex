import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export const uploadImage = (file: File, path: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);
    task.on('state_changed', null, reject, async () => resolve(await getDownloadURL(task.snapshot.ref)));
  });

export const deleteImage = (path: string) => deleteObject(ref(storage, path));
export const getURL = (path: string) => getDownloadURL(ref(storage, path));
