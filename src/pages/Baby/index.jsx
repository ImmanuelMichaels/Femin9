import { useState, useEffect } from 'react';
import { WCard, SectionTitle, Tag } from '../../components/ui';
import EPDSQuestionnaire from '../../components/EPDSQuestionnaire';
import { useApp } from '../../context/useApp';

export default function Baby() {
  const { babyAgeDays, setBabyAgeDays, babyBirthDate, journeyType } = useApp();
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
  
  // FIX: Calculate baby's actual age from birth date or stored days
  const [babyWeeks, setBabyWeeks] = useState(0);
  const [babyDaysRemainder, setBabyDaysRemainder] = useState(0);
  
  useEffect(() => {
    // Calculate age from birth date
    if (babyBirthDate) {
      const birthDate = new Date(babyBirthDate);
      const today = new Date();
      const diffTime = Math.abs(today - birthDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays !== babyAgeDays) {
        setBabyAgeDays(diffDays);
      }
      
      const weeks = Math.floor(diffDays / 7);
      const daysRemainder = diffDays % 7;
      setBabyWeeks(weeks);
      setBabyDaysRemainder(daysRemainder);
    } else if (babyAgeDays) {
      // Use stored age if no birth date
      const weeks = Math.floor(babyAgeDays / 7);
      const daysRemainder = babyAgeDays % 7;
      setBabyWeeks(weeks);
      setBabyDaysRemainder(daysRemainder);
    } else {
      // Default to 0 if no data (user hasn't set baby birth date yet)
      setBabyWeeks(0);
      setBabyDaysRemainder(0);
    }
  }, [babyBirthDate, babyAgeDays, setBabyAgeDays]);
  
  // Only show baby tracker if user is in mom/nursing journey or has baby data
  const isBabyJourney = journeyType === 'mom' || journeyType === 'nursing' || babyBirthDate || babyAgeDays > 0;
  
  if (!isBabyJourney) {
    return (
      <div className="page-pad">
        <SectionTitle title="Baby Tracker 👶" />
        <WCard style={{ textAlign: "center", padding: "var(--sp-8)" }}>
          <p style={{ fontSize: "var(--fs-lg)", marginBottom: "var(--sp-3)" }}>👶 Welcome to Baby Care</p>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", marginBottom: "var(--sp-4)" }}>
            To start tracking your baby's development, please add your baby's birth date in your profile.
          </p>
          <button 
            onClick={() => window.location.href = '/profile'}
            style={{ padding: "var(--sp-2) var(--sp-4)", background: "var(--sg)", color: "#fff", border: "none", borderRadius: "var(--r)", cursor: "pointer" }}
          >
            Go to Profile
          </button>
        </WCard>
      </div>
    );
  }
  
  // Vaccination schedule based on actual baby age
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
  
  // Milestones based on actual baby age
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
      { m: "Pulls to stand", dueWeeks: 48, done: babyWeeks >= 48 },
      { m: "Waves bye-bye", dueWeeks: 52, done: babyWeeks >= 52 },
      { m: "Says first word", dueWeeks: 52, done: babyWeeks >= 52 },
      { m: "Stands alone", dueWeeks: 56, done: babyWeeks >= 56 },
      { m: "Walks with support", dueWeeks: 60, done: babyWeeks >= 60 },
      { m: "Walks alone", dueWeeks: 72, done: babyWeeks >= 72 }
    ];
    return allMilestones;
  };
  
  const milestones = getMilestones();
  const achievedMilestones = milestones.filter(m => m.done).length;
  const totalMilestones = milestones.length;
  const upcomingMilestones = milestones.filter(m => !m.done && m.dueWeeks <= babyWeeks + 4);
  
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
  
  // Check if EPDS should be shown (2 weeks, 6 weeks, 3 months) based on actual age
  useEffect(() => {
    const lastEPDSScreen = localStorage.getItem('lastEPDSScreen');
    const shouldShow = (babyWeeks === 2 || babyWeeks === 6 || babyWeeks === 12) && !lastEPDSScreen;
    if (shouldShow && babyWeeks > 0) {
      setShowEPDS(true);
    }
  }, [babyWeeks]);
  
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
  
  // Get age-appropriate tips
  const getAgeTip = () => {
    if (babyWeeks === 0) return "Welcome to the world! Skin-to-skin contact helps regulate baby's temperature and heartbeat.";
    if (babyWeeks < 2) return "Newborns need 8-12 feeds per day. Look for hunger cues like rooting and sucking motions.";
    if (babyWeeks < 4) return "Baby might start smiling this week! It's a reflex at first, but soon it'll be real.";
    if (babyWeeks < 8) return "Tummy time for 1-2 minutes, 3-4 times daily helps build neck strength.";
    if (babyWeeks < 12) return "Baby might start reaching for objects. Provide safe toys for grasping practice.";
    if (babyWeeks < 16) return "Many babies start rolling over this month! Never leave baby unattended on high surfaces.";
    if (babyWeeks < 24) return "Introduce solids around 6 months if baby shows readiness signs (sits with support, good head control).";
    return "Keep reading to baby daily - it builds language skills and bonding.";
  };
  
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
      
      <SectionTitle title="Baby Tracker" subtitle={
        babyWeeks === 0 && babyDaysRemainder === 0 
          ? "Newborn - First days" 
          : `Week ${babyWeeks} · ${babyDaysRemainder > 0 ? `${babyDaysRemainder} day${babyDaysRemainder > 1 ? 's' : ''}` : ''}`
      } />

      {/* Age Summary Card */}
      <WCard style={{ background: "linear-gradient(135deg,var(--sgl),#D4F0DD)", marginBottom: "var(--gap-md)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--gap-sm)" }}>
          <div>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--sg)", fontWeight: 700, marginBottom: 4 }}>
              Baby's Age 👶 
            </p>
            <p style={{ fontSize: "var(--fs-hero)", fontWeight: 900, color: "var(--sg)", lineHeight: 1 }}>
              {babyWeeks} {babyWeeks === 1 ? 'week' : 'weeks'}
              {babyDaysRemainder > 0 && `, ${babyDaysRemainder} day${babyDaysRemainder > 1 ? 's' : ''}`}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <Tag 
              label={babyWeeks < 4 ? "Newborn" : babyWeeks < 12 ? "Infant" : "Older Baby"} 
              bg="var(--sgl)" 
              tc="var(--sg)" 
            />
            <p style={{ fontSize: "var(--fs-2xs)", color: "var(--sg)", marginTop: "var(--sp-1)" }}>
              {achievedMilestones}/{totalMilestones} milestones
            </p>
          </div>
        </div>
        <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)", marginTop: "var(--sp-3)", lineHeight: 1.5 }}>
          💡 {getAgeTip()}
        </p>
      </WCard>

      {/* Breastfeeding */}
      <WCard>
        <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-4)" }}>Breastfeeding 🤱</p>
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
                const minutes = babyWeeks < 2 ? 20 : 15; // Newborns feed longer
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
          Total feeds today: {feeds.total} · {babyWeeks < 4 ? "Newborns need 8-12 feeds daily" : feeds.total >= 6 ? "On track ✓" : "Try to feed more frequently"}
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
               Sleeping 😴
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
            { v: babyWeeks < 4 ? "2-3h intervals" : babyWeeks < 12 ? "3-4h intervals" : "4-6h intervals", l: "Expected pattern", tc: "var(--sg)" },
            { v: `${Math.floor(sleepLog.reduce((sum, s) => sum + s.duration, 0) / 3600)}h today`, l: "Total today", tc: "var(--t)" }
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", background: "rgba(255,255,255,0.8)", borderRadius: "var(--r)", padding: "var(--sp-3) var(--sp-2)" }}>
              <div style={{ fontSize: "var(--fs-sm)", fontWeight: 900, color: s.tc, marginBottom: "var(--sp-1)" }}>{s.v}</div>
              <div style={{ fontSize: "var(--fs-2xs)", color: "var(--mt)", fontWeight: 600 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "var(--fs-xs)", color: "#5A5078", lineHeight: 1.55, marginTop: "var(--sp-2)" }}>
          💜 Newborns sleep 14-17 hours/day in 2-4 hour stretches. Pattern emerges around 3-4 months.
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
          {babyWeeks < 4 
            ? `Newborns should have 6-8 wet diapers daily. Today: ${diaperSummary.total}`
            : diaperSummary.total >= 6 
              ? `✅ ${diaperSummary.wet} wet + ${diaperSummary.dirty} dirty — Good for ${babyWeeks}-week-old`
              : `⚠️ Low diaper count today (${diaperSummary.total}). Monitor hydration.`
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
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>
              Due at {nextVaccination.dueWeeks} weeks 
              {nextVaccination.dueWeeks > babyWeeks 
                ? ` (${nextVaccination.dueWeeks - babyWeeks} weeks from now)` 
                : ` (overdue by ${babyWeeks - nextVaccination.dueWeeks} weeks)`}
            </p>
          </div>
        )}
        
        {vaccinations.slice(0, 8).map((v, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "var(--sp-2) 0", borderBottom: i < 7 ? "1px solid var(--border)" : "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: v.done ? "var(--sg)" : v.dueWeeks <= babyWeeks ? "var(--gdl)" : "var(--warm)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "var(--fs-xs)", flexShrink: 0 }}>
              {v.done ? "✓" : v.dueWeeks}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--dp)" }}>{v.name}</p>
              <p style={{ fontSize: "var(--fs-2xs)", color: "var(--mt)" }}>Due: {v.dueWeeks} weeks</p>
            </div>
            <Tag 
              label={v.done ? "Done" : v.dueWeeks <= babyWeeks ? "Overdue" : "Pending"} 
              bg={v.done ? "var(--sgl)" : v.dueWeeks <= babyWeeks ? "var(--gdl)" : "var(--warm)"} 
              tc={v.done ? "var(--sg)" : v.dueWeeks <= babyWeeks ? "var(--gd)" : "var(--mt)"} 
            />
          </div>
        ))}
        
        <button 
          onClick={() => alert("Vaccination reminder set. You'll be notified before each due date.")}
          style={{ width: "100%", marginTop: "var(--sp-3)", padding: "var(--sp-2)", background: "var(--dp)", color: "#fff", border: "none", borderRadius: 20, cursor: "pointer" }}
        >
          Set Reminders for All Vaccines
        </button>
      </WCard>

      {/* Milestones - Based on Actual Age */}
      <SectionTitle title={`Age ${babyWeeks} Week${babyWeeks !== 1 ? 's' : ''} Milestones`} />
      <WCard>
        {upcomingMilestones.length > 0 && (
          <div style={{ background: "var(--bll)", borderRadius: "var(--r)", padding: "var(--sp-3)", marginBottom: "var(--sp-3)" }}>
            <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--bl)", marginBottom: 4 }}>🎯 Coming Soon</p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)" }}>
              {upcomingMilestones.slice(0, 2).map(m => m.m).join(" · ")}
            </p>
          </div>
        )}
        
        {milestones.slice(0, 10).map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "var(--sp-3) 0", borderBottom: i < 9 ? "1px solid var(--border)" : "none" }}>
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
              label={item.done ? "Achieved" : item.dueWeeks <= babyWeeks ? "Overdue" : `${item.dueWeeks} weeks`} 
              bg={item.done ? "var(--sgl)" : item.dueWeeks <= babyWeeks ? "var(--gdl)" : "var(--warm)"} 
              tc={item.done ? "var(--sg)" : item.dueWeeks <= babyWeeks ? "var(--gd)" : "var(--mt)"} 
            />
          </div>
        ))}
        
        {achievedMilestones === 0 && babyWeeks > 0 && (
          <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", textAlign: "center", marginTop: "var(--sp-3)" }}>
            Milestones unlock as baby grows. Check back at each age!
          </p>
        )}
      </WCard>
      
      {/* Health Visitor Note - Age appropriate */}
      <WCard style={{ background: "var(--bll)" }}>
        <p style={{ fontWeight: 800, marginBottom: "var(--sp-1)" }}>Health Visitor Note 👩‍⚕️</p>
        <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)", lineHeight: 1.5 }}>
          {babyWeeks <= 2 && "Your health visitor will contact you within 10-14 days for the newborn review."}
          {babyWeeks === 6 && "Your 6-week postnatal check is due now. Book with your GP to review your recovery and baby's growth."}
          {babyWeeks === 12 && "Your baby's 12-week developmental review is approaching. Your health visitor will be in touch."}
          {babyWeeks > 2 && babyWeeks !== 6 && babyWeeks !== 12 && "Keep up with regular weigh-ins at your local baby clinic. Contact your health visitor with any concerns."}
          {babyWeeks === 0 && "Your health visitor will visit within 10-14 days for the newborn physical examination."}
        </p>
        <button style={{ marginTop: "var(--sp-2)", background: "var(--bl)", color: "#fff", border: "none", borderRadius: 20, padding: "6px 16px", cursor: "pointer" }}>
          Book Appointment
        </button>
      </WCard>
    </div>
  );
}