import { useState } from 'react';
import { WCard, Tag } from '../ui';
import { SYMPTOMS_RISK } from '../../data/drugs';

const RISK_COL = {
  "EMERGENCY": ["var(--rdl)","var(--rd)"],
  "HIGH":      ["var(--rdl)","var(--rd)"],
  "MEDIUM":    ["var(--gdl)","var(--gd)"],
  "LOW":       ["var(--sgl)","var(--sg)"]
};

const SYMPTOMS = [
  "Headache","Swelling","High BP","Fever","Chills","Reduced kicks",
  "No movement 2hr","Vaginal bleeding","Cramping","Nausea","Fatigue",
  "Back pain","Leg swelling","Blurry vision","Upper abdominal pain"
];

export default function SymptomRisk() {
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);

  const analyse = () => {
    for (const rule of SYMPTOMS_RISK) {
      if (rule.combo.filter(s => selected.includes(s)).length >= Math.min(2, rule.combo.length)) {
        setResult(rule); return;
      }
    }
    setResult({ risk: "LOW", condition: "No high-risk pattern detected", action: "Monitor symptoms. If they worsen, contact your healthcare provider." });
  };

  const cols = RISK_COL[result?.risk] || ["var(--sgl)","var(--sg)"];

  return (
    <WCard>
      <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-1)" }}>🧠 Symptom Analyser</p>
      <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginBottom: "var(--sp-3)" }}>Tap all symptoms. AI will assess combined risk.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-sm)", marginBottom: "var(--sp-4)" }}>
        {SYMPTOMS.map(s => (
          <button key={s} onClick={() => setSelected(sl => sl.includes(s) ? sl.filter(x => x !== s) : [...sl, s])} style={{ padding: "clamp(5px,1.2vw,7px) clamp(9px,2.2vw,13px)", borderRadius: 20, fontSize: "var(--fs-xs)", fontWeight: 700, background: selected.includes(s) ? "var(--dp)" : "var(--warm)", color: selected.includes(s) ? "#fff" : "var(--md)", border: `1.5px solid ${selected.includes(s) ? "var(--dp)" : "var(--border)"}`, cursor: "pointer", transition: "all 0.15s", minHeight: "var(--touch)" }}>{s}</button>
        ))}
      </div>
      <button onClick={analyse} disabled={!selected.length} className="btn-primary" style={{ background: selected.length ? "var(--dp)" : "var(--border)", color: selected.length ? "#fff" : "var(--mt)", cursor: selected.length ? "pointer" : "default", marginBottom: "var(--sp-3)" }}>
        Analyse {selected.length > 0 ? `(${selected.length})` : ""}
      </button>
      {result && (
        <div className="fu" style={{ background: cols[0], borderRadius: "var(--r)", padding: "var(--card-p)", border: `1.5px solid ${cols[1]}44` }}>
          <div style={{ display: "flex", gap: "var(--gap-sm)", alignItems: "center", marginBottom: "var(--sp-2)", flexWrap: "wrap" }}>
            <span style={{ fontSize: "var(--fs-lg)" }}>{result.risk === "EMERGENCY" || result.risk === "HIGH" ? "🚨" : result.risk === "MEDIUM" ? "⚠️" : "✅"}</span>
            <Tag label={result.risk} bg={cols[0]} tc={cols[1]} />
            <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: cols[1] }}>{result.condition}</p>
          </div>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.65 }}>{result.action}</p>
        </div>
      )}
    </WCard>
  );
}
