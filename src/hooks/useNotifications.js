// src/hooks/useNotifications.js
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, doc, serverTimestamp, writeBatch, getDocs,
} from 'firebase/firestore';
import { db, auth } from '../context/firebase';

// ─── Notification types ───────────────────────────────────────────────────────

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
  FEEDING:       'feeding',       // NEW — postpartum breastfeeding
  FERTILE:       'fertile',       // NEW — TTC fertile window / ovulation
  INJECTION:     'injection',     // NEW — IVF injection reminders
  INTIMACY:      'intimacy',      // NEW — TTC intercourse timing
};

// ─── Journey key constants ────────────────────────────────────────────────────
// App uses 'conceive' (not 'ttc') and 'mom' (not 'postpartum').
// All journey gates must use these canonical keys.

const PREGNANT_ONLY   = ['pregnant'];
const CONCEIVE_ONLY   = ['conceive'];
const IVF_ONLY        = ['ivf'];
const MOM_ONLY        = ['mom'];
const MENOPAUSE_ONLY  = ['menopause'];
const PRENATAL        = ['pregnant', 'conceive', 'ivf']; // actively trying or expecting
const ALL_JOURNEYS    = null; // fires for every journey

// ─── Timed reminder schedule ──────────────────────────────────────────────────
// Each entry fires once per day at the given hour (checked on the minute).
// journeys: null = all, otherwise array of canonical journey keys.

