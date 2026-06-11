// src/components/cards/HealthInsightPanel.jsx
//
// Renders:
//   1. 14-day symptom heatmap  — built from real Firestore entries
//   2. AI health insight card  — generated from real logged data on demand
//   3. Today's vitals summary  — BP, weight, mood pulled from Firestore
//
// Props: all come from useHealthData() in the parent.

import { useState } from 'react';

// ─── Severity colour scale (1–5) ─────────────────────────────────────────────
const SEVERITY_COLORS = [
  { min: 0,   bg: '#f0f7f0', border: '#c8e0c8', label: 'None'     },
  { min: 1,   bg: '#fff3cd', border: '#f0c040', label: 'Mild'     },
  { min: 3,   bg: '#ffe0b2', border: '#e08020', label: 'Moderate' },
  { min: 6,   bg: '#ffcdd2', border: '#e05050', label: 'High'     },
  { min: 12,  bg: '#ef9a9a', border: '#c62828', label: 'Severe'   },
];

function severityColor(total) {
  for (let i = SEVERITY_COLORS.length - 1; i >= 0; i--) {
    if (total >= SEVERITY_COLORS[i].min) return SEVERITY_COLORS[i];
  }
  return SEVERITY_COLORS[0];
}

// ─── Mood icon ────────────────────────────────────────────────────────────────
const MOOD_ICONS = { great: '😄', good: '🙂', okay: '😐', low: '😔', bad: '😢' };

