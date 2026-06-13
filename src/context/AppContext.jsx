// src/context/AppContext.jsx
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// ✅ CORRECT: Export AppContext as a named export
export const AppContext = createContext();

// ✅ Export the hook for easy consumption
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

export function AppProvider({ children }) {
  // Core journey state
  const [journeyType, setJourneyType] = useState(null);
  const [culture, setCulture] = useState(null);
  const [religion, setReligion] = useState(null);
  const [dietaryPractices, setDietaryPractices] = useState([]);
  const [hasDietaryPractices, setHasDietaryPractices] = useState(null); // 'yes' | 'no' | null
  const [userName, setUserName] = useState('');
  
  // Pregnancy-specific state
  const [edd, setEdd] = useState(null);
  const [babyNumber, setBabyNumber] = useState(null);
  
  // Mom-specific state
  const [babyAgeDays, setBabyAgeDays] = useState(null);
  const [babyBirthDate, setBabyBirthDate] = useState(null);
  const [feedingMethod, setFeedingMethod] = useState(null);
  
  // Conceive-specific state
  const [cycleLength, setCycleLength] = useState(null);
  const [periodLength, setPeriodLength] = useState(null);
  
  // IVF-specific state
  const [treatmentType, setTreatmentType] = useState(null);
  const [ivfCycleNumber, setIvfCycleNumber] = useState(null);
  
  // Menopause-specific state
  const [menopauseStage, setMenopauseStage] = useState(null);
  const [menopauseSymptoms, setMenopauseSymptoms] = useState([]);
  
  // UI state
  const [showSOS, setShowSOS] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Helper: Get current week based on EDD
  const getCurrentWeek = useCallback(() => {
    if (journeyType !== 'pregnant' || !edd) return null;
    
    const today = new Date();
    const dueDate = new Date(edd);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeksAlong = 40 - Math.ceil(diffDays / 7);
    
    return Math.min(40, Math.max(0, weeksAlong));
  }, [journeyType, edd]);
  
  // Helper: Get trimester based on current week
  const getTrimester = useCallback(() => {
    const week = getCurrentWeek();
    if (!week) return null;
    
    if (week <= 12) return 1;
    if (week <= 27) return 2;
    return 3;
  }, [getCurrentWeek]);
  
  // Load user data from Firestore
  const loadUserData = useCallback(async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        
        setJourneyType(data.journeyType || null);
        setCulture(data.culture || null);
        setReligion(data.religion || null);
        setDietaryPractices(data.dietaryPractices || []);
        setHasDietaryPractices(data.hasDietaryPractices || null);
        setUserName(data.name || '');
        
        setEdd(data.edd || null);
        setBabyNumber(data.babyNumber || null);
        setBabyAgeDays(data.babyAgeDays || null);
        setBabyBirthDate(data.babyBirthDate || null);
        setFeedingMethod(data.feedingMethod || null);
        setCycleLength(data.cycleLength || null);
        setPeriodLength(data.periodLength || null);
        setTreatmentType(data.treatmentType || null);
        setIvfCycleNumber(data.ivfCycleNumber || null);
        setMenopauseStage(data.menopauseStage || null);
        setMenopauseSymptoms(data.menopauseSymptoms || []);
        
        // Save to localStorage for quick access
        if (data.journeyType) localStorage.setItem('userJourney', data.journeyType);
        if (data.name) localStorage.setItem('userName', data.name);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Sync to Firestore (debounced)
  const syncToFirestore = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    try {
      const userData = {
        journeyType,
        culture,
        religion,
        dietaryPractices,
        hasDietaryPractices,
        name: userName,
        edd,
        babyNumber,
        babyAgeDays,
        babyBirthDate,
        feedingMethod,
        cycleLength,
        periodLength,
        treatmentType,
        ivfCycleNumber,
        menopauseStage,
        menopauseSymptoms,
        lastUpdated: new Date()
      };
      
      // Remove undefined/null values
      Object.keys(userData).forEach(key => {
        if (userData[key] === undefined) delete userData[key];
      });
      
      await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
    } catch (error) {
      console.error('Failed to sync to Firestore:', error);
    }
  }, [
    journeyType, culture, religion, dietaryPractices, hasDietaryPractices, userName,
    edd, babyNumber, babyAgeDays, babyBirthDate, feedingMethod,
    cycleLength, periodLength, treatmentType, ivfCycleNumber,
    menopauseStage, menopauseSymptoms
  ]);
  
  // Debounced sync (1 second delay)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (auth.currentUser) {
        syncToFirestore();
      }
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [
    journeyType, culture, religion, dietaryPractices, hasDietaryPractices, userName,
    edd, babyNumber, babyAgeDays, babyBirthDate, feedingMethod,
    cycleLength, periodLength, treatmentType, ivfCycleNumber,
    menopauseStage, menopauseSymptoms, syncToFirestore
  ]);
  
  // Listen to auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await loadUserData(user.uid);
      } else {
        // Reset all state on logout
        setJourneyType(null);
        setCulture(null);
        setReligion(null);
        setDietaryPractices([]);
        setHasDietaryPractices(null);
        setUserName('');
        setEdd(null);
        setBabyNumber(null);
        setBabyAgeDays(null);
        setBabyBirthDate(null);
        setFeedingMethod(null);
        setCycleLength(null);
        setPeriodLength(null);
        setTreatmentType(null);
        setIvfCycleNumber(null);
        setMenopauseStage(null);
        setMenopauseSymptoms([]);
        setIsLoading(false);
        
        // Clear localStorage
        localStorage.removeItem('userJourney');
        localStorage.removeItem('userName');
      }
    });
    
    return () => unsubscribe();
  }, [loadUserData]);
  
  const value = {
    // Core
    journeyType, setJourneyType,
    culture, setCulture,
    religion, setReligion,
    dietaryPractices, setDietaryPractices,
    hasDietaryPractices, setHasDietaryPractices,
    userName, setUserName,
    
    // Pregnancy
    edd, setEdd,
    babyNumber, setBabyNumber,
    currentWeek: getCurrentWeek(),
    getCurrentWeek,
    getTrimester,
    
    // Mom
    babyAgeDays, setBabyAgeDays,
    babyBirthDate, setBabyBirthDate,
    feedingMethod, setFeedingMethod,
    
    // Conceive
    cycleLength, setCycleLength,
    periodLength, setPeriodLength,
    
    // IVF
    treatmentType, setTreatmentType,
    ivfCycleNumber, setIvfCycleNumber,
    
    // Menopause
    menopauseStage, setMenopauseStage,
    menopauseSymptoms, setMenopauseSymptoms,
    
    // UI
    showSOS, setShowSOS,
    isLoading
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Optional: Also export AppContext as default for convenience
export default AppContext;