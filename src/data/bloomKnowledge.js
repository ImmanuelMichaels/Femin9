// src/data/bloomKnowledge.js
// PRODUCTION — week-to-launch hardened version
// Changes: crisis expansion, journey-awareness, headache triage fix, greeting fix

// ─── Journey greeting map ──────────────────────────────────────────────────
const JOURNEY_GREETING = {
  pregnant:  'mama',
  mom:       'mama',
  conceive:  'mama',
  ivf:       'mama',
  menstrual: 'Queen',
  menopause: 'Queen',
};

// ─── Crisis keywords (expanded semantic coverage) ──────────────────────────
// Three tiers: T1 = explicit, T2 = strong intent, T3 = ambiguous distress
const CRISIS_T1 = [
  'kill myself', 'killing myself', 'kill myself tonight',
  'want to die', 'wanted to die', 'wanna die',
  'end my life', 'end it all', 'end it tonight',
  'take my own life', 'take my life',
  'no reason to live', 'nothing to live for',
  'better off without me', 'better off dead',
  'planning to die', 'going to kill myself',
  "don't want to be here anymore", 'dont want to be here anymore',
  'wish i was dead', 'wish i were dead',
  'i want to be dead',
];

const CRISIS_T2 = [
  'hurt myself', 'hurting myself',
  'self harm', 'self-harm', 'selfharm',
  'cut myself', 'cutting myself',
  'burn myself',
  'i cant go on', "i can't go on",
  'no way out', 'there is no way out',
  'cant take it anymore', "can't take it anymore",
  'what is the point', "what's the point of anything",
  'wish i wasnt here', "wish i wasn't here",
  'feel like disappearing', 'want to disappear',
  'want to run away forever',
  'i want to end everything', 'want to end everything',
  'i give up on life', 'given up on life',
  'nobody would miss me', 'no one would miss me',
];

// T3: emotional distress that should surface crisis resources alongside support
const CRISIS_T3 = [
  'hopeless', 'worthless', 'i am worthless', 'i feel worthless',
  'i am a burden', 'feel like a burden', "i'm a burden",
  'nobody cares', 'no one cares about me',
  'completely alone', 'totally alone',
  'so depressed', 'deeply depressed',
  'cannot cope', "can't cope", 'i cannot cope',
  'suicidal', 'thoughts of suicide',
];

// Pidgin / code-switch patterns (common in Nigerian diaspora)
const CRISIS_PIDGIN = [
  'i don tire', // "I am exhausted/done"
  'e don do me', // "I can't take it anymore"
  'no be me again', // "I'm not myself"
  'i wan die', 'i want make i die',
  'i no fit continue', // "I can't continue"
];

const CRISIS_RESOURCES =
  '📞 **Samaritans (24/7):** 116 123 — free, confidential\n' +
  '📞 **NHS 111:** urgent mental health support\n' +
  '💬 **Text SHOUT to 85258** — crisis text line\n' +
  '📞 **PANDAS Foundation:** 0808 1961 776 — postpartum crisis\n' +
  '🏥 **A&E / 999** — if you are at immediate risk\n' +
  '📞 **Nigeria Emergency:** 112';

// ─── Symptom triage helper ─────────────────────────────────────────────────
// Returns 'emergency' | 'urgent' | 'monitor' | null
function triagebp(l) {
  const hasHeadache  = l.includes('headache') || l.includes('head pain') || l.includes('head ache');
  const hasVision    = l.includes('vision') || l.includes('blurred') || l.includes('blurry') ||
                       l.includes('flashing lights') || l.includes('can\'t see') || l.includes('seeing spots');
  const hasSwelling  = l.includes('swelling') || l.includes('swollen face') || l.includes('swollen hands');
  const hasBP        = l.includes('blood pressure') || l.includes('hypertension') || l.includes('preeclampsia') ||
                       l.includes('160') || l.includes('140/90');
  const hasRibPain   = l.includes('rib pain') || l.includes('upper abdomen') || l.includes('right side pain');

  const dangerCount = [hasVision, hasSwelling, hasRibPain].filter(Boolean).length;

  if (dangerCount >= 1 || (hasHeadache && hasSwelling) || (hasHeadache && hasVision)) return 'emergency';
  if (hasBP) return 'urgent';
  if (hasHeadache) return 'monitor';
  return null;
}

