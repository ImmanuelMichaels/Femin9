import { useState } from 'react';

export default function EmergencyModal({ onClose }) {
  const [sent, setSent] = useState(false);

  return (
    <div className="fi" style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
      zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center"
    }}>
      <div className="slideUp" style={{
        background: "var(--card)",
        borderRadius: "var(--r3) var(--r3) 0 0",
        padding: "var(--sp-5) var(--pad-x) var(--sp-6)",
        width: "100%", maxWidth: 480
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--border)", margin: "0 auto var(--sp-5)" }} />
        <div style={{ textAlign: "center", marginBottom: "var(--sp-4)" }}>
          <div style={{
            width: "clamp(56px,14vw,72px)", height: "clamp(56px,14vw,72px)",
            borderRadius: "50%", background: "var(--rdl)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "clamp(24px,6vw,32px)", margin: "0 auto var(--sp-3)",
            border: "2.5px solid var(--rdm)", animation: "hb 1.2s infinite"
          }}>🚨</div>
          <h2 className="serif" style={{ fontSize: "var(--fs-xl)", color: "var(--rd)", marginBottom: "var(--sp-2)", fontStyle: "italic" }}>Emergency Help</h2>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", lineHeight: 1.6 }}>Select your emergency. We will alert your contacts and nearest hospital.</p>
        </div>
        <div className="emrg-grid">
          {[
            ["🩸","Heavy Bleeding","var(--rdl)","var(--rd)"],
            ["💔","Chest Pain/BP","var(--rdl)","var(--rd)"],
            ["🤰","Labour Signs","var(--gdl)","var(--gd)"],
            ["🧠","Severe Headache","var(--gdl)","var(--gd)"],
            ["👶","Baby Not Moving","var(--rdl)","var(--rd)"],
            ["🌡️","High Fever","var(--gdl)","var(--gd)"]
          ].map(([ic, lb, bg, tc], i) => (
            <button key={i} className="emrg-btn"
              onClick={() => setSent(true)}
              style={{ background: bg, border: `1.5px solid ${tc}44`, color: tc }}>
              <span>{ic}</span>{lb}
            </button>
          ))}
        </div>
        {sent && (
          <div className="fu" style={{
            background: "var(--rdl)", border: "1px solid var(--rd)",
            borderRadius: "var(--r)", padding: "var(--card-p)", marginBottom: "var(--sp-4)"
          }}>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--rd)", fontWeight: 800 }}>✅ Alert sent to Dr. Okonkwo & LUTH</p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)", marginTop: "var(--sp-1)" }}>📍 GPS location shared with Emeka (partner)</p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)", marginTop: "var(--sp-1)" }}>📞 Calling Lagos University Teaching Hospital...</p>
          </div>
        )}
        <div style={{ display: "flex", gap: "var(--gap-md)" }}>
          <button onClick={() => window.open("tel:199")} className="btn-primary"
            style={{ background: "var(--rd)", color: "#fff" }}>📞 Call 199 (NEMA)</button>
          <button onClick={onClose} className="btn-primary"
            style={{ background: "var(--warm)", color: "var(--md)", border: "1px solid var(--border)" }}>Close</button>
        </div>
      </div>
    </div>
  );
}
