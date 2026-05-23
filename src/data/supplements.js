// data/foods.js

// Daily Supplements
export const SUPPS = [
  { name: "Folic Acid", dose: "400–600 mcg", time: "With breakfast", col: ["#E3F5EA", "#5A9E6E"], benefits: "Prevents neural tube defects. Essential in first trimester." },
  { name: "DHA / Omega-3", dose: "200–300 mg", time: "With largest meal", col: ["#E4EFF9", "#3A78C4"], benefits: "Supports baby's brain and eye development." },
  { name: "Iron (Ferrous Sulfate)", dose: "27 mg", time: "Morning + Vit C (orange juice)", col: ["#FDEEEC", "#D0524A"], benefits: "Prevents anaemia. Take with Vitamin C for absorption." },
  { name: "Vitamin D3", dose: "600–2000 IU", time: "With fatty meal (avocado, fish)", col: ["#FEF2E0", "#C87C30"], benefits: "Supports bone health and immune function." },
  { name: "Magnesium Glycinate", dose: "300–360 mg", time: "Bedtime", col: ["#EDE9F8", "#8B7EC8"], benefits: "Reduces leg cramps, improves sleep, eases constipation." },
  { name: "Calcium", dose: "1000 mg", time: "Split AM/PM", col: ["#F5F0E8", "#8B5E3C"], benefits: "Supports baby's bone development. Take 2 hours apart from iron." },
  { name: "Vitamin B6", dose: "25–50 mg", time: "With food", col: ["#E8F7EE", "#2E9E67"], benefits: "Helps reduce morning sickness and nausea." },
  { name: "Zinc", dose: "15–30 mg", time: "With food", col: ["#FDE8F0", "#D63A6E"], benefits: "Supports immune function and cell growth." }
];

// Pregnancy-Specific Meal Plans
export const FOODS = {
  morning: [
    { 
      e: "🥣", 
      name: "Akamu (Pap) with Akara", 
      b: "Fermented corn pudding with bean cakes. Excellent for sustained energy and protein.", 
      tags: ["Protein", "Energy", "Traditional"],
      nutrients: ["Protein 12g", "Iron 3mg", "Folate 150mcg"],
      prepTime: "15 mins"
    },
    { 
      e: "🥣", 
      name: "Moi Moi with Oats", 
      b: "Steamed bean pudding with blended oats. High in protein and folate.", 
      tags: ["High Protein", "Folate Rich", "Filling"],
      nutrients: ["Protein 18g", "Folate 200mcg", "Fiber 8g"],
      prepTime: "45 mins (soak beans overnight)"
    },
    { 
      e: "🍳", 
      name: "Scrambled Eggs with Ugu", 
      b: "Eggs with fluted pumpkin leaves. Fast, nutritious, iron-rich breakfast.", 
      tags: ["Quick", "Iron Rich", "Low Carb"],
      nutrients: ["Protein 14g", "Iron 4mg", "Vitamin A 200%"],
      prepTime: "10 mins"
    },
    { 
      e: "🌾", 
      name: "Oatmeal with Tiger Nuts (Aya)", 
      b: "Oats with ground tiger nuts and honey. High calcium, great for bones.", 
      tags: ["High Calcium", "Energy", "Fiber"],
      nutrients: ["Calcium 200mg", "Fiber 7g", "Iron 3mg"],
      prepTime: "10 mins"
    }
  ],
  afternoon: [
    { 
      e: "🍚", 
      name: "Jollof Rice with Grilled Fish", 
      b: "Tomato-based rice with tilapia. Rich in lycopene and omega-3s.", 
      tags: ["Omega-3", "Iron", "Balanced"],
      nutrients: ["Omega-3 1.2g", "Protein 25g", "Iron 4mg"],
      prepTime: "45 mins"
    },
    { 
      e: "🥣", 
      name: "Efo Riro (Spinach Stew) with Rice", 
      b: "Rich spinach and assorted meat stew. Excellent iron source for pregnancy.", 
      tags: ["Iron Rich", "Folate", "Traditional"],
      nutrients: ["Iron 8mg", "Folate 300mcg", "Protein 20g"],
      prepTime: "60 mins"
    },
    { 
      e: "🍲", 
      name: "Egusi Soup with Pounded Yam", 
      b: "Melon seed soup with leafy greens. High in zinc and healthy fats.", 
      tags: ["Zinc Rich", "Healthy Fats", "Comfort Food"],
      nutrients: ["Zinc 5mg", "Healthy Fats 15g", "Protein 18g"],
      prepTime: "60 mins"
    },
    { 
      e: "🥗", 
      name: "Okro Soup with Fish", 
      b: "Okra and fish soup. Great for digestion and iron absorption.", 
      tags: ["High Fiber", "Omega-3", "Easy Digestion"],
      nutrients: ["Fiber 6g", "Omega-3 1g", "Vitamin C 45mg"],
      prepTime: "35 mins"
    },
    { 
      e: "🍛", 
      name: "Brown Rice with Vegetable Stew", 
      b: "Brown rice with mixed vegetable and chicken stew. High in fiber and vitamins.", 
      tags: ["High Fiber", "Vitamins", "Balanced"],
      nutrients: ["Fiber 5g", "Vitamin A 180%", "Protein 22g"],
      prepTime: "50 mins"
    }
  ],
  evening: [
    { 
      e: "🍲", 
      name: "Ogbono Soup with Semovita", 
      b: "Wild mango seed soup. Rich in healthy fats and easy to digest.", 
      tags: ["Healthy Fats", "Comfort Food", "Easy Digestion"],
      nutrients: ["Healthy Fats 12g", "Fiber 4g", "Iron 3mg"],
      prepTime: "40 mins"
    },
    { 
      e: "🐟", 
      name: "Grilled Fish with Plantain", 
      b: "Grilled tilapia with fried or boiled plantain. Great protein source.", 
      tags: ["High Protein", "Potassium", "Light Meal"],
      nutrients: ["Protein 30g", "Potassium 900mg", "Omega-3 1.5g"],
      prepTime: "30 mins"
    },
    { 
      e: "🍛", 
      name: "Afang Soup with Swallow", 
      b: "Wild spinach and waterleaf soup. Excellent iron and fiber source.", 
      tags: ["Iron Rich", "High Fiber", "Traditional"],
      nutrients: ["Iron 7mg", "Fiber 8g", "Vitamin K 400%"],
      prepTime: "50 mins"
    },
    { 
      e: "🥘", 
      name: "Vegetable Fried Rice", 
      b: "Fried rice with mixed vegetables and chicken. Good for picky eaters.", 
      tags: ["Vegetables", "Balanced", "Family Meal"],
      nutrients: ["Vitamin A 120%", "Vitamin C 60mg", "Protein 18g"],
      prepTime: "40 mins"
    }
  ]
};

