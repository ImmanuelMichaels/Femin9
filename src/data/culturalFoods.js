// src/data/culturalFoods.js
export const CULTURAL_FOODS = {
  "west_central_african": {
    name: "West & Central African",
    breakfast: [
      { name: "Moi Moi", description: "Steamed bean pudding rich in protein and folate", nutrients: ["Protein", "Folate", "Iron"] },
      { name: "Koko with Koose", description: "Millet porridge with bean cakes", nutrients: ["Fiber", "Iron", "B Vitamins"] },
      { name: "Pap with Groundnuts", description: "Fermented corn porridge with groundnut paste", nutrients: ["Calcium", "Protein"] }
    ],
    lunch: [
      { name: "Jollof Rice with Fish", description: "Tomato-based rice with grilled fish", nutrients: ["Lycopene", "Omega-3", "Iron"] },
      { name: "Egusi Soup with Pounded Yam", description: "Melon seed soup with leafy greens", nutrients: ["Zinc", "Vitamin A", "Protein"] },
      { name: "Okro Soup", description: "Okra and fish soup - good for iron absorption", nutrients: ["Vitamin C", "Folate", "Fiber"] }
    ],
    dinner: [
      { name: "Plantain and Fish Stew", description: "Ripe plantain with tomato fish stew", nutrients: ["Potassium", "Vitamin B6", "Omega-3"] },
      { name: "Efo Riro", description: "Spinach and assorted meat stew", nutrients: ["Iron", "Vitamin K", "Protein"] },
      { name: "Fufu and Light Soup", description: "Cassava fufu with tomato and fish soup", nutrients: ["Vitamin C", "Protein", "Iron"] }
    ],
    snacks: [
      { name: "Roasted Plantain (Boli)", description: "High in potassium and vitamin B6", nutrients: ["Potassium", "Vitamin B6", "Fiber"] },
      { name: "Groundnuts", description: "Rich in healthy fats and protein", nutrients: ["Vitamin E", "Magnesium", "Protein"] },
      { name: "Coconut Candy", description: "Natural energy boost", nutrients: ["Healthy Fats", "Fiber"] }
    ],
    pregnancy: {
      recommended: ["Egusi soup (iron-rich)", "Efo riro (folate)", "Fish stew (omega-3)"],
      avoid: ["Unpasteurized local cheese", "Excess palm oil", "Raw seafood"]
    }
  },
  
  "east_african": {
    name: "East African",
    breakfast: [
      { name: "Ugali with Sukuma Wiki", description: "Maize meal with collard greens", nutrients: ["Iron", "Vitamin K", "Fiber"] },
      { name: "Chapati and Tea", description: "Whole wheat flatbread with spiced milk tea", nutrients: ["Calcium", "Iron", "B Vitamins"] },
      { name: "Mandazi", description: "Coconut milk donuts - energy boosting", nutrients: ["Carbohydrates", "Healthy Fats"] }
    ],
    lunch: [
      { name: "Nyama Choma with Kachumbari", description: "Grilled meat with tomato-onion salad", nutrients: ["Protein", "Vitamin C", "Iron"] },
      { name: "Injera with Lentils", description: "Fermented teff flatbread with lentil stew", nutrients: ["Iron", "Protein", "Fiber"] },
      { name: "Mukimo", description: "Mashed potatoes with pumpkin leaves and corn", nutrients: ["Vitamin A", "Potassium", "Fiber"] }
    ],
    dinner: [
      { name: "Pilau Rice", description: "Spiced rice with meat or vegetables", nutrients: ["B Vitamins", "Iron", "Protein"] },
      { name: "Fish Curry with Coconut", description: "Freshwater fish in coconut sauce", nutrients: ["Omega-3", "Healthy Fats", "Protein"] }
    ]
  },
  
  "south_asian": {
    name: "South Asian",
    breakfast: [
      { name: "Dal Chilla", description: "Lentil crepe with vegetables", nutrients: ["Protein", "Folate", "Iron"] },
      { name: "Poha", description: "Flattened rice with peanuts and turmeric", nutrients: ["Iron", "B12", "Antioxidants"] }
    ],
    lunch: [
      { name: "Chana Masala with Roti", description: "Chickpea curry with whole wheat bread", nutrients: ["Folate", "Iron", "Fiber"] },
      { name: "Palak Paneer", description: "Spinach and cottage cheese curry", nutrients: ["Iron", "Calcium", "Vitamin K"] }
    ],
    pregnancy: {
      recommended: ["Fenugreek seeds (boost milk supply)", "Ghee (healthy fats)", "Dates (natural energy)"],
      avoid: ["Raw papaya", "Excess sesame seeds", "Unpasteurized paneer"]
    }
  },
  
  "caribbean": {
    name: "Caribbean",
    breakfast: [
      { name: "Callaloo with Dumplings", description: "Amaranth greens with fried dough", nutrients: ["Iron", "Vitamin A", "Fiber"] },
      { name: "Green Banana Porridge", description: "Creamy plantain breakfast with spices", nutrients: ["Potassium", "Resistant Starch"] }
    ],
    lunch: [
      { name: "Rice and Peas with Stew Chicken", description: "Kidney bean rice with chicken", nutrients: ["Protein", "Iron", "Fiber"] },
      { name: "Ackee and Saltfish", description: "Jamaica's national dish with nutrients", nutrients: ["Protein", "Healthy Fats"] }
    ]
  },
  
  "default": {
    name: "General (NHS Eatwell Guide)",
    breakfast: [
      { name: "Porridge with Berries", description: "Oats with antioxidant-rich berries", nutrients: ["Fiber", "Vitamin C", "Iron"] },
      { name: "Greek Yogurt with Honey", description: "Probiotic-rich with natural sweetness", nutrients: ["Calcium", "Protein", "Probiotics"] }
    ],
    lunch: [
      { name: "Grilled Chicken Salad", description: "Lean protein with mixed greens", nutrients: ["Protein", "Vitamins", "Healthy Fats"] },
      { name: "Lentil Soup with Whole Grain Bread", description: "Fiber-rich and filling", nutrients: ["Folate", "Iron", "Fiber"] }
    ],
    dinner: [
      { name: "Salmon with Quinoa and Roasted Veg", description: "Omega-3 rich meal", nutrients: ["Omega-3", "Protein", "Fiber"] },
      { name: "Bean and Vegetable Chilli", description: "Plant-based protein powerhouse", nutrients: ["Fiber", "Iron", "Protein"] }
    ]
  }
};

export const getCulturalMeal = (culture, mealType, journeyType) => {
  const culturalData = CULTURAL_FOODS[culture] || CULTURAL_FOODS.default;
  
  if (journeyType && culturalData[journeyType]) {
    return culturalData[journeyType];
  }
  
  return {
    breakfast: culturalData.breakfast,
    lunch: culturalData.lunch,
    dinner: culturalData.dinner,
    snacks: culturalData.snacks || []
  };
};