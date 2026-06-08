import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { WCard, SectionTitle, Tag } from '../../components/ui';
import { formatTime } from '../../utils/helpers';

const STORAGE_KEY = 'kickHistory';
const MAX_HISTORY_SIZE = 30;
const KICK_THRESHOLDS = {
  GOOD: 10,
  MONITOR: 6,
};

export default function Kicks() {
  // Session state
  const [session, setSession] = useState(false);
  const [sessionKicks, setSessionKicks] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  
  const startTimeRef = useRef(null);
  
  // Load ALL real data from localStorage
  const [realHistory, setRealHistory] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return saved;
    } catch {
      return [];
    }
  });
  
  // Calculate today's kicks from real data
  const today = new Date().toLocaleDateString('en-GB', { 
    weekday: 'short', 
    day: 'numeric' 
  });
  
  const todayEntry = realHistory.find(entry => entry.date === today);
  const savedKicks = todayEntry?.kicks || 0;
  const totalKicksToday = savedKicks + sessionKicks;
  
  // Get last 7 days from REAL data ONLY
  const history = realHistory.slice(0, 7).map(entry => ({
    date: entry.date,
    kicks: entry.kicks,
    status: entry.kicks >= KICK_THRESHOLDS.GOOD ? 'high' 
           : entry.kicks >= KICK_THRESHOLDS.MONITOR ? 'normal' 
           : 'low'
  }));
  
  // If no real data exists, show empty state (NOT mock data)
  const hasData = realHistory.length > 0;
  const maxKick = hasData ? Math.max(...history.map(h => h.kicks), totalKicksToday) : 10;
  
  const status = totalKicksToday >= KICK_THRESHOLDS.GOOD ? "GOOD" 
                : totalKicksToday >= KICK_THRESHOLDS.MONITOR ? "MONITOR" 
                : "LOW";
  
  const [bg, border] = totalKicksToday >= KICK_THRESHOLDS.GOOD
    ? ["linear-gradient(135deg,var(--sgl),#D4F0DD)", "var(--sgm)"]
    : totalKicksToday >= KICK_THRESHOLDS.MONITOR
    ? ["linear-gradient(135deg,var(--gdl),#FEE8C8)", "var(--gdm)"]
    : ["linear-gradient(135deg,var(--rdl),#FCE0DE)", "var(--rdm)"];
  
  // Calculate baseline from REAL history
  const avgKicks = useMemo(() => {
    if (realHistory.length === 0) return '—';
    const sum = realHistory.reduce((acc, h) => acc + h.kicks, 0);
    return (sum / realHistory.length).toFixed(1);
  }, [realHistory]);
  
  // Find low days from REAL history
  const lowDays = history.filter(h => h.status === 'low');
  
  useEffect(() => {
    let t;
    if (session && startTimeRef.current) {
      t = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }
    return () => clearInterval(t);
  }, [session]);
  
  const startSession = () => {
    const now = Date.now();
    startTimeRef.current = now;
    setStartTime(now);
    setSession(true);
    setSessionKicks(0);
    setElapsed(0);
  };
  
  const logKick = () => {
    if (!session) return;
    setSessionKicks(k => k + 1);
  };
  
  const stopSession = () => {
    if (!session) return;
    
    const totalKicksForDay = savedKicks + sessionKicks;
    
    const entry = {
      date: today,
      kicks: totalKicksForDay,
      sessionKicks: sessionKicks,
      elapsed: elapsed,
      timestamp: new Date().toISOString()
    };
    
    try {
      const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const filteredPrev = prev.filter(e => e.date !== today);
      const newHistory = [entry, ...filteredPrev].slice(0, MAX_HISTORY_SIZE);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      setRealHistory(newHistory);
    } catch (error) {
      console.error('Failed to save kick session:', error);
    }
    
    setSession(false);
    setSessionKicks(0);
    setStartTime(null);
    startTimeRef.current = null;
    setElapsed(0);
  };
  
  const statusDisplay = status === "GOOD" 
    ? { label: "✅ Normal", bg: "var(--sgl)", tc: "var(--sg)" }
    : status === "MONITOR"
    ? { label: "⚠️ Keep watching", bg: "var(--gdl)", tc: "var(--gd)" }
    : { label: "🚨 Seek help", bg: "var(--rdl)", tc: "var(--rd)" };
  
  return (
    <div className="page-pad">
      <SectionTitle title="👶 Kick Counter" />

      <WCard style={{ background: bg,  display: "flex", flexDirection: "column", alignItems: "normal", border: `1.5px solid ${border}44` }}>
        <div style={{ textAlign: "center", padding: "var(--sp-3) 0 var(--sp-4)" }}>
          <div style={{ 
            fontSize: "var(--fs-hero)", 
            fontWeight: 900, 
            color: totalKicksToday >= KICK_THRESHOLDS.GOOD ? "var(--sg)" 
                   : totalKicksToday >= KICK_THRESHOLDS.MONITOR ? "var(--gd)" 
                   : "var(--rd)", 
            lineHeight: 1, 
            marginBottom: "var(--sp-2)" 
          }}>
            {session ? sessionKicks : totalKicksToday}
          </div>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", fontWeight: 600, marginBottom: "var(--sp-2)" }}>
            {session ? "kicks in this session" : "kicks logged today"}
          </p>
          <Tag
            label={statusDisplay.label}
            bg={statusDisplay.bg}
            tc={statusDisplay.tc}
          />
          {session && (
            <p style={{ fontSize: "var(--fs-2xl)", fontWeight: 800, color: "var(--dp)", marginTop: "var(--sp-3)" }}>
              {formatTime(elapsed) || '00:00'}
            </p>
          )}
        </div>
        
        {!session ? (
          <button 
            onClick={startSession} 
            className="btn-primary" 
            style={{ background: "var(--dp)", color: "#fff" }}
          >
            ▶ Start Session
          </button>
        ) : (
          <div style={{ display: "flex", gap: "var(--gap-md)" }}>
            <button 
              onClick={logKick} 
              style={{ 
                flex: 2, 
                padding: "var(--sp-4)", 
                background: "var(--sg)", 
                color: "#fff", 
                border: "none", 
                borderRadius: "var(--r)", 
                fontSize: "var(--fs-md)", 
                fontWeight: 800, 
                cursor: "pointer", 
                minHeight: "var(--touch)" 
              }}
            >
              👶 Kick! ({sessionKicks})
            </button>
            <button 
              onClick={stopSession} 
              style={{ 
                flex: 1, 
                padding: "var(--sp-4)", 
                background: "var(--warm)", 
                color: "var(--md)", 
                border: "1px solid var(--border)", 
                borderRadius: "var(--r)", 
                fontSize: "var(--fs-sm)", 
                fontWeight: 700, 
                cursor: "pointer", 
                minHeight: "var(--touch)" 
              }}
            >
              ⏹ Stop
            </button>
          </div>
        )}
      </WCard>

      <WCard style={{ background: "var(--lvl)", display: "flex", flexDirection: "column", alignItems: "normal", border: "1px solid var(--lvm)44" }}>
        <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--lv)", marginBottom: "var(--sp-3)" }}>
          AI Movement Intelligence
        </p>
        {[
          { 
            l: "Today's pattern", 
            v: totalKicksToday >= KICK_THRESHOLDS.GOOD ? "Good — active movement" 
               : totalKicksToday >= KICK_THRESHOLDS.MONITOR ? "Normal — moderate activity" 
               : totalKicksToday === 0 ? "No data yet" : "Low — reduced activity", 
            dot: status === "GOOD" ? "var(--sg)" : status === "MONITOR" ? "var(--lv)" : "var(--rd)" 
          },
          { l: "Best movement time", v: realHistory.length === 0 ? "Track 3+ days to see pattern" : "Based on your history", dot: "var(--lv)" },
          { l: "Your baseline", v: avgKicks === '—' ? "Track first session" : `${avgKicks} kicks/2hr`, dot: "var(--bl)" },
          { l: "Alert threshold", v: `Below ${KICK_THRESHOLDS.MONITOR} → investigate`, dot: "var(--rd)" }
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "clamp(6px,1.5vw,9px) 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
            <span style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", flex: 1 }}>{s.l}</span>
            <span style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: "var(--dp)" }}>{s.v}</span>
          </div>
        ))}
      </WCard>

      <SectionTitle title="7-Day History" />
      <WCard style={{ display: "flex", flexDirection: "column", alignItems: "normal", border: "1px solid var(--lvm)44" }}>
        {!hasData ? (
          // Empty state - NO mock data
          <div style={{ 
            textAlign: "center", 
            padding: "var(--sp-5)", 
            color: "var(--mt)",
            fontFamily: "Poppins, sans-serif"
          }}>
            <p style={{ fontSize: "var(--fs-md)", marginBottom: "var(--sp-2)" }}>📊 No kick data yet</p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>
              Start your first session above to see your 7-day history here.
            </p>
          </div>
        ) : (
          <>
            <div className="chart-wrap">
              {history.map((h, i) => (
                <div key={i} className="chart-col">
                  <span className="chart-val">{h.kicks}</span>
                  <div 
                    className="chart-bar" 
                    style={{ 
                      height: `${(h.kicks / (maxKick + 2)) * 100}%`, 
                      background: h.status === "normal" ? "var(--sg)" 
                               : h.status === "low" ? "var(--rd)" 
                               : "var(--t)" 
                    }} 
                  />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "var(--gap-sm)" }}>
              {history.map((h, i) => (
                <div key={i} className="chart-lbl" style={{ flex: 1 }}>
                  {h.date === today ? "Now" 
                   : h.date === "Yest" ? "Yst" 
                   : h.date}
                </div>
              ))}
            </div>
            
            {/* Dynamic low kick alert from REAL data */}
            {lowDays.length > 0 && (
              <div style={{ 
                marginTop: "var(--sp-3)", 
                padding: "var(--sp-3)", 
                background: "var(--rdl)", 
                borderRadius: "var(--r)", 
                display: "flex", 
                gap: "var(--gap-sm)", 
                alignItems: "center" 
              }}>
                <span style={{ fontSize: "var(--fs-md)" }}>⚠️</span>
                <p style={{ fontSize: "var(--fs-xs)", color: "var(--rd)", fontWeight: 600 }}>
                  {lowDays[0].date}: Only {lowDays[0].kicks} kicks. {lowDays.length > 1 ? `Also on ${lowDays.length - 1} other day(s). ` : ''}
                  Consider contacting your midwife if this pattern continues.
                </p>
              </div>
            )}
          </>
        )}
      </WCard>
    </div>
  );
}