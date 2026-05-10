export const JOURNEY_CONFIG = {
  pregnant: {
    tabs: ["assistant", "kicks", "nutrition", "vitals", "health", "baby", "mental", "partner", "chat", "safety"],
    pills: [
      { dot: "var(--t)", label: "Week 24 · 2nd Trimester", bg: "var(--gdl)" },
      { dot: "var(--sg)", label: "3/6 supplements ✓", bg: "var(--sgl)" },
      { dot: "var(--lv)", label: "Baby: 600g 🌽", bg: "var(--lvl)" },
    ],
    greeting: "Mama",
    taskIds: ["iron", "water", "vitals", "kicks", "meal", "walk"],
    quickActions: [
      ["📷", "Scan Drug", "health", "var(--bll)", "var(--bl)"],
      ["🥗", "Eat Today", "nutrition", "var(--sgl)", "var(--sg)"],
      ["👶", "Kicks", "kicks", "var(--lvl)", "var(--lv)"],
      ["🚨", "SOS", null, "var(--rdl)", "var(--rd)"],
    ],
    showAlert: true,
  },
  conceive: {
    tabs: ["assistant", "ttc", "nutrition", "vitals", "health", "mental", "chat", "safety"],
    pills: [
      { dot: "var(--lv)", label: "Cycle Day 14 · Ovulation", bg: "var(--lvl)" },
      { dot: "var(--sg)", label: "Folic acid ✓", bg: "var(--sgl)" },
      { dot: "var(--t)", label: "Fertile Window 🌸", bg: "var(--gdl)" },
    ],
    greeting: "Mama",
    taskIds: ["water", "vitals", "meal", "walk"],
    quickActions: [
      ["📷", "Scan Drug", "health", "var(--bll)", "var(--bl)"],
      ["🥗", "Nutrition", "nutrition", "var(--sgl)", "var(--sg)"],
      ["❤️", "Vitals", "vitals", "var(--rdl)", "var(--rd)"],
      ["🚨", "SOS", null, "var(--rdl)", "var(--rd)"],
    ],
    showAlert: false,
  },
  mom: {
    tabs: ["assistant", "nursing", "nutrition", "vitals", "health", "baby", "mental", "partner", "chat", "safety"],
    pills: [
      { dot: "var(--t)", label: "Week 6 Postpartum", bg: "var(--gdl)" },
      { dot: "var(--sg)", label: "Breastfeeding · Day 42", bg: "var(--sgl)" },
      { dot: "var(--lv)", label: "Recovery: On track 💪", bg: "var(--lvl)" },
    ],
    greeting: "Mama",
    taskIds: ["iron", "water", "vitals", "meal", "walk"],
    quickActions: [
      ["📷", "Scan Drug", "health", "var(--bll)", "var(--bl)"],
      ["🥗", "Eat Today", "nutrition", "var(--sgl)", "var(--sg)"],
      ["💚", "Mind", "mental", "var(--lvl)", "var(--lv)"],
      ["🚨", "SOS", null, "var(--rdl)", "var(--rd)"],
    ],
    showAlert: false,
  },
  menopause: {
    tabs: ["assistant", "vitals", "mental", "chat", "safety"],
    pills: [
      { dot: "var(--lv)", label: "Cycle Tracking · Active", bg: "var(--lvl)" },
      { dot: "var(--sg)", label: "Mood Log · 3 day streak", bg: "var(--sgl)" },
      { dot: "var(--t)", label: "Vitals: Normal range", bg: "var(--gdl)" },
    ],
    greeting: "Queen",
    taskIds: ["water", "vitals", "walk"],
    quickActions: [
      ["❤️", "Vitals", "vitals", "var(--rdl)", "var(--rd)"],
      ["💚", "Mind", "mental", "var(--lvl)", "var(--lv)"],
      ["💬", "Chat", "chat", "var(--bll)", "var(--bl)"],
      ["🚨", "SOS", null, "var(--rdl)", "var(--rd)"],
    ],
    showAlert: false,
  },
};
