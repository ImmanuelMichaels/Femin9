// data/journey.js

export const JOURNEY_CONFIG = {
  // PREGNANT JOURNEY
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
    quickActions: [
      { icon: "🔬", label: "Drug Safety", id: "health", bg: "var(--bll)", color: "var(--bl)" },
      { icon: "🍎", label: "Nutrition", id: "nutrition", bg: "var(--sgl)", color: "var(--sg)" },
      { icon: "👣", label: "Kick Counter", id: "kicks", bg: "var(--lvl)", color: "var(--lv)" },
      { icon: "🆘", label: "SOS", id: "sos", bg: "var(--rdl)", color: "var(--rd)" },
    ],
    showAlert: true,
    features: ['kick_counter', 'contraction_timer', 'birth_plan', 'appointment_tracker']
  },
  
  // TRYING TO CONCEIVE (TTC)
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
    quickActions: [
      { icon: "📅", label: "Log Period", id: "ttc", bg: "var(--bll)", color: "var(--bl)" },
      { icon: "🌡️", label: "Track BBT", id: "vitals", bg: "var(--sgl)", color: "var(--sg)" },
      { icon: "🥗", label: "Fertility Diet", id: "nutrition", bg: "var(--lvl)", color: "var(--lv)" },
      { icon: "🆘", label: "SOS", id: "sos", bg: "var(--rdl)", color: "var(--rd)" },
    ],
    showAlert: false,
    features: ['cycle_tracker', 'ovulation_predictor', 'bbt_chart', 'lh_tracker']
  },
  
  // IVF & FERTILITY
  ivf: {
    id: 'ivf',
    name: 'IVF & Fertility',
    description: 'IVF treatment support',
    tabs: ["home", "ivf", "nutrition", "vitals", "health", "mental", "chat", "insights", "profile"],
    pills: [
      { dot: "var(--lv)", label: "Cycle Day 14 · Stimulation", bg: "var(--lvl)" },
      { dot: "var(--sg)", label: "4/5 meds taken ✓", bg: "var(--sgl)" },
      { dot: "var(--t)", label: "14 follicles 📊", bg: "var(--gdl)" },
    ],
    greeting: "Warrior",
    taskIds: ["medications", "injections", "hydration", "rest", "mood_log", "nutrition"],
    quickActions: [
      { icon: "💊", label: "Log Meds", id: "ivf", bg: "var(--bll)", color: "var(--bl)" },
      { icon: "🔬", label: "Scan Results", id: "health", bg: "var(--sgl)", color: "var(--sg)" },
      { icon: "🥑", label: "IVF Diet", id: "nutrition", bg: "var(--lvl)", color: "var(--lv)" },
      { icon: "🆘", label: "SOS", id: "sos", bg: "var(--rdl)", color: "var(--rd)" },
    ],
    showAlert: true,
    features: ['medication_tracker', 'embryo_tracker', 'scan_log', 'tww_support']
  },
  
  // POSTPARTUM / NURSING
  mom: {
    id: 'mom',
    name: 'Postpartum & Nursing',
    description: 'Postpartum recovery and baby care',
    tabs: ["home", "baby", "nutrition", "vitals", "health", "mental", "chat", "insights", "profile"],
    pills: [
      { dot: "var(--t)", label: "Week 6 Postpartum", bg: "var(--gdl)" },
      { dot: "var(--sg)", label: "Breastfeeding · Day 42", bg: "var(--sgl)" },
      { dot: "var(--lv)", label: "Recovery: On track 💪", bg: "var(--lvl)" },
    ],
    greeting: "Mama",
    taskIds: ["feed_baby", "hydration", "diaper_change", "rest", "postnatal_check", "nutrition"],
    quickActions: [
      { icon: "🍼", label: "Log Feed", id: "baby", bg: "var(--bll)", color: "var(--bl)" },
      { icon: "🥗", label: "Postpartum Diet", id: "nutrition", bg: "var(--sgl)", color: "var(--sg)" },
      { icon: "💊", label: "Vitals", id: "vitals", bg: "var(--lvl)", color: "var(--lv)" },
      { icon: "🆘", label: "SOS", id: "sos", bg: "var(--rdl)", color: "var(--rd)" },
    ],
    showAlert: true,
    features: ['feeding_tracker', 'pump_log', 'sleep_tracker', 'vaccination_reminders', 'epds_screening']
  },
  
  // MENSTRUAL HEALTH
  menstrual: {
    id: 'menstrual',
    name: 'Menstrual Health',
    description: 'Track your menstrual cycle',
    tabs: ["home", "menstrual", "nutrition", "vitals", "health", "mental", "chat", "insights", "profile"],
    pills: [
      { dot: "var(--lv)", label: "Follicular Phase", bg: "var(--lvl)" },
      { dot: "var(--sg)", label: "Energy rising ☀️", bg: "var(--sgl)" },
      { dot: "var(--t)", label: "Ovulation day 14", bg: "var(--gdl)" },
    ],
    greeting: "Queen",
    taskIds: ["log_period", "hydration", "track_symptoms", "mood_log", "exercise", "sleep"],
    quickActions: [
      { icon: "🩸", label: "Log Period", id: "menstrual", bg: "var(--bll)", color: "var(--bl)" },
      { icon: "📋", label: "Symptoms", id: "health", bg: "var(--sgl)", color: "var(--sg)" },
      { icon: "😊", label: "Mood", id: "mental", bg: "var(--lvl)", color: "var(--lv)" },
      { icon: "🆘", label: "SOS", id: "sos", bg: "var(--rdl)", color: "var(--rd)" },
    ],
    showAlert: false,
    features: ['period_tracker', 'symptom_log', 'mood_tracker', 'cycle_insights']
  },
  
  // MENOPAUSE
  menopause: {
    id: 'menopause',
    name: 'Menopause Support',
    description: 'Navigate menopause with confidence',
    tabs: ["home", "menopause", "nutrition", "vitals", "health", "mental", "chat", "insights", "profile"],
    pills: [
      { dot: "var(--lv)", label: "Perimenopause", bg: "var(--lvl)" },
      { dot: "var(--sg)", label: "3 hot flashes today", bg: "var(--sgl)" },
      { dot: "var(--t)", label: "HRT: Active 💜", bg: "var(--gdl)" },
    ],
    greeting: "Queen",
    taskIds: ["log_symptoms", "hydration", "sleep_track", "mood_log", "exercise", "hrt_medication"],
    quickActions: [
      { icon: "🌡️", label: "Log Symptoms", id: "menopause", bg: "var(--bll)", color: "var(--bl)" },
      { icon: "😴", label: "Sleep", id: "health", bg: "var(--sgl)", color: "var(--sg)" },
      { icon: "🥛", label: "Nutrition", id: "nutrition", bg: "var(--lvl)", color: "var(--lv)" },
      { icon: "🆘", label: "SOS", id: "sos", bg: "var(--rdl)", color: "var(--rd)" },
    ],
    showAlert: true,
    features: ['symptom_tracker', 'hrt_logger', 'bone_health', 'heart_health']
  }
};

