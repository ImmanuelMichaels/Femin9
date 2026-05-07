import { useState, useEffect, useRef, useCallback } from "react";
import boardImage from '/boardimg.png';

// ============================================================
// GLOBAL STYLES — Full Responsive System
// ============================================================
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&display=swap');

    *, *::before, *::after {
      margin: 0; padding: 0; box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }

    :root {
      --t:#E07840; --td:#B85A26; --tl:#F2A07A;
      --cream:#FAF8F5; --card:#FFFFFF; --warm:#F5F0E8;
      --border:#EDE8E1; --border2:#E5DDD4;
      --sg:#5A9E6E; --sgl:#E3F5EA; --sgm:#6AAB7C;
      --lv:#8B7EC8; --lvl:#EDE9F8; --lvm:#9B8EC4;
      --rd:#D0524A; --rdl:#FDEEEC; --rdm:#E05A52;
      --gd:#C87C30; --gdl:#FEF2E0; --gdm:#D4883A;
      --bl:#3A78C4; --bll:#E4EFF9; --blm:#4A88D4;
      --dp:#1C0F00; --md:#5C3D2E; --mt:#A08878;
      --fs-2xs: clamp(8px,1.8vw,10px);
      --fs-xs:  clamp(10px,2.2vw,11px);
      --fs-sm:  clamp(11px,2.6vw,13px);
      --fs-base:clamp(12px,2.8vw,14px);
      --fs-md:  clamp(13px,3.0vw,15px);
      --fs-lg:  clamp(14px,3.4vw,17px);
      --fs-xl:  clamp(16px,3.8vw,20px);
      --fs-2xl: clamp(20px,4.8vw,26px);
      --fs-3xl: clamp(26px,6.0vw,36px);
      --fs-hero:clamp(36px,9vw,52px);
      --sp-1: clamp(4px,1.0vw,6px);
      --sp-2: clamp(6px,1.4vw,9px);
      --sp-3: clamp(9px,2.0vw,13px);
      --sp-4: clamp(12px,2.8vw,17px);
      --sp-5: clamp(16px,3.8vw,22px);
      --sp-6: clamp(20px,4.8vw,30px);
      --pad-x:   clamp(14px,4vw,24px);
      --pad-y:   clamp(16px,3.5vw,22px);
      --card-p:  clamp(13px,3.2vw,18px);
      --gap-sm:  clamp(6px,1.4vw,10px);
      --gap-md:  clamp(9px,2.2vw,14px);
      --gap-lg:  clamp(12px,3.0vw,18px);
      --r:  clamp(10px,2.5vw,14px);
      --r2: clamp(14px,3.5vw,20px);
      --r3: clamp(20px,5.0vw,28px);
      --nav-h:    clamp(64px,11vw,82px);
      --icon-sm:  clamp(32px,7.5vw,42px);
      --icon-md:  clamp(40px,9.5vw,52px);
      --icon-lg:  clamp(48px,11vw,62px);
      --avatar:   clamp(38px,9vw,48px);
      --touch:    clamp(40px,9vw,48px);
      --sh:  0 2px 20px rgba(100,60,30,0.08);
      --sh2: 0 6px 36px rgba(100,60,30,0.14);
    }

    html { font-size: 16px; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: var(--cream);
      color: var(--dp);
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }
    button  { cursor: pointer; border: none; font-family: inherit; }
    input, textarea, select { font-family: inherit; }
    .serif  { font-family: 'Cormorant Garamond', serif; }
    ::-webkit-scrollbar { width: 0; height: 0; }
    img     { max-width: 100%; display: block; }

    @keyframes fu      { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fi      { from{opacity:0} to{opacity:1} }
    @keyframes sp      { to{transform:rotate(360deg)} }
    @keyframes pu      { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
    @keyframes hb      { 0%,100%{transform:scale(1)} 14%{transform:scale(1.18)} 28%{transform:scale(1)} }
    @keyframes bl      { 0%,80%,100%{opacity:0.15} 40%{opacity:1} }
    @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
    .fu      { animation: fu 0.35s ease both; }
    .fi      { animation: fi 0.35s ease both; }
    .slideUp { animation: slideUp 0.4s ease both; }

    input[type=range] {
      -webkit-appearance: none; width: 100%;
      height: 6px; border-radius: 3px;
      background: var(--border); outline: none; cursor: pointer;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: clamp(16px,4vw,20px); height: clamp(16px,4vw,20px);
      border-radius: 50%; background: var(--t);
      cursor: pointer; box-shadow: 0 2px 8px rgba(224,120,64,0.35);
    }

    .app-page {
      position: fixed; inset: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .app-frame {
      position: relative;
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      overflow: hidden;
      background: var(--cream);
    }
    @media (min-width: 640px) {
      .app-page {
        background: linear-gradient(140deg,#F0E6D8 0%,#DDF0E4 55%,#E6E0F5 100%);
      }
      .app-frame {
        width: clamp(400px,62vw,600px);
        height: clamp(640px,92vh,960px);
        border-radius: var(--r3);
        box-shadow: var(--sh2), 0 0 0 1px rgba(100,60,30,0.06);
      }
    }
    @media (min-width: 1024px) {
      .app-frame {
        width: clamp(540px,52vw,720px);
        height: clamp(700px,94vh,980px);
      }
    }
    @media (min-width: 1440px) {
      .app-frame {
        width: clamp(640px,46vw,800px);
        height: clamp(760px,95vh,1000px);
      }
    }

    .scroll-area {
      flex: 1; overflow-y: auto; overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
    }
    .page-pad {
      padding: var(--pad-y) var(--pad-x) calc(var(--nav-h) + var(--sp-5));
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: var(--warm);
      border-radius: 30px;
      font-size: var(--fs-xs);
      font-weight: 700;
    }

    .bottom-nav {
      height: var(--nav-h);
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px);
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 0 20px;
    }
    .bottom-nav::-webkit-scrollbar { display: none; }
    .nav-btn {
      flex: 1;
      display: flex; flex-direction: column; align-items: center;
      justify-content: center;
      gap: clamp(2px,0.6vw,4px);
      padding: 0 clamp(6px,1.5vw,10px);
      background: none; border: none; cursor: pointer;
    }
    .nav-icon {
      width: 44px; height: 44px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 14px;
      font-size: 20px;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .nav-icon {
      width: 44px; height: 44px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 14px;
      font-size: 20px;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .nav-label {
      font-size: clamp(7.5px,1.9vw,9.5px);
      font-weight: 800; letter-spacing: 0.3px;
      white-space: nowrap; color: var(--mt);
    }
    .nav-label.active { color: var(--t); }

    .wcard {
      background: var(--card);
      border-radius: var(--r2);
      padding: var(--card-p);
      margin-bottom: var(--gap-md);
      box-shadow: var(--sh);
      border: 1px solid var(--border);
    }
    .tag {
      display: inline-flex; align-items: center;
      padding: clamp(2px,0.5vw,4px) clamp(7px,1.8vw,11px);
      border-radius: 20px;
      font-size: var(--fs-2xs); font-weight: 700;
      white-space: nowrap; letter-spacing: 0.2px;
    }
    .cal-strip {
      display: grid; grid-template-columns: repeat(7,1fr);
      gap: clamp(3px,0.8vw,6px);
      margin-bottom: var(--sp-5);
    }
    .cal-day {
      display: flex; flex-direction: column; align-items: center;
      gap: clamp(4px,1vw,7px);
      padding: clamp(6px,1.5vw,10px) clamp(2px,0.5vw,4px);
      border-radius: clamp(10px,2.5vw,14px);
      border: none; cursor: pointer;
      transition: all 0.2s;
      background: transparent;
    }
    .cal-day.active { background: var(--dp); }
    .cal-day-name { font-size: var(--fs-2xs); font-weight: 600; color: var(--mt); }
    .cal-day.active .cal-day-name { color: rgba(255,255,255,0.55); }
    .cal-day-num { font-size: var(--fs-md); font-weight: 800; color: var(--dp); }
    .cal-day.active .cal-day-num { color: #fff; }
    .habit-row {
      display: flex; align-items: center;
      gap: clamp(10px,2.5vw,14px);
      padding: clamp(10px,2.5vw,14px) 0;
      border-bottom: 1px solid var(--border);
    }
    .habit-row:last-child { border-bottom: none; }
    .sec-title {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: var(--gap-md);
      margin-top: var(--sp-2);
    }
    .sec-title h2 { font-size: var(--fs-lg); font-weight: 800; color: var(--dp); letter-spacing: -0.3px; }
    .prog-track { height: clamp(5px,1.2vw,7px); background: var(--border); border-radius: 4px; overflow: hidden; }
    .prog-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
    .quick-grid {
      display: grid; grid-template-columns: repeat(4,1fr);
      gap: var(--gap-sm); margin-bottom: var(--sp-5);
    }
    .quick-btn {
      display: flex; flex-direction: column; align-items: center;
      gap: clamp(4px,1vw,7px);
      padding: clamp(10px,2.5vw,15px) clamp(2px,0.5vw,4px);
      border-radius: var(--r); border: none; cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .quick-btn:active { transform: scale(0.96); }
    .quick-btn span { font-size: clamp(18px,4.5vw,24px); }
    .quick-btn small { font-size: var(--fs-2xs); font-weight: 800; text-align: center; line-height: 1.3; letter-spacing: 0.1px; }
    .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--gap-sm); margin-bottom: var(--sp-4); }
    .form-input {
      width: 100%;
      padding: clamp(11px,2.8vw,15px) clamp(13px,3.2vw,17px);
      border-radius: var(--r); border: 1.5px solid var(--border);
      background: var(--warm); font-size: var(--fs-base);
      color: var(--dp); outline: none; transition: border-color 0.2s;
      min-height: var(--touch);
    }
    .form-input:focus { border-color: var(--t); }
    .btn-primary {
      width: 100%; padding: clamp(13px,3.2vw,17px);
      border-radius: var(--r2); border: none;
      font-size: var(--fs-md); font-weight: 800;
      cursor: pointer; letter-spacing: 0.3px;
      transition: all 0.25s; min-height: var(--touch);
    }
    .btn-icon {
      width: var(--touch); height: var(--touch);
      border-radius: 50%; border: none;
      display: flex; align-items: center; justify-content: center;
      font-size: var(--fs-lg); cursor: pointer; flex-shrink: 0;
    }
    .app-header {
      padding: 24px var(--pad-x) 16px;
      background: var(--cream);
      border-bottom: 1px solid var(--border);
    }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--sp-3); }
    .header-greeting { font-size: var(--fs-2xl); font-weight: 600; line-height: 1.15; }
    .header-date { font-size: var(--fs-sm); color: var(--mt); font-weight: 500; margin-bottom: 3px; }
    .pill-strip {display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: var(--gap-md, 12px); margin-bottom: var(--sp-3);padding: 4px; /* Prevents shadow clipping */}
    .pill-strip::-webkit-scrollbar { display: none; }
    .status-pill { display: inline-flex; align-items: center; gap: clamp(4px,1vw,6px); padding: clamp(4px,1vw,6px) clamp(10px,2.5vw,14px); border-radius: 20px; font-size: var(--fs-xs); font-weight: 700; color: var(--dp); flex-shrink: 0; }
    .status-dot { width: clamp(5px,1.2vw,7px); height: clamp(5px,1.2vw,7px); border-radius: 50%; flex-shrink: 0; }
    .lang-switch { display: flex; gap: 2px; background: var(--warm); border-radius: 20px; padding: 3px; width: fit-content; }
    .lang-btn { padding: clamp(3px,0.8vw,5px) clamp(8px,2vw,11px); border-radius: 16px; font-size: var(--fs-2xs); font-weight: 800; border: none; cursor: pointer; transition: all 0.2s; letter-spacing: 0.3px; min-height: 26px; }
    .mood-row { display: flex; justify-content: space-between; }
    .mood-btn { display: flex; flex-direction: column; align-items: center; gap: clamp(4px,1vw,6px); background: none; border: 2px solid transparent; cursor: pointer; padding: clamp(7px,1.8vw,11px) clamp(5px,1.2vw,8px); border-radius: var(--r); transition: all 0.2s; }
    .mood-btn span { font-size: clamp(22px,5.5vw,30px); }
    .mood-btn small { font-size: var(--fs-2xs); color: var(--mt); font-weight: 700; }
    .ob-btn { position: relative; overflow: hidden; border-radius: 50px; border: none; cursor: pointer; height: clamp(60px,14vw,76px); width: 100%; display: flex; align-items: center; transition: transform 0.15s, box-shadow 0.15s; }
    .ob-btn:active { transform: scale(0.97); }
    .emrg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--gap-sm); margin-bottom: var(--sp-4); }
    .emrg-btn { padding: clamp(11px,2.8vw,16px) clamp(4px,1vw,8px); border-radius: var(--r); font-size: var(--fs-sm); font-weight: 700; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: clamp(4px,1vw,7px); transition: all 0.15s; min-height: var(--touch); }
    .emrg-btn span { font-size: clamp(18px,4.5vw,24px); }
    .chat-wrap { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
    .chat-messages { flex: 1; overflow-y: auto; padding: var(--sp-4) var(--pad-x); scrollbar-width: none; }
    .chat-messages::-webkit-scrollbar { display: none; }
    .chat-input-bar { padding: var(--sp-3) var(--pad-x) var(--sp-4); border-top: 1px solid var(--border); background: rgba(255,255,255,0.96); backdrop-filter: blur(12px); flex-shrink: 0; }
    .chart-wrap { display: flex; gap: var(--gap-sm); align-items: flex-end; height: clamp(70px,17vw,100px); margin-bottom: var(--gap-sm); }
    .chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: clamp(3px,0.8vw,5px); }
    .chart-val { font-size: var(--fs-2xs); color: var(--mt); font-weight: 700; }
    .chart-bar { width: 100%; border-radius: clamp(3px,0.8vw,6px) clamp(3px,0.8vw,6px) 0 0; min-height: 6px; }
    .chart-lbl { font-size: var(--fs-2xs); color: var(--mt); font-weight: 600; text-align: center; }
    @media (max-width: 360px) {
      :root { --pad-x: 12px; --pad-y: 14px; --card-p: 12px; --gap-sm: 5px; --gap-md: 7px; --gap-lg: 10px; }
      .quick-grid { gap: 6px; }
      .cal-day-name { display: none; }
    }
  `}</style>
);

// ============================================================
// DATA (unchanged)
// ============================================================
const FOODS = {
  morning: [
    { name: "Akamu (Pap) + Akara", e: "🫙", b: "High iron from fermented corn, protein from akara. Fights anaemia — Nigeria's #1 pregnancy risk.", tags: ["Iron", "Protein", "Energy"] },
    { name: "Ogi with Groundnut Soup", e: "🥜", b: "B-vitamins and folate from fermented sorghum. Groundnuts add DHA Omega-3 for baby brain.", tags: ["Folate", "Omega-3", "Brain"] },
    { name: "Boiled Yam + Egg Sauce", e: "🥚", b: "Choline from eggs supports neural tube formation. Complex carbs prevent blood sugar spikes.", tags: ["Choline", "Brain Dev", "Carbs"] },
    { name: "Moi Moi + Zobo Drink", e: "🍱", b: "Richest local folate source. Zobo adds iron when unsweetened.", tags: ["Folate", "Iron", "Protein"] },
  ],
  afternoon: [
    { name: "Egusi Soup + Eba", e: "🍲", b: "Egusi loaded with zinc and magnesium for baby bone mineralisation.", tags: ["Zinc", "Magnesium", "Bones"] },
    { name: "Efo Riro + Brown Rice", e: "🥬", b: "Efo (African spinach) has 3x more iron than regular spinach.", tags: ["Folate", "Iron", "Vitamin K"] },
    { name: "Banga Soup + Starch", e: "🌴", b: "Palm fruit rich in Vitamin A for baby eye and organ development.", tags: ["Vitamin A", "Antioxidants", "Eyes"] },
    { name: "Ofe Onugbu + Fufu", e: "🥗", b: "Bitter leaf soup adds calcium for bone mineralisation and natural cleansing.", tags: ["Calcium", "Minerals", "Detox"] },
  ],
  evening: [
    { name: "Ogbono Soup + Pounded Yam", e: "🍯", b: "Ogbono seeds contain linoleic acid essential for baby brain cell membranes.", tags: ["Omega-6", "Brain", "Healthy Fats"] },
    { name: "Pepper Soup (Catfish)", e: "🐟", b: "Local catfish richest Nigerian DHA source. Anti-inflammatory spices.", tags: ["DHA", "Brain Dev", "Anti-inflam"] },
    { name: "Okra Soup + Amala", e: "🌿", b: "High folate and Vitamin C which boosts iron absorption.", tags: ["Folate", "Vitamin C", "Potassium"] },
    { name: "Tiger Nuts (Aya) Milk", e: "🌰", b: "Nigerian superfood — calcium, iron, Vitamin E, prebiotics. ₦200–₦500.", tags: ["Calcium", "Iron", "Prebiotic"] },
  ],
};

const SUPPS = [
  { name: "Folic Acid", dose: "400–600 mcg", time: "With breakfast", col: ["#E3F5EA", "#5A9E6E"] },
  { name: "DHA / Omega-3", dose: "200–300 mg", time: "With largest meal", col: ["#E4EFF9", "#3A78C4"] },
  { name: "Iron (Ferrous Sulfate)", dose: "27 mg", time: "Morning + Vit C", col: ["#FDEEEC", "#D0524A"] },
  { name: "Vitamin D3", dose: "600–2000 IU", time: "With fatty meal", col: ["#FEF2E0", "#C87C30"] },
  { name: "Magnesium Glycinate", dose: "300–360 mg", time: "Bedtime", col: ["#EDE9F8", "#8B7EC8"] },
  { name: "Calcium", dose: "1000 mg", time: "Split AM/PM", col: ["#F5F0E8", "#8B5E3C"] },
];

const DRUGS = {
  paracetamol: { name: "Paracetamol 500mg", safety: "SAFE", cat: "Pain Relief", trim: "All trimesters", dose: "500mg–1g every 4–6 hrs. Max 4g/day.", warn: "Safe short-term. Do not exceed dose. Avoid alcohol.", alt: "Cold compress, rest", col: ["#E3F5EA", "#5A9E6E"], icon: "✅" },
  ibuprofen: { name: "Ibuprofen 400mg", safety: "AVOID", cat: "NSAID / Pain Relief", trim: "AVOID — especially after 20 weeks", dose: "NOT RECOMMENDED", warn: "Causes premature closure of ductus arteriosus. Risk of low amniotic fluid.", alt: "Paracetamol is safer", col: ["#FDEEEC", "#D0524A"], icon: "🚫" },
  amoxicillin: { name: "Amoxicillin 250mg", safety: "GENERALLY SAFE", cat: "Antibiotic", trim: "All trimesters with prescription", dose: "As prescribed only", warn: "Must be prescribed. Never self-medicate antibiotics during pregnancy.", alt: "Only on prescription", col: ["#E4EFF9", "#3A78C4"], icon: "ℹ️" },
  "folic acid": { name: "Folic Acid 5mg", safety: "RECOMMENDED", cat: "Vitamin B9", trim: "All trimesters — start before conception", dose: "400–600mcg daily", warn: "One of the most important supplements. Start before conception.", alt: "Foods: Efo, Moi Moi, Lentils", col: ["#E3F5EA", "#5A9E6E"], icon: "💚" },
  malaria: { name: "Antimalarial Drug", safety: "DEPENDS ON TYPE", cat: "Antimalarial", trim: "Check specific drug with doctor", dose: "CONSULT DOCTOR IMMEDIATELY", warn: "Malaria is extremely dangerous in pregnancy. Some safe (Artemether-Lumefantrine), others not.", alt: "Hospital treatment immediately", col: ["#FEF2E0", "#C87C30"], icon: "⚠️" },
  default: { name: "Unknown Medication", safety: "CONSULT DOCTOR", cat: "Unknown", trim: "Unknown", dose: "Cannot advise", warn: "Not in database. NEVER take any medication in pregnancy without consulting your doctor.", alt: "Consult healthcare provider", col: ["#FEF2E0", "#C87C30"], icon: "👩‍⚕️" },
};

const TRADITIONAL = [
  { practice: "Drinking Zobo (Hibiscus Tea)", status: "CAUTION", reason: "High amounts may stimulate uterine contractions. Small amounts likely safe.", safe: false },
  { practice: "Applying Shea Butter on Belly", status: "SAFE", reason: "Excellent for stretch mark prevention. Rich in Vitamin E and fatty acids.", safe: true },
  { practice: "Eating Tiger Nuts (Aya)", status: "SAFE", reason: "Nigerian superfood. High calcium, iron, Vitamin E. Highly recommended.", safe: true },
  { practice: "Using Dry Gin for Baby Bath", status: "DANGEROUS", reason: "Toxic to newborn skin and respiratory system. Never use on newborns.", safe: false },
  { practice: "Drinking Orishirishi (Mixed Herbs)", status: "AVOID", reason: "Unknown composition. Many contain plants with abortifacient properties.", safe: false },
  { practice: "Eating Unripe Pawpaw (Papaya)", status: "AVOID", reason: "Contains latex that can trigger uterine contractions.", safe: false },
  { practice: "Eating Plenty of Ugwu", status: "SAFE", reason: "Fluted pumpkin leaf is rich in iron, folate, and Vitamin C.", safe: true },
  { practice: "Tying Wrapper Tight on Belly", status: "CAUTION", reason: "Very tight wrapping can restrict fetal movement and reduce blood flow.", safe: false },
];

const SYMPTOMS_RISK = [
  { combo: ["Headache", "Swelling", "High BP"], risk: "EMERGENCY", condition: "Preeclampsia", action: "Go to hospital IMMEDIATELY. Do not drive yourself." },
  { combo: ["Fever", "Chills", "Headache"], risk: "HIGH", condition: "Malaria / Infection", action: "Go to hospital for blood test and treatment today." },
  { combo: ["Reduced kicks", "No movement 2hr"], risk: "EMERGENCY", condition: "Fetal Distress", action: "Go to hospital immediately. Time-critical emergency." },
  { combo: ["Vaginal bleeding", "Cramping"], risk: "EMERGENCY", condition: "Placental Abruption / Preterm Labour", action: "Call emergency services or go to hospital now." },
  { combo: ["Nausea", "Fatigue"], risk: "LOW", condition: "Normal Pregnancy Symptoms", action: "Rest, stay hydrated. Eat small frequent meals." },
  { combo: ["Back pain", "Leg swelling"], risk: "MEDIUM", condition: "Possible DVT / Fluid Retention", action: "Elevate legs, stay hydrated. See doctor this week." },
];

const BLOOM_KB = {
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

function bloomResp(msg) {
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

// ============================================================
// JOURNEY FEATURE CONFIG
// ============================================================
const JOURNEY_CONFIG = {
  pregnant:  {
    tabs: ["assistant","kicks","nutrition","vitals","health","baby","mental","partner","chat","safety"],
    pills: [
      { dot:"var(--t)",  label:"Week 24 · 2nd Trimester", bg:"var(--gdl)" },
      { dot:"var(--sg)", label:"3/6 supplements ✓",       bg:"var(--sgl)" },
      { dot:"var(--lv)", label:"Baby: 600g 🌽",           bg:"var(--lvl)" },
    ],
    greeting: "Mama",
    taskIds:  ["iron","water","vitals","kicks","meal","walk"],
    quickActions: [["📷","Scan Drug","health","var(--bll)","var(--bl)"],["🥗","Eat Today","nutrition","var(--sgl)","var(--sg)"],["👶","Kicks","kicks","var(--lvl)","var(--lv)"],["🚨","SOS",null,"var(--rdl)","var(--rd)"]],
    showAlert: true,
  },
  conceive:  {
    tabs: ["assistant","nutrition","vitals","health","mental","chat","safety"],
    pills: [
      { dot:"var(--lv)", label:"Cycle Day 14 · Ovulation", bg:"var(--lvl)" },
      { dot:"var(--sg)", label:"Folic acid ✓",             bg:"var(--sgl)" },
      { dot:"var(--t)",  label:"Fertile Window 🌸",        bg:"var(--gdl)" },
    ],
    greeting: "Mama",
    taskIds:  ["water","vitals","meal","walk"],
    quickActions: [["📷","Scan Drug","health","var(--bll)","var(--bl)"],["🥗","Nutrition","nutrition","var(--sgl)","var(--sg)"],["❤️","Vitals","vitals","var(--rdl)","var(--rd)"],["🚨","SOS",null,"var(--rdl)","var(--rd)"]],
    showAlert: false,
  },
  mom:       {
    tabs: ["assistant","nutrition","vitals","health","baby","mental","partner","chat","safety"],
    pills: [
      { dot:"var(--t)",  label:"Week 6 Postpartum",      bg:"var(--gdl)" },
      { dot:"var(--sg)", label:"Breastfeeding · Day 42", bg:"var(--sgl)" },
      { dot:"var(--lv)", label:"Recovery: On track 💪",  bg:"var(--lvl)" },
    ],
    greeting: "Mama",
    taskIds:  ["iron","water","vitals","meal","walk"],
    quickActions: [["📷","Scan Drug","health","var(--bll)","var(--bl)"],["🥗","Eat Today","nutrition","var(--sgl)","var(--sg)"],["💚","Mind","mental","var(--lvl)","var(--lv)"],["🚨","SOS",null,"var(--rdl)","var(--rd)"]],
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
    taskIds:  ["water","vitals","walk"],
    quickActions: [["❤️","Vitals","vitals","var(--rdl)","var(--rd)"],["💚","Mind","mental","var(--lvl)","var(--lv)"],["💬","Chat","chat","var(--bll)","var(--bl)"],["🚨","SOS",null,"var(--rdl)","var(--rd)"]],
    showAlert: false,
  },
};

// ============================================================
// PRIMITIVES
// ============================================================
const Tag = ({ label, bg = "var(--sgl)", tc = "var(--sg)" }) => (
  <span className="tag" style={{ background: bg, color: tc }}>{label}</span>
);

const IconBox = ({ emoji, bg, size = "var(--icon-sm)" }) => (
  <div style={{ width: size, height: size, flexShrink: 0, borderRadius: "28%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: `calc(${size} * 0.46)` }}>{emoji}</div>
);

const WCard = ({ children, style = {}, onClick, className = "" }) => (
  <div onClick={onClick} className={`wcard ${className}`} style={{ cursor: onClick ? "pointer" : "default", ...style }}>{children}</div>
);

const SectionTitle = ({ title, action, onAction }) => (
  <div className="sec-title">
    <h2>{title}</h2>
    {action && <button onClick={onAction} style={{ background: "none", border: "none", color: "var(--t)", fontSize: "var(--fs-sm)", fontWeight: 700, cursor: "pointer" }}>{action}</button>}
  </div>
);

const ProgBar = ({ val, max, col = "var(--t)" }) => (
  <div className="prog-track"><div className="prog-fill" style={{ width: `${Math.min((val / max) * 100, 100)}%`, background: col }} /></div>
);

const Pill = ({ label, active, onClick, color = "var(--t)" }) => (
  <button onClick={onClick} style={{ padding: "clamp(6px,1.5vw,8px) clamp(13px,3.2vw,18px)", borderRadius: 30, fontSize: "var(--fs-sm)", fontWeight: 700, background: active ? color : "var(--card)", color: active ? "#fff" : "var(--mt)", border: `1.5px solid ${active ? color : "var(--border)"}`, cursor: "pointer", transition: "all 0.2s", flexShrink: 0, boxShadow: active ? `0 4px 14px ${color}44` : "none", minHeight: "var(--touch)" }}>{label}</button>
);

// ============================================================
// CALENDAR STRIP
// ============================================================
const CalendarStrip = () => {
  const today = new Date();
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayIdx = (today.getDay() + 6) % 7;
  const nums = Array.from({ length: 7 }, (_, i) => { const d = new Date(today); d.setDate(today.getDate() - todayIdx + i); return d.getDate(); });
  const [active, setActive] = useState(todayIdx);
  return (
    <div className="cal-strip">
      {days.map((day, i) => (
        <button key={i} onClick={() => setActive(i)} className={`cal-day${active === i ? " active" : ""}`}>
          <span className="cal-day-name">{day}</span>
          <span className="cal-day-num">{nums[i]}</span>
          {i === todayIdx && active !== i && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--t)" }} />}
        </button>
      ))}
    </div>
  );
};

// ============================================================
// SPLASH
// ============================================================
const Splash = () => (
  <div className="fi" style={{ position: "fixed", inset: 0, background: "linear-gradient(160deg,#2A1200 0%,#6B3018 50%,#E07840 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "var(--pad-x)" }}>
    <div style={{ width: "clamp(72px,18vw,96px)", height: "clamp(72px,18vw,96px)", borderRadius: "clamp(20px,5vw,28px)", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--sp-5)", border: "1px solid rgba(255,255,255,0.2)", fontSize: "clamp(34px,9vw,48px)" }}>🌸</div>
    <div className="serif" style={{ fontSize: "var(--fs-3xl)", color: "#fff", fontStyle: "italic", marginBottom: "var(--sp-1)", letterSpacing: -0.5 }}>Mama<b style={{ fontStyle: "normal", color: "#F2A07A" }}>Bloom</b></div>
    <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "var(--fs-xs)", letterSpacing: 3, textTransform: "uppercase", marginBottom: "var(--sp-6)" }}>Maternal AI · UK & Nigeria-First</p>
    <div style={{ width: "clamp(30px,7vw,40px)", height: "clamp(30px,7vw,40px)", border: "2.5px solid rgba(255,255,255,0.15)", borderTopColor: "#F2A07A", borderRadius: "50%", animation: "sp 0.8s linear infinite" }} />
    <div style={{ position: "absolute", bottom: "clamp(32px,8vw,52px)", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "var(--gap-sm)", maxWidth: "clamp(260px,65vw,340px)", padding: "0 var(--pad-x)" }}>
      {["20 Features", "AI-Powered", "QR Scanner", "Offline-First", "Nigeria DB"].map(t => (
        <span key={t} style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)", padding: "clamp(4px,1vw,6px) clamp(10px,2.5vw,14px)", borderRadius: 20, fontSize: "var(--fs-xs)", fontWeight: 700, border: "1px solid rgba(255,255,255,0.1)" }}>{t}</span>
      ))}
    </div>
  </div>
);

// ============================================================
// HEADER
// ============================================================
const Header = ({ onSOS, journeyType }) => {
  const [lang, setLang] = useState("EN");
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const cfg = JOURNEY_CONFIG[journeyType] || JOURNEY_CONFIG.pregnant;
  const greetingName = journeyType === "menopause" ? "Amara" : "Adaeze";
  return (
    <div className="app-header">
      <div className="header-top">
        <div style={{ flex: 1, minWidth: 0, paddingRight: "var(--sp-3)" }}>
          <p className="header-date">{dateStr}</p>
          <div className="serif header-greeting" style={{ color: "var(--dp)" }}>Good morning, <span style={{ color: "var(--t)" }}>{greetingName}</span></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-sm)", flexShrink: 0 }}>
          <button onClick={onSOS} style={{ background: "var(--rdl)", border: "1.5px solid var(--rdm)", borderRadius: 20, padding: "clamp(5px,1.2vw,7px) clamp(10px,2.5vw,14px)", color: "var(--rd)", fontSize: "var(--fs-xs)", fontWeight: 800, cursor: "pointer", animation: "pu 2.5s infinite", letterSpacing: 0.3, minHeight: "var(--touch)" }}>🚨 SOS</button>
          <div style={{ width: "var(--avatar)", height: "var(--avatar)", borderRadius: "50%", background: "linear-gradient(145deg,#FDE8DB,#E8F5EC)", border: "2.5px solid var(--t)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(18px,4.5vw,24px)", flexShrink: 0 }}>👩🏾</div>
        </div>
      </div>
      <div className="pill-strip">
        {cfg.pills.map((p, i) => (
          <div key={i} className="status-pill" style={{ background: p.bg }}><div className="status-dot" style={{ background: p.dot }} />{p.label}</div>
        ))}
      </div>
      <div className="lang-switch">
        {["EN", "YO", "IG", "HA", "PID"].map(l => (
          <button key={l} onClick={() => setLang(l)} className="lang-btn" style={{ background: lang === l ? "var(--t)" : "transparent", color: lang === l ? "#fff" : "var(--mt)" }}>{l}</button>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// BOTTOM NAV — 3 tabs only
// ============================================================
const Nav = ({ active, setActive }) => {
  const tabs = [
    { id: "home",     icon: "🏠", label: "Home"     },
    { id: "menu",     icon: "☰",  label: "Menu"     },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];
  return (
    <nav className="bottom-nav" style={{ justifyContent: "space-around" }}>
      {tabs.map(t => (
        <button key={t.id} className="nav-btn" onClick={() => setActive(t.id)}>
          <div className={`nav-icon${active === t.id ? " active" : ""}`}>{t.icon}</div>
          <span className={`nav-label${active === t.id ? " active" : ""}`}>{t.label}</span>
        </button>
      ))}
    </nav>
  );
};

// ============================================================
// MENU SCREEN — grid of all feature tabs
// ============================================================
const MenuScreen = ({ setActive, journeyType }) => {
  const ALL_ITEMS = [
    { id: "assistant", icon: "🌸", label: "Bloom AI",   bg: "var(--gdl)", tc: "var(--gd)"  },
    { id: "kicks",     icon: "👶", label: "Kicks",      bg: "var(--lvl)", tc: "var(--lv)"  },
    { id: "nutrition", icon: "🥗", label: "Nutrition",  bg: "var(--sgl)", tc: "var(--sg)"  },
    { id: "vitals",    icon: "❤️", label: "Vitals",     bg: "var(--rdl)", tc: "var(--rd)"  },
    { id: "health",    icon: "🩺", label: "Health",     bg: "var(--bll)", tc: "var(--bl)"  },
    { id: "baby",      icon: "🍼", label: "Baby",       bg: "var(--gdl)", tc: "var(--gd)"  },
    { id: "mental",    icon: "💚", label: "Mind",       bg: "var(--sgl)", tc: "var(--sg)"  },
    { id: "partner",   icon: "🤝", label: "Partner",    bg: "var(--lvl)", tc: "var(--lv)"  },
    { id: "chat",      icon: "💬", label: "Chat",       bg: "var(--bll)", tc: "var(--bl)"  },
    { id: "safety",    icon: "🛡️", label: "Safety",     bg: "var(--rdl)", tc: "var(--rd)"  },
  ];
  const allowed = JOURNEY_CONFIG[journeyType]?.tabs || JOURNEY_CONFIG.pregnant.tabs;
  const items = ALL_ITEMS.filter(i => allowed.includes(i.id));
  return (
    <div className="page-pad">
      <div style={{ marginBottom: "var(--sp-5)" }}>
        <h2 className="serif" style={{ fontSize: "var(--fs-2xl)", fontWeight: 600, color: "var(--dp)", fontStyle: "italic", marginBottom: 4 }}>All Features</h2>
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)" }}>Tap any feature to open it</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--gap-md)" }}>
        {items.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-2)", padding: "var(--sp-4) var(--sp-2)", background: item.bg, border: `1.5px solid ${item.tc}33`, borderRadius: "var(--r2)", cursor: "pointer", transition: "transform 0.15s", boxShadow: "var(--sh)" }}
            onTouchStart={e => e.currentTarget.style.transform = "scale(0.95)"}
            onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}>
            <span style={{ fontSize: "clamp(26px,7vw,34px)" }}>{item.icon}</span>
            <span style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: item.tc, textAlign: "center", lineHeight: 1.3 }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// SETTINGS SCREEN
// ============================================================
const SettingsScreen = () => {
  const [lang, setLang] = useState("EN");
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [kickAlerts, setKickAlerts] = useState(true);
  const [bpReminders, setBpReminders] = useState(true);

  const Toggle = ({ value, onChange, label, desc, color = "var(--sg)" }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "var(--sp-4) 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "var(--fs-base)", fontWeight: 700, color: "var(--dp)", marginBottom: 2 }}>{label}</p>
        {desc && <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>{desc}</p>}
      </div>
      <button onClick={() => onChange(!value)} style={{ width: "clamp(44px,11vw,54px)", height: "clamp(24px,6vw,30px)", borderRadius: 30, border: "none", cursor: "pointer", background: value ? color : "var(--border2)", position: "relative", flexShrink: 0, transition: "background 0.25s" }}>
        <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", left: value ? "calc(100% - clamp(22px,5.5vw,27px))" : "3px", width: "clamp(18px,4.5vw,24px)", height: "clamp(18px,4.5vw,24px)", borderRadius: "50%", background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.18)", transition: "left 0.25s" }} />
      </button>
    </div>
  );

  return (
    <div className="page-pad">
      <div style={{ marginBottom: "var(--sp-5)" }}>
        <h2 className="serif" style={{ fontSize: "var(--fs-2xl)", fontWeight: 600, color: "var(--dp)", fontStyle: "italic", marginBottom: 4 }}>Settings</h2>
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)" }}>Manage your preferences</p>
      </div>

      {/* Profile */}
      <div className="wcard" style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-3)" }}>Profile</p>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-lg)" }}>
          <div style={{ width: "var(--icon-lg)", height: "var(--icon-lg)", borderRadius: "50%", background: "linear-gradient(145deg,#FDE8DB,#E8F5EC)", border: "2.5px solid var(--t)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(24px,6vw,32px)", flexShrink: 0 }}>👩🏾</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)", marginBottom: 2 }}>Adaeze Okafor</p>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)" }}>Week 24 · 2nd Trimester</p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--t)", fontWeight: 700, marginTop: 4 }}>adaeze@example.com</p>
          </div>
          <button style={{ background: "var(--warm)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "var(--sp-2) var(--sp-3)", fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--md)", cursor: "pointer" }}>Edit</button>
        </div>
      </div>

      {/* Language */}
      <div className="wcard" style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-3)" }}>Language</p>
        <div className="lang-switch" style={{ width: "100%", justifyContent: "space-between" }}>
          {["EN", "YO", "IG", "HA", "PID"].map(l => (
            <button key={l} onClick={() => setLang(l)} className="lang-btn" style={{ flex: 1, textAlign: "center", background: lang === l ? "var(--t)" : "transparent", color: lang === l ? "#fff" : "var(--mt)" }}>{l}</button>
          ))}
        </div>
        <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginTop: "var(--sp-2)" }}>{lang === "EN" ? "English" : lang === "YO" ? "Yorùbá" : lang === "IG" ? "Igbo" : lang === "HA" ? "Hausa" : "Nigerian Pidgin"}</p>
      </div>

      {/* Notifications */}
      <div className="wcard" style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-1)" }}>Notifications</p>
        <Toggle value={notifications} onChange={setNotifications} label="Push Notifications" desc="Daily wellness reminders and alerts" color="var(--sg)" />
        <Toggle value={kickAlerts} onChange={setKickAlerts} label="Kick Count Reminders" desc="Alert when kick session is due" color="var(--lv)" />
        <Toggle value={bpReminders} onChange={setBpReminders} label="BP Log Reminders" desc="Evening reminder to log blood pressure" color="var(--rd)" />
      </div>

      {/* Appearance */}
      <div className="wcard" style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-1)" }}>Appearance</p>
        <Toggle value={darkMode} onChange={setDarkMode} label="Dark Mode" desc="Coming soon — save your eyes at night" color="var(--dp)" />
      </div>

      {/* About */}
      <div className="wcard" style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-3)" }}>About</p>
        {[["Version","1.0.0 (Beta)"],["Region","Nigeria + UK"],["Data","Stored securely on-device"],["Support","support@mamabloom.app"]].map(([l,v]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "var(--sp-2) 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", fontWeight: 600 }}>{l}</span>
            <span style={{ fontSize: "var(--fs-sm)", color: "var(--dp)", fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </div>

      <button style={{ width: "100%", padding: "var(--sp-4)", background: "var(--rdl)", border: "1.5px solid var(--rdm)44", borderRadius: "var(--r2)", color: "var(--rd)", fontSize: "var(--fs-md)", fontWeight: 800, cursor: "pointer", minHeight: "var(--touch)" }}>Sign Out</button>
    </div>
  );
};

// ============================================================
// EMERGENCY MODAL
// ============================================================
const Emergency = ({ onClose }) => {
  const [sent, setSent] = useState(false);
  return (
    <div className="fi" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div className="slideUp" style={{ background: "var(--card)", borderRadius: "var(--r3) var(--r3) 0 0", padding: "var(--sp-5) var(--pad-x) var(--sp-6)", width: "100%", maxWidth: 480 }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--border)", margin: "0 auto var(--sp-5)" }} />
        <div style={{ textAlign: "center", marginBottom: "var(--sp-4)" }}>
          <div style={{ width: "clamp(56px,14vw,72px)", height: "clamp(56px,14vw,72px)", borderRadius: "50%", background: "var(--rdl)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(24px,6vw,32px)", margin: "0 auto var(--sp-3)", border: "2.5px solid var(--rdm)", animation: "hb 1.2s infinite" }}>🚨</div>
          <h2 className="serif" style={{ fontSize: "var(--fs-xl)", color: "var(--rd)", marginBottom: "var(--sp-2)", fontStyle: "italic" }}>Emergency Help</h2>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", lineHeight: 1.6 }}>Select your emergency. We will alert your contacts and nearest hospital.</p>
        </div>
        <div className="emrg-grid">
          {[["🩸","Heavy Bleeding","var(--rdl)","var(--rd)"],["💔","Chest Pain/BP","var(--rdl)","var(--rd)"],["🤰","Labour Signs","var(--gdl)","var(--gd)"],["🧠","Severe Headache","var(--gdl)","var(--gd)"],["👶","Baby Not Moving","var(--rdl)","var(--rd)"],["🌡️","High Fever","var(--gdl)","var(--gd)"]].map(([ic,lb,bg,tc],i) => (
            <button key={i} className="emrg-btn" onClick={() => setSent(true)} style={{ background: bg, border: `1.5px solid ${tc}44`, color: tc }}>
              <span>{ic}</span>{lb}
            </button>
          ))}
        </div>
        {sent && (
          <div className="fu" style={{ background: "var(--rdl)", border: "1px solid var(--rd)", borderRadius: "var(--r)", padding: "var(--card-p)", marginBottom: "var(--sp-4)" }}>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--rd)", fontWeight: 800 }}>✅ Alert sent to Dr. Okonkwo & LUTH</p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)", marginTop: "var(--sp-1)" }}>📍 GPS location shared with Emeka (partner)</p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)", marginTop: "var(--sp-1)" }}>📞 Calling Lagos University Teaching Hospital...</p>
          </div>
        )}
        <div style={{ display: "flex", gap: "var(--gap-md)" }}>
          <button onClick={() => window.open("tel:199")} className="btn-primary" style={{ background: "var(--rd)", color: "#fff" }}>📞 Call 199 (NEMA)</button>
          <button onClick={onClose} className="btn-primary" style={{ background: "var(--warm)", color: "var(--md)", border: "1px solid var(--border)" }}>Close</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// HOME
// ============================================================
const Home = ({ setTab, onSOS, journeyType }) => {
  const [mood, setMood] = useState(null);
  const [briefingOpen, setBriefingOpen] = useState(false);
  const cfg = JOURNEY_CONFIG[journeyType] || JOURNEY_CONFIG.pregnant;
  const [tasks, setTasks] = useState({ iron: false, water: false, vitals: false, kicks: false, meal: false, walk: false });
  const moods = [{ e: "😊", l: "Happy", v: 5 }, { e: "😌", l: "Calm", v: 4 }, { e: "😔", l: "Low", v: 2 }, { e: "😰", l: "Anxious", v: 1 }, { e: "😭", l: "Overwhelm", v: 0 }];
  const ALL_TASKS = [
    { id: "iron",   icon: "💊", bg: "var(--gdl)", title: "Take Iron Supplement",  streak: 4,  time: "With OJ"     },
    { id: "water",  icon: "💧", bg: "var(--bll)", title: "Drink 3L of water",     streak: 7,  time: "All day"     },
    { id: "vitals", icon: "❤️", bg: "var(--rdl)", title: "Log blood pressure",    streak: 5,  time: "Evening"     },
    { id: "kicks",  icon: "👶", bg: "var(--sgl)", title: "Count baby kicks",      streak: 12, time: "10–12 AM"   },
    { id: "meal",   icon: "🥗", bg: "var(--lvl)", title: "Log today's meals",     streak: 6,  time: "After meals" },
    { id: "walk",   icon: "🚶‍♀️", bg: "var(--warm)", title: "10 min gentle walk", streak: 3,  time: "15 min"     },
  ];
  const todayTasks = ALL_TASKS.filter(t => cfg.taskIds.includes(t.id));
  const done = todayTasks.filter(t => tasks[t.id]).length;

  return (
    <div className="page-pad">
      <CalendarStrip />
      <div style={{ background: "linear-gradient(135deg,#FEF0DA,#FDE8D0)", borderRadius: "var(--r2)", padding: "var(--card-p)", marginBottom: "var(--gap-md)", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #F2D4A8", gap: "var(--gap-md)" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--gd)", marginBottom: "var(--sp-1)" }}>🔔 AI Morning Briefing</p>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.5, marginBottom: "var(--sp-3)" }}>Your personalised Week 24 summary is ready — baby updates, nutrition flags, mood insights.</p>
          <button onClick={() => setBriefingOpen(!briefingOpen)} style={{ background: "var(--dp)", color: "#fff", border: "none", borderRadius: 20, padding: "clamp(6px,1.5vw,9px) clamp(14px,3.5vw,20px)", fontSize: "var(--fs-sm)", fontWeight: 800, cursor: "pointer", minHeight: "var(--touch)" }}>{briefingOpen ? "Close ↑" : "Read Now"}</button>
        </div>
        <div style={{ fontSize: "clamp(38px,9.5vw,52px)", animation: "pu 2.5s ease infinite", flexShrink: 0 }}>🔔</div>
      </div>
      {briefingOpen && (
        <WCard className="fu" style={{ marginBottom: "var(--gap-md)" }}>
          {["🌅 Your baby is 600g and growing well. Baby's hearing is developing rapidly — talk and sing today.", "💊 You missed iron yesterday. Take it this morning with orange juice for maximum absorption.", "👶 Baby's predicted active window: 10 AM–12 PM. Perfect time for kick counting.", "🍽️ Today's focus nutrient: Calcium. Eat Moi Moi + tiger nuts. Intake is 40% below target.", "⚠️ Mild risk flag: BP trend slightly elevated over 3 days. Monitor and log tonight.", "💚 Mood tip: You logged 'anxious' twice this week. Gentle breathing exercise recommended."].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: "var(--gap-sm)", marginBottom: "var(--sp-3)", paddingBottom: "var(--sp-3)", borderBottom: i < 5 ? "1px solid var(--border)" : "none" }}>
              <div style={{ width: 5, borderRadius: 3, background: ["var(--gd)","var(--rd)","var(--lv)","var(--bl)","var(--rd)","var(--sg)"][i], flexShrink: 0 }} />
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.65 }}>{t}</p>
            </div>
          ))}
        </WCard>
      )}
      {!mood ? (
        <WCard style={{ background: "linear-gradient(135deg,var(--cream),var(--warm))", border: "1px solid var(--border2)" }}>
          <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-3)" }}>🌤 How are you feeling today?</p>
          <div className="mood-row">{moods.map(m => (<button key={m.v} className="mood-btn" onClick={() => setMood(m)}><span>{m.e}</span><small>{m.l}</small></button>))}</div>
        </WCard>
      ) : (
        <WCard style={{ background: "var(--sgl)", border: "1px solid var(--sgm)" }}>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--sg)", fontWeight: 800 }}>✓ Mood logged: {mood.e} {mood.l}</p>
          {mood.v <= 1 && <p style={{ fontSize: "var(--fs-xs)", color: "var(--sg)", marginTop: "var(--sp-2)", lineHeight: 1.5 }}>💙 Tap <b>Mind</b> in Menu for emotional support or talk to Bloom AI.</p>}
        </WCard>
      )}
      <WCard style={{ marginBottom: "var(--sp-2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-3)" }}>
          <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)" }}>Daily Progress</p>
          <span style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--t)" }}>{done}/{todayTasks.length}</span>
        </div>
        <ProgBar val={done} max={todayTasks.length} />
        <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginTop: "var(--sp-2)" }}>{done === 0 ? "Start your wellness journey for today!" : done === todayTasks.length ? "🎉 All done! Amazing mama!" : `${todayTasks.length - done} tasks left — you're doing great!`}</p>
      </WCard>
      <SectionTitle title="Daily Routine" action="See all" />
      <WCard style={{ padding: `var(--sp-2) var(--card-p)` }}>
        {todayTasks.map(task => (
          <div key={task.id} className="habit-row fu">
            <button onClick={() => setTasks(t => ({ ...t, [task.id]: !t[task.id] }))} style={{ width: "clamp(22px,5.5vw,28px)", height: "clamp(22px,5.5vw,28px)", borderRadius: "50%", flexShrink: 0, border: `2px solid ${tasks[task.id] ? "var(--sg)" : "var(--border2)"}`, background: tasks[task.id] ? "var(--sg)" : "transparent", color: "#fff", fontSize: "var(--fs-xs)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}>{tasks[task.id] ? "✓" : ""}</button>
            <IconBox emoji={task.icon} bg={task.bg} size="var(--icon-sm)" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "var(--fs-base)", fontWeight: 700, color: "var(--dp)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{task.title}</p>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>Streak {task.streak} days</p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}><p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", fontWeight: 600 }}>{task.time}</p></div>
          </div>
        ))}
      </WCard>
      <SectionTitle title="Quick Actions" />
      <div className="quick-grid">
        {cfg.quickActions.map(([ic,lb,tb,bg,tc],i) => (
          <button key={i} className="quick-btn" onClick={tb ? () => setTab(tb) : onSOS} style={{ background: bg, border: `1.5px solid ${tc}33` }}>
            <span>{ic}</span><small style={{ color: tc }}>{lb}</small>
          </button>
        ))}
      </div>
      {cfg.showAlert && (
      <WCard style={{ background: "var(--rdl)", border: "1.5px solid var(--rdm)44" }}>
        <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "flex-start" }}>
          <div style={{ width: "var(--icon-sm)", height: "var(--icon-sm)", flexShrink: 0, borderRadius: "var(--r)", background: "var(--rd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-xl)" }}>⚠️</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--rd)", marginBottom: "var(--sp-1)" }}>Anaemia Risk Detected</p>
            <p style={{ fontSize: "var(--fs-sm)", color: "#8B3030", lineHeight: 1.55 }}>Iron supplement missed 2 days. 68% of Nigerian pregnant women have iron deficiency. Take iron with orange juice today.</p>
            <button style={{ marginTop: "var(--sp-2)", background: "var(--rd)", color: "#fff", border: "none", borderRadius: 20, padding: "clamp(5px,1.2vw,8px) clamp(12px,3vw,18px)", fontSize: "var(--fs-xs)", fontWeight: 800, cursor: "pointer", minHeight: "var(--touch)" }}>Mark Iron Taken ✓</button>
          </div>
        </div>
      </WCard>
      )}
      <SectionTitle title="Nearby Hospitals" />
      {[{ n: "Lagos University Teaching Hospital", a: "Idi-Araba, Lagos", p: "+234-1-774-3747", d: "2.3km", r: 4.5, s: "Full obstetrics & NICU" }, { n: "National Hospital Abuja", a: "CBD, Abuja", p: "+234-9-523-5050", d: "5.1km", r: 4.7, s: "High-risk pregnancy" }].map((h, i) => (
        <WCard key={i} style={{ padding: "var(--card-p)" }}>
          <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "center" }}>
            <div style={{ width: "var(--icon-md)", height: "var(--icon-md)", flexShrink: 0, borderRadius: "var(--r)", background: "var(--bll)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-xl)" }}>🏥</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "var(--fs-base)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.n}</p>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginBottom: "var(--sp-2)" }}>{h.a}</p>
              <div style={{ display: "flex", gap: "var(--gap-sm)", flexWrap: "wrap" }}><Tag label={h.s} bg="var(--sgl)" tc="var(--sg)" /><Tag label={`⭐ ${h.r}`} bg="var(--gdl)" tc="var(--gd)" /></div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--t)", marginBottom: "var(--sp-2)" }}>{h.d}</p>
              <button onClick={() => window.open(`tel:${h.p}`)} style={{ background: "var(--dp)", color: "#fff", border: "none", borderRadius: 20, padding: "clamp(5px,1.2vw,7px) clamp(11px,2.8vw,15px)", fontSize: "var(--fs-xs)", fontWeight: 800, cursor: "pointer", minHeight: "var(--touch)" }}>📞 Call</button>
            </div>
          </div>
        </WCard>
      ))}
    </div>
  );
};

