import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { lsGet, lsSet } from '../utils/storage';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  journey: 'userJourney',
  userName: 'userName',
  culture: 'userCulture',
  startDate: 'pregnancyStartDate',
  babyBirthDate: 'babyBirthDate',
  dietaryPractices: 'dietaryPractices',
};

export function AppProvider({ children }) {
  const [journeyType, setJourneyType] = useState(() =>
    lsGet(STORAGE_KEYS.journey, 'pregnant')
  );

  const [userName, setUserName] = useState(() =>
    lsGet(STORAGE_KEYS.userName, '')
  );

  const [culture, setCulture] = useState(() =>
    lsGet(STORAGE_KEYS.culture, 'en-GB')
  );

  const [dietaryPractices, setDietaryPractices] = useState(() =>
    lsGet(STORAGE_KEYS.dietaryPractices, [])
  );

  const [showSOS, setShowSOS] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Additional user fields used across the app
  const [religion, setReligion] = useState(() =>
    lsGet('userReligion', '')
  );

  const [hasDietaryPractices, setHasDietaryPractices] = useState(() =>
    lsGet('hasDietaryPractices', null)
  );

  const [edd, setEdd] = useState(() =>
    lsGet('pregnancyEdd', '')
  );

  const [babyNumber, setBabyNumber] = useState(() =>
    lsGet('babyNumber', '1st')
  );

  const [babyBirthDate, setBabyBirthDate] = useState(() =>
    lsGet(STORAGE_KEYS.babyBirthDate, '')
  );

  const [babyAgeDays, setBabyAgeDays] = useState(() => {
    const value = lsGet('babyAgeDays', 0);
    return Number(value) || 0;
  });

  const [cycleLength, setCycleLength] = useState(() =>
    lsGet('cycleLength', '28')
  );

  const [periodLength, setPeriodLength] = useState(() =>
    lsGet('periodLength', '5')
  );

  const [treatmentType, setTreatmentType] = useState(() =>
    lsGet('treatmentType', '')
  );

  const [ivfCycleNumber, setIvfCycleNumber] = useState(() =>
    lsGet('ivfCycleNumber', '1')
  );

  const [menopauseStage, setMenopauseStage] = useState(() =>
    lsGet('menopauseStage', '')
  );

  const [menopauseSymptoms, setMenopauseSymptoms] = useState(() =>
    lsGet('menopauseSymptoms', [])
  );

  const [feedingMethod, setFeedingMethod] = useState(() =>
    lsGet('feedingMethod', '')
  );

  // ────────────────────────────────────────────────────────────
  // Persist State
  // ────────────────────────────────────────────────────────────

  useEffect(() => {
    lsSet(STORAGE_KEYS.journey, journeyType);
  }, [journeyType]);

  useEffect(() => {
    lsSet(STORAGE_KEYS.userName, userName);
  }, [userName]);

  useEffect(() => {
    lsSet(STORAGE_KEYS.culture, culture);
  }, [culture]);

  useEffect(() => {
    lsSet(STORAGE_KEYS.dietaryPractices, dietaryPractices);
  }, [dietaryPractices]);

  useEffect(() => {
    lsSet('userReligion', religion || '');
  }, [religion]);

  useEffect(() => {
    lsSet('hasDietaryPractices', hasDietaryPractices ?? '');
  }, [hasDietaryPractices]);

  useEffect(() => {
    lsSet('pregnancyEdd', edd || '');
  }, [edd]);

  useEffect(() => {
    lsSet('babyNumber', babyNumber || '1st');
  }, [babyNumber]);

  useEffect(() => {
    lsSet(STORAGE_KEYS.babyBirthDate, babyBirthDate || '');
  }, [babyBirthDate]);

  useEffect(() => {
    lsSet('babyAgeDays', babyAgeDays);
  }, [babyAgeDays]);

  useEffect(() => {
    lsSet('cycleLength', cycleLength || '28');
  }, [cycleLength]);

  useEffect(() => {
    lsSet('periodLength', periodLength || '5');
  }, [periodLength]);

  useEffect(() => {
    lsSet('treatmentType', treatmentType || '');
  }, [treatmentType]);

  useEffect(() => {
    lsSet('ivfCycleNumber', ivfCycleNumber || '1');
  }, [ivfCycleNumber]);

  useEffect(() => {
    lsSet('menopauseStage', menopauseStage || '');
  }, [menopauseStage]);

  useEffect(() => {
    lsSet('menopauseSymptoms', menopauseSymptoms || []);
  }, [menopauseSymptoms]);

  useEffect(() => {
    lsSet('feedingMethod', feedingMethod || '');
  }, [feedingMethod]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // ────────────────────────────────────────────────────────────
  // Pregnancy Helpers
  // ────────────────────────────────────────────────────────────

  const getCurrentWeek = useCallback(() => {
    const startDate = lsGet(STORAGE_KEYS.startDate, null);

    if (!startDate) return null;

    try {
      const start = new Date(startDate);
      const now = new Date();

      const diffDays = Math.ceil(
        Math.abs(now - start) / (1000 * 60 * 60 * 24)
      );

      const weeks = Math.floor(diffDays / 7) + 1;

      return Math.min(weeks, 42);
    } catch {
      return null;
    }
  }, []);

  const getTrimester = useCallback(() => {
    const week = getCurrentWeek();

    if (!week) return null;
    if (week <= 13) return 1;
    if (week <= 26) return 2;

    return 3;
  }, [getCurrentWeek]);

  // ────────────────────────────────────────────────────────────
  // Context Value
  // ────────────────────────────────────────────────────────────

  const value = useMemo(
    () => ({
      // Journey
      journeyType,
      setJourneyType,

      // User
      userName,
      setUserName,
      culture,
      setCulture,

      // Additional User Data
      religion,
      setReligion,
      hasDietaryPractices,
      setHasDietaryPractices,

      // Dietary
      dietaryPractices,
      setDietaryPractices,

      // Pregnancy
      getCurrentWeek,
      getTrimester,
      edd,
      setEdd,
      babyNumber,
      setBabyNumber,

      // Baby
      babyAgeDays,
      setBabyAgeDays,
      babyBirthDate,
      setBabyBirthDate,

      // Fertility Tracking
      cycleLength,
      setCycleLength,
      periodLength,
      setPeriodLength,

      // IVF
      treatmentType,
      setTreatmentType,
      ivfCycleNumber,
      setIvfCycleNumber,

      // Menopause
      menopauseStage,
      setMenopauseStage,
      menopauseSymptoms,
      setMenopauseSymptoms,

      // Postpartum
      feedingMethod,
      setFeedingMethod,

      // UI
      showSOS,
      setShowSOS,
      isLoading,
      setIsLoading,
    }),
    [
      journeyType,
      userName,
      culture,
      religion,
      hasDietaryPractices,
      dietaryPractices,
      getCurrentWeek,
      getTrimester,
      edd,
      babyNumber,
      babyAgeDays,
      babyBirthDate,
      cycleLength,
      periodLength,
      treatmentType,
      ivfCycleNumber,
      menopauseStage,
      menopauseSymptoms,
      feedingMethod,
      showSOS,
      isLoading,
    ]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export default AppContext;