import { useState, useEffect, useMemo, useCallback } from 'react';
import { WCard, SectionTitle, Tag, Pill, IconBox } from '../../components/ui';
import { useApp } from '../../context/useApp';

export default function Nutrition() {
  const { journeyType, culture, getCurrentWeek, getTrimester, babyAgeDays, setShowSOS } = useApp();
  
  // Safe display values
  const currentWeek = getCurrentWeek();
  const trimester = getTrimester();
  const weekLabel = currentWeek ? `Week ${currentWeek}` : 'This Week';
  
  // State for user data
  const [mealLogs, setMealLogs] = useState([]);
  const [nutritionLogs, setNutritionLogs] = useState([]);
  const [userPreferences, setUserPreferences] = useState({});
  const [mealSwaps, setMealSwaps] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());
  
  // State for UI
  const [meal, setMeal] = useState("morning");
  const [supplements, setSupplements] = useState([]);
  const [craving, setCraving] = useState("");
  const [cravingResult, setCravingResult] = useState(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedMealItem, setSelectedMealItem] = useState(null);
  const [swapOption, setSwapOption] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load REAL user data from localStorage
  useEffect(() => {
    try {
      // Load meal history
      const savedMeals = localStorage.getItem('mealHistory');
      if (savedMeals) {
        setMealLogs(JSON.parse(savedMeals));
      }
      
      // Load nutrition logs
      const savedNutrition = localStorage.getItem('nutritionLogs');
      if (savedNutrition) {
        setNutritionLogs(JSON.parse(savedNutrition));
      }
      
      // Load user preferences
      const savedPrefs = localStorage.getItem('mealPreferences');
      if (savedPrefs) {
        setUserPreferences(JSON.parse(savedPrefs));
      }
      
      // Load saved swaps
      const savedSwaps = localStorage.getItem('mealSwaps');
      if (savedSwaps) {
        setMealSwaps(JSON.parse(savedSwaps));
      }
      
      // Load supplement tracking
      const savedSupps = localStorage.getItem('dailySupplements');
      if (savedSupps) {
        const suppData = JSON.parse(savedSupps);
        const today = new Date().toDateString();
        if (suppData.date === today) {
          setSupplements(suppData.taken);
        } else {
          setSupplements([]);
        }
      } else {
        setSupplements([]);
      }
    } catch (error) {
      console.error('Failed to load nutrition data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Save supplement state
  const saveSupplements = useCallback((updatedSupps) => {
    try {
      const data = {
        date: new Date().toDateString(),
        taken: updatedSupps
      };
      localStorage.setItem('dailySupplements', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save supplements:', error);
    }
  }, []);
  
  // Get today's meals from REAL logs
  const todaysMeals = useMemo(() => {
    return mealLogs.filter(log => log.date === selectedDate);
  }, [mealLogs, selectedDate]);
  
  // Get meals for current meal period
  const currentMeals = useMemo(() => {
    return todaysMeals.filter(m => m.mealType === meal);
  }, [todaysMeals, meal]);
  
  // Calculate nutritional insights from REAL data
  const nutritionalInsights = useMemo(() => {
    if (nutritionLogs.length === 0) return null;
    
    const recentLogs = nutritionLogs.slice(-7); // Last 7 days
    const avgCalories = recentLogs.reduce((sum, log) => sum + (log.calories || 0), 0) / recentLogs.length;
    const avgProtein = recentLogs.reduce((sum, log) => sum + (log.protein || 0), 0) / recentLogs.length;
    const avgIron = recentLogs.reduce((sum, log) => sum + (log.iron || 0), 0) / recentLogs.length;
    const avgCalcium = recentLogs.reduce((sum, log) => sum + (log.calcium || 0), 0) / recentLogs.length;
    
    return {
      avgCalories: Math.round(avgCalories),
      avgProtein: Math.round(avgProtein),
      avgIron: Math.round(avgIron * 10) / 10,
      avgCalcium: Math.round(avgCalcium),
      daysTracked: recentLogs.length
    };
  }, [nutritionLogs]);
  
  // Get user's most common foods
  const favoriteFoods = useMemo(() => {
    const foodCount = {};
    mealLogs.forEach(log => {
      log.items?.forEach(item => {
        foodCount[item.name] = (foodCount[item.name] || 0) + 1;
      });
    });
    
    return Object.entries(foodCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);
  }, [mealLogs]);
  
  // Check for nutritional gaps based on REAL data
  const nutritionalGaps = useMemo(() => {
    if (!nutritionalInsights) return [];
    
    const gaps = [];
    
    if (journeyType === 'pregnant') {
      if (nutritionalInsights.avgIron < 27) {
        gaps.push({
          nutrient: "Iron",
          current: nutritionalInsights.avgIron,
          target: 27,
          message: "Iron is crucial for baby's development",
          foods: "lean red meat, spinach, lentils"
        });
      }
      if (nutritionalInsights.avgCalcium < 1000) {
        gaps.push({
          nutrient: "Calcium",
          current: nutritionalInsights.avgCalcium,
          target: 1000,
          message: "Baby's bones are developing",
          foods: "milk, yogurt, cheese, fortified alternatives"
        });
      }
    }
    
    if (nutritionalInsights.avgProtein < 70) {
      gaps.push({
        nutrient: "Protein",
        current: nutritionalInsights.avgProtein,
        target: 70,
        message: "Essential for tissue growth",
        foods: "eggs, chicken, fish, beans"
      });
    }
    
    return gaps;
  }, [nutritionalInsights, journeyType]);
  
  // Get meal suggestions based on user's preferences and history
  const getMealSuggestions = useCallback(() => {
    if (favoriteFoods.length === 0) {
      return [{
        name: "Log your first meal",
        description: "Start tracking what you eat to get personalized suggestions",
        suggestion: true
      }];
    }
    
    // Suggest variations of favorite foods
    return favoriteFoods.map(food => ({
      name: `Try ${food} with a twist`,
      description: `Based on your love for ${food}, consider adding vegetables or changing the preparation method`,
      basedOn: food
    }));
  }, [favoriteFoods]);
  
  // Handle craving analysis with REAL context
  const analyseCraving = useCallback(() => {
    if (!craving.trim()) return;
    
    // Check against user's actual deficiencies
    const matchingGap = nutritionalGaps.find(gap => 
      craving.toLowerCase().includes(gap.nutrient.toLowerCase())
    );
    
    if (matchingGap) {
      setCravingResult({
        deficiency: `You might need more ${matchingGap.nutrient}`,
        food: matchingGap.foods,
        urgent: matchingGap.nutrient === "Iron" && matchingGap.current < 15,
        basedOnData: true
      });
    } else if (nutritionalInsights && nutritionalInsights.daysTracked < 3) {
      setCravingResult({
        deficiency: "Not enough data yet",
        food: "Log more meals to see personalized insights",
        urgent: false,
        basedOnData: false
      });
    } else {
      setCravingResult({
        deficiency: "Track your meals for 7 days",
        food: "We'll analyze patterns in your cravings",
        urgent: false,
        basedOnData: false
      });
    }
    
    if (cravingResult?.urgent && setShowSOS) {
      setShowSOS(true);
    }
  }, [craving, nutritionalGaps, nutritionalInsights, cravingResult, setShowSOS]);
  
  // Handle meal swap with REAL persistence
  const handleSwapMeal = useCallback((mealItem) => {
    setSelectedMealItem(mealItem);
    setSwapOption({
      name: `Alternative to ${mealItem.name}`,
      nutrients: "Based on your preferences",
      prep: "Try a different preparation method"
    });
    setShowSwapModal(true);
  }, []);
  
  // Apply swap to REAL data
  const handleApplySwap = useCallback(() => {
    if (selectedMealItem && swapOption) {
      try {
        const updatedSwaps = {
          ...mealSwaps,
          [selectedMealItem.name]: {
            ...swapOption,
            date: new Date().toISOString(),
            originalMeal: selectedMealItem.name
          }
        };
        localStorage.setItem('mealSwaps', JSON.stringify(updatedSwaps));
        setMealSwaps(updatedSwaps);
      } catch (error) {
        console.error('Failed to save meal swap:', error);
      }
    }
    setShowSwapModal(false);
  }, [selectedMealItem, swapOption, mealSwaps]);
  
  // Log a new meal
  const logMeal = useCallback((mealData) => {
    try {
      const newMeal = {
        id: Date.now(),
        date: selectedDate,
        timestamp: new Date().toISOString(),
        ...mealData
      };
      
      const updatedLogs = [...mealLogs, newMeal];
      setMealLogs(updatedLogs);
      localStorage.setItem('mealHistory', JSON.stringify(updatedLogs));
    } catch (error) {
      console.error('Failed to log meal:', error);
    }
  }, [mealLogs, selectedDate]);
  
  // Toggle supplement
  const toggleSupplement = useCallback((index) => {
    const updated = [...supplements];
    updated[index] = !updated[index];
    setSupplements(updated);
    saveSupplements(updated);
  }, [supplements, saveSupplements]);
  
  if (isLoading) {
    return (
      <div className="page-pad">
        <div style={{ textAlign: "center", padding: "var(--sp-8)" }}>
          Loading your nutrition data...
        </div>
      </div>
    );
  }
  
  return (
    <div className="page-pad">
      <SectionTitle title="🥗 Nutrition" subtitle="Personalized from your tracked data" />

      {/* Real Data Summary */}
      {nutritionalInsights && nutritionalInsights.daysTracked > 0 ? (
        <WCard style={{ marginBottom: "var(--gap-md)", background: "var(--lvl)" }}>
          <p style={{ fontWeight: 800, marginBottom: "var(--sp-2)" }}>📊 Your 7-Day Nutrition</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "var(--gap-sm)" }}>
            <div>
              <p style={{ fontSize: "var(--fs-2xs)", color: "var(--mt)" }}>Avg Calories</p>
              <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800 }}>{nutritionalInsights.avgCalories}</p>
            </div>
            <div>
              <p style={{ fontSize: "var(--fs-2xs)", color: "var(--mt)" }}>Protein (g)</p>
              <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800 }}>{nutritionalInsights.avgProtein}</p>
            </div>
            <div>
              <p style={{ fontSize: "var(--fs-2xs)", color: "var(--mt)" }}>Iron (mg)</p>
              <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800 }}>{nutritionalInsights.avgIron}</p>
            </div>
          </div>
        </WCard>
      ) : (
        <WCard style={{ marginBottom: "var(--gap-md)", textAlign: "center" }}>
          <p>📝 No nutrition data yet</p>
          <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>Start logging your meals to see personalized insights</p>
        </WCard>
      )}

      {/* Nutritional Gaps - Based on REAL data */}
      {nutritionalGaps.length > 0 && (
        <WCard style={{ marginBottom: "var(--gap-md)", background: "var(--warm)", border: "1px solid var(--border2)" }}>
          <p style={{ fontWeight: 800, marginBottom: "var(--sp-2)" }}>⚠️ Nutritional Gaps Detected</p>
          {nutritionalGaps.map((gap, i) => (
            <div key={i} style={{ marginBottom: "var(--sp-3)" }}>
              <p style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>
                Low {gap.nutrient}: {gap.current}/{gap.target} {gap.nutrient === "Iron" ? "mg" : "g"}
              </p>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>{gap.message}</p>
              <Tag label={`Eat: ${gap.foods}`} bg="var(--sgl)" tc="var(--sg)" />
            </div>
          ))}
        </WCard>
      )}

      {/* Today's Meals - REAL data */}
      <SectionTitle title={`📅 ${new Date(selectedDate).toLocaleDateString()}`} />
      <div style={{ display: "flex", gap: "var(--gap-sm)", marginBottom: "var(--sp-4)", overflowX: "auto" }}>
        {["morning", "afternoon", "evening", "snacks"].map(m => (
          <Pill 
            key={m} 
            label={m === "morning" ? "🌅 Breakfast" : m === "afternoon" ? "☀️ Lunch" : m === "evening" ? "🌙 Dinner" : "🍎 Snacks"} 
            active={meal === m} 
            onClick={() => setMeal(m)} 
          />
        ))}
      </div>
      
      {currentMeals.length > 0 ? (
        currentMeals.map((mealItem, i) => (
          <WCard key={i} style={{ padding: "var(--card-p)", marginBottom: "var(--gap-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontWeight: 800 }}>{mealItem.name}</p>
                <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>{mealItem.description}</p>
                {mealItem.nutrients && (
                  <div style={{ display: "flex", gap: "var(--gap-sm)", marginTop: "var(--sp-2)" }}>
                    {Object.entries(mealItem.nutrients).map(([key, value]) => (
                      <Tag key={key} label={`${key}: ${value}`} bg="var(--sgl)" tc="var(--sg)" />
                    ))}
                  </div>
                )}
              </div>
              <button 
                onClick={() => handleSwapMeal(mealItem)}
                style={{ background: "var(--warm)", border: "none", borderRadius: 20, padding: "4px 12px", cursor: "pointer" }}
              >
                🔄 Swap
              </button>
            </div>
          </WCard>
        ))
      ) : (
        <WCard style={{ textAlign: "center", padding: "var(--sp-6)" }}>
          <p>No meals logged for {meal}</p>
          <button 
            onClick={() => {/* Open meal logging modal */}}
            style={{ marginTop: "var(--sp-3)", padding: "var(--sp-2) var(--sp-4)", background: "var(--dp)", color: "#fff", border: "none", borderRadius: "var(--r)", cursor: "pointer" }}
          >
            + Log a Meal
          </button>
        </WCard>
      )}

      {/* AI Suggestions Based on REAL Data */}
      {favoriteFoods.length > 0 && (
        <>
          <SectionTitle title="💡 Based on Your Eating Patterns" />
          <div style={{ display: "flex", gap: "var(--gap-md)", overflowX: "auto", paddingBottom: "var(--sp-2)" }}>
            {getMealSuggestions().map((suggestion, i) => (
              <WCard key={i} style={{ minWidth: 200 }}>
                <p style={{ fontWeight: 800, fontSize: "var(--fs-sm)" }}>{suggestion.name}</p>
                <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginTop: "var(--sp-1)" }}>
                  {suggestion.description}
                </p>
                {suggestion.basedOn && (
                  <Tag label={`Based on: ${suggestion.basedOn}`} bg="var(--lvl)" tc="var(--mt)" />
                )}
              </WCard>
            ))}
          </div>
        </>
      )}

      {/* Craving Intelligence - Using REAL data */}
      <SectionTitle title="🍫 Craving Check" />
      <WCard style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginBottom: "var(--sp-3)" }}>
          {nutritionalInsights?.daysTracked > 0 
            ? "Based on your tracked nutrition patterns" 
            : "Log meals for 7 days to see personalized insights"}
        </p>
        <div style={{ display: "flex", gap: "var(--gap-sm)" }}>
          <input 
            value={craving} 
            onChange={e => setCraving(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && analyseCraving()}
            placeholder="What are you craving?" 
            className="form-input" 
            style={{ flex: 1 }}
          />
          <button 
            onClick={analyseCraving}
            style={{ padding: "0 var(--sp-4)", background: "var(--dp)", color: "#fff", border: "none", borderRadius: "var(--r)", cursor: "pointer" }}
          >
            Check
          </button>
        </div>
        {cravingResult && (
          <div style={{ marginTop: "var(--sp-3)", padding: "var(--sp-3)", background: "var(--lvl)", borderRadius: "var(--r)" }}>
            <p style={{ fontWeight: 700 }}>{cravingResult.deficiency}</p>
            <p style={{ fontSize: "var(--fs-sm)" }}>💡 {cravingResult.food}</p>
            {cravingResult.basedOnData && (
              <Tag label="Based on your data" bg="var(--sgl)" tc="var(--sg)" />
            )}
          </div>
        )}
      </WCard>

      {/* Swap Modal */}
      {showSwapModal && swapOption && (
        <div
          style={{
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
          }}
          onClick={e => e.target === e.currentTarget && setShowSwapModal(false)}
          onKeyDown={e => e.key === 'Escape' && setShowSwapModal(false)}
          role="dialog"
        >
          <div style={{ background: "var(--card)", borderRadius: "var(--r2)", maxWidth: 400, width: "100%", padding: "var(--sp-5)" }}>
            <h3 style={{ marginBottom: "var(--sp-3)" }}>Swap {selectedMealItem?.name}</h3>
            <div style={{ marginBottom: "var(--sp-4)" }}>
              <p style={{ fontWeight: 700 }}>{swapOption.name}</p>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>{swapOption.prep}</p>
            </div>
            <div style={{ display: "flex", gap: "var(--gap-md)" }}>
              <button onClick={() => setShowSwapModal(false)} style={{ flex: 1, padding: "var(--sp-3)" }}>
                Cancel
              </button>
              <button onClick={handleApplySwap} style={{ flex: 1, padding: "var(--sp-3)", background: "var(--sg)", color: "#fff", border: "none", borderRadius: "var(--r)" }}>
                Save Swap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}