import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertTriangle, ChevronRight, Hospital, CheckCircle2, Circle, Plus, Trash2, PlusCircle, MinusCircle, X } from 'lucide-react';
import { useApp } from '../../context/useApp';
import CalendarStrip from '../../components/ui/CalendarStrip';
import GlowCard from '../../components/GlowCard';
import EmergencyRedFlags from '../../components/EmergencyRedFlags';
import { HOME_CONFIG, JOURNEY_META } from '../../data/homeConfig';
import './Home.css';

/* ─────────────────────────────────────────────────────────────────
   CLINICAL REFERENCE DATA (Not user-configurable - medical guidelines)
   These are reference values, not user data.
───────────────────────────────────────────────────────────────── */
const PREGNANCY_WEIGHT_GAIN = {
  T1_EXPECTED_KG: 1.5,   
  T2_EXPECTED_KG: 6.5,   
  T3_EXPECTED_KG: 11.5,  
};

const CYCLE = {
  DEFAULT_LENGTH: 28,
  FERTILE_WINDOW_PRE_OVU: 5,
  FERTILE_WINDOW_POST_OVU: 1,
  LUTEAL_PHASE_LENGTH: 14,
  IMPLANTATION_DAY_MIN: 6,
  IMPLANTATION_DAY_MAX: 10,
};

const EMERGENCY = {
  BP_SYSTOLIC:  160,
  BP_DIASTOLIC: 110,
  MOVEMENT_CONCERN_WEEK: 24,
};

const SLEEP_THRESHOLDS = {
  POOR: 5,
  FAIR: 7,
  GOOD: 8,
};

function getSleepLabel(hours) {
  if (hours < SLEEP_THRESHOLDS.POOR) return 'Rest more';
  if (hours < SLEEP_THRESHOLDS.FAIR) return 'Getting there';
  if (hours >= SLEEP_THRESHOLDS.GOOD) return 'Well rested';
  return 'Good';
}

function expectedWeightGain(week) {
  if (!week) return null;
  if (week <= 12) return PREGNANCY_WEIGHT_GAIN.T1_EXPECTED_KG;
  if (week <= 28) return PREGNANCY_WEIGHT_GAIN.T2_EXPECTED_KG;
  return PREGNANCY_WEIGHT_GAIN.T3_EXPECTED_KG;
}

function trimesterLabel(t) {
  const labels = ['First', 'Second', 'Third'];
  return labels[(t ?? 1) - 1] ?? 'First';
}

function trimesterOrdinal(t) {
  const ordinals = ['st', 'nd', 'rd'];
  return ordinals[(t ?? 1) - 1] ?? 'st';
}

/* ─────────────────────────────────────────────────────────────────
   USER CONFIGURABLE TARGETS (Load from localStorage)
───────────────────────────────────────────────────────────────── */
const DEFAULT_TARGETS = {
  HYDRATION_CUPS: 8,
  KICKS: 10,
  STEPS: 8000,
  SLEEP_HOURS: 8,
};

function getUserTargets() {
  try {
    const saved = localStorage.getItem('userTargets');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_TARGETS, ...parsed };
    }
  } catch {}
  return DEFAULT_TARGETS;
}

function saveUserTargets(targets) {
  localStorage.setItem('userTargets', JSON.stringify(targets));
}

/* ─────────────────────────────────────────────────────────────────
   USER CUSTOMIZABLE SYMPTOMS
───────────────────────────────────────────────────────────────── */
const DEFAULT_SYMPTOMS = {
  pregnant: ['Nausea', 'Fatigue', 'Cramps', 'Swelling', 'Heartburn', 'Headache'],
  mom: ['Fatigue', 'Soreness', 'Low mood', 'Engorgement', 'Headache'],
  conceive: ['Cramping', 'Bloating', 'Spotting', 'Fatigue', 'Mood swings'],
  ivf: ['Bloating', 'Cramping', 'Injection site', 'Fatigue', 'Nausea'],
  menopause: ['Hot flush', 'Night sweats', 'Brain fog', 'Joint pain', 'Low mood'],
};

function getUserSymptoms(journeyType) {
  try {
    const saved = localStorage.getItem(`userSymptoms_${journeyType}`);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}
  return DEFAULT_SYMPTOMS[journeyType] || DEFAULT_SYMPTOMS.pregnant;
}

function saveUserSymptoms(journeyType, symptoms) {
  localStorage.setItem(`userSymptoms_${journeyType}`, JSON.stringify(symptoms));
}

/* ─────────────────────────────────────────────────────────────────
   USER CUSTOMIZABLE MOODS
───────────────────────────────────────────────────────────────── */
const DEFAULT_MOODS = [
  { emoji: '😌', label: 'Calm' },
  { emoji: '😄', label: 'Happy' },
  { emoji: '😕', label: 'Low' },
  { emoji: '⚡', label: 'Energetic' },
  { emoji: '😢', label: 'Sad' },
];

function getUserMoods() {
  try {
    const saved = localStorage.getItem('userMoods');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}
  return DEFAULT_MOODS;
}

function saveUserMoods(moods) {
  localStorage.setItem('userMoods', JSON.stringify(moods));
}

/* ─────────────────────────────────────────────────────────────────
   TIP ROTATION (uses current date, not hard-coded)
───────────────────────────────────────────────────────────────── */
function getDayIndex(arrayLength) {
  return new Date().getDate() % arrayLength;
}

/* ─────────────────────────────────────────────────────────────────
   DAILY TIPS STORAGE - Tips can be user-added or come from library
───────────────────────────────────────────────────────────────── */
const DEFAULT_TIPS_LIBRARY = {
  pregnant: [
    { weeks: [1, 12], tips: [
      'Folic acid in the first trimester helps prevent neural tube defects.',
      'Nausea often peaks at week 8–10. Small, frequent meals with ginger can help.',
      "Your baby's heart starts beating around week 6.",
      'Stay hydrated — aim for 8–10 cups of water daily.',
      'Light walking for 20 minutes a day is safe and great for circulation.',
    ]},
    { weeks: [13, 27], tips: [
      "You're in the second trimester — many women feel their energy return.",
      'Baby can hear your voice from around week 18.',
      'Iron-rich foods like spinach and lentils help prevent anaemia.',
      'Kick counting can start from around week 18–20.',
      "Heartburn is common. Try smaller meals and avoid lying down after eating.",
    ]},
    { weeks: [28, 42], tips: [
      "Baby is gaining weight rapidly. Make sure you're eating enough protein.",
      'Swelling in feet and ankles is normal — elevate when resting.',
      "Pack your hospital bag by week 36.",
      'Braxton Hicks contractions are practice contractions.',
      'Sleep on your left side to improve blood flow.',
    ]},
  ],
  mom: [
    'Sleep deprivation is real. Ask for help — rest is recovery.',
    'Drink water every time you feed. Breastfeeding increases your fluid needs.',
    'If you\'re struggling with mood, reach out for support.',
    'Your body took 9 months to change. Give it grace to heal.',
    'Skin-to-skin contact with baby boosts bonding hormones.',
  ],
  conceive: [
    'Ovulation typically happens 14 days before your next period.',
    'BBT rises 0.2°C after ovulation — track it first thing every morning.',
    'Folic acid is recommended for all women trying to conceive.',
    'LH surges 24–36 hours before ovulation.',
    'Stress can delay ovulation. Rest and gentle exercise support balance.',
  ],
  ivf: [
    'Take medications at the same time each day.',
    'Stay hydrated during stimulation to reduce OHSS risk.',
    'Rest after transfer but light walking is fine.',
    'Progesterone support continues after transfer.',
    'The two-week wait is hard. Lean on your support system.',
  ],
  menopause: [
    'Weight-bearing exercise helps maintain bone density.',
    'Phytoestrogens in foods like tofu and flaxseed may ease some symptoms.',
    'Hot flushes can be triggered by caffeine, alcohol, and spicy foods.',
    'Sleep disruption is common — try cooling your room.',
    'HRT is an option worth discussing with your GP.',
  ],
};