// ============================================================
// KICKS INTELLIGENCE
// ============================================================
const KicksIntelligence = () => {
  const [kicks, setKicks] = useState(7);
  const [session, setSession] = useState(false);
  const [sessionKicks, setSessionKicks] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const history = [
    { date: "Today", kicks: 7, status: "normal" }, { date: "Yesterday", kicks: 10, status: "normal" },
    { date: "2d ago", kicks: 4, status: "low" }, { date: "3d ago", kicks: 11, status: "normal" },
    { date: "4d ago", kicks: 9, status: "normal" }, { date: "5d ago", kicks: 12, status: "high" },
    { date: "6d ago", kicks: 8, status: "normal" },
  ];
  const maxKick = Math.max(...history.map(h => h.kicks));
  useEffect(() => {
    let t;
    if (session) t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [session, startTime]);
  const startSession = () => { setSession(true); setSessionKicks(0); setStartTime(Date.now()); setElapsed(0); };
  const logKick = () => { setSessionKicks(k => k + 1); setKicks(k => k + 1); };
  const stopSession = () => setSession(false);
  const fmt = s => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const status = kicks >= 10 ? "GOOD" : kicks >= 6 ? "MONITOR" : "LOW";
  const [bg, border] = kicks >= 10 ? ["linear-gradient(135deg,var(--sgl),#D4F0DD)", "var(--sgm)"] : kicks >= 6 ? ["linear-gradient(135deg,var(--gdl),#FEE8C8)", "var(--gdm)"] : ["linear-gradient(135deg,var(--rdl),#FCE0DE)", "var(--rdm)"];
  return (
    <div className="page-pad">
      <SectionTitle title="👶 Kick Counter" />
      <WCard style={{ background: bg, border: `1.5px solid ${border}44` }}>
        <div style={{ textAlign: "center", padding: "var(--sp-3) 0 var(--sp-4)" }}>
          <div style={{ fontSize: "var(--fs-hero)", fontWeight: 900, color: kicks >= 10 ? "var(--sg)" : kicks >= 6 ? "var(--gd)" : "var(--rd)", lineHeight: 1, marginBottom: "var(--sp-2)" }}>{sessionKicks || kicks}</div>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", fontWeight: 600, marginBottom: "var(--sp-2)" }}>kicks logged today</p>
          <Tag label={status === "GOOD" ? "✅ Normal" : status === "MONITOR" ? "⚠️ Keep watching" : "🚨 Seek help"} bg={kicks >= 10 ? "var(--sgl)" : kicks >= 6 ? "var(--gdl)" : "var(--rdl)"} tc={kicks >= 10 ? "var(--sg)" : kicks >= 6 ? "var(--gd)" : "var(--rd)"} />
          {session && <p style={{ fontSize: "var(--fs-2xl)", fontWeight: 800, color: "var(--dp)", marginTop: "var(--sp-3)" }}>{fmt(elapsed)}</p>}
        </div>
        {!session ? (
          <button onClick={startSession} className="btn-primary" style={{ background: "var(--dp)", color: "#fff" }}>▶ Start Session</button>
        ) : (
          <div style={{ display: "flex", gap: "var(--gap-md)" }}>
            <button onClick={logKick} style={{ flex: 2, padding: "var(--sp-4)", background: "var(--sg)", color: "#fff", border: "none", borderRadius: "var(--r)", fontSize: "var(--fs-md)", fontWeight: 800, cursor: "pointer", minHeight: "var(--touch)" }}>👶 Kick! ({sessionKicks})</button>
            <button onClick={stopSession} style={{ flex: 1, padding: "var(--sp-4)", background: "var(--warm)", color: "var(--md)", border: "1px solid var(--border)", borderRadius: "var(--r)", fontSize: "var(--fs-sm)", fontWeight: 700, cursor: "pointer", minHeight: "var(--touch)" }}>⏹ Stop</button>
          </div>
        )}
      </WCard>
      <WCard style={{ background: "var(--lvl)", border: "1px solid var(--lvm)44" }}>
        <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--lv)", marginBottom: "var(--sp-3)" }}>🤖 AI Movement Intelligence</p>
        {[{ l: "Today's pattern", v: "Normal — moderate activity", dot: "var(--sg)" }, { l: "Best movement time", v: "10 AM–12 PM (predicted)", dot: "var(--lv)" }, { l: "Your baseline", v: "9.7 kicks/2hr", dot: "var(--bl)" }, { l: "Alert threshold", v: "Below 7 → investigate", dot: "var(--rd)" }].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "clamp(6px,1.5vw,9px) 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
            <span style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", flex: 1 }}>{s.l}</span>
            <span style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: "var(--dp)" }}>{s.v}</span>
          </div>
        ))}
      </WCard>
      <SectionTitle title="7-Day History" />
      <WCard>
        <div className="chart-wrap">
          {history.map((h, i) => (
            <div key={i} className="chart-col">
              <span className="chart-val">{h.kicks}</span>
              <div className="chart-bar" style={{ height: `${(h.kicks / (maxKick + 2)) * 100}%`, background: h.status === "normal" ? "var(--sg)" : h.status === "low" ? "var(--rd)" : "var(--t)" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "var(--gap-sm)" }}>
          {history.map((h, i) => <div key={i} className="chart-lbl" style={{ flex: 1 }}>{h.date.replace("days ago", "d").replace("Yesterday", "Yst").replace("Today", "Now")}</div>)}
        </div>
        <div style={{ marginTop: "var(--sp-3)", padding: "var(--sp-3)", background: "var(--rdl)", borderRadius: "var(--r)", display: "flex", gap: "var(--gap-sm)", alignItems: "center" }}>
          <span style={{ fontSize: "var(--fs-md)" }}>⚠️</span>
          <p style={{ fontSize: "var(--fs-xs)", color: "var(--rd)", fontWeight: 600 }}>2 days ago: Only 4 kicks. AI flagged as reduced movement.</p>
        </div>
      </WCard>
    </div>
  );
};

// ============================================================
// SYMPTOM RISK
// ============================================================
const SymptomRisk = () => {
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const symptoms = ["Headache", "Swelling", "High BP", "Fever", "Chills", "Reduced kicks", "No movement 2hr", "Vaginal bleeding", "Cramping", "Nausea", "Fatigue", "Back pain", "Leg swelling", "Blurry vision", "Upper abdominal pain"];
  const analyse = () => {
    for (const rule of SYMPTOMS_RISK) {
      if (rule.combo.filter(s => selected.includes(s)).length >= Math.min(2, rule.combo.length)) { setResult(rule); return; }
    }
    setResult({ risk: "LOW", condition: "No high-risk pattern detected", action: "Monitor symptoms. If they worsen, contact your healthcare provider." });
  };
  const riskCol = { "EMERGENCY": ["var(--rdl)","var(--rd)"], "HIGH": ["var(--rdl)","var(--rd)"], "MEDIUM": ["var(--gdl)","var(--gd)"], "LOW": ["var(--sgl)","var(--sg)"] };
  return (
    <WCard>
      <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-1)" }}>🧠 Symptom Analyser</p>
      <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginBottom: "var(--sp-3)" }}>Tap all symptoms. AI will assess combined risk.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-sm)", marginBottom: "var(--sp-4)" }}>
        {symptoms.map(s => (
          <button key={s} onClick={() => setSelected(sl => sl.includes(s) ? sl.filter(x => x !== s) : [...sl, s])} style={{ padding: "clamp(5px,1.2vw,7px) clamp(9px,2.2vw,13px)", borderRadius: 20, fontSize: "var(--fs-xs)", fontWeight: 700, background: selected.includes(s) ? "var(--dp)" : "var(--warm)", color: selected.includes(s) ? "#fff" : "var(--md)", border: `1.5px solid ${selected.includes(s) ? "var(--dp)" : "var(--border)"}`, cursor: "pointer", transition: "all 0.15s", minHeight: "var(--touch)" }}>{s}</button>
        ))}
      </div>
      <button onClick={analyse} disabled={!selected.length} className="btn-primary" style={{ background: selected.length ? "var(--dp)" : "var(--border)", color: selected.length ? "#fff" : "var(--mt)", cursor: selected.length ? "pointer" : "default", marginBottom: "var(--sp-3)" }}>Analyse {selected.length > 0 ? `(${selected.length})` : ""}</button>
      {result && (
        <div className="fu" style={{ background: (riskCol[result.risk] || ["var(--sgl)","var(--sg)"])[0], borderRadius: "var(--r)", padding: "var(--card-p)", border: `1.5px solid ${(riskCol[result.risk] || ["","var(--sg)"])[1]}44` }}>
          <div style={{ display: "flex", gap: "var(--gap-sm)", alignItems: "center", marginBottom: "var(--sp-2)", flexWrap: "wrap" }}>
            <span style={{ fontSize: "var(--fs-lg)" }}>{result.risk === "EMERGENCY" || result.risk === "HIGH" ? "🚨" : result.risk === "MEDIUM" ? "⚠️" : "✅"}</span>
            <Tag label={result.risk} bg={(riskCol[result.risk] || ["var(--sgl)"])[0]} tc={(riskCol[result.risk] || ["","var(--sg)"])[1]} />
            <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: (riskCol[result.risk] || ["","var(--sg)"])[1] }}>{result.condition}</p>
          </div>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.65 }}>{result.action}</p>
        </div>
      )}
    </WCard>
  );
};

