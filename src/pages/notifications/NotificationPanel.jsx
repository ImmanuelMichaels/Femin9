// src/pages/notifications/NotificationPanel.jsx
import { useEffect, useRef } from 'react';
import { NOTIF_TYPES } from '../../hooks/useNotifications';

// ─── Icon map ────────────────────────────────────────────────────────────────

const ICON_MAP = {
  [NOTIF_TYPES.MISSED_TASK]:  { emoji: '⚠️', bg: '#fff0f0' },
  [NOTIF_TYPES.MOTIVATIONAL]: { emoji: '✨', bg: '#f0fff4' },
  [NOTIF_TYPES.RENEWAL]:      { emoji: '⏰', bg: '#fff8e1' },
  [NOTIF_TYPES.TIP]:          { emoji: '💡', bg: '#f0f4ff' },
  [NOTIF_TYPES.APPOINTMENT]:  { emoji: '📅', bg: '#f0f8ff' },
  [NOTIF_TYPES.HYDRATION]:    { emoji: '💧', bg: '#e8f4fd' },
  [NOTIF_TYPES.MEDICATION]:   { emoji: '💊', bg: '#f3f0ff' },
  [NOTIF_TYPES.KICK_COUNT]:   { emoji: '👶', bg: '#fff0f8' },
  [NOTIF_TYPES.SLEEP]:        { emoji: '🌙', bg: '#f0f0ff' },
  [NOTIF_TYPES.SYSTEM]:       { emoji: '🔔', bg: '#f5f0ff' },
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const S = {
  panel: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 8,
    width: 320,
    background: '#ffffff',
    borderRadius: 18,
    boxShadow: '0 12px 48px rgba(214,58,110,0.15), 0 2px 8px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    zIndex: 1000,
    animation: 'notifSlideIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px 12px',
    borderBottom: '1px solid #f5e6ec',
    background: 'linear-gradient(135deg, #fff5f8 0%, #ffffff 100%)',
  },
  headerTitle: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 14,
    fontWeight: 700,
    color: '#1a1a2e',
    letterSpacing: '-0.2px',
  },
  markAllBtn: {
    background: 'none',
    border: 'none',
    fontSize: 11,
    fontWeight: 700,
    color: '#d63a6e',
    cursor: 'pointer',
    fontFamily: 'Poppins, sans-serif',
    letterSpacing: '0.2px',
    textTransform: 'uppercase',
    padding: '4px 8px',
    borderRadius: 6,
    transition: 'background 0.15s',
  },
  list: {
    maxHeight: 340,
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: '#f5c6d8 transparent',
  },
  item: (unread) => ({
    display: 'flex',
    gap: 10,
    padding: '12px 14px',
    borderBottom: '1px solid #fafafa',
    cursor: 'pointer',
    transition: 'background 0.15s',
    background: unread ? '#fff5f8' : '#ffffff',
    position: 'relative',
  }),
  iconBox: (bg) => ({
    width: 40,
    height: 40,
    borderRadius: 12,
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    flexShrink: 0,
  }),
  body: { flex: 1, minWidth: 0 },
  title: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 11,
    fontWeight: 700,
    color: '#d63a6e',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    marginBottom: 2,
  },
  message: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 12,
    color: '#333',
    lineHeight: 1.45,
    fontWeight: 400,
  },
  time: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 10,
    color: '#bbb',
    marginTop: 4,
  },
  actionBtn: {
    display: 'inline-block',
    marginTop: 6,
    fontSize: 11,
    fontWeight: 700,
    color: '#d63a6e',
    background: 'rgba(214,58,110,0.08)',
    border: 'none',
    borderRadius: 6,
    padding: '3px 8px',
    cursor: 'pointer',
    fontFamily: 'Poppins, sans-serif',
    transition: 'background 0.15s',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#d63a6e',
    flexShrink: 0,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  dismissBtn: {
    background: 'none',
    border: 'none',
    fontSize: 15,
    cursor: 'pointer',
    color: '#ccc',
    lineHeight: 1,
    padding: '0 2px',
    flexShrink: 0,
    alignSelf: 'flex-start',
    marginTop: 4,
    transition: 'color 0.15s',
  },
  empty: {
    padding: '28px 16px',
    textAlign: 'center',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 13,
    color: '#aaa',
  },
  emptyEmoji: { fontSize: 32, display: 'block', marginBottom: 8 },
  // Loading skeleton
  skeleton: {
    padding: '12px 14px',
    borderBottom: '1px solid #fafafa',
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
  },
  skeletonIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: 'linear-gradient(90deg, #f5f5f5 25%, #ebebeb 50%, #f5f5f5 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    flexShrink: 0,
  },
  skeletonBody: { flex: 1 },
  skeletonLine: (w) => ({
    height: 10,
    borderRadius: 5,
    background: 'linear-gradient(90deg, #f5f5f5 25%, #ebebeb 50%, #f5f5f5 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    width: w,
    marginBottom: 6,
  }),
};

