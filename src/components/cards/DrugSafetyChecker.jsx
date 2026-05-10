import { useState } from 'react';
import { WCard, Tag, Pill } from '../ui';
import { DRUG_DB, CONTEXT_KEYS, RATING_META, DRUG_SUGGESTIONS } from '../../data/drugs';

export default function DrugSafetyChecker() {
  const [query, setQuery] = useState("");
  const [ctx, setCtx] = useState("Pregnancy — T2");
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const search = () => {
    if (!query.trim()) return;
    const q = query.toLowerCase().trim();
    const key = Object.keys(DRUG_DB).find(k => q.includes(k) || k.includes(q));
    setResult(key ? DRUG_DB[key] : null);
    setSearched(true);
  };

  const ctxKey = CONTEXT_KEYS[ctx];
  const guidance = result?.guidance?.[ctxKey] || "No specific guidance available. Always consult your healthcare provider.";
  const rm = result ? (RATING_META[result.rating] || RATING_META["CAUTION"]) : null;

  return (
    <div className="fu" style={{ padding: "var(--pad-x)", display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
      <div style={{ textAlign: "center", padding: "var(--sp-3) 0 var(--sp-2)" }}>
        <div style={{ fontSize: "clamp(32px,8vw,42px)", marginBottom: 6 }}>💊</div>
        <div style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)" }}>Drug & Substance Safety</div>
        <div style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", marginTop: 4 }}>Drugs · Herbs · Foods · Environmental hazards</div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()}
          placeholder="Search e.g. Panadol, zobo, paint fumes…"
          style={{ flex: 1, padding: "clamp(10px,2.5vw,13px) clamp(13px,3vw,16px)", borderRadius: "var(--r)", border: "1.5px solid var(--border2)", fontSize: "var(--fs-sm)", background: "var(--card)", outline: "none", color: "var(--dp)" }} />
        <button onClick={search} style={{ padding: "0 clamp(14px,3.5vw,20px)", borderRadius: "var(--r)", background: "var(--t)", color: "#fff", fontWeight: 700, fontSize: "var(--fs-sm)", flexShrink: 0, minHeight: "var(--touch)" }}>Check</button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {DRUG_SUGGESTIONS.map(s => (
          <button key={s} onClick={() => setQuery(s)} style={{ padding: "5px 11px", borderRadius: 20, fontSize: "var(--fs-xs)", background: "var(--card)", border: "1.5px solid var(--border)", color: "var(--mt)", cursor: "pointer", fontWeight: 600 }}>{s}</button>
        ))}
      </div>

      <WCard>
        <div style={{ fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--mt)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Your Context</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {Object.keys(CONTEXT_KEYS).map(c => (
            <Pill key={c} label={c} active={ctx === c} onClick={() => setCtx(c)} color="var(--rd)" />
          ))}
        </div>
      </WCard>

      {searched && !result && (
        <WCard style={{ textAlign: "center", padding: "var(--sp-5)" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
          <div style={{ fontWeight: 700, color: "var(--dp)" }}>Not in database</div>
          <div style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", marginTop: 6 }}>Always consult your doctor or pharmacist.</div>
        </WCard>
      )}

      {result && rm && (
        <div className="slideUp" style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
          <WCard style={{ background: rm.bg, border: `2px solid ${rm.col}33` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, background: `${rm.col}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{rm.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: "var(--fs-md)", color: "var(--dp)" }}>{result.name}</div>
                <Tag label={result.cat} bg={`${rm.col}22`} tc={rm.col} />
              </div>
              <div style={{ padding: "6px 12px", borderRadius: 20, background: rm.col, color: "#fff", fontSize: "var(--fs-xs)", fontWeight: 800, flexShrink: 0 }}>{rm.label}</div>
            </div>
          </WCard>

          <WCard>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 18 }}>🎯</div>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--dp)" }}>Guidance for: {ctx}</div>
            </div>
            <div style={{ padding: "var(--card-p)", borderRadius: "var(--r)", background: rm.bg, fontSize: "var(--fs-sm)", color: "var(--dp)", lineHeight: 1.6 }}>{guidance}</div>
          </WCard>

          <WCard>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 18 }}>🔬</div>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>How It Works / Risk</div>
            </div>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>{result.mechanism}</div>
          </WCard>

          {result.nigerian?.length > 0 && (
            <WCard>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ fontSize: 18 }}>🇳🇬</div>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>Nigerian / Local Names</div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.nigerian.map((n, i) => <Tag key={i} label={n} bg="var(--gdl)" tc="var(--gd)" />)}
              </div>
            </WCard>
          )}

          <WCard style={{ background: "var(--sgl)", border: "1.5px solid var(--sg)33" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 18 }}>💡</div>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--sg)" }}>Safer Alternatives</div>
            </div>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>{result.alt}</div>
          </WCard>

          <div style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", textAlign: "center", padding: "var(--sp-2) var(--sp-3)", lineHeight: 1.5 }}>
            ⚕️ MamaBloom safety data is for educational use only. Always confirm with a registered doctor, pharmacist, or midwife.
          </div>
        </div>
      )}
    </div>
  );
}