// All available tasks with descriptions
export const ALL_TASKS = [
  // Pregnancy tasks
  { id: 'prenatal_vitamins', title: 'Take prenatal vitamins', category: 'medication', journey: 'pregnant' },
  { id: 'hydration', title: 'Drink 2-3L water', category: 'wellness', journey: 'all' },
  { id: 'vitals', title: 'Check blood pressure', category: 'health', journey: 'all' },
  { id: 'kicks', title: 'Count baby kicks (2hr session)', category: 'tracking', journey: 'pregnant' },
  { id: 'nutrition', title: 'Log your meals', category: 'tracking', journey: 'all' },
  { id: 'walk', title: 'Walk 20-30 minutes', category: 'exercise', journey: 'all' },
  
  // TTC tasks
  { id: 'folic_acid', title: 'Take folic acid', category: 'medication', journey: 'ttc' },
  { id: 'bbt', title: 'Log BBT temperature', category: 'tracking', journey: 'ttc' },
  { id: 'ovulation_test', title: 'Take ovulation test', category: 'tracking', journey: 'ttc' },
  { id: 'sleep', title: 'Get 7-9 hours sleep', category: 'wellness', journey: 'all' },
  
  // IVF tasks
  { id: 'medications', title: 'Take IVF medications', category: 'medication', journey: 'ivf' },
  { id: 'injections', title: 'Administer injections', category: 'medication', journey: 'ivf' },
  { id: 'rest', title: 'Rest for 30 minutes', category: 'wellness', journey: 'all' },
  { id: 'mood_log', title: 'Log your mood', category: 'mental', journey: 'all' },
  
  // Postpartum tasks
  { id: 'feed_baby', title: 'Feed baby (8-12x/day)', category: 'baby', journey: 'postpartum' },
  { id: 'diaper_change', title: 'Track diaper changes', category: 'baby', journey: 'postpartum' },
  { id: 'postnatal_check', title: 'Schedule 6-week check', category: 'appointment', journey: 'postpartum' },
  
  // Menstrual tasks
  { id: 'log_period', title: 'Log period start/end', category: 'tracking', journey: 'menstrual' },
  { id: 'track_symptoms', title: 'Track PMS symptoms', category: 'tracking', journey: 'menstrual' },
  { id: 'exercise', title: 'Light exercise', category: 'exercise', journey: 'all' },
  
  // Menopause tasks
  { id: 'log_symptoms', title: 'Log hot flashes & symptoms', category: 'tracking', journey: 'menopause' },
  { id: 'sleep_track', title: 'Track sleep quality', category: 'wellness', journey: 'all' },
  { id: 'hrt_medication', title: 'Take HRT medication', category: 'medication', journey: 'menopause' }
];

