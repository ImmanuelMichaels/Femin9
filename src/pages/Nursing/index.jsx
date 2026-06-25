import { useState, useEffect, useRef } from 'react';
import { SectionTitle } from '../../components/ui';
import { useApp } from '../../context/useApp';
import { lsGet, lsSet } from '../../utils/storage';
import './Nursing.css';

/* ── Helpers ── */
const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/* ── Poop colour data ── */
const POOP_COLORS = [
  { id: 'mustard',  label: 'Mustard Yellow', emoji: '🟡', status: 'normal',  msg: 'Normal for breastfed babies. Seedy texture is expected.' },
  { id: 'tan',      label: 'Tan / Beige',    emoji: '🟤', status: 'normal',  msg: 'Normal for formula-fed babies.' },
  { id: 'green',    label: 'Green',           emoji: '🟢', status: 'watch',   msg: 'Can indicate foremilk/hindmilk imbalance or fast gut transit. Monitor.' },
  { id: 'orange',   label: 'Orange',          emoji: '🟠', status: 'normal',  msg: 'Normal variation, often diet-related.' },
  { id: 'red',      label: 'Red / Blood',     emoji: '🔴', status: 'urgent',  msg: 'Contact your GP or midwife today. Could indicate allergy or tear.' },
  { id: 'black',    label: 'Black (after day 3)', emoji: '⚫', status: 'urgent', msg: 'Black stool after day 3 needs immediate medical review.' },
  { id: 'white',    label: 'White / Grey',    emoji: '⚪', status: 'urgent',  msg: 'Seek medical attention urgently — may indicate liver issue.' },
  { id: 'meconium', label: 'Dark Green/Black (day 1–2)', emoji: '🫙', status: 'normal', msg: 'Meconium — completely normal in first 48 hours.' },
];

/* ── Outfit suggestions ── */
const OUTFITS = [
  {
    occasion: 'Daily comfort',
    items: ['Wrap dress (easy access for feeds)', 'Nursing tank top layered under open shirt', 'High-waist leggings'],
    tip: 'Two-layer method: lift top layer up, pull bottom layer down — no full exposure.',
    emoji: '👗',
  },
  {
    occasion: 'Going out',
    items: ['Button-front midi dress', 'Blazer over nursing cami', 'Dark jeans + flowy blouse'],
    tip: 'Pattern and print tops hide any milk leaks discreetly.',
    emoji: '✨',
  },
  {
    occasion: 'Night feeds',
    items: ['Nursing sleep bra + soft shorts', 'Zip-front hoodie', 'Loose cotton PJ set'],
    tip: 'Keep a muslin and change of top by your feeding chair for quick swaps.',
    emoji: '🌙',
  },
  {
    occasion: 'Postpartum body',
    items: ['Empire waist tops (hide tummy)', 'Ruched sides (adjusts with body)', 'A-line skirts'],
    tip: "Your body is still changing. Shop second-hand or rent — don't invest heavily yet.",
    emoji: '💐',
  },
];

/* ── Sleep tips ── */
const SLEEP_TIPS = [
  'Sleep when baby sleeps — even 20 minutes counts.',
  'Ask your partner to take one night feed with expressed milk.',
  'White noise helps extend sleep cycles for newborns.',
  'Put baby down drowsy but awake from 6–8 weeks to build self-settling.',
  'Room temperature 16–20°C is optimal for safe baby sleep.',
];

/* ── AI Sleep/Wake Predictor ── */
const predictNextSleep = (sleepLog, babyWeeks) => {
  if (sleepLog.length < 2) {
    return {
      nextSleepWindow: 'No enough data yet — keep logging sleep for AI predictions',
      recommendedWakeWindow: babyWeeks < 4 ? '45–60 min' : babyWeeks < 8 ? '60–90 min' : '90–120 min',
      confidence: 'low'
    };
  }
  
  const avgSleepDuration = sleepLog.slice(0, 5).reduce((sum, s) => sum + s.duration, 0) / Math.min(sleepLog.length, 5);
  const avgMinutes = Math.round(avgSleepDuration / 60);
  
  let wakeWindow;
  if (babyWeeks < 4) wakeWindow = '45–60 min';
  else if (babyWeeks < 8) wakeWindow = '60–90 min';
  else if (babyWeeks < 16) wakeWindow = '75–105 min';
  else wakeWindow = '90–120 min';
  
  const nextSleepIn = avgMinutes > 45 ? '20–30 min' : '30–45 min';
  
  return {
    nextSleepWindow: `Based on ${Math.min(sleepLog.length, 5)} sessions, baby typically sleeps ${avgMinutes} minutes. Next sleep likely in ${nextSleepIn}.`,
    recommendedWakeWindow: wakeWindow,
    confidence: sleepLog.length > 10 ? 'high' : sleepLog.length > 5 ? 'medium' : 'low'
  };
};

