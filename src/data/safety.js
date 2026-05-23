// data/safety.js

// Domestic Violence Contacts - International
export const DV_CONTACTS = [
  { 
    flag: "🇳🇬", 
    country: "Nigeria", 
    lines: [
      { name: "National Domestic Violence Helpline", num: "0800 333 333", hours: "24/7", free: true },
      { name: "WARDC (Women's Rights & Child Protection)", num: "0800 111 222", hours: "24/7", free: true },
      { name: "Lagos DSVRT (Domestic Violence Response Team)", num: "0800 033 3333", hours: "24/7", free: true },
      { name: "FIDA Nigeria (International Federation of Women Lawyers)", num: "01-8000002", hours: "9am-5pm", free: false },
      { name: "Mirabel Centre (Sexual Assault Referral Centre)", num: "0800 111 222", hours: "24/7", free: true },
      { name: "Project Alert on Violence Against Women", num: "0800 222 2222", hours: "24/7", free: true },
      { name: "Women at Risk International Foundation (WARIF)", num: "0800 921 000", hours: "24/7", free: true }
    ]
  },
  { 
    flag: "🇬🇧", 
    country: "UK", 
    lines: [
      { name: "National Domestic Abuse Helpline (24/7)", num: "0808 2000 247", hours: "24/7", free: true },
      { name: "Refuge (Women's Aid)", num: "0808 2000 247", hours: "24/7", free: true },
      { name: "Men's Advice Line", num: "0808 801 0327", hours: "Mon-Fri 9am-5pm", free: true },
      { name: "Galop (LGBT+ Domestic Abuse)", num: "0800 999 5428", hours: "Mon-Fri 10am-5pm", free: true },
      { name: "Respect (Perpetrator Support)", num: "0808 802 4040", hours: "Mon-Fri 9am-5pm", free: true },
      { name: "Scottish Domestic Abuse Helpline", num: "0800 027 1234", hours: "24/7", free: true }
    ]
  },
  { 
    flag: "🇨🇦", 
    country: "Canada", 
    lines: [
      { name: "ShelterSafe (Emergency Shelter)", num: "1-800-799-7233", hours: "24/7", free: true },
      { name: "Canadian Domestic Violence Hotline", num: "1-800-363-9010", hours: "24/7", free: true },
      { name: "Assaulted Women's Helpline (Ontario)", num: "1-866-863-0511", hours: "24/7", free: true },
      { name: "Fem'aide (French Helpline)", num: "1-877-336-2433", hours: "24/7", free: true }
    ]
  },
  { 
    flag: "🇺🇸", 
    country: "USA", 
    lines: [
      { name: "National Domestic Violence Hotline (NDVH)", num: "1-800-799-7233", hours: "24/7", free: true },
      { name: "National Dating Abuse Helpline", num: "1-866-331-9474", hours: "24/7", free: true },
      { name: "StrongHearts Native Helpline", num: "1-844-762-8483", hours: "24/7", free: true },
      { name: "Love is Respect (Youth)", num: "1-866-331-9474", hours: "24/7", free: true }
    ]
  }
];

// Sexual Health Resources - International
export const SEXUAL_HEALTH = [
  { 
    icon: "💉", 
    title: "STI Testing", 
    desc: "Know your status — free or low-cost testing available at most government health centres in Nigeria (PEPFAR-funded sites). In UK: NHS sexual health clinics free & confidential.", 
    tag: "All regions",
    locations: "Nigeria, UK, USA, Canada"
  },
  { 
    icon: "🦠", 
    title: "HIV/AIDS Care", 
    desc: "Free ARV treatment at all Nigerian government hospitals. In UK: NHS sexual health clinics free & confidential. USA: Ryan White HIV/AIDS Program.", 
    tag: "Free care",
    locations: "Nigeria, UK, USA, Canada"
  },
  { 
    icon: "🔵", 
    title: "PrEP Access", 
    desc: "PrEP (HIV prevention pill) available at select PEPFAR sites in Lagos, Abuja, Rivers State. Free in UK on NHS. USA: Covered by most insurance or free through state programs.", 
    tag: "Prevention",
    locations: "Nigeria, UK, USA, Canada"
  },
  { 
    icon: "🩸", 
    title: "HPV Vaccination", 
    desc: "HPV vaccine recommended for girls 9–14 in Nigeria (NPHCDA). Free in UK under NHS (up to age 25). USA: Covered by most insurance up to age 45.", 
    tag: "Vaccination",
    locations: "Nigeria, UK, USA, Canada"
  },
  { 
    icon: "💊", 
    title: "Emergency Contraception", 
    desc: "Morning-after pill available at pharmacies without prescription in UK, USA, Canada. In Nigeria, available at most pharmacies. Effective up to 72 hours (120 hours for ellaOne).", 
    tag: "Emergency",
    locations: "All countries"
  },
  { 
    icon: "🤰", 
    title: "Pregnancy Testing & Options", 
    desc: "Free pregnancy tests at sexual health clinics in UK, USA, Canada. Confidential counselling on all options including abortion services (where legal).", 
    tag: "Confidential",
    locations: "All countries"
  }
];