function getUserTips(journeyType) {
  try {
    const saved = localStorage.getItem(`userTips_${journeyType}`);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}
  return DEFAULT_TIPS_LIBRARY[journeyType] || DEFAULT_TIPS_LIBRARY.pregnant;
}

function getDailyTip(journeyType, currentWeek) {
  const tips = getUserTips(journeyType);
  
  if (journeyType === 'pregnant' && currentWeek && Array.isArray(tips)) {
    const group = tips.find(g => g.weeks && currentWeek >= g.weeks[0] && currentWeek <= g.weeks[1]);
    if (group && group.tips) {
      return group.tips[getDayIndex(group.tips.length)];
    }
  }
  
  if (Array.isArray(tips) && tips.length > 0) {
    return tips[getDayIndex(tips.length)];
  }
  
  return null;
}

/* ─────────────────────────────────────────────────────────────────
   HERO BODY COPY (Dynamic, based on user data)
───────────────────────────────────────────────────────────────── */
function getPregnantHeroBody(trimester, userData) {
  if (userData?.customHeroMessage) return userData.customHeroMessage;
  if (trimester === 1) return "Your baby's neural tube is forming. Take folic acid daily.";
  if (trimester === 2) return 'Baby is growing rapidly. Eat nutrient-rich foods.';
  return 'Baby is putting on weight. Rest and prepare for birth.';
}

function getMomHeroBody(weeks, userData) {
  if (userData?.customHeroMessage) return userData.customHeroMessage;
  if (weeks <= 4) return 'Focus on rest, hydration, and skin-to-skin contact.';
  if (weeks <= 12) return "You're finding your rhythm. Ask for help when needed.";
  return 'Celebrate your journey. Every day gets a little easier.';
}

/* ─────────────────────────────────────────────────────────────────
   CYCLE STATS BUILDER (all derived, no hard-coded dates)
───────────────────────────────────────────────────────────────── */
function buildCycleStats(lastPeriodStart, cycleLength) {
  const cycleLen = cycleLength || CYCLE.DEFAULT_LENGTH;

  const bbtEntry = (() => {
    try {
      const history = JSON.parse(localStorage.getItem('vitalsHistory') || '[]');
      return history[0]?.bbt || null;
    } catch { return null; }
  })();

  if (!lastPeriodStart) {
    return {
      cycleDay: null, ovulationIn: null, fertileStart: null, fertileEnd: null,
      bbt: bbtEntry, cycleLength: cycleLen, inFertileWindow: false, phase: 'unknown',
      tip: '🌸 Log your last period start date in Cycle Tracker to get personalised daily tips.',
    };
  }

  const today = new Date();
  const periodStart = new Date(lastPeriodStart);
  const cycleDay = Math.floor((today - periodStart) / (1000 * 60 * 60 * 24)) + 1;

  const ovulationDay = cycleLen - CYCLE.LUTEAL_PHASE_LENGTH;
  const ovulationIn = ovulationDay - cycleDay;
  const fertileStart = Math.max(1, ovulationDay - CYCLE.FERTILE_WINDOW_PRE_OVU);
  const fertileEnd = Math.min(cycleLen, ovulationDay + CYCLE.FERTILE_WINDOW_POST_OVU);
  const inFertileWindow = cycleDay >= fertileStart && cycleDay <= fertileEnd;

  let phase = 'follicular';
  if (cycleDay <= 5) phase = 'menstrual';
  else if (cycleDay < fertileStart) phase = 'follicular';
  else if (cycleDay >= ovulationDay - 1 && cycleDay <= ovulationDay + 1) phase = 'ovulation';
  else if (cycleDay > ovulationDay) phase = 'luteal';

  // Generate tip dynamically based on user's actual data
  let tip = '';
  if (inFertileWindow) {
    if (ovulationIn === 0) {
      tip = `🌟 Day ${cycleDay}: Ovulation day! Your egg is released now and will live for 12–24 hours.`;
    } else if (ovulationIn === 1) {
      tip = `💚 Day ${cycleDay}: Peak fertility! Ovulation expected tomorrow.`;
    } else {
      tip = `💚 Day ${cycleDay}: Fertile window active (Days ${fertileStart}–${fertileEnd}). Ovulation in ${ovulationIn} days.`;
    }
  } else if (phase === 'menstrual') {
    tip = `🩸 Day ${cycleDay}: ${cycleDay === 1 ? 'Your period started today.' : 'Menstruation continues.'}`;
  } else if (phase === 'follicular') {
    tip = `🌱 Day ${cycleDay}: Follicular phase. Oestrogen is rising.`;
  } else if (phase === 'ovulation') {
    tip = `✨ Day ${cycleDay}: ${ovulationIn === 0 ? 'OVULATION DAY!' : 'Ovulation just occurred.'}`;
  } else if (phase === 'luteal') {
    tip = `💛 Day ${cycleDay}: Luteal phase. Progesterone is rising.`;
  }

  return {
    cycleDay, ovulationIn, fertileStart, fertileEnd,
    inFertileWindow, bbt: bbtEntry, cycleLength: cycleLen,
    phase, ovulationDay, tip,
  };
}

function getCycleActionText(cycleStats) {
  const { inFertileWindow, phase, ovulationIn, fertileStart, fertileEnd, cycleDay } = cycleStats;

  if (inFertileWindow) {
    if (ovulationIn === 0) {
      return '⭐ PRIORITY: Have intercourse today! This is your peak fertility day.';
    }
    if (ovulationIn === 1) {
      return '⭐ PRIORITY: Have intercourse today and tomorrow. Ovulation expected tomorrow.';
    }
    return `⭐ ACTION: Have intercourse every 1–2 days. Your fertile window is Days ${fertileStart}–${fertileEnd}.`;
  }
  if (phase === 'menstrual') {
    return `📊 Track: Log your flow intensity and cramps. ${cycleDay === 1 ? 'This is your new cycle day 1.' : ''}`;
  }
  if (phase === 'follicular') {
    return cycleDay <= 10
      ? `📊 Prepare: Start LH testing around day ${fertileStart - 2}.`
      : '📊 Prepare: Check cervical mucus daily for fertility signs.';
  }
  if (phase === 'ovulation') {
    return '📊 Confirm: Track BBT tomorrow morning to confirm ovulation.';
  }
  if (phase === 'luteal') {
    return '📊 Observe: Track any symptoms. A pregnancy test can be taken if your period is late.';
  }
  return '📊 Track your symptoms daily to understand your unique cycle patterns.';
}

