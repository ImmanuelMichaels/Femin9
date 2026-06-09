// data/homeConfig.js
//
// RULE: This file must contain NO hardcoded user data, dates, figures, or
// mock values. Every stat, tracker value, and appointment entry that depends
// on the user's personal data is left blank/null here; Home.jsx populates
// them at runtime from localStorage and AppContext.
//
// Acceptable here: labels, icons, accent colours, layout config, static copy
// that is generic and not derived from any individual's data.

/* ─────────────────────────────────────────────────────────────────
   JOURNEY META
───────────────────────────────────────────────────────────────────
   Two parallel exports for backward-compat:
   • JOURNEY_META  — used by Home.jsx (primary, keyed to journeyType strings)
   • Legacy JOURNEY_META in homeConfig.js (old keys) — kept for any older imports
───────────────────────────────────────────────────────────────── */
export const JOURNEY_META = {
  pregnant: {
    accent:     '#d63a6e',
    accentSoft: '#fce8ef',
    accentMid:  '#f5c0d2',
    gradient:   'linear-gradient(135deg,#fce8ef 0%,#fff5f8 100%)',
    icon:       '🤰',
    label:      'Pregnancy',
  },
  conceive: {
    accent:     '#3b7de9',
    accentSoft: '#e8f0fb',
    accentMid:  '#c4d8f8',
    gradient:   'linear-gradient(135deg,#e8f0fb 0%,#f5f8ff 100%)',
    icon:       '💞',
    label:      'Trying to Conceive',
  },
  ivf: {
    accent:     '#f08c2e',
    accentSoft: '#fff3e8',
    accentMid:  '#ffd7b0',
    gradient:   'linear-gradient(135deg,#fff3e8 0%,#fffaf5 100%)',
    icon:       '🔬',
    label:      'IVF & Fertility',
  },
  mom: {
    accent:     '#2e9e67',
    accentSoft: '#e6f5ee',
    accentMid:  '#b6e4cb',
    gradient:   'linear-gradient(135deg,#e6f5ee 0%,#f5fdf8 100%)',
    icon:       '🤱',
    label:      'Motherhood',
  },
  menopause: {
    accent:     '#9a3dde',
    accentSoft: '#f0e8fb',
    accentMid:  '#dcc4f7',
    gradient:   'linear-gradient(135deg,#f0e8fb 0%,#faf6ff 100%)',
    icon:       '🌿',
    label:      'Cycle & Menopause',
  },
};

/* ─────────────────────────────────────────────────────────────────
   GREETING HELPER
───────────────────────────────────────────────────────────────────
   Returns a time-appropriate greeting. No hardcoded names.
───────────────────────────────────────────────────────────────── */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const greet = (name, emoji) => `${getGreeting()}, ${name} ${emoji}`;

/* ─────────────────────────────────────────────────────────────────
   PREGNANCY CONFIG
───────────────────────────────────────────────────────────────────
   heroTitle and heroBody are generic — Home.jsx overrides them with
   week-specific copy via getPregnantHeroBody().
   stats / trackers / appointments / checklist: NO mock values.
───────────────────────────────────────────────────────────────── */
export const PREGNANCY_CONFIG = {
  greeting: name => greet(name, '☀️'),

  // Generic fallback — Home.jsx replaces this with week-specific copy
  heroTitle: 'Your Pregnancy Journey 🌸',
  heroBody:  'Track your health, baby movements, and appointments every day.',
  heroBg:    'linear-gradient(135deg,#fce8ef,#fff0f5)',
  heroIllo:  '/pregnancy.png',

  // stat shells — values populated at runtime by Home.jsx from AppContext / localStorage
  stats: [
    { icon: '👶', label: 'Baby Size',   value: null, sub: null },
    { icon: '❤️', label: 'Heart Rate',  value: null, sub: null },
    { icon: '⚖️', label: 'Weight Gain', value: null, sub: null },
    { icon: '📅', label: 'Days Left',   value: null, sub: null },
  ],

  trackers: [
    { id: 'kicks',     icon: '👣', label: 'Kick Counter', value: null, target: null, pct: 0, color: '#d63a6e' },
    { id: 'hydration', icon: '💧', label: 'Hydration',    value: null, target: null, pct: 0, color: '#3b7de9' },
    { id: 'iron',      icon: '💊', label: 'Iron Tablet',  value: null, target: null, pct: 0, color: '#e57c1a' },
    { id: 'sleep',     icon: '😴', label: 'Sleep',        value: null, target: null, pct: 0, color: '#9a3dde' },
  ],

  // No appointments hardcoded — loaded from localStorage by Home.jsx
  appointments: [],

  insights: [
    { icon: '🥦', title: 'Iron Boost Foods',       body: 'Spinach, lentils, red meat, fortified cereals. Pair with Vitamin C to increase absorption.',        color: '#d63a6e', bg: '#fce8ef' },
    { icon: '🧘', title: 'Pelvic Floor Exercises', body: '3 sets of 10 Kegel contractions daily helps reduce labour time and speeds postpartum recovery.',    color: '#9a3dde', bg: '#f0e8fb' },
    { icon: '🏥', title: 'Hospital Bag Reminder',  body: 'Pack by week 36: birth plan, ID, nightwear, baby essentials, snacks for your birth partner.',       color: '#3b7de9', bg: '#e8f0fb' },
  ],

  // No checklist items hardcoded — user builds their own via Home.jsx task UI
  checklist: [],

  quickActions: [
    { emoji: '👣', label: 'Kick Counter', id: 'kicks'     },
    { emoji: '💊', label: 'Vitals',       id: 'vitals'    },
    { emoji: '🍊', label: 'Nutrition',    id: 'nutrition' },
    { emoji: '🤖', label: 'Ask AI',       id: 'assistant' },
  ],

  // Generic alert — Home.jsx overrides with real vitals data via EmergencyRedFlags
  alert: {
    title: 'Stay on top of your health',
    body:  'Log your blood pressure, baby kicks, and take your supplements daily.',
    color: '#e57c1a',
    bg:    '#fff3e8',
  },
};

