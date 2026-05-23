// data/drugs.js

export const DRUGS = {
  paracetamol: { 
    name: "Paracetamol 500mg", 
    safety: "SAFE", 
    cat: "Pain Relief", 
    trim: "All trimesters", 
    dose: "500mg–1g every 4–6 hrs. Max 4g/day.", 
    warn: "Safe short-term. Do not exceed dose. Avoid alcohol.", 
    alt: "Cold compress, rest", 
    col: ["#E3F5EA", "#5A9E6E"], 
    icon: "✅",
    nigerianBrands: ["Panadol Extra", "M&B Paracetamol", "Emzor Paracetamol", "Pacymol"]
  },
  ibuprofen: { 
    name: "Ibuprofen 400mg", 
    safety: "AVOID", 
    cat: "NSAID / Pain Relief", 
    trim: "AVOID — especially after 20 weeks", 
    dose: "NOT RECOMMENDED", 
    warn: "Causes premature closure of ductus arteriosus. Risk of low amniotic fluid.", 
    alt: "Paracetamol is safer", 
    col: ["#FDEEEC", "#D0524A"], 
    icon: "🚫",
    nigerianBrands: ["Brufen", "Ibugesic", "Nurofen", "Advil"]
  },
  amoxicillin: { 
    name: "Amoxicillin 250mg", 
    safety: "GENERALLY SAFE", 
    cat: "Antibiotic", 
    trim: "All trimesters with prescription", 
    dose: "As prescribed only", 
    warn: "Must be prescribed. Never self-medicate antibiotics during pregnancy.", 
    alt: "Only on prescription", 
    col: ["#E4EFF9", "#3A78C4"], 
    icon: "ℹ️",
    nigerianBrands: ["Amoxil", "Clamoxyl", "Amoxiclav"]
  },
  "folic acid": { 
    name: "Folic Acid 5mg", 
    safety: "RECOMMENDED", 
    cat: "Vitamin B9", 
    trim: "All trimesters — start before conception", 
    dose: "400–600mcg daily (5mg if high risk)", 
    warn: "One of the most important supplements. Start before conception.", 
    alt: "Foods: Efo, Moi Moi, Lentils, Ugu leaf", 
    col: ["#E3F5EA", "#5A9E6E"], 
    icon: "💚",
    nigerianBrands: ["Folic Acid Tablets", "Folate 5mg", "Pregnacare"]
  },
  malaria: { 
    name: "Antimalarial Drug", 
    safety: "DEPENDS ON TYPE", 
    cat: "Antimalarial", 
    trim: "Check specific drug with doctor", 
    dose: "CONSULT DOCTOR IMMEDIATELY", 
    warn: "Malaria is extremely dangerous in pregnancy. Artemether-Lumefantrine generally safe in 2nd/3rd trimester.", 
    alt: "Hospital treatment immediately", 
    col: ["#FEF2E0", "#C87C30"], 
    icon: "⚠️",
    nigerianBrands: ["Coartem", "Lonart", "Artequin", "Lumether"]
  },
  ampiclox: {
    name: "Ampiclox (Ampicillin + Cloxacillin)",
    safety: "CAUTION",
    cat: "Antibiotic",
    trim: "Prescription only",
    dose: "As prescribed",
    warn: "Use only when prescribed. Complete full course.",
    alt: "Consult doctor for alternative",
    col: ["#FEF2E0", "#C87C30"],
    icon: "⚠️",
    nigerianBrands: ["Ampiclox", "Ampclox Beecham", "Clampicil"]
  },
  flagyl: {
    name: "Flagyl / Metronidazole",
    safety: "CAUTION",
    cat: "Antibiotic",
    trim: "Avoid 1st trimester",
    dose: "Prescription only",
    warn: "Avoid in first trimester if possible. Use only if clearly needed.",
    alt: "Consult doctor for alternative",
    col: ["#FEF2E0", "#C87C30"],
    icon: "⚠️",
    nigerianBrands: ["Flagyl", "Metrozine", "Rozex"]
  },
  codeine: {
    name: "Codeine / Codipar",
    safety: "AVOID",
    cat: "Opioid Analgesic",
    trim: "AVOID all trimesters",
    dose: "NOT RECOMMENDED",
    warn: "Risk of neonatal abstinence syndrome. Avoid while breastfeeding.",
    alt: "Paracetamol for pain relief",
    col: ["#FDEEEC", "#D0524A"],
    icon: "🚫",
    nigerianBrands: ["Codipar", "Codipront", "Paracod"]
  },
  artemether: {
    name: "Artemether-Lumefantrine",
    safety: "SAFE (2nd/3rd trimester)",
    cat: "Antimalarial",
    trim: "Safe 2nd/3rd trimester, caution 1st",
    dose: "As prescribed by doctor",
    warn: "Safe for treating uncomplicated malaria in 2nd/3rd trimester. Hospital preferred for 1st trimester.",
    alt: "Seek hospital care",
    col: ["#E3F5EA", "#5A9E6E"],
    icon: "✅",
    nigerianBrands: ["Coartem", "Lonart", "Artequin"]
  },
  default: { 
    name: "Unknown Medication", 
    safety: "CONSULT DOCTOR", 
    cat: "Unknown", 
    trim: "Unknown", 
    dose: "Cannot advise", 
    warn: "Not in database. NEVER take any medication in pregnancy without consulting your doctor.", 
    alt: "Consult healthcare provider", 
    col: ["#FEF2E0", "#C87C30"], 
    icon: "👩‍⚕️" 
  },
};