/* ─────────────────────────────────────────────────────────────────
   COMPONENTS (same as before, but with dynamic data)
───────────────────────────────────────────────────────────────── */
const StatCard = React.memo(({ icon, label, value, sub, accent, onClick, screenId }) => (
  <div
    className="hm-stat-card"
    onClick={() => onClick && onClick(screenId)}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
  >
    <div className="hm-stat-card-header">
      <span className="hm-stat-icon">{icon}</span>
      <div className="hm-stat-desc">
        <p className="hm-stat-value" style={{ color: accent }}>{value}</p>
        <p className="hm-stat-label">{label}</p>
        <p className="hm-stat-sub">{sub}</p>
      </div>
      {onClick && <ChevronRight size={16} color={accent} className="hm-stat-arrow" />}
    </div>
  </div>
));

const CycleStatCard = React.memo(({ icon, label, value, sub, accent, onClick, screenId }) => (
  <div
    className="hm-cycle-stat-card"
    onClick={() => onClick && onClick(screenId)}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
  >
    <div className="hm-cycle-stat-card-header">
      <span className="hm-cycle-stat-icon">{icon}</span>
      <div className="hm-cycle-stat-desc">
        <p className="hm-cycle-stat-value" style={{ color: accent }}>{value}</p>
        <p className="hm-cycle-stat-label">{label}</p>
        <p className="hm-cycle-stat-sub">{sub}</p>
      </div>
    </div>
  </div>
));

const ChecklistItem = React.memo(({ id, label, done, onToggle, onDelete, accent }) => (
  <div className="hm-check-row-wrapper">
    <button className="hm-check-row" onClick={() => onToggle(id)}>
      {done ? <CheckCircle2 size={20} color={accent} /> : <Circle size={20} color="#ccc" />}
      <span className={`hm-check-label ${done ? 'hm-check-label--done' : ''}`}>{label}</span>
    </button>
    <button className="hm-check-delete" onClick={() => onDelete(id)} aria-label="Delete task">
      <Trash2 size={16} color="#999" />
    </button>
  </div>
));

const QuickAction = React.memo(({ emoji, label, onClick }) => (
  <button className="hm-qa-btn" onClick={onClick}>
    <span className="hm-qa-em">{emoji}</span>
    <span className="hm-qa-lbl">{label}</span>
  </button>
));

