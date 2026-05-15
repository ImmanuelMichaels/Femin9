import {
  Activity, Salad, Heart, Stethoscope, Baby,
  Brain, Bot, ShieldCheck, Moon, HandHeart,
  Calendar, Settings, Globe,
} from 'lucide-react';
import { JOURNEY_CONFIG } from '../data/journey';
import { useApp } from '../context/AppContext';
import './MenuScreen.css';

/* ── feature definitions ── */
const ALL_ITEMS = [
  {
    id: 'kicks',
    Icon: Activity,
    label: 'Baby Kicks',
    desc: 'Track movements and patterns',
    iconBg: '#fde8f0',
    iconColor: '#d63a6e',
  },
  {
    id: 'nutrition',
    Icon: Salad,
    label: 'Nutrition',
    desc: 'Meals and nutrition guidance',
    iconBg: '#fff3e0',
    iconColor: '#e57c1a',
  },
  {
    id: 'vitals',
    Icon: Heart,
    label: 'Vitals',
    desc: 'Monitor your vitals',
    iconBg: '#fde4f0',
    iconColor: '#e91e8c',
  },
  {
    id: 'health',
    Icon: Stethoscope,
    label: 'Health',
    desc: 'Symptoms and health logs',
    iconBg: '#e3f2fd',
    iconColor: '#1976d2',
  },
  {
    id: 'baby',
    Icon: Baby,
    label: 'Baby Care',
    desc: 'Care guides and essentials',
    iconBg: '#ede7f6',
    iconColor: '#8a2be2',
  },
  {
    id: 'mental',
    Icon: Brain,
    label: 'Mental Health',
    desc: 'Mind, mood and wellness',
    iconBg: '#e8f5e9',
    iconColor: '#2e9e67',
  },
  {
    id: 'chat',
    Icon: Bot,
    label: 'AI Chat',
    desc: 'Ask anything, get support',
    iconBg: '#e0f7fa',
    iconColor: '#0097a7',
  },
  {
    id: 'safety',
    Icon: ShieldCheck,
    label: 'Safety',
    desc: 'Emergency info and alerts',
    iconBg: '#fce8e8',
    iconColor: '#c62828',
  },
  {
    id: 'ttc',
    Icon: Moon,
    label: 'TTC',
    desc: 'Trying to conceive support',
    iconBg: '#ede7f6',
    iconColor: '#7b1fa2',
  },
  {
    id: 'nursing',
    Icon: HandHeart,
    label: 'Nursing',
    desc: 'Breastfeeding and pumping',
    iconBg: '#fde8f0',
    iconColor: '#d63a6e',
  },
  {
    id: 'calendar',
    Icon: Calendar,
    label: 'Calendar',
    desc: 'Appointments and reminders',
    iconBg: '#fff3e0',
    iconColor: '#e57c1a',
  },
  {
    id: 'settings',
    Icon: Settings,
    label: 'Settings',
    desc: 'Personalise your experience',
    iconBg: '#eceff1',
    iconColor: '#546e7a',
  },
];

/* ── helpers ── */
const chunk = (arr, n) =>
  arr.reduce((acc, item, i) => {
    if (i % n === 0) acc.push([]);
    acc[acc.length - 1].push(item);
    return acc;
  }, []);

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

/* ── sub-components ── */
function Pill({ emoji, label, color, bg, border }) {
  return (
    <div
      className="ms-pill"
      style={{ color, background: bg, border: border ? `1.5px solid ${border}` : 'none' }}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </div>
  );
}

function StatCard({ value, label, color }) {
  return (
    <div className="ms-stat">
      <span className="ms-stat-value" style={{ color }}>{value}</span>
      <span className="ms-stat-label">{label}</span>
    </div>
  );
}

/* ── main component ── */
export default function MenuScreen({ setActive }) {
  const { journeyType, userName } = useApp();
  const allowed = JOURNEY_CONFIG[journeyType]?.tabs || JOURNEY_CONFIG.pregnant.tabs;
  const items = ALL_ITEMS.filter(i => allowed.includes(i.id));
  const rows = chunk(items, 3);
  const name = userName || 'Adaeze';

  return (
    <div className="ms-root">

      {/* ── Header ── */}
      <div className="ms-header">
        <h2 className="ms-greeting">
          {greeting()}, {name} 👋
        </h2>
        <div className="ms-header-right">
          <div className="ms-lang">
            <Globe size={14} strokeWidth={1.8} />
            EN
          </div>
          <button className="ms-sos" onClick={() => setActive('safety')}>
            SOS
          </button>
        </div>
      </div>

      {/* ── Status pills ── */}
      <div className="ms-pills">
        <Pill emoji="🤰" label="Week 26" color="#7b1fa2" bg="#f3e5f5" />
        <Pill emoji="🔥" label="Iron Low" color="#e57c1a" bg="#fff3e0" />
        <Pill emoji="📍" label="Lagos"    color="#7b1fa2" bg="transparent" border="#c4a0e8" />
      </div>

      {/* ── All Features ── */}
      <div className="ms-section-header">
        <h3 className="ms-section-title">All Features</h3>
        <p className="ms-section-sub">Tap any tool to open it</p>
      </div>

      <div className="ms-rows">
        {rows.map((row, ri) => (
          <div key={ri} className="ms-row-card">
            {row.map((item, ii) => (
              <button
                key={item.id}
                className="ms-feature-btn"
                onClick={() => setActive(item.id)}
                style={{ animationDelay: `${(ri * 3 + ii) * 0.04}s` }}
              >
                <div className="ms-icon-box" style={{ background: item.iconBg }}>
                  <item.Icon size={22} color={item.iconColor} strokeWidth={1.8} />
                </div>
                <span className="ms-feat-label">{item.label}</span>
                <span className="ms-feat-desc">{item.desc}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* ── Your Journey card ── */}
      <div className="ms-journey-card">
        <p className="ms-journey-title">
          Your Journey <span className="ms-dot">·</span> Week 26
        </p>
        <div className="ms-stats-row">
          <StatCard value="98"   label="Days to EDD"     color="#7b1fa2" />
          <StatCard value="Good" label="Baby Movement"   color="#2e9e67" />
          <StatCard value="Low"  label="Iron Level"      color="#e57c1a" />
        </div>
        {/* Decorative pregnancy silhouette */}
        <div className="ms-journey-art" aria-hidden="true">
          <svg viewBox="0 0 80 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="40" cy="18" rx="11" ry="11" fill="#d63a6e" opacity=".18"/>
            <path d="M28 32 C24 42 20 55 24 68 C28 82 38 92 40 95 C42 92 52 82 56 68 C60 55 56 42 52 32 C46 28 34 28 28 32Z" fill="#d63a6e" opacity=".18"/>
            <ellipse cx="44" cy="60" rx="9" ry="10" fill="#d63a6e" opacity=".12"/>
            <path d="M32 90 C30 96 30 102 32 108" stroke="#d63a6e" strokeWidth="3" strokeLinecap="round" opacity=".14"/>
            <path d="M48 90 C50 96 50 102 48 108" stroke="#d63a6e" strokeWidth="3" strokeLinecap="round" opacity=".14"/>
          </svg>
        </div>
      </div>

    </div>
  );
}