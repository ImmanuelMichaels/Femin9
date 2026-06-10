import { useState, useEffect, useCallback, useRef } from 'react';
import { WCard, SectionTitle, Tag } from '../../components/ui';
import EPDSQuestionnaire from '../../components/EPDSQuestionnaire';
import { useApp } from '../../context/useApp';

export default function Baby() {
  const { babyAgeDays, setBabyAgeDays, babyBirthDate, journeyType } = useApp();

  // Error-safe localStorage helper
  const loadFromStorage = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      return defaultValue;
    }
  };

  const saveToStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  // State with error handling
  const [feeds, setFeeds] = useState(() => loadFromStorage('babyFeeds', { left: 0, right: 0, total: 0, last: "right" }));
  const [diapers, setDiapers] = useState(() => loadFromStorage('babyDiapers', []));
  const [sleepLog, setSleepLog] = useState(() => loadFromStorage('babySleep', []));
  const [pumpMode, setPumpMode] = useState(false);
  const [pumpTime, setPumpTime] = useState(0);
  const [pumpSessions, setPumpSessions] = useState(() => loadFromStorage('pumpingSessions', []));
  const [showEPDS, setShowEPDS] = useState(false);
  const [sleeping, setSleeping] = useState(false);
  const [sleepStart, setSleepStart] = useState(null);
  const [babyWeeks, setBabyWeeks] = useState(0);
  const [babyDaysRemainder, setBabyDaysRemainder] = useState(0);
  const [epdsCompletedWeeks, setEpdsCompletedWeeks] = useState(() => loadFromStorage('epdsCompletedWeeks', []));
  
  // Milestone state - manually tracked by parent
  const [achievedMilestones, setAchievedMilestones] = useState(() => {
    const saved = loadFromStorage('babyAchievedMilestones', {});
    return saved;
  });

  const pumpTimerRef = useRef(null);

  // Real-time age calculation from birth date
  useEffect(() => {
    if (babyBirthDate) {
      const birth = new Date(babyBirthDate);
      const today = new Date();
      const diffTime = today - birth;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays !== babyAgeDays) {
        setBabyAgeDays(diffDays);
      }
      
      const weeks = Math.floor(diffDays / 7);
      setBabyWeeks(weeks);
      setBabyDaysRemainder(diffDays % 7);
    } else if (babyAgeDays) {
      const weeks = Math.floor(babyAgeDays / 7);
      setBabyWeeks(weeks);
      setBabyDaysRemainder(babyAgeDays % 7);
    }
  }, [babyBirthDate, babyAgeDays, setBabyAgeDays]);

  const isBabyJourney = journeyType === 'mom' || journeyType === 'nursing' || babyBirthDate || babyAgeDays > 0;

  // NHS 2026 Data based on latest guidelines
  const getAgeConfig = useCallback((weeks) => ({
    feedDurationMin: weeks < 4 ? 18 : weeks < 12 ? 15 : 12,
    recommendedFeedsMin: weeks < 4 ? 8 : 6,
    recommendedFeedsMax: weeks < 4 ? 12 : 10,
    targetWetDiapers: weeks < 4 ? 6 : 5,
    expectedSleepMin: weeks < 4 ? 14 : weeks < 12 ? 13 : 12,
    expectedSleepMax: weeks < 4 ? 17 : weeks < 12 ? 15 : 14,
    tip: weeks === 0 ? "Skin-to-skin contact helps regulate baby's temperature and heartbeat." :
         weeks < 4 ? "Feed on demand. 8–12 feeds per day is completely normal." :
         weeks < 8 ? "Tummy time for short periods several times a day builds neck strength." :
         weeks < 16 ? "Support safe rolling practice. Never leave baby unattended on high surfaces." :
         weeks < 24 ? "Watch for solids readiness signs around 6 months (sits with support, good head control)." :
         "Read and talk to your baby daily — it builds language and bonding."
  }), []);

  const config = getAgeConfig(babyWeeks);

  // Latest NHS Vaccination Schedule (June 2026)
  const [completedVaccinations, setCompletedVaccinations] = useState(() => {
    const saved = loadFromStorage('completedVaccinations', {});
    return saved;
  });

  const vaccinations = [
    { id: "vax_6in1_1", name: "6-in-1 (DTaP/IPV/Hib/HepB) 1st", dueWeeks: 8, description: "Protects against diphtheria, tetanus, pertussis, polio, Hib, hepatitis B" },
    { id: "vax_rotavirus_1", name: "Rotavirus 1st", dueWeeks: 8, description: "Oral vaccine for rotavirus infection" },
    { id: "vax_menb_1", name: "MenB 1st", dueWeeks: 8, description: "Meningitis B protection" },
    { id: "vax_6in1_2", name: "6-in-1 2nd", dueWeeks: 12, description: "Second dose of combined vaccine" },
    { id: "vax_menb_2", name: "MenB 2nd", dueWeeks: 12, description: "Second meningitis B dose" },
    { id: "vax_rotavirus_2", name: "Rotavirus 2nd", dueWeeks: 12, description: "Second oral rotavirus dose" },
    { id: "vax_6in1_3", name: "6-in-1 3rd", dueWeeks: 16, description: "Third dose of combined vaccine" },
    { id: "vax_pcv_1", name: "PCV (Pneumococcal) 1st", dueWeeks: 16, description: "Protects against pneumococcal infections" },
    { id: "vax_mmr_1", name: "MMR 1st", dueWeeks: 52, description: "Measles, mumps, rubella first dose" },
    { id: "vax_pcv_2", name: "PCV 2nd", dueWeeks: 52, description: "Second pneumococcal dose" },
    { id: "vax_menb_3", name: "MenB 3rd", dueWeeks: 52, description: "Third meningitis B dose" },
    { id: "vax_6in1_4", name: "6-in-1 4th (18-month)", dueWeeks: 78, description: "Final combined vaccine booster" },
    { id: "vax_mmr_2", name: "MMR 2nd", dueWeeks: 208, description: "Second MMR dose" },
    { id: "vax_preschool", name: "4-in-1 preschool booster", dueWeeks: 208, description: "DTaP/IPV booster before school" }
  ].map(v => ({
    ...v,
    completed: completedVaccinations[v.id] || false
  }));

  const nextVaccination = vaccinations.find(v => !v.completed && babyWeeks >= v.dueWeeks - 4);

  // Save to localStorage
  useEffect(() => {
    saveToStorage('babyFeeds', feeds);
  }, [feeds]);

  useEffect(() => {
    saveToStorage('babyDiapers', diapers);
  }, [diapers]);

  useEffect(() => {
    saveToStorage('babySleep', sleepLog);
  }, [sleepLog]);

  useEffect(() => {
    saveToStorage('pumpingSessions', pumpSessions);
  }, [pumpSessions]);

  useEffect(() => {
    saveToStorage('epdsCompletedWeeks', epdsCompletedWeeks);
  }, [epdsCompletedWeeks]);

  useEffect(() => {
    saveToStorage('babyAchievedMilestones', achievedMilestones);
  }, [achievedMilestones]);

  useEffect(() => {
    saveToStorage('completedVaccinations', completedVaccinations);
  }, [completedVaccinations]);

  // EPDS screening trigger
  useEffect(() => {
    const screeningWeeks = [2, 6, 12];
    const shouldShow = screeningWeeks.includes(babyWeeks) && 
                      !epdsCompletedWeeks.includes(babyWeeks) && 
                      babyWeeks > 0;
    
    if (shouldShow) {
      setShowEPDS(true);
    }
  }, [babyWeeks, epdsCompletedWeeks]);

  // Pump timer with proper cleanup
  useEffect(() => {
    if (pumpMode) {
      pumpTimerRef.current = setInterval(() => {
        setPumpTime(prev => prev + 1);
      }, 1000);
    } else if (pumpTimerRef.current) {
      clearInterval(pumpTimerRef.current);
      pumpTimerRef.current = null;
      
      if (pumpTime > 0) {
        const pumpSession = {
          id: Date.now(),
          duration: pumpTime,
          timestamp: new Date().toISOString(),
          side: feeds.last === "right" ? "left" : "right",
          amount: Math.floor(pumpTime / 60) * 30
        };
        setPumpSessions(prev => [pumpSession, ...prev]);
      }
      setPumpTime(0);
    }

    return () => {
      if (pumpTimerRef.current) {
        clearInterval(pumpTimerRef.current);
      }
    };
  }, [pumpMode, pumpTime, feeds.last]);

  const formatPumpTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFeed = (side) => {
    setFeeds(prev => ({
      ...prev,
      total: prev.total + 1,
      last: side,
      [side]: prev[side] + config.feedDurationMin
    }));
  };

  const handleResetFeeds = () => {
    if (window.confirm('Reset all feeding data for today?')) {
      setFeeds({ left: 0, right: 0, total: 0, last: "right" });
    }
  };

  const startSleep = () => {
    setSleeping(true);
    setSleepStart(Date.now());
  };

  const stopSleep = () => {
    if (sleepStart) {
      const durationSeconds = Math.floor((Date.now() - sleepStart) / 1000);
      const durationHours = durationSeconds / 3600;
      
      const newSleep = {
        id: Date.now(),
        startTime: new Date(sleepStart),
        endTime: new Date(),
        duration: durationSeconds,
        durationFormatted: `${Math.floor(durationHours)}h ${Math.floor((durationHours % 1) * 60)}m`,
        date: new Date().toDateString()
      };
      
      setSleepLog(prev => [newSleep, ...prev]);
      setSleeping(false);
      setSleepStart(null);
    }
  };

  const addDiaper = (type) => {
    const newDiaper = {
      id: Date.now(),
      type: type,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setDiapers(prev => [newDiaper, ...prev]);
  };

  const toggleVaccination = (vaccineId) => {
    setCompletedVaccinations(prev => ({
      ...prev,
      [vaccineId]: !prev[vaccineId]
    }));
  };

  const getDiaperSummary = () => {
    const today = new Date().toDateString();
    const todayDiapers = diapers.filter(d => d.date === today);
    const wet = todayDiapers.filter(d => d.type === "Wet").length;
    const dirty = todayDiapers.filter(d => d.type === "Dirty").length;
    const mixed = todayDiapers.filter(d => d.type === "Mixed").length;
    return { wet, dirty, mixed, total: wet + dirty + mixed };
  };

  const getSleepSummary = () => {
    const today = new Date().toDateString();
    const todaySleep = sleepLog.filter(s => s.date === today);
    const totalSleepSeconds = todaySleep.reduce((sum, s) => sum + s.duration, 0);
    const totalSleepHours = totalSleepSeconds / 3600;
    
    return {
      total: todaySleep.length,
      totalDuration: totalSleepSeconds,
      totalDurationFormatted: `${Math.floor(totalSleepHours)}h ${Math.floor((totalSleepHours % 1) * 60)}m`,
      averageDuration: todaySleep.length > 0 ? totalSleepSeconds / todaySleep.length / 3600 : 0
    };
  };

  const diaperSummary = getDiaperSummary();
  const sleepSummary = getSleepSummary();

  // NHS-aligned Developmental Milestones (NO auto-achievement)
  const milestones = [
    { id: "responds_light_sound", name: "Responds to light and sound", dueWeeks: 0, typicalRange: "0-2 weeks", category: "Senses" },
    { id: "lifts_head", name: "Lifts head briefly on tummy", dueWeeks: 4, typicalRange: "3-6 weeks", category: "Motor" },
    { id: "social_smile", name: "Social smile", dueWeeks: 6, typicalRange: "6-12 weeks", category: "Social" },
    { id: "holds_head_steady", name: "Holds head steady", dueWeeks: 8, typicalRange: "6-12 weeks", category: "Motor" },
    { id: "reaches_for_objects", name: "Reaches for objects", dueWeeks: 12, typicalRange: "12-16 weeks", category: "Motor" },
    { id: "rolls_both_ways", name: "Rolls both ways", dueWeeks: 16, typicalRange: "16-24 weeks", category: "Motor" },
    { id: "sits_with_support", name: "Sits with support", dueWeeks: 24, typicalRange: "24-28 weeks", category: "Motor" },
    { id: "babbles_laughs", name: "Babbles and laughs", dueWeeks: 24, typicalRange: "24-32 weeks", category: "Communication" },
    { id: "sits_unsupported", name: "Sits without support", dueWeeks: 32, typicalRange: "32-40 weeks", category: "Motor" },
    { id: "crawls", name: "Crawls", dueWeeks: 40, typicalRange: "36-52 weeks", category: "Motor" },
    { id: "pulls_to_stand", name: "Pulls to stand", dueWeeks: 48, typicalRange: "44-56 weeks", category: "Motor" },
    { id: "first_words", name: "First words and waves bye-bye", dueWeeks: 52, typicalRange: "48-60 weeks", category: "Communication" },
    { id: "walks_with_support", name: "Walks with support", dueWeeks: 60, typicalRange: "56-68 weeks", category: "Motor" },
    { id: "walks_independently", name: "Walks independently", dueWeeks: 72, typicalRange: "64-80 weeks", category: "Motor" }
  ].map(m => ({
    ...m,
    achieved: achievedMilestones[m.id] || false
  }));

  // Helper function to get milestone status
  const getMilestoneStatus = (milestone) => {
    const isAchieved = achievedMilestones[milestone.id];
    const isOverdue = babyWeeks > milestone.dueWeeks + 8;
    const isDue = babyWeeks >= milestone.dueWeeks;
    
    if (isAchieved) {
      return { type: 'achieved', label: '✓ Achieved', icon: '✅', color: 'var(--sg)' };
    }
    if (isOverdue) {
      return { type: 'overdue', label: '⚠️ Consider discussing with health visitor', icon: '⚠️', color: 'var(--lv)' };
    }
    if (isDue) {
      return { type: 'due', label: '👀 Watch for this now', icon: '👀', color: 'var(--bl)' };
    }
    return { type: 'upcoming', label: `Expected around week ${milestone.dueWeeks}`, icon: '📅', color: 'var(--mt)' };
  };

  const toggleMilestone = (milestoneId) => {
    setAchievedMilestones(prev => ({
      ...prev,
      [milestoneId]: !prev[milestoneId]
    }));
  };

  const achievedCount = Object.values(achievedMilestones).filter(Boolean).length;
  const upcomingMilestones = milestones.filter(m => !m.achieved && m.dueWeeks > babyWeeks);

  // Milestone Progress Component
  const MilestoneProgress = () => {
    const percentage = (achievedCount / milestones.length) * 100;
    return (
      <div style={{ marginTop: 'var(--sp-2)' }}>
        <div style={{ background: 'var(--gdl)', borderRadius: 'var(--r)', height: '8px', overflow: 'hidden' }}>
          <div style={{ width: `${percentage}%`, background: '#7c3aed', height: '100%', transition: 'width 0.3s ease' }} />
        </div>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginTop: 'var(--sp-1)' }}>
          {achievedCount}/{milestones.length} milestones achieved
        </p>
      </div>
    );
  };

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
            style={{ padding: "var(--sp-2) var(--sp-4)", background: "#7C3AED", color: "#fff", border: "none", borderRadius: "var(--r)", cursor: "pointer" }}
          >
            Go to Profile
          </button>
        </WCard>
      </div>
    );
  }

  return (
    <div className="page-pad">
      {/* EPDS Modal */}
      {showEPDS && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "#7C3AED", zIndex: 2000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--pad-x)"
        }}>
          <div style={{
            background: "var(--card)", borderRadius: "var(--r2)", maxWidth: 500, width: "100%",
            maxHeight: "90vh", overflowY: "auto", padding: "var(--sp-4)"
          }}>
            <EPDSQuestionnaire onComplete={(score) => {
              setShowEPDS(false);
              setEpdsCompletedWeeks(prev => [...prev, babyWeeks]);
              
              if (score >= 13) {
                alert("Your score suggests you may benefit from speaking with your GP or health visitor. They can provide support and discuss next steps with you.");
              } else if (score >= 10) {
                alert("Your score indicates some signs of distress. Consider speaking with your health visitor for support.");
              }
            }} />
          </div>
        </div>
      )}

      <SectionTitle 
        title="Baby Tracker 👶" 
        subtitle={`Week ${babyWeeks}${babyDaysRemainder ? ` + ${babyDaysRemainder}d` : ''}`} 
      />

      {/* Age Summary Card */}
      <WCard style={{ background: "#7C3AED)", marginBottom: "var(--gap-md)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--gap-sm)" }}>
          <div>
            <p style={{ fontSize: "var(--fs-sm)", color: "#7C3AED", fontWeight: 700 }}>Baby's Age</p>
            <p style={{ fontSize: "var(--fs-hero)", fontWeight: 900, color: "#7C3AED" }}>
              {babyWeeks}w{babyDaysRemainder ? ` ${babyDaysRemainder}d` : ''}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <Tag label={babyWeeks < 12 ? "Newborn" : babyWeeks < 52 ? "Infant" : "Toddler"} bg="#7C3AED" tc="#fff" />
            <MilestoneProgress />
          </div>
        </div>
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", marginTop: "var(--sp-3)", lineHeight: 1.5, padding: "var(--sp-2)", background: "rgba(255,255,255,0.5)", borderRadius: "var(--r)" }}>
          💡 {config.tip}
        </p>
      </WCard>

      {/* Breastfeeding Section */}
      <WCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-4)" }}>
          <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)", margin: 0 }}>Breastfeeding 🤱</p>
          <button 
            onClick={handleResetFeeds}
            style={{ padding: "var(--sp-1) var(--sp-2)", background: "var(--lvl)", color: "var(--lv)", border: "none", borderRadius: "var(--r)", fontSize: "var(--fs-xs)", cursor: "pointer" }}
          >
            Reset
          </button>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap-md)", marginBottom: "var(--sp-4)" }}>
          {["left", "right"].map((side) => (
            <div key={side} style={{ 
              background: side === "left" ? "var(--gdl)" : "var(--sgl)", 
              borderRadius: "var(--r)", padding: "var(--card-p)", textAlign: "center" 
            }}>
              <div style={{ fontSize: "var(--fs-xl)" }}>{side === "left" ? "◀" : "▶"}</div>
              <div style={{ fontSize: "var(--fs-xl)", fontWeight: 900 }}>{feeds[side]}<span style={{ fontSize: "var(--fs-sm)" }}> min</span></div>
              <div style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>{side.charAt(0).toUpperCase() + side.slice(1)} breast</div>
            </div>
          ))}
        </div>

        <div style={{ background: "var(--bll)", borderRadius: "var(--r)", padding: "var(--sp-3)", marginBottom: "var(--sp-3)" }}>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--bl)", fontWeight: 800, margin: 0 }}>
            🔄 Next feed: {feeds.last === "right" ? "LEFT" : "RIGHT"} breast
          </p>
          <p style={{ fontSize: "var(--fs-xs)", color: "var(--bl)", marginTop: "var(--sp-1)", marginBottom: 0 }}>
            Recommended duration: {config.feedDurationMin} minutes per side
          </p>
        </div>

        <div style={{ display: "flex", gap: "var(--gap-md)", marginBottom: "var(--sp-3)" }}>
          {["Start Left", "Start Right"].map((label, i) => {
            const side = i === 0 ? "left" : "right";
            return (
              <button 
                key={side}
                onClick={() => handleFeed(side)}
                style={{ flex: 1, padding: "var(--sp-3)", background: i === 0 ? "var(--t)" : "var(--sg)", color: "#fff", border: "none", borderRadius: "var(--r)", fontWeight: 800, cursor: "pointer" }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <button 
          onClick={() => setPumpMode(!pumpMode)} 
          style={{ width: "100%", padding: "var(--sp-3)", background: pumpMode ? "var(--lv)" : "var(--lvl)", color: pumpMode ? "#fff" : "var(--lv)", border: "none", borderRadius: "var(--r)", fontWeight: 800, cursor: "pointer" }}
        >
          {pumpMode ? `Stop Pumping (${formatPumpTime(pumpTime)})` : "Start Pumping"} 🍼
        </button>

        <p style={{ fontSize: "var(--fs-xs)", textAlign: "center", marginTop: "var(--sp-3)", color: "var(--mt)" }}>
          Today: {feeds.total} feeds • Target: {config.recommendedFeedsMin}–{config.recommendedFeedsMax}
        </p>
      </WCard>

      {/* Diaper Tracking Section */}
      <WCard>
        <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-4)" }}>Diapers 💧</p>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--gap-sm)", marginBottom: "var(--sp-4)" }}>
          <div style={{ textAlign: "center", padding: "var(--sp-2)", background: "var(--bll)", borderRadius: "var(--r)" }}>
            <div style={{ fontSize: "var(--fs-xl)" }}>💧</div>
            <div style={{ fontSize: "var(--fs-lg)", fontWeight: 800 }}>{diaperSummary.wet}</div>
            <div style={{ fontSize: "var(--fs-xs)" }}>Wet</div>
          </div>
          <div style={{ textAlign: "center", padding: "var(--sp-2)", background: "var(--gdl)", borderRadius: "var(--r)" }}>
            <div style={{ fontSize: "var(--fs-xl)" }}>💩</div>
            <div style={{ fontSize: "var(--fs-lg)", fontWeight: 800 }}>{diaperSummary.dirty}</div>
            <div style={{ fontSize: "var(--fs-xs)" }}>Dirty</div>
          </div>
          <div style={{ textAlign: "center", padding: "var(--sp-2)", background: "var(--lvl)", borderRadius: "var(--r)" }}>
            <div style={{ fontSize: "var(--fs-xl)" }}>🔄</div>
            <div style={{ fontSize: "var(--fs-lg)", fontWeight: 800 }}>{diaperSummary.mixed}</div>
            <div style={{ fontSize: "var(--fs-xs)" }}>Mixed</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "var(--gap-sm)" }}>
          <button onClick={() => addDiaper("Wet")} style={{ flex: 1, padding: "var(--sp-2)", background: "var(--bll)", color: "var(--bl)", border: "none", borderRadius: "var(--r)", fontWeight: 600, cursor: "pointer" }}>
            💧 Add Wet
          </button>
          <button onClick={() => addDiaper("Dirty")} style={{ flex: 1, padding: "var(--sp-2)", background: "var(--gdl)", color: "var(--sg)", border: "none", borderRadius: "var(--r)", fontWeight: 600, cursor: "pointer" }}>
            💩 Add Dirty
          </button>
          <button onClick={() => addDiaper("Mixed")} style={{ flex: 1, padding: "var(--sp-2)", background: "var(--lvl)", color: "var(--lv)", border: "none", borderRadius: "var(--r)", fontWeight: 600, cursor: "pointer" }}>
            🔄 Mixed
          </button>
        </div>

        <p style={{ fontSize: "var(--fs-xs)", textAlign: "center", marginTop: "var(--sp-3)", color: "var(--mt)" }}>
          Target: {config.targetWetDiapers}+ wet diapers per day
          {diaperSummary.wet < config.targetWetDiapers && diaperSummary.total > 0 && " ⚠️ Below target"}
        </p>
      </WCard>

      {/* Sleep Tracking Section */}
      <WCard>
        <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-4)" }}>Sleep 😴</p>
        
        {sleeping ? (
          <div style={{ textAlign: "center", padding: "var(--sp-4)", background: "var(--bll)", borderRadius: "var(--r)", marginBottom: "var(--sp-3)" }}>
            <p style={{ fontSize: "var(--fs-lg)", marginBottom: "var(--sp-2)" }}>😴 Baby is sleeping</p>
            <button onClick={stopSleep} style={{ padding: "var(--sp-2) var(--sp-4)", background: "var(--lv)", color: "#fff", border: "none", borderRadius: "var(--r)", cursor: "pointer" }}>
              Wake Up
            </button>
          </div>
        ) : (
          <button onClick={startSleep} style={{ width: "100%", padding: "var(--sp-3)", background: "var(--sgl)", color: "var(--sg)", border: "none", borderRadius: "var(--r)", fontWeight: 800, marginBottom: "var(--sp-3)", cursor: "pointer" }}>
            😴 Start Sleep Tracking
          </button>
        )}

        {sleepSummary.total > 0 && (
          <div style={{ background: "var(--gdl)", borderRadius: "var(--r)", padding: "var(--sp-3)" }}>
            <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, marginBottom: "var(--sp-1)" }}>Today's Sleep</p>
            <p style={{ fontSize: "var(--fs-lg)", fontWeight: 900, marginBottom: "var(--sp-1)" }}>{sleepSummary.totalDurationFormatted}</p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>
              {sleepSummary.total} nap{sleepSummary.total !== 1 ? 's' : ''} • Target: {config.expectedSleepMin}–{config.expectedSleepMax} hours
            </p>
          </div>
        )}

        {sleepLog.slice(0, 3).map(sleep => (
          <div key={sleep.id} style={{ marginTop: "var(--sp-2)", padding: "var(--sp-2)", background: "var(--card)", borderRadius: "var(--r)", border: "1px solid var(--bll)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{sleep.date}</span>
              <span style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>{sleep.durationFormatted}</span>
            </div>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginTop: "var(--sp-1)" }}>
              {new Date(sleep.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → 
              {new Date(sleep.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ))}
      </WCard>

      {/* Vaccination Section */}
      <SectionTitle title="NHS Vaccination Schedule 💉" subtitle="Updated June 2026" />
      <WCard>
        {nextVaccination && (
          <div style={{ background: "rgb(124 58 237 / 12%)", padding: "var(--sp-3)", borderRadius: "var(--r)", marginBottom: "var(--sp-4)" }}>
            <strong style={{ fontSize: "var(--fs-sm)" }}>Next due: 📅</strong>
            <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, marginTop: "var(--sp-1)" }}>{nextVaccination.name}</p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>at {nextVaccination.dueWeeks} weeks</p>
            <p style={{ fontSize: "var(--fs-xs)", marginTop: "var(--sp-1)" }}>{nextVaccination.description}</p>
          </div>
        )}
        
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-sm)" }}>
          {vaccinations.map((vac) => (
            <div key={vac.id} style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              padding: "var(--sp-2)",
              background: vac.completed ? "var(--gdl)" : "var(--card)",
              borderRadius: "var(--r)",
              opacity: vac.completed ? 0.7 : 1
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "var(--fs-sm)", fontWeight: vac.completed ? 400 : 600 }}>
                  {vac.completed ? "✅ " : "⏳ "}{vac.name}
                </p>
                <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>Due: {vac.dueWeeks} weeks</p>
                {vac.description && (
                  <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginTop: "var(--sp-1)" }}>{vac.description}</p>
                )}
              </div>
              <button
                onClick={() => toggleVaccination(vac.id)}
                style={{
                  padding: "var(--sp-1) var(--sp-2)",
                  background: vac.completed ? "var(--sg)" : "var(--lvl)",
                  color: vac.completed ? "#fff" : "var(--lv)",
                  border: "none",
                  borderRadius: "var(--r)",
                  cursor: "pointer",
                  fontSize: "var(--fs-xs)",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  marginLeft: "var(--sp-2)"
                }}
              >
                {vac.completed ? "Completed" : "Mark Done"}
              </button>
            </div>
          ))}
        </div>
      </WCard>

      {/* Developmental Milestones Section */}
      <SectionTitle title="Developmental Milestones 🌱" subtitle="Track your baby's progress" />
      <WCard>
        <MilestoneProgress />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)', marginTop: 'var(--sp-4)' }}>
          {milestones.map((milestone) => {
            const status = getMilestoneStatus(milestone);
            return (
              <div key={milestone.id} style={{
                padding: 'var(--sp-3)',
                background: status.type === 'achieved' ? 'var(--sgl)' : 'var(--card)',
                borderRadius: 'var(--r)',
                border: `1px solid ${status.type === 'due' ? 'var(--bl)' : 'var(--bll)'}`,
                opacity: status.type === 'achieved' ? 0.8 : 1
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--gap-sm)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-1)' }}>
                      <span style={{ fontSize: 'var(--fs-lg)' }}>{status.icon}</span>
                      <span style={{ fontWeight: 800, fontSize: 'var(--fs-sm)' }}>{milestone.name}</span>
                    </div>
                    <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginLeft: 'var(--sp-5)' }}>
                      {milestone.category} • Typical: {milestone.typicalRange}
                    </p>
                    <p style={{ fontSize: 'var(--fs-xs)', color: status.color, marginLeft: 'var(--sp-5)', marginTop: 'var(--sp-1)' }}>
                      {status.label}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleMilestone(milestone.id)}
                    style={{
                      padding: 'var(--sp-2) var(--sp-3)',
                      background: achievedMilestones[milestone.id] ? 'var(--sg)' : 'var(--lvl)',
                      color: achievedMilestones[milestone.id] ? '#fff' : 'var(--lv)',
                      border: 'none',
                      borderRadius: 'var(--r)',
                      cursor: 'pointer',
                      fontSize: 'var(--fs-xs)',
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {achievedMilestones[milestone.id] ? '✓ Achieved' : 'Mark Achieved'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {upcomingMilestones.length > 0 && (
          <div style={{ marginTop: "var(--sp-4)" }}>
            <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, marginBottom: "var(--sp-2)" }}>📋 Upcoming milestones to watch for:</p>
            {upcomingMilestones.slice(0, 3).map((milestone, idx) => (
              <div key={idx} style={{ padding: "var(--sp-2)", background: "var(--bll)", borderRadius: "var(--r)", marginBottom: "var(--sp-2)" }}>
                <p style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{milestone.name}</p>
                <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>
                  Expected around week {milestone.dueWeeks} • {milestone.category}
                </p>
              </div>
            ))}
          </div>
        )}
      </WCard>

      {/* Pumping Sessions History */}
      {pumpSessions.length > 0 && (
        <>
          <SectionTitle title="Pumping History 🍼" />
          {pumpSessions.slice(0, 5).map(session => (
            <WCard key={session.id} style={{ marginBottom: "var(--gap-sm)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800 }}>{formatPumpTime(session.duration)}</p>
                  <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>
                    {new Date(session.timestamp).toLocaleDateString()} • {session.side} breast
                  </p>
                </div>
                <Tag label={`~${session.amount}ml`} bg="var(--bll)" tc="var(--bl)" />
              </div>
            </WCard>
          ))}
        </>
      )}
    </div>
  );
}