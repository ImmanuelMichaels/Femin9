// src/hooks/useNotifications.js
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, doc, serverTimestamp, writeBatch, getDocs,
} from 'firebase/firestore';
import { db, auth } from '../context/firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export const NOTIF_TYPES = {
  MISSED_TASK:   'missed_task',
  MOTIVATIONAL:  'motivational',
  RENEWAL:       'renewal',
  TIP:           'tip',
  APPOINTMENT:   'appointment',
  HYDRATION:     'hydration',
  MEDICATION:    'medication',
  KICK_COUNT:    'kick_count',
  SLEEP:         'sleep',
  SYSTEM:        'system',
};

// ─── Journey types ────────────────────────────────────────────────────────────
// Used to gate reminders that are only relevant to certain journeys.
// Omitting `journeys` means the reminder fires for ALL journeys.

const ALL_JOURNEYS     = null; // fires for every journey
const PREGNANT_ONLY    = ['pregnant'];
const PRENATAL_JOURNEYS = ['pregnant', 'ivf', 'ttc']; // actively trying / expecting

// ─── Reminder schedules ───────────────────────────────────────────────────────

const TIMED_REMINDERS = [
  // Hydration — every 2 hours 8 AM–8 PM
  // Relevant to all journeys (menopause, menstrual, postpartum all benefit from hydration)
  ...[8, 10, 12, 14, 16, 18, 20].map((h) => ({
    id:      `hydration-${h}`,
    type:    NOTIF_TYPES.HYDRATION,
    title:   'Time to Hydrate 💧',
    message: h < 12
      ? 'Start your morning right — drink a glass of water now!'
      : h < 17
        ? 'Afternoon check-in: have you had enough water today?'
        : 'Evening hydration reminder — keep sipping!',
    hour: h,
    journeys: ALL_JOURNEYS,
  })),

  // Medication / vitamins — 8 AM and 8 PM
  // Prenatal vitamins only make sense for pregnancy-adjacent journeys.
  // For menopause/menstrual, this is handled via pushNotification from the app
  // when the user actually sets up medications.
  { id: 'medication-8',  type: NOTIF_TYPES.MEDICATION,
    title: 'Morning Vitamins 💊',
    message: 'Time to take your prenatal vitamins and any prescribed medication.',
    hour: 8,
    journeys: PRENATAL_JOURNEYS,
  },
  { id: 'medication-20', type: NOTIF_TYPES.MEDICATION,
    title: 'Evening Medication 💊',
    message: "Don't forget your evening medication or supplements!",
    hour: 20,
    journeys: PRENATAL_JOURNEYS,
  },

  // Kick count — pregnant only
  { id: 'kicks-9',  type: NOTIF_TYPES.KICK_COUNT,
    title: 'Kick Count Time 👶',
    message: "Log your baby's morning movements — 10 kicks in 2 hours is a good sign.",
    hour: 9, journeys: PREGNANT_ONLY,
  },
  { id: 'kicks-13', type: NOTIF_TYPES.KICK_COUNT,
    title: 'Kick Count Check 👶',
    message: "Afternoon kick count — find a quiet moment and feel for baby's movements.",
    hour: 13, journeys: PREGNANT_ONLY,
  },
  { id: 'kicks-18', type: NOTIF_TYPES.KICK_COUNT,
    title: 'Evening Kick Count 👶',
    message: "Evening movement check — log your baby's kicks before dinner.",
    hour: 18, journeys: PREGNANT_ONLY,
  },

  // Sleep wind-down — all journeys (good sleep hygiene applies universally)
  { id: 'sleep-21', type: NOTIF_TYPES.SLEEP,
    title: 'Wind Down Time 🌙',
    message: "It's 9 PM — start winding down for a good night's rest. You deserve it!",
    hour: 21,
    journeys: ALL_JOURNEYS,
  },
];

// ─── Appointment reminder windows (hours before) ──────────────────────────────
const APPOINTMENT_REMINDER_HOURS = [48, 24, 2];

// ─── Journey-aware motivational quotes ───────────────────────────────────────
// Seeded once per day to Firestore so they're real notifications, not mock data.