// Craving Intelligence Database
export const CRAVINGS = {
  chocolate: {
    deficiency: "Magnesium deficiency",
    food: "Dark chocolate (70%+), nuts, seeds, leafy greens, bananas",
    icon: "🍫",
    urgent: false
  },
  ice: {
    deficiency: "Iron deficiency (Pica - Pagophagia)",
    food: "Iron-rich foods: red meat, liver, spinach, lentils, iron supplements",
    icon: "🧊",
    urgent: true
  },
  clay: {
    deficiency: "Iron deficiency (Pica - Geophagia)",
    food: "SEEK MEDICAL HELP. This is pica from iron deficiency.",
    icon: "🏺",
    urgent: true
  },
  dirt: {
    deficiency: "Iron deficiency (Pica - Geophagia)",
    food: "SEEK MEDICAL HELP. This is pica from iron deficiency.",
    icon: "🌍",
    urgent: true
  },
  meat: {
    deficiency: "Protein or iron deficiency",
    food: "Lean red meat, chicken, fish, eggs, beans, lentils",
    icon: "🥩",
    urgent: false
  },
  salt: {
    deficiency: "Mineral deficiency",
    food: "Electrolytes, coconut water, mineral-rich foods, sea salt in moderation",
    icon: "🧂",
    urgent: false
  },
  sour: {
    deficiency: "Vitamin C or iron deficiency",
    food: "Oranges, tomatoes, bell peppers, strawberries, lemon water with iron",
    icon: "🍋",
    urgent: false
  },
  carbs: {
    deficiency: "Energy or B vitamin deficiency",
    food: "Complex carbs: brown rice, oats, beans, sweet potatoes, whole grains",
    icon: "🍞",
    urgent: false
  },
  sweet: {
    deficiency: "Blood sugar drop or chromium deficiency",
    food: "Fruit, dates, honey, balanced meals with protein",
    icon: "🍰",
    urgent: false
  },
  default: {
    deficiency: "Nutrient deficiency possible",
    food: "Listen to your body. Try a balanced meal with protein, healthy fats, and complex carbs.",
    icon: "🤔",
    urgent: false
  }
};

