// src/utils/dietaryFilters.js

/**
 * Check if a specific food item is allowed based on dietary practices
 * @param {string} food - The food item to check (e.g., "beef", "pork", "chicken")
 * @param {Array} dietaryPractices - Array of dietary restrictions (e.g., ['Halal', 'No pork', 'Vegetarian'])
 * @returns {boolean} - True if the food is allowed, false otherwise
 */
export const isFoodAllowed = (food, dietaryPractices) => {
  if (!dietaryPractices || dietaryPractices.length === 0) {
    return true; // No restrictions, everything is allowed
  }

  const foodLower = food.toLowerCase();
  
  // Check each dietary practice
  for (const practice of dietaryPractices) {
    switch (practice.toLowerCase()) {
      case 'halal':
        // Halal doesn't allow pork, alcohol, or improperly slaughtered meat
        if (foodLower.includes('pork') || 
            foodLower.includes('ham') || 
            foodLower.includes('bacon') ||
            foodLower.includes('alcohol') ||
            foodLower.includes('wine') ||
            foodLower.includes('beer')) {
          return false;
        }
        break;
        
      case 'kosher':
        // Kosher doesn't allow pork, shellfish, or mixing meat and dairy
        if (foodLower.includes('pork') || 
            foodLower.includes('shellfish') ||
            foodLower.includes('shrimp') ||
            foodLower.includes('crab') ||
            foodLower.includes('lobster')) {
          return false;
        }
        break;
        
      case 'no pork':
        if (foodLower.includes('pork') || 
            foodLower.includes('ham') || 
            foodLower.includes('bacon') ||
            foodLower.includes('sausage') && foodLower.includes('pork')) {
          return false;
        }
        break;
        
      case 'no beef':
        if (foodLower.includes('beef') || 
            foodLower.includes('steak') ||
            foodLower.includes('burger') && !foodLower.includes('veggie')) {
          return false;
        }
        break;
        
      case 'vegetarian':
        // No meat, poultry, or fish
        const meatKeywords = ['chicken', 'beef', 'pork', 'fish', 'lamb', 'goat', 'turkey', 
                              'duck', 'meat', 'steak', 'burger', 'sausage', 'bacon', 'ham',
                              'salmon', 'tuna', 'shrimp', 'crab', 'lobster'];
        for (const keyword of meatKeywords) {
          if (foodLower.includes(keyword)) {
            return false;
          }
        }
        break;
        
      case 'vegan':
        // No animal products at all
        const animalKeywords = ['chicken', 'beef', 'pork', 'fish', 'lamb', 'goat', 'turkey',
                                'duck', 'meat', 'steak', 'burger', 'sausage', 'bacon', 'ham',
                                'salmon', 'tuna', 'shrimp', 'crab', 'lobster', 'milk', 'cheese',
                                'yogurt', 'butter', 'cream', 'egg', 'honey'];
        for (const keyword of animalKeywords) {
          if (foodLower.includes(keyword)) {
            return false;
          }
        }
        break;
        
      case 'no alcohol':
        if (foodLower.includes('alcohol') || 
            foodLower.includes('wine') || 
            foodLower.includes('beer') ||
            foodLower.includes('liquor') ||
            foodLower.includes('spirit')) {
          return false;
        }
        break;
        
      default:
        // Unknown practice, allow by default
        break;
    }
  }
  
  return true;
};

/**
 * Parse a food string into an array of individual food items
 * @param {string} foodString - Comma-separated list of foods (e.g., "beans, lentils, chicken")
 * @returns {Array} - Array of individual food items trimmed
 */
export const parseFoodString = (foodString) => {
  if (!foodString) return [];
  
  // Split by commas, trim whitespace, and filter out empty strings
  return foodString.split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
};

/**
 * Filter a list of foods to only those allowed by dietary practices
 * @param {Array} foods - Array of food items
 * @param {Array} dietaryPractices - Array of dietary restrictions
 * @returns {Array} - Array of allowed foods
 */
