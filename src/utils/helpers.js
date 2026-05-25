import { BLOOM_KB } from '../data/bloomknowledge';  // ✅ Correct - has all the health content

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

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function isSameDay(a, b) {
  return a && b && a.toDateString() === b.toDateString();
}

export function isBetween(d, s, e) {
  return d && s && e && d >= s && d <= e;
}

export function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

export function firstDayOfMonth(y, m) {
  return (new Date(y, m, 1).getDay() + 6) % 7;
}
