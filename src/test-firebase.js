import { db } from './config/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

async function testConnection() {
  try {
    const snapshot = await getDocs(collection(db, 'knowledge_base'));
    console.log(`✅ Firebase connected! Found ${snapshot.size} documents in knowledge_base`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testConnection();