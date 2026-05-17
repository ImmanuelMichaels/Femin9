import { useState, lazy, Suspense } from 'react';
import { useApp } from '../context/AppContext';
import AppHeader from '../components/layout/AppHeader';
import BottomNav from '../components/nav/BottomNav';
import EmergencyModal from '../components/modals/EmergencyModal';
import { JOURNEY_CONFIG } from '../data/journey';

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

const JOURNEY_TAB_MAP = {
  ivf:       'ivf',
  conceive:  'ttc',
  mom:       'nursing',
  pregnant:  'home',
  menopause: 'health',
};

const Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
    <div style={{
      width: 32, height: 32,
      border: '3px solid var(--border)',
      borderTopColor: 'var(--t)',
      borderRadius: '50%',
      animation: 'sp 0.8s linear infinite'
    }} />
  </div>
);

export default function AppShell() {
  const { journeyType, showSOS, setShowSOS } = useApp();

  // ✅ Single declaration — derives initial tab from journey selection
  const [tab, setTab]         = useState(JOURNEY_TAB_MAP[journeyType] || 'home');
  const [prevTab, setPrevTab] = useState(null);

  const allowed = JOURNEY_CONFIG[journeyType]?.tabs || [];

  const handleSetTab = (id) => {
    setPrevTab(tab);
    const base = ['home', 'menu', 'settings'];
    if (base.includes(id) || allowed.includes(id)) setTab(id);
  };

  const renderPage = () => {
    switch (tab) {
      case 'home':      return <Home setTab={handleSetTab} />;
      case 'menu':      return <Menu setActive={handleSetTab} />;
      case 'settings':  return <Settings />;
      case 'assistant': return <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}><AIAssistant /></div>;
      case 'kicks':     return <Kicks />;
      case 'nutrition': return <Nutrition />;
      case 'vitals':    return <Vitals />;
      case 'health':    return <Health />;
      case 'baby':      return <Baby />;
      case 'mental':    return <Mental />;
      case 'partner':   return <Partner />;
      case 'chat':      return <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}><Chat /></div>;
      case 'safety':    return <Safety />;
      case 'ttc':       return <TTC />;
      case 'nursing':   return <Nursing />;
      case 'ivf':       return <Ivfjourney />;
      default:          return <Home setTab={handleSetTab} />;
    }
  };

  return (
    <div className="app-page">
      <div className="app-frame fu">
        {showSOS && <EmergencyModal onClose={() => setShowSOS(false)} />}
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