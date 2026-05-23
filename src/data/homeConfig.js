/* ─────────────────────────────────────────────────────────────────────────────
   src/data/homeConfig.js
   Single source of truth for every journey's Home dashboard.
   Import this in Home.jsx — never hardcode journey content in the component.
───────────────────────────────────────────────────────────────────────────── */

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

/* ── Greeting helper ── */
const greet = (name, emoji) => `Good morning, ${name} ${emoji}`;

/* ─────────────────────────────────────────────────────────────────────────────
   PREGNANCY
───────────────────────────────────────────────────────────────────────────── */
export const PREGNANCY_CONFIG = {
  greeting:    name => greet(name, '☀️'),
  heroTitle:   'Week 26 · Baby is the size of a scallion',
  heroBody:    'Baby is practising breathing movements and can hear your voice. Focus on iron-rich foods today — spinach, lentils, and fortified cereals.',
  heroBg:      'linear-gradient(135deg,#fce8ef,#fff0f5)',
  heroIllo:    '/pregnancy.png',
  weekLabel:   'Week 26',
  daysLeft:    98,

  stats: [
    { icon: '👶', label: 'Baby Size',    value: 'Scallion',  sub: '35.6 cm' },
    { icon: '❤️', label: 'Heart Rate',   value: '148 bpm',   sub: 'Normal' },
    { icon: '⚖️', label: 'Weight Gain',  value: '+8.2 kg',   sub: 'On track' },
    { icon: '📅', label: 'Days Left',    value: '98',        sub: 'Est. due date' },
  ],

  trackers: [
    { id: 'kicks',       icon: '👣', label: 'Kick Counter',      value: '12 today',    target: '≥10/day',    pct: 100, color: '#d63a6e' },
    { id: 'hydration',   icon: '💧', label: 'Hydration',         value: '5 glasses',   target: '8 glasses',  pct: 62,  color: '#3b7de9' },
    { id: 'iron',        icon: '💊', label: 'Iron Tablet',       value: 'Not taken',   target: 'Daily',      pct: 0,   color: '#e57c1a' },
    { id: 'sleep',       icon: '😴', label: 'Sleep',             value: '7.5 hrs',     target: '8+ hrs',     pct: 87,  color: '#9a3dde' },
  ],

  appointments: [
    { date: 'Mar 28', label: '28-week Glucose Tolerance Test', location: "King's College Hospital", urgent: true  },
    { date: 'Apr 10', label: 'Anomaly Scan',                    location: 'St Thomas\' Hospital',    urgent: false },
    { date: 'Apr 24', label: 'Midwife Appointment',             location: 'Local NHS Clinic',        urgent: false },
  ],

  insights: [
    { icon: '🥦', title: 'Iron Boost Foods',       body: 'Spinach, lentils, red meat, fortified cereals. Pair with Vitamin C to increase absorption by 3x.',         color: '#d63a6e', bg: '#fce8ef' },
    { icon: '🧘', title: 'Pelvic Floor Exercises', body: '3 sets of 10 Kegel contractions daily. Start now — it reduces labour time and postpartum recovery.',        color: '#9a3dde', bg: '#f0e8fb' },
    { icon: '🏥', title: 'Hospital Bag Reminder',  body: 'Start packing at week 36. Include: birth plan, ID, nightwear, baby essentials, snacks for your partner.',   color: '#3b7de9', bg: '#e8f0fb' },
  ],

  checklist: [
    { id: 'iron',       label: 'Take iron supplement',          done: false },
    { id: 'kicks',      label: 'Log 10 kick counts',            done: true  },
    { id: 'water',      label: 'Drink 8 glasses of water',      done: false },
    { id: 'walk',       label: '20-minute gentle walk',         done: true  },
    { id: 'perineal',   label: 'Perineal massage (5 min)',      done: false },
  ],

  quickActions: [
    { emoji: '👣', label: 'Kick Counter', id: 'kicks'     },
    { emoji: '💊', label: 'Vitals',       id: 'vitals'    },
    { emoji: '🍊', label: 'Nutrition',    id: 'nutrition' },
    { emoji: '🤖', label: 'Ask AI',       id: 'assistant' },
  ],

  alert: {
    title: '⚠️ Anaemia Risk Detected',
    body:  'Haemoglobin 9.2 g/dL (low). Increase iron-rich foods and book a GP review. Next check in 5 days.',
    color: '#e57c1a',
    bg:    '#fff3e8',
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   TRYING TO CONCEIVE (TTC)
───────────────────────────────────────────────────────────────────────────── */
export const TTC_CONFIG = {
  greeting:  name => greet(name, '🌸'),
  heroTitle: 'Fertile window opens in 2 days',
  heroBody:  'Cycle Day 12 — oestrogen is rising. Track BBT and cervical mucus to sharpen your fertile window prediction.',
  heroBg:    'linear-gradient(135deg,#e8f0fb,#f5f8ff)',
  heroIllo:  '/conceive.png',

  stats: [
    { icon: '📅', label: 'Cycle Day',      value: 'Day 12',    sub: '28-day cycle' },
    { icon: '🥚', label: 'Ovulation',      value: 'In 2 days', sub: 'Predicted' },
    { icon: '🌡️', label: 'BBT',           value: '36.4°C',    sub: 'Pre-ovulation' },
    { icon: '💞', label: 'Fertile Window', value: '14–16 Mar', sub: 'Peak days' },
  ],

  trackers: [
    { id: 'bbt',    icon: '🌡️', label: 'BBT Logged',          value: '36.4°C',    target: 'Daily',      pct: 100, color: '#3b7de9' },
    { id: 'cm',     icon: '💧', label: 'Cervical Mucus',      value: 'Creamy',    target: 'Daily log',  pct: 100, color: '#9a3dde' },
    { id: 'folic',  icon: '💊', label: 'Folic Acid',          value: 'Not taken', target: '400mcg/day', pct: 0,   color: '#e57c1a' },
    { id: 'water',  icon: '💧', label: 'Hydration',           value: '4 glasses', target: '8 glasses',  pct: 50,  color: '#2e9e67' },
  ],

  appointments: [
    { date: 'Mar 18', label: 'Hormone Panel (Day 3 bloods)',   location: 'Fertility Clinic',   urgent: true  },
    { date: 'Apr 5',  label: 'Follow-up Consultation',         location: 'Care Fertility',     urgent: false },
  ],

  insights: [
    { icon: '🌰', title: 'Fertility Superfoods',   body: 'Tiger nuts (Aya), garden eggs, avocado, oily fish. These boost progesterone, iron, and Omega-3.',  color: '#3b7de9', bg: '#e8f0fb' },
    { icon: '🚫', title: 'Avoid This Week',        body: 'NSAIDs (ibuprofen) around ovulation can suppress the LH surge. Use paracetamol if needed.',        color: '#e57c1a', bg: '#fff3e8' },
    { icon: '🧘', title: 'Stress & Fertility',     body: 'Chronic stress raises cortisol, suppressing LH. Try 4-7-8 breathing for 5 minutes daily.',        color: '#9a3dde', bg: '#f0e8fb' },
  ],

  checklist: [
    { id: 'bbt',    label: 'Log morning BBT',             done: true  },
    { id: 'folic',  label: 'Take folic acid 400mcg',      done: false },
    { id: 'cm',     label: 'Log cervical mucus',          done: true  },
    { id: 'water',  label: 'Drink 8 glasses of water',    done: false },
    { id: 'timing', label: 'Intimacy timing noted',       done: false },
  ],

  quickActions: [
    { emoji: '📅', label: 'Cycle Log',  id: 'ttc'       },
    { emoji: '🌡️', label: 'BBT Track', id: 'vitals'    },
    { emoji: '🥗', label: 'Nutrition',  id: 'nutrition' },
    { emoji: '🤖', label: 'Ask AI',     id: 'assistant' },
  ],

  alert: {
    title: '💞 Fertile Window Approaching',
    body:  'Peak fertility predicted days 14–16. Log symptoms daily to refine your forecast. Consider an OPK test tomorrow.',
    color: '#3b7de9',
    bg:    '#e8f0fb',
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   IVF & FERTILITY
───────────────────────────────────────────────────────────────────────────── */
export const IVF_CONFIG = {
  greeting:  name => greet(name, '💛'),
  heroTitle: 'Embryo Development — Day 5',
  heroBody:  'Your embryos are being carefully nurtured in the lab. Rest, hydrate, and be gentle with yourself. Transfer is in 4 days.',
  heroBg:    'linear-gradient(135deg,#fff3e8,#fffaf5)',
  heroIllo:  '/ivf.png',

  stats: [
    { icon: '🔬', label: 'Embryos',        value: '4',         sub: '2 frozen, 1 ready' },
    { icon: '📅', label: 'Transfer',       value: 'Mar 26',    sub: 'In 4 days' },
    { icon: '💉', label: 'Meds Today',     value: '3 of 5',    sub: 'Pending 2' },
    { icon: '🌸', label: 'Cycle Day',      value: 'Day 14',    sub: 'Stimulation phase' },
  ],

  trackers: [
    { id: 'gonal',   icon: '💉', label: 'Gonal-F 150IU',    value: 'Taken 07:00',   target: 'Daily 07:00', pct: 100, color: '#f08c2e' },
    { id: 'cetro',   icon: '💉', label: 'Cetrotide 0.25mg', value: 'Taken 07:30',   target: 'Daily 07:30', pct: 100, color: '#9a3dde' },
    { id: 'prog',    icon: '💊', label: 'Progesterone',     value: 'Pending 21:00', target: 'Daily 21:00', pct: 0,   color: '#2e9e67' },
    { id: 'water',   icon: '💧', label: 'Hydration',        value: '5 glasses',     target: '8 glasses',   pct: 62,  color: '#3b7de9' },
  ],

  appointments: [
    { date: 'Mar 22', label: 'Scan — Embryo Development Check', location: 'Care Fertility London', urgent: true  },
    { date: 'Mar 26', label: 'Embryo Transfer Day',              location: 'Care Fertility London', urgent: true  },
    { date: 'Apr 9',  label: 'Pregnancy Test (Beta HCG)',        location: 'Care Fertility London', urgent: false },
  ],

  insights: [
    { icon: '❄️', title: 'Embryo Grading',       body: 'Embryo B (AB grade) selected for transfer. AA embryo frozen as backup. Blastocyst stage = best implantation rates.',  color: '#f08c2e', bg: '#fff3e8' },
    { icon: '🛌', title: '2-Week Wait Tips',      body: 'Light walking is fine. Avoid hot baths, heavy lifting, and alcohol. Progesterone pessaries support implantation.',       color: '#9a3dde', bg: '#f0e8fb' },
    { icon: '💊', title: 'Medication Reminder',   body: 'Progesterone 400mg pessary at 21:00. Insert lying down, stay reclined for 20 minutes for best absorption.',              color: '#2e9e67', bg: '#e6f5ee' },
  ],

  checklist: [
    { id: 'gonal',  label: 'Gonal-F injection (07:00)',       done: true  },
    { id: 'cetro',  label: 'Cetrotide injection (07:30)',     done: true  },
    { id: 'prog',   label: 'Progesterone pessary (21:00)',    done: false },
    { id: 'folic',  label: 'Folic acid 5mg',                  done: false },
    { id: 'water',  label: 'Drink 8 glasses of water',        done: false },
  ],

  quickActions: [
    { emoji: '💉', label: 'Medications', id: 'ivf'       },
    { emoji: '🔬', label: 'Embryos',     id: 'ivf'       },
    { emoji: '💗', label: 'Wellbeing',   id: 'mental'    },
    { emoji: '🤖', label: 'Ask AI',      id: 'assistant' },
  ],

  alert: {
    title: '💉 Medication Due at 21:00',
    body:  'Progesterone 400mg pessary and Folic Acid 5mg are due this evening. Set a reminder now.',
    color: '#f08c2e',
    bg:    '#fff3e8',
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   MOTHERHOOD / POSTPARTUM
───────────────────────────────────────────────────────────────────────────── */
export const MOM_CONFIG = {
  greeting:  name => greet(name, '🍼'),
  heroTitle: "Baby is 8 weeks old — you're both thriving",
  heroBody:  'At 8 weeks, babies begin social smiling. Feed on demand — your supply is building. You need 400–500 extra calories daily while breastfeeding.',
  heroBg:    'linear-gradient(135deg,#e6f5ee,#f5fdf8)',
  heroIllo:  '/nursing.png',

  stats: [
    { icon: '🍼', label: 'Feeds Today',    value: '6',         sub: 'Last: 1hr ago' },
    { icon: '💤', label: 'Baby Sleep',     value: '14.5 hrs',  sub: 'Last 24hrs' },
    { icon: '⚖️', label: 'Baby Weight',   value: '5.2 kg',    sub: '+0.3 this week' },
    { icon: '🌟', label: 'Milestones',     value: '3',         sub: 'This month' },
  ],

  trackers: [
    { id: 'feed',   icon: '🍼', label: 'Last Feed',        value: '1 hr ago',    target: 'Every 2-3 hrs', pct: 70,  color: '#2e9e67' },
    { id: 'diaper', icon: '👶', label: 'Diapers Today',    value: '5 changes',   target: '6-8/day',       pct: 75,  color: '#3b7de9' },
    { id: 'sleep',  icon: '💤', label: 'Your Sleep',       value: '4.5 hrs',     target: '7+ hrs',        pct: 55,  color: '#9a3dde' },
    { id: 'water',  icon: '💧', label: 'Hydration',        value: '6 glasses',   target: '10 glasses',    pct: 60,  color: '#f08c2e' },
  ],

  appointments: [
    { date: 'Mar 25', label: '8-Week Baby Health Check',      location: 'GP Surgery',       urgent: true  },
    { date: 'Apr 8',  label: '8-Week Vaccinations (1st set)', location: 'GP Surgery',       urgent: true  },
    { date: 'Apr 20', label: 'Postnatal Midwife Visit',       location: 'Community Clinic', urgent: false },
  ],

  insights: [
    { icon: '🌿', title: 'Milk-Boosting Foods',    body: 'Garden egg leaf, tiger nuts, oats, groundnut soup, catfish pepper soup — all proven galactagogues.',          color: '#2e9e67', bg: '#e6f5ee' },
    { icon: '🧠', title: 'Baby Brain Development', body: 'Talk, sing, and make eye contact. Every interaction builds 700–1,000 neural connections per second right now.', color: '#3b7de9', bg: '#e8f0fb' },
    { icon: '💜', title: 'Postpartum Mood Check',  body: 'Feeling overwhelmed beyond 2 weeks may be PPD — not weakness. Book a GP call. You deserve support too.',        color: '#9a3dde', bg: '#f0e8fb' },
  ],

  checklist: [
    { id: 'feed',     label: 'Log morning feed',                done: true  },
    { id: 'diaper',   label: 'Diaper change logged',            done: true  },
    { id: 'tummy',    label: 'Tummy time (3 x 5 min)',          done: false },
    { id: 'water',    label: 'Drink 10 glasses of water',       done: false },
    { id: 'kegel',    label: 'Pelvic floor exercises',          done: false },
  ],

  quickActions: [
    { emoji: '🍼', label: 'Log Feed',   id: 'nursing'   },
    { emoji: '💊', label: 'Vitals',     id: 'vitals'    },
    { emoji: '🍊', label: 'Nutrition',  id: 'nutrition' },
    { emoji: '🤖', label: 'Ask AI',     id: 'assistant' },
  ],

  alert: {
    title: '📅 8-Week Check Overdue',
    body:  'Your 6-week postnatal check is overdue. Book with your GP to review recovery, mental wellbeing, and contraception.',
    color: '#2e9e67',
    bg:    '#e6f5ee',
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   MENOPAUSE / CYCLE SUPPORT
───────────────────────────────────────────────────────────────────────────── */
export const MENOPAUSE_CONFIG = {
  greeting:  name => greet(name, '🌿'),
  heroTitle: 'Today is a day to honour your body',
  heroBody:  'Menopause is a transition, not an ending. You logged 3 hot flashes yesterday — try cool layers and paced breathing today.',
  heroBg:    'linear-gradient(135deg,#f0e8fb,#faf6ff)',
  heroIllo:  '/menopause.png',

  stats: [
    { icon: '🌡️', label: 'Hot Flashes',   value: '3',         sub: 'Yesterday' },
    { icon: '💤',  label: 'Sleep Score',   value: '6.2/10',    sub: 'Below target' },
    { icon: '😊',  label: 'Mood',          value: 'Calm',      sub: 'Today' },
    { icon: '📅',  label: 'Last Period',   value: '42 days',   sub: 'Ago' },
  ],

  trackers: [
    { id: 'flash',  icon: '🌡️', label: 'Hot Flashes',     value: '1 today',     target: 'Log each',   pct: 40,  color: '#9a3dde' },
    { id: 'sleep',  icon: '💤',  label: 'Sleep Quality',   value: '6.2 hrs',     target: '7-8 hrs',    pct: 75,  color: '#3b7de9' },
    { id: 'water',  icon: '💧',  label: 'Hydration',       value: '4 glasses',   target: '8 glasses',  pct: 50,  color: '#2e9e67' },
    { id: 'move',   icon: '🧘',  label: 'Movement',        value: 'Not yet',     target: '30 min/day', pct: 0,   color: '#f08c2e' },
  ],

  appointments: [
    { date: 'Mar 29', label: 'Menopause HRT Review',         location: 'GP Surgery',       urgent: true  },
    { date: 'Apr 15', label: 'DEXA Bone Density Scan',       location: 'Hospital Radiology', urgent: false },
  ],

  insights: [
    { icon: '🥗', title: 'Bone Health Nutrition',   body: 'Calcium (1,200mg/day): sardines, kale, fortified milk. Vitamin D3 (1,000 IU): sunlight + supplement in winter.',  color: '#9a3dde', bg: '#f0e8fb' },
    { icon: '🌬️', title: 'Hot Flash Management',   body: 'Layer clothing, keep a fan nearby. Avoid caffeine, alcohol, and spicy food as triggers. Paced breathing: 6 breaths/min.', color: '#e57c1a', bg: '#fff3e8' },
    { icon: '🏃', title: 'Exercise Benefits',       body: 'Weight-bearing exercise 3x/week reduces bone loss by 30%, improves mood, and cuts hot flash frequency.',           color: '#3b7de9', bg: '#e8f0fb' },
  ],

  checklist: [
    { id: 'hrt',    label: 'Take HRT medication',            done: false },
    { id: 'water',  label: 'Drink 8 glasses of water',       done: false },
    { id: 'move',   label: '30-min walk or yoga',            done: false },
    { id: 'sleep',  label: 'Wind down by 21:30',             done: false },
    { id: 'mood',   label: 'Log mood and symptoms',          done: false },
  ],

  quickActions: [
    { emoji: '🌡️', label: 'Log Symptoms', id: 'health'    },
    { emoji: '💤',  label: 'Sleep Log',    id: 'vitals'    },
    { emoji: '🧘',  label: 'Wellness',     id: 'mental'    },
    { emoji: '🤖',  label: 'Ask AI',       id: 'assistant' },
  ],

  alert: {
    title: '💤 Sleep Quality Below Target',
    body:  'Under 6 hours for 3 nights. Poor sleep amplifies hot flashes and mood shifts. Try a cooler room and no screens after 9pm.',
    color: '#9a3dde',
    bg:    '#f0e8fb',
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   MASTER MAP — keyed by journeyType from context
───────────────────────────────────────────────────────────────────────────── */
export const HOME_CONFIG = {
  pregnant:  PREGNANCY_CONFIG,
  conceive:  TTC_CONFIG,
  ivf:       IVF_CONFIG,
  mom:       MOM_CONFIG,
  menopause: MENOPAUSE_CONFIG,
};

// Helper function to get home config by journey type
export function getHomeConfig(journeyType) {
  return HOME_CONFIG[journeyType] || PREGNANCY_CONFIG;
}

// Helper function to get journey meta by type
export function getJourneyMeta(journeyType) {
  return JOURNEY_META[journeyType] || JOURNEY_META.pregnant;
}