export const DRUG_DB = {
  panadol:      { name:"Panadol / Paracetamol", cat:"Pain Relief", icon:"✅", rating:"SAFE", col:["#E3F5EA","#5A9E6E"], mechanism:"Inhibits prostaglandin synthesis centrally; minimal fetal exposure at therapeutic doses.", guidance:{ "T1":"500 mg–1 g every 4–6 h. Max 4 g/day. Safe in 1st trimester.", "T2":"Same dose. Safe in 2nd trimester.", "T3":"Same dose. Avoid prolonged use >10 days.", postpartum:"Safe while breastfeeding.", menstrual:"First-line for period pain.", follicular:"Fine to use.", ovulatory:"Fine to use.", luteal:"Good choice for PMS headaches." }, nigerian:["Panadol Extra","M&B Paracetamol","Emzor Paracetamol"], alt:"Cold compress, rest, hydration" },
  ibuprofen:    { name:"Ibuprofen / Brufen", cat:"NSAID", icon:"🚫", rating:"AVOID", col:["#FDEEEC","#D0524A"], mechanism:"NSAID — inhibits COX enzymes. After 20 weeks causes premature closure of ductus arteriosus and oligohydramnios.", guidance:{ "T1":"Avoid if possible — theoretical miscarriage risk.", "T2":"AVOID after week 20 — can cause kidney & heart problems in baby.", "T3":"AVOID — risk of premature ductus closure.", postpartum:"Weeks 1–4: use paracetamol. After week 4: short courses okay with doctor.", menstrual:"Can use short-term for dysmenorrhoea — take with food.", follicular:"Generally safe.", ovulatory:"Caution if TTC — may impair ovulation.", luteal:"Avoid if TTC — may reduce implantation." }, nigerian:["Brufen","Ibugesic","Nurofen"], alt:"Paracetamol is safer in pregnancy" },
  ampiclox:     { name:"Ampiclox (Ampicillin + Cloxacillin)", cat:"Antibiotic", icon:"⚠️", rating:"CAUTION", col:["#FEF2E0","#C87C30"], mechanism:"Beta-lactam antibiotic. Generally considered safe but must be prescribed.", guidance:{ "T1":"Only on prescription.", "T2":"Prescription only.", "T3":"Prescription only.", postpartum:"Compatible with breastfeeding on prescription.", menstrual:"Only if prescribed.", follicular:"Prescription only.", ovulatory:"Prescription only.", luteal:"Prescription only." }, nigerian:["Ampiclox","Ampclox Beecham","Clampicil"], alt:"Full medical evaluation before use" },
  flagyl:       { name:"Flagyl / Metronidazole", cat:"Antibiotic / Antiprotozoal", icon:"⚠️", rating:"CAUTION", col:["#FEF2E0","#C87C30"], mechanism:"Disrupts DNA synthesis in anaerobes and protozoa. 1st trimester use controversial.", guidance:{ "T1":"AVOID — possible teratogenic risk.", "T2":"Can be used if prescribed.", "T3":"Prescription only.", postpartum:"Compatible with breastfeeding (short course).", menstrual:"Prescription only.", follicular:"Prescription only.", ovulatory:"Prescription only.", luteal:"Prescription only." }, nigerian:["Flagyl","Metrozine","Rozex"], alt:"Confirm diagnosis with swab; prescription required" },
  codeine:      { name:"Codeine / Codipar", cat:"Opioid Analgesic", icon:"🚫", rating:"AVOID", col:["#FDEEEC","#D0524A"], mechanism:"Opioid — crosses placenta; risk of neonatal abstinence syndrome.", guidance:{ "T1":"Avoid.", "T2":"Avoid.", "T3":"AVOID.", postpartum:"AVOID breastfeeding.", menstrual:"Use sparingly, lowest dose.", follicular:"Caution.", ovulatory:"Caution.", luteal:"Caution." }, nigerian:["Codipar","Codipront","Paracod"], alt:"Paracetamol ± NSAID for mild pain" },
  "folic acid": { name:"Folic Acid", cat:"Vitamin B9", icon:"💚", rating:"RECOMMENDED", col:["#E3F5EA","#5A9E6E"], mechanism:"Essential for neural tube closure. Reduces spina bifida risk by up to 70%.", guidance:{ "T1":"400–600 mcg daily — CRITICAL in first 12 weeks.", "T2":"Continue 400 mcg.", "T3":"Continue supplementation.", postpartum:"Continue if breastfeeding.", menstrual:"Take daily.", follicular:"Take daily.", ovulatory:"Take daily.", luteal:"Take daily." }, nigerian:["Folic Acid Tablets","Folate 5mg","Pregnacare"], alt:"Efo riro, moi moi, lentils, spinach" },
  malaria:      { name:"Antimalarials (general)", cat:"Antimalarial", icon:"🆘", rating:"EMERGENCY", col:["#FDEEEC","#D0524A"], mechanism:"Malaria in pregnancy is life-threatening — causes severe anaemia, preterm birth, stillbirth.", guidance:{ "T1":"Artemether-Lumefantrine if required. Seek hospital immediately.", "T2":"Artemether-Lumefantrine first-line in Nigeria.", "T3":"Same. IV artesunate for severe malaria.", postpartum:"Treat immediately.", menstrual:"Treat immediately.", follicular:"Treat immediately.", ovulatory:"Treat immediately.", luteal:"Treat immediately." }, nigerian:["Coartem","Lonart","Artequin","Lumether"], alt:"SEEK HOSPITAL — do not self-treat severe malaria" },
  zobo:         { name:"Zobo / Hibiscus Tea", cat:"Herbal Drink", icon:"🚫", rating:"AVOID", col:["#FDEEEC","#D0524A"], mechanism:"Hibiscus sabdariffa stimulates uterine contractions.", guidance:{ "T1":"AVOID — uterine stimulant.", "T2":"AVOID.", "T3":"AVOID.", postpartum:"Small amounts likely okay after 8 weeks.", menstrual:"Limit to 1 cup.", follicular:"Moderate use okay.", ovulatory:"Moderate use.", luteal:"Avoid large amounts if TTC." }, nigerian:["Zobo drink","Sobo","Bissap"], alt:"Plain water, ginger tea, coconut water" },
  ginger:       { name:"Ginger (Atale)", cat:"Herbal / Food", icon:"✅", rating:"SAFE", col:["#E3F5EA","#5A9E6E"], mechanism:"Inhibits serotonin receptors in gut — reduces nausea. Safe at culinary doses.", guidance:{ "T1":"Excellent for morning sickness — 250 mg capsule or fresh ginger tea.", "T2":"Culinary use fine.", "T3":"Culinary safe.", postpartum:"Good for postpartum digestion.", menstrual:"Ginger tea reduces dysmenorrhoea.", follicular:"Fine.", ovulatory:"Fine.", luteal:"Good for PMS bloating." }, nigerian:["Fresh atale","Ginger powder","Ginger tea"], alt:"Peppermint tea, lemon water for nausea" },
  "bitter leaf": { name:"Bitter Leaf (Vernonia amygdalina)", cat:"Nigerian Herb", icon:"⚠️", rating:"CAUTION", col:["#FEF2E0","#C87C30"], mechanism:"Contains alkaloids with uterotonic properties at high doses.", guidance:{ "T1":"Avoid medicinal doses.", "T2":"Culinary amounts okay.", "T3":"Same caution.", postpartum:"Limit to soup use.", menstrual:"Caution with concentrated extracts.", follicular:"Small culinary amounts okay.", ovulatory:"Caution.", luteal:"Caution if TTC." }, nigerian:["Onugbu soup","Bitter leaf extract drink"], alt:"Ugu leaf is safer in pregnancy" },
  fenugreek:    { name:"Fenugreek (Eru)", cat:"Herbal Supplement", icon:"⚠️", rating:"CAUTION", col:["#FEF2E0","#C87C30"], mechanism:"Phytoestrogen and uterine stimulant at high doses.", guidance:{ "T1":"Avoid supplements.", "T2":"Culinary use fine.", "T3":"AVOID high doses.", postpartum:"Widely used to boost milk supply — 1–3 g/day.", menstrual:"May ease cramps.", follicular:"Fine.", ovulatory:"Fine.", luteal:"Caution if TTC." }, nigerian:["Eru seeds","Hulba"], alt:"For milk supply: oats, moringa" },
  "raw fish":   { name:"Raw Fish / Sushi", cat:"Food Hazard", icon:"🚫", rating:"AVOID", col:["#FDEEEC","#D0524A"], mechanism:"Risk of Listeria, Salmonella, mercury exposure.", guidance:{ "T1":"AVOID.", "T2":"AVOID all raw seafood.", "T3":"AVOID.", postpartum:"Limit high-mercury fish.", menstrual:"Ensure seafood is fully cooked.", follicular:"Low-mercury cooked fish encouraged.", ovulatory:"Fine — cooked fish.", luteal:"Cooked fish is great." }, nigerian:["Sushi","Crayfish should be well-dried"], alt:"Well-cooked titus, tilapia, catfish" },
  liver:        { name:"Liver (Cow/Chicken Liver)", cat:"Food Hazard", icon:"⚠️", rating:"CAUTION", col:["#FEF2E0","#C87C30"], mechanism:"Extremely high in Vitamin A (retinol). Excess retinol is teratogenic.", guidance:{ "T1":"AVOID large portions.", "T2":"Limit to once a week.", "T3":"Small portions occasionally.", postpartum:"Fine — excellent iron source.", menstrual:"Excellent for iron.", follicular:"Good iron source.", ovulatory:"Fine.", luteal:"Fine." }, nigerian:["Ngwo ngwo","Asun","Isi ewu"], alt:"Chicken, egg, leafy greens" },
  cheese:       { name:"Unpasteurised / Soft Cheese", cat:"Food Hazard", icon:"🚫", rating:"AVOID", col:["#FDEEEC","#D0524A"], mechanism:"Unpasteurised dairy can carry Listeria monocytogenes.", guidance:{ "T1":"AVOID.", "T2":"AVOID.", "T3":"AVOID.", postpartum:"Pasteurised cheese fine after birth.", menstrual:"Fine.", follicular:"Fine.", ovulatory:"Fine.", luteal:"Fine." }, nigerian:["Wara (check pasteurisation)"], alt:"Hard pasteurised cheese" },
  pesticides:   { name:"Pesticides / Insecticides", cat:"Environmental Hazard", icon:"🚫", rating:"AVOID", col:["#FDEEEC","#D0524A"], mechanism:"Organophosphates disrupt fetal neurological development.", guidance:{ "T1":"AVOID spraying.", "T2":"AVOID.", "T3":"AVOID.", postpartum:"Avoid near fresh spray.", menstrual:"Minimise.", follicular:"Minimise.", ovulatory:"Minimise.", luteal:"Minimise." }, nigerian:["Rambo insecticide","Raid","Farm pesticides"], alt:"Mosquito nets, neem-based repellents" },
  relaxers:     { name:"Hair Relaxers / Chemical Straighteners", cat:"Environmental Hazard", icon:"⚠️", rating:"CAUTION", col:["#FEF2E0","#C87C30"], mechanism:"Contain formaldehyde releasers and endocrine-disrupting phthalates.", guidance:{ "T1":"AVOID.", "T2":"Minimise. Ventilate, wear gloves.", "T3":"Minimise.", postpartum:"Ventilated areas only.", menstrual:"Patch test.", follicular:"Okay with ventilation.", ovulatory:"Fine.", luteal:"Fine." }, nigerian:["Dark & Lovely","ORS Olive Oil Relaxer","TCB Naturals"], alt:"Braids, twists, protective styles" },
  "paint fumes": { name:"Paint Fumes / VOCs", cat:"Environmental Hazard", icon:"🚫", rating:"AVOID", col:["#FDEEEC","#D0524A"], mechanism:"VOCs — benzene, toluene — are neurotoxic.", guidance:{ "T1":"AVOID entirely.", "T2":"AVOID. Ventilate for 72 h.", "T3":"AVOID fresh paint fumes.", postpartum:"Ventilate well for 2 weeks.", menstrual:"Minimise VOC exposure.", follicular:"Low-VOC paints.", ovulatory:"Minimise.", luteal:"Minimise." }, nigerian:["Dulux","Berger Paints (conventional)"], alt:"Low-VOC / zero-VOC paints" },
  artemether:   { name:"Artemether-Lumefantrine", cat:"Antimalarial", icon:"✅", rating:"SAFE (2nd/3rd)", col:["#E3F5EA","#5A9E6E"], mechanism:"Artemisinin combination therapy. Effective for uncomplicated malaria.", guidance:{ "T1":"Hospital assessment required.", "T2":"First-line treatment in Nigeria. Safe.", "T3":"Safe. Complete full course.", postpartum:"Safe while breastfeeding.", menstrual:"Fine.", follicular:"Fine.", ovulatory:"Fine.", luteal:"Fine." }, nigerian:["Coartem","Lonart","Artequin"], alt:"Seek hospital care immediately" },
};

