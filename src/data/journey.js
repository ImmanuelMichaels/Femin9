export const JOURNEY_CONFIG = {
  pregnant: {
    tabs: ["assistant","kicks","nutrition","vitals","health","baby","mental","partner","chat","safety"],
    pills: [
      { dot:"var(--t)",  label:"Week 24 · 2nd Trimester", bg:"var(--gdl)" },
      { dot:"var(--sg)", label:"3/6 supplements ✓",       bg:"var(--sgl)" },
      { dot:"var(--lv)", label:"Baby: 600g 🌽",           bg:"var(--lvl)" },
    ],
    greeting: "Mama",
    taskIds: ["iron","water","vitals","kicks","meal","walk"],
    quickActions: [
      ["📷","Scan Drug","health","var(--bll)","var(--bl)"],
      ["🥗","Eat Today","nutrition","var(--sgl)","var(--sg)"],
      ["👶","Kicks","kicks","var(--lvl)","var(--lv)"],
      ["🚨","SOS",null,"var(--rdl)","var(--rd)"]
    ],
    showAlert: true,
  },
  conceive: {
    tabs: ["assistant","ttc","nutrition","vitals","health","mental","chat","safety"],
    pills: [
      { dot:"var(--lv)", label:"Cycle Day 14 · Ovulation", bg:"var(--lvl)" },
      { dot:"var(--sg)", label:"Folic acid ✓",             bg:"var(--sgl)" },
      { dot:"var(--t)",  label:"Fertile Window 🌸",        bg:"var(--gdl)" },
    ],
    greeting: "Mama",
    taskIds: ["water","vitals","meal","walk"],
    quickActions: [
      ["📷","Scan Drug","health","var(--bll)","var(--bl)"],
      ["🥗","Nutrition","nutrition","var(--sgl)","var(--sg)"],
      ["❤️","Vitals","vitals","var(--rdl)","var(--rd)"],
      ["🚨","SOS",null,"var(--rdl)","var(--rd)"]
    ],
    showAlert: false,
  },
  mom: {
    tabs: ["assistant","nursing","nutrition","vitals","health","baby","mental","partner","chat","safety"],
    pills: [
      { dot:"var(--t)",  label:"Week 6 Postpartum",      bg:"var(--gdl)" },
      { dot:"var(--sg)", label:"Breastfeeding · Day 42", bg:"var(--sgl)" },
      { dot:"var(--lv)", label:"Recovery: On track 💪",  bg:"var(--lvl)" },
    ],
    greeting: "Mama",
    taskIds: ["iron","water","vitals","meal","walk"],
    quickActions: [
      ["📷","Scan Drug","health","var(--bll)","var(--bl)"],
      ["🥗","Eat Today","nutrition","var(--sgl)","var(--sg)"],
      ["💚","Mind","mental","var(--lvl)","var(--lv)"],
      ["🚨","SOS",null,"var(--rdl)","var(--rd)"]
    ],
    showAlert: false,
  },
  menopause: {
    tabs: ["assistant","vitals","mental","chat","safety"],
    pills: [
      { dot:"var(--lv)", label:"Cycle Tracking · Active",  bg:"var(--lvl)" },
      { dot:"var(--sg)", label:"Mood Log · 3 day streak",  bg:"var(--sgl)" },
      { dot:"var(--t)",  label:"Vitals: Normal range",     bg:"var(--gdl)" },
    ],
    greeting: "Queen",
    taskIds: ["water","vitals","walk"],
    quickActions: [
      ["❤️","Vitals","vitals","var(--rdl)","var(--rd)"],
      ["💚","Mind","mental","var(--lvl)","var(--lv)"],
      ["💬","Chat","chat","var(--bll)","var(--bl)"],
      ["🚨","SOS",null,"var(--rdl)","var(--rd)"]
    ],
    showAlert: false,
  },
};

export const ALL_TASKS = [
  { id: "iron",   icon: "💊", bg: "var(--gdl)", title: "Take Iron Supplement",  streak: 4,  time: "With OJ"     },
  { id: "water",  icon: "💧", bg: "var(--bll)", title: "Drink 3L of water",     streak: 7,  time: "All day"     },
  { id: "vitals", icon: "❤️", bg: "var(--rdl)", title: "Log blood pressure",    streak: 5,  time: "Evening"     },
  { id: "kicks",  icon: "👶", bg: "var(--sgl)", title: "Count baby kicks",      streak: 12, time: "10–12 AM"   },
  { id: "meal",   icon: "🥗", bg: "var(--lvl)", title: "Log today's meals",     streak: 6,  time: "After meals" },
  { id: "walk",   icon: "🚶‍♀️", bg: "var(--warm)", title: "10 min gentle walk", streak: 3,  time: "15 min"     },
];

export const BLOOM_KB = {
  food: "Great question! 🌿 For Week 24, focus on iron-rich Nigerian foods: **Efo Riro** (3x more iron than spinach), **Moi Moi**, **Ogbono soup**, and **Tiger Nuts (Aya)** — found at any market for ₦200–₦500. Akamu with akara is an excellent breakfast. Your local diet is genuinely better than most Western pregnancy diets!",
  jaundice: "Jaundice in newborns is common days 2–5. Signs: yellowing starting from face → chest → belly. Mild: frequent feeding + indirect morning sunlight 20 mins. URGENT if yellowing below belly or extreme sleepiness → hospital immediately.",
  movement: "⚠️ After 28 weeks: at least 10 movements in 2 hours. If under 10 — lie on left side after a cold drink and count again. Under 10 again → contact hospital IMMEDIATELY. Do not wait.",
  bp: "⚠️ Preeclampsia signs: severe headache + vision changes + upper abdominal pain + sudden swelling. With high BP → EMERGENCY. Call 199 or go to hospital now. Do not drive yourself.",
  breast: "For breastfeeding: Feed 8–12x per 24 hrs on demand. Good latch: wide open mouth, chin on breast. Milk supply boosters: oatmeal, garden egg leaf, Tiger Nuts (Aya), 3L water daily.",
  sleep: "Baby sleep: 2–4 hour cycles are normal for newborns. 😴 Routine helps: bath → massage → feed → sleep. White noise + firm swaddle.",
  depression: "Thank you for sharing. 💙 Postpartum depression affects 1 in 5 mothers globally. It is NOT weakness — it is a medical condition. Please speak with your doctor or tap 'Human Nurse' to connect with a counsellor now.",
  malaria: "⚠️ Malaria in pregnancy is extremely dangerous. Any fever needs immediate hospital attention. Do NOT self-medicate. Artemether-Lumefantrine is generally safe in 2nd/3rd trimester.",
  drug: "I can help check if a drug is safe! 💊 Go to Health tab → Drug Scanner. Or type the drug name here and I'll check instantly.",
  craving: "Cravings often signal nutrient needs! 🍫 Craving chocolate? May mean magnesium deficiency. Craving ice or clay (pica)? Possible iron deficiency — take your iron supplement and see your doctor.",
  posture: "Sleep on your left side from week 20+ — it improves blood flow to baby. Use a pillow between your knees. Avoid standing for long periods.",
  default: "I'm here for you, mama. 🌸 Ask me about: Nigerian foods, warning signs, breastfeeding, medications, emotional support, baby development. I understand English, Yoruba, Pidgin, Igbo, and Hausa.",
};
