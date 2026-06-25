import { useApp } from '../context/useApp';
import { auth } from '../context/firebase';
import { JOURNEY_CONFIG } from '../data/journey';
import './MenuScreen.css';

// ── Tab metadata: icon, label, desc, colours, category ──────────────────────
const TAB_META = {
  home:       { label: 'Home',            desc: 'Your daily overview',       emoji: '🏠', bg: '#EDE9FE', color: '#7C3AED', category: 'core'       },
  chat:       { label: 'AI Chat',         desc: 'Ask anything',              emoji: '💬', bg: '#DBEAFE', color: '#2563EB', category: 'support'    },
  insights:   { label: 'Insights',        desc: 'Trends & patterns',         emoji: '📈', bg: '#D1FAE5', color: '#059669', category: 'wellness'   },
  profile:    { label: 'Profile',         desc: 'Your account',              emoji: '👤', bg: '#F3F4F6', color: '#6B7280', category: 'core'       },
  calendar:   { label: 'Calendar',        desc: 'Appointments & dates',      emoji: '📅', bg: '#DBEAFE', color: '#2563EB', category: 'wellness'   },
  vitals:     { label: 'Vitals',          desc: 'BP, weight & more',         emoji: '💗', bg: '#FCE7F3', color: '#DB2777', category: 'wellness'   },
  nutrition:  { label: 'Nutrition',       desc: 'Meals & food safety',       emoji: '🥗', bg: '#FEF3C7', color: '#D97706', category: 'wellness'   },
  health:     { label: 'Health',          desc: 'Symptoms & meds',           emoji: '🫀', bg: '#D1FAE5', color: '#059669', category: 'wellness'   },
  mental:     { label: 'Mental Health',   desc: 'Mood & wellbeing',          emoji: '🧠', bg: '#EDE9FE', color: '#7C3AED', category: 'support'    },
  safety:     { label: 'Safety',          desc: 'Emergency guidance',        emoji: '🛡', bg: '#FEF3C7', color: '#D97706', category: 'support'    },
  // Pregnancy
  kicks:      { label: 'Kick Counter',    desc: 'Track baby movements',      emoji: '🦶', bg: '#FCE7F3', color: '#DB2777', category: 'pregnancy'  },
  baby:       { label: 'Baby',            desc: 'Growth & milestones',       emoji: '👶', bg: '#EDE9FE', color: '#7C3AED', category: 'pregnancy'  },
  partner:    { label: 'Partner',         desc: 'Tips & shared journey',     emoji: '👫', bg: '#DBEAFE', color: '#2563EB', category: 'support'    },
  // IVF
  treatment:  { label: 'IVF Journey',     desc: 'Cycle & treatment log',     emoji: '🧬', bg: '#EDE9FE', color: '#7C3AED', category: 'treatment'  },
  medications:{ label: 'Medications',     desc: 'IVF meds & injections',     emoji: '💉', bg: '#FEF3C7', color: '#D97706', category: 'treatment'  },
  scans:      { label: 'Fertility Scans', desc: 'Follicle & lining results', emoji: '🖥', bg: '#DBEAFE', color: '#2563EB', category: 'treatment'  },
  embryos:    { label: 'Embryo Tracker',  desc: 'Embryo grades & status',    emoji: '🔬', bg: '#D1FAE5', color: '#059669', category: 'treatment'  },
  // TTC
  ttc:        { label: 'TTC Tracker',     desc: 'Cycle & ovulation',         emoji: '📊', bg: '#D1FAE5', color: '#059669', category: 'fertility'  },
  // Mom
  nursing:    { label: 'Nursing',         desc: 'Feeding & pumping log',     emoji: '🤱', bg: '#FCE7F3', color: '#DB2777', category: 'postpartum' },
  // Menopause / Menstrual
  menopause:  { label: 'Menopause',       desc: 'Symptoms & tracking',       emoji: '🌡', bg: '#DBEAFE', color: '#2563EB', category: 'health'     },
  menstrual:  { label: 'Cycle Tracker',   desc: 'Period & symptom log',      emoji: '🌸', bg: '#FCE7F3', color: '#DB2777', category: 'health'     },
  body:       { label: 'Weight Log',      desc: 'Track your weight',         emoji: '⚖️', bg: '#D1FAE5', color: '#059669', category: 'wellness'   },
  assistant:  { label: 'AI Assistant',    desc: 'Your health assistant',     emoji: '🤖', bg: '#DBEAFE', color: '#2563EB', category: 'support'    },
};