// 6-Step Incident Reporting Guide - International
export const REPORT_STEPS = [
  { 
    n: "1", 
    title: "Get to Safety", 
    body: "Leave if you can. Go to a neighbour, family member, or public place. Take children with you. If in immediate danger, call emergency services.",
    emergencyNumbers: "UK: 999, Nigeria: 112/199, USA/Canada: 911"
  },
  { 
    n: "2", 
    title: "Call Emergency Services", 
    body: "Nigeria: 112 (National), 199 (Police), 122 (Lagos Emergency). UK: 999. USA/Canada: 911. Ask for police and ambulance.",
    emergencyNumbers: "UK: 999, Nigeria: 112/199, USA/Canada: 911"
  },
  { 
    n: "3", 
    title: "Preserve Evidence", 
    body: "Photograph injuries. Keep any threatening messages, emails, or voicemails. Write down dates, times, and descriptions while memory is fresh.",
    tips: "Save screenshots, forward emails to a safe account, take photos with timestamps"
  },
  { 
    n: "4", 
    title: "Seek Medical Care", 
    body: "Any government hospital A&E must treat DV survivors. Request a forensic exam if sexually assaulted (within 7 days, ideally 72 hours for PEP). Request PEP starter pack if within 72 hours.",
    timing: "PEP effective within 72 hours - go immediately"
  },
  { 
    n: "5", 
    title: "Contact a DV Organisation", 
    body: "Call your local domestic violence organisation for safety planning, legal aid, and shelter options. They provide free, confidential support.",
    organisations: "Nigeria: WARDC, Mirabel Centre; UK: Refuge; USA: NDVH; Canada: ShelterSafe"
  },
  { 
    n: "6", 
    title: "Know Your Legal Rights", 
    body: "Nigeria: VAPP Act 2015 criminalises domestic violence. Obtain protection order from magistrate court. UK: Non-Molestation Order and Occupation Order. USA: Protection order available in all states.",
    legalAid: "Legal aid may be available for DV survivors"
  }
];

// Free & Low-Cost Clinics - International
export const FREE_CLINICS = [
  { 
    flag: "🇳🇬", 
    name: "Lagos Island General Hospital", 
    detail: "Free antenatal care, STI testing, family planning, HIV testing. Walk-in, no appointment needed.",
    area: "Lagos Island, Lagos State",
    services: ["STI Testing", "HIV Testing", "Family Planning", "Antenatal"]
  },
  { 
    flag: "🇳🇬", 
    name: "Rivers State Teaching Hospital", 
    detail: "Free STI/HIV testing (PEPFAR-funded). Free ARV treatment for HIV positive patients.",
    area: "Port Harcourt, Rivers State",
    services: ["STI Testing", "HIV Testing", "ARV Treatment"]
  },
  { 
    flag: "🇳🇬", 
    name: "PEPFAR-Funded Sites (National)", 
    detail: "Free HIV testing, ARV treatment, PrEP, prevention services. Available in all 36 states at designated centres.",
    area: "Nationwide Nigeria",
    services: ["HIV Testing", "ARV Treatment", "PrEP", "Prevention"]
  },
  { 
    flag: "🇳🇬", 
    name: "Marie Stopes Nigeria", 
    detail: "Subsidised family planning, contraception, STI testing. Sliding scale fees based on income.",
    area: "Multiple locations nationwide",
    services: ["Family Planning", "Contraception", "STI Testing"]
  },
  { 
    flag: "🇬🇧", 
    name: "NHS Sexual Health Clinic", 
    detail: "Free STI testing, contraception, HIV testing, PrEP. No GP referral needed. Confidential service.",
    area: "All UK regions",
    services: ["STI Testing", "Contraception", "HIV Testing", "PrEP"]
  },
  { 
    flag: "🇬🇧", 
    name: "SH:24 (Online Service)", 
    detail: "Free STI test kits posted to your home. Results by text. Free treatment if positive.",
    area: "UK (England & Wales)",
    services: ["STI Testing", "Online Consultation"]
  },
  { 
    flag: "🇨🇦", 
    name: "Sexual Health Clinic (ON/BC/AB)", 
    detail: "Free or low-cost STI testing, contraception, HIV testing. Walk-in, confidential.",
    area: "Canada (Ontario, British Columbia, Alberta)",
    services: ["STI Testing", "Contraception", "HIV Testing"]
  },
  { 
    flag: "🇨🇦", 
    name: "Planned Parenthood Canada", 
    detail: "Sliding-scale fees for STI testing, contraception, sexual health services.",
    area: "Multiple locations across Canada",
    services: ["STI Testing", "Contraception", "Sexual Health Education"]
  },
  { 
    flag: "🇺🇸", 
    name: "Planned Parenthood USA", 
    detail: "Sliding-scale STI testing, contraception, PrEP, HIV testing. No one turned away for inability to pay.",
    area: "Nationwide USA",
    services: ["STI Testing", "Contraception", "PrEP", "HIV Testing"]
  },
  { 
    flag: "🇺🇸", 
    name: "Federally Qualified Health Centers (FQHC)", 
    detail: "Sliding-scale fees based on income. Comprehensive sexual health services.",
    area: "Nationwide USA",
    services: ["STI Testing", "Contraception", "Primary Care", "HIV Testing"]
  }
];