export default function Nursing() {
  const { babyAgeDays } = useApp();
  const babyWeeks = babyAgeDays ? Math.floor(babyAgeDays / 7) : 8;

  /* ── Feed timer ── */
  const [feedSide, setFeedSide]     = useState('left');
  const [feedActive, setFeedActive] = useState(false);
  const [feedSecs, setFeedSecs]     = useState(0);
  const [feedLog, setFeedLog]       = useState(() => lsGet('nursingFeedLog', []));
  const feedRef = useRef(null);

  useEffect(() => {
    if (feedActive) {
      feedRef.current = setInterval(() => setFeedSecs(s => s + 1), 1000);
    } else {
      clearInterval(feedRef.current);
    }
    return () => clearInterval(feedRef.current);
  }, [feedActive]);

  const startFeed = side => { setFeedSide(side); setFeedSecs(0); setFeedActive(true); };
  const stopFeed  = () => {
    setFeedActive(false);
    if (feedSecs > 10) {
      const entry = { side: feedSide, duration: feedSecs, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), id: Date.now() };
      const updated = [entry, ...feedLog].slice(0, 10);
      setFeedLog(updated);
      lsSet('nursingFeedLog', updated);
    }
    setFeedSecs(0);
  };

  const lastFeed    = feedLog[0];
  const todayFeeds  = feedLog.filter(f => new Date(f.id).toDateString() === new Date().toDateString()).length;
  const nextSide    = lastFeed?.side === 'left' ? 'RIGHT' : 'LEFT';

  /* ── Pump timer ── */
  const [pumpActive, setPumpActive] = useState(false);
  const [pumpSecs, setPumpSecs]     = useState(0);
  const [pumpLog, setPumpLog]       = useState(() => lsGet('nursingPumpLog', []));
  const pumpRef = useRef(null);

  useEffect(() => {
    if (pumpActive) {
      pumpRef.current = setInterval(() => setPumpSecs(s => s + 1), 1000);
    } else {
      clearInterval(pumpRef.current);
    }
    return () => clearInterval(pumpRef.current);
  }, [pumpActive]);

  const stopPump = () => {
    setPumpActive(false);
    if (pumpSecs > 10) {
      const entry = { duration: pumpSecs, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), id: Date.now() };
      const updated = [entry, ...pumpLog].slice(0, 10);
      setPumpLog(updated);
      lsSet('nursingPumpLog', updated);
    }
    setPumpSecs(0);
  };

  /* ── Poop scanner ── */
  const [poopSelected, setPoopSelected] = useState(null);
  const [poopLogged, setPoopLogged]     = useState(false);

  const logPoop = () => {
    if (!poopSelected) return;
    setPoopLogged(true);
    setTimeout(() => setPoopLogged(false), 3000);
  };

  /* ── Sleep pattern ── */
  const [sleepActive, setSleepActive]   = useState(false);
  const [sleepStart, setSleepStart]     = useState(null);
  const [sleepSecs, setSleepSecs]       = useState(0);
  const [sleepLog, setSleepLog]         = useState(() => lsGet('nursingSleepLog', []));
  const sleepRef = useRef(null);

  useEffect(() => {
    if (sleepActive) {
      sleepRef.current = setInterval(() => setSleepSecs(s => s + 1), 1000);
    } else {
      clearInterval(sleepRef.current);
    }
    return () => clearInterval(sleepRef.current);
  }, [sleepActive]);

  const startSleep = () => { setSleepActive(true); setSleepStart(Date.now()); setSleepSecs(0); };
  const stopSleep  = () => {
    setSleepActive(false);
    if (sleepSecs > 30) {
      const entry = {
        duration: sleepSecs,
        start: new Date(sleepStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        end: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: Date.now(),
      };
      const updated = [entry, ...sleepLog].slice(0, 14);
      setSleepLog(updated);
      lsSet('nursingSleepLog', updated);
    }
    setSleepSecs(0);
  };

  const totalSleepToday = sleepLog
    .filter(s => new Date(s.id).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + s.duration, 0);

  const avgSleepPerSession = sleepLog.length
    ? Math.round(sleepLog.slice(0, 5).reduce((s, e) => s + e.duration, 0) / Math.min(sleepLog.length, 5))
    : 0;

  /* ── Baby Weight Tracker ── */
  const [babyWeight, setBabyWeight] = useState(() => lsGet('babyWeightLog', []));
  const [weightInput, setWeightInput] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');

  const addWeight = () => {
    if (!weightInput) return;
    const weightNum = parseFloat(weightInput);
    if (isNaN(weightNum)) return;
    
    const entry = {
      weight: weightNum,
      unit: weightUnit,
      date: new Date().toISOString(),
      ageDays: babyAgeDays,
      id: Date.now()
    };
    const updated = [entry, ...babyWeight].slice(0, 20);
    setBabyWeight(updated);
    lsSet('babyWeightLog', updated);
    setWeightInput('');
  };

  const getWeightPercentile = (weight, unit) => {
    const weightKg = unit === 'kg' ? weight : weight * 0.453592;
    if (babyWeeks < 2) {
      if (weightKg < 2.5) return 'below 1st percentile — contact healthcare provider';
      if (weightKg < 2.8) return '5th percentile — small but often healthy';
      if (weightKg < 3.2) return '25th percentile';
      if (weightKg < 3.6) return '50th percentile (average)';
      if (weightKg < 4.0) return '75th percentile';
      return 'above 90th percentile — growing beautifully!';
    }
    return null;
  };

  /* ── Immunisation Tracker ── */
  const [nextImmunisation, setNextImmunisation] = useState(() => lsGet('nextImmunisationDate', ''));
  const [immunisationNotes, setImmunisationNotes] = useState(() => lsGet('immunisationNotes', ''));
  const [showImmunisationInput, setShowImmunisationInput] = useState(!nextImmunisation);

  const saveImmunisation = () => {
    lsSet('nextImmunisationDate', nextImmunisation);
    lsSet('immunisationNotes', immunisationNotes);
    setShowImmunisationInput(false);
  };

  const getDaysUntilImmunisation = () => {
    if (!nextImmunisation) return null;
    const today = new Date();
    const target = new Date(nextImmunisation);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilVaccine = getDaysUntilImmunisation();

  /* ── AI Sleep Predictor ── */
  const sleepPrediction = predictNextSleep(sleepLog, babyWeeks);

  /* ── Outfit tab ── */
  const [outfitTab, setOutfitTab] = useState(0);

  return (
    <div className="page-pad">
      <SectionTitle title="Nursing Centre" subtitle={`Week ${babyWeeks} postpartum`} />

      {/* ── FEEDING TIMER ── */}
      <div className='feeding-card'>
        <p style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, color: 'var(--dp)', marginBottom: 'var(--sp-3)' }}>
          Feeding Timer 🍼 
        </p>

        {feedActive ? (
          <div style={{ textAlign: 'center', marginBottom: 'var(--sp-4)' }}>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', fontWeight: 600, marginBottom: 4 }}>
              {feedSide.toUpperCase()} BREAST · FEEDING
            </p>
            <p style={{ fontSize: 'clamp(40px,10vw,56px)', fontWeight: 900, color: 'var(--t)', lineHeight: 1 }}>
              {fmt(feedSecs)}
            </p>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginTop: 4 }}>
              Aim: 10–20 min per side
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 'var(--gap-md)', marginBottom: 'var(--sp-3)' }}>
            {['left', 'right'].map(side => (
              <button
                key={side}
                onClick={() => startFeed(side)}
                style={{
                  flex: 1, padding: 'var(--sp-3)',
                  background: side === 'left' ? 'var(--t)' : 'var(--sg)',
                  color: '#fff', border: 'none', borderRadius: 'var(--r)',
                  fontSize: 'var(--fs-sm)', fontWeight: 800, cursor: 'pointer',
                  minHeight: 'var(--touch)',
                }}
              >
                {side === 'left' ? '◀ Left' : 'Right ▶'}
              </button>
            ))}
          </div>
        )}

        {feedActive && (
          <button
            onClick={stopFeed}
            style={{ width: '100%', padding: 'var(--sp-3)', background: 'var(--warm)', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 'var(--fs-sm)', fontWeight: 700, cursor: 'pointer' }}
          >
            ⏹ Stop & Save
          </button>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--gap-sm)', marginTop: 'var(--sp-3)' }}>
          {[
            { v: todayFeeds,              l: 'Feeds today' },
            { v: lastFeed ? fmt(lastFeed.duration) : '--', l: 'Last feed' },
            { v: `Start ${nextSide}`,     l: 'Next side' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--warm)', borderRadius: 'var(--r)', padding: 'var(--sp-2)', textAlign: 'center' }}>
              <p style={{ fontWeight: 400, fontSize: 'var(--fs-md)', color: 'var(--dp)' }}>{s.v}</p>
              <p style={{ fontSize: 'var(--fs-2xs)', color: 'var(--mt)', marginTop: 2 }}>{s.l}</p>
            </div>
          ))}
        </div>

        {feedLog.length > 0 && (
          <div style={{ marginTop: 'var(--sp-3)' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--mt)', marginBottom: 'var(--sp-2)' }}>RECENT FEEDS</p>
            {feedLog.slice(0, 4).map(f => (
              <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 'var(--fs-xs)' }}>
                <span style={{ color: 'var(--dp)', fontWeight: 600 }}>{f.side === 'left' ? '◀ Left' : 'Right ▶'}</span>
                <span style={{ color: 'var(--mt)' }}>{fmt(f.duration)} · {f.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── BABY WEIGHT TRACKER ── */}
      <div className='weight-card' style={{ display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #E8F5E9, #F1F8E9)', border: '1px solid #A5D6A744' }}>
        <p style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, color: '#2E7D32', marginBottom: 'var(--sp-3)' }}>
          Baby Weight Tracker ⚖️ 
        </p>
        
        <div style={{ marginBottom: 'var(--sp-3)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)', marginBottom: 'var(--sp-2)', flexWrap: 'wrap' }}>
            <input
              type="number"
              step="0.01"
              placeholder={`Weight in ${weightUnit}`}
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              style={{
                flex: 2,
                padding: 'var(--sp-2) var(--sp-3)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r)',
                fontSize: 'var(--fs-sm)',
                minHeight: 'var(--touch)',
              }}
            />
            <select
              value={weightUnit}
              onChange={(e) => setWeightUnit(e.target.value)}
              style={{
                padding: 'var(--sp-2) var(--sp-3)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r)',
                fontSize: 'var(--fs-sm)',
                background: 'white',
              }}
            >
              <option value="kg">kg</option>
              <option value="lb">lb</option>
            </select>
            <button
              onClick={addWeight}
              style={{
                padding: 'var(--sp-2) var(--sp-4)',
                background: '#2E7D32',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--r)',
                fontWeight: 700,
                cursor: 'pointer',
                minHeight: 'var(--touch)',
              }}
            >
              Log Weight
            </button>
          </div>
          
          {babyWeight.length > 0 && (
            <div>
              <p style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: '#2E7D32', marginBottom: 'var(--sp-2)' }}>
                RECENT WEIGHTS {babyWeight[0] && `(Most recent: ${babyWeight[0].weight} ${babyWeight[0].unit})`}
              </p>
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {babyWeight.slice(0, 6).map(w => {
                  const percentile = getWeightPercentile(w.weight, w.unit);
                  return (
                    <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 'var(--fs-xs)' }}>
                      <span style={{ color: 'var(--dp)', fontWeight: 600 }}>{w.weight} {w.unit}</span>
                      <span style={{ color: 'var(--mt)' }}>{new Date(w.date).toLocaleDateString()}</span>
                      {percentile && <span style={{ fontSize: 'var(--fs-2xs)', color: '#2E7D32' }}>{percentile.substring(0, 30)}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 'var(--r)', padding: 'var(--sp-2)' }}>
          <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.5 }}>
            💡 Newborns typically regain birth weight by day 10-14, then gain 150-200g (5-7oz) per week in first 3 months.
          </p>
        </div>
      </div>

      {/* ── IMMUNISATION TRACKER ── */}
      <div className='immunisation-card' style={{ background: 'linear-gradient(135deg, #E3F2FD, #E8EAF6)', border: '1px solid #90CAF944' }}>
        <p style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, color: '#1565C0', marginBottom: 'var(--sp-3)' }}>
          Immunisation Schedule 💉
        </p>
        
        {showImmunisationInput ? (
          <div>
            <div style={{ marginBottom: 'var(--sp-2)' }}>
              <label style={{ fontSize: '12px', color: 'var(--mt)', display: 'block', marginBottom: 4 }}>Next immunisation date</label>
              <input
                type="date"
                value={nextImmunisation}
                onChange={(e) => setNextImmunisation(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--sp-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r)',
                  fontSize: '13px',
                  marginBottom: 'var(--sp-2)',
                }}
              />
            </div>
            <div style={{ marginBottom: 'var(--sp-3)' }}>
              <label style={{ fontSize: '13px', color: 'var(--mt)', display: 'block', marginBottom: 4 }}>Notes / reminders</label>
              <textarea
                value={immunisationNotes}
                onChange={(e) => setImmunisationNotes(e.target.value)}
                placeholder="e.g., Bring red book, paracetamol dosage, ask about rotavirus vaccine..."
                rows={2}
                style={{
                  width: '100%',
                  padding: 'var(--sp-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r)',
                  fontSize: '13px',
                  resize: 'vertical',
                }}
              />
            </div>
            <button
              onClick={saveImmunisation}
              style={{
                width: '100%',
                padding: 'var(--sp-2)',
                background: '#1565C0',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--r)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Save Schedule
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-2)', flexWrap: 'wrap', gap: 'var(--gap-sm)', flexDirection: 'column' }}>
              <div>
                {daysUntilVaccine !== null && (
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: daysUntilVaccine <= 7 ? '#D32F2F' : daysUntilVaccine <= 14 ? '#F57C00' : '#1565C0' }}>
                      {daysUntilVaccine <= 0 
                        ? '📅 Immunisation due or overdue — contact your GP' 
                        : `📅 Next immunisation in ${daysUntilVaccine} day${daysUntilVaccine !== 1 ? 's' : ''}`
                      }
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--mt)' }}>
                      Date: {new Date(nextImmunisation).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowImmunisationInput(true)}
                style={{
                  padding: 'var(--sp-1) var(--sp-3)',
                  background: 'transparent',
                  border: '1px solid #1565C0',
                  borderRadius: 'var(--r)',
                  color: '#1565C0',
                  cursor: 'pointer',
                  fontSize: 'var(--fs-xs)',
                }}
              >
                Edit
              </button>
            </div>
            {immunisationNotes && (
              <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 'var(--r)', padding: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
                <p style={{ fontSize: '13px', color: '#555' }}>📝 {immunisationNotes}</p>
              </div>
            )}
          </div>
        )}
        
        <div style={{ marginTop: 'var(--sp-3)', background: 'rgba(255,255,255,0.5)', borderRadius: 'var(--r)', padding: 'var(--sp-2)' }}>
          <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.5 }}>
            🗓️ Typical schedule: 8 weeks (6-in-1, MenB, Rotavirus), 12 weeks (6-in-1 #2, Pneumococcal), 16 weeks (6-in-1 #3, MenB #2).
          </p>
        </div>
      </div>

      {/* ── BREAST PUMP TIMER ── */}
      <div className='feeding-card' style={{ background: 'linear-gradient(135deg, var(--lvl), #F8F6FE)', border: '1px solid var(--lvm)33' }}>
        <p style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, color: 'var(--lv)', marginBottom: 'var(--sp-3)' }}>
         Breast Pump Timer  🫙 
        </p>

        {pumpActive ? (
          <div style={{ textAlign: 'center', marginBottom: 'var(--sp-4)' }}>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--lv)', fontWeight: 700, marginBottom: 4 }}>PUMPING IN PROGRESS</p>
            <p style={{ fontSize: 'clamp(40px,10vw,56px)', fontWeight: 900, color: 'var(--lv)', lineHeight: 1 }}>
              {fmt(pumpSecs)}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--mt)', marginTop: 4 }}>
              Recommended: 15–20 min per session
            </p>
          </div>
        ) : (
          <button
            onClick={() => { setPumpActive(true); setPumpSecs(0); }}
            style={{ width: '100%', padding: 'var(--sp-3)', background: 'var(--lv)', color: '#fff', border: 'none', borderRadius: 'var(--r)', fontSize: 'var(--fs-md)', fontWeight: 800, cursor: 'pointer', marginBottom: 'var(--sp-3)' }}
          >
            ▶ Start Pumping Session
          </button>
        )}

        {pumpActive && (
          <button
            onClick={stopPump}
            style={{ width: '100%', padding: 'var(--sp-3)', background: 'var(--warm)', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 'var(--fs-sm)', fontWeight: 700, cursor: 'pointer', marginBottom: 'var(--sp-3)' }}
          >
            ⏹ Stop & Save
          </button>
        )}

        <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 'var(--r)', padding: 'var(--sp-3)' }}>
          <p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--lv)', marginBottom: 'var(--sp-2)' }}>🤖 AI PUMP TIPS</p>
          {[
            'Best time: 30–60 min after morning feed when supply is highest.',
            'Pump every 2–3 hrs to signal supply if baby is not latching.',
            'Warm compress before pumping increases output by up to 30%.',
          ].map((tip, i) => (
            <p key={i} style={{ fontSize: '13px', color: 'var(--md)', lineHeight: 1.6, marginBottom: 4 }}>· {tip}</p>
          ))}
        </div>

        {pumpLog.length > 0 && (
          <div style={{ marginTop: 'var(--sp-3)' }}>
            <p style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--mt)', marginBottom: 'var(--sp-2)' }}>RECENT SESSIONS</p>
            {pumpLog.slice(0, 3).map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 'var(--fs-xs)' }}>
                <span style={{ color: 'var(--dp)', fontWeight: 600 }}>🫙 Session</span>
                <span style={{ color: 'var(--mt)' }}>{fmt(p.duration)} · {p.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── POOP SCANNER ── */}
      <div className='poop-card' style={{ background: 'linear-gradient(135deg, #FFF3E0, #FFF8E1)', border: '1px solid #FFCC8033' }}>
        <p style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, color: 'var(--dp)', marginBottom: 4 }}>
          💩 Poop Colour Scanner
        </p>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginBottom: 'var(--sp-3)', lineHeight: 1.5 }}>
          Select the closest colour to what you see. Each colour tells you something different about baby's health.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-sm)', marginBottom: 'var(--sp-3)' }}>
          {POOP_COLORS.map(c => (
            <button
              key={c.id}
              onClick={() => setPoopSelected(c)}
              style={{
                padding: 'var(--sp-2) var(--sp-3)',
                borderRadius: 'var(--r)',
                border: `2px solid ${poopSelected?.id === c.id ? (c.status === 'urgent' ? 'var(--rd)' : c.status === 'watch' ? 'var(--gd)' : 'var(--sg)') : 'var(--border)'}`,
                background: poopSelected?.id === c.id ? (c.status === 'urgent' ? 'var(--rdl)' : c.status === 'watch' ? 'var(--gdl)' : 'var(--sgl)') : 'var(--warm)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <span style={{ fontSize: 20 }}>{c.emoji}</span>
              <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 600, color: 'var(--dp)', lineHeight: 1.3 }}>{c.label}</span>
            </button>
          ))}
        </div>

        {poopSelected && (
          <div style={{
            borderRadius: 'var(--r)', padding: 'var(--sp-3)',
            background: poopSelected.status === 'urgent' ? 'var(--rdl)' : poopSelected.status === 'watch' ? 'var(--gdl)' : 'var(--sgl)',
            border: `1px solid ${poopSelected.status === 'urgent' ? 'var(--rd)' : poopSelected.status === 'watch' ? 'var(--gd)' : 'var(--sg)'}44`,
            marginBottom: 'var(--sp-3)',
          }}>
            <p style={{ fontWeight: 800, fontSize: 'var(--fs-sm)', color: poopSelected.status === 'urgent' ? 'var(--rd)' : poopSelected.status === 'watch' ? 'var(--gd)' : 'var(--sg)', marginBottom: 4 }}>
              {poopSelected.status === 'urgent' ? '🚨 Seek Medical Advice' : poopSelected.status === 'watch' ? '⚠️ Monitor Closely' : '✅ Normal'}
            </p>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--md)', lineHeight: 1.6 }}>{poopSelected.msg}</p>
          </div>
        )}

        <button
          onClick={logPoop}
          disabled={!poopSelected}
          style={{ width: '100%', padding: 'var(--sp-2)', background: poopSelected ? 'var(--dp)' : '#898682', color: '#fff', border: 'none', borderRadius: 'var(--r)', cursor: poopSelected ? 'pointer' : 'default', fontWeight: 700 }}
        >
          {poopLogged ? '✓ Logged!' : 'Log This Nappy'}
        </button>
      </div>

      {/* ── SLEEP PATTERN TRACKER + AI PREDICTOR ── */}
      <div className='sleep-card' style={{ background: 'linear-gradient(135deg,#EEF2FF,#F8F6FE)', border: '1px solid #C7D2FE44' }}>
        <p style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, color: '#4338CA', marginBottom: 'var(--sp-3)' }}>
          😴 Sleep Pattern Tracker
        </p>

        {sleepActive ? (
          <div style={{ textAlign: 'center', marginBottom: 'var(--sp-4)' }}>
            <p style={{ fontSize: 'var(--fs-xs)', color: '#4338CA', fontWeight: 700, marginBottom: 4 }}>BABY SLEEPING NOW</p>
            <p style={{ fontSize: 'clamp(40px,10vw,56px)', fontWeight: 900, color: '#4338CA', lineHeight: 1 }}>
              {fmt(sleepSecs)}
            </p>
          </div>
        ) : (
          <button
            onClick={startSleep}
            style={{ width: '100%', padding: 'var(--sp-3)', background: '#4338CA', color: '#fff', border: 'none', borderRadius: 'var(--r)', fontSize: 'var(--fs-md)', fontWeight: 800, cursor: 'pointer', marginBottom: 'var(--sp-3)' }}
          >
            😴 Baby Just Fell Asleep
          </button>
        )}

        {sleepActive && (
          <button
            onClick={stopSleep}
            style={{ width: '100%', padding: 'var(--sp-3)', background: 'var(--warm)', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 'var(--fs-sm)', fontWeight: 700, cursor: 'pointer', marginBottom: 'var(--sp-3)' }}
          >
            ☀️ Baby Woke Up — Stop
          </button>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--gap-sm)', marginBottom: 'var(--sp-3)' }}>
          {[
            { v: `${Math.floor(totalSleepToday / 3600)}h ${Math.floor((totalSleepToday % 3600) / 60)}m`, l: 'Total today' },
            { v: sleepLog.length ? `${Math.floor(avgSleepPerSession / 60)}m avg` : '--',                   l: 'Avg session' },
            { v: sleepLog.length,                                                                            l: 'Sessions logged' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 'var(--r)', padding: 'var(--sp-2)', textAlign: 'center' }}>
              <p style={{ fontWeight: 900, fontSize: 'var(--fs-md)', color: '#4338CA' }}>{s.v}</p>
              <p style={{ fontSize: 'var(--fs-2xs)', color: 'var(--mt)', marginTop: 2 }}>{s.l}</p>
            </div>
          ))}
        </div>

        {sleepLog.length > 0 && (
          <div style={{ marginBottom: 'var(--sp-3)' }}>
            <p style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--mt)', marginBottom: 'var(--sp-2)' }}>RECENT SLEEP SESSIONS</p>
            {sleepLog.slice(0, 4).map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 'var(--fs-xs)' }}>
                <span style={{ color: 'var(--dp)', fontWeight: 600 }}>{s.start} → {s.end}</span>
                <span style={{ color: 'var(--mt)' }}>{Math.floor(s.duration / 60)}m</span>
              </div>
            ))}
          </div>
        )}

        {/* AI Sleep Predictor Section */}
        <div style={{ 
          background: sleepPrediction.confidence === 'high' ? 'linear-gradient(135deg, #4338CA, #6366F1)' : 
                     sleepPrediction.confidence === 'medium' ? 'linear-gradient(135deg, #6366F1, #818CF8)' : 
                     'linear-gradient(135deg, #818CF8, #A5B4FC)',
          borderRadius: 'var(--r)', 
          padding: 'var(--sp-3)', 
          marginBottom: 'var(--sp-3)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--sp-2)' }}>
            <span style={{ fontSize: 20 }}>🤖</span>
            <p style={{ fontWeight: 800, fontSize: 'var(--fs-sm)' }}>AI Sleep Predictor</p>
            {sleepPrediction.confidence === 'high' && <span style={{ fontSize: 'var(--fs-2xs)', background: 'rgba(255,255,255,0.3)', padding: '2px 6px', borderRadius: 12 }}>High confidence</span>}
            {sleepPrediction.confidence === 'medium' && <span style={{ fontSize: 'var(--fs-2xs)', background: 'rgba(255,255,255,0.3)', padding: '2px 6px', borderRadius: 12 }}>Learning...</span>}
          </div>
          <p style={{ fontSize: 'var(--fs-xs)', lineHeight: 1.5, marginBottom: 8 }}>{sleepPrediction.nextSleepWindow}</p>
          <p style={{ fontSize: 'var(--fs-xs)', lineHeight: 1.5, opacity: 0.9 }}>
            💡 Recommended wake window: {sleepPrediction.recommendedWakeWindow}
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 'var(--r)', padding: 'var(--sp-3)' }}>
          <p style={{ fontSize: 'var(--fs-xs)', fontWeight: 800, color: '#4338CA', marginBottom: 'var(--sp-2)' }}>
            💡 Week {babyWeeks} SLEEP GUIDE
          </p>
          {SLEEP_TIPS.slice(0, babyWeeks < 6 ? 3 : 5).map((tip, i) => (
            <p key={i} style={{ fontSize: 'var(--fs-xs)', color: 'var(--md)', lineHeight: 1.6, marginBottom: 4 }}>· {tip}</p>
          ))}
        </div>
      </div>

      <div className='outfit-card' style={{ background: '#fff', border: '1px solid var(--sg)33' }}>
        <p style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, color: 'var(--dp)', marginBottom: 4 }}>
          👗 Nursing Style Guide
        </p>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginBottom: 'var(--sp-3)' }}>
          Stay stylish, feed with ease. You don't have to choose.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: 'var(--sp-3)', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {OUTFITS.map((o, i) => (
            <button
              key={i}
              onClick={() => setOutfitTab(i)}
              style={{
                flexShrink: 0,
                padding: '6px 14px',
                borderRadius: 20,
                border: `1.5px solid ${outfitTab === i ? 'var(--t)' : 'var(--border)'}`,
                background: outfitTab === i ? 'var(--t)' : 'transparent',
                color: outfitTab === i ? '#fff' : 'var(--mt)',
                fontSize: 'var(--fs-xs)', fontWeight: 700, cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {o.emoji} {o.occasion}
            </button>
          ))}
        </div>

        {(() => {
          const o = OUTFITS[outfitTab];
          return (
            <div>
              <div style={{ marginBottom: 'var(--sp-3)' }}>
                {o.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: i < o.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontSize: 16 }}>👚</span>
                    <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--dp)', fontWeight: 600 }}>{item}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--gdl)', borderRadius: 'var(--r)', padding: 'var(--sp-3)', display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 18 }}>💡</span>
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--md)', lineHeight: 1.6 }}>{o.tip}</p>
              </div>
            </div>
          );
        })()}

        <div style={{ marginTop: 'var(--sp-3)', background: 'var(--sgl)', borderRadius: 'var(--r)', padding: 'var(--sp-3)' }}>
          <p style={{ fontSize: 'var(--fs-xs)', fontWeight: 800, color: 'var(--sg)', marginBottom: 4 }}>🌟 CONFIDENCE TIP</p>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--md)', lineHeight: 1.6 }}>
            Nursing bras with a front clasp or drop cup work under almost any outfit. Invest in 2–3 good ones — they carry your whole wardrobe.
          </p>
        </div>
      </div>

      
      <div className='self-care-card' style={{ background: 'linear-gradient(135deg, var(--rdl), #FFF0F5)', border: '1px solid var(--rd)22' }}>
        <p style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, color: 'var(--t)', marginBottom: 'var(--sp-3)' }}>
          💗 Don't Forget You
        </p>
        {[
          { icon: '💧', title: 'Hydration', tip: 'Drink a glass of water every time you sit down to feed. You need 2.5–3L daily while nursing.' },
          { icon: '🥗', title: 'Nutrition', tip: 'You need 400–500 extra calories. Oats, moringa, fenugreek, and fennel support milk supply.' },
          { icon: '🧴', title: 'Nipple care', tip: 'Apply lanolin or expressed breast milk after each feed. Air-dry when possible. Seek help for persistent pain.' },
          { icon: '🛁', title: 'Body recovery', tip: 'Sitz baths help perineal healing. Padsicles (frozen pads with aloe) ease discomfort in week 1–2.' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 'var(--gap-md)', padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--dp)', marginBottom: 2 }}>{item.title}</p>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', lineHeight: 1.6 }}>{item.tip}</p>
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 'var(--fs-2xs)', color: 'var(--mt)', textAlign: 'center', padding: 'var(--sp-3)', borderRadius: 'var(--r)', lineHeight: 1.6 }}>
        ⚕️ This is general guidance, not medical advice. Always consult your midwife, GP, or lactation consultant for personal support.
      </p>
    </div>
  );
}