// ── Category display config ──────────────────────────────────────────────────
const CATEGORY_META = {
  treatment:  { title: 'IVF Treatment',     icon: '⚙',  iconColor: '#7C3AED' },
  fertility:  { title: 'Fertility',         icon: '🌸', iconColor: '#059669' },
  pregnancy:  { title: 'Pregnancy',         icon: '🤰', iconColor: '#DB2777' },
  postpartum: { title: 'Postpartum',        icon: '🤱', iconColor: '#DB2777' },
  health:     { title: 'Health',            icon: '🌿', iconColor: '#2563EB' },
  wellness:   { title: 'Wellness',          icon: '🌿', iconColor: '#059669' },
  support:    { title: 'Support',           icon: '♥',  iconColor: '#DB2777' },
  core:       { title: 'Quick Access',      icon: '⚡', iconColor: '#D97706' },
};

// Tabs to exclude from the menu grid (handled by bottom nav or header)
const EXCLUDED_TABS = new Set(['home', 'menu', 'profile', 'settings']);

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function buildSections(tabs) {
  const categoryOrder = [
    'treatment', 'fertility', 'pregnancy', 'postpartum',
    'health', 'wellness', 'support', 'core',
  ];

  const grouped = {};

  tabs
    .filter((t) => !EXCLUDED_TABS.has(t))
    .forEach((tabId) => {
      const meta = TAB_META[tabId];
      if (!meta) return;
      const cat = meta.category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(tabId);
    });

  return categoryOrder
    .filter((cat) => grouped[cat]?.length)
    .map((cat) => ({
      id:    cat,
      ...CATEGORY_META[cat],
      tiles: grouped[cat].map((tabId) => ({ route: tabId, ...TAB_META[tabId] })),
    }));
}

export default function Menu({ setActive, onSOS }) {
  const { journeyType, setShowSOS } = useApp();
  const user = auth.currentUser;

  const type   = journeyType || 'pregnant';
  const config = JOURNEY_CONFIG[type] ?? JOURNEY_CONFIG.pregnant;
  const tabs   = config.tabs ?? [];

  const displayName = user?.displayName?.split(' ')[0] || config.greeting || 'Mama';
  const sections    = buildSections(tabs);

  const handleTile = (route) => {
    if (setActive) setActive(route);
  };

  const handleSOS = () => {
    if (setShowSOS) setShowSOS(true);
    else if (onSOS) onSOS();
  };

  return (
    <div className="ms-root">
      {/* Header */}
      <div className="ms-header">
        <div>
          <p className="ms-greeting-sub">{getGreeting()}</p>
          <p className="ms-greeting">
            {displayName} <span style={{ fontSize: 18 }}>👋</span>
          </p>
        </div>
        <button className="ms-sos" onClick={handleSOS}>
          <span style={{ fontSize: 13 }}>▲</span> SOS
        </button>
      </div>

      {/* Journey tag */}
      <div className="ms-journey-tag">
        <div className="ms-journey-dot" />
        <span className="ms-journey-label">{config.name}</span>
      </div>

      {/* Sections */}
      <div className="ms-sections">
        {sections.map((section) => (
          <div key={section.id} className="ms-category">
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
              <span style={{ fontSize: 13, color: section.iconColor }}>
                {section.icon}
              </span>
              <span className="ms-category-title">{section.title}</span>
            </div>

            <div className="ms-category-grid">
              {section.tiles.map((tile) => (
                <button
                  key={tile.route}
                  className="ms-feature-btn"
                  onClick={() => handleTile(tile.route)}
                >
                  <div className="ms-icon-box" style={{ background: tile.bg }}>
                    <span style={{ fontSize: 22, color: tile.color }}>
                      {tile.emoji}
                    </span>
                  </div>
                  <span className="ms-feat-label">{tile.label}</span>
                  <span className="ms-feat-desc">{tile.desc}</span>
                </button>
              ))}

              {/* Pad incomplete rows */}
              {section.tiles.length % 3 !== 0 &&
                Array.from({ length: 3 - (section.tiles.length % 3) }).map((_, i) => (
                  <div
                    key={`pad-${i}`}
                    className="ms-feature-btn"
                    style={{ visibility: 'hidden', pointerEvents: 'none' }}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}