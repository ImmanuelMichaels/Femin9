import { useState, useEffect } from 'react';
import { useApp } from '../../context/useApp';
import GlowCard from '../../components/GlowCard';
import './ivfjourney.css';

/* ─────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────── */

const TIMELINE_STAGES = [
  { id: 1, label: "Consultation",    date: "Mar 1",     done: true,  active: false },
  { id: 2, label: "Stimulation",     date: "Mar 8",     done: true,  active: false },
  { id: 3, label: "Egg Retrieval",   date: "Mar 18",    done: true,  active: false },
  { id: 4, label: "Fertilisation",   date: "Mar 20",    done: true,  active: false },
  { id: 5, label: "Embryo Dev.",     date: "Mar 20–25", done: false, active: true  },
  { id: 6, label: "Transfer",        date: "Mar 26",    done: false, active: false },
  { id: 7, label: "2-Week Wait",     date: "Mar 26+",   done: false, active: false },
  { id: 8, label: "Pregnancy Test",  date: "Apr 9",     done: false, active: false },
];

const INITIAL_MEDICATIONS = [
  {
    id: 1, name: "Gonal-F",     type: "Injection", dose: "150 IU",
    time: "07:00 AM", status: "taken",
    notes: "Subcutaneous — left abdomen. Refrigerate after opening.",
    color: "#F08C2E", bg: "#FFF3E8",
  },
  {
    id: 2, name: "Cetrotide",   type: "Injection", dose: "0.25 mg",
    time: "07:30 AM", status: "taken",
    notes: "Subcutaneous — right abdomen. Prevents premature ovulation.",
    color: "#9B8FD8", bg: "#F0EEFF",
  },
  {
    id: 3, name: "Progynova",   type: "Oral",      dose: "2 mg",
    time: "08:00 AM", status: "taken",
    notes: "Oestrogen support — take with food. Do not crush.",
    color: "#E87070", bg: "#FFF0F0",
  },
  {
    id: 4, name: "Progesterone", type: "Vaginal",  dose: "400 mg",
    time: "09:00 PM", status: "pending",
    notes: "Cyclogest pessary — insert lying down. Stay lying for 20 min.",
    color: "#2E9E9B", bg: "#E8F7F7",
  },
  {
    id: 5, name: "Folic Acid",  type: "Oral",      dose: "5 mg",
    time: "09:00 PM", status: "pending",
    notes: "Neural tube support — take with evening meal.",
    color: "#7DCB98", bg: "#E8F7EE",
  },
];

const SCANS = [
  {
    id: 1, date: "Mar 10", label: "Baseline Scan",
    follicles: 8,  lining: "5.2 mm", e2: "42 pmol/L",
    status: "completed",
    note: "Good baseline. Stimulation protocol confirmed — starting Gonal-F tomorrow.",
  },
  {
    id: 2, date: "Mar 14", label: "Stimulation Day 6",
    follicles: 11, lining: "7.8 mm", e2: "1,240 pmol/L",
    status: "completed",
    note: "Follicles responding beautifully. Continue same dose.",
  },
  {
    id: 3, date: "Mar 17", label: "Trigger Day Scan",
    follicles: 14, lining: "9.6 mm", e2: "4,800 pmol/L",
    status: "completed",
    note: "Trigger injection given at 22:30. Egg retrieval booked 36 hours later.",
  },
  {
    id: 4, date: "Mar 26", label: "Transfer Day Scan",
    follicles: null, lining: "10.2 mm", e2: null,
    status: "upcoming",
    note: "Lining check before embryo transfer. Please arrive fasted.",
  },
];

