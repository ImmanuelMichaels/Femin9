// Menopause.jsx — Final merged version
// v1 full render tree + all audit fixes from v2/v3/v4

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Thermometer, Moon, Wind, Heart, ChevronDown, CheckCircle2,
  Circle, Droplets, Flame, Sparkles, Cloud, Bone, HeartPulse,
  Battery, BookOpen, Footprints, Bed, Phone, Shield, Smile, Zap,
  Leaf, Fish, Coffee, Apple, CloudRain, Droplet, Edit2, Plus,
} from 'lucide-react';
import './Menopause.css';
import { useApp } from '../../context/useApp';

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  stage:         'menopauseStage',
  symptoms:      'menopauseSymptoms',
  mood:          'menopauseMood',
  moodDate:      'menopauseMoodDate',
  checklist:     'menopauseChecklist',
  checklistDate: 'mn_checklist_date',
  showAllTips:   'menopauseShowAllTips',
  tempLog:       'menopauseTempLog',
  hormones:      'menopauseHormones',
  sleepHydration:'menopauseSleepHydration',
  periods:       'menopausePeriods',
  cycleWeek:     'menopauseCycleWeek',
  migration:     'mn_migration_version',
};

const MIGRATION_VERSION = '3';

// ─── SAFE STORAGE ───────────────────────────────────────────────────────────
function safeSetItem(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.warn(`Failed to save ${key}`, e); }
}

function safeGetItem(key, defaultValue) {
  try {
    const val = localStorage.getItem(key);
    return val === null ? defaultValue : JSON.parse(val);
  } catch (e) {
    console.warn(`Failed to parse ${key}`, e);
    return defaultValue;
  }
}

// ─── STAGE CONFIG ───────────────────────────────────────────────────────────
const STAGES = {
  perimenopause: {
    label: 'Perimenopause', emoji: '🌙',
    accent: '#7C5CBF', accentSoft: '#F3EEFF', accentMid: '#A885E0',
    desc: 'Your body is transitioning. Cycles may be irregular.',
  },
  menopause: {
    label: 'Menopause', emoji: '🌸',
    accent: '#C0516A', accentSoft: '#FFF0F3', accentMid: '#D9849A',
    desc: '12+ months without a period. A new chapter begins.',
  },
  postmenopause: {
    label: 'Post-Menopause', emoji: '✨',
    accent: '#3A8A6E', accentSoft: '#EDFAF5', accentMid: '#61B899',
    desc: 'Hormones have stabilised. Focus on long-term wellness.',
  },
};

// ─── STATIC DATA ────────────────────────────────────────────────────────────
const SYMPTOMS = [
  { id: 'hotFlash',   icon: <Flame size={20} />,     label: 'Hot Flashes',  key: 'hotFlash'   },
  { id: 'nightSweat', icon: <Droplets size={20} />,   label: 'Night Sweats', key: 'nightSweat' },
  { id: 'mood',       icon: <CloudRain size={20} />,  label: 'Mood Swings',  key: 'mood'       },
  { id: 'sleep',      icon: <Moon size={20} />,       label: 'Sleep Issues', key: 'sleep'      },
  { id: 'brainFog',   icon: <Cloud size={20} />,      label: 'Brain Fog',    key: 'brainFog'   },
  { id: 'jointPain',  icon: <Bone size={20} />,       label: 'Joint Aches',  key: 'jointPain'  },
  { id: 'anxiety',    icon: <HeartPulse size={20} />, label: 'Anxiety',      key: 'anxiety'    },
  { id: 'fatigue',    icon: <Battery size={20} />,    label: 'Fatigue',      key: 'fatigue'    },
];

const HORMONE_FIELDS = [
  { key: 'e2',           label: 'Oestradiol (E2)', max: 200, min: 0, color: '#7C5CBF', unit: 'pmol/L' },
  { key: 'fsh',          label: 'FSH',             max: 100, min: 0, color: '#E07B39', unit: 'IU/L'   },
  { key: 'lh',           label: 'LH',              max: 80,  min: 0, color: '#5B6ABF', unit: 'IU/L'   },
  { key: 'progesterone', label: 'Progesterone',    max: 10,  min: 0, color: '#3A8A6E', unit: 'nmol/L' },
];

const MOODS = [
  { icon: <Smile size={24} />,    label: 'Grounded'  },
  { icon: <CloudRain size={24} />,label: 'Unsettled' },
  { icon: <Flame size={24} />,    label: 'Flushed'   },
  { icon: <Moon size={24} />,     label: 'Tired'     },
  { icon: <Zap size={24} />,      label: 'Wired'     },
  { icon: <Heart size={24} />,    label: 'Content'   },
];

const NUTRITION_ITEMS = [
  { icon: <Leaf size={20} />,    name: 'Phytoestrogens', sub: 'Soy, flaxseed, chickpeas',  color: '#3A8A6E', bg: '#EDFAF5' },
  { icon: <Droplet size={20} />, name: 'Calcium + Vit D',sub: 'Bone health priority',       color: '#2B6CB0', bg: '#EBF8FF' },
  { icon: <Fish size={20} />,    name: 'Omega-3',        sub: 'Mood & heart protection',    color: '#7C5CBF', bg: '#F3EEFF' },
  { icon: <Coffee size={20} />,  name: 'Limit Caffeine', sub: 'Worsens hot flashes',        color: '#E05252', bg: '#FFF5F5' },
  { icon: <Apple size={20} />,   name: 'Magnesium-rich', sub: 'Leafy greens, nuts, seeds',  color: '#B7580A', bg: '#FFFAF0' },
  { icon: <Droplets size={20} />,name: 'Stay Hydrated',  sub: '8 glasses minimum',          color: '#3182CE', bg: '#EBF8FF' },
];

