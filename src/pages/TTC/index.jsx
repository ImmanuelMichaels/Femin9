import { useState, useEffect, useRef, useCallback } from 'react';
import { CalendarDays, Settings, Stethoscope, Thermometer, Lightbulb, Heart, Zap, CheckCircle } from 'lucide-react';
import { WCard, SectionTitle, Tag, Pill as PillComponent } from '../../components/ui';
import { isSameDay, isBetween, daysInMonth, firstDayOfMonth } from '../../utils/helpers';


// ─── Constants ───────────────────────────────────────────────────────────────

const SYMPTOMS = [
  "Cramping","Spotting","Heavy flow","Discharge (white)","Egg white CM",
  "Watery CM","Nausea","Fatigue","Hot flashes","Cravings",
  "Mood swings","Breast tenderness","Increased libido"
];

const TAB_ICONS = {
  calendar: CalendarDays,
  setup: Settings,
  symptoms: Stethoscope,
  bbt: Thermometer,
  insights: Lightbulb,
  intercourse: Heart,
  lh: Zap
};

const DAY_COLS = {
  period:    ["#FDEEEC","#D0524A","🩸"],
  fertile:   ["#E3F5EA","#5A9E6E","💞"],
  ovulation: ["#EDE9F8","#8B7EC8","🥚"],
  free:      ["#E4F0F9","#3A78C4","✨"],
  other:     ["transparent","var(--border)",""]
};

const MEDICAL_DISCLAIMER = "This app provides general wellness information only. Always consult a qualified healthcare provider before making medical decisions.";


// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse YYYY-MM-DD as local midnight — avoids UTC-offset date shifts */
function parseLocalDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function computeCycle(startStr, cLen, pLen) {
  if (!startStr) return null;
  const start = parseLocalDate(startStr);
  if (!start) return null;

  const periodEnd  = new Date(start); periodEnd.setDate(start.getDate() + pLen - 1);
  const ovDay      = new Date(start); ovDay.setDate(start.getDate() + cLen - 14);
  const fertStart  = new Date(ovDay); fertStart.setDate(ovDay.getDate() - 5);
  const fertEnd    = new Date(ovDay); fertEnd.setDate(ovDay.getDate() + 1);
  const nextPeriod = new Date(start); nextPeriod.setDate(start.getDate() + cLen);

  // Guard: freeStart must come after periodEnd; freeEnd must come before fertStart
  const freeStart = new Date(periodEnd); freeStart.setDate(periodEnd.getDate() + 1);
  const freeEnd   = new Date(fertStart); freeEnd.setDate(fertStart.getDate() - 1);

  // Detect invalid windows (e.g. very short cycles)
  const hasFreeWindow = freeStart <= freeEnd;

  return { start, periodEnd, ovDay, fertStart, fertEnd, nextPeriod, freeStart, freeEnd, hasFreeWindow };
}

function fmt(d) {
  return d?.toLocaleDateString("en-NG", { day: "numeric", month: "short" }) || "—";
}

/** Safe localStorage read with JSON parse and fallback */
function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/** Safe localStorage write */
function safeWrite(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota/private mode */ }
}

/**
 * Ovulation confirmation:
 * "Confirmed" = BBT rise (≥36.7°C in last 2 readings) + LH peak in last 3 days + egg-white CM logged today
 */
function getOvulationConfidence(bbtLog, lhLogs, savedSymptoms) {
  const recentBBT    = bbtLog.slice(-2).every(b => b.temp >= 36.7);
  const recentLHPeak = lhLogs.slice(0, 3).some(l => l.level === "peak");
  const todayCM      = (savedSymptoms[new Date().toDateString()] || []).includes("Egg white CM");

  const signals = [recentBBT, recentLHPeak, todayCM].filter(Boolean).length;
  if (signals === 3) return { label: "Confirmed Ovulation ✅", color: "var(--lv)", bg: "var(--lvl)", detail: "BBT rise + LH peak + egg-white CM all detected." };
  if (signals === 2) return { label: "Likely Ovulation 🟡", color: "var(--gd)", bg: "var(--gdl)", detail: `${signals}/3 signals detected. Continue tracking.` };
  if (signals === 1) return { label: "Possible Ovulation 🔵", color: "var(--bl)", bg: "var(--bll)", detail: "Only 1/3 signals detected. Keep logging." };
  return null;
}

/** Days until a future date from today */
function daysUntil(date) {
  if (!date) return null;
  const now = new Date(); now.setHours(0,0,0,0);
  const d   = new Date(date); d.setHours(0,0,0,0);
  return Math.round((d - now) / 86400000);
}

/** Which day of the fertile window is today (1-indexed, or null) */
function fertileWindowDay(cycle) {
  if (!cycle) return null;
  const now = new Date(); now.setHours(0,0,0,0);
  if (!isBetween(now, cycle.fertStart, cycle.fertEnd)) return null;
  const start = new Date(cycle.fertStart); start.setHours(0,0,0,0);
  return Math.round((now - start) / 86400000) + 1;
}

/** Total days in the fertile window */
function fertileWindowTotal(cycle) {
  if (!cycle) return 6;
  const s = new Date(cycle.fertStart); s.setHours(0,0,0,0);
  const e = new Date(cycle.fertEnd);   e.setHours(0,0,0,0);
  return Math.round((e - s) / 86400000) + 1;
}


// ─── Component ───────────────────────────────────────────────────────────────

