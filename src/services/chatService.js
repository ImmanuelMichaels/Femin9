// src/services/chatService.js
import { db, auth } from '../context/firebase';
import { collection, addDoc, query, where, orderBy, getDocs, limit } from 'firebase/firestore';

export async function saveMessage(role, content) {
  const user = auth.currentUser;
  if (!user) return null;

  return await addDoc(collection(db, 'conversations'), {
    userId: user.uid,
    role: role,
    content: content,
    timestamp: new Date()
  });
}

export async function loadChatHistory(maxMessages = 50) {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, 'conversations'),
    where('userId', '==', user.uid),
    orderBy('timestamp', 'asc'),
    limit(maxMessages)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}