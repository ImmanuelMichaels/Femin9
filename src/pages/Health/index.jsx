import { useState, useRef, useCallback, useEffect } from 'react';
import { WCard, SectionTitle, Tag, IconBox } from '../../components/ui';
import SymptomRisk from '../../components/cards/SymptomRisk';
import { DRUGS, TRADITIONAL } from '../../data/drugs';

export default function Health() {
  const [view, setView] = useState("menu");
  const [scanResult, setScanResult] = useState(null);
  const streamRef = useRef(null);
  const intRef = useRef(null);

  const stopCam = useCallback(() => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (intRef.current) { clearInterval(intRef.current); intRef.current = null; }
  }, []);

  useEffect(() => () => stopCam(), [stopCam]);

  const doSimScan = () => {
    const demos = ["paracetamol","ibuprofen","folic acid","amoxicillin","malaria"];
    setTimeout(() => {
      stopCam();
      const data = demos[Math.floor(Math.random() * demos.length)];
      const k = Object.keys(DRUGS).find(k => k !== "default" && data.toLowerCase().includes(k));
      setScanResult(DRUGS[k] || DRUGS.default);
      setView("result");
    }, 1400);
  };

  if (view === "result" && scanResult) return (
    <div className="page-pad">
      <button onClick={() => { setScanResult(null); setView("menu"); }} style={{ background: "none", border: "none", color: "var(--t)", fontWeight: 800, fontSize: "var(--fs-md)", marginBottom: "var(--sp-4)", cursor: "pointer" }}>← Back</button>
      <WCard style={{ background: scanResult.col[0], border: `1.5px solid ${scanResult.col[1]}44` }}>
        <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "center", marginBottom: "var(--sp-4)" }}>
          <div style={{ width: "var(--icon-md)", height: "var(--icon-md)", borderRadius: "var(--r)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-2xl)", boxShadow: "var(--sh)", flexShrink: 0 }}>{scanResult.icon}</div>
          <div>
            <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)" }}>{scanResult.name}</p>
            <Tag label={scanResult.safety} bg={scanResult.col[0]} tc={scanResult.col[1]} />
          </div>
        </div>
        {[["Category", scanResult.cat], ["Trimester", scanResult.trim], ["Dose", scanResult.dose]].map(([l, v]) => (
          <div key={l} style={{ display: "flex", gap: "var(--gap-md)", paddingBottom: "var(--sp-2)", marginBottom: "var(--sp-2)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <span style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", width: "clamp(60px,15vw,80px)", flexShrink: 0, fontWeight: 700 }}>{l}</span>
            <span style={{ fontSize: "var(--fs-sm)", color: "var(--dp)", fontWeight: 600, flex: 1 }}>{v}</span>
          </div>
        ))}
        <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: "var(--r)", padding: "var(--card-p)", marginTop: "var(--sp-2)" }}>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.65 }}>⚠️ {scanResult.warn}</p>
          {scanResult.alt && <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginTop: "var(--sp-2)" }}>✅ Alternative: {scanResult.alt}</p>}
        </div>
      </WCard>
      <SymptomRisk />
    </div>
  );

  return (
    <div className="page-pad">
      <SectionTitle title="🩺 Health Tools" />
      {[
        { icon: "📷", bg: "var(--bll)", tc: "var(--bl)", title: "Jaundice Scanner", desc: "Point camera at baby skin for AI colour analysis" },
        { icon: "🔬", bg: "var(--sgl)", tc: "var(--sg)", title: "QR Drug Scanner", desc: "Scan barcode to check medication safety" },
        { icon: "👁️", bg: "var(--lvl)", tc: "var(--lv)", title: "Symptom Vision", desc: "AI-powered visual symptom check" }
      ].map((item, i) => (
        <WCard key={i} onClick={doSimScan} style={{ padding: "var(--card-p)" }}>
          <div style={{ display: "flex", gap: "var(--gap-lg)", alignItems: "center" }}>
            <IconBox emoji={item.icon} bg={item.bg} size="var(--icon-md)" />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-1)" }}>{item.title}</p>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", lineHeight: 1.45 }}>{item.desc}</p>
            </div>
            <div style={{ color: "var(--mt)", fontSize: "var(--fs-xl)" }}>›</div>
          </div>
        </WCard>
      ))}

      <SectionTitle title="Traditional Practices" />
      {TRADITIONAL.map((t, i) => (
        <WCard key={i} style={{ padding: "var(--card-p)", background: t.safe ? "var(--sgl)" : "var(--rdl)", border: `1px solid ${t.safe ? "var(--sgm)" : "var(--rdm)"}33` }}>
          <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "flex-start" }}>
            <div style={{ width: "clamp(28px,7vw,36px)", height: "clamp(28px,7vw,36px)", borderRadius: "var(--r)", background: t.safe ? "var(--sg)" : t.status === "DANGEROUS" ? "var(--rd)" : "var(--gd)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "var(--fs-sm)", flexShrink: 0 }}>
              {t.safe ? "✓" : t.status === "DANGEROUS" ? "✗" : "!"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: "var(--gap-sm)", alignItems: "center", flexWrap: "wrap", marginBottom: "var(--sp-1)" }}>
                <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--dp)" }}>{t.practice}</p>
                <Tag label={t.status} bg={t.safe ? "var(--sgl)" : t.status === "DANGEROUS" ? "var(--rdl)" : "var(--gdl)"} tc={t.safe ? "var(--sg)" : t.status === "DANGEROUS" ? "var(--rd)" : "var(--gd)"} />
              </div>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)", lineHeight: 1.55 }}>{t.reason}</p>
            </div>
          </div>
        </WCard>
      ))}

      <SectionTitle title="Symptom Risk Engine" />
      <SymptomRisk />
    </div>
  );
}
