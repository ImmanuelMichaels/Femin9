import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";

export default function AppHeader({ onSOS, onMenuOpen }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('appLanguage') || "EN";
  });
  const { 
    userName, 
    journeyType, 
    getCurrentWeek, 
    getTrimester,
    babyAgeDays 
  } = useApp();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };
  
  // Get journey-specific display info
  const getJourneyDisplay = () => {
    switch(journeyType) {
      case 'pregnant':
        const week = getCurrentWeek();
        const trimester = getTrimester();
        return `Week ${week} · ${trimester}${trimester === 1 ? 'st' : trimester === 2 ? 'nd' : 'rd'} Trimester`;
      case 'conceive':
        return `Cycle Day ${getCycleDay()} · Fertility Tracking`;
      case 'ivf':
        return `IVF Cycle · Day ${getIVFDay()}`;
      case 'mom':
        const days = babyAgeDays || 0;
        const weeks = Math.floor(days / 7);
        return `Week ${weeks} Postpartum · ${days} days old`;
      case 'menstrual':
        return `Cycle Phase: ${getMenstrualPhase()}`;
      case 'menopause':
        return `Menopause Support · Active`;
      default:
        return "Health Journey";
    }
  };
  
  // Helper functions for different journey types
  const getCycleDay = () => {
    const lastPeriod = localStorage.getItem('lastPeriodStart');
    if (lastPeriod) {
      const start = new Date(lastPeriod);
      const today = new Date();
      const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
      return diffDays + 1;
    }
    return 12;
  };
  
  const getIVFDay = () => {
    const retrievalDate = localStorage.getItem('eggRetrievalDate');
    if (retrievalDate) {
      const retrieval = new Date(retrievalDate);
      const today = new Date();
      const diffDays = Math.floor((today - retrieval) / (1000 * 60 * 60 * 24));
      return diffDays + 1;
    }
    return 5;
  };
  
  const getMenstrualPhase = () => {
    const cycleDay = getCycleDay();
    const cycleLength = parseInt(localStorage.getItem('cycleLength') || '28');
    
    if (cycleDay <= 5) return "Menstrual";
    if (cycleDay <= 13) return "Follicular";
    if (cycleDay <= 16) return "Ovulatory";
    return "Luteal";
  };
  
  // Get status pills based on journey
  const getStatusPills = () => {
    switch(journeyType) {
      case 'pregnant':
        const week = getCurrentWeek();
        return [
          { color: "#E8956D", text: getJourneyDisplay(), tooltip: "Current pregnancy stage" },
          { color: "#6AAB7C", text: "3/6 supplements ✓", tooltip: "Daily supplement progress" },
          { color: "#E8956D", text: week >= 24 ? "Baby: 600g 🌽" : "Baby: Growing 🌱", tooltip: week >= 24 ? "Baby is the size of a scallion" : "Baby is developing rapidly" }
        ];
      case 'conceive':
        return [
          { color: "#9B8FD8", text: getJourneyDisplay(), tooltip: "Current cycle day" },
          { color: "#6AAB7C", text: "Folic acid ✓", tooltip: "Daily supplement taken" },
          { color: "#E8956D", text: getCycleDay() >= 12 && getCycleDay() <= 16 ? "Fertile Window 🌸" : "Tracking Active", tooltip: getCycleDay() >= 12 && getCycleDay() <= 16 ? "Peak fertility days" : "Keep tracking daily" }
        ];
      case 'ivf':
        return [
          { color: "#9B8FD8", text: getJourneyDisplay(), tooltip: "Current IVF stage" },
          { color: "#6AAB7C", text: "4/5 meds taken ✓", tooltip: "Medication adherence" },
          { color: "#E8956D", text: "Embryo Day 5", tooltip: "Blastocyst development" }
        ];
      case 'mom':
        const days = babyAgeDays || 0;
        const weeks = Math.floor(days / 7);
        return [
          { color: "#E8956D", text: getJourneyDisplay(), tooltip: "Postpartum stage" },
          { color: "#6AAB7C", text: "Breastfeeding Active", tooltip: "Milk supply building" },
          { color: "#9B8FD8", text: weeks >= 6 ? "Recovery: On track 💪" : "Healing: Week " + weeks, tooltip: weeks >= 6 ? "6-week check recommended" : "Rest and recover" }
        ];
      case 'menopause':
        return [
          { color: "#9B8FD8", text: getJourneyDisplay(), tooltip: "Current stage" },
          { color: "#6AAB7C", text: "3 hot flashes today", tooltip: "Log symptoms daily" },
          { color: "#E8956D", text: "HRT: Active 💜", tooltip: "Hormone replacement therapy" }
        ];
      default:
        return [
          { color: "#E8956D", text: "Health Journey", tooltip: "Your personalized journey" },
          { color: "#6AAB7C", text: "Tracking Active", tooltip: "Keep logging daily" },
          { color: "#9B8FD8", text: "AI Ready 🤖", tooltip: "Ask Bloom anything" }
        ];
    }
  };
  
  // Handle language change
  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem('appLanguage', newLang);
    // In a real app, you'd trigger i18n change here
  };
  
  const greeting = getGreeting();
  const displayName = userName || (journeyType === 'menopause' ? 'Queen' : 'Mama');
  const journeyDisplay = getJourneyDisplay();
  const statusPills = getStatusPills();
  
  return (
    <div style={{ 
      background: "linear-gradient(145deg,#3D1A0A 0%,#7C3A1E 45%,#C4603A 100%)", 
      padding: "var(--sp-5) var(--pad-x) var(--sp-4)", 
      position: "relative", 
      overflow: "hidden", 
      flexShrink: 0 
    }}>
      {/* Decorative background elements */}
      <div style={{ 
        position: "absolute", 
        top: -50, 
        right: -50, 
        width: 180, 
        height: 180, 
        borderRadius: "50%", 
        background: "rgba(255,255,255,0.04)", 
        pointerEvents: "none" 
      }} />
      <div style={{ 
        position: "absolute", 
        bottom: -30, 
        left: -30, 
        width: 120, 
        height: 120, 
        borderRadius: "50%", 
        background: "rgba(255,255,255,0.03)", 
        pointerEvents: "none" 
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Top row: Menu + Logo + Language + SOS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-4)" }}>
          {/* Left: Hamburger + Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
            <button
              onClick={onMenuOpen}
              style={{ 
                background: "rgba(255,255,255,0.15)", 
                border: "1px solid rgba(255,255,255,0.25)", 
                borderRadius: 12, 
                width: 44, 
                height: 44, 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center", 
                gap: 5, 
                cursor: "pointer", 
                padding: "var(--sp-2)",
                flexShrink: 0,
                transition: "all 0.2s"
              }}
              aria-label="Open menu"
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
            >
              {[0, 1, 2].map(i => (
                <div key={i} style={{ 
                  width: i === 1 ? 14 : 18, 
                  height: 2, 
                  background: "rgba(255,255,255,0.95)", 
                  borderRadius: 1,
                  transition: "width 0.2s"
                }} />
              ))}
            </button>

            <div style={{ 
              fontFamily: "var(--serif)", 
              fontSize: 24, 
              color: "#fff", 
              fontStyle: "italic",
              letterSpacing: -0.5
            }}>
              Mama<b style={{ fontStyle: "normal", color: "#E8956D" }}>Bloom</b>
            </div>
          </div>

          {/* Right: Language switcher + SOS */}
          <div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "center" }}>
            <div style={{ 
              display: "flex", 
              gap: 2, 
              background: "rgba(255,255,255,0.12)", 
              borderRadius: 30, 
              padding: 3,
              backdropFilter: "blur(4px)"
            }}>
              {["EN", "YO", "IG", "HA", "PID"].map(l => (
                <button
                  key={l}
                  onClick={() => handleLanguageChange(l)}
                  style={{ 
                    padding: "4px 8px", 
                    borderRadius: 20, 
                    fontSize: 10, 
                    fontWeight: 700, 
                    background: lang === l ? "rgba(255,255,255,0.95)" : "none", 
                    color: lang === l ? "#C4603A" : "rgba(255,255,255,0.7)", 
                    border: "none", 
                    cursor: "pointer",
                    transition: "all 0.2s",
                    minWidth: 34
                  }}
                  aria-label={`Switch to ${l === 'EN' ? 'English' : l === 'YO' ? 'Yorùbá' : l === 'IG' ? 'Igbo' : l === 'HA' ? 'Hausa' : 'Pidgin'}`}
                >
                  {l}
                </button>
              ))}
            </div>
            <button
              onClick={onSOS}
              style={{ 
                background: "rgba(192,57,43,0.9)", 
                border: "1px solid rgba(255,100,80,0.5)", 
                borderRadius: 30, 
                padding: "6px 14px", 
                color: "#fff", 
                fontSize: 12, 
                fontWeight: 800, 
                cursor: "pointer", 
                animation: "pulse 2s infinite",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.2s"
              }}
              aria-label="Emergency SOS"
            >
              🚨 SOS
            </button>
          </div>
        </div>

        {/* Greeting */}
        <p style={{ 
          fontFamily: "var(--serif)", 
          fontSize: 18, 
          color: "rgba(255,255,255,0.95)", 
          marginBottom: 4,
          fontWeight: 500
        }}>
          {greeting}, <b>{displayName}</b> 🌸
        </p>
        
        {/* Location and Status */}
        <p style={{ 
          fontSize: 11, 
          color: "rgba(255,255,255,0.6)", 
          marginBottom: "var(--sp-3)",
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <span>📍 Lagos, NG</span>
          <span>•</span>
          <span>🤖 AI Companion Ready</span>
        </p>

        {/* Status Pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {statusPills.map((pill, i) => (
            <div 
              key={i} 
              style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: 6, 
                background: "rgba(255,255,255,0.12)", 
                border: "1px solid rgba(255,255,255,0.2)", 
                padding: "5px 12px", 
                borderRadius: 30, 
                fontSize: 11, 
                color: "rgba(255,255,255,0.95)", 
                fontWeight: 600,
                backdropFilter: "blur(4px)"
              }}
              title={pill.tooltip}
            >
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: pill.color }} />
              {pill.text}
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(0.98); }
        }
      `}</style>
    </div>
  );
}