import { useState } from 'react';
import { WCard, SectionTitle } from '../../components/ui';
import { useApp } from '../../context/useApp';
import './Mental.css';

export default function Mental() {
  const { journeyType } = useApp();
  const [mood, setMood] = useState(null);
  const [breathPhase, setBreathPhase] = useState(null);
  const [breathCount, setBreathCount] = useState(0);
  const [breathTimer, setBreathTimer] = useState(0);
  const [activeAffirmation, setActiveAffirmation] = useState(0);

  const moods = [
    { e: "😊", l: "Great", c: "var(--sg)" }, 
    { e: "😌", l: "Calm", c: "var(--bl)" },
    { e: "😐", l: "Okay", c: "var(--gd)" }, 
    { e: "😔", l: "Low", c: "var(--t)" },
    { e: "😰", l: "Anxious", c: "var(--rd)" }
  ];

  // Journey-agnostic affirmations
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

  // Journey-agnostic wellness tips
  const wellnessTips = {
    pregnant: [
      { icon: "😴", title: "Sleep Hygiene", tip: "Pregnancy insomnia is common. Try magnesium glycinate, a pregnancy pillow, and limiting screens 1hr before bed." },
      { icon: "🧘", title: "Prenatal Yoga", tip: "Even 10 minutes of gentle stretching can reduce back pain and anxiety. Avoid deep twists after first trimester." },
      { icon: "💬", title: "Birth Fears", tip: "Talk to your provider about specific fears. Knowledge reduces anxiety — consider a birth prep class." }
    ],
    conceive: [
      { icon: "🌀", title: "Cycle Syncing", tip: "Match your activities to your cycle phases — high energy during follicular, rest during luteal." },
      { icon: "📱", title: "TTC Overwhelm", tip: "Set boundaries on tracking. Taking 1-2 days off from OPKs can reduce anxiety." },
      { icon: "💑", title: "Relationship Stress", tip: "Schedule non-TTC intimacy dates. Remember why you're together beyond the baby mission." }
    ],
    ivf: [
      { icon: "💉", title: "Injection Anxiety", tip: "Ice the area for 10 mins before shots. Use a reward system — small treat after each injection." },
      { icon: "⏳", title: "Waiting Anxiety", tip: "The 2-week wait is brutal. Plan small daily treats and avoid symptom spotting rabbit holes." },
      { icon: "🤝", title: "IVF Support", tip: "You don't have to be positive every day. Find one person who lets you vent without fixing." }
    ],
    menstrual: [
      { icon: "🩸", title: "Period Pain", tip: "Heat therapy, magnesium, and anti-inflammatory foods can reduce cramps. Track patterns to anticipate bad days." },
      { icon: "⚡", title: "Energy Fluctuations", tip: "Your energy naturally dips during menstruation. Rest is not laziness — it's biology." },
      { icon: "🎯", title: "Mood Tracking", tip: "Notice patterns in your emotional state across your cycle. Knowledge gives you control." }
    ],
    menopause: [
      { icon: "🔥", title: "Hot Flash Management", tip: "Layer clothing, carry a handheld fan, avoid triggers like caffeine and spicy foods." },
      { icon: "😴", title: "Sleep Disruption", tip: "Cool your bedroom to 65-68°F. Blackout curtains and white noise help with night sweats." },
      { icon: "🧠", title: "Brain Fog", tip: "Write everything down. Omega-3s and B12 may help. Most cognitive changes are temporary." }
    ],
    mom: [
      { icon: "😴", title: "Sleep Deprivation", tip: "Sleep when baby sleeps — really. A 20-min nap resets more than 2 hours of scrolling." },
      { icon: "🍽️", title: "Eating While Exhausted", tip: "Prep one-handed foods: energy balls, smoothies, nut butter packets. Fed is best for you too." },
      { icon: "🆘", title: "When to Ask for Help", tip: "If you feel overwhelmed, numb, or angry more often than not, talk to someone. Postpartum support is healthcare." }
    ]
  };

  const startBreath = () => {
    setBreathPhase("in"); 
    setBreathCount(0); 
    setBreathTimer(4);
    const phases = ["in","hold","out","rest"];
    const times = [4,7,8,2];
    let phase = 0; 
    let count = 0;
    const run = () => {
      phase = (phase + 1) % 4;
      count = phase === 0 ? count + 1 : count;
      setBreathPhase(phases[phase]); 
      setBreathTimer(times[phase]); 
      setBreathCount(count);
      if (count < 4) setTimeout(run, times[phase] * 1000);
      else setBreathPhase("done");
    };
    setTimeout(run, times[0] * 1000);
  };

  const currentAffirmations = affirmations[journeyType] || affirmations.pregnant;
  const currentTips = wellnessTips[journeyType] || wellnessTips.pregnant;

  return (
    <div className="page-pad">
      <SectionTitle title="Mental Wellness 💚" />

      {/* Mood Check - Universal */}
      <WCard>
        <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-4)" }}>
          How are you feeling today?
        </p>
        <div className="mood-row" style={{ marginBottom: "var(--sp-4)" }}>
          {moods.map(m => (
            <button 
              key={m.l} 
              className="mood-btn" 
              onClick={() => setMood(m)}
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
              Logged: {mood.e} {mood.l}. Thank you for checking in 💙
            </p>
          </div>
        )}
      </WCard>

      {/* Breathing Exercise - Universal */}
      <WCard style={{ background: "linear-gradient(135deg,var(--lvl),#F8F6FE)", border: "1px solid var(--lvm)33" }}>
        <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--lv)", marginBottom: "var(--sp-2)" }}>
          🌬️ 4-7-8 Breathing
        </p>
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", marginBottom: "var(--sp-4)", lineHeight: 1.5 }}>
          Reduces anxiety and cortisol. Safe for everyone. 4 cycles recommended.
        </p>
        {!breathPhase ? (
          <button onClick={startBreath} className="btn-primary" style={{ background: "var(--lv)", color: "#fff", padding: "20px" }}>
            ▶ Start Exercise
          </button>
        ) : breathPhase === "done" ? (
          <div className="fu" style={{ textAlign: "center", padding: "var(--sp-4)" }}>
            <div style={{ fontSize: "clamp(36px,9vw,48px)", marginBottom: "var(--sp-2)" }}>✨</div>
            <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--sg)" }}>
              Well done! 4 cycles complete.
            </p>
            <button 
              onClick={() => setBreathPhase(null)} 
              style={{ 
                marginTop: "var(--sp-3)", 
                background: "var(--sg)", 
                color: "#fff", 
                border: "none", 
                borderRadius: 20, 
                padding: "clamp(7px,1.8vw,10px) clamp(18px,4.5vw,24px)", 
                fontSize: "var(--fs-sm)", 
                fontWeight: 800, 
                cursor: "pointer" 
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <div className="fu" style={{ textAlign: "center", padding: "var(--sp-4)" }}>
            <div style={{ 
              width: "clamp(80px,20vw,110px)", 
              height: "clamp(80px,20vw,110px)", 
              borderRadius: "50%", 
              background: breathPhase === "in" ? "var(--sgl)" : breathPhase === "hold" ? "var(--lvl)" : breathPhase === "out" ? "var(--bll)" : "var(--warm)", 
              border: "3px solid " + (breathPhase === "in" ? "var(--sg)" : breathPhase === "hold" ? "var(--lv)" : "var(--bl)"), 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              margin: "0 auto var(--sp-3)", 
              transition: "all 1s ease", 
              transform: breathPhase === "in" ? "scale(1.2)" : "scale(1)" 
            }}>
              <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--dp)" }}>
                {breathPhase === "in" ? "In" : breathPhase === "hold" ? "Hold" : breathPhase === "out" ? "Out" : "Rest"}
              </p>
            </div>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)" }}>
              Cycle {breathCount + 1} of 4 · {breathTimer}s
            </p>
          </div>
        )}
      </WCard>

      {/* Daily Affirmations - Journey specific */}
      <SectionTitle title="Daily Affirmations" />
      <WCard>
        <div style={{ textAlign: "center", padding: "var(--sp-4)" }}>
          <p style={{ fontSize: "clamp(20px,5vw,28px)", marginBottom: "var(--sp-4)" }}>
            {currentAffirmations[activeAffirmation]}
          </p>
          <div style={{ display: "flex", gap: "var(--sp-2)", justifyContent: "center", marginTop: "var(--sp-3)" }}>
            <button 
              onClick={() => setActiveAffirmation((prev) => (prev - 1 + currentAffirmations.length) % currentAffirmations.length)}
              style={{ background: "var(--lvl)", border: "none", borderRadius: 20, padding: "6px 12px", cursor: "pointer" }}
            >
              ← Previous
            </button>
            <button 
              onClick={() => setActiveAffirmation((prev) => (prev + 1) % currentAffirmations.length)}
              style={{ background: "var(--lvl)", border: "none", borderRadius: 20, padding: "6px 12px", cursor: "pointer" }}
            >
              Next →
            </button>
          </div>
        </div>
      </WCard>

      {/* Wellness Tips - Journey specific */}
      <SectionTitle title={`Wellness Tips for You`} />
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

      {/* Emergency Resources - Universal */}
      <SectionTitle title="Need Immediate Support?" />
      <WCard style={{ background: "linear-gradient(135deg,#FFE5E5,#FFD6D6)", border: "1px solid #FFB3B3" }}>
        <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--rd)", marginBottom: "var(--sp-2)" }}>
          🚨 You are not alone
        </p>
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", marginBottom: "var(--sp-3)" }}>
          If you're feeling overwhelmed, these resources are available 24/7:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
          <p><strong>📞 National Crisis Line:</strong> 999 (UK)</p>
          <p><strong>💬 Postpartum Support International:</strong> 1-800-944-4773</p>
          <p><strong>🤝 Emergency:</strong> 911 or your local emergency number</p>
        </div>
      </WCard>
    </div>
  );
}