// data/homeConfig.js

// Journey Meta Information
export const JOURNEY_META = {
  pregnant: {
    label: "Pregnancy Journey",
    accent: "#E57C1A",
    accentSoft: "#FFF3E0",
    icon: "🤰",
    description: "Track your pregnancy week by week"
  },
  ttc: {
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
  nursing: {
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

// Home Page Configuration by Journey Type
export const HOME_CONFIG = {
  // PREGNANT JOURNEY
  pregnant: {
    heroTitle: "Your baby is growing beautifully 🌸",
    heroBody: "Focus on iron-rich foods, stay hydrated, and monitor your blood pressure daily.",
    heroBg: "linear-gradient(135deg, #FFF5E6, #FFEFD6)",
    heroIllo: "/pregnancy.png",
    
    stats: [
      { icon: "🤰", label: "Weeks", value: "26", sub: "2nd Trimester" },
      { icon: "📅", label: "Days to EDD", value: "98", sub: "Due: July 15" },
      { icon: "💪", label: "Iron Level", value: "Low", sub: "Take supplements" },
      { icon: "👶", label: "Baby Size", value: "Scallion", sub: "~35cm" }
    ],
    
    trackers: [
      { id: "weight", icon: "⚖️", label: "Weight", value: "68.5 kg", target: "Target: 72 kg", pct: 65, color: "#E57C1A" },
      { id: "bp", icon: "❤️", label: "Blood Pressure", value: "118/76", target: "Normal range", pct: 85, color: "#2E9E67" },
      { id: "kicks", icon: "👣", label: "Kicks", value: "7 today", target: "Target: 10/2hr", pct: 70, color: "#9B8FD8" },
      { id: "water", icon: "💧", label: "Water", value: "1.8L", target: "Target: 2.5L", pct: 72, color: "#3A78C4" }
    ],
    
    checklist: [
      { id: "prenatal", label: "Take prenatal vitamins", done: false },
      { id: "water", label: "Drink 2L water", done: false },
      { id: "kicks", label: "Count baby kicks", done: false },
      { id: "bp", label: "Check blood pressure", done: false },
      { id: "walk", label: "Walk 20 minutes", done: false }
    ],
    
    quickActions: [
      { id: "kicks", emoji: "👣", label: "Kick Counter" },
      { id: "vitals", emoji: "💊", label: "Log Vitals" },
      { id: "nutrition", emoji: "🍎", label: "Food Log" },
      { id: "chat", emoji: "🤖", label: "Ask AI" }
    ],
    
    insights: [
      { icon: "💊", title: "Iron Deficiency", body: "Your haemoglobin is low. Eat more ugu, spinach, and lean meat.", color: "#E57C1A", bg: "#FFF3E0" },
      { icon: "💧", title: "Hydration", body: "You're 0.7L below target. Dehydration can cause Braxton Hicks.", color: "#3A78C4", bg: "#E4EFF9" },
      { icon: "👶", title: "Baby Movement", body: "Pattern is normal. Keep counting daily after meals.", color: "#2E9E67", bg: "#E8F7EE" }
    ],
    
    appointments: [
      { date: "Mar 15", label: "Midwife Appointment", location: "Community Health Centre", urgent: false },
      { date: "Mar 22", label: "Blood Test", location: "Hospital Lab", urgent: false },
      { date: "Mar 30", label: "28-Week Scan", location: "Fetal Medicine Unit", urgent: false }
    ],
    
    alert: {
      title: "Anaemia Risk Alert",
      body: "Your last haemoglobin was 9.2 g/dL (low). Eat iron-rich foods and take your supplements.",
      color: "#E57C1A",
      bg: "#FFF3E0"
    }
  },
  
  // TRYING TO CONCEIVE (TTC) JOURNEY
  ttc: {
    heroTitle: "Your fertile window is approaching 🌸",
    heroBody: "Track BBT and cervical mucus daily for the most accurate ovulation prediction.",
    heroBg: "linear-gradient(135deg, #FDE8F0, #FFF0F5)",
    heroIllo: "/ttc.png",
    
    stats: [
      { icon: "📅", label: "Cycle Day", value: "12", sub: "Fertile window soon" },
      { icon: "🥚", label: "Ovulation", value: "Day 14", sub: "In 2 days" },
      { icon: "🌡️", label: "BBT Avg", value: "36.4°C", sub: "Pre-ovulation" },
      { icon: "💪", label: "Luteal Phase", value: "14 days", sub: "Normal range" }
    ],
    
    trackers: [
      { id: "cycle", icon: "📅", label: "Cycle", value: "28 days", target: "Regular", pct: 80, color: "#D63A6E" },
      { id: "bbt", icon: "🌡️", label: "BBT", value: "36.4°C", target: "Pre-ovulation", pct: 60, color: "#E57C1A" },
      { id: "cm", icon: "💧", label: "Cervical Mucus", value: "Creamy", target: "Egg white", pct: 50, color: "#9B8FD8" },
      { id: "lh", icon: "🥚", label: "LH Test", value: "Negative", target: "Peak", pct: 40, color: "#3A78C4" }
    ],
    
    checklist: [
      { id: "folic", label: "Take folic acid", done: false },
      { id: "bbt", label: "Log BBT", done: false },
      { id: "opk", label: "Take ovulation test", done: false },
      { id: "water", label: "Drink 2L water", done: false },
      { id: "sleep", label: "Sleep 7-9 hours", done: false }
    ],
    
    quickActions: [
      { id: "cycle", emoji: "📅", label: "Log Period" },
      { id: "vitals", emoji: "🌡️", label: "Track BBT" },
      { id: "nutrition", emoji: "🥗", label: "Fertility Diet" },
      { id: "chat", emoji: "🤖", label: "Ask AI" }
    ],
    
    insights: [
      { icon: "🥚", title: "Fertile Window", body: "Your fertile window opens in 2 days. Have sex every other day.", color: "#D63A6E", bg: "#FDE8F0" },
      { icon: "💊", title: "Supplements", body: "Continue folic acid daily. Consider CoQ10 for egg quality.", color: "#9B8FD8", bg: "#F0EEFF" },
      { icon: "😴", title: "Stress Management", body: "High cortisol can delay ovulation. Try our 4-7-8 breathing exercise.", color: "#2E9E67", bg: "#E8F7EE" }
    ],
    
    appointments: [
      { date: "Mar 20", label: "GP Appointment", location: "Local GP Surgery", urgent: false },
      { date: "Apr 5", label: "Fertility Blood Test", location: "Hospital Lab", urgent: false }
    ],
    
    alert: {
      title: "Fertile Window Approaching",
      body: "Based on your last 3 cycles, your peak fertility is predicted for days 14-16.",
      color: "#D63A6E",
      bg: "#FDE8F0"
    }
  },
  
  // IVF JOURNEY
  ivf: {
    heroTitle: "Your embryos are developing beautifully 💜",
    heroBody: "Rest, hydrate, and be gentle with yourself today. You're doing something extraordinary.",
    heroBg: "linear-gradient(135deg, #F0EEFF, #E8E4F8)",
    heroIllo: "/ivf.png",
    
    stats: [
      { icon: "💜", label: "Cycle Day", value: "14", sub: "Stimulation Phase" },
      { icon: "🥚", label: "Follicles", value: "14", sub: "Good response" },
      { icon: "💊", label: "Meds Taken", value: "96%", sub: "On track" },
      { icon: "🔬", label: "Embryos", value: "4", sub: "2 frozen, 1 transfer-ready" }
    ],
    
    trackers: [
      { id: "meds", icon: "💊", label: "Medications", value: "4/5 taken", target: "100%", pct: 80, color: "#9B8FD8" },
      { id: "injections", icon: "💉", label: "Injections", value: "Gonal-F", target: "Daily", pct: 85, color: "#D63A6E" },
      { id: "scans", icon: "🔬", label: "Scans", value: "3/4", target: "Complete", pct: 75, color: "#E57C1A" },
      { id: "hydration", icon: "💧", label: "Water", value: "2.1L", target: "2.5L", pct: 84, color: "#3A78C4" }
    ],
    
    checklist: [
      { id: "medications", label: "Take morning medications", done: false },
      { id: "injection", label: "Administer injection", done: false },
      { id: "hydration", label: "Drink 2.5L water", done: false },
      { id: "rest", label: "Rest for 30 minutes", done: false },
      { id: "mood", label: "Log mood", done: false }
    ],
    
    quickActions: [
      { id: "medications", emoji: "💊", label: "Log Meds" },
      { id: "scans", emoji: "🔬", label: "Scan Results" },
      { id: "nutrition", emoji: "🥑", label: "IVF Diet" },
      { id: "chat", emoji: "🤖", label: "Ask AI" }
    ],
    
    insights: [
      { icon: "💜", title: "Medication Adherence", body: "You've taken 96% of doses on time. Keep going!", color: "#9B8FD8", bg: "#F0EEFF" },
      { icon: "🔬", title: "Embryo Quality", body: "Your top embryo is graded AA - excellent quality.", color: "#2E9E67", bg: "#E8F7EE" },
      { icon: "✨", title: "Follicle Response", body: "14 follicles is above average for your protocol. Strong response!", color: "#E57C1A", bg: "#FFF3E0" }
    ],
    
    appointments: [
      { date: "Mar 26", label: "Egg Retrieval", location: "Fertility Clinic", urgent: true },
      { date: "Mar 31", label: "Embryo Transfer", location: "Fertility Clinic", urgent: false },
      { date: "Apr 14", label: "Pregnancy Test", location: "Fertility Clinic", urgent: false }
    ],
    
    alert: {
      title: "Medication Reminder",
      body: "Your progesterone injection is due at 9 PM tonight.",
      color: "#D63A6E",
      bg: "#FDE8F0"
    }
  },
  
  // POSTPARTUM / NURSING JOURNEY
  nursing: {
    heroTitle: "You're doing an amazing job, mama 🍼",
    heroBody: "Rest when baby rests, stay hydrated, and accept help. You're healing and growing.",
    heroBg: "linear-gradient(135deg, #E8F7EE, #DFF0E6)",
    heroIllo: "/nursing.png",
    
    stats: [
      { icon: "🍼", label: "Baby Age", value: "8 weeks", sub: "2 months" },
      { icon: "🤱", label: "Feeds Today", value: "8", sub: "On demand" },
      { icon: "💧", label: "Wet Diapers", value: "6", sub: "Normal" },
      { icon: "😴", label: "Sleep Today", value: "14h", sub: "Baby total" }
    ],
    
    trackers: [
      { id: "feeds", icon: "🍼", label: "Breastfeeding", value: "8 feeds", target: "8-12", pct: 80, color: "#2E9E67" },
      { id: "pump", icon: "🥛", label: "Pumping", value: "120ml", target: "150ml", pct: 80, color: "#9B8FD8" },
      { id: "diapers", icon: "🚼", label: "Diapers", value: "6 wet", target: "6-8", pct: 85, color: "#3A78C4" },
      { id: "sleep", icon: "😴", label: "Baby Sleep", value: "14h", target: "14-17h", pct: 82, color: "#E57C1A" }
    ],
    
    checklist: [
      { id: "feed", label: "Feed baby (8+ times)", done: false },
      { id: "diaper", label: "Change diapers", done: false },
      { id: "rest", label: "Rest when baby sleeps", done: false },
      { id: "hydration", label: "Drink 3L water", done: false },
      { id: "postnatal", label: "Book 6-week check", done: false }
    ],
    
    quickActions: [
      { id: "feeds", emoji: "🍼", label: "Log Feed" },
      { id: "baby", emoji: "👶", label: "Baby Tracker" },
      { id: "nutrition", emoji: "🥗", label: "Postpartum Diet" },
      { id: "chat", emoji: "🤖", label: "Ask AI" }
    ],
    
    insights: [
      { icon: "🤱", title: "Milk Supply", body: "Your supply is establishing well. Cluster feeding is normal.", color: "#2E9E67", bg: "#E8F7EE" },
      { icon: "💙", title: "Postpartum Recovery", body: "Your 6-week check is due. Book with your GP.", color: "#3A78C4", bg: "#E4EFF9" },
      { icon: "😴", title: "Baby Sleep", body: "2-4 hour cycles are normal for 8-week-olds. It gets better!", color: "#9B8FD8", bg: "#F0EEFF" }
    ],
    
    appointments: [
      { date: "Mar 20", label: "6-Week Postnatal Check", location: "GP Surgery", urgent: true },
      { date: "Mar 27", label: "Baby Weight Check", location: "Health Visitor", urgent: false },
      { date: "Apr 10", label: "First Vaccinations", location: "GP Surgery", urgent: false }
    ],
    
    alert: {
      title: "Postnatal Check Due",
      body: "Your 6-week postnatal check is overdue. Please book with your GP.",
      color: "#E57C1A",
      bg: "#FFF3E0"
    }
  },
  
  // MENSTRUAL HEALTH JOURNEY
  menstrual: {
    heroTitle: "Listen to what your body needs today 🌙",
    heroBody: "Track your symptoms and mood to understand your unique cycle pattern.",
    heroBg: "linear-gradient(135deg, #E4EFF9, #DAE8F5)",
    heroIllo: "/menstrual.png",
    
    stats: [
      { icon: "📅", label: "Cycle Day", value: "12", sub: "Follicular Phase" },
      { icon: "🥚", label: "Ovulation", value: "Day 14", sub: "In 2 days" },
      { icon: "💪", label: "Cycle Length", value: "28 days", sub: "Regular" },
      { icon: "😊", label: "Mood", value: "Good", sub: "Energy rising" }
    ],
    
    trackers: [
      { id: "period", icon: "🩸", label: "Period", value: "Day 1-5", target: "Regular", pct: 100, color: "#D63A6E" },
      { id: "symptoms", icon: "📋", label: "Symptoms", value: "3 logged", target: "Track daily", pct: 60, color: "#E57C1A" },
      { id: "mood", icon: "😊", label: "Mood", value: "Calm", target: "Stable", pct: 75, color: "#9B8FD8" },
      { id: "sleep", icon: "😴", label: "Sleep", value: "7.2h", target: "7-9h", pct: 80, color: "#3A78C4" }
    ],
    
    checklist: [
      { id: "log_period", label: "Log period start/end", done: false },
      { id: "symptoms", label: "Track symptoms", done: false },
      { id: "mood", label: "Log mood", done: false },
      { id: "water", label: "Drink 2L water", done: false },
      { id: "exercise", label: "Light exercise", done: false }
    ],
    
    quickActions: [
      { id: "period", emoji: "🩸", label: "Log Period" },
      { id: "symptoms", emoji: "📋", label: "Symptoms" },
      { id: "nutrition", emoji: "🍫", label: "Cycle Diet" },
      { id: "chat", emoji: "🤖", label: "Ask AI" }
    ],
    
    insights: [
      { icon: "🌙", title: "Cycle Phase", body: "You're in your follicular phase. Energy is rising - great time for activity!", color: "#3A78C4", bg: "#E4EFF9" },
      { icon: "😊", title: "Mood Pattern", body: "Your mood improves significantly after day 5 of your cycle.", color: "#2E9E67", bg: "#E8F7EE" },
      { icon: "💪", title: "Cycle Regularity", body: "Your cycle is regular (28 days). Track ovulation for best results.", color: "#D63A6E", bg: "#FDE8F0" }
    ],
    
    appointments: [
      { date: "Jun 10", label: "Smear Test Due", location: "GP Surgery", urgent: false },
      { date: "Jul 15", label: "GP Review", location: "Local GP", urgent: false }
    ],
    
    alert: {
      title: "Smear Test Reminder",
      body: "Your cervical screening is due this month. Book with your GP.",
      color: "#D63A6E",
      bg: "#FDE8F0"
    }
  },
  
  // MENOPAUSE JOURNEY
  menopause: {
    heroTitle: "Honour your body today 🦋",
    heroBody: "Menopause is a transition, not an ending. Track your symptoms and rest when needed.",
    heroBg: "linear-gradient(135deg, #F0E8FB, #EDE0F8)",
    heroIllo: "/menopause.png",
    
    stats: [
      { icon: "🌡️", label: "Hot Flashes", value: "3 today", sub: "Moderate" },
      { icon: "😴", label: "Sleep Quality", value: "5.5h", sub: "Poor" },
      { icon: "💪", label: "Mood", value: "Anxious", sub: "Track daily" },
      { icon: "💜", label: "HRT", value: "Active", sub: "Estrogen patch" }
    ],
    
    trackers: [
      { id: "hot_flashes", icon: "🌡️", label: "Hot Flashes", value: "3/day", target: "Track", pct: 60, color: "#E57C1A" },
      { id: "sleep", icon: "😴", label: "Sleep", value: "5.5h", target: "7-8h", pct: 70, color: "#9B8FD8" },
      { id: "mood", icon: "😊", label: "Mood", value: "Anxious", target: "Stable", pct: 50, color: "#D63A6E" },
      { id: "exercise", icon: "🚶‍♀️", label: "Activity", value: "20 min", target: "30 min", pct: 67, color: "#2E9E67" }
    ],
    
    checklist: [
      { id: "symptoms", label: "Log hot flashes & symptoms", done: false },
      { id: "sleep", label: "Track sleep quality", done: false },
      { id: "mood", label: "Log mood", done: false },
      { id: "hydration", label: "Drink 2L water", done: false },
      { id: "hrt", label: "Take HRT medication", done: false }
    ],
    
    quickActions: [
      { id: "symptoms", emoji: "🌡️", label: "Log Symptoms" },
      { id: "sleep", emoji: "😴", label: "Sleep Tracker" },
      { id: "nutrition", emoji: "🥛", label: "Menopause Diet" },
      { id: "chat", emoji: "🤖", label: "Ask AI" }
    ],
    
    insights: [
      { icon: "🦋", title: "Symptom Pattern", body: "Hot flashes increase with stress and caffeine. Try our breathing exercises.", color: "#9A3DDE", bg: "#F0E8FB" },
      { icon: "💪", title: "Bone Health", body: "Calcium and Vitamin D are essential now. Add dairy or fortified alternatives.", color: "#3A78C4", bg: "#E4EFF9" },
      { icon: "💤", title: "Sleep Quality", body: "Poor sleep worsens hot flashes. Cool room, cotton sheets, and evening routine help.", color: "#2E9E67", bg: "#E8F7EE" }
    ],
    
    appointments: [
      { date: "Apr 10", label: "GP Review - HRT", location: "Local GP", urgent: false },
      { date: "May 5", label: "DEXA Bone Scan", location: "Hospital", urgent: false }
    ],
    
    alert: {
      title: "Sleep Quality Alert",
      body: "You've had poor sleep for 3 nights. This can intensify hot flashes and mood changes.",
      color: "#9A3DDE",
      bg: "#F0E8FB"
    }
  }
};

// Helper function to get home config by journey type
export function getHomeConfig(journeyType) {
  return HOME_CONFIG[journeyType] || HOME_CONFIG.pregnant;
}

// Helper function to get journey meta by type
export function getJourneyMeta(journeyType) {
  return JOURNEY_META[journeyType] || JOURNEY_META.pregnant;
}

// Helper function to calculate progress percentage for stats
export function calculateProgress(current, target) {
  if (!target) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}