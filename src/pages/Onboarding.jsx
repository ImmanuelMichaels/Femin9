// src/pages/Onboarding.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/useApp';
import { auth, db } from '../context/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import './Onboarding.css';

/* ── per-card config ── */
const CARDS = [
  {
    id: 'pregnant',
    label: "I'm Pregnant",
    description: "Track your pregnancy and prepare for baby's arrival",
    imgSrc: 'pregnancy.png',
    imgAlt: 'pregnant woman',
    bg: '#fce8ef',
    iconColor: '#d63a6e',
    titleColor: '#bf1650',
    arrowBg: '#f5c0d2',
  },
  {
    id: 'conceive',
    label: 'Trying to Conceive',
    description: 'Get support, track ovulation and boost your fertility',
    imgSrc: 'conceive.png',
    imgAlt: 'woman thinking',
    bg: '#e8f0fb',
    iconColor: '#3b7de9',
    titleColor: '#1759d3',
    arrowBg: '#c4d8f8',
  },
  {
    id: 'ivf',
    label: 'IVF & Fertility',
    description:
      'Medication schedules, scan tracking, embryo grading, and the two-week wait — every step organised so you can focus on hope.',
    imgSrc: 'ivf.png',
    imgAlt: 'woman undergoing fertility treatment',
    bg: '#fff3e8',
    iconColor: '#f08c2e',
    titleColor: '#c96a10',
    arrowBg: '#ffd7b0',
  },
  {
    id: 'mom',
    label: "I'm already a Mom",
    description: 'Care for your baby and yourself with confidence',
    imgSrc: 'mum.png',
    imgAlt: 'mother with baby',
    bg: '#e6f5ee',
    iconColor: '#2e9e67',
    titleColor: '#1a6e45',
    arrowBg: '#b6e4cb',
  },
  {
    id: 'menopause',
    label: 'Cycle & Menopause Support',
    description: 'Understand your body and thrive through every stage',
    imgSrc: 'menopause.png',
    imgAlt: 'woman in calm pose',
    bg: '#f0e8fb',
    iconColor: '#9a3dde',
    titleColor: '#7a1db5',
    arrowBg: '#dcc4f7',
  },
];

const CULTURES = [
  { id: 'west_central_african', label: 'West & Central African', emoji: '🌍', flag: '🇳🇬🇬🇭' },
  { id: 'east_african', label: 'East African', emoji: '🌍', flag: '🇰🇪🇹🇿' },
  { id: 'south_asian', label: 'South Asian', emoji: '🕌', flag: '🇮🇳🇵🇰' },
  { id: 'caribbean', label: 'Caribbean', emoji: '🏝️', flag: '🇯🇲🇹🇹' },
  { id: 'east_asian', label: 'East & Southeast Asian', emoji: '🥢', flag: '🇨🇳🇻🇳' },
  { id: 'mena', label: 'Middle Eastern & North African', emoji: '🌙', flag: '🇪🇬🇲🇦' },
  { id: 'latin_american', label: 'Latin American', emoji: '💃', flag: '🇧🇷🇲🇽' },
  { id: 'white_european', label: 'White European', emoji: '🏰', flag: '🇬🇧🇪🇺' },
  { id: 'prefer_not', label: 'Prefer not to say', emoji: '🤐', flag: '' },
];

const RELIGIONS = [
  { id: 'christianity', label: 'Christianity' },
  { id: 'islam', label: 'Islam' },
  { id: 'hinduism', label: 'Hinduism' },
  { id: 'judaism', label: 'Judaism' },
  { id: 'buddhism', label: 'Buddhism' },
  { id: 'traditional_african', label: 'Traditional African Religion' },
  { id: 'other', label: 'Other' },
  { id: 'prefer_not', label: 'Prefer not to say' },
];

const DIETARY_PRACTICES = [
  'Halal', 'Kosher', 'No pork', 'No beef', 'Vegetarian', 'Vegan', 'No alcohol', 'Other',
];

