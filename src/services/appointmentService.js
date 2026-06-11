// src/services/appointmentService.js
import { db, auth } from '../context/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';

const APPOINTMENTS_COLLECTION = 'appointments';

// Helper to get current user
const getCurrentUser = () => {
  return auth.currentUser;
};

// Save appointment to Firestore
export async function saveAppointment(appointmentData) {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const appointment = {
    ...appointmentData,
    userId: user.uid,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    date: appointmentData.date, // YYYY-MM-DD string for querying
    timestamp: new Date(appointmentData.date).getTime()
  };
  
  if (appointmentData.id) {
    // Update existing appointment
    const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentData.id);
    await updateDoc(docRef, {
      ...appointment,
      updatedAt: Timestamp.now()
    });
    return { ...appointment, id: appointmentData.id };
  } else {
    // Create new appointment
    const docRef = await addDoc(collection(db, APPOINTMENTS_COLLECTION), appointment);
    return { ...appointment, id: docRef.id };
  }
}

// Get all user appointments
export async function getUserAppointments(startDate = null, endDate = null) {
  const user = getCurrentUser();
  if (!user) return [];
  
  try {
    let q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where('userId', '==', user.uid),
      orderBy('date', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const appointments = [];
    querySnapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() });
    });
    
    // Filter by date range if provided
    if (startDate && endDate) {
      return appointments.filter(apt => apt.date >= startDate && apt.date <= endDate);
    }
    
    return appointments;
  } catch (error) {
    console.error('Error loading appointments:', error);
    return [];
  }
}

// Get appointments for a specific date
export async function getAppointmentsByDate(date) {
  const user = getCurrentUser();
  if (!user) return [];
  
  try {
    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where('userId', '==', user.uid),
      where('date', '==', date)
    );
    
    const querySnapshot = await getDocs(q);
    const appointments = [];
    querySnapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() });
    });
    
    return appointments;
  } catch (error) {
    console.error('Error loading appointments by date:', error);
    return [];
  }
}

// Get upcoming appointments (next X days)
export async function getUpcomingAppointments(days = 30) {
  const user = getCurrentUser();
  if (!user) return [];
  
  const today = new Date().toISOString().split('T')[0];
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  const endDate = futureDate.toISOString().split('T')[0];
  
  try {
    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where('userId', '==', user.uid),
      where('date', '>=', today),
      where('date', '<=', endDate),
      orderBy('date', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const appointments = [];
    querySnapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() });
    });
    
    return appointments;
  } catch (error) {
    console.error('Error loading upcoming appointments:', error);
    return [];
  }
}

// Delete appointment
export async function deleteAppointment(appointmentId) {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
  await deleteDoc(docRef);
  return true;
}

// Sync local appointments with Firestore
export async function syncAppointments(localAppointments) {
  const user = getCurrentUser();
  if (!user) return null;
  
  const firestoreAppointments = await getUserAppointments();
  const firestoreMap = new Map(firestoreAppointments.map(a => [a.id, a]));
  
  // Check for conflicts and merge
  const merged = [];
  for (const local of localAppointments) {
    const firestore = firestoreMap.get(local.id);
    if (firestore) {
      // Use the most recently updated version
      const localUpdated = local.updatedAt?.toDate?.() || new Date(local.updatedAt);
      const firestoreUpdated = firestore.updatedAt?.toDate?.() || new Date(firestore.updatedAt);
      merged.push(localUpdated > firestoreUpdated ? local : firestore);
      firestoreMap.delete(local.id);
    } else {
      merged.push(local);
    }
  }
  
  // Add remaining Firestore appointments
  merged.push(...firestoreMap.values());
  
  return merged;
}