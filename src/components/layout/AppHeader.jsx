// src/components/layout/AppHeader.jsx
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationPanel from '../../pages/notifications/NotificationPanel';

function NotificationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export default function AppHeader({ onNavigate }) {           // ← removed onSOS, onMenuOpen
  const {
    userName,
    journeyType,
    daysUntilRenewal,                                         // ← removed getCurrentWeek, getTrimester, babyAgeDays
    todaysTasks,
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const greeting    = getGreeting();
  const displayName = userName || (journeyType === 'menopause' ? 'Queen' : 'Mama');

  const {
    notifications,
    unreadCount,
    panelOpen,
    togglePanel,
    closePanel,
    markAllRead,
    dismissNotification,
    handleNotificationClick,
  } = useNotifications({
    daysUntilRenewal,
    tasks: todaysTasks ?? [],
    onNavigate,
  });

  const bellRef = useRef(null);

  return (
    <div style={{
      background: '#d63a6e',
      padding: 'var(--sp-5) var(--pad-x) var(--sp-4)',
      position: 'relative',
      overflow: 'visible',
      flexShrink: 0,
    }}>
      <style>{`
        @keyframes badgePop {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
      }}>

        {/* LEFT — avatar + greeting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 10,
            width: 56,
            height: 56,
            overflow: 'hidden',
            flexShrink: 0,
            boxShadow: '0 0 0 1px rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img
              src="/profile.png"
              alt="Profile"
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <p style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: 20,
            color: 'white',
            margin: 0,
            fontWeight: 500,
            lineHeight: 1.3,
          }}>
            {greeting},&nbsp;<b>{displayName}</b>
          </p>
        </div>

        {/* RIGHT — bell + help */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>

          {/* Bell */}
          <div style={{ position: 'relative' }} ref={bellRef}>
            <button
              onClick={togglePanel}
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              style={{
                background: panelOpen ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s',
                position: 'relative',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
              onMouseLeave={e => e.currentTarget.style.background = panelOpen
                ? 'rgba(255,255,255,0.3)'
                : 'rgba(255,255,255,0.15)'}
            >
              <NotificationIcon />

              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  minWidth: 18,
                  height: 18,
                  background: '#ff4757',
                  borderRadius: 9,
                  fontSize: 10,
                  fontWeight: 800,
                  color: '#fff',
                  fontFamily: 'Poppins, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  border: '2px solid #d63a6e',
                  letterSpacing: '-0.5px',
                  animation: 'badgePop 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {panelOpen && (
              <NotificationPanel
                notifications={notifications}
                unreadCount={unreadCount}
                onClose={closePanel}
                onMarkAllRead={markAllRead}
                onNotificationClick={handleNotificationClick}
                onDismiss={dismissNotification}
              />
            )}
          </div>

          {/* Help */}
          <button
            onClick={() => {}}
            aria-label="Help"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <HelpIcon />
          </button>
        </div>
      </div>
    </div>
  );
}