// ============================================================
// HEALTH MODULE
// ============================================================
const HealthModule = () => {
  const [view, setView] = useState("menu");
  const [scanResult, setScanResult] = useState(null);
  const streamRef = useRef(null);
  const intRef = useRef(null);
  const stopCam = useCallback(() => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (intRef.current) { clearInterval(intRef.current); intRef.current = null; }
  }, []);
  useEffect(() => () => stopCam(), [stopCam]);
  const doSimScan = () => {
    const demos = ["paracetamol", "ibuprofen", "folic acid", "amoxicillin", "malaria"];
    setTimeout(() => processResult(demos[Math.floor(Math.random() * demos.length)]), 1400);
  };
  const processResult = (data) => {
    stopCam();
    const k = Object.keys(DRUGS).find(k => k !== "default" && data.toLowerCase().includes(k));
    setScanResult(DRUGS[k] || DRUGS.default);
    setView("result");
  };
  if (view === "result" && scanResult) return (
    <div className="page-pad">
      <button onClick={() => { setScanResult(null); setView("menu"); }} style={{ background: "none", border: "none", color: "var(--t)", fontWeight: 800, fontSize: "var(--fs-md)", marginBottom: "var(--sp-4)", cursor: "pointer" }}>← Back</button>
      <WCard style={{ background: scanResult.col[0], border: `1.5px solid ${scanResult.col[1]}44` }}>
        <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "center", marginBottom: "var(--sp-4)" }}>
          <div style={{ width: "var(--icon-md)", height: "var(--icon-md)", borderRadius: "var(--r)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-2xl)", boxShadow: "var(--sh)", flexShrink: 0 }}>{scanResult.icon}</div>
          <div><p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)" }}>{scanResult.name}</p><Tag label={scanResult.safety} bg={scanResult.col[0]} tc={scanResult.col[1]} /></div>
        </div>
        {[["Category", scanResult.cat], ["Trimester", scanResult.trim], ["Dose", scanResult.dose]].map(([l, v]) => (
          <div key={l} style={{ display: "flex", gap: "var(--gap-md)", paddingBottom: "var(--sp-2)", marginBottom: "var(--sp-2)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <span style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", width: "clamp(60px,15vw,80px)", flexShrink: 0, fontWeight: 700 }}>{l}</span>
            <span style={{ fontSize: "var(--fs-sm)", color: "var(--dp)", fontWeight: 600, flex: 1 }}>{v}</span>
          </div>
        ))}
        <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: "var(--r)", padding: "var(--card-p)", marginTop: "var(--sp-2)" }}>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.65 }}>⚠️ {scanResult.warn}</p>
          {scanResult.alt && <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginTop: "var(--sp-2)" }}>✅ Alternative: {scanResult.alt}</p>}
        </div>
      </WCard>
      <SymptomRisk />
    </div>
  );
  return (
    <div className="page-pad">
      <SectionTitle title="🩺 Health Tools" />
      {[{ icon: "📷", bg: "var(--bll)", tc: "var(--bl)", title: "Jaundice Scanner", desc: "Point camera at baby skin for AI colour analysis" }, { icon: "🔬", bg: "var(--sgl)", tc: "var(--sg)", title: "QR Drug Scanner", desc: "Scan barcode to check medication safety" }, { icon: "👁️", bg: "var(--lvl)", tc: "var(--lv)", title: "Symptom Vision", desc: "AI-powered visual symptom check" }].map((item, i) => (
        <WCard key={i} onClick={doSimScan} style={{ padding: "var(--card-p)" }}>
          <div style={{ display: "flex", gap: "var(--gap-lg)", alignItems: "center" }}>
            <IconBox emoji={item.icon} bg={item.bg} size="var(--icon-md)" />
            <div style={{ flex: 1 }}><p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-1)" }}>{item.title}</p><p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", lineHeight: 1.45 }}>{item.desc}</p></div>
            <div style={{ color: "var(--mt)", fontSize: "var(--fs-xl)" }}>›</div>
          </div>
        </WCard>
      ))}
      <SectionTitle title="Traditional Practices" />
      {TRADITIONAL.map((t, i) => (
        <WCard key={i} style={{ padding: "var(--card-p)", background: t.safe ? "var(--sgl)" : "var(--rdl)", border: `1px solid ${t.safe ? "var(--sgm)" : "var(--rdm)"}33` }}>
          <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "flex-start" }}>
            <div style={{ width: "clamp(28px,7vw,36px)", height: "clamp(28px,7vw,36px)", borderRadius: "var(--r)", background: t.safe ? "var(--sg)" : t.status === "DANGEROUS" ? "var(--rd)" : "var(--gd)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "var(--fs-sm)", flexShrink: 0 }}>{t.safe ? "✓" : t.status === "DANGEROUS" ? "✗" : "!"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: "var(--gap-sm)", alignItems: "center", flexWrap: "wrap", marginBottom: "var(--sp-1)" }}>
                <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--dp)" }}>{t.practice}</p>
                <Tag label={t.status} bg={t.safe ? "var(--sgl)" : t.status === "DANGEROUS" ? "var(--rdl)" : "var(--gdl)"} tc={t.safe ? "var(--sg)" : t.status === "DANGEROUS" ? "var(--rd)" : "var(--gd)"} />
              </div>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)", lineHeight: 1.55 }}>{t.reason}</p>
            </div>
          </div>
        </WCard>
      ))}
      <SectionTitle title="Symptom Risk Engine" />
      <SymptomRisk />
    </div>
  );
};