const MENTAL_TIPS = [
  { id: 'breathing',  icon: <Wind size={20} />,     title: '4-7-8 Breathing',     body: 'Inhale for 4 counts, hold for 7, exhale for 8. Activates your parasympathetic nervous system and reduces cortisol within minutes.',   tag: 'Anxiety & Stress',    color: '#7C5CBF', bg: '#F3EEFF' },
  { id: 'journaling', icon: <BookOpen size={20} />, title: 'Gratitude Journaling', body: "Writing 3 specific things you're grateful for daily rewires the brain's negativity bias — clinically shown to reduce perimenopausal low mood.", tag: 'Low Mood',            color: '#C0516A', bg: '#FFF0F3' },
  { id: 'movement',   icon: <Footprints size={20} />,title: 'Gentle Movement',    body: 'Even a 20-minute walk raises serotonin and norepinephrine. Yoga and tai chi specifically reduce hot flash frequency by up to 30%.',      tag: 'Mood & Hot Flashes',  color: '#3A8A6E', bg: '#EDFAF5' },
  { id: 'sleep',      icon: <Bed size={20} />,      title: 'Sleep Rituals',        body: "Keep your bedroom at 16–18°C. A cool shower before bed drops core temperature and signals your brain it's time to rest.",                  tag: 'Sleep & Night Sweats',color: '#2B6CB0', bg: '#EBF8FF' },
  { id: 'connection', icon: <Heart size={20} />,    title: 'Stay Connected',       body: 'Social connection is protective. Isolation worsens perimenopausal symptoms. A regular call or walk with a friend matters more than you think.', tag: 'Loneliness',         color: '#B7580A', bg: '#FFFAF0' },
];

// ─── PHASE CONSTANTS ────────────────────────────────────────────────────────
const PHASE_COLOR = { none: '#E8E0F0', light: '#D4B8F0', period: '#C0516A' };
const PHASE_CYCLE = { none: 'light', light: 'period', period: 'none' };
const PHASE_LABEL = { none: 'None', light: 'Light', period: 'Period' };

// ─── HELPERS ────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function daysBetween(dateStr, nowStr) {
  const a = new Date(dateStr + 'T00:00:00');
  const b = new Date(nowStr + 'T00:00:00');
  return Math.round((b - a) / 86_400_000);
}

function deriveCyclePattern(periods) {
  if (periods.length < 2) return 'Insufficient data';
  const sorted = [...periods].sort();
  const gaps = [];
  for (let i = 1; i < sorted.length; i++) {
    gaps.push(daysBetween(sorted[i - 1], sorted[i]));
  }
  const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const min = Math.min(...gaps);
  const max = Math.max(...gaps);
  if (max - min > 14) return 'Irregular';
  if (avg < 24) return 'Short cycles';
  if (avg > 35) return 'Long cycles';
  return 'Regular';
}

