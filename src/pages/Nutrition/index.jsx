import { useState } from 'react';
import { WCard, SectionTitle, Tag, Pill, IconBox } from '../../components/ui';
import { FOODS, SUPPS, CRAVINGS } from '../../data/foods';

export default function Nutrition() {
  const [meal, setMeal] = useState("morning");
  const [suppTaken, setSuppTaken] = useState({ 0: true, 1: true });
  const [craving, setCraving] = useState("");
  const [cravingResult, setCravingResult] = useState(null);

  const analyseCraving = () => {
    const l = craving.toLowerCase();
    const k = Object.keys(CRAVINGS).find(k => k !== "default" && l.includes(k));
    setCravingResult(CRAVINGS[k] || CRAVINGS.default);
  };

  return (
    <div className="page-pad">
      <SectionTitle title="🥗 Nutrition Engine" />

      {/* Craving Intelligence */}
      <WCard style={{ background: "linear-gradient(135deg,var(--warm),var(--gdl))", border: "1px solid var(--border2)" }}>
        <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-2)" }}>🍫 Craving Intelligence</p>
        <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginBottom: "var(--sp-3)" }}>Cravings often signal nutrient deficiencies:</p>
        <div style={{ display: "flex", gap: "var(--gap-sm)", marginBottom: "var(--sp-3)" }}>
          <input value={craving} onChange={e => setCraving(e.target.value)}
            placeholder="e.g. chocolate, ice, meat…" className="form-input" style={{ flex: 1 }} />
          <button onClick={analyseCraving} style={{ padding: "0 clamp(12px,3vw,18px)", background: "var(--dp)", color: "#fff", border: "none", borderRadius: "var(--r)", fontSize: "var(--fs-sm)", fontWeight: 800, cursor: "pointer", flexShrink: 0, minHeight: "var(--touch)" }}>Check</button>
        </div>
        {cravingResult && (
          <div className="fu" style={{ background: cravingResult.urgent ? "var(--rdl)" : "var(--sgl)", borderRadius: "var(--r)", padding: "var(--card-p)", border: `1px solid ${cravingResult.urgent ? "var(--rd)" : "var(--sg)"}44` }}>
            <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: cravingResult.urgent ? "var(--rd)" : "var(--sg)", marginBottom: "var(--sp-1)" }}>{cravingResult.icon} {cravingResult.deficiency}</p>
            {cravingResult.urgent && <p style={{ fontSize: "var(--fs-xs)", color: "var(--rd)", fontWeight: 700, marginBottom: "var(--sp-1)" }}>⚠️ Pica requires immediate medical attention.</p>}
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)" }}>Eat: <b>{cravingResult.food}</b></p>
          </div>
        )}
      </WCard>

      {/* Supplements */}
      <SectionTitle title="Daily Supplements" />
      <WCard style={{ padding: `var(--sp-2) var(--card-p)` }}>
        {SUPPS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "clamp(11px,2.8vw,15px) 0", borderBottom: i < SUPPS.length - 1 ? "1px solid var(--border)" : "none" }}>
            <button onClick={() => setSuppTaken(t => ({ ...t, [i]: !t[i] }))} style={{ width: "clamp(22px,5.5vw,28px)", height: "clamp(22px,5.5vw,28px)", borderRadius: "50%", flexShrink: 0, border: `2px solid ${suppTaken[i] ? "var(--sg)" : "var(--border2)"}`, background: suppTaken[i] ? "var(--sg)" : "transparent", color: "#fff", fontSize: "var(--fs-xs)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}>{suppTaken[i] ? "✓" : ""}</button>
            <IconBox emoji="💊" bg={s.col[0]} size="var(--icon-sm)" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "var(--fs-base)", fontWeight: 800, color: "var(--dp)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</p>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>{s.time}</p>
            </div>
            <span style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: s.col[1], flexShrink: 0 }}>{s.dose}</span>
          </div>
        ))}
      </WCard>

      {/* Meal Planner */}
      <SectionTitle title="Meal Planner" />
      <div style={{ display: "flex", gap: "var(--gap-sm)", marginBottom: "var(--sp-4)", overflowX: "auto", scrollbarWidth: "none" }}>
        {["morning","afternoon","evening"].map(m => (
          <Pill key={m} label={m === "morning" ? "🌅 Morning" : m === "afternoon" ? "☀️ Afternoon" : "🌙 Evening"} active={meal === m} onClick={() => setMeal(m)} />
        ))}
      </div>
      {FOODS[meal].map((f, i) => (
        <WCard key={i} style={{ padding: "var(--card-p)" }}>
          <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "flex-start" }}>
            <div style={{ width: "var(--icon-md)", height: "var(--icon-md)", flexShrink: 0, borderRadius: "var(--r)", background: "var(--gdl)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-2xl)" }}>{f.e}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "var(--fs-base)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-1)" }}>{f.name}</p>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", lineHeight: 1.5, marginBottom: "var(--sp-2)" }}>{f.b}</p>
              <div style={{ display: "flex", gap: "var(--gap-sm)", flexWrap: "wrap" }}>
                {f.tags.map(tag => <Tag key={tag} label={tag} />)}
              </div>
            </div>
          </div>
        </WCard>
      ))}
    </div>
  );
}
