// src/pages/JourneySelect.jsx
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import './JourneySelect.css';

// ─── JOURNEY DEFINITIONS ──────────────────────────────────────────────────
// IDs must match the ones used in AppContext and routing
const JOURNEYS = [
  {
    id: 'pregnant',
    label: 'Pregnancy',
    emoji: '🤰',
    tagline: 'Week by week, bump by bump',
    color: '#d63a6e',
    light: '#fff0f5',
    path: '/app/pregnant',
  },
  {
    id: 'mom',
    label: 'Postpartum',
    emoji: '👶',
    tagline: 'Recovery, bonding & newborn care',
    color: '#e07b9a',
    light: '#fdf0f5',
    path: '/app/mom',
  },
  {
    id: 'conceive',
    label: 'Trying to Conceive',
    emoji: '🌱',
    tagline: 'Fertility tracking & cycle support',
    color: '#b05fa0',
    light: '#f9f0fb',
    path: '/app/conceive',
  },
  {
    id: 'menopause',
    label: 'Menopause',
    emoji: '🌸',
    tagline: 'Thriving through every transition',
    color: '#c46090',
    light: '#fdf2f7',
    path: '/app/menopause',
  },
];

// ─── PROGRESS CALCULATION HELPERS ──────────────────────────────────────────
const calculatePregnancyProgress = (week) => {
  if (!week || week < 1) return { percent: 0, label: 'Week 1 of 40' };
  const clampedWeek = Math.min(week, 40);
  const percent = Math.min(Math.round((clampedWeek / 40) * 100), 100);
  return { percent, label: `Week ${clampedWeek} of 40` };
};

const calculatePostpartumProgress = (days) => {
  if (!days || days < 0) return { percent: 0, label: '0 days postpartum' };
  const clampedDays = Math.min(days, 180);
  const percent = Math.min(Math.round((clampedDays / 180) * 100), 100);
  return { percent, label: `${clampedDays} days postpartum` };
};

// ─── SUB-COMPONENTS ─────────────────────────────────────────────────────────

function CurrentJourneyCard({ journey, progress, onResume }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="js-resume-card"
      style={{ borderColor: journey.color }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="js-current-pill" style={{ background: journey.color }}>
        ✦ Current Journey
      </div>

      <div className="js-resume-inner">
        <div className="js-resume-emoji" style={{ background: journey.light }}>
          {journey.emoji}
        </div>

        <div className="js-resume-info">
          <p className="js-resume-label">{journey.label}</p>
          <p className="js-resume-tagline">{journey.tagline}</p>

          {progress && (
            <div className="js-progress-wrap">
              <div className="js-progress-bar">
                <div
                  className="js-progress-fill"
                  style={{ width: `${progress.percent}%`, background: journey.color }}
                  role="progressbar"
                  aria-valuenow={progress.percent}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
              <span className="js-progress-label">{progress.label}</span>
            </div>
          )}
        </div>
      </div>

      <button
        className="js-resume-btn"
        style={{
          background: hovered ? journey.color : 'transparent',
          color: hovered ? '#fff' : journey.color,
          borderColor: journey.color,
        }}
        onClick={onResume}
        aria-label={`Resume ${journey.label} journey`}
      >
        Resume Journey →
      </button>
    </div>
  );
}

