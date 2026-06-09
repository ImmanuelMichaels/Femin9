import { useState, useEffect } from 'react';
import { useApp } from '../../context/useApp';
import './Ivf.css';

/* ─────────────────HELPERS─────────────────────────────── */

function formatShortDate(date) {
  return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatDateRange(start, end) {
  const s = start.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
  const e = end.getDate();
  return `${s}–${e}`;
}

function toISO(date) {
  return date.toISOString().split('T')[0];
}

/* ─────────────────CYCLE OFFSETS (named constants, not magic numbers)── */
/**
 * All offsets are in days from cycle start (day 0 = consultation).
 * Adjust here if your clinic protocol differs.
 */
const CYCLE_OFFSETS = {
  CONSULTATION:   0,
  STIMULATION:    7,
  EGG_RETRIEVAL:  17,
  FERTILISATION:  19,
  EMBRYO_START:   19,
  EMBRYO_END:     24,
  TRANSFER:       25,
  TWW_START:      25,
  PREGNANCY_TEST: 39,
};

const SCAN_OFFSETS = [
  { id: 1, offset: 9,  label: "Baseline Scan" },
  { id: 2, offset: 13, label: "Stimulation Day 6" },
  { id: 3, offset: 16, label: "Trigger Day Scan" },
  { id: 4, offset: 25, label: "Transfer Day Scan" },
];

/* ─────────────────DATA STORAGE KEYS─────────────────────────────── */
const STORAGE_KEYS = {
  TIMELINE:        'ivf_timeline',
  MEDICATIONS:     'ivf_medications',
  SCANS:           'ivf_scans',
  EMBRYOS:         'ivf_embryos',
  MOOD_LOGS:       'ivf_mood_logs',
  HYDRATION:       'ivf_hydration',
  JOURNAL:         'ivf_journal',
  SYMPTOM_LOGS:    'ivf_symptom_logs',
  AFFIRMATION_IDX: 'ivf_affirmation_idx',
  CYCLE_START:     'ivf_cycle_start',
  CONTACTS:        'ivf_contacts',
  PARTNER:         'ivf_partner',
};

/* ─────────────────TIMELINE & SCAN BUILDERS─────────────────────────── */

const buildTimeline = (cycleStart) => {
  if (!cycleStart) return [];

  const c          = new Date(cycleStart);
  const today      = new Date();
  const isPast     = (d) => d < today;
  const isToday    = (d) => d.toDateString() === today.toDateString();
  const isDoneOrToday = (d) => isPast(d) || isToday(d);

  const consultDate   = addDays(c, CYCLE_OFFSETS.CONSULTATION);
  const stimDate      = addDays(c, CYCLE_OFFSETS.STIMULATION);
  const retrievalDate = addDays(c, CYCLE_OFFSETS.EGG_RETRIEVAL);
  const fertiliseDate = addDays(c, CYCLE_OFFSETS.FERTILISATION);
  const embryoStart   = addDays(c, CYCLE_OFFSETS.EMBRYO_START);
  const embryoEnd     = addDays(c, CYCLE_OFFSETS.EMBRYO_END);
  const transferDate  = addDays(c, CYCLE_OFFSETS.TRANSFER);
  const twwStart      = addDays(c, CYCLE_OFFSETS.TWW_START);
  const testDate      = addDays(c, CYCLE_OFFSETS.PREGNANCY_TEST);

  return [
    {
      id: 'consultation', label: "Consultation",
      date: formatShortDate(consultDate),
      done: isDoneOrToday(consultDate),
      active: isToday(consultDate),
      timestamp: toISO(consultDate),
    },
    {
      id: 'stimulation', label: "Stimulation",
      date: formatShortDate(stimDate),
      done: isDoneOrToday(stimDate),
      active: isToday(stimDate),
      timestamp: toISO(stimDate),
    },
    {
      id: 'egg-retrieval', label: "Egg Retrieval",
      date: formatShortDate(retrievalDate),
      done: isDoneOrToday(retrievalDate),
      active: isToday(retrievalDate),
      timestamp: toISO(retrievalDate),
    },
    {
      id: 'fertilisation', label: "Fertilisation",
      date: formatShortDate(fertiliseDate),
      done: isDoneOrToday(fertiliseDate),
      active: isToday(fertiliseDate),
      timestamp: toISO(fertiliseDate),
    },
    {
      id: 'embryo-dev', label: "Embryo Dev.",
      date: formatDateRange(embryoStart, embryoEnd),
      done: isDoneOrToday(embryoEnd),
      active: today >= embryoStart && today <= embryoEnd,
      timestamp: null,
    },
    {
      id: 'transfer', label: "Transfer",
      date: formatShortDate(transferDate),
      done: isDoneOrToday(transferDate),
      active: isToday(transferDate),
      timestamp: toISO(transferDate),
    },
    {
      id: 'tww', label: "2-Week Wait",
      date: `${formatShortDate(twwStart)}+`,
      done: isDoneOrToday(testDate),
      active: today > transferDate && today < testDate,
      timestamp: null,
    },
    {
      id: 'pregnancy-test', label: "Pregnancy Test",
      date: formatShortDate(testDate),
      done: isDoneOrToday(testDate),
      active: isToday(testDate),
      timestamp: toISO(testDate),
    },
  ];
};

const buildScans = (cycleStart) => {
  if (!cycleStart) return [];

  const c = new Date(cycleStart);

  return SCAN_OFFSETS.map(e => {
    const d = addDays(c, e.offset);
    return {
      id:        e.id,
      date:      formatShortDate(d),
      isoDate:   toISO(d),
      label:     e.label,
      follicles: null,
      lining:    null,
      e2:        null,
      status:    "upcoming",
      completed: false,
      note:      `Schedule your ${e.label.toLowerCase()} with your clinic.`,
    };
  });
};

const getInitialMedications = () => [];
const getInitialEmbryos    = () => [];
const getInitialContacts   = () => [];

/* ─────────────────CONTENT LIBRARIES (not user data)────────────────── */

const AFFIRMATIONS = [
  "Your body is doing something extraordinary.",
  "Every injection is a profound act of love.",
  "You are so much stronger than you know.",
  "Hope is the bravest thing you carry.",
  "Rest is not giving up — rest is part of the work.",
  "Whatever happens, you are already a warrior.",
];

const DEFAULT_MOODS = [
  { label: "Hopeful",   emoji: "🌸", color: "#7DCB98" },
  { label: "Anxious",   emoji: "😰", color: "#E87070" },
  { label: "Calm",      emoji: "🕊️", color: "#9B8FD8" },
  { label: "Tired",     emoji: "😴", color: "#F08C2E" },
  { label: "Strong",    emoji: "💪", color: "#2E9E9B" },
  { label: "Emotional", emoji: "💧", color: "#C96A10" },
];

const DEFAULT_SYMPTOMS = [
  "Bloating", "Cramping", "Spotting", "Nausea", "Breast tenderness",
  "Fatigue", "Headache", "Mood changes", "Increased urination", "Constipation",
];

const MEDICATION_COLORS = ['#F08C2E', '#9B8FD8', '#E87070', '#2E9E9B', '#7DCB98'];

/* ─────────────────CYCLE DAY CALCULATION────────────────────────────── */
function getCycleDay(cycleStart) {
  if (!cycleStart) return null;
  const start = new Date(cycleStart);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
}

/* ─────────────────MEDICATION THRESHOLDS (named)────────────────────── */
const MED_THRESHOLD_EXCELLENT = 90; // % taken to be "Excellent"
const MED_THRESHOLD_GOOD      = 70; // % taken to be "Good"

/* ─────────────────SVG RING─────────────────────────────────────────── */
const ringCircumference = (r) => 2 * Math.PI * r;

/* ─────────────────MODAL────────────────────────────────────────────── */
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Medication">
      <div className="add-med-form">
        <input
          placeholder="Medication name *"
          value={newMed.name}
          onChange={e => setNewMed({ ...newMed, name: e.target.value })}
        />
        <select value={newMed.type} onChange={e => setNewMed({ ...newMed, type: e.target.value })}>
          <option>Injection</option>
          <option>Oral</option>
          <option>Vaginal</option>
        </select>
        <input
          placeholder="Dose (e.g., 150 IU) *"
          value={newMed.dose}
          onChange={e => setNewMed({ ...newMed, dose: e.target.value })}
        />
        <input
          placeholder="Time (e.g., 07:00 AM) *"
          value={newMed.time}
          onChange={e => setNewMed({ ...newMed, time: e.target.value })}
        />
        <textarea
          placeholder="Notes (optional)"
          value={newMed.notes}
          onChange={e => setNewMed({ ...newMed, notes: e.target.value })}
          rows={3}
        />
        <button className="submit-btn" onClick={handleSubmit}>Add Medication</button>
      </div>
    </Modal>
  );
}