const TIMED_REMINDERS = [

  // ── Hydration (all journeys, every 2 hours 8–20) ──────────────────────────
  ...[8, 10, 12, 14, 16, 18, 20].map((h) => ({
    id:      `hydration-${h}`,
    type:    NOTIF_TYPES.HYDRATION,
    title:   'Time to Hydrate 💧',
    message: h < 12
      ? 'Start your morning right — drink a glass of water now!'
      : h < 17
        ? 'Afternoon check-in: have you had enough water today?'
        : 'Evening hydration reminder — keep sipping!',
    hour:     h,
    journeys: ALL_JOURNEYS,
    action:   null,
  })),

  // ── Prenatal vitamins / supplements (pregnant + conceive + ivf, 8 AM) ─────
  {
    id: 'medication-morning',
    type: NOTIF_TYPES.MEDICATION,
    title: 'Morning Vitamins 💊',
    message: 'Time to take your prenatal vitamins and any prescribed supplements.',
    hour: 8,
    journeys: PRENATAL,
    action: { label: 'Mark as Taken', route: '/nutrition' },
  },

  // ── HRT medication (menopause, 8 AM) ──────────────────────────────────────
  {
    id: 'hrt-morning',
    type: NOTIF_TYPES.MEDICATION,
    title: 'HRT Medication Reminder 💜',
    message: "Don't forget your morning HRT medication. Consistency is key for effectiveness.",
    hour: 8,
    journeys: MENOPAUSE_ONLY,
    action: { label: 'Log Medication', route: '/menopause' },
  },
  {
    id: 'hrt-evening',
    type: NOTIF_TYPES.MEDICATION,
    title: 'Evening HRT Check 💜',
    message: 'Have you taken your HRT medication today? Consistent timing improves outcomes.',
    hour: 20,
    journeys: MENOPAUSE_ONLY,
    action: { label: 'Log Medication', route: '/menopause' },
  },

  // ── IVF injections (IVF only — 3 windows: 8 AM, 6 PM, 9 PM) ─────────────
  // IVF stimulation injections are typically timed within a 1–2 hour window.
  // These reminders cover the most common clinic-prescribed windows.
  {
    id: 'ivf-injection-morning',
    type: NOTIF_TYPES.INJECTION,
    title: 'IVF Injection Reminder 💉',
    message: 'Morning injection window — check your protocol and administer on schedule. Ice the area for 10 mins first.',
    hour: 8,
    journeys: IVF_ONLY,
    action: { label: 'Log Injection', route: '/treatment' },
  },
  {
    id: 'ivf-injection-evening',
    type: NOTIF_TYPES.INJECTION,
    title: 'Evening IVF Injection 💉',
    message: 'Evening injection time. You are so strong — every shot is an act of love for your future family. 🌸',
    hour: 18,
    journeys: IVF_ONLY,
    action: { label: 'Log Injection', route: '/treatment' },
  },
  {
    id: 'ivf-injection-night',
    type: NOTIF_TYPES.INJECTION,
    title: 'IVF Night Medication 💉',
    message: 'Night medication check — some protocols include a late-evening trigger shot. Check your clinic schedule.',
    hour: 21,
    journeys: IVF_ONLY,
    action: { label: 'View Medications', route: '/medications' },
  },

  // ── IVF general medication (in addition to injections) ───────────────────
  {
    id: 'ivf-medication-evening',
    type: NOTIF_TYPES.MEDICATION,
    title: 'IVF Oral Medications 💊',
    message: "Evening medications — progesterone pessaries, aspirin, or any oral supplements your clinic prescribed.",
    hour: 20,
    journeys: IVF_ONLY,
    action: { label: 'Mark as Taken', route: '/medications' },
  },

  // ── Kick count (pregnant only — 9 AM, 1 PM, 6 PM) ────────────────────────
  {
    id: 'kicks-morning',
    type: NOTIF_TYPES.KICK_COUNT,
    title: 'Morning Kick Count 👶',
    message: "Log your baby's morning movements. 10 kicks in 2 hours is a reassuring sign.",
    hour: 9,
    journeys: PREGNANT_ONLY,
    action: { label: 'Log Kicks', route: '/kicks' },
  },
  {
    id: 'kicks-afternoon',
    type: NOTIF_TYPES.KICK_COUNT,
    title: 'Afternoon Kick Count 👶',
    message: "Afternoon movement check — find a quiet moment and feel for your baby's kicks.",
    hour: 13,
    journeys: PREGNANT_ONLY,
    action: { label: 'Log Kicks', route: '/kicks' },
  },
  {
    id: 'kicks-evening',
    type: NOTIF_TYPES.KICK_COUNT,
    title: 'Evening Kick Count 👶',
    message: "Evening movement check before dinner — log your baby's kicks now.",
    hour: 18,
    journeys: PREGNANT_ONLY,
    action: { label: 'Log Kicks', route: '/kicks' },
  },

  // ── Breastfeeding reminders (mom only — every 3 hours, 6 AM–9 PM) ────────
  // NHS guidance: newborns feed 8–12 times per day (every 2–3 hours).
  ...[6, 9, 12, 15, 18, 21].map((h) => ({
    id:      `feeding-${h}`,
    type:    NOTIF_TYPES.FEEDING,
    title:   h < 12 ? 'Feeding Time 🍼' : h < 18 ? 'Midday Feed 🤱' : 'Evening Feed 🌙',
    message: h === 6
      ? 'Morning feeding time — newborns need 8–12 feeds per day. Log this feed in the Baby tab.'
      : h === 21
        ? 'Evening feed — after this one, try a longer sleep stretch if baby allows.'
        : "Time for a feed check. If baby is showing hunger cues (rooting, sucking hands), offer the breast or bottle now.",
    hour:     h,
    journeys: MOM_ONLY,
    action:   { label: 'Log Feed', route: '/nursing' },
  })),

  // ── TTC — BBT temperature (conceive only, 7 AM — must be before getting up) ──
  {
    id: 'bbt-morning',
    type: NOTIF_TYPES.TIP,
    title: 'BBT Temperature Time 🌡️',
    message: 'Log your basal body temperature now — before getting out of bed. Consistency in timing is essential for accurate charting.',
    hour: 7,
    journeys: CONCEIVE_ONLY,
    action: { label: 'Log BBT', route: '/vitals' },
  },

  // ── TTC — ovulation test (conceive only, 10 AM and 6 PM) ─────────────────
  // LH surge is best detected mid-morning or late afternoon; testing twice improves accuracy.
  {
    id: 'ovulation-test-morning',
    type: NOTIF_TYPES.FERTILE,
    title: 'Ovulation Test Reminder 🌸',
    message: 'Take your LH ovulation test now — mid-morning is optimal for detecting the LH surge. Use second morning urine (not first).',
    hour: 10,
    journeys: CONCEIVE_ONLY,
    action: { label: 'Log Result', route: '/ttc' },
  },
  {
    id: 'ovulation-test-evening',
    type: NOTIF_TYPES.FERTILE,
    title: 'Second Ovulation Test 🌸',
    message: 'Second OPK of the day — if your morning test was close to positive, this one could confirm your surge.',
    hour: 18,
    journeys: CONCEIVE_ONLY,
    action: { label: 'Log Result', route: '/ttc' },
  },

  // ── TTC — folic acid (conceive only, 8 AM) ───────────────────────────────
  {
    id: 'folic-acid',
    type: NOTIF_TYPES.MEDICATION,
    title: 'Folic Acid Reminder 💊',
    message: 'Take your folic acid (400mcg) — daily from now until 12 weeks pregnant to protect against neural tube defects.',
    hour: 8,
    journeys: CONCEIVE_ONLY,
    action: { label: 'Mark as Taken', route: '/nutrition' },
  },

  // ── Sleep wind-down (all journeys, 9 PM) ─────────────────────────────────
  {
    id: 'sleep-wind-down',
    type: NOTIF_TYPES.SLEEP,
    title: 'Wind Down Time 🌙',
    message: "It's 9 PM — start winding down. Quality sleep is one of the most powerful things you can do for your health right now.",
    hour: 21,
    journeys: ALL_JOURNEYS,
    action: null,
  },
];

// ─── Fertile window notifications ─────────────────────────────────────────────
// These are seeded based on cycle data, not fixed hours.
// They are called from the seedFertileWindowNotifications() function below
// when cycle day data is available from Firestore.

export const FERTILE_WINDOW_MESSAGES = {
  approaching: {
    title: 'Fertile Window Approaching 🌸',
    message: 'Your fertile window opens in 2 days (around cycle day 12). This is the best time to increase intimacy frequency.',
  },
  open: {
    title: "You're in Your Fertile Window 💕",
    message: 'Your fertile window is open! For best results, have sex today and every other day through ovulation. Sperm survive 3–5 days.',
  },
  ovulation: {
    title: "Ovulation Day 🥚",
    message: "Today is your estimated ovulation day — your most fertile day. Having sex today gives the highest chance of conception. 💕",
  },
  positions: {
    title: 'Conception Tips for Today 💕',
    message: 'Missionary or hips-elevated positions may help sperm reach the cervix. Rest for 15–20 minutes after sex. No need to elevate legs dramatically.',
  },
  luteal: {
    title: 'Luteal Phase Begins 🌱',
    message: "Ovulation window has passed. The two-week wait begins now — be kind to yourself. Avoid NSAIDs (ibuprofen) which can interfere with implantation.",
  },
};

// ─── Journey-aware motivational quotes ───────────────────────────────────────

const MOTIVATIONAL_BY_JOURNEY = {
  pregnant: [
    "Every kick is a little love note from your baby. You're doing amazing! 🌸",
    "Growing a human is hard work — be proud of yourself every single day. 💪",
    "Your body knows exactly what it's doing. Trust it, nourish it, celebrate it. ✨",
    "Rest is not laziness — it's how you and your baby recharge together. 🌙",
    "The love you already have for your baby is your superpower. 🌟",
    "Nourish your body, trust your instincts, and breathe. You've got this, Mama! 🍃",
  ],
  conceive: [
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

// ─── Appointment reminder windows (hours before) ──────────────────────────────
const APPOINTMENT_REMINDER_HOURS = [48, 24, 2];

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useNotifications
 *
 * All notifications originate from Firestore.
 * Journey keys must be canonical: 'conceive' (not 'ttc'), 'mom' (not 'postpartum').
 *
 * Firestore paths:
 *   notifications/{userId}/items/{notifId}
 *   appointments/{userId}/items/{apptId}
 *
 * @param {object}      opts
 * @param {number|null} opts.daysUntilRenewal
 * @param {array}       opts.tasks         [{ id, label, completed, dueToday, route? }]
 * @param {string}      opts.journeyType   canonical journey key
 * @param {number|null} opts.cycleDay      current cycle day (for TTC fertile window)
 * @param {number|null} opts.cycleLength   average cycle length (default 28)
 * @param {function}    opts.onNavigate    (route) => void
 */
export function useNotifications({
  daysUntilRenewal = null,
  tasks            = [],
  journeyType      = '',
  cycleDay         = null,
  cycleLength      = 28,
  onNavigate,
} = {}) {

  const [firestoreNotifs, setFirestoreNotifs] = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [panelOpen, setPanelOpen]             = useState(false);
  const [pushGranted, setPushGranted]         = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );

  const seededRef = useRef(new Set());
  const timerRefs = useRef([]);
  const userId    = auth.currentUser?.uid;

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

  // ── 3. Timed reminders (hydration, medication, kicks, feeds, injections) ──
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

      // Only fire at the top of each hour (minute 0–5)
      if (minute > 5) return;

      for (const reminder of TIMED_REMINDERS) {
        if (reminder.hour !== hour) continue;

        // Journey gate — null fires for all, otherwise must match canonical key
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
            action:     reminder.action ?? null,
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

  // ── 4. TTC fertile window notifications ───────────────────────────────────
  // Seeded when cycleDay is known. Covers: approaching fertile window,
  // fertile window open, ovulation day, intercourse timing tips, luteal phase.
  useEffect(() => {
    if (!userId || journeyType !== 'conceive' || !cycleDay) return;

    async function seedFertileWindowNotifications() {
      const today  = new Date().toDateString();
      const colRef = collection(db, 'notifications', userId, 'items');

      // Estimated ovulation day (cycle length - 14)
      const ovDay    = cycleLength - 14;
      const fwStart  = ovDay - 5; // fertile window opens 5 days before ovulation
      const fwEnd    = ovDay + 1; // closes day after ovulation

      const seeds = [];

      // 2 days before fertile window
      if (cycleDay === fwStart - 2) {
        seeds.push({ key: `fertile-approaching-${today}`, ...FERTILE_WINDOW_MESSAGES.approaching });
      }

      // Fertile window open
      if (cycleDay >= fwStart && cycleDay < ovDay) {
        seeds.push({ key: `fertile-open-${today}`, ...FERTILE_WINDOW_MESSAGES.open });
        // Intercourse timing tip on every other day of fertile window
        if ((cycleDay - fwStart) % 2 === 0) {
          seeds.push({ key: `fertile-intimacy-${today}`, ...FERTILE_WINDOW_MESSAGES.positions });
        }
      }

      // Ovulation day
      if (cycleDay === ovDay) {
        seeds.push({ key: `fertile-ovulation-${today}`, ...FERTILE_WINDOW_MESSAGES.ovulation });
        seeds.push({ key: `fertile-positions-${today}`, ...FERTILE_WINDOW_MESSAGES.positions });
      }

      // Day after ovulation — luteal phase begins
      if (cycleDay === fwEnd) {
        seeds.push({ key: `fertile-luteal-${today}`, ...FERTILE_WINDOW_MESSAGES.luteal });
      }

      for (const seed of seeds) {
        const { key, title, message } = seed;
        if (seededRef.current.has(key)) continue;

        const existing = await getDocs(query(colRef,
          where('type',    '==', NOTIF_TYPES.FERTILE),
          where('dateKey', '==', today),
          where('title',   '==', title),
        ));

        if (existing.empty) {
          await addDoc(colRef, {
            type:      NOTIF_TYPES.FERTILE,
            title,
            message,
            read:      false,
            dateKey:   today,
            createdAt: serverTimestamp(),
            action:    { label: 'View Cycle', route: '/ttc' },
          }).catch(console.error);

          sendBrowserNotification(title, message);
        }
        seededRef.current.add(key);
      }
    }

    seedFertileWindowNotifications().catch(console.error);
  }, [userId, journeyType, cycleDay, cycleLength]);

  // ── 5. System seeds: renewal, missed tasks, daily motivational ────────────
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

      // ── Missed tasks ──────────────────────────────────────────────────────
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

      // ── Daily motivational (journey-scoped, seeded once per day) ─────────
      if (journeyType) {
        const seedKey = `motivational-${journeyType}-${today}`;
        if (!seededRef.current.has(seedKey)) {
          const existing = await getDocs(query(colRef,
            where('type',    '==', NOTIF_TYPES.MOTIVATIONAL),
            where('dateKey', '==', today),
          ));
          if (existing.empty) {
            const quotes    = getJourneyMotivational(journeyType);
            const dayOfYear = Math.floor(
              (new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86_400_000
            );
            await addDoc(colRef, {
              type:      NOTIF_TYPES.MOTIVATIONAL,
              title:     'Daily Boost 🌸',
              message:   quotes[dayOfYear % quotes.length],
              read:      false, dateKey: today, createdAt: serverTimestamp(),
            }).catch(console.error);
          }
          seededRef.current.add(seedKey);
        }
      }
    }

    seedSystemNotifications().catch(console.error);
  }, [userId, loading, daysUntilRenewal, tasks, journeyType]);

  // ── 6. Sorted notification list ───────────────────────────────────────────
  const notifications = firestoreNotifs.sort(
    (a, b) => (a.read === b.read ? 0 : a.read ? 1 : -1)
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── 7. Actions ────────────────────────────────────────────────────────────

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
   * pushNotification — call from anywhere in the app to create a notification.
   * e.g. after saving an IVF log, completing a scan, or a backend event.
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