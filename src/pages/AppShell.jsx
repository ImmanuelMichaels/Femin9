// src/pages/AppShell.jsx
import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/useApp';
import AppHeader from '../components/layout/AppHeader';
import BottomNav from '../components/nav/BottomNav';
import EmergencyModal from '../components/modals/EmergencyModal';
import SubscriptionPlans from '../components/SubscriptionPlans';
import { BLOOM_KB } from '../data/journey';

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
const Ivfjourney  = lazy(() => import('./IVF'));
const AIAssistant = lazy(() => import('./Chat/AIAssistant'));
const Menopause   = lazy(() => import('./Menopause/Menopause'));
const WeightLogging = lazy(() => import('./WeightLogging')); // ADDED

const Insights          = lazy(() => import('./Insights'));
const Profile           = lazy(() => import('./Profile'));
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
  ivf:       'ivf',
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

const BASE_TABS = new Set(['home', 'menu', 'settings', 'insights', 'profile', 'body']); // ADDED 'body'

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
  const { journeyType, setJourneyType, showSOS, setShowSOS } = useApp();

  const [showEPDS, setShowEPDS] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);

  // Sync URL journey with context + localStorage
  useEffect(() => {
    if (journey) {
      const validJourneys = ['pregnant', 'ivf', 'conceive', 'mom', 'menopause'];
      
      if (validJourneys.includes(journey)) {
        setJourneyType(journey);
        localStorage.setItem('userJourney', journey);
      }
    }
  }, [journey, setJourneyType]);

  // Derive initial tab from journeyType (no effect needed for this)
  const initialTab = JOURNEY_TAB_MAP[journeyType] || 'home';
  const [tab, setTabState] = useState(initialTab);

  const journeyKey = JOURNEY_KEY_MAP[journeyType] ?? journeyType;
  const allowed = BLOOM_KB[journeyKey]?.tabs ?? [];

  const handleSetTab = (id) => {
    if (BASE_TABS.has(id) || allowed.includes(id)) {
      setTabState(id);
    }
  };

  // Handle upgrade from anywhere in the app
  const handleUpgrade = () => {
    setShowSubscription(true);
  };

  // Handle subscription close
  const handleSubscriptionClose = () => {
    setShowSubscription(false);
  };

  // EPDS screening for nursing moms
  useEffect(() => {
    if (journeyType !== 'mom') return;

    const postnatalDay = parseInt(localStorage.getItem('postnatalDay') || '0', 10);
    const lastEPDSScreen = localStorage.getItem('lastEPDSScreen');

    const isCheckpoint = (
      (postnatalDay >= 14 && postnatalDay < 15) ||
      (postnatalDay >= 42 && postnatalDay < 43) ||
      (postnatalDay >= 90 && postnatalDay < 91)
    );

    if (!isCheckpoint || lastEPDSScreen) return;

    const t = setTimeout(() => setShowEPDS(true), 1000);
    return () => clearTimeout(t);
  }, [journeyType]);

  const handleEPDSComplete = (score) => {
    setShowEPDS(false);
    localStorage.setItem('lastEPDSScreen', new Date().toISOString());
    if (score >= 13) {
      alert('Your score suggests you may need some support. Please speak to your GP or health visitor.');
    }
  };

  const renderPage = () => {
    switch (tab) {
      case 'home':      return <Home setTab={handleSetTab} onUpgrade={handleUpgrade} />;
      case 'menu':      return <Menu setActive={handleSetTab} onUpgrade={handleUpgrade} />;
      case 'settings':  return <Settings onUpgrade={handleUpgrade} />;
      case 'insights':  return <Insights onUpgrade={handleUpgrade} />;
      case 'profile':   return <Profile onUpgrade={handleUpgrade} />;
      case 'body':      return <WeightLogging setTab={handleSetTab} onUpgrade={handleUpgrade} />; // ADDED

      case 'chat':      return <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}><Chat onUpgrade={handleUpgrade} /></div>;
      case 'assistant': return <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}><AIAssistant onUpgrade={handleUpgrade} /></div>;

      case 'kicks':     return <Kicks />;
      case 'nutrition': return <Nutrition />;
      case 'vitals':    return <Vitals />;
      case 'health':    return <Health />;
      case 'baby':      return <Baby />;
      case 'mental':    return <Mental />;
      case 'partner':   return <Partner />;
      case 'safety':    return <Safety />;
      case 'ttc':       return <TTC />;
      case 'nursing':   return <Nursing />;
      case 'ivf':       return <Ivfjourney />;

      case 'pregnancy': return <ComingSoon name="Pregnancy Tracker" />;
      case 'menstrual': return <ComingSoon name="Menstrual Tracker" />;
      case 'menopause': return <Menopause />;

      default:          return <Home setTab={handleSetTab} onUpgrade={handleUpgrade} />;
    }
  };

  return (
    <div className="app-page">
      <div className="app-frame fu">
        {/* Emergency SOS Modal */}
        {showSOS && <EmergencyModal onClose={() => setShowSOS(false)} />}

        {/* EPDS Screening Modal (Postpartum Depression) */}
        {showEPDS && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--pad-x)',
          }}>
            <div style={{
              background: 'var(--card)', borderRadius: 'var(--r2)', maxWidth: 500,
              maxHeight: '90vh', overflowY: 'auto', width: '100%',
            }}>
              <Suspense fallback={<Spinner />}>
                <EPDSQuestionnaire onComplete={handleEPDSComplete} />
              </Suspense>
            </div>
          </div>
        )}

        {/* Subscription Modal */}
        {showSubscription && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2001,
            overflow: 'auto',
            background: 'linear-gradient(135deg, #FCE8EF 0%, #FFF0F5 100%)'
          }}>
            <button
              onClick={handleSubscriptionClose}
              style={{
                position: 'fixed',
                top: 20,
                right: 20,
                background: 'white',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                width: 40,
                height: 40,
                borderRadius: 20,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 2002,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
            <Suspense fallback={<Spinner />}>
              <SubscriptionPlans onClose={handleSubscriptionClose} onUpgrade={() => {
                handleSubscriptionClose();
                setTimeout(() => {
                  alert('✨ Thank you for upgrading! Your new features are now available.');
                }, 300);
              }} />
            </Suspense>
          </div>
        )}

        <AppHeader onSOS={() => setShowSOS(true)} onUpgrade={handleUpgrade} />

        <div
          className="scroll-area fu"
          key={tab}
          style={tab === 'chat' || tab === 'assistant' ? { display: 'flex', flexDirection: 'column', overflow: 'hidden' } : {}}
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