function getWeekStart() {
  const now = new Date();
  const d = new Date(now);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

// ─── BUSINESS LOGIC ─────────────────────────────────────────────────────────
function getClothingAdvice(symptoms) {
  const hasHotFlash   = symptoms.hotFlash   >= 2;
  const hasNightSweat = symptoms.nightSweat >= 2;
  const hasFatigue    = symptoms.fatigue    >= 2;
  const hasJoint      = symptoms.jointPain  >= 2;

  if (hasHotFlash && hasNightSweat) return {
    badge: 'Layer Up & Let Go', icon: <Wind size={20} />,
    tip: 'Wear moisture-wicking base layers you can easily remove. Think loose linen or bamboo-blend tees over a breathable cami. Avoid synthetic fibres.',
    fabrics: ['🌿 Bamboo', '🍃 Linen', '🐑 Light Merino'],
    avoid: ['🚫 Polyester', '🚫 Tight necklines', '🚫 Turtlenecks'],
    color: '#C0516A', bg: '#FFF0F3',
  };
  if (hasHotFlash) return {
    badge: 'Stay Cool & Breezy', icon: <Thermometer size={20} />,
    tip: 'Opt for open-neck, loose-fit clothing in natural breathable fabrics. Light pastels and whites reflect heat.',
    fabrics: ['👗 Loose cotton', '🌊 Rayon', '🍃 Linen'],
    avoid: ['🚫 Dark heavy colours', '🚫 Polo necks', '🚫 Tight waistbands'],
    color: '#E07B39', bg: '#FFF5EE',
  };
  if (hasFatigue && hasJoint) return {
    badge: 'Comfort is Queen', icon: <Heart size={20} />,
    tip: "Soft, stretchy fabrics that don't restrict movement. Wide-leg trousers, knit dresses, and supportive footwear make a real difference.",
    fabrics: ['🧶 Soft knit', '🩲 Stretch jersey', '👟 Cushioned footwear'],
    avoid: ['🚫 Stiff denim', '🚫 High heels', '🚫 Tight elastic waistbands'],
    color: '#7C5CBF', bg: '#F3EEFF',
  };
  return {
    badge: 'Dress for Your Mood', icon: <Sparkles size={20} />,
    tip: "Today looks manageable — express yourself freely! Try a pop of colour; wearing your favourite colours genuinely lifts serotonin.",
    fabrics: ['🎨 Whatever makes you smile', '🌈 Bold colours', '💎 That outfit you love'],
    avoid: [],
    color: '#3A8A6E', bg: '#EDFAF5',
  };
}

function getAiInsight(symptoms) {
  const { hotFlash, nightSweat, anxiety, mood, sleep, fatigue, brainFog, jointPain } = symptoms;

  if (hotFlash >= 3 || (hotFlash >= 2 && nightSweat >= 2)) return {
    title: 'Significant heat symptoms today',
    body: 'Both hot flashes and night sweats are elevated. Stay hydrated, choose layered breathable clothing, and consider discussing HRT or CBT with your GP or menopause specialist.',
  };
  if (anxiety >= 2 && mood >= 2) return {
    title: 'Emotional turbulence flagged',
    body: "Mood swings and anxiety are both moderate-to-severe. The 4-7-8 breathing technique and a short outdoor walk can lower cortisol within minutes. You're not alone in this.",
  };
  if (sleep >= 2 && fatigue >= 2) return {
    title: 'Sleep & energy are taking a hit',
    body: "Poor sleep is amplifying your fatigue. Keep your bedroom at 16–18°C, avoid screens 1 hour before bed, and try magnesium glycinate after discussing with your GP.",
  };
  if (brainFog >= 2) return {
    title: 'Brain fog is notable today',
    body: 'Cognitive symptoms are common during perimenopause. Short walks, hydration, and reducing screen overload can sharpen mental clarity quickly.',
  };
  if (jointPain >= 2) return {
    title: 'Joint discomfort logged',
    body: 'Declining oestrogen affects joint lubrication. Omega-3 rich foods, gentle movement, and staying warm can reduce severity. Mention to your GP if persistent.',
  };
  if (hotFlash >= 2) return {
    title: 'Hot flashes elevated today',
    body: 'Oestrogen may be fluctuating. Keep a fan nearby, choose layered breathable clothing, and consider discussing HRT options with your menopause specialist.',
  };
  if (sleep >= 2) return {
    title: 'Sleep disruption this week',
    body: 'Poor sleep amplifies all other menopause symptoms. Try keeping your bedroom at 17°C, avoiding alcohol for 3 hours before bed, and using a weighted blanket.',
  };
  return {
    title: 'Your wellness score is holding well',
    body: "Lovely — your symptom profile today is manageable. Focus on hydration, a gentle walk, and your daily checklist to build on this momentum.",
  };
}

// ─── SUB-COMPONENTS ─────────────────────────────────────────────────────────
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
        <span className="mn-symptom-emoji" style={{ color: levelColors[value] }}>{symptom.icon}</span>
        <div>
          <p className="mn-symptom-name">{symptom.label}</p>
          <p className="mn-symptom-level" style={{ color: levelColors[value] }}>{levelLabels[value]}</p>
        </div>
      </div>
      <div className="mn-severity-dots">
        {levels.map(l => (
          <button
            key={l}
            className="mn-dot"
            aria-label={`Set ${symptom.label} to ${levelLabels[l]}`}
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
        <div className="mn-clothing-icon" style={{ background: advice.color + '22', color: advice.color }}>
          {advice.icon}
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
              {advice.fabrics.map((f, i) => <p key={i} className="mn-clothing-item">{f}</p>)}
            </div>
            {advice.avoid.length > 0 && (
              <div>
                <p className="mn-clothing-sub" style={{ color: '#E05252' }}>Today, Skip</p>
                {advice.avoid.map((f, i) => <p key={i} className="mn-clothing-item">{f}</p>)}
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
      <div className="mn-mental-icon" style={{ background: tip.color + '22', color: tip.color }}>{tip.icon}</div>
      <div className="mn-mental-body">
        <div className="mn-mental-top">
          <p className="mn-mental-title">{tip.title}</p>
          <span className="mn-mental-tag" style={{ background: tip.color + '22', color: tip.color }}>{tip.tag}</span>
        </div>
        <p className="mn-mental-text">{tip.body}</p>
      </div>
    </div>
  );
}

function StatPill({ icon, value, label, accent, empty, onClick }) {
  return (
    <div className="mn-stat-pill" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="mn-stat-icon" style={{ color: accent }}>{icon}</div>
      <p className="mn-stat-value" style={{ color: empty ? '#bbb' : accent }}>{value}</p>
      <p className="mn-stat-label">{label}</p>
    </div>
  );
}

function HormoneBar({ label, value, max, color, unit }) {
  const safeValue = value != null ? Math.min(max, Math.max(0, value)) : null;
  const pct = safeValue != null ? Math.min(100, Math.round((safeValue / max) * 100)) : 0;
  return (
    <div className="mn-hbar-row">
      <div className="mn-hbar-top">
        <span className="mn-hbar-label">{label}</span>
        {safeValue != null
          ? <span className="mn-hbar-val" style={{ color }}>{safeValue} <span className="mn-hbar-unit">{unit}</span></span>
          : <span className="mn-hbar-val" style={{ color: '#bbb' }}>Not entered</span>
        }
      </div>
      <div className="mn-hbar-bg">
        {safeValue != null && (
          <div className="mn-hbar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
        )}
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
          strokeDasharray={circ} strokeDashoffset={dash}
          strokeLinecap="round" transform="rotate(-90 55 55)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="55" y="51" textAnchor="middle" fontSize="18" fontWeight="800" fill={accent}>{pct}%</text>
        <text x="55" y="67" textAnchor="middle" fontSize="9" fill="#9E9E9E">{label}</text>
      </svg>
    </div>
  );
}

function ChecklistRingProgress({ percentage, accent, size = 60 }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E8E0F0" strokeWidth="5" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={accent} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
        <div style={{ fontSize: size * 0.28, fontWeight: 'bold', color: accent }}>{percentage}%</div>
        <div style={{ fontSize: size * 0.12, color: '#999' }}>done</div>
      </div>
    </div>
  );
}

function CycleWeekRow({ days, onToggle, accent }) {
  return (
    <div className="mn-cycle-row" role="group" aria-label="Weekly cycle phase tracker">
      {days.map((d, i) => (
        <div
          key={`${d.day}-${i}`}
          className="mn-cycle-day"
          onClick={() => onToggle(i)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onToggle(i)}
          aria-label={`Day ${d.day}: ${PHASE_LABEL[d.phase]}`}
        >
          <div
            className="mn-cycle-dot"
            style={{
              background: PHASE_COLOR[d.phase],
              border: `2px solid ${d.phase !== 'none' ? accent : 'transparent'}`,
              transition: 'background 0.2s',
            }}
          />
          <span className="mn-cycle-lbl">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

// ─── HORMONE INPUT MODAL ────────────────────────────────────────────────────
function HormoneInputModal({ hormones, onSave, onClose, accent }) {
  const [draft, setDraft] = useState({ ...hormones });
  const [errors, setErrors] = useState({});

  const validateAndSave = () => {
    const newErrors = {};
    const safeDraft = {};

    HORMONE_FIELDS.forEach(f => {
      const raw = draft[f.key];
      if (raw === null || raw === '' || raw === undefined) { safeDraft[f.key] = null; return; }
      const num = parseFloat(raw);
      if (isNaN(num)) { newErrors[f.key] = 'Please enter a valid number'; safeDraft[f.key] = null; return; }
      if (num < f.min || num > f.max) newErrors[f.key] = `Value must be between ${f.min} and ${f.max}`;
      safeDraft[f.key] = Math.min(f.max, Math.max(f.min, num));
    });

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    onSave(safeDraft);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0006', zIndex: 200, display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div style={{ width: '100%', background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>🧬 Enter Blood Test Results</p>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 20 }}>Copy values from your latest blood test. Leave blank if not available.</p>
        {HORMONE_FIELDS.map(f => (
          <div key={f.key} style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>
              {f.label} <span style={{ color: '#aaa' }}>({f.unit})</span>
            </label>
            <input
              type="number" step="0.1" min={f.min} max={f.max}
              value={draft[f.key] ?? ''}
              onChange={e => {
                const val = e.target.value;
                setDraft(prev => ({ ...prev, [f.key]: val === '' ? null : val }));
                if (errors[f.key]) setErrors(prev => ({ ...prev, [f.key]: undefined }));
              }}
              placeholder={`e.g. ${f.max * 0.25}`}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${errors[f.key] ? '#E05252' : '#e0e0e0'}`, fontSize: 14, boxSizing: 'border-box' }}
            />
            {errors[f.key] && <p style={{ fontSize: 12, color: '#E05252', marginTop: 4 }}>{errors[f.key]}</p>}
          </div>
        ))}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button onClick={validateAndSave} style={{ flex: 1, background: accent, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Save Results</button>
          <button onClick={onClose} style={{ flex: 1, background: '#f0f0f0', color: '#555', border: 'none', borderRadius: 12, padding: '12px 0', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── SLEEP & HYDRATION MODAL ─────────────────────────────────────────────────
function SleepHydrationModal({ sleepHours, hydrationGlasses, onSave, onClose, accent }) {
  const [sleep, setSleep] = useState(sleepHours ?? '');
  const [hydration, setHydration] = useState(hydrationGlasses ?? '');
  const [sleepError, setSleepError] = useState('');

  const validateAndSave = () => {
    let hrs = null;
    if (sleep !== '' && sleep !== null && sleep !== undefined) {
      const parsed = parseFloat(sleep);
      if (isNaN(parsed)) { setSleepError('Please enter a valid number'); return; }
      if (parsed < 0 || parsed > 24) { setSleepError('Sleep must be between 0 and 24 hours'); return; }
      hrs = parsed;
    }
    setSleepError('');
    const h = (hydration !== '' && !isNaN(parseInt(hydration))) ? Math.min(8, Math.max(0, parseInt(hydration))) : null;
    onSave({ sleepHours: hrs, hydrationGlasses: h });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0006', zIndex: 200, display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div style={{ width: '100%', background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px' }} onClick={e => e.stopPropagation()}>
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>📊 Log Sleep & Hydration</p>

        <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>😴 Sleep last night (hours)</label>
        <input
          type="number" step="0.5" min="0" max="24"
          value={sleep}
          onChange={e => { setSleep(e.target.value); setSleepError(''); }}
          placeholder="e.g. 7"
          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${sleepError ? '#E05252' : '#e0e0e0'}`, fontSize: 14, boxSizing: 'border-box', marginBottom: sleepError ? 4 : 16 }}
        />
        {sleepError && <p style={{ fontSize: 12, color: '#E05252', marginBottom: 12 }}>{sleepError}</p>}

        <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>💧 Water glasses today (out of 8)</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {[1,2,3,4,5,6,7,8].map(n => (
            <button
              key={n}
              onClick={() => setHydration(n)}
              style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid', borderColor: hydration >= n ? accent : '#e0e0e0', background: hydration >= n ? accent + '22' : '#fff', color: hydration >= n ? accent : '#aaa', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              {n}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={validateAndSave} style={{ flex: 1, background: accent, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Save</button>
          <button onClick={onClose} style={{ flex: 1, background: '#f0f0f0', color: '#555', border: 'none', borderRadius: 12, padding: '12px 0', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function Menopause({ setTab }) {
  const { setShowSOS } = useApp();

  // One-time cleanup + migration
  useEffect(() => {
    localStorage.removeItem('mn_encryption_key');
    const currentVer = safeGetItem(STORAGE_KEYS.migration, '0');
    if (currentVer !== MIGRATION_VERSION) {
      safeSetItem(STORAGE_KEYS.migration, MIGRATION_VERSION);
    }
  }, []);

  // ─── STATE ───────────────────────────────────────────────────────────────
  const [stage, setStage] = useState(() => safeGetItem(STORAGE_KEYS.stage, 'perimenopause'));
  const [symptoms, setSymptoms] = useState(() => safeGetItem(STORAGE_KEYS.symptoms, {
    hotFlash: 0, nightSweat: 0, mood: 0, sleep: 0, brainFog: 0, jointPain: 0, anxiety: 0, fatigue: 0,
  }));
  const [moodState, setMoodState] = useState(() => {
    const savedMood = safeGetItem(STORAGE_KEYS.mood, null);
    const savedDate = safeGetItem(STORAGE_KEYS.moodDate, null);
    return savedDate === todayStr() ? savedMood : null;
  });
  const [checklist, setChecklist] = useState(() => {
    const saved = safeGetItem(STORAGE_KEYS.checklist, null);
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    return [
      { id: 'water',   label: '💧 Drink 8 glasses of water',  done: false },
      { id: 'walk',    label: '🚶‍♀️ 20-min gentle walk',         done: false },
      { id: 'calcium', label: '🥛 Take calcium supplement',    done: false },
      { id: 'screen',  label: '📵 No screens 1hr before bed',  done: false },
      { id: 'journal', label: '📓 3-minute gratitude journal', done: false },
      { id: 'breath',  label: '🌬️ 4-7-8 breathing (5 rounds)', done: false },
    ];
  });
  const [showAllTips, setShowAllTips]       = useState(() => safeGetItem(STORAGE_KEYS.showAllTips, false));
  const [tempLog, setTempLog]               = useState(() => safeGetItem(STORAGE_KEYS.tempLog, []));
  const [hormones, setHormones]             = useState(() => safeGetItem(STORAGE_KEYS.hormones, { e2: null, fsh: null, lh: null, progesterone: null }));
  const [sleepHydration, setSleepHydration] = useState(() => {
    const data = safeGetItem(STORAGE_KEYS.sleepHydration, { sleepHours: null, hydrationGlasses: null, date: todayStr() });
    return data.date === todayStr() ? data : { sleepHours: null, hydrationGlasses: null, date: todayStr() };
  });
  const [periods, setPeriods]   = useState(() => safeGetItem(STORAGE_KEYS.periods, []));
  const [cycleWeek, setCycleWeek] = useState(() => {
    const data = safeGetItem(STORAGE_KEYS.cycleWeek, null);
    return data?.weekStart === getWeekStart()
      ? data.days
      : ['M','T','W','T','F','S','S'].map(d => ({ day: d, phase: 'none' }));
  });

  const [showHormoneModal, setShowHormoneModal] = useState(false);
  const [showSleepModal, setShowSleepModal]     = useState(false);
  const [tempInput, setTempInput]               = useState('');
  const [tempError, setTempError]               = useState('');

  const today = todayStr();

  // ─── DERIVED ─────────────────────────────────────────────────────────────
  const meta        = useMemo(() => STAGES[stage] || STAGES.perimenopause, [stage]);
  const clothing    = useMemo(() => getClothingAdvice(symptoms), [symptoms]);
  const doneCount   = useMemo(() => checklist.filter(c => c.done).length, [checklist]);
  const checklistPct= useMemo(() => checklist.length ? Math.round((doneCount / checklist.length) * 100) : 0, [doneCount, checklist.length]);
  const wellnessPct = useMemo(() => Math.max(10, 100 - Math.round((Object.values(symptoms).reduce((a, b) => a + b, 0) / (SYMPTOMS.length * 3)) * 100)), [symptoms]);
  const aiInsight   = useMemo(() => getAiInsight(symptoms), [symptoms]);
  const avgTemp     = useMemo(() => {
    if (!tempLog.length) return null;
    return (tempLog.reduce((a, b) => a + b, 0) / tempLog.length).toFixed(1);
  }, [tempLog]);
  const sortedPeriods     = useMemo(() => [...periods].sort(), [periods]);
  const lastPeriod        = sortedPeriods[sortedPeriods.length - 1] ?? null;
  const daysSincePeriod   = lastPeriod ? daysBetween(lastPeriod, today) : null;
  const cyclePattern      = useMemo(() => deriveCyclePattern(sortedPeriods), [sortedPeriods]);
  const periodsThisYear   = useMemo(() => sortedPeriods.filter(d => d.startsWith(today.slice(0, 4))).length, [sortedPeriods, today]);
  const visibleTips       = showAllTips ? MENTAL_TIPS : MENTAL_TIPS.slice(0, 2);

  // ─── DEBOUNCED PERSISTENCE ───────────────────────────────────────────────
  const storageTimerRef  = useRef(null);
  const pendingWritesRef = useRef({});

  const scheduleStorageWrite = useCallback((key, value) => {
    pendingWritesRef.current[key] = value;
    if (storageTimerRef.current) clearTimeout(storageTimerRef.current);
    storageTimerRef.current = setTimeout(() => {
      Object.entries(pendingWritesRef.current).forEach(([k, v]) => safeSetItem(k, v));
      pendingWritesRef.current = {};
    }, 300);
  }, []);

  useEffect(() => { scheduleStorageWrite(STORAGE_KEYS.stage, stage); },               [stage, scheduleStorageWrite]);
  useEffect(() => { scheduleStorageWrite(STORAGE_KEYS.symptoms, symptoms); },         [symptoms, scheduleStorageWrite]);
  useEffect(() => {
    if (moodState) {
      scheduleStorageWrite(STORAGE_KEYS.mood, moodState);
      scheduleStorageWrite(STORAGE_KEYS.moodDate, todayStr());
    }
  }, [moodState, scheduleStorageWrite]);
  useEffect(() => { scheduleStorageWrite(STORAGE_KEYS.checklist, checklist); },       [checklist, scheduleStorageWrite]);
  useEffect(() => { scheduleStorageWrite(STORAGE_KEYS.showAllTips, showAllTips); },   [showAllTips, scheduleStorageWrite]);
  useEffect(() => { scheduleStorageWrite(STORAGE_KEYS.tempLog, tempLog); },           [tempLog, scheduleStorageWrite]);
  useEffect(() => { scheduleStorageWrite(STORAGE_KEYS.hormones, hormones); },         [hormones, scheduleStorageWrite]);
  useEffect(() => { scheduleStorageWrite(STORAGE_KEYS.sleepHydration, sleepHydration); }, [sleepHydration, scheduleStorageWrite]);
  useEffect(() => { scheduleStorageWrite(STORAGE_KEYS.periods, periods); },           [periods, scheduleStorageWrite]);
  useEffect(() => { scheduleStorageWrite(STORAGE_KEYS.cycleWeek, { weekStart: getWeekStart(), days: cycleWeek }); }, [cycleWeek, scheduleStorageWrite]);

  // Daily checklist reset
  useEffect(() => {
    const lastDate = safeGetItem(STORAGE_KEYS.checklistDate, null);
    if (lastDate !== today) {
      setChecklist(prev => prev.map(item => ({ ...item, done: false })));
      safeSetItem(STORAGE_KEYS.checklistDate, today);
    }
  }, [today]);

  // ─── HANDLERS ───────────────────────────────────────────────────────────
  const updateSymptom = (key, val) => setSymptoms(prev => ({ ...prev, [key]: val }));
  const toggleCheck   = (id)       => setChecklist(prev => prev.map(c => c.id === id ? { ...c, done: !c.done } : c));

  const addTemperature = (val) => {
    if (!val && val !== 0) return;
    const num = parseFloat(val);
    if (isNaN(num)) return;
    if (num >= 35 && num <= 42) {
      setTempLog(prev => { const next = [...prev, num]; return next.length > 14 ? next.slice(-14) : next; });
      setTempError('');
    } else {
      setTempError('Temperature must be between 35°C and 42°C');
    }
  };

  const toggleCycleDay = (index) => {
    setCycleWeek(prev => prev.map((d, i) => i === index ? { ...d, phase: PHASE_CYCLE[d.phase] } : d));
  };

  const markPeriodToday = () => {
    if (!periods.includes(today)) setPeriods(prev => [...new Set([...prev, today])]);
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div className="hm-root mn-root">

      {/* Privacy Banner */}
      <div style={{ fontSize: '11px', color: '#888', textAlign: 'center', padding: '8px 12px', background: '#f9f6ff' }}>
        All data stored locally on your device • Private &amp; secure
      </div>

      {/* Stage Picker */}
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
            <span className="mn-stage-label">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Hero Banner */}
      <div className="mn-hero" style={{ background: `linear-gradient(135deg, ${meta.accentSoft}, #FFF9FE)` }}>
        <div className="mn-hero-left">
          <div className="mn-hero-badge" style={{ background: meta.accent + '22', color: meta.accent }}>
            <span>{meta.emoji}</span> {meta.label}
          </div>
          <h2 className="mn-hero-title">Your body.{'\n'}Your pace.{'\n'}Your power.</h2>
          <p className="mn-hero-sub">{meta.desc}</p>
        </div>
        <div className="mn-hero-ring">
          <WellnessRing pct={wellnessPct} accent={meta.accent} label="Wellness" />
        </div>
      </div>

      {/* Stats Row — per-pill onClick */}
      <div className="mn-stats-row">
        <StatPill icon={<Thermometer size={16} />} value={avgTemp ? `${avgTemp}°` : '—'} label="Avg Temp"   accent={meta.accent}  empty={!avgTemp} />
        <StatPill icon={<Flame size={16} />}        value={`${symptoms.hotFlash}/3`}       label="Hot Flashes" accent="#E07B39" />
        <StatPill icon={<Moon size={16} />}         value={sleepHydration.sleepHours != null ? `${sleepHydration.sleepHours}h` : '—'} label="Sleep" accent="#5B6ABF" empty={sleepHydration.sleepHours == null} onClick={() => setShowSleepModal(true)} />
        <StatPill icon={<Droplets size={16} />}     value={sleepHydration.hydrationGlasses != null ? `${sleepHydration.hydrationGlasses}/8` : '—'} label="Hydration" accent="#3A8A6E" empty={sleepHydration.hydrationGlasses == null} onClick={() => setShowSleepModal(true)} />
      </div>
      {(sleepHydration.sleepHours == null || sleepHydration.hydrationGlasses == null) && (
        <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: -8, marginBottom: 4 }}>Tap Sleep or Hydration to log today's data</p>
      )}

      {/* Clothing Badge */}
      <ClothingBadge advice={clothing} />

      {/* Symptom Logger */}
      <div className="hm-card">
        <SectionLabel>📊 TODAY'S SYMPTOMS</SectionLabel>
        <p className="mn-section-sub">Tap the dots to log severity.</p>
        <div className="mn-symptom-list">
          {SYMPTOMS.map(s => (
            <SymptomSeverity key={s.id} symptom={s} value={symptoms[s.key]} onChange={val => updateSymptom(s.key, val)} accent={meta.accent} />
          ))}
        </div>
      </div>

      {/* Mood Check */}
      <div className="hm-card">
        <SectionLabel>💜 HOW ARE YOU FEELING RIGHT NOW?</SectionLabel>
        <div className="mn-mood-grid">
          {MOODS.map(m => (
            <button
              key={m.label}
              className={`mn-mood-btn ${moodState?.label === m.label ? 'mn-mood-btn--on' : ''}`}
              style={moodState?.label === m.label ? { borderColor: meta.accent, background: meta.accentSoft } : {}}
              onClick={() => setMoodState(m)}
            >
              <span className="mn-mood-em" style={{ color: meta.accent }}>{m.icon}</span>
              <span className="mn-mood-lbl">{m.label}</span>
            </button>
          ))}
        </div>
        {moodState && (
          <div className="mn-mood-fb" style={{ background: meta.accentSoft }}>
            <span style={{ color: meta.accent, fontWeight: 700 }}>Feeling {moodState.label} logged ✓</span>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--md)', marginTop: 4 }}>
              {moodState.label === 'Flushed'   && 'Try removing a layer, sip cold water, and try the 4-7-8 breath.'}
              {moodState.label === 'Unsettled' && "That's valid. A 5-minute grounding exercise can help settle your nervous system."}
              {moodState.label === 'Tired'     && 'Rest is not laziness. If you can, take a 20-minute nap this afternoon.'}
              {moodState.label === 'Wired'     && 'Avoid caffeine after 2pm. Magnesium glycinate before bed may help tonight.'}
              {moodState.label === 'Grounded'  && 'Wonderful — carry that with you. A short walk will make it last longer.'}
              {moodState.label === 'Content'   && "Hold onto this feeling. It's worth celebrating where you are right now."}
            </p>
          </div>
        )}
      </div>

      {/* Hormone Panel */}
      <div className="hm-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <SectionLabel>HORMONE REFERENCE PANEL 🧬</SectionLabel>
          <button
            onClick={() => setShowHormoneModal(true)}
            style={{ background: meta.accent + '18', color: meta.accent, border: 'none', borderRadius: 10, padding: '5px 10px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
          >
            <Edit2 size={12} /> Edit
          </button>
        </div>
        <p className="mn-section-sub">Enter results from your latest blood test.</p>
        {HORMONE_FIELDS.every(f => hormones[f.key] == null) ? (
          <div style={{ background: '#f9f6ff', borderRadius: 12, padding: 16, textAlign: 'center', border: '1.5px dashed #d0b8f0', marginTop: 8 }}>
            <p style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>No blood test results entered yet</p>
            <button onClick={() => setShowHormoneModal(true)} style={{ background: meta.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Add Results</button>
          </div>
        ) : (
          <div className="mn-hbar-list">
            {HORMONE_FIELDS.map(f => <HormoneBar key={f.key} label={f.label} value={hormones[f.key]} max={f.max} color={f.color} unit={f.unit} />)}
          </div>
        )}
        {HORMONE_FIELDS.some(f => hormones[f.key] != null) && (
          <p className="mn-horm-note">💡 Low oestradiol with elevated FSH is consistent with {meta.label.toLowerCase()}. Always discuss with your GP or menopause specialist.</p>
        )}
      </div>

      {/* Temperature Trend */}
      <div className="hm-card">
        <SectionLabel>BODY TEMPERATURE — RECENT TREND 🌡️</SectionLabel>
        {tempLog.length === 0 ? (
          <div style={{ background: '#f9f9f9', borderRadius: 12, padding: 16, textAlign: 'center', border: '1.5px dashed #e0e0e0', marginBottom: 12 }}>
            <p style={{ fontSize: 13, color: '#999' }}>No temperatures logged yet.</p>
          </div>
        ) : (
          <div className="mn-temp-chart">
            {tempLog.slice(-7).map((t, i) => {
              const min = 35.5; const max = 38.5;
              const h = Math.max(4, Math.round(((t - min) / (max - min)) * 80));
              const isHigh = t >= 37.5;
              return (
                <div key={i} className="mn-temp-col">
                  <span className="mn-temp-val" style={{ color: isHigh ? '#E05252' : meta.accent }}>{t}°</span>
                  <div className="mn-temp-bar-wrap">
                    <div className="mn-temp-bar" style={{ height: `${h}px`, background: isHigh ? 'linear-gradient(180deg,#E05252,#F59E0B)' : `linear-gradient(180deg,${meta.accent},${meta.accentMid})` }} />
                  </div>
                  <span className="mn-temp-day">#{tempLog.length - tempLog.slice(-7).length + i + 1}</span>
                </div>
              );
            })}
          </div>
        )}
        <div className="mn-temp-input-row">
          <input
            type="number" step="0.1" min="35" max="42"
            value={tempInput}
            placeholder="Log today's temp (°C)"
            onChange={e => { setTempInput(e.target.value); setTempError(''); }}
            onBlur={() => { addTemperature(tempInput); setTempInput(''); }}
            onKeyDown={e => { if (e.key === 'Enter') { addTemperature(tempInput); setTempInput(''); } }}
            aria-label="Enter body temperature in Celsius"
            className="mn-temp-input"
          />
        </div>
        {tempError && <p style={{ color: '#E05252', fontSize: 13, marginTop: 4 }}>{tempError}</p>}
        {tempLog.length > 0 && (
          <div className="mn-temp-legend">
            <span className="mn-leg-dot" style={{ background: '#E05252' }} /> Elevated (≥37.5°)
            <span className="mn-leg-dot" style={{ background: meta.accent, marginLeft: 16 }} /> Normal
          </div>
        )}
      </div>

      {/* Menstrual Cycle (Perimenopause only) */}
      {stage === 'perimenopause' && (
        <div className="hm-card">
          <SectionLabel>MENSTRUAL TRACKING</SectionLabel>
          <p className="mn-section-sub">Tap a day to cycle through: none → light → period.</p>
          <CycleWeekRow days={cycleWeek} onToggle={toggleCycleDay} accent={meta.accent} />
          <div className="mn-cycle-legend">
            <span className="mn-leg-dot" style={{ background: PHASE_COLOR.period }} /> Period
            <span className="mn-leg-dot" style={{ background: PHASE_COLOR.light, marginLeft: 12 }} /> Light
            <span className="mn-leg-dot" style={{ background: PHASE_COLOR.none, marginLeft: 12 }} /> None
          </div>
          <button
            onClick={markPeriodToday}
            disabled={periods.includes(today)}
            style={{ marginTop: 10, background: periods.includes(today) ? '#f0f0f0' : meta.accent, color: periods.includes(today) ? '#aaa' : '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: periods.includes(today) ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={14} />
            {periods.includes(today) ? 'Today already marked' : 'Mark today as period start'}
          </button>
          <div className="mn-cycle-stats" style={{ marginTop: 14 }}>
            <div className="mn-cycle-stat">
              <p className="mn-cstat-val" style={{ color: meta.accent }}>{daysSincePeriod != null ? daysSincePeriod : '—'}</p>
              <p className="mn-cstat-lbl">Days since last period</p>
            </div>
            <div className="mn-cycle-stat">
              <p className="mn-cstat-val" style={{ color: meta.accent, fontSize: periods.length >= 2 ? undefined : 14 }}>{periods.length >= 2 ? cyclePattern : '—'}</p>
              <p className="mn-cstat-lbl">Cycle pattern</p>
            </div>
            <div className="mn-cycle-stat">
              <p className="mn-cstat-val" style={{ color: meta.accent }}>{periodsThisYear}</p>
              <p className="mn-cstat-lbl">Periods this year</p>
            </div>
          </div>
          {periods.length === 0 && (
            <p style={{ fontSize: 11, color: '#bbb', marginTop: 8 }}>Mark your first period start to begin tracking.</p>
          )}
        </div>
      )}

      {/* AI Insight */}
      <div className="hm-card" style={{ background: 'linear-gradient(135deg, #F8F4FF, #FFF9FE)' }}>
        <SectionLabel>✨ YOUR AI INSIGHT</SectionLabel>
        <div className="mn-ai-wrap">
          <span style={{ fontSize: 36 }}>🤖</span>
          <div>
            <p className="mn-ai-title" style={{ color: meta.accent }}>{aiInsight.title}</p>
            <p className="mn-ai-body">{aiInsight.body}</p>
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

      {/* Mental Health Tips */}
      <div className="hm-card">
        <SectionLabel>MENTAL HEALTH SUPPORT 🧠</SectionLabel>
        <p className="mn-section-sub">Evidence-based strategies tailored to your symptoms today.</p>
        <div className="mn-mental-list">
          {visibleTips.map(tip => <MentalTipCard key={tip.id} tip={tip} />)}
        </div>
        <button className="hm-view-all" style={{ color: meta.accent }} onClick={() => setShowAllTips(v => !v)}>
          {showAllTips ? 'Show fewer tips ↑' : `See all ${MENTAL_TIPS.length} strategies →`}
        </button>
      </div>

      {/* Daily Checklist */}
      <div className="hm-card">
        <div className="hm-checklist-header" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionLabel>DAILY WELLNESS CHECKLIST ☀️</SectionLabel>
          <ChecklistRingProgress percentage={checklistPct} accent={meta.accent} size={60} />
        </div>
        <div style={{ marginTop: 16 }}>
          {checklist.map(c => (
            <button key={c.id} className="hm-check-row" onClick={() => toggleCheck(c.id)}>
              {c.done
                ? <CheckCircle2 size={20} color={meta.accent} strokeWidth={2} />
                : <Circle size={20} color="#ccc" strokeWidth={2} />
              }
              <span className={`hm-check-label ${c.done ? 'hm-check-label--done' : ''}`}>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nutrition */}
      <div className="hm-card">
        <SectionLabel>NUTRITION FOCUS FOR {meta.label.toUpperCase()} 🥗</SectionLabel>
        <div className="mn-nutrition-grid">
          {NUTRITION_ITEMS.map((n, i) => (
            <div key={i} className="mn-nutrition-card" style={{ background: n.bg, borderColor: n.color + '33' }}>
              <span className="mn-nutrition-em" style={{ color: n.color }}>{n.icon}</span>
              <p className="mn-nutrition-name" style={{ color: n.color }}>{n.name}</p>
              <p className="mn-nutrition-sub">{n.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* HRT Information */}
      <div className="hm-card" style={{ borderLeft: `4px solid ${meta.accent}` }}>
        <SectionLabel>HRT & TREATMENT OPTIONS 💊</SectionLabel>
        <div className="mn-hrt-list">
          {[
            { title: 'Hormone Replacement Therapy (HRT)', body: 'The most effective treatment for menopause symptoms. Modern HRT is safe for most women and significantly reduces hot flashes, sleep issues, and mood symptoms.', badge: 'Most Effective', color: meta.accent },
            { title: 'Cognitive Behavioural Therapy (CBT)', body: 'NICE-recommended for menopause-related mood changes and hot flashes. As effective as medication for some women.', badge: 'NICE Recommended', color: '#3A8A6E' },
            { title: 'Lifestyle Modifications', body: 'Weight management, regular exercise, and reduced alcohol can reduce symptom severity by 30–40% without medication.', badge: 'No Prescription', color: '#5B6ABF' },
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
        <p className="mn-horm-note">⚕️ Always discuss treatment options with your GP or menopause specialist before starting or changing therapy.</p>
      </div>

      {/* Crisis Support */}
      <div className="hm-card" style={{ background: '#FFF5F5' }}>
        <SectionLabel>MENTAL HEALTH CRISIS SUPPORT 🆘</SectionLabel>
        <p className="mn-section-sub" style={{ marginBottom: 12 }}>Menopausal hormone changes can trigger or worsen depression. You are never alone.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a href="tel:116123" style={{ background: '#C0516A', color: '#fff', padding: '8px 16px', borderRadius: 20, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <Phone size={16} /> Samaritans 116 123
          </a>
          <a href="tel:111" style={{ background: '#7C5CBF', color: '#fff', padding: '8px 16px', borderRadius: 20, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <Shield size={16} /> NHS 111
          </a>
          <button onClick={() => setShowSOS(true)} style={{ background: '#3A8A6E', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 16px', cursor: 'pointer', fontSize: 14 }}>
            🆘 SOS
          </button>
        </div>
      </div>

      <div style={{ height: 32 }} />

      {/* Modals */}
      {showHormoneModal && (
        <HormoneInputModal
          hormones={hormones}
          onSave={setHormones}
          onClose={() => setShowHormoneModal(false)}
          accent={meta.accent}
        />
      )}
      {showSleepModal && (
        <SleepHydrationModal
          sleepHours={sleepHydration.sleepHours}
          hydrationGlasses={sleepHydration.hydrationGlasses}
          onSave={vals => setSleepHydration({ ...vals, date: todayStr() })}
          onClose={() => setShowSleepModal(false)}
          accent={meta.accent}
        />
      )}
    </div>
  );
}