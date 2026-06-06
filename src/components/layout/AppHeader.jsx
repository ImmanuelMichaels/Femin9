// src/components/layout/AppHeader.jsx
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/useApp';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationPanel from '../../pages/notifications/NotificationPanel';
import { auth } from '../../context/firebase';

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

function CrownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
    </svg>
  );
}

export default function AppHeader({ onNavigate, onUpgrade }) {
  const {
    userName,
    journeyType,
    subscriptionPlan,
    daysUntilRenewal,
    todaysTasks,
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Load profile image from Firebase Auth or localStorage
  useEffect(() => {
    const loadProfileImage = () => {
      const user = auth.currentUser;
      if (user?.photoURL) {
        setProfileImage(user.photoURL);
      } else {
        const saved = localStorage.getItem('profileImage');
        if (saved) setProfileImage(saved);
      }
    };
    loadProfileImage();
    
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user?.photoURL) {
        setProfileImage(user.photoURL);
      }
    });
    
    return () => unsubscribe();
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getInitials = () => {
    if (userName) return userName.charAt(0).toUpperCase();
    const user = auth.currentUser;
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    return 'M';
  };

  const greeting    = getGreeting();
  const displayName = userName || (journeyType === 'menopause' ? 'Queen' : 'Mama');
  const isPremium = subscriptionPlan === 'bloom' || subscriptionPlan === 'bloomPlus';

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

  const handleUpgradeClick = () => {
    if (onUpgrade) {
      onUpgrade();
    }
  };

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
        @keyframes shine {
          to { background-position: 200% center; }
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
          {/* Profile Picture - DYNAMIC with fallback */}
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
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 700,
                color: 'white',
              }}>
                {getInitials()}
              </div>
            )}
          </div>

          <div>
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
            
            {/* Subscription badge */}
            {!isPremium && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                marginTop: 2,
              }}>
                <span style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.7)',
                }}>Free Plan</span>
                <span style={{
                  fontSize: 8,
                  color: 'rgba(255,255,255,0.5)',
                }}>•</span>
                <button
                  onClick={handleUpgradeClick}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: 12,
                    padding: '2px 8px',
                    fontSize: 10,
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                >
                  Upgrade
                </button>
              </div>
            )}

            {isPremium && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                marginTop: 2,
              }}>
                <span style={{
                  fontSize: 10,
                  color: '#FFD700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}>
                  <CrownIcon />
                  {subscriptionPlan === 'bloom' ? 'Bloom' : 'Bloom+'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — upgrade button (if free) + bell + help */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          
          {/* Upgrade Button for free users (visible in header) */}
          {!isPremium && (
            <button
              onClick={handleUpgradeClick}
              style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                border: 'none',
                borderRadius: 30,
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 700,
                color: '#333',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
              }}
            >
              <CrownIcon />
              <span style={{ color: '#333' }}>Upgrade</span>
            </button>
          )}

          {/* Premium indicator for paid users */}
          {isPremium && subscriptionPlan === 'bloomPlus' && (
            <div style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              borderRadius: 30,
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <CrownIcon />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#333' }}>Premium</span>
            </div>
          )}

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