// MenuBar.jsx - Shows menu features in the drawer

import { useState, useMemo } from 'react';
import { 
  Home, Zap, MessageSquare, Heart, Stethoscope, Brain, 
  Footprints, Milk, Apple, Users, AlertTriangle, FileText, 
  Bell, LogOut, Menu, Calendar, Droplets, Flame, 
  Baby, Pill, Scan, Sparkles, Phone, HeartPulse,
  Salad, Activity, HandHeart, ShieldCheck, Bot,
  BarChart3, Flower2, Moon, Thermometer
} from 'lucide-react';
import { useApp } from '../../context/useApp';
import { useNavigate } from 'react-router-dom';
import './MenuBar.css';

// ─── ICON MAP ──────────────────────────────────────────────────────────────
const ICON_MAP = {
  home: Home,
  assistant: Zap,
  chat: MessageSquare,
  vitals: Heart,
  health: Stethoscope,
  mental: Brain,
  symptoms: Thermometer,
  menstrual: Droplets,
  menopause: Flame,
  ttc: Moon,
  kicks: Footprints,
  baby: Baby,
  nursing: HandHeart,
  ivf: Flower2,
  medications: Pill,
  scans: Scan,
  embryos: Baby,
  tww: Sparkles,
  partner: Users,
  careteam: Phone,
  timeline: HeartPulse,
  nutrition: Apple,
  safety: ShieldCheck,
  calendar: Calendar,
  insights: BarChart3,
  profile: Menu,
  settings: Menu,
  records: FileText,
  notifications: Bell,
};

// ─── MENU ITEMS BY SECTION ────────────────────────────────────────────────
const MENU_ITEMS = [
  {
    section: 'Main',
    items: [
      { id: 'home', label: 'Home', tab: 'home' },
      { id: 'assistant', label: 'AI Daily Briefing', tab: 'assistant' },
      { id: 'chat', label: 'Bloom AI Chat', tab: 'chat' },
    ]
  },
  {
    section: 'Health',
    items: [
      { id: 'vitals', label: 'Vital Signs', tab: 'vitals' },
      { id: 'symptoms', label: 'Symptom Tracker', tab: 'symptoms' },
      { id: 'mental', label: 'Mental Health', tab: 'mental' },
    ]
  },
  {
    section: "Women's Health",
    items: [
      { id: 'menstrual', label: 'Cycle Tracking', tab: 'menstrual' },
      { id: 'menopause', label: 'Menopause Care', tab: 'menopause' },
      { id: 'ttc', label: 'Fertility Tracking', tab: 'ttc' },
    ]
  },
  {
    section: 'Pregnancy & Baby',
    items: [
      { id: 'kicks', label: 'Kick Counter', tab: 'kicks' },
      { id: 'baby', label: 'Baby Tracker', tab: 'baby' },
      { id: 'nursing', label: 'Nursing Support', tab: 'nursing' },
    ]
  },
  {
    section: 'IVF & Fertility',
    items: [
      { id: 'ivf', label: 'IVF Journey', tab: 'ivf' },
      { id: 'medications', label: 'Medication Log', tab: 'medications' },
      { id: 'scans', label: 'Fertility Scans', tab: 'scans' },
      { id: 'embryos', label: 'Embryo Tracker', tab: 'embryos' },
      { id: 'tww', label: '2-Week Wait', tab: 'tww' },
      { id: 'timeline', label: 'IVF Timeline', tab: 'timeline' },
    ]
  },
  {
    section: 'Wellness',
    items: [
      { id: 'nutrition', label: 'Nutrition Guide', tab: 'nutrition' },
    ]
  },
  {
    section: 'Support',
    items: [
      { id: 'partner', label: 'Partner Mode', tab: 'partner' },
      { id: 'careteam', label: 'Care Team', tab: 'careteam' },
      { id: 'safety', label: 'Safety & Emergency', tab: 'safety' },
    ]
  },
  {
    section: 'Tools',
    items: [
      { id: 'calendar', label: 'Calendar', tab: 'calendar' },
      { id: 'insights', label: 'Health Insights', tab: 'insights' },
      { id: 'records', label: 'Health Records', tab: 'records' },
      { id: 'notifications', label: 'Notifications', tab: 'notifications' },
    ]
  },
];

// ─── JOURNEY-SPECIFIC FILTERS ─────────────────────────────────────────────
const JOURNEY_FILTERS = {
  pregnant: {
    hide: ['menstrual', 'menopause', 'ttc', 'ivf', 'medications', 'scans', 'embryos', 'tww', 'timeline']
  },
  mom: {
    hide: ['menstrual', 'menopause', 'ttc', 'ivf', 'medications', 'scans', 'embryos', 'tww', 'timeline', 'kicks']
  },
  conceive: {
    hide: ['pregnant', 'mom', 'baby', 'nursing', 'kicks', 'menopause']
  },
  ivf: {
    hide: ['pregnant', 'mom', 'baby', 'nursing', 'kicks', 'menstrual', 'menopause']
  },
  menstrual: {
    hide: ['pregnant', 'mom', 'baby', 'nursing', 'kicks', 'ivf', 'medications', 'scans', 'embryos', 'tww', 'timeline']
  },
  menopause: {
    hide: ['pregnant', 'mom', 'baby', 'nursing', 'kicks', 'ivf', 'medications', 'scans', 'embryos', 'tww', 'timeline', 'ttc', 'menstrual']
  },
  default: {
    hide: []
  }
};

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function MenuItem({ item, isActive, onSelect }) {
  const Icon = ICON_MAP[item.id];
  
  return (
    <button
      className={`menu-item ${isActive ? 'active' : ''}`}
      onClick={() => onSelect(item.tab)}
      aria-current={isActive ? 'page' : undefined}
    >
      {Icon && (
        <Icon 
          size={20} 
          strokeWidth={isActive ? 2.5 : 2} 
          className="menu-item-icon" 
        />
      )}
      <span className="menu-item-label">{item.label}</span>
      {isActive && <div className="menu-item-dot" />}
    </button>
  );
}