// TTC Tips - Nigeria Specific
export const TTC_TIPS = [
  { icon: "🥚", title: "Best time for sex", body: "Have sex every other day during your fertile window (5 days before + 1 day after ovulation). Daily sex is not more effective." },
  { icon: "🍃", title: "Boost fertility with food", body: "Eat: Ugu leaf, Tiger Nuts (Aya), Garden eggs, Avocado, Fish, Eggs. These boost progesterone, iron, and Omega-3 — all critical for conception." },
  { icon: "🚫", title: "Avoid in your cycle", body: "Avoid: Agbo (herbal mixtures), excessive zobo, strong pain killers around ovulation (NSAIDs suppress ovulation). No alcohol — it disrupts implantation." },
  { icon: "🌡️", title: "After sex", body: "Lie down for 15–20 minutes after sex. No need to elevate legs dramatically, but avoid immediately standing and running." },
  { icon: "💊", title: "Supplements to start now", body: "Folic acid (400mcg daily — start before conception), Vitamin D3 (1000 IU), Zinc (for sperm quality if partner is involved)." },
  { icon: "😴", title: "Stress and TTC", body: "Chronic stress raises cortisol, which suppresses LH (the ovulation trigger). Sleep 7–9 hours. 4-7-8 breathing helps. See Mind tab." },
  { icon: "🩺", title: "When to see a doctor", body: "If no pregnancy after 12 months of trying (or 6 months if over 35). Get: Hormonal panel (Day 3 FSH/LH/E2), HSG scan, semen analysis." }
];

// Fertility Myths (Nigeria-specific)
export const FERTILITY_MYTHS = [
  ["Eating unripe pawpaw boosts fertility", "FALSE", "Contains papain — actually disrupts implantation. Avoid."],
  ["Drinking Agbo increases chances", "UNKNOWN", "Most Agbo mixtures have unknown compositions. Some contain abortifacients. Avoid."],
  ["You can't get pregnant while breastfeeding", "FALSE", "You can — ovulation returns before your period. Always track."],
  ["Legs up after sex for 30 minutes is necessary", "EXAGGERATED", "15 mins resting is fine. Sperm reach the fallopian tube within 90 seconds."],
  ["Eating Okra improves fertility", "PARTIALLY TRUE", "Okra is rich in folate but doesn't directly boost fertility. Still a healthy food!"],
  ["Hot baths increase fertility", "FALSE", "Excessive heat can reduce sperm quality. Warm baths only."],
  ["Herbal teas boost conception", "UNKNOWN", "Most herbal teas (zobo, ginger, mint) are fine in moderation but not proven to boost fertility."]
];

// Journey meta information for Home component
export const JOURNEY_META = {
  pregnant: {
    label: "Pregnancy Journey",
    accent: "#E57C1A",
    accentSoft: "#FFF3E0",
    icon: "🤰",
    description: "Track your pregnancy week by week"
  },
  conceive: {
    label: "Fertility Journey",
    accent: "#D63A6E",
    accentSoft: "#FDE8F0",
    icon: "🌸",
    description: "Track your cycle and ovulation"
  },
  ivf: {
    label: "IVF Journey",
    accent: "#9B8FD8",
    accentSoft: "#F0EEFF",
    icon: "💜",
    description: "IVF treatment support"
  },
  mom: {
    label: "Postpartum Journey",
    accent: "#2E9E67",
    accentSoft: "#E8F7EE",
    icon: "🍼",
    description: "Postpartum recovery and baby care"
  },
  menstrual: {
    label: "Menstrual Health",
    accent: "#3A78C4",
    accentSoft: "#E4EFF9",
    icon: "🌙",
    description: "Track your menstrual cycle"
  },
  menopause: {
    label: "Menopause Support",
    accent: "#9A3DDE",
    accentSoft: "#F0E8FB",
    icon: "🦋",
    description: "Navigate menopause with confidence"
  }
};

// Helper function to get journey config by type
export function getJourneyConfig(journeyType) {
  return JOURNEY_CONFIG[journeyType] || JOURNEY_CONFIG.pregnant;
}

// Helper function to get tasks for a journey
export function getTasksForJourney(journeyType) {
  return ALL_TASKS.filter(task => 
    task.journey === journeyType || task.journey === 'all'
  );
}

// Helper function to convert onboarding ID to config key
export function getConfigKey(onboardingId) {
  const mapping = {
    pregnant: 'pregnant',
    conceive: 'conceive',
    ivf: 'ivf',
    mom: 'mom',
    menstrual: 'menstrual',
    menopause: 'menopause'
  };
  return mapping[onboardingId] || 'pregnant';
}