// ============================================================
// NUTRITION
// ============================================================
const Nutrition = () => {
  const [meal, setMeal] = useState("morning");
  const [suppTaken, setSuppTaken] = useState({ 0: true, 1: true });
  const [craving, setCraving] = useState("");
  const [cravingResult, setCravingResult] = useState(null);
  const CRAVINGS = {
    chocolate: { deficiency: "Magnesium", food: "Tiger Nuts (Aya), Egusi, Dark Vegetables", icon: "🟤" },
    ice: { deficiency: "Iron (Pica)", food: "Iron supplement + Efo Riro, Moi Moi", icon: "🧊", urgent: true },
    clay: { deficiency: "Iron/Zinc (Pica)", food: "Iron + Zinc supplement. See doctor urgently.", icon: "🟫", urgent: true },
    salt: { deficiency: "Sodium / Electrolytes", food: "Coconut water, Bone broth, Groundnut soup", icon: "🧂" },
    sour: { deficiency: "Vitamin C", food: "Orange, Lime, Tomatoes, Zobo", icon: "🍋" },
    meat: { deficiency: "Protein / Iron", food: "Fish, Eggs, Beans, Chicken, Sardines", icon: "🥩" },
    default: { deficiency: "Possibly normal craving", food: "Consult your nutritionist if cravings are intense or unusual.", icon: "🤰" },
  };
  const analyseCraving = () => {
    const l = craving.toLowerCase();
    const k = Object.keys(CRAVINGS).find(k => k !== "default" && l.includes(k));
    setCravingResult(CRAVINGS[k] || CRAVINGS.default);
  };
  return (
    <div className="page-pad">
      <SectionTitle title="🥗 Nutrition Engine" />
      <WCard style={{ background: "linear-gradient(135deg,var(--warm),var(--gdl))", border: "1px solid var(--border2)" }}>
        <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-2)" }}>🍫 Craving Intelligence</p>
        <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginBottom: "var(--sp-3)" }}>Cravings often signal nutrient deficiencies:</p>
        <div style={{ display: "flex", gap: "var(--gap-sm)", marginBottom: "var(--sp-3)" }}>
          <input value={craving} onChange={e => setCraving(e.target.value)} placeholder="e.g. chocolate, ice, meat…" className="form-input" style={{ flex: 1 }} />
          <button onClick={analyseCraving} style={{ padding: "0 clamp(12px,3vw,18px)", background: "var(--dp)", color: "#fff", border: "none", borderRadius: "var(--r)", fontSize: "var(--fs-sm)", fontWeight: 800, cursor: "pointer", flexShrink: 0, minHeight: "var(--touch)" }}>Check</button>
        </div>
        {cravingResult && (
          <div className="fu" style={{ background: cravingResult.urgent ? "var(--rdl)" : "var(--sgl)", borderRadius: "var(--r)", padding: "var(--card-p)", border: `1px solid ${cravingResult.urgent ? "var(--rd)" : "var(--sg)"}44` }}>
            <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: cravingResult.urgent ? "var(--rd)" : "var(--sg)", marginBottom: "var(--sp-1)" }}>{cravingResult.icon} {cravingResult.deficiency}</p>
            {cravingResult.urgent && <p style={{ fontSize: "var(--fs-xs)", color: "var(--rd)", fontWeight: 700, marginBottom: "var(--sp-1)" }}>⚠️ Pica requires immediate medical attention.</p>}
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)" }}>Eat: <b>{cravingResult.food}</b></p>
          </div>
        )}
      </WCard>
      <SectionTitle title="Daily Supplements" />
      <WCard style={{ padding: `var(--sp-2) var(--card-p)` }}>
        {SUPPS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "clamp(11px,2.8vw,15px) 0", borderBottom: i < SUPPS.length - 1 ? "1px solid var(--border)" : "none" }}>
            <button onClick={() => setSuppTaken(t => ({ ...t, [i]: !t[i] }))} style={{ width: "clamp(22px,5.5vw,28px)", height: "clamp(22px,5.5vw,28px)", borderRadius: "50%", flexShrink: 0, border: `2px solid ${suppTaken[i] ? "var(--sg)" : "var(--border2)"}`, background: suppTaken[i] ? "var(--sg)" : "transparent", color: "#fff", fontSize: "var(--fs-xs)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}>{suppTaken[i] ? "✓" : ""}</button>
            <IconBox emoji="💊" bg={s.col[0]} size="var(--icon-sm)" />
            <div style={{ flex: 1, minWidth: 0 }}><p style={{ fontSize: "var(--fs-base)", fontWeight: 800, color: "var(--dp)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</p><p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>{s.time}</p></div>
            <span style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: s.col[1], flexShrink: 0 }}>{s.dose}</span>
          </div>
        ))}
      </WCard>
      <SectionTitle title="Meal Planner" />
      <div style={{ display: "flex", gap: "var(--gap-sm)", marginBottom: "var(--sp-4)", overflowX: "auto", scrollbarWidth: "none" }}>
        {["morning", "afternoon", "evening"].map(m => (<Pill key={m} label={m === "morning" ? "🌅 Morning" : m === "afternoon" ? "☀️ Afternoon" : "🌙 Evening"} active={meal === m} onClick={() => setMeal(m)} />))}
      </div>
      {FOODS[meal].map((f, i) => (
        <WCard key={i} style={{ padding: "var(--card-p)" }}>
          <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "flex-start" }}>
            <div style={{ width: "var(--icon-md)", height: "var(--icon-md)", flexShrink: 0, borderRadius: "var(--r)", background: "var(--gdl)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-2xl)" }}>{f.e}</div>
            <div style={{ flex: 1 }}><p style={{ fontSize: "var(--fs-base)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-1)" }}>{f.name}</p><p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", lineHeight: 1.5, marginBottom: "var(--sp-2)" }}>{f.b}</p><div style={{ display: "flex", gap: "var(--gap-sm)", flexWrap: "wrap" }}>{f.tags.map(tag => <Tag key={tag} label={tag} />)}</div></div>
          </div>
        </WCard>
      ))}
    </div>
  );
};