function MenuSection({ section, items, activeTab, onSelect }) {
  if (items.length === 0) return null;
  
  return (
    <div className="menu-section">
      <p className="menu-section-title">{section}</p>
      {items.map((item) => (
        <MenuItem
          key={item.id}
          item={item}
          isActive={activeTab === item.tab}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function MenuBar({ active, setActive, onClose, onSOS }) {
  const navigate = useNavigate();
  const { journeyType } = useApp();
  const [loggingOut, setLoggingOut] = useState(false);

  // ─── GET USER DATA FROM LOCALSTORAGE ──────────────────────────────────
  const userData = useMemo(() => {
    try {
      const email = localStorage.getItem('userEmail') || '';
      const name = localStorage.getItem('userName') || '';
      const profile = localStorage.getItem('userProfile');
      return {
        email,
        name,
        profile: profile ? JSON.parse(profile) : null,
      };
    } catch {
      return { email: '', name: '', profile: null };
    }
  }, []);

  // ─── DERIVED VALUES ──────────────────────────────────────────────────────
  const initials = userData.profile
    ? `${userData.profile.firstName?.[0] || ''}${userData.profile.lastName?.[0] || ''}`.toUpperCase()
    : userData.name 
      ? userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : '';

  const displayName = userData.profile 
    ? `${userData.profile.firstName || ''} ${userData.profile.lastName || ''}`.trim() || 'Welcome'
    : userData.name || 'Welcome';

  const weekBadge = userData.profile?.currentWeek ? `Week ${userData.profile.currentWeek}` : null;
  const trimBadge = userData.profile?.trimester ? `Trimester ${userData.profile.trimester}` : null;

  // ─── FILTER MENU ITEMS BY JOURNEY ──────────────────────────────────────
  const filteredMenuItems = useMemo(() => {
    const filter = JOURNEY_FILTERS[journeyType] || JOURNEY_FILTERS.default;
    const hiddenIds = new Set(filter.hide);

    return MENU_ITEMS.map(section => ({
      ...section,
      items: section.items.filter(item => !hiddenIds.has(item.id))
    })).filter(section => section.items.length > 0);
  }, [journeyType]);

  // ─── HANDLERS ────────────────────────────────────────────────────────────
  const handleNav = (tab) => {
    setActive(tab);
    onClose();
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      localStorage.removeItem('userJourney');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('userConsents');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setLoggingOut(false);
    }
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        className="menu-backdrop"
        onClick={onClose}
        role="button"
        aria-label="Close menu"
      />

      {/* Drawer */}
      <div className="menu-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu">
        {/* Profile Header */}
        <div className="menu-header">
          <button 
            className="menu-close-btn" 
            onClick={onClose}
            aria-label="Close menu"
          >
            ×
          </button>

          <div className="menu-avatar">
            {userData.profile?.avatarUrl ? (
              <img src={userData.profile.avatarUrl} alt="" className="menu-avatar-img" />
            ) : (
              <span className="menu-avatar-text">{initials || 'U'}</span>
            )}
          </div>

          <p className="menu-user-name">{displayName}</p>
          {userData.email && (
            <p className="menu-user-email">{userData.email}</p>
          )}

          {(weekBadge || trimBadge) && (
            <div className="menu-badges">
              {weekBadge && (
                <span className="menu-badge">{weekBadge}</span>
              )}
              {trimBadge && (
                <span className="menu-badge">{trimBadge}</span>
              )}
              {userData.profile?.role && (
                <span className="menu-badge menu-badge-role">{userData.profile.role}</span>
              )}
            </div>
          )}
        </div>

        {/* SOS Button */}
        <button
          className="menu-sos-btn"
          onClick={() => { onClose(); onSOS(); }}
          aria-label="Emergency SOS"
        >
          <AlertTriangle size={18} />
          Emergency / SOS
        </button>

        {/* Navigation Sections - THIS IS WHERE MENU ITEMS APPEAR */}
        <div className="menu-sections">
          {filteredMenuItems.map((section) => (
            <MenuSection
              key={section.section}
              section={section.section}
              items={section.items}
              activeTab={active}
              onSelect={handleNav}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="menu-footer">
          <button
            className="menu-footer-btn"
            onClick={() => handleNav('settings')}
          >
            <Menu size={20} />
            <span>Settings</span>
          </button>
          <button
            className="menu-footer-btn"
            onClick={() => handleNav('records')}
          >
            <FileText size={20} />
            <span>Health Records</span>
          </button>
          <button
            className="menu-footer-btn"
            onClick={() => handleNav('notifications')}
          >
            <Bell size={20} />
            <span>Notifications</span>
          </button>

          <button
            className="menu-signout-btn"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={20} />
            <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>

          <p className="menu-version">v1.0</p>
        </div>
      </div>
    </>
  );
}