export const TRADITIONAL = [
  { practice: "Drinking Zobo (Hibiscus Tea)", status: "CAUTION", reason: "High amounts may stimulate uterine contractions. Small amounts likely safe.", safe: false },
  { practice: "Applying Shea Butter on Belly", status: "SAFE", reason: "Excellent for stretch mark prevention. Rich in Vitamin E and fatty acids.", safe: true },
  { practice: "Eating Tiger Nuts (Aya)", status: "SAFE", reason: "Nigerian superfood. High calcium, iron, Vitamin E. Highly recommended.", safe: true },
  { practice: "Using Dry Gin for Baby Bath", status: "DANGEROUS", reason: "Toxic to newborn skin and respiratory system. Never use on newborns.", safe: false },
  { practice: "Drinking Orishirishi (Mixed Herbs)", status: "AVOID", reason: "Unknown composition. Many contain plants with abortifacient properties.", safe: false },
  { practice: "Eating Unripe Pawpaw (Papaya)", status: "AVOID", reason: "Contains latex that can trigger uterine contractions.", safe: false },
  { practice: "Eating Plenty of Ugwu (Pumpkin Leaves)", status: "SAFE", reason: "Fluted pumpkin leaf is rich in iron, folate, and Vitamin C.", safe: true },
  { practice: "Tying Wrapper Tight on Belly", status: "CAUTION", reason: "Very tight wrapping can restrict fetal movement and reduce blood flow.", safe: false },
  { practice: "Eating Okra (Ila)", status: "SAFE", reason: "Rich in folate, vitamin C, and fiber. Excellent for digestion.", safe: true },
  { practice: "Using Moringa (Zogale)", status: "SAFE", reason: "Highly nutritious. Good for milk supply postpartum.", safe: true },
  { practice: "Drinking Agbo (Herbal Mix)", status: "DANGEROUS", reason: "Unknown ingredients. Many contain abortifacient herbs like Ereru, Ewe Igbale.", safe: false },
  { practice: "Eating Pounded Yam", status: "SAFE", reason: "Good source of carbohydrates. Ensure hygiene in preparation.", safe: true },
  { practice: "Hot Pepper Soup", status: "CAUTION", reason: "Very spicy food may cause heartburn and indigestion.", safe: false },
  { practice: "Eating Ugba (Oil Bean Seed)", status: "CAUTION", reason: "May contain preservatives. Ensure well-cooked from clean source.", safe: false },
];

