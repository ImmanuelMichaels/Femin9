// Mental/index.jsx - Complete with Storage Utilities

import { useState, useEffect, useRef, useCallback } from 'react';
import { WCard, SectionTitle } from '../../components/ui';
import { useApp } from '../../context/useApp';
import BreathingExercise from './BreathingExercise';
import { lsGet, lsSet } from '../../utils/storage'; // ← ADDED
import './Mental.css';

export default function Mental() {
  const { journeyType } = useApp();

  // ─── STATE ───────────────────────────────────────────────────────────────
  const [mood, setMood] = useState(null);
  const [activeAffirmation, setActiveAffirmation] = useState(0);

  // ─── MOODS ───────────────────────────────────────────────────────────────
  const moods = [
    { e: "😊", l: "Great", c: "var(--sg)" },
    { e: "😌", l: "Calm", c: "var(--bl)" },
    { e: "😐", l: "Okay", c: "var(--gd)" },
    { e: "😔", l: "Low", c: "var(--t)" },
    { e: "😰", l: "Anxious", c: "var(--rd)" }
  ];

  // ─── AFFIRMATIONS ────────────────────────────────────────────────────────
  const affirmations = {
    pregnant: [
      "You are growing a whole human — that's incredible strength.",
      "Your body knows exactly what to do.",
      "Every kick is a reminder of the miracle inside you.",
      "You are enough, exactly as you are right now."
    ],
    conceive: [
      "Your patience is planting seeds for tomorrow.",
      "Every cycle brings you closer to your dream.",
      "You are whole and worthy, regardless of where you are on this journey.",
      "Hope is not naive — it's brave."
    ],
    ivf: [
      "You are stronger than any injection or procedure.",
      "Every needle is an act of love for your future family.",
      "This journey is tough, but so are you.",
      "Your resilience is inspiring."
    ],
    menstrual: [
      "Your body has its own rhythm — listen with compassion.",
      "Rest is not weakness, it's wisdom.",
      "You are in tune with nature's oldest cycle.",
      "Each phase brings its own power."
    ],
    menopause: [
      "This transformation is a new season of power.",
      "Your wisdom grows with every hot flash.",
      "You are entering your most authentic era.",
      "Change is uncomfortable but beautiful."
    ],
    mom: [
      "You can't pour from an empty cup — rest is productive.",
      "This season is hard, and you're doing beautifully.",
      "Your baby needs your presence, not your perfection.",
      "You are exactly the mother your child needs."
    ]
  };

  // ─── FULL WELLNESS TIPS ──────────────────────────────────────────────────
  const wellnessTips = {
    pregnant: [
      { 
        icon: "😴", 
        title: "Sleep Hygiene", 
        tip: "Pregnancy insomnia is common. Try magnesium glycinate (after consulting your doctor), a pregnancy pillow, and limiting screens 1hr before bed." 
      },
      { 
        icon: "🧘", 
        title: "Prenatal Yoga", 
        tip: "Even 10 minutes of gentle stretching can reduce back pain and anxiety. Avoid deep twists after first trimester." 
      },
      { 
        icon: "💬", 
        title: "Birth Fears", 
        tip: "Talk to your provider about specific fears. Knowledge reduces anxiety — consider a birth prep class or hypnobirthing." 
      }
    ],
    conceive: [
      { 
        icon: "🌀", 
        title: "Cycle Syncing", 
        tip: "Match your activities to your cycle phases — high energy during follicular, rest during luteal." 
      },
      { 
        icon: "📱", 
        title: "TTC Overwhelm", 
        tip: "Set boundaries on tracking. Taking 1-2 days off from OPKs and apps can reduce anxiety." 
      },
      { 
        icon: "💑", 
        title: "Relationship Stress", 
        tip: "Schedule non-TTC intimacy dates. Remember why you're together beyond the baby mission." 
      }
    ],
    ivf: [
      { 
        icon: "💉", 
        title: "Injection Anxiety", 
        tip: "Ice the area for 10 mins before shots. Use a reward system — small treat after each injection." 
      },
      { 
        icon: "⏳", 
        title: "Waiting Anxiety", 
        tip: "The 2-week wait is brutal. Plan small daily treats and avoid symptom spotting." 
      },
      { 
        icon: "🤝", 
        title: "IVF Support", 
        tip: "You don't have to be positive every day. Find one person who lets you vent without fixing." 
      }
    ],
    menstrual: [
      { 
        icon: "🩸", 
        title: "Period Pain", 
        tip: "Heat therapy, magnesium, and anti-inflammatory foods (ginger, turmeric) can reduce cramps. Track patterns to anticipate bad days." 
      },
      { 
        icon: "⚡", 
        title: "Energy Fluctuations", 
        tip: "Your energy naturally dips during menstruation. Rest is not laziness — it's biology." 
      },
      { 
        icon: "🎯", 
        title: "Mood Tracking", 
        tip: "Notice patterns in your emotional state across your cycle. Knowledge gives you control." 
      }
    ],
    menopause: [
      { 
        icon: "🔥", 
        title: "Hot Flash Management", 
        tip: "Layer clothing, carry a handheld fan, stay hydrated, and avoid triggers like caffeine, alcohol, and spicy foods." 
      },
      { 
        icon: "😴", 
        title: "Sleep Disruption", 
        tip: "Cool your bedroom to 16–18°C. Blackout curtains, white noise, and a cool shower before bed help with night sweats." 
      },
      { 
        icon: "🧠", 
        title: "Brain Fog", 
        tip: "Write everything down. Omega-3s, B12, gentle exercise, and reducing screen time may help." 
      }
    ],
    mom: [
      { 
        icon: "😴", 
        title: "Sleep Deprivation", 
        tip: "Sleep when baby sleeps — really. A 20-min nap resets more than 2 hours of scrolling." 
      },
      { 
        icon: "🍽️", 
        title: "Eating While Exhausted", 
        tip: "Prep one-handed foods: energy balls, overnight oats, smoothies, nut butter packets. Fed is best for you too." 
      },
      { 
        icon: "🆘", 
        title: "When to Ask for Help", 
        tip: "If you feel overwhelmed, numb, or angry more often than not, talk to someone. Postpartum support is healthcare." 
      }
    ]
  };

  const currentAffirmations = affirmations[journeyType] || affirmations.mom;
  const currentTips = wellnessTips[journeyType] || wellnessTips.mom;

  // ─── MOOD PERSISTENCE (FIXED with safe storage) ────────────────────────
  useEffect(() => {
    // Use lsGet instead of raw localStorage
    const savedMood = lsGet('mental_mood');
    const savedDate = lsGet('mental_mood_date');
    const today = new Date().toISOString().split('T')[0];

    if (savedMood && savedDate === today) {
      setMood(savedMood);
    }
  }, []);

  const saveMood = useCallback((selectedMood) => {
    const today = new Date().toISOString().split('T')[0];
    // Use lsSet instead of raw localStorage
    lsSet('mental_mood', selectedMood);
    lsSet('mental_mood_date', today);
    setMood(selectedMood);
  }, []);

  // ─── AFFIRMATION RESET ───────────────────────────────────────────────────
  useEffect(() => {
    setActiveAffirmation(0);
  }, [journeyType]);

  // ─── MOOD FEEDBACK ───────────────────────────────────────────────────────
  const getMoodFeedback = (m) => {
    if (m.l === "Great" || m.l === "Calm") return "Beautiful. Carry this energy with you today 💚";
    if (m.l === "Okay") return "Acknowledging where you are is powerful. You're doing great.";
    if (m.l === "Low") return "It's okay to not be okay. Reach out — you're not alone.";
    if (m.l === "Anxious") return "Take a deep breath. You've got this. Try the 4-7-8 exercise above.";
    return "Thank you for checking in. Your feelings matter.";
  };

  return (
    <div className="page-pad">
      <SectionTitle title="Mental Wellness 💚" />

      {/* Mood Check */}
      <WCard>
        <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-4)" }}>
          How are you feeling today?
        </p>
        <div className="mood-row" style={{ marginBottom: "var(--sp-4)" }}>
          {moods.map(m => (
            <button
              key={m.l}
              className="mood-btn"
              onClick={() => saveMood(m)}
              style={{
                background: mood?.l === m.l ? m.c + "22" : "transparent",
                border: `2px solid ${mood?.l === m.l ? m.c : "transparent"}`
              }}
            >
              <span>{m.e}</span>
              <small style={{ color: mood?.l === m.l ? m.c : "var(--mt)" }}>{m.l}</small>
            </button>
          ))}
        </div>
        {mood && (
          <div className="fu" style={{ 
            background: mood.c + "18", 
            borderRadius: "var(--r)", 
            padding: "var(--sp-3) var(--card-p)", 
            border: `1px solid ${mood.c}33` 
          }}>
            <p style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: mood.c }}>
              Logged: {mood.e} {mood.l}. {getMoodFeedback(mood)}
            </p>
          </div>
        )}
      </WCard>

      {/* Breathing Exercise - FIXED */}
      <BreathingExercise />

      {/* Daily Affirmations */}
      <SectionTitle title="Daily Affirmations" />
      <WCard>
        <div style={{ textAlign: "center", padding: "var(--sp-4)" }}>
          <p style={{ fontSize: "clamp(20px,5vw,28px)", lineHeight: 1.4, minHeight: "120px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {currentAffirmations[activeAffirmation]}
          </p>
          <div style={{ display: "flex", gap: "var(--sp-2)", justifyContent: "center", marginTop: "var(--sp-3)" }}>
            <button
              onClick={() => setActiveAffirmation(prev => (prev - 1 + currentAffirmations.length) % currentAffirmations.length)}
              aria-label="Previous affirmation"
              style={{ background: "var(--lvl)", border: "none", borderRadius: 20, padding: "8px 16px", cursor: "pointer" }}
            >
              ‹
            </button>
            <button
              onClick={() => setActiveAffirmation(prev => (prev + 1) % currentAffirmations.length)}
              aria-label="Next affirmation"
              style={{ background: "var(--lvl)", border: "none", borderRadius: 20, padding: "8px 16px", cursor: "pointer" }}
            >
              ›
            </button>
          </div>
        </div>
      </WCard>

      {/* Wellness Tips */}
      <SectionTitle title={`Wellness Tips for ${journeyType === 'mom' ? 'Mums' : journeyType}`} />
      {currentTips.map((item, i) => (
        <WCard key={i} style={{ marginBottom: "var(--gap-md)" }}>
          <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "flex-start" }}>
            <div style={{ 
              width: "var(--icon-sm)", 
              height: "var(--icon-sm)", 
              borderRadius: "var(--r)", 
              background: ["var(--sgl)", "var(--gdl)", "var(--lvl)"][i % 3], 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              fontSize: "var(--fs-xl)", 
              flexShrink: 0 
            }}>
              {item.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-2)" }}>
                {item.title}
              </p>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>
                {item.tip}
              </p>
            </div>
          </div>
        </WCard>
      ))}

      {/* Emergency Support */}
      <SectionTitle title="Need Immediate Support?" />
      <WCard style={{ background: "linear-gradient(135deg,#FFE5E5,#FFD6D6)", border: "1px solid #FFB3B3" }}>
        <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--rd)", marginBottom: "var(--sp-2)" }}>
          🚨 You are not alone
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
          <a href="tel:116123" style={{ color: "var(--rd)", textDecoration: "none", fontWeight: 600 }}>
            📞 Samaritans – 116 123 (24/7)
          </a>
          <a href="tel:111" style={{ color: "var(--rd)", textDecoration: "none", fontWeight: 600 }}>
            📞 NHS 111 (non-emergency)
          </a>
          <a href="tel:999" style={{ color: "var(--rd)", textDecoration: "none", fontWeight: 600 }}>
            🚨 Emergency – 999
          </a>
        </div>
      </WCard>
    </div>
  );
}