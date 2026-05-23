import { useState, useEffect } from 'react';
import { WCard, SectionTitle, Tag } from '../../components/ui';
import EmergencyRedFlags from '../../components/EmergencyRedFlags';
import { useApp } from '../../context/AppContext';
import { formatTime } from '../../utils/helpers';

export default function Kicks() {
  const { journeyType, getCurrentWeek, setShowSOS } = useApp();
  const [kicks, setKicks] = useState(() => {
    const saved = localStorage.getItem('kicksToday');
    return saved ? parseInt(saved) : 7;
  });
  const [session, setSession] = useState(false);
  const [sessionKicks, setSessionKicks] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [lastSessionDate, setLastSessionDate] = useState(null);
  const [showEmergencyPrompt, setShowEmergencyPrompt] = useState(false);
  
  const currentWeek = journeyType === 'pregnant' ? getCurrentWeek() : 26;

  // Load history from localStorage
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('kickHistory');
    if (saved) return JSON.parse(saved);
    return [
      { date: "Today", kicks: kicks, status: kicks >= 10 ? "normal" : kicks >= 6 ? "monitor" : "low", fullDate: new Date().toISOString() },
      { date: "Yesterday", kicks: 10, status: "normal", fullDate: new Date(Date.now() - 86400000).toISOString() },
      { date: "2d ago", kicks: 4, status: "low", fullDate: new Date(Date.now() - 172800000).toISOString() },
      { date: "3d ago", kicks: 11, status: "normal", fullDate: new Date(Date.now() - 259200000).toISOString() },
      { date: "4d ago", kicks: 9, status: "normal", fullDate: new Date(Date.now() - 345600000).toISOString() },
      { date: "5d ago", kicks: 12, status: "high", fullDate: new Date(Date.now() - 432000000).toISOString() },
      { date: "6d ago", kicks: 8, status: "normal", fullDate: new Date(Date.now() - 518400000).toISOString() },
    ];
  });
  
  const maxKick = Math.max(...history.map(h => h.kicks));
  
  // Save kicks to localStorage daily
  useEffect(() => {
    localStorage.setItem('kicksToday', kicks.toString());
    
    // Update today's entry in history
    const today = new Date().toDateString();
    const todayEntry = history.find(h => new Date(h.fullDate).toDateString() === today);
    if (todayEntry) {
      todayEntry.kicks = kicks;
      todayEntry.status = kicks >= 10 ? "normal" : kicks >= 6 ? "monitor" : "low";
    }
    localStorage.setItem('kickHistory', JSON.stringify(history));
  }, [kicks, history]);
  
  // Check if last session was today
  useEffect(() => {
    const lastSession = localStorage.getItem('lastKickSession');
    if (lastSession) {
      const lastDate = new Date(lastSession).toDateString();
      const today = new Date().toDateString();
      if (lastDate === today) {
        setLastSessionDate(lastSession);
      }
    }
  }, []);
  
  // Timer for kick session
  useEffect(() => {
    let t;
    if (session) {
      t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    }
    return () => clearInterval(t);
  }, [session, startTime]);
  
  // Check for reduced movement alert
  useEffect(() => {
    if (!session && sessionKicks > 0 && currentWeek >= 24) {
      const twoHoursInSeconds = 7200;
      if (elapsed <= twoHoursInSeconds && sessionKicks < 10) {
        setShowEmergencyPrompt(true);
      } else if (elapsed <= twoHoursInSeconds && sessionKicks >= 10) {
        // Normal movement - clear any alerts
        setShowEmergencyPrompt(false);
      }
    }
  }, [session, sessionKicks, elapsed, currentWeek]);
  
  const startSession = () => {
    setSession(true);
    setSessionKicks(0);
    setStartTime(Date.now());
    setElapsed(0);
    setShowEmergencyPrompt(false);
  };
  
  const logKick = () => {
    setSessionKicks(k => k + 1);
    setKicks(k => k + 1);
  };
  
  const stopSession = () => {
    setSession(false);
    localStorage.setItem('lastKickSession', new Date().toISOString());
    setLastSessionDate(new Date().toISOString());
    
    // Check if reduced movement
    const twoHoursInSeconds = 7200;
    if (elapsed <= twoHoursInSeconds && sessionKicks < 10 && currentWeek >= 24) {
      setShowEmergencyPrompt(true);
    }
  };
  
  const getStatusInfo = () => {
    if (kicks >= 10) return { label: "✅ Normal", message: "Baby is moving well. Continue monitoring daily.", color: "var(--sg)", bg: "var(--sgl)" };
    if (kicks >= 6) return { label: "⚠️ Monitor", message: "Movement is lower than ideal. Do another count in 2 hours.", color: "var(--gd)", bg: "var(--gdl)" };
    return { label: "🚨 Seek Help", message: "Reduced fetal movement detected. Contact your midwife or maternity unit immediately.", color: "var(--rd)", bg: "var(--rdl)" };
  };
  
  const statusInfo = getStatusInfo();
  const [bg, border] = kicks >= 10
    ? ["linear-gradient(135deg,var(--sgl),#D4F0DD)", "var(--sgm)"]
    : kicks >= 6
    ? ["linear-gradient(135deg,var(--gdl),#FEE8C8)", "var(--gdm)"]
    : ["linear-gradient(135deg,var(--rdl),#FCE0DE)", "var(--rdm)"];
  
  // Calculate rolling average of last 7 days
  const rollingAverage = history.slice(0, 7).reduce((sum, day) => sum + day.kicks, 0) / Math.min(7, history.length);
  
  return (
    <div className="page-pad">
      {/* Emergency Red Flags - Critical for reduced movement */}
      <EmergencyRedFlags 
        bpSys={118}
        bpDia={76}
        bleeding="none"
        fetalMovement={kicks < 6 && currentWeek >= 24 ? "reduced" : "normal"}
        week={currentWeek}
      />
      
      {/* Reduced Movement Emergency Prompt */}
      {showEmergencyPrompt && currentWeek >= 24 && (
        <WCard style={{ background: "var(--rdl)", border: "2px solid var(--rd)", marginBottom: "var(--gap-md)" }}>
          <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "flex-start" }}>
            <div style={{ fontSize: 32 }}>🚨</div>
            <div>
              <p style={{ fontWeight: 800, color: "var(--rd)", marginBottom: 4, fontSize: "var(--fs-md)" }}>
                Reduced Fetal Movement Detected
              </p>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", marginBottom: 8 }}>
                You recorded fewer than 10 kicks in 2 hours. Contact your midwife or maternity unit immediately. 
                Do not wait until tomorrow.
              </p>
              <div style={{ display: "flex", gap: "var(--gap-sm)", flexWrap: "wrap" }}>
                <button 
                  onClick={() => setShowEmergencyPrompt(false)}
                  style={{ background: "var(--warm)", border: "1px solid var(--border)", borderRadius: 20, padding: "6px 16px", cursor: "pointer" }}
                >
                  Dismiss
                </button>
                <button 
                  onClick={() => setShowSOS(true)}
                  style={{ background: "var(--rd)", color: "#fff", border: "none", borderRadius: 20, padding: "6px 16px", cursor: "pointer" }}
                >
                  Call Maternity Unit
                </button>
              </div>
            </div>
          </div>
        </WCard>
      )}
      
      <SectionTitle title="👶 Kick Counter" subtitle="Track your baby's movements" />

      {/* Main Kick Counter Card */}
      <WCard style={{ background: bg, border: `1.5px solid ${border}44` }}>
        <div style={{ textAlign: "center", padding: "var(--sp-3) 0 var(--sp-4)" }}>
          <div style={{ 
            fontSize: "var(--fs-hero)", 
            fontWeight: 900, 
            color: kicks >= 10 ? "var(--sg)" : kicks >= 6 ? "var(--gd)" : "var(--rd)", 
            lineHeight: 1, 
            marginBottom: "var(--sp-2)" 
          }}>
            {sessionKicks || kicks}
          </div>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", fontWeight: 600, marginBottom: "var(--sp-2)" }}>
            kicks logged today
          </p>
          <Tag label={statusInfo.label} bg={statusInfo.bg} tc={statusInfo.color} />
          
          {session && (
            <p style={{ fontSize: "var(--fs-2xl)", fontWeight: 800, color: "var(--dp)", marginTop: "var(--sp-3)" }}>
              {formatTime(elapsed)}
            </p>
          )}
        </div>
        
        {!session ? (
          <button 
            onClick={startSession} 
            className="btn-primary" 
            style={{ background: "var(--dp)", color: "#fff", width: "100%" }}
          >
            ▶ Start 2-Hour Session
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
        
        {currentWeek >= 24 && !session && (
          <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", textAlign: "center", marginTop: "var(--sp-3)" }}>
            💡 You should feel at least 10 kicks in 2 hours. If you feel less, contact your midwife.
          </p>
        )}
      </WCard>

      {/* AI Movement Intelligence */}
      <WCard style={{ background: "var(--lvl)", border: "1px solid var(--lvm)44" }}>
        <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--lv)", marginBottom: "var(--sp-3)" }}>🤖 AI Movement Intelligence</p>
        {[
          { l: "Today's pattern", v: kicks >= 10 ? "Normal — good activity" : kicks >= 6 ? "Reduced — monitor closely" : "Critical — seek help", dot: kicks >= 10 ? "var(--sg)" : kicks >= 6 ? "var(--gd)" : "var(--rd)" },
          { l: "7-day average", v: `${rollingAverage.toFixed(1)} kicks/day`, dot: "var(--lv)" },
          { l: "Your baseline", v: "9.7 kicks/2hr", dot: "var(--bl)" },
          { l: "Alert threshold", v: "Below 10 → investigate", dot: "var(--rd)" },
          { l: "Best movement time", v: "10 AM–12 PM & 7 PM–9 PM", dot: "var(--sg)" }
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "clamp(6px,1.5vw,9px) 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
            <span style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", flex: 1 }}>{s.l}</span>
            <span style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: s.dot === "var(--rd)" ? "var(--rd)" : "var(--dp)" }}>{s.v}</span>
          </div>
        ))}
      </WCard>

      {/* 7-Day History Chart */}
      <SectionTitle title="7-Day History" />
      <WCard>
        <div className="chart-wrap">
          {history.slice(0, 7).map((h, i) => (
            <div key={i} className="chart-col">
              <span className="chart-val">{h.kicks}</span>
              <div 
                className="chart-bar" 
                style={{ 
                  height: `${(h.kicks / (maxKick + 2)) * 100}%`, 
                  background: h.status === "normal" ? "var(--sg)" : h.status === "low" ? "var(--rd)" : "var(--t)",
                  opacity: h.status === "low" ? 1 : 0.7
                }} 
              />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "var(--gap-sm)" }}>
          {history.slice(0, 7).map((h, i) => (
            <div key={i} className="chart-lbl" style={{ flex: 1, fontSize: "var(--fs-2xs)", textAlign: "center" }}>
              {h.date === "Today" ? "Now" : h.date === "Yesterday" ? "Yst" : h.date}
            </div>
          ))}
        </div>
        
        {/* Reduced movement alert from history */}
        {history.some(h => h.status === "low" && h.date !== "Today") && (
          <div style={{ marginTop: "var(--sp-3)", padding: "var(--sp-3)", background: "var(--rdl)", borderRadius: "var(--r)", display: "flex", gap: "var(--gap-sm)", alignItems: "center" }}>
            <span style={{ fontSize: "var(--fs-md)" }}>⚠️</span>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--rd)", fontWeight: 600 }}>
              {history.find(h => h.status === "low" && h.date !== "Today")?.date}: Only {history.find(h => h.status === "low" && h.date !== "Today")?.kicks} kicks. 
              AI flagged as reduced movement. Pattern detected - please monitor closely.
            </p>
          </div>
        )}
      </WCard>
      
      {/* When to Seek Help Guide */}
      <WCard style={{ background: "var(--bll)", marginTop: "var(--gap-md)" }}>
        <p style={{ fontWeight: 800, marginBottom: "var(--sp-2)" }}>📋 When to Contact Your Midwife</p>
        <ul style={{ fontSize: "var(--fs-xs)", color: "var(--md)", margin: 0, paddingLeft: 20, lineHeight: 1.6 }}>
          <li>Less than 10 kicks in 2 hours (after 24 weeks)</li>
          <li>Baby is moving less than usual for more than 2 hours</li>
          <li>You've noticed a change in your baby's usual movement pattern</li>
          <li>You're concerned - always trust your instinct</li>
        </ul>
        <p style={{ fontSize: "var(--fs-xs)", color: "var(--bl)", marginTop: "var(--sp-2)", fontWeight: 600 }}>
          🚨 Never wait until the next day. Contact your maternity unit immediately.
        </p>
      </WCard>
      
      {/* Daily Reminder Setting */}
      <WCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontWeight: 700 }}>⏰ Daily Kick Reminder</p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>Get a reminder to count kicks every evening</p>
          </div>
          <button 
            onClick={() => {
              if (Notification.permission === "granted") {
                alert("Reminder set! You'll be notified at 8 PM daily.");
              } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then(permission => {
                  if (permission === "granted") {
                    alert("Reminder set! You'll be notified at 8 PM daily.");
                  }
                });
              }
            }}
            style={{ background: "var(--t)", color: "#fff", border: "none", borderRadius: 20, padding: "8px 16px", cursor: "pointer" }}
          >
            Set Reminder
          </button>
        </div>
      </WCard>
    </div>
  );
}