// ============================================================
// VITALS
// ============================================================
const Vitals = () => {
  const [bpSys, setBpSys] = useState(118);
  const [bpDia, setBpDia] = useState(76);
  const [weight, setWeight] = useState(68.4);
  const [temp, setTemp] = useState(37.1);
  const [logged, setLogged] = useState(false);
  const bpStatus = bpSys > 140 || bpDia > 90 ? "HIGH" : bpSys < 90 ? "LOW" : "NORMAL";
  const tempStatus = temp > 38.5 ? "FEVER" : temp > 37.5 ? "ELEVATED" : "NORMAL";
  const history = [{ date: "22", sys: 118 }, { date: "23", sys: 116 }, { date: "24", sys: 124 }, { date: "25", sys: 119 }, { date: "26", sys: 122 }, { date: "27", sys: 120 }, { date: "28", sys: 118 }];
  return (
    <div className="page-pad">
      <SectionTitle title="❤️ Vital Signs" />
      <WCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-4)" }}>
          <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)" }}>Blood Pressure</p>
          <Tag label={bpStatus} bg={bpStatus === "NORMAL" ? "var(--sgl)" : bpStatus === "HIGH" ? "var(--rdl)" : "var(--bll)"} tc={bpStatus === "NORMAL" ? "var(--sg)" : bpStatus === "HIGH" ? "var(--rd)" : "var(--bl)"} />
        </div>
        <div style={{ textAlign: "center", marginBottom: "var(--sp-4)" }}>
          <span style={{ fontSize: "var(--fs-3xl)", fontWeight: 900, color: bpStatus === "HIGH" ? "var(--rd)" : "var(--sg)" }}>{bpSys}</span>
          <span style={{ fontSize: "var(--fs-xl)", color: "var(--mt)", fontWeight: 500 }}>/{bpDia}</span>
          <span style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", marginLeft: "var(--sp-1)" }}>mmHg</span>
        </div>
        {[["Systolic", bpSys, setBpSys, 80, 180, bpSys > 140 ? "var(--rd)" : "var(--sg)"], ["Diastolic", bpDia, setBpDia, 40, 120, bpDia > 90 ? "var(--rd)" : "var(--sg)"]].map(([l, v, sv, mn, mx, col], i) => (
          <div key={i} style={{ marginBottom: "var(--sp-3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--sp-2)" }}><span style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", fontWeight: 600 }}>{l}</span><span style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: col }}>{v} mmHg</span></div>
            <input type="range" min={mn} max={mx} value={v} onChange={e => sv(+e.target.value)} style={{ accentColor: col }} />
          </div>
        ))}
        {bpStatus === "HIGH" && <div className="fu" style={{ background: "var(--rdl)", borderRadius: "var(--r)", padding: "var(--sp-3) var(--card-p)" }}><p style={{ fontSize: "var(--fs-sm)", color: "var(--rd)", fontWeight: 700 }}>🚨 If above 160/110 with symptoms → hospital immediately.</p></div>}
      </WCard>
      <div className="stat-grid">
        <WCard style={{ padding: "var(--card-p)" }}>
          <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", marginBottom: "var(--sp-2)", textTransform: "uppercase", letterSpacing: 0.5 }}>Weight</p>
          <div style={{ fontSize: "var(--fs-2xl)", fontWeight: 900, color: "var(--t)", marginBottom: "var(--sp-2)" }}>{weight.toFixed(1)}<span style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}> kg</span></div>
          <input type="range" min={40} max={120} step={0.1} value={weight} onChange={e => setWeight(+e.target.value)} style={{ accentColor: "var(--t)", marginBottom: "var(--sp-2)" }} />
          <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>+0.8kg this week ✓</p>
        </WCard>
        <WCard style={{ padding: "var(--card-p)" }}>
          <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", marginBottom: "var(--sp-2)", textTransform: "uppercase", letterSpacing: 0.5 }}>Temperature</p>
          <div style={{ fontSize: "var(--fs-2xl)", fontWeight: 900, color: tempStatus === "NORMAL" ? "var(--sg)" : "var(--rd)", marginBottom: "var(--sp-2)" }}>{temp.toFixed(1)}<span style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>°C</span></div>
          <input type="range" min={35} max={42} step={0.1} value={temp} onChange={e => setTemp(+e.target.value)} style={{ accentColor: tempStatus === "NORMAL" ? "var(--sg)" : "var(--rd)", marginBottom: "var(--sp-2)" }} />
          <Tag label={tempStatus} bg={tempStatus === "NORMAL" ? "var(--sgl)" : "var(--rdl)"} tc={tempStatus === "NORMAL" ? "var(--sg)" : "var(--rd)"} />
        </WCard>
      </div>
      <WCard>
        <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-4)" }}>📈 7-Day BP Trend</p>
        <div className="chart-wrap">{history.map((h, i) => (<div key={i} className="chart-col"><span className="chart-val">{h.sys}</span><div className="chart-bar" style={{ height: `${((h.sys - 90) / 80) * 100}%`, background: h.sys > 135 ? "var(--rd)" : h.sys > 125 ? "var(--gd)" : "var(--sg)" }} /></div>))}</div>
        <div style={{ display: "flex", gap: "var(--gap-sm)" }}>{history.map((h, i) => <div key={i} className="chart-lbl" style={{ flex: 1 }}>Jan {h.date}</div>)}</div>
        <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginTop: "var(--sp-3)", lineHeight: 1.5 }}>AI: BP trending slightly upward over 7 days. Not alarming but worth monitoring daily.</p>
      </WCard>
      <button onClick={() => setLogged(true)} className="btn-primary" style={{ background: "var(--dp)", color: "#fff", marginBottom: "var(--sp-3)" }}>💾 Save Today's Vitals</button>
      {logged && <p className="fu" style={{ fontSize: "var(--fs-sm)", color: "var(--sg)", textAlign: "center", fontWeight: 800 }}>✅ Vitals saved. AI trend analysis updated.</p>}
    </div>
  );
};

