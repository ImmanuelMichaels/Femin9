// src/context/AppContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

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

  // ✅ Sync every piece of state back to localStorage whenever it changes.
  //    This means no component needs to manually call localStorage.setItem.
  useEffect(() => {
    if (journeyType) localStorage.setItem('userJourney', journeyType);
  }, [journeyType]);

  useEffect(() => {
    localStorage.setItem('userName', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('userCulture', culture);
  }, [culture]);

  useEffect(() => {
    if (edd) localStorage.setItem('edd', edd);
  }, [edd]);

  useEffect(() => {
    localStorage.setItem('babyAgeDays', babyAgeDays);
  }, [babyAgeDays]);

  useEffect(() => {
    localStorage.setItem('cycleLength', cycleLength);
  }, [cycleLength]);

  useEffect(() => {
    localStorage.setItem('periodLength', periodLength);
  }, [periodLength]);

  useEffect(() => {
    if (lastPeriodStart) localStorage.setItem('lastPeriodStart', lastPeriodStart);
  }, [lastPeriodStart]);

  useEffect(() => {
    localStorage.setItem('subscriptionPlan', subscriptionPlan);
  }, [subscriptionPlan]);

  const getCurrentWeek = useCallback(() => {
    if (journeyType !== 'pregnant') return null; // ✅ Return null for non-pregnant journeys
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

  // ✅ Resets profile data only (e.g. "change journey")
  const clearUserData = useCallback(() => {
    setJourneyType(null);
    setUserName('');
    setCulture('west_central_african');
    setEdd('');
    setBabyAgeDays(0);
    setCycleLength(28);
    setPeriodLength(5);
    setLastPeriodStart('');
    setSubscriptionPlan('free');

    // Preserve auth + consents — user stays logged in
    const userAuth     = localStorage.getItem('userAuth');
    const userConsents = localStorage.getItem('userConsents');
    localStorage.clear();
    if (userAuth)     localStorage.setItem('userAuth', userAuth);
    if (userConsents) localStorage.setItem('userConsents', userConsents);
  }, []);

  const logout = useCallback(() => {
    clearUserData();
    localStorage.removeItem('userAuth');
  }, [clearUserData]);

  const value = {
    journeyType, setJourneyType,
    userName,    setUserName,
    culture,     setCulture,
    showSOS,     setShowSOS,
    edd,         setEdd,
    getCurrentWeek,
    getTrimester,
    babyAgeDays,     setBabyAgeDays,
    cycleLength,     setCycleLength,
    periodLength,    setPeriodLength,
    lastPeriodStart, setLastPeriodStart,
    subscriptionPlan, setSubscriptionPlan,
    getAiMessageLimit,
    clearUserData,
    logout,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}