// ─── Day abbreviations ───────────────────────────────────────────────────────
function dayLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today - d) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yest';
  return d.toLocaleDateString('en-GB', { weekday: 'short' });
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────
function SymptomHeatmap({ heatmapData, loadingRecent }) {
  const [tooltip, setTooltip] = useState(null);

  // Build a full 14-day grid even when some days have no data
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().split('T')[0];
    const entry = heatmapData.find((e) => e.date === key);
    return { key, label: dayLabel(key), ...(entry || { totalSeverity: 0, symptomCount: 0, dominantSymptom: null, mood: null }) };
  });

  if (loadingRecent) {
    return (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', padding: '4px 0' }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} style={{ width: 36, height: 44, borderRadius: 8, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: 3, overflowX: 'auto', paddingBottom: 4 }}>
        {days.map((day) => {
          const col = severityColor(day.totalSeverity);
          return (
            <div
              key={day.key}
              onMouseEnter={() => setTooltip(day.key)}
              onMouseLeave={() => setTooltip(null)}
              style={{
                minWidth: 36, height: 48, borderRadius: 8, flexShrink: 0, cursor: day.symptomCount > 0 ? 'pointer' : 'default',
                background: col.bg, border: `1.5px solid ${col.border}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                transition: 'transform 0.12s', transform: tooltip === day.key ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              {day.mood
                ? <span style={{ fontSize: 13 }}>{MOOD_ICONS[day.mood] || '·'}</span>
                : <span style={{ fontSize: 11, fontWeight: 700, color: day.symptomCount > 0 ? '#333' : '#bbb' }}>
                    {day.symptomCount > 0 ? day.symptomCount : '–'}
                  </span>
              }
              <span style={{ fontSize: 9, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                {day.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {tooltip && (() => {
        const day = days.find((d) => d.key === tooltip);
        if (!day || day.symptomCount === 0) return null;
        return (
          <div style={{
            position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
            background: '#1a1a2e', color: '#fff', borderRadius: 10, padding: '8px 12px',
            fontSize: 11, lineHeight: 1.5, whiteSpace: 'nowrap', zIndex: 10,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)', pointerEvents: 'none',
          }}>
            <div style={{ fontWeight: 700 }}>{day.key}</div>
            <div>{day.symptomCount} symptom{day.symptomCount !== 1 ? 's' : ''} logged</div>
            {day.dominantSymptom && <div>Worst: {day.dominantSymptom}</div>}
            {day.mood && <div>Mood: {day.mood}</div>}
          </div>
        );
      })()}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        {SEVERITY_COLORS.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: c.bg, border: `1px solid ${c.border}` }} />
            <span style={{ fontSize: 10, color: '#999' }}>{c.label}</span>
          </div>
        ))}
      </div>

      <style>{`@keyframes shimmer { from{background-position:200% 0} to{background-position:-200% 0} }`}</style>
    </div>
  );
}

// ─── AI Insight card ─────────────────────────────────────────────────────────
function AIInsightCard({ insight, insightLoading, insightError, onGenerate, hasData }) {
  if (insightLoading) {
    return (
      <div style={{ padding: 'var(--sp-4)', textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--t)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto var(--sp-2)' }} />
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)' }}>Analysing your health data…</p>
        <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (insightError) {
    return (
      <div style={{ padding: 'var(--sp-3)', background: 'var(--rdl)', borderRadius: 'var(--r)' }}>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--rd)', lineHeight: 1.55 }}>{insightError}</p>
        {hasData && (
          <button onClick={onGenerate} style={{ marginTop: 8, background: 'var(--t)', color: '#fff', border: 'none', borderRadius: 20, padding: '5px 14px', fontSize: 11, cursor: 'pointer' }}>
            Try again
          </button>
        )}
      </div>
    );
  }

  if (!insight) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--sp-4)' }}>
        <div style={{ fontSize: 32, marginBottom: 'var(--sp-2)' }}>🤖</div>
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--mt)', marginBottom: 'var(--sp-3)', lineHeight: 1.5 }}>
          {hasData
            ? 'Your AI insight is ready to generate from your real health logs.'
            : 'Log your symptoms today and your personal AI insight will be based on your actual data — not generic advice.'}
        </p>
        {hasData && (
          <button
            onClick={onGenerate}
            style={{ background: 'linear-gradient(135deg, var(--t), #e05080)', color: '#fff', border: 'none', borderRadius: 24, padding: '10px 20px', fontSize: 'var(--fs-sm)', fontWeight: 700, cursor: 'pointer' }}
          >
            ✨ Generate My Insight
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Summary */}
      <div style={{ background: 'linear-gradient(135deg, #fff5f8, #f0f8ff)', borderRadius: 'var(--r)', padding: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
        <p style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--t)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          📊 Based on {insight.basedOnDays} day{insight.basedOnDays !== 1 ? 's' : ''} of your data
        </p>
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--dp)', lineHeight: 1.65 }}>{insight.summary}</p>
      </div>

      {/* Flags */}
      {insight.flags?.length > 0 && (
        <div style={{ marginBottom: 'var(--sp-3)' }}>
          <p style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--mt)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>⚠️ Things to note</p>
          {insight.flags.map((flag, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gd)', marginTop: 5, flexShrink: 0 }} />
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--md)', lineHeight: 1.55 }}>{flag}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      {insight.tips?.length > 0 && (
        <div style={{ marginBottom: 'var(--sp-3)' }}>
          <p style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--mt)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>💡 Personalised tips</p>
          {insight.tips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--t)', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                {i + 1}
              </div>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--md)', lineHeight: 1.55 }}>{tip}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 10, color: '#ccc' }}>
          Generated {new Date(insight.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </p>
        <button
          onClick={onGenerate}
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 12px', fontSize: 10, color: 'var(--mt)', cursor: 'pointer' }}
        >
          Refresh ↻
        </button>
      </div>

      <p style={{ fontSize: 10, color: '#ccc', marginTop: 6, lineHeight: 1.4 }}>
        AI insights are informational only. Always consult a qualified healthcare professional.
      </p>
    </div>
  );
}

// ─── Today's vitals strip ─────────────────────────────────────────────────────
function VitalsStrip({ todayEntry, onLogVital }) {
  const [editBp, setEditBp]   = useState(false);
  const [bpSys, setBpSys]     = useState('');
  const [bpDia, setBpDia]     = useState('');
  const [editMood, setEditMood] = useState(false);

  const MOODS = [
    { key: 'great', label: '😄 Great' },
    { key: 'good',  label: '🙂 Good'  },
    { key: 'okay',  label: '😐 Okay'  },
    { key: 'low',   label: '😔 Low'   },
    { key: 'bad',   label: '😢 Bad'   },
  ];

  const hasBp   = todayEntry?.bp;
  const hasMood = todayEntry?.mood;

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--sp-3)' }}>
      {/* BP tile */}
      <div
        onClick={() => setEditBp((v) => !v)}
        style={{ flex: 1, minWidth: 100, padding: '10px 12px', background: hasBp ? 'var(--bll)' : 'var(--warm)', borderRadius: 12, cursor: 'pointer', border: '1px solid var(--border)' }}
      >
        <p style={{ fontSize: 10, color: 'var(--mt)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>Blood Pressure</p>
        {hasBp
          ? <p style={{ fontSize: 'var(--fs-md)', fontWeight: 800, color: 'var(--bl)' }}>{hasBp.sys}/{hasBp.dia}</p>
          : <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)' }}>Tap to log</p>
        }
      </div>

      {/* Mood tile */}
      <div
        onClick={() => setEditMood((v) => !v)}
        style={{ flex: 1, minWidth: 100, padding: '10px 12px', background: hasMood ? 'var(--sgl)' : 'var(--warm)', borderRadius: 12, cursor: 'pointer', border: '1px solid var(--border)' }}
      >
        <p style={{ fontSize: 10, color: 'var(--mt)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>Today's Mood</p>
        {hasMood
          ? <p style={{ fontSize: 22 }}>{MOOD_ICONS[hasMood]}</p>
          : <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)' }}>Tap to log</p>
        }
      </div>

      {/* Inline BP input */}
      {editBp && (
        <div style={{ width: '100%', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="number" placeholder="Systolic" value={bpSys} onChange={(e) => setBpSys(e.target.value)}
            style={{ flex: 1, minWidth: 80, padding: 8, borderRadius: 8, border: '1px solid var(--border)', fontSize: 'var(--fs-sm)' }}
          />
          <span style={{ color: 'var(--mt)' }}>/</span>
          <input
            type="number" placeholder="Diastolic" value={bpDia} onChange={(e) => setBpDia(e.target.value)}
            style={{ flex: 1, minWidth: 80, padding: 8, borderRadius: 8, border: '1px solid var(--border)', fontSize: 'var(--fs-sm)' }}
          />
          <button
            onClick={async () => {
              if (bpSys && bpDia) {
                await onLogVital('bp', { sys: Number(bpSys), dia: Number(bpDia), loggedAt: new Date().toISOString() });
                setEditBp(false); setBpSys(''); setBpDia('');
              }
            }}
            style={{ padding: '8px 16px', background: 'var(--t)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 'var(--fs-sm)', fontWeight: 700 }}
          >Save</button>
        </div>
      )}

      {/* Inline mood picker */}
      {editMood && (
        <div style={{ width: '100%', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {MOODS.map((m) => (
            <button
              key={m.key}
              onClick={async () => { await onLogVital('mood', m.key); setEditMood(false); }}
              style={{
                padding: '6px 12px', borderRadius: 20, border: `1px solid ${todayEntry?.mood === m.key ? 'var(--t)' : 'var(--border)'}`,
                background: todayEntry?.mood === m.key ? 'var(--t)' : 'var(--warm)',
                color: todayEntry?.mood === m.key ? '#fff' : 'var(--dp)',
                fontSize: 'var(--fs-xs)', cursor: 'pointer', fontWeight: 600,
              }}
            >{m.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Symptom logger ───────────────────────────────────────────────────────────
function SymptomLogger({ symptoms, todayEntry, onLogSymptoms, saving }) {
  const existing  = todayEntry?.symptoms || [];
  const [selected, setSelected] = useState(
    () => Object.fromEntries(existing.map((s) => [s.id, s.severity]))
  );

  // Keep in sync if todayEntry updates from Firestore
  // (runs when todayEntry changes — keeps local state current)
  const existingStr = JSON.stringify(existing.map((s) => s.id).sort());
  const [lastStr, setLastStr]   = useState(existingStr);
  if (existingStr !== lastStr) {
    setSelected(Object.fromEntries(existing.map((s) => [s.id, s.severity])));
    setLastStr(existingStr);
  }

  const toggle = (id) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id]; else next[id] = 1;
      return next;
    });
  };

  const setSeverity = (id, val) => {
    setSelected((prev) => ({ ...prev, [id]: Number(val) }));
  };

  const save = async () => {
    const symptomList = Object.entries(selected).map(([id, severity]) => {
      const sym = symptoms.find((s) => s.id === id);
      return { id, label: sym?.label || id, severity, icon: sym?.icon || '●' };
    });
    await onLogSymptoms(symptomList);
  };

  const hasChanges = JSON.stringify(selected) !== JSON.stringify(
    Object.fromEntries(existing.map((s) => [s.id, s.severity]))
  );

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 'var(--sp-3)' }}>
        {symptoms.map((sym) => {
          const active   = sym.id in selected;
          const severity = selected[sym.id] || 1;
          return (
            <div key={sym.id}>
              <button
                onClick={() => toggle(sym.id)}
                style={{
                  padding: '6px 12px', borderRadius: 20, cursor: 'pointer',
                  border: `1.5px solid ${active ? 'var(--t)' : 'var(--border)'}`,
                  background: active ? 'rgba(214,58,110,0.08)' : 'var(--warm)',
                  color: active ? 'var(--t)' : 'var(--mt)',
                  fontSize: 'var(--fs-xs)', fontWeight: active ? 700 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {sym.icon} {sym.label}
              </button>
              {active && (
                <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 4 }}>
                  <span style={{ fontSize: 10, color: 'var(--mt)' }}>Severity</span>
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      onClick={() => setSeverity(sym.id, v)}
                      style={{
                        width: 22, height: 22, borderRadius: '50%', border: 'none', cursor: 'pointer',
                        background: v <= severity ? 'var(--t)' : 'var(--border)',
                        color: v <= severity ? '#fff' : 'var(--mt)',
                        fontSize: 10, fontWeight: 700,
                      }}
                    >{v}</button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {Object.keys(selected).length > 0 && hasChanges && (
        <button
          onClick={save}
          disabled={saving}
          style={{
            width: '100%', padding: 'var(--sp-3)',
            background: saving ? 'var(--border)' : 'linear-gradient(135deg, var(--t), #e05080)',
            color: saving ? 'var(--mt)' : '#fff', border: 'none', borderRadius: 'var(--r)',
            fontSize: 'var(--fs-sm)', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving…' : `Save ${Object.keys(selected).length} symptom${Object.keys(selected).length !== 1 ? 's' : ''} to my log`}
        </button>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function HealthInsightPanel({
  journeyType,
  symptoms,
  heatmapData,
  todayEntry,
  loadingToday,
  loadingRecent,
  saving,
  insightLoading,
  insightError,
  onLogSymptoms,
  onLogVital,
  onGenerateInsight,
}) {
  const [activeTab, setActiveTab] = useState('log');

  const insight   = todayEntry?.aiInsight || null;
  const hasData   = heatmapData.some((d) => d.symptomCount > 0);

  const TABS = [
    { key: 'log',     label: '📝 Log'      },
    { key: 'heatmap', label: '🗓️ Heatmap'  },
    { key: 'insight', label: '🤖 AI Insight'},
  ];

  return (
    <div style={{ marginBottom: 'var(--sp-4)' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 'var(--sp-3)', background: 'var(--warm)', borderRadius: 14, padding: 4 }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, padding: '8px 4px', border: 'none', borderRadius: 10, cursor: 'pointer',
              background: activeTab === tab.key ? '#fff' : 'transparent',
              color: activeTab === tab.key ? 'var(--dp)' : 'var(--mt)',
              fontSize: 'var(--fs-xs)', fontWeight: activeTab === tab.key ? 700 : 400,
              boxShadow: activeTab === tab.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
            }}
          >{tab.label}</button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'log' && (
        <div>
          <VitalsStrip todayEntry={todayEntry} onLogVital={onLogVital} />
          <p style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--mt)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Symptoms today — tap to select, rate severity
          </p>
          {loadingToday
            ? <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)' }}>Loading…</p>
            : <SymptomLogger
                symptoms={symptoms}
                todayEntry={todayEntry}
                onLogSymptoms={onLogSymptoms}
                saving={saving}
              />
          }
        </div>
      )}

      {activeTab === 'heatmap' && (
        <div>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginBottom: 8, lineHeight: 1.5 }}>
            Your symptom intensity over the past 14 days. Each tile colour reflects total severity logged that day.
          </p>
          <SymptomHeatmap heatmapData={heatmapData} loadingRecent={loadingRecent} />
          {!hasData && !loadingRecent && (
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', textAlign: 'center', marginTop: 12 }}>
              No data logged yet — start tracking on the Log tab and your heatmap will fill in.
            </p>
          )}
        </div>
      )}

      {activeTab === 'insight' && (
        <AIInsightCard
          insight={insight}
          insightLoading={insightLoading}
          insightError={insightError}
          onGenerate={onGenerateInsight}
          hasData={hasData}
        />
      )}
    </div>
  );
}