export const filterAllowedFoods = (foods, dietaryPractices) => {
  if (!foods || foods.length === 0) return [];
  if (!dietaryPractices || dietaryPractices.length === 0) return foods;
  
  return foods.filter(food => isFoodAllowed(food, dietaryPractices));
};

/**
 * Get alternative food suggestions based on dietary restrictions
 * @param {string} food - The original food item
 * @param {Array} dietaryPractices - Array of dietary restrictions
 * @returns {Array} - Array of alternative food suggestions
 */
export const getFoodAlternatives = (food, dietaryPractices) => {
  const foodLower = food.toLowerCase();
  const alternatives = {
    beef: ['lentils', 'mushrooms', 'beans', 'tofu', 'tempeh', 'seitan'],
    pork: ['chicken', 'turkey', 'tofu', 'tempeh', 'beans', 'lentils', 'mushrooms'],
    chicken: ['tofu', 'tempeh', 'beans', 'lentils', 'mushrooms', 'seitan', 'jackfruit'],
    fish: ['tofu', 'beans', 'lentils', 'chickpeas', 'nuts', 'seeds', 'tempeh'],
    milk: ['soy milk', 'oat milk', 'almond milk', 'coconut milk', 'rice milk'],
    cheese: ['nutritional yeast', 'vegan cheese', 'tofu-based alternatives', 'cashew cheese'],
    eggs: ['tofu scramble', 'mashed bananas', 'flax eggs', 'chickpea flour', 'aquafaba'],
    yogurt: ['coconut yogurt', 'soy yogurt', 'almond yogurt', 'oat yogurt'],
    butter: ['coconut oil', 'vegan butter', 'olive oil', 'avocado']
  };
  
  // Find matching food category
  let category = null;
  for (const [key, value] of Object.entries(alternatives)) {
    if (foodLower.includes(key)) {
      category = key;
      break;
    }
  }
  
  if (!category) return ['beans', 'lentils', 'tofu', 'nuts', 'seeds', 'vegetables'];
  
  // Filter alternatives based on dietary practices
  const baseAlternatives = alternatives[category];
  return filterAllowedFoods(baseAlternatives, dietaryPractices);
};

/**
 * Check if a meal suggestion is compatible with dietary practices
 * @param {Object} suggestion - Meal suggestion object with name and ingredients
 * @param {Array} dietaryPractices - Array of dietary restrictions
 * @returns {boolean} - True if the meal is compatible
 */
export const isMealCompatible = (suggestion, dietaryPractices) => {
  if (!suggestion || !suggestion.name) return true;
  if (!dietaryPractices || dietaryPractices.length === 0) return true;
  
  const mealLower = suggestion.name.toLowerCase();
  const ingredientsLower = suggestion.ingredients ? 
    suggestion.ingredients.join(' ').toLowerCase() : '';
  
  const combinedText = mealLower + ' ' + ingredientsLower;
  
  // Check for restricted ingredients
  for (const practice of dietaryPractices) {
    switch (practice.toLowerCase()) {
      case 'vegetarian':
        if (/(chicken|beef|pork|fish|lamb|goat|turkey|duck|meat|steak|burger|sausage|bacon|ham|salmon|tuna|shrimp|crab|lobster)/.test(combinedText)) {
          return false;
        }
        break;
        
      case 'vegan':
        if (/(chicken|beef|pork|fish|lamb|goat|turkey|duck|meat|steak|burger|sausage|bacon|ham|salmon|tuna|shrimp|crab|lobster|milk|cheese|yogurt|butter|cream|egg|honey)/.test(combinedText)) {
          return false;
        }
        break;
        
      case 'halal':
        if (/(pork|ham|bacon|alcohol|wine|beer)/.test(combinedText)) {
          return false;
        }
        break;
        
      case 'kosher':
        if (/(pork|shellfish|shrimp|crab|lobster)/.test(combinedText)) {
          return false;
        }
        break;
        
      case 'no pork':
        if (/(pork|ham|bacon)/.test(combinedText)) {
          return false;
        }
        break;
        
      case 'no beef':
        if (/(beef|steak)/.test(combinedText)) {
          return false;
        }
        break;
        
      default:
        break;
    }
  }
  
  return true;
};