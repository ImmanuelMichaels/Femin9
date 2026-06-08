import { useState, useEffect } from 'react';
import { useApp } from '../../context/useApp';
import './Ivf.css';
// import '../Home/Home.css'; 

/* ─────────────────HELPERS─────────────────────────────── */

/**
 * Format a Date object as "MMM D" (e.g. "Jun 8")
 */
function formatShortDate(date) {
  return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
}

/**
 * Add `n` days to a date and return a new Date.
 */
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

/**
 * Return a string like "Mar 20–25" spanning two dates.
 */
function formatDateRange(start, end) {
  const s = start.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
  const e = end.getDate();
  return `${s}–${e}`;
}

/**
 * ISO date string (YYYY-MM-DD) for a Date object.
 */
function toISO(date) {
  return date.toISOString().split('T')[0];
}

/* ─────────────────DATA STORAGE KEYS─────────────────────────────── */
const STORAGE_KEYS = {
  TIMELINE: 'ivf_timeline',
  MEDICATIONS: 'ivf_medications',
  SCANS: 'ivf_scans',
  EMBRYOS: 'ivf_embryos',
  MOOD_LOGS: 'ivf_mood_logs',
  HYDRATION: 'ivf_hydration',
  JOURNAL: 'ivf_journal',
  SYMPTOM_LOGS: 'ivf_symptom_logs',
  AFFIRMATION_IDX: 'ivf_affirmation_idx',
  CYCLE_START: 'ivf_cycle_start',
};

/* ─────────────────INITIAL DATA - ALL EMPTY─────────────────────────────── */

/**
 * Build the IVF timeline relative to a given cycle-start date.
 * All dates calculated from user's cycleStart - NO hard-coded dates.
 */
const buildTimeline = (cycleStart) => {
  if (!cycleStart) return [];
  
  const c = new Date(cycleStart);
  const consultDate   = c;
  const stimDate      = addDays(c, 7);
  const retrievalDate = addDays(c, 17);
  const fertiliseDate = addDays(c, 19);
  const embryoStart   = addDays(c, 19);
  const embryoEnd     = addDays(c, 24);
  const transferDate  = addDays(c, 25);
  const twwStart      = addDays(c, 25);
  const testDate      = addDays(c, 39);

  const today = new Date();
  const isPast = (d) => d < today;
  const isToday = (d) => d.toDateString() === today.toDateString();
  const isDoneOrToday = (d) => isPast(d) || isToday(d);

  return [
    {
      id: 1, label: "Consultation",
      date: formatShortDate(consultDate),
      done: isDoneOrToday(consultDate),
      active: isToday(consultDate),
      timestamp: toISO(consultDate),
    },
    {
      id: 2, label: "Stimulation",
      date: formatShortDate(stimDate),
      done: isDoneOrToday(stimDate),
      active: isToday(stimDate),
      timestamp: toISO(stimDate),
    },
    {
      id: 3, label: "Egg Retrieval",
      date: formatShortDate(retrievalDate),
      done: isDoneOrToday(retrievalDate),
      active: isToday(retrievalDate),
      timestamp: toISO(retrievalDate),
    },
    {
      id: 4, label: "Fertilisation",
      date: formatShortDate(fertiliseDate),
      done: isDoneOrToday(fertiliseDate),
      active: isToday(fertiliseDate),
      timestamp: toISO(fertiliseDate),
    },
    {
      id: 5, label: "Embryo Dev.",
      date: formatDateRange(embryoStart, embryoEnd),
      done: isDoneOrToday(embryoEnd),
      active: today >= embryoStart && today <= embryoEnd,
      timestamp: null,
    },
    {
      id: 6, label: "Transfer",
      date: formatShortDate(transferDate),
      done: isDoneOrToday(transferDate),
      active: isToday(transferDate),
      timestamp: toISO(transferDate),
    },
    {
      id: 7, label: "2-Week Wait",
      date: `${formatShortDate(twwStart)}+`,
      done: isDoneOrToday(testDate),
      active: today > transferDate && today < testDate,
      timestamp: null,
    },
    {
      id: 8, label: "Pregnancy Test",
      date: formatShortDate(testDate),
      done: isDoneOrToday(testDate),
      active: isToday(testDate),
      timestamp: toISO(testDate),
    },
  ];
};

/**
 * Build scan schedule relative to cycle start - ALL dates calculated.
 */
const buildScans = (cycleStart) => {
  if (!cycleStart) return [];
  
  const c = new Date(cycleStart);
  const today = new Date();

  const entries = [
    { id: 1, offset: 9,  label: "Baseline Scan" },
    { id: 2, offset: 13, label: "Stimulation Day 6" },
    { id: 3, offset: 16, label: "Trigger Day Scan" },
    { id: 4, offset: 25, label: "Transfer Day Scan" },
  ];

  return entries.map(e => {
    const d = addDays(c, e.offset);
    return {
      id: e.id,
      date: formatShortDate(d),
      isoDate: toISO(d),
      label: e.label,
      follicles: null,
      lining: null,
      e2: null,
      status: "upcoming",
      completed: false,
      note: `Schedule your ${e.label.toLowerCase()} with your clinic.`,
    };
  });
};

// EMPTY initial states - NO hard-coded medications, embryos, or contacts
const getInitialMedications = () => [];
const getInitialEmbryos = () => [];
const getInitialContacts = () => [];

// Affirmations are content, not user data (kept as library)
const AFFIRMATIONS = [
  "Your body is doing something extraordinary.",
  "Every injection is a profound act of love.",
  "You are so much stronger than you know.",
  "Hope is the bravest thing you carry.",
  "Rest is not giving up — rest is part of the work.",
  "Whatever happens, you are already a warrior.",
];

