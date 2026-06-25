// src/services/userService.js
import { db, auth } from '../context/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export async function getUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data();
  } else {
    // Create profile from local storage data
    const newProfile = {
      name: localStorage.getItem('userName') || user.displayName || user.email.split('@')[0],
      email: user.email,
      createdAt: new Date(),
      journeyType: localStorage.getItem('userJourney') || null,
      culture: localStorage.getItem('userCulture') || null,
      edd: localStorage.getItem('pregnancyEdd') || null,
      babyAgeDays: (() => { const v = localStorage.getItem('babyAgeDays'); return v !== null ? parseInt(v, 10) : null; })(),
      cycleLength: (() => { const v = localStorage.getItem('cycleLength'); return v !== null ? parseInt(v, 10) : null; })(),
      periodLength: (() => { const v = localStorage.getItem('periodLength'); return v !== null ? parseInt(v, 10) : null; })(),
      lastPeriodStart: localStorage.getItem('lastPeriodStart') || null,
      plan: localStorage.getItem('subscriptionPlan') || null,
      messageCount: 0,
      lastActive: new Date()
    };
    await setDoc(userRef, newProfile);
    return newProfile;
  }
}

export async function updateUserProfile(data) {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, { ...data, updatedAt: new Date() });
}

export async function updateJourneyType(journey) {
  await updateUserProfile({ journeyType: journey });
  localStorage.setItem('userJourney', journey);
}