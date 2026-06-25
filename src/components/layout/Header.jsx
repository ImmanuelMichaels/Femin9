import { useState, useEffect } from "react";
import { useApp } from "../../context/useApp";
import { auth } from "../../context/firebase";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationPanel from "../../pages/notifications/NotificationPanel";

export default function AppHeader({ onNavigate }) {
  const {
    userName,
    journeyType,
    getCurrentWeek,
    getTrimester,
    babyAgeDays,
    daysUntilRenewal,
    tasks,
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [photoURL, setPhotoURL]       = useState(null);
  const [displayName, setDisplayName] = useState('');

  // ── Realtime clock ──────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // ── Pull photo + name directly from Firebase Auth (covers Google OAuth) ────
  useEffect(() => {
    const syncFromAuth = () => {
      const user = auth.currentUser;
      if (!user) return;
      setPhotoURL(user.photoURL || null);
      setDisplayName(userName || user.displayName || '');
    };
    syncFromAuth();
    const unsub = auth.onAuthStateChanged(syncFromAuth);
    return () => unsub();
  }, [userName]);

  // ── Notifications ───────────────────────────────────────────────────────────
  const {
    notifications,
    unreadCount,
    loading,
    panelOpen,
    togglePanel,
    closePanel,
    markAllRead,
    dismissNotification,
    handleNotificationClick,
  } = useNotifications({
    daysUntilRenewal: daysUntilRenewal ?? null,
    tasks:            tasks            ?? [],
    journeyType:      journeyType      ?? '',
    onNavigate,
  });

  // ── Greeting ────────────────────────────────────────────────────────────────
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // ── Journey badge ───────────────────────────────────────────────────────────
  const getJourneyBadge = () => {
    switch (journeyType) {
      case 'pregnant': {
        const week      = getCurrentWeek?.();
        const trimester = getTrimester?.();
        if (week && trimester) {
          const suffix = trimester === 1 ? 'st' : trimester === 2 ? 'nd' : 'rd';
          return { icon: '🌸', label: `Week ${week} · ${trimester}${suffix} Trimester` };
        }
        return { icon: '🌸', label: 'Pregnancy Journey' };
      }
      case 'conceive':
        return { icon: '🌿', label: 'Trying to Conceive' };
      case 'ivf':
        return { icon: '✨', label: 'IVF & Fertility' };
      case 'mom': {
        const days  = babyAgeDays ?? 0;
        const weeks = Math.floor(days / 7);
        return { icon: '💛', label: weeks > 0 ? `Week ${weeks} Postpartum` : 'Postpartum & Nursing' };
      }
      case 'menstrual':
        return { icon: '🔵', label: 'Menstrual Health' };
      case 'menopause':
        return { icon: '💜', label: 'Menopause Support' };
      default:
        return null;
    }
  };

  const greeting = getGreeting();
  const badge    = getJourneyBadge();
  const initial  = displayName?.charAt(0)?.toUpperCase() || '?';

  return (
    <div style={{
      background: "#fff",
      borderBottom: "1px solid var(--border, #EDE9F7)",
      padding: "var(--sp-4) var(--pad-x, 20px) var(--sp-3)",
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>

        {/* ── Avatar ── */}
        <div style={{
          width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
          background: photoURL ? "transparent" : "var(--pll, #EDE9F7)",
          border: "2.5px solid var(--pl, #724C9D)",
          overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, fontWeight: 700, color: "var(--pl, #724C9D)",
        }}>
          {photoURL
            ? <img src={photoURL} alt={displayName} referrerPolicy="no-referrer"
                   style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : initial
          }
        </div>

        {/* ── Name + journey ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: "var(--fs-xs, 11px)",
            color: "var(--mt, #9B8FAD)",
            marginBottom: 1,
            fontWeight: 500,
          }}>
            {greeting}
          </p>
          <p style={{
            fontSize: "var(--fs-lg, 18px)",
            fontWeight: 800,
            color: "var(--dp, #2D1B4E)",
            lineHeight: 1.2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {displayName}
          </p>
          {badge && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              marginTop: 4,
              background: "var(--pll, #EDE9F7)",
              color: "var(--pl, #724C9D)",
              fontSize: "var(--fs-xs, 11px)",
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 20,
            }}>
              {badge.icon} {badge.label}
            </span>
          )}
        </div>

        {/* ── Notification Bell ── */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={togglePanel}
            aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}
            aria-expanded={panelOpen}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: panelOpen ? "var(--pl, #724C9D)" : "var(--pll, #EDE9F7)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.18s",
              position: "relative",
            }}
          >
            {/* Bell SVG — colour flips with panel state */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={panelOpen ? "#fff" : "var(--pl, #724C9D)"}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>

            {/* Unread badge — only shown when there are unread notifications */}
            {unreadCount > 0 && (
              <span style={{
                position: "absolute",
                top: 4,
                right: 4,
                minWidth: 16,
                height: 16,
                borderRadius: 8,
                background: "#d63a6e",
                border: "2px solid #fff",
                color: "#fff",
                fontSize: 9,
                fontWeight: 800,
                fontFamily: "Poppins, sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
                padding: "0 3px",
                pointerEvents: "none",
              }}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* ── Notification Panel ── */}
          {panelOpen && (
            <NotificationPanel
              notifications={notifications}
              unreadCount={unreadCount}
              loading={loading}
              onClose={closePanel}
              onMarkAllRead={markAllRead}
              onNotificationClick={handleNotificationClick}
              onDismiss={dismissNotification}
            />
          )}
        </div>

      </div>
    </div>
  );
}