/* ─────────────────────────────────────────────────────────────────
   TTC / CONCEIVE CONFIG
───────────────────────────────────────────────────────────────────
   heroTitle / heroBody are generic — Home.jsx builds cycle-specific
   copy from buildCycleStats() and getCycleActionText().
───────────────────────────────────────────────────────────────── */
export const TTC_CONFIG = {
  greeting:  name => greet(name, '🌸'),
  heroTitle: 'Your Fertility Journey 💞',
  heroBody:  'Log your cycle data daily to get personalised fertile window predictions.',
  heroBg:    'linear-gradient(135deg,#e8f0fb,#f5f8ff)',
  heroIllo:  '/conceive.png',

  stats: [
    { icon: '📅', label: 'Cycle Day',      value: null, sub: null },
    { icon: '🥚', label: 'Ovulation',      value: null, sub: null },
    { icon: '🌡️', label: 'BBT',           value: null, sub: null },
    { icon: '💞', label: 'Fertile Window', value: null, sub: null },
  ],

  trackers: [
    { id: 'bbt',   icon: '🌡️', label: 'BBT Logged',     value: null, target: null, pct: 0, color: '#3b7de9' },
    { id: 'cm',    icon: '💧', label: 'Cervical Mucus',  value: null, target: null, pct: 0, color: '#9a3dde' },
    { id: 'folic', icon: '💊', label: 'Folic Acid',      value: null, target: null, pct: 0, color: '#e57c1a' },
    { id: 'water', icon: '💧', label: 'Hydration',       value: null, target: null, pct: 0, color: '#2e9e67' },
  ],

  appointments: [],

  insights: [
    { icon: '🌰', title: 'Fertility-Friendly Foods', body: 'Avocado, oily fish, leafy greens, nuts, and seeds support hormone balance and egg quality.',   color: '#3b7de9', bg: '#e8f0fb' },
    { icon: '🚫', title: 'Around Ovulation',        body: 'NSAIDs like ibuprofen can suppress the LH surge. Use paracetamol for pain relief if needed.',   color: '#e57c1a', bg: '#fff3e8' },
    { icon: '🧘', title: 'Stress & Fertility',      body: 'Chronic stress raises cortisol, which can suppress LH. Try 4-7-8 breathing for 5 minutes daily.', color: '#9a3dde', bg: '#f0e8fb' },
  ],

  checklist: [],

  quickActions: [
    { emoji: '📅', label: 'Cycle Log',  id: 'ttc'       },
    { emoji: '🌡️', label: 'BBT Track', id: 'vitals'    },
    { emoji: '🥗', label: 'Nutrition',  id: 'nutrition' },
    { emoji: '🤖', label: 'Ask AI',     id: 'assistant' },
  ],

  alert: {
    title: 'Track daily for best results',
    body:  'Log your BBT each morning and cervical mucus to sharpen your fertile window prediction.',
    color: '#3b7de9',
    bg:    '#e8f0fb',
  },
};