// ============================================================
// BABY TRACKER
// ============================================================
const Baby = () => {
  const [feeds, setFeeds] = useState({ left: 12, right: 10, total: 8, last: "right" });
  const [diapers, setDiapers] = useState([{ t: "7:20 AM", type: "Wet" }, { t: "5:45 AM", type: "Dirty" }]);
  const [pumpMode, setPumpMode] = useState(false);
  return (
    <div className="page-pad">
      <SectionTitle title="🍼 Baby Tracker" />
      <WCard>
        <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-4)" }}>🤱 Breastfeeding</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap-md)", marginBottom: "var(--sp-4)" }}>
          {[{ side: "Left", mins: feeds.left, bg: "var(--gdl)", tc: "var(--gd)" }, { side: "Right", mins: feeds.right, bg: "var(--sgl)", tc: "var(--sg)" }].map(b => (
            <div key={b.side} style={{ background: b.bg, borderRadius: "var(--r)", padding: "var(--card-p)", textAlign: "center", border: `1.5px solid ${b.tc}44` }}>
              <div style={{ fontSize: "var(--fs-xl)", marginBottom: "var(--sp-2)" }}>{b.side === "Left" ? "◀" : "▶"}</div>
              <div style={{ fontSize: "var(--fs-xl)", fontWeight: 900, color: b.tc }}>{b.mins}<span style={{ fontSize: "var(--fs-sm)" }}> min</span></div>
              <div style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginTop: "var(--sp-1)", fontWeight: 600 }}>{b.side} breast</div>
            </div>
          ))}
        </div>
        <div style={{ background: "var(--bll)", borderRadius: "var(--r)", padding: "var(--sp-3) var(--card-p)", marginBottom: "var(--sp-3)" }}>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--bl)", fontWeight: 800 }}>🔄 Start next feed: {feeds.last === "right" ? "LEFT" : "RIGHT"} breast</p>
        </div>
        <div style={{ display: "flex", gap: "var(--gap-md)", marginBottom: "var(--sp-3)" }}>
          {["Start Left", "Start Right"].map((btn, i) => (
            <button key={i} onClick={() => setFeeds(f => ({ ...f, total: f.total + 1, last: i === 0 ? "left" : "right" }))} style={{ flex: 1, padding: "var(--sp-3)", background: i === 0 ? "var(--t)" : "var(--sg)", color: "#fff", border: "none", borderRadius: "var(--r)", fontSize: "var(--fs-sm)", fontWeight: 800, cursor: "pointer", minHeight: "var(--touch)" }}>{btn}</button>
          ))}
        </div>
        <button onClick={() => setPumpMode(!pumpMode)} style={{ width: "100%", padding: "var(--sp-3)", background: pumpMode ? "var(--lv)" : "var(--lvl)", color: pumpMode ? "#fff" : "var(--lv)", border: "1.5px solid var(--lvm)44", borderRadius: "var(--r)", fontSize: "var(--fs-sm)", fontWeight: 800, cursor: "pointer", minHeight: "var(--touch)" }}>🍼 {pumpMode ? "Stop Pumping" : "Start Pumping"}</button>
        {pumpMode && <p className="fu" style={{ fontSize: "var(--fs-xs)", color: "var(--lv)", textAlign: "center", marginTop: "var(--sp-3)", lineHeight: 1.5 }}>AI: Pump 15–20 mins each side. Best time: 30 mins after morning feed.</p>}
        <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", textAlign: "center", marginTop: "var(--sp-3)" }}>Total feeds today: {feeds.total} · AI milk supply: Optimal ✓</p>
      </WCard>
      <WCard style={{ background: "linear-gradient(135deg,var(--lvl),#F8F6FE)", border: "1px solid var(--lvm)33" }}>
        <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--lv)", marginBottom: "var(--sp-4)" }}>😴 AI Sleep Predictor</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--gap-md)", marginBottom: "var(--sp-3)" }}>
          {[{ v: "2:30 AM", l: "Last woke", tc: "var(--lv)" }, { v: "6:45 AM", l: "Next predicted", tc: "var(--sg)" }, { v: "14h 20m", l: "Total today", tc: "var(--t)" }].map((s, i) => (
            <div key={i} style={{ textAlign: "center", background: "rgba(255,255,255,0.8)", borderRadius: "var(--r)", padding: "var(--sp-3) var(--sp-2)" }}>
              <div style={{ fontSize: "var(--fs-base)", fontWeight: 900, color: s.tc, marginBottom: "var(--sp-1)" }}>{s.v}</div>
              <div style={{ fontSize: "var(--fs-2xs)", color: "var(--mt)", fontWeight: 600 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "var(--fs-xs)", color: "#5A5078", lineHeight: 1.55 }}>💜 Pattern confidence: 83%. AI alerts 15 mins before predicted next wake window.</p>
      </WCard>
      <WCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-4)" }}>
          <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)" }}>🚼 Diaper Log</p>
          <button onClick={() => setDiapers(d => [{ t: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), type: "Wet" }, ...d])} style={{ background: "var(--dp)", color: "#fff", border: "none", borderRadius: 20, padding: "clamp(5px,1.2vw,7px) clamp(12px,3vw,16px)", fontSize: "var(--fs-xs)", fontWeight: 800, cursor: "pointer", minHeight: "var(--touch)" }}>+ Log</button>
        </div>
        {diapers.slice(0, 3).map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "var(--sp-3) 0", borderBottom: i < diapers.length - 1 ? "1px solid var(--border)" : "none" }}>
            <div style={{ width: "var(--icon-sm)", height: "var(--icon-sm)", flexShrink: 0, borderRadius: "var(--r)", background: d.type === "Wet" ? "var(--bll)" : "var(--gdl)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-xl)" }}>{d.type === "Wet" ? "💧" : "💩"}</div>
            <div style={{ flex: 1 }}><p style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: "var(--dp)" }}>{d.type} diaper</p><p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>{d.t}</p></div>
            <Tag label="Normal" bg={d.type === "Wet" ? "var(--bll)" : "var(--gdl)"} tc={d.type === "Wet" ? "var(--bl)" : "var(--gd)"} />
          </div>
        ))}
        <p style={{ fontSize: "var(--fs-xs)", color: "var(--sg)", marginTop: "var(--sp-3)", fontWeight: 700 }}>✅ 2 wet + 1 dirty — Normal for 3-week-old</p>
      </WCard>
      <SectionTitle title="Week 3 Milestones" />
      <WCard style={{ padding: `var(--sp-2) var(--card-p)` }}>
        {[{ m: "Eye response to light", done: true }, { m: "Startle reflex (Moro)", done: true }, { m: "Responds to your voice", done: true }, { m: "Social smile", done: false }, { m: "Head control attempt", done: false }].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "var(--sp-3) 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
            <div style={{ width: "clamp(24px,6vw,30px)", height: "clamp(24px,6vw,30px)", flexShrink: 0, borderRadius: "50%", background: item.done ? "var(--sg)" : "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: item.done ? "#fff" : "var(--mt)", fontSize: "var(--fs-sm)", fontWeight: 800 }}>{item.done ? "✓" : "○"}</div>
            <p style={{ fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--dp)", flex: 1 }}>{item.m}</p>
            <Tag label={item.done ? "✓ Done" : "Soon"} bg={item.done ? "var(--sgl)" : "var(--warm)"} tc={item.done ? "var(--sg)" : "var(--mt)"} />
          </div>
        ))}
      </WCard>
    </div>
  );
};

// ============================================================
// MENTAL HEALTH
// ============================================================
const MentalHealth = () => {
  const [mood, setMood] = useState(null);
  const [breathPhase, setBreathPhase] = useState(null);
  const [breathCount, setBreathCount] = useState(0);
  const [breathTimer, setBreathTimer] = useState(0);
  const moods = [{ e: "😊", l: "Great", c: "var(--sg)" }, { e: "😌", l: "Calm", c: "var(--bl)" }, { e: "😐", l: "Okay", c: "var(--gd)" }, { e: "😔", l: "Low", c: "var(--t)" }, { e: "😰", l: "Anxious", c: "var(--rd)" }];
  const startBreath = () => {
    setBreathPhase("in"); setBreathCount(0); setBreathTimer(4);
    const phases = ["in", "hold", "out", "rest"];
    const times = [4, 7, 8, 2];
    let phase = 0; let count = 0;
    const run = () => {
      phase = (phase + 1) % 4;
      count = phase === 0 ? count + 1 : count;
      setBreathPhase(phases[phase]); setBreathTimer(times[phase]); setBreathCount(count);
      if (count < 4) setTimeout(run, times[phase] * 1000);
      else setBreathPhase("done");
    };
    setTimeout(run, times[0] * 1000);
  };
  return (
    <div className="page-pad">
      <SectionTitle title="💚 Mental Wellness" />
      <WCard>
        <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-4)" }}>How are you feeling?</p>
        <div className="mood-row" style={{ marginBottom: "var(--sp-4)" }}>
          {moods.map(m => (
            <button key={m.l} className="mood-btn" onClick={() => setMood(m)} style={{ background: mood?.l === m.l ? m.c + "22" : "transparent", border: `2px solid ${mood?.l === m.l ? m.c : "transparent"}` }}>
              <span>{m.e}</span><small style={{ color: mood?.l === m.l ? m.c : "var(--mt)" }}>{m.l}</small>
            </button>
          ))}
        </div>
        {mood && <div className="fu" style={{ background: mood.c + "18", borderRadius: "var(--r)", padding: "var(--sp-3) var(--card-p)", border: `1px solid ${mood.c}33` }}><p style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: mood.c }}>Logged: {mood.e} {mood.l}. Thank you for checking in, mama 💙</p></div>}
      </WCard>
      <WCard style={{ background: "linear-gradient(135deg,var(--lvl),#F8F6FE)", border: "1px solid var(--lvm)33" }}>
        <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--lv)", marginBottom: "var(--sp-2)" }}>🌬️ 4-7-8 Breathing</p>
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", marginBottom: "var(--sp-4)", lineHeight: 1.5 }}>Reduces anxiety and cortisol. Safe for all trimesters. 4 cycles recommended.</p>
        {!breathPhase ? (
          <button onClick={startBreath} className="btn-primary" style={{ background: "var(--lv)", color: "#fff" }}>▶ Start Exercise</button>
        ) : breathPhase === "done" ? (
          <div className="fu" style={{ textAlign: "center", padding: "var(--sp-4)" }}>
            <div style={{ fontSize: "clamp(36px,9vw,48px)", marginBottom: "var(--sp-2)" }}>✨</div>
            <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--sg)" }}>Well done, mama! 4 cycles complete.</p>
            <button onClick={() => setBreathPhase(null)} style={{ marginTop: "var(--sp-3)", background: "var(--sg)", color: "#fff", border: "none", borderRadius: 20, padding: "clamp(7px,1.8vw,10px) clamp(18px,4.5vw,24px)", fontSize: "var(--fs-sm)", fontWeight: 800, cursor: "pointer" }}>Done</button>
          </div>
        ) : (
          <div className="fu" style={{ textAlign: "center", padding: "var(--sp-4)" }}>
            <div style={{ width: "clamp(80px,20vw,110px)", height: "clamp(80px,20vw,110px)", borderRadius: "50%", background: breathPhase === "in" ? "var(--sgl)" : breathPhase === "hold" ? "var(--lvl)" : breathPhase === "out" ? "var(--bll)" : "var(--warm)", border: "3px solid " + (breathPhase === "in" ? "var(--sg)" : breathPhase === "hold" ? "var(--lv)" : "var(--bl)"), display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--sp-3)", transition: "all 1s ease", transform: breathPhase === "in" ? "scale(1.2)" : "scale(1)" }}>
              <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--dp)" }}>{breathPhase === "in" ? "In" : breathPhase === "hold" ? "Hold" : breathPhase === "out" ? "Out" : "Rest"}</p>
            </div>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)" }}>Cycle {breathCount + 1} of 4 · {breathTimer}s</p>
          </div>
        )}
      </WCard>
      <SectionTitle title="Daily Affirmations" />
      {["You are strong, capable, and deeply loved.", "Your body knows exactly what to do.", "This season is temporary. Your strength is permanent.", "You are not alone on this journey."].map((a, i) => (
        <WCard key={i} style={{ background: ["var(--gdl)","var(--sgl)","var(--lvl)","var(--bll)"][i], border: "none", padding: "var(--card-p)" }}>
          <p style={{ fontSize: "var(--fs-md)", fontWeight: 600, color: "var(--dp)", fontStyle: "italic", lineHeight: 1.6 }}>"{a}"</p>
        </WCard>
      ))}
      <SectionTitle title="🤱 Postpartum Body Changes" />
      <WCard style={{ background: "linear-gradient(135deg,#FEF0DA,#FDE8D0)", border: "1px solid #F2D4A844", marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--gd)", marginBottom: 4 }}>🔔 AI Proactive Guidance — Active</p>
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>MamaBloom tracks real body changes postpartum and sends you timely, personalised guidance — not generic advice. Your body is doing something extraordinary. We'll walk it with you.</p>
      </WCard>
      {[
        { icon: "⚖️", title: "Weight Management", bg: "var(--sgl)", tc: "var(--sg)", tip: "Most postpartum weight shifts take 6–12 months, not 6 weeks. Your body stored fat specifically to fuel breastfeeding. Focus on nourishing, not restricting.", notify: "Week 6 check-in due" },
        { icon: "🍫", title: "Emotional Eating", bg: "var(--gdl)", tc: "var(--gd)", tip: "Night feeds, sleep deprivation, and hormonal crashes create genuine cravings. Emotional hunger spikes 2–4 weeks postpartum. This is biological, not a failure of willpower.", notify: "Pattern flagged: 3 late-night logs" },
        { icon: "🌿", title: "Stretch Marks", bg: "var(--lvl)", tc: "var(--lv)", tip: "Shea butter (local), Bio-Oil, and rosehip oil improve appearance over 3–6 months. Apply while skin is still damp. Hydration and collagen-rich foods (bone broth, tomatoes) help from the inside.", notify: "Reminder: apply tonight" },
        { icon: "🔻", title: "FUPA Recovery", bg: "var(--bll)", tc: "var(--bl)", tip: "The lower belly pouch (FUPA) after a C-section or vaginal birth is normal — it's often fat repositioning + fluid + stretched skin. Deep core breathing from week 6 is more effective than crunches.", notify: "Week 8 core guide ready" },
        { icon: "🌱", title: "Full Body Adaptation", bg: "var(--rdl)", tc: "var(--rd)", tip: "Hair thinning at 3–6 months, joint laxity, night sweats, and breast changes are all expected hormonal shifts. Your body is recalibrating. Most resolve by month 9–12.", notify: "Month 4 adaptation brief" },
      ].map((item, i) => (
        <WCard key={i} style={{ marginBottom: "var(--gap-md)" }}>
          <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "flex-start" }}>
            <div style={{ width: "var(--icon-sm)", height: "var(--icon-sm)", borderRadius: "var(--r)", background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-xl)", flexShrink: 0 }}>{item.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-1)" }}>
                <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--dp)" }}>{item.title}</p>
                <span style={{ fontSize: "var(--fs-2xs)", fontWeight: 700, color: item.tc, background: item.bg, padding: "2px 8px", borderRadius: 10, flexShrink: 0, marginLeft: 6 }}>🔔 {item.notify}</span>
              </div>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>{item.tip}</p>
            </div>
          </div>
        </WCard>
      ))}
    </div>
  );
};

