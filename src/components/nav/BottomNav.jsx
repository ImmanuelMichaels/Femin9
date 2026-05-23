import { 
  Home, 
  Grid, 
  Settings, 
  MessageCircle, 
  BarChart3, 
  User,
  Activity,
  Heart,
  Apple,
  Stethoscope,
  Baby,
  Brain,
  Calendar,
  Moon,
  Flower2,
  Droplets,
  Shield
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { JOURNEY_CONFIG } from '../../data/journey';

export default function BottomNav({ active, setActive }) {
  const { journeyType } = useApp();
  
  // Get allowed tabs from journey config
  const allowedTabs = JOURNEY_CONFIG[journeyType]?.tabs || ['home', 'menu', 'settings'];
  
  // Define all possible tab configurations
  const TAB_CONFIG = {
    // Core navigation
    home: { Icon: Home, label: "Home", group: "core" },
    menu: { Icon: Grid, label: "Menu", group: "core" },
    settings: { Icon: Settings, label: "Settings", group: "core" },
    profile: { Icon: User, label: "Profile", group: "core" },
    insights: { Icon: BarChart3, label: "Insights", group: "core" },
    chat: { Icon: MessageCircle, label: "Bloom AI", group: "core" },
    
    // Pregnancy modules
    kicks: { Icon: Activity, label: "Kicks", group: "pregnancy" },
    vitals: { Icon: Heart, label: "Vitals", group: "pregnancy" },
    nutrition: { Icon: Apple, label: "Nutrition", group: "common" },
    health: { Icon: Stethoscope, label: "Health", group: "common" },
    baby: { Icon: Baby, label: "Baby", group: "postpartum" },
    mental: { Icon: Brain, label: "Mind", group: "common" },
    safety: { Icon: Shield, label: "Safety", group: "common" },
    
    // TTC modules
    ttc: { Icon: Calendar, label: "Cycle", group: "ttc" },
    
    // IVF modules
    ivf: { Icon: Flower2, label: "IVF", group: "ivf" },
    
    // Postpartum modules
    nursing: { Icon: Baby, label: "Nursing", group: "postpartum" },
    
    // Menstrual modules
    menstrual: { Icon: Droplets, label: "Period", group: "menstrual" },
    
    // Menopause modules
    menopause: { Icon: Moon, label: "Menopause", group: "menopause" }
  };
  
  // Order for core navigation
  const coreOrder = ['home', 'insights', 'chat', 'menu', 'profile'];
  
  // Build the navigation items based on allowed tabs
  const buildNavItems = () => {
    const items = [];
    
    // Add core navigation in specific order
    for (const tabId of coreOrder) {
      if (allowedTabs.includes(tabId) && TAB_CONFIG[tabId]) {
        items.push({ id: tabId, ...TAB_CONFIG[tabId] });
      }
    }
    
    // Add journey-specific tabs that aren't already in core
    const addedIds = new Set(items.map(i => i.id));
    for (const tabId of allowedTabs) {
      if (!addedIds.has(tabId) && TAB_CONFIG[tabId]) {
        items.push({ id: tabId, ...TAB_CONFIG[tabId] });
      }
    }
    
    // Ensure settings is always last if allowed
    if (allowedTabs.includes('settings') && !items.some(i => i.id === 'settings')) {
      items.push({ id: 'settings', ...TAB_CONFIG.settings });
    }
    
    // Limit to 5 items max for better UX on mobile
    return items.slice(0, 5);
  };
  
  const navItems = buildNavItems();
  
  // Determine if a tab is active
  const isActive = (id) => {
    if (active === id) return true;
    // For menu tab, highlight when in any module not in core
    if (id === 'menu' && !coreOrder.includes(active) && active !== 'settings') return true;
    return false;
  };
  
  // Handle tab click
  const handleTabClick = (id) => {
    setActive(id);
    // Haptic feedback if available
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };
  
  if (navItems.length === 0) return null;
  
  return (
    <nav className="bottom-nav" style={{ 
      justifyContent: "space-around",
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "var(--card)",
      borderTop: "1px solid var(--border)",
      padding: "var(--sp-2) var(--sp-4)",
      paddingBottom: "max(var(--sp-2), env(safe-area-inset-bottom))",
      display: "flex",
      zIndex: 100
    }}>
      {navItems.map((tab) => {
        const active = isActive(tab.id);
        const Icon = tab.Icon;
        
        return (
          <button
            key={tab.id}
            className={`nav-btn ${active ? 'nav-btn-active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
            aria-label={tab.label}
            aria-current={active ? 'page' : undefined}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "var(--sp-1)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "var(--sp-1) var(--sp-2)",
              borderRadius: "var(--r)",
              color: active ? "var(--t)" : "var(--mt)",
              transition: "all 0.2s",
              flex: 1,
              maxWidth: 80
            }}
          >
            <div style={{ position: "relative" }}>
              <Icon 
                size={22} 
                strokeWidth={active ? 2.5 : 1.8}
                style={{ transition: "all 0.2s" }}
              />
              {active && (
                <div style={{
                  position: "absolute",
                  bottom: -4,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 20,
                  height: 3,
                  background: "var(--t)",
                  borderRadius: 3
                }} />
              )}
            </div>
            <span style={{ 
              fontSize: "var(--fs-2xs)", 
              fontWeight: active ? 700 : 500,
              transition: "all 0.2s"
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
      
      <style>{`
        .nav-btn {
          -webkit-tap-highlight-color: transparent;
        }
        
        .nav-btn:active {
          transform: scale(0.95);
          opacity: 0.7;
        }
        
        @media (max-width: 480px) {
          .bottom-nav {
            padding: var(--sp-1) var(--sp-2);
            padding-bottom: max(var(--sp-1), env(safe-area-inset-bottom));
          }
          
          .nav-btn span {
            font-size: 10px;
          }
        }
      `}</style>
    </nav>
  );
}