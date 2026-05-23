import { useState, useEffect } from 'react';
import { WCard, SectionTitle, Tag, Pill, IconBox } from '../../components/ui';
import { FOODS, SUPPS, CRAVINGS } from '../../data/foods';
import { getCulturalMeal, CULTURAL_FOODS } from '../../data/culturalFoods';
import { useApp } from '../../context/AppContext';

export default function Nutrition() {
  const { journeyType, culture, getCurrentWeek, getTrimester, babyAgeDays } = useApp();
  
  const [meal, setMeal] = useState("morning");
  const [suppTaken, setSuppTaken] = useState({ 0: true, 1: true });
  const [craving, setCraving] = useState("");
  const [cravingResult, setCravingResult] = useState(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [swapOption, setSwapOption] = useState(null);
  
  // Get cultural meals based on user's culture and journey
  const culturalMeals = getCulturalMeal(culture, journeyType);
  
  // Get journey-specific recommendations
  const getJourneyTips = () => {
    const week = getCurrentWeek();
    const trimester = getTrimester();
    
    const tips = {
      pregnant: {
        t1: [
          { icon: "🍌", title: "First Trimester Nutrition", tip: "Focus on folate-rich foods: leafy greens, beans, and fortified cereals. Ginger and vitamin B6 can help with nausea." },
          { icon: "💊", title: "Key Supplements", tip: "Folic acid (400-800mcg), Vitamin D (10mcg), and iodine are essential in first trimester." }
        ],
        t2: [
          { icon: "🥩", title: "Second Trimester Nutrition", tip: "Increase iron intake for your growing baby. Eat lean red meat, spinach, lentils, and pair with vitamin C for better absorption." },
          { icon: "🦴", title: "Calcium & Vitamin D", tip: "Your baby's bones are developing. Aim for 1000mg calcium daily from milk, yogurt, cheese, or fortified alternatives." }
        ],
        t3: [
          { icon: "🐟", title: "Third Trimester Nutrition", tip: "Omega-3 fatty acids support baby's brain development. Eat salmon, sardines, or walnuts. Avoid high-mercury fish." },
          { icon: "💧", title: "Stay Hydrated", tip: "Aim for 2-3 liters of water daily. Proper hydration reduces Braxton Hicks and helps prevent UTIs." }
        ]
      },
      conceive: [
        { icon: "🥚", title: "Fertility-Boosting Foods", tip: "Focus on folate, zinc, and antioxidants. Eat eggs, pumpkin seeds, berries, leafy greens, and fatty fish." },
        { icon: "🌿", title: "Nigerian Fertility Foods", tip: "Ugu leaf (pumpkin leaves), tiger nuts (aya), garden eggs, and bitter leaf support reproductive health." },
        { icon: "🚫", title: "Avoid During TTC", tip: "Limit alcohol, caffeine (>200mg/day), and avoid agbo (herbal mixtures) with unknown ingredients." }
      ],
      ivf: [
        { icon: "🥑", title: "IVF Nutrition", tip: "Anti-inflammatory diet: olive oil, fatty fish, berries, nuts, and leafy greens. Mediterranean diet patterns show best outcomes." },
        { icon: "💊", title: "Supplements for IVF", tip: "CoQ10 (ubiquinol) may improve egg quality. Consult your fertility specialist before starting any new supplement." },
        { icon: "😌", title: "Reduce Stress", tip: "High cortisol affects fertility outcomes. Practice gentle yoga, meditation, and get 7-8 hours of sleep." }
      ],
      mom: {
        newborn: [
          { icon: "🤱", title: "Breastfeeding Nutrition", tip: "You need 400-500 extra calories daily. Eat protein-rich foods, healthy fats, and stay hydrated. Aim for 2-3L water daily." },
          { icon: "🥣", title: "Galactagogues (Milk Supply)", tip: "Oats, fenugreek, moringa, and fennel may support milk supply. Stay consistent with nursing or pumping." }
        ],
        older: [
          { icon: "🍎", title: "Postpartum Recovery", tip: "Focus on iron-rich foods to replenish blood loss. Red meat, organ meats, lentils, and dark leafy greens are excellent sources." },
          { icon: "😴", title: "Sleep & Nutrition", tip: "Sleep deprivation affects hunger hormones. Meal prep when possible and accept help with cooking." }
        ]
      },
      menopause: [
        { icon: "🥛", title: "Calcium & Vitamin D", tip: "Menopause increases osteoporosis risk. Aim for 1200mg calcium daily from dairy, fortified alternatives, or supplements." },
        { icon: "🌿", title: "Phytoestrogens", tip: "Soy, flaxseeds, and legumes may help with hot flashes. Add tofu, edamame, or ground flax to your meals." },
        { icon: "💪", title: "Protein for Muscle Mass", tip: "Maintain muscle with adequate protein (1.2-1.5g/kg body weight). Eggs, fish, chicken, beans, and lentils are great sources." }
      ]
    };
    
    if (journeyType === 'pregnant') {
      return tips.pregnant[`t${trimester}`] || tips.pregnant.t2;
    }
    if (journeyType === 'mom') {
      const days = babyAgeDays || 0;
      return days < 42 ? tips.mom.newborn : tips.mom.older;
    }
    return tips[journeyType] || tips.conceive;
  };
  
  const journeyTips = getJourneyTips();
  
  const analyseCraving = () => {
    const l = craving.toLowerCase();
    const k = Object.keys(CRAVINGS).find(k => k !== "default" && l.includes(k));
    const result = CRAVINGS[k] || CRAVINGS.default;
    setCravingResult(result);
    
    // If pica (ice, dirt, clay) - show urgent warning
    if (result.urgent) {
      setTimeout(() => {
        alert("⚠️ Pica (craving non-food items) requires medical attention. Please speak with your doctor immediately.");
      }, 100);
    }
  };
  
  const handleSwapMeal = (mealItem) => {
    setSelectedMeal(mealItem);
    // Find culturally appropriate swap
    const alternatives = {
      "Jollof Rice": { name: "Coconut Rice", nutrients: "Healthy fats from coconut", prep: "Cook rice with coconut milk instead of tomato base" },
      "Egusi Soup": { name: "Groundnut Soup", nutrients: "Similar protein content", prep: "Use ground peanuts instead of melon seeds" },
      "White Rice": { name: "Brown Rice", nutrients: "More fiber and B vitamins", prep: "Swap white rice for brown rice" },
      "Bread": { name: "Whole Grain Bread", nutrients: "More fiber, lower GI", prep: "Choose whole grain options" }
    };
    setSwapOption(alternatives[mealItem?.name] || { name: "Try a local alternative", nutrients: "Varies", prep: "Consult a nutritionist for personalised swaps" });
    setShowSwapModal(true);
  };
  
  return (
    <div className="page-pad">
      <SectionTitle title="🥗 Nutrition Engine" subtitle="Personalised for your journey and culture" />

      {/* Journey-Specific Nutrition Tips */}
      <WCard style={{ background: "linear-gradient(135deg,var(--lvl),#F8F6FE)", border: "1px solid var(--lvm)44", marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--lv)", marginBottom: "var(--sp-2)" }}>
          🤰 {journeyType === 'pregnant' ? 'Pregnancy Nutrition' : 
               journeyType === 'conceive' ? 'Fertility Nutrition' :
               journeyType === 'ivf' ? 'IVF Nutrition' :
               journeyType === 'mom' ? 'Postpartum Nutrition' : 'Wellness Nutrition'}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
          {journeyTips.map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: "var(--gap-sm)", alignItems: "flex-start" }}>
              <span style={{ fontSize: 24 }}>{tip.icon}</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--dp)" }}>{tip.title}</p>
                <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", lineHeight: 1.5 }}>{tip.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </WCard>

      {/* Craving Intelligence */}
      <WCard style={{ background: "linear-gradient(135deg,var(--warm),var(--gdl))", border: "1px solid var(--border2)" }}>
        <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-2)" }}>🍫 Craving Intelligence</p>
        <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginBottom: "var(--sp-3)" }}>Cravings often signal nutrient deficiencies:</p>
        <div style={{ display: "flex", gap: "var(--gap-sm)", marginBottom: "var(--sp-3)" }}>
          <input 
            value={craving} 
            onChange={e => setCraving(e.target.value)}
            placeholder="e.g. chocolate, ice, meat, clay..." 
            className="form-input" 
            style={{ flex: 1 }} 
          />
          <button 
            onClick={analyseCraving} 
            style={{ 
              padding: "0 clamp(12px,3vw,18px)", 
              background: "var(--dp)", 
              color: "#fff", 
              border: "none", 
              borderRadius: "var(--r)", 
              fontSize: "var(--fs-sm)", 
              fontWeight: 800, 
              cursor: "pointer", 
              flexShrink: 0, 
              minHeight: "var(--touch)" 
            }}
          >
            Check
          </button>
        </div>
        {cravingResult && (
          <div style={{ 
            background: cravingResult.urgent ? "var(--rdl)" : "var(--sgl)", 
            borderRadius: "var(--r)", 
            padding: "var(--card-p)", 
            border: `1px solid ${cravingResult.urgent ? "var(--rd)" : "var(--sg)"}44` 
          }}>
            <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: cravingResult.urgent ? "var(--rd)" : "var(--sg)", marginBottom: "var(--sp-1)" }}>
              {cravingResult.icon} {cravingResult.deficiency}
            </p>
            {cravingResult.urgent && (
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--rd)", fontWeight: 700, marginBottom: "var(--sp-1)" }}>
                ⚠️ Pica requires immediate medical attention.
              </p>
            )}
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)" }}>
              Eat: <b>{cravingResult.food}</b>
            </p>
          </div>
        )}
      </WCard>

      {/* Supplements */}
      <SectionTitle title="Daily Supplements" />
      <WCard style={{ padding: `var(--sp-2) var(--card-p)` }}>
        {SUPPS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "clamp(11px,2.8vw,15px) 0", borderBottom: i < SUPPS.length - 1 ? "1px solid var(--border)" : "none" }}>
            <button 
              onClick={() => setSuppTaken(t => ({ ...t, [i]: !t[i] }))} 
              style={{ 
                width: "clamp(22px,5.5vw,28px)", 
                height: "clamp(22px,5.5vw,28px)", 
                borderRadius: "50%", 
                flexShrink: 0, 
                border: `2px solid ${suppTaken[i] ? "var(--sg)" : "var(--border2)"}`, 
                background: suppTaken[i] ? "var(--sg)" : "transparent", 
                color: "#fff", 
                fontSize: "var(--fs-xs)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                cursor: "pointer", 
                transition: "all 0.2s" 
              }}
            >
              {suppTaken[i] ? "✓" : ""}
            </button>
            <IconBox emoji="💊" bg={s.col[0]} size="var(--icon-sm)" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "var(--fs-base)", fontWeight: 800, color: "var(--dp)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {s.name}
              </p>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>{s.time}</p>
            </div>
            <span style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: s.col[1], flexShrink: 0 }}>{s.dose}</span>
          </div>
        ))}
      </WCard>

      {/* Cultural Meal Planner */}
      <SectionTitle title={`${CULTURAL_FOODS[culture]?.name || 'Your'} Meal Planner`} />
      
      <div style={{ display: "flex", gap: "var(--gap-sm)", marginBottom: "var(--sp-4)", overflowX: "auto", scrollbarWidth: "none" }}>
        {["morning", "afternoon", "evening"].map(m => (
          <Pill 
            key={m} 
            label={m === "morning" ? "🌅 Breakfast" : m === "afternoon" ? "☀️ Lunch" : "🌙 Dinner"} 
            active={meal === m} 
            onClick={() => setMeal(m)} 
          />
        ))}
      </div>
      
      {(culturalMeals[meal] || FOODS[meal]).map((f, i) => (
        <WCard key={i} style={{ padding: "var(--card-p)" }}>
          <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "flex-start" }}>
            <div style={{ width: "var(--icon-md)", height: "var(--icon-md)", flexShrink: 0, borderRadius: "var(--r)", background: "var(--gdl)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-2xl)" }}>
              {f.e || "🍲"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--gap-sm)" }}>
                <p style={{ fontSize: "var(--fs-base)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-1)" }}>
                  {f.name}
                </p>
                <button 
                  onClick={() => handleSwapMeal(f)}
                  style={{ 
                    background: "var(--warm)", 
                    border: "none", 
                    borderRadius: 20, 
                    padding: "4px 12px", 
                    fontSize: "var(--fs-2xs)", 
                    cursor: "pointer",
                    color: "var(--mt)"
                  }}
                >
                  🔄 Swap
                </button>
              </div>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", lineHeight: 1.5, marginBottom: "var(--sp-2)" }}>
                {f.description || f.b}
              </p>
              <div style={{ display: "flex", gap: "var(--gap-sm)", flexWrap: "wrap" }}>
                {(f.nutrients || f.tags || []).map(tag => (
                  <Tag key={tag} label={tag} bg="var(--sgl)" tc="var(--sg)" />
                ))}
              </div>
            </div>
          </div>
        </WCard>
      ))}
      
      {/* Weekly Meal Ideas Carousel */}
      <SectionTitle title="📅 Weekly Meal Ideas" />
      <div style={{ display: "flex", gap: "var(--gap-md)", overflowX: "auto", paddingBottom: "var(--sp-2)" }}>
        {[
          { day: "Mon", meal: "Jollof Rice with Grilled Fish", prep: "15 min prep" },
          { day: "Tue", meal: "Egusi Soup with Pounded Yam", prep: "20 min prep" },
          { day: "Wed", meal: "Moi Moi with Pap", prep: "10 min prep (soak beans overnight)" },
          { day: "Thu", meal: "Plantain and Fish Stew", prep: "15 min prep" },
          { day: "Fri", meal: "Okro Soup with Fufu", prep: "10 min prep" },
          { day: "Sat", meal: "Roasted Chicken with Vegetables", prep: "25 min prep" },
          { day: "Sun", meal: "Family Rice and Stew", prep: "20 min prep" }
        ].map(day => (
          <WCard key={day.day} style={{ minWidth: 150, textAlign: "center", padding: "var(--sp-3)" }}>
            <p style={{ fontWeight: 800, fontSize: "var(--fs-md)", marginBottom: "var(--sp-1)" }}>{day.day}</p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--dp)", fontWeight: 600 }}>{day.meal}</p>
            <p style={{ fontSize: "var(--fs-2xs)", color: "var(--mt)" }}>{day.prep}</p>
          </WCard>
        ))}
      </div>
      
      {/* Swap Meal Modal */}
      {showSwapModal && swapOption && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.8)",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--pad-x)"
        }}>
          <div style={{
            background: "var(--card)",
            borderRadius: "var(--r2)",
            maxWidth: 400,
            width: "100%",
            padding: "var(--sp-5)"
          }}>
            <h3 style={{ fontSize: "var(--fs-lg)", fontWeight: 800, marginBottom: "var(--sp-3)" }}>
              Swap {selectedMeal?.name}
            </h3>
            <div style={{ marginBottom: "var(--sp-4)" }}>
              <p style={{ fontWeight: 700, marginBottom: "var(--sp-1)" }}>{swapOption.name}</p>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--sg)", marginBottom: "var(--sp-2)" }}>
                ✓ {swapOption.nutrients}
              </p>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>
                📝 {swapOption.prep}
              </p>
            </div>
            <div style={{ display: "flex", gap: "var(--gap-md)" }}>
              <button 
                onClick={() => setShowSwapModal(false)}
                style={{ flex: 1, padding: "var(--sp-3)", background: "var(--warm)", border: "1px solid var(--border)", borderRadius: "var(--r)", cursor: "pointer" }}
              >
                Close
              </button>
              <button 
                onClick={() => {
                  // Apply swap (in real app, update meal plan)
                  alert("Swap saved! Your meal plan has been updated.");
                  setShowSwapModal(false);
                }}
                style={{ flex: 1, padding: "var(--sp-3)", background: "var(--sg)", color: "#fff", border: "none", borderRadius: "var(--r)", cursor: "pointer" }}
              >
                Use This Swap
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Disclaimer */}
      <p style={{ 
        fontSize: "var(--fs-2xs)", 
        color: "var(--mt)", 
        textAlign: "center", 
        marginTop: "var(--sp-4)",
        padding: "var(--sp-3)",
        background: "var(--warm)",
        borderRadius: "var(--r)"
      }}>
        ⚕️ These are general food suggestions, not a personalised diet plan. 
        Speak with a registered dietitian for individual advice.
      </p>
    </div>
  );
}