const EMBRYOS = [
  {
    id: 1, label: "Embryo A", grade: "AA", day: 5, stage: "Blastocyst",
    status: "frozen",
    quality: "Excellent", qualityColor: "#2E9E67", qualityBg: "#E8F7EE",
    notes: "Top-quality blastocyst. Priority transfer candidate on future cycles.",
  },
  {
    id: 2, label: "Embryo B", grade: "AB", day: 5, stage: "Blastocyst",
    status: "transfer-ready",
    quality: "Good", qualityColor: "#F08C2E", qualityBg: "#FFF3E8",
    notes: "Selected for fresh transfer. Inner cell mass: A · Trophectoderm: B.",
  },
  {
    id: 3, label: "Embryo C", grade: "BB", day: 5, stage: "Blastocyst",
    status: "frozen",
    quality: "Good", qualityColor: "#F08C2E", qualityBg: "#FFF3E8",
    notes: "In cryostorage. Backup embryo for future frozen transfer cycle.",
  },
  {
    id: 4, label: "Embryo D", grade: "BC", day: 6, stage: "Expanding",
    status: "monitoring",
    quality: "Fair", qualityColor: "#9B8FD8", qualityBg: "#F0EEFF",
    notes: "Still developing. Lab will assess tomorrow for freeze or discard.",
  },
];

const INSIGHTS = [
  {
    id: 1, icon: "💊", title: "Medication Consistency",
    value: "96%", tag: "On Track",
    detail: "You've taken 23 of 24 doses on time this cycle. Your dedication is remarkable.",
    g1: "#F08C2E", g2: "#FFB347",
  },
  {
    id: 2, icon: "🔬", title: "Embryo Quality",
    value: "AA", tag: "Excellent",
    detail: "Your top embryo is graded AA — the highest possible blastocyst classification.",
    g1: "#7DCB98", g2: "#56AB2F",
  },
  {
    id: 3, icon: "✨", title: "Follicle Response",
    value: "14", tag: "Strong",
    detail: "14 follicles retrieved — well above the typical range of 8–10 for your protocol.",
    g1: "#9B8FD8", g2: "#C9B8F5",
  },
  {
    id: 4, icon: "💗", title: "Wellbeing Score",
    value: "7.4", tag: "Good",
    detail: "Based on your mood logs and symptom entries this week. Keep going — you're doing so well.",
    g1: "#E87070", g2: "#F5A0A0",
  },
];

const AFFIRMATIONS = [
  "Your body is doing something extraordinary.",
  "Every injection is a profound act of love.",
  "You are so much stronger than you know.",
  "Hope is the bravest thing you carry.",
  "Rest is not giving up — rest is part of the work.",
  "Whatever happens, you are already a warrior.",
];

const MOODS = [
  { label: "Hopeful",   emoji: "🌸" },
  { label: "Anxious",   emoji: "😰" },
  { label: "Calm",      emoji: "🕊️" },
  { label: "Tired",     emoji: "😴" },
  { label: "Strong",    emoji: "💪" },
  { label: "Emotional", emoji: "💧" },
];

const CONTACTS = [
  {
    id: 1, name: "Fertility Clinic", subtitle: "Care Fertility London",
    phone: "020 7034 0100", icon: "🏥",
    color: "#F08C2E", bg: "#FFF3E8", cta: "Call Clinic",
  },
  {
    id: 2, name: "Nurse Hotline", subtitle: "24-hour IVF support line",
    phone: "0800 123 4567", icon: "👩‍⚕️",
    color: "#9B8FD8", bg: "#F0EEFF", cta: "Call Nurse",
  },
  {
    id: 3, name: "Dr. Sarah Patel", subtitle: "Reproductive Endocrinologist",
    phone: "020 7034 0102", icon: "🩺",
    color: "#2E9E9B", bg: "#E8F7F7", cta: "Contact Doctor",
  },
];

/* ─────────────────────────────────────────────────────────
   SVG ICON COMPONENTS
───────────────────────────────────────────────────────── */

function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#C96A10" : "#B0A4BC"} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function JourneyIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#C96A10" : "#B0A4BC"} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function MedIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#C96A10" : "#B0A4BC"} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
      <line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function InsightIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#C96A10" : "#B0A4BC"} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ProfileIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#C96A10" : "#B0A4BC"} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
      stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#A99DB5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   SHARED HELPERS
───────────────────────────────────────────────────────── */

