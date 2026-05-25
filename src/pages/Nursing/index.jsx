import { useState, useEffect } from 'react';
import { AlertTriangle, ChevronRight, Hospital } from 'lucide-react';
import CalendarStrip from '../../components/ui/CalendarStrip';
import GlowCard from '../../components/GlowCard';
import EmergencyRedFlags from '../../components/EmergencyRedFlags';
import { JOURNEY_CONFIG, ALL_TASKS } from '../../data/journey';
import { useApp } from '../../context/useApp';
import './Nursing.css';

/* ── Hero illustration ── */
const HeroIllo = ({ src = '/pregnancy.png', alt = '' }) => (
  <img src={src} alt={alt} style={{ maxWidth: '100%', height: 'auto' }} />
);

/* ── JOURNEY HOME CONFIG ── */
const JOURNEY_HOME_CONFIG = {
  pregnant: {
    greeting: name => `GOOD MORNING, ${name} ☀️`,
    heroTitle: 'Your baby is the size of a scallion today',
    heroBody: 'Baby is practising breathing movements. Your iron levels need attention — eat more spinach, lentils, and fortified cereals today.',
    actionChips: ['💊 Take Iron tablet', '💧 Drink water', '🚶‍♀️ Walk 20 min'],
    pills: [
      { text: '🤰 Week 26', cls: 'h-pill--pu' },
      { text: '🔥 Iron Low', cls: 'h-pill--or' },
      { text: '📍 London', cls: 'h-pill--ol' },
    ],
    quickActions: [
      { emoji: '👣', label: 'Log Kick', id: 'kicks' },
      { emoji: '💊', label: 'Add Vitals', id: 'vitals' },
      { emoji: '🍊', label: 'Meal Log', id: 'nutrition' },
      { emoji: '🤖', label: 'Ask AI', id: 'chat' },
    ],
    alert: {
      title: 'Anaemia Risk Alert',
      body: 'Your last haemoglobin was 9.2 g/dL (low). Eat dark leafy greens, lean red meat, lentils, and fortified breakfast cereals.',
    },
    illoSrc: '/pregnancy.png',
  },
  ttc: {
    greeting: name => `GOOD MORNING, ${name}`,
    heroTitle: 'Your fertile window opens in 2 days',
    heroBody: 'Today is Cycle Day 12. Oestrogen is rising — a great time to rest well and stay hydrated.',
    actionChips: ['📅 Check Cycle', '🌡️ Log BBT', '💧 Drink water'],
    pills: [
      { text: '📅 Cycle Day 12', cls: 'h-pill--pu' },
      { text: '🟢 Fertile Soon', cls: 'h-pill--gr' },
      { text: '📍 London', cls: 'h-pill--ol' },
    ],
    quickActions: [
      { emoji: '📅', label: 'Log Period', id: 'cycle' },
      { emoji: '🌡️', label: 'Track BBT', id: 'vitals' },
      { emoji: '🥗', label: 'Nutrition', id: 'nutrition' },
      { emoji: '🤖', label: 'Ask AI', id: 'chat' },
    ],
    alert: {
      title: 'Fertile Window Approaching',
      body: 'Based on your last 3 cycles, your peak fertility is predicted for days 14–16.',
    },
    illoSrc: '/ttc.png',
  },
  ivf: {
    greeting: name => `GOOD MORNING, ${name} 💜`,
    heroTitle: 'Your embryos are developing beautifully',
    heroBody: 'Day 5 post-retrieval. Your embryos are being carefully nurtured in the lab.',
    actionChips: ['💊 Log Meds', '💧 Stay Hydrated', '🧘 Rest'],
    pills: [
      { text: '💜 IVF Cycle', cls: 'h-pill--pu' },
      { text: '🥚 Day 5', cls: 'h-pill--gr' },
      { text: '📍 London', cls: 'h-pill--ol' },
    ],
    quickActions: [
      { emoji: '💊', label: 'Log Meds', id: 'medications' },
      { emoji: '🔬', label: 'Scan Results', id: 'scans' },
      { emoji: '🥗', label: 'Nutrition', id: 'nutrition' },
      { emoji: '🤖', label: 'Ask AI', id: 'chat' },
    ],
    alert: {
      title: 'Medication Reminder',
      body: 'Your progesterone injection is due at 9 PM tonight.',
    },
    illoSrc: '/ivf.png',
  },
  menopause: {
    greeting: name => `GOOD MORNING, ${name} 🌿`,
    heroTitle: 'Today is a day to honour your body',
    heroBody: 'Menopause is a transition, not an ending. Track your symptoms and rest when you need to.',
    actionChips: ['🌬️ Breathing exercise', '💤 Log sleep', '🧘 5-min stretch'],
    pills: [
      { text: '🌿 Perimenopause', cls: 'h-pill--pu' },
      { text: '🌡️ 3 Hot Flashes', cls: 'h-pill--or' },
      { text: '📍 London', cls: 'h-pill--ol' },
    ],
    quickActions: [
      { emoji: '🌡️', label: 'Log Symptoms', id: 'symptoms' },
      { emoji: '💤', label: 'Track Sleep', id: 'sleep' },
      { emoji: '🧘', label: 'Wellness', id: 'wellness' },
      { emoji: '🤖', label: 'Ask AI', id: 'chat' },
    ],
    alert: {
      title: 'Sleep Quality Dip Noticed',
      body: 'You logged fewer than 6 hours of sleep 3 nights this week.',
    },
    illoSrc: '/menopause.png',
  },
  nursing: {
    greeting: name => `GOOD MORNING, ${name} 🍼`,
    heroTitle: "Your baby is 8 weeks old today — you're both doing great",
    heroBody: 'At 8 weeks, babies begin social smiling. Keep feeding on demand; your supply is building.',
    actionChips: ['🍼 Log feed', '💧 Drink water', '😴 Rest when baby rests'],
    pills: [
      { text: '🍼 Baby: 8 weeks', cls: 'h-pill--pu' },
      { text: '🌟 4 feeds today', cls: 'h-pill--gr' },
      { text: '📍 London', cls: 'h-pill--ol' },
    ],
    quickActions: [
      { emoji: '🍼', label: 'Log Feed', id: 'feeds' },
      { emoji: '💊', label: 'Add Vitals', id: 'vitals' },
      { emoji: '🍊', label: 'Meal Log', id: 'nutrition' },
      { emoji: '🤖', label: 'Ask AI', id: 'chat' },
    ],
    alert: {
      title: 'Postpartum Check-In',
      body: 'Your 6-week postnatal check is overdue.',
    },
    illoSrc: '/nursing.png',
  },
};