const getPersonalisationQuestions = (journeyType) => {
  const questions = {
    pregnant: [
      { id: 'edd', label: 'What is your estimated due date?', type: 'date', placeholder: 'Select date' },
      { id: 'babyNumber', label: 'Which baby number is this?', type: 'select', options: ['1st', '2nd', '3rd', '4th+'] },
    ],
    conceive: [
      { id: 'cycleLength', label: 'What is your average cycle length?', type: 'number', placeholder: '28 days', suffix: 'days' },
      { id: 'periodLength', label: 'How many days does your period last?', type: 'number', placeholder: '5 days', suffix: 'days' },
    ],
    ivf: [
      { id: 'treatmentType', label: 'What type of treatment are you undergoing?', type: 'select', options: ['IVF', 'ICSI', 'FET', 'IUI', 'Egg Freezing'] },
      { id: 'cycleNumber', label: 'Which cycle number is this?', type: 'select', options: ['1st', '2nd', '3rd', '4th+'] },
    ],
    mom: [
      { id: 'babyBirthDate', label: 'When was your baby born?', type: 'date', placeholder: 'Select date' },
      { id: 'feedingMethod', label: 'How are you feeding?', type: 'select', options: ['Breastfeeding', 'Bottle feeding', 'Mixed', 'Pumping'] },
    ],
    menopause: [
      { id: 'stage', label: 'Which stage are you in?', type: 'select', options: ['Perimenopause', 'Menopause', 'Post-menopause', 'Not sure'] },
      { id: 'symptoms', label: 'Key symptoms (select all that apply)', type: 'multiselect', options: ['Hot flashes', 'Night sweats', 'Sleep issues', 'Brain fog', 'Mood changes', 'Joint pain'] },
    ],
  };
  return questions[journeyType] || [];
};

const Spinner = () => (
  <div style={{
    width: 20, height: 20,
    border: '2px solid #fff',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  }} />
);

const ArrowRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="#aaa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const StepIndicator = ({ currentStep, totalSteps }) => (
  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
    {Array.from({ length: totalSteps }).map((_, i) => (
      <div key={i} style={{
        width: i === currentStep ? 24 : 8,
        height: 8,
        borderRadius: 4,
        background: i === currentStep ? '#4108a5' : 'var(--border)',
        transition: 'all 0.3s',
      }} />
    ))}
  </div>
);

