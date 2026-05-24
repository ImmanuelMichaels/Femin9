import { useState } from 'react';
import { AlertTriangle, ChevronRight, Hospital, CheckCircle2, Circle } from 'lucide-react';
import { useApp } from '../../context/useApp';
import CalendarStrip from '../../components/ui/CalendarStrip';
import GlowCard from '../../components/GlowCard';
import EmergencyRedFlags from '../../components/EmergencyRedFlags';
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
  { emoji: '😕', label: 'Low'     },
  { emoji: '😰', label: 'Anxious' },
];

  
/* ─────────────────────────────────────────────────────────────────────────────
   HOME COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function Home({ setTab }) {
  const { 
    journeyType, 
    // userName = 'Mama', 
    setShowSOS,
    getCurrentWeek,
    getTrimester,
    babyAgeDays
  } = useApp();

  const meta = JOURNEY_META[journeyType] || JOURNEY_META.pregnant;
  const cfg  = HOME_CONFIG[journeyType]  || HOME_CONFIG.pregnant;

  const [mood, setMood] = useState(() => {
    const saved = localStorage.getItem('lastMood');
    return saved ? JSON.parse(saved) : null;
  });
  const [checklist, setChecklist] = useState(cfg.checklist);
  const [showAllApt, setShowAllApt] = useState(false);
  const [moodStreak, setMoodStreak] = useState(() => {
    return parseInt(localStorage.getItem('moodStreak') || '0');
  });
  
  // Emergency state for red flags
  const bpSys = 118;
  const bpDia = 76;
  const bleeding = "none";
  const fetalMovement = "normal";
  
  // Get journey-specific data
  const currentWeek = journeyType === 'pregnant' ? getCurrentWeek() : 26;
  const trimester = journeyType === 'pregnant' ? getTrimester() : null;
  const babyAgeWeeks = journeyType === 'nursing' && babyAgeDays ? Math.floor(babyAgeDays / 7) : null;
  

  const toggleCheck = (id) =>
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, done: !c.done } : c));

  const done = checklist.filter(c => c.done).length;
  const pct = checklist.length > 0 ? Math.round((done / checklist.length) * 100) : 0;
  const aptList = showAllApt ? cfg.appointments : cfg.appointments.slice(0, 2);
  
  // Handle mood logging with streak tracking
  const handleMood = (selectedMood) => {
    setMood(selectedMood);
    localStorage.setItem('lastMood', JSON.stringify(selectedMood));
    
    const lastMoodDate = localStorage.getItem('lastMoodDate');
    const today = new Date().toDateString();
    
    if (lastMoodDate === today) {
      // Already logged today, don't increase streak
      return;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastMoodDate === yesterday.toDateString()) {
      // Consecutive day, increase streak
      const newStreak = moodStreak + 1;
      setMoodStreak(newStreak);
      localStorage.setItem('moodStreak', newStreak.toString());
    } else {
      // New streak starting
      setMoodStreak(1);
      localStorage.setItem('moodStreak', '1');
    }
    
    localStorage.setItem('lastMoodDate', today);
  };
  
  // Check for emergency flags
  const hasEmergency = (bpSys >= 160 || bpDia >= 110) || 
                       (currentWeek >= 24 && fetalMovement === "reduced") ||
                       bleeding === "heavy";

  return (
    <div className="hm-root">
      {/* Emergency Red Flags - NEVER PAYWALLED */}
      <EmergencyRedFlags 
        bpSys={bpSys}
        bpDia={bpDia}
        bleeding={bleeding}
        fetalMovement={fetalMovement}
        week={currentWeek}
      />
      
      {/* Journey Container */}
      <div className="journey-container">

        {/* ── Journey badge ── */}
        <div className="hm-journey-badge" style={{ background: meta.accentSoft, color: meta.accent }}>
          <span>{meta.label}</span>
          {journeyType === 'pregnant' && (
            <span style={{ marginLeft: 8, fontSize: 'var(--fs-xs)' }}>
              Week {currentWeek} · {trimester}{trimester === 1 ? 'st' : trimester === 2 ? 'nd' : 'rd'} Trimester
            </span>
          )}
          {journeyType === 'nursing' && babyAgeWeeks && (
            <span style={{ marginLeft: 8, fontSize: 'var(--fs-xs)' }}>
              Week {babyAgeWeeks} Postpartum
            </span>
          )}
        </div>

        {/* ── Calendar ── */}
        <div className="hm-section">
          <CalendarStrip accent={meta.accent} />
        </div>

        {/* ── GLOW CARD ── */}
        <GlowCard 
          journeyType={journeyType === 'nursing' ? 'postpartum' : journeyType}
          trimester={trimester}
          postnatalDay={babyAgeDays}
        />

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
      </div>
    
      {/* Emergency Alert Banner */}
      {hasEmergency && (
        <div className="hm-card" style={{ background: "var(--rdl)", border: "2px solid var(--rd)", marginBottom: "var(--gap-md)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)" }}>
            <div style={{ fontSize: 32 }}>🚨</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 800, color: "var(--rd)", marginBottom: 4 }}>Urgent Medical Attention Needed</p>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)" }}>
                Please check the emergency alerts above and contact your healthcare provider immediately.
              </p>
              <button 
                onClick={() => setShowSOS(true)}
                style={{ marginTop: 8, background: "var(--rd)", color: "#fff", border: "none", borderRadius: 20, padding: "6px 16px", cursor: "pointer" }}
              >
                Call Emergency Services
              </button>
            </div>
          </div>
        </div>
      )}

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
              onClick={() => handleMood(m)}
            >
              <span className="hm-mood-em">{m.emoji}</span>
              <span className="hm-mood-lbl">{m.label}</span>
            </button>
          ))}
        </div>
        {mood && (
          <p className="hm-mood-fb" style={{ color: meta.accent }}>
            Feeling {mood.label} logged · {moodStreak} day streak 🔥
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
          <div className="tracker-container">
            {cfg.trackers.map(t => (
              <TrackerRow key={t.id} {...t} />
            ))}
          </div>
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

      {/* ── Personalised AI Insight ── */}
      <div className="hm-card" style={{ background: "linear-gradient(135deg, var(--lvl), #F8F6FE)" }}>
        <p className="hm-card-label">✨ YOUR AI INSIGHT</p>
        <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "flex-start" }}>
          <span style={{ fontSize: 32 }}>🤖</span>
          <div>
            <p style={{ fontWeight: 700, marginBottom: 4 }}>
              {journeyType === 'pregnant' && `Week ${currentWeek} - Your baby is growing rapidly`}
              {journeyType === 'nursing' && `Week ${babyAgeWeeks || 1} - You're doing amazing`}
              {journeyType === 'ttc' && 'Track your fertile window for best chances'}
              {journeyType === 'ivf' && 'Stay consistent with your medications'}
              {journeyType === 'menopause' && 'Listen to your body and rest when needed'}
            </p>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)" }}>
              {journeyType === 'pregnant' && `Based on your logs, focus on ${trimester === 1 ? 'folate and rest' : trimester === 2 ? 'iron and calcium' : 'omega-3s and hydration'} this week.`}
              {journeyType === 'nursing' && `Your milk supply is building. Stay hydrated and rest when baby sleeps. You're doing great, mama.`}
              {journeyType === 'ttc' && `Your fertile window is approaching. Consider logging BBT and LH tests daily for accurate prediction.`}
              {journeyType === 'ivf' && `Your medication adherence is excellent. Keep going - you're building something beautiful.`}
              {journeyType === 'menopause' && `Hot flashes may intensify with stress. Try our 4-7-8 breathing exercise for relief.`}
            </p>
          </div>
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

      {/* ── Quick Emergency Contacts ── */}
      <div className="hm-card" style={{ background: "var(--rdl)" }}>
        <p className="hm-card-label">🚨 EMERGENCY CONTACTS</p>
        <div style={{ display: "flex", gap: "var(--gap-md)", flexWrap: "wrap" }}>
          <button 
            onClick={() => window.location.href = "tel:112"}
            style={{ background: "var(--rd)", color: "#fff", border: "none", borderRadius: 20, padding: "8px 16px", cursor: "pointer" }}
          >
            📞 112 (Emergency)
          </button>
          <button 
            onClick={() => window.location.href = "tel:111"}
            style={{ background: "var(--gd)", color: "#fff", border: "none", borderRadius: 20, padding: "8px 16px", cursor: "pointer" }}
          >
            🏥 NHS 111
          </button>
          <button 
            onClick={() => setShowSOS(true)}
            style={{ background: "var(--bl)", color: "#fff", border: "none", borderRadius: 20, padding: "8px 16px", cursor: "pointer" }}
          >
            🆘 SOS
          </button>
        </div>
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}