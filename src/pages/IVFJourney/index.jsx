import { useState, useEffect } from 'react';
import { useApp } from '../../context/useApp';
import { lsGet, lsSet } from '../../utils/storage';
import EmbryoTracker from '../../components/EmbryoTracker'; 
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

/* ─────────────────SVG RING─────────────────────────────────────────── */
const ringCircumference = (r) => 2 * Math.PI * r;

/* ─────────────────CYCLE DAY CALCULATION────────────────────────────── */
function getCycleDay(cycleStart) {
  if (!cycleStart) return null;
  const start = new Date(cycleStart);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
}

/* ─────────────────CYCLE OFFSETS────────────────────────── */
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
  PARTNER_SUPPORT: 'ivf_partner_support',
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
    { id: 'consultation', label: "Consultation", date: formatShortDate(consultDate), done: isDoneOrToday(consultDate), active: isToday(consultDate), timestamp: toISO(consultDate) },
    { id: 'stimulation', label: "Stimulation", date: formatShortDate(stimDate), done: isDoneOrToday(stimDate), active: isToday(stimDate), timestamp: toISO(stimDate) },
    { id: 'egg-retrieval', label: "Egg Retrieval", date: formatShortDate(retrievalDate), done: isDoneOrToday(retrievalDate), active: isToday(retrievalDate), timestamp: toISO(retrievalDate) },
    { id: 'fertilisation', label: "Fertilisation", date: formatShortDate(fertiliseDate), done: isDoneOrToday(fertiliseDate), active: isToday(fertiliseDate), timestamp: toISO(fertiliseDate) },
    { id: 'embryo-dev', label: "Embryo Dev.", date: formatDateRange(embryoStart, embryoEnd), done: isDoneOrToday(embryoEnd), active: today >= embryoStart && today <= embryoEnd, timestamp: null },
    { id: 'transfer', label: "Transfer", date: formatShortDate(transferDate), done: isDoneOrToday(transferDate), active: isToday(transferDate), timestamp: toISO(transferDate) },
    { id: 'tww', label: "2-Week Wait", date: `${formatShortDate(twwStart)}+`, done: isDoneOrToday(testDate), active: today > transferDate && today < testDate, timestamp: null },
    { id: 'pregnancy-test', label: "Pregnancy Test", date: formatShortDate(testDate), done: isDoneOrToday(testDate), active: isToday(testDate), timestamp: toISO(testDate) },
  ];
};

const buildScans = (cycleStart) => {
  if (!cycleStart) return [];
  const c = new Date(cycleStart);
  return SCAN_OFFSETS.map(e => {
    const d = addDays(c, e.offset);
    return { id: e.id, date: formatShortDate(d), isoDate: toISO(d), label: e.label, follicles: null, lining: null, e2: null, status: "upcoming", completed: false, note: `Schedule your ${e.label.toLowerCase()} with your clinic.` };
  });
};

const getInitialMedications = () => [];
const getInitialEmbryos = () => [];
const getInitialContacts = () => [];

/* ─────────────────HERO SECTION────────────────────────────────────── */
function HeroSection({ stage, progress, userName, cycleDay, cycleStartDate, timeline }) {
  const circumference = ringCircumference(52);
  const getEncouragement = () => {
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
          {cycleDay !== null && cycleDay > 0 && <p className="hero-stage-sub">Day {cycleDay} of cycle</p>}
          <div className="hero-progress">
            <div className="hero-progress-bar"><div className="hero-progress-fill" style={{ width: `${progress}%` }} /></div>
            <p className="hero-progress-text">{progress}% complete</p>
          </div>
          <p className="hero-encourage">{getEncouragement()}</p>
        </div>
        <div className="hero-ring">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#FFE4D0" strokeWidth="6" />
            <circle cx="60" cy="60" r="52" fill="none" stroke="#F08C2E" strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress / 100)} strokeLinecap="round" transform="rotate(-90 60 60)" />
            <text x="60" y="67" textAnchor="middle" fill="#C96A10" fontSize="20" fontWeight="700">{progress}%</text>
          </svg>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────IVF TIMELINE────────────────────────────────────── */
