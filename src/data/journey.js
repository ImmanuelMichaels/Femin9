// src/data/journey.js

export const JOURNEY_CONFIG = {
  pregnant: {
    id: 'pregnant',
    name: 'Pregnancy',
    description: 'Track your pregnancy journey week by week',
    tabs: ["home", "kicks", "vitals", "nutrition", "health", "baby", "mental", "chat", "insights", "profile"],
    pills: [
      { dot: "var(--t)", label: "Week 24 · 2nd Trimester", bg: "var(--gdl)" },
      { dot: "var(--sg)", label: "3/6 supplements ✓", bg: "var(--sgl)" },
      { dot: "var(--lv)", label: "Baby: 600g 🌽", bg: "var(--lvl)" },
    ],
    greeting: "Mama",
    taskIds: ["prenatal_vitamins", "hydration", "vitals", "kicks", "nutrition", "walk"],
    quickActions: [],
    showAlert: true,
  },

  conceive: {
    id: 'conceive',
    name: 'Trying to Conceive',
    description: 'Track your fertility journey',
    tabs: ["home", "ttc", "nutrition", "vitals", "health", "mental", "chat", "insights", "profile"],
    pills: [
      { dot: "var(--lv)", label: "Cycle Day 14 · Ovulation", bg: "var(--lvl)" },
      { dot: "var(--sg)", label: "Folic acid ✓", bg: "var(--sgl)" },
      { dot: "var(--t)", label: "Fertile Window 🌸", bg: "var(--gdl)" },
    ],
    greeting: "Mama",
    taskIds: ["folic_acid", "hydration", "bbt", "ovulation_test", "sleep", "nutrition"],
    quickActions: [],
    showAlert: false,
  },

  ivf: {
    id: 'ivf',
    name: 'IVF & Fertility',
    description: 'IVF treatment support',
    tabs: ["home", "treatment", "medications", "embryos", "scans", "insights", "profile", "chat"],
    // Added "embryos" tab
    pills: [
      { dot: "var(--lv)", label: "Cycle Day 14 · Stimulation", bg: "var(--lvl)" },
      { dot: "var(--sg)", label: "4/5 meds taken ✓", bg: "var(--sgl)" },
      { dot: "var(--t)", label: "14 follicles 📊", bg: "var(--gdl)" },
    ],
    greeting: "Warrior",
    taskIds: ["medications", "injections", "hydration", "rest", "mood_log"],
    quickActions: [],
    showAlert: true,
  },

  mom: {
    id: 'mom',
    name: 'Postpartum & Nursing',
    description: 'Postpartum recovery and baby care',
    tabs: ["home", "nursing", "baby", "nutrition", "vitals", "health", "mental", "chat", "insights", "profile"],
    //      ^^^^^^^^^^ Add 'nursing' here
    pills: [
      { dot: "var(--t)", label: "Week 6 Postpartum", bg: "var(--gdl)" },
      { dot: "var(--sg)", label: "Breastfeeding · Day 42", bg: "var(--sgl)" },
      { dot: "var(--lv)", label: "Recovery: On track 💪", bg: "var(--lvl)" },
    ],
    greeting: "Mama",
    taskIds: ["feed_baby", "hydration", "diaper_change", "rest", "postnatal_check", "nutrition"],
    quickActions: [],
    showAlert: true,
  },

  menstrual: {
    id: 'menstrual',
    name: 'Menstrual Health',
    description: 'Track your menstrual cycle',
    tabs: ["home", "menstrual", "nutrition", "vitals", "health", "mental", "chat", "insights", "profile"],
    pills: [],
    greeting: "Queen",
    taskIds: ["log_period", "hydration", "track_symptoms", "mood_log", "exercise", "sleep"],
    quickActions: [],
    showAlert: false,
  },

  menopause: {
    id: 'menopause',
    name: 'Menopause Support',
    description: 'Navigate menopause with confidence',
    tabs: ["home", "menopause", "nutrition", "vitals", "health", "mental", "chat", "insights", "profile"],
    pills: [],
    greeting: "Queen",
    taskIds: ["log_symptoms", "hydration", "sleep_track", "mood_log", "exercise", "hrt_medication"],
    quickActions: [],
    showAlert: true,
  }
};

// Backward compatibility
export const BLOOM_KB = JOURNEY_CONFIG;

// Keep your existing ALL_TASKS (paste your full ALL_TASKS array here)
export const ALL_TASKS = [
  // ... paste all your tasks from the previous message here ...
  // Make sure this array is complete
];

// Other exports you already had
export const TTC_TIPS = []; // add your content if needed
export const FERTILITY_MYTHS = [];
export const JOURNEY_META = {};

// Helper
export function getConfigKey(key) {
  const map = { ttc: 'conceive', nursing: 'mom' };
  return map[key] || key;
}