export const SYMPTOMS_RISK = [
  { combo: ["Headache", "Swelling", "High BP"], risk: "EMERGENCY", condition: "Preeclampsia", action: "Go to hospital IMMEDIATELY. Do not drive yourself.", urgency: "critical" },
  { combo: ["Fever", "Chills", "Headache"], risk: "HIGH", condition: "Malaria / Infection", action: "Go to hospital for blood test and treatment today.", urgency: "urgent" },
  { combo: ["Reduced kicks", "No movement 2hr"], risk: "EMERGENCY", condition: "Fetal Distress", action: "Go to hospital immediately. Time-critical emergency.", urgency: "critical" },
  { combo: ["Vaginal bleeding", "Cramping"], risk: "EMERGENCY", condition: "Placental Abruption / Preterm Labour", action: "Call emergency services or go to hospital now.", urgency: "critical" },
  { combo: ["Nausea", "Fatigue"], risk: "LOW", condition: "Normal Pregnancy Symptoms", action: "Rest, stay hydrated. Eat small frequent meals.", urgency: "low" },
  { combo: ["Back pain", "Leg swelling"], risk: "MEDIUM", condition: "Possible DVT / Fluid Retention", action: "Elevate legs, stay hydrated. See doctor this week.", urgency: "medium" },
  { combo: ["Severe headache", "Vision changes"], risk: "EMERGENCY", condition: "Preeclampsia", action: "Call 999 or go to A&E immediately.", urgency: "critical" },
  { combo: ["Shortness of breath", "Chest pain"], risk: "EMERGENCY", condition: "Pulmonary Embolism / Heart Issue", action: "Call 999 immediately.", urgency: "critical" },
  { combo: ["Water breaking", "Contractions"], risk: "EMERGENCY", condition: "Preterm Labour", action: "Go to hospital immediately.", urgency: "critical" },
  { combo: ["Itching all over", "Dark urine"], risk: "HIGH", condition: "Obstetric Cholestasis", action: "See GP or midwife today for blood test.", urgency: "urgent" },
];