export default function TTC() {
  const today = new Date();

  // ── Core cycle state ──
  const [cycleLength,    setCycleLength]    = useState(28);
  const [periodLength,   setPeriodLength]   = useState(5);
  const [lastPeriodStart, setLastPeriodStart] = useState("");
  const [savedCycle,     setSavedCycle]     = useState(() => safeRead('ttc_savedCycle', null));
  const [activeMonth,    setActiveMonth]    = useState(new Date());
  const [notification,   setNotification]   = useState(null);
  const [activeTab,      setActiveTab]      = useState("calendar");

  // ── BBT ──
  const [bbt,    setBbt]    = useState("");
  const [bbtLog, setBbtLog] = useState(() => safeRead('ttc_bbtLog', [])); // persisted — no seed data

  // ── Symptoms ──
  const [symptomSel,    setSymptomSel]    = useState([]);
  const [savedSymptoms, setSavedSymptoms] = useState(() => safeRead('ttc_savedSymptoms', {}));

  // ── Intercourse (plaintext localStorage — "private" label removed) ──
  const [intercourseLog,      setIntercourseLog]      = useState(() => safeRead('ttc_intercourseLog', []));
  const [showIntercourseNote, setShowIntercourseNote] = useState(false);
  const [intercourseNote,     setIntercourseNote]     = useState("");

  // ── LH ──
  const [lhLevel, setLhLevel] = useState(null);
  const [lhLogs,  setLhLogs]  = useState(() => safeRead('ttc_lhLogs', []));

  // ── Cycle history / GP nudge ──
  const [totalCycles,  setTotalCycles]  = useState(() => parseInt(safeRead('ttc_totalCycles', '0')));
  const [showGPNudge,  setShowGPNudge]  = useState(false);
  const [cycleHistory, setCycleHistory] = useState(() => safeRead('ttc_cycleHistory', []));

  // ── Cycle notes ──
  const [cycleNotes,    setCycleNotes]    = useState(() => safeRead('ttc_cycleNotes', {}));
  const [currentNote,   setCurrentNote]   = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);

  // ── Pregnancy test reminder dismissed flag ──
  const [ptReminderDismissed, setPtReminderDismissed] = useState(() => safeRead('ttc_ptDismissed', false));

  // ── Derived ──
  const cycle = savedCycle
    ? computeCycle(savedCycle.lastPeriodStart, savedCycle.cycleLength, savedCycle.periodLength)
    : null;

  const avgCycleLength = cycleHistory.length > 0
    ? Math.round(cycleHistory.reduce((a, b) => a + b, 0) / cycleHistory.length)
    : cycleLength;

  const ovulationConfidence = getOvulationConfidence(bbtLog, lhLogs, savedSymptoms);

  // Days until next period (for pregnancy test nudge)
  const daysToNextPeriod = cycle ? daysUntil(cycle.nextPeriod) : null;
  const showPTReminder   = !ptReminderDismissed && daysToNextPeriod !== null && daysToNextPeriod <= 0;

  // Cycle regularity warning
  const cycleIrregular = cycleHistory.length >= 3 && (
    Math.max(...cycleHistory) - Math.min(...cycleHistory) > 7 ||
    avgCycleLength > 35 ||
    avgCycleLength < 21
  );

  // ── Persist all state ──────────────────────────────────────────────────────
  useEffect(() => { safeWrite('ttc_savedCycle',      savedCycle);      }, [savedCycle]);
  useEffect(() => { safeWrite('ttc_bbtLog',          bbtLog);          }, [bbtLog]);
  useEffect(() => { safeWrite('ttc_savedSymptoms',   savedSymptoms);   }, [savedSymptoms]);
  useEffect(() => { safeWrite('ttc_intercourseLog',  intercourseLog);  }, [intercourseLog]);
  useEffect(() => { safeWrite('ttc_lhLogs',          lhLogs);          }, [lhLogs]);
  useEffect(() => { safeWrite('ttc_totalCycles',     totalCycles);     }, [totalCycles]);
  useEffect(() => { safeWrite('ttc_cycleHistory',    cycleHistory);    }, [cycleHistory]);
  useEffect(() => { safeWrite('ttc_cycleNotes',      cycleNotes);      }, [cycleNotes]);
  useEffect(() => { safeWrite('ttc_ptDismissed',     ptReminderDismissed); }, [ptReminderDismissed]);

  // ── GP nudge: fire once when threshold reached ─────────────────────────────
  useEffect(() => {
    if (totalCycles >= 12) setShowGPNudge(true);
  }, [totalCycles]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getDayType = useCallback((d) => {
    if (!cycle) return null;
    if (isBetween(d, cycle.start, cycle.periodEnd))  return "period";
    if (isSameDay(d, cycle.ovDay))                   return "ovulation";
    if (isBetween(d, cycle.fertStart, cycle.fertEnd)) return "fertile";
    if (cycle.hasFreeWindow && isBetween(d, cycle.freeStart, cycle.freeEnd)) return "free";
    return "other";
  }, [cycle]);

  const showNotif = useCallback((msg, col = "var(--sg)") => {
    setNotification({ msg, col });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // ── Save cycle — fixed: passes value directly, not via stale state ─────────
  const saveCycleWith = useCallback((periodStart, cLen, pLen) => {
    if (!periodStart) { showNotif("Please enter your last period start date", "var(--rd)"); return; }

    if (savedCycle) {
      setCycleHistory(prev => [...prev.slice(-11), savedCycle.cycleLength]);
    }

    const newSaved = { lastPeriodStart: periodStart, cycleLength: cLen, periodLength: pLen };
    setSavedCycle(newSaved);
    setTotalCycles(prev => prev + 1);
    setPtReminderDismissed(false); // reset for new cycle

    const c = computeCycle(periodStart, cLen, pLen);
    const now = new Date(); now.setHours(0,0,0,0);
    if (c) {
      if (isSameDay(now, c.ovDay))                    showNotif("Today is your Ovulation Day! Best time to conceive.", "var(--lv)");
      else if (isBetween(now, c.fertStart, c.fertEnd)) showNotif("You're in your Fertile Window!", "var(--sg)");
      else if (isBetween(now, c.start, c.periodEnd))  showNotif("Your period is active.", "var(--rd)");
      else                                              showNotif("✅ Cycle saved! Calendar updated.", "var(--sg)");
    }
  }, [savedCycle, showNotif]);

  const handleSave = () => saveCycleWith(lastPeriodStart, cycleLength, periodLength);

  /** Fixed: passes today's date directly instead of relying on async state update */
  const resetCycle = () => {
    const newPeriodStart = new Date().toISOString().split('T')[0];
    setLastPeriodStart(newPeriodStart);
    saveCycleWith(newPeriodStart, cycleLength, periodLength);
  };

  const logIntercourse = () => {
    const fwDay   = fertileWindowDay(cycle);
    const fwTotal = fertileWindowTotal(cycle);
    const newLog  = {
      id:            Date.now(),
      date:          new Date().toISOString(),
      dateStr:       new Date().toLocaleDateString(),
      note:          intercourseNote,
      fertileWindow: !!(cycle && isBetween(new Date(), cycle.fertStart, cycle.fertEnd)),
      fertileDay:    fwDay,
      fertileTotal:  fwTotal,
    };
    setIntercourseLog(prev => [newLog, ...prev]);
    setIntercourseNote("");
    setShowIntercourseNote(false);
    showNotif("✅ Intimacy logged", "var(--sg)");
  };

  const logLH = (level) => {
    const newLog = { id: Date.now(), date: new Date().toISOString(), dateStr: new Date().toLocaleDateString(), level };
    setLhLogs(prev => [newLog, ...prev]);
    setLhLevel(level);
    if (level === "peak") {
      showNotif("🎯 LH Peak detected! Ovulation likely in 24–36 hours. Best time to conceive!", "var(--lv)");
    } else {
      showNotif(`✅ LH ${level} logged`, "var(--gd)");
    }
  };

  const saveCycleNote = () => {
    if (!currentNote.trim()) return;
    const key = savedCycle?.lastPeriodStart || new Date().toDateString();
    setCycleNotes(prev => ({ ...prev, [key]: currentNote.trim() }));
    setCurrentNote("");
    setShowNoteInput(false);
    showNotif("✅ Cycle note saved", "var(--sg)");
  };

  // ── Calendar helpers ───────────────────────────────────────────────────────
  const y = activeMonth.getFullYear(), m = activeMonth.getMonth();
  const totalDays = daysInMonth(y, m);
  const firstDay  = firstDayOfMonth(y, m);

  // BBT chart data
  const bbtChartData = bbtLog.slice(-14); // show up to 14 days
  const bbtMax = bbtChartData.length ? Math.max(...bbtChartData.map(b => b.temp)) : 37.2;
  const bbtMin = bbtChartData.length ? Math.min(...bbtChartData.map(b => b.temp)) : 36.0;

  // Fertile window context
  const isInFertileWindow = cycle && isBetween(new Date(), cycle.fertStart, cycle.fertEnd);
  const currentFWDay      = fertileWindowDay(cycle);
  const currentFWTotal    = fertileWindowTotal(cycle);

  // ── Cycle pattern analysis ─────────────────────────────────────────────────
  const cyclePattern = (() => {
    if (cycleHistory.length < 3) return null;
    const last3 = cycleHistory.slice(-3);
    const trend = last3[2] - last3[0];
    if (trend > 3)  return { label: "Cycles getting longer", icon: "📈", color: "var(--gd)" };
    if (trend < -3) return { label: "Cycles getting shorter", icon: "📉", color: "var(--rd)" };
    return { label: "Regular cycle pattern", icon: "✅", color: "var(--sg)" };
  })();


  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="page-pad">

      {/* ── Notification toast ── */}
      {notification && (
        <div style={{ position: "sticky", top: 0, zIndex: 50, background: notification.col, color: "#fff", padding: "var(--sp-3) var(--card-p)", borderRadius: "var(--r)", marginBottom: "var(--gap-md)", fontSize: "var(--fs-sm)", fontWeight: 700, boxShadow: "var(--sh2)" }}>
          {notification.msg}
        </div>
      )}

      {/* ── Pregnancy test reminder ── */}
      {showPTReminder && (
        <WCard style={{ background: "var(--lvl)", border: "2px solid var(--lvm)", marginBottom: "var(--gap-md)" }}>
          <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "center" }}>
            <div style={{ fontSize: 36 }}>🤰</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 800, color: "var(--lv)", marginBottom: 4 }}>Time for a pregnancy test?</p>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.5 }}>
                Your period was due {Math.abs(daysToNextPeriod)} day{Math.abs(daysToNextPeriod) !== 1 ? "s" : ""} ago. If you've been trying, now is a good time to test.
              </p>
            </div>
            <button onClick={() => setPtReminderDismissed(true)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "var(--mt)" }}>×</button>
          </div>
        </WCard>
      )}

      {/* ── GP nudge (now actually fires) ── */}
      {showGPNudge && (
        <WCard style={{ background: "var(--bll)", border: "2px solid var(--bl)", marginBottom: "var(--gap-md)" }}>
          <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "flex-start" }}>
            <div style={{ fontSize: 32 }}>🩺</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 800, color: "var(--bl)", marginBottom: 4 }}>You've been tracking for {totalCycles} cycles</p>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.5 }}>
                If you're under 35 and have been trying for 12 months (6 months if over 35), it's time to speak with your GP. They can arrange initial fertility tests and refer you to a specialist.
              </p>
              <div style={{ display: "flex", gap: "var(--gap-sm)", marginTop: 8 }}>
                <button onClick={() => window.open("https://www.nhs.uk/conditions/infertility/diagnosis/", "_blank")} style={{ background: "var(--bl)", color: "#fff", border: "none", borderRadius: 20, padding: "6px 16px", cursor: "pointer", fontSize: "var(--fs-xs)" }}>NHS Fertility Info →</button>
                <button onClick={() => setShowGPNudge(false)} style={{ background: "transparent", border: "1px solid var(--bl)", borderRadius: 20, padding: "6px 16px", cursor: "pointer", color: "var(--bl)", fontSize: "var(--fs-xs)" }}>Dismiss</button>
              </div>
            </div>
          </div>
        </WCard>
      )}

      {/* ── Cycle irregularity warning ── */}
      {cycleIrregular && (
        <WCard style={{ background: "var(--rdl)", border: "1.5px solid var(--rdm)", marginBottom: "var(--gap-md)" }}>
          <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "center" }}>
            <div style={{ fontSize: 28 }}>⚠️</div>
            <div>
              <p style={{ fontWeight: 800, color: "var(--rd)", marginBottom: 4, fontSize: "var(--fs-sm)" }}>Irregular cycle pattern detected</p>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)", lineHeight: 1.5 }}>
                Your cycles vary by more than 7 days (avg: {avgCycleLength} days). This can affect ovulation prediction. Consider speaking with a GP.
              </p>
            </div>
          </div>
        </WCard>
      )}

      {/* ── Ovulation confidence composite signal ── */}
      {ovulationConfidence && (
        <WCard style={{ background: ovulationConfidence.bg, border: `2px solid ${ovulationConfidence.color}44`, marginBottom: "var(--gap-md)" }}>
          <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "center" }}>
            <div style={{ fontSize: 32 }}>🔬</div>
            <div>
              <p style={{ fontWeight: 800, color: ovulationConfidence.color, marginBottom: 4 }}>{ovulationConfidence.label}</p>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)" }}>{ovulationConfidence.detail}</p>
            </div>
          </div>
        </WCard>
      )}

      {/* ── Fertile window glow card with day context ── */}
      {isInFertileWindow && (
        <WCard style={{ background: "linear-gradient(135deg, #FFF0F5, #FFE4E8)", border: "2px solid #D63A6E", marginBottom: "var(--gap-md)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)" }}>
            <div style={{ fontSize: 40 }}>🌸</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-sm)", marginBottom: 4 }}>
                <p style={{ fontWeight: 800, color: "#D63A6E" }}>Fertile Window — Day {currentFWDay} of {currentFWTotal}</p>
              </div>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--dp)", lineHeight: 1.5 }}>
                Today, dress for how you want to feel. Try warm reds or deep wines — colours of confidence and sensuality.
                Light a candle tonight, put phones away, and just be together.
              </p>
              <p style={{ fontSize: "var(--fs-xs)", color: "#D63A6E", marginTop: 8, fontStyle: "italic" }}>
                ✨ Your body is doing something extraordinary. Let yourself feel beautiful in it.
              </p>
            </div>
          </div>
        </WCard>
      )}

      {/* ── Tab Navigation ── */}
      <div style={{ display: "flex", gap: "var(--gap-sm)", marginBottom: "var(--sp-4)", overflowX: "auto", scrollbarWidth: "none", maskImage: "linear-gradient(to right, black 85%, transparent 100%)" }}>
        {["calendar","setup","symptoms","bbt","lh","intercourse","insights"].map(id => {
          const Icon = TAB_ICONS[id];
          const labels = { calendar:"Calendar", setup:"Cycle Setup", symptoms:"Symptoms", bbt:"BBT", insights:"Insights", intercourse:"Intimacy", lh:"LH Test" };
          return (
            <PillComponent key={id} label={
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {Icon && <Icon size={14} />}
                <span>{labels[id]}</span>
              </div>
            } active={activeTab === id} onClick={() => setActiveTab(id)} />
          );
        })}
      </div>


      {/* ════════════════════════ CALENDAR TAB ════════════════════════ */}
      {activeTab === "calendar" && (
        <>
          <SectionTitle title="📅 Fertility Calendar" subtitle="Track your cycle and fertile days" />
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>

            {!savedCycle && (
              <WCard style={{ textAlign: "center", padding: "var(--sp-5)", background: "var(--lvl)", border: "1.5px solid var(--lvm)44" }}>
                <div style={{ fontSize: 40, marginBottom: "var(--sp-3)" }}>🌸</div>
                <p style={{ fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-2)" }}>Set up your cycle first</p>
                <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", marginBottom: "var(--sp-4)" }}>Enter your last period date to see your personalised fertility calendar.</p>
                <button onClick={() => setActiveTab("setup")} style={{ background: "var(--lv)", color: "#fff", border: "none", borderRadius: "var(--r)", padding: "var(--sp-3)", fontWeight: 800, cursor: "pointer" }}>⚙️ Set Up Cycle</button>
              </WCard>
            )}

            {savedCycle && cycle && (
              <>
                {/* Summary cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap-sm)", marginBottom: "var(--gap-md)" }}>
                  {[
                    { label:"🩸 Period",          val:`${fmt(cycle.start)} – ${fmt(cycle.periodEnd)}`,     bg:"var(--rdl)", tc:"var(--rd)" },
                    { label:"🥚 Ovulation",        val:fmt(cycle.ovDay),                                   bg:"var(--lvl)", tc:"var(--lv)" },
                    { label:"💞 Fertile Window",   val:`${fmt(cycle.fertStart)} – ${fmt(cycle.fertEnd)}`, bg:"var(--sgl)", tc:"var(--sg)" },
                    { label:"📅 Next Period",      val:fmt(cycle.nextPeriod),                             bg:"var(--gdl)", tc:"var(--gd)" },
                  ].map((item, i) => (
                    <div key={i} style={{ background: item.bg, borderRadius: "var(--r)", padding: "var(--sp-3) var(--card-p)", border: `1.5px solid ${item.tc}33` }}>
                      <p style={{ fontSize: "var(--fs-xs)", fontWeight: 700, color: item.tc, marginBottom: 4 }}>{item.label}</p>
                      <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--dp)" }}>{item.val}</p>
                    </div>
                  ))}
                </div>

                {/* Today's status */}
                {(() => {
                  const now = new Date(); now.setHours(0,0,0,0);
                  const dt  = getDayType(now);
                  if (dt === "ovulation") return (
                    <WCard style={{ background: "linear-gradient(135deg,var(--lvl),#F8F6FE)", border: "2px solid var(--lvm)", marginBottom: "var(--gap-md)" }}>
                      <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "center" }}>
                        <div style={{ fontSize: 36 }}>💜</div>
                        <div><p style={{ fontWeight: 800, color: "var(--lv)", marginBottom: 4, fontSize: "var(--fs-md)" }}>Today is Ovulation Day!</p><p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.55 }}>Peak fertility day. Best time to conceive. 💞</p></div>
                      </div>
                    </WCard>
                  );
                  if (dt === "fertile") return (
                    <WCard style={{ background: "var(--sgl)", border: "2px solid var(--sgm)", marginBottom: "var(--gap-md)" }}>
                      <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "center" }}>
                        <div style={{ fontSize: 36 }}>💚</div>
                        <div><p style={{ fontWeight: 800, color: "var(--sg)", marginBottom: 4, fontSize: "var(--fs-md)" }}>Fertile Window — Day {currentFWDay} of {currentFWTotal}</p><p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.55 }}>Have sex today and every other day until ovulation passes.</p></div>
                      </div>
                    </WCard>
                  );
                  if (dt === "period") return (
                    <WCard style={{ background: "var(--rdl)", border: "1.5px solid var(--rdm)33", marginBottom: "var(--gap-md)" }}>
                      <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "center" }}>
                        <div style={{ fontSize: 36 }}>🩸</div>
                        <div>
                          <p style={{ fontWeight: 800, color: "var(--rd)", marginBottom: 4, fontSize: "var(--fs-md)" }}>Period Active</p>
                          <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.55, marginBottom: 8 }}>Rest and nourish yourself. Take iron supplements with orange juice.</p>
                          {/* Start new cycle CTA inline on Calendar tab */}
                          <button onClick={resetCycle} style={{ background: "var(--rd)", color: "#fff", border: "none", borderRadius: 20, padding: "6px 16px", cursor: "pointer", fontSize: "var(--fs-xs)", fontWeight: 700 }}>
                            New Cycle Started Today →
                          </button>
                        </div>
                      </div>
                    </WCard>
                  );
                  return (
                    <WCard style={{ background: "var(--bll)", border: "1.5px solid var(--blm)33", marginBottom: "var(--gap-md)" }}>
                      <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "center" }}>
                        <div style={{ fontSize: 36 }}>✨</div>
                        <div><p style={{ fontWeight: 800, color: "var(--bl)", marginBottom: 4, fontSize: "var(--fs-md)" }}>Low Fertility Phase</p><p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.55 }}>Use this time to rest, nourish, and prepare your body. 🌿</p></div>
                      </div>
                    </WCard>
                  );
                })()}

                {/* Calendar grid */}
                <WCard>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-3)" }}>
                    <button onClick={() => setActiveMonth(d => { const n = new Date(d); n.setMonth(n.getMonth()-1); return n; })} style={{ background: "var(--warm)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "var(--sp-2) var(--sp-3)", cursor: "pointer", fontSize: "var(--fs-sm)", fontWeight: 700 }}>‹</button>
                    <p style={{ fontWeight: 800, fontSize: "var(--fs-md)", color: "var(--dp)" }}>{activeMonth.toLocaleDateString("en-NG", { month: "long", year: "numeric" })}</p>
                    <button onClick={() => setActiveMonth(d => { const n = new Date(d); n.setMonth(n.getMonth()+1); return n; })} style={{ background: "var(--warm)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "var(--sp-2) var(--sp-3)", cursor: "pointer", fontSize: "var(--fs-sm)", fontWeight: 700 }}>›</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 6 }}>
                    {["M","T","W","T","F","S","S"].map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: "var(--fs-2xs)", fontWeight: 800, color: "var(--mt)", padding: "var(--sp-1)" }}>{d}</div>)}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                    {Array.from({ length: totalDays }).map((_, i) => {
                      const dayDate = new Date(y, m, i+1);
                      const dtype   = getDayType(dayDate);
                      const [bg, tc, icon] = DAY_COLS[dtype] || DAY_COLS.other;
                      const isToday        = dayDate.toDateString() === today.toDateString();
                      const hasIntercourse = intercourseLog.some(log => new Date(log.date).toDateString() === dayDate.toDateString());
                      const hasLH          = lhLogs.some(log => new Date(log.date).toDateString() === dayDate.toDateString());
                      const hasSymptoms    = !!savedSymptoms[dayDate.toDateString()]?.length;
                      return (
                        <div key={i} style={{ aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: "var(--r)", background: bg, border: isToday ? `2px solid ${tc || "var(--dp)"}` : "2px solid transparent", position: "relative", cursor: "pointer" }}>
                          <span style={{ fontSize: "var(--fs-xs)", fontWeight: isToday ? 900 : 700, color: tc || "var(--md)" }}>{i+1}</span>
                          {icon && <span style={{ fontSize: 8, lineHeight: 1 }}>{icon}</span>}
                          {hasIntercourse && <div style={{ position: "absolute", bottom: 2, left: 2, fontSize: 8 }}>💕</div>}
                          {hasLH          && <div style={{ position: "absolute", bottom: 2, right: 2, fontSize: 8 }}>🥚</div>}
                          {hasSymptoms    && <div style={{ position: "absolute", top: 2, left: 2, width: 4, height: 4, borderRadius: "50%", background: "var(--sg)" }} />}
                          {isToday        && <div style={{ position: "absolute", top: 2, right: 2, width: 5, height: 5, borderRadius: "50%", background: "var(--t)" }} />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: "var(--sp-3)", paddingTop: "var(--sp-3)", borderTop: "1px solid var(--border)" }}>
                    {[["💕","Intimacy"],["🥚","LH Test"],["🟢","Symptoms"],["🔵","Today"]].map(([icon, label]) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "var(--fs-2xs)", color: "var(--mt)" }}>
                        <span>{icon}</span><span>{label}</span>
                      </div>
                    ))}
                  </div>
                </WCard>

                {/* Cycle pattern analysis */}
                {cycleHistory.length >= 3 && cyclePattern && (
                  <WCard style={{ background: "var(--gdl)" }}>
                    <p style={{ fontWeight: 800, color: "var(--gd)", marginBottom: "var(--sp-2)", fontSize: "var(--fs-sm)" }}>📊 Cycle Pattern Analysis</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-sm)", marginBottom: "var(--sp-2)" }}>
                      <span style={{ fontSize: 20 }}>{cyclePattern.icon}</span>
                      <span style={{ fontWeight: 700, color: cyclePattern.color, fontSize: "var(--fs-sm)" }}>{cyclePattern.label}</span>
                    </div>
                    <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)" }}>
                      Average: {avgCycleLength} days · Based on {cycleHistory.length} tracked cycles
                    </p>
                    <div style={{ display: "flex", gap: 4, marginTop: "var(--sp-2)" }}>
                      {cycleHistory.slice(-6).map((len, i) => (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                          <div style={{ width: "100%", height: `${((len - 21) / 14) * 40 + 10}px`, background: len === avgCycleLength ? "var(--sg)" : "var(--bl)", borderRadius: "3px 3px 0 0", minHeight: 8 }} />
                          <span style={{ fontSize: "var(--fs-2xs)", color: "var(--mt)" }}>{len}d</span>
                        </div>
                      ))}
                    </div>
                  </WCard>
                )}

                {/* Cycle notes */}
                <WCard>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-2)" }}>
                    <p style={{ fontWeight: 800, fontSize: "var(--fs-sm)", color: "var(--dp)" }}>📝 Cycle Notes</p>
                    <button onClick={() => setShowNoteInput(v => !v)} style={{ background: "var(--lv)", color: "#fff", border: "none", borderRadius: 20, padding: "4px 12px", cursor: "pointer", fontSize: "var(--fs-xs)" }}>+ Add Note</button>
                  </div>
                  {showNoteInput && (
                    <div style={{ marginBottom: "var(--sp-3)" }}>
                      <textarea value={currentNote} onChange={e => setCurrentNote(e.target.value)} placeholder="e.g. Started Metformin this cycle, high stress at work, holiday week..." style={{ width: "100%", padding: "var(--sp-3)", borderRadius: "var(--r)", border: "1px solid var(--border)", fontSize: "var(--fs-sm)", minHeight: 70, marginBottom: "var(--sp-2)", boxSizing: "border-box" }} />
                      <div style={{ display: "flex", gap: "var(--gap-sm)" }}>
                        <button onClick={saveCycleNote} style={{ flex: 1, padding: "var(--sp-2)", background: "var(--sg)", color: "#fff", border: "none", borderRadius: "var(--r)", cursor: "pointer", fontWeight: 700 }}>Save</button>
                        <button onClick={() => setShowNoteInput(false)} style={{ flex: 1, padding: "var(--sp-2)", background: "var(--warm)", border: "1px solid var(--border)", borderRadius: "var(--r)", cursor: "pointer" }}>Cancel</button>
                      </div>
                    </div>
                  )}
                  {Object.entries(cycleNotes).length > 0 ? (
                    Object.entries(cycleNotes).slice(-3).reverse().map(([key, note]) => (
                      <div key={key} style={{ padding: "var(--sp-2)", background: "var(--warm)", borderRadius: "var(--r)", marginBottom: "var(--gap-sm)", border: "1px solid var(--border)" }}>
                        <p style={{ fontSize: "var(--fs-2xs)", color: "var(--mt)", marginBottom: 4 }}>Cycle starting {key}</p>
                        <p style={{ fontSize: "var(--fs-xs)", color: "var(--dp)", lineHeight: 1.5 }}>{note}</p>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", fontStyle: "italic" }}>No notes yet. Add notes to track medications, stress, travel, or anything that might affect your cycle.</p>
                  )}
                </WCard>
              </>
            )}
          </div>
        </>
      )}


      {/* ════════════════════════ SETUP TAB ════════════════════════ */}
      {activeTab === "setup" && (
        <>
          <SectionTitle title="🌸 Cycle Setup" subtitle="Personalise your fertility tracking" />
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
            <WCard>
              {cycleHistory.length > 0 && (
                <div style={{ marginBottom: "var(--sp-3)", padding: "var(--sp-2) var(--sp-3)", background: "var(--lvl)", borderRadius: "var(--r)" }}>
                  <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>
                    Your rolling average: <strong>{avgCycleLength} days</strong> (based on {cycleHistory.length} cycle{cycleHistory.length !== 1 ? "s" : ""})
                  </p>
                </div>
              )}
              <div style={{ marginBottom: "var(--sp-4)" }}>
                <label style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--md)", display: "block", marginBottom: "var(--sp-2)" }}>First day of your last period</label>
                <input type="date" value={lastPeriodStart} onChange={e => setLastPeriodStart(e.target.value)} className="form-input" />
              </div>
              <div style={{ marginBottom: "var(--sp-4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--sp-2)" }}>
                  <label style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--md)" }}>Cycle Length</label>
                  <span style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--lv)" }}>{cycleLength} days</span>
                </div>
                <input type="range" min={21} max={35} value={cycleLength} onChange={e => setCycleLength(+e.target.value)} style={{ accentColor: "var(--lv)", width: "100%" }} />
                <p style={{ fontSize: "var(--fs-2xs)", color: "var(--mt)", marginTop: 4 }}>Average menstrual cycle is 28 days (normal range: 21–35)</p>
              </div>
              <div style={{ marginBottom: "var(--sp-5)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--sp-2)" }}>
                  <label style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--md)" }}>Period Duration</label>
                  <span style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--rd)" }}>{periodLength} days</span>
                </div>
                <input type="range" min={2} max={8} value={periodLength} onChange={e => setPeriodLength(+e.target.value)} style={{ accentColor: "var(--rd)", width: "100%" }} />
              </div>
              <button onClick={handleSave} style={{ width: "100%", background: "var(--dp)", color: "#fff", border: "none", borderRadius: "var(--r)", padding: "var(--sp-3)", fontWeight: 800, cursor: "pointer", marginBottom: "var(--sp-2)" }}>Save & Generate Calendar</button>
            </WCard>

            <WCard>
              <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-3)" }}>Calendar Legend</p>
              {[["#FDEEEC","#D0524A","Period days"],["#E3F5EA","#5A9E6E","Fertile window"],["#EDE9F8","#8B7EC8","Ovulation day"],["#E4EFF9","#3A78C4","Free days"]].map(([bg,tc,label],i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "var(--sp-2) 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: bg, border: `2px solid ${tc}`, flexShrink: 0 }} />
                  <span style={{ fontSize: "var(--fs-sm)", color: "var(--md)" }}>{label}</span>
                </div>
              ))}
            </WCard>
          </div>
        </>
      )}


      {/* ════════════════════════ SYMPTOMS TAB ════════════════════════ */}
      {activeTab === "symptoms" && (
        <>
          <SectionTitle title="🩺 Symptom Tracker" subtitle="Log your daily symptoms" />
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
            <WCard>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", marginBottom: "var(--sp-4)" }}>Select all that apply for today.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-sm)", marginBottom: "var(--sp-4)" }}>
                {SYMPTOMS.map(s => (
                  <button key={s} onClick={() => setSymptomSel(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])}
                    style={{ padding: "clamp(5px,1.2vw,7px) clamp(10px,2.5vw,14px)", borderRadius: 20, fontSize: "var(--fs-xs)", fontWeight: 700, background: symptomSel.includes(s) ? "var(--lv)" : "var(--warm)", color: symptomSel.includes(s) ? "#fff" : "var(--md)", border: `1.5px solid ${symptomSel.includes(s) ? "var(--lv)" : "var(--border)"}`, cursor: "pointer", minHeight: "var(--touch)" }}>
                    {s}
                  </button>
                ))}
              </div>
              <button onClick={() => {
                const key = new Date().toDateString();
                setSavedSymptoms(p => ({ ...p, [key]: symptomSel }));
                showNotif("✅ Symptoms logged for today", "var(--sg)");
                setSymptomSel([]);
              }} disabled={!symptomSel.length}
                style={{ width: "100%", background: symptomSel.length ? "var(--lv)" : "var(--border)", color: symptomSel.length ? "#fff" : "var(--mt)", border: "none", borderRadius: "var(--r)", padding: "var(--sp-3)", fontWeight: 800, cursor: symptomSel.length ? "pointer" : "not-allowed" }}>
                ✅ Log Symptoms ({symptomSel.length})
              </button>
            </WCard>

            {/* Symptom history */}
            {Object.keys(savedSymptoms).length > 0 && (
              <WCard style={{ background: "var(--lvl)" }}>
                <p style={{ fontWeight: 800, color: "var(--lv)", marginBottom: "var(--sp-2)", fontSize: "var(--fs-sm)" }}>📋 Recent Symptoms Log</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-sm)" }}>
                  {Object.entries(savedSymptoms).slice(-5).reverse().map(([date, symptoms]) => (
                    <div key={date} style={{ padding: "var(--sp-2)", background: "var(--card)", borderRadius: "var(--r)", border: "1px solid var(--border)" }}>
                      <p style={{ fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--dp)", marginBottom: "var(--sp-1)" }}>{date}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-sm)" }}>
                        {symptoms.length > 0 ? symptoms.map(symptom => (
                          <Tag key={symptom} label={symptom} bg="var(--warm)" tc="var(--mt)" />
                        )) : <span style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>No symptoms logged</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </WCard>
            )}

            {/* Symptom correlation panel */}
            {Object.keys(savedSymptoms).length >= 7 && (() => {
              // Find most frequently logged symptoms
              const counts = {};
              Object.values(savedSymptoms).forEach(list => list.forEach(s => { counts[s] = (counts[s] || 0) + 1; }));
              const top = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,3);
              return top.length ? (
                <WCard style={{ background: "var(--sgl)" }}>
                  <p style={{ fontWeight: 800, color: "var(--sg)", marginBottom: "var(--sp-2)", fontSize: "var(--fs-sm)" }}>🔍 Your Most Common Symptoms</p>
                  {top.map(([symptom, count]) => (
                    <div key={symptom} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--sp-1) 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ fontSize: "var(--fs-sm)", color: "var(--dp)" }}>{symptom}</span>
                      <Tag label={`${count} times`} bg="var(--sgm)22" tc="var(--sg)" />
                    </div>
                  ))}
                  <p style={{ fontSize: "var(--fs-2xs)", color: "var(--mt)", marginTop: "var(--sp-2)" }}>Share this pattern with your GP for a fuller picture.</p>
                </WCard>
              ) : null;
            })()}

            <WCard style={{ background: "var(--sgl)", border: "1px solid var(--sgm)44" }}>
              <p style={{ fontWeight: 800, color: "var(--sg)", marginBottom: "var(--sp-2)", fontSize: "var(--fs-sm)" }}>🥚 Cervical Mucus Guide</p>
              {[
                ["Dry / None","Low fertility","var(--rdl)","var(--rd)"],
                ["Sticky / Cloudy","Early cycle","var(--gdl)","var(--gd)"],
                ["Creamy / White","Building fertility","var(--bll)","var(--bl)"],
                ["Egg white / Stretchy","PEAK — Ovulation near!","var(--lvl)","var(--lv)"],
                ["Watery","Fertile — ovulation occurring","var(--sgl)","var(--sg)"],
              ].map(([type,desc,bg,tc],i) => (
                <div key={i} style={{ display: "flex", gap: "var(--gap-md)", alignItems: "center", padding: "var(--sp-2) 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
                  <Tag label={type} bg={bg} tc={tc} />
                  <span style={{ fontSize: "var(--fs-xs)", color: "var(--md)", flex: 1 }}>{desc}</span>
                </div>
              ))}
            </WCard>
          </div>
        </>
      )}


      {/* ════════════════════════ BBT TAB ════════════════════════ */}
      {activeTab === "bbt" && (
        <>
          <SectionTitle title="🌡️ Basal Body Temperature" subtitle="Track ovulation through temperature" />
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
            <WCard>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", lineHeight: 1.5, marginBottom: "var(--sp-4)" }}>
                Take your temperature every morning <strong>before getting out of bed</strong>. A rise of 0.2–0.5°C confirms ovulation has occurred.
              </p>
              <div style={{ display: "flex", gap: "var(--gap-sm)", marginBottom: "var(--sp-4)" }}>
                <input value={bbt} onChange={e => setBbt(e.target.value)} type="number" step="0.1" min={35} max={38} placeholder="e.g. 36.7°C" className="form-input" style={{ flex: 1 }} />
                <button onClick={() => {
                  if (!bbt) return;
                  const day = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()];
                  const date = new Date().toLocaleDateString();
                  setBbtLog(l => [...l, { day, date, temp: parseFloat(bbt) }]);
                  setBbt("");
                  showNotif("✅ BBT logged", "var(--sg)");
                }} style={{ padding: "0 clamp(12px,3vw,18px)", background: "var(--t)", color: "#fff", border: "none", borderRadius: "var(--r)", fontWeight: 800, cursor: "pointer", minHeight: "var(--touch)", flexShrink: 0 }}>Log</button>
              </div>
            </WCard>

            {bbtChartData.length === 0 ? (
              <WCard style={{ textAlign: "center", padding: "var(--sp-5)", background: "var(--warm)" }}>
                <div style={{ fontSize: 40, marginBottom: "var(--sp-3)" }}>🌡️</div>
                <p style={{ fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-2)" }}>No BBT data yet</p>
                <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)" }}>Log your temperature each morning to see your chart here. Aim for at least 5 days to spot a pattern.</p>
              </WCard>
            ) : (
              <WCard>
                <p style={{ fontWeight: 800, fontSize: "var(--fs-md)", color: "var(--dp)", marginBottom: "var(--sp-4)" }}>
                  📈 BBT Chart ({bbtChartData.length} days)
                </p>
                <div style={{ display: "flex", gap: "var(--gap-sm)", alignItems: "flex-end", height: "clamp(80px,20vw,110px)", marginBottom: "var(--gap-sm)" }}>
                  {bbtChartData.map((b, i) => {
                    const range = (bbtMax - bbtMin) || 0.5;
                    const h = ((b.temp - bbtMin) / range) * 70 + 15;
                    const isHigh = b.temp >= 36.7;
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: "var(--fs-2xs)", color: "var(--mt)", fontWeight: 700 }}>{b.temp}</span>
                        <div style={{ width: "100%", height: `${h}%`, borderRadius: "4px 4px 0 0", background: isHigh ? "var(--lv)" : "var(--sg)", transition: "height 0.4s" }} />
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: "var(--gap-sm)" }}>
                  {bbtChartData.map((b, i) => (
                    <div key={i} style={{ flex: 1, textAlign: "center", fontSize: "var(--fs-2xs)", color: "var(--mt)", fontWeight: 600 }}>{b.day}</div>
                  ))}
                </div>
                <div style={{ marginTop: "var(--sp-3)", padding: "var(--sp-3)", background: "var(--lvl)", borderRadius: "var(--r)" }}>
                  <p style={{ fontSize: "var(--fs-xs)", color: "var(--lv)", fontWeight: 700 }}>💜 Purple bars (≥36.7°C) indicate post-ovulation phase.</p>
                  {ovulationConfidence && <p style={{ fontSize: "var(--fs-xs)", color: ovulationConfidence.color, fontWeight: 700, marginTop: 4 }}>{ovulationConfidence.label}</p>}
                </div>
              </WCard>
            )}

            <WCard style={{ background: "var(--bll)" }}>
              <p style={{ fontWeight: 800, color: "var(--bl)", marginBottom: "var(--sp-2)", fontSize: "var(--fs-sm)" }}>💡 BBT Tips</p>
              {[
                "Take temperature at the same time every day",
                "Measure before getting out of bed or drinking anything",
                "Illness, alcohol, or poor sleep can affect readings — note these",
                "A rise of 0.2–0.5°C after ovulation stays elevated for 12–14 days",
              ].map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: "var(--gap-sm)", padding: "var(--sp-1) 0" }}>
                  <CheckCircle size={14} color="var(--bl)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)", lineHeight: 1.5 }}>{tip}</p>
                </div>
              ))}
            </WCard>
          </div>
        </>
      )}


      {/* ════════════════════════ LH TAB ════════════════════════ */}
      {activeTab === "lh" && (
        <>
          <SectionTitle title="🥚 LH Surge Tracking" subtitle="Predict ovulation with LH tests" />
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>

            {/* When to test nudge */}
            <WCard style={{ background: "var(--gdl)", border: "1.5px solid var(--gdm)44" }}>
              <p style={{ fontWeight: 800, color: "var(--gd)", marginBottom: "var(--sp-2)", fontSize: "var(--fs-sm)" }}>⏰ When to Test</p>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)", lineHeight: 1.6 }}>
                Test between <strong>10am and 8pm</strong> — never with first morning urine (FMU). LH peaks mid-afternoon. Test at the same time daily for accurate results.
              </p>
              {cycle && (
                <p style={{ fontSize: "var(--fs-xs)", color: "var(--gd)", marginTop: "var(--sp-2)", fontWeight: 700 }}>
                  Start testing from {fmt(new Date(cycle.fertStart.getTime() - 2 * 86400000))} (2 days before your fertile window).
                </p>
              )}
            </WCard>

            <WCard>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginBottom: "var(--sp-4)" }}>
                LH surge predicts ovulation in 24–36 hours. This is your peak fertility window.
              </p>
              <div style={{ display: "flex", gap: "var(--gap-sm)", marginBottom: "var(--sp-4)" }}>
                {[
                  { id: "negative", label: "Negative", color: "var(--mt)", bg: "var(--warm)" },
                  { id: "positive", label: "Positive", color: "var(--gd)", bg: "var(--gdl)" },
                  { id: "peak",     label: "⚡ PEAK",  color: "var(--lv)", bg: "var(--lvl)" }
                ].map(option => (
                  <button key={option.id} onClick={() => logLH(option.id)}
                    style={{ flex: 1, padding: "var(--sp-3)", borderRadius: "var(--r)", background: lhLevel === option.id ? option.color : option.bg, color: lhLevel === option.id ? "#fff" : "var(--dp)", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "var(--fs-sm)" }}>
                    {option.label}
                  </button>
                ))}
              </div>

              {lhLogs.length > 0 && (
                <div>
                  <p style={{ fontWeight: 800, marginBottom: "var(--sp-2)", fontSize: "var(--fs-sm)" }}>Recent LH Tests</p>
                  {lhLogs.slice(0, 7).map(log => (
                    <div key={log.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--sp-2) 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ fontSize: "var(--fs-sm)" }}>{log.dateStr}</span>
                      <Tag label={log.level.toUpperCase()}
                        bg={log.level === "peak" ? "var(--lvl)" : log.level === "positive" ? "var(--gdl)" : "var(--warm)"}
                        tc={log.level === "peak" ? "var(--lv)" : log.level === "positive" ? "var(--gd)" : "var(--mt)"} />
                    </div>
                  ))}
                </div>
              )}
            </WCard>

            <WCard style={{ background: "var(--gdl)" }}>
              <p style={{ fontWeight: 800, color: "var(--gd)", marginBottom: "var(--sp-2)" }}>📊 Understanding LH Results</p>
              <ul style={{ fontSize: "var(--fs-sm)", color: "var(--md)", margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                <li><strong>Negative</strong> — Not in fertile window yet</li>
                <li><strong>Positive</strong> — LH is rising, ovulation approaching</li>
                <li><strong>PEAK</strong> — Ovulation in 24–36 hours! Best time to conceive</li>
              </ul>
            </WCard>
          </div>
        </>
      )}


      {/* ════════════════════════ INTERCOURSE TAB ════════════════════════ */}
      {activeTab === "intercourse" && (
        <>
          <SectionTitle title="💕 Intimacy Log" subtitle="Private personal log" />
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
            <WCard>
              {!showIntercourseNote ? (
                <button onClick={() => setShowIntercourseNote(true)}
                  style={{ width: "100%", padding: "var(--sp-4)", background: "var(--lv)", color: "#fff", border: "none", borderRadius: "var(--r)", fontSize: "var(--fs-md)", fontWeight: 800, cursor: "pointer", marginBottom: "var(--sp-4)" }}>
                  + Log Today
                </button>
              ) : (
                <div style={{ marginBottom: "var(--sp-4)" }}>
                  {/* Fertile window context while logging */}
                  {isInFertileWindow && (
                    <div style={{ padding: "var(--sp-2)", background: "var(--sgl)", borderRadius: "var(--r)", marginBottom: "var(--sp-3)", border: "1px solid var(--sgm)44" }}>
                      <p style={{ fontSize: "var(--fs-xs)", color: "var(--sg)", fontWeight: 700 }}>
                        💞 You're on Day {currentFWDay} of {currentFWTotal} of your fertile window
                      </p>
                    </div>
                  )}
                  <textarea value={intercourseNote} onChange={e => setIntercourseNote(e.target.value)}
                    placeholder="Optional notes (e.g. 'Ovulation day', 'Used OPK', 'Spontaneous')..."
                    style={{ width: "100%", padding: "var(--sp-3)", borderRadius: "var(--r)", border: "1px solid var(--border)", fontSize: "var(--fs-sm)", minHeight: 80, marginBottom: "var(--sp-3)", boxSizing: "border-box" }} />
                  <div style={{ display: "flex", gap: "var(--gap-sm)" }}>
                    <button onClick={logIntercourse} style={{ flex: 1, padding: "var(--sp-3)", background: "var(--sg)", color: "#fff", border: "none", borderRadius: "var(--r)", cursor: "pointer", fontWeight: 700 }}>Save</button>
                    <button onClick={() => setShowIntercourseNote(false)} style={{ flex: 1, padding: "var(--sp-3)", background: "var(--warm)", border: "1px solid var(--border)", borderRadius: "var(--r)", cursor: "pointer" }}>Cancel</button>
                  </div>
                </div>
              )}

              {intercourseLog.length > 0 && (
                <div>
                  <p style={{ fontWeight: 800, marginBottom: "var(--sp-2)", fontSize: "var(--fs-sm)" }}>Recent Activity</p>
                  {intercourseLog.slice(0, 7).map(log => (
                    <div key={log.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--sp-2) 0", borderBottom: "1px solid var(--border)", gap: "var(--gap-sm)" }}>
                      <span style={{ fontSize: "var(--fs-sm)" }}>{log.dateStr}</span>
                      <div style={{ display: "flex", gap: "var(--gap-sm)", alignItems: "center" }}>
                        {log.fertileWindow && (
                          <Tag
                            label={log.fertileDay ? `Fertile Day ${log.fertileDay}/${log.fertileTotal}` : "Fertile Window"}
                            bg="var(--sgl)" tc="var(--sg)"
                          />
                        )}
                        {log.note && <span style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>{log.note}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </WCard>

            <WCard style={{ background: "var(--lvl)" }}>
              <p style={{ fontWeight: 800, color: "var(--lv)", marginBottom: "var(--sp-2)" }}>💡 Intimacy Tips for TTC</p>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>
                Having sex every other day during your fertile window (5 days before ovulation through ovulation day) gives you the best chance of conception. Daily sex is not more effective and can add stress.
              </p>
            </WCard>
          </div>
        </>
      )}


      {/* ════════════════════════ INSIGHTS TAB ════════════════════════ */}
      {activeTab === "insights" && (
        <>
          <SectionTitle title="💡 Fertility Insights" subtitle="Evidence-based guidance for TTC" />
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>

            {/* Medical disclaimer — required for ORCHA/DCB0129 */}
            <WCard style={{ background: "var(--gdl)", border: "1.5px solid var(--gdm)44" }}>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)", lineHeight: 1.5 }}>
                ⚕️ <strong>Medical disclaimer:</strong> {MEDICAL_DISCLAIMER}
              </p>
            </WCard>

            <WCard style={{ background: "linear-gradient(135deg,var(--lvl),#F8F6FE)", border: "1.5px solid var(--lvm)44" }}>
              {[
                { icon:"🥚", title:"Best time for sex", body:"Have sex every other day during your fertile window (5 days before + 1 day after ovulation). Daily sex is not more effective." },
                { icon:"🍃", title:"Boost fertility with food", body:"Eat: Ugu leaf, Tiger Nuts (Aya), Garden eggs, Avocado, Fish, Eggs. These boost progesterone, iron, and Omega-3." },
                { icon:"🚫", title:"Avoid in your cycle", body:"Avoid: Agbo (herbal mixtures), excessive zobo, strong pain killers around ovulation (NSAIDs can suppress ovulation)." },
                { icon:"🌡️", title:"After sex", body:"Lie down for 15–20 minutes after sex. Sperm reach the fallopian tube within 90 seconds, so extended lying is not necessary." },
                { icon:"💊", title:"Supplements", body:"Folic acid 400mcg daily (recommended by NHS before and during early pregnancy). Vitamin D3 is also commonly recommended. Speak to your GP before starting any supplement." },
                { icon:"😴", title:"Stress and TTC", body:"Chronic stress raises cortisol, suppressing LH (the hormone that triggers ovulation). Prioritise 7–9 hours sleep. 4-7-8 breathing can help manage acute stress." },
                { icon:"🩺", title:"When to see a doctor", body:"If no pregnancy after 12 months of trying (6 months if over 35). Your GP can arrange hormonal blood panel, HSG scan, and semen analysis." },
              ].map((tip, i) => (
                <WCard key={i} style={{ marginBottom: "var(--gap-sm)", padding: "var(--card-p)" }}>
                  <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "flex-start" }}>
                    <div style={{ width: "var(--icon-sm)", height: "var(--icon-sm)", flexShrink: 0, borderRadius: "var(--r)", background: "var(--lvl)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-xl)" }}>{tip.icon}</div>
                    <div>
                      <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--dp)", marginBottom: 4 }}>{tip.title}</p>
                      <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)", lineHeight: 1.6 }}>{tip.body}</p>
                    </div>
                  </div>
                </WCard>
              ))}
            </WCard>

            <WCard style={{ background: "var(--sgl)", border: "1.5px solid var(--sgm)44" }}>
              <p style={{ fontWeight: 800, color: "var(--sg)", marginBottom: "var(--sp-3)", fontSize: "var(--fs-md)" }}>🇳🇬 Local Fertility Myths — Debunked</p>
              {[
                ["Eating unripe pawpaw boosts fertility","FALSE","Contains papain — disrupts implantation. Avoid during conception attempts."],
                ["Drinking Agbo increases chances","UNKNOWN","Most Agbo mixtures have unknown compositions and interactions. Avoid."],
                ["You can't get pregnant while breastfeeding","FALSE","You can — ovulation can return before your first postpartum period."],
                ["Legs up after sex for 30 minutes is necessary","EXAGGERATED","15 minutes resting is sufficient. Sperm reach the fallopian tube within 90 seconds."],
              ].map(([myth,status,fact],i) => (
                <div key={i} style={{ padding: "var(--sp-3) 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ display: "flex", gap: "var(--gap-sm)", alignItems: "center", marginBottom: "var(--sp-1)" }}>
                    <Tag label={status} bg={status==="FALSE" ? "var(--rdl)" : "var(--gdl)"} tc={status==="FALSE" ? "var(--rd)" : "var(--gd)"} />
                    <p style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: "var(--dp)" }}>{myth}</p>
                  </div>
                  <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)", lineHeight: 1.55 }}>{fact}</p>
                </div>
              ))}
            </WCard>
          </div>
        </>
      )}

    </div>
  );
}