// Mood options (UI configuration, can be customized by user)
const DEFAULT_MOODS = [
  { label: "Hopeful",   emoji: "🌸", color: "#7DCB98" },
  { label: "Anxious",   emoji: "😰", color: "#E87070" },
  { label: "Calm",      emoji: "🕊️", color: "#9B8FD8" },
  { label: "Tired",     emoji: "😴", color: "#F08C2E" },
  { label: "Strong",    emoji: "💪", color: "#2E9E9B" },
  { label: "Emotional", emoji: "💧", color: "#C96A10" },
];

// Default symptoms (can be customized by user)
const DEFAULT_SYMPTOMS = [
  "Bloating", "Cramping", "Spotting", "Nausea", "Breast tenderness",
  "Fatigue", "Headache", "Mood changes", "Increased urination", "Constipation",
];

/* ─────────────────CYCLE DAY CALCULATION─────────────────────────────── */
function getCycleDay(cycleStart) {
  if (!cycleStart) return null;
  const start = new Date(cycleStart);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  return diff + 1;
}

/* ─────────────────SVG RING HELPER─────────────────────────────── */
const ringCircumference = (r) => 2 * Math.PI * r;

/* ─────────────────MODAL COMPONENT─────────────────────────────── */
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        {children}
        <button className="modal-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

