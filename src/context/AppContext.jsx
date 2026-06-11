import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { auth, db } from '../context/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [journeyType, setJourneyType] = useState(
    () => localStorage.getItem('userJourney') || null
  );
  const [userName, setUserName] = useState(
    () => localStorage.getItem('userName') || ''
  );
  const [culture, setCulture] = useState(
    () => localStorage.getItem('userCulture') || 'west_central_african'
  );
  const [showSOS, setShowSOS] = useState(false);
  const [edd, setEdd] = useState(
    () => localStorage.getItem('edd') || ''
  );
  const [babyAgeDays, setBabyAgeDays] = useState(() => {
    const saved = localStorage.getItem('babyAgeDays');
    return saved ? parseInt(saved) : 0;
  });
  const [cycleLength, setCycleLength] = useState(() => {
    const saved = localStorage.getItem('cycleLength');
    return saved ? parseInt(saved) : 28;
  });
  const [periodLength, setPeriodLength] = useState(() => {
    const saved = localStorage.getItem('periodLength');
    return saved ? parseInt(saved) : 5;
  });
  const [lastPeriodStart, setLastPeriodStart] = useState(
    () => localStorage.getItem('lastPeriodStart') || ''
  );
  const [subscriptionPlan, setSubscriptionPlan] = useState(
    () => localStorage.getItem('subscriptionPlan') || 'free'
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => localStorage.getItem('notificationsEnabled') === 'true'
  );
  const [isSyncing, setIsSyncing] = useState(false);

  const [babyNumber, setBabyNumber] = useState(
    () => localStorage.getItem('babyNumber') || ''
  );
  const [babyBirthDate, setBabyBirthDate] = useState(
    () => localStorage.getItem('babyBirthDate') || ''
  );
  const [treatmentType, setTreatmentType] = useState(
    () => localStorage.getItem('treatmentType') || ''
  );
  const [ivfCycleNumber, setIvfCycleNumber] = useState(
    () => localStorage.getItem('ivfCycleNumber') || ''
  );
  const [menopauseStage, setMenopauseStage] = useState(
    () => localStorage.getItem('menopauseStage') || ''
  );
  const [menopauseSymptoms, setMenopauseSymptoms] = useState(() => {
    try {
      const saved = localStorage.getItem('menopauseSymptoms');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [feedingMethod, setFeedingMethod] = useState(
    () => localStorage.getItem('feedingMethod') || ''
  );

  const isSyncingRef = useRef(false);

  // ── localStorage persistence ──────────────────────────────────────────────
  useEffect(() => {
    if (journeyType) localStorage.setItem('userJourney', journeyType);
    else localStorage.removeItem('userJourney');
  }, [journeyType]);
  useEffect(() => { localStorage.setItem('userName', userName); }, [userName]);
  useEffect(() => { localStorage.setItem('userCulture', culture); }, [culture]);
  useEffect(() => { if (edd) localStorage.setItem('edd', edd); }, [edd]);
  useEffect(() => { localStorage.setItem('babyAgeDays', babyAgeDays); }, [babyAgeDays]);
  useEffect(() => { localStorage.setItem('cycleLength', cycleLength); }, [cycleLength]);
  useEffect(() => { localStorage.setItem('periodLength', periodLength); }, [periodLength]);
  useEffect(() => { if (lastPeriodStart) localStorage.setItem('lastPeriodStart', lastPeriodStart); }, [lastPeriodStart]);
  useEffect(() => { localStorage.setItem('subscriptionPlan', subscriptionPlan); }, [subscriptionPlan]);
  useEffect(() => { localStorage.setItem('notificationsEnabled', notificationsEnabled); }, [notificationsEnabled]);
  useEffect(() => { if (babyNumber) localStorage.setItem('babyNumber', babyNumber); }, [babyNumber]);
  useEffect(() => { if (babyBirthDate) localStorage.setItem('babyBirthDate', babyBirthDate); }, [babyBirthDate]);
  useEffect(() => { if (treatmentType) localStorage.setItem('treatmentType', treatmentType); }, [treatmentType]);
  useEffect(() => { if (ivfCycleNumber) localStorage.setItem('ivfCycleNumber', ivfCycleNumber); }, [ivfCycleNumber]);
  useEffect(() => { if (menopauseStage) localStorage.setItem('menopauseStage', menopauseStage); }, [menopauseStage]);
  useEffect(() => { localStorage.setItem('menopauseSymptoms', JSON.stringify(menopauseSymptoms)); }, [menopauseSymptoms]);
  useEffect(() => { if (feedingMethod) localStorage.setItem('feedingMethod', feedingMethod); }, [feedingMethod]);

  // ── Firestore sync ────────────────────────────────────────────────────────
  const syncToFirestore = useCallback(async (data) => {
    const user = auth.currentUser;
    if (!user || isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsSyncing(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        appData: {
          ...data,
          localUpdatedAt: new Date().toISOString(),
        },
        lastSync: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, []);

  const loadFromFirestore = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return null;
    setIsSyncing(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists() || !docSnap.data().appData) return null;

      const data = docSnap.data().appData;
      const localTs = localStorage.getItem('localUpdatedAt');
      const firestoreTs = data.localUpdatedAt;
      const localIsNewer = localTs && firestoreTs && localTs >= firestoreTs;

      if (localIsNewer) {
        console.info('[AppContext] Local data is newer than Firestore — skipping restore');
        return null;
      }

      if (data.journeyType) setJourneyType(data.journeyType);
      if (data.userName) setUserName(data.userName);
      if (data.culture) setCulture(data.culture);
      if (data.edd) setEdd(data.edd);
      if (data.babyAgeDays) setBabyAgeDays(data.babyAgeDays);
      if (data.cycleLength) setCycleLength(data.cycleLength);
      if (data.periodLength) setPeriodLength(data.periodLength);
      if (data.lastPeriodStart) setLastPeriodStart(data.lastPeriodStart);
      if (data.subscriptionPlan) setSubscriptionPlan(data.subscriptionPlan);
      if (data.notificationsEnabled !== undefined) setNotificationsEnabled(data.notificationsEnabled);
      if (data.babyNumber) setBabyNumber(data.babyNumber);
      if (data.babyBirthDate) setBabyBirthDate(data.babyBirthDate);
      if (data.treatmentType) setTreatmentType(data.treatmentType);
      if (data.ivfCycleNumber) setIvfCycleNumber(data.ivfCycleNumber);
      if (data.menopauseStage) setMenopauseStage(data.menopauseStage);
      if (data.menopauseSymptoms) setMenopauseSymptoms(data.menopauseSymptoms);
      if (data.feedingMethod) setFeedingMethod(data.feedingMethod);

      return data;
    } catch (err) {
      console.error('Load error:', err);
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) loadFromFirestore();
    });
    return () => unsub();
  }, [loadFromFirestore]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const now = new Date().toISOString();
    localStorage.setItem('localUpdatedAt', now);

    const timeout = setTimeout(() => {
      syncToFirestore({
        journeyType, userName, culture, edd, babyAgeDays,
        cycleLength, periodLength, lastPeriodStart,
        subscriptionPlan, notificationsEnabled,
        babyNumber, babyBirthDate, treatmentType,
        ivfCycleNumber, menopauseStage, menopauseSymptoms, feedingMethod,
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [
    journeyType, userName, culture, edd, babyAgeDays,
    cycleLength, periodLength, lastPeriodStart,
    subscriptionPlan, notificationsEnabled, syncToFirestore,
    babyNumber, babyBirthDate, treatmentType,
    ivfCycleNumber, menopauseStage, menopauseSymptoms, feedingMethod,
  ]);

  const getCurrentWeek = useCallback(() => {
    if (journeyType !== 'pregnant') return null;
    if (edd) {
      const diffDays = Math.ceil((new Date(edd) - new Date()) / (1000 * 60 * 60 * 24));
      const weeks = 40 - Math.floor(diffDays / 7);
      return Math.max(1, Math.min(42, weeks));
    }
    return 26;
  }, [journeyType, edd]);

  const getTrimester = useCallback(() => {
    const week = getCurrentWeek();
    if (!week) return null;
    if (week <= 13) return 1;
    if (week <= 27) return 2;
    return 3;
  }, [getCurrentWeek]);

  const getAiMessageLimit = useCallback(() => {
    switch (subscriptionPlan) {
      case 'bloom': return 50;
      case 'bloom+': return Infinity;
      default: return 10;
    }
  }, [subscriptionPlan]);

  // ✅ FIXED: clearUserData - restored localStorage save logic
  const clearUserData = useCallback(async () => {
    // Save items we want to keep BEFORE clearing
    const userAuth = localStorage.getItem('userAuth');
    const userConsents = localStorage.getItem('userConsents');
    
    // Clear Firestore data first (while still authenticated)
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { appData: null, lastSync: new Date().toISOString() }, { merge: true });
      } catch (err) {
        console.error('Firestore clear error:', err);
      }
    }
    
    // Reset all states
    setJourneyType(null);
    setUserName('');
    setCulture('west_central_african');
    setEdd('');
    setBabyAgeDays(0);
    setCycleLength(28);
    setPeriodLength(5);
    setLastPeriodStart('');
    setSubscriptionPlan('free');
    setNotificationsEnabled(false);
    setBabyNumber('');
    setBabyBirthDate('');
    setTreatmentType('');
    setIvfCycleNumber('');
    setMenopauseStage('');
    setMenopauseSymptoms([]);
    setFeedingMethod('');
    
    // Clear localStorage
    localStorage.clear();
    
    // ✅ RESTORE the items we want to keep
    if (userAuth) localStorage.setItem('userAuth', userAuth);
    if (userConsents) localStorage.setItem('userConsents', userConsents);
  }, []);

  // ✅ FIXED: logout - proper order and error handling
  const logout = useCallback(async () => {
    try {
      await auth.signOut();
    } catch (e) {
      console.error('Sign out error:', e);
      throw e;
    }
    try {
      await clearUserData();
    } catch (e) {
      console.error('Clear data error:', e);
    }
  }, [clearUserData]);

  const value = {
    journeyType, setJourneyType,
    userName, setUserName,
    culture, setCulture,
    showSOS, setShowSOS,
    edd, setEdd,
    getCurrentWeek,
    getTrimester,
    babyAgeDays, setBabyAgeDays,
    cycleLength, setCycleLength,
    periodLength, setPeriodLength,
    lastPeriodStart, setLastPeriodStart,
    subscriptionPlan, setSubscriptionPlan,
    getAiMessageLimit,
    notificationsEnabled, setNotificationsEnabled,
    clearUserData,
    logout,
    loadFromFirestore,
    isSyncing,
    babyNumber, setBabyNumber,
    babyBirthDate, setBabyBirthDate,
    treatmentType, setTreatmentType,
    ivfCycleNumber, setIvfCycleNumber,
    menopauseStage, setMenopauseStage,
    menopauseSymptoms, setMenopauseSymptoms,
    feedingMethod, setFeedingMethod,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}