// src/context/AppContext.jsx
import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../context/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../context/firebase';

const AppContext = createContext(null);

// ──────────────────────────────────────────────────────────────
// INITIAL STATE
// ──────────────────────────────────────────────────────────────
const INITIAL_USER_DATA = {
  journeyType: null,
  userName: '',
  culture: 'en-GB',
  dietaryPractices: [],
  religion: '',
  hasDietaryPractices: null,
  edd: '',
  babyNumber: '1st',
  babyBirthDate: '',
  babyAgeDays: 0,
  cycleLength: '28',
  periodLength: '5',
  treatmentType: '',
  ivfCycleNumber: '1',
  menopauseStage: '',
  menopauseSymptoms: [],
  feedingMethod: '',
  subscriptionPlan: null,
  notificationsEnabled: true,
};

export function AppProvider({ children }) {
  // ── User Data (from Firestore) ──
  const [journeyType, setJourneyType] = useState(null);
  const [userName, setUserName] = useState('');
  const [culture, setCulture] = useState('en-GB');
  const [dietaryPractices, setDietaryPractices] = useState([]);
  const [religion, setReligion] = useState('');
  const [hasDietaryPractices, setHasDietaryPractices] = useState(null);
  const [edd, setEdd] = useState('');
  const [babyNumber, setBabyNumber] = useState('1st');
  const [babyBirthDate, setBabyBirthDate] = useState('');
  const [babyAgeDays, setBabyAgeDays] = useState(0);
  const [cycleLength, setCycleLength] = useState('28');
  const [periodLength, setPeriodLength] = useState('5');
  const [treatmentType, setTreatmentType] = useState('');
  const [ivfCycleNumber, setIvfCycleNumber] = useState('1');
  const [menopauseStage, setMenopauseStage] = useState('');
  const [menopauseSymptoms, setMenopauseSymptoms] = useState([]);
  const [feedingMethod, setFeedingMethod] = useState('');
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // ── UI State ──
  const [showSOS, setShowSOS] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [userId, setUserId] = useState(null);

  // ── Migrate localStorage consent → Firestore ──────────────────────────────
  // Runs once after login. If Firestore already has a consent record, does
  // nothing. If not, promotes whatever is in localStorage to Firestore.
  // Non-fatal — localStorage remains the fallback if this fails.
  const migrateConsentToFirestore = useCallback(async (uid) => {
    try {
      const consentRef  = doc(db, 'users', uid, 'consent', 'record');
      const consentSnap = await getDoc(consentRef);

      if (consentSnap.exists()) return; // already in Firestore, nothing to do

      const raw = localStorage.getItem('userConsents');
      if (!raw) return; // no localStorage record either — consent not yet given

      const parsed = JSON.parse(raw);

      await setDoc(consentRef, {
        ...parsed,
        uid,
        migratedFromLocalStorage: true,
        serverTimestamp: serverTimestamp(),
      });

      console.log('[Femin9] Consent record migrated to Firestore for', uid);
    } catch (err) {
      // Non-fatal — the app continues, localStorage is still the fallback
      console.error('[Femin9] Consent migration failed:', err);
    }
  }, []);

  // ── Load profile on auth change ───────────────────────────────────────────
  useEffect(() => {
    let unsubscribe;

    const initAuth = async () => {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          resetAllState();
          setProfileLoaded(true);
          setIsLoading(false);
          setUserId(null);
          return;
        }

        setUserId(user.uid);
        setIsLoading(true);

        try {
          const userRef  = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();

            setJourneyType(data.journeyType || null);
            setUserName(data.userName || data.displayName || '');
            setCulture(data.culture || 'en-GB');
            setDietaryPractices(data.dietaryPractices || []);
            setReligion(data.religion || '');
            setHasDietaryPractices(data.hasDietaryPractices ?? null);
            setEdd(data.edd || '');
            setBabyNumber(data.babyNumber || '1st');
            setBabyBirthDate(data.babyBirthDate || '');
            setBabyAgeDays(data.babyAgeDays || 0);
            setCycleLength(data.cycleLength || '28');
            setPeriodLength(data.periodLength || '5');
            setTreatmentType(data.treatmentType || '');
            setIvfCycleNumber(data.ivfCycleNumber || '1');
            setMenopauseStage(data.menopauseStage || '');
            setMenopauseSymptoms(data.menopauseSymptoms || []);
            setFeedingMethod(data.feedingMethod || '');
            setSubscriptionPlan(data.subscriptionPlan || null);
            setNotificationsEnabled(data.notificationsEnabled ?? true);

            // Migrate any pre-login localStorage consent to Firestore
            await migrateConsentToFirestore(user.uid);

          } else {
            // New user — create default profile then migrate consent
            await createDefaultProfile(user.uid);
            await migrateConsentToFirestore(user.uid);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        } finally {
          setProfileLoaded(true);
          setIsLoading(false);
        }
      });
    };

    initAuth();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [migrateConsentToFirestore]);

  // ── Create default profile ────────────────────────────────────────────────
  const createDefaultProfile = useCallback(async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        ...INITIAL_USER_DATA,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error creating default profile:', error);
    }
  }, []);

  // ── Firestore write helper ────────────────────────────────────────────────
  const updateFirestore = useCallback(async (updates) => {
    if (!userId) return;
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating Firestore:', error);
    }
  }, [userId]);

  // ── Update functions (optimistic + Firestore) ─────────────────────────────
  const updateJourneyType = useCallback(async (type) => {
    setJourneyType(type);
    await updateFirestore({ journeyType: type });
  }, [updateFirestore]);

  const updateUserName = useCallback(async (name) => {
    setUserName(name);
    await updateFirestore({ userName: name });
  }, [updateFirestore]);

  const updateSubscriptionPlan = useCallback(async (plan) => {
    setSubscriptionPlan(plan);
    await updateFirestore({ subscriptionPlan: plan });
  }, [updateFirestore]);

  // ── Reset all state (logout) ──────────────────────────────────────────────
  const resetAllState = useCallback(() => {
    setJourneyType(null);
    setUserName('');
    setCulture('en-GB');
    setDietaryPractices([]);
    setReligion('');
    setHasDietaryPractices(null);
    setEdd('');
    setBabyNumber('1st');
    setBabyBirthDate('');
    setBabyAgeDays(0);
    setCycleLength('28');
    setPeriodLength('5');
    setTreatmentType('');
    setIvfCycleNumber('1');
    setMenopauseStage('');
    setMenopauseSymptoms([]);
    setFeedingMethod('');
    setSubscriptionPlan(null);
    setNotificationsEnabled(true);
    setShowSOS(false);
  }, []);

  // ── Clear user data (logout) ──────────────────────────────────────────────
  const clearUserData = useCallback(() => {
    resetAllState();
    try {
      localStorage.removeItem('profileImage');
      localStorage.removeItem('notificationPrefs');
      // userConsents is intentionally NOT removed — consent record must persist
    } catch {
      // silent
    }
  }, [resetAllState]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearUserData();
    setProfileLoaded(false);
  }, [clearUserData]);

  // ── Pregnancy helpers ─────────────────────────────────────────────────────
  const getCurrentWeek = useCallback(() => {
    if (!edd) return null;
    try {
      const dueDate  = new Date(edd);
      const now      = new Date();
      const diffDays = Math.floor((dueDate - now) / (1000 * 60 * 60 * 24));
      const weeks    = 40 - Math.floor(diffDays / 7);
      return Math.max(1, Math.min(42, weeks));
    } catch {
      return null;
    }
  }, [edd]);

  const getTrimester = useCallback(() => {
    const week = getCurrentWeek();
    if (!week) return null;
    if (week <= 13) return 1;
    if (week <= 26) return 2;
    return 3;
  }, [getCurrentWeek]);

  // ── Context value ─────────────────────────────────────────────────────────
  const value = useMemo(
    () => ({
      // Read-only state
      journeyType,
      userName,
      culture,
      dietaryPractices,
      religion,
      hasDietaryPractices,
      edd,
      babyNumber,
      babyBirthDate,
      babyAgeDays,
      cycleLength,
      periodLength,
      treatmentType,
      ivfCycleNumber,
      menopauseStage,
      menopauseSymptoms,
      feedingMethod,
      subscriptionPlan,
      notificationsEnabled,

      // UI state
      showSOS,
      setShowSOS,
      isLoading,
      profileLoaded,
      userId,

      // Update functions
      updateJourneyType,
      updateUserName,
      updateSubscriptionPlan,
      setNotificationsEnabled,

      // Direct setters
      setJourneyType,
      setUserName,
      setCulture,
      setDietaryPractices,
      setReligion,
      setHasDietaryPractices,
      setEdd,
      setBabyNumber,
      setBabyBirthDate,
      setBabyAgeDays,
      setCycleLength,
      setPeriodLength,
      setTreatmentType,
      setIvfCycleNumber,
      setMenopauseStage,
      setMenopauseSymptoms,
      setFeedingMethod,
      setSubscriptionPlan,

      // Auth methods
      clearUserData,
      logout,
      resetAllState,

      // Helpers
      getCurrentWeek,
      getTrimester,
    }),
    [
      journeyType,
      userName,
      culture,
      dietaryPractices,
      religion,
      hasDietaryPractices,
      edd,
      babyNumber,
      babyBirthDate,
      babyAgeDays,
      cycleLength,
      periodLength,
      treatmentType,
      ivfCycleNumber,
      menopauseStage,
      menopauseSymptoms,
      feedingMethod,
      subscriptionPlan,
      notificationsEnabled,
      showSOS,
      isLoading,
      profileLoaded,
      userId,
      updateJourneyType,
      updateUserName,
      updateSubscriptionPlan,
      setNotificationsEnabled,
      clearUserData,
      logout,
      resetAllState,
      getCurrentWeek,
      getTrimester,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export default AppContext;