// ─── KB responses ──────────────────────────────────────────────────────────
export const BLOOM_KB = {
  greeting: (journeyType = 'pregnant') => {
    const salutation = JOURNEY_GREETING[journeyType] || 'mama';
    return `Hi ${salutation} 🌸 I'm Bloom, your AI companion. I'm here to support you with evidence-based information, Nigerian cultural context, and a warm heart. Ask me anything about pregnancy, fertility, postpartum, medications, or how you're feeling. I understand English, Yoruba, Igbo, Hausa, and Pidgin.\n\n---\n📍 This is general information, not medical advice. Always consult your GP or midwife.`;
  },

  food: `Great question! 🌿 For nutrition, here's what I recommend:\n\n🥬 **Iron-rich Nigerian foods:** Efo Riro (3x more iron than spinach), Moi Moi, Ogbono soup, Ugu leaf, and Tiger Nuts (Aya) — available at any market for ₦200–₦500.\n\n🍳 **Breakfast:** Akamu (pap) with Akara (bean cakes) or Moi Moi.\n\n🐟 **Lunch/Dinner:** Jollof rice with fish, Egusi soup, or Okro soup.\n\n💊 **Supplements:** Continue folic acid (400–800 mcg), Vitamin D (10 mcg), and iron if prescribed.\n\n🚫 **Avoid:** Agbo (herbal mixtures), excess caffeine (>200 mg/day), raw seafood, unpasteurised dairy.\n\n---\n📍 These are general food suggestions, not a personalised diet plan. Speak with a registered dietitian for individual advice.`,

  fertility: `🌸 Trying to conceive. Here's what can help:\n\n🥚 **Fertility-boosting foods:** Ugu leaf, Tiger Nuts (Aya), Garden eggs, Avocado, Fish, Eggs, Pumpkin seeds.\n\n📅 **Timing:** Sex every other day during your fertile window (5 days before ovulation through ovulation day).\n\n🌡️ **Track:** BBT and cervical mucus for accurate prediction.\n\n💊 **Supplements:** Folic acid (400 mcg), Vitamin D3 (1000 IU), Zinc.\n\n🚫 **Avoid:** Agbo, excessive zobo, NSAIDs around ovulation.\n\n🩺 **GP referral:** No pregnancy after 12 months (6 months if over 35).\n\n---\n📍 General information, not medical advice.`,

  ivf: `💜 You're doing something extraordinary.\n\n💊 **Medication:** Set reminders for injections. Rotate sites (left/right abdomen).\n\n🥑 **Nutrition:** Anti-inflammatory — olive oil, fatty fish, berries, nuts, leafy greens.\n\n😌 **Wellbeing:** The two-week wait is hard. Journal, rest, be gentle with yourself.\n\n📞 **Support:** Your clinic's nurse line is available 24/7.\n\n---\n📍 General information. Always follow your fertility specialist's guidance.`,

  jaundice: `👶 **Newborn jaundice** is common days 2–5.\n\n**Yellowing spreads:** face → chest → belly button → legs/feet.\n\n**Mild (face/chest only):**\n• Feed every 2–3 hours\n• Indirect morning sunlight 15–20 min\n• Monitor wet diapers (6+ daily)\n\n**🚨 Go to hospital if:**\n• Yellowing below belly button\n• Extremely sleepy, hard to wake\n• Poor feeding or fewer wet diapers\n• High-pitched cry\n\n---\n📍 Speak with your health visitor or GP.`,

  movement: `⚠️ **Reduced fetal movement — URGENT**\n\nAfter 24 weeks, never wait until the next day.\n\n1. Lie on your left side\n2. Drink a cold glass of water\n3. Count movements for 2 hours\n\n✅ Normal: 10+ movements in 2 hours.\n\n**🚨 Call maternity unit NOW if:**\n• Fewer than 10 movements in 2 hours\n• Moving less than usual\n• You are concerned — trust your instinct\n\n**Do not use home dopplers or apps** — false reassurance.\n\n📞 NHS 111 or your maternity unit immediately.\n\n---\n📍 Urgent medical guidance.`,

  bp: (triageLevel = 'monitor') => {
    if (triageLevel === 'emergency') {
      return `🚨 **EMERGENCY — Call 999 / 112 now**\n\nYou have described symptoms that may indicate severe preeclampsia:\n• Severe headache + vision changes and/or swelling\n\n**Do not wait. Do not drive yourself.**\n📞 999 (UK) · 112 (Nigeria)\n\n---\n📍 This is an emergency response. Seek immediate care.`;
    }
    if (triageLevel === 'urgent') {
      return `⚠️ **Blood pressure concern — contact your midwife or NHS 111 today**\n\n**Signs of preeclampsia to watch for:**\n• Severe headache not relieved by paracetamol\n• Visual changes (blurring, flashing lights)\n• Pain below ribs (right upper abdomen)\n• Sudden face/hand/feet swelling\n\n**With BP 140/90+:** Call midwife or NHS 111 within 24 hours.\n**With BP 160/110+:** 🚨 Call 999 / A&E now.\n\n---\n📍 Urgent medical guidance.`;
    }
    // monitor: headache alone
    return `🤕 **Headache during pregnancy**\n\nMost pregnancy headaches are tension headaches and resolve with rest.\n\n**Try first:**\n• Paracetamol (safe in pregnancy — follow pack dose)\n• Cold or warm compress\n• Rest in a dark, quiet room\n• Drink water — dehydration is a common cause\n\n**🚨 Call your midwife or NHS 111 if your headache:**\n• Is severe and not relieved by paracetamol\n• Comes with blurred vision, flashing lights, or swelling\n• Comes with pain under your right ribs\n• Is your worst ever headache\n\nThese can be signs of preeclampsia and need urgent assessment.\n\n---\n📍 General pregnancy advice. If in doubt, always call your midwife.`;
  },

  breast: `🤱 **Breastfeeding support**\n\n**Frequency:** 8–12 feeds per 24 hours (on demand).\n\n**Good latch signs:**\n• Wide open mouth before latching\n• Chin touches breast, nose free\n• You hear swallowing\n\n**Milk supply boosters:**\n• Oatmeal, Tiger Nuts (Aya), Moringa\n• Fenugreek (evidence mixed but safe)\n• 3–4 litres water daily\n\n**🚨 Seek help if:**\n• Baby not gaining weight\n• Fewer than 6 wet diapers daily\n• Severe pain or cracked nipples\n• Mastitis (red, hot, painful breast + fever)\n\n📞 Lactation consultant or health visitor.\n\n---\n📍 General breastfeeding guidance.`,

  sleep: (journeyType = 'mom') => {
    if (journeyType === 'menopause') {
      return `😴 **Sleep and menopause**\n\nNight sweats and hot flashes are the most common sleep disruptors.\n\n**Practical tips:**\n• Keep bedroom at 16–18 °C\n• Blackout curtains and white noise\n• Moisture-wicking bedwear (bamboo or cotton)\n• Avoid caffeine after 2 pm and alcohol in the evening\n• 4-7-8 breathing before bed\n\n**If sleep disruption is severe:** Ask your GP about CBT-I (first-line) or whether HRT could help.\n\n---\n📍 General guidance. Speak with your GP for persistent insomnia.`;
    }
    if (journeyType === 'menstrual' || journeyType === 'conceive') {
      return `😴 **Sleep and your cycle**\n\nProgesterone (luteal phase) causes drowsiness; low oestrogen (menstrual phase) can cause insomnia.\n\n**Tips:**\n• Consistent wake/sleep time anchors your cycle\n• Magnesium glycinate at bedtime eases PMS-related insomnia\n• Avoid blue light 1 hour before bed\n• Exercise helps — but not within 2 hours of sleep\n\n---\n📍 General guidance.`;
    }
    // default: postpartum / pregnancy
    return `😴 **Newborn sleep patterns**\n\n**Normal:** 2–4 hour cycles. Most babies don't sleep through until 6+ months.\n\n**Tips:**\n• Bath → gentle massage → feed → sleep routine\n• White noise\n• Firm flat mattress, fitted sheet only — no loose items\n• Room 16–20 °C\n\n**Safe sleep — always:**\n• Back to sleep\n• Same room as parents for first 6 months\n• Never on sofa or armchair\n\n**🚨 Worry if:**\n• Hard to wake for feeds\n• Fewer than 6 wet diapers daily\n\n---\n📍 Follows NHS safe sleep guidance.`;
  },

  depression: `💙 **Thank you for sharing how you're feeling.**\n\nYou are not alone. Postnatal depression affects 1 in 5 mothers. It is NOT weakness — it is a medical condition.\n\n**Common signs:**\n• Sadness or hopelessness most of the day\n• Loss of interest in things you enjoyed\n• Difficulty bonding with baby\n• Extreme tiredness, guilt, or feeling overwhelmed\n\n**📞 Help available now:**\n• **Samaritans (24/7):** 116 123\n• **PANDAS Foundation:** 0808 1961 776\n• **NHS 111:** urgent mental health support\n• **Text SHOUT to 85258**\n• **Your GP or health visitor** — make an appointment this week\n\n**🚨 If you're having thoughts of harming yourself or baby:** Call 999 or go to A&E immediately.\n\n---\n📍 Help is available. Recovery is possible.`,

  malaria: `⚠️ **Malaria in pregnancy — URGENT**\n\n🚨 Any fever during pregnancy needs same-day medical attention.\n\n1. Go to hospital or clinic TODAY\n2. Do NOT self-medicate with herbs or any medicine\n3. Ask for a malaria rapid test\n\n**Safe treatment:** Artemether-Lumefantrine (2nd/3rd trimester — as prescribed).\n\n**Prevention:** Insecticide-treated bed net every night. DEET repellent (safe in pregnancy). Long sleeves at dusk/dawn.\n\n**🚨 Go to A&E if:** High fever, difficulty breathing, severe headache, reduced fetal movement.\n\n---\n📍 Urgent medical guidance. Go to hospital for any fever in pregnancy.`,

  drug: `💊 **Medication safety check**\n\n1. Go to **Health tab → Drug Safety Checker** for a full database lookup.\n2. Or type the exact drug name and I'll check for you.\n\n**Generally safe in pregnancy (always confirm with your doctor):**\n• Paracetamol — pain and fever\n• Some antacids — heartburn\n\n**🚫 Avoid unless prescribed:**\n• Ibuprofen / NSAIDs (especially after 20 weeks)\n• Codeine / opioids\n• Agbo or unregulated herbal supplements\n\n📞 If you've taken something unsafe: GP, midwife, or NHS 111.\n\n---\n📍 Always consult your doctor before any medication in pregnancy.`,

  craving: `🍫 **Understanding cravings**\n\n| Craving | Possible need | Foods |\n|---|---|---|\n| Chocolate | Magnesium | Dark choc, nuts, seeds |\n| Ice | Iron (pica) ⚠️ | Iron supplement + efo riro |\n| Clay / dirt | Iron/Zinc (pica) 🚨 | See your GP urgently |\n| Salt | Electrolytes | Coconut water, bone broth |\n| Sour | Vitamin C | Oranges, tomatoes, lime |\n| Meat | Protein / iron | Fish, eggs, beans |\n\n**🚨 Craving non-food items (clay, dirt, chalk, soap):** This is pica — a sign of iron deficiency. Tell your midwife or GP immediately.\n\n---\n📍 See your doctor for persistent cravings or pica.`,

  posture: `🧘 **Back pain in pregnancy**\n\n**Sleep (20+ weeks):** Left side, pillow between knees.\n\n**Daily posture:**\n• Feet shoulder-width, pelvis neutral\n• Supportive shoes\n• Lower-back support when sitting\n\n**Exercises:** Pelvic tilts, prenatal yoga, swimming.\n\n**Pelvic girdle pain (PGP):** Keep knees together when moving, see a physio.\n\n**🚨 See GP / midwife if:** No improvement with rest, numbness or tingling in legs, pain with fever or contractions.\n\n---\n📍 General pregnancy advice.`,

  labour: `🤰 **Labour signs**\n\n**Established:** Contractions every 5 min, 60 sec long · Waters breaking · Bloody show.\n\n**🚨 Call maternity unit immediately:**\n• Waters break (any gestation)\n• Contractions before 37 weeks\n• Bleeding beyond a show\n• Reduced fetal movement\n\n**When to go in:** Contractions every 5 min (1st baby) or 7–10 min (subsequent).\n\n**Braxton Hicks:** Irregular, stop with rest, don't intensify.\n\n---\n📍 Follow your midwife's guidance. Call your maternity unit.`,

  postpartum: `🤱 **Postpartum recovery**\n\n**Physical:**\n• Rest when baby rests\n• Perineal care: ice packs, peri bottle, sitz baths\n• C-section: keep incision dry, no heavy lifting\n\n**Bleeding (lochia):** Normal 2–6 weeks. Red → brown → white.\n🚨 Soaking a pad hourly → call GP or A&E.\n\n**Emotional:**\n• Baby blues: days 3–10 (80% of mothers — normal)\n• PND: 1 in 5 — get help, treatment works\n\n**See GP if:** Fever >38 °C · Burning when peeing · Heavy bleeding · Sadness that won't lift.\n\n💙 You're doing an amazing job.\n\n---\n📍 Contact your GP or health visitor with any concerns.`,

  disclaimer: '\n\n---\n📍 This is general information, not medical advice. Always consult your GP, midwife, or health visitor.',

  default: (journeyType = 'pregnant') => {
    const salutation = JOURNEY_GREETING[journeyType] || 'mama';
    return `I'm here for you, ${salutation}. 🌸\n\nYou can ask me about:\n• 🥗 Food & Nutrition (Nigerian foods, pregnancy diet)\n• 💊 Medication safety\n• 👶 Baby movements / kick counting\n• 💙 Emotional health (anxiety, depression, support)\n• 🤱 Breastfeeding\n• 🏥 Warning signs (preeclampsia, jaundice, malaria)\n• 😴 Sleep\n\nI understand English, Yoruba, Igbo, Hausa, and Pidgin.\n\n---\n📍 General information, not medical advice. Emergencies: call 999 (UK) or 112 (Nigeria).`;
  },
};

