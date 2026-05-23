// utils/helpers.js

export const BLOOM_KB = {
  // General greeting
  greeting: "Hi mama 🌸 I'm Bloom, your AI companion. I'm here to support you with evidence-based information, Nigerian cultural context, and a warm heart. Ask me anything about pregnancy, fertility, postpartum, medications, or how you're feeling. I understand English, Yoruba, Igbo, Hausa, and Pidgin.\n\n---\n📍 This is general information, not medical advice. Always consult your GP or midwife.",
  
  // Food & Nutrition (Cultural)
  food: "Great question! 🌿 For nutrition, here's what I recommend:\n\n🥬 **Iron-rich Nigerian foods:** Efo Riro (3x more iron than spinach), Moi Moi, Ogbono soup, Ugu leaf, and Tiger Nuts (Aya) — available at any market for ₦200–₦500.\n\n🍳 **Breakfast:** Akamu (pap) with Akara (bean cakes) or Moi Moi.\n\n🐟 **Lunch/Dinner:** Jollof rice with fish, Egusi soup, or Okro soup.\n\n💊 **Supplements:** Continue folic acid (400-800mcg), Vitamin D (10mcg), and iron if prescribed.\n\n🚫 **Avoid:** Agbo (herbal mixtures), excess caffeine (>200mg/day), raw seafood, unpasteurized dairy.\n\n---\n📍 These are general food suggestions, not a personalised diet plan. Speak with a registered dietitian for individual advice.",
  
  // Fertility & TTC
  fertility: "🌸 Trying to conceive is a beautiful journey. Here's what can help:\n\n🥚 **Fertility-boosting foods:** Ugu leaf, Tiger Nuts (Aya), Garden eggs, Avocado, Fish, Eggs, Pumpkin seeds.\n\n📅 **Timing:** Have sex every other day during your fertile window (5 days before ovulation through ovulation day).\n\n🌡️ **Track:** BBT and cervical mucus for most accurate prediction.\n\n💊 **Supplements:** Folic acid (400mcg), Vitamin D3 (1000 IU), Zinc for sperm quality.\n\n🚫 **Avoid:** Agbo (herbal mixtures), excessive zobo, NSAIDs around ovulation.\n\n🩺 **GP referral:** If under 35 and trying for 12+ months (or 6+ months if over 35).\n\n---\n📍 This is general information, not medical advice.",
  
  // IVF Support
  ivf: "💜 You're doing something extraordinary. Here's support for your IVF journey:\n\n💊 **Medication adherence:** Set reminders for injections. Rotate injection sites (left/right abdomen).\n\n🥑 **Nutrition:** Anti-inflammatory diet — olive oil, fatty fish, berries, nuts, leafy greens. Mediterranean patterns show best outcomes.\n\n😌 **Emotional wellbeing:** The two-week wait is hard. Journal, rest, and be gentle with yourself. Consider acupuncture or meditation.\n\n📞 **Support:** Your clinic's 24-hour nurse line is available. Don't hesitate to call with concerns.\n\n📊 **Tracking:** Keep log of scans, follicle counts, and embryo grades.\n\n---\n📍 This is general information, not medical advice. Always follow your fertility specialist's guidance.",
  
  // Jaundice
  jaundice: "👶 **Jaundice in newborns** is common days 2–5 after birth.\n\n**Signs to watch:** Yellowing starting from face → chest → belly button → legs/feet.\n\n**Mild jaundice (face/chest only):**\n• Feed baby frequently (every 2-3 hours)\n• Indirect morning sunlight for 15-20 minutes\n• Monitor diaper output (should be 6+ wet diapers daily)\n\n**🚨 URGENT - Go to hospital if:**\n• Yellowing reaches below belly button\n• Baby is extremely sleepy (hard to wake for feeds)\n• Poor feeding or not enough wet diapers\n• High-pitched cry\n\n**NHS guidance:** All babies are checked for jaundice before leaving hospital. Most cases resolve without treatment, but severe jaundice needs phototherapy.\n\n---\n📍 This is general information, not medical advice. Speak with your health visitor or GP.",
  
  // Reduced Fetal Movement
  movement: "⚠️ **Reduced fetal movement - URGENT**\n\nAfter 24 weeks, you should feel regular movements. Never wait until the next day.\n\n**What to do:**\n1. Lie on your left side\n2. Drink a cold glass of water\n3. Count movements for 2 hours\n\n**Normal:** 10 or more movements in 2 hours ✅\n\n**🚨 EMERGENCY - Contact maternity unit NOW if:**\n• Less than 10 movements in 2 hours\n• Baby is moving less than usual\n• You're concerned (trust your instinct)\n\n**Do not use home dopplers or phone apps to check the heartbeat** - they can give false reassurance.\n\n📞 Call your maternity unit or NHS 111 immediately. Do not wait.\n\n---\n📍 This is urgent medical guidance, not general information.",
  
  // Blood Pressure & Preeclampsia
  bp: "⚠️ **Preeclampsia warning signs - URGENT**\n\n**Seek immediate medical help if you have:**\n• Severe headache (not relieved by paracetamol)\n• Visual changes (blurring, flashing lights)\n• Pain below ribs (right upper abdomen)\n• Sudden swelling of face, hands, or feet\n• Nausea or vomiting (after 20 weeks)\n\n**With high blood pressure (140/90+):**\n• Call your midwife or NHS 111 within 24 hours\n\n**With severe hypertension (160/110+):**\n• 🚨 **EMERGENCY** - Call 999 or go to A&E now\n\n**Prevention:** Attend all antenatal appointments for BP checks. Know your baseline.\n\n---\n📍 This is urgent medical guidance. Call 999 if you have severe symptoms.",
  
  // Breastfeeding
  breast: "🤱 **Breastfeeding support**\n\n**How often:** 8-12 feeds per 24 hours (on demand, not scheduled)\n\n**Good latch signs:**\n• Wide open mouth before latching\n• Chin touches breast, nose free\n• No pain (some discomfort initially is normal)\n• Hearing swallowing (not just sucking)\n\n**Milk supply boosters:**\n• Oatmeal, Garden egg leaf, Tiger Nuts (Aya)\n• Fenugreek, Moringa (evidence mixed but safe)\n• 3-4 litres water daily\n• Rest when baby sleeps\n\n**Cluster feeding (normal!):** Baby may feed every 30-60 minutes for a few hours - this builds your supply.\n\n**🚨 When to seek help:**\n• Baby not gaining weight\n• Less than 6 wet diapers daily\n• Severe pain or cracked nipples\n• Signs of mastitis (red, hot, painful breast + fever)\n\n📞 Contact a lactation consultant or your health visitor.\n\n---\n📍 This is general breastfeeding guidance, not medical advice.",
  
  // Baby Sleep
  sleep: "😴 **Newborn sleep patterns**\n\n**Normal:** 2-4 hour sleep cycles for newborns. Most babies don't sleep through the night until 6+ months.\n\n**Tips for better sleep:**\n• Establish a routine: bath → gentle massage → feed → sleep\n• White noise (shushing sounds, fan, or app)\n• Firm, flat mattress with fitted sheet only (no bumpers, toys, or loose blankets)\n• Room temperature 16-20°C\n• Swaddle safely (stop when baby shows signs of rolling)\n\n**Safe sleep - ALWAYS:**\n• Back to sleep (not side or tummy)\n• In same room as parents for first 6 months\n• Never on sofa or armchair\n\n**🚨 When to worry:**\n• Baby is hard to wake for feeds\n• Not feeding well\n• Less than 6 wet diapers daily\n\n---\n📍 This follows NHS safe sleep guidance. Contact health visitor if concerned.",
  
  // Postnatal Depression
  depression: "💙 **Thank you for sharing how you're feeling.**\n\nYou are not alone. Postnatal depression affects 1 in 5 mothers globally. It is NOT weakness — it is a medical condition that deserves treatment and support.\n\n**Common signs:**\n• Feeling sad or hopeless most of the day\n• Loss of interest in things you used to enjoy\n• Difficulty bonding with baby\n• Extreme tiredness or low energy\n• Changes in sleep or appetite (unrelated to baby's schedule)\n• Feeling guilty, worthless, or overwhelmed\n\n**📞 Immediate help available:**\n• **Samaritans (24/7):** 116 123 (free, confidential)\n• **NHS 111:** For urgent mental health support\n• **Your GP or health visitor:** Make an appointment this week\n• **Text SHOUT to 85258** for crisis support\n\n**Remember:**\n• Treatment works (talking therapy, medication, or both)\n• Breastfeeding is safe with most antidepressants\n• You deserve support, not judgement\n\n**🚨 If you're having thoughts of harming yourself or baby:**\nCall 999 or go to A&E immediately.\n\n---\n📍 This mental health support information. Help is available and recovery is possible.",
  
  // Malaria in Pregnancy
  malaria: "⚠️ **Malaria in pregnancy is extremely dangerous**\n\n**🚨 Any fever during pregnancy needs immediate medical attention.** Do not wait.\n\n**What to do:**\n1. Go to a hospital or clinic TODAY\n2. Do NOT self-medicate with any herbs or medicines\n3. Ask for a malaria test\n\n**Safe treatment:**\n• Artemether-Lumefantrine is generally safe in 2nd/3rd trimester\n• Your doctor will prescribe appropriate treatment\n\n**Prevention:**\n• Sleep under insecticide-treated bed net every night\n• Use mosquito repellent (DEET is safe in pregnancy)\n• Wear long sleeves at dawn/dusk\n\n**🚨 Warning signs requiring emergency care:**\n• High fever\n• Difficulty breathing\n• Severe headache\n• Reduced fetal movement\n\n---\n📍 This is urgent medical guidance. Go to hospital for any fever in pregnancy.",
  
  // Drug Safety
  drug: "💊 **Medication safety check**\n\n**For immediate safety check:**\n1. Go to **Health tab** → **Drug Safety Checker**\n2. Or type the exact medication name here and I'll check\n\n**General pregnancy-safe medications (always consult doctor first):**\n• Paracetamol (for pain/fever) - safest option\n• Some antacids for heartburn\n• Some hay fever medications\n\n**🚫 AVOID in pregnancy unless prescribed:**\n• Ibuprofen, aspirin, NSAIDs (especially 3rd trimester)\n• Codeine and opioids\n• Most herbal remedies (Agbo, unregulated supplements)\n\n**Always check with your doctor before taking:**\n• Any new medication, even over-the-counter\n• Any herbal or traditional medicines\n\n**📞 Emergency:** If you've taken something unsafe, call your GP, midwife, or NHS 111.\n\n---\n📍 This is general medication guidance. Always consult your doctor before taking any medication during pregnancy.",
  
  // Cravings & Pica
  craving: "🍫 **Understanding cravings**\n\nCravings often signal what your body needs:\n\n**🍫 Chocolate** → May need magnesium. Eat: Dark chocolate, nuts, seeds, leafy greens.\n\n**🧊 Ice or non-food items (Pica)** → ⚠️ Possible iron deficiency. \n• **URGENT:** Take your iron supplement\n• Tell your midwife or GP\n• Eat iron-rich foods: red meat, spinach, lentils\n\n**🍔 Salty foods** → May need minerals. Eat: Electrolytes, coconut water, mineral-rich foods.\n\n**🍞 Bread or carbs** → Energy need. Eat: Complex carbs (brown rice, oats, beans).\n\n**🍋 Sour/tangy foods** → May need vitamin C. Eat: Oranges, bell peppers, tomatoes.\n\n**If craving non-food items (clay, dirt, chalk, soap):**\n• This is called **pica** and requires medical attention\n• Tell your midwife or GP immediately\n• Take your iron supplements as prescribed\n\n---\n📍 This is general nutrition information. See your doctor for persistent pica.",
  
  // Back Pain & Posture
  posture: "🧘 **Back pain relief in pregnancy**\n\n**Sleep position (from 20+ weeks):**\n• Sleep on your LEFT side\n• Place pillow between knees\n• Pillow under belly if comfortable\n• AVOID sleeping flat on back\n\n**Daily posture tips:**\n• Stand with feet shoulder-width apart\n• Tuck pelvis (don't arch back)\n• Use supportive shoes (no flat flats or high heels)\n• Sit with lower back support\n\n**Exercises for relief:**\n• Pelvic tilts (cat-cow stretches)\n• Prenatal yoga (avoid lying on back after 20 weeks)\n• Swimming or walking\n\n**When to seek help:**\n• Pain that doesn't improve with rest\n• Numbness or tingling in legs\n• Pain with fever or contractions\n\n**Pelvic girdle pain (PGP):**\n• Keep knees together when getting out of car/bed\n• Avoid standing on one leg\n• See a physiotherapist\n\n---\n📍 This is general pregnancy advice. See your GP or midwife for severe pain.",
  
  // Labour Signs
  labour: "🤰 **Signs labour is starting**\n\n**Established labour signs:**\n• Regular contractions (every 5 minutes, lasting 60 seconds)\n• Waters breaking (clear fluid - may be a trickle or gush)\n• Bloody show (mucus plug with blood)\n\n**🚨 Call hospital or midwife if:**\n• Waters break (any gestation)\n• Regular contractions before 37 weeks\n• Bleeding (more than 'show')\n• Reduced fetal movements\n\n**When to go to hospital:**\n• Contractions every 5 minutes (for 1st baby) or every 7-10 minutes (if not 1st baby)\n• Waters have broken\n• You're concerned\n\n**False labour (Braxton Hicks):**\n• Irregular, don't get closer together\n• Stop with walking or resting\n• Not increasing in intensity\n\n**Pack in hospital bag:**\n• Maternity notes, birth plan\n• Nightdress, dressing gown, slippers\n• Snacks, drinks, phone charger\n• Baby clothes, nappies, blankets\n\n---\n📍 This is general labour guidance. Follow your midwife's advice and call your maternity unit.",
  
  // Postpartum Recovery
  postpartum: "🤱 **Postpartum recovery - your body is healing**\n\n**First 6 weeks (the Fourth Trimester):**\n\n**Physical healing:**\n• Rest when baby rests (really)\n• Perineal care (if vaginal birth): ice packs, peri bottle, sitz baths\n• C-section: keep incision clean and dry, no heavy lifting\n• Wear loose, comfortable clothing\n\n**Bleeding (lochia):**\n• Normal for 2-6 weeks\n• Goes from red → brown/pink → white/yellow\n• 🚨 Heavy bleeding (soaking pad hourly) → call GP or A&E\n\n**Pelvic floor:**\n• Start gentle exercises as soon as comfortable\n• Avoid high impact exercise until cleared by GP\n\n**Emotional health:**\n• Baby blues (days 3-10, 80% of mothers)\n• Postnatal depression (1 in 5 mothers) - get help\n\n**When to see GP:**\n• Fever >38°C\n• Pain or burning when peeing\n• Severe pain or heavy bleeding\n• Feelings of sadness that won't lift\n\n**💙 You're doing an amazing job. This phase is hard, but it passes.**\n\n---\n📍 This is general postpartum guidance. Contact your GP or health visitor with concerns.",
  
  // Generic disclaimer
  disclaimer: "\n\n---\n📍 This is general information, not medical advice. Always consult your GP, midwife, or health visitor for personal health concerns.",
  
  default: "I'm here for you, mama. 🌸\n\nYou can ask me about:\n• 🥗 **Food & Nutrition** (Nigerian foods, pregnancy diet)\n• 💊 **Medication safety** (check if medicine is safe)\n• 👶 **Baby movements** (reduced movement, kick counting)\n• 💙 **Emotional health** (anxiety, depression, support)\n• 🤱 **Breastfeeding** (latching, supply, challenges)\n• 🏥 **Warning signs** (preeclampsia, jaundice, malaria)\n• 😴 **Baby sleep** (newborn patterns, safe sleep)\n\nI understand English, Yoruba, Igbo, Hausa, and Pidgin. Just ask me anything!\n\n---\n📍 This is general information, not medical advice. For emergencies, call 999 or go to A&E."
};

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
  
  // Default response with all options
  return BLOOM_KB.default;
}

// Helper function to format time (MM:SS)
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Helper function to check if a date is between two dates
export function isBetween(date, startDate, endDate) {
  return date >= startDate && date <= endDate;
}

// Helper function to check if two dates are the same
export function isSameDay(date1, date2) {
  return date1.toDateString() === date2.toDateString();
}

// Helper function to get days in month
export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Helper function to get first day of month (0 = Sunday, 1 = Monday, etc.)
export function firstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}