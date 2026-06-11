// src/pages/Insights.jsx
import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db, auth } from '../context/firebase';
import { WCard, SectionTitle, Tag } from '../components/ui';

// ─── Period helpers ───────────────────────────────────────────────────────────

const periodDays = { week: 7, month: 30, year: 365 };

const periodStart = (days) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (days - 1));
  return Timestamp.fromDate(d);
};

const last30Days = () => {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
};

const toDate = (val) => {
  if (!val) return null;
  if (val instanceof Timestamp) return val.toDate();
  if (val?.seconds) return new Timestamp(val.seconds, val.nanoseconds ?? 0).toDate();
  return new Date(val);
};

const isoDate = (val) => {
  const d = toDate(val);
  return d ? d.toISOString().slice(0, 10) : null;
};

// ─── Firestore fetch helpers ──────────────────────────────────────────────────

const fetchCollection = async (uid, collectionName, days) => {
  try {
    const ref  = collection(db, 'users', uid, collectionName);
    const snap = await getDocs(
      query(ref, where('date', '>=', periodStart(days)), orderBy('date', 'asc'))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error(`Insights: failed to fetch ${collectionName}`, err);
    return [];
  }
};

// ─── Derivation helpers ───────────────────────────────────────────────────────

const deriveVitals = (logs) => {
  const valid = logs.filter(v => v.bp);
  if (!valid.length) return null;

  const latest   = valid[valid.length - 1];
  const [latestSys] = latest.bp.split('/').map(Number);

  let trend = 'Stable';
  let change = '—';

  if (valid.length >= 2) {
    const [prevSys] = valid[0].bp.split('/').map(Number);
    const diff = latestSys - prevSys;
    if (diff > 2)       { trend = 'Rising';  change = `+${diff} mmHg`; }
    else if (diff < -2) { trend = 'Falling'; change = `${diff} mmHg`;  }
    else                { change = '±0 mmHg'; }
  }

  return {
    value: latest.bp,
    trend,
    change,
    recommendation: trend === 'Rising'
      ? 'Speak to your midwife about the increase'
      : 'Continue monitoring daily',
  };
};

const deriveSleep = (logs) => {
  if (!logs.length) return null;

  const avg = logs.reduce((s, l) => s + (l.hours ?? 0), 0) / logs.length;

  let trend = 'Stable';
  let change = '—';

  if (logs.length >= 4) {
    const half     = Math.floor(logs.length / 2);
    const early    = logs.slice(0, half).reduce((s, l) => s + (l.hours ?? 0), 0) / half;
    const late     = logs.slice(half).reduce((s, l) => s + (l.hours ?? 0), 0) / (logs.length - half);
    const diff     = +(late - early).toFixed(1);
    if (diff > 0.2)       { trend = 'Improving'; change = `+${diff} hrs`; }
    else if (diff < -0.2) { trend = 'Declining'; change = `${diff} hrs`;  }
    else                  { change = '±0 hrs'; }
  }

  return {
    value: `${avg.toFixed(1)} hrs`,
    trend,
    change,
    recommendation: avg < 7
      ? 'Try an earlier bedtime — aim for 8–9 hrs'
      : 'Keep your consistent bedtime',
  };
};

const MOOD_SCORES = { great: 5, good: 4, okay: 3, low: 2, bad: 1 };
const MOOD_LABELS = ['', 'Bad', 'Low', 'Okay', 'Good', 'Great'];

const deriveMood = (logs) => {
  if (!logs.length) return null;

  const scores = logs.map(m => MOOD_SCORES[m.mood?.toLowerCase?.()] ?? m.score ?? 3);
  const avg    = scores.reduce((s, v) => s + v, 0) / scores.length;
  const label  = MOOD_LABELS[Math.round(avg)] ?? 'Okay';

  let trend = 'Stable';
  if (logs.length >= 4) {
    const half     = Math.floor(logs.length / 2);
    const earlyAvg = logs.slice(0, half).map(m => MOOD_SCORES[m.mood?.toLowerCase?.()] ?? m.score ?? 3).reduce((s, v) => s + v, 0) / half;
    const lateAvg  = logs.slice(half).map(m => MOOD_SCORES[m.mood?.toLowerCase?.()] ?? m.score ?? 3).reduce((s, v) => s + v, 0) / (logs.length - half);
    if (lateAvg - earlyAvg > 0.3)  trend = 'Improving';
    else if (earlyAvg - lateAvg > 0.3) trend = 'Declining';
  }

  return {
    value: label,
    trend,
    change: trend === 'Improving' ? '↑' : trend === 'Declining' ? '↓' : '—',
    recommendation: avg < 3
      ? 'Consider a mindfulness exercise today'
      : 'Continue daily mood check-ins',
  };
};

const deriveKicks = (logs) => {
  if (!logs.length) return null;

  const latest = logs[logs.length - 1];
  const count  = latest.count ?? latest.kicks ?? '—';
  const win    = latest.window ?? latest.duration ?? '2hr';
  const trend  = typeof count === 'number'
    ? count >= 10 ? 'Normal' : count >= 6 ? 'Below avg' : 'Low — check in'
    : 'Normal';

  return {
    value: `${count}/${win}`,
    trend,
    change: logs.length > 1 ? `${logs.length} sessions` : '1 session',
    recommendation: trend === 'Normal'
      ? 'Great consistency!'
      : 'Contact your midwife if fewer than 10 kicks in 2 hours',
  };
};

// ─── Symptom heatmap ──────────────────────────────────────────────────────────

const buildHeatmap = (symptomLogs) => {
  const days = last30Days();
  return days.map(dayDate => {
    const dateStr = dayDate.toISOString().slice(0, 10);
    const matches = symptomLogs.filter(l => isoDate(l.date) === dateStr);

    const symptoms = matches.flatMap(l =>
      Array.isArray(l.symptoms) ? l.symptoms : l.symptom ? [l.symptom] : []
    );
    const severity = matches.length
      ? Math.round(matches.reduce((s, l) => s + (l.severity ?? l.score ?? 1), 0) / matches.length)
      : 0;

    return { date: dayDate, symptoms, severity };
  });
};

// ─── AI recommendation builder ────────────────────────────────────────────────

const buildRecommendations = ({ sleep, vitals, kicks, mood, hydrationLogs, nutritionLogs, days }) => {
  const recs = [];

  if (sleep) {
    const hrs = parseFloat(sleep.value);
    if (!isNaN(hrs)) {
      if (hrs >= 8)      recs.push({ icon: '💤', text: `You're averaging ${sleep.value} of sleep — excellent. Keep your consistent bedtime routine.` });
      else if (hrs >= 7) recs.push({ icon: '💤', text: `You're averaging ${sleep.value} of sleep. A slightly earlier bedtime could push you into the optimal 8–9 hr range.` });
      else               recs.push({ icon: '💤', text: `Your average sleep is ${sleep.value} — lower than recommended. Try winding down 30 minutes earlier tonight.` });
    }
  }

  if (hydrationLogs.length) {
    const avgL  = hydrationLogs.reduce((s, h) => s + (h.litres ?? (h.ml ?? 0) / 1000), 0) / hydrationLogs.length;
    const target = 2.3;
    recs.push(avgL < target
      ? { icon: '💧', text: `You're drinking about ${avgL.toFixed(1)}L daily. Aim for ${target}L — try keeping a water bottle close by.` }
      : { icon: '💧', text: `Hydration is on track at ${avgL.toFixed(1)}L daily on average. Keep it up!` }
    );
  }

  if (nutritionLogs.length) {
    const IRON_KEYWORDS = ['iron', 'spinach', 'lentils', 'beans', 'beef', 'chicken', 'tofu', 'fortified'];
    const ironDays = nutritionLogs.filter(n =>
      (n.tags ?? []).some(t => IRON_KEYWORDS.includes(t.toLowerCase()))
    ).length;
    const uniqueDays = new Set(nutritionLogs.map(n => isoDate(n.date))).size;
    if (uniqueDays > 0) {
      recs.push(ironDays >= uniqueDays
        ? { icon: '🥗', text: `Iron-rich foods logged every day this period — great for you and baby.` }
        : { icon: '🥗', text: `Iron-rich foods tracked ${ironDays}/${uniqueDays} days. Try adding spinach or lentils to one more meal.` }
      );
    }
  }

  if (kicks) {
    recs.push(kicks.trend === 'Normal'
      ? { icon: '👶', text: `Kick counts are in the normal range (${kicks.value}). Consistent counting helps catch changes early.` }
      : { icon: '👶', text: `Recent kick count was ${kicks.value}. If you notice a significant drop, contact your midwife promptly.` }
    );
  }

  if (mood && (mood.value === 'Low' || mood.value === 'Bad')) {
    recs.push({ icon: '🌸', text: `Your mood has been ${mood.value.toLowerCase()} recently. Gentle movement, fresh air, or talking to someone you trust can help.` });
  }

  if (vitals?.trend === 'Rising') {
    recs.push({ icon: '❤️', text: `Your blood pressure has been trending upward (${vitals.value}). Please mention this at your next midwife appointment.` });
  }

  if (!recs.length) {
    recs.push({ icon: '📋', text: 'No data logged yet for this period. Start tracking your vitals, sleep, mood, and symptoms to see personalised recommendations here.' });
  }

  return recs;
};

// ─── Severity colour ──────────────────────────────────────────────────────────

const getSeverityColor = (severity) => {
  if (!severity)     return 'var(--border)';
  if (severity <= 2) return 'var(--sgl)';
  if (severity <= 4) return 'var(--gdl)';
  return 'var(--rdl)';
};

const TREND_COLORS = {
  Stable:           { card: 'var(--sg)',  tag: 'var(--sgl)', tc: 'var(--sg)'  },
  Improving:        { card: 'var(--bl)',  tag: 'var(--sgl)', tc: 'var(--sg)'  },
  Declining:        { card: 'var(--rdl)', tag: 'var(--rdl)', tc: 'var(--rd)'  },
  Normal:           { card: 'var(--sg)',  tag: 'var(--sgl)', tc: 'var(--sg)'  },
  Rising:           { card: 'var(--rd)',  tag: 'var(--rdl)', tc: 'var(--rd)'  },
  Falling:          { card: 'var(--bl)',  tag: 'var(--sgl)', tc: 'var(--sg)'  },
  'Low — check in': { card: 'var(--rd)',  tag: 'var(--rdl)', tc: 'var(--rd)'  },
  'Below avg':      { card: 'var(--gd)',  tag: 'var(--gdl)', tc: 'var(--gd)'  },
  default:          { card: 'var(--t)',   tag: 'var(--warm)', tc: 'var(--md)' },
};

const trendColor = (trend) => TREND_COLORS[trend] ?? TREND_COLORS.default;

// ─── Component ────────────────────────────────────────────────────────────────

export default function Insights() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [insightCards,   setInsightCards]   = useState([]);
  const [heatmap,        setHeatmap]        = useState([]);
  const [aiRecs,         setAiRecs]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [isEmpty,        setIsEmpty]        = useState(false);

  const load = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    setLoading(true);
    const days = periodDays[selectedPeriod];

    // Fetch all collections in parallel
    const [
      vitalsLogs,
      sleepLogs,
      moodLogs,
      kickLogs,
      symptomLogs,
      hydrationLogs,
      nutritionLogs,
    ] = await Promise.all([
      fetchCollection(uid, 'vitals',         days),
      fetchCollection(uid, 'sleep_logs',     days),
      fetchCollection(uid, 'mood_logs',      days),
      fetchCollection(uid, 'kick_sessions',  days),
      fetchCollection(uid, 'symptom_logs',   30),   // heatmap always 30 days
      fetchCollection(uid, 'hydration_logs', days),
      fetchCollection(uid, 'nutrition_logs', days),
    ]);

    const vitals = deriveVitals(vitalsLogs);
    const sleep  = deriveSleep(sleepLogs);
    const mood   = deriveMood(moodLogs);
    const kicks  = deriveKicks(kickLogs);

    const cards = [
      vitals && { title: 'Blood Pressure', ...vitals },
      sleep  && { title: 'Sleep Quality',  ...sleep  },
      mood   && { title: 'Mood Average',   ...mood   },
      kicks  && { title: 'Kick Count',     ...kicks  },
    ].filter(Boolean);

    setInsightCards(cards);
    setHeatmap(buildHeatmap(symptomLogs));
    setAiRecs(buildRecommendations({ sleep, vitals, kicks, mood, hydrationLogs, nutritionLogs, days }));
    setIsEmpty(cards.length === 0);
    setLoading(false);
  }, [selectedPeriod]);

  useEffect(() => { load(); }, [load]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="page-pad">
      <SectionTitle
        title="📊 Health Insights"
        subtitle="Your personal health patterns and trends"
      />

      {/* Period Selector */}
      <div style={{ display: 'flex', gap: 'var(--gap-sm)', marginBottom: 'var(--sp-4)' }}>
        {['week', 'month', 'year'].map(p => (
          <button
            key={p}
            onClick={() => setSelectedPeriod(p)}
            style={{
              padding: '8px 20px',
              borderRadius: 30,
              background: selectedPeriod === p ? 'var(--t)' : 'var(--warm)',
              color:      selectedPeriod === p ? '#fff'     : 'var(--md)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          >
            {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'This Year'}
          </button>
        ))}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <WCard style={{ textAlign: 'center', padding: 'var(--sp-5)' }}>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--mt)' }}>Loading your data…</p>
        </WCard>
      )}

      {/* ── Empty state ── */}
      {!loading && isEmpty && (
        <WCard style={{ textAlign: 'center', padding: 'var(--sp-5)' }}>
          <p style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--sp-2)' }}>📭</p>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--mt)' }}>
            No data logged for this period yet. Track your vitals, sleep, mood, and kick counts to see your insights here.
          </p>
        </WCard>
      )}

      {/* ── Summary Stats Grid ── */}
      {!loading && insightCards.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 'var(--gap-md)',
          marginBottom: 'var(--sp-4)',
        }}>
          {insightCards.map((insight, i) => {
            const tc = trendColor(insight.trend);
            return (
              <WCard key={i} style={{ textAlign: 'center', padding: 'var(--sp-3)' }}>
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginBottom: 'var(--sp-1)' }}>
                  {insight.title}
                </p>
                <p style={{ fontSize: 'var(--fs-xl)', fontWeight: 800, color: tc.card, marginBottom: 'var(--sp-1)' }}>
                  {insight.value}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--gap-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Tag label={insight.trend} bg={tc.tag} tc={tc.tc} />
                  <span style={{ fontSize: 'var(--fs-2xs)', color: 'var(--mt)' }}>
                    {insight.change}
                  </span>
                </div>
                {insight.recommendation && (
                  <p style={{ fontSize: 'var(--fs-2xs)', color: 'var(--mt)', marginTop: 'var(--sp-2)', fontStyle: 'italic' }}>
                    {insight.recommendation}
                  </p>
                )}
              </WCard>
            );
          })}
        </div>
      )}

      {/* ── Symptom Heatmap ── */}
      {!loading && (
        <>
          <SectionTitle title="📅 Symptom Heatmap" subtitle="30-day symptom intensity" />
          <WCard>
            {heatmap.every(d => d.severity === 0) ? (
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--mt)', textAlign: 'center', padding: 'var(--sp-3) 0' }}>
                No symptoms logged yet. Start tracking to see your 30-day pattern here.
              </p>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ display: 'flex', gap: 4, minWidth: 600 }}>
                    {heatmap.map((day, i) => (
                      <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                        <div
                          style={{
                            aspectRatio: 1,
                            background: getSeverityColor(day.severity),
                            borderRadius: 'var(--r)',
                            marginBottom: 4,
                            position: 'relative',
                            cursor: 'pointer',
                          }}
                          title={
                            day.symptoms.length
                              ? `${day.date.toLocaleDateString()}: ${day.symptoms.join(', ')} (severity ${day.severity})`
                              : day.date.toLocaleDateString()
                          }
                        >
                          {day.severity > 0 && (
                            <div style={{
                              position: 'absolute',
                              bottom: 2,
                              right: 2,
                              fontSize: 8,
                              color: day.severity > 3 ? '#fff' : 'var(--mt)',
                            }}>
                              {day.severity}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: 'var(--fs-2xs)', color: 'var(--mt)' }}>
                          {day.date.getDate()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--gap-md)', marginTop: 'var(--sp-3)' }}>
                  {[
                    { label: 'No data',   bg: 'var(--border)' },
                    { label: 'Mild',      bg: 'var(--sgl)'    },
                    { label: 'Moderate',  bg: 'var(--gdl)'    },
                    { label: 'Severe',    bg: 'var(--rdl)'    },
                  ].map(({ label, bg }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 2, background: bg }} />
                      <span style={{ fontSize: 'var(--fs-2xs)' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </WCard>
        </>
      )}

      {/* ── AI-Powered Recommendations ── */}
      {!loading && (
        <>
          <SectionTitle title="🤖 AI Recommendations" subtitle="Based on your logged data" />
          <WCard style={{ background: 'linear-gradient(135deg, var(--lvl), #F8F6FE)' }}>
            {aiRecs.map((rec, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 'var(--gap-md)',
                  padding: 'var(--sp-3) 0',
                  borderBottom: i < aiRecs.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{ fontSize: 24 }}>{rec.icon}</div>
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--dp)', flex: 1 }}>{rec.text}</p>
              </div>
            ))}
          </WCard>
        </>
      )}

      {/* ── Export Button ── */}
      <WCard>
        <button
          style={{
            width: '100%',
            padding: 'var(--sp-3)',
            background: 'var(--dp)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--r)',
            fontSize: 'var(--fs-sm)',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--gap-sm)',
          }}
          onClick={() => {
            // TODO: wire up PDF export endpoint in backend phase
            alert('PDF export will be available once your health profile is fully synced.');
          }}
        >
          📄 Export Health Report (PDF)
        </button>
        <p style={{ fontSize: 'var(--fs-2xs)', color: 'var(--mt)', textAlign: 'center', marginTop: 'var(--sp-2)' }}>
          Share with your GP, midwife, or health visitor
        </p>
      </WCard>
    </div>
  );
}