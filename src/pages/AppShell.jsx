// AppShell.jsx
import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import Header from '../components/layout/Header';
import BottomNav from '../components/nav/BottomNav';
import EmergencyModal from '../components/modals/EmergencyModal';
import SubscriptionPlans from '../components/SubscriptionPlans';
import { BLOOM_KB } from '../data/journey';
import EPDSClinicalModal from '../components/modals/EPDSClinicalModal';
import { auth, db } from '../context/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// ── Lazy loaded pages ────────────────────────────────────────────────────────
const Home        = lazy(() => import('./Home'));
const Menu        = lazy(() => import('./Menu'));
const Settings    = lazy(() => import('./Settings'));
const Kicks       = lazy(() => import('./Kicks'));
const Nutrition   = lazy(() => import('./Nutrition'));
const Vitals      = lazy(() => import('./Vitals'));
const Health      = lazy(() => import('./Health'));
const Baby        = lazy(() => import('./Baby'));
const Mental      = lazy(() => import('./Mental'));
const Partner     = lazy(() => import('./Partner'));
const Chat        = lazy(() => import('./Chat'));
const Safety      = lazy(() => import('./Safety'));
const TTC         = lazy(() => import('./TTC'));
const Nursing     = lazy(() => import('./Nursing'));
const Ivfjourney  = lazy(() => import('./IVFJourney'));
const AIAssistant = lazy(() => import('./Chat/AIAssistant'));
const Menopause   = lazy(() => import('./Menopause/Menopause'));
const WeightLogging = lazy(() => import('./WeightLogging')); 
const Calendar    = lazy(() => import('./Calendar'));
const Insights    = lazy(() => import('./Insights'));
const Profile     = lazy(() => import('./Profile'));
const EPDSQuestionnaire = lazy(() => import('../components/EPDSQuestionnaire'));

// Placeholder for unfinished screens
function ComingSoon({ name }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      flex: 1, padding: 40, textAlign: 'center',
      color: 'var(--muted)',
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
      <h3 style={{ marginBottom: 8, color: 'var(--text)' }}>{name}</h3>
      <p style={{ fontSize: 14 }}>This feature is coming soon.</p>
    </div>
  );
}

// Journey mapping
const JOURNEY_TAB_MAP = {
  pregnant:  'home',
  ivf:       'treatment',
  conceive:  'ttc',
  mom:       'nursing',
  menopause: 'menopause',
};

const JOURNEY_KEY_MAP = {
  pregnant:  'pregnant',
  ivf:       'ivf',
  conceive:  'conceive',
  mom:       'mom',
  menopause: 'menopause',
};

// Base tabs available to all journeys
const BASE_TABS = new Set([
  'home', 'menu', 'settings', 'insights', 'profile', 
  'chat', 'assistant', 'vitals', 'calendar', 'nutrition', 
  'health', 'mental', 'safety', 'body'
]); 

// Journey-specific blocked tabs
const getBlockedTabsForJourney = (journeyType) => {
  switch(journeyType) {
    case 'ivf':
      return new Set([
        'baby', 'nursing', 'kicks', 'ttc', 'pregnancy', 
        'menstrual',
        // 'partner' removed — IVF now has Partner tab (sperm health, SA decoder, ICSI)
      ]);
    
    case 'mom':
      return new Set([
        'kicks', 'ttc', 'ivf', 'treatment', 'medications', 
        'scans', 'embryos', 'pregnancy', 'menstrual', 'partner',
      ]);
    
    case 'pregnant':
      return new Set([
        'nursing', 'ttc', 'ivf', 'treatment', 'medications', 
        'scans', 'embryos', 'menstrual', 'menopause',
        // partner is allowed for pregnant — shows partner support content
      ]);
    
    case 'conceive':
      return new Set([
        'baby', 'nursing', 'kicks', 'ivf', 'treatment', 
        'medications', 'scans', 'embryos', 'menopause', 'pregnancy',
        // partner is allowed for conceive — shows male fertility content
      ]);
    
    case 'menopause':
      return new Set([
        'baby', 'nursing', 'kicks', 'ttc', 'ivf', 'treatment', 
        'medications', 'scans', 'embryos', 'pregnancy', 'partner',
      ]);
    
    default:
      return new Set();
  }
};

function Spinner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', flex: 1,
    }}>
      <div style={{
        width: 32, height: 32,
        border: '3px solid var(--border)',
        borderTopColor: 'var(--t)',
        borderRadius: '50%',
        animation: 'sp 0.8s linear infinite',
      }} />
    </div>
  );
}

