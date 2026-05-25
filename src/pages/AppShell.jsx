// src/pages/AppShell.jsx
import { useState, useEffect, lazy, Suspense } from 'react';
import { useApp } from '../context/useApp';
import AppHeader from '../components/layout/AppHeader';
import BottomNav from '../components/nav/BottomNav';
import EmergencyModal from '../components/modals/EmergencyModal';
import { BLOOM_KB } from '../data/journey';

// ── Existing modules ──────────────────────────────────────────────────────────
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

// ── Active new modules ────────────────────────────────────────────────────────
const Insights          = lazy(() => import('./Insights'));
const Profile           = lazy(() => import('./Profile'));
const EPDSQuestionnaire = lazy(() => import('../components/EPDSQuestionnaire'));

// ── Modules not yet built — uncomment each when the file exists ───────────────
// const Pregnancy = lazy(() => import('./Pregnancy'));
// const Menstrual = lazy(() => import('./Menstrual'));
// const Menopause = lazy(() => import('./Menopause'));

// ── Placeholder for screens still in development ──────────────────────────────
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

// ── Maps onboarding journey id → initial landing tab ─────────────────────────
const JOURNEY_TAB_MAP = {
  pregnant:  'home',
  ivf:       'ivf',
  conceive:  'ttc',
  mom:       'nursing',
  menopause: 'menopause',
};

// ── Maps onboarding journey id → BLOOM_KB key ─────────────────────────────────
const JOURNEY_KEY_MAP = {
  pregnant:  'pregnant',
  ivf:       'ivf',
  conceive:  'conceive',  // Changed from 'ttc' to 'conceive'
  mom:       'mom',       // Changed from 'nursing' to 'mom'
  menopause: 'menopause',
};

// ── Base tabs always available regardless of journey ─────────────────────────
const BASE_TABS = new Set(['home', 'menu', 'settings', 'insights', 'profile']);

// ── Spinner shown during lazy-load ───────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
export default function AppShell() {
  const { journeyType, showSOS, setShowSOS } = useApp();

  const [tab,      setTabState] = useState(JOURNEY_TAB_MAP[journeyType] || 'home');
  const [showEPDS, setShowEPDS] = useState(false);

  const journeyKey = JOURNEY_KEY_MAP[journeyType] ?? journeyType;
  // Get tabs from BLOOM_KB instead of JOURNEY_CONFIG
  const allowed = BLOOM_KB[journeyKey]?.tabs ?? [];

  // ── Tab navigation ──────────────────────────────────────────────────────────
  const handleSetTab = (id) => {
    if (BASE_TABS.has(id) || allowed.includes(id)) {
      setTabState(id);
    }
  };

  // ── EPDS screening ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (journeyType !== 'mom') return;

    const postnatalDay   = parseInt(localStorage.getItem('postnatalDay') || '0', 10);
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

  // ── EPDS completion handler ──────────────────────────────────────────────────
  const handleEPDSComplete = (score) => {
    setShowEPDS(false);
    localStorage.setItem('lastEPDSScreen', new Date().toISOString());
    if (score >= 13) {
      // High score — surface urgent guidance
      alert('Your score suggests you may need some support. Please speak to your GP or health visitor. Help is available.');
    }
  };

  // ── Page renderer ────────────────────────────────────────────────────────────
  const renderPage = () => {
    switch (tab) {
      // Core
      case 'home':      return <Home setTab={handleSetTab} />;
      case 'menu':      return <Menu setActive={handleSetTab} />;
      case 'settings':  return <Settings />;
      case 'insights':  return <Insights />;
      case 'profile':   return <Profile />;

      // AI / Chat — need full height, no extra scroll wrapper
      case 'chat':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            <Chat />
          </div>
        );
      case 'assistant':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            <AIAssistant />
          </div>
        );

      // Journey-specific
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

      // ── Screens still in development ────────────────────────────────────────
      case 'pregnancy': return <ComingSoon name="Pregnancy Tracker" />;
      case 'menstrual': return <ComingSoon name="Menstrual Tracker" />;
      case 'menopause': return <ComingSoon name="Menopause Support" />;

      default:          return <Home setTab={handleSetTab} />;
    }
  };

  return (
    <div className="app-page">
      <div className="app-frame fu">

        {/* SOS Modal */}
        {showSOS && <EmergencyModal onClose={() => setShowSOS(false)} />}

        {/* EPDS Postnatal Depression Screening Modal */}
        {showEPDS && (
          <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'var(--pad-x)',
          }}>
            <div style={{
              background: 'var(--card)',
              borderRadius: 'var(--r2)',
              maxWidth: 500,
              maxHeight: '90vh',
              overflowY: 'auto',
              width: '100%',
            }}>
              <Suspense fallback={<Spinner />}>
                <EPDSQuestionnaire onComplete={handleEPDSComplete} />
              </Suspense>
            </div>
          </div>
        )}

        <AppHeader onSOS={() => setShowSOS(true)} />

        <div
          className="scroll-area fu"
          key={tab}
          style={
            tab === 'chat' || tab === 'assistant'
              ? { display: 'flex', flexDirection: 'column', overflow: 'hidden' }
              : {}
          }
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