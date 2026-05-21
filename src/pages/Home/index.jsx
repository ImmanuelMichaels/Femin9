import { useState } from 'react';
import { AlertTriangle, ChevronRight, Hospital, CheckCircle2, Circle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import CalendarStrip from '../../components/ui/CalendarStrip';
import { HOME_CONFIG, JOURNEY_META } from '../../data/homeConfig';
import './Home.css';

/* ─── Tiny reusable sub-components ─── */

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="hm-stat-card">
      <span className="hm-stat-icon">{icon}</span>
      <p className="hm-stat-value" style={{ color: accent }}>{value}</p>
      <p className="hm-stat-label">{label}</p>
      <p className="hm-stat-sub">{sub}</p>
    </div>
  );
}

function TrackerRow({ icon, label, value, target, pct, color }) {
  return (
    <div className="hm-tracker-row">
      <div className="hm-tracker-left">
        <span className="hm-tracker-icon">{icon}</span>
        <div>
          <p className="hm-tracker-label">{label}</p>
          <p className="hm-tracker-meta">{value} · {target}</p>
        </div>
      </div>
      <div className="hm-tracker-right">
        <div className="hm-tracker-bar-bg">
          <div
            className="hm-tracker-bar-fill"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <span className="hm-tracker-pct" style={{ color }}>{pct}%</span>
      </div>
    </div>
  );
}

function AppointmentRow({ date, label, location, urgent, accent }) {
  return (
    <div className={`hm-appt-row ${urgent ? 'hm-appt-row--urgent' : ''}`}
      style={urgent ? { borderLeftColor: accent } : {}}>
      <div className="hm-appt-date" style={urgent ? { background: accent } : {}}>{date}</div>
      <div className="hm-appt-body">
        <p className="hm-appt-label">{label}</p>
        <p className="hm-appt-loc">📍 {location}</p>
      </div>
      {urgent && <span className="hm-appt-badge" style={{ background: accent }}>Soon</span>}
    </div>
  );
}

function InsightCard({ icon, title, body, color, bg }) {
  return (
    <div className="hm-insight-card" style={{ background: bg, borderColor: color + '33' }}>
      <div className="hm-insight-icon-wrap" style={{ background: color + '22' }}>
        <span>{icon}</span>
      </div>
      <div>
        <p className="hm-insight-title" style={{ color }}>{title}</p>
        <p className="hm-insight-body">{body}</p>
      </div>
    </div>
  );
}

function ChecklistItem({ label, done, onToggle, accent }) {
  return (
    <button className="hm-check-row" onClick={onToggle}>
      {done
        ? <CheckCircle2 size={20} color={accent} strokeWidth={2} />
        : <Circle       size={20} color="#ccc"   strokeWidth={2} />
      }
      <span className={`hm-check-label ${done ? 'hm-check-label--done' : ''}`}>{label}</span>
    </button>
  );
}

