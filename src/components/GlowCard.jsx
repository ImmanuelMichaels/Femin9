// src/components/GlowCard.jsx
import { useState, useEffect } from 'react';
import { WCard } from './ui';
import { GLOW_CONTENT } from '../data/glowContent';

export default function GlowCard({ journeyType, cycleDay, trimester, postnatalDay }) {
  const [currentTip, setCurrentTip] = useState(null);
  
  useEffect(() => {
    const content = GLOW_CONTENT[journeyType];
    if (!content) return;
    
    let phase = "";
    if (journeyType === "pregnant") {
      phase = trimester === 1 ? "t1" : trimester === 2 ? "t2" : "t3";
    } else if (journeyType === "postpartum") {
      phase = postnatalDay <= 14 ? "days1_14" : postnatalDay <= 42 ? "weeks2_6" : "weeks6_plus";
    } else if (journeyType === "ttc") {
      phase = cycleDay?.isFertile ? "fertileWindow" : "other";
    } else if (journeyType === "menstrual") {
      phase = cycleDay?.phase || "follicular";
    }
    
    const tips = content[phase] || content.default;
    const randomIndex = Math.floor(Math.random() * tips.length);
    setCurrentTip(tips[randomIndex]);
    
    // Rotate daily
    const interval = setInterval(() => {
      const newIndex = Math.floor(Math.random() * tips.length);
      setCurrentTip(tips[newIndex]);
    }, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [journeyType, trimester, postnatalDay, cycleDay]);
  
  if (!currentTip) return null;
  
  const glowConfig = {
    ttc: { bg: "linear-gradient(135deg, #FFF0F5, #FFE4E8)", accent: "#D63A6E", icon: "🌸" },
    pregnant: { bg: "linear-gradient(135deg, #FFF5E6, #FFEFD6)", accent: "#E57C1A", icon: "🤰" },
    ivf: { bg: "linear-gradient(135deg, #F0EEFF, #E8E4F8)", accent: "#9B8FD8", icon: "💜" },
    postpartum: { bg: "linear-gradient(135deg, #E8F7EE, #DFF0E6)", accent: "#2E9E67", icon: "🍼" },
    menstrual: { bg: "linear-gradient(135deg, #E4EFF9, #DAE8F5)", accent: "#3A78C4", icon: "🌙" },
    menopause: { bg: "linear-gradient(135deg, #F3E8FB, #EDE0F8)", accent: "#9A3DDE", icon: "🦋" }
  };
  
  const config = glowConfig[journeyType] || glowConfig.pregnant;
  
  return (
    <WCard style={{
      background: config.bg,
      border: `1px solid ${config.accent}44`,
      margin: "var(--gap-md)",
      overflow: "hidden"
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--gap-md)" }}>
        <div style={{
          fontSize: 40,
          background: `${config.accent}22`,
          width: 56,
          height: 56,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {config.icon}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: config.accent, marginBottom: "var(--sp-2)" }}>
            {currentTip.title}
          </h3>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--dp)", lineHeight: 1.55 }}>
            {currentTip.content}
          </p>
          {currentTip.affirmation && (
            <p style={{ fontSize: "var(--fs-xs)", color: config.accent, marginTop: "var(--sp-2)", fontStyle: "italic" }}>
              ✨ {currentTip.affirmation}
            </p>
          )}
        </div>
      </div>
    </WCard>
  );
}