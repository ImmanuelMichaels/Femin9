import { BLOOM_KB } from '../data/bloomknowledge';

export function bloomResp(msg) {
  const l = msg.toLowerCase();
  
  // Crisis detection - immediate escalation
  if (l.includes("kill myself") || l.includes("want to die") || l.includes("end it all") || 
      l.includes("no reason to live") || l.includes("better off without me")) {
    return "🚨 **You're not alone. Please reach out for immediate support.**\n\n📞 **Samaritans (24/7):** 116 123 (free, confidential)\n📞 **NHS 111:** For urgent mental health support\n💬 **Text SHOUT to 85258** for crisis support\n🏥 **Go to A&E** if you're at immediate risk\n\nYou matter. Please reach out now. 💙";
  }
  
  if (l.includes("hurt myself") || l.includes("self harm") || l.includes("cut myself")) {
    return "🚨 **Help is available right now.**\n\n📞 **Samaritans:** 116 123 (24/7, free)\n📞 **NHS 111:** For urgent medical advice\n💬 **Text SHOUT to 85258**\n🏥 **Go to A&E** for immediate medical attention\n\nYou don't have to go through this alone. 💙";
  }
  
  if (l.includes("domestic violence") || (l.includes("hit me") && l.includes("partner")) || 
      l.includes("abusive") || l.includes("scared to go home")) {
    return "🛡️ **Your safety matters. Domestic abuse is never your fault.**\n\n📞 **National Domestic Abuse Helpline (24/7):** 0808 2000 247\n📞 **Refuge:** 0808 2000 247\n💬 **Women's Aid Live Chat:** womensaid.org.uk\n🚨 **In immediate danger? Call 999** (press 55 if you can't speak)\n\nThere are people who can help you right now. You are not alone. 💜";
  }
  
  // Journey-specific responses
  if (l.includes("ttc") || l.includes("trying to conceive") || l.includes("conceive") || 
      (l.includes("fertility") && !l.includes("ivf"))) {
    return BLOOM_KB.fertility;
  }
  
  if (l.includes("ivf") || l.includes("embryo") || l.includes("retrieval") || l.includes("transfer")) {
    return BLOOM_KB.ivf;
  }
  
  if (l.includes("postpartum") || l.includes("after birth") || (l.includes("recovery") && l.includes("birth"))) {
    return BLOOM_KB.postpartum;
  }
  
  if (l.includes("labour") || l.includes("labor") || l.includes("contractions") || l.includes("waters broken")) {
    return BLOOM_KB.labour;
  }
  
  // Main response categories
  if (l.includes("food") || l.includes("eat") || l.includes("nutrition") || l.includes("diet") || 
      l.includes("meal") || l.includes("cook") || l.includes("recipe")) {
    return BLOOM_KB.food;
  }
  
  if (l.includes("jaundice") || l.includes("yellow") || l.includes("baby skin")) {
    return BLOOM_KB.jaundice;
  }
  
  if (l.includes("kick") || l.includes("movement") || l.includes("not moving") || l.includes("fetal movement")) {
    return BLOOM_KB.movement;
  }
  
  if (l.includes("blood pressure") || l.includes("bp") || l.includes("headache") || l.includes("preeclampsia") ||
      l.includes("swelling") || l.includes("vision") || l.includes("blurred")) {
    return BLOOM_KB.bp;
  }
  
  if (l.includes("breast") || l.includes("latch") || l.includes("milk") || l.includes("breastfeed") || 
      l.includes("nursing") || l.includes("supply")) {
    return BLOOM_KB.breast;
  }
  
  if (l.includes("sleep") || l.includes("tired") || l.includes("exhaust") || l.includes("baby sleep") ||
      l.includes("nap")) {
    return BLOOM_KB.sleep;
  }
  
  if (l.includes("sad") || l.includes("depress") || l.includes("cry") || l.includes("anxious") || 
      l.includes("postnatal depression") || l.includes("postpartum depression") || l.includes("overwhelmed") ||
      l.includes("hopeless") || l.includes("worthless")) {
    return BLOOM_KB.depression;
  }
  
  if (l.includes("malaria") || l.includes("fever") || l.includes("temperature")) {
    return BLOOM_KB.malaria;
  }
  
  if (l.includes("drug") || l.includes("medicine") || l.includes("medication") || l.includes("tablet") ||
      l.includes("pill") || l.includes("prescription")) {
    return BLOOM_KB.drug;
  }
  
  if (l.includes("craving") || l.includes("crave") || l.includes("ice") || l.includes("clay") || 
      l.includes("pica")) {
    return BLOOM_KB.craving;
  }
  
  if (l.includes("posture") || l.includes("back pain") || l.includes("sleep position") || l.includes("pain") ||
      l.includes("ache")) {
    return BLOOM_KB.posture;
  }
  
  if (l.includes("hello") || l.includes("hi") || l.includes("hey") || l.includes("good morning")) {
    return "Hello mama! 🌸 " + BLOOM_KB.default;
  }
  
  return BLOOM_KB.default;
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function isBetween(date, startDate, endDate) {
  return date >= startDate && date <= endDate;
}

export function isSameDay(date1, date2) {
  return date1.toDateString() === date2.toDateString();
}

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function firstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}