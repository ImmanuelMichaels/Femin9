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
  
  // Get today's date in consistent format
  const getTodayKey = useCallback(() => {
    const today = new Date();
    return today.toLocaleDateString('en-GB', { 
      weekday: 'short', 
      day: 'numeric' 
    });
  }, []);
  
  const todayKey = getTodayKey();
  
  // Find today's entry in real history
  const todayEntry = realHistory.find(entry => entry.date === todayKey);
  const savedKicks = todayEntry?.kicks || 0;
  const totalKicksToday = savedKicks + sessionKicks;
  
  // FIX: Get last 7 days from REAL data with proper date ordering
  const last7Days = useMemo(() => {
    // Create array of last 7 days with proper dates
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateKey = date.toLocaleDateString('en-GB', { 
        weekday: 'short', 
        day: 'numeric' 
      });
      
      // Find entry for this date from real history
      const entry = realHistory.find(e => e.date === dateKey);
      
      days.push({
        date: dateKey,
        fullDate: date,
        kicks: entry?.kicks || 0,
        hasData: !!entry,
        sessionCount: entry?.sessionCount || 0,
        status: entry ? (entry.kicks >= KICK_THRESHOLDS.GOOD ? 'high' 
                : entry.kicks >= KICK_THRESHOLDS.MONITOR ? 'normal' 
                : 'low') : 'no-data'
      });
    }
    
    return days;
  }, [realHistory]);
  
  // Update today's entry in the history when session ends
  const updateTodayInHistory = useCallback((newHistory) => {
    // Make sure today's entry is at the correct position
    const todayIndex = newHistory.findIndex(e => e.date === todayKey);
    if (todayIndex !== -1) {
      const updatedHistory = [...newHistory];
      updatedHistory[todayIndex] = {
        ...updatedHistory[todayIndex],
        kicks: totalKicksToday,
        sessionKicks: sessionKicks,
        elapsed: elapsed,
        lastUpdated: new Date().toISOString()
      };
      return updatedHistory;
    }
    return newHistory;
  }, [todayKey, totalKicksToday, sessionKicks, elapsed]);
  
  // Check if we have any data in the last 7 days
  const hasDataInLast7Days = useMemo(() => {
    return last7Days.some(day => day.hasData);
  }, [last7Days]);
  
  // Find max kick value for chart scaling (from last 7 days + today's session)
  const maxKick = useMemo(() => {
    const allKicks = [...last7Days.map(d => d.kicks), totalKicksToday];
    const max = Math.max(...allKicks, 5); // Minimum scale of 5
    return max;
  }, [last7Days, totalKicksToday]);
  
  // Determine status
  const status = totalKicksToday >= KICK_THRESHOLDS.GOOD ? "GOOD" 
                : totalKicksToday >= KICK_THRESHOLDS.MONITOR ? "MONITOR" 
                : totalKicksToday === 0 ? "NO_DATA" 
                : "LOW";
  
  const [bg, border] = totalKicksToday >= KICK_THRESHOLDS.GOOD
    ? ["linear-gradient(135deg,var(--sgl),#D4F0DD)", "var(--sgm)"]
    : totalKicksToday >= KICK_THRESHOLDS.MONITOR
    ? ["linear-gradient(135deg,var(--gdl),#FEE8C8)", "var(--gdm)"]
    : totalKicksToday === 0
    ? ["linear-gradient(135deg,var(--lvl),#F0F0F0)", "var(--lvm)"]
    : ["linear-gradient(135deg,var(--rdl),#FCE0DE)", "var(--rdm)"];
  
  // Calculate baseline from REAL history (last 7 days with data)
  const avgKicks = useMemo(() => {
    const daysWithData = last7Days.filter(d => d.hasData);
    if (daysWithData.length === 0) return '—';
    const sum = daysWithData.reduce((acc, d) => acc + d.kicks, 0);
    return (sum / daysWithData.length).toFixed(1);
  }, [last7Days]);
  
  // Find low days from last 7 days
  const lowDays = last7Days.filter(d => d.status === 'low' && d.hasData);
  
  // Find best movement time based on real data
  const bestMovementTime = useMemo(() => {
    if (realHistory.length === 0) return "Track 3+ days to see pattern";
    
    // Group sessions by time of day
    const timeSlots = {
      morning: { count: 0, totalKicks: 0 },
      afternoon: { count: 0, totalKicks: 0 },
      evening: { count: 0, totalKicks: 0 },
      night: { count: 0, totalKicks: 0 }
    };
    
    realHistory.forEach(entry => {
      if (entry.timestamp) {
        const hour = new Date(entry.timestamp).getHours();
        if (hour >= 5 && hour < 12) {
          timeSlots.morning.count++;
          timeSlots.morning.totalKicks += entry.sessionKicks || entry.kicks;
        } else if (hour >= 12 && hour < 17) {
          timeSlots.afternoon.count++;
          timeSlots.afternoon.totalKicks += entry.sessionKicks || entry.kicks;
        } else if (hour >= 17 && hour < 21) {
          timeSlots.evening.count++;
          timeSlots.evening.totalKicks += entry.sessionKicks || entry.kicks;
        } else {
          timeSlots.night.count++;
          timeSlots.night.totalKicks += entry.sessionKicks || entry.kicks;
        }
      }
    });
    
    // Find best slot by average kicks
    let bestSlot = null;
    let bestAvg = 0;
    
    Object.entries(timeSlots).forEach(([slot, data]) => {
      if (data.count > 0) {
        const avg = data.totalKicks / data.count;
        if (avg > bestAvg) {
          bestAvg = avg;
          bestSlot = slot;
        }
      }
    });
    
    const slotLabels = {
      morning: "Morning (5-11am)",
      afternoon: "Afternoon (12-4pm)",
      evening: "Evening (5-8pm)",
      night: "Night (9pm-4am)"
    };
    
    return bestSlot ? slotLabels[bestSlot] : "Log more sessions";
  }, [realHistory]);
  
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
      date: todayKey,
      kicks: totalKicksForDay,
      sessionKicks: sessionKicks,
      elapsed: elapsed,
      sessionCount: (todayEntry?.sessionCount || 0) + 1,
      timestamp: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    try {
      const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      // Remove any existing entry for today
      const filteredPrev = prev.filter(e => e.date !== todayKey);
      // Add new entry at the beginning
      const newHistory = [entry, ...filteredPrev].slice(0, MAX_HISTORY_SIZE);
      // Sort by date (most recent first)
      newHistory.sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateB - dateA;
      });
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
    : status === "NO_DATA"
    ? { label: "📝 No data yet", bg: "var(--lvl)", tc: "var(--mt)" }
    : { label: "🚨 Seek help", bg: "var(--rdl)", tc: "var(--rd)" };
  
  return (
    <div className="page-pad">
      <SectionTitle title=" Kick Counter 👶" />

      <WCard style={{ background: bg,  display: "flex", flexDirection: "column", alignItems: "normal", border: `1.5px solid ${border}44` }}>
        <div style={{ textAlign: "center", padding: "var(--sp-3) 0 var(--sp-4)" }}>
          <div style={{ 
            fontSize: "var(--fs-hero)", 
            fontWeight: 900, 
            color: totalKicksToday >= KICK_THRESHOLDS.GOOD ? "var(--sg)" 
                   : totalKicksToday >= KICK_THRESHOLDS.MONITOR ? "var(--gd)" 
                   : totalKicksToday === 0 ? "var(--mt)"
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
            style={{ background: "var(--dp)", color: "#fff", padding: "20px", fontSize: "var(--fs-md)", fontWeight: 700, borderRadius: "var(--r)", cursor: "pointer", minHeight: "var(--touch)" }}
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
               : totalKicksToday === 0 ? "No data yet — start a session" 
               : "Low — reduced activity — monitor closely", 
            dot: status === "GOOD" ? "var(--sg)" : status === "MONITOR" ? "var(--lv)" : status === "NO_DATA" ? "var(--mt)" : "var(--rd)" 
          },
          { l: "Best movement time", v: bestMovementTime, dot: "var(--lv)" },
          { l: "Your baseline (7d avg)", v: avgKicks === '—' ? "Track first session" : `${avgKicks} kicks/day`, dot: "var(--bl)" },
          { l: "Alert threshold", v: `Below ${KICK_THRESHOLDS.MONITOR} kicks → investigate`, dot: "var(--rd)" }
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "clamp(6px,1.5vw,9px) 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
            <span style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", flex: 1 }}>{s.l}</span>
            <span style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: "var(--dp)", textAlign: "right" }}>{s.v}</span>
          </div>
        ))}
      </WCard>

      <SectionTitle title="7-Day History" />
      <WCard style={{ display: "flex", flexDirection: "column", alignItems: "normal", border: "1px solid var(--lvm)44" }}>
        {!hasDataInLast7Days ? (
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
            {/* Chart bars */}
            <div className="chart-wrap" style={{ display: "flex", gap: "var(--gap-sm)", alignItems: "flex-end", height: 120, marginBottom: "var(--sp-2)" }}>
              {last7Days.map((day, i) => (
                <div key={i} className="chart-col" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                  <span className="chart-val" style={{ fontSize: "var(--fs-xs)", fontWeight: 700, marginBottom: "var(--sp-1)" }}>
                    {day.kicks}
                  </span>
                  <div 
                    className="chart-bar" 
                    style={{ 
                      width: "100%",
                      height: `${(day.kicks / (maxKick + 2)) * 100}%`, 
                      background: !day.hasData ? "var(--lvm)" 
                               : day.status === "high" ? "var(--sg)" 
                               : day.status === "normal" ? "var(--gd)" 
                               : day.status === "low" ? "var(--rd)"
                               : "var(--lvm)",
                      borderRadius: "var(--r)",
                      transition: "height 0.3s ease",
                      minHeight: day.kicks === 0 ? "4px" : "auto"
                    }} 
                  />
                </div>
              ))}
            </div>
            
            {/* Date labels */}
            <div style={{ display: "flex", gap: "var(--gap-sm)", marginTop: "var(--sp-2)" }}>
              {last7Days.map((day, i) => (
                <div key={i} className="chart-lbl" style={{ flex: 1, textAlign: "center", fontSize: "var(--fs-2xs)" }}>
                  {day.date === todayKey ? "Today" 
                   : day.date.split(' ')[0]}
                </div>
              ))}
            </div>
            
            {/* Data quality indicator */}
            <div style={{ marginTop: "var(--sp-2)", display: "flex", justifyContent: "center", gap: "var(--gap-sm)", flexWrap: "wrap" }}>
              {last7Days.filter(d => !d.hasData).length > 0 && (
                <Tag 
                  label={`${last7Days.filter(d => !d.hasData).length} day(s) with no data`} 
                  bg="var(--lvl)" 
                  tc="var(--mt)" 
                />
              )}
              {last7Days.filter(d => d.hasData).length > 0 && (
                <Tag 
                  label={`${last7Days.filter(d => d.hasData).length}/7 days tracked`} 
                  bg="var(--sgl)" 
                  tc="var(--sg)" 
                />
              )}
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
                alignItems: "flex-start" 
              }}>
                <span style={{ fontSize: "var(--fs-md)" }}>⚠️</span>
                <div>
                  <p style={{ fontSize: "var(--fs-xs)", color: "var(--rd)", fontWeight: 600, marginBottom: "var(--sp-1)" }}>
                    Low movement detected:
                  </p>
                  <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)" }}>
                    {lowDays.map(d => `${d.date} (${d.kicks} kicks)`).join(', ')}
                    {lowDays.length === 1 ? '. ' : '. '}
                    Consider contacting your midwife if this pattern continues.
                  </p>
                </div>
              </div>
            )}
            
            {/* Encouragement message */}
            {hasDataInLast7Days && lowDays.length === 0 && totalKicksToday === 0 && (
              <div style={{ 
                marginTop: "var(--sp-3)", 
                padding: "var(--sp-3)", 
                background: "var(--bll)", 
                borderRadius: "var(--r)", 
                textAlign: "center" 
              }}>
                <p style={{ fontSize: "var(--fs-xs)", color: "var(--bl)" }}>
                  ✨ You've been consistent! Time to log today's session.
                </p>
              </div>
            )}
          </>
        )}
      </WCard>
      
      {/* Tips based on real data */}
      {hasDataInLast7Days && avgKicks !== '—' && parseFloat(avgKicks) < KICK_THRESHOLDS.MONITOR && (
        <WCard style={{ background: "var(--gdl)", marginTop: "var(--gap-md)" }}>
          <p style={{ fontWeight: 800, marginBottom: "var(--sp-2)" }}>💡 Tip for increasing movement tracking</p>
          <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)" }}>
            Your {avgKicks}-kick average is below the recommended threshold. Try tracking after meals or when lying down in the evening — babies are often most active then.
          </p>
        </WCard>
      )}
    </div>
  );
}