const MOTIVATIONAL_BY_JOURNEY = {
  pregnant: [
    "Every kick is a little love note from your baby. You're doing amazing! 🌸",
    "Growing a human is hard work — be proud of yourself every single day. 💪",
    "Your body knows exactly what it's doing. Trust it, nourish it, celebrate it. ✨",
    "Rest is not laziness — it's how you and your baby recharge together. 🌙",
    "The love you already have for your baby is your superpower. 🌟",
    "Nourish your body, trust your instincts, and breathe. You've got this, Mama! 🍃",
  ],
  ttc: [
    "Every cycle is a new beginning. Keep going — your time is coming. 🌱",
    "The strength it takes to keep hoping is extraordinary. We see you. 💕",
    "Small steps every day. Tracking, resting, hoping — it all counts. 🌟",
    "Your journey is uniquely yours. Trust the process and be kind to yourself. 🌺",
    "You are not alone on this path. We're right here with you. 🤝",
    "Progress, not perfection. Every day is a new beginning. ✨",
  ],
  ivf: [
    "What you're going through takes immense courage. You are so strong. 💫",
    "Every injection, every appointment — each one is an act of love. 🌸",
    "Rest, recover, and be gentle with yourself today. 🍃",
    "You are doing everything you can. That is enough. 💕",
    "Your resilience is remarkable. Keep going. 🌟",
    "The strength of hope is the most powerful thing in this world. ✨",
  ],
  mom: [
    "You are doing a brilliant job — even on the hard days. 🌸",
    "Rest when you can. You can't pour from an empty cup. 🍵",
    "Every small healthy choice is an act of love — for you and your baby. 💕",
    "The love you give every single day is extraordinary. 🌟",
    "Being a mum is the hardest and most meaningful work there is. You've got this. 💪",
    "It's okay to not be okay sometimes. You're still an amazing mum. 🌺",
  ],
  menopause: [
    "This transition is a chapter, not an ending. You are still becoming. 🌸",
    "Your body is changing, and that's okay — be patient and kind with yourself. 💕",
    "Prioritising your wellbeing right now is one of the wisest things you can do. ✨",
    "You've navigated so much already. This is just another chapter of your strength. 💫",
    "Every day of self-care is an investment in the next season of your life. 🌺",
    "Rest, move, nourish. Small acts of care compound into big changes. 🍃",
  ],
  menstrual: [
    "Your cycle is information — listening to your body is an act of self-respect. 🌸",
    "Be as gentle with yourself today as you would be with someone you love. 💕",
    "Tracking your cycle is one of the most powerful things you can do for your health. ✨",
    "Rest on the days that ask for it. Energy will return. 🌙",
    "You know your body better than anyone. Trust those instincts. 💫",
    "Every phase of your cycle has its own wisdom. Honour all of them. 🌺",
  ],
};

// Fallback for any journey type not explicitly mapped
const MOTIVATIONAL_FALLBACK = [
  "Every step forward matters, no matter how small. You're doing great. 🌸",
  "Be kind to yourself today — you deserve it. 💕",
  "Your health journey is unique and worth honouring. ✨",
  "Small consistent actions lead to big changes. Keep going. 💪",
  "You are stronger than you know. 🌟",
];

