export const FOODS = {
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

export const SUPPS = [
  { name: "Folic Acid", dose: "400–600 mcg", time: "With breakfast", col: ["#E3F5EA", "#5A9E6E"] },
  { name: "DHA / Omega-3", dose: "200–300 mg", time: "With largest meal", col: ["#E4EFF9", "#3A78C4"] },
  { name: "Iron (Ferrous Sulfate)", dose: "27 mg", time: "Morning + Vit C", col: ["#FDEEEC", "#D0524A"] },
  { name: "Vitamin D3", dose: "600–2000 IU", time: "With fatty meal", col: ["#FEF2E0", "#C87C30"] },
  { name: "Magnesium Glycinate", dose: "300–360 mg", time: "Bedtime", col: ["#EDE9F8", "#8B7EC8"] },
  { name: "Calcium", dose: "1000 mg", time: "Split AM/PM", col: ["#F5F0E8", "#8B5E3C"] },
];

export const CRAVINGS = {
  chocolate: { deficiency: "Magnesium", food: "Tiger Nuts (Aya), Egusi, Dark Vegetables", icon: "🟤" },
  ice: { deficiency: "Iron (Pica)", food: "Iron supplement + Efo Riro, Moi Moi", icon: "🧊", urgent: true },
  clay: { deficiency: "Iron/Zinc (Pica)", food: "Iron + Zinc supplement. See doctor urgently.", icon: "🟫", urgent: true },
  salt: { deficiency: "Sodium / Electrolytes", food: "Coconut water, Bone broth, Groundnut soup", icon: "🧂" },
  sour: { deficiency: "Vitamin C", food: "Orange, Lime, Tomatoes, Zobo", icon: "🍋" },
  meat: { deficiency: "Protein / Iron", food: "Fish, Eggs, Beans, Chicken, Sardines", icon: "🥩" },
  default: { deficiency: "Possibly normal craving", food: "Consult your nutritionist if cravings are intense or unusual.", icon: "🤰" },
};