function IVFTimeline({ stages, onStageUpdate }) {
  const completedCount = stages.filter(s => s.done).length;
  const total = stages.length;

  const handleStageToggle = (stageId) => {
    const idx = stages.findIndex(s => s.id === stageId);
    const updated = stages.map((stage, i) => {
      if (stage.id === stageId) return { ...stage, done: !stage.done, active: !stage.done };
      if (i === idx + 1) return { ...stage, active: !stages[idx].done };
      return stage;
    });
    onStageUpdate(updated);
  };

  return (
    <section className="timeline-section">
      <div className="section-header">
        <span className="section-badge">YOUR JOURNEY</span>
        <h2 className="section-title">IVF Progress</h2>
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

/* ─────────────────MEDICATION SECTION───────────────────────────── */

const FREQ_OPTIONS = [
  { value: 'once',      label: 'Once daily'    },
  { value: 'twice',     label: 'Twice daily'   },
  { value: 'three',     label: 'Three times daily' },
  { value: 'injection', label: 'Injection'     },
  { value: 'asneeded',  label: 'As needed'     },
];

const ROUTE_OPTIONS = [
  { value: 'oral',        label: '💊 Oral'         },
  { value: 'injection',   label: '💉 Injection'     },
  { value: 'pessary',     label: '🔵 Pessary/Gel'  },
  { value: 'patch',       label: '🩹 Patch'         },
  { value: 'nasal',       label: '👃 Nasal spray'   },
  { value: 'topical',     label: '🧴 Topical'       },
];

const TIMES_OF_DAY = ['Morning', 'Afternoon', 'Evening', 'Bedtime'];

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function formatDisplayDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isMedActive(med) {
  const today = todayISO();
  if (med.startDate && med.startDate > today) return false;
  if (med.endDate && med.endDate < today) return false;
  return true;
}

const BLANK_FORM = {
  name: '',
  dose: '',
  unit: 'mg',
  frequency: 'once',
  route: 'oral',
  times: ['Morning'],
  startDate: todayISO(),
  endDate: '',
  prescribedBy: '',
  notes: '',
};

function MedModal({ initial, onSave, onClose, title }) {
  const [form, setForm] = useState(initial);
  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const toggleTime = (t) => {
    setForm(f => ({
      ...f,
      times: f.times.includes(t) ? f.times.filter(x => x !== t) : [...f.times, t],
    }));
  };
  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <div className="cycle-picker-overlay" onClick={onClose}>
      <div className="cycle-picker-card" style={{ maxWidth: 420, width: '100%', maxHeight: '88vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <h2 style={{ marginBottom: 4 }}>{title}</h2>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>Record exactly what your clinic or GP prescribed.</p>
        <div className="med-field"><label className="med-label">Medication name *</label><input className="med-input" placeholder="e.g. Gonal-F, Progesterone" value={form.name} onChange={e => set('name', e.target.value)} /></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="med-field" style={{ flex: 2 }}><label className="med-label">Dose</label><input className="med-input" placeholder="e.g. 150" value={form.dose} onChange={e => set('dose', e.target.value)} /></div>
          <div className="med-field" style={{ flex: 1 }}><label className="med-label">Unit</label><select className="med-input" value={form.unit} onChange={e => set('unit', e.target.value)}>{['mg', 'mcg', 'IU', 'ml', '%', 'units'].map(u => (<option key={u} value={u}>{u}</option>))}</select></div>
        </div>
        <div className="med-field"><label className="med-label">Route</label><select className="med-input" value={form.route} onChange={e => set('route', e.target.value)}>{ROUTE_OPTIONS.map(r => (<option key={r.value} value={r.value}>{r.label}</option>))}</select></div>
        <div className="med-field"><label className="med-label">Frequency</label><select className="med-input" value={form.frequency} onChange={e => set('frequency', e.target.value)}>{FREQ_OPTIONS.map(f => (<option key={f.value} value={f.value}>{f.label}</option>))}</select></div>
        <div className="med-field"><label className="med-label">Time(s) of day</label><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>{TIMES_OF_DAY.map(t => (<button key={t} type="button" onClick={() => toggleTime(t)} style={{ padding: '6px 14px', borderRadius: 20, border: '1.5px solid', borderColor: form.times.includes(t) ? '#d63a6e' : '#ddd', background: form.times.includes(t) ? '#fde8f0' : 'transparent', color: form.times.includes(t) ? '#d63a6e' : '#666', fontSize: 13, cursor: 'pointer' }}>{t}</button>))}</div></div>
        <div style={{ display: 'flex', gap: 10 }}><div className="med-field" style={{ flex: 1 }}><label className="med-label">Start date</label><input type="date" className="med-input" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div><div className="med-field" style={{ flex: 1 }}><label className="med-label">End date</label><input type="date" className="med-input" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></div></div>
        <div className="med-field"><label className="med-label">Prescribed by</label><input className="med-input" placeholder="e.g. Dr Smith" value={form.prescribedBy} onChange={e => set('prescribedBy', e.target.value)} /></div>
        <div className="med-field"><label className="med-label">Notes</label><textarea className="med-input" rows={3} placeholder="e.g. Take with food, store in fridge..." value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} /></div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: '1.5px solid #ddd', background: 'transparent', color: '#666', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={!form.name.trim()} className="cycle-picker-btn" style={{ flex: 2, margin: 0 }}>Save medication</button>
        </div>
      </div>
    </div>
  );
}

function DailyCheckRow({ med, takenLog, onToggle }) {
  const times = med.times?.length ? med.times : ['Morning'];
  return (
    <div className="med-check-row">
      <div className="med-check-info"><span className="med-check-name">{med.name}</span><span className="med-check-meta">{med.dose}{med.unit} · {ROUTE_OPTIONS.find(r => r.value === med.route)?.label ?? med.route}</span></div>
      <div className="med-check-times">{times.map(t => { const key = `${med.id}_${t}`; const done = !!takenLog[key]; return (<button key={t} onClick={() => onToggle(key)} className={`med-time-chip ${done ? 'taken' : ''}`}>{done ? '✓' : '○'} {t}</button>); })}</div>
    </div>
  );
}

function MedCard({ med, onEdit, onDelete }) {
  const active = isMedActive(med);
  const routeLabel = ROUTE_OPTIONS.find(r => r.value === med.route)?.label ?? med.route;
  return (
    <div className={`med-card ${active ? 'med-card--active' : 'med-card--inactive'}`}>
      <div className="med-card-top"><div><p className="med-card-name">{med.name}</p><p className="med-card-sub">{med.dose}{med.unit} · {routeLabel} · {FREQ_OPTIONS.find(f => f.value === med.frequency)?.label ?? med.frequency}</p>{med.prescribedBy && <p className="med-card-sub" style={{ opacity: 0.7 }}>Prescribed by {med.prescribedBy}</p>}</div><div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}><span className={`med-status-pill ${active ? 'active' : 'inactive'}`}>{active ? 'Active' : 'Inactive'}</span><div style={{ display: 'flex', gap: 6 }}><button className="med-icon-btn" onClick={() => onEdit(med)}>✏️</button><button className="med-icon-btn" onClick={() => onDelete(med.id)}>🗑️</button></div></div></div>
      {(med.startDate || med.endDate) && <p className="med-card-dates">{med.startDate && `From ${formatDisplayDate(med.startDate)}`}{med.endDate && ` · Until ${formatDisplayDate(med.endDate)}`}</p>}
      {med.times?.length > 0 && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>{med.times.map(t => (<span key={t} className="med-time-label">{t}</span>))}</div>}
      {med.notes && <p className="med-card-notes">📝 {med.notes}</p>}
    </div>
  );
}

function MedicationSection({ medications, onMedicationUpdate }) {
  const todayKey = `ivf_taken_${todayISO()}`;
  const [takenLog, setTakenLog] = useState(() => lsGet(todayKey, {}));
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState('today');
  const saveMedications = (updated) => onMedicationUpdate(updated);
  const handleAdd = (form) => { const newMed = { id: Date.now(), ...form }; saveMedications([...medications, newMed]); setShowAdd(false); };
  const handleEdit = (form) => { const updated = medications.map(m => m.id === editing.id ? { ...m, ...form } : m); saveMedications(updated); setEditing(null); };
  const handleDelete = (id) => { if (!window.confirm('Remove this medication?')) return; saveMedications(medications.filter(m => m.id !== id)); };
  const toggleTaken = (key) => { const updated = { ...takenLog, [key]: !takenLog[key] }; setTakenLog(updated); lsSet(todayKey, updated); };
  const activeMeds = medications.filter(isMedActive);
  const inactiveMeds = medications.filter(m => !isMedActive(m));
  const todayTotal = activeMeds.reduce((acc, m) => acc + (m.times?.length || 1), 0);
  const todayTaken = activeMeds.reduce((acc, m) => { const times = m.times?.length ? m.times : ['Morning']; return acc + times.filter(t => takenLog[`${m.id}_${t}`]).length; }, 0);
  const todayPct = todayTotal > 0 ? Math.round((todayTaken / todayTotal) * 100) : 0;

  return (
    <section className="meds-section">
      <div className="section-header"><span className="section-badge">TODAY'S PLAN</span><h2 className="section-title">Medication Log</h2><button className="add-med-btn" onClick={() => setShowAdd(true)}>+ Add</button></div>
      {medications.length === 0 ? (<div className="empty-state"><div className="empty-state-icon">💊</div><p style={{ fontWeight: 600, marginBottom: 4 }}>No medications logged yet</p><p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>Add the medications your clinic or GP has prescribed for this cycle.</p><button className="cycle-picker-btn" style={{ margin: 0 }} onClick={() => setShowAdd(true)}>+ Add first medication</button></div>) : (<>
        {activeMeds.length > 0 && (<div className="med-progress-bar-wrap"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}><span style={{ fontSize: 13, fontWeight: 600 }}>Today's doses</span><span style={{ fontSize: 13, color: todayPct === 100 ? '#2e9e67' : '#d63a6e', fontWeight: 700 }}>{todayTaken}/{todayTotal} taken {todayPct === 100 ? '🎉' : ''}</span></div><div className="hero-progress-bar"><div className="hero-progress-fill" style={{ width: `${todayPct}%`, background: todayPct === 100 ? '#2e9e67' : undefined }} /></div></div>)}
        <div className="med-view-toggle"><button className={`med-toggle-btn ${view === 'today' ? 'active' : ''}`} onClick={() => setView('today')}>Today's schedule</button><button className={`med-toggle-btn ${view === 'all' ? 'active' : ''}`} onClick={() => setView('all')}>All medications</button></div>
        {view === 'today' && (<div className="med-list">{activeMeds.length === 0 ? (<p style={{ fontSize: 14, color: '#888', textAlign: 'center', padding: '24px 0' }}>No active medications.</p>) : (activeMeds.map(med => (<DailyCheckRow key={med.id} med={med} takenLog={takenLog} onToggle={toggleTaken} />)))}</div>)}
        {view === 'all' && (<div className="med-list">{activeMeds.length > 0 && (<><p className="med-group-label">Active</p>{activeMeds.map(med => (<MedCard key={med.id} med={med} onEdit={setEditing} onDelete={handleDelete} />))}</>)}{inactiveMeds.length > 0 && (<><p className="med-group-label" style={{ marginTop: 16 }}>Past / Inactive</p>{inactiveMeds.map(med => (<MedCard key={med.id} med={med} onEdit={setEditing} onDelete={handleDelete} />))}</>)}</div>)}
      </>)}
      {showAdd && <MedModal title="Add medication" initial={{ ...BLANK_FORM }} onSave={handleAdd} onClose={() => setShowAdd(false)} />}
      {editing && <MedModal title="Edit medication" initial={{ ...editing }} onSave={handleEdit} onClose={() => setEditing(null)} />}
    </section>
  );
}

/* ─────────────────SCAN SECTION───────────────────────────── */
function ScanSection({ scans, onScanUpdate }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedScan, setSelectedScan] = useState(null);
  const [formData, setFormData] = useState({ date: toISO(new Date()), label: '', type: 'baseline', follicles: '', lining: '', e2: '', progesterone: '', lh: '', fsh: '', notes: '', completed: false });

  const scanTypes = [
    { value: 'baseline', label: 'Baseline Scan', icon: '📊' },
    { value: 'stimulation', label: 'Stimulation Scan', icon: '📈' },
    { value: 'trigger', label: 'Trigger Scan', icon: '💉' },
    { value: 'retrieval', label: 'Egg Retrieval', icon: '🥚' },
    { value: 'transfer', label: 'Transfer Scan', icon: '🔄' },
    { value: 'pregnancy', label: 'Pregnancy Scan', icon: '👶' },
    { value: 'other', label: 'Other Scan', icon: '🔍' }
  ];

  const handleAddScan = () => { const newScan = { id: Date.now(), ...formData, follicles: formData.follicles ? formData.follicles.split(',').map(f => parseInt(f.trim())) : [], createdAt: toISO(new Date()) }; onScanUpdate([...scans, newScan]); resetForm(); setShowAddForm(false); };
  const handleUpdateScan = () => { const updated = scans.map(scan => scan.id === editingId ? { ...formData, id: editingId, follicles: formData.follicles ? formData.follicles.split(',').map(f => parseInt(f.trim())) : [], updatedAt: toISO(new Date()) } : scan); onScanUpdate(updated); resetForm(); setEditingId(null); setShowAddForm(false); };
  const handleDeleteScan = (id) => { if (window.confirm('Delete this scan record?')) onScanUpdate(scans.filter(scan => scan.id !== id)); };
  const handleToggleComplete = (id) => { const updated = scans.map(scan => scan.id === id ? { ...scan, completed: !scan.completed } : scan); onScanUpdate(updated); };
  const resetForm = () => setFormData({ date: toISO(new Date()), label: '', type: 'baseline', follicles: '', lining: '', e2: '', progesterone: '', lh: '', fsh: '', notes: '', completed: false });
  const editScan = (scan) => { setFormData({ date: scan.date, label: scan.label, type: scan.type, follicles: scan.follicles ? scan.follicles.join(', ') : '', lining: scan.lining || '', e2: scan.e2 || '', progesterone: scan.progesterone || '', lh: scan.lh || '', fsh: scan.fsh || '', notes: scan.notes || '', completed: scan.completed || false }); setEditingId(scan.id); setShowAddForm(true); };
  const getScanTypeInfo = (type) => scanTypes.find(t => t.value === type) || scanTypes[0];
  const calculateTotalFollicles = (follicles) => follicles ? follicles.reduce((sum, f) => sum + f, 0) : 0;
  const getFollicleSizeRange = (follicles) => { if (!follicles || !follicles.length) return 'N/A'; const sorted = [...follicles].sort((a,b) => a - b); return `${sorted[0]}mm - ${sorted[sorted.length-1]}mm`; };
  const upcomingScans = scans.filter(s => !s.completed && new Date(s.date) >= new Date()).sort((a,b) => new Date(a.date) - new Date(b.date));
  const completedScans = scans.filter(s => s.completed).sort((a,b) => new Date(b.date) - new Date(a.date));

  return (
    <section className="scans-section">
      <div className="section-header"><span className="section-badge">MONITORING</span><h2 className="section-title">Fertility Scans</h2><button className="add-med-btn" onClick={() => { resetForm(); setEditingId(null); setShowAddForm(!showAddForm); }}>{showAddForm ? '− Cancel' : '+ Add Scan'}</button></div>
      {showAddForm && (<div className="cycle-picker-overlay" onClick={() => { setShowAddForm(false); resetForm(); setEditingId(null); }}><div className="cycle-picker-card" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}><h2>{editingId ? 'Edit Scan' : 'Add New Scan'}</h2>
        <div className="med-field"><label className="med-label">Scan Date *</label><input type="date" className="med-input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required /></div>
        <div className="med-field"><label className="med-label">Scan Type *</label><select className="med-input" value={formData.type} onChange={e => { const type = e.target.value; const typeInfo = getScanTypeInfo(type); setFormData({...formData, type, label: typeInfo.label}); }}>{scanTypes.map(type => (<option key={type.value} value={type.value}>{type.icon} {type.label}</option>))}</select></div>
        <div className="med-field"><label className="med-label">Custom Label</label><input type="text" className="med-input" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} placeholder="e.g., Day 8 Monitoring" /></div>
        <div className="med-field"><label className="med-label">Follicle Sizes (mm) - comma separated</label><input type="text" className="med-input" value={formData.follicles} onChange={e => setFormData({...formData, follicles: e.target.value})} placeholder="e.g., 12, 14, 16, 18" /><small style={{ color: '#888', fontSize: 12 }}>Enter each follicle size in mm, separated by commas</small></div>
        <div className="med-field"><label className="med-label">Endometrial Lining (mm)</label><input type="number" className="med-input" value={formData.lining} onChange={e => setFormData({...formData, lining: e.target.value})} placeholder="e.g., 8.5" step="0.1" /></div>
        <div className="med-field"><label className="med-label">Estradiol (E2) levels</label><input type="number" className="med-input" value={formData.e2} onChange={e => setFormData({...formData, e2: e.target.value})} placeholder="pg/mL" /></div>
        <div className="med-field"><label className="med-label">Progesterone (P4) levels</label><input type="number" className="med-input" value={formData.progesterone} onChange={e => setFormData({...formData, progesterone: e.target.value})} placeholder="ng/mL" /></div>
        <div className="med-field"><label className="med-label">LH levels</label><input type="number" className="med-input" value={formData.lh} onChange={e => setFormData({...formData, lh: e.target.value})} placeholder="mIU/mL" /></div>
        <div className="med-field"><label className="med-label">FSH levels</label><input type="number" className="med-input" value={formData.fsh} onChange={e => setFormData({...formData, fsh: e.target.value})} placeholder="mIU/mL" /></div>
        <div className="med-field"><label className="med-label">Notes</label><textarea className="med-input" rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="e.g., Lead follicle on right ovary..." /></div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}><button onClick={() => { setShowAddForm(false); resetForm(); setEditingId(null); }} style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: '1.5px solid #ddd', background: 'transparent', color: '#666', fontSize: 14, cursor: 'pointer' }}>Cancel</button><button onClick={editingId ? handleUpdateScan : handleAddScan} disabled={!formData.date} className="cycle-picker-btn" style={{ flex: 2, margin: 0 }}>{editingId ? 'Update' : 'Save'} Scan</button></div>
      </div></div>)}
      {upcomingScans.length > 0 && (<div className="scans-upcoming"><h3 className="scans-section-title">🔜 Upcoming Scans</h3><div className="scans-list">{upcomingScans.map(scan => { const typeInfo = getScanTypeInfo(scan.type); return (<div key={scan.id} className="scan-card upcoming"><div className="scan-card-header"><div className="scan-icon">{typeInfo.icon}</div><div className="scan-info"><h4 className="scan-title">{scan.label || typeInfo.label}</h4><p className="scan-date">{formatShortDate(new Date(scan.date))}</p></div><div className="scan-actions"><button className="scan-edit-btn" onClick={() => editScan(scan)}>✏️</button><button className="scan-delete-btn" onClick={() => handleDeleteScan(scan.id)}>🗑️</button></div></div>{scan.notes && <p className="scan-notes-preview">📝 {scan.notes.substring(0, 60)}...</p>}<button className="scan-complete-btn" onClick={() => handleToggleComplete(scan.id)}>✓ Mark as completed</button></div>); })}</div></div>)}
      {completedScans.length > 0 && (<div className="scans-completed"><h3 className="scans-section-title">✅ Completed Scans</h3><div className="scans-list">{completedScans.map(scan => { const typeInfo = getScanTypeInfo(scan.type); const totalFollicles = calculateTotalFollicles(scan.follicles); return (<div key={scan.id} className="scan-card completed" onClick={() => setSelectedScan(selectedScan === scan.id ? null : scan.id)}><div className="scan-card-header"><div className="scan-icon">{typeInfo.icon}</div><div className="scan-info"><h4 className="scan-title">{scan.label || typeInfo.label}</h4><p className="scan-date">{formatShortDate(new Date(scan.date))}</p></div><div className="scan-actions"><button className="scan-edit-btn" onClick={(e) => { e.stopPropagation(); editScan(scan); }}>✏️</button><button className="scan-delete-btn" onClick={(e) => { e.stopPropagation(); handleDeleteScan(scan.id); }}>🗑️</button></div></div>{(scan.follicles?.length > 0 || scan.lining || scan.e2) && (<div className="scan-results-preview">{scan.follicles?.length > 0 && (<span className="scan-badge">📊 {totalFollicles} follicles ({getFollicleSizeRange(scan.follicles)})</span>)}{scan.lining && <span className="scan-badge">📏 Lining: {scan.lining}mm</span>}{scan.e2 && <span className="scan-badge">💉 E2: {scan.e2}</span>}</div>)}{selectedScan === scan.id && (<div className="scan-details-expanded">{(scan.follicles?.length > 0 || scan.lining || scan.e2 || scan.progesterone || scan.lh || scan.fsh) && (<div className="scan-results-details"><h5>Results Details</h5>{scan.follicles?.length > 0 && (<div className="scan-detail-row"><strong>Follicles:</strong> {scan.follicles.map(f => `${f}mm`).join(', ')}</div>)}{scan.lining && (<div className="scan-detail-row"><strong>Endometrial Lining:</strong> {scan.lining}mm</div>)}{scan.e2 && (<div className="scan-detail-row"><strong>Estradiol (E2):</strong> {scan.e2} pg/mL</div>)}{scan.progesterone && (<div className="scan-detail-row"><strong>Progesterone (P4):</strong> {scan.progesterone} ng/mL</div>)}{scan.lh && (<div className="scan-detail-row"><strong>LH:</strong> {scan.lh} mIU/mL</div>)}{scan.fsh && (<div className="scan-detail-row"><strong>FSH:</strong> {scan.fsh} mIU/mL</div>)}</div>)}{scan.notes && (<div className="scan-notes"><strong>Notes:</strong><p>{scan.notes}</p></div>)}</div>)}{selectedScan !== scan.id && scan.notes && (<p className="scan-notes-preview">📝 {scan.notes.substring(0, 80)}...</p>)}</div>); })}</div></div>)}
      {scans.length === 0 && (<div className="empty-state"><div className="empty-state-icon">📊</div><p style={{ fontWeight: 600, marginBottom: 4 }}>No scans recorded yet</p><p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>Track your fertility monitoring appointments and results here.</p><button className="cycle-picker-btn" style={{ margin: 0 }} onClick={() => setShowAddForm(true)}>+ Add your first scan</button></div>)}
    </section>
  );
}

