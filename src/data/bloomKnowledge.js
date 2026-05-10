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

export function bloomResp(msg) {
  const l = msg.toLowerCase();
  if (l.includes("food") || l.includes("eat") || l.includes("nutrition") || l.includes("diet")) return BLOOM_KB.food;
  if (l.includes("jaundice") || l.includes("yellow")) return BLOOM_KB.jaundice;
  if (l.includes("kick") || l.includes("movement") || l.includes("not moving")) return BLOOM_KB.movement;
  if (l.includes("blood pressure") || l.includes("bp") || l.includes("headache") || l.includes("preeclampsia")) return BLOOM_KB.bp;
  if (l.includes("breast") || l.includes("latch") || l.includes("milk") || l.includes("breastfeed")) return BLOOM_KB.breast;
  if (l.includes("sleep") || l.includes("tired") || l.includes("exhaust")) return BLOOM_KB.sleep;
  if (l.includes("sad") || l.includes("depress") || l.includes("cry") || l.includes("anxious") || l.includes("postpartum")) return BLOOM_KB.depression;
  if (l.includes("malaria") || l.includes("fever")) return BLOOM_KB.malaria;
  if (l.includes("drug") || l.includes("medicine") || l.includes("medication")) return BLOOM_KB.drug;
  if (l.includes("craving") || l.includes("crave")) return BLOOM_KB.craving;
  if (l.includes("posture") || l.includes("back pain") || l.includes("sleep position")) return BLOOM_KB.posture;
  return BLOOM_KB.default;
}
