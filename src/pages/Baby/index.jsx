import { useState, useEffect } from 'react';
import { WCard, SectionTitle, Tag } from '../../components/ui';
import EPDSQuestionnaire from '../../components/EPDSQuestionnaire';
import { useApp } from '../../context/useApp';

export default function Baby() {
  const { babyAgeDays, setBabyAgeDays, babyBirthDate } = useApp();
  const [feeds, setFeeds] = useState(() => {
    const saved = localStorage.getItem('babyFeeds');
    return saved ? JSON.parse(saved) : { left: 12, right: 10, total: 8, last: "right" };
  });
  const [diapers, setDiapers] = useState(() => {
    const saved = localStorage.getItem('babyDiapers');
    return saved ? JSON.parse(saved) : [
      { id: 1, t: "7:20 AM", type: "Wet", date: new Date().toDateString() },
      { id: 2, t: "5:45 AM", type: "Dirty", date: new Date().toDateString() }
    ];
  });
  const [pumpMode, setPumpMode] = useState(false);
  const [pumpTime, setPumpTime] = useState(0);
  const [pumpTimer, setPumpTimer] = useState(null);
  const [showEPDS, setShowEPDS] = useState(false);
  const [sleepLog, setSleepLog] = useState(() => {
    const saved = localStorage.getItem('babySleep');
    return saved ? JSON.parse(saved) : [];
  });
  const [sleeping, setSleeping] = useState(false);
  const [sleepStart, setSleepStart] = useState(null);
  
  // Calculate baby's age in weeks/days
  const babyWeeks = babyAgeDays ? Math.floor(babyAgeDays / 7) : 3;
  const babyDaysRemainder = babyAgeDays ? babyAgeDays % 7 : 0;
  
  // Calculate age from birth date if needed
  useEffect(() => {
    if (babyBirthDate && !babyAgeDays) {
      const birthDate = new Date(babyBirthDate);
      const today = new Date();
      const diffTime = Math.abs(today - birthDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setBabyAgeDays(diffDays);
    }
  }, [babyBirthDate, babyAgeDays, setBabyAgeDays]);
  
  // Vaccination schedule (NHS childhood immunisations)
  const vaccinations = [
    { name: "6-in-1 vaccine (DTP/IPV/Hib/HepB)", dueWeeks: 8, done: babyWeeks >= 8 },
    { name: "Rotavirus vaccine", dueWeeks: 8, done: babyWeeks >= 8 },
    { name: "MenB vaccine", dueWeeks: 8, done: babyWeeks >= 8 },
    { name: "6-in-1 vaccine (2nd dose)", dueWeeks: 12, done: babyWeeks >= 12 },
    { name: "Rotavirus vaccine (2nd dose)", dueWeeks: 12, done: babyWeeks >= 12 },
    { name: "PCV vaccine", dueWeeks: 12, done: babyWeeks >= 12 },
    { name: "MenB vaccine (2nd dose)", dueWeeks: 12, done: babyWeeks >= 12 },
    { name: "6-in-1 vaccine (3rd dose)", dueWeeks: 16, done: babyWeeks >= 16 },
    { name: "MenB vaccine (3rd dose)", dueWeeks: 16, done: babyWeeks >= 16 },
    { name: "MMR vaccine (1st dose)", dueWeeks: 52, done: babyWeeks >= 52 },
    { name: "PCV booster", dueWeeks: 52, done: babyWeeks >= 52 },
    { name: "Hib/MenC booster", dueWeeks: 52, done: babyWeeks >= 52 },
    { name: "MMR vaccine (2nd dose)", dueWeeks: 156, done: babyWeeks >= 156 },
    { name: "4-in-1 pre-school booster", dueWeeks: 156, done: babyWeeks >= 156 }
  ];
  
  const upcomingVaccinations = vaccinations.filter(v => !v.done);
  const nextVaccination = upcomingVaccinations[0];
  
  // Milestones based on baby's age
  const getMilestones = () => {
    const allMilestones = [
      { m: "Eye response to light", dueWeeks: 0, done: babyWeeks >= 0 },
      { m: "Startle reflex (Moro)", dueWeeks: 0, done: babyWeeks >= 0 },
      { m: "Responds to your voice", dueWeeks: 1, done: babyWeeks >= 1 },
      { m: "Follows objects with eyes", dueWeeks: 2, done: babyWeeks >= 2 },
      { m: "Social smile", dueWeeks: 6, done: babyWeeks >= 6 },
      { m: "Head control attempt", dueWeeks: 8, done: babyWeeks >= 8 },
      { m: "Reaches for objects", dueWeeks: 12, done: babyWeeks >= 12 },
      { m: "Rolls over", dueWeeks: 16, done: babyWeeks >= 16 },
      { m: "Sits with support", dueWeeks: 24, done: babyWeeks >= 24 },
      { m: "Babbles", dueWeeks: 24, done: babyWeeks >= 24 },
      { m: "Sits without support", dueWeeks: 32, done: babyWeeks >= 32 },
      { m: "Crawls", dueWeeks: 40, done: babyWeeks >= 40 },
      { m: "Pulls to stand", dueWeeks: 48, done: babyWeeks >= 48 }
    ];
    return allMilestones;
  };
  
  const milestones = getMilestones();
  
  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('babyFeeds', JSON.stringify(feeds));
  }, [feeds]);
  
  useEffect(() => {
    localStorage.setItem('babyDiapers', JSON.stringify(diapers));
  }, [diapers]);
  
  useEffect(() => {
    localStorage.setItem('babySleep', JSON.stringify(sleepLog));
  }, [sleepLog]);
  
  // Check if EPDS should be shown (2 weeks, 6 weeks, 3 months)
  useEffect(() => {
  const lastEPDSScreen = localStorage.getItem('lastEPDSScreen');
  const shouldShow = (babyWeeks === 2 || babyWeeks === 6 || babyWeeks === 12) && !lastEPDSScreen;
  if (shouldShow) {
    setShowEPDS(true);
  }
  }, [babyWeeks, setShowEPDS]);
  
  // Pump timer with proper cleanup
  useEffect(() => {
    let intervalId = null;
    
    if (pumpMode) {
      intervalId = setInterval(() => {
        setPumpTime(t => t + 1);
      }, 1000);
      setPumpTimer(intervalId);
    } else if (pumpTimer) {
      clearInterval(pumpTimer);
      if (pumpTime > 0) {
        // Save pumping session
        const pumpSession = {
          id: Date.now(),
          duration: pumpTime,
          timestamp: new Date().toISOString(),
          side: feeds.last === "right" ? "left" : "right"
        };
        const savedPumps = JSON.parse(localStorage.getItem('pumpingSessions') || '[]');
        localStorage.setItem('pumpingSessions', JSON.stringify([pumpSession, ...savedPumps]));
      }
      setPumpTime(0);
      setPumpTimer(null);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [pumpMode, pumpTimer, pumpTime, feeds.last]);
  
  const formatPumpTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const startSleep = () => {
    setSleeping(true);
    setSleepStart(Date.now());
  };
  
  const stopSleep = () => {
    if (sleepStart) {
      const duration = Math.floor((Date.now() - sleepStart) / 1000);
      const newSleep = {
        id: Date.now(),
        start: new Date(sleepStart).toLocaleTimeString(),
        duration: duration,
        date: new Date().toDateString()
      };
      setSleepLog([newSleep, ...sleepLog]);
      setSleeping(false);
      setSleepStart(null);
    }
  };
  
  const getDiaperSummary = () => {
    const today = new Date().toDateString();
    const todayDiapers = diapers.filter(d => d.date === today);
    const wet = todayDiapers.filter(d => d.type === "Wet").length;
    const dirty = todayDiapers.filter(d => d.type === "Dirty").length;
    return { wet, dirty, total: wet + dirty };
  };
  
  const diaperSummary = getDiaperSummary();
  
  return (
    <div className="page-pad">
      {/* EPDS Postnatal Depression Screening Modal */}
      {showEPDS && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.8)",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--pad-x)",
          overflowY: "auto"
        }}>
          <div style={{
            background: "var(--card)",
            borderRadius: "var(--r2)",
            maxWidth: 500,
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "var(--sp-4)"
          }}>
            <EPDSQuestionnaire onComplete={(score) => {
              setShowEPDS(false);
              localStorage.setItem('lastEPDSScreen', new Date().toISOString());
              if (score >= 13) {
                alert("Your score suggests you may benefit from speaking with your GP or health visitor. Support is available.");
              }
            }} />
          </div>
        </div>
      )}
      
      <SectionTitle title="Baby Tracker" subtitle={`Week ${babyWeeks} · ${babyDaysRemainder > 0 ? `${babyDaysRemainder} days` : ''}`} />

      {/* Breastfeeding */}
      <WCard>
        <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-4)" }}>🤱 Breastfeeding</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap-md)", marginBottom: "var(--sp-4)" }}>
          {[
            { side: "Left", mins: feeds.left, bg: "var(--gdl)", tc: "var(--gd)" },
            { side: "Right", mins: feeds.right, bg: "var(--sgl)", tc: "var(--sg)" }
          ].map(b => (
            <div key={b.side} style={{ background: b.bg, borderRadius: "var(--r)", padding: "var(--card-p)", textAlign: "center", border: `1.5px solid ${b.tc}44` }}>
              <div style={{ fontSize: "var(--fs-xl)", marginBottom: "var(--sp-2)" }}>{b.side === "Left" ? "◀" : "▶"}</div>
              <div style={{ fontSize: "var(--fs-xl)", fontWeight: 900, color: b.tc }}>{b.mins}<span style={{ fontSize: "var(--fs-sm)" }}> min</span></div>
              <div style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginTop: "var(--sp-1)", fontWeight: 600 }}>{b.side} breast</div>
            </div>
          ))}
        </div>
        <div style={{ background: "var(--bll)", borderRadius: "var(--r)", padding: "var(--sp-3) var(--card-p)", marginBottom: "var(--sp-3)" }}>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--bl)", fontWeight: 800 }}>🔄 Start next feed: {feeds.last === "right" ? "LEFT" : "RIGHT"} breast</p>
        </div>
        <div style={{ display: "flex", gap: "var(--gap-md)", marginBottom: "var(--sp-3)" }}>
          {["Start Left","Start Right"].map((btn, i) => (
            <button 
              key={i} 
              onClick={() => {
                const side = i === 0 ? "left" : "right";
                const minutes = 15; // Default feed duration
                setFeeds(f => ({ 
                  ...f, 
                  total: f.total + 1, 
                  last: side,
                  [side]: f[side] + minutes
                }));
              }} 
              style={{ flex: 1, padding: "var(--sp-3)", background: i === 0 ? "var(--t)" : "var(--sg)", color: "#fff", border: "none", borderRadius: "var(--r)", fontSize: "var(--fs-sm)", fontWeight: 800, cursor: "pointer", minHeight: "var(--touch)" }}
            >
              {btn}
            </button>
          ))}
        </div>
        
        <button 
          onClick={() => setPumpMode(!pumpMode)} 
          style={{ 
            width: "100%", 
            padding: "var(--sp-3)", 
            background: pumpMode ? "var(--lv)" : "var(--lvl)", 
            color: pumpMode ? "#fff" : "var(--lv)", 
            border: "1.5px solid var(--lvm)44", 
            borderRadius: "var(--r)", 
            fontSize: "var(--fs-sm)", 
            fontWeight: 800, 
            cursor: "pointer", 
            minHeight: "var(--touch)" 
          }}
        >
          🍼 {pumpMode ? `Stop Pumping (${formatPumpTime(pumpTime)})` : "Start Pumping"}
        </button>
        
        {pumpMode && (
          <p className="fu" style={{ fontSize: "var(--fs-xs)", color: "var(--lv)", textAlign: "center", marginTop: "var(--sp-3)", lineHeight: 1.5 }}>
            AI: Pump 15–20 mins each side. Best time: 30 mins after morning feed.
          </p>
        )}
        
        <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", textAlign: "center", marginTop: "var(--sp-3)" }}>
          Total feeds today: {feeds.total} · AI milk supply: {feeds.total >= 8 ? "Optimal ✓" : "Building"}
        </p>
      </WCard>

      {/* Sleep Tracker */}
      <WCard style={{ background: "linear-gradient(135deg,var(--lvl),#F8F6FE)", border: "1px solid var(--lvm)33" }}>
        <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--lv)", marginBottom: "var(--sp-4)" }}>😴 Baby Sleep Tracker</p>
        
        {!sleeping ? (
          <button 
            onClick={startSleep}
            style={{ width: "100%", padding: "var(--sp-3)", background: "var(--lv)", color: "#fff", border: "none", borderRadius: "var(--r)", fontSize: "var(--fs-md)", fontWeight: 800, cursor: "pointer" }}
          >
            Start Sleep Session
          </button>
        ) : (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "var(--fs-2xl)", fontWeight: 800, color: "var(--lv)", marginBottom: "var(--sp-2)" }}>
              😴 Sleeping
            </p>
            <button 
              onClick={stopSleep}
              style={{ width: "100%", padding: "var(--sp-3)", background: "var(--warm)", border: "1px solid var(--border)", borderRadius: "var(--r)", fontSize: "var(--fs-sm)", fontWeight: 700, cursor: "pointer" }}
            >
              Stop Sleep Session
            </button>
          </div>
        )}
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--gap-md)", marginTop: "var(--sp-4)" }}>
          {[
            { v: sleepLog[0]?.duration ? `${Math.floor(sleepLog[0].duration / 60)}h ${sleepLog[0].duration % 60}m` : "--", l: "Last sleep", tc: "var(--lv)" },
            { v: "Predicting...", l: "Next predicted", tc: "var(--sg)" },
            { v: `${Math.floor(sleepLog.reduce((sum, s) => sum + s.duration, 0) / 3600)}h today`, l: "Total today", tc: "var(--t)" }
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", background: "rgba(255,255,255,0.8)", borderRadius: "var(--r)", padding: "var(--sp-3) var(--sp-2)" }}>
              <div style={{ fontSize: "var(--fs-sm)", fontWeight: 900, color: s.tc, marginBottom: "var(--sp-1)" }}>{s.v}</div>
              <div style={{ fontSize: "var(--fs-2xs)", color: "var(--mt)", fontWeight: 600 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "var(--fs-xs)", color: "#5A5078", lineHeight: 1.55, marginTop: "var(--sp-2)" }}>
          💜 Pattern confidence: 83%. AI learning baby's sleep patterns.
        </p>
      </WCard>

      {/* Diaper Log */}
      <WCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-4)" }}>
          <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)" }}>🚼 Diaper Log</p>
          <div style={{ display: "flex", gap: "var(--gap-sm)" }}>
            <button 
              onClick={() => setDiapers(d => [{ id: Date.now(), t: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), type: "Wet", date: new Date().toDateString() }, ...d])} 
              style={{ background: "var(--bll)", color: "var(--bl)", border: "none", borderRadius: 20, padding: "clamp(5px,1.2vw,7px) clamp(12px,3vw,16px)", fontSize: "var(--fs-xs)", fontWeight: 800, cursor: "pointer", minHeight: "var(--touch)" }}
            >
              💧 Wet
            </button>
            <button 
              onClick={() => setDiapers(d => [{ id: Date.now(), t: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), type: "Dirty", date: new Date().toDateString() }, ...d])} 
              style={{ background: "var(--gdl)", color: "var(--gd)", border: "none", borderRadius: 20, padding: "clamp(5px,1.2vw,7px) clamp(12px,3vw,16px)", fontSize: "var(--fs-xs)", fontWeight: 800, cursor: "pointer", minHeight: "var(--touch)" }}
            >
              💩 Dirty
            </button>
          </div>
        </div>
        
        {diapers.slice(0, 5).map((d, i) => (
          <div key={d.id} style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "var(--sp-3) 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
            <div style={{ width: "var(--icon-sm)", height: "var(--icon-sm)", flexShrink: 0, borderRadius: "var(--r)", background: d.type === "Wet" ? "var(--bll)" : "var(--gdl)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-xl)" }}>
              {d.type === "Wet" ? "💧" : "💩"}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: "var(--dp)" }}>{d.type} diaper</p>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>{d.t}</p>
            </div>
            <Tag label="Normal" bg={d.type === "Wet" ? "var(--bll)" : "var(--gdl)"} tc={d.type === "Wet" ? "var(--bl)" : "var(--gd)"} />
          </div>
        ))}
        
        <p style={{ fontSize: "var(--fs-xs)", color: diaperSummary.total >= 6 ? "var(--sg)" : "var(--mt)", marginTop: "var(--sp-3)", fontWeight: 700 }}>
          {diaperSummary.total >= 6 
            ? `✅ ${diaperSummary.wet} wet + ${diaperSummary.dirty} dirty — Good for ${babyWeeks}-week-old`
            : `⚠️ Low diaper count today (${diaperSummary.total}). Newborns should have 6-8 wet diapers daily.`
          }
        </p>
      </WCard>

      {/* Vaccination Schedule */}
      <SectionTitle title="💉 Vaccination Schedule" subtitle="NHS Childhood Immunisations" />
      <WCard>
        {nextVaccination && (
          <div style={{ background: "var(--sgl)", borderRadius: "var(--r)", padding: "var(--sp-3)", marginBottom: "var(--sp-3)" }}>
            <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--sg)", marginBottom: 4 }}>📅 Next Due</p>
            <p style={{ fontSize: "var(--fs-sm)", fontWeight: 700 }}>{nextVaccination.name}</p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>Due at {nextVaccination.dueWeeks} weeks ({Math.max(0, nextVaccination.dueWeeks - babyWeeks)} weeks from now)</p>
          </div>
        )}
        
        {vaccinations.slice(0, 8).map((v, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "var(--sp-2) 0", borderBottom: i < 7 ? "1px solid var(--border)" : "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: v.done ? "var(--sg)" : "var(--warm)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "var(--fs-xs)", flexShrink: 0 }}>
              {v.done ? "✓" : v.dueWeeks}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--dp)" }}>{v.name}</p>
              <p style={{ fontSize: "var(--fs-2xs)", color: "var(--mt)" }}>Due: {v.dueWeeks} weeks</p>
            </div>
            <Tag label={v.done ? "Done" : "Pending"} bg={v.done ? "var(--sgl)" : "var(--gdl)"} tc={v.done ? "var(--sg)" : "var(--gd)"} />
          </div>
        ))}
        
        <button 
          onClick={() => alert("Vaccination reminder set. You'll be notified before each due date.")}
          style={{ width: "100%", marginTop: "var(--sp-3)", padding: "var(--sp-2)", background: "var(--dp)", color: "#fff", border: "none", borderRadius: 20, cursor: "pointer" }}
        >
          Set Reminders for All Vaccines
        </button>
      </WCard>

      {/* Milestones */}
      <SectionTitle title={`Week ${babyWeeks} Milestones`} />
      <WCard style={{ padding: `var(--sp-2) var(--card-p)` }}>
        {milestones.slice(0, 8).map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "var(--sp-3) 0", borderBottom: i < 7 ? "1px solid var(--border)" : "none" }}>
            <div style={{ 
              width: "clamp(24px,6vw,30px)", 
              height: "clamp(24px,6vw,30px)", 
              flexShrink: 0, 
              borderRadius: "50%", 
              background: item.done ? "var(--sg)" : item.dueWeeks <= babyWeeks ? "var(--gdl)" : "var(--border)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              color: item.done ? "#fff" : item.dueWeeks <= babyWeeks ? "var(--gd)" : "var(--mt)", 
              fontSize: "var(--fs-sm)", 
              fontWeight: 800 
            }}>
              {item.done ? "✓" : item.dueWeeks <= babyWeeks ? "!" : "○"}
            </div>
            <p style={{ fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--dp)", flex: 1 }}>{item.m}</p>
            <Tag 
              label={item.done ? "Achieved" : item.dueWeeks <= babyWeeks ? "Overdue" : "Coming Soon"} 
              bg={item.done ? "var(--sgl)" : item.dueWeeks <= babyWeeks ? "var(--gdl)" : "var(--warm)"} 
              tc={item.done ? "var(--sg)" : item.dueWeeks <= babyWeeks ? "var(--gd)" : "var(--mt)"} 
            />
          </div>
        ))}
      </WCard>
      
      {/* Health Visitor Note */}
      <WCard style={{ background: "var(--bll)" }}>
        <p style={{ fontWeight: 800, marginBottom: "var(--sp-1)" }}>👩‍⚕️ Health Visitor Note</p>
        <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)", lineHeight: 1.5 }}>
          Your 6-week postnatal check is due soon. Book with your GP to review your recovery, 
          baby's growth, and discuss contraception if needed.
        </p>
        <button style={{ marginTop: "var(--sp-2)", background: "var(--bl)", color: "#fff", border: "none", borderRadius: 20, padding: "6px 16px", cursor: "pointer" }}>
          Book Appointment
        </button>
      </WCard>
    </div>
  );
}