/* ─────────────────ADD MEDICATION MODAL─────────────────────────────── */
function AddMedicationModal({ isOpen, onClose, onAdd }) {
  const [newMed, setNewMed] = useState({
    name: '', type: 'Injection', dose: '', time: '', notes: ''
  });
  
  const handleSubmit = () => {
    if (!newMed.name || !newMed.dose || !newMed.time) return;
    onAdd(newMed);
    setNewMed({ name: '', type: 'Injection', dose: '', time: '', notes: '' });
    onClose();
  };
  
  const getRandomColor = () => {
    const colors = ['#F08C2E', '#9B8FD8', '#E87070', '#2E9E9B', '#7DCB98'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Medication">
      <div className="add-med-form">
        <input
          placeholder="Medication name *"
          value={newMed.name}
          onChange={e => setNewMed({...newMed, name: e.target.value})}
        />
        <select value={newMed.type} onChange={e => setNewMed({...newMed, type: e.target.value})}>
          <option>Injection</option>
          <option>Oral</option>
          <option>Vaginal</option>
        </select>
        <input
          placeholder="Dose (e.g., 150 IU) *"
          value={newMed.dose}
          onChange={e => setNewMed({...newMed, dose: e.target.value})}
        />
        <input
          placeholder="Time (e.g., 07:00 AM) *"
          value={newMed.time}
          onChange={e => setNewMed({...newMed, time: e.target.value})}
        />
        <textarea
          placeholder="Notes (optional)"
          value={newMed.notes}
          onChange={e => setNewMed({...newMed, notes: e.target.value})}
          rows={3}
        />
        <button className="submit-btn" onClick={handleSubmit}>Add Medication</button>
      </div>
    </Modal>
  );
}

/* ─────────────────ADD EMBRYO MODAL─────────────────────────────── */
function AddEmbryoModal({ isOpen, onClose, onAdd }) {
  const [newEmbryo, setNewEmbryo] = useState({
    label: '', grade: '', status: 'culturing', day: '', notes: ''
  });

  const gradeOptions = ["AA", "AB", "BA", "BB", "BC", "CB", "CC"];

  const handleSubmit = () => {
    if (!newEmbryo.label) return;
    const embryo = {
      id: Date.now(),
      label: newEmbryo.label,
      grade: newEmbryo.grade || null,
      day: newEmbryo.day ? parseInt(newEmbryo.day) : null,
      stage: newEmbryo.day ? `Day ${newEmbryo.day}` : 'Culturing',
      status: newEmbryo.status,
      quality: null,
      qualityColor: "#9B8FD8",
      qualityBg: "#F0EEFF",
      notes: newEmbryo.notes || `Embryo ${newEmbryo.label} added on ${new Date().toLocaleDateString()}.`,
    };
    onAdd(embryo);
    setNewEmbryo({ label: '', grade: '', status: 'culturing', day: '', notes: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Embryo">
      <div className="add-embryo-form">
        <input
          placeholder="Embryo label (e.g., Embryo A, Embryo #1) *"
          value={newEmbryo.label}
          onChange={e => setNewEmbryo({...newEmbryo, label: e.target.value})}
          required
        />
        <select value={newEmbryo.grade} onChange={e => setNewEmbryo({...newEmbryo, grade: e.target.value})}>
          <option value="">Select grade (optional)</option>
          {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <input
          type="number"
          placeholder="Development day (e.g., 3, 5)"
          value={newEmbryo.day}
          onChange={e => setNewEmbryo({...newEmbryo, day: e.target.value})}
        />
        <select value={newEmbryo.status} onChange={e => setNewEmbryo({...newEmbryo, status: e.target.value})}>
          <option value="culturing">Culturing (in lab)</option>
          <option value="transfer-ready">Transfer Ready</option>
          <option value="frozen">Frozen</option>
          <option value="discarded">Discarded</option>
        </select>
        <textarea
          placeholder="Notes (optional)"
          value={newEmbryo.notes}
          onChange={e => setNewEmbryo({...newEmbryo, notes: e.target.value})}
          rows={3}
        />
        <button className="submit-btn" onClick={handleSubmit}>Add Embryo</button>
      </div>
    </Modal>
  );
}

/* ─────────────────ADD CONTACT MODAL─────────────────────────────── */
function AddContactModal({ isOpen, onClose, onAdd }) {
  const [newContact, setNewContact] = useState({ name: '', phone: '', role: '' });

  const handleSubmit = () => {
    if (!newContact.name || !newContact.phone) return;
    const contact = {
      id: Date.now(),
      name: newContact.name,
      subtitle: newContact.role || "Care Team Member",
      phone: newContact.phone,
      icon: "👩‍⚕️",
      color: "#9B8FD8",
      bg: "#F0EEFF",
      cta: "Call",
    };
    onAdd(contact);
    setNewContact({ name: '', phone: '', role: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Contact">
      <div className="add-contact-form">
        <input
          placeholder="Contact name *"
          value={newContact.name}
          onChange={e => setNewContact({ ...newContact, name: e.target.value })}
        />
        <input
          placeholder="Phone number *"
          value={newContact.phone}
          onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
        />
        <input
          placeholder="Role (e.g., Nurse, Doctor)"
          value={newContact.role}
          onChange={e => setNewContact({ ...newContact, role: e.target.value })}
        />
        <button className="submit-btn" onClick={handleSubmit}>Add Contact</button>
      </div>
    </Modal>
  );
}

/* ─────────────────COMPONENTS─────────────────────────────── */

function HeroSection({ stage, progress, userName, cycleDay, cycleStartDate, timeline }) {
  const circumference = ringCircumference(52);
  
  // Calculate embryo development info from actual timeline data
  const getEmbryoInfo = () => {
    if (!cycleStartDate || !timeline || timeline.length === 0) {
      return { embryoDay: null, daysUntilTransfer: null };
    }
    
    const today = new Date();
    const retrievalStage = timeline.find(s => s.label === "Egg Retrieval");
    const transferStage = timeline.find(s => s.label === "Transfer");
    
    if (!retrievalStage || !transferStage || !retrievalStage.timestamp) {
      return { embryoDay: null, daysUntilTransfer: null };
    }
    
    const retrievalDate = new Date(retrievalStage.timestamp);
    const transferDate = new Date(transferStage.timestamp);
    const daysSinceRetrieval = Math.floor((today - retrievalDate) / (1000 * 60 * 60 * 24));
    const embryoDay = daysSinceRetrieval >= 0 ? daysSinceRetrieval + 1 : null;
    const daysUntilTransfer = Math.ceil((transferDate - today) / (1000 * 60 * 60 * 24));
    
    return { embryoDay, daysUntilTransfer };
  };
  
  const { embryoDay, daysUntilTransfer } = getEmbryoInfo();
  
  const getEncouragement = () => {
    // Dynamic embryo development message - NO hardcoded day numbers
    if (stage === "Embryo Dev." && embryoDay !== null) {
      if (daysUntilTransfer !== null && daysUntilTransfer > 0) {
        return `Day ${embryoDay} embryo development. Transfer in ${daysUntilTransfer} day${daysUntilTransfer !== 1 ? 's' : ''}. 💛`;
      }
      return `Day ${embryoDay} embryo development. Your embryos are being carefully nurtured. 💛`;
    }
    
    // Stage messages - generic, no hardcoded numbers
    const messages = {
      "Consultation": "Your journey begins today. Every step forward takes courage. 💛",
      "Stimulation": "Keep taking your medications consistently. Your body is responding. 💛",
      "Egg Retrieval": "Today is a big day. You've prepared well — trust the process. 💛",
      "Fertilisation": "The magic is happening in the lab today. Rest and breathe. 💛",
      "Transfer": "Transfer day — what you've been working towards. You've got this. 💛",
      "2-Week Wait": "The hardest two weeks — you are not waiting alone. 💛",
      "Pregnancy Test": "Whatever today brings, your strength is extraordinary. 💛",
    };
    
    return messages[stage] || "Keep going — every step matters. 💛";
  };

  return (
    <section className="hero-section">
      <div className="hero-bg-blob" />
      <div className="hero-content">
        <div className="hero-left">
          <p className="hero-greeting">Hello, {userName || 'there'} ✨</p>
          <h1 className="hero-stage-name">{stage || "Your IVF Journey"}</h1>
          {cycleDay !== null && cycleDay > 0 && (
            <p className="hero-stage-sub">Day {cycleDay} of cycle</p>
          )}
          {stage === "Embryo Dev." && embryoDay !== null && (
            <p className="hero-stage-sub" style={{ fontSize: '14px', marginTop: '4px' }}>
              Embryo Day {embryoDay}
            </p>
          )}
          <div className="hero-progress">
            <div className="hero-progress-bar">
              <div className="hero-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="hero-progress-text">{progress}% complete</p>
          </div>
          <p className="hero-encourage">{getEncouragement()}</p>
        </div>
        <div className="hero-ring">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#FFE4D0" strokeWidth="6" />
            <circle
              cx="60" cy="60" r="52" fill="none" stroke="#F08C2E" strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
            <text x="60" y="67" textAnchor="middle" fill="#C96A10"
              fontSize="20" fontWeight="700" fontFamily="DM Sans, sans-serif">
              {progress}%
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}

function IVFTimeline({ stages, onStageUpdate }) {
  const completedCount = stages.filter(s => s.done).length;
  const total = stages.length;
  const progressPct = Math.round((completedCount / total) * 100);

  let progressMessage;
  if (completedCount === 0) {
    progressMessage = "Your journey starts here. One step at a time.";
  } else if (completedCount === total) {
    progressMessage = "You've completed every stage. Incredible strength.";
  } else if (progressPct >= 50) {
    progressMessage = `${completedCount} of ${total} stages complete — more than halfway there.`;
  } else {
    progressMessage = `${completedCount} of ${total} stages complete. Keep going.`;
  }

  const handleStageToggle = (stageId) => {
    const updated = stages.map(stage =>
      stage.id === stageId
        ? { ...stage, done: !stage.done, active: !stage.done }
        : stage.id === stageId + 1
        ? { ...stage, active: !stage.done }
        : stage
    );
    onStageUpdate(updated);
  };

  return (
    <section className="timeline-section">
      <div className="section-header">
        <span className="section-badge">YOUR JOURNEY</span>
        <h2 className="section-title">IVF Progress</h2>
        <p className="section-subtitle">{progressMessage}</p>
      </div>
      <div className="timeline-scroll">
        <div className="timeline-track">
          {stages.map((stage, idx) => (
            <div key={stage.id} className={`timeline-step ${stage.done ? 'done' : ''} ${stage.active ? 'active' : ''}`}>
              <div className="timeline-connector">
                {idx > 0 && <div className={`timeline-line ${stages[idx - 1].done ? 'line-done' : ''}`} />}
                <button className="timeline-dot" onClick={() => !stage.done && handleStageToggle(stage.id)}>
                  {stage.done ? <span className="check-icon">✓</span> : <span className="dot-number">{stage.id}</span>}
                  {stage.active && <div className="dot-pulse" />}
                </button>
                {idx < stages.length - 1 && <div className={`timeline-line ${stage.done ? 'line-done' : ''}`} />}
              </div>
              <p className="timeline-label">{stage.label}</p>
              <p className="timeline-date">{stage.date}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MedicationSection({ medications, onMedicationUpdate }) {
  const [expanded, setExpanded] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const taken = medications.filter(m => m.status === "taken").length;
  const total = medications.length;
  const pct = total > 0 ? Math.round((taken / total) * 100) : 0;

  const handleMarkTaken = (id) => {
    const updated = medications.map(med =>
      med.id === id ? { ...med, status: "taken", takenAt: new Date().toISOString() } : med
    );
    onMedicationUpdate(updated);
  };

  const handleAddMedication = (newMed) => {
    const medication = {
      id: Date.now(),
      ...newMed,
      status: 'pending',
      color: ['#F08C2E', '#9B8FD8', '#E87070', '#2E9E9B', '#7DCB98'][Math.floor(Math.random() * 5)],
      bg: '#FFF3E8'
    };
    onMedicationUpdate([...medications, medication]);
  };

  return (
    <section className="meds-section">
      <div className="section-header">
        <span className="section-badge">TODAY'S PLAN</span>
        <h2 className="section-title">Medication Schedule</h2>
        <button className="add-med-btn" onClick={() => setShowAddModal(true)}>
          + Add Medication
        </button>
      </div>

      {medications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💊</div>
          <p>No medications added yet.</p>
          <p className="empty-sub">Click "Add Medication" to start tracking your IVF protocol.</p>
        </div>
      ) : (
        <>
          <div className="meds-progress">
            <div className="meds-progress-info">
              <span>{taken} of {total} taken today</span>
              <span className="meds-progress-pct">{pct}%</span>
            </div>
            <div className="meds-progress-bar">
              <div className="meds-progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="meds-list">
            {medications.map(med => (
              <div key={med.id} className={`med-card ${med.status}`}>
                <button className="med-row" onClick={() => setExpanded(expanded === med.id ? null : med.id)}>
                  <div className="med-pip" style={{ background: med.color }} />
                  <div className="med-content">
                    <div className="med-header">
                      <span className="med-name">{med.name}</span>
                      <span className={`med-badge ${med.status}`}>
                        {med.status === "taken" ? "✓ Taken" : "Pending"}
                      </span>
                    </div>
                    <p className="med-sub">{med.dose} · {med.time} · {med.type}</p>
                  </div>
                  <span className={`med-chevron ${expanded === med.id ? 'open' : ''}`}>▼</span>
                </button>
                {expanded === med.id && (
                  <div className="med-expand">
                    <p className="med-note">{med.notes || "No additional notes."}</p>
                    {med.status === "pending" && (
                      <button className="med-taken-btn" onClick={() => handleMarkTaken(med.id)}>
                        Mark as Taken
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <AddMedicationModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onAdd={handleAddMedication} 
      />
    </section>
  );
}

function ScanSection({ scans, onScanUpdate }) {
  const [editingScan, setEditingScan] = useState(null);

  const handleScanUpdate = (scanId, field, value) => {
    const updated = scans.map(scan =>
      scan.id === scanId ? { ...scan, [field]: value } : scan
    );
    onScanUpdate(updated);
  };

  const handleCompleteScan = (scanId) => {
    const updated = scans.map(scan =>
      scan.id === scanId ? { ...scan, status: "completed", completed: true } : scan
    );
    onScanUpdate(updated);
  };

  return (
    <section className="scans-section">
      <div className="section-header">
        <span className="section-badge">MONITORING</span>
        <h2 className="section-title">Fertility Scans</h2>
        <p className="section-subtitle">Track your follicle and lining progress</p>
      </div>
      
      {scans.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <p>No scans scheduled yet.</p>
          <p className="empty-sub">Your scan schedule will appear once you set your cycle start date.</p>
        </div>
      ) : (
        <div className="scans-list">
          {scans.map(scan => (
            <div key={scan.id} className={`scan-card ${scan.status}`}>
              <div className="scan-header">
                <div className="scan-info">
                  <span className={`scan-badge ${scan.status}`}>
                    {scan.status === "completed" ? "✓ Complete" : "Upcoming"}
                  </span>
                  <h3 className="scan-title">{scan.label}</h3>
                  <p className="scan-date">{scan.date}</p>
                </div>
                {!scan.completed && (
                  <button className="scan-edit-btn" onClick={() => setEditingScan(scan.id)}>
                    ✏️ Add Results
                  </button>
                )}
              </div>

              {editingScan === scan.id ? (
                <div className="scan-edit-form">
                  <input
                    type="number"
                    placeholder="Follicle count"
                    value={scan.follicles || ''}
                    onChange={e => handleScanUpdate(scan.id, 'follicles', parseInt(e.target.value))}
                  />
                  <input
                    type="text"
                    placeholder="Lining thickness (mm)"
                    value={scan.lining || ''}
                    onChange={e => handleScanUpdate(scan.id, 'lining', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Estradiol (pmol/L)"
                    value={scan.e2 || ''}
                    onChange={e => handleScanUpdate(scan.id, 'e2', e.target.value)}
                  />
                  <button className="save-btn" onClick={() => {
                    handleCompleteScan(scan.id);
                    setEditingScan(null);
                  }}>
                    Save Results
                  </button>
                </div>
              ) : (
                <>
                  {scan.follicles && (
                    <div className="scan-metrics">
                      <div className="scan-metric">
                        <span className="metric-label">Follicles</span>
                        <span className="metric-value">{scan.follicles}</span>
                      </div>
                      {scan.lining && (
                        <div className="scan-metric">
                          <span className="metric-label">Lining</span>
                          <span className="metric-value">{scan.lining} mm</span>
                        </div>
                      )}
                      {scan.e2 && (
                        <div className="scan-metric">
                          <span className="metric-label">Estradiol</span>
                          <span className="metric-value">{scan.e2}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="scan-note">{scan.note}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function EmbryoSection({ embryos, onEmbryoUpdate }) {
  const [editing, setEditing] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleEmbryoUpdate = (embryoId, field, value) => {
    const updated = embryos.map(emb =>
      emb.id === embryoId ? { ...emb, [field]: value } : emb
    );
    onEmbryoUpdate(updated);
  };

  const handleAddEmbryo = (newEmbryo) => {
    onEmbryoUpdate([...embryos, newEmbryo]);
  };

  const qualityOptions = ["Excellent", "Good", "Fair", "Poor"];
  const gradeOptions = ["AA", "AB", "BA", "BB", "BC", "CB", "CC"];

  const transferReadyCount = embryos.filter(e => e.status === "transfer-ready").length;
  const frozenCount = embryos.filter(e => e.status === "frozen").length;
  const discardedCount = embryos.filter(e => e.status === "discarded").length;
  const culturingCount = embryos.filter(e => e.status === "culturing").length;

  return (
    <section className="embryos-section">
      <div className="section-header">
        <span className="section-badge">LAB UPDATE</span>
        <h2 className="section-title">Embryo Development</h2>
        <button className="add-embryo-btn" onClick={() => setShowAddModal(true)}>
          + Add Embryo
        </button>
      </div>
      
      {embryos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔬</div>
          <p>No embryos tracked yet.</p>
          <p className="empty-sub">
            After your egg retrieval, add embryos to track their development, 
            grades, and transfer readiness.
          </p>
          <button className="empty-state-btn" onClick={() => setShowAddModal(true)}>
            + Add Your First Embryo
          </button>
        </div>
      ) : (
        <>
          {(transferReadyCount > 0 || frozenCount > 0 || culturingCount > 0) && (
            <p className="section-subtitle">
              {transferReadyCount > 0 && `${transferReadyCount} transfer-ready · `}
              {frozenCount > 0 && `${frozenCount} frozen · `}
              {culturingCount > 0 && `${culturingCount} in culture`}
              {discardedCount > 0 && ` · ${discardedCount} discarded`}
            </p>
          )}
          
          <div className="embryos-grid">
            {embryos.map(emb => (
              <div key={emb.id} className={`embryo-card ${emb.status}`}>
                <div className="embryo-visual">
                  <div className={`embryo-orb ${emb.grade ? `grade-${emb.grade[0].toLowerCase()}` : 'grade-none'}`}>
                    <span className="embryo-grade">{emb.grade || '?'}</span>
                  </div>
                  {emb.status === "transfer-ready" && <span className="embryo-star">⭐ Selected</span>}
                </div>
                <div className="embryo-info">
                  <div className="embryo-header">
                    <h4 className="embryo-name">{emb.label}</h4>
                    <button className="embryo-edit" onClick={() => setEditing(emb.id)}>✏️</button>
                  </div>
                  {editing === emb.id ? (
                    <div className="embryo-edit-form">
                      <select 
                        onChange={e => handleEmbryoUpdate(emb.id, 'grade', e.target.value)} 
                        value={emb.grade || ''}
                      >
                        <option value="">Select grade</option>
                        {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <input
                        type="number"
                        placeholder="Day (e.g., 3, 5)"
                        value={emb.day || ''}
                        onChange={e => handleEmbryoUpdate(emb.id, 'day', parseInt(e.target.value))}
                      />
                      <select 
                        onChange={e => handleEmbryoUpdate(emb.id, 'status', e.target.value)} 
                        value={emb.status}
                      >
                        <option value="culturing">Culturing</option>
                        <option value="transfer-ready">Transfer Ready</option>
                        <option value="frozen">Frozen</option>
                        <option value="discarded">Discarded</option>
                      </select>
                      <select 
                        onChange={e => handleEmbryoUpdate(emb.id, 'quality', e.target.value)} 
                        value={emb.quality || ''}
                      >
                        <option value="">Select quality</option>
                        {qualityOptions.map(q => <option key={q} value={q}>{q}</option>)}
                      </select>
                      <textarea
                        placeholder="Notes"
                        value={emb.notes || ''}
                        onChange={e => handleEmbryoUpdate(emb.id, 'notes', e.target.value)}
                        rows={2}
                      />
                      <button className="save-btn" onClick={() => setEditing(null)}>Save</button>
                    </div>
                  ) : (
                    <>
                      <p className="embryo-stage">
                        Day {emb.day || '—'} · {emb.stage || 'Culturing'}
                      </p>
                      <div className="embryo-tags">
                        <span className={`embryo-status ${emb.status}`}>
                          {emb.status === "frozen"         ? "❄️ Frozen"         :
                           emb.status === "transfer-ready" ? "✅ Transfer Ready" :
                           emb.status === "discarded"      ? "🗑️ Discarded"      :
                                                             "🔬 Culturing"}
                        </span>
                        {emb.quality && (
                          <span className="embryo-quality" style={{ background: emb.qualityBg, color: emb.qualityColor }}>
                            {emb.quality}
                          </span>
                        )}
                      </div>
                      {emb.notes && <p className="embryo-notes">{emb.notes}</p>}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <AddEmbryoModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onAdd={handleAddEmbryo} 
      />
    </section>
  );
}

function TwoWeekWait({ onMoodLog, onHydrationUpdate, onJournalUpdate, onSymptomLog, cycleId }) {
  const [mood, setMood] = useState(null);
  const [hydration, setHydration] = useState(0);
  const [journal, setJournal] = useState('');
  const [activeSymptoms, setActiveSymptoms] = useState([]);
  const [affirmIdx, setAffirmIdx] = useState(0);
  const [saved, setSaved] = useState(false);
  const [customHydrationGoal, setCustomHydrationGoal] = useState(() => {
    try {
      const saved = localStorage.getItem(`hydration_goal_${cycleId}`);
      return saved ? parseInt(saved) : 8;
    } catch { return 8; }
  });

  const [moods, setMoods] = useState(() => {
    try {
      const saved = localStorage.getItem('ivf_custom_moods');
      return saved ? JSON.parse(saved) : DEFAULT_MOODS;
    } catch { return DEFAULT_MOODS; }
  });

  const [symptoms, setSymptoms] = useState(() => {
    try {
      const saved = localStorage.getItem('ivf_custom_symptoms');
      return saved ? JSON.parse(saved) : DEFAULT_SYMPTOMS;
    } catch { return DEFAULT_SYMPTOMS; }
  });

  useEffect(() => {
    const savedHydration = localStorage.getItem(STORAGE_KEYS.HYDRATION);
    if (savedHydration) setHydration(parseInt(savedHydration));
    const savedJournal = localStorage.getItem(STORAGE_KEYS.JOURNAL);
    if (savedJournal) setJournal(savedJournal);
    const savedSymptoms = localStorage.getItem(STORAGE_KEYS.SYMPTOM_LOGS);
    if (savedSymptoms) setActiveSymptoms(JSON.parse(savedSymptoms));
    const savedAffirm = localStorage.getItem(STORAGE_KEYS.AFFIRMATION_IDX);
    if (savedAffirm) setAffirmIdx(parseInt(savedAffirm));
  }, []);

  const handleHydration = (value) => {
    const newValue = Math.max(0, value);
    setHydration(newValue);
    localStorage.setItem(STORAGE_KEYS.HYDRATION, newValue.toString());
    onHydrationUpdate?.(newValue);
  };

  const handleJournalSave = () => {
    localStorage.setItem(STORAGE_KEYS.JOURNAL, journal);
    onJournalUpdate?.(journal);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleSymptom = (symptom) => {
    const updated = activeSymptoms.includes(symptom)
      ? activeSymptoms.filter(s => s !== symptom)
      : [...activeSymptoms, symptom];
    setActiveSymptoms(updated);
    localStorage.setItem(STORAGE_KEYS.SYMPTOM_LOGS, JSON.stringify(updated));
    onSymptomLog?.(updated);
  };

  const handleMood = (moodLabel) => {
    setMood(moodLabel);
    const moodLog = { mood: moodLabel, timestamp: new Date().toISOString() };
    const savedLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOOD_LOGS) || '[]');
    localStorage.setItem(STORAGE_KEYS.MOOD_LOGS, JSON.stringify([moodLog, ...savedLogs]));
    onMoodLog?.(moodLabel);
  };

  const hydrationProgress = Math.min(100, Math.round((hydration / customHydrationGoal) * 100));

  return (
    <section className="tww-section">
      <div className="section-header">
        <span className="section-badge">2-WEEK WAIT</span>
        <h2 className="section-title">Wellbeing Support</h2>
        <p className="section-subtitle">The two-week wait is hard. We are here with you.</p>
      </div>

      <div className="affirmation-card">
        <div className="affirmation-icon">🌸</div>
        <p className="affirmation-text">"{AFFIRMATIONS[affirmIdx]}"</p>
        <button className="affirmation-next" onClick={() => {
          const next = (affirmIdx + 1) % AFFIRMATIONS.length;
          setAffirmIdx(next);
          localStorage.setItem(STORAGE_KEYS.AFFIRMATION_IDX, next.toString());
        }}>
          Next affirmation →
        </button>
      </div>

      <div className="mood-card">
        <h3>How are you feeling?</h3>
        <div className="mood-grid">
          {moods.map(m => (
            <button
              key={m.label}
              className={`mood-btn ${mood === m.label ? 'active' : ''}`}
              onClick={() => handleMood(m.label)}
              style={{ borderColor: mood === m.label ? m.color : 'transparent' }}
            >
              <span className="mood-emoji">{m.emoji}</span>
              <span className="mood-label">{m.label}</span>
            </button>
          ))}
        </div>
        {mood && (
          <p className="mood-ack">
            Feeling <strong>{mood}</strong> is completely valid. Thank you for checking in. 💛
          </p>
        )}
      </div>

      <div className="hydration-card">
        <div className="hydration-header">
          <h3>Hydration Tracker</h3>
          <div className="hydration-controls">
            <button 
              className="hydration-goal-btn"
              onClick={() => {
                const newGoal = prompt('Set your daily hydration goal (cups):', customHydrationGoal);
                if (newGoal && !isNaN(parseInt(newGoal))) {
                  setCustomHydrationGoal(parseInt(newGoal));
                  localStorage.setItem(`hydration_goal_${cycleId}`, newGoal);
                }
              }}
            >
              🎯 Goal: {customHydrationGoal} cups
            </button>
            <span className="hydration-count">{hydration}/{customHydrationGoal}</span>
          </div>
        </div>
        <p>Stay hydrated to support your body during this time.</p>
        <div className="hydration-progress">
          <div className="hydration-progress-bar">
            <div className="hydration-progress-fill" style={{ width: `${hydrationProgress}%` }} />
          </div>
          <span className="hydration-progress-text">{hydrationProgress}%</span>
        </div>
        <div className="hydration-cups">
          {Array.from({ length: Math.min(customHydrationGoal, 12) }).map((_, i) => (
            <button
              key={i}
              className={`hydration-cup ${i < hydration ? 'filled' : ''}`}
              onClick={() => handleHydration(i + 1)}
            >
              🥛
            </button>
          ))}
        </div>
      </div>

      <div className="symptoms-card">
        <h3>Symptom Log</h3>
        <p>Tap any symptoms you're experiencing today.</p>
        <div className="symptoms-grid">
          {symptoms.map(s => (
            <button
              key={s}
              className={`symptom-chip ${activeSymptoms.includes(s) ? 'active' : ''}`}
              onClick={() => toggleSymptom(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="journal-card">
        <div className="journal-icon">📓</div>
        <h3>Daily Journal</h3>
        <textarea
          className="journal-input"
          placeholder="Today I'm feeling..."
          value={journal}
          onChange={e => setJournal(e.target.value)}
          rows={4}
        />
        <button className={`journal-save ${saved ? 'saved' : ''}`} onClick={handleJournalSave}>
          {saved ? '✓ Saved' : 'Save Entry'}
        </button>
      </div>
    </section>
  );
}

function ProgressSummarySection({ scans, embryos, medications }) {
  const completedScans = scans.filter(s => s.completed).length;
  const totalEmbryos = embryos.length;
  const transferReady = embryos.filter(e => e.status === "transfer-ready").length;
  const medsTaken = medications.filter(m => m.status === "taken").length;
  const total = medications.length;
  const medsPct = total > 0 ? Math.round((medsTaken / total) * 100) : 0;

  const insights = [
    {
      icon: "💊", title: "Medication Consistency",
      value: total > 0 ? `${medsPct}%` : '—',
      tag: total === 0 ? "Not Started" : medsPct >= 90 ? "Excellent" : medsPct >= 70 ? "Good" : "In Progress",
      detail: total > 0 ? `${medsTaken} of ${total} doses taken` : "No medications added yet",
      color1: "#F08C2E", color2: "#FFB347",
    },
    {
      icon: "🔬", title: "Embryo Development",
      value: totalEmbryos > 0 ? transferReady : '—',
      tag: totalEmbryos === 0 ? "Not Started" : transferReady > 0 ? "Promising" : "In Progress",
      detail: totalEmbryos > 0 
        ? `${transferReady} embryo${transferReady !== 1 ? 's are' : ' is'} transfer-ready. ${totalEmbryos} total embryos tracked.`
        : "No embryos added yet",
      color1: "#7DCB98", color2: "#56AB2F",
    },
    {
      icon: "✨", title: "Scan Completion",
      value: scans.length > 0 ? `${completedScans}/${scans.length}` : '—',
      tag: scans.length === 0 ? "Not Scheduled" : completedScans >= scans.length ? "All Done" : completedScans >= Math.ceil(scans.length / 2) ? "Good Progress" : "Getting Started",
      detail: scans.length > 0 ? `${completedScans} of ${scans.length} scans completed` : "No scans scheduled",
      color1: "#9B8FD8", color2: "#C9B8F5",
    },
  ];

  return (
    <section className="insights-section">
      <div className="section-header">
        <span className="section-badge">YOUR PROGRESS</span>
        <h2 className="section-title">Cycle Summary</h2>
        <p className="section-subtitle">Based on your tracked data</p>
      </div>
      <div className="insights-grid">
        {insights.map((ins, i) => (
          <div
            key={i}
            className="insight-card"
            style={{ background: `linear-gradient(135deg, ${ins.color1} 0%, ${ins.color2} 100%)` }}
          >
            <div className="insight-icon">{ins.icon}</div>
            <span className="insight-tag">{ins.tag}</span>
            <h3 className="insight-title">{ins.title}</h3>
            <p className="insight-value">{ins.value}</p>
            <p className="insight-detail">{ins.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PartnerSection() {
  return (
    <section className="partner-section">
      <div className="section-header">
        <span className="section-badge">TOGETHER</span>
        <h2 className="section-title">Partner Support</h2>
        <p className="section-subtitle">This journey is shared.</p>
      </div>
      <div className="partner-card">
        <div className="partner-profile">
          <div className="partner-avatar">👤</div>
          <div>
            <h3 className="partner-name">Your Partner</h3>
            <p className="partner-role">Connected · Supportive</p>
          </div>
        </div>
        <div className="partner-tips">
          <h4>💡 Tips for today</h4>
          <ul>
            <li>💬 Ask how they're feeling — and really listen</li>
            <li>🍵 Prepare a warm, nutritious meal together</li>
            <li>📅 Review upcoming appointments as a team</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function ContactSection({ contacts, onContactUpdate }) {
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddContact = (newContact) => {
    onContactUpdate([...contacts, newContact]);
  };

  return (
    <section className="contact-section">
      <div className="section-header">
        <span className="section-badge">CARE TEAM</span>
        <h2 className="section-title">Your Support Network</h2>
        <button className="add-contact-btn" onClick={() => setShowAddModal(true)}>
          + Add Contact
        </button>
      </div>
      
      {contacts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <p>No contacts added yet.</p>
          <p className="empty-sub">Add your clinic, doctor, nurse, or support person.</p>
          <button className="empty-state-btn" onClick={() => setShowAddModal(true)}>
            + Add Your First Contact
          </button>
        </div>
      ) : (
        <div className="contacts-list">
          {contacts.map(c => (
            <div key={c.id} className="contact-card">
              <div className="contact-icon">{c.icon}</div>
              <div className="contact-info">
                <h4>{c.name}</h4>
                <p>{c.subtitle}</p>
                <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="contact-phone">{c.phone}</a>
              </div>
              <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="contact-call">Call</a>
            </div>
          ))}
        </div>
      )}

      <AddContactModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onAdd={handleAddContact} 
      />
    </section>
  );
}

/* ─────────────────CYCLE START PICKER─────────────────────────────── */
function CycleStartPicker({ onConfirm }) {
  const [date, setDate] = useState('');

  return (
    <div className="cycle-picker-overlay">
      <div className="cycle-picker-card">
        <div className="cycle-picker-icon">🌸</div>
        <h2>When did your IVF cycle start?</h2>
        <p>Enter your consultation or cycle day 1 date so we can build your personalised timeline.</p>
        <input
          type="date"
          value={date}
          max={new Date().toISOString().split('T')[0]}
          onChange={e => setDate(e.target.value)}
        />
        <button
          className="cycle-picker-btn"
          disabled={!date}
          onClick={() => onConfirm(date)}
        >
          Start my journey
        </button>
      </div>
    </div>
  );
}

/* ─────────────────MAIN COMPONENT─────────────────────────────── */
export default function IVFJourney({ activeTab = "home" }) {
  const { userName } = useApp();

  const [cycleStart, setCycleStart] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.CYCLE_START) || null;
  });

  const handleCycleStartConfirm = (dateString) => {
    localStorage.setItem(STORAGE_KEYS.CYCLE_START, dateString);
    setCycleStart(dateString);
  };

  const [timeline, setTimeline] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TIMELINE);
    if (saved) return JSON.parse(saved);
    return cycleStart ? buildTimeline(cycleStart) : [];
  });

  const [medications, setMedications] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
    return saved ? JSON.parse(saved) : getInitialMedications();
  });

  const [scans, setScans] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCANS);
    if (saved) return JSON.parse(saved);
    return cycleStart ? buildScans(cycleStart) : [];
  });

  const [embryos, setEmbryos] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMBRYOS);
    return saved ? JSON.parse(saved) : getInitialEmbryos();
  });

  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem('ivf_contacts');
    return saved ? JSON.parse(saved) : getInitialContacts();
  });

  useEffect(() => {
    if (!cycleStart) return;
    const hasTimeline = localStorage.getItem(STORAGE_KEYS.TIMELINE);
    if (!hasTimeline) {
      const built = buildTimeline(cycleStart);
      setTimeline(built);
    }
    const hasScans = localStorage.getItem(STORAGE_KEYS.SCANS);
    if (!hasScans) {
      const built = buildScans(cycleStart);
      setScans(built);
    }
  }, [cycleStart]);

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(timeline)); }, [timeline]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(medications)); }, [medications]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(scans)); }, [scans]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EMBRYOS, JSON.stringify(embryos)); }, [embryos]);
  useEffect(() => { localStorage.setItem('ivf_contacts', JSON.stringify(contacts)); }, [contacts]);

  const completedStages = timeline.filter(s => s.done).length;
  const progress = timeline.length > 0 ? Math.round((completedStages / timeline.length) * 100) : 0;
  const currentStage = timeline.find(s => s.active)?.label
    ?? (completedStages === timeline.length && timeline.length > 0 ? timeline[timeline.length - 1]?.label : timeline[0]?.label);
  const cycleDay = getCycleDay(cycleStart);

  if (!cycleStart) {
    return <CycleStartPicker onConfirm={handleCycleStartConfirm} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <HeroSection 
              userName={userName} 
              stage={currentStage} 
              progress={progress} 
              cycleDay={cycleDay}
              cycleStartDate={cycleStart}
              timeline={timeline}
            />
            <IVFTimeline stages={timeline} onStageUpdate={setTimeline} />
          </>
        );
      case 'journey':
        return (
          <>
            <IVFTimeline stages={timeline} onStageUpdate={setTimeline} />
            <ScanSection scans={scans} onScanUpdate={setScans} />
            <EmbryoSection embryos={embryos} onEmbryoUpdate={setEmbryos} />
          </>
        );
      case 'meds':
        return <MedicationSection medications={medications} onMedicationUpdate={setMedications} />;
      case 'insights':
        return (
          <>
            <TwoWeekWait cycleId={cycleStart} />
            <ProgressSummarySection scans={scans} embryos={embryos} medications={medications} />
          </>
        );
      case 'profile':
        return (
          <>
            <PartnerSection />
            <ContactSection contacts={contacts} onContactUpdate={setContacts} />
          </>
        );
      default:
        return <HeroSection 
          userName={userName} 
          stage={currentStage} 
          progress={progress} 
          cycleDay={cycleDay}
          cycleStartDate={cycleStart}
          timeline={timeline}
        />;
    }
  };

  return <div className="ivf-journey">{renderContent()}</div>;
}