/* ── Moods ── */
const MOODS = [
  { emoji: '😌', label: 'Calm', v: 4 },
  { emoji: '😄', label: 'Happy', v: 5 },
  { emoji: '😊', label: 'Content', v: 3 },
  { emoji: '😕', label: 'Low', v: 2 },
  { emoji: '😰', label: 'Anxious', v: 1 },
];

const HOSPITALS = [
  { name: "King's College Hospital NHS Foundation Trust", addr: '0.8 km · Open 24hrs · Maternity & Women\'s Health' },
  { name: 'St Thomas\' Hospital – Guy\'s and St Thomas\' NHS', addr: '2.1 km · Specialist obstetrics & gynaecology' },
];

/* ── Main Component ── */
export default function Home({ setTab }) {
  const { 
    journeyType, 
    userName = 'ADAEZE', 
    setShowSOS,
    getCurrentWeek,
    getTrimester,
    babyAgeDays
  } = useApp();
  
  const [mood, setMood] = useState(null);
  
  const [bpSys, setBpSys] = useState(() => Number(localStorage.getItem('bpSys')) || 118);
  const [bpDia, setBpDia] = useState(() => Number(localStorage.getItem('bpDia')) || 76);
  const [bleeding, setBleeding] = useState(() => localStorage.getItem('bleeding') || "none");
  const [fetalMovement, setFetalMovement] = useState(() => localStorage.getItem('fetalMovement') || "normal");
  const [showVitalsCard, setShowVitalsCard] = useState(false);

  useEffect(() => {
    localStorage.setItem('bpSys', bpSys);
    localStorage.setItem('bpDia', bpDia);
    localStorage.setItem('bleeding', bleeding);
    localStorage.setItem('fetalMovement', fetalMovement);
  }, [bpSys, bpDia, bleeding, fetalMovement]);

  const currentWeek = journeyType === 'pregnant' ? getCurrentWeek() : 26;
  const trimester = journeyType === 'pregnant' ? getTrimester() : null;
  const babyAgeWeeks = journeyType === 'nursing' && babyAgeDays ? Math.floor(babyAgeDays / 7) : null;

  const postnatalPhase = journeyType === 'nursing' && babyAgeDays 
    ? (babyAgeDays <= 14 ? 'days1_14' : babyAgeDays <= 42 ? 'weeks2_6' : 'weeks6_plus')
    : null;

  // Normalize journey type
  const normalizedType = 
    journeyType === 'ttc' ? 'conceive' :
    journeyType === 'nursing' ? 'mom' : journeyType;

  const cfg = JOURNEY_CONFIG[normalizedType] || JOURNEY_CONFIG.pregnant;
  const home = JOURNEY_HOME_CONFIG[journeyType] || JOURNEY_HOME_CONFIG.pregnant;

  const [tasks, setTasks] = useState(
    Object.fromEntries((cfg.taskIds || []).map(id => [id, false]))
  );

  const todayTasks = ALL_TASKS.filter(t => cfg.taskIds?.includes(t.id));
  const done = todayTasks.filter(t => tasks[t.id]).length;
  const pct = todayTasks.length > 0 ? Math.round((done / todayTasks.length) * 100) : 0;
  
  const hasEmergency = (bpSys >= 160 || bpDia >= 110) || 
                       (currentWeek >= 24 && (fetalMovement === "reduced" || fetalMovement === "none")) ||
                       bleeding === "heavy";

  return (
    <div className="h-root">
      <EmergencyRedFlags 
        bpSys={bpSys}
        bpDia={bpDia}
        bleeding={bleeding}
        fetalMovement={fetalMovement}
        week={currentWeek}
      />

      <div className="h-pills">
        {home.pills.map((p, i) => (
          <span key={i} className={`h-pill ${p.cls}`}>{p.text}</span>
        ))}
      </div>

      <div className="h-card h-cal-card">
        <CalendarStrip />
      </div>

      <GlowCard 
        journeyType={journeyType === 'nursing' ? 'postpartum' : journeyType}
        trimester={trimester}
        postnatalDay={babyAgeDays}
        postnatalPhase={postnatalPhase} 
        cycleDay={{ isFertile: false }} 
      />

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

      {/* ==================== FULL VITALS CARD ==================== */}
      <div className="h-card" style={{ marginBottom: "var(--gap-md)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p className="h-slabel" style={{ margin: 0 }}>🩺 LOG YOUR VITALS</p>
          <button 
            onClick={() => setShowVitalsCard(!showVitalsCard)}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}
          >
            {showVitalsCard ? '−' : '+'}
          </button>
        </div>
        
        {showVitalsCard && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--dp)", marginBottom: 8, display: "block" }}>
                Blood Pressure (mmHg)
              </label>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="number"
                    value={bpSys}
                    onChange={(e) => setBpSys(Number(e.target.value))}
                    style={{ width: "100%", padding: "var(--sp-3)", borderRadius: "var(--r)", border: "1px solid var(--border)", fontSize: "var(--fs-base)", background: "var(--bg)" }}
                  />
                  <span style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>Systolic (top)</span>
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="number"
                    value={bpDia}
                    onChange={(e) => setBpDia(Number(e.target.value))}
                    style={{ width: "100%", padding: "var(--sp-3)", borderRadius: "var(--r)", border: "1px solid var(--border)", fontSize: "var(--fs-base)", background: "var(--bg)" }}
                  />
                  <span style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>Diastolic (bottom)</span>
                </div>
              </div>
            </div>
            
            {(journeyType === 'pregnant' || journeyType === 'nursing') && (
              <div>
                <label style={{ fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--dp)", marginBottom: 8, display: "block" }}>
                  Vaginal Bleeding
                </label>
                <div style={{ display: "flex", gap: 12 }}>
                  {["none", "light", "moderate", "heavy"].map(option => (
                    <button
                      key={option}
                      onClick={() => setBleeding(option)}
                      style={{
                        flex: 1,
                        padding: "var(--sp-2)",
                        borderRadius: "var(--r)",
                        background: bleeding === option ? "var(--sg)" : "var(--warm)",
                        color: bleeding === option ? "#fff" : "var(--md)",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "var(--fs-sm)",
                        textTransform: "capitalize"
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {journeyType === 'pregnant' && currentWeek >= 24 && (
              <div>
                <label style={{ fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--dp)", marginBottom: 8, display: "block" }}>
                  Fetal Movement
                </label>
                <div style={{ display: "flex", gap: 12 }}>
                  {[
                    { value: "normal", label: "✓ Normal" },
                    { value: "reduced", label: "⚠️ Reduced" },
                    { value: "none", label: "🚨 None" }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setFetalMovement(option.value)}
                      style={{
                        flex: 1,
                        padding: "var(--sp-2)",
                        borderRadius: "var(--r)",
                        background: fetalMovement === option.value ? "var(--sg)" : "var(--warm)",
                        color: fetalMovement === option.value ? "#fff" : "var(--md)",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "var(--fs-sm)"
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <button
              onClick={() => setShowVitalsCard(false)}
              style={{ padding: "var(--sp-2)", background: "var(--t)", color: "#fff", border: "none", borderRadius: "var(--r)", cursor: "pointer", marginTop: 8 }}
            >
              Save Changes
            </button>
          </div>
        )}
        
        {!showVitalsCard && (
          <div style={{ display: "flex", gap: 16, fontSize: "var(--fs-xs)", color: "var(--mt)" }}>
            <span>💓 BP: {bpSys}/{bpDia}</span>
            {(journeyType === 'pregnant' || journeyType === 'nursing') && (
              <span>🩸 Bleeding: {bleeding}</span>
            )}
            {journeyType === 'pregnant' && currentWeek >= 24 && (
              <span>👶 Movement: {fetalMovement}</span>
            )}
          </div>
        )}
      </div>

      {hasEmergency && (
        <div className="h-card" style={{ background: "var(--rdl)", border: "2px solid var(--rd)", marginBottom: "var(--gap-md)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)" }}>
            <div style={{ fontSize: 32 }}>🚨</div>
            <div>
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

      <div className="h-two-col">
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

      <div className="h-card" style={{ background: "linear-gradient(135deg, var(--lvl), #F8F6FE)" }}>
        <p className="h-slabel">✨ PERSONALISED INSIGHT</p>
        <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "flex-start" }}>
          <span style={{ fontSize: 32 }}>🤖</span>
          <div>
            <p style={{ fontWeight: 700, marginBottom: 4 }}>
              {journeyType === 'pregnant' && `Week ${currentWeek} - ${trimester === 1 ? 'First' : trimester === 2 ? 'Second' : 'Third'} Trimester`}
              {journeyType === 'nursing' && `Week ${babyAgeWeeks || 1} Postpartum`}
              {journeyType === 'ttc' && 'Fertility Tracking Active'}
              {journeyType === 'ivf' && 'IVF Journey in Progress'}
              {journeyType === 'menopause' && 'Menopause Support Active'}
            </p>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)" }}>
              {journeyType === 'pregnant' && `Your baby is developing rapidly this week. Focus on ${trimester === 1 ? 'folate and rest' : trimester === 2 ? 'iron and calcium' : 'omega-3s and hydration'}.`}
              {journeyType === 'nursing' && `Your body is still healing. Remember to rest when you can and accept help. You're doing an amazing job.`}
              {journeyType === 'ttc' && `Track your BBT and cervical mucus daily for the most accurate ovulation prediction.`}
              {journeyType === 'ivf' && `Stay consistent with your medications. You're doing something extraordinary.`}
              {journeyType === 'menopause' && `Listen to your body. Some days need rest, others need movement. Both are valid.`}
            </p>
          </div>
        </div>
      </div>

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