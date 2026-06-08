import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertTriangle, ChevronRight, Hospital, CheckCircle2, Circle, Plus, Trash2, PlusCircle, MinusCircle } from 'lucide-react';
import { useApp } from '../../context/useApp';
import CalendarStrip from '../../components/ui/CalendarStrip';
import GlowCard from '../../components/GlowCard';
import EmergencyRedFlags from '../../components/EmergencyRedFlags';
import { HOME_CONFIG, JOURNEY_META } from '../../data/homeConfig';
import './Home.css';

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
      {onClick && (
        <ChevronRight size={16} color={accent} className="hm-stat-arrow" />
      )}
    </div>
  </div>
));

// NEW: Dedicated CycleStatCard for cycle tracker with different class names
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
      {onClick && (
        <ChevronRight size={16} color={accent} className="hm-cycle-stat-arrow" />
      )}
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

const MOODS = [
  { emoji: '😌', label: 'Calm' },
  { emoji: '😄', label: 'Happy' },
  { emoji: '😕', label: 'Low' },
  { emoji: '😰', label: 'Anxious' },
];

// ---- DAILY TIPS by journey type + week ranges ----
const DAILY_TIPS = {
  pregnant: [
    { weeks: [1, 12], tips: [
      'Folic acid in the first trimester helps prevent neural tube defects. Take it daily.',
      'Nausea often peaks at week 8-10. Small, frequent meals with ginger can help.',
      'Your baby\'s heart starts beating around week 6 — tiny but mighty.',
      'Stay hydrated — aim for 8-10 cups of water daily to support amniotic fluid.',
      'Light walking for 20 minutes a day is safe and great for circulation.',
    ]},
    { weeks: [13, 27], tips: [
      'You\'re in the second trimester — many women feel their energy return now.',
      'Baby can hear your voice from around week 18. Talk, sing, read out loud.',
      'Iron-rich foods like spinach, lentils, and egusi help prevent anaemia.',
      'Kick counting can start from around week 18-20. Track in the app daily.',
      'Heartburn is common now. Try smaller meals and avoid lying down right after eating.',
    ]},
    { weeks: [28, 42], tips: [
      'Baby is gaining weight rapidly. Make sure you\'re eating enough protein.',
      'Swelling in feet and ankles is normal — elevate when resting.',
      'Pack your hospital bag by week 36. Don\'t leave it to the last minute.',
      'Braxton Hicks contractions are practice contractions — not labour yet.',
      'Sleep on your left side to improve blood flow to baby and kidneys.',
    ]},
  ],
  mom: [
    'Sleep deprivation is real. Ask for help — rest is recovery.',
    'Drink water every time you feed. Breastfeeding increases your fluid needs.',
    'Edinburgh Postnatal Depression Scale (EPDS) — if you\'re struggling, Bloom can help.',
    'Your body took 9 months to change. Give it grace to heal.',
    'Skin-to-skin contact with baby boosts bonding hormones for both of you.',
  ],
  conceive: [
    'Ovulation typically happens 14 days before your next period, not 14 days after your last.',
    'BBT rises 0.2°C after ovulation — track it first thing every morning.',
    'Folic acid is recommended for all women trying to conceive, even before a positive test.',
    'LH surges 24-36 hours before ovulation — the best window for conception.',
    'Stress can delay ovulation. Rest and gentle exercise support hormonal balance.',
  ],
  ivf: [
    'Take medications at the same time each day — consistency matters for follicle stimulation.',
    'Stay hydrated during stimulation to reduce OHSS risk.',
    'Rest after transfer but light walking is fine — you don\'t need to be bedridden.',
    'Progesterone support continues after transfer — don\'t skip doses.',
    'The two-week wait is hard. Lean on your support system and Bloom.',
  ],
  menopause: [
    'Weight-bearing exercise helps maintain bone density during menopause.',
    'Phytoestrogens in foods like tofu, flaxseed, and chickpeas may ease some symptoms.',
    'Hot flushes can be triggered by caffeine, alcohol, and spicy foods.',
    'Sleep disruption is common — try cooling your room and avoiding screens before bed.',
    'HRT is an option worth discussing with your GP if symptoms are affecting quality of life.',
  ],
};

