import { useState } from 'react';
import { Globe, AlertTriangle, ChevronRight, Hospital } from 'lucide-react';
import CalendarStrip from '../../components/ui/CalendarStrip';
import { JOURNEY_CONFIG, ALL_TASKS } from '../../data/journey';
import { useApp } from '../../context/AppContext';
import './Home.css';

/* ── Inline SVG pregnant woman illustration ── */
const HeroIllo = () => (
  <img src="/pregnancy.png" alt="" />
);

/* ── Static data ── */
const MOODS = [
  { emoji: '😌', label: 'Calm',      v: 4 },
  { emoji: '😄', label: 'Happy',     v: 5 },
  { emoji: '😊', label: 'Content',   v: 3 },
  { emoji: '😕', label: 'Low',       v: 2 },
  { emoji: '😰', label: 'Anxious',   v: 1 },
];

const QUICK_ACTIONS = [
  { emoji: '👣', label: 'Log Kick',   id: 'kicks'     },
  { emoji: '💊', label: 'Add Vitals', id: 'vitals'    },
  { emoji: '🍊', label: 'Meal Log',   id: 'nutrition' },
  { emoji: '🤖', label: 'Ask AI',     id: 'chat'      },
];

const HOSPITALS = [
  { name: 'Lagos Island General Hospital',              addr: '0.8 km · Open 24hrs · Obstetrics dept.' },
  { name: 'LASUTH – Lagos State Univ. Teaching Hospital', addr: '2.1 km · Specialist care available'   },
];

/* ── Component ── */
export default function Home({ setTab }) {
  const { journeyType, setShowSOS } = useApp();
  const [mood, setMood] = useState(null);
  const cfg = JOURNEY_CONFIG[journeyType] || JOURNEY_CONFIG.pregnant;
  const [tasks, setTasks] = useState({
    iron: false, water: false, vitals: false,
    kicks: false, meal: false, walk: false,
  });

  const todayTasks = ALL_TASKS.filter(t => cfg.taskIds.includes(t.id));
  const done = todayTasks.filter(t => tasks[t.id]).length;
  const pct  = todayTasks.length > 0 ? Math.round((done / todayTasks.length) * 100) : 0;

  return (
    <div className="h-root">

      {/* ── Header ── */}
      <div className="h-header">
        <h2 className="h-greeting">Good morning, Adaeze 👋</h2>
        <div className="h-header-r">
          <span className="h-lang"><Globe size={14} strokeWidth={1.8}/> EN</span>
          <button className="h-sos" onClick={() => setShowSOS(true)}>SOS</button>
        </div>
      </div>

      {/* ── Status pills ── */}
      <div className="h-pills">
        <span className="h-pill h-pill--pu">🤰 Week 26</span>
        <span className="h-pill h-pill--or">🔥 Iron Low</span>
        <span className="h-pill h-pill--ol">📍 Lagos</span>
      </div>

      {/* ── Calendar ── */}
      <div className="h-card h-cal-card">
        <CalendarStrip />
      </div>

      {/* ── Morning hero card ── */}
      <div className="h-card h-hero-card">
        <div className="h-hero-l">
          <p className="h-eyebrow">GOOD MORNING, ADAEZE ☀️</p>
          <p className="h-hero-title">Your baby is the size of a scallion today</p>
          <p className="h-hero-body">
            Baby is practising breathing movements. Your iron levels need attention — eat more ugu soup &amp; garden egg today.
          </p>
          <div className="h-action-pills">
            <span className="h-ap">💊 Take Iron tablet</span>
            <span className="h-ap">💧 Drink water</span>
            <span className="h-ap">🚶‍♀️ Walk 20min</span>
          </div>
        </div>
        <div className="h-hero-illo">
          <HeroIllo />
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

        {/* Quick Actions */}
        <div className="h-card h-qa-card">
          <p className="h-slabel">QUICK ACTIONS</p>
          <div className="h-qa-grid">
            {QUICK_ACTIONS.map(a => (
              <button key={a.id} className="h-qa-btn" onClick={() => setTab(a.id)}>
                <span className="h-qa-em">{a.emoji}</span>
                <span className="h-qa-lbl">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ── Anaemia Alert ── */}
      {cfg.showAlert && (
        <div className="h-card h-alert">
          <div className="h-alert-icon">
            <AlertTriangle size={20} color="#e57c1a" strokeWidth={2}/>
          </div>
          <div className="h-alert-body">
            <p className="h-alert-title">Anaemia Risk Alert</p>
            <p className="h-alert-text">
              Your last haemoglobin was 9.2 g/dL (low). Eat dark leafy greens, liver, ofe akwu, and bitterleaf soup. Next check due in 5 days.
            </p>
          </div>
          <ChevronRight size={18} color="#e57c1a" strokeWidth={2} style={{ flexShrink: 0 }}/>
        </div>
      )}

      {/* ── Nearby Hospitals ── */}
      <p className="h-slabel h-slabel--gap">NEARBY HOSPITALS</p>
      {HOSPITALS.map((h, i) => (
        <div key={i} className="h-card h-hosp">
          <div className="h-hosp-icon">
            <Hospital size={22} color="#d63a6e" strokeWidth={1.8}/>
          </div>
          <div className="h-hosp-body">
            <p className="h-hosp-name">{h.name}</p>
            <p className="h-hosp-addr">{h.addr}</p>
          </div>
          <span className="h-open">Open</span>
          <ChevronRight size={16} color="#ccc" strokeWidth={2}/>
        </div>
      ))}
      <button className="h-view-all h-view-all--ctr">View more hospitals →</button>

    </div>
  );
}