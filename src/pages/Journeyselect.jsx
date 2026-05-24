import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './JourneySelect.css';

// ─── Journey definitions ──────────────────────────────────────────────────────
const JOURNEYS = [
  {
    id: 'pregnancy',
    label: 'Pregnancy',
    emoji: '🤰',
    tagline: 'Week by week, bump by bump',
    color: '#d63a6e',
    light: '#fff0f5',
  },
  {
    id: 'postpartum',
    label: 'Postpartum',
    emoji: '👶',
    tagline: 'Recovery, bonding & newborn care',
    color: '#e07b9a',
    light: '#fdf0f5',
  },
  {
    id: 'trying',
    label: 'Trying to Conceive',
    emoji: '🌱',
    tagline: 'Fertility tracking & cycle support',
    color: '#b05fa0',
    light: '#f9f0fb',
  },
  {
    id: 'menopause',
    label: 'Menopause',
    emoji: '🌸',
    tagline: 'Thriving through every transition',
    color: '#c46090',
    light: '#fdf2f7',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function CurrentJourneyCard({ journey, progress, onResume }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="js-resume-card"
      style={{ borderColor: journey.color }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* "Current" pill */}
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

          {/* Progress bar */}
          {progress && (
            <div className="js-progress-wrap">
              <div className="js-progress-bar">
                <div
                  className="js-progress-fill"
                  style={{
                    width: `${progress.percent}%`,
                    background: journey.color,
                  }}
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
      >
        Resume Journey →
      </button>
    </div>
  );
}

function OtherJourneyCard({ journey, onSelect }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="js-other-card"
      style={{
        background: hovered ? journey.light : 'white',
        borderColor: hovered ? journey.color : '#f0e0ea',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function JourneySelect() {
  const navigate = useNavigate();
  const { journeyType, setJourneyType, userName, getCurrentWeek } = useApp();

  const [animOut, setAnimOut] = useState(false);
  const [confirmSwitch, setConfirmSwitch] = useState(null); // journey to switch to

  const displayName = userName || 'Mama';

  // Current journey object
  const currentJourney = JOURNEYS.find((j) => j.id === journeyType) || JOURNEYS[0];

  // Other journeys (all except current)
  const otherJourneys = JOURNEYS.filter((j) => j.id !== currentJourney.id);

  // Build progress info for pregnancy; adapt for other types as needed
  const getProgress = () => {
    if (journeyType === 'pregnancy') {
      const week = getCurrentWeek?.() ?? 1;
      const pct = Math.min(Math.round((week / 40) * 100), 100);
      return { percent: pct, label: `Week ${week} of 40` };
    }
    if (journeyType === 'postpartum') {
      const days = 21; // example — pull from context if available
      const pct = Math.min(Math.round((days / 84) * 100), 100);
      return { percent: pct, label: `Day ${days} postpartum` };
    }
    return null;
  };

  const goToApp = (newJourney = null) => {
    if (newJourney) {
      setJourneyType(newJourney);
      localStorage.setItem('userJourney', newJourney);
    }
    setAnimOut(true);
    setTimeout(() => navigate('/app'), 380);
  };

  const handleResume = () => goToApp();

  const handleSwitchRequest = (journey) => {
    setConfirmSwitch(journey);
  };

  const handleSwitchConfirm = () => {
    goToApp(confirmSwitch.id);
  };

  return (
    <div
      className="js-root"
      style={{
        opacity: animOut ? 0 : 1,
        transform: animOut ? 'translateY(16px)' : 'translateY(0)',
        transition: 'opacity 0.38s ease, transform 0.38s ease',
      }}
    >
      {/* Confirm switch modal */}
      {confirmSwitch && (
        <div className="js-modal-overlay" onClick={() => setConfirmSwitch(null)}>
          <div className="js-modal" onClick={(e) => e.stopPropagation()}>
            <div className="js-modal-emoji">{confirmSwitch.emoji}</div>
            <h3 className="js-modal-title">Switch to {confirmSwitch.label}?</h3>
            <p className="js-modal-body">
              Your current {currentJourney.label} progress will be saved.
              You can always switch back any time.
            </p>
            <div className="js-modal-actions">
              <button
                className="js-modal-cancel"
                onClick={() => setConfirmSwitch(null)}
              >
                Cancel
              </button>
              <button
                className="js-modal-confirm"
                style={{ background: confirmSwitch.color }}
                onClick={handleSwitchConfirm}
              >
                Yes, switch →
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="js-card">
        {/* Header */}
        <div className="js-header">
          <div className="js-logo">✦</div>
          <h1 className="js-welcome">Welcome back, <span>{displayName}</span></h1>
          <p className="js-subtitle">Pick up where you left off, or start something new.</p>
        </div>

        {/* Resume current */}
        <div className="js-section">
          <CurrentJourneyCard
            journey={currentJourney}
            progress={getProgress()}
            onResume={handleResume}
          />
        </div>

        {/* Divider */}
        <div className="js-divider">
          <div className="js-divider-line" />
          <span className="js-divider-text">or choose a different journey</span>
          <div className="js-divider-line" />
        </div>

        {/* Other journeys */}
        <div className="js-other-list">
          {otherJourneys.map((j) => (
            <OtherJourneyCard
              key={j.id}
              journey={j}
              onSelect={() => handleSwitchRequest(j)}
            />
          ))}
        </div>

        {/* Sign out link */}
        <button
          className="js-signout"
          onClick={() => {
            localStorage.removeItem('userAuth');
            navigate('/login');
          }}
        >
          Not {displayName}? Sign out
        </button>
      </div>
    </div>
  );
}