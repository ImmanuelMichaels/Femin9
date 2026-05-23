// data/safety.js

// Domestic Violence Contacts - Nigeria & UK
export const DV_CONTACTS = [
  {
    country: "Nigeria",
    flag: "🇳🇬",
    lines: [
      { name: "National Domestic Violence Helpline", num: "0800 333 333", hours: "24/7", free: true },
      { name: "Ministry of Women Affairs", num: "0800 111 222", hours: "9am-5pm", free: true },
      { name: "Lagos State Domestic Violence Response Team", num: "0700 000 3333", hours: "24/7", free: true },
      { name: "Project Alert on Violence Against Women", num: "0800 222 2222", hours: "24/7", free: true },
      { name: "Women at Risk International Foundation (WARIF)", num: "0800 921 000", hours: "24/7", free: true }
    ]
  },
  {
    country: "United Kingdom",
    flag: "🇬🇧",
    lines: [
      { name: "National Domestic Abuse Helpline", num: "0808 2000 247", hours: "24/7", free: true },
      { name: "Refuge (Women's Aid)", num: "0808 2000 247", hours: "24/7", free: true },
      { name: "Men's Advice Line", num: "0808 801 0327", hours: "Mon-Fri 9am-5pm", free: true },
      { name: "Galop (LGBT+ Domestic Abuse)", num: "0800 999 5428", hours: "Mon-Fri 10am-5pm", free: true },
      { name: "Respect (Perpetrator Support)", num: "0808 802 4040", hours: "Mon-Fri 9am-5pm", free: true }
    ]
  }
];

// Sexual Health Resources
export const SEXUAL_HEALTH = [
  {
    icon: "🩺",
    title: "STI Testing",
    tag: "Free & Confidential",
    desc: "Free STI testing available at NHS sexual health clinics. Results in 7-10 days. Walk-in or book online."
  },
  {
    icon: "💊",
    title: "Emergency Contraception",
    tag: "Available Now",
    desc: "Morning-after pill available at pharmacies without prescription. Effective up to 72 hours after unprotected sex (Levonelle) or 120 hours (EllaOne)."
  },
  {
    icon: "🛡️",
    title: "PrEP (HIV Prevention)",
    tag: "Free on NHS",
    desc: "Pre-exposure prophylaxis available free from sexual health clinics for those at high risk of HIV."
  },
  {
    icon: "🩸",
    title: "Cervical Screening (Smear Test)",
    tag: "Every 3 Years",
    desc: "Women aged 25-64: regular cervical screening prevents 75% of cervical cancers. Book with your GP."
  },
  {
    icon: "💉",
    title: "HPV Vaccine",
    tag: "Free for Ages 12-25",
    desc: "Protects against cervical cancer, genital warts, and other HPV-related cancers. Catch-up doses available."
  },
  {
    icon: "🤰",
    title: "Pregnancy Testing & Options",
    tag: "Free & Confidential",
    desc: "Free pregnancy tests at sexual health clinics. Confidential counselling on all options including abortion services."
  }
];

// 6-Step Incident Reporting Guide
export const REPORT_STEPS = [
  {
    n: 1,
    title: "Ensure Your Safety First",
    body: "Get to a safe place away from the abuser. If in immediate danger, call 999 (UK) or 112 (Nigeria)."
  },
  {
    n: 2,
    title: "Seek Medical Attention",
    body: "Go to a hospital or GP. Ask for a forensic exam if sexually assaulted (within 7 days). Do not shower or change clothes."
  },
  {
    n: 3,
    title: "Document Everything",
    body: "Take photos of injuries, save threatening messages/emails, keep a diary of incidents with dates and times."
  },
  {
    n: 4,
    title: "Contact a Support Organisation",
    body: "Call a domestic violence helpline for advice on safety planning and reporting options."
  },
  {
    n: 5,
    title: "File a Police Report",
    body: "Go to your local police station with your evidence. Ask for a female officer if preferred. Get a crime reference number."
  },
  {
    n: 6,
    title: "Get Legal Protection",
    body: "Apply for a restraining order or Non-Molestation Order through a family court. Legal aid may be available."
  }
];

// Free & Low-Cost Clinics - Nigeria
export const FREE_CLINICS = [
  {
    flag: "🇳🇬",
    name: "Lagos State Primary Health Care Board",
    area: "Lagos",
    detail: "Free condoms, family planning, STI testing. All LGAs have PHC centers. Walk-in, no appointment needed."
  },
  {
    flag: "🇳🇬",
    name: "Marie Stopes Nigeria",
    area: "Multiple Locations",
    detail: "Subsidised family planning, STI testing, contraception. Sliding scale fees based on income."
  },
  {
    flag: "🇳🇬",
    name: "Society for Family Health (SFH)",
    area: "Nationwide",
    detail: "Free HIV testing, family planning, condom distribution. Mobile clinics in rural areas."
  },
  {
    flag: "🇳🇬",
    name: "Nigerian Red Cross",
    area: "Nationwide",
    detail: "First aid, crisis support, referrals to free healthcare services."
  },
  {
    flag: "🇳🇬",
    name: "Teaching Hospitals (UTH, LUTH, ABU)",
    area: "Major Cities",
    detail: "Low-cost sexual health services. Medical students under supervision. Expect longer wait times."
  },
  {
    flag: "🇬🇧",
    name: "NHS Sexual Health Clinic",
    area: "UK Nationwide",
    detail: "FREE STI testing, contraception, emergency contraception, pregnancy testing. No registration needed."
  },
  {
    flag: "🇬🇧",
    name: "SH:24 (Online Service)",
    area: "UK",
    detail: "Free STI test kits posted to your home. Results by text. Free treatment if positive."
  },
  {
    flag: "🇬🇧",
    name: "BPAS (British Pregnancy Advisory Service)",
    area: "UK",
    detail: "Free pregnancy counselling, abortion services, STI testing."
  }
];