/* ─────────────────EMBRYO SECTION───────────────────────────── */
function EmbryoSection({ embryos, onEmbryoUpdate }) {
  const totalEmbryos = embryos.length;
  const frozenEmbryos = embryos.filter(e => e.frozen).length;
  const transferredEmbryos = embryos.filter(e => e.transferred).length;
  const blastocysts = embryos.filter(e => e.stage === 'blastocyst').length;

  return (
    <section className="embryos-section">
      <div className="section-header"><span className="section-badge">LAB UPDATE</span><h2 className="section-title">Embryo Development</h2><button className="add-med-btn" onClick={() => window.location.hash = 'embryos'}>View Full Tracker →</button></div>
      {totalEmbryos === 0 ? (<div className="empty-state"><div className="empty-state-icon">🔬</div><p style={{ fontWeight: 600, marginBottom: 4 }}>No embryos recorded yet</p><p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>After egg retrieval, track your embryo development in the Embryos tab.</p></div>) : (<><div className="embryo-summary-grid"><div className="embryo-stat"><div className="stat-value">{totalEmbryos}</div><div className="stat-label">Total Embryos</div></div><div className="embryo-stat"><div className="stat-value">{frozenEmbryos}</div><div className="stat-label">Frozen</div></div><div className="embryo-stat"><div className="stat-value">{transferredEmbryos}</div><div className="stat-label">Transferred</div></div><div className="embryo-stat"><div className="stat-value">{blastocysts}</div><div className="stat-label">Blastocysts</div></div></div></>)}
    </section>
  );
}