function QuickAction({ emoji, label, onClick }) {
  return (
    <button className="hm-qa-btn" onClick={onClick}>
      <span className="hm-qa-em">{emoji}</span>
      <span className="hm-qa-lbl">{label}</span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MOODS — universal
───────────────────────────────────────────────────────────────────────────── */
const MOODS = [
  { emoji: '😌', label: 'Calm'    },
  { emoji: '😄', label: 'Happy'   },
  { emoji: '😊', label: 'Content' },
  { emoji: '😕', label: 'Low'     },
  { emoji: '😰', label: 'Anxious' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   HOME COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function Home({ setTab }) {
  const { journeyType, userName = 'Mama' } = useApp();

  const meta = JOURNEY_META[journeyType] || JOURNEY_META.pregnant;
  const cfg  = HOME_CONFIG[journeyType]  || HOME_CONFIG.pregnant;

  const [mood,       setMood]      = useState(null);
  const [checklist,  setChecklist] = useState(cfg.checklist);
  const [showAllApt, setShowAllApt]= useState(false);

  const toggleCheck = (id) =>
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, done: !c.done } : c));

  const done    = checklist.filter(c => c.done).length;
  const pct     = Math.round((done / checklist.length) * 100);
  const aptList = showAllApt ? cfg.appointments : cfg.appointments.slice(0, 2);

  return (
    <div className="hm-root">

      {/* ── Journey badge ── */}
      <div className="hm-journey-badge" style={{ background: meta.accentSoft, color: meta.accent }}>
        <span>{meta.label}</span>
      </div>

      {/* ── Calendar ── */}
      <div className="hm-section">
        <CalendarStrip accent={meta.accent} />
      </div>

      {/* ── Hero card ── */}
      <div className="hm-hero-card" style={{ background: cfg.heroBg }}>
        <div className="hm-hero-content">
          <h2 className="hm-hero-title">{cfg.heroTitle}</h2>
          <p className="hm-hero-body">{cfg.heroBody}</p>
        </div>
        <div className="hm-hero-illo">
          <img src={cfg.heroIllo} alt={meta.label} />
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="hm-stats-row">
        {cfg.stats.map((s, i) => (
          <StatCard key={i} {...s} accent={meta.accent} />
        ))}
      </div>

      {/* ── Alert ── */}
      {cfg.alert && (
        <div className="hm-alert" style={{ background: cfg.alert.bg, borderColor: cfg.alert.color + '44' }}>
          <AlertTriangle size={10} color={cfg.alert.color} strokeWidth={4} style={{ flexShrink: 0 }} />
          <div>
            <p className="hm-alert-title" style={{ color: cfg.alert.color }}>{cfg.alert.title}</p>
            <p className="hm-alert-body">{cfg.alert.body}</p>
          </div>
          <ChevronRight size={16} color={cfg.alert.color} strokeWidth={2} style={{ flexShrink: 0 }} />
        </div>
      )}

      {/* ── Mood check ── */}
      <div className="hm-card">
        <p className="hm-card-label">HOW ARE YOU FEELING?</p>
        <div className="hm-mood-row">
          {MOODS.map(m => (
            <button
              key={m.label}
              className={`hm-mood-btn ${mood?.label === m.label ? 'hm-mood-btn--on' : ''}`}
              style={mood?.label === m.label ? { borderColor: meta.accent, background: meta.accentSoft } : {}}
              onClick={() => setMood(m)}
            >
              <span className="hm-mood-em">{m.emoji}</span>
              <span className="hm-mood-lbl">{m.label}</span>
            </button>
          ))}
        </div>
        {mood && (
          <p className="hm-mood-fb" style={{ color: meta.accent }}>
            Feeling {mood.label} logged · 3 day streak 🔥
          </p>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <div className="hm-card">
        <p className="hm-card-label">QUICK ACTIONS</p>
        <div className="hm-qa-grid">
          {cfg.quickActions.map(a => (
            <QuickAction
              key={a.id + a.label}
              emoji={a.emoji}
              label={a.label}
              onClick={() => setTab(a.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Two-col: Trackers + Daily Checklist ── */}
      <div className="hm-two-col">

        {/* Trackers */}
        <div className="hm-card hm-trackers-card">
          <p className="hm-card-label">TODAY'S TRACKERS</p>
          {cfg.trackers.map(t => (
            <TrackerRow key={t.id} {...t} />
          ))}
        </div>

        {/* Daily checklist */}
        <div className="hm-card hm-checklist-card">
          <div className="hm-checklist-header">
            <p className="hm-card-label" style={{ margin: 0 }}>DAILY CHECKLIST</p>
            <span className="hm-checklist-pct" style={{ color: meta.accent }}>{pct}%</span>
          </div>
          <div className="hm-checklist-bar-bg">
            <div className="hm-checklist-bar-fill"
              style={{ width: `${pct}%`, background: meta.accent }} />
          </div>
          {checklist.map(c => (
            <ChecklistItem
              key={c.id}
              label={c.label}
              done={c.done}
              accent={meta.accent}
              onToggle={() => toggleCheck(c.id)}
            />
          ))}
        </div>

      </div>

      {/* ── Insights ── */}
      <div className="hm-card">
        <p className="hm-card-label">PERSONALISED INSIGHTS</p>
        <div className="hm-insights-list">
          {cfg.insights.map((ins, i) => (
            <InsightCard key={i} {...ins} />
          ))}
        </div>
      </div>

      {/* ── Appointments ── */}
      <div className="hm-card">
        <p className="hm-card-label">UPCOMING APPOINTMENTS</p>
        {aptList.map((a, i) => (
          <AppointmentRow key={i} {...a} accent={meta.accent} />
        ))}
        {cfg.appointments.length > 2 && (
          <button
            className="hm-view-all"
            style={{ color: meta.accent }}
            onClick={() => setShowAllApt(v => !v)}
          >
            {showAllApt ? 'Show less ↑' : `View all ${cfg.appointments.length} appointments →`}
          </button>
        )}
      </div>

      {/* ── Nearby Hospitals ── */}
      <div className="hm-card">
        <p className="hm-card-label">NEARBY HOSPITALS</p>
        {[
          { name: "King's College Hospital NHS", addr: "0.8 km · Open 24hrs · Maternity & Women's Health" },
          { name: "St Thomas' Hospital – Guy's", addr: '2.1 km · Specialist obstetrics & gynaecology'     },
        ].map((h, i) => (
          <div key={i} className="hm-hosp-row">
            <div className="hm-hosp-icon" style={{ background: meta.accentSoft }}>
              <Hospital size={20} color={meta.accent} strokeWidth={1.8} />
            </div>
            <div className="hm-hosp-body">
              <p className="hm-hosp-name">{h.name}</p>
              <p className="hm-hosp-addr">{h.addr}</p>
            </div>
            <span className="hm-open-badge" style={{ background: meta.accentSoft, color: meta.accent }}>Open</span>
            <ChevronRight size={14} color="#ccc" />
          </div>
        ))}
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}