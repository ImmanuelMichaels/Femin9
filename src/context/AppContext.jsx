import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { auth, db } from './firebase';
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

  // Use a ref to track syncing inside the callback to avoid stale closure
  const isSyncingRef = useRef(false);

  // localStorage saves
  useEffect(() => { if (journeyType) localStorage.setItem('userJourney', journeyType); }, [journeyType]);
  useEffect(() => { localStorage.setItem('userName', userName); }, [userName]);
  useEffect(() => { localStorage.setItem('userCulture', culture); }, [culture]);
  useEffect(() => { if (edd) localStorage.setItem('edd', edd); }, [edd]);
  useEffect(() => { localStorage.setItem('babyAgeDays', babyAgeDays); }, [babyAgeDays]);
  useEffect(() => { localStorage.setItem('cycleLength', cycleLength); }, [cycleLength]);
  useEffect(() => { localStorage.setItem('periodLength', periodLength); }, [periodLength]);
  useEffect(() => { if (lastPeriodStart) localStorage.setItem('lastPeriodStart', lastPeriodStart); }, [lastPeriodStart]);
  useEffect(() => { localStorage.setItem('subscriptionPlan', subscriptionPlan); }, [subscriptionPlan]);
  useEffect(() => { localStorage.setItem('notificationsEnabled', notificationsEnabled); }, [notificationsEnabled]);

  const syncToFirestore = useCallback(async (data) => {
    const user = auth.currentUser;
    if (!user || isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsSyncing(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        appData: data,
        lastSync: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, []);

  // ONLY ONE loadFromFirestore DEFINITION - KEEP THIS ONE
  const loadFromFirestore = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return null;
    setIsSyncing(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists() && docSnap.data().appData) {
        const data = docSnap.data().appData;
        if (data.journeyType)   setJourneyType(data.journeyType);
        if (data.userName)      setUserName(data.userName);
        if (data.culture)       setCulture(data.culture);
        if (data.edd)           setEdd(data.edd);
        if (data.babyAgeDays)   setBabyAgeDays(data.babyAgeDays);
        if (data.cycleLength)   setCycleLength(data.cycleLength);
        if (data.periodLength)  setPeriodLength(data.periodLength);
        if (data.lastPeriodStart) setLastPeriodStart(data.lastPeriodStart);
        if (data.subscriptionPlan) setSubscriptionPlan(data.subscriptionPlan);
        if (data.notificationsEnabled !== undefined) setNotificationsEnabled(data.notificationsEnabled);
        return data;
      }
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setIsSyncing(false);
    }
    return null;
  }, []);

  // Call loadFromFirestore on auth state change
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) loadFromFirestore();
    });
    return () => unsub();
  }, [loadFromFirestore]);

  // Auto-sync — only runs when a user is actually logged in
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const timeout = setTimeout(() => {
      syncToFirestore({
        journeyType, userName, culture, edd, babyAgeDays,
        cycleLength, periodLength, lastPeriodStart,
        subscriptionPlan, notificationsEnabled,
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [
    journeyType, userName, culture, edd, babyAgeDays,
    cycleLength, periodLength, lastPeriodStart,
    subscriptionPlan, notificationsEnabled, syncToFirestore,
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
      case 'bloom':  return 50;
      case 'bloom+': return Infinity;
      default:       return 10;
    }
  }, [subscriptionPlan]);

  const clearUserData = useCallback(async () => {
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

    const userAuth = localStorage.getItem('userAuth');
    const userConsents = localStorage.getItem('userConsents');
    localStorage.clear();
    if (userAuth) localStorage.setItem('userAuth', userAuth);
    if (userConsents) localStorage.setItem('userConsents', userConsents);

    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { appData: null, lastSync: new Date().toISOString() }, { merge: true });
      } catch (err) {
        console.error('Firestore clear error:', err);
      }
    }
  }, []);

  const logout = useCallback(async () => {
    await clearUserData();
    localStorage.removeItem('userAuth');
    auth.signOut();
  }, [clearUserData]);

  const value = {
    journeyType, setJourneyType,
    userName,    setUserName,
    culture,     setCulture,
    showSOS,     setShowSOS,
    edd,         setEdd,
    getCurrentWeek,
    getTrimester,
    babyAgeDays,      setBabyAgeDays,
    cycleLength,      setCycleLength,
    periodLength,     setPeriodLength,
    lastPeriodStart,  setLastPeriodStart,
    subscriptionPlan, setSubscriptionPlan,
    getAiMessageLimit,
    notificationsEnabled, setNotificationsEnabled,
    clearUserData,
    logout,
    loadFromFirestore,  // ← Now only one definition
    isSyncing,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}