export const CONTEXT_KEYS = {
  "Pregnancy — T1":"T1",
  "Pregnancy — T2":"T2",
  "Pregnancy — T3":"T3",
  "Postpartum (Wk 1–12)":"postpartum",
  "Cycle: Menstrual":"menstrual",
  "Cycle: Follicular":"follicular",
  "Cycle: Ovulatory":"ovulatory",
  "Cycle: Luteal":"luteal"
};

export const RATING_META = {
  SAFE:{icon:"✅",col:"#5A9E6E",bg:"#E3F5EA",label:"Safe"},
  RECOMMENDED:{icon:"💚",col:"#5A9E6E",bg:"#E3F5EA",label:"Recommended"},
  CAUTION:{icon:"⚠️",col:"#C87C30",bg:"#FEF2E0",label:"Use with Caution"},
  AVOID:{icon:"🚫",col:"#D0524A",bg:"#FDEEEC",label:"Avoid"},
  EMERGENCY:{icon:"🆘",col:"#D0524A",bg:"#FDEEEC",label:"Seek Emergency Care"},
  "CONSULT DOCTOR":{icon:"👩‍⚕️",col:"#C87C30",bg:"#FEF2E0",label:"Consult Doctor"},
  "GENERALLY SAFE":{icon:"✅",col:"#5A9E6E",bg:"#E3F5EA",label:"Generally Safe"},
  "DEPENDS ON TYPE":{icon:"⚠️",col:"#C87C30",bg:"#FEF2E0",label:"Depends on Type"},
  "SAFE (2nd/3rd trimester)":{icon:"✅",col:"#5A9E6E",bg:"#E3F5EA",label:"Safe in 2nd/3rd Trimester"},
  DANGEROUS:{icon:"🚫",col:"#D0524A",bg:"#FDEEEC",label:"Dangerous - Do Not Use"}
};