function getJourneyMotivational(journeyType) {
  return MOTIVATIONAL_BY_JOURNEY[journeyType] ?? MOTIVATIONAL_FALLBACK;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(ts) {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const now  = new Date();
  const diff = now - date;
  if (diff < 60_000)         return 'Just now';
  if (diff < 3_600_000)      return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000)     return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatApptTime(ts) {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

function hoursUntil(ts) {
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return (date - Date.now()) / 3_600_000;
}

// ─── Browser Push API ─────────────────────────────────────────────────────────

async function requestPushPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied')  return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

function sendBrowserNotification(title, body, icon = '/icon-192.png') {
  if (Notification.permission !== 'granted') return;
  try { new Notification(title, { body, icon, badge: '/icon-192.png' }); }
  catch { /* Firefox private mode may throw */ }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useNotifications
 *
 * All notifications originate from Firestore — no hardcoded mock data is merged
 * client-side. Motivational quotes are seeded to Firestore once per day, scoped
 * to the user's current journeyType, so they appear, persist, and dismiss like
 * any other notification.
 *
 * Firestore path:   notifications/{userId}/items/{notifId}
 * Appointments:     appointments/{userId}/items/{apptId}
 *   Expected appt fields: { type, title, dateTime (Timestamp), location? }
 *
 * @param {object}      opts
 * @param {number|null} opts.daysUntilRenewal
 * @param {array}       opts.tasks        [{ id, label, completed, dueToday, route? }]
 * @param {string}      opts.journeyType  pregnant | mom | ttc | ivf | menstrual | menopause
 * @param {function}    opts.onNavigate   (route) => void
 */
export function useNotifications({
  daysUntilRenewal = null,
  tasks            = [],
  journeyType      = '',
  onNavigate,
} = {}) {

  const [firestoreNotifs, setFirestoreNotifs] = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [panelOpen, setPanelOpen]             = useState(false);
  const [pushGranted, setPushGranted]         = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );

  const seededRef  = useRef(new Set());
  const timerRefs  = useRef([]);

  const userId = auth.currentUser?.uid;

  // ── Request push permission once ─────────────────────────────────────────
  useEffect(() => {
    requestPushPermission().then(setPushGranted);
  }, []);

  // ── 1. Realtime Firestore listener ────────────────────────────────────────
  useEffect(() => {
    if (!userId) { setFirestoreNotifs([]); setLoading(false); return; }

    const q = query(
      collection(db, 'notifications', userId, 'items'),
      where('dismissed', '!=', true),
      orderBy('dismissed'),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(q,
      (snap) => {
        setFirestoreNotifs(snap.docs.map((d) => ({
          id:     d.id,
          ...d.data(),
          time:   formatTimestamp(d.data().createdAt),
          source: 'firestore',
        })));
        setLoading(false);
      },
      (err) => { console.error('[useNotifications]', err); setLoading(false); }
    );

    return () => unsubscribe();
  }, [userId]);

  // ── 2. Appointment reminders ──────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    const apptQuery = query(
      collection(db, 'appointments', userId, 'items'),
      where('dateTime', '>', new Date()),
      orderBy('dateTime', 'asc'),
    );

    const unsubscribe = onSnapshot(apptQuery, async (snap) => {
      const today  = new Date().toDateString();
      const colRef = collection(db, 'notifications', userId, 'items');

      for (const apptDoc of snap.docs) {
        const appt  = apptDoc.data();
        const hours = hoursUntil(appt.dateTime);

        for (const window of APPOINTMENT_REMINDER_HOURS) {
          if (hours > window + 1 || hours < window - 1) continue;

          const seedKey = `appt-${apptDoc.id}-${window}h`;
          if (seededRef.current.has(seedKey)) continue;

          const existing = await getDocs(query(colRef,
            where('type',    '==', NOTIF_TYPES.APPOINTMENT),
            where('apptId',  '==', apptDoc.id),
            where('windowH', '==', window),
          ));

          if (existing.empty) {
            const apptLabel = appt.title || appt.type || 'Appointment';
            const timeLabel = formatApptTime(appt.dateTime);
            const urgency   = window >= 48 ? 'in 2 days'
                            : window >= 24 ? 'tomorrow'
                            :                'in 2 hours';

            const notifData = {
              type:      NOTIF_TYPES.APPOINTMENT,
              title:     `${apptLabel} ${urgency} 📅`,
              message:   `Your ${apptLabel.toLowerCase()} is ${urgency}${appt.location ? ` at ${appt.location}` : ''} — ${timeLabel}.`,
              read:      false,
              apptId:    apptDoc.id,
              windowH:   window,
              dateKey:   today,
              createdAt: serverTimestamp(),
              action:    { label: 'View Appointment', route: '/appointments' },
            };

            await addDoc(colRef, notifData).catch(console.error);
            sendBrowserNotification(notifData.title, notifData.message);
          }
          seededRef.current.add(seedKey);
        }
      }
    });

    return () => unsubscribe();
  }, [userId]);

  // ── 3. Timed in-app reminders (hydration, medication, kicks, sleep) ───────
  useEffect(() => {
    if (!userId) return;

    timerRefs.current.forEach(clearInterval);
    timerRefs.current = [];

    async function checkTimedReminders() {
      const now    = new Date();
      const hour   = now.getHours();
      const minute = now.getMinutes();
      const today  = now.toDateString();
      const colRef = collection(db, 'notifications', userId, 'items');

      // Fire at the top of the hour (minute 0–5 to catch app open at that time)
      if (minute > 5) return;

      for (const reminder of TIMED_REMINDERS) {
        if (reminder.hour !== hour) continue;

        // Journey gate: null = all journeys, otherwise must match
        if (reminder.journeys !== null && !reminder.journeys.includes(journeyType)) continue;

        const seedKey = `${reminder.id}-${today}`;
        if (seededRef.current.has(seedKey)) continue;

        const existing = await getDocs(query(colRef,
          where('reminderId', '==', reminder.id),
          where('dateKey',    '==', today),
        ));

        if (existing.empty) {
          await addDoc(colRef, {
            type:       reminder.type,
            title:      reminder.title,
            message:    reminder.message,
            read:       false,
            reminderId: reminder.id,
            dateKey:    today,
            createdAt:  serverTimestamp(),
            action: reminder.type === NOTIF_TYPES.KICK_COUNT
              ? { label: 'Log Kicks',      route: '/kicks'     }
              : reminder.type === NOTIF_TYPES.MEDICATION
                ? { label: 'Mark as Taken', route: '/nutrition' }
                : null,
          }).catch(console.error);

          sendBrowserNotification(reminder.title, reminder.message);
        }
        seededRef.current.add(seedKey);
      }
    }

    checkTimedReminders().catch(console.error);

    const interval = setInterval(() => checkTimedReminders().catch(console.error), 60_000);
    timerRefs.current.push(interval);

    return () => {
      timerRefs.current.forEach(clearInterval);
      timerRefs.current = [];
    };
  }, [userId, journeyType]);

  // ── 4. Renewal + missed task + daily motivational seeds ───────────────────
  useEffect(() => {
    if (!userId || loading) return;

    async function seedSystemNotifications() {
      const today  = new Date().toDateString();
      const colRef = collection(db, 'notifications', userId, 'items');

      // ── Renewal ──────────────────────────────────────────────────────────
      if (daysUntilRenewal !== null && daysUntilRenewal <= 2) {
        const seedKey = `renewal-${today}`;
        if (!seededRef.current.has(seedKey)) {
          const existing = await getDocs(query(colRef,
            where('type',    '==', NOTIF_TYPES.RENEWAL),
            where('dateKey', '==', today),
          ));
          if (existing.empty) {
            const urgency = daysUntilRenewal <= 0  ? 'Your subscription has expired.'
                          : daysUntilRenewal === 1 ? 'Your plan expires tomorrow!'
                          :                          'Your plan expires in 2 days.';
            await addDoc(colRef, {
              type:      NOTIF_TYPES.RENEWAL,
              title:     'Subscription Ending Soon ⏰',
              message:   `${urgency} Renew now to keep your journey uninterrupted.`,
              read:      false, dateKey: today, createdAt: serverTimestamp(),
              action:    { label: 'Renew Now', route: '/subscription' },
            }).catch(console.error);
          }
          seededRef.current.add(seedKey);
        }
      }

      // ── Missed tasks ─────────────────────────────────────────────────────
      for (const task of tasks.filter((t) => t.dueToday && !t.completed)) {
        const seedKey = `missed-${task.id}-${today}`;
        if (seededRef.current.has(seedKey)) continue;
        const existing = await getDocs(query(colRef,
          where('type',    '==', NOTIF_TYPES.MISSED_TASK),
          where('taskId',  '==', task.id),
          where('dateKey', '==', today),
        ));
        if (existing.empty) {
          await addDoc(colRef, {
            type:      NOTIF_TYPES.MISSED_TASK,
            title:     'Missed Task ⚠️',
            message:   `You haven't completed "${task.label}" today.`,
            read:      false, taskId: task.id, dateKey: today, createdAt: serverTimestamp(),
            action:    task.route ? { label: 'Log Now', route: task.route } : null,
          }).catch(console.error);
        }
        seededRef.current.add(seedKey);
      }

      // ── Daily motivational (seeded to Firestore, journey-scoped) ─────────
      // Seeded once at 8 AM or on first app open of the day.
      // Uses journeyType so menopause users get menopause-relevant encouragement,
      // not pregnancy quotes. No client-side merge — this is a real notification.
      if (journeyType) {
        const motivationalSeedKey = `motivational-${journeyType}-${today}`;
        if (!seededRef.current.has(motivationalSeedKey)) {
          const existing = await getDocs(query(colRef,
            where('type',    '==', NOTIF_TYPES.MOTIVATIONAL),
            where('dateKey', '==', today),
          ));
          if (existing.empty) {
            const quotes  = getJourneyMotivational(journeyType);
            const dayOfYear = Math.floor(
              (new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86_400_000
            );
            const quote = quotes[dayOfYear % quotes.length];

            await addDoc(colRef, {
              type:      NOTIF_TYPES.MOTIVATIONAL,
              title:     'Daily Boost 🌸',
              message:   quote,
              read:      false,
              dateKey:   today,
              createdAt: serverTimestamp(),
              // No action — motivational quotes are informational only
            }).catch(console.error);
          }
          seededRef.current.add(motivationalSeedKey);
        }
      }
    }

    seedSystemNotifications().catch(console.error);
  }, [userId, loading, daysUntilRenewal, tasks, journeyType]);

  // ── 5. Notifications list — Firestore only, no client-side mock merging ───
  // Sort: unread first, then by recency (handled by Firestore orderBy createdAt desc)
  const notifications = firestoreNotifs.sort(
    (a, b) => (a.read === b.read ? 0 : a.read ? 1 : -1)
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── 6. Actions ────────────────────────────────────────────────────────────

  const markRead = useCallback(async (id) => {
    if (!userId) return;
    await updateDoc(doc(db, 'notifications', userId, 'items', id), { read: true })
      .catch(console.error);
  }, [userId]);

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    const batch = writeBatch(db);
    firestoreNotifs.filter((n) => !n.read).forEach((n) => {
      batch.update(doc(db, 'notifications', userId, 'items', n.id), { read: true });
    });
    await batch.commit().catch(console.error);
  }, [userId, firestoreNotifs]);

  const dismissNotification = useCallback(async (id) => {
    if (!userId) return;
    await updateDoc(doc(db, 'notifications', userId, 'items', id), {
      read: true, dismissed: true,
    }).catch(console.error);
  }, [userId]);

  const handleNotificationClick = useCallback((notif) => {
    markRead(notif.id);
    if (notif.action?.route && onNavigate) {
      onNavigate(notif.action.route);
      setPanelOpen(false);
    }
  }, [markRead, onNavigate]);

  /**
   * Push a notification from anywhere in the app — e.g. after saving an IVF log,
   * completing a scan, or receiving a backend Cloud Function result.
   */
  const pushNotification = useCallback(async (notif) => {
    if (!userId) return;
    await addDoc(collection(db, 'notifications', userId, 'items'), {
      ...notif, read: false, createdAt: serverTimestamp(),
    }).catch(console.error);
    if (notif.title) sendBrowserNotification(notif.title, notif.message ?? '');
  }, [userId]);

  const togglePanel = useCallback(() => setPanelOpen((v) => !v), []);
  const closePanel  = useCallback(() => setPanelOpen(false), []);

  return {
    notifications,
    unreadCount,
    loading,
    pushGranted,
    panelOpen,
    togglePanel,
    closePanel,
    markRead,
    markAllRead,
    dismissNotification,
    handleNotificationClick,
    pushNotification,
  };
}