// Emergency Hotlines - Quick Access
export const EMERGENCY_HOTLINES = {
  uk: {
    emergency: { name: "Emergency Services", number: "999", description: "Police, Ambulance, Fire" },
    nhs111: { name: "NHS 111", number: "111", description: "Non-emergency medical advice", free: true },
    samaritans: { name: "Samaritans", number: "116 123", description: "24/7 mental health crisis", free: true },
    domesticAbuse: { name: "National Domestic Abuse Helpline", number: "0808 2000 247", description: "24/7 confidential", free: true },
    rapeCrisis: { name: "Rape Crisis", number: "0808 802 9999", description: "Support for sexual violence", free: true }
  },
  nigeria: {
    emergency: { name: "Emergency Services", number: "112", description: "Police, Ambulance, Fire", free: true },
    lasema: { name: "LASEMA", number: "767", description: "Lagos State Emergency", free: true },
    police: { name: "Nigeria Police", number: "199", description: "Emergency police response", free: true },
    domesticAbuse: { name: "Domestic Violence Helpline", number: "0800 333 333", description: "24/7 confidential", free: true },
    warif: { name: "WARIF (Rape Crisis)", number: "0800 921 000", description: "Support for sexual violence", free: true }
  }
};

// Crisis Warning Signs
export const CRISIS_WARNING_SIGNS = [
  { sign: "Talking about wanting to die or kill themselves", action: "Call 999/112 immediately - do not leave them alone", urgent: true },
  { sign: "Feeling hopeless or having no reason to live", action: "Contact Samaritans: 116 123 (UK) or mental health crisis team", urgent: true },
  { sign: "Talking about being a burden to others", action: "Reach out - you matter. Call a helpline now.", urgent: true },
  { sign: "Withdrawing from family and friends", action: "Check in on them. Let them know you care.", urgent: false },
  { sign: "Extreme mood swings or sudden calm after depression", action: "Seek professional help immediately", urgent: true },
  { sign: "Giving away prized possessions", action: "This is a red flag - seek help immediately", urgent: true },
  { sign: "Increased substance use (alcohol/drugs)", action: "Speak to a counsellor or GP about support", urgent: false },
  { sign: "Saying goodbye as if leaving permanently", action: "EMERGENCY - Call 999/112 now", urgent: true }
];

// Self-Care Tips for Crisis
export const SELF_CARE_TIPS = [
  "Breathe deeply: Inhale for 4 seconds, hold for 7, exhale for 8 (4-7-8 breathing)",
  "Reach out to one person you trust - you don't have to go through this alone",
  "Remove yourself from stressful environments if possible",
  "Stay hydrated and try to eat something small - your body needs fuel",
  "Remember: This feeling is temporary. Help is available right now.",
  "Call a helpline - they are trained to listen without judgement",
  "Go for a short walk if you can - fresh air and movement help",
  "Write down what you're feeling - getting it out on paper can help"
];

// Safety Planning Tips
export const SAFETY_PLANNING_TIPS = [
  { title: "Code Word", tip: "Have a code word with trusted friends/family that means 'I'm in danger, call for help'" },
  { title: "Important Documents", tip: "Keep passport, ID, bank cards, and medication in a safe, accessible place" },
  { title: "Phone Safety", tip: "Keep your phone charged and emergency numbers saved. Use incognito browsing." },
  { title: "Escape Route", tip: "Plan multiple escape routes and identify safe places to go (police station, hospital, friend's house)" },
  { title: "Go Bag", tip: "Pack a bag with essentials (clothes, cash, documents) and keep it hidden but accessible" },
  { title: "Trust Your Instinct", tip: "If you feel unsafe, trust that feeling. Your safety is the priority." }
];

// Quick Escape - Hidden feature
export const QUICK_ESCAPE_URL = "https://www.google.com";

// Helper function to get emergency contact by country and type
export function getEmergencyContact(country, type) {
  const contacts = EMERGENCY_HOTLINES[country];
  return contacts?.[type] || EMERGENCY_HOTLINES.uk.emergency;
}

// Helper function to get all emergency contacts for a country
export function getAllEmergencyContacts(country) {
  return EMERGENCY_HOTLINES[country] || EMERGENCY_HOTLINES.uk;
}

// Helper function to check if a message contains crisis keywords
export function containsCrisisKeywords(message) {
  const lowerMessage = message.toLowerCase();
  const crisisKeywords = [
    "kill myself", "want to die", "end it all", "no reason to live",
    "better off without me", "hurt myself", "self harm", "cut myself",
    "hopeless", "worthless", "burden to everyone"
  ];
  return crisisKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Helper function to get crisis response message
export function getCrisisResponse() {
  return {
    title: "🚨 You're Not Alone",
    message: "I'm really glad you reached out. Please know that you matter and help is available right now.",
    resources: [
      "📞 Samaritans (24/7): 116 123 (Free, confidential - UK)",
      "📞 National Emergency: 112 (Nigeria) or 999 (UK)",
      "📞 Domestic Abuse Helpline: 0808 2000 247 (UK) or 0800 333 333 (Nigeria)",
      "💬 Text SHOUT to 85258 for crisis support (UK)",
      "🏥 Go to your nearest A&E if you're at immediate risk"
    ]
  };
}