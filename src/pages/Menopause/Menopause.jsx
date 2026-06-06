import { useState, useEffect } from 'react';
import {
  Thermometer, Moon, Wind, Heart,
  Shirt, ChevronDown, CheckCircle2,
  Circle, Droplets, Activity, Flame, Star
} from 'lucide-react';
import './Menopause.css';
import { useApp } from '../../context/useApp';

/* ─────────────────────────────────────────────────────────────────────────────
   MENOPAUSE STAGE DEFINITIONS
───────────────────────────────────────────────────────────────────────────── */
const STAGES = {
  perimenopause: {
    label: 'Perimenopause',
    emoji: '🌙',
    accent: '#7C5CBF',
    accentSoft: '#F3EEFF',
    accentMid: '#A885E0',
    desc: 'Your body is transitioning. Cycles may be irregular.',
  },
  menopause: {
    label: 'Menopause',
    emoji: '🌸',
    accent: '#C0516A',
    accentSoft: '#FFF0F3',
    accentMid: '#D9849A',
    desc: '12+ months without a period. A new chapter begins.',
  },
  postmenopause: {
    label: 'Post-Menopause',
    emoji: '✨',
    accent: '#3A8A6E',
    accentSoft: '#EDFAF5',
    accentMid: '#61B899',
    desc: 'Hormones have stabilised. Focus on long-term wellness.',
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   SYMPTOM CONFIG
───────────────────────────────────────────────────────────────────────────── */
const SYMPTOMS = [
  { id: 'hotFlash',      emoji: '🔥', label: 'Hot Flashes',    key: 'hotFlash'   },
  { id: 'nightSweat',    emoji: '💧', label: 'Night Sweats',   key: 'nightSweat' },
  { id: 'mood',          emoji: '🌊', label: 'Mood Swings',    key: 'mood'       },
  { id: 'sleep',         emoji: '😴', label: 'Sleep Issues',   key: 'sleep'      },
  { id: 'brainFog',      emoji: '🌫️', label: 'Brain Fog',      key: 'brainFog'   },
  { id: 'jointPain',     emoji: '🦴', label: 'Joint Aches',    key: 'jointPain'  },
  { id: 'anxiety',       emoji: '😰', label: 'Anxiety',        key: 'anxiety'    },
  { id: 'fatigue',       emoji: '🪫', label: 'Fatigue',        key: 'fatigue'    },
];

/* ─────────────────────────────────────────────────────────────────────────────
   CLOTHING LOGIC
───────────────────────────────────────────────────────────────────────────── */
function getClothingAdvice(symptoms) {
  const hasHotFlash  = symptoms.hotFlash  >= 2;
  const hasNightSweat = symptoms.nightSweat >= 2;
  const hasFatigue   = symptoms.fatigue   >= 2;
  const hasJoint     = symptoms.jointPain >= 2;

  if (hasHotFlash && hasNightSweat) return {
    badge: '🌬️ Layer Up & Let Go',
    tip: 'Wear moisture-wicking base layers you can easily remove. Think loose linen or bamboo-blend tees over a breathable cami. Avoid synthetic fibres.',
    fabrics: ['🌿 Bamboo', '🍃 Linen', '🐑 Light Merino'],
    avoid: ['🚫 Polyester', '🚫 Tight necklines', '🚫 Turtlenecks'],
    color: '#C0516A',
    bg: '#FFF0F3',
  };
  if (hasHotFlash) return {
    badge: '🌡️ Stay Cool & Breezy',
    tip: 'Opt for open-neck, loose-fit clothing in natural breathable fabrics. Light pastels and whites reflect heat. Layers you can shed quickly are your best friend.',
    fabrics: ['👗 Loose cotton', '🌊 Rayon', '🍃 Linen'],
    avoid: ['🚫 Dark heavy colours', '🚫 Polo necks', '🚫 Tight waistbands'],
    color: '#E07B39',
    bg: '#FFF5EE',
  };
  if (hasFatigue && hasJoint) return {
    badge: '🤗 Comfort is Queen',
    tip: 'Soft, stretchy fabrics that don\'t restrict movement support achy joints. Wide-leg trousers, knit dresses, and supportive footwear make a real difference.',
    fabrics: ['🧶 Soft knit', '🩲 Stretch jersey', '👟 Cushioned footwear'],
    avoid: ['🚫 Stiff denim', '🚫 High heels', '🚫 Tight elastic waistbands'],
    color: '#7C5CBF',
    bg: '#F3EEFF',
  };
  return {
    badge: '✨ Dress for Your Mood',
    tip: 'Today looks manageable — express yourself freely! Try a pop of colour; studies show wearing your favourite colours genuinely lifts serotonin.',
    fabrics: ['🎨 Whatever makes you smile', '🌈 Bold colours', '💎 That outfit you love'],
    avoid: [],
    color: '#3A8A6E',
    bg: '#EDFAF5',
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   MENTAL HEALTH TIPS
───────────────────────────────────────────────────────────────────────────── */
const MENTAL_TIPS = [
  {
    id: 'breathing',
    icon: <Wind size={20} />,
    title: '4-7-8 Breathing',
    body: 'Inhale for 4 counts, hold for 7, exhale for 8. Activates your parasympathetic nervous system and reduces cortisol within minutes.',
    tag: 'Anxiety & Stress',
    color: '#7C5CBF',
    bg: '#F3EEFF',
  },
  {
    id: 'journaling',
    icon: <Star size={20} />,
    title: 'Gratitude Journaling',
    body: 'Writing 3 specific things you\'re grateful for daily rewires the brain\'s negativity bias — clinically shown to reduce perimenopausal low mood.',
    tag: 'Low Mood',
    color: '#C0516A',
    bg: '#FFF0F3',
  },
  {
    id: 'movement',
    icon: <Activity size={20} />,
    title: 'Gentle Movement',
    body: 'Even a 20-minute walk raises serotonin and norepinephrine. Yoga and tai chi specifically reduce hot flash frequency by up to 30%.',
    tag: 'Mood & Hot Flashes',
    color: '#3A8A6E',
    bg: '#EDFAF5',
  },
  {
    id: 'sleep',
    icon: <Moon size={20} />,
    title: 'Sleep Rituals',
    body: 'Keep your bedroom at 16–18°C. Use a fan. A cool shower before bed drops core temperature and signals your brain it\'s time to rest.',
    tag: 'Sleep & Night Sweats',
    color: '#2B6CB0',
    bg: '#EBF8FF',
  },
  {
    id: 'connection',
    icon: <Heart size={20} />,
    title: 'Stay Connected',
    body: 'Social connection is protective. Isolation worsens perimenopausal symptoms. A regular call, walk, or coffee with a friend matters more than you think.',
    tag: 'Loneliness',
    color: '#B7580A',
    bg: '#FFFAF0',
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   CYCLE TRACKER (for perimenopause)
───────────────────────────────────────────────────────────────────────────── */
const CYCLE_DAYS = [
  { day: 'M', phase: 'none' }, { day: 'T', phase: 'light' }, { day: 'W', phase: 'period' },
  { day: 'T', phase: 'period' }, { day: 'F', phase: 'light' }, { day: 'S', phase: 'none' },
  { day: 'S', phase: 'none' },
];

const PHASE_COLOR = {
  none: '#E8E0F0',
  light: '#D4B8F0',
  period: '#C0516A',
};

/* ─────────────────────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────────────────────── */

function SectionLabel({ children }) {
  return <p className="mn-section-label">{children}</p>;
}

function SymptomSeverity({ symptom, value, onChange, accent }) {
  const levels = [0, 1, 2, 3];
  const levelLabels = ['None', 'Mild', 'Moderate', 'Severe'];
  const levelColors = ['#E2E8F0', '#F6C90E', '#F5924E', '#E05252'];

  return (
    <div className="mn-symptom-row">
      <div className="mn-symptom-left">
        <span className="mn-symptom-emoji">{symptom.emoji}</span>
        <div>
          <p className="mn-symptom-name">{symptom.label}</p>
          <p className="mn-symptom-level" style={{ color: levelColors[value] }}>
            {levelLabels[value]}
          </p>
        </div>
      </div>
      <div className="mn-severity-dots">
        {levels.map(l => (
          <button
            key={l}
            className="mn-dot"
            style={{
              background: l <= value ? levelColors[value] : '#E2E8F0',
              transform: l === value ? 'scale(1.25)' : 'scale(1)',
              boxShadow: l === value ? `0 0 0 2px ${accent}44` : 'none',
            }}
            onClick={() => onChange(l)}
          />
        ))}
      </div>
    </div>
  );
}

function ClothingBadge({ advice }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mn-clothing-card" style={{ background: advice.bg, borderColor: advice.color + '33' }}>
      <div className="mn-clothing-header" onClick={() => setExpanded(v => !v)}>
        <div className="mn-clothing-icon" style={{ background: advice.color + '22' }}>
          <Shirt size={22} color={advice.color} />
        </div>
        <div style={{ flex: 1 }}>
          <p className="mn-card-label">TODAY'S OUTFIT ADVICE</p>
          <p className="mn-clothing-badge" style={{ color: advice.color }}>{advice.badge}</p>
        </div>
        <ChevronDown
          size={18} color={advice.color}
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .25s' }}
        />
      </div>

      {expanded && (
        <div className="mn-clothing-body">
          <p className="mn-clothing-tip">{advice.tip}</p>
          <div className="mn-clothing-cols">
            <div>
              <p className="mn-clothing-sub" style={{ color: advice.color }}>✅ Best Fabrics</p>
              {advice.fabrics.map((f, i) => (
                <p key={i} className="mn-clothing-item">{f}</p>
              ))}
            </div>
            {advice.avoid.length > 0 && (
              <div>
                <p className="mn-clothing-sub" style={{ color: '#E05252' }}>Today, Skip</p>
                {advice.avoid.map((f, i) => (
                  <p key={i} className="mn-clothing-item">{f}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MentalTipCard({ tip }) {
  return (
    <div className="mn-mental-card" style={{ background: tip.bg, borderColor: tip.color + '33' }}>
      <div className="mn-mental-icon" style={{ background: tip.color + '22', color: tip.color }}>
        {tip.icon}
      </div>
      <div className="mn-mental-body">
        <div className="mn-mental-top">
          <p className="mn-mental-title">{tip.title}</p>
          <span className="mn-mental-tag" style={{ background: tip.color + '22', color: tip.color }}>
            {tip.tag}
          </span>
        </div>
        <p className="mn-mental-text">{tip.body}</p>
      </div>
    </div>
  );
}

function StatPill({ icon, value, label, accent }) {
  return (
    <div className="mn-stat-pill">
      <div className="mn-stat-icon" style={{ color: accent }}>{icon}</div>
      <p className="mn-stat-value" style={{ color: accent }}>{value}</p>
      <p className="mn-stat-label">{label}</p>
    </div>
  );
}

function HormoneBar({ label, value, max, color }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="mn-hbar-row">
      <div className="mn-hbar-top">
        <span className="mn-hbar-label">{label}</span>
        <span className="mn-hbar-val" style={{ color }}>{value} <span className="mn-hbar-unit">pmol/L</span></span>
      </div>
      <div className="mn-hbar-bg">
        <div className="mn-hbar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
      </div>
    </div>
  );
}

function WellnessRing({ pct, accent, label }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - pct / 100);
  return (
    <div className="mn-ring-wrap">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#EDE9F7" strokeWidth="10" />
        <circle
          cx="55" cy="55" r={r} fill="none"
          stroke={accent} strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={dash}
          strokeLinecap="round"
          transform="rotate(-90 55 55)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="55" y="51" textAnchor="middle" fontSize="18" fontWeight="800" fill={accent}>{pct}%</text>
        <text x="55" y="67" textAnchor="middle" fontSize="9" fill="#9E9E9E">{label}</text>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function Menopause({ setTab }) {
  const { setShowSOS } = useApp();

  // ─── PERSISTED STATE (localStorage) ───
  const [stage, setStage] = useState(() => {
    const saved = localStorage.getItem('menopauseStage');
    return saved || 'perimenopause';
  });

  const [symptoms, setSymptoms] = useState(() => {
    const saved = localStorage.getItem('menopauseSymptoms');
    return saved ? JSON.parse(saved) : {
      hotFlash: 2, nightSweat: 1, mood: 1,
      sleep: 2, brainFog: 0, jointPain: 1, anxiety: 1, fatigue: 2,
    };
  });

  const [mood, setMood] = useState(() => {
    const saved = localStorage.getItem('menopauseMood');
    return saved ? JSON.parse(saved) : null;
  });

  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem('menopauseChecklist');
    return saved ? JSON.parse(saved) : [
      { id: 'water',   label: '💧 Drink 8 glasses of water',          done: false },
      { id: 'walk',    label: '🚶‍♀️ 20-min gentle walk',                done: false },
      { id: 'calcium', label: '🥛 Take calcium supplement',           done: false },
      { id: 'screen',  label: '📵 No screens 1hr before bed',         done: false },
      { id: 'journal', label: '📓 3-minute gratitude journal',        done: false },
      { id: 'breath',  label: '🌬️ 4-7-8 breathing (5 rounds)',        done: false },
    ];
  });

  const [showAllTips, setShowAllTips] = useState(() => {
    const saved = localStorage.getItem('menopauseShowAllTips');
    return saved === 'true';
  });

  const [tempLog, setTempLog] = useState(() => {
    const saved = localStorage.getItem('menopauseTempLog');
    return saved ? JSON.parse(saved) : [36.4, 36.8, 37.1, 36.9, 37.4, 36.7, 36.5];
  });

  // ─── DERIVED STATE ───
  const meta = STAGES[stage] || STAGES.perimenopause;
  const clothing = getClothingAdvice(symptoms);
  const done = checklist.filter(c => c.done).length;
  const pct = Math.round((done / checklist.length) * 100);
  const visibleTips = showAllTips ? MENTAL_TIPS : MENTAL_TIPS.slice(0, 2);
  const totalSymptomLoad = Object.values(symptoms).reduce((a, b) => a + b, 0);
  const wellnessPct = Math.max(10, 100 - Math.round((totalSymptomLoad / (SYMPTOMS.length * 3)) * 100));

  // ─── SAVE TO LOCALSTORAGE WHEN STATE CHANGES ───
  useEffect(() => {
    localStorage.setItem('menopauseStage', stage);
  }, [stage]);

  useEffect(() => {
    localStorage.setItem('menopauseSymptoms', JSON.stringify(symptoms));
  }, [symptoms]);

  useEffect(() => {
    if (mood) localStorage.setItem('menopauseMood', JSON.stringify(mood));
  }, [mood]);

  useEffect(() => {
    localStorage.setItem('menopauseChecklist', JSON.stringify(checklist));
  }, [checklist]);

  useEffect(() => {
    localStorage.setItem('menopauseShowAllTips', showAllTips);
  }, [showAllTips]);

  useEffect(() => {
    localStorage.setItem('menopauseTempLog', JSON.stringify(tempLog));
  }, [tempLog]);

  // ─── HANDLERS ───
  const updateSymptom = (key, val) => {
    setSymptoms(prev => ({ ...prev, [key]: val }));
  };

  const toggleCheck = (id) => {
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, done: !c.done } : c));
  };

  const addTemperature = (newTemp) => {
    if (newTemp >= 35 && newTemp <= 42) {
      setTempLog(prev => [...prev.slice(-6), newTemp]);
    }
  };

  const MOODS = [
    { emoji: '🌸', label: 'Grounded' },
    { emoji: '🌊', label: 'Unsettled' },
    { emoji: '🔥', label: 'Flushed' },
    { emoji: '🌙', label: 'Tired' },
    { emoji: '⚡', label: 'Wired' },
    { emoji: '💜', label: 'Content' },
  ];

  return (
    <div className="hm-root mn-root">

      {/* ── Stage Picker ── */}
      <div className="mn-stage-row">
        {Object.entries(STAGES).map(([key, s]) => (
          <button
            key={key}
            className={`mn-stage-btn ${stage === key ? 'mn-stage-btn--active' : ''}`}
            style={stage === key
              ? { background: s.accent, color: '#fff', borderColor: s.accent }
              : { borderColor: s.accent + '55', color: s.accent }
            }
            onClick={() => setStage(key)}
          >
            <span>{s.emoji}</span>
            <span className="mn-stage-label">{s.label.replace('menopause', 'pause').replace('Peri', 'Peri-')}</span>
          </button>
        ))}
      </div>

      {/* ── Hero Banner ── */}
      <div className="mn-hero" style={{ background: `linear-gradient(135deg, ${meta.accentSoft}, #FFF9FE)` }}>
        <div className="mn-hero-left">
          <div className="mn-hero-badge" style={{ background: meta.accent + '22', color: meta.accent }}>
            {meta.emoji} {meta.label}
          </div>
          <h2 className="mn-hero-title">Your body.{'\n'}Your pace.{'\n'}Your power.</h2>
          <p className="mn-hero-sub">{meta.desc}</p>
        </div>
        <div className="mn-hero-ring">
          <WellnessRing pct={wellnessPct} accent={meta.accent} label="Wellness" />
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="mn-stats-row">
        <StatPill icon={<Thermometer size={16} />} value="36.7°" label="Avg Temp"  accent={meta.accent} />
        <StatPill icon={<Flame size={16} />} value={`${symptoms.hotFlash}/3`}  label="Hot Flashes" accent="#E07B39" />
        <StatPill icon={<Moon size={16} />} value="5.8h" label="Sleep"     accent="#5B6ABF" />
        <StatPill icon={<Droplets size={16} />} value="6/8"  label="Hydration" accent="#3A8A6E" />
      </div>

      {/* ── Clothing Badge ── */}
      <ClothingBadge advice={clothing} />

      {/* ── Symptom Logger ── */}
      <div className="hm-card">
        <SectionLabel>📊 TODAY'S SYMPTOMS</SectionLabel>
        <p className="mn-section-sub">Tap the dots to log severity. This helps us personalise your insights.</p>
        <div className="mn-symptom-list">
          {SYMPTOMS.map(s => (
            <SymptomSeverity
              key={s.id}
              symptom={s}
              value={symptoms[s.key]}
              onChange={val => updateSymptom(s.key, val)}
              accent={meta.accent}
            />
          ))}
        </div>
      </div>

      {/* ── Mood Check ── */}
      <div className="hm-card">
        <SectionLabel>💜 HOW ARE YOU FEELING RIGHT NOW?</SectionLabel>
        <div className="mn-mood-grid">
          {MOODS.map(m => (
            <button
              key={m.label}
              className={`mn-mood-btn ${mood?.label === m.label ? 'mn-mood-btn--on' : ''}`}
              style={mood?.label === m.label
                ? { borderColor: meta.accent, background: meta.accentSoft }
                : {}
              }
              onClick={() => setMood(m)}
            >
              <span className="mn-mood-em">{m.emoji}</span>
              <span className="mn-mood-lbl">{m.label}</span>
            </button>
          ))}
        </div>
        {mood && (
          <div className="mn-mood-fb" style={{ background: meta.accentSoft }}>
            <span style={{ color: meta.accent, fontWeight: 700 }}>Feeling {mood.label} logged ✓</span>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--md)', marginTop: 4 }}>
              {mood.label === 'Flushed' && 'Try removing a layer, sip cold water, and try the 4-7-8 breath.'}
              {mood.label === 'Unsettled' && 'That\'s valid. A 5-minute grounding exercise can help settle your nervous system.'}
              {mood.label === 'Tired' && 'Rest is not laziness. If you can, take a 20-minute nap this afternoon.'}
              {mood.label === 'Wired' && 'Avoid caffeine after 2pm. Magnesium glycinate before bed may help tonight.'}
              {mood.label === 'Grounded' && 'Wonderful — carry that with you. A short walk will make it last longer.'}
              {mood.label === 'Content' && 'Hold onto this feeling. It\'s worth celebrating where you are right now.'}
            </p>
          </div>
        )}
      </div>

      {/* ── Hormone Tracker Panel ── */}
      <div className="hm-card">
        <SectionLabel>🧬 HORMONE REFERENCE PANEL</SectionLabel>
        <p className="mn-section-sub">Reference your last blood test results here. These guide your care team.</p>
        <div className="mn-hbar-list">
          <HormoneBar label="Oestradiol (E2)" value={48}  max={200} color={meta.accent}  />
          <HormoneBar label="FSH"             value={62}  max={100} color="#E07B39" />
          <HormoneBar label="LH"              value={34}  max={80}  color="#5B6ABF" />
          <HormoneBar label="Progesterone"    value={1.2} max={10}  color="#3A8A6E" />
        </div>
        <p className="mn-horm-note">
          💡 Low oestradiol with elevated FSH is consistent with {meta.label.toLowerCase()}. Always discuss results with your GP or menopause specialist.
        </p>
      </div>

      {/* ── Temperature Trend ── */}
      <div className="hm-card">
        <SectionLabel>🌡️ BODY TEMPERATURE — 7 DAY TREND</SectionLabel>
        <div className="mn-temp-chart">
          {tempLog.map((t, i) => {
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const min = 36.0; const max = 38.0;
            const h = Math.round(((t - min) / (max - min)) * 80);
            const isHigh = t >= 37.2;
            return (
              <div key={i} className="mn-temp-col">
                <span className="mn-temp-val" style={{ color: isHigh ? '#E05252' : meta.accent }}>{t}°</span>
                <div className="mn-temp-bar-wrap">
                  <div
                    className="mn-temp-bar"
                    style={{
                      height: `${h}px`,
                      background: isHigh ? 'linear-gradient(180deg,#E05252,#F59E0B)' : `linear-gradient(180deg,${meta.accent},${meta.accentMid})`,
                    }}
                  />
                </div>
                <span className="mn-temp-day">{days[i]}</span>
              </div>
            );
          })}
        </div>
        <div className="mn-temp-input-row">
          <input
            type="number"
            step="0.1"
            min="35"
            max="42"
            className="mn-temp-input"
            placeholder="Log today's temp (°C)"
            onBlur={e => {
              const val = parseFloat(e.target.value);
              if (val >= 35 && val <= 42) addTemperature(val);
              e.target.value = '';
            }}
          />
        </div>
        <div className="mn-temp-legend">
          <span className="mn-leg-dot" style={{ background: '#E05252' }} /> Elevated (≥37.2°)
          <span className="mn-leg-dot" style={{ background: meta.accent, marginLeft: 16 }} /> Normal
        </div>
      </div>

      {/* ── Menstrual Cycle (Perimenopause only) ── */}
      {stage === 'perimenopause' && (
        <div className="hm-card">
          <SectionLabel>🗓️ MENSTRUAL TRACKING</SectionLabel>
          <p className="mn-section-sub">Irregular cycles are normal during perimenopause. Track what you can.</p>
          <div className="mn-cycle-row">
            {CYCLE_DAYS.map((d, i) => (
              <div key={i} className="mn-cycle-day">
                <div
                  className="mn-cycle-dot"
                  style={{ background: PHASE_COLOR[d.phase] }}
                />
                <span className="mn-cycle-lbl">{d.day}</span>
              </div>
            ))}
          </div>
          <div className="mn-cycle-legend">
            <span className="mn-leg-dot" style={{ background: PHASE_COLOR.period }} /> Period
            <span className="mn-leg-dot" style={{ background: PHASE_COLOR.light, marginLeft: 12 }} /> Light
            <span className="mn-leg-dot" style={{ background: PHASE_COLOR.none,  marginLeft: 12 }} /> None
          </div>
          <div className="mn-cycle-stats">
            <div className="mn-cycle-stat">
              <p className="mn-cstat-val" style={{ color: meta.accent }}>38</p>
              <p className="mn-cstat-lbl">Days since last period</p>
            </div>
            <div className="mn-cycle-stat">
              <p className="mn-cstat-val" style={{ color: meta.accent }}>Irregular</p>
              <p className="mn-cstat-lbl">Cycle pattern</p>
            </div>
            <div className="mn-cycle-stat">
              <p className="mn-cstat-val" style={{ color: meta.accent }}>4</p>
              <p className="mn-cstat-lbl">Periods this year</p>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Insight ── */}
      <div className="hm-card" style={{ background: 'linear-gradient(135deg, var(--lvl,#F8F4FF), #FFF9FE)' }}>
        <SectionLabel>✨ YOUR AI INSIGHT</SectionLabel>
        <div className="mn-ai-wrap">
          <span style={{ fontSize: 36 }}>🤖</span>
          <div>
            <p className="mn-ai-title" style={{ color: meta.accent }}>
              {symptoms.hotFlash >= 2
                ? 'Hot flashes are elevated today'
                : symptoms.sleep >= 2
                  ? 'Sleep disruption detected this week'
                  : 'Your wellness score is holding well'
              }
            </p>
            <p className="mn-ai-body">
              {symptoms.hotFlash >= 2
                ? 'Your hot flash severity suggests your oestrogen may be fluctuating. Keep a fan nearby, choose layered breathable clothing, and consider discussing HRT options with your menopause specialist.'
                : symptoms.sleep >= 2
                  ? 'Poor sleep amplifies all other menopause symptoms. Try keeping your bedroom at 17°C, avoiding alcohol for 3 hours before bed, and using a weighted blanket.'
                  : 'Lovely — your symptom profile today is manageable. Focus on hydration, a gentle walk, and your daily checklist to build on this momentum.'
              }
            </p>
          </div>
        </div>
        <button
          className="mn-ask-bloom-btn"
          style={{ background: meta.accent, color: '#fff', border: 'none', borderRadius: 20, padding: '8px 18px', cursor: 'pointer', fontSize: 13, marginTop: 10 }}
          onClick={() => setTab('chat')}
        >
          💬 Ask Bloom AI
        </button>
      </div>

      {/* ── Mental Health Tips ── */}
      <div className="hm-card">
        <SectionLabel>🧠 MENTAL HEALTH SUPPORT</SectionLabel>
        <p className="mn-section-sub">Evidence-based strategies tailored to your symptoms today.</p>
        <div className="mn-mental-list">
          {visibleTips.map(tip => <MentalTipCard key={tip.id} tip={tip} />)}
        </div>
        <button
          className="hm-view-all"
          style={{ color: meta.accent }}
          onClick={() => setShowAllTips(v => !v)}
        >
          {showAllTips ? 'Show fewer tips ↑' : `See all ${MENTAL_TIPS.length} strategies →`}
        </button>
      </div>

      {/* ── Daily Checklist ── */}
      <div className="hm-card">
        <div className="hm-checklist-header">
          <SectionLabel style={{ margin: 0 }}>☀️ DAILY WELLNESS CHECKLIST</SectionLabel>
          <span className="hm-checklist-pct" style={{ color: meta.accent }}>{pct}%</span>
        </div>
        <div className="hm-checklist-bar-bg" style={{ marginBottom: 12 }}>
          <div className="hm-checklist-bar-fill" style={{ width: `${pct}%`, background: meta.accent }} />
        </div>
        {checklist.map(c => (
          <button key={c.id} className="hm-check-row" onClick={() => toggleCheck(c.id)}>
            {c.done
              ? <CheckCircle2 size={20} color={meta.accent} strokeWidth={2} />
              : <Circle       size={20} color="#ccc"         strokeWidth={2} />
            }
            <span className={`hm-check-label ${c.done ? 'hm-check-label--done' : ''}`}>{c.label}</span>
          </button>
        ))}
      </div>

      {/* ── Nutrition Focus ── */}
      <div className="hm-card">
        <SectionLabel>🥗 NUTRITION FOCUS FOR {meta.label.toUpperCase()}</SectionLabel>
        <div className="mn-nutrition-grid">
          {[
            { emoji: '🥦', name: 'Phytoestrogens',   sub: 'Soy, flaxseed, chickpeas', color: '#3A8A6E', bg: '#EDFAF5' },
            { emoji: '🥛', name: 'Calcium + Vit D',   sub: 'Bone health priority',     color: '#2B6CB0', bg: '#EBF8FF' },
            { emoji: '🐟', name: 'Omega-3',           sub: 'Mood & heart protection',  color: '#7C5CBF', bg: '#F3EEFF' },
            { emoji: '🚫', name: 'Limit Caffeine',    sub: 'Worsens hot flashes',      color: '#E05252', bg: '#FFF5F5' },
            { emoji: '🌾', name: 'Magnesium-rich',    sub: 'Leafy greens, nuts, seeds',color: '#B7580A', bg: '#FFFAF0' },
            { emoji: '🚰', name: 'Stay Hydrated',     sub: '8 glasses minimum',        color: '#3182CE', bg: '#EBF8FF' },
          ].map((n, i) => (
            <div key={i} className="mn-nutrition-card" style={{ background: n.bg, borderColor: n.color + '33' }}>
              <span className="mn-nutrition-em">{n.emoji}</span>
              <p className="mn-nutrition-name" style={{ color: n.color }}>{n.name}</p>
              <p className="mn-nutrition-sub">{n.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── HRT Information ── */}
      <div className="hm-card" style={{ borderLeft: `4px solid ${meta.accent}` }}>
        <SectionLabel>💊 HRT & TREATMENT OPTIONS</SectionLabel>
        <div className="mn-hrt-list">
          {[
            {
              title: 'Hormone Replacement Therapy (HRT)',
              body: 'The most effective treatment for menopause symptoms. Modern HRT is safe for most women and significantly reduces hot flashes, sleep issues, and mood symptoms.',
              badge: 'Most Effective',
              color: meta.accent,
            },
            {
              title: 'Cognitive Behavioural Therapy (CBT)',
              body: 'NICE-recommended for menopause-related mood changes and hot flashes. As effective as medication for some women for anxiety and low mood.',
              badge: 'NICE Recommended',
              color: '#3A8A6E',
            },
            {
              title: 'Lifestyle Modifications',
              body: 'Weight management, regular exercise, and reduced alcohol intake can reduce symptom severity by 30–40% without medication.',
              badge: 'No Prescription',
              color: '#5B6ABF',
            },
          ].map((h, i) => (
            <div key={i} className="mn-hrt-item">
              <div className="mn-hrt-top">
                <p className="mn-hrt-title">{h.title}</p>
                <span className="mn-hrt-badge" style={{ background: h.color + '22', color: h.color }}>{h.badge}</span>
              </div>
              <p className="mn-hrt-body">{h.body}</p>
            </div>
          ))}
        </div>
        <p className="mn-horm-note">
          ⚕️ Always discuss treatment options with your GP or a menopause specialist before starting or changing any therapy.
        </p>
      </div>

      {/* ── Emergency / Support ── */}
      <div className="hm-card" style={{ background: '#FFF5F5' }}>
        <SectionLabel>🆘 MENTAL HEALTH CRISIS SUPPORT</SectionLabel>
        <p className="mn-section-sub" style={{ marginBottom: 12 }}>
          Menopausal hormone changes can trigger or worsen depression. You are never alone.
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.location.href = 'tel:116123'}
            style={{ background: '#C0516A', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 16px', cursor: 'pointer', fontSize: 14 }}
          >
            📞 Samaritans 116 123
          </button>
          <button
            onClick={() => window.location.href = 'tel:111'}
            style={{ background: '#7C5CBF', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 16px', cursor: 'pointer', fontSize: 14 }}
          >
            🏥 NHS 111
          </button>
          <button
            onClick={() => setShowSOS(true)}
            style={{ background: '#3A8A6E', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 16px', cursor: 'pointer', fontSize: 14 }}
          >
            🆘 SOS
          </button>
        </div>
      </div>

      <div style={{ height: 32 }} />
    </div>
  );
}