// ============================================================
// AI ASSISTANT
// ============================================================
const AIAssistant = () => {
  const [msgs, setMsgs] = useState([{ r: "bot", t: "Hi mama 🌸 I'm Bloom, your AI companion. Ask me anything about your pregnancy, Nigerian foods, medications, or how you're feeling today. I understand English, Yoruba, Igbo, Hausa, and Pidgin." }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);
  const send = (text) => {
    const t = text || input;
    if (!t.trim()) return;
    setMsgs(m => [...m, { r: "user", t }]);
    setInput("");
    setTyping(true);
    setTimeout(() => { setTyping(false); setMsgs(m => [...m, { r: "bot", t: bloomResp(t) }]); }, 800 + Math.random() * 600);
  };
  const quickTips = ["What to eat today?", "Iron-rich foods", "Is paracetamol safe?", "I feel anxious", "Baby not moving", "Breastfeeding tips"];
  return (
    <div className="chat-wrap">
      <div style={{ padding: "var(--sp-4) var(--pad-x)", borderBottom: "1px solid var(--border)", background: "var(--cream)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)" }}>
          <div style={{ width: "var(--icon-md)", height: "var(--icon-md)", borderRadius: "var(--r)", background: "linear-gradient(135deg,var(--t),var(--gd))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-xl)", flexShrink: 0 }}>🌸</div>
          <div>
            <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)" }}>Bloom AI</p>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--sg)", animation: "pu 2s infinite" }} />
              <span style={{ fontSize: "var(--fs-xs)", color: "var(--sg)", fontWeight: 700 }}>Online · Week 24 mode</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "var(--gap-sm)", overflowX: "auto", padding: "var(--sp-3) var(--pad-x)", scrollbarWidth: "none", flexShrink: 0, background: "var(--cream)" }}>
        {quickTips.map(q => (<button key={q} onClick={() => send(q)} style={{ flexShrink: 0, padding: "clamp(5px,1.2vw,7px) clamp(12px,3vw,16px)", background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: 20, fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--t)", cursor: "pointer", whiteSpace: "nowrap", minHeight: "var(--touch)" }}>{q}</button>))}
      </div>
      <div className="chat-messages">
        {msgs.map((m, i) => (
          <div key={i} className="fu" style={{ display: "flex", gap: "var(--gap-sm)", marginBottom: "var(--sp-4)", flexDirection: m.r === "user" ? "row-reverse" : "row", alignItems: "flex-end" }}>
            {m.r === "bot" && <div style={{ width: "clamp(28px,7vw,36px)", height: "clamp(28px,7vw,36px)", background: "linear-gradient(135deg,var(--t),var(--gd))", borderRadius: "var(--r)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-base)", flexShrink: 0 }}>🌸</div>}
            <div style={{ maxWidth: "78%", padding: "var(--sp-3) var(--card-p)", borderRadius: m.r === "user" ? "var(--r2) var(--r2) 4px var(--r2)" : "var(--r2) var(--r2) var(--r2) 4px", background: m.r === "user" ? "var(--dp)" : "var(--card)", color: m.r === "user" ? "#fff" : "var(--dp)", border: m.r === "bot" ? "1px solid var(--border)" : "none", fontSize: "var(--fs-sm)", lineHeight: 1.65, boxShadow: "var(--sh)" }}>{m.t}</div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", gap: "var(--gap-sm)", alignItems: "flex-end", marginBottom: "var(--sp-4)" }}>
            <div style={{ width: "clamp(28px,7vw,36px)", height: "clamp(28px,7vw,36px)", background: "linear-gradient(135deg,var(--t),var(--gd))", borderRadius: "var(--r)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-base)" }}>🌸</div>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r2) var(--r2) var(--r2) 4px", padding: "var(--sp-3) var(--sp-4)", display: "flex", gap: "var(--sp-2)", alignItems: "center", boxShadow: "var(--sh)" }}>
              {[0,1,2].map(j => <div key={j} style={{ width: "clamp(5px,1.2vw,7px)", height: "clamp(5px,1.2vw,7px)", borderRadius: "50%", background: "var(--t)", animation: `bl 1.2s infinite ${j * 0.2}s` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="chat-input-bar">
        {listening && <div style={{ background: "var(--rdl)", borderRadius: "var(--r)", padding: "var(--sp-2) var(--card-p)", marginBottom: "var(--sp-2)", display: "flex", alignItems: "center", gap: "var(--gap-sm)" }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--rd)", animation: "pu 0.8s infinite" }} /><span style={{ fontSize: "var(--fs-sm)", color: "var(--rd)", fontWeight: 700 }}>Listening… speak now</span></div>}
        <div style={{ display: "flex", gap: "var(--gap-sm)", alignItems: "flex-end" }}>
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Ask Bloom anything…" rows={1} style={{ flex: 1, padding: "clamp(10px,2.5vw,13px) clamp(13px,3.2vw,17px)", borderRadius: 22, border: "1.5px solid var(--border)", background: "var(--warm)", fontSize: "var(--fs-sm)", color: "var(--dp)", resize: "none", outline: "none", maxHeight: 90, lineHeight: 1.5, transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = "var(--t)"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
          <button onClick={() => setListening(l => !l)} className="btn-icon" style={{ background: listening ? "var(--rd)" : "var(--warm)", border: "1.5px solid var(--border)" }}>🎤</button>
          <button onClick={() => send()} className="btn-icon" style={{ background: "var(--dp)", color: "#fff" }}>➤</button>
        </div>
        <p style={{ fontSize: "var(--fs-2xs)", color: "var(--mt)", textAlign: "center", marginTop: "var(--sp-2)" }}>Bloom is AI only. For emergencies call 199 or tap SOS.</p>
      </div>
    </div>
  );
};

// ============================================================
// BLOOM CHAT
// ============================================================
const BloomChat = () => {
  const [activeTab, setActiveTab] = useState("chat");
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", gap: "var(--gap-sm)", padding: "var(--sp-4) var(--pad-x) var(--sp-3)", overflowX: "auto", scrollbarWidth: "none", flexShrink: 0 }}>
        {["chat","support","records","offline"].map(t => (
          <Pill key={t} label={t === "chat" ? "💬 Chat" : t === "support" ? "👩‍⚕️ Human" : t === "records" ? "📋 Records" : "📴 Offline"} active={activeTab === t} onClick={() => setActiveTab(t)} />
        ))}
      </div>
      {activeTab === "chat" && <AIAssistant />}
      {activeTab === "support" && (
        <div className="scroll-area" style={{ padding: "0 var(--pad-x) calc(var(--nav-h) + var(--sp-5))" }}>
          {[{ name: "Nurse Chiamaka Obi", spec: "Midwife & Lactation Consultant", status: "Available", lang: "EN, IG" }, { name: "Nurse Fatima Al-Hassan", spec: "Antenatal & Postnatal Care", status: "Available", lang: "EN, HA" }, { name: "Dr. Segun Adeyemi", spec: "Obstetrician (Video Consult)", status: "In 30 mins", lang: "EN, YO" }].map((p, i) => (
            <WCard key={i} style={{ padding: "var(--card-p)" }}>
              <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "center" }}>
                <div style={{ width: "var(--icon-md)", height: "var(--icon-md)", flexShrink: 0, borderRadius: "var(--r)", background: "var(--sgl)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-xl)" }}>👩‍⚕️</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</p>
                  <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginBottom: "var(--sp-2)" }}>{p.spec}</p>
                  <div style={{ display: "flex", gap: "var(--gap-sm)" }}><Tag label={p.status} bg={p.status === "Available" ? "var(--sgl)" : "var(--gdl)"} tc={p.status === "Available" ? "var(--sg)" : "var(--gd)"} /><Tag label={p.lang} bg="var(--bll)" tc="var(--bl)" /></div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-sm)", flexShrink: 0 }}>
                  <button style={{ background: "var(--dp)", color: "#fff", border: "none", borderRadius: 20, padding: "clamp(5px,1.2vw,7px) clamp(11px,2.8vw,15px)", fontSize: "var(--fs-xs)", fontWeight: 800, cursor: "pointer" }}>💬 Chat</button>
                  <button style={{ background: "var(--sg)", color: "#fff", border: "none", borderRadius: 20, padding: "clamp(5px,1.2vw,7px) clamp(11px,2.8vw,15px)", fontSize: "var(--fs-xs)", fontWeight: 800, cursor: "pointer" }}>📞 Call</button>
                </div>
              </div>
            </WCard>
          ))}
        </div>
      )}
      {activeTab === "records" && (
        <div className="scroll-area" style={{ padding: "0 var(--pad-x) calc(var(--nav-h) + var(--sp-5))" }}>
          {[{ i:"🧪",l:"Blood Test Results",d:"Jan 28, 2025",s:"Uploaded" },{ i:"🔬",l:"Ultrasound Report (Week 22)",d:"Jan 15, 2025",s:"Uploaded" },{ i:"📋",l:"Antenatal Care Card",d:"Dec 20, 2024",s:"Uploaded" },{ i:"💉",l:"Vaccination Record",d:"Jan 12, 2025",s:"Partial" },{ i:"📊",l:"Growth Chart",d:"Jan 28, 2025",s:"Auto-generated" }].map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "var(--sp-4) 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: "var(--icon-sm)", height: "var(--icon-sm)", flexShrink: 0, borderRadius: "var(--r)", background: "var(--warm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-xl)" }}>{r.i}</div>
              <div style={{ flex: 1, minWidth: 0 }}><p style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: "var(--dp)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.l}</p><p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>{r.d}</p></div>
              <Tag label={r.s} bg={r.s === "Uploaded" ? "var(--sgl)" : r.s === "Auto-generated" ? "var(--bll)" : "var(--gdl)"} tc={r.s === "Uploaded" ? "var(--sg)" : r.s === "Auto-generated" ? "var(--bl)" : "var(--gd)"} />
            </div>
          ))}
          <div style={{ display: "flex", gap: "var(--gap-md)", marginTop: "var(--sp-5)" }}>
            <button className="btn-primary" style={{ background: "var(--dp)", color: "#fff" }}>+ Upload Record</button>
            <button className="btn-primary" style={{ background: "var(--sg)", color: "#fff" }}>📤 Share</button>
          </div>
        </div>
      )}
      {activeTab === "offline" && (
        <div className="scroll-area" style={{ padding: "var(--sp-4) var(--pad-x) calc(var(--nav-h) + var(--sp-5))" }}>
          <WCard style={{ background: "var(--sgl)", border: "1px solid var(--sgm)44" }}>
            <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--sg)", marginBottom: "var(--sp-2)" }}>📴 Offline AI Mode — Active</p>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>On-device intelligence is active. Core features work without internet. Data syncs automatically when connected.</p>
          </WCard>
          {["Emergency contacts stored locally","Nigerian foods database: 340 foods","Symptom checker available offline","Last sync: Today 9:41 AM","Storage used: 42 MB / 500 MB"].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "var(--gap-md)", alignItems: "center", padding: "var(--sp-3) 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--sg)", flexShrink: 0 }} />
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--dp)", fontWeight: 500 }}>{item}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// ONBOARDING ILLUSTRATIONS
// ============================================================
const OnboardingIllustration = ({ type }) => {
  if (type === "pregnant") return <img src="preg.png" alt="pregnant" width="80" height="88" />;
  if (type === "conceive") return <img src="conceive.png" alt="conceive" width="80" height="88" />;
  if (type === "menopause") return <img src="mom.png" alt="menopause" width="80" height="88" />;
  return <img src="mom.png" alt="mom" width="80" height="88" />;
};

// ============================================================
// ONBOARDING
// ============================================================
const Onboarding = ({ onSelect, onAlreadyHaveAccount }) => {
  const [selected, setSelected] = useState(null);
  const [animOut, setAnimOut] = useState(false);
  const options = [
    { id: "pregnant", label: "I'm Pregnant", bg: "linear-gradient(135deg,#C4603A,#E07840,#F2A07A)", shadow: "rgba(196,96,58,0.4)", type: "pregnant" },
    { id: "conceive", label: "Trying to Conceive", bg: "linear-gradient(135deg,#3A8C6A,#5A9E6E,#7AC880)", shadow: "rgba(74,124,89,0.4)", type: "conceive" },
    { id: "mom", label: "I'm already a Mom", bg: "linear-gradient(135deg,#C04A42,#D0524A,#E07070)", shadow: "rgba(192,57,43,0.4)", type: "mom" },
    { id: "menopause", label: "Cycle & Menopause Support", bg: "linear-gradient(135deg,#6A4A8C,#8B7EC8,#B09EE0)", shadow: "rgba(106,74,140,0.4)", type: "menopause" },
  ];
  const handleSelect = (id) => { setSelected(id); setAnimOut(true); setTimeout(() => onSelect(id), 480); };
  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--cream)", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 900, maxWidth: 480, margin: "0 auto", opacity: animOut ? 0 : 1, transform: animOut ? "translateY(-20px)" : "translateY(0)", transition: "opacity 0.45s, transform 0.45s", overflowY: "auto" }}>
      <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", padding: "var(--sp-5) var(--pad-x) 0" }}>
        <button onClick={onAlreadyHaveAccount} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "var(--fs-sm)", fontWeight: 700, color: "var(--mt)", textDecoration: "underline", minHeight: "var(--touch)" }}>Already have an account</button>
      </div>
      <div style={{ marginTop: "var(--sp-4)", marginBottom: "var(--sp-4)" }}>
        <div style={{ width: "clamp(90px,22vw,116px)", height: "clamp(90px,22vw,116px)", borderRadius: "50%", background: "linear-gradient(145deg,#FDE8DB,#E8F5EC)", border: "3px solid rgba(224,120,64,0.15)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 8px 32px rgba(224,120,64,0.15)" }}>
          <img src={boardImage} alt="MamaBloom" style={{ width: "100%", height: "90%" }} />
        </div>
      </div>
      <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", fontWeight: 600, marginBottom: "var(--sp-1)" }}>Nice to meet you!</p>
      <h1 className="serif" style={{ fontSize: "var(--fs-2xl)", fontWeight: 600, color: "var(--dp)", marginBottom: "var(--sp-4)", textAlign: "center", lineHeight: 1.2, padding: "0 var(--pad-x)", fontStyle: "italic" }}>What brings you here?</h1>
      <div style={{ width: "100%", padding: "0 var(--pad-x)", display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
        {options.map((opt, i) => (
          <button key={opt.id} onClick={() => handleSelect(opt.id)} className="ob-btn fu" style={{ background: opt.bg, boxShadow: `0 8px 28px ${opt.shadow}`, animationDelay: `${i * 0.09}s` }}>
            <span style={{ paddingLeft: "var(--sp-6)", fontSize: "var(--fs-md)", fontWeight: 800, color: "#fff", flex: 1, textAlign: "left", textShadow: "0 1px 6px rgba(0,0,0,0.2)" }}>{opt.label}</span>
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "clamp(90px,22vw,115px)", display: "flex", alignItems: "center", justifyContent: "flex-end", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -10, top: "50%", transform: "translateY(-50%)", width: "clamp(80px,20vw,105px)", height: "clamp(80px,20vw,105px)", borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
              <div style={{ marginRight: "var(--sp-2)", zIndex: 2 }}><OnboardingIllustration type={opt.type} /></div>
            </div>
          </button>
        ))}
      </div>
      <div style={{ height: "var(--sp-5)" }} />
    </div>
  );
};

// ============================================================
// LOGIN
// ============================================================
const Login = ({ journeyType, onLogin, onBack }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [animOut, setAnimOut] = useState(false);
  const meta = { pregnant: { label: "Pregnant Mama", icon: "", color: "var(--t)" }, conceive: { label: "Trying to Conceive", icon: "🌸", color: "var(--sg)" }, mom: { label: "Mama", icon: "👶", color: "var(--rd)" }, menopause: { label: "Cycle & Menopause", icon: "🌙", color: "var(--lv)" } }[journeyType] || { label: "Mama", icon: "🌸", color: "var(--t)" };
  const handleLogin = () => {
    if (!email || !password) return;
    setLoading(true);
    setTimeout(() => { setAnimOut(true); setTimeout(onLogin, 420); }, 1000);
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--cream)", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 900, maxWidth: 480, margin: "0 auto", overflowY: "auto", opacity: animOut ? 0 : 1, transform: animOut ? "translateY(20px)" : "translateY(0)", transition: "opacity 0.4s, transform 0.4s" }}>
      <div style={{ width: "100%", background: "#2A1200", padding: "clamp(40px,10vw,60px) var(--pad-x) clamp(48px,12vw,70px)", borderRadius: "0 0 var(--r3) var(--r3)", position: "relative", overflow: "hidden" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.14)", border: "none", borderRadius: 20, padding: "clamp(6px,1.5vw,9px) clamp(12px,3vw,16px)", color: "#fff", fontSize: "var(--fs-sm)", fontWeight: 700, cursor: "pointer", marginBottom: "var(--sp-5)", display: "block", minHeight: "var(--touch)" }}>← Back</button>
        <div className="serif" style={{ fontSize: "var(--fs-3xl)", color: "#fff", fontStyle: "italic", marginBottom: "var(--sp-2)" }}>Mama<b style={{ fontStyle: "normal", color: "#F2A07A" }}>Bloom</b></div>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "var(--fs-xs)", letterSpacing: 2.5, textTransform: "uppercase" }}>Maternal AI · Nigeria-First</p>
      </div>
      <div style={{ marginTop: "clamp(-18px,-4.5vw,-22px)", marginBottom: "var(--sp-5)", zIndex: 2 }}>
        <div style={{ background: "var(--card)", borderRadius: 30, padding: "clamp(8px,2vw,12px) clamp(16px,4vw,22px)", boxShadow: "var(--sh2)", display: "flex", alignItems: "center", gap: "var(--gap-md)", border: `2px solid ${meta.color}44` }}>
          <span style={{ fontSize: "var(--fs-xl)" }}>{meta.icon}</span>
          <span style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--dp)" }}>{meta.label}</span>
        </div>
      </div>
      <div style={{ width: "100%", padding: "0 var(--pad-x)" }}>
        <h2 className="serif" style={{ fontSize: "var(--fs-2xl)", fontWeight: 600, color: "var(--dp)", marginBottom: "var(--sp-1)", textAlign: "center", fontStyle: "italic" }}>Welcome back</h2>
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", textAlign: "center", marginBottom: "var(--sp-5)", fontWeight: 500 }}>Sign in to continue your journey</p>
        <div style={{ marginBottom: "var(--sp-4)" }}>
          <label style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--md)", display: "block", marginBottom: "var(--sp-2)", letterSpacing: 0.3 }}>Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="mama@example.com" className="form-input" onFocus={e => e.target.style.borderColor = "var(--t)"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
        </div>
        <div style={{ marginBottom: "var(--sp-5)" }}>
          <label style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--md)", display: "block", marginBottom: "var(--sp-2)", letterSpacing: 0.3 }}>Password</label>
          <div style={{ position: "relative" }}>
            <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="form-input" style={{ paddingRight: "clamp(42px,10vw,54px)" }} onFocus={e => e.target.style.borderColor = "var(--t)"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
            <button onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: "clamp(12px,3vw,16px)", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "var(--fs-lg)", color: "var(--mt)", padding: 0, minWidth: "var(--touch)", minHeight: "var(--touch)", display: "flex", alignItems: "center", justifyContent: "center" }}>{showPass ? "🙈" : "👁️"}</button>
          </div>
          <div style={{ textAlign: "right", marginTop: "var(--sp-2)" }}><button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "var(--fs-sm)", color: "var(--t)", fontWeight: 700, minHeight: "var(--touch)" }}>Forgot password?</button></div>
        </div>
        <button onClick={handleLogin} className="btn-primary" style={{ background: (!email || !password) ? "var(--border)" : "var(--dp)", color: (!email || !password) ? "var(--mt)" : "#fff", cursor: (!email || !password) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--gap-md)", marginBottom: "var(--sp-5)" }}>
          {loading ? <><div style={{ width: "clamp(14px,3.5vw,18px)", height: "clamp(14px,3.5vw,18px)", border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "sp 0.7s linear infinite" }} /> Signing in…</> : "Sign In →"}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", marginBottom: "var(--sp-5)" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} /><span style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", fontWeight: 700, letterSpacing: 0.5 }}>OR</span><div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>
        {[["G","#4285F4","Continue with Google"],["📱","var(--dp)","Continue with Phone"]].map(([ic,col,label],i) => (
          <button key={i} onClick={handleLogin} style={{ width: "100%", padding: "clamp(12px,3vw,15px)", borderRadius: "var(--r)", marginBottom: "var(--gap-md)", border: "1.5px solid var(--border)", background: "var(--card)", cursor: "pointer", fontSize: "var(--fs-sm)", fontWeight: 700, color: "var(--dp)", display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--gap-md)", boxShadow: "var(--sh)", minHeight: "var(--touch)" }}>
            <span style={{ fontSize: "var(--fs-lg)", fontWeight: 900, color: col, lineHeight: 1 }}>{ic}</span>{label}
          </button>
        ))}
        <p style={{ textAlign: "center", fontSize: "var(--fs-sm)", color: "var(--mt)", marginTop: "var(--sp-5)" }}>New here?{" "}<button onClick={handleLogin} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t)", fontWeight: 800, fontSize: "var(--fs-sm)", minHeight: "var(--touch)" }}>Create your free account</button></p>
        <div style={{ height: "var(--sp-6)" }} />
      </div>
    </div>
  );
};

