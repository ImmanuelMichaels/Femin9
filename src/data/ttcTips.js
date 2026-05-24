// data/journey.js

export const JOURNEY_CONFIG = {
  pregnant: {
    id: 'pregnant',
    name: 'Pregnancy',
    description: 'Track your pregnancy journey',
    tabs: ['home', 'kicks', 'vitals', 'nutrition', 'health', 'chat', 'insights', 'profile'],
    taskIds: ['prenatal_vitamins', 'hydration', 'kicks', 'bp_check', 'walk', 'rest'],
    features: ['kick_counter', 'contraction_timer', 'birth_plan', 'appointment_tracker']
  },
  ttc: {
    id: 'ttc',
    name: 'Trying to Conceive',
    description: 'Track your fertility journey',
    tabs: ['home', 'ttc', 'nutrition', 'health', 'chat', 'insights', 'profile'],
    taskIds: ['folic_acid', 'bbt', 'ovulation_test', 'hydration', 'sleep'],
    features: ['cycle_tracker', 'ovulation_predictor', 'bbt_chart', 'lh_tracker']
  },
  ivf: {
    id: 'ivf',
    name: 'IVF & Fertility',
    description: 'IVF treatment support',
    tabs: ['home', 'ivf', 'nutrition', 'chat', 'insights', 'profile'],
    taskIds: ['medications', 'injections', 'hydration', 'rest', 'mood_log'],
    features: ['medication_tracker', 'embryo_tracker', 'scan_log', 'tww_support']
  },
  nursing: {
    id: 'nursing',
    name: 'Postpartum & Nursing',
    description: 'Postpartum recovery and baby care',
    tabs: ['home', 'baby', 'nutrition', 'vitals', 'chat', 'insights', 'profile'],
    taskIds: ['feed_baby', 'pump', 'diaper_change', 'rest', 'hydration', 'postnatal_check'],
    features: ['feeding_tracker', 'pump_log', 'sleep_tracker', 'vaccination_reminders', 'epds_screening']
  },
  menstrual: {
    id: 'menstrual',
    name: 'Menstrual Health',
    description: 'Track your menstrual cycle',
    tabs: ['home', 'menstrual', 'nutrition', 'chat', 'insights', 'profile'],
    taskIds: ['log_period', 'track_symptoms', 'hydration', 'exercise'],
    features: ['period_tracker', 'symptom_log', 'mood_tracker', 'cycle_insights']
  },
  menopause: {
    id: 'menopause',
    name: 'Menopause Support',
    description: 'Navigate menopause with confidence',
    tabs: ['home', 'menopause', 'nutrition', 'chat', 'insights', 'profile'],
    taskIds: ['log_symptoms', 'hydration', 'exercise', 'sleep_track', 'mood_log'],
    features: ['symptom_tracker', 'hrt_logger', 'bone_health', 'heart_health']
  }
};

// All available tasks with descriptions
export const ALL_TASKS = [
  // Pregnancy tasks
  { id: 'prenatal_vitamins', title: 'Take prenatal vitamins', category: 'medication', journey: 'pregnant' },
  { id: 'hydration', title: 'Drink 2-3L water', category: 'wellness', journey: 'all' },
  { id: 'kicks', title: 'Count baby kicks (2hr session)', category: 'tracking', journey: 'pregnant' },
  { id: 'bp_check', title: 'Check blood pressure', category: 'health', journey: 'pregnant' },
  { id: 'walk', title: 'Walk 20-30 minutes', category: 'exercise', journey: 'all' },
  { id: 'rest', title: 'Take a rest break', category: 'wellness', journey: 'all' },
  
  // TTC tasks
  { id: 'folic_acid', title: 'Take folic acid', category: 'medication', journey: 'ttc' },
  { id: 'bbt', title: 'Log BBT temperature', category: 'tracking', journey: 'ttc' },
  { id: 'ovulation_test', title: 'Take ovulation test', category: 'tracking', journey: 'ttc' },
  { id: 'sleep', title: 'Get 7-9 hours sleep', category: 'wellness', journey: 'all' },
  
  // IVF tasks
  { id: 'medications', title: 'Take IVF medications', category: 'medication', journey: 'ivf' },
  { id: 'injections', title: 'Administer injections', category: 'medication', journey: 'ivf' },
  { id: 'mood_log', title: 'Log your mood', category: 'mental', journey: 'all' },
  
  // Postpartum tasks
  { id: 'feed_baby', title: 'Feed baby (8-12x/day)', category: 'baby', journey: 'nursing' },
  { id: 'pump', title: 'Pump if needed', category: 'baby', journey: 'nursing' },
  { id: 'diaper_change', title: 'Track diaper changes', category: 'baby', journey: 'nursing' },
  { id: 'postnatal_check', title: 'Schedule 6-week check', category: 'appointment', journey: 'nursing' },
  
  // Menstrual tasks
  { id: 'log_period', title: 'Log period start/end', category: 'tracking', journey: 'menstrual' },
  { id: 'track_symptoms', title: 'Track PMS symptoms', category: 'tracking', journey: 'menstrual' },
  { id: 'exercise', title: 'Light exercise', category: 'exercise', journey: 'all' },
  
  // Menopause tasks
  { id: 'log_symptoms', title: 'Log hot flashes & symptoms', category: 'tracking', journey: 'menopause' },
  { id: 'sleep_track', title: 'Track sleep quality', category: 'wellness', journey: 'all' },
];

