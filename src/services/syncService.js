import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export async function syncUserData(userId, data) {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { appData: data, lastSync: new Date() }, { merge: true });
}

export async function loadUserData(userId) {
  const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);
  return docSnap.exists() ? docSnap.data().appData : null;
}