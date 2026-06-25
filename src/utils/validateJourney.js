// src/utils/validateJourney.js
// Single source of truth for valid journey types.
// Use everywhere: URL params, Firestore reads, localStorage reads, JourneySelect.

const VALID_JOURNEYS = new Set(['pregnant', 'ivf', 'conceive', 'mom', 'menstrual', 'menopause']);

/**
 * Returns the journey key if valid, 'pregnant' otherwise.
 * Handles legacy/alias keys from JourneySelect and ttcTips.js.
 */
export function validateJourney(raw) {
  if (!raw) return 'pregnant';
  const s = String(raw).toLowerCase().trim();

  // Alias map — covers JourneySelect IDs ('postpartum','trying') and ttcTips IDs ('ttc','nursing')
  const ALIAS = {
    postpartum: 'mom',
    nursing:    'mom',
    trying:     'conceive',
    ttc:        'conceive',
    pregnancy:  'pregnant',
  };

  return VALID_JOURNEYS.has(s) ? s : (ALIAS[s] ?? 'pregnant');
}


// ─── glowContent.js key fix ────────────────────────────────────────────────
// In src/data/glowContent.js, rename these keys:
//   'ttc'        → 'conceive'
//   'postpartum' → 'mom'
// Then update the lookup helper:

// export function getGlowContent(journeyType, phase = 'default') {
//   const journey = validateJourney(journeyType);
//   const content = GLOW_CONTENT[journey] || GLOW_CONTENT['pregnant'];
//   return content[phase] || content['default'] || [];
// }


// ─── JOURNEY_CONFIG dedup instructions ────────────────────────────────────
// THREE files currently export JOURNEY_CONFIG: journey.js, journeyConfig.js, ttcTips.js
// ACTION — run these steps once:
//
// 1. journeyConfig.js  → KEEP. This is the canonical source.
//    - Add missing 'nursing' tab to mom entry (currently absent)
//    - ALL_TASKS is populated here — correct.
//
// 2. journey.js        → DELETE file. Replace all imports:
//    grep -r "from.*data/journey" src/ --include="*.js" --include="*.jsx"
//    Change to: from '../data/journeyConfig'
//
// 3. ttcTips.js        → KEEP only non-JOURNEY_CONFIG exports.
//    Remove: JOURNEY_CONFIG, ALL_TASKS, JOURNEY_META, getJourneyConfig, getTasksForJourney
//    Keep:   TTC_TIPS, FERTILITY_MYTHS, MENOPAUSE_SYMPTOMS, POSTPARTUM_TIMELINE,
//            BABY_MILESTONES, VACCINATION_SCHEDULE, EMERGENCY_CONTACTS,
//            getBabyMilestone, getUpcomingVaccinations (after fixing age parser), getPostpartumInfo
//
// 4. Fix getUpcomingVaccinations() age parser in ttcTips.js:
//    BROKEN:  const ageInWeeks = parseInt(v.age.split(' ')[0]) * 4;
//    FIXED:
//    const parts = v.age.split(' ');
//    const num = parseInt(parts[0]);
//    const unit = parts[1] || 'weeks';
//    const ageInWeeks = unit.startsWith('year') ? num * 52 : num;
//
// 5. Add nursing tab to mom in journeyConfig.js:
//    tabs: ["home", "nursing", "baby", "nutrition", "vitals", "health", "mental", "chat", "insights", "profile"],