/* ─────────────────TWO WEEK WAIT SECTION───────────────────────────── */
function TwoWeekWait({ cycleId, transferDate }) {
  const [symptoms, setSymptoms] = useState(() => lsGet(`${STORAGE_KEYS.SYMPTOM_LOGS}_${todayISO()}`, {}));
  const [dailyAffirmation, setDailyAffirmation] = useState(() => { 
    const idx = lsGet(STORAGE_KEYS.AFFIRMATION_IDX, 0); 
    const affirmationsList = ["You are stronger than you know. 💪", "Every day brings you closer to your dream. 🌈", "Your body is capable of amazing things. ✨", "Trust the process, trust your journey. 🦋"]; 
    return affirmationsList[idx % affirmationsList.length]; 
  });
  const affirmationsList = ["You are stronger than you know. 💪", "Every day brings you closer to your dream. 🌈", "Your body is capable of amazing things. ✨", "Trust the process, trust your journey. 🦋", "You've prepared well. Now rest and hope. 🌸", "You are not alone in this wait. 💕"];
  const commonSymptoms = [{ name: "Mild cramping", emoji: "🔴" }, { name: "Spotting", emoji: "🩸" }, { name: "Breast tenderness", emoji: "🤱" }, { name: "Fatigue", emoji: "😴" }, { name: "Bloating", emoji: "🎈" }, { name: "Nausea", emoji: "🤢" }];
  const handleSymptomToggle = (symptom) => { const updated = { ...symptoms, [symptom]: !symptoms[symptom] }; setSymptoms(updated); lsSet(`${STORAGE_KEYS.SYMPTOM_LOGS}_${todayISO()}`, updated); };
  const nextAffirmation = () => { const currentIdx = affirmationsList.findIndex(a => a === dailyAffirmation); const nextIdx = (currentIdx + 1) % affirmationsList.length; setDailyAffirmation(affirmationsList[nextIdx]); lsSet(STORAGE_KEYS.AFFIRMATION_IDX, nextIdx); };
  const testDate = transferDate ? new Date(transferDate) : null; if (testDate) testDate.setDate(testDate.getDate() + 14);
  const today = new Date(); const daysUntilTest = testDate ? Math.ceil((testDate - today) / (1000 * 60 * 60 * 24)) : null;

  return (
    <section className="tww-section">
      <div className="section-header"><span className="section-badge">2-WEEK WAIT</span><h2 className="section-title">Wellbeing Support</h2></div>
      {testDate && daysUntilTest !== null && daysUntilTest <= 14 && daysUntilTest > 0 && (<div className="tww-countdown"><div className="countdown-number">{daysUntilTest}</div><div className="countdown-label">days until pregnancy test</div><div className="countdown-progress"><div className="hero-progress-bar"><div className="hero-progress-fill" style={{ width: `${((14 - daysUntilTest) / 14) * 100}%` }} /></div></div><p className="countdown-message">{daysUntilTest === 14 && "The wait begins. Take it one day at a time. 💛"}{daysUntilTest === 7 && "Halfway there! You're doing great. 🌟"}{daysUntilTest === 1 && "Tomorrow is the big day. Whatever happens, you're amazing. 💕"}</p></div>)}
      <div className="tww-affirmation"><button className="affirmation-refresh" onClick={nextAffirmation}>⟳</button><p className="affirmation-text">"{dailyAffirmation}"</p><small>Tap to refresh ✨</small></div>
      <div className="tww-symptoms"><h3>🌸 Track Your Symptoms</h3><div className="symptoms-grid">{commonSymptoms.map(symptom => (<button key={symptom.name} className={`symptom-card ${symptoms[symptom.name] ? 'active' : ''}`} onClick={() => handleSymptomToggle(symptom.name)}><span className="symptom-emoji">{symptom.emoji}</span><span className="symptom-name">{symptom.name}</span></button>))}</div></div>
    </section>
  );
}

