import {
  Activity, Salad, Heart, Stethoscope, Baby,
  Brain, Bot, ShieldCheck, Moon, HandHeart,
  Calendar, Flower2, Droplets, BarChart3,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import './MenuScreen.css';

/* ─── Feature registry ─────────────────────────────────────────────────────── */
const FEATURES = {
  kicks:     { Icon: Activity,    label: 'Baby Kicks',    desc: 'Track movements',            iconBg: '#fde8f0', iconColor: '#d63a6e' },
  vitals:    { Icon: Heart,       label: 'Vitals',        desc: 'BP, weight & more',          iconBg: '#fde4f0', iconColor: '#e91e8c' },
  nutrition: { Icon: Salad,       label: 'Nutrition',     desc: 'Meals & food safety',        iconBg: '#fff3e0', iconColor: '#e57c1a' },
  health:    { Icon: Stethoscope, label: 'Health',        desc: 'Symptoms & meds',            iconBg: '#e3f2fd', iconColor: '#1976d2' },
  baby:      { Icon: Baby,        label: 'Baby Care',     desc: 'Guides & milestones',        iconBg: '#ede7f6', iconColor: '#8a2be2' },
  mental:    { Icon: Brain,       label: 'Mental Health', desc: 'Mood & wellbeing',           iconBg: '#e8f5e9', iconColor: '#2e9e67' },
  chat:      { Icon: Bot,         label: 'AI Chat',       desc: 'Ask anything',               iconBg: '#e0f7fa', iconColor: '#0097a7' },
  safety:    { Icon: ShieldCheck, label: 'Safety',        desc: 'Emergency alerts',           iconBg: '#fce8e8', iconColor: '#c62828' },
  ttc:       { Icon: Moon,        label: 'Cycle',         desc: 'Ovulation & fertile window', iconBg: '#ede7f6', iconColor: '#7b1fa2' },
  nursing:   { Icon: HandHeart,   label: 'Nursing',       desc: 'Breastfeeding & pumping',    iconBg: '#fde8f0', iconColor: '#d63a6e' },
  calendar:  { Icon: Calendar,    label: 'Calendar',      desc: 'Appointments & reminders',   iconBg: '#fff3e0', iconColor: '#e57c1a' },
  ivf:       { Icon: Flower2,     label: 'IVF',           desc: 'Cycle & medication log',     iconBg: '#f3e5f5', iconColor: '#9c27b0' },
  menstrual: { Icon: Droplets,    label: 'Period',        desc: 'Cycle tracking',             iconBg: '#fce4ec', iconColor: '#e91e63' },
  menopause: { Icon: Moon,        label: 'Menopause',     desc: 'Symptoms & hormone log',     iconBg: '#ede7f6', iconColor: '#5e35b1' },
  insights:  { Icon: BarChart3,   label: 'Insights',      desc: 'Trends & reports',           iconBg: '#e8f5e9', iconColor: '#388e3c' },
};

/* ─── Journey-specific category layout ─────────────────────────────────────── */
const JOURNEY_MENU = {
  pregnant: [
    { category: '🤰 Baby Monitoring',   ids: ['kicks', 'vitals', 'baby']        },
    { category: '🥗 Wellness',          ids: ['nutrition', 'mental']             },
    { category: '🩺 Health & Safety',   ids: ['health', 'safety']               },
    { category: '🤖 Support & Tracking',ids: ['chat', 'calendar', 'insights']   },
  ],
  nursing: [
    { category: '👶 Baby & Feeding',    ids: ['baby', 'nursing']                 },
    { category: '💪 Your Recovery',     ids: ['vitals', 'mental', 'nutrition']   },
    { category: '🩺 Health & Safety',   ids: ['health', 'safety']               },
    { category: '🤖 Support & Tracking',ids: ['chat', 'calendar', 'insights']   },
  ],
  ttc: [
    { category: '🌙 Fertility',         ids: ['ttc', 'vitals']                   },
    { category: '🥗 Wellness',          ids: ['nutrition', 'mental']             },
    { category: '🩺 Health & Safety',   ids: ['health', 'safety']               },
    { category: '🤖 Support & Tracking',ids: ['chat', 'calendar', 'insights']   },
  ],
  ivf: [
    { category: '🌸 Treatment',         ids: ['ivf', 'vitals']                   },
    { category: '🥗 Wellness',          ids: ['nutrition', 'mental']             },
    { category: '🩺 Health & Safety',   ids: ['health', 'safety']               },
    { category: '🤖 Support & Tracking',ids: ['chat', 'calendar', 'insights']   },
  ],
  menstrual: [
    { category: '💧 Cycle',             ids: ['menstrual', 'vitals']             },
    { category: '🥗 Wellness',          ids: ['nutrition', 'mental']             },
    { category: '🩺 Health',            ids: ['health', 'safety']               },
    { category: '🤖 Support & Tracking',ids: ['chat', 'calendar', 'insights']   },
  ],
  menopause: [
    { category: '🌙 Menopause',         ids: ['menopause', 'vitals']             },
    { category: '🥗 Wellness',          ids: ['nutrition', 'mental']             },
    { category: '🩺 Health & Safety',   ids: ['health', 'safety']               },
    { category: '🤖 Support & Tracking',ids: ['chat', 'calendar', 'insights']   },
  ],
};

/* ─── Greeting helper ───────────────────────────────────────────────────────── */
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

/* ─── Sub-components ────────────────────────────────────────────────────────── */
function FeatureBtn({ id, onPress }) {
  const f = FEATURES[id];
  if (!f) return null;
  const { Icon, label, desc, iconBg, iconColor } = f;

  return (
    <button
      className="ms-feature-btn"
      onClick={() => onPress(id)}
    >
      <div className="ms-icon-box" style={{ background: iconBg }}>
        <Icon size={20} color={iconColor} strokeWidth={1.8} />
      </div>
      <span className="ms-feat-label">{label}</span>
      <span className="ms-feat-desc">{desc}</span>
    </button>
  );
}

function CategorySection({ category, ids, onPress }) {
  return (
    <div className="ms-category">
      <p className="ms-category-title">{category}</p>
      <div className="ms-category-grid">
        {ids.map(id => (
          <FeatureBtn key={id} id={id} onPress={onPress} />
        ))}
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────────────── */
export default function MenuScreen({ setActive }) {
  const { journeyType, userName } = useApp();
  const name = userName || 'Mama';
  const sections = JOURNEY_MENU[journeyType] ?? JOURNEY_MENU.pregnant;

  return (
    <div className="ms-root">

      {/* Header */}
      <div className="ms-header">
        <div>
          <p className="ms-greeting-sub">{greeting()}</p>
          <h2 className="ms-greeting">{name} 👋</h2>
        </div>
        <button className="ms-sos" onClick={() => setActive('safety')}>
          🚨 SOS
        </button>
      </div>

      {/* Journey tag */}
      <div className="ms-journey-tag">
        <span className="ms-journey-dot" />
        <span className="ms-journey-label">
          {{
            pregnant:  '🤰 Pregnancy Journey',
            nursing:   '👶 Postpartum & Nursing',
            ttc:       '🌙 Trying to Conceive',
            ivf:       '🌸 IVF & Fertility',
            menstrual: '💧 Menstrual Health',
            menopause: '🌙 Menopause Journey',
          }[journeyType] ?? 'Your Journey'}
        </span>
      </div>

      {/* Categorised feature sections */}
      <div className="ms-sections">
        {sections.map(s => (
          <CategorySection
            key={s.category}
            category={s.category}
            ids={s.ids}
            onPress={setActive}
          />
        ))}
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}