import { useState } from 'react';
import { WCard, SectionTitle } from '../../components/ui';

export default function Mental() {
  const [mood, setMood] = useState(null);
  const [breathPhase, setBreathPhase] = useState(null);
  const [breathCount, setBreathCount] = useState(0);
  const [breathTimer, setBreathTimer] = useState(0);

  const moods = [
    { e: "😊", l: "Great", c: "var(--sg)" }, { e: "😌", l: "Calm", c: "var(--bl)" },
    { e: "😐", l: "Okay", c: "var(--gd)" }, { e: "😔", l: "Low", c: "var(--t)" },
    { e: "😰", l: "Anxious", c: "var(--rd)" }
  ];

  const startBreath = () => {
    setBreathPhase("in"); setBreathCount(0); setBreathTimer(4);
    const phases = ["in","hold","out","rest"];
    const times = [4,7,8,2];
    let phase = 0; let count = 0;
    const run = () => {
      phase = (phase + 1) % 4;
      count = phase === 0 ? count + 1 : count;
      setBreathPhase(phases[phase]); setBreathTimer(times[phase]); setBreathCount(count);
      if (count < 4) setTimeout(run, times[phase] * 1000);
      else setBreathPhase("done");
    };
    setTimeout(run, times[0] * 1000);
  };

  return (
    <div className="page-pad">
      <SectionTitle title="💚 Mental Wellness" />

      {/* Mood Check */}
      <WCard>
        <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-4)" }}>How are you feeling?</p>
        <div className="mood-row" style={{ marginBottom: "var(--sp-4)" }}>
          {moods.map(m => (
            <button key={m.l} className="mood-btn" onClick={() => setMood(m)}
              style={{ background: mood?.l === m.l ? m.c + "22" : "transparent", border: `2px solid ${mood?.l === m.l ? m.c : "transparent"}` }}>
              <span>{m.e}</span>
              <small style={{ color: mood?.l === m.l ? m.c : "var(--mt)" }}>{m.l}</small>
            </button>
          ))}
        </div>
        {mood && (
          <div className="fu" style={{ background: mood.c + "18", borderRadius: "var(--r)", padding: "var(--sp-3) var(--card-p)", border: `1px solid ${mood.c}33` }}>
            <p style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: mood.c }}>Logged: {mood.e} {mood.l}. Thank you for checking in, mama 💙</p>
          </div>
        )}
      </WCard>

      {/* Breathing Exercise */}
      <WCard style={{ background: "linear-gradient(135deg,var(--lvl),#F8F6FE)", border: "1px solid var(--lvm)33" }}>
        <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--lv)", marginBottom: "var(--sp-2)" }}>🌬️ 4-7-8 Breathing</p>
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", marginBottom: "var(--sp-4)", lineHeight: 1.5 }}>Reduces anxiety and cortisol. Safe for all trimesters. 4 cycles recommended.</p>
        {!breathPhase ? (
          <button onClick={startBreath} className="btn-primary" style={{ background: "var(--lv)", color: "#fff" }}>▶ Start Exercise</button>
        ) : breathPhase === "done" ? (
          <div className="fu" style={{ textAlign: "center", padding: "var(--sp-4)" }}>
            <div style={{ fontSize: "clamp(36px,9vw,48px)", marginBottom: "var(--sp-2)" }}>✨</div>
            <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--sg)" }}>Well done, mama! 4 cycles complete.</p>
            <button onClick={() => setBreathPhase(null)} style={{ marginTop: "var(--sp-3)", background: "var(--sg)", color: "#fff", border: "none", borderRadius: 20, padding: "clamp(7px,1.8vw,10px) clamp(18px,4.5vw,24px)", fontSize: "var(--fs-sm)", fontWeight: 800, cursor: "pointer" }}>Done</button>
          </div>
        ) : (
          <div className="fu" style={{ textAlign: "center", padding: "var(--sp-4)" }}>
            <div style={{ width: "clamp(80px,20vw,110px)", height: "clamp(80px,20vw,110px)", borderRadius: "50%", background: breathPhase === "in" ? "var(--sgl)" : breathPhase === "hold" ? "var(--lvl)" : breathPhase === "out" ? "var(--bll)" : "var(--warm)", border: "3px solid " + (breathPhase === "in" ? "var(--sg)" : breathPhase === "hold" ? "var(--lv)" : "var(--bl)"), display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--sp-3)", transition: "all 1s ease", transform: breathPhase === "in" ? "scale(1.2)" : "scale(1)" }}>
              <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--dp)" }}>{breathPhase === "in" ? "In" : breathPhase === "hold" ? "Hold" : breathPhase === "out" ? "Out" : "Rest"}</p>
            </div>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)" }}>Cycle {breathCount + 1} of 4 · {breathTimer}s</p>
          </div>
        )}
      </WCard>

      {/* Affirmations */}
      <SectionTitle title="Daily Affirmations" />
      {[
        "You are strong, capable, and deeply loved.",
        "Your body knows exactly what to do.",
        "This season is temporary. Your strength is permanent.",
        "You are not alone on this journey."
      ].map((a, i) => (
        <WCard key={i} style={{ background: ["var(--gdl)","var(--sgl)","var(--lvl)","var(--bll)"][i], border: "none", padding: "var(--card-p)" }}>
          <p style={{ fontSize: "var(--fs-md)", fontWeight: 600, color: "var(--dp)", fontStyle: "italic", lineHeight: 1.6 }}>"{a}"</p>
        </WCard>
      ))}

      {/* Postpartum Body Changes */}
      <SectionTitle title="🤱 Postpartum Body Changes" />
      <WCard style={{ background: "linear-gradient(135deg,#FEF0DA,#FDE8D0)", border: "1px solid #F2D4A844", marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--gd)", marginBottom: 4 }}>🔔 AI Proactive Guidance — Active</p>
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>MamaBloom tracks real body changes postpartum and sends you timely, personalised guidance — not generic advice. Your body is doing something extraordinary. We'll walk it with you.</p>
      </WCard>
      {[
        { icon: "⚖️", title: "Weight Management", bg: "var(--sgl)", tc: "var(--sg)", tip: "Most postpartum weight shifts take 6–12 months, not 6 weeks. Your body stored fat specifically to fuel breastfeeding. Focus on nourishing, not restricting.", notify: "Week 6 check-in due" },
        { icon: "🍫", title: "Emotional Eating", bg: "var(--gdl)", tc: "var(--gd)", tip: "Night feeds, sleep deprivation, and hormonal crashes create genuine cravings. Emotional hunger spikes 2–4 weeks postpartum. This is biological, not a failure of willpower.", notify: "Pattern flagged: 3 late-night logs" },
        { icon: "🌿", title: "Stretch Marks", bg: "var(--lvl)", tc: "var(--lv)", tip: "Shea butter (local), Bio-Oil, and rosehip oil improve appearance over 3–6 months. Apply while skin is still damp. Hydration and collagen-rich foods (bone broth, tomatoes) help from the inside.", notify: "Reminder: apply tonight" },
        { icon: "🔻", title: "FUPA Recovery", bg: "var(--bll)", tc: "var(--bl)", tip: "The lower belly pouch (FUPA) after a C-section or vaginal birth is normal — it's often fat repositioning + fluid + stretched skin. Deep core breathing from week 6 is more effective than crunches.", notify: "Week 8 core guide ready" },
        { icon: "🌱", title: "Full Body Adaptation", bg: "var(--rdl)", tc: "var(--rd)", tip: "Hair thinning at 3–6 months, joint laxity, night sweats, and breast changes are all expected hormonal shifts. Your body is recalibrating. Most resolve by month 9–12.", notify: "Month 4 adaptation brief" },
      ].map((item, i) => (
        <WCard key={i} style={{ marginBottom: "var(--gap-md)" }}>
          <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "flex-start" }}>
            <div style={{ width: "var(--icon-sm)", height: "var(--icon-sm)", borderRadius: "var(--r)", background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-xl)", flexShrink: 0 }}>{item.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-1)" }}>
                <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--dp)" }}>{item.title}</p>
                <span style={{ fontSize: "var(--fs-2xs)", fontWeight: 700, color: item.tc, background: item.bg, padding: "2px 8px", borderRadius: 10, flexShrink: 0, marginLeft: 6 }}>🔔 {item.notify}</span>
              </div>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>{item.tip}</p>
            </div>
          </div>
        </WCard>
      ))}
    </div>
  );
}