/* ─────────────────PROGRESS SUMMARY SECTION───────────────────────────── */
function ProgressSummarySection({ scans, embryos, medications, timeline, cycleStart }) {
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const completedScans = scans.filter(s => s.completed).length;
  const totalScans = scans.length;
  const scanCompletionRate = totalScans > 0 ? Math.round((completedScans / totalScans) * 100) : 0;
  const activeMeds = medications.filter(m => { const today = todayISO(); return today >= m.startDate && today <= (m.endDate || '9999-12-31'); }).length;
  const completedStages = timeline.filter(s => s.done).length;
  const totalStages = timeline.length;
  const timelineProgress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
  const currentStage = timeline.find(s => s.active) || timeline[timeline.length - 1];

  return (
    <section className="insights-section">
      <div className="section-header"><span className="section-badge">YOUR PROGRESS</span><h2 className="section-title">Cycle Summary</h2></div>
      <div className="metrics-grid"><div className="metric-card"><div className="metric-icon">📊</div><div className="metric-value">{timelineProgress}%</div><div className="metric-label">Journey Complete</div><div className="metric-sub">{completedStages}/{totalStages} stages done</div></div><div className="metric-card"><div className="metric-icon">🩺</div><div className="metric-value">{scanCompletionRate}%</div><div className="metric-label">Scans Completed</div><div className="metric-sub">{completedScans}/{totalScans} scans</div></div><div className="metric-card"><div className="metric-icon">💪</div><div className="metric-value">{activeMeds}</div><div className="metric-label">Active Medications</div></div></div>
      {currentStage && (<div className="current-stage-card"><h3>📍 Current Stage</h3><div className="stage-name">{currentStage.label}</div><div className="stage-date">Expected: {currentStage.date}</div></div>)}
      <div className="insights-tabs"><button className={`insight-tab ${selectedMetric === 'overview' ? 'active' : ''}`} onClick={() => setSelectedMetric('overview')}>Overview</button></div>
    </section>
  );
}