// Nigerian Cultural Foods Database
export const NIGERIAN_FOODS = {
  // Pregnancy Recommended
  pregnancy: {
    recommended: [
      "Efo Riro (Spinach stew) - Iron and folate rich",
      "Egusi Soup - Zinc and healthy fats",
      "Moi Moi - High protein and folate",
      "Tiger Nuts (Aya) - Calcium and iron",
      "Ugu Leaf (Pumpkin leaves) - Iron and vitamin A",
      "Okro Soup - Fiber and vitamin C",
      "Grilled Fish - Omega-3 fatty acids",
      "Brown Rice - Complex carbohydrates"
    ],
    avoid: [
      "Agbo (Herbal mixtures) - Unknown ingredients",
      "Zobo (Excessive) - May stimulate contractions",
      "Unripe Pawpaw - Contains latex",
      "Raw seafood - Risk of infection",
      "Unpasteurised dairy - Risk of listeria"
    ],
    tips: [
      "Add ugu leaf to everything - it's a Nigerian superfood",
      "Snack on tiger nuts (aya) for calcium and iron",
      "Drink coconut water for electrolytes",
      "Use moringa (zogale) powder in smoothies"
    ]
  },
  
  // TTC Recommended
  ttc: {
    recommended: [
      "Ugu Leaf - High in folate and iron",
      "Tiger Nuts (Aya) - High in vitamin E",
      "Garden eggs - Rich in antioxidants",
      "Avocado - Healthy fats for hormones",
      "Fish - Omega-3 for egg quality",
      "Eggs - Protein and vitamin D",
      "Pumpkin seeds - Zinc for fertility"
    ],
    avoid: [
      "Excessive alcohol",
      "High mercury fish (shark, swordfish)",
      "Agbo (Unknown herbal mixtures)",
      "Excessive soy products"
    ]
  },
  
  // Postpartum Recommended
  postpartum: {
    recommended: [
      "Oats - Milk supply booster",
      "Moringa (Zogale) - Increases milk production",
      "Fenugreek seeds - Galactagogue",
      "Ugu Leaf - Iron for blood loss recovery",
      "Lentils - Protein and iron",
      "Bone broth - Collagen for healing"
    ],
    breastfeedingTips: [
      "Drink 3-4L water daily for milk supply",
      "Oatmeal and moringa are traditional milk boosters",
      "Avoid peppery foods if baby seems fussy",
      "Eat every time you feed baby"
    ]
  }
};

// Journey-Specific Nutrition Tips
export const JOURNEY_NUTRITION = {
  pregnant: {
    t1: {
      title: "First Trimester (Weeks 1-13)",
      focus: "Folate, B6, ginger for nausea",
      foods: "Efo riro, lentils, ginger tea, crackers, small frequent meals",
      tips: "Eat small, frequent meals to manage nausea. Ginger tea and crackers help morning sickness."
    },
    t2: {
      title: "Second Trimester (Weeks 14-27)",
      focus: "Iron, calcium, protein",
      foods: "Lean meat, ugu leaf, tiger nuts, dairy, fish, eggs",
      tips: "Baby's bones are developing - increase calcium and vitamin D."
    },
    t3: {
      title: "Third Trimester (Weeks 28-40)",
      focus: "Omega-3, magnesium, hydration",
      foods: "Fish, nuts, seeds, coconut water, dates",
      tips: "Dates in last 4 weeks may help with labour. Stay hydrated."
    }
  },
  ttc: {
    title: "Fertility Boosting",
    focus: "Folate, zinc, antioxidants",
    foods: "Ugu leaf, garden eggs, tiger nuts, pumpkin seeds, berries",
    tips: "Start folic acid before conception. Avoid alcohol and smoking."
  },
  ivf: {
    title: "IVF Nutrition",
    focus: "Anti-inflammatory, Mediterranean style",
    foods: "Olive oil, fish, nuts, berries, leafy greens, avocado",
    tips: "Anti-inflammatory diet supports egg quality. Reduce processed foods."
  },
  nursing: {
    title: "Breastfeeding Nutrition",
    focus: "Hydration, protein, galactagogues",
    foods: "Oats, moringa, ugu leaf, fenugreek, water 3-4L daily",
    tips: "You need 400-500 extra calories daily. Eat when baby eats."
  },
  menopause: {
    title: "Menopause Nutrition",
    focus: "Calcium, vitamin D, phytoestrogens",
    foods: "Soy, flaxseeds, dairy or fortified alternatives, leafy greens",
    tips: "Calcium and vitamin D are critical for bone health now."
  }
};

// Helper function to get journey nutrition
export function getJourneyNutrition(journeyType, trimester = null) {
  if (journeyType === 'pregnant' && trimester) {
    return JOURNEY_NUTRITION.pregnant[`t${trimester}`];
  }
  return JOURNEY_NUTRITION[journeyType] || JOURNEY_NUTRITION.pregnant.t2;
}

// Helper function to analyze craving
export function analyzeCraving(cravingText) {
  const lowerText = cravingText.toLowerCase();
  for (const [key, value] of Object.entries(CRAVINGS)) {
    if (lowerText.includes(key)) {
      return value;
    }
  }
  return CRAVINGS.default;
}

// Helper function to get Nigerian food by category
export function getNigerianFoods(category) {
  return NIGERIAN_FOODS[category] || NIGERIAN_FOODS.pregnancy;
}

// Helper function to get meals by meal type and trimester
export function getMeals(mealType, trimester = 2) {
  let meals = [...FOODS[mealType]];
  
  // Filter or modify meals based on trimester
  if (trimester === 1) {
    meals = meals.filter(meal => 
      meal.name.includes("Ginger") || 
      meal.name.includes("Crackers") ||
      meal.name.includes("Moi Moi")
    );
  }
  
  return meals;
}