/* ── MAIN COMPONENT ── */
export default function Onboarding() {
  const location = useLocation();
  const navigate = useNavigate();

  // ── FIX: capture isChangingJourney in a ref so async callbacks always
  //         read the value that was present at mount, not a stale closure.
  const isChangingJourney = location.state?.changeJourney === true;
  const isChangingJourneyRef = useRef(isChangingJourney);

  const {
    setJourneyType,
    setUserName,
    setCulture,
    setEdd,
    setBabyNumber,
    setCycleLength,
    setPeriodLength,
    setTreatmentType,
    setIvfCycleNumber,
    setBabyAgeDays,
    setBabyBirthDate,
    setMenopauseStage,
    setMenopauseSymptoms,
    setFeedingMethod,
    setReligion,
    setDietaryPractices: setDietaryPracticesGlobal,
    setHasDietaryPractices: setHasDietaryPracticesGlobal,
  } = useApp();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading]         = useState(true);

  // ── FIX: always start at step 1 so the user explicitly picks a journey.
  //         In change-journey mode the pre-filled card will be highlighted
  //         but they still confirm by tapping it (or just tapping Continue).
  const [step,             setStep]             = useState(1);
  const [selectedJourney,  setSelectedJourney]  = useState(null);
  const [selectedCulture,  setSelectedCulture]  = useState('west_central_african');
  const [personalisation,  setPersonalisation]  = useState({});
  const [loading,          setLoading]          = useState(false);
  const [userName,         setLocalName]        = useState('');
  const [clickedCard,      setClickedCard]      = useState(null);
  const [error,            setError]            = useState(null);

  const [religion,            setLocalReligion]         = useState('');
  const [hasDietaryPractices, setHasDietaryPractices]   = useState(null);
  const [dietaryPractices,    setDietaryPractices]      = useState([]);

  // ── Auth listener ──────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
      setAuthLoading(false);
      if (user) prefillFromFirestore(user.uid);
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── FIX: extracted + renamed so the ref is used, not the closure value ────
  const prefillFromFirestore = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists() || !userDoc.data().onboardingComplete) return;

      const data = userDoc.data();

      if (!isChangingJourneyRef.current) {
        // Normal visit: user already onboarded → send them to their journey.
        navigate(`/app/${data.journeyType}`, { replace: true });
        return;
      }

      // Change-journey mode: pre-fill fields so the user sees their current
      // values highlighted, but stay on step 1 so they explicitly choose.
      if (data.journeyType)          setSelectedJourney(data.journeyType);
      if (data.culture)              setSelectedCulture(data.culture);
      if (data.name)                 setLocalName(data.name);
      if (data.religion)             setLocalReligion(data.religion);
      if (data.hasDietaryPractices)  setHasDietaryPractices(data.hasDietaryPractices);
      if (data.dietaryPractices)     setDietaryPractices(data.dietaryPractices || []);

      setPersonalisation({
        ...(data.edd            && { edd:           data.edd }),
        ...(data.babyNumber     && { babyNumber:    data.babyNumber }),
        ...(data.cycleLength    && { cycleLength:   data.cycleLength }),
        ...(data.periodLength   && { periodLength:  data.periodLength }),
        ...(data.treatmentType  && { treatmentType: data.treatmentType }),
        ...(data.ivfCycleNumber && { cycleNumber:   data.ivfCycleNumber }),
        ...(data.babyBirthDate  && { babyBirthDate: data.babyBirthDate }),
        ...(data.feedingMethod  && { feedingMethod: data.feedingMethod }),
        ...(data.menopauseStage    && { stage:    data.menopauseStage }),
        ...(data.menopauseSymptoms && { symptoms: data.menopauseSymptoms }),
      });
      // Deliberately keep step = 1 so the user must confirm their choice.
    } catch (err) {
      console.error('Error pre-filling onboarding:', err);
    }
  };

  const personalisationQuestions = selectedJourney
    ? getPersonalisationQuestions(selectedJourney)
    : [];

  const totalSteps = 3;

  // ── Step 1: journey card tapped ────────────────────────────────────────────
  const handleJourneySelect = (id) => {
    setClickedCard(id);
    setError(null);
    setTimeout(() => {
      setSelectedJourney(id);
      setClickedCard(null);
      setTimeout(() => setStep(2), 300);
    }, 200);
  };

  // ── Step 1 → 2 via Continue (change-journey mode, same journey kept) ──────
  const handleJourneyContinue = () => {
    if (!selectedJourney) {
      setError('Please select a journey to continue.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleCultureSelect = (cultureId) => {
    setSelectedCulture(cultureId);
    setError(null);
  };

  const handlePersonalisationChange = (id, value) => {
    setPersonalisation((prev) => ({ ...prev, [id]: value }));
    setError(null);
  };

  // ── Final save ─────────────────────────────────────────────────────────────
  const handleComplete = async () => {
    if (!userName.trim()) {
      setError('Please enter your name to continue.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        setError('Please sign in to continue.');
        setLoading(false);
        return;
      }

      // Baby age calc
      let babyAgeDaysVal = null;
      if (selectedJourney === 'mom' && personalisation.babyBirthDate) {
        const bd = new Date(personalisation.babyBirthDate);
        const now = new Date();
        const bdUTC  = Date.UTC(bd.getFullYear(),  bd.getMonth(),  bd.getDate());
        const nowUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
        babyAgeDaysVal = Math.floor((nowUTC - bdUTC) / (1000 * 60 * 60 * 24));
      }

      // Context setters
      setJourneyType(selectedJourney);
      setCulture(selectedCulture);
      if (userName)                                   setUserName(userName.trim());
      if (religion)                                   setReligion(religion);
      if (hasDietaryPractices)                        setHasDietaryPracticesGlobal(hasDietaryPractices);
      if (hasDietaryPractices === 'yes' && dietaryPractices.length > 0)
                                                      setDietaryPracticesGlobal(dietaryPractices);

      if (selectedJourney === 'pregnant') {
        if (personalisation.edd)        setEdd(personalisation.edd);
        if (personalisation.babyNumber) setBabyNumber(personalisation.babyNumber);
      }
      if (selectedJourney === 'mom') {
        if (personalisation.babyBirthDate) {
          setBabyAgeDays(babyAgeDaysVal);
          setBabyBirthDate(personalisation.babyBirthDate);
        }
        if (personalisation.feedingMethod) setFeedingMethod(personalisation.feedingMethod);
      }
      if (selectedJourney === 'conceive') {
        if (personalisation.cycleLength)  setCycleLength(personalisation.cycleLength);
        if (personalisation.periodLength) setPeriodLength(personalisation.periodLength);
      }
      if (selectedJourney === 'ivf') {
        if (personalisation.treatmentType) setTreatmentType(personalisation.treatmentType);
        if (personalisation.cycleNumber)   setIvfCycleNumber(personalisation.cycleNumber);
      }
      if (selectedJourney === 'menopause') {
        if (personalisation.stage)    setMenopauseStage(personalisation.stage);
        if (personalisation.symptoms) setMenopauseSymptoms(personalisation.symptoms);
      }

      // Firestore write
      const userDocRef  = doc(db, 'users', user.uid);
      const existingDoc = await getDoc(userDocRef);
      const existing    = existingDoc.exists() ? existingDoc.data() : {};

      const dataToSave = {
        name:               userName.trim(),
        email:              user.email,
        journeyType:        selectedJourney,
        culture:            selectedCulture,
        religion:           religion || null,
        hasDietaryPractices,
        dietaryPractices:   hasDietaryPractices === 'yes' ? dietaryPractices : [],
        onboardingComplete: true,
        updatedAt:          new Date(),
        // Preserve fields that must never be overwritten
        ...(existing.messageCount !== undefined && { messageCount: existing.messageCount }),
        ...(existing.plan         !== undefined && { plan:         existing.plan }),
        ...(existing.profileImage !== undefined && { profileImage: existing.profileImage }),
      };

      if (selectedJourney === 'pregnant') {
        if (personalisation.edd)        dataToSave.edd        = personalisation.edd;
        if (personalisation.babyNumber) dataToSave.babyNumber = personalisation.babyNumber;
      }
      if (selectedJourney === 'mom') {
        if (personalisation.babyBirthDate) {
          dataToSave.babyBirthDate = personalisation.babyBirthDate;
          dataToSave.babyAgeDays   = babyAgeDaysVal;
        }
        if (personalisation.feedingMethod) dataToSave.feedingMethod = personalisation.feedingMethod;
      }
      if (selectedJourney === 'conceive') {
        if (personalisation.cycleLength)  dataToSave.cycleLength  = personalisation.cycleLength;
        if (personalisation.periodLength) dataToSave.periodLength = personalisation.periodLength;
      }
      if (selectedJourney === 'ivf') {
        if (personalisation.treatmentType) dataToSave.treatmentType  = personalisation.treatmentType;
        if (personalisation.cycleNumber)   dataToSave.ivfCycleNumber = personalisation.cycleNumber;
      }
      if (selectedJourney === 'menopause') {
        if (personalisation.stage)    dataToSave.menopauseStage   = personalisation.stage;
        if (personalisation.symptoms) dataToSave.menopauseSymptoms = personalisation.symptoms;
      }

      await setDoc(userDocRef, dataToSave, { merge: true });

      localStorage.setItem('userJourney', selectedJourney);
      localStorage.setItem('userName',    userName.trim());

      setLoading(false);

      // ── FIX: use the ref for the redirect decision (not the closure) ──────
      if (isChangingJourneyRef.current) {
        navigate('/profile', { replace: true });
      } else {
        const hasConsents = localStorage.getItem('userConsents');
        navigate(hasConsents ? `/app/${selectedJourney}` : '/consent');
      }
    } catch (err) {
      console.error('Onboarding complete error:', err);
      setError(err.message || 'Something went wrong. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) { setStep(step - 1); setError(null); }
  };

  const handleAuthAction = (action) => {
    if (selectedJourney) localStorage.setItem('onboardingJourney', selectedJourney);
    localStorage.setItem('onboardingStep', step);
    navigate(action);
  };

  // ── Sub-renders ────────────────────────────────────────────────────────────

  const renderAuthGate = () => (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '20', justifyContent: 'center', gap: 12,
      marginBottom: 32, padding: '16px',
      background: 'var(--warm)', borderRadius: 'var(--r)',
      border: '1px solid var(--border)',
    }}>
      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--mt)', marginRight: 8, display: 'flex', alignItems: 'center' }}>
        🔒 Sign in to save your journey
      </p>
      <button
        onClick={() => handleAuthAction('/signup?redirect=/onboarding')}
        style={{
          padding: '10px 24px', background: '#4108a5', color: '#fff',
          border: 'none', borderRadius: 'var(--r)', fontWeight: 700,
          fontSize: 'var(--fs-sm)', cursor: 'pointer', minHeight: 'var(--touch)',
        }}
      >
        Create account
      </button>
      <button
        onClick={() => handleAuthAction('/login?redirect=/onboarding')}
        style={{
          padding: '10px 24px', background: 'transparent', color: 'var(--dp)',
          border: '1px solid var(--border)', borderRadius: 'var(--r)',
          fontWeight: 700, fontSize: 'var(--fs-sm)', cursor: 'pointer', minHeight: 'var(--touch)',
        }}
      >
        Sign in
      </button>
    </div>
  );

  const renderJourneyStep = () => (
    <>
      {!isAuthenticated && renderAuthGate()}

      {isChangingJourney && (
        <div style={{
          background: 'var(--pll)', padding: 'var(--sp-3)',
          borderRadius: 'var(--r)', marginBottom: 24,
          textAlign: 'center', border: '1px solid var(--pl)',
        }}>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--pl)', fontWeight: 600 }}>
            ✏️ Changing your journey — select a new path below
          </p>
        </div>
      )}

      <h1 className="ob-heading">
        {isChangingJourney ? 'Update your' : 'What brings'}{' '}
        <span className="ob-highlight">{isChangingJourney ? 'journey' : 'you'}</span>
        {!isChangingJourney && ' here?'}
      </h1>
      <p className="ob-sub">
        {isChangingJourney
          ? 'Choose a new journey to update your personalised support.'
          : 'Choose your journey so we can personalise support just for you.'}
      </p>

      {error && (
        <p style={{ color: 'var(--rd)', fontSize: 'var(--fs-sm)', textAlign: 'center', marginBottom: 16 }}>
          ⚠️ {error}
        </p>
      )}

      <div className="ob-grid ob-grid--five">
        {CARDS.map((card, i) => (
          <button
            key={card.id}
            onClick={() => handleJourneySelect(card.id)}
            className={`ob-card${clickedCard === card.id ? ' ob-card-pop' : ''}${
              i === CARDS.length - 1 && CARDS.length % 2 !== 0 ? ' ob-card--last-odd' : ''
            }`}
            style={{
              background: card.bg,
              animationDelay: `${i * 0.08}s`,
              transition: 'all 0.2s cubic-bezier(0.34, 1.2, 0.64, 1)',
              border: selectedJourney === card.id ? '3px solid #4108a5' : 'none',
            }}
          >
            <span className="ob-card-title" style={{ color: card.titleColor }}>{card.label}</span>
            <div className="ob-arrow" style={{ background: card.arrowBg, color: card.titleColor }}>
              <ArrowRight />
            </div>
            <div className="ob-illus">
              <img src={card.imgSrc} alt={card.imgAlt} />
            </div>
            {selectedJourney === card.id && (
              <div style={{
                position: 'absolute', top: 8, right: 8,
                background: '#4108a5', color: '#fff',
                borderRadius: '50%', width: 24, height: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }}>✓</div>
            )}
          </button>
        ))}
      </div>

      {/* ── FIX: "Keep current journey" shortcut in change-journey mode ──── */}
      {isChangingJourney && selectedJourney && (
        <button
          onClick={handleJourneyContinue}
          style={{
            width: '100%', marginTop: 24,
            padding: 'var(--sp-4)', background: '#4108a5', color: '#fff',
            border: 'none', borderRadius: 'var(--r)',
            fontSize: 'var(--fs-md)', fontWeight: 800, cursor: 'pointer',
            minHeight: 'var(--touch)',
          }}
        >
          Continue with {CARDS.find(c => c.id === selectedJourney)?.label} →
        </button>
      )}

      {isChangingJourney && (
        <button
          onClick={() => navigate('/profile')}
          style={{
            display: 'block', margin: '12px auto 0',
            background: 'none', border: 'none',
            color: 'var(--mt)', fontSize: 'var(--fs-sm)',
            cursor: 'pointer', textDecoration: 'underline',
          }}
        >
          Cancel — keep current journey
        </button>
      )}
    </>
  );

  const renderCultureStep = () => (
    <div style={{ maxWidth: 500, margin: '0 auto', width: '100%' }}>
      <button
        onClick={handleBack}
        style={{
          background: 'none', border: 'none', fontSize: 'var(--fs-sm)',
          color: 'var(--mt)', marginBottom: 24, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        {'<'} Back
      </button>

      <h1 className="ob-heading" style={{ fontSize: 'var(--fs-2xl)' }}>
        Your <span className="ob-highlight">culture</span>
      </h1>
      <p className="ob-sub" style={{ marginBottom: 32 }}>
        This helps us personalise food recommendations from your own kitchen.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {CULTURES.map((culture) => (
          <button
            key={culture.id}
            onClick={() => handleCultureSelect(culture.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '16px 20px', borderRadius: 'var(--r)',
              background: selectedCulture === culture.id ? 'rgb(154 61 222 / 11%)' : 'var(--card)',
              border: selectedCulture === culture.id ? '2px solid #9a3dde' : '1px solid var(--border)',
              cursor: 'pointer', width: '100%', textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 28 }}>{culture.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 'var(--fs-base)' }}>{culture.label}</span>
                {culture.flag && <span style={{ fontSize: 'var(--fs-sm)' }}>{culture.flag}</span>}
              </div>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginTop: 4 }}>
                {culture.id === 'west_central_african' && 'Jollof, Egusi, Plantain, Moi Moi'}
                {culture.id === 'east_african'         && 'Ugali, Sukuma Wiki, Nyama Choma'}
                {culture.id === 'south_asian'          && 'Dal, Roti, Curry, Samosas'}
                {culture.id === 'caribbean'            && 'Callaloo, Rice and Peas, Jerk'}
                {culture.id === 'prefer_not'           && "We'll use general NHS guidance"}
              </p>
            </div>
            {selectedCulture === culture.id && (
              <div style={{
                width: 24, height: 24, borderRadius: '50%', background: 'var(--sg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              }}>✓</div>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => setStep(3)}
        style={{
          width: '100%', padding: 'var(--sp-4)', background: '#4108a5',
          color: '#fff', border: 'none', borderRadius: 'var(--r)',
          fontSize: 'var(--fs-md)', fontWeight: 800, cursor: 'pointer',
          marginTop: 32, minHeight: 'var(--touch)',
        }}
      >
        Continue {'>'}
      </button>
    </div>
  );

  const renderPersonalisationStep = () => (
    <div style={{ maxWidth: 500, margin: '0 auto', width: '100%' }}>
      <button
        onClick={handleBack}
        style={{
          background: 'none', border: 'none', fontSize: 'var(--fs-sm)',
          color: 'var(--mt)', marginBottom: 24, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        {'<'} Back
      </button>

      {isChangingJourney && (
        <button
          onClick={() => navigate('/profile')}
          style={{
            background: 'none', border: 'none', color: 'var(--rd)',
            fontSize: 'var(--fs-sm)', cursor: 'pointer',
            marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600,
          }}
        >
          ✕ Cancel (keep current journey)
        </button>
      )}

      <h1 className="ob-heading" style={{ fontSize: 'var(--fs-2xl)' }}>
        {isChangingJourney ? 'Update your' : 'Just a few'}{' '}
        <span className="ob-highlight">details</span>
      </h1>
      <p className="ob-sub" style={{ marginBottom: 32 }}>
        {isChangingJourney
          ? 'Update your information to get more relevant support.'
          : 'This helps us give you the most relevant support.'}
      </p>

      {error && (
        <div style={{
          background: 'var(--rdl)', color: '#4108a5',
          padding: 'var(--sp-3)', borderRadius: 'var(--r)',
          marginBottom: 24, fontSize: 'var(--fs-sm)', textAlign: 'center',
        }}>
          ⚠️ {error}
        </div>
      )}

      {!isAuthenticated && (
        <div style={{
          background: 'var(--warm)', padding: 'var(--sp-3)', borderRadius: 'var(--r)',
          marginBottom: 24, fontSize: 'var(--fs-sm)', textAlign: 'center',
          border: '1px solid var(--border)',
        }}>
          ⚠️ You're not signed in. Your progress won't be saved.{' '}
          <button
            onClick={() => handleAuthAction('/signup?redirect=/onboarding')}
            style={{
              background: 'none', border: 'none', color: '#4108a5',
              fontWeight: 700, cursor: 'pointer', textDecoration: 'underline',
            }}
          >
            Sign up now
          </button>
        </div>
      )}

      {/* Name */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--dp)', display: 'block', marginBottom: 8 }}>
          What should we call you? <span style={{ color: 'var(--rd)' }}>*</span>
        </label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setLocalName(e.target.value)}
          placeholder="e.g., Adaeze, Mama, Sarah"
          style={{
            width: '100%', padding: 'var(--sp-3)', borderRadius: 'var(--r)',
            border: `1px solid ${error && !userName ? 'var(--rd)' : 'var(--border)'}`,
            fontSize: 'var(--fs-base)', background: 'var(--bg)',
          }}
        />
      </div>

      {/* Religion */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--dp)', display: 'block', marginBottom: 8 }}>
          What is your religion? (Optional)
        </label>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginBottom: 8 }}>
          This helps us provide culturally relevant health information and nutrition guidance.
          We will not make assumptions about your beliefs or dietary practices.
        </p>
        <select
          value={religion}
          onChange={(e) => setLocalReligion(e.target.value)}
          style={{
            width: '100%', padding: 'var(--sp-3)', borderRadius: 'var(--r)',
            border: '1px solid var(--border)', fontSize: 'var(--fs-base)', background: 'var(--bg)',
          }}
        >
          <option value="">Select one</option>
          {RELIGIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
      </div>

      {/* Dietary practices */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--dp)', display: 'block', marginBottom: 8 }}>
          Do any religious or cultural practices influence the foods you eat?
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {['yes', 'no'].map((opt) => (
            <button
              key={opt}
              onClick={() => { setHasDietaryPractices(opt); if (opt === 'no') setDietaryPractices([]); }}
              style={{
                padding: '8px 20px', borderRadius: 30,
                background: hasDietaryPractices === opt ? '#4108a5' : 'var(--warm)',
                color: hasDietaryPractices === opt ? '#fff' : 'var(--md)',
                border: 'none', cursor: 'pointer', fontSize: 'var(--fs-sm)', textTransform: 'capitalize',
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        {hasDietaryPractices === 'yes' && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginBottom: 8 }}>
              Select any dietary practices that apply to you
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DIETARY_PRACTICES.map((practice) => {
                const selected = dietaryPractices.includes(practice);
                return (
                  <button
                    key={practice}
                    onClick={() => setDietaryPractices((prev) =>
                      selected ? prev.filter((p) => p !== practice) : [...prev, practice]
                    )}
                    style={{
                      padding: '8px 16px', borderRadius: 30,
                      background: selected ? '#4108a5' : 'var(--warm)',
                      color: selected ? '#fff' : 'var(--md)',
                      border: 'none', cursor: 'pointer', fontSize: 'var(--fs-sm)',
                    }}
                  >
                    {practice}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Journey-specific questions */}
      {personalisationQuestions.map((q) => (
        <div key={q.id} style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--dp)', display: 'block', marginBottom: 8 }}>
            {q.label}
          </label>

          {q.type === 'date' && (
            <input
              type="date"
              value={personalisation[q.id] || ''}
              onChange={(e) => handlePersonalisationChange(q.id, e.target.value)}
              style={{
                width: '100%', padding: 'var(--sp-3)', borderRadius: 'var(--r)',
                border: '1px solid var(--border)', fontSize: 'var(--fs-base)', background: 'var(--bg)',
              }}
            />
          )}

          {q.type === 'number' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number"
                value={personalisation[q.id] || ''}
                onChange={(e) => handlePersonalisationChange(q.id, parseInt(e.target.value) || '')}
                placeholder={q.placeholder}
                style={{
                  flex: 1, padding: 'var(--sp-3)', borderRadius: 'var(--r)',
                  border: '1px solid var(--border)', fontSize: 'var(--fs-base)', background: 'var(--bg)',
                }}
              />
              {q.suffix && <span style={{ color: 'var(--mt)' }}>{q.suffix}</span>}
            </div>
          )}

          {q.type === 'select' && (
            <select
              value={personalisation[q.id] || ''}
              onChange={(e) => handlePersonalisationChange(q.id, e.target.value)}
              style={{
                width: '100%', padding: 'var(--sp-3)', borderRadius: 'var(--r)',
                border: '1px solid var(--border)', fontSize: 'var(--fs-base)', background: 'var(--bg)',
              }}
            >
              <option value="">Select one</option>
              {q.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          )}

          {q.type === 'multiselect' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {q.options.map((opt) => {
                const selected = personalisation[q.id]?.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      const current = personalisation[q.id] || [];
                      handlePersonalisationChange(q.id, selected
                        ? current.filter((s) => s !== opt)
                        : [...current, opt]
                      );
                    }}
                    style={{
                      padding: '8px 16px', borderRadius: 30,
                      background: selected ? '#4108a5' : 'var(--warm)',
                      color: selected ? '#fff' : 'var(--md)',
                      border: 'none', cursor: 'pointer', fontSize: 'var(--fs-sm)',
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}

      <button
        onClick={handleComplete}
        disabled={loading || !isAuthenticated}
        style={{
          width: '100%', padding: 'var(--sp-4)',
          background: isAuthenticated ? '#4108a5' : 'var(--border)',
          color: isAuthenticated ? '#fff' : 'var(--mt)',
          border: 'none', borderRadius: 'var(--r)',
          fontSize: 'var(--fs-md)', fontWeight: 800,
          cursor: isAuthenticated && !loading ? 'pointer' : 'not-allowed',
          marginTop: 16, minHeight: 'var(--touch)',
          opacity: loading ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}
      >
        {loading ? <Spinner /> : isAuthenticated
          ? (isChangingJourney ? 'Update Journey →' : 'Continue →')
          : 'Sign in to continue'}
      </button>

      {!isAuthenticated && (
        <p style={{ textAlign: 'center', fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginTop: 12 }}>
          You need to be signed in to save your journey
        </p>
      )}
    </div>
  );

  if (authLoading) {
    return (
      <div className="ob-root" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className="ob-root">
      <StepIndicator currentStep={step - 1} totalSteps={totalSteps} />

      {step === 1 && renderJourneyStep()}
      {step === 2 && renderCultureStep()}
      {step === 3 && renderPersonalisationStep()}

      <div className="ob-privacy">
        <ShieldIcon />
        <span>Your privacy is important to us</span>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .ob-card-pop { animation: pop 0.3s cubic-bezier(0.34, 1.2, 0.64, 1) forwards !important; }
        @keyframes pop {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.1); box-shadow: 0 12px 24px rgba(0,0,0,0.15); }
          100% { transform: scale(0.98); opacity: 0.8; }
        }
        .ob-card { transition: transform 0.2s ease, box-shadow 0.2s ease !important; }
        .ob-card:hover  { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
        .ob-card:active { transform: scale(0.98); }
      `}</style>
    </div>
  );
}