/* ─────────────────PARTNER SECTION───────────────────────────── */
function PartnerSection({ partner, onPartnerUpdate }) {
  const [showEdit, setShowEdit] = useState(false);
  const [supportLog, setSupportLog] = useState(() => lsGet(STORAGE_KEYS.PARTNER_SUPPORT, []));
  const [newNote, setNewNote] = useState('');
  const supportActivities = ["Attended appointment", "Gave injection", "Emotional support", "Helped with medications"];
  const addSupportNote = () => { if (!newNote.trim()) return; const updated = [...supportLog, { id: Date.now(), note: newNote, date: todayISO(), type: 'note' }]; setSupportLog(updated); lsSet(STORAGE_KEYS.PARTNER_SUPPORT, updated); setNewNote(''); };
  const logActivity = (activity) => { const updated = [...supportLog, { id: Date.now(), activity, date: todayISO(), type: 'activity' }]; setSupportLog(updated); lsSet(STORAGE_KEYS.PARTNER_SUPPORT, updated); };
  const todaysActivities = supportLog.filter(log => log.date === todayISO());

  return (
    <section className="partner-section">
      <div className="section-header"><span className="section-badge">TOGETHER</span><h2 className="section-title">Partner Support</h2><button className="add-med-btn" onClick={() => setShowEdit(!showEdit)}>{showEdit ? '− Done' : '✏️ Edit'}</button></div>
      <div className="partner-info-card">{showEdit ? (<div className="partner-edit"><input type="text" className="med-input" value={partner.name || ''} onChange={e => onPartnerUpdate({...partner, name: e.target.value})} placeholder="Partner's name" /></div>) : (partner.name ? <div className="partner-name">💑 {partner.name}</div> : <div className="partner-placeholder"><p>Add your partner's name</p><button className="cycle-picker-btn" onClick={() => setShowEdit(true)}>+ Add Partner</button></div>)}</div>
      <div className="support-activities"><h3>🤝 Log Support Today</h3><div className="activities-grid">{supportActivities.map(activity => (<button key={activity} className="activity-btn" onClick={() => logActivity(activity)}>{activity}</button>))}</div></div>
      {todaysActivities.length > 0 && (<div className="support-log"><h3>📝 Today's Support</h3>{todaysActivities.map(log => (<div key={log.id} className="support-log-item"><span className="log-icon">{log.type === 'activity' ? '✓' : '💬'}</span><span className="log-text">{log.activity || log.note}</span></div>))}</div>)}
      <div className="support-notes"><h3>💬 Notes</h3><textarea className="med-input" rows="2" value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Write a note..." /><button className="add-med-btn" onClick={addSupportNote}>Post</button></div>
    </section>
  );
}

/* ─────────────────CONTACT SECTION───────────────────────────── */
function ContactSection({ contacts, onContactUpdate }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', role: 'clinic', phone: '', email: '', notes: '', isEmergency: false });
  const contactTypes = [{ value: 'clinic', label: '🏥 Clinic' }, { value: 'doctor', label: '👨‍⚕️ Doctor' }, { value: 'nurse', label: '👩‍⚕️ Nurse' }, { value: 'pharmacy', label: '💊 Pharmacy' }];
  const handleAddContact = () => { const newContact = { id: Date.now(), ...formData, createdAt: toISO(new Date()) }; onContactUpdate([...contacts, newContact]); resetForm(); setShowAddForm(false); };
  const handleUpdateContact = () => { const updated = contacts.map(contact => contact.id === editingId ? { ...formData, id: editingId, updatedAt: toISO(new Date()) } : contact); onContactUpdate(updated); resetForm(); setEditingId(null); setShowAddForm(false); };
  const handleDeleteContact = (id) => { if (window.confirm('Remove this contact?')) onContactUpdate(contacts.filter(c => c.id !== id)); };
  const resetForm = () => setFormData({ name: '', role: 'clinic', phone: '', email: '', notes: '', isEmergency: false });
  const editContact = (contact) => { setFormData(contact); setEditingId(contact.id); setShowAddForm(true); };
  const emergencyContacts = contacts.filter(c => c.isEmergency);

  return (
    <section className="contact-section">
      <div className="section-header"><span className="section-badge">CARE TEAM</span><h2 className="section-title">Your Support Network</h2><button className="add-med-btn" onClick={() => { resetForm(); setEditingId(null); setShowAddForm(!showAddForm); }}>{showAddForm ? '− Cancel' : '+ Add Contact'}</button></div>
      {showAddForm && (<div className="cycle-picker-overlay" onClick={() => { setShowAddForm(false); resetForm(); setEditingId(null); }}><div className="cycle-picker-card" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}><h2>{editingId ? 'Edit Contact' : 'Add New Contact'}</h2>
        <div className="med-field"><label className="med-label">Name *</label><input type="text" className="med-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
        <div className="med-field"><label className="med-label">Role</label><select className="med-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>{contactTypes.map(type => (<option key={type.value} value={type.value}>{type.label}</option>))}</select></div>
        <div className="med-field"><label className="med-label">Phone</label><input type="tel" className="med-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
        <div className="med-field"><label className="med-label">Email</label><input type="email" className="med-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
        <div className="med-field"><label className="med-label">Notes</label><textarea className="med-input" rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} /></div>
        <label className="checkbox-label"><input type="checkbox" checked={formData.isEmergency} onChange={e => setFormData({...formData, isEmergency: e.target.checked})} /> Emergency contact</label>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}><button onClick={() => { setShowAddForm(false); resetForm(); setEditingId(null); }} style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: '1.5px solid #ddd', background: 'transparent', color: '#666', cursor: 'pointer' }}>Cancel</button><button onClick={editingId ? handleUpdateContact : handleAddContact} disabled={!formData.name} className="cycle-picker-btn" style={{ flex: 2, margin: 0 }}>{editingId ? 'Update' : 'Save'}</button></div>
      </div></div>)}
      {emergencyContacts.length > 0 && (<div className="contact-group"><h3 className="contact-group-title">🚨 Emergency Contacts</h3>{emergencyContacts.map(contact => (<div key={contact.id} className="contact-card emergency"><div className="contact-details"><div className="contact-name">{contact.name}</div>{contact.phone && <div className="contact-phone">📞 {contact.phone}</div>}</div><div className="contact-actions"><button className="scan-edit-btn" onClick={() => editContact(contact)}>✏️</button><button className="scan-delete-btn" onClick={() => handleDeleteContact(contact.id)}>🗑️</button></div></div>))}</div>)}
      {contacts.length === 0 && (<div className="empty-state"><div className="empty-state-icon">👥</div><p>No contacts saved yet</p><button className="cycle-picker-btn" onClick={() => setShowAddForm(true)}>+ Add your first contact</button></div>)}
    </section>
  );
}