// ─── Crisis detection ──────────────────────────────────────────────────────
export function detectCrisisTier(message) {
  const l = message.toLowerCase();
  if (CRISIS_T1.some(k => l.includes(k)) || CRISIS_PIDGIN.some(k => l.includes(k))) return 1;
  if (CRISIS_T2.some(k => l.includes(k))) return 2;
  if (CRISIS_T3.some(k => l.includes(k))) return 3;
  return 0;
}

// ─── Main response function ────────────────────────────────────────────────
export function bloomResp(msg, journeyType = 'pregnant') {
  const l = msg.toLowerCase();

  // ── Crisis: T1 — explicit suicidal / self-harm ───────────────────────────
  const tier = detectCrisisTier(msg);

  if (tier === 1) {
    return `🚨 **You are not alone. Please reach out right now.**\n\n${CRISIS_RESOURCES}\n\nYou matter. Please call or text now. 💙`;
  }

  if (tier === 2) {
    return `🚨 **Help is available right now.**\n\nWhat you're feeling is real, and you don't have to face it alone.\n\n${CRISIS_RESOURCES}\n\nPlease reach out — they are trained to listen without judgement. 💙`;
  }

  // ── Domestic violence ────────────────────────────────────────────────────
  if (
    l.includes('domestic violence') ||
    l.includes('abusive') ||
    l.includes('he hit me') || l.includes('she hit me') ||
    l.includes('partner hurts me') || l.includes('scared to go home') ||
    l.includes('partner beats') || l.includes('husband beats')
  ) {
    return `🛡️ **Your safety matters. This is never your fault.**\n\n📞 **National Domestic Abuse Helpline (24/7):** 0808 2000 247\n📞 **Refuge:** 0808 2000 247\n💬 **Women's Aid Live Chat:** womensaid.org.uk\n🚨 **Immediate danger? Call 999** (press 55 if you can't speak)\n📞 **Nigeria DV Helpline:** 0800 333 333\n\nThere are people who can help you right now. 💜`;
  }

  // ── Tier 3: distress — surface depression response + crisis footer ───────
  if (tier === 3) {
    return BLOOM_KB.depression + `\n\n${CRISIS_RESOURCES}`;
  }

  // ── Journey-specific ─────────────────────────────────────────────────────
  if (l.includes('ttc') || l.includes('trying to conceive') ||
      (l.includes('fertility') && !l.includes('ivf'))) {
    return BLOOM_KB.fertility;
  }

  if (l.includes('ivf') || l.includes('embryo') || l.includes('retrieval') || l.includes('transfer')) {
    return BLOOM_KB.ivf;
  }

  if (l.includes('postpartum') || l.includes('after birth') ||
      (l.includes('recovery') && l.includes('birth'))) {
    return BLOOM_KB.postpartum;
  }

  if (l.includes('labour') || l.includes('labor') || l.includes('contractions') ||
      l.includes('waters broken') || l.includes('waters broke')) {
    return BLOOM_KB.labour;
  }

  // ── Main categories ──────────────────────────────────────────────────────
  if (l.includes('food') || l.includes('eat') || l.includes('nutrition') ||
      l.includes('diet') || l.includes('meal') || l.includes('cook') || l.includes('recipe')) {
    return BLOOM_KB.food;
  }

  if (l.includes('jaundice') || l.includes('yellow') || l.includes('baby skin')) {
    return BLOOM_KB.jaundice;
  }

  if (l.includes('kick') || l.includes('movement') || l.includes('not moving') ||
      l.includes('fetal movement') || l.includes('baby moving')) {
    return BLOOM_KB.movement;
  }

  // ── BP / headache — triage-aware ─────────────────────────────────────────
  if (
    l.includes('blood pressure') || l.includes('bp') || l.includes('headache') ||
    l.includes('preeclampsia') || l.includes('swelling') || l.includes('vision') ||
    l.includes('blurred') || l.includes('head pain')
  ) {
    const triageLevel = triagebp(l);
    return typeof BLOOM_KB.bp === 'function' ? BLOOM_KB.bp(triageLevel) : BLOOM_KB.bp;
  }

  if (l.includes('breast') || l.includes('latch') || l.includes('milk') ||
      l.includes('breastfeed') || l.includes('nursing') || l.includes('supply')) {
    return BLOOM_KB.breast;
  }

  if (l.includes('sleep') || l.includes('tired') || l.includes('exhaust') ||
      l.includes('baby sleep') || l.includes('insomnia') || l.includes('night sweat')) {
    return typeof BLOOM_KB.sleep === 'function' ? BLOOM_KB.sleep(journeyType) : BLOOM_KB.sleep;
  }

  if (l.includes('sad') || l.includes('depress') || l.includes('cry') ||
      l.includes('anxious') || l.includes('anxiety') || l.includes('postnatal depression') ||
      l.includes('postpartum depression') || l.includes('overwhelmed')) {
    return BLOOM_KB.depression;
  }

  if (l.includes('malaria') || l.includes('fever') || l.includes('temperature') ||
      l.includes('chills')) {
    return BLOOM_KB.malaria;
  }

  if (l.includes('drug') || l.includes('medicine') || l.includes('medication') ||
      l.includes('tablet') || l.includes('pill') || l.includes('prescription')) {
    return BLOOM_KB.drug;
  }

  if (l.includes('craving') || l.includes('crave') || l.includes('clay') || l.includes('pica') ||
      (l.includes('ice') && (l.includes('eat') || l.includes('chew') || l.includes('craving')))) {
    return BLOOM_KB.craving;
  }

  if (l.includes('posture') || l.includes('back pain') || l.includes('sleep position') ||
      l.includes('pelvic') || l.includes('pgp')) {
    return BLOOM_KB.posture;
  }

  if (l.includes('hello') || l.includes('hi ') || l.includes('hey') ||
      l.includes('good morning') || l.includes('good evening') || msg.trim().toLowerCase() === 'hi') {
    const greeting = typeof BLOOM_KB.greeting === 'function'
      ? BLOOM_KB.greeting(journeyType)
      : BLOOM_KB.greeting;
    return `${greeting}\n\n${typeof BLOOM_KB.default === 'function' ? BLOOM_KB.default(journeyType) : BLOOM_KB.default}`;
  }

  return typeof BLOOM_KB.default === 'function' ? BLOOM_KB.default(journeyType) : BLOOM_KB.default;
}