// TTC Tips
export const TTC_TIPS = [
  { icon: "🥚", title: "Best time for sex", body: "Have sex every other day during your fertile window (5 days before + 1 day after ovulation). Daily sex is not more effective." },
  { icon: "🍃", title: "Boost fertility with food", body: "Eat: Ugu leaf, Tiger Nuts (Aya), Garden eggs, Avocado, Fish, Eggs. These boost progesterone, iron, and Omega-3 — all critical for conception." },
  { icon: "🚫", title: "Avoid in your cycle", body: "Avoid: Agbo (herbal mixtures), excessive zobo, strong pain killers around ovulation (NSAIDs suppress ovulation). No alcohol — it disrupts implantation." },
  { icon: "🌡️", title: "After sex", body: "Lie down for 15–20 minutes after sex. No need to elevate legs dramatically, but avoid immediately standing and running." },
  { icon: "💊", title: "Supplements to start now", body: "Folic acid (400mcg daily — start before conception), Vitamin D3 (1000 IU), Zinc (for sperm quality if partner is involved)." },
  { icon: "😴", title: "Stress and TTC", body: "Chronic stress raises cortisol, which suppresses LH (the ovulation trigger). Sleep 7–9 hours. 4-7-8 breathing helps. See Mind tab." },
  { icon: "🩺", title: "When to see a doctor", body: "If no pregnancy after 12 months of trying (or 6 months if over 35). Get: Hormonal panel (Day 3 FSH/LH/E2), HSG scan, semen analysis." },
];

// Fertility Myths (Nigeria-specific)
export const FERTILITY_MYTHS = [
  ["Eating unripe pawpaw boosts fertility", "FALSE", "Contains papain — actually disrupts implantation. Avoid."],
  ["Drinking Agbo increases chances", "UNKNOWN", "Most Agbo mixtures have unknown compositions. Some contain abortifacients. Avoid."],
  ["You can't get pregnant while breastfeeding", "FALSE", "You can — ovulation returns before your period. Always track."],
  ["Legs up after sex for 30 minutes is necessary", "EXAGGERATED", "15 mins resting is fine. Sperm reach the fallopian tube within 90 seconds."],
  ["Eating Okra improves fertility", "PARTIALLY TRUE", "Okra is rich in folate but doesn't directly boost fertility. Still a healthy food!"],
  ["Hot baths increase fertility", "FALSE", "Excessive heat can reduce sperm quality. Warm baths only."],
  ["Herbal teas boost conception", "UNKNOWN", "Most herbal teas (zobo, ginger, mint) are fine in moderation but not proven to boost fertility."],
];

// Menopause symptoms tracker
export const MENOPAUSE_SYMPTOMS = [
  "Hot flashes", "Night sweats", "Sleep issues", "Brain fog", "Mood changes", 
  "Joint pain", "Vaginal dryness", "Low libido", "Weight gain", "Hair thinning",
  "Anxiety", "Depression", "Heart palpitations", "Headaches", "Fatigue"
];

// Postpartum recovery timeline
export const POSTPARTUM_TIMELINE = [
  { week: 1, title: "First Week", milestones: ["Rest and recovery", "Establish breastfeeding", "Monitor lochia (bleeding)", "Baby's first check"] },
  { week: 2, title: "Week 2", milestones: ["Continue rest", "Healing continues", "Baby weight check"] },
  { week: 6, title: "Week 6", milestones: ["Postnatal check (mum & baby)", "Contraception discussion", "PPD screening (EPDS)", "Exercise may resume"] },
  { week: 12, title: "Week 12", milestones: ["Physical recovery", "Baby's first vaccines (8-12 weeks)", "Return to work planning"] },
  { week: 26, title: "6 Months", milestones: ["Introduce solids (around 6 months)", "Baby's development check", "Mum's wellbeing"] },
];