export default function AppShell() {
  const { journey } = useParams();
  const navigate = useNavigate();
  const { 
    journeyType, 
    setJourneyType,
    showSOS, 
    setShowSOS,
    userId,
    updateJourneyType,
    updateUserName,
    updateCulture,
    updateDietaryPractices,
    updateEdd,
    updateBabyNumber,
    updateBabyBirthDate,
    updateCycleLength,
    updatePeriodLength,
    updateTreatmentType,
    updateIvfCycleNumber,
    updateMenopauseStage,
    updateMenopauseSymptoms,
    updateFeedingMethod,
  } = useApp();

  const [showEPDS, setShowEPDS] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [epdsScore, setEpdsScore] = useState(null);
  const [tab, setTabState] = useState('home');

  // ── Sync URL journey with context ──
  useEffect(() => {
    if (journey) {
      const validJourneys = ['pregnant', 'ivf', 'conceive', 'mom', 'menopause'];
      if (validJourneys.includes(journey) && journey !== journeyType) {
        updateJourneyType(journey);
      }
    }
  }, [journey, journeyType, updateJourneyType]);

  // ── EPDS Check - Using Firestore ──
  useEffect(() => {
    if (journeyType !== 'mom' || !userId) return;

    const checkEPDS = async () => {
      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        const data = userSnap.data();
        if (!data) return;

        const postnatalDay = data.postnatalDay || 0;
        const epdsScreened = data.epdsScreened || {};

        const checkpoints = [
          { key: 'week2',  from: 14, to: 20  },
          { key: 'week6',  from: 40, to: 50  },
          { key: 'week12', from: 84, to: 100 },
        ];

        const checkpoint = checkpoints.find(
          c => postnatalDay >= c.from && postnatalDay <= c.to && !epdsScreened[c.key]
        );

        if (checkpoint) {
          const timer = setTimeout(() => setShowEPDS(true), 1500);
          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('Error checking EPDS:', error);
      }
    };

    checkEPDS();
  }, [journeyType, userId]);

  // ── Handle EPDS Complete ──
  const handleEPDSComplete = async (score) => {
    setShowEPDS(false);
    setEpdsScore(score);

    if (!userId) return;

    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const data = userSnap.data() || {};
      const postnatalDay = data.postnatalDay || 0;
      const epdsScreened = data.epdsScreened || {};

      if (postnatalDay >= 14 && postnatalDay <= 20)   epdsScreened.week2  = true;
      else if (postnatalDay >= 40 && postnatalDay <= 50)  epdsScreened.week6  = true;
      else if (postnatalDay >= 84 && postnatalDay <= 100) epdsScreened.week12 = true;

      await setDoc(userRef, {
        epdsScreened,
        epdsScore: score,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      console.error('Error saving EPDS result:', error);
    }
  };

  // ── Get allowed tabs ──
  const journeyKey  = JOURNEY_KEY_MAP[journeyType] ?? journeyType;
  const allowed     = BLOOM_KB[journeyKey]?.tabs ?? [];
  const blockedTabs = getBlockedTabsForJourney(journeyType);

  const isTabAllowed = (tabId) => {
    if (BASE_TABS.has(tabId))    return true;
    if (blockedTabs.has(tabId))  return false;
    return allowed.includes(tabId);
  };

  const getInitialTab = () => {
    const mappedTab = JOURNEY_TAB_MAP[journeyType] || 'home';
    if (blockedTabs.has(mappedTab)) return 'home';
    if (BASE_TABS.has(mappedTab) || allowed.includes(mappedTab)) return mappedTab;
    return 'home';
  };

  useEffect(() => {
    setTabState(getInitialTab());
  }, [journeyType]);

  const handleSetTab = (id) => {
    if (isTabAllowed(id)) setTabState(id);
  };

  // ── Subscription handlers ──
  const handleUpgrade        = () => setShowSubscription(true);
  const handleSubscriptionClose = () => setShowSubscription(false);
  const handleUpgradeSuccess = () => {
    handleSubscriptionClose();
    navigate('/app/' + journeyType + '?upgraded=1');
  };

  // ── Render page based on tab ──
  const renderPage = () => {
    if (!isTabAllowed(tab)) {
      return <Home setTab={handleSetTab} onUpgrade={handleUpgrade} />;
    }

    switch (tab) {
      // Core tabs
      case 'home':      return <Home setTab={handleSetTab} onUpgrade={handleUpgrade} />;
      case 'menu':      return <Menu setActive={handleSetTab} onUpgrade={handleUpgrade} />;
      case 'settings':  return <Settings onUpgrade={handleUpgrade} />;
      case 'insights':  return <Insights onUpgrade={handleUpgrade} />;
      case 'profile':   return <Profile onUpgrade={handleUpgrade} />;
      case 'body':      return <WeightLogging setTab={handleSetTab} onUpgrade={handleUpgrade} />;
      case 'safety':    return <Safety />;

      // TTC & Fertility
      case 'ttc':       return journeyType === 'conceive' ? <TTC /> : <Home setTab={handleSetTab} onUpgrade={handleUpgrade} />;
      case 'calendar':  return <Calendar />;
      case 'vitals':    return <Vitals />;
      case 'nutrition': return <Nutrition />;
      case 'health':    return <Health />;
      case 'mental':    return <Mental />;

      // Chat & AI
      case 'chat':      return <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}><Chat onUpgrade={handleUpgrade} /></div>;
      case 'assistant': return <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}><AIAssistant onUpgrade={handleUpgrade} /></div>;

      // Pregnancy tabs
      case 'kicks':   return journeyType === 'pregnant' ? <Kicks /> : <Home setTab={handleSetTab} onUpgrade={handleUpgrade} />;
      case 'baby':    return (journeyType === 'pregnant' || journeyType === 'mom') ? <Baby /> : <Home setTab={handleSetTab} onUpgrade={handleUpgrade} />;
      case 'nursing': return journeyType === 'mom' ? <Nursing /> : <Home setTab={handleSetTab} onUpgrade={handleUpgrade} />;

      // Partner — available to pregnant, conceive, and ivf
      case 'partner':
        return (journeyType === 'pregnant' || journeyType === 'conceive' || journeyType === 'ivf')
          ? <Partner />
          : <Home setTab={handleSetTab} onUpgrade={handleUpgrade} />;

      // IVF Journey tabs
      case 'ivf':
      case 'treatment':   return journeyType === 'ivf' ? <Ivfjourney activeTab="treatment" />   : <Home setTab={handleSetTab} onUpgrade={handleUpgrade} />;
      case 'medications': return journeyType === 'ivf' ? <Ivfjourney activeTab="medications" /> : <Home setTab={handleSetTab} onUpgrade={handleUpgrade} />;
      case 'scans':       return journeyType === 'ivf' ? <Ivfjourney activeTab="scans" />       : <Home setTab={handleSetTab} onUpgrade={handleUpgrade} />;
      case 'embryos':     return journeyType === 'ivf' ? <Ivfjourney activeTab="embryos" />     : <Home setTab={handleSetTab} onUpgrade={handleUpgrade} />;

      case 'menopause': return journeyType === 'menopause' ? <Menopause /> : <Home setTab={handleSetTab} onUpgrade={handleUpgrade} />;

      // Coming soon
      case 'pregnancy': return <ComingSoon name="Pregnancy Tracker" />;
      case 'menstrual': return <ComingSoon name="Menstrual Tracker" />;

      default: return <Home setTab={handleSetTab} onUpgrade={handleUpgrade} />;
    }
  };

  return (
    <div className="app-page">
      <div className="app-frame fu">
        {showSOS && <EmergencyModal onClose={() => setShowSOS(false)} />}

        {/* EPDS Questionnaire Overlay */}
        {showEPDS && (
          <div style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', 
            zIndex: 2000, display: 'flex', alignItems: 'center', 
            justifyContent: 'center', padding: 'var(--pad-x)' 
          }}>
            <div style={{ 
              background: 'var(--card)', borderRadius: 'var(--r2)', 
              maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', width: '100%' 
            }}>
              <Suspense fallback={<Spinner />}>
                <EPDSQuestionnaire onComplete={handleEPDSComplete} />
              </Suspense>
            </div>
          </div>
        )}

        {/* EPDS Clinical Results Modal */}
        {epdsScore !== null && (
          <EPDSClinicalModal
            score={epdsScore}
            onClose={() => setEpdsScore(null)}
          />
        )}

        {/* Subscription Modal */}
        {showSubscription && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 2001, overflow: 'auto',
            background: 'linear-gradient(135deg, #FCE8EF 0%, #FFF0F5 100%)',
          }}>
            <button
              onClick={handleSubscriptionClose}
              style={{
                position: 'fixed', top: 20, right: 20,
                background: 'white', border: 'none', fontSize: 24,
                cursor: 'pointer', width: 40, height: 40, borderRadius: 20,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 2002,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </button>
            <Suspense fallback={<Spinner />}>
              <SubscriptionPlans 
                onClose={handleSubscriptionClose} 
                onUpgrade={handleUpgradeSuccess} 
              />
            </Suspense>
          </div>
        )}

        <Header onSOS={() => setShowSOS(true)} onUpgrade={handleUpgrade} />

        <div
          className="scroll-area fu"
          key={tab}
          style={tab === 'chat' || tab === 'assistant'
            ? { display: 'flex', flexDirection: 'column', overflow: 'hidden' }
            : {}}
        >
          <Suspense fallback={<Spinner />}>
            {renderPage()}
          </Suspense>
        </div>

        <BottomNav active={tab} setActive={handleSetTab} />
      </div>
    </div>
  );
}