import { useState, useEffect, useCallback } from 'react';

// Notification types
export const NOTIF_TYPES = {
  MISSED_TASK:   'missed_task',
  MOTIVATIONAL:  'motivational',
  RENEWAL:       'renewal',
  TIP:           'tip',
};

// One motivational quote per day (rotates by day-of-year)
const MOTIVATIONAL_QUOTES = [
  "Every kick is a little love note from your baby. You're doing amazing! 🌸",
  "Growing a human is hard work — be proud of yourself every single day. 💪",
  "Your body knows exactly what it's doing. Trust it, nourish it, celebrate it. ✨",
  "Rest is not laziness — it's how you and your baby recharge together. 🌙",
  "You are stronger than you know, and braver than you feel. Keep going, Mama! 🦋",
  "Small steps every day. That's all it takes. You've got this. 💕",
  "The love you already have for your baby is your superpower. 🌟",
];

// Generate stable daily motivational notification
function getDailyMotivational() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / 86400000
  );
  const quote = MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
  return {
    id: `motivational-${today.toDateString()}`,
    type: NOTIF_TYPES.MOTIVATIONAL,
    title: 'Daily Boost 🌸',
    message: `"${quote}"`,
    time: 'Today · 8:00 AM',
    read: false,
  };
}

// Check if subscription renewal notification should show
// Pass in daysUntilRenewal from your billing context
function getRenewalNotification(daysUntilRenewal) {
  if (daysUntilRenewal === null || daysUntilRenewal === undefined) return null;
  if (daysUntilRenewal > 2) return null;

  const urgency = daysUntilRenewal <= 0
    ? 'Your subscription has expired.'
    : daysUntilRenewal === 1
      ? 'Your plan expires tomorrow!'
      : 'Your plan expires in 2 days.';

  return {
    id: `renewal-${new Date().toDateString()}`,
    type: NOTIF_TYPES.RENEWAL,
    title: 'Subscription Ending Soon ⏰',
    message: `${urgency} Renew now to keep your journey uninterrupted.`,
    time: 'Today',
    read: false,
    action: { label: 'Renew Now', route: '/subscription' },
  };
}

// Derive missed-task notifications from your tasks array
// tasks: [{ id, label, completed, dueToday }]
function getMissedTaskNotifications(tasks = []) {
  const missed = tasks.filter((t) => t.dueToday && !t.completed);
  return missed.map((task) => ({
    id: `missed-${task.id}`,
    type: NOTIF_TYPES.MISSED_TASK,
    title: 'Missed Task ⚠️',
    message: `You haven't completed "${task.label}" today. Don't forget, Mama!`,
    time: 'Today',
    read: false,
    action: task.route ? { label: 'Log Now', route: task.route } : null,
  }));
}

/**
 * useNotifications hook
 *
 * @param {object} opts
 * @param {number|null} opts.daysUntilRenewal  – days left on subscription
 * @param {array}       opts.tasks             – today's task objects
 * @param {function}    opts.onNavigate        – router push fn (route) => void
 */
export function useNotifications({ daysUntilRenewal = null, tasks = [], onNavigate } = {}) {
  const STORAGE_KEY = 'femin9_notifications';

  // Load persisted read-state
  const [readIds, setReadIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
    } catch {
      return new Set();
    }
  });

  const [panelOpen, setPanelOpen] = useState(false);

  // Build notification list from live data
  const buildNotifications = useCallback(() => {
    const list = [];

    // 1. Missed tasks (highest priority)
    list.push(...getMissedTaskNotifications(tasks));

    // 2. Renewal warning
    const renewal = getRenewalNotification(daysUntilRenewal);
    if (renewal) list.push(renewal);

    // 3. Daily motivational (once per day)
    list.push(getDailyMotivational());

    // Merge read state
    return list.map((n) => ({ ...n, read: readIds.has(n.id) }));
  }, [tasks, daysUntilRenewal, readIds]);

  const notifications = buildNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Persist read IDs
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...readIds]));
  }, [readIds]);

  const markRead = useCallback((id) => {
    setReadIds((prev) => new Set([...prev, id]));
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  }, [notifications]);

  const dismissNotification = useCallback((id) => {
    markRead(id);
  }, [markRead]);

  const handleNotificationClick = useCallback((notif) => {
    markRead(notif.id);
    if (notif.action?.route && onNavigate) {
      onNavigate(notif.action.route);
      setPanelOpen(false);
    }
  }, [markRead, onNavigate]);

  const togglePanel = useCallback(() => setPanelOpen((v) => !v), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  return {
    notifications,
    unreadCount,
    panelOpen,
    togglePanel,
    closePanel,
    markRead,
    markAllRead,
    dismissNotification,
    handleNotificationClick,
  };
}