function OtherJourneyCard({ journey, onSelect }) {
  const [hovered, setHovered] = useState(false);

  const handleClick = useCallback(() => {
    onSelect(journey);
  }, [onSelect, journey]);

  return (
    <div
      className="js-other-card"
      style={{
        background: hovered ? journey.light : 'white',
        borderColor: hovered ? journey.color : '#f0e0ea',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Switch to ${journey.label} journey`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <span className="js-other-emoji">{journey.emoji}</span>
      <div className="js-other-info">
        <p className="js-other-label" style={{ color: journey.color }}>
          {journey.label}
        </p>
        <p className="js-other-tagline">{journey.tagline}</p>
      </div>
      <span className="js-other-arrow" style={{ color: journey.color }}>→</span>
    </div>
  );
}

function SwitchConfirmationModal({ journey, currentJourney, onConfirm, onCancel }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div 
      className="js-modal-overlay" 
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="js-modal" 
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="js-modal-emoji">{journey.emoji}</div>
        <h3 id="modal-title" className="js-modal-title">
          Switch to {journey.label}?
        </h3>
        <p className="js-modal-body">
          Your current <strong>{currentJourney.label}</strong> progress will be saved.
          You can switch back anytime.
        </p>
        <div className="js-modal-actions">
          <button 
            className="js-modal-cancel" 
            onClick={onCancel}
            aria-label="Cancel journey switch"
          >
            Cancel
          </button>
          <button
            className="js-modal-confirm"
            style={{ background: journey.color }}
            onClick={onConfirm}
            aria-label={`Confirm switch to ${journey.label}`}
          >
            Yes, Switch →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function JourneySelect() {
  const navigate = useNavigate();
  const { 
    journeyType, 
    setJourneyType, 
    userName, 
    getCurrentWeek,
    setShowSOS 
  } = useApp();

  const [animOut, setAnimOut] = useState(false);
  const [confirmSwitch, setConfirmSwitch] = useState(null);

  // ─── DERIVED VALUES ──────────────────────────────────────────────────────
  const displayName = useMemo(() => userName || 'Mama', [userName]);
  
  const currentJourney = useMemo(() => 
    JOURNEYS.find(j => j.id === journeyType) || JOURNEYS[0],
    [journeyType]
  );
  
  const otherJourneys = useMemo(() => 
    JOURNEYS.filter(j => j.id !== currentJourney.id),
    [currentJourney.id]
  );

  // ─── PROGRESS CALCULATION ──────────────────────────────────────────────
  const progress = useMemo(() => {
    if (journeyType === 'pregnant' && getCurrentWeek) {
      const week = getCurrentWeek() ?? 1;
      return calculatePregnancyProgress(week);
    }

    if (journeyType === 'mom') {
      // In production, this would come from context/state
      const days = 42;
      return calculatePostpartumProgress(days);
    }

    return null;
  }, [journeyType, getCurrentWeek]);

  // ─── NAVIGATION HANDLERS ──────────────────────────────────────────────
  const goToApp = useCallback((newJourneyId = null) => {
    if (newJourneyId) {
      setJourneyType(newJourneyId);
      localStorage.setItem('userJourney', newJourneyId);
    }
    setAnimOut(true);
    
    // Navigate to the journey-specific route
    const journey = newJourneyId || journeyType;
    const journeyPath = JOURNEYS.find(j => j.id === journey)?.path || '/app/pregnant';
    setTimeout(() => navigate(journeyPath), 380);
  }, [navigate, setJourneyType, journeyType]);

  const handleResume = useCallback(() => {
    goToApp();
  }, [goToApp]);

  const handleSwitchRequest = useCallback((journey) => {
    setConfirmSwitch(journey);
  }, []);

  const handleSwitchConfirm = useCallback(() => {
    if (confirmSwitch) {
      goToApp(confirmSwitch.id);
    }
    setConfirmSwitch(null);
  }, [confirmSwitch, goToApp]);

  const handleSwitchCancel = useCallback(() => {
    setConfirmSwitch(null);
  }, []);

  const handleSignOut = useCallback(() => {
    // Clear app-specific data
    localStorage.removeItem('userJourney');
    localStorage.removeItem('userName');
    localStorage.removeItem('userCulture');
    localStorage.removeItem('userConsents');
    localStorage.removeItem('userEmail');
    
    // Clear any app-specific keys
    const appKeys = ['menopauseStage', 'menopauseSymptoms', 'menopauseChecklist', 'menopauseHormones'];
    appKeys.forEach(key => localStorage.removeItem(key));
    
    navigate('/login');
  }, [navigate]);

  // ─── ANIMATION ──────────────────────────────────────────────────────────
  const rootClassName = useMemo(() => 
    `js-root ${animOut ? 'js-root--fade-out' : ''}`.trim(),
    [animOut]
  );

  // ─── RENDER ─────────────────────────────────────────────────────────────
  return (
    <div className={rootClassName}>
      {/* Switch Confirmation Modal */}
      {confirmSwitch && (
        <SwitchConfirmationModal
          journey={confirmSwitch}
          currentJourney={currentJourney}
          onConfirm={handleSwitchConfirm}
          onCancel={handleSwitchCancel}
        />
      )}

      <div className="js-card">
        <div className="js-header">
          <div className="js-logo" aria-hidden="true">✦</div>
          <h1 className="js-welcome">
            Welcome back, <span>{displayName}</span>
          </h1>
          <p className="js-subtitle">Pick up where you left off, or explore something new.</p>
        </div>

        {/* Current Journey */}
        <div className="js-section">
          <CurrentJourneyCard
            journey={currentJourney}
            progress={progress}
            onResume={handleResume}
          />
        </div>

        <div className="js-divider" role="separator">
          <div className="js-divider-line" />
          <span className="js-divider-text">or choose a different journey</span>
          <div className="js-divider-line" />
        </div>

        {/* Other Journeys */}
        <div className="js-other-list" role="list">
          {otherJourneys.map(journey => (
            <div key={journey.id} role="listitem">
              <OtherJourneyCard
                journey={journey}
                onSelect={handleSwitchRequest}
              />
            </div>
          ))}
        </div>

        {/* Sign Out */}
        <button
          className="js-signout"
          onClick={handleSignOut}
          aria-label={`Sign out as ${displayName}`}
        >
          Not {displayName}? Sign out
        </button>
      </div>
    </div>
  );
}