export const DRUG_SUGGESTIONS = [
  "Panadol","Paracetamol","Ibuprofen","Brufen","Ampiclox","Flagyl","Metronidazole","Codeine",
  "Folic Acid","Folate","Coartem","Artemether","Malaria drugs","Zobo","Ginger","Atale",
  "Bitter Leaf","Onugbu","Fenugreek","Eru","Raw Fish","Sushi","Liver","Cheese","Wara",
  "Pesticides","Rambo","Insecticide","Relaxers","Hair relaxer","Dark & Lovely","Paint fumes",
  "Shea butter","Ori","Tiger nuts","Aya","Ugwu","Pumpkin leaves","Okra","Ila","Moringa","Zogale",
  "Agbo","Herbal mixture","Pounded yam","Hot pepper soup","Ugba","Oil bean"
];

// Helper function to get drug by name (case-insensitive)
export function getDrugByName(name) {
  const lowerName = name.toLowerCase().trim();
  
  // Check main DRUGS object
  for (const [key, drug] of Object.entries(DRUGS)) {
    if (lowerName.includes(key) || drug.name.toLowerCase().includes(lowerName)) {
      return drug;
    }
  }
  
  // Check DRUG_DB
  for (const [key, drug] of Object.entries(DRUG_DB)) {
    if (lowerName.includes(key) || drug.name.toLowerCase().includes(lowerName)) {
      return {
        name: drug.name,
        safety: drug.rating,
        cat: drug.cat,
        trim: "Varies",
        dose: "Consult doctor",
        warn: drug.mechanism,
        alt: drug.alt,
        col: drug.col,
        icon: drug.icon,
        nigerianBrands: drug.nigerian
      };
    }
  }
  
  return DRUGS.default;
}

// Helper function to get traditional practice by name
export function getTraditionalPractice(name) {
  const lowerName = name.toLowerCase();
  return TRADITIONAL.find(t => t.practice.toLowerCase().includes(lowerName)) || null;
}

// Helper function to check symptom risk
export function checkSymptomRisk(symptoms) {
  const lowerSymptoms = symptoms.map(s => s.toLowerCase());
  
  for (const risk of SYMPTOMS_RISK) {
    const matches = risk.combo.every(symptom => 
      lowerSymptoms.some(ls => ls.includes(symptom.toLowerCase()))
    );
    if (matches) return risk;
  }
  return null;
}