function getDailyTip(journeyType, currentWeek) {
  const dayIndex = new Date().getDate() % 5;

  if (journeyType === 'pregnant' && currentWeek) {
    const group = DAILY_TIPS.pregnant.find(g => currentWeek >= g.weeks[0] && currentWeek <= g.weeks[1]);
    if (group) return group.tips[dayIndex % group.tips.length];
  }

  const tips = DAILY_TIPS[journeyType];
  if (!tips) return null;
  return tips[dayIndex % tips.length];
}

// ---- SYMPTOM QUICK-LOG ----
const SYMPTOMS_BY_JOURNEY = {
  pregnant: ['Nausea', 'Fatigue', 'Cramps', 'Swelling', 'Heartburn', 'Headache'],
  mom: ['Fatigue', 'Soreness', 'Low mood', 'Engorgement', 'Headache'],
  conceive: ['Cramping', 'Bloating', 'Spotting', 'Fatigue', 'Mood swings'],
  ivf: ['Bloating', 'Cramping', 'Injection site', 'Fatigue', 'Nausea'],
  menopause: ['Hot flush', 'Night sweats', 'Brain fog', 'Joint pain', 'Low mood'],
};

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

  const [vitals, setVitals] = useState(() => {
    try {
      const history = JSON.parse(localStorage.getItem('vitalsHistory') || '[]');
      return history[0] || {};
    } catch { return {}; }
  });

  const [weightGoals, setWeightGoals] = useState(() => {
    try {
      const goals = JSON.parse(localStorage.getItem('weightGoals') || '{}');
      return {
        startWeight: goals.startWeight || null,
        targetWeight: goals.targetWeight || null,
        prePregnancyWeight: goals.prePregnancyWeight || null
      };
    } catch { return { startWeight: null, targetWeight: null, prePregnancyWeight: null }; }
  });

  const [hydration, setHydration] = useState(0);
  const [kicks, setKicks] = useState(0);
  const [steps, setSteps] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [weight, setWeight] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [tipDismissed, setTipDismissed] = useState(() => {
    try {
      const d = localStorage.getItem('tipDismissedDate');
      return d === new Date().toDateString();
    } catch { return false; }
  });

  const [activeSymptoms, setActiveSymptoms] = useState(() => {
    try {
      const today = new Date().toDateString();
      const saved = JSON.parse(localStorage.getItem('symptomLog') || '{}');
      return saved.date === today ? (saved.symptoms || []) : [];
    } catch { return []; }
  });

  const [mood, setMood] = useState(() => {
    try {
      const saved = localStorage.getItem('lastMood');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [checklist, setChecklist] = useState(() => {
    try {
      const savedDate = localStorage.getItem('checklistDate');
      const today = new Date().toDateString();
      const saved = localStorage.getItem(`dailyTasks_${journeyType}`);
      if (savedDate === today && saved) return JSON.parse(saved);
      if (savedDate !== today && saved) {
        return JSON.parse(saved).map(task => ({ ...task, done: false }));
      }
      localStorage.setItem('checklistDate', today);
    } catch {}
    return [];
  });

  const [showAllApt, setShowAllApt] = useState(false);

  const [moodStreak, setMoodStreak] = useState(() => {
    try {
      const streak = parseInt(localStorage.getItem('moodStreak') || '0');
      return isNaN(streak) ? 0 : streak;
    } catch { return 0; }
  });

  // Load all data
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
        const todaySteps = stepLogs.find(l => l.date === today);
        setSteps(todaySteps ? todaySteps.steps : 0);

        const sleepLogs = JSON.parse(localStorage.getItem('sleepLogs') || '[]');
        const todaySleep = sleepLogs.find(l => l.date === today);
        setSleep(todaySleep ? todaySleep.hours : 0);

        const vitalsHistory = JSON.parse(localStorage.getItem('vitalsHistory') || '[]');
        setWeight(vitalsHistory[0]?.weight || null);
        setVitals(vitalsHistory[0] || {});

        setAppointments(JSON.parse(localStorage.getItem('appointments') || '[]'));
        setHospitals(JSON.parse(localStorage.getItem('nearbyHospitals') || '[]'));
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
    try { localStorage.setItem(`dailyTasks_${journeyType}`, JSON.stringify(checklist)); } catch {}
  }, [checklist, journeyType]);

  const bpSys = vitals.bpSys;
  const bpDia = vitals.bpDia;
  const bleeding = vitals.bleeding || 'none';
  const fetalMovement = vitals.fetalMovement || 'normal';

  const hasEmergency = (bpSys && bpSys >= 160) ||
    (bpDia && bpDia >= 110) ||
    (currentWeek && currentWeek >= 24 && fetalMovement === 'reduced') ||
    bleeding === 'heavy';

  // ---- NEXT APPOINTMENT ----
  const nextAppointment = useMemo(() => {
    if (!appointments.length) return null;
    const now = new Date();
    const upcoming = appointments
      .map(a => ({ ...a, _date: new Date(a.date || a.datetime || a.appointmentDate) }))
      .filter(a => !isNaN(a._date) && a._date >= now)
      .sort((a, b) => a._date - b._date);
    if (!upcoming.length) return null;
    const next = upcoming[0];
    const diffMs = next._date - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return { ...next, diffDays };
  }, [appointments]);

  // Task management
  const addTask = useCallback(() => {
    if (!newTaskInput.trim()) return;
    setChecklist(prev => [...prev, {
      id: Date.now().toString(),
      label: newTaskInput.trim(),
      done: false,
      createdAt: new Date().toISOString()
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

  // ---- TRACKER UPDATERS ----
  const updateHydration = useCallback((increment) => {
    const today = new Date().toDateString();
    const newValue = Math.max(0, hydration + increment);
    setHydration(newValue);
    const logs = JSON.parse(localStorage.getItem('hydrationLogs') || '[]');
    const idx = logs.findIndex(l => l.date === today);
    if (idx >= 0) logs[idx].cups = newValue;
    else logs.push({ date: today, cups: newValue });
    localStorage.setItem('hydrationLogs', JSON.stringify(logs));
    window.dispatchEvent(new Event('hydrationUpdated'));
  }, [hydration]);

  const updateSteps = useCallback((increment) => {
    const today = new Date().toDateString();
    const newValue = Math.max(0, steps + increment);
    setSteps(newValue);
    const logs = JSON.parse(localStorage.getItem('stepLogs') || '[]');
    const idx = logs.findIndex(l => l.date === today);
    if (idx >= 0) logs[idx].steps = newValue;
    else logs.push({ date: today, steps: newValue });
    localStorage.setItem('stepLogs', JSON.stringify(logs));
    window.dispatchEvent(new Event('stepsUpdated'));
  }, [steps]);

  const updateKicks = useCallback((increment) => {
    const today = new Date().toDateString();
    const newValue = Math.max(0, kicks + increment);
    setKicks(newValue);
    const history = JSON.parse(localStorage.getItem('kickHistory') || '[]');
    const idx = history.findIndex(k => k.date === today);
    if (idx >= 0) history[idx].count = newValue;
    else history.push({ date: today, count: newValue, timestamp: new Date().toISOString() });
    localStorage.setItem('kickHistory', JSON.stringify(history));
    window.dispatchEvent(new Event('kicksUpdated'));
  }, [kicks]);

  const updateSleep = useCallback((increment) => {
    const today = new Date().toDateString();
    const newValue = Math.max(0, Math.min(24, sleep + increment));
    setSleep(newValue);
    const logs = JSON.parse(localStorage.getItem('sleepLogs') || '[]');
    const idx = logs.findIndex(l => l.date === today);
    if (idx >= 0) logs[idx].hours = newValue;
    else logs.push({ date: today, hours: newValue });
    localStorage.setItem('sleepLogs', JSON.stringify(logs));
    window.dispatchEvent(new Event('sleepUpdated'));
  }, [sleep]);

  const updateWeight = useCallback(() => {
    const newWeight = prompt('Enter your current weight (kg):', weight || '');
    if (newWeight && !isNaN(parseFloat(newWeight))) {
      const weightNum = parseFloat(newWeight);
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
    }
  }, [weight]);

  // ---- SYMPTOM TOGGLE ----
  const toggleSymptom = useCallback((symptom) => {
    setActiveSymptoms(prev => {
      const next = prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom];
      localStorage.setItem('symptomLog', JSON.stringify({ date: new Date().toDateString(), symptoms: next }));
      return next;
    });
  }, []);

  const dismissTip = useCallback(() => {
    setTipDismissed(true);
    localStorage.setItem('tipDismissedDate', new Date().toDateString());
  }, []);

  // Progress calculations
  const weightProgress = useMemo(() => {
    if (!weight || !weightGoals.startWeight) return 0;
    if (journeyType === 'pregnant') {
      if (!weightGoals.prePregnancyWeight) return 0;
      const expectedGain = currentWeek <= 12 ? 1.5 : currentWeek <= 28 ? 6.5 : 11.5;
      const gained = weight - weightGoals.prePregnancyWeight;
      return Math.min(100, Math.max(0, Math.round((gained / expectedGain) * 100)));
    }
    if (weightGoals.targetWeight) {
      const totalChange = weightGoals.targetWeight - weightGoals.startWeight;
      const changed = weight - weightGoals.startWeight;
      return Math.min(100, Math.max(0, Math.round((changed / totalChange) * 100)));
    }
    return 0;
  }, [weight, weightGoals, journeyType, currentWeek]);

  const hydrationTarget = 8;
  const waterProgress = Math.min(100, Math.round((hydration / hydrationTarget) * 100));
  const kicksTarget = 20;
  const kicksProgress = Math.min(100, Math.round((kicks / kicksTarget) * 100));
  const stepsTarget = 8000;
  const stepsProgress = Math.min(100, Math.round((steps / stepsTarget) * 100));
  const sleepTarget = 8;
  const sleepProgress = Math.min(100, Math.round((sleep / sleepTarget) * 100));
  const sleepLabel = sleep < 5 ? 'Rest more' : sleep < 7 ? 'Getting there' : sleep >= 8 ? 'Well rested' : 'Good';

  const aiInsight = useMemo(() => {
    const completedTasks = checklist.filter(c => c.done).length;
    const totalTasks = checklist.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    if (journeyType === 'pregnant') {
      if (!currentWeek) return { title: `${userName || 'Welcome'}! Complete Your Setup`, body: 'Add your daily tasks to get personalised insights for your pregnancy journey.' };
      if (totalTasks === 0) return { title: `Week ${currentWeek} - Let's Get Started`, body: 'Tap + to add your first daily task. Track what matters most to you during pregnancy.' };
      if (completionRate === 100) return { title: `Week ${currentWeek} - Perfect Day! 🎉`, body: `You crushed all ${totalTasks} tasks today. Your consistency is building healthy habits for you and baby.` };
      if (completionRate >= 50) return { title: `Week ${currentWeek} - Great Progress!`, body: `You're ${Math.round(completionRate)}% through your tasks. ${totalTasks - completedTasks} more to go.` };
      if (completionRate > 0) return { title: `Week ${currentWeek} - Good Start`, body: `You've completed ${completedTasks} task${completedTasks !== 1 ? 's' : ''}. Keep building momentum.` };
      return { title: `Week ${currentWeek} - ${trimester === 1 ? 'First' : trimester === 2 ? 'Second' : 'Third'} Trimester`, body: `You have ${totalTasks} tasks today. Start with the most important one for you and baby.` };
    }
    if (journeyType === 'mom') return { title: babyAgeWeeks ? `Week ${babyAgeWeeks} Postpartum` : 'Welcome, Mama!', body: totalTasks === 0 ? 'Add daily tasks to track your recovery and baby care routine.' : completionRate > 0 ? `You've completed ${completedTasks} of ${totalTasks} tasks. Remember that rest is just as important.` : `Start your day by completing your ${totalTasks} tasks. Small wins add up, mama.` };
    if (journeyType === 'conceive') return { title: 'Track to Conceive', body: totalTasks === 0 ? 'Add daily tasks like tracking BBT, LH tests, or taking supplements.' : completionRate > 0 ? `Great job on ${completedTasks} tasks. Consistency is key for fertility tracking.` : `You have ${totalTasks} tasks today. Each one brings you closer to your goal.` };
    if (journeyType === 'ivf') return { title: 'IVF Strength', body: totalTasks === 0 ? 'Add daily tasks for medications, appointments, and self-care.' : completionRate === 100 ? "Perfect adherence today! You're building something beautiful." : `You've completed ${completedTasks}/${totalTasks} tasks. Stay consistent with your protocol.` };
    if (journeyType === 'menopause') return { title: 'Menopause Wellness', body: totalTasks === 0 ? 'Add tasks to track symptoms, exercise, and self-care.' : completionRate > 0 ? `${completedTasks} tasks done. Listen to your body and celebrate small wins.` : `Start with your ${totalTasks} tasks today. Small habits create big changes.` };
    return { title: `Welcome${userName ? `, ${userName}` : ''}!`, body: 'Add your daily tasks to track what matters most on your journey.' };
  }, [journeyType, currentWeek, trimester, babyAgeWeeks, checklist, userName]);

  const dailyTip = useMemo(() => getDailyTip(journeyType, currentWeek), [journeyType, currentWeek]);
  const journeySymptoms = SYMPTOMS_BY_JOURNEY[journeyType] || SYMPTOMS_BY_JOURNEY.pregnant;

  // ---- CYCLE STATS COMPUTED (conceive only) ----
  const cycleStats = useMemo(() => {
    if (journeyType !== 'conceive') return null;

    // Read BBT from vitals history
    const bbtEntry = (() => {
      try {
        const history = JSON.parse(localStorage.getItem('vitalsHistory') || '[]');
        return history[0]?.bbt || null;
      } catch { return null; }
    })();

    if (!lastPeriodStart) {
      return { 
        cycleDay: null, 
        ovulationIn: null, 
        fertileStart: null, 
        fertileEnd: null, 
        bbt: bbtEntry, 
        cycleLength: cycleLength || 28 
      };
    }

    const today = new Date();
    const periodStart = new Date(lastPeriodStart);
    const cycleDay = Math.floor((today - periodStart) / (1000 * 60 * 60 * 24)) + 1;
    const ovulationDay = Math.round((cycleLength || 28) - 14);
    const ovulationIn = ovulationDay - cycleDay;
    const fertileStart = ovulationDay - 5;
    const fertileEnd = ovulationDay + 1;
    const inFertileWindow = cycleDay >= fertileStart && cycleDay <= fertileEnd;

    return { 
      cycleDay, 
      ovulationIn, 
      fertileStart, 
      fertileEnd, 
      inFertileWindow, 
      bbt: bbtEntry, 
      cycleLength: cycleLength || 28 
    };
  }, [journeyType, lastPeriodStart, cycleLength]);

  return (
    <div className="hm-root">
      <EmergencyRedFlags
        bpSys={bpSys}
        bpDia={bpDia}
        bleeding={bleeding}
        fetalMovement={fetalMovement}
        week={currentWeek}
      />

      <div className="journey-container">
        <div className="hm-journey-badge" style={{ color: '#7C3AED', fontWeight: '700', padding: '20px' }}>
          <span>{meta.label}</span>
          {journeyType === 'pregnant' && currentWeek && trimester && (
            <span style={{ marginLeft: 8, fontSize: 'var(--fs-xs)' }}>
              Week {currentWeek} · {trimester}{trimester === 1 ? 'st' : trimester === 2 ? 'nd' : 'rd'} Trimester
            </span>
          )}
          {journeyType === 'mom' && babyAgeWeeks && (
            <span style={{ marginLeft: 8, fontSize: 'var(--fs-xs)' }}>Week {babyAgeWeeks} Postpartum</span>
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

        <div className="hm-hero-card">
          <div className="hm-hero-content">
            <h2 className="hm-hero-title">{cfg.heroTitle}</h2>
            <p className="hm-hero-body">{cfg.heroBody}</p>
          </div>
          <div className="hm-hero-illo">
            <img src={cfg.heroIllo} alt={meta.label} />
          </div>
        </div>
      </div>

      {hasEmergency && (
        <div className="hm-card" style={{ background: 'var(--rdl)', border: '2px solid var(--rd)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)' }}>
            <div style={{ fontSize: 32 }}>🚨</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 800, color: 'var(--rd)' }}>Emergency Care Needed</p>
              <button onClick={() => setShowSOS(true)} style={{ marginTop: 8, background: 'var(--rd)', color: '#fff', border: 'none', borderRadius: 20, padding: '6px 16px', cursor: 'pointer' }}>
                Call Emergency
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- DAILY TIP CARD ---- */}
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
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="hm-stats-row">
        <StatCard 
          icon="❤️" 
          label="Blood Pressure" 
          value={bpSys && bpDia ? `${bpSys}/${bpDia}` : '--'} 
          sub="mmHg" 
          accent={meta.accent}
          onClick={setTab}
          screenId="vitals"
        />
        <StatCard 
          icon="⚖️" 
          label="Weight" 
          value={weight ? `${weight} kg` : '--'} 
          sub="Current" 
          accent={meta.accent}
          onClick={setTab}
          screenId="body"
        />
        <StatCard 
          icon="🎯" 
          label="Weight Goal" 
          value={weightGoals.targetWeight ? `${weightGoals.targetWeight} kg` : 'Not set'} 
          sub="Target" 
          accent={meta.accent}
          onClick={setTab}
          screenId="body"
        />
        <StatCard 
          icon="🔥" 
          label="Mood Streak" 
          value={moodStreak} 
          sub="days" 
          accent={meta.accent}
          onClick={setTab}
          screenId="mental"
        />
      </div>

      {/* ---- CYCLE STATS CARD (conceive only) - USING CycleStatCard COMPONENT ---- */}
      {journeyType === 'conceive' && cycleStats && (
        <div className="hm-cycle-card" style={{ 
          background: cycleStats.inFertileWindow ? meta.accentSoft : undefined, 
          border: cycleStats.inFertileWindow ? `1px solid ${meta.accent}33` : undefined 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-3)' }}>
            <p className="hm-card-label" style={{ margin: 0 }}>CYCLE TRACKER</p>
            {cycleStats.inFertileWindow && (
              <span style={{ 
                background: meta.accent, 
                color: '#fff', 
                fontSize: 'var(--fs-2xs)', 
                fontWeight: 700, 
                borderRadius: 20, 
                padding: '2px 10px' 
              }}>
                🌟 FERTILE WINDOW
              </span>
            )}
          </div>
          <div className="hm-cycle-stats-row">
            <CycleStatCard
              icon="📅"
              label="Cycle Day"
              value={cycleStats.cycleDay != null ? `Day ${cycleStats.cycleDay}` : '--'}
              sub={`of ${cycleStats.cycleLength}d`}
              accent={meta.accent}
              onClick={setTab}
              screenId="ttc"
            />
            <CycleStatCard
              icon="🥚"
              label="Ovulation"
              value={
                cycleStats.ovulationIn == null ? '--'
                : cycleStats.ovulationIn === 0 ? 'Today'
                : cycleStats.ovulationIn < 0 ? `${Math.abs(cycleStats.ovulationIn)}d ago`
                : `In ${cycleStats.ovulationIn}d`
              }
              sub="Estimated"
              accent={meta.accent}
              onClick={setTab}
              screenId="ttc"
            />
            <CycleStatCard
              icon="🌡️"
              label="BBT"
              value={cycleStats.bbt ? `${cycleStats.bbt}°C` : '--'}
              sub="This morning"
              accent={meta.accent}
              onClick={setTab}
              screenId="body"
            />
            <CycleStatCard
              icon="💚"
              label="Fertile Window"
              value={cycleStats.fertileStart != null ? `D${cycleStats.fertileStart}–D${cycleStats.fertileEnd}` : '--'}
              sub={cycleStats.inFertileWindow ? 'Active now' : 'Days in cycle'}
              accent={meta.accent}
              onClick={setTab}
              screenId="ttc"
            />
          </div>
          {!lastPeriodStart && (
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', textAlign: 'center', marginTop: 'var(--sp-2)' }}>
              Log your last period date in Cycle tracker to activate this
            </p>
          )}
        </div>
      )}

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
            {mood.label} · {moodStreak} day streak 🔥
          </p>
        )}
      </div>

      {/* ---- SYMPTOM QUICK-LOG ---- */}
      <div className="hm-card">
        <p className="hm-card-label">TODAY'S SYMPTOMS</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-sm)', marginTop: 4 }}>
          {journeySymptoms.map(symptom => {
            const active = activeSymptoms.includes(symptom);
            return (
              <button
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: `1.5px solid ${active ? meta.accent : 'var(--border)'}`,
                  background: active ? meta.accentSoft : 'transparent',
                  color: active ? meta.accent : 'var(--mt)',
                  fontSize: 'var(--fs-xs)',
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {symptom}
              </button>
            );
          })}
        </div>
        {activeSymptoms.length > 0 && (
          <p style={{ fontSize: 'var(--fs-2xs)', color: 'var(--mt)', marginTop: 8 }}>
            {activeSymptoms.length} symptom{activeSymptoms.length !== 1 ? 's' : ''} logged today · Bloom AI has context
          </p>
        )}
        {activeSymptoms.length === 0 && (
          <p style={{ fontSize: 'var(--fs-2xs)', color: 'var(--mt)', marginTop: 8 }}>
            Tap to log how you're feeling today
          </p>
        )}
      </div>

      <div className="hm-card">
        <p className="hm-card-label">QUICK ACTIONS</p>
        <div className="hm-qa-grid">
          {cfg.quickActions.map(a => (
            <QuickAction key={a.id} emoji={a.emoji} label={a.label} onClick={() => a.id && setTab(a.id)} />
          ))}
        </div>
      </div>

      <div className="hm-two-col">
        <div className="hm-card hm-trackers-card">
          <p className="hm-card-label">TODAY'S TRACKERS</p>
          <div className="tracker-container">

            {/* Hydration */}
            <div className="hm-tracker-row">
              <div className="hm-tracker-left">
                <span className="hm-tracker-icon">💧</span>
                <div>
                  <p className="hm-tracker-label">Hydration</p>
                  <p className="hm-tracker-meta">{hydration}/8 cups · 8 cups target</p>
                </div>
              </div>
              <div className="hm-tracker-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
                <button onClick={() => updateHydration(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} aria-label="Decrease water by 1 cup">
                  <MinusCircle size={20} color={meta.accent} />
                </button>
                <span style={{ fontWeight: 700, minWidth: 40, textAlign: 'center' }}>{hydration}</span>
                <button onClick={() => updateHydration(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} aria-label="Increase water by 1 cup">
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
                  <p className="hm-tracker-meta">{sleep}h last night · {sleepLabel}</p>
                </div>
              </div>
              <div className="hm-tracker-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
                <button onClick={() => updateSleep(-0.5)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} aria-label="Decrease sleep by 30 min">
                  <MinusCircle size={20} color={meta.accent} />
                </button>
                <span style={{ fontWeight: 700, minWidth: 40, textAlign: 'center' }}>{sleep}h</span>
                <button onClick={() => updateSleep(0.5)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} aria-label="Increase sleep by 30 min">
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

            {/* Baby Kicks */}
            {journeyType === 'pregnant' && (
              <div className="hm-tracker-row">
                <div className="hm-tracker-left">
                  <span className="hm-tracker-icon">🦶</span>
                  <div>
                    <p className="hm-tracker-label">Baby Kicks</p>
                    <p className="hm-tracker-meta">{kicks}/20 kicks · 20 kicks target</p>
                  </div>
                </div>
                <div className="hm-tracker-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
                  <button onClick={() => updateKicks(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} aria-label="Decrease kick count by 1">
                    <MinusCircle size={20} color={meta.accent} />
                  </button>
                  <span style={{ fontWeight: 700, minWidth: 40, textAlign: 'center' }}>{kicks}</span>
                  <button onClick={() => updateKicks(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} aria-label="Increase kick count by 1">
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
                  <p className="hm-tracker-meta">{steps.toLocaleString()}/8,000 steps · 8,000 target</p>
                </div>
              </div>
              <div className="hm-tracker-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
                <button onClick={() => updateSteps(-500)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} aria-label="Decrease steps by 500">
                  <MinusCircle size={20} color={meta.accent} />
                </button>
                <span style={{ fontWeight: 700, minWidth: 60, textAlign: 'center' }}>{steps.toLocaleString()}</span>
                <button onClick={() => updateSteps(500)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} aria-label="Increase steps by 500">
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

            {/* Weight */}
            <div className="hm-tracker-row">
              <div className="hm-tracker-left">
                <span className="hm-tracker-icon">⚖️</span>
                <div>
                  <p className="hm-tracker-label">Weight Progress</p>
                  <p className="hm-tracker-meta">
                    {weight ? `${weight} kg` : 'No data'} ·
                    {weightGoals.startWeight ? ` Started: ${weightGoals.startWeight} kg` : ' Set goals'}
                  </p>
                </div>
              </div>
              <div className="hm-tracker-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
                <button onClick={updateWeight} style={{ background: meta.accent, color: '#fff', border: 'none', borderRadius: 20, padding: '4px 12px', cursor: 'pointer', fontSize: 'var(--fs-2xs)' }}>
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

        <div className="hm-card hm-checklist-card">
          <div className="hm-checklist-header">
            <p className="hm-card-label" style={{ margin: 0 }}>MY DAILY TASKS</p>
            <div style={{ display: 'flex', gap: 'var(--gap-sm)', alignItems: 'center' }}>
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
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder="e.g., Take prenatal vitamin, Walk 30 min, Log symptoms..."
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
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
                  key={task.id}
                  id={task.id}
                  label={task.label}
                  done={task.done}
                  accent={meta.accent}
                  onToggle={toggleCheck}
                  onDelete={deleteTask}
                />
              ))
            )}
          </div>
        </div>
      </div>

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

      {/* ---- APPOINTMENTS with next-up countdown ---- */}
      <div className="hm-card">
        <p className="hm-card-label">APPOINTMENTS</p>

        {nextAppointment && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--gap-md)',
            background: meta.accentSoft,
            borderRadius: 'var(--r)',
            padding: 'var(--sp-2) var(--sp-3)',
            marginBottom: 'var(--sp-3)',
          }}>
            <span style={{ fontSize: 22 }}>📅</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: meta.accent }}>
                {nextAppointment.diffDays === 0 ? 'Today' : nextAppointment.diffDays === 1 ? 'Tomorrow' : `In ${nextAppointment.diffDays} days`}
              </p>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)' }}>
                {nextAppointment.title || nextAppointment.type || 'Appointment'}{nextAppointment.location ? ` · ${nextAppointment.location}` : ''}
              </p>
            </div>
            <div style={{
              background: meta.accent,
              color: '#fff',
              borderRadius: 20,
              padding: '2px 10px',
              fontSize: 'var(--fs-2xs)',
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}>
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