/* ─────────────────CYCLE START PICKER───────────────────────────── */
function CycleStartPicker({ onConfirm }) {
  const [date, setDate] = useState('');
  return (<div className="cycle-picker-overlay"><div className="cycle-picker-card"><h2>When did your IVF cycle start?</h2><p>Enter your consultation or cycle day 1 date to build your personalised timeline.</p><input type="date" value={date} max={new Date().toISOString().split('T')[0]} onChange={e => setDate(e.target.value)} /><button className="cycle-picker-btn" disabled={!date} onClick={() => onConfirm(date)}>Start my journey</button></div></div>);
}

/* ─────────────────MAIN COMPONENT───────────────────────────────────── */
export default function IVFJourney({ activeTab = "home" }) {
  const { userName } = useApp();
  const [cycleStart, setCycleStart] = useState(() => lsGet(STORAGE_KEYS.CYCLE_START, null));
  const handleCycleStartConfirm = (dateString) => { lsSet(STORAGE_KEYS.CYCLE_START, dateString); setCycleStart(dateString); };
  const [timeline, setTimeline] = useState(() => { 
    const saved = lsGet(STORAGE_KEYS.TIMELINE, null); 
    if (saved) return saved; 
    return cycleStart ? buildTimeline(cycleStart) : []; 
  });
  const [medications, setMedications] = useState(() => lsGet(STORAGE_KEYS.MEDICATIONS, getInitialMedications()));
  const [scans, setScans] = useState(() => { 
    const saved = lsGet(STORAGE_KEYS.SCANS, null); 
    if (saved) return saved; 
    return cycleStart ? buildScans(cycleStart) : []; 
  });
  const [embryos, setEmbryos] = useState(() => lsGet(STORAGE_KEYS.EMBRYOS, getInitialEmbryos()));
  const [contacts, setContacts] = useState(() => lsGet(STORAGE_KEYS.CONTACTS, getInitialContacts()));
  const [partner, setPartner] = useState(() => lsGet(STORAGE_KEYS.PARTNER, { name: '', role: '' }));

  useEffect(() => { 
    if (!cycleStart) return; 
    if (!lsGet(STORAGE_KEYS.TIMELINE, null)) setTimeline(buildTimeline(cycleStart)); 
    if (!lsGet(STORAGE_KEYS.SCANS, null)) setScans(buildScans(cycleStart)); 
  }, [cycleStart]);
  
  useEffect(() => { lsSet(STORAGE_KEYS.TIMELINE, timeline); }, [timeline]);
  useEffect(() => { lsSet(STORAGE_KEYS.MEDICATIONS, medications); }, [medications]);
  useEffect(() => { lsSet(STORAGE_KEYS.SCANS, scans); }, [scans]);
  useEffect(() => { lsSet(STORAGE_KEYS.EMBRYOS, embryos); }, [embryos]);
  useEffect(() => { lsSet(STORAGE_KEYS.CONTACTS, contacts); }, [contacts]);
  useEffect(() => { lsSet(STORAGE_KEYS.PARTNER, partner); }, [partner]);

  const completedStages = timeline.filter(s => s.done).length;
  const progress = timeline.length > 0 ? Math.round((completedStages / timeline.length) * 100) : 0;
  const currentStage = timeline.find(s => s.active)?.label ?? (completedStages === timeline.length && timeline.length > 0 ? timeline[timeline.length - 1]?.label : timeline[0]?.label);
  const cycleDay = getCycleDay(cycleStart);
  const transferStage = timeline.find(s => s.id === 'transfer');

  if (!cycleStart) return <CycleStartPicker onConfirm={handleCycleStartConfirm} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <><HeroSection userName={userName} progress={progress} stage={currentStage} cycleDay={cycleDay} cycleStartDate={cycleStart} timeline={timeline} /><IVFTimeline stages={timeline} onStageUpdate={setTimeline} /></>;
      case 'treatment': return <><HeroSection userName={userName} progress={progress} stage={currentStage} cycleDay={cycleDay} cycleStartDate={cycleStart} timeline={timeline} /><IVFTimeline stages={timeline} onStageUpdate={setTimeline} /><ScanSection scans={scans} onScanUpdate={setScans} /><EmbryoSection embryos={embryos} onEmbryoUpdate={setEmbryos} /></>;
      case 'medications': return <MedicationSection medications={medications} onMedicationUpdate={setMedications} />;
      case 'scans': return <ScanSection scans={scans} onScanUpdate={setScans} />;
      case 'embryos': return <div className="embryo-tracker-page"><EmbryoTracker cycleId={cycleStart} onEmbryoUpdate={(updatedEmbryos) => { setEmbryos(updatedEmbryos); lsSet(STORAGE_KEYS.EMBRYOS, updatedEmbryos); }} /></div>;
      case 'insights': return <><HeroSection userName={userName} progress={progress} stage={currentStage} cycleDay={cycleDay} cycleStartDate={cycleStart} timeline={timeline} /><TwoWeekWait cycleId={cycleStart} transferDate={transferStage?.timestamp} /><ProgressSummarySection scans={scans} embryos={embryos} medications={medications} timeline={timeline} cycleStart={cycleStart} /></>;
      case 'profile': return <><HeroSection userName={userName} progress={progress} stage={currentStage} cycleDay={cycleDay} cycleStartDate={cycleStart} timeline={timeline} /><PartnerSection partner={partner} onPartnerUpdate={setPartner} /><ContactSection contacts={contacts} onContactUpdate={setContacts} /></>;
      default: return <HeroSection userName={userName} stage={currentStage} progress={progress} cycleDay={cycleDay} cycleStartDate={cycleStart} timeline={timeline} />;
    }
  };

  return <div className="ivf-journey">{renderContent()}</div>;
}