// ─── Skeleton placeholder ─────────────────────────────────────────────────────

function SkeletonItem() {
  return (
    <div style={S.skeleton}>
      <div style={S.skeletonIcon} />
      <div style={S.skeletonBody}>
        <div style={S.skeletonLine('60%')} />
        <div style={S.skeletonLine('90%')} />
        <div style={S.skeletonLine('40%')} />
      </div>
    </div>
  );
}

// ─── NotificationItem ─────────────────────────────────────────────────────────

function NotificationItem({ notif, onClick, onDismiss }) {
  const { emoji, bg } = ICON_MAP[notif.type] || { emoji: '🔔', bg: '#f0f0f0' };

  return (
    <div
      style={S.item(!notif.read)}
      onClick={() => onClick(notif)}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#fff0f5'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = notif.read ? '#ffffff' : '#fff5f8'; }}
    >
      <div style={S.iconBox(bg)}>{emoji}</div>

      <div style={S.body}>
        <div style={S.title}>{notif.title}</div>
        <div style={S.message}>{notif.message}</div>
        {notif.action && (
          <button
            style={S.actionBtn}
            onClick={(e) => { e.stopPropagation(); onClick(notif); }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(214,58,110,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(214,58,110,0.08)'; }}
          >
            {notif.action.label} →
          </button>
        )}
        <div style={S.time}>{notif.time}</div>
      </div>

      {!notif.read && <div style={S.unreadDot} />}

      <button
        style={S.dismissBtn}
        title="Dismiss"
        onClick={(e) => { e.stopPropagation(); onDismiss(notif.id); }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#d63a6e'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#ccc'; }}
      >
        ×
      </button>
    </div>
  );
}

// ─── NotificationPanel ────────────────────────────────────────────────────────

export default function NotificationPanel({
  notifications,
  unreadCount,
  loading = false,
  onClose,
  onMarkAllRead,
  onNotificationClick,
  onDismiss,
}) {
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    }
    const t = setTimeout(() => document.addEventListener('mousedown', handleClick), 10);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handleClick); };
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <>
      <style>{`
        @keyframes notifSlideIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to   { background-position: -200% 0; }
        }
      `}</style>

      <div ref={panelRef} style={S.panel} role="dialog" aria-label="Notifications">
        {/* Header */}
        <div style={S.header}>
          <span style={S.headerTitle}>
            🔔 Notifications {unreadCount > 0 && `(${unreadCount})`}
          </span>
          {unreadCount > 0 && (
            <button
              style={S.markAllBtn}
              onClick={onMarkAllRead}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(214,58,110,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
            >
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div style={S.list}>
          {loading ? (
            // Show skeletons while Firestore loads
            <>
              <SkeletonItem />
              <SkeletonItem />
              <SkeletonItem />
            </>
          ) : notifications.length === 0 ? (
            <div style={S.empty}>
              <span style={S.emptyEmoji}>🌸</span>
              You're all caught up!
            </div>
          ) : (
            notifications.map((notif) => (
              <NotificationItem
                key={notif.id}
                notif={notif}
                onClick={onNotificationClick}
                onDismiss={onDismiss}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}