function SectionHeader({ label, title, subtitle, accent }) {
  return (
    <div className="section-header">
      <span className="section-label" style={{ color: accent }}>{label}</span>
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   HERO SECTION
───────────────────────────────────────────────────────── */

function HeroSection({ userName, stage, progress }) {
  return (
    <section className="hero">
      <div className="hero-blob blob-a" />
      <div className="hero-blob blob-b" />

      <div className="hero-top-bar">
        <div className="hero-identity">
          <div className="hero-avatar">{userName?.charAt(0) || 'S'}</div>
          <div>
            <p className="hero-hello">Good morning, {userName || 'Sophie'} 🌸</p>
            <p className="hero-meta">{new Date().toLocaleDateString('en-NG', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <button className="hero-bell" aria-label="Notifications">
          <BellIcon />
          <span className="bell-dot" />
        </button>
      </div>

      <div className="hero-main-card">
        <div className="hero-card-row">
          <div className="hero-card-text">
            <p className="hero-stage-label">Current Stage</p>
            <h1 className="hero-stage-name">{stage}</h1>
            <p className="hero-stage-sub">Day {progress} of cycle</p>
          </div>
          <div className="hero-ring-wrap">
            <svg width="76" height="76" viewBox="0 0 76 76">
              <circle cx="38" cy="38" r="32" fill="none" stroke="#FFE4D0" strokeWidth="6" />
              <circle cx="38" cy="38" r="32" fill="none" stroke="#F08C2E" strokeWidth="6"
                strokeDasharray="201.06" strokeDashoffset={201.06 * (1 - progress / 100)}
                strokeLinecap="round" transform="rotate(-90 38 38)" />
              <text x="38" y="43" textAnchor="middle" fill="#C96A10"
                fontSize="15" fontWeight="700" fontFamily="DM Sans, sans-serif">{progress}%</text>
            </svg>
          </div>
        </div>
        <p className="hero-encourage">
          Your embryos are being carefully nurtured in the lab. Rest, hydrate, and be gentle with yourself today. 💛
        </p>
      </div>

      <div className="hero-appt-chip">
        <span className="appt-chip-icon">📅</span>
        <div className="appt-chip-body">
          <p className="appt-chip-label">Next Appointment</p>
          <p className="appt-chip-title">Embryo Transfer — Tue 26 Mar · 09:30 AM</p>
        </div>
        <button className="appt-chip-btn">View</button>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   IVF TIMELINE
───────────────────────────────────────────────────────── */

function IVFTimeline({ stages }) {
  return (
    <section className="section">
      <SectionHeader
        label="YOUR JOURNEY"
        title="IVF Progress"
        subtitle="You're halfway there — every step is a victory."
        accent="#F08C2E"
      />
      <div className="tl-scroll-area">
        <div className="tl-track">
          {stages.map((stage, i) => (
            <div key={stage.id}
              className={`tl-step ${stage.done ? "tl-done" : ""} ${stage.active ? "tl-active" : ""}`}>
              <div className="tl-connector-wrap">
                {i > 0 && (
                  <div className={`tl-line ${stages[i - 1].done ? "tl-line-done" : ""}`} />
                )}
                <div className="tl-dot">
                  {stage.done && <CheckIcon />}
                  {stage.active && <div className="tl-pulse" />}
                </div>
                {i < stages.length - 1 && (
                  <div className={`tl-line ${stage.done ? "tl-line-done" : ""}`} />
                )}
              </div>
              <p className="tl-label">{stage.label}</p>
              <p className="tl-date">{stage.date}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   MEDICATION SCHEDULE
───────────────────────────────────────────────────────── */

function MedicationSection({ medications, onMedicationUpdate }) {
  const [expanded, setExpanded] = useState(null);
  const taken = medications.filter(m => m.status === "taken").length;
  const pct = Math.round((taken / medications.length) * 100);

  const handleMarkTaken = (id) => {
    onMedicationUpdate(medications.map(med =>
      med.id === id ? { ...med, status: "taken" } : med
    ));
  };

  return (
    <section className="section">
      <SectionHeader
        label="TODAY'S PLAN"
        title="Medication Schedule"
        accent="#9B8FD8"
      />

      <div className="med-bar-wrap">
        <div className="med-bar-info">
          <span className="med-bar-text">{taken} of {medications.length} taken today</span>
          <span className="med-bar-pct">{pct}%</span>
        </div>
        <div className="med-bar-track">
          <div className="med-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="med-list">
        {medications.map(med => (
          <div key={med.id}
            className={`med-card med-${med.status}`}
            style={{ "--mc": med.color, "--mbg": med.bg }}>
            <button
              className="med-row"
              onClick={() => setExpanded(expanded === med.id ? null : med.id)}>
              <div className="med-pip" />
              <div className="med-content">
                <div className="med-top">
                  <span className="med-name">{med.name}</span>
                  <span className={`med-badge ${med.status}`}>
                    {med.status === "taken" ? "✓ Taken" : "Pending"}
                  </span>
                </div>
                <p className="med-sub">{med.dose} · {med.time} · {med.type}</p>
              </div>
              <span className={`med-chev ${expanded === med.id ? "open" : ""}`}>
                <ChevronDown />
              </span>
            </button>
            {expanded === med.id && (
              <div className="med-expand">
                <p className="med-note-text">{med.notes}</p>
                {med.status === "pending" && (
                  <button 
                    className="med-take-btn"
                    onClick={() => handleMarkTaken(med.id)}>
                    Mark as Taken
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   FERTILITY SCANS
───────────────────────────────────────────────────────── */

function ScanSection({ scans }) {
  return (
    <section className="section">
      <SectionHeader
        label="MONITORING"
        title="Fertility Scans"
        subtitle="Your follicle response has been exceptional."
        accent="#2E9E9B"
      />
      <div className="scan-list">
        {scans.map(scan => (
          <div key={scan.id} className={`scan-card scan-${scan.status}`}>
            <div className="scan-top">
              <div className="scan-left">
                <span className={`scan-badge scan-badge-${scan.status}`}>
                  {scan.status === "completed" ? "✓ Complete" : "Upcoming"}
                </span>
                <p className="scan-name">{scan.label}</p>
                <p className="scan-date">{scan.date}</p>
              </div>
              {scan.follicles && (
                <div className="scan-follicle">
                  <span className="follicle-count">{scan.follicles}</span>
                  <span className="follicle-word">follicles</span>
                </div>
              )}
            </div>
            <div className="scan-metrics">
              <div className="scan-metric">
                <span className="sm-label">Lining</span>
                <span className="sm-value">{scan.lining}</span>
              </div>
              {scan.e2 && (
                <div className="scan-metric">
                  <span className="sm-label">Estradiol</span>
                  <span className="sm-value">{scan.e2}</span>
                </div>
              )}
            </div>
            <p className="scan-note">{scan.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   EMBRYO DEVELOPMENT
───────────────────────────────────────────────────────── */

function EmbryoSection({ embryos }) {
  const [selected, setSelected] = useState(null);
  const transferReady = embryos.filter(e => e.status === "transfer-ready").length;
  const frozen = embryos.filter(e => e.status === "frozen").length;

  return (
    <section className="section">
      <SectionHeader
        label="LAB UPDATE"
        title="Embryo Development"
        subtitle={`${embryos.length} embryos tracked · ${frozen} frozen · ${transferReady} transfer-ready`}
        accent="#E87070"
      />
      <div className="embryo-grid">
        {embryos.map(em => (
          <div
            key={em.id}
            className={`embryo-card embryo-${em.status} ${selected === em.id ? "embryo-open" : ""}`}
            onClick={() => setSelected(selected === em.id ? null : em.id)}>
            <div className="embryo-visual">
              <div className={`embryo-orb orb-${em.grade[0].toLowerCase()}`}>
                <span className="embryo-grade">{em.grade}</span>
              </div>
              {em.status === "transfer-ready" && (
                <span className="embryo-star-badge">⭐ Selected</span>
              )}
            </div>
            <div className="embryo-info">
              <p className="embryo-name">{em.label}</p>
              <p className="embryo-stage-txt">Day {em.day} · {em.stage}</p>
              <div className="embryo-tag-row">
                <span className={`embryo-status-tag est-${em.status}`}>
                  {em.status === "frozen" ? "❄️ Frozen"
                   : em.status === "transfer-ready" ? "✅ Transfer Ready"
                   : "🔬 Monitoring"}
                </span>
                <span className="embryo-quality-tag"
                  style={{ color: em.qualityColor, background: em.qualityBg }}>
                  {em.quality}
                </span>
              </div>
              {selected === em.id && (
                <p className="embryo-detail-note">{em.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   TWO-WEEK WAIT
───────────────────────────────────────────────────────── */

const SYMPTOMS = ["Bloating", "Cramping", "Spotting", "Nausea", "Breast tenderness",
                  "Fatigue", "Headache", "Mood changes", "Increased urination"];

function SymptomLog() {
  const [active, setActive] = useState([]);
  const toggle = s => setActive(a => a.includes(s) ? a.filter(x => x !== s) : [...a, s]);
  return (
    <div className="symptom-wrap">
      {SYMPTOMS.map(s => (
        <button key={s}
          className={`symptom-chip ${active.includes(s) ? "symptom-on" : ""}`}
          onClick={() => toggle(s)}>{s}</button>
      ))}
    </div>
  );
}

function TwoWeekWait() {
  const [mood, setMood] = useState(null);
  const [hydration, setHydration] = useState(() => {
    const saved = localStorage.getItem('ivf_hydration');
    return saved ? parseInt(saved) : 5;
  });
  const [affirmIdx, setAffirmIdx] = useState(() => {
    const saved = localStorage.getItem('ivf_affirmIdx');
    return saved ? parseInt(saved) : 0;
  });
  const [journal, setJournal] = useState(() => {
    return localStorage.getItem('ivf_journal') || '';
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem('ivf_hydration', hydration.toString());
  }, [hydration]);

  useEffect(() => {
    localStorage.setItem('ivf_affirmIdx', affirmIdx.toString());
  }, [affirmIdx]);

  const handleSave = () => {
    if (!journal.trim()) return;
    localStorage.setItem('ivf_journal', journal);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <section className="section tww-section">
      <SectionHeader
        label="2-WEEK WAIT"
        title="Wellbeing Support"
        subtitle="The two-week wait is hard. We are here with you, every single day."
        accent="#9B8FD8"
      />

      <div className="affirmation-card">
        <div className="affirmation-bloom">🌸</div>
        <p className="affirmation-text">"{AFFIRMATIONS[affirmIdx]}"</p>
        <button
          className="affirmation-next-btn"
          onClick={() => setAffirmIdx((affirmIdx + 1) % AFFIRMATIONS.length)}>
          Next affirmation →
        </button>
      </div>

      <div className="tww-card">
        <h3 className="tww-card-title">How are you feeling right now?</h3>
        <div className="mood-grid">
          {MOODS.map(m => (
            <button
              key={m.label}
              className={`mood-btn ${mood === m.label ? "mood-selected" : ""}`}
              onClick={() => setMood(m.label)}>
              <span className="mood-emoji">{m.emoji}</span>
              <span className="mood-word">{m.label}</span>
            </button>
          ))}
        </div>
        {mood && (
          <p className="mood-ack">
            Feeling <strong>{mood}</strong> is completely valid. Thank you for checking in. 💛
          </p>
        )}
      </div>

      <div className="tww-card">
        <div className="tww-card-header">
          <h3 className="tww-card-title">Hydration Tracker</h3>
          <span className="tww-card-count">{hydration}/8</span>
        </div>
        <p className="tww-card-sub">Aim for 8 glasses of water today to support implantation.</p>
        <div className="hydration-row">
          {Array.from({ length: 8 }).map((_, i) => (
            <button
              key={i}
              className={`hydration-cup ${i < hydration ? "cup-filled" : ""}`}
              onClick={() => setHydration(i + 1)}
              aria-label={`Glass ${i + 1}`}>
              <svg width="20" height="26" viewBox="0 0 20 26" fill="none">
                <path d="M2 4h16l-2 18H4L2 4z" stroke="currentColor" strokeWidth="1.6"
                  strokeLinejoin="round"
                  fill={i < hydration ? "currentColor" : "none"} fillOpacity="0.25" />
                <line x1="2" y1="8" x2="18" y2="8" stroke="currentColor" strokeWidth="1" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div className="tww-card">
        <h3 className="tww-card-title">Symptom Log</h3>
        <p className="tww-card-sub">Tap any you're experiencing today.</p>
        <SymptomLog />
      </div>

      <div className="tww-card journal-card">
        <div className="journal-icon-wrap">📓</div>
        <h3 className="tww-card-title">Daily Journal</h3>
        <p className="tww-card-sub">Write freely — no one else sees this.</p>
        <textarea
          className="journal-input"
          placeholder="Today I'm feeling..."
          value={journal}
          onChange={e => setJournal(e.target.value)}
          rows={4}
        />
        <button className={`journal-save ${saved ? "saved" : ""}`} onClick={handleSave}>
          {saved ? "✓ Saved" : "Save Entry"}
        </button>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   AI INSIGHTS
───────────────────────────────────────────────────────── */

function AIInsightsSection() {
  return (
    <section className="section">
      <SectionHeader
        label="AI INSIGHTS"
        title="Fertility Intelligence"
        subtitle="Personalised analysis based on your cycle and lab data."
        accent="#F08C2E"
      />
      <div className="insights-grid">
        {INSIGHTS.map(ins => (
          <div key={ins.id} className="insight-card"
            style={{ background: `linear-gradient(135deg, ${ins.g1} 0%, ${ins.g2} 100%)` }}>
            <div className="insight-icon-wrap">{ins.icon}</div>
            <span className="insight-tag-badge">{ins.tag}</span>
            <p className="insight-title">{ins.title}</p>
            <p className="insight-big-value">{ins.value}</p>
            <p className="insight-detail">{ins.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   PARTNER SUPPORT
───────────────────────────────────────────────────────── */

function PartnerSection() {
  return (
    <section className="section">
      <SectionHeader
        label="TOGETHER"
        title="Partner Support"
        subtitle="This journey is shared — James is right beside you."
        accent="#E87070"
      />
      <div className="partner-card">
        <div className="partner-profile">
          <div className="partner-avatar">J</div>
          <div>
            <p className="partner-name">James</p>
            <p className="partner-role">Partner · Connected</p>
          </div>
        </div>
        <div className="partner-stats-row">
          {[
            { val: "3",  label: "Shared Appts"  },
            { val: "12", label: "Reminders Sent" },
            { val: "7d", label: "Support Streak" },
          ].map(s => (
            <div key={s.label} className="partner-stat">
              <span className="pstat-val">{s.val}</span>
              <span className="pstat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="partner-tips-block">
        <p className="partner-tips-heading">Tips for James today</p>
        {[
          { icon: "💬", text: "Ask Sophie how she's feeling — and really listen. You don't need to fix anything." },
          { icon: "🍵", text: "Prepare a warm, nutritious meal tonight to support her body and spirit." },
          { icon: "📅", text: "Reminder: Embryo transfer on Tuesday at 09:30 AM. Plan to go together." },
        ].map((tip, i) => (
          <div key={i} className="partner-tip-row">
            <span className="partner-tip-icon">{tip.icon}</span>
            <p className="partner-tip-text">{tip.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   CONTACT / CARE TEAM
───────────────────────────────────────────────────────── */

function ContactSection() {
  return (
    <section className="section">
      <SectionHeader
        label="CARE TEAM"
        title="Your Support Network"
        subtitle="Reach out any time — no question is too small."
        accent="#2E9E9B"
      />
      <div className="contact-list">
        {CONTACTS.map(c => (
          <div key={c.id} className="contact-card"
            style={{ "--cc": c.color, "--cbg": c.bg }}>
            <div className="contact-icon-bubble">{c.icon}</div>
            <div className="contact-body">
              <p className="contact-name">{c.name}</p>
              <p className="contact-sub">{c.subtitle}</p>
              <p className="contact-phone">{c.phone}</p>
            </div>
            <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="contact-call-btn">
              {c.cta}
            </a>
          </div>
        ))}
      </div>

      <div className="doctor-note-card">
        <div className="doctor-note-header">
          <span className="doctor-note-icon">📋</span>
          <h3 className="doctor-note-title">Dr. Patel's Note</h3>
          <span className="doctor-note-date">21 March</span>
        </div>
        <p className="doctor-note-body">
          "Sophie — your follicle response was remarkable and the lab team is extremely pleased
          with your blastocyst development. Rest well, stay hydrated, and we will see you Tuesday          for your transfer. This looks very promising."
        </p>
        <p className="doctor-note-sig">— Dr. Sarah Patel, Reproductive Endocrinologist</p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   BOTTOM NAVIGATION
───────────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: HomeIcon },
  { id: "journey", label: "Journey", icon: JourneyIcon },
  { id: "meds", label: "Medications", icon: MedIcon },
  { id: "insights", label: "Insights", icon: InsightIcon },
  { id: "profile", label: "Profile", icon: ProfileIcon },
];

function BottomNav({ active, setActive }) {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {NAV_ITEMS.map(item => {
        const isActive = active === item.id;
        const IconCmp = item.icon;
        return (
          <button
            key={item.id}
            className={`nav-btn ${isActive ? "nav-btn-active" : ""}`}
            onClick={() => setActive(item.id)}
            aria-current={isActive ? "page" : undefined}>
            <IconCmp active={isActive} />
            <span className="nav-label">{item.label}</span>
            {isActive && <span className="nav-pip" />}
          </button>
        );
      })}
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────
   ROOT COMPONENT
───────────────────────────────────────────────────────── */

export default function IVFJourney() {
  const { userName } = useApp();
  const [activeTab, setActiveTab] = useState("home");
  const [stages] = useState(() => {
    const saved = localStorage.getItem('ivf_stages');
    return saved ? JSON.parse(saved) : TIMELINE_STAGES;
  });
  const [medications, setMedications] = useState(() => {
    const saved = localStorage.getItem('ivf_medications');
    return saved ? JSON.parse(saved) : INITIAL_MEDICATIONS;
  });

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('ivf_stages', JSON.stringify(stages));
  }, [stages]);

  useEffect(() => {
    localStorage.setItem('ivf_medications', JSON.stringify(medications));
  }, [medications]);

  // Calculate progress percentage
  const completedStages = stages.filter(s => s.done).length;
  const progress = Math.round((completedStages / stages.length) * 100);

  // Get current stage name
  const currentStage = stages.find(s => s.active)?.label || stages[0]?.label;

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <HeroSection userName={userName} stage={currentStage} progress={progress} />
            <GlowCard journeyType="ivf" />
            <IVFTimeline stages={stages} />
            <div className="nav-spacer" />
          </>
        );
      case 'journey':
        return (
          <>
            <IVFTimeline stages={stages} />
            <ScanSection scans={SCANS} />
            <EmbryoSection embryos={EMBRYOS} />
            <div className="nav-spacer" />
          </>
        );
      case 'meds':
        return (
          <>
            <MedicationSection medications={medications} onMedicationUpdate={setMedications} />
            <div className="nav-spacer" />
          </>
        );
      case 'insights':
        return (
          <>
            <TwoWeekWait />
            <AIInsightsSection />
            <div className="nav-spacer" />
          </>
        );
      case 'profile':
        return (
          <>
            <PartnerSection />
            <ContactSection />
            <div className="nav-spacer" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="ivf-root">
      {renderContent()}
      <BottomNav active={activeTab} setActive={setActiveTab} />
    </div>
  );
}