// ============================================================
// SAFETY HUB — Drug DB + full SafetyHub
// ============================================================
const DRUG_DB = {
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
};

const CONTEXT_KEYS = { "Pregnancy — T1":"T1","Pregnancy — T2":"T2","Pregnancy — T3":"T3","Postpartum (Wk 1–12)":"postpartum","Cycle: Menstrual":"menstrual","Cycle: Follicular":"follicular","Cycle: Ovulatory":"ovulatory","Cycle: Luteal":"luteal" };
const RATING_META = { SAFE:{icon:"✅",col:"#5A9E6E",bg:"#E3F5EA",label:"Safe"},RECOMMENDED:{icon:"💚",col:"#5A9E6E",bg:"#E3F5EA",label:"Recommended"},CAUTION:{icon:"⚠️",col:"#C87C30",bg:"#FEF2E0",label:"Use with Caution"},AVOID:{icon:"🚫",col:"#D0524A",bg:"#FDEEEC",label:"Avoid"},EMERGENCY:{icon:"🆘",col:"#D0524A",bg:"#FDEEEC",label:"Seek Emergency Care"},"CONSULT DOCTOR":{icon:"👩‍⚕️",col:"#C87C30",bg:"#FEF2E0",label:"Consult Doctor"},"GENERALLY SAFE":{icon:"✅",col:"#5A9E6E",bg:"#E3F5EA",label:"Generally Safe"},"DEPENDS ON TYPE":{icon:"⚠️",col:"#C87C30",bg:"#FEF2E0",label:"Depends on Type"} };

const DrugSafetyChecker = () => {
  const [query, setQuery] = useState("");
  const [ctx, setCtx] = useState("Pregnancy — T2");
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const search = () => {
    if (!query.trim()) return;
    const q = query.toLowerCase().trim();
    const key = Object.keys(DRUG_DB).find(k => q.includes(k) || k.includes(q));
    setResult(key ? DRUG_DB[key] : null);
    setSearched(true);
  };
  const ctxKey = CONTEXT_KEYS[ctx];
  const guidance = result?.guidance?.[ctxKey] || "No specific guidance available. Always consult your healthcare provider.";
  const rm = result ? (RATING_META[result.rating] || RATING_META["CAUTION"]) : null;
  const SUGGESTIONS = ["Panadol","Ibuprofen","Ampiclox","Flagyl","Codeine","Folic Acid","Zobo","Ginger","Bitter Leaf","Raw Fish","Liver","Cheese","Pesticides","Relaxers","Paint Fumes","Malaria"];
  return (
    <div className="fu" style={{ padding: "var(--pad-x)", display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
      <div style={{ textAlign: "center", padding: "var(--sp-3) 0 var(--sp-2)" }}>
        <div style={{ fontSize: "clamp(32px,8vw,42px)", marginBottom: 6 }}>💊</div>
        <div style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)" }}>Drug & Substance Safety</div>
        <div style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", marginTop: 4 }}>Drugs · Herbs · Foods · Environmental hazards</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} placeholder="Search e.g. Panadol, zobo, paint fumes…" style={{ flex: 1, padding: "clamp(10px,2.5vw,13px) clamp(13px,3vw,16px)", borderRadius: "var(--r)", border: "1.5px solid var(--border2)", fontSize: "var(--fs-sm)", background: "var(--card)", outline: "none", color: "var(--dp)" }} />
        <button onClick={search} style={{ padding: "0 clamp(14px,3.5vw,20px)", borderRadius: "var(--r)", background: "var(--t)", color: "#fff", fontWeight: 700, fontSize: "var(--fs-sm)", flexShrink: 0, minHeight: "var(--touch)" }}>Check</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {SUGGESTIONS.map(s => (<button key={s} onClick={() => setQuery(s)} style={{ padding: "5px 11px", borderRadius: 20, fontSize: "var(--fs-xs)", background: "var(--card)", border: "1.5px solid var(--border)", color: "var(--mt)", cursor: "pointer", fontWeight: 600 }}>{s}</button>))}
      </div>
      <WCard>
        <div style={{ fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--mt)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Your Context</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{Object.keys(CONTEXT_KEYS).map(c => (<Pill key={c} label={c} active={ctx === c} onClick={() => setCtx(c)} color="var(--rd)" />))}</div>
      </WCard>
      {searched && !result && (<WCard style={{ textAlign: "center", padding: "var(--sp-5)" }}><div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div><div style={{ fontWeight: 700, color: "var(--dp)" }}>Not in database</div><div style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", marginTop: 6 }}>Always consult your doctor or pharmacist.</div></WCard>)}
      {result && rm && (
        <div className="slideUp" style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
          <WCard style={{ background: rm.bg, border: `2px solid ${rm.col}33` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, background: `${rm.col}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{rm.icon}</div>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: "var(--fs-md)", color: "var(--dp)" }}>{result.name}</div><Tag label={result.cat} bg={`${rm.col}22`} tc={rm.col} /></div>
              <div style={{ padding: "6px 12px", borderRadius: 20, background: rm.col, color: "#fff", fontSize: "var(--fs-xs)", fontWeight: 800, flexShrink: 0 }}>{rm.label}</div>
            </div>
          </WCard>
          <WCard>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><div style={{ fontSize: 18 }}>🎯</div><div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--dp)" }}>Guidance for: {ctx}</div></div>
            <div style={{ padding: "var(--card-p)", borderRadius: "var(--r)", background: rm.bg, fontSize: "var(--fs-sm)", color: "var(--dp)", lineHeight: 1.6 }}>{guidance}</div>
          </WCard>
          <WCard>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><div style={{ fontSize: 18 }}>🔬</div><div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>How It Works / Risk</div></div>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>{result.mechanism}</div>
          </WCard>
          {result.nigerian?.length > 0 && (<WCard><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><div style={{ fontSize: 18 }}>🇳🇬</div><div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>Nigerian / Local Names</div></div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{result.nigerian.map((n, i) => (<Tag key={i} label={n} bg="var(--gdl)" tc="var(--gd)" />))}</div></WCard>)}
          <WCard style={{ background: "var(--sgl)", border: "1.5px solid var(--sg)33" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><div style={{ fontSize: 18 }}>💡</div><div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--sg)" }}>Safer Alternatives</div></div>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>{result.alt}</div>
          </WCard>
          <div style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", textAlign: "center", padding: "var(--sp-2) var(--sp-3)", lineHeight: 1.5 }}>⚕️ MamaBloom safety data is for educational use only. Always confirm with a registered doctor, pharmacist, or midwife.</div>
        </div>
      )}
    </div>
  );
};

const SafetyHub = () => {
  const [tab, setTab] = useState("dv");
  const HUB_TABS = [{ id:"dv",label:"🆘 DV Help" },{ id:"sexual",label:"🩺 Sexual Health" },{ id:"report",label:"📋 Report Incident" },{ id:"condoms",label:"🩹 Free Clinics" },{ id:"drugs",label:"💊 Safety Check" }];
  const DV_CONTACTS = [
    { flag:"🇳🇬",country:"Nigeria",lines:[{ name:"WARDC Hotline",num:"0800-033-0000" },{ name:"Lagos DSVRT",num:"08000333333" },{ name:"FIDA Nigeria",num:"01-8000002" }] },
    { flag:"🇬🇧",country:"UK",lines:[{ name:"National DV Helpline",num:"0808 2000 247" },{ name:"Refuge 24/7",num:"0808 2000 247" }] },
    { flag:"🇨🇦",country:"Canada",lines:[{ name:"ShelterSafe",num:"1-800-799-7233" }] },
    { flag:"🇺🇸",country:"USA",lines:[{ name:"NDVH",num:"1-800-799-7233" }] },
  ];
  const SEXUAL_HEALTH = [
    { icon:"💉",title:"STI Testing",desc:"Know your status — free or low-cost testing available at most government health centres in Nigeria (PEPFAR-funded sites).",tag:"All regions" },
    { icon:"🦠",title:"HIV/AIDS",desc:"Free ARV treatment at all Nigerian government hospitals. In UK: NHS sexual health clinics free & confidential.",tag:"Free care" },
    { icon:"🔵",title:"PrEP Access",desc:"PrEP (HIV prevention pill) available at select PEPFAR sites in Lagos, Abuja, Rivers State. Free in UK on NHS.",tag:"Prevention" },
    { icon:"🩸",title:"HPV Vaccination",desc:"HPV vaccine recommended for girls 9–14 in Nigeria (NPHCDA). Free in UK under NHS (up to age 25).",tag:"Vaccination" },
  ];
  const REPORT_STEPS = [
    { n:"1",title:"Get to Safety",body:"Leave if you can. Go to a neighbour, family member, or public place. Take children with you." },
    { n:"2",title:"Call Emergency Services",body:"Nigeria: 199 (Police) / 122 (Lagos Emergency). UK: 999. USA/CA: 911." },
    { n:"3",title:"Preserve Evidence",body:"Photograph injuries. Keep any threatening messages. Write down dates and times while memory is fresh." },
    { n:"4",title:"Seek Medical Care",body:"Any government hospital A&E must treat DV survivors. Request a PEP starter pack if sexually assaulted (within 72 h)." },
    { n:"5",title:"Contact a DV Organisation",body:"Call WARDC, Mirabel Centre (Lagos), or your nearest shelter. They can provide legal aid and safe housing." },
    { n:"6",title:"Know Your Rights (VAPP)",body:"Nigeria's VAPP Act 2015 criminalises all forms of domestic violence. You can obtain a protection order from a magistrate court." },
  ];
  const FREE_CLINICS = [
    { flag:"🇳🇬",name:"Lagos Island General Hospital",detail:"Free antenatal, STI, family planning",area:"Lagos Island" },
    { flag:"🇳🇬",name:"Rivers State Teaching Hospital",detail:"Free STI/HIV testing (PEPFAR)",area:"Port Harcourt" },
    { flag:"🇳🇬",name:"PEPFAR-Funded Sites",detail:"Free HIV test + ARV treatment, all 36 states",area:"Nationwide" },
    { flag:"🇬🇧",name:"NHS Sexual Health Clinic",detail:"Free STI, contraception, HIV test — no GP referral needed",area:"All UK regions" },
    { flag:"🇨🇦",name:"Sexual Health Clinic (ON/BC/AB)",detail:"Free or low-cost — walk-in, confidential",area:"Canada" },
    { flag:"🇺🇸",name:"Planned Parenthood",detail:"Sliding-scale STI testing, contraception, PrEP",area:"USA" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "var(--pad-y) var(--pad-x) 0" }}>
        <div style={{ fontWeight: 800, fontSize: "var(--fs-xl)", color: "var(--dp)" }}>🛡️ Safety Hub</div>
        <div style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", marginTop: 3 }}>Support, rights & health safety</div>
      </div>
      <div style={{ display: "flex", overflowX: "auto", gap: 8, padding: "var(--sp-3) var(--pad-x)", scrollbarWidth: "none" }}>
        {HUB_TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "8px 14px", borderRadius: 22, flexShrink: 0, fontSize: "var(--fs-xs)", fontWeight: 700, background: tab === t.id ? "var(--dp)" : "var(--card)", color: tab === t.id ? "#fff" : "var(--mt)", border: `1.5px solid ${tab === t.id ? "var(--dp)" : "var(--border)"}`, cursor: "pointer", minHeight: "var(--touch)" }}>{t.label}</button>))}
      </div>
      <div className="fu" style={{ flex: 1, overflowY: "auto", padding: "0 var(--pad-x) calc(var(--nav-h) + var(--sp-4))" }}>
        {tab === "dv" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
            <WCard style={{ background: "var(--rdl)", border: "1.5px solid var(--rdm)33" }}><div style={{ fontWeight: 800, fontSize: "var(--fs-md)", color: "var(--rd)", marginBottom: 6 }}>🆘 You Are Not Alone</div><div style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>Domestic violence affects 1 in 3 women in Nigeria. Help is available — free, confidential, and open to all women.</div></WCard>
            {DV_CONTACTS.map((c, i) => (<WCard key={i}><div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 8 }}>{c.flag} {c.country}</div>{c.lines.map((l, j) => (<div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: j < c.lines.length - 1 ? "1px solid var(--border)" : "none" }}><div style={{ fontSize: "var(--fs-sm)", color: "var(--md)" }}>{l.name}</div><a href={`tel:${l.num.replace(/\s/g,"")}`} style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--rd)", background: "var(--rdl)", padding: "5px 10px", borderRadius: 12, textDecoration: "none" }}>{l.num}</a></div>))}</WCard>))}
          </div>
        )}
        {tab === "sexual" && (<div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>{SEXUAL_HEALTH.map((s, i) => (<WCard key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}><div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: "var(--bll)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{s.icon}</div><div style={{ flex: 1 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}><div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{s.title}</div><Tag label={s.tag} bg="var(--bll)" tc="var(--bl)" /></div><div style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>{s.desc}</div></div></WCard>))}</div>)}
        {tab === "report" && (<div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}><WCard style={{ background: "var(--gdl)" }}><div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--gd)", marginBottom: 4 }}>📋 6-Step Incident Guide</div><div style={{ fontSize: "var(--fs-sm)", color: "var(--md)" }}>Follow these steps to report domestic violence safely and effectively.</div></WCard>{REPORT_STEPS.map((s, i) => (<WCard key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}><div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: "var(--t)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-sm)", fontWeight: 800, color: "#fff" }}>{s.n}</div><div><div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 4 }}>{s.title}</div><div style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>{s.body}</div></div></WCard>))}</div>)}
        {tab === "condoms" && (<div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}><WCard style={{ background: "var(--sgl)" }}><div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--sg)", marginBottom: 4 }}>🩹 Free & Low-Cost Care</div><div style={{ fontSize: "var(--fs-sm)", color: "var(--md)" }}>Free condoms, STI testing, and contraception near you.</div></WCard>{FREE_CLINICS.map((c, i) => (<WCard key={i}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}><div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{c.flag} {c.name}</div><Tag label={c.area} bg="var(--sgl)" tc="var(--sg)" /></div><div style={{ fontSize: "var(--fs-sm)", color: "var(--md)" }}>{c.detail}</div></WCard>))}</div>)}
        {tab === "drugs" && <DrugSafetyChecker />}
      </div>
    </div>
  );
};

// ============================================================
// ROOT APP — updated render logic with menu + settings
// ============================================================
export default function MamaBloom() {
  const [screen, setScreen] = useState("splash");
  const [journeyType, setJourneyType] = useState(null);
  const [tab, setTab] = useState("home");
  const [showSOS, setShowSOS] = useState(false);

  useEffect(() => {
    if (screen === "splash") {
      const t = setTimeout(() => setScreen("onboarding"), 2000);
      return () => clearTimeout(t);
    }
  }, [screen]);

  // When navigating from MenuScreen to a feature tab, switch back to that tab
  const handleSetTab = (id) => {
    const base = ["home","menu","settings"];
    const allowed = JOURNEY_CONFIG[journeyType]?.tabs || [];
    if (base.includes(id) || allowed.includes(id)) setTab(id);
  };

  return (
    <>
      <G />
      {screen === "splash" && <Splash />}
      {screen === "onboarding" && (
        <Onboarding onSelect={(id) => { setJourneyType(id); setScreen("login"); }} onAlreadyHaveAccount={() => setScreen("login")} />
      )}
      {screen === "login" && (
        <Login journeyType={journeyType} onLogin={() => setScreen("app")} onBack={() => setScreen("onboarding")} />
      )}
      {screen === "app" && (
        <div className="app-page">
          <div className="app-frame fu">
            {showSOS && <Emergency onClose={() => setShowSOS(false)} />}
            <Header onSOS={() => setShowSOS(true)} journeyType={journeyType} />
            <div className="scroll-area fu" key={tab}>
              {tab === "home"      && <Home setTab={handleSetTab} onSOS={() => setShowSOS(true)} journeyType={journeyType} />}
              {tab === "menu"      && <MenuScreen setActive={handleSetTab} journeyType={journeyType} />}
              {tab === "settings"  && <SettingsScreen />}
              {tab === "assistant" && <AIAssistant />}
              {tab === "kicks"     && <KicksIntelligence />}
              {tab === "nutrition" && <Nutrition />}
              {tab === "vitals"    && <Vitals />}
              {tab === "health"    && <HealthModule />}
              {tab === "baby"      && <Baby />}
              {tab === "mental"    && <MentalHealth />}
              {tab === "partner"   && <MentalHealth />}
              {tab === "chat"      && <BloomChat />}
              {tab === "safety"    && <SafetyHub />}
            </div>
            <Nav active={tab} setActive={handleSetTab} />
          </div>
        </div>
      )}
    </>
  );
}