// Baby milestones (by week)
export const BABY_MILESTONES = [
  { week: 0, milestone: "Eye response to light", category: "vision" },
  { week: 0, milestone: "Startle reflex (Moro)", category: "reflexes" },
  { week: 1, milestone: "Responds to your voice", category: "hearing" },
  { week: 2, milestone: "Follows objects with eyes", category: "vision" },
  { week: 6, milestone: "Social smile", category: "social" },
  { week: 8, milestone: "Head control attempt", category: "motor" },
  { week: 12, milestone: "Reaches for objects", category: "motor" },
  { week: 16, milestone: "Rolls over", category: "motor" },
  { week: 24, milestone: "Sits with support", category: "motor" },
  { week: 24, milestone: "Babbles", category: "communication" },
  { week: 32, milestone: "Sits without support", category: "motor" },
  { week: 40, milestone: "Crawls", category: "motor" },
  { week: 48, milestone: "Pulls to stand", category: "motor" },
  { week: 52, milestone: "First words", category: "communication" },
];

// NHS Vaccination Schedule (UK)
export const VACCINATION_SCHEDULE = [
  { age: "8 weeks", vaccines: ["6-in-1 (DTP/IPV/Hib/HepB)", "Rotavirus", "MenB"] },
  { age: "12 weeks", vaccines: ["6-in-1 (2nd dose)", "Rotavirus (2nd dose)", "PCV", "MenB (2nd dose)"] },
  { age: "16 weeks", vaccines: ["6-in-1 (3rd dose)", "MenB (3rd dose)"] },
  { age: "1 year (52 weeks)", vaccines: ["MMR (1st dose)", "PCV booster", "Hib/MenC booster", "MenB booster"] },
  { age: "3 years 4 months", vaccines: ["MMR (2nd dose)", "4-in-1 pre-school booster"] },
];

// Emergency contact numbers (Nigeria + UK)
export const EMERGENCY_CONTACTS = {
  nigeria: [
    { name: "National Emergency Number", number: "112", description: "Police, Ambulance, Fire" },
    { name: "Lagos State Emergency (LASEMA)", number: "767", description: "Lagos State Emergency" },
    { name: "Nigerian Police Force", number: "199", description: "Emergency police response" },
    { name: "Domestic Violence Helpline", number: "0800 333 333", description: "24/7 confidential support" },
  ],
  uk: [
    { name: "Emergency Services", number: "999", description: "Police, Ambulance, Fire" },
    { name: "NHS 111", number: "111", description: "Non-emergency medical advice" },
    { name: "Samaritans", number: "116 123", description: "Mental health crisis support (24/7)" },
    { name: "National Domestic Abuse Helpline", number: "0808 2000 247", description: "Free, confidential support" },
  ]
};

// Journey meta information for Home component
export const JOURNEY_META = {
  pregnant: {
    label: "Pregnancy Journey",
    accent: "#E57C1A",
    accentSoft: "#FFF3E0",
    icon: "🤰"
  },
  ttc: {
    label: "Fertility Journey",
    accent: "#D63A6E",
    accentSoft: "#FDE8F0",
    icon: "🌸"
  },
  ivf: {
    label: "IVF Journey",
    accent: "#9B8FD8",
    accentSoft: "#F0EEFF",
    icon: "💜"
  },
  nursing: {
    label: "Postpartum Journey",
    accent: "#2E9E67",
    accentSoft: "#E8F7EE",
    icon: "🍼"
  },
  menstrual: {
    label: "Menstrual Health",
    accent: "#3A78C4",
    accentSoft: "#E4EFF9",
    icon: "🌙"
  },
  menopause: {
    label: "Menopause Support",
    accent: "#9A3DDE",
    accentSoft: "#F0E8FB",
    icon: "🦋"
  }
};

// Helper function to get journey config by type
export function getJourneyConfig(journeyType) {
  return JOURNEY_CONFIG[journeyType] || JOURNEY_CONFIG.pregnant;
}

// Helper function to get tasks for a journey - FIXED: removed extra space
export function getTasksForJourney(journeyType) {
  const config = getJourneyConfig(journeyType);
  return ALL_TASKS.filter(task => 
    task.journey === journeyType || task.journey === 'all'
  );
}

export function getBabyMilestone(week) {
  const milestone = BABY_MILESTONES
    .filter(m => m.week <= week)
    .sort((a, b) => b.week - a.week)[0];
  return milestone || BABY_MILESTONES[0];
}

export function getUpcomingVaccinations(weeksOld) {
  return VACCINATION_SCHEDULE.filter(v => {
    const ageInWeeks = parseInt(v.age.split(' ')[0]) * 4; 
    return ageInWeeks > weeksOld;
  });
}

export function getPostpartumInfo(week) {
  const timeline = POSTPARTUM_TIMELINE.find(t => t.week === week) ||
                   POSTPARTUM_TIMELINE.find(t => t.week > week) ||
                   POSTPARTUM_TIMELINE[POSTPARTUM_TIMELINE.length - 1];
  return timeline;
}