function WeightUpdateModal({ isOpen, onClose, currentWeight, onSave, accent }) {
  const [weightInput, setWeightInput] = useState(currentWeight || '');

  if (!isOpen) return null;

  const handleSave = () => {
    const weightNum = parseFloat(weightInput);
    if (!isNaN(weightNum) && weightNum > 0) {
      onSave(weightNum);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Update Weight</h3>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          <label>Current weight (kg)</label>
          <input
            type="number"
            step="0.1"
            placeholder="Enter your weight"
            value={weightInput}
            onChange={e => setWeightInput(e.target.value)}
            autoFocus
            className="weight-input"
          />
        </div>
        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="modal-save-btn" onClick={handleSave} style={{ background: accent }}>
            Save Weight
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TARGETS SETTINGS MODAL
───────────────────────────────────────────────────────────────── */
function TargetsSettingsModal({ isOpen, onClose, targets, onSave, accent }) {
  const [localTargets, setLocalTargets] = useState(targets);

  useEffect(() => {
    setLocalTargets(targets);
  }, [targets]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localTargets);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Customise Your Targets</h3>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          <label>Daily Hydration Goal (cups)</label>
          <input
            type="number"
            value={localTargets.HYDRATION_CUPS}
            onChange={e => setLocalTargets({...localTargets, HYDRATION_CUPS: parseInt(e.target.value) || 0})}
            min={0}
            max={20}
          />
          <label>Daily Baby Kicks Goal</label>
          <input
            type="number"
            value={localTargets.KICKS}
            onChange={e => setLocalTargets({...localTargets, KICKS: parseInt(e.target.value) || 0})}
            min={0}
            max={50}
          />
          <label>Daily Steps Goal</label>
          <input
            type="number"
            value={localTargets.STEPS}
            onChange={e => setLocalTargets({...localTargets, STEPS: parseInt(e.target.value) || 0})}
            min={0}
            max={50000}
            step={500}
          />
          <label>Daily Sleep Goal (hours)</label>
          <input
            type="number"
            step={0.5}
            value={localTargets.SLEEP_HOURS}
            onChange={e => setLocalTargets({...localTargets, SLEEP_HOURS: parseFloat(e.target.value) || 0})}
            min={0}
            max={16}
          />
        </div>
        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="modal-save-btn" onClick={handleSave} style={{ background: accent }}>
            Save Targets
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────── */
export default function Home({ setTab }) {
  const {
    journeyType,
    setShowSOS,
    getCurrentWeek,
    getTrimester,
    babyAgeDays,
    userName,
    lastPeriodStart,
    cycleLength,
  } = useApp();

  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showTargetsModal, setShowTargetsModal] = useState(false);
  const [targets, setTargetsState] = useState(() => getUserTargets());

  const updateTargets = useCallback((newTargets) => {
    setTargetsState(newTargets);
    saveUserTargets(newTargets);
  }, []);

  if (!journeyType) {
    return (
      <div className="hm-root">
        <div className="hm-card" style={{ textAlign: 'center', padding: 'var(--sp-6)' }}>
          <p>Please complete onboarding</p>
          <button onClick={() => setTab('onboarding')}>Start</button>
        </div>
      </div>
    );
  }

  const meta = JOURNEY_META[journeyType] ?? JOURNEY_META.pregnant;
  const cfg = HOME_CONFIG[journeyType] ?? HOME_CONFIG.pregnant;

  const currentWeek = journeyType === 'pregnant' ? getCurrentWeek() : null;
  const trimester = journeyType === 'pregnant' ? getTrimester() : null;
  const babyAgeWeeks = journeyType === 'mom' && babyAgeDays ? Math.floor(babyAgeDays / 7) : null;

  // Load user data from localStorage
  const [vitals, setVitals] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vitalsHistory') || '[]')[0] || {}; }
    catch { return {}; }
  });

  const [weightGoals, setWeightGoals] = useState(() => {
    try {
      const g = JSON.parse(localStorage.getItem('weightGoals') || '{}');
      return { startWeight: g.startWeight || null, targetWeight: g.targetWeight || null, prePregnancyWeight: g.prePregnancyWeight || null };
    } catch { return { startWeight: null, targetWeight: null, prePregnancyWeight: null }; }
  });

  // Daily tracker state (all start at 0 - user must add data)
  const [hydration, setHydration] = useState(0);
  const [kicks, setKicks] = useState(0);
  const [steps, setSteps] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [weight, setWeight] = useState(null);

  const [appointments, setAppointments] = useState([]);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAllApt, setShowAllApt] = useState(false);

  const [tipDismissed, setTipDismissed] = useState(() => {
    try { return localStorage.getItem('tipDismissedDate') === new Date().toDateString(); }
    catch { return false; }
  });

  const [activeSymptoms, setActiveSymptoms] = useState(() => {
    try {
      const today = new Date().toDateString();
      const saved = JSON.parse(localStorage.getItem('symptomLog') || '{}');
      return saved.date === today ? (saved.symptoms || []) : [];
    } catch { return []; }
  });

  const [mood, setMood] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lastMood')); }
    catch { return null; }
  });

  const [checklist, setChecklist] = useState(() => {
    try {
      const savedDate = localStorage.getItem('checklistDate');
      const today = new Date().toDateString();
      const saved = localStorage.getItem(`dailyTasks_${journeyType}`);
      if (savedDate === today && saved) return JSON.parse(saved);
      if (savedDate !== today && saved) return JSON.parse(saved).map(t => ({ ...t, done: false }));
      localStorage.setItem('checklistDate', today);
    } catch {}
    return [];
  });

  const [moodStreak, setMoodStreak] = useState(() => {
    try { const s = parseInt(localStorage.getItem('moodStreak') || '0'); return isNaN(s) ? 0 : s; }
    catch { return 0; }
  });

  // Get user-customizable data
  const journeySymptoms = getUserSymptoms(journeyType);
  const moods = getUserMoods();

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const today = new Date().toDateString();

        const hydrationLogs = JSON.parse(localStorage.getItem('hydrationLogs') || '[]');
        const todayHydration = hydrationLogs.find(l => l.date === today);
        setHydration(todayHydration ? todayHydration.cups : 0);

        const kickHistory = JSON.parse(localStorage.getItem('kickHistory') || '[]');
        const todayKicks = kickHistory.filter(k => k.date === today);
        setKicks(todayKicks.reduce((sum, k) => sum + (k.count || 0), 0));

        const stepLogs = JSON.parse(localStorage.getItem('stepLogs') || '[]');
        setSteps(stepLogs.find(l => l.date === today)?.steps || 0);

        const sleepLogs = JSON.parse(localStorage.getItem('sleepLogs') || '[]');
        setSleep(sleepLogs.find(l => l.date === today)?.hours || 0);

        const vitalsHistory = JSON.parse(localStorage.getItem('vitalsHistory') || '[]');
        setWeight(vitalsHistory[0]?.weight || null);
        setVitals(vitalsHistory[0] || {});

        setAppointments(JSON.parse(localStorage.getItem('appointments') || '[]'));
        setWeightGoals(JSON.parse(localStorage.getItem('weightGoals') || '{}'));
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
    const events = ['vitalsUpdated', 'hydrationUpdated', 'kicksUpdated', 'stepsUpdated', 'weightGoalsUpdated', 'sleepUpdated'];
    events.forEach(e => window.addEventListener(e, loadData));
    return () => events.forEach(e => window.removeEventListener(e, loadData));
  }, []);

  useEffect(() => {
    try { localStorage.setItem(`dailyTasks_${journeyType}`, JSON.stringify(checklist)); }
    catch {}
  }, [checklist, journeyType]);

  // Vitals extraction
  const bpSys = vitals.bpSys;
  const bpDia = vitals.bpDia;
  const bleeding = vitals.bleeding || 'none';
  const fetalMovement = vitals.fetalMovement || 'normal';

  const hasEmergency =
    (bpSys && bpSys >= EMERGENCY.BP_SYSTOLIC) ||
    (bpDia && bpDia >= EMERGENCY.BP_DIASTOLIC) ||
    (currentWeek && currentWeek >= EMERGENCY.MOVEMENT_CONCERN_WEEK && fetalMovement === 'reduced') ||
    bleeding === 'heavy';

  // Next appointment
  const nextAppointment = useMemo(() => {
    if (!appointments.length) return null;
    const now = new Date();
    const upcoming = appointments
      .map(a => ({ ...a, _date: new Date(a.date || a.datetime || a.appointmentDate) }))
      .filter(a => !isNaN(a._date) && a._date >= now)
      .sort((a, b) => a._date - b._date);
    if (!upcoming.length) return null;
    const next = upcoming[0];
    const diffDays = Math.ceil((next._date - now) / (1000 * 60 * 60 * 24));
    return { ...next, diffDays };
  }, [appointments]);

  // Checklist helpers
  const addTask = useCallback(() => {
    if (!newTaskInput.trim()) return;
    setChecklist(prev => [...prev, {
      id: Date.now().toString(),
      label: newTaskInput.trim(),
      done: false,
      createdAt: new Date().toISOString(),
    }]);
    setNewTaskInput('');
    setShowAddTask(false);
  }, [newTaskInput]);

  const toggleCheck = useCallback((id) => {
    setChecklist(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }, []);

  const deleteTask = useCallback((id) => {
    setChecklist(prev => prev.filter(t => t.id !== id));
  }, []);

  const done = checklist.filter(c => c.done).length;
  const pct = checklist.length > 0 ? Math.round((done / checklist.length) * 100) : 0;
  const aptList = showAllApt ? appointments : appointments.slice(0, 2);

  // Mood handler
  const handleMood = useCallback((selectedMood) => {
    setMood(selectedMood);
    localStorage.setItem('lastMood', JSON.stringify(selectedMood));
    const lastMoodDate = localStorage.getItem('lastMoodDate');
    const today = new Date().toDateString();
    if (lastMoodDate === today) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const newStreak = lastMoodDate === yesterday.toDateString() ? moodStreak + 1 : 1;
    setMoodStreak(newStreak);
    localStorage.setItem('moodStreak', newStreak.toString());
    localStorage.setItem('lastMoodDate', today);
  }, [moodStreak]);

  // Tracker updaters
  const updateHydration = useCallback((delta) => {
    const today = new Date().toDateString();
    const newValue = Math.max(0, hydration + delta);
    setHydration(newValue);
    const logs = JSON.parse(localStorage.getItem('hydrationLogs') || '[]');
    const idx = logs.findIndex(l => l.date === today);
    if (idx >= 0) logs[idx].cups = newValue; else logs.push({ date: today, cups: newValue });
    localStorage.setItem('hydrationLogs', JSON.stringify(logs));
    window.dispatchEvent(new Event('hydrationUpdated'));
  }, [hydration]);

  const updateSteps = useCallback((delta) => {
    const today = new Date().toDateString();
    const newValue = Math.max(0, steps + delta);
    setSteps(newValue);
    const logs = JSON.parse(localStorage.getItem('stepLogs') || '[]');
    const idx = logs.findIndex(l => l.date === today);
    if (idx >= 0) logs[idx].steps = newValue; else logs.push({ date: today, steps: newValue });
    localStorage.setItem('stepLogs', JSON.stringify(logs));
    window.dispatchEvent(new Event('stepsUpdated'));
  }, [steps]);

  const updateKicks = useCallback((delta) => {
    const today = new Date().toDateString();
    const newValue = Math.max(0, kicks + delta);
    setKicks(newValue);
    const history = JSON.parse(localStorage.getItem('kickHistory') || '[]');
    const idx = history.findIndex(k => k.date === today);
    if (idx >= 0) history[idx].count = newValue;
    else history.push({ date: today, count: newValue, timestamp: new Date().toISOString() });
    localStorage.setItem('kickHistory', JSON.stringify(history));
    window.dispatchEvent(new Event('kicksUpdated'));
  }, [kicks]);

  const updateSleep = useCallback((delta) => {
    const today = new Date().toDateString();
    const newValue = Math.max(0, Math.min(24, sleep + delta));
    setSleep(newValue);
    const logs = JSON.parse(localStorage.getItem('sleepLogs') || '[]');
    const idx = logs.findIndex(l => l.date === today);
    if (idx >= 0) logs[idx].hours = newValue; else logs.push({ date: today, hours: newValue });
    localStorage.setItem('sleepLogs', JSON.stringify(logs));
    window.dispatchEvent(new Event('sleepUpdated'));
  }, [sleep]);

  const updateWeight = useCallback((weightNum) => {
    setWeight(weightNum);
    const history = JSON.parse(localStorage.getItem('vitalsHistory') || '[]');
    if (history.length > 0) {
      history[0].weight = weightNum;
      history[0].recordedAt = new Date().toISOString();
    } else {
      history.push({ weight: weightNum, recordedAt: new Date().toISOString() });
    }
    localStorage.setItem('vitalsHistory', JSON.stringify(history));
    window.dispatchEvent(new Event('vitalsUpdated'));
  }, []);

  const toggleSymptom = useCallback((symptom) => {
    setActiveSymptoms(prev => {
      const next = prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom];
      localStorage.setItem('symptomLog', JSON.stringify({ date: new Date().toDateString(), symptoms: next }));
      return next;
    });
  }, []);

  const dismissTip = useCallback(() => {
    setTipDismissed(true);
    localStorage.setItem('tipDismissedDate', new Date().toDateString());
  }, []);

  // Progress calculations using user targets
  const waterProgress = Math.min(100, Math.round((hydration / targets.HYDRATION_CUPS) * 100));
  const kicksProgress = Math.min(100, Math.round((kicks / targets.KICKS) * 100));
  const stepsProgress = Math.min(100, Math.round((steps / targets.STEPS) * 100));
  const sleepProgress = Math.min(100, Math.round((sleep / targets.SLEEP_HOURS) * 100));
  const sleepLabel = getSleepLabel(sleep);

  const weightProgress = useMemo(() => {
    if (!weight) return 0;
    if (journeyType === 'pregnant') {
      if (!weightGoals.prePregnancyWeight) return 0;
      const expected = expectedWeightGain(currentWeek);
      if (!expected) return 0;
      const gained = weight - weightGoals.prePregnancyWeight;
      return Math.min(100, Math.max(0, Math.round((gained / expected) * 100)));
    }
    if (weightGoals.startWeight && weightGoals.targetWeight) {
      const totalChange = weightGoals.targetWeight - weightGoals.startWeight;
      if (totalChange === 0) return 0;
      const changed = weight - weightGoals.startWeight;
      return Math.min(100, Math.max(0, Math.round((changed / totalChange) * 100)));
    }
    return 0;
  }, [weight, weightGoals, journeyType, currentWeek]);

  // AI Insight (dynamic based on actual user data)
  const aiInsight = useMemo(() => {
    const completedTasks = checklist.filter(c => c.done).length;
    const totalTasks = checklist.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const pctStr = `${Math.round(completionRate)}%`;

    if (journeyType === 'pregnant') {
      if (!currentWeek) return { title: `${userName || 'Welcome'}! Complete Your Setup`, body: 'Add your daily tasks to get personalised insights.' };
      if (totalTasks === 0) return { title: `Week ${currentWeek} — Let's Get Started`, body: 'Tap + to add your first daily task.' };
      if (completionRate === 100) return { title: `Week ${currentWeek} — Perfect Day! 🎉`, body: `You crushed all ${totalTasks} tasks today.` };
      if (completionRate >= 50) return { title: `Week ${currentWeek} — Great Progress!`, body: `You're ${pctStr} through your tasks.` };
      if (completionRate > 0) return { title: `Week ${currentWeek} — Good Start`, body: `You've completed ${completedTasks} task${completedTasks !== 1 ? 's' : ''}.` };
      return { title: `Week ${currentWeek} — ${trimesterLabel(trimester)} Trimester`, body: `You have ${totalTasks} tasks today.` };
    }
    if (journeyType === 'mom') {
      const title = babyAgeWeeks ? `Week ${babyAgeWeeks} Postpartum` : 'Welcome, Mama!';
      const body = totalTasks === 0
        ? 'Add daily tasks to track your recovery and baby care routine.'
        : completionRate > 0
        ? `You've completed ${completedTasks} of ${totalTasks} tasks.`
        : `Start your day by completing your ${totalTasks} tasks.`;
      return { title, body };
    }
    return { title: `Welcome${userName ? `, ${userName}` : ''}!`, body: 'Add your daily tasks to track what matters most on your journey.' };
  }, [journeyType, currentWeek, trimester, babyAgeWeeks, checklist, userName]);

  const dailyTip = useMemo(() => getDailyTip(journeyType, currentWeek), [journeyType, currentWeek]);
  const cycleStats = useMemo(() => {
    if (journeyType !== 'conceive') return null;
    return buildCycleStats(lastPeriodStart, cycleLength);
  }, [journeyType, lastPeriodStart, cycleLength]);

  return (
    <div className="hm-root">
      <EmergencyRedFlags
        bpSys={bpSys} bpDia={bpDia}
        bleeding={bleeding} fetalMovement={fetalMovement}
        week={currentWeek}
      />

      <WeightUpdateModal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        currentWeight={weight}
        onSave={updateWeight}
        accent={meta.accent}
      />

      <TargetsSettingsModal
        isOpen={showTargetsModal}
        onClose={() => setShowTargetsModal(false)}
        targets={targets}
        onSave={updateTargets}
        accent={meta.accent}
      />

      <div className="journey-container">
        <div className="hm-journey-badge" style={{ color: '#7C3AED', fontWeight: '700', paddingTop: '20px' }}>
          <span>{meta.label}</span>
          {journeyType === 'pregnant' && currentWeek && trimester && (
            <span style={{ marginLeft: 8, fontSize: 'var(--fs-xs)' }}>
              Week {currentWeek} · {trimester}{trimesterOrdinal(trimester)} Trimester
            </span>
          )}
          {journeyType === 'mom' && babyAgeWeeks && (
            <span style={{ marginLeft: 8, fontSize: 'var(--fs-xs)' }}>Week {babyAgeWeeks} Postpartum</span>
          )}
          {journeyType === 'conceive' && cycleStats?.cycleDay && (
            <span style={{ marginLeft: 8, fontSize: 'var(--fs-xs)' }}>
              Cycle Day {cycleStats.cycleDay} of {cycleStats.cycleLength}d
            </span>
          )}
        </div>

        <div className="hm-section">
          <CalendarStrip accent={meta.accent} />
        </div>

        <GlowCard
          journeyType={journeyType === 'mom' ? 'postpartum' : journeyType}
          trimester={trimester}
          postnatalDay={babyAgeDays}
        />

        {/* HERO CARD */}
        <div className="hm-hero-card">
          <div className="hm-hero-content">
            <h2 className="hm-hero-title">
              {journeyType === 'conceive' && cycleStats
                ? cycleStats.inFertileWindow ? "🌟 You're in Your Fertile Window!"
                  : cycleStats.phase === 'menstrual' ? '🌸 Your Menstrual Phase'
                  : cycleStats.phase === 'follicular' ? '🌱 Your Follicular Phase'
                  : cycleStats.phase === 'ovulation' ? '✨ Ovulation Day!'
                  : cycleStats.phase === 'luteal' ? '💛 Your Luteal Phase'
                  : '🔄 Your Cycle'
                : cfg.heroTitle
              }
            </h2>
            <p className="hm-hero-body">
              {journeyType === 'conceive' && cycleStats?.tip
                ? cycleStats.tip
                : journeyType === 'pregnant' && trimester
                ? `Week ${currentWeek}: ${getPregnantHeroBody(trimester, {})}`
                : journeyType === 'mom' && babyAgeWeeks
                ? `Week ${babyAgeWeeks} postpartum: ${getMomHeroBody(babyAgeWeeks, {})}`
                : cfg.heroBody
              }
            </p>
          </div>

          <div className="hm-hero-illo">
            {journeyType === 'conceive' && cycleStats?.cycleDay ? (
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: `conic-gradient(${meta.accent} 0deg ${(cycleStats.cycleDay / cycleStats.cycleLength) * 360}deg, ${meta.accentSoft} ${(cycleStats.cycleDay / cycleStats.cycleLength) * 360}deg 360deg)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%', background: 'white',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', color: meta.accent, textAlign: 'center',
                }}>
                  <span style={{ fontSize: 20 }}>{cycleStats.cycleDay}</span>
                  <span style={{ fontSize: 10, fontWeight: 'normal' }}>Day</span>
                </div>
              </div>
            ) : (
              <img src={cfg.heroIllo} alt={meta.label} />
            )}
          </div>
        </div>
      </div>

      {/* CYCLE PROGRESS BAR */}
      {journeyType === 'conceive' && cycleStats?.cycleDay && (
        <div className="hm-card" style={{ marginTop: 'var(--sp-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-2)' }}>
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)' }}>Cycle Progress</span>
            <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 600, color: meta.accent }}>
              Day {cycleStats.cycleDay} of {cycleStats.cycleLength}
            </span>
          </div>
          <div style={{ height: 8, background: meta.accentSoft, borderRadius: 4, overflow: 'hidden', marginBottom: 'var(--sp-3)' }}>
            <div style={{
              width: `${(cycleStats.cycleDay / cycleStats.cycleLength) * 100}%`,
              height: '100%', background: meta.accent, transition: 'width 0.3s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-2xs)', color: 'var(--mt)' }}>
            {['menstrual', 'follicular', 'ovulation', 'luteal'].map(ph => (
              <span key={ph} style={{
                fontWeight: cycleStats.phase === ph ? 700 : 400,
                color: cycleStats.phase === ph ? meta.accent : 'inherit',
                textTransform: 'capitalize',
              }}>
                {ph}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* DAILY CYCLE ACTION CARD */}
      {journeyType === 'conceive' && cycleStats?.cycleDay && (
        <div className="hm-card" style={{ background: meta.accentSoft, border: `1px solid ${meta.accent}22` }}>
          <div style={{ display: 'flex', gap: 'var(--gap-md)', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 28 }}>📋</span>
            <div style={{ flex: 1 }}>
              <p className="hm-card-label" style={{ color: meta.accent, marginBottom: 4 }}>
                {cycleStats.inFertileWindow ? '🌟 TODAY\'S FERTILITY ACTION'
                  : cycleStats.phase === 'ovulation' ? '✨ TODAY\'S OVULATION ACTION'
                  : '📌 TODAY\'S CYCLE TIP'}
              </p>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--dt)', lineHeight: 1.5 }}>
                {getCycleActionText(cycleStats)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* EMERGENCY BANNER */}
      {hasEmergency && (
        <div className="hm-card" style={{ background: 'var(--rdl)', border: '2px solid var(--rd)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)' }}>
            <div style={{ fontSize: 32 }}>🚨</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 800, color: 'var(--rd)' }}>Emergency Care Needed</p>
              <button
                onClick={() => setShowSOS(true)}
                style={{ marginTop: 8, background: 'var(--rd)', color: '#fff', border: 'none', borderRadius: 20, padding: '6px 16px', cursor: 'pointer' }}
              >
                Call Emergency
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DAILY TIP */}
      {dailyTip && !tipDismissed && (
        <div className="hm-card" style={{ background: meta.accentSoft, border: `1px solid ${meta.accent}22`, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)' }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>💡</span>
            <div style={{ flex: 1 }}>
              <p className="hm-card-label" style={{ color: meta.accent, marginBottom: 4 }}>TODAY'S TIP</p>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--dt)', lineHeight: 1.5 }}>{dailyTip}</p>
            </div>
            <button
              onClick={dismissTip}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mt)', fontSize: 18, flexShrink: 0, padding: 0, lineHeight: 1 }}
              aria-label="Dismiss tip"
            >×</button>
          </div>
        </div>
      )}

      {/* STAT CARDS */}
      <div className="hm-stats-row">
        <StatCard icon="❤️" label="Blood Pressure"
          value={bpSys && bpDia ? `${bpSys}/${bpDia}` : '--'} sub="mmHg"
          accent={meta.accent} onClick={setTab} screenId="vitals" />
        <StatCard icon="⚖️" label="Weight"
          value={weight ? `${weight} kg` : '--'} sub="Current"
          accent={meta.accent} onClick={() => setShowWeightModal(true)} />
        <StatCard icon="🎯" label="Weight Goal"
          value={weightGoals.targetWeight ? `${weightGoals.targetWeight} kg` : 'Not set'} sub="Target"
          accent={meta.accent} onClick={setTab} screenId="body" />
        <StatCard icon="🔥" label="Mood Streak"
          value={moodStreak} sub="days"
          accent={meta.accent} onClick={setTab} screenId="mental" />
      </div>

      {/* CYCLE TRACKER CARD */}
      {journeyType === 'conceive' && cycleStats && (
        <div className="hm-cycle-card" style={{
          background: cycleStats.inFertileWindow ? meta.accentSoft : undefined,
          border: cycleStats.inFertileWindow ? `1px solid ${meta.accent}33` : undefined,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-3)' }}>
            <p className="hm-card-label" style={{ margin: 0 }}>CYCLE TRACKER</p>
            {cycleStats.inFertileWindow && (
              <span style={{ background: meta.accent, color: '#fff', fontSize: 'var(--fs-2xs)', fontWeight: 700, borderRadius: 20, padding: '2px 10px' }}>
                🌟 FERTILE WINDOW
              </span>
            )}
          </div>
          <div className="hm-cycle-stats-row">
            <CycleStatCard icon="📅" label="Cycle Day"
              value={cycleStats.cycleDay != null ? `Day ${cycleStats.cycleDay}` : '--'}
              sub={`of ${cycleStats.cycleLength}d`} accent={meta.accent} onClick={setTab} screenId="ttc" />
            <CycleStatCard icon="🥚" label="Ovulation"
              value={
                cycleStats.ovulationIn == null ? '--'
                : cycleStats.ovulationIn === 0 ? 'Today'
                : cycleStats.ovulationIn < 0 ? `${Math.abs(cycleStats.ovulationIn)}d ago`
                : `In ${cycleStats.ovulationIn}d`
              }
              sub="Estimated" accent={meta.accent} onClick={setTab} screenId="ttc" />
            <CycleStatCard icon="🌡️" label="BBT"
              value={cycleStats.bbt ? `${cycleStats.bbt}°C` : '--'}
              sub="This morning" accent={meta.accent} onClick={setTab} screenId="body" />
            <CycleStatCard icon="💚" label="Fertile Window"
              value={cycleStats.fertileStart != null ? `D${cycleStats.fertileStart}–D${cycleStats.fertileEnd}` : '--'}
              sub={cycleStats.inFertileWindow ? 'Active now' : 'Days in cycle'}
              accent={meta.accent} onClick={setTab} screenId="ttc" />
          </div>
          {!lastPeriodStart && (
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', textAlign: 'center', marginTop: 'var(--sp-2)' }}>
              Log your last period date in Cycle tracker to activate this
            </p>
          )}
        </div>
      )}

      {/* JOURNEY ALERT */}
      {cfg.alert && (
        <div className="hm-alert" style={{ background: cfg.alert.bg, borderColor: cfg.alert.color + '44' }}>
          <AlertTriangle size={10} color={cfg.alert.color} />
          <div>
            <p className="hm-alert-title" style={{ color: cfg.alert.color }}>{cfg.alert.title}</p>
            <p className="hm-alert-body">{cfg.alert.body}</p>
          </div>
          <ChevronRight size={16} color={cfg.alert.color} />
        </div>
      )}

      {/* MOOD CHECK-IN */}
      <div className="hm-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="hm-card-label">HOW ARE YOU FEELING?</p>
          <button 
            onClick={() => setTab('customize')} 
            style={{ background: 'none', border: 'none', color: meta.accent, fontSize: 'var(--fs-xs)', cursor: 'pointer' }}
          >
            Customize moods
          </button>
        </div>
        <div className="hm-mood-row">
          {moods.map(m => (
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
            {mood.label} · {moodStreak} day streak 🔥
          </p>
        )}
      </div>

      {/* SYMPTOMS */}
      <div className="hm-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="hm-card-label">TODAY'S SYMPTOMS</p>
          <button 
            onClick={() => setTab('customize')} 
            style={{ background: 'none', border: 'none', color: meta.accent, fontSize: 'var(--fs-xs)', cursor: 'pointer' }}
          >
            Customize
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-sm)', marginTop: 4 }}>
          {journeySymptoms.map(symptom => {
            const active = activeSymptoms.includes(symptom);
            return (
              <button key={symptom} onClick={() => toggleSymptom(symptom)} style={{
                padding: '6px 14px', borderRadius: 20,
                border: `1.5px solid ${active ? meta.accent : 'var(--border)'}`,
                background: active ? meta.accentSoft : 'transparent',
                color: active ? meta.accent : 'var(--mt)',
                fontSize: 'var(--fs-xs)', fontWeight: active ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}>
                {symptom}
              </button>
            );
          })}
        </div>
        <p style={{ fontSize: 'var(--fs-2xs)', color: 'var(--mt)', marginTop: 8 }}>
          {activeSymptoms.length > 0
            ? `${activeSymptoms.length} symptom${activeSymptoms.length !== 1 ? 's' : ''} logged today`
            : "Tap to log how you're feeling today"
          }
        </p>
      </div>

      {/* QUICK ACTIONS */}
      <div className="hm-card">
        <p className="hm-card-label">QUICK ACTIONS</p>
        <div className="hm-qa-grid">
          {cfg.quickActions.map(a => (
            <QuickAction key={a.id} emoji={a.emoji} label={a.label} onClick={() => a.id && setTab(a.id)} />
          ))}
          <QuickAction emoji="⚙️" label="Set Targets" onClick={() => setShowTargetsModal(true)} />
        </div>
      </div>

      {/* TRACKERS + CHECKLIST */}
      <div className="hm-two-col">
        <div className="hm-card hm-trackers-card">
          <div className="hm-checklist-header">
            <p className="hm-card-label" style={{ margin: 0 }}>TODAY'S TRACKERS</p>
            <button 
              onClick={() => setShowTargetsModal(true)} 
              style={{ background: 'none', border: 'none', color: meta.accent, fontSize: 'var(--fs-xs)', cursor: 'pointer' }}
            >
              Set goals
            </button>
          </div>
          <div className="tracker-container">

            {/* Hydration */}
            <div className="hm-tracker-row">
              <div className="hm-tracker-left">
                <span className="hm-tracker-icon">💧</span>
                <div>
                  <p className="hm-tracker-label">Hydration</p>
                  <p className="hm-tracker-meta">{hydration}/{targets.HYDRATION_CUPS} cups</p>
                </div>
              </div>
              <div className="hm-tracker-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
                <button onClick={() => updateHydration(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <MinusCircle size={20} color={meta.accent} />
                </button>
                <span style={{ fontWeight: 700, minWidth: 40, textAlign: 'center' }}>{hydration}</span>
                <button onClick={() => updateHydration(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <PlusCircle size={20} color={meta.accent} />
                </button>
                <div className="hm-tracker-right">
                  <div className="hm-tracker-bar-bg">
                    <div className="hm-tracker-bar-fill" style={{ width: `${waterProgress}%`, background: meta.accent }} />
                  </div>
                  <span className="hm-tracker-pct" style={{ color: meta.accent }}>{waterProgress}%</span>
                </div>
              </div>
            </div>

            {/* Sleep */}
            <div className="hm-tracker-row">
              <div className="hm-tracker-left">
                <span className="hm-tracker-icon">🌙</span>
                <div>
                  <p className="hm-tracker-label">Sleep</p>
                  <p className="hm-tracker-meta">{sleep}h · {sleepLabel}</p>
                </div>
              </div>
              <div className="hm-tracker-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
                <button onClick={() => updateSleep(-0.5)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <MinusCircle size={20} color={meta.accent} />
                </button>
                <span style={{ fontWeight: 700, minWidth: 40, textAlign: 'center' }}>{sleep}h</span>
                <button onClick={() => updateSleep(0.5)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <PlusCircle size={20} color={meta.accent} />
                </button>
                <div className="hm-tracker-right">
                  <div className="hm-tracker-bar-bg">
                    <div className="hm-tracker-bar-fill" style={{ width: `${sleepProgress}%`, background: meta.accent }} />
                  </div>
                  <span className="hm-tracker-pct" style={{ color: meta.accent }}>{sleepProgress}%</span>
                </div>
              </div>
            </div>

            {/* Baby Kicks (pregnant only) */}
            {journeyType === 'pregnant' && (
              <div className="hm-tracker-row">
                <div className="hm-tracker-left">
                  <span className="hm-tracker-icon">🦶</span>
                  <div>
                    <p className="hm-tracker-label">Baby Kicks</p>
                    <p className="hm-tracker-meta">{kicks}/{targets.KICKS} kicks</p>
                  </div>
                </div>
                <div className="hm-tracker-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
                  <button onClick={() => updateKicks(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                    <MinusCircle size={20} color={meta.accent} />
                  </button>
                  <span style={{ fontWeight: 700, minWidth: 40, textAlign: 'center' }}>{kicks}</span>
                  <button onClick={() => updateKicks(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                    <PlusCircle size={20} color={meta.accent} />
                  </button>
                  <div className="hm-tracker-right">
                    <div className="hm-tracker-bar-bg">
                      <div className="hm-tracker-bar-fill" style={{ width: `${kicksProgress}%`, background: meta.accent }} />
                    </div>
                    <span className="hm-tracker-pct" style={{ color: meta.accent }}>{kicksProgress}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Steps */}
            <div className="hm-tracker-row">
              <div className="hm-tracker-left">
                <span className="hm-tracker-icon">👣</span>
                <div>
                  <p className="hm-tracker-label">Steps</p>
                  <p className="hm-tracker-meta">{steps.toLocaleString()}/{targets.STEPS.toLocaleString()} steps</p>
                </div>
              </div>
              <div className="hm-tracker-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
                <button onClick={() => updateSteps(-500)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <MinusCircle size={20} color={meta.accent} />
                </button>
                <span style={{ fontWeight: 700, minWidth: 40, textAlign: 'center' }}>{steps.toLocaleString()}</span>
                <button onClick={() => updateSteps(500)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <PlusCircle size={20} color={meta.accent} />
                </button>
                <div className="hm-tracker-right">
                  <div className="hm-tracker-bar-bg">
                    <div className="hm-tracker-bar-fill" style={{ width: `${stepsProgress}%`, background: meta.accent }} />
                  </div>
                  <span className="hm-tracker-pct" style={{ color: meta.accent }}>{stepsProgress}%</span>
                </div>
              </div>
            </div>

            {/* Weight Progress */}
            <div className="hm-tracker-row">
              <div className="hm-tracker-left">
                <span className="hm-tracker-icon">⚖️</span>
                <div>
                  <p className="hm-tracker-label">Weight Progress</p>
                  <p className="hm-tracker-meta">
                    {weight ? `${weight} kg` : 'No data'}{weightGoals.startWeight ? ` · Started: ${weightGoals.startWeight} kg` : ' · Set goals'}
                  </p>
                </div>
              </div>
              <div className="hm-tracker-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
                <button
                  onClick={() => setShowWeightModal(true)}
                  style={{ background: meta.accent, color: '#fff', border: 'none', borderRadius: 20, padding: '4px 12px', cursor: 'pointer', fontSize: 'var(--fs-2xs)' }}
                >
                  {weight ? 'Update' : 'Add'}
                </button>
                <div className="hm-tracker-right">
                  <div className="hm-tracker-bar-bg">
                    <div className="hm-tracker-bar-fill" style={{ width: `${weightProgress}%`, background: meta.accent }} />
                  </div>
                  <span className="hm-tracker-pct" style={{ color: meta.accent }}>{weightProgress}%</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* DAILY CHECKLIST */}
        <div className="hm-card hm-checklist-card">
          <div className="hm-checklist-header">
            <p className="hm-card-label" style={{ margin: 0 }}>MY DAILY TASKS</p>
            <div style={{ display: 'flex', gap: 'var(--gap-sm)', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="hm-checklist-pct" style={{ color: meta.accent }}>{pct}%</span>
              <button onClick={() => setShowAddTask(!showAddTask)} className="hm-add-task-btn" style={{ color: meta.accent }}>
                <Plus size={20} />
              </button>
            </div>
          </div>

          {showAddTask && (
            <div className="hm-add-task-form" style={{ marginBottom: 'var(--sp-3)' }}>
              <input
                type="text"
                value={newTaskInput}
                onChange={e => setNewTaskInput(e.target.value)}
                placeholder="e.g., Take prenatal vitamin, Walk 30 min, Log symptoms..."
                onKeyPress={e => e.key === 'Enter' && addTask()}
                className="hm-task-input"
                style={{ width: '100%', padding: 'var(--sp-2)', marginBottom: 'var(--sp-2)', borderRadius: 'var(--r)', border: '1px solid var(--border)' }}
              />
              <button onClick={addTask} style={{ padding: 'var(--sp-1) var(--sp-3)', background: meta.accent, color: '#fff', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer' }}>
                Add Task
              </button>
            </div>
          )}

          <div className="routine-box">
            <div className="hm-checklist-bar-bg">
              <div className="hm-checklist-bar-fill" style={{ width: `${pct}%`, background: meta.accent }} />
            </div>
            {checklist.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--sp-4)', color: 'var(--mt)' }}>
                <p style={{ fontSize: 'var(--fs-sm)' }}>No tasks yet</p>
                <p style={{ fontSize: 'var(--fs-xs)' }}>Tap + to add your first daily task</p>
              </div>
            ) : (
              checklist.map(task => (
                <ChecklistItem
                  key={task.id} id={task.id} label={task.label}
                  done={task.done} accent={meta.accent}
                  onToggle={toggleCheck} onDelete={deleteTask}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* AI INSIGHT */}
      <div className="hm-card" style={{ background: 'linear-gradient(135deg, var(--lvl), #F8F6FE)' }}>
        <p className="hm-card-label">✨ YOUR INSIGHT</p>
        <div style={{ display: 'flex', gap: 'var(--gap-md)', alignItems: 'flex-start' }}>
          <span style={{ fontSize: 32 }}>🤖</span>
          <div>
            <p style={{ fontWeight: 700, marginBottom: 4 }}>{aiInsight.title}</p>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--md)' }}>{aiInsight.body}</p>
          </div>
        </div>
      </div>

      {/* APPOINTMENTS */}
      <div className="hm-card">
        <p className="hm-card-label">APPOINTMENTS</p>

        {nextAppointment && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--gap-md)',
            background: meta.accentSoft, borderRadius: 'var(--r)',
            padding: 'var(--sp-2) var(--sp-3)', marginBottom: 'var(--sp-3)',
          }}>
            <span style={{ fontSize: 22 }}>📅</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: meta.accent }}>
                {nextAppointment.diffDays === 0 ? 'Today' : nextAppointment.diffDays === 1 ? 'Tomorrow' : `In ${nextAppointment.diffDays} days`}
              </p>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)' }}>
                {nextAppointment.title || nextAppointment.type || 'Appointment'}
                {nextAppointment.location ? ` · ${nextAppointment.location}` : ''}
              </p>
            </div>
            <div style={{ background: meta.accent, color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 'var(--fs-2xs)', fontWeight: 700, whiteSpace: 'nowrap' }}>
              {nextAppointment.diffDays === 0 ? 'Today' : `${nextAppointment.diffDays}d`}
            </div>
          </div>
        )}

        {aptList.length > 0 ? (
          aptList.map((a, i) => (
            <div key={i} className="hm-apt-row">
              <div className="hm-apt-icon" style={{ background: meta.accentSoft }}>
                <span>🏥</span>
              </div>
              <div className="hm-apt-info">
                <p className="hm-apt-title">{a.title || a.type || 'Appointment'}</p>
                <p className="hm-apt-meta">{a.date || a.datetime || a.appointmentDate}{a.location ? ` · ${a.location}` : ''}</p>
              </div>
            </div>
          ))
        ) : (
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--mt)', textAlign: 'center', padding: 'var(--sp-4) 0' }}>
            No appointments scheduled
          </p>
        )}

        {appointments.length > 2 && (
          <button
            onClick={() => setShowAllApt(!showAllApt)}
            style={{ width: '100%', marginTop: 'var(--sp-2)', background: 'none', border: 'none', color: meta.accent, fontSize: 'var(--fs-sm)', cursor: 'pointer' }}
          >
            {showAllApt ? 'Show less' : `Show all ${appointments.length} appointments`}
          </button>
        )}
      </div>
    </div>
  );
}