/* ─────────────────ADD EMBRYO MODAL─────────────────────────────────── */
function AddEmbryoModal({ isOpen, onClose, onAdd }) {
  const [newEmbryo, setNewEmbryo] = useState({
    label: '', grade: '', status: 'culturing', day: '', notes: ''
  });

  const gradeOptions = ["AA", "AB", "BA", "BB", "BC", "CB", "CC"];

  const handleSubmit = () => {
    if (!newEmbryo.label) return;
    const embryo = {
      id:            Date.now(),
      label:         newEmbryo.label,
      grade:         newEmbryo.grade || null,
      day:           newEmbryo.day ? parseInt(newEmbryo.day) : null,
      stage:         newEmbryo.day ? `Day ${newEmbryo.day}` : 'Culturing',
      status:        newEmbryo.status,
      quality:       null,
      qualityColor:  "#9B8FD8",
      qualityBg:     "#F0EEFF",
      notes:         newEmbryo.notes || `Embryo ${newEmbryo.label} added on ${new Date().toLocaleDateString()}.`,
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
          onChange={e => setNewEmbryo({ ...newEmbryo, label: e.target.value })}
          required
        />
        <select value={newEmbryo.grade} onChange={e => setNewEmbryo({ ...newEmbryo, grade: e.target.value })}>
          <option value="">Select grade (optional)</option>
          {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <input
          type="number"
          placeholder="Development day (e.g., 3, 5)"
          value={newEmbryo.day}
          onChange={e => setNewEmbryo({ ...newEmbryo, day: e.target.value })}
        />
        <select value={newEmbryo.status} onChange={e => setNewEmbryo({ ...newEmbryo, status: e.target.value })}>
          <option value="culturing">Culturing (in lab)</option>
          <option value="transfer-ready">Transfer Ready</option>
          <option value="frozen">Frozen</option>
          <option value="discarded">Discarded</option>
        </select>
        <textarea
          placeholder="Notes (optional)"
          value={newEmbryo.notes}
          onChange={e => setNewEmbryo({ ...newEmbryo, notes: e.target.value })}
          rows={3}
        />
        <button className="submit-btn" onClick={handleSubmit}>Add Embryo</button>
      </div>
    </Modal>
  );
}

/* ─────────────────ADD CONTACT MODAL────────────────────────────────── */
function AddContactModal({ isOpen, onClose, onAdd }) {
  const [newContact, setNewContact] = useState({ name: '', phone: '', role: '' });

  const handleSubmit = () => {
    if (!newContact.name || !newContact.phone) return;
    onAdd({
      id:       Date.now(),
      name:     newContact.name,
      subtitle: newContact.role || "Care Team Member",
      phone:    newContact.phone,
      icon:     "👩‍⚕️",
      color:    "#9B8FD8",
      bg:       "#F0EEFF",
    });
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

/* ─────────────────EDIT PARTNER MODAL───────────────────────────────── */
function EditPartnerModal({ isOpen, onClose, partner, onSave }) {
  const [draft, setDraft] = useState(partner);

  useEffect(() => { setDraft(partner); }, [partner]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Partner Details">
      <div className="add-contact-form">
        <input
          placeholder="Partner name"
          value={draft.name}
          onChange={e => setDraft({ ...draft, name: e.target.value })}
        />
        <input
          placeholder="Role / description (e.g., My husband)"
          value={draft.role}
          onChange={e => setDraft({ ...draft, role: e.target.value })}
        />
        <button className="submit-btn" onClick={() => { onSave(draft); onClose(); }}>Save</button>
      </div>
    </Modal>
  );
}

/* ─────────────────HYDRATION GOAL PICKER (replaces prompt())────────── */
function HydrationGoalPicker({ current, onSave, onClose }) {
  const [value, setValue] = useState(current);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Set Hydration Goal</h3>
        <p>How many cups of water do you aim to drink each day?</p>
        <input
          type="number"
          min={1}
          max={20}
          value={value}
          onChange={e => setValue(parseInt(e.target.value) || 1)}
          style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
        />
        <button className="submit-btn" onClick={() => { onSave(value); onClose(); }}>Save Goal</button>
        <button className="modal-close" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

/* ─────────────────HERO SECTION──────────────────────────────────────  */
function HeroSection({ stage, progress, userName, cycleDay, cycleStartDate, timeline }) {
  const circumference = ringCircumference(52);

  const getEmbryoInfo = () => {
    if (!cycleStartDate || !timeline || timeline.length === 0) {
      return { embryoDay: null, daysUntilTransfer: null };
    }
    const today         = new Date();
    const retrievalStage = timeline.find(s => s.label === "Egg Retrieval");
    const transferStage  = timeline.find(s => s.label === "Transfer");

    if (!retrievalStage?.timestamp || !transferStage?.timestamp) {
      return { embryoDay: null, daysUntilTransfer: null };
    }

    const retrievalDate      = new Date(retrievalStage.timestamp);
    const transferDate       = new Date(transferStage.timestamp);
    const daysSinceRetrieval = Math.floor((today - retrievalDate) / (1000 * 60 * 60 * 24));
    const embryoDay          = daysSinceRetrieval >= 0 ? daysSinceRetrieval + 1 : null;
    const daysUntilTransfer  = Math.ceil((transferDate - today) / (1000 * 60 * 60 * 24));

    return { embryoDay, daysUntilTransfer };
  };

  const { embryoDay, daysUntilTransfer } = getEmbryoInfo();

  const getEncouragement = () => {
    if (stage === "Embryo Dev." && embryoDay !== null) {
      if (daysUntilTransfer !== null && daysUntilTransfer > 0) {
        return `Day ${embryoDay} embryo development. Transfer in ${daysUntilTransfer} day${daysUntilTransfer !== 1 ? 's' : ''}. 💛`;
      }
      return `Day ${embryoDay} embryo development. Your embryos are being carefully nurtured. 💛`;
    }

    const messages = {
      "Consultation":    "Your journey begins today. Every step forward takes courage. 💛",
      "Stimulation":     "Keep taking your medications consistently. Your body is responding. 💛",
      "Egg Retrieval":   "Today is a big day. You've prepared well — trust the process. 💛",
      "Fertilisation":   "The magic is happening in the lab today. Rest and breathe. 💛",
      "Transfer":        "Transfer day — what you've been working towards. You've got this. 💛",
      "2-Week Wait":     "The hardest two weeks — you are not waiting alone. 💛",
      "Pregnancy Test":  "Whatever today brings, your strength is extraordinary. 💛",
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

/* ─────────────────IVF TIMELINE──────────────────────────────────────  */
function IVFTimeline({ stages, onStageUpdate }) {
  const completedCount = stages.filter(s => s.done).length;
  const total          = stages.length;
  const progressPct    = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const progressMessage =
    completedCount === 0     ? "Your journey starts here. One step at a time."
    : completedCount === total ? "You've completed every stage. Incredible strength."
    : progressPct >= 50      ? `${completedCount} of ${total} stages complete — more than halfway there.`
    :                          `${completedCount} of ${total} stages complete. Keep going.`;

  const handleStageToggle = (stageId) => {
    const idx     = stages.findIndex(s => s.id === stageId);
    const updated = stages.map((stage, i) => {
      if (stage.id === stageId) return { ...stage, done: !stage.done, active: !stage.done };
      if (i === idx + 1)        return { ...stage, active: !stages[idx].done };
      return stage;
    });
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
                  {stage.done ? <span className="check-icon">✓</span> : <span className="dot-number">{idx + 1}</span>}
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

/* ─────────────────MEDICATION SECTION───────────────────────────────── */
function MedicationSection({ medications, onMedicationUpdate }) {
  const [expanded,    setExpanded]    = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const taken = medications.filter(m => m.status === "taken").length;
  const total = medications.length;
  const pct   = total > 0 ? Math.round((taken / total) * 100) : 0;

  const handleMarkTaken = (id) => {
    onMedicationUpdate(
      medications.map(med =>
        med.id === id ? { ...med, status: "taken", takenAt: new Date().toISOString() } : med
      )
    );
  };

  const handleAddMedication = (newMed) => {
    const color = MEDICATION_COLORS[Math.floor(Math.random() * MEDICATION_COLORS.length)];
    onMedicationUpdate([
      ...medications,
      { id: Date.now(), ...newMed, status: 'pending', color, bg: '#FFF3E8' },
    ]);
  };

  return (
    <section className="meds-section">
      <div className="section-header">
        <span className="section-badge">TODAY'S PLAN</span>
        <h2 className="section-title">Medication Schedule</h2>
        <button className="add-med-btn" onClick={() => setShowAddModal(true)}>+ Add Medication</button>
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

/* ─────────────────SCAN SECTION──────────────────────────────────────  */
function ScanSection({ scans, onScanUpdate }) {
  const [editingScan, setEditingScan] = useState(null);

  const handleScanUpdate = (scanId, field, value) => {
    onScanUpdate(scans.map(scan => scan.id === scanId ? { ...scan, [field]: value } : scan));
  };

  const handleCompleteScan = (scanId) => {
    onScanUpdate(scans.map(scan => scan.id === scanId ? { ...scan, status: "completed", completed: true } : scan));
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
                  <button className="save-btn" onClick={() => { handleCompleteScan(scan.id); setEditingScan(null); }}>
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

/* ─────────────────EMBRYO SECTION───────────────────────────────────── */
function EmbryoSection({ embryos, onEmbryoUpdate }) {
  const [editing,      setEditing]      = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleEmbryoUpdate = (embryoId, field, value) => {
    onEmbryoUpdate(embryos.map(emb => emb.id === embryoId ? { ...emb, [field]: value } : emb));
  };

  const qualityOptions = ["Excellent", "Good", "Fair", "Poor"];
  const gradeOptions   = ["AA", "AB", "BA", "BB", "BC", "CB", "CC"];

  const transferReadyCount = embryos.filter(e => e.status === "transfer-ready").length;
  const frozenCount        = embryos.filter(e => e.status === "frozen").length;
  const discardedCount     = embryos.filter(e => e.status === "discarded").length;
  const culturingCount     = embryos.filter(e => e.status === "culturing").length;

  const subtitleParts = [
    transferReadyCount > 0 && `${transferReadyCount} transfer-ready`,
    frozenCount        > 0 && `${frozenCount} frozen`,
    culturingCount     > 0 && `${culturingCount} in culture`,
    discardedCount     > 0 && `${discardedCount} discarded`,
  ].filter(Boolean);

  return (
    <section className="embryos-section">
      <div className="section-header">
        <span className="section-badge">LAB UPDATE</span>
        <h2 className="section-title">Embryo Development</h2>
        <button className="add-embryo-btn" onClick={() => setShowAddModal(true)}>+ Add Embryo</button>
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
          {subtitleParts.length > 0 && (
            <p className="section-subtitle">{subtitleParts.join(' · ')}</p>
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
                      <select onChange={e => handleEmbryoUpdate(emb.id, 'grade', e.target.value)} value={emb.grade || ''}>
                        <option value="">Select grade</option>
                        {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <input
                        type="number"
                        placeholder="Day (e.g., 3, 5)"
                        value={emb.day || ''}
                        onChange={e => handleEmbryoUpdate(emb.id, 'day', parseInt(e.target.value))}
                      />
                      <select onChange={e => handleEmbryoUpdate(emb.id, 'status', e.target.value)} value={emb.status}>
                        <option value="culturing">Culturing</option>
                        <option value="transfer-ready">Transfer Ready</option>
                        <option value="frozen">Frozen</option>
                        <option value="discarded">Discarded</option>
                      </select>
                      <select onChange={e => handleEmbryoUpdate(emb.id, 'quality', e.target.value)} value={emb.quality || ''}>
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
                      <p className="embryo-stage">Day {emb.day || '—'} · {emb.stage || 'Culturing'}</p>
                      <div className="embryo-tags">
                        <span className={`embryo-status ${emb.status}`}>
                          {emb.status === "frozen"          ? "❄️ Frozen"
                           : emb.status === "transfer-ready" ? "✅ Transfer Ready"
                           : emb.status === "discarded"      ? "🗑️ Discarded"
                           :                                   "🔬 Culturing"}
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
        onAdd={(newEmbryo) => onEmbryoUpdate([...embryos, newEmbryo])}
      />
    </section>
  );
}

/* ─────────────────TWO WEEK WAIT────────────────────────────────────── */
function TwoWeekWait({ onMoodLog, onHydrationUpdate, onJournalUpdate, onSymptomLog, cycleId }) {
  const [mood,           setMood]          = useState(null);
  const [hydration,      setHydration]     = useState(0);
  const [journal,        setJournal]       = useState('');
  const [activeSymptoms, setActiveSymptoms] = useState([]);
  const [affirmIdx,      setAffirmIdx]     = useState(0);
  const [saved,          setSaved]         = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  const [customHydrationGoal, setCustomHydrationGoal] = useState(() => {
    try {
      const v = localStorage.getItem(`hydration_goal_${cycleId}`);
      return v ? parseInt(v) : 8;
    } catch { return 8; }
  });

  const [moods, setMoods] = useState(() => {
    try {
      const v = localStorage.getItem('ivf_custom_moods');
      return v ? JSON.parse(v) : DEFAULT_MOODS;
    } catch { return DEFAULT_MOODS; }
  });

  const [symptoms] = useState(() => {
    try {
      const v = localStorage.getItem('ivf_custom_symptoms');
      return v ? JSON.parse(v) : DEFAULT_SYMPTOMS;
    } catch { return DEFAULT_SYMPTOMS; }
  });

  useEffect(() => {
    const h = localStorage.getItem(STORAGE_KEYS.HYDRATION);
    if (h) setHydration(parseInt(h));
    const j = localStorage.getItem(STORAGE_KEYS.JOURNAL);
    if (j) setJournal(j);
    const s = localStorage.getItem(STORAGE_KEYS.SYMPTOM_LOGS);
    if (s) setActiveSymptoms(JSON.parse(s));
    const a = localStorage.getItem(STORAGE_KEYS.AFFIRMATION_IDX);
    if (a) setAffirmIdx(parseInt(a));
  }, []);

  const handleHydration = (value) => {
    const v = Math.max(0, value);
    setHydration(v);
    localStorage.setItem(STORAGE_KEYS.HYDRATION, v.toString());
    onHydrationUpdate?.(v);
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
    const moodLog  = { mood: moodLabel, timestamp: new Date().toISOString() };
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOOD_LOGS) || '[]');
    localStorage.setItem(STORAGE_KEYS.MOOD_LOGS, JSON.stringify([moodLog, ...existing]));
    onMoodLog?.(moodLabel);
  };

  const handleGoalSave = (newGoal) => {
    setCustomHydrationGoal(newGoal);
    localStorage.setItem(`hydration_goal_${cycleId}`, newGoal.toString());
  };

  const hydrationProgress = Math.min(100, Math.round((hydration / customHydrationGoal) * 100));
  // Clamp cup display to 12 max for UI legibility; actual goal is used for %
  const displayCups = Math.min(customHydrationGoal, 12);

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
            <button className="hydration-goal-btn" onClick={() => setShowGoalPicker(true)}>
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
          {Array.from({ length: displayCups }).map((_, i) => (
            <button
              key={i}
              className={`hydration-cup ${i < hydration ? 'filled' : ''}`}
              onClick={() => handleHydration(i + 1)}
            >
              🥛
            </button>
          ))}
          {customHydrationGoal > 12 && (
            <span className="hydration-overflow">+{customHydrationGoal - 12} more</span>
          )}
        </div>
      </div>

      {showGoalPicker && (
        <HydrationGoalPicker
          current={customHydrationGoal}
          onSave={handleGoalSave}
          onClose={() => setShowGoalPicker(false)}
        />
      )}

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

/* ─────────────────PROGRESS SUMMARY────────────────────────────────── */
function ProgressSummarySection({ scans, embryos, medications }) {
  const completedScans  = scans.filter(s => s.completed).length;
  const totalEmbryos    = embryos.length;
  const transferReady   = embryos.filter(e => e.status === "transfer-ready").length;
  const medsTaken       = medications.filter(m => m.status === "taken").length;
  const medsTotal       = medications.length;
  const medsPct         = medsTotal > 0 ? Math.round((medsTaken / medsTotal) * 100) : 0;

  const medTag =
    medsTotal === 0                    ? "Not Started"
    : medsPct >= MED_THRESHOLD_EXCELLENT ? "Excellent"
    : medsPct >= MED_THRESHOLD_GOOD      ? "Good"
    :                                      "In Progress";

  const scansMidpoint = scans.length > 0 ? Math.ceil(scans.length / 2) : 0;
  const scanTag =
    scans.length === 0                    ? "Not Scheduled"
    : completedScans >= scans.length      ? "All Done"
    : completedScans >= scansMidpoint     ? "Good Progress"
    :                                       "Getting Started";

  const insights = [
    {
      icon: "💊", title: "Medication Consistency",
      value:  medsTotal > 0 ? `${medsPct}%` : '—',
      tag:    medTag,
      detail: medsTotal > 0 ? `${medsTaken} of ${medsTotal} doses taken` : "No medications added yet",
      color1: "#F08C2E", color2: "#FFB347",
    },
    {
      icon: "🔬", title: "Embryo Development",
      value:  totalEmbryos > 0 ? transferReady : '—',
      tag:    totalEmbryos === 0 ? "Not Started" : transferReady > 0 ? "Promising" : "In Progress",
      detail: totalEmbryos > 0
        ? `${transferReady} embryo${transferReady !== 1 ? 's are' : ' is'} transfer-ready. ${totalEmbryos} total embryos tracked.`
        : "No embryos added yet",
      color1: "#7DCB98", color2: "#56AB2F",
    },
    {
      icon: "✨", title: "Scan Completion",
      value:  scans.length > 0 ? `${completedScans}/${scans.length}` : '—',
      tag:    scanTag,
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

/* ─────────────────PARTNER SECTION──────────────────────────────────── */
function PartnerSection({ partner, onPartnerUpdate }) {
  const [showEdit, setShowEdit] = useState(false);

  const PARTNER_TIPS = [
    "💬 Ask how they're feeling — and really listen",
    "🍵 Prepare a warm, nutritious meal together",
    "📅 Review upcoming appointments as a team",
  ];

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
            <h3 className="partner-name">{partner.name || "Your Partner"}</h3>
            <p className="partner-role">{partner.role || "Connected · Supportive"}</p>
          </div>
          <button className="embryo-edit" onClick={() => setShowEdit(true)} style={{ marginLeft: 'auto' }}>
            ✏️
          </button>
        </div>
        <div className="partner-tips">
          <h4>💡 Tips for today</h4>
          <ul>
            {PARTNER_TIPS.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
        </div>
      </div>

      <EditPartnerModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        partner={partner}
        onSave={onPartnerUpdate}
      />
    </section>
  );
}

/* ─────────────────CONTACT SECTION──────────────────────────────────── */
function ContactSection({ contacts, onContactUpdate }) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <section className="contact-section">
      <div className="section-header">
        <span className="section-badge">CARE TEAM</span>
        <h2 className="section-title">Your Support Network</h2>
        <button className="add-contact-btn" onClick={() => setShowAddModal(true)}>+ Add Contact</button>
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
        onAdd={(newContact) => onContactUpdate([...contacts, newContact])}
      />
    </section>
  );
}

/* ─────────────────CYCLE START PICKER──────────────────────────────── */
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

/* ─────────────────MAIN COMPONENT───────────────────────────────────── */
export default function IVFJourney({ activeTab = "home" }) {
  const { userName } = useApp();

  const [cycleStart, setCycleStart] = useState(() =>
    localStorage.getItem(STORAGE_KEYS.CYCLE_START) || null
  );

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
    const saved = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    return saved ? JSON.parse(saved) : getInitialContacts();
  });

  const [partner, setPartner] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PARTNER);
    return saved ? JSON.parse(saved) : { name: '', role: '' };
  });

  useEffect(() => {
    if (!cycleStart) return;
    if (!localStorage.getItem(STORAGE_KEYS.TIMELINE)) {
      setTimeline(buildTimeline(cycleStart));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCANS)) {
      setScans(buildScans(cycleStart));
    }
  }, [cycleStart]);

  // Persist all state
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TIMELINE,    JSON.stringify(timeline));    }, [timeline]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(medications)); }, [medications]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SCANS,       JSON.stringify(scans));       }, [scans]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EMBRYOS,     JSON.stringify(embryos));     }, [embryos]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CONTACTS,    JSON.stringify(contacts));    }, [contacts]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PARTNER,     JSON.stringify(partner));     }, [partner]);

  const completedStages = timeline.filter(s => s.done).length;
  const progress = timeline.length > 0 ? Math.round((completedStages / timeline.length) * 100) : 0;
  const currentStage =
    timeline.find(s => s.active)?.label
    ?? (completedStages === timeline.length && timeline.length > 0
      ? timeline[timeline.length - 1]?.label
      : timeline[0]?.label);
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
              progress={progress}
              stage={currentStage}
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
            <PartnerSection partner={partner} onPartnerUpdate={setPartner} />
            <ContactSection contacts={contacts} onContactUpdate={setContacts} />
          </>
        );
      default:
        return (
          <HeroSection
            userName={userName}
            stage={currentStage}
            progress={progress}
            cycleDay={cycleDay}
            cycleStartDate={cycleStart}
            timeline={timeline}
          />
        );
    }
  };

  return <div className="ivf-journey">{renderContent()}</div>;
}