// Emergency Hotlines - Quick Access (International)
export const EMERGENCY_HOTLINES = {
  global: {
    emergency: { name: "Emergency Services (Worldwide)", number: "112", description: "Police, Ambulance, Fire - works on most mobile phones globally" }
  },
  nigeria: {
    emergency: { name: "National Emergency", number: "112", description: "Police, Ambulance, Fire", free: true },
    police: { name: "Nigeria Police", number: "199", description: "Emergency police response", free: true },
    lasema: { name: "LASEMA", number: "767", description: "Lagos State Emergency", free: true },
    domesticAbuse: { name: "Domestic Violence Helpline", number: "0800 333 333", description: "24/7 confidential", free: true },
    warif: { name: "WARIF (Rape Crisis)", number: "0800 921 000", description: "Sexual assault support", free: true }
  },
  uk: {
    emergency: { name: "Emergency Services", number: "999", description: "Police, Ambulance, Fire", free: true },
    nhs111: { name: "NHS 111", number: "111", description: "Non-emergency medical advice", free: true },
    samaritans: { name: "Samaritans", number: "116 123", description: "24/7 mental health crisis", free: true },
    domesticAbuse: { name: "National Domestic Abuse", number: "0808 2000 247", description: "24/7 confidential", free: true },
    rapeCrisis: { name: "Rape Crisis", number: "0808 802 9999", description: "Sexual violence support", free: true }
  },
  canada: {
    emergency: { name: "Emergency Services", number: "911", description: "Police, Ambulance, Fire", free: true },
    domesticAbuse: { name: "ShelterSafe", number: "1-800-799-7233", description: "Emergency shelter", free: true },
    crisis: { name: "Canada Suicide Prevention", number: "1-833-456-4566", description: "24/7 crisis support", free: true }
  },
  usa: {
    emergency: { name: "Emergency Services", number: "911", description: "Police, Ambulance, Fire", free: true },
    domesticAbuse: { name: "National DV Hotline", number: "1-800-799-7233", description: "24/7 confidential", free: true },
    crisis: { name: "988 Suicide & Crisis Lifeline", number: "988", description: "24/7 mental health crisis", free: true },
    rapeCrisis: { name: "RAINN (Rape Crisis)", number: "1-800-656-4673", description: "24/7 sexual assault support", free: true }
  }
};

// Crisis Warning Signs
export const CRISIS_WARNING_SIGNS = [
  { sign: "Talking about wanting to die or kill themselves", action: "Call 999/112/911 immediately - do not leave them alone", urgent: true },
  { sign: "Feeling hopeless or having no reason to live", action: "Contact Samaritans (116 123 UK) or 988 (USA) or local crisis line", urgent: true },
  { sign: "Talking about being a burden to others", action: "Reach out - you matter. Call a helpline now.", urgent: true },
  { sign: "Withdrawing from family and friends", action: "Check in on them. Let them know you care.", urgent: false },
  { sign: "Extreme mood swings or sudden calm after depression", action: "Seek professional help immediately", urgent: true },
  { sign: "Giving away prized possessions", action: "This is a red flag - seek help immediately", urgent: true },
  { sign: "Increased substance use (alcohol/drugs)", action: "Speak to a counsellor or GP about support", urgent: false },
  { sign: "Saying goodbye as if leaving permanently", action: "EMERGENCY - Call emergency services now", urgent: true }
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
  return contacts?.[type] || EMERGENCY_HOTLINES.global.emergency;
}

// Helper function to get all emergency contacts for a country
export function getAllEmergencyContacts(country) {
  return EMERGENCY_HOTLINES[country] || EMERGENCY_HOTLINES.global;
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
      "📞 UK: Samaritans 116 123 (24/7, free)",
      "📞 USA: 988 Suicide & Crisis Lifeline",
      "📞 Nigeria: 112 (National Emergency)",
      "📞 Canada: 1-833-456-4566 (Crisis)",
      "💬 Text SHOUT to 85258 (UK crisis text)",
      "🏥 Go to your nearest A&E if you're at immediate risk"
    ]
  };
}

// Helper function to get DV contacts by country
export function getDVContacts(country) {
  return DV_CONTACTS.find(c => c.country === country) || DV_CONTACTS[0];
}

// Helper function to get free clinics by country
export function getFreeClinics(countryCode) {
  return FREE_CLINICS.filter(clinic => clinic.flag.includes(countryCode));
}