/* ─────────────────────────────────────────────────────────────────
   IVF CONFIG
───────────────────────────────────────────────────────────────────
   heroTitle / heroBody are generic — Ivf.jsx HeroSection builds
   the stage-specific copy (including embryo day and days to transfer)
   dynamically from the user's cycle start date and timeline state.
   No day numbers, no transfer dates, no embryo counts here.
───────────────────────────────────────────────────────────────── */
export const IVF_CONFIG = {
  greeting:  name => greet(name, '💛'),
  heroTitle: 'Your IVF Journey 🔬',
  heroBody:  'Track your medications, scans, and embryo development every day.',
  heroBg:    'linear-gradient(135deg,#fff3e8,#fffaf5)',
  heroIllo:  '/ivfj.png',

  stats: [
    { icon: '🔬', label: 'Embryos',    value: null, sub: null },
    { icon: '📅', label: 'Transfer',   value: null, sub: null },
    { icon: '💉', label: 'Meds Today', value: null, sub: null },
    { icon: '🌸', label: 'Cycle Day',  value: null, sub: null },
  ],

  trackers: [
    { id: 'meds',  icon: '💊', label: 'Medications', value: null, target: null, pct: 0, color: '#f08c2e' },
    { id: 'water', icon: '💧', label: 'Hydration',   value: null, target: null, pct: 0, color: '#3b7de9' },
    { id: 'sleep', icon: '😴', label: 'Sleep',       value: null, target: null, pct: 0, color: '#9a3dde' },
    { id: 'mood',  icon: '💛', label: 'Mood',        value: null, target: null, pct: 0, color: '#2e9e67' },
  ],

  appointments: [],

  insights: [
    { icon: '🛌', title: '2-Week Wait Tips',    body: 'Light walking is fine. Avoid hot baths, heavy lifting, and alcohol. Rest and be gentle with yourself.',          color: '#9a3dde', bg: '#f0e8fb' },
    { icon: '💊', title: 'Medication Timing',   body: 'Take medications at the same time each day. Set alarms and rotate injection sites to reduce discomfort.',        color: '#f08c2e', bg: '#fff3e8' },
    { icon: '💧', title: 'Hydration Matters',   body: 'Staying well hydrated during stimulation helps reduce OHSS risk. Aim for 8 cups of water daily.',               color: '#3b7de9', bg: '#e8f0fb' },
  ],

  checklist: [],

  quickActions: [
    { emoji: '💉', label: 'Medications', id: 'ivf'       },
    { emoji: '🔬', label: 'Embryos',     id: 'ivf'       },
    { emoji: '💗', label: 'Wellbeing',   id: 'mental'    },
    { emoji: '🤖', label: 'Ask AI',      id: 'assistant' },
  ],

  alert: {
    title: 'Medication adherence is key',
    body:  'Taking every dose on time gives your cycle the best possible chance. Check your schedule.',
    color: '#f08c2e',
    bg:    '#fff3e8',
  },
};

/* ─────────────────────────────────────────────────────────────────
   MOM / POSTPARTUM CONFIG
───────────────────────────────────────────────────────────────────
   heroTitle / heroBody generic — Home.jsx builds week-specific copy
   via getMomHeroBody() using babyAgeWeeks from AppContext.
───────────────────────────────────────────────────────────────── */
export const MOM_CONFIG = {
  greeting:  name => greet(name, '🍼'),
  heroTitle: 'Your Motherhood Journey 🤱',
  heroBody:  'Rest, hydrate, and accept help. You are doing something extraordinary.',
  heroBg:    'linear-gradient(135deg,#e6f5ee,#f5fdf8)',
  heroIllo:  '/mum.png',

  stats: [
    { icon: '🍼', label: 'Feeds Today',  value: null, sub: null },
    { icon: '💤', label: 'Baby Sleep',   value: null, sub: null },
    { icon: '⚖️', label: 'Baby Weight', value: null, sub: null },
    { icon: '🌟', label: 'Milestones',   value: null, sub: null },
  ],

  trackers: [
    { id: 'feed',   icon: '🍼', label: 'Last Feed',     value: null, target: null, pct: 0, color: '#2e9e67' },
    { id: 'diaper', icon: '👶', label: 'Diapers Today', value: null, target: null, pct: 0, color: '#3b7de9' },
    { id: 'sleep',  icon: '💤', label: 'Your Sleep',    value: null, target: null, pct: 0, color: '#9a3dde' },
    { id: 'water',  icon: '💧', label: 'Hydration',     value: null, target: null, pct: 0, color: '#f08c2e' },
  ],

  appointments: [],

  insights: [
    { icon: '🌿', title: 'Milk-Boosting Foods',   body: 'Oats, leafy greens, and staying well hydrated support your milk supply. Feed on demand to build supply.',    color: '#2e9e67', bg: '#e6f5ee' },
    { icon: '🧠', title: 'Baby Brain Development', body: 'Talk, sing, and make eye contact. Every interaction builds neural connections in your baby\'s brain.',       color: '#3b7de9', bg: '#e8f0fb' },
    { icon: '💜', title: 'Postpartum Mood Check',  body: 'Feeling overwhelmed beyond 2 weeks may be postnatal depression — not weakness. Speak to your GP.',          color: '#9a3dde', bg: '#f0e8fb' },
  ],

  checklist: [],

  quickActions: [
    { emoji: '🍼', label: 'Log Feed',  id: 'nursing'   },
    { emoji: '💊', label: 'Vitals',    id: 'vitals'    },
    { emoji: '🍊', label: 'Nutrition', id: 'nutrition' },
    { emoji: '🤖', label: 'Ask AI',    id: 'assistant' },
  ],

  alert: {
    title: 'Postnatal check-up',
    body:  'Make sure you have booked your 6-week postnatal check with your GP.',
    color: '#2e9e67',
    bg:    '#e6f5ee',
  },
};

/* ─────────────────────────────────────────────────────────────────
   MENOPAUSE CONFIG
───────────────────────────────────────────────────────────────────
   No hot-flash counts, no sleep scores, no symptom labels
   hardcoded — all populated at runtime from user's logs.
───────────────────────────────────────────────────────────────── */
export const MENOPAUSE_CONFIG = {
  greeting:  name => greet(name, '🌿'),
  heroTitle: 'Honour your body today 🦋',
  heroBody:  'Menopause is a transition, not an ending. Track your symptoms and rest when needed.',
  heroBg:    'linear-gradient(135deg,#f0e8fb,#faf6ff)',
  heroIllo:  '/menopause.png',

  stats: [
    { icon: '🌡️', label: 'Hot Flashes', value: null, sub: null },
    { icon: '💤',  label: 'Sleep',       value: null, sub: null },
    { icon: '😊',  label: 'Mood',        value: null, sub: null },
    { icon: '📅',  label: 'Last Period', value: null, sub: null },
  ],

  trackers: [
    { id: 'flash', icon: '🌡️', label: 'Hot Flashes',   value: null, target: null, pct: 0, color: '#9a3dde' },
    { id: 'sleep', icon: '💤',  label: 'Sleep Quality', value: null, target: null, pct: 0, color: '#3b7de9' },
    { id: 'water', icon: '💧',  label: 'Hydration',     value: null, target: null, pct: 0, color: '#2e9e67' },
    { id: 'move',  icon: '🧘',  label: 'Movement',      value: null, target: null, pct: 0, color: '#f08c2e' },
  ],

  appointments: [],

  insights: [
    { icon: '🥗', title: 'Bone Health Nutrition',  body: 'Calcium (1,200mg/day) from dairy, sardines, and kale. Vitamin D3 in winter. Both protect bone density.',        color: '#9a3dde', bg: '#f0e8fb' },
    { icon: '🌬️', title: 'Hot Flash Management',  body: 'Layer clothing, keep a fan nearby. Caffeine, alcohol, and spicy food are common triggers. Paced breathing helps.', color: '#e57c1a', bg: '#fff3e8' },
    { icon: '🏃', title: 'Exercise Benefits',      body: 'Weight-bearing exercise three times a week reduces bone loss, improves mood, and can cut hot flash frequency.',    color: '#3b7de9', bg: '#e8f0fb' },
  ],

  checklist: [],

  quickActions: [
    { emoji: '🌡️', label: 'Log Symptoms', id: 'health'    },
    { emoji: '💤',  label: 'Sleep Log',    id: 'vitals'    },
    { emoji: '🧘',  label: 'Wellness',     id: 'mental'    },
    { emoji: '🤖',  label: 'Ask AI',       id: 'assistant' },
  ],

  alert: {
    title: 'Track your symptoms daily',
    body:  'Logging hot flashes, sleep, and mood helps you spot patterns and triggers.',
    color: '#9a3dde',
    bg:    '#f0e8fb',
  },
};

/* ─────────────────────────────────────────────────────────────────
   MASTER MAP — keyed by journeyType from AppContext
───────────────────────────────────────────────────────────────── */
export const HOME_CONFIG = {
  pregnant:  PREGNANCY_CONFIG,
  conceive:  TTC_CONFIG,
  ivf:       IVF_CONFIG,
  mom:       MOM_CONFIG,
  menopause: MENOPAUSE_CONFIG,
};

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */
export function getHomeConfig(journeyType) {
  return HOME_CONFIG[journeyType] || PREGNANCY_CONFIG;
}

export function getJourneyMeta(journeyType) {
  return JOURNEY_META[journeyType] || JOURNEY_META.pregnant;
}

export function calculateProgress(current, target) {
  if (!target) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}