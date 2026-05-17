import { useState } from 'react';
import { AlertTriangle, ChevronRight, Hospital } from 'lucide-react';
import CalendarStrip from '../../components/ui/CalendarStrip';
import { JOURNEY_CONFIG, ALL_TASKS } from '../../data/journey';
import { useApp } from '../../context/AppContext';
// import './Home.css';

/* ── Hero illustration — swap per journey if you have separate assets ── */
const HeroIllo = ({ src = '/pregnancy.png', alt = '' }) => (
  <img src={src} alt={alt} />
);

/* ────────────────────────────────────────────────────────────────────────
   JOURNEY HOME CONFIG
   Every key matches a journeyType string.  Add new types here freely.
   ──────────────────────────────────────────────────────────────────────── */
const JOURNEY_HOME_CONFIG = {

  /* ── PREGNANT ────────────────────────────────────────────────────────── */
  pregnant: {
    greeting: name => `GOOD MORNING, ${name} ☀️`,
    heroTitle: 'Your baby is the size of a scallion today',
    heroBody:
      'Baby is practising breathing movements. Your iron levels need attention — eat more spinach, lentils, and fortified cereals today.',
    actionChips: ['💊 Take Iron tablet', '💧 Drink water', '🚶‍♀️ Walk 20 min'],
    pills: [
      { text: '🤰 Week 26', cls: 'h-pill--pu' },
      { text: '🔥 Iron Low', cls: 'h-pill--or' },
      { text: '📍 London',   cls: 'h-pill--ol' },
    ],
    quickActions: [
      { emoji: '👣', label: 'Log Kick',   id: 'kicks'     },
      { emoji: '💊', label: 'Add Vitals', id: 'vitals'    },
      { emoji: '🍊', label: 'Meal Log',   id: 'nutrition' },
      { emoji: '🤖', label: 'Ask AI',     id: 'chat'      },
    ],
    alert: {
      title: 'Anaemia Risk Alert',
      body:
        'Your last haemoglobin was 9.2 g/dL (low). Eat dark leafy greens, lean red meat, lentils, and fortified breakfast cereals. Your GP can prescribe iron supplements. Next check due in 5 days.',
    },
    illoSrc: '/pregnancy.png',
  },

  /* ── TRYING TO CONCEIVE (TTC) ─────────────────────────────────────────── */
  ttc: {
    greeting: name => `GOOD MORNING, ${name} 🌸`,
    heroTitle: 'Your fertile window opens in 2 days',
    heroBody:
      'Today is Cycle Day 12. Oestrogen is rising — a great time to rest well and stay hydrated. Track your BBT and cervical mucus to sharpen your window.',
    actionChips: ['📅 Check Cycle', '🌡️ Log BBT', '💧 Drink water'],
    pills: [
      { text: '📅 Cycle Day 12', cls: 'h-pill--pu' },
      { text: '🟢 Fertile Soon',  cls: 'h-pill--gr' },
      { text: '📍 London',        cls: 'h-pill--ol' },
    ],
    quickActions: [
      { emoji: '📅', label: 'Log Period',    id: 'cycle'     },
      { emoji: '🌡️', label: 'Track BBT',    id: 'vitals'    },
      { emoji: '🥗', label: 'Nutrition',     id: 'nutrition' },
      { emoji: '🤖', label: 'Ask AI',        id: 'chat'      },
    ],
    alert: {
      title: 'Fertile Window Approaching',
      body:
        'Based on your last 3 cycles, your peak fertility is predicted for days 14–16. Make sure to log any symptoms so we can refine your forecast.',
    },
    illoSrc: '/ttc.png',
  },

  /* ── MENOPAUSE ───────────────────────────────────────────────────────── */
  menopause: {
    greeting: name => `GOOD MORNING, ${name} 🌿`,
    heroTitle: 'Today is a day to honour your body',
    heroBody:
      'Menopause is a transition, not an ending. Track your symptoms, rest when you need to, and remember — you know your body best. Hot flashes can ease with cool layers and paced breathing.',
    actionChips: ['🌬️ Breathing exercise', '💤 Log sleep', '🧘 5-min stretch'],
    pills: [
      { text: '🌿 Perimenopause', cls: 'h-pill--pu' },
      { text: '🌡️ 3 Hot Flashes', cls: 'h-pill--or' },
      { text: '📍 London',        cls: 'h-pill--ol' },
    ],
    quickActions: [
      { emoji: '🌡️', label: 'Log Symptoms', id: 'symptoms'  },
      { emoji: '💤',  label: 'Track Sleep',  id: 'sleep'     },
      { emoji: '🧘',  label: 'Wellness',     id: 'wellness'  },
      { emoji: '🤖',  label: 'Ask AI',       id: 'chat'      },
    ],
    alert: {
      title: 'Sleep Quality Dip Noticed',
      body:
        'You logged fewer than 6 hours of sleep 3 nights this week. Poor sleep can intensify hot flashes and mood shifts. Try a cooler room and limiting screens after 9 pm.',
    },
    illoSrc: '/menopause.png',
  },

  /* ── NURSING / POSTPARTUM ────────────────────────────────────────────── */
  nursing: {
    greeting: name => `GOOD MORNING, ${name} 🍼`,
    heroTitle: "Your baby is 8 weeks old today — you're both doing great",
    heroBody:
      'At 8 weeks, babies begin social smiling. Keep feeding on demand; your supply is building. Don\'t forget to eat enough — you need 400–500 extra calories a day while breastfeeding.',
    actionChips: ['🍼 Log feed', '💧 Drink water', '😴 Rest when baby rests'],
    pills: [
      { text: '🍼 Baby: 8 weeks', cls: 'h-pill--pu' },
      { text: '🌟 4 feeds today', cls: 'h-pill--gr' },
      { text: '📍 London',        cls: 'h-pill--ol' },
    ],
    quickActions: [
      { emoji: '🍼', label: 'Log Feed',   id: 'feeds'     },
      { emoji: '💊', label: 'Add Vitals', id: 'vitals'    },
      { emoji: '🍊', label: 'Meal Log',   id: 'nutrition' },
      { emoji: '🤖', label: 'Ask AI',     id: 'chat'      },
    ],
    alert: {
      title: 'Postpartum Check-In',
      body:
        'Your 6-week postnatal check is overdue. Please book with your GP or midwife to review your recovery, mental wellbeing, and contraception if needed.',
    },
    illoSrc: '/nursing.png',
  },
};

/* ── Moods — universal ── */
const MOODS = [
  { emoji: '😌', label: 'Calm',    v: 4 },
  { emoji: '😄', label: 'Happy',   v: 5 },
  { emoji: '😊', label: 'Content', v: 3 },
  { emoji: '😕', label: 'Low',     v: 2 },
  { emoji: '😰', label: 'Anxious', v: 1 },
];

const HOSPITALS = [
  { name: "King's College Hospital NHS Foundation Trust", addr: '0.8 km · Open 24hrs · Maternity & Women\'s Health' },
  { name: 'St Thomas\' Hospital – Guy\'s and St Thomas\' NHS', addr: '2.1 km · Specialist obstetrics & gynaecology'   },
];

/* ── Component ── */
export default function Home({ setTab }) {
  const { journeyType, userName = 'ADAEZE', setShowSOS } = useApp();
  const [mood, setMood] = useState(null);

  // Graceful fallback — if journeyType isn't in our map, use pregnant
  const cfg  = JOURNEY_CONFIG[journeyType] || JOURNEY_CONFIG.pregnant;
  const home = JOURNEY_HOME_CONFIG[journeyType] || JOURNEY_HOME_CONFIG.pregnant;

  const [tasks, setTasks] = useState(
    Object.fromEntries((cfg.taskIds || []).map(id => [id, false]))
  );

  const todayTasks = ALL_TASKS.filter(t => cfg.taskIds.includes(t.id));
  const done = todayTasks.filter(t => tasks[t.id]).length;
  const pct  = todayTasks.length > 0 ? Math.round((done / todayTasks.length) * 100) : 0;

  return (
    <div className="h-root">

      {/* ── Status pills ── */}
      <div className="h-pills">
        {home.pills.map((p, i) => (
          <span key={i} className={`h-pill ${p.cls}`}>{p.text}</span>
        ))}
      </div>

      {/* ── Calendar ── */}
      <div className="h-card h-cal-card">
        <CalendarStrip />
      </div>

      {/* ── Morning hero card ── */}
      <div className="h-card h-hero-card">
        <div className="h-hero-l">
          <p className="h-eyebrow">{home.greeting(userName.toUpperCase())}</p>
          <p className="h-hero-title">{home.heroTitle}</p>
          <p className="h-hero-body">{home.heroBody}</p>
          <div className="h-action-pills">
            {home.actionChips.map((chip, i) => (
              <span key={i} className="h-ap">{chip}</span>
            ))}
          </div>
        </div>
        <div className="h-hero-illo">
          <HeroIllo src={home.illoSrc} />
        </div>
      </div>

      {/* ── Mood ── */}
      <div className="h-card">
        <p className="h-slabel">HOW ARE YOU FEELING?</p>
        <div className="h-mood-row">
          {MOODS.map(m => (
            <button
              key={m.v}
              className={`h-mood-btn${mood?.v === m.v ? ' h-mood-btn--on' : ''}`}
              onClick={() => setMood(m)}
            >
              <span className="h-mood-em">{m.emoji}</span>
            </button>
          ))}
        </div>
        {mood && (
          <p className="h-mood-fb">
            Feeling {mood.label} today · 3 day streak 🔥
          </p>
        )}
      </div>

      {/* ── Progress + Quick Actions (2-col) ── */}
      <div className="h-two-col">

        {/* Daily Progress */}
        <div className="h-card h-prog-card">
          <div className="h-prog-top">
            <p className="h-slabel" style={{ margin: 0 }}>DAILY PROGRESS</p>
            <span className="h-pct">{pct}%</span>
          </div>
          <div className="h-bar-bg">
            <div className="h-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="h-task-list">
            {todayTasks.map(task => (
              <div key={task.id} className="h-task-row">
                <button
                  className={`h-chk${tasks[task.id] ? ' h-chk--done' : ''}`}
                  onClick={() => setTasks(t => ({ ...t, [task.id]: !t[task.id] }))}
                >
                  {tasks[task.id] && '✓'}
                </button>
                <span className={`h-task-lbl${tasks[task.id] ? ' h-task-lbl--done' : ''}`}>
                  {task.title}
                </span>
              </div>
            ))}
          </div>
          <button className="h-view-all">View all progress →</button>
        </div>

        {/* Quick Actions — driven by journey type */}
        <div className="h-card h-qa-card">
          <p className="h-slabel">QUICK ACTIONS</p>
          <div className="h-qa-grid">
            {home.quickActions.map(a => (
              <button key={a.id} className="h-qa-btn" onClick={() => setTab(a.id)}>
                <span className="h-qa-em">{a.emoji}</span>
                <span className="h-qa-lbl">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ── Contextual Alert ── */}
      {cfg.showAlert && home.alert && (
        <div className="h-card h-alert">
          <div className="h-alert-icon">
            <AlertTriangle size={20} color="#e57c1a" strokeWidth={2} />
          </div>
          <div className="h-alert-body">
            <p className="h-alert-title">{home.alert.title}</p>
            <p className="h-alert-text">{home.alert.body}</p>
          </div>
          <ChevronRight size={18} color="#e57c1a" strokeWidth={2} style={{ flexShrink: 0 }} />
        </div>
      )}

      {/* ── Nearby Hospitals ── */}
      <p className="h-slabel h-slabel--gap">NEARBY HOSPITALS</p>
      {HOSPITALS.map((h, i) => (
        <div key={i} className="h-card h-hosp">
          <div className="h-hosp-icon">
            <Hospital size={22} color="#d63a6e" strokeWidth={1.8} />
          </div>
          <div className="h-hosp-body">
            <p className="h-hosp-name">{h.name}</p>
            <p className="h-hosp-addr">{h.addr}</p>
          </div>
          <span className="h-open">Open</span>
          <ChevronRight size={16} color="#ccc" strokeWidth={2} />
        </div>
      ))}
      <button className="h-view-all h-view-all--ctr">View more hospitals →</button>

    </div>
  );
}