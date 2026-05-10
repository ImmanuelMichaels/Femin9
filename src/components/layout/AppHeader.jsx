import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JOURNEY_CONFIG } from '../../data/journey';

export default function AppHeader({ onSOS }) {
  const { journeyType } = useApp();
  const [lang, setLang] = useState("EN");
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const cfg = JOURNEY_CONFIG[journeyType] || JOURNEY_CONFIG.pregnant;
  const greetingName = journeyType === "menopause" ? "Amara" : "Adaeze";

  return (
    <div className="app-header">
      <div className="header-top">
        <div style={{ flex: 1, minWidth: 0, paddingRight: "var(--sp-3)" }}>
          <p className="header-date">{dateStr}</p>
          <div className="serif header-greeting" style={{ color: "var(--dp)" }}>
            Good morning, <span style={{ color: "var(--t)" }}>{greetingName}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-sm)", flexShrink: 0 }}>
          <button onClick={onSOS} style={{
            background: "var(--rdl)", border: "1.5px solid var(--rdm)",
            borderRadius: 20, padding: "clamp(5px,1.2vw,7px) clamp(10px,2.5vw,14px)",
            color: "var(--rd)", fontSize: "var(--fs-xs)", fontWeight: 800,
            cursor: "pointer", animation: "pu 2.5s infinite", letterSpacing: 0.3,
            minHeight: "var(--touch)"
          }}>🚨 SOS</button>
          <div style={{
            width: "var(--avatar)", height: "var(--avatar)", borderRadius: "50%",
            background: "linear-gradient(145deg,#FDE8DB,#E8F5EC)",
            border: "2.5px solid var(--t)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "clamp(18px,4.5vw,24px)", flexShrink: 0
          }}>👩🏾</div>
        </div>
      </div>
      <div className="pill-strip">
        {cfg.pills.map((p, i) => (
          <div key={i} className="status-pill" style={{ background: p.bg }}>
            <div className="status-dot" style={{ background: p.dot }} />
            {p.label}
          </div>
        ))}
      </div>
      <div className="lang-switch">
        {["EN", "YO", "IG", "HA", "PID"].map(l => (
          <button key={l} onClick={() => setLang(l)} className="lang-btn"
            style={{
              background: lang === l ? "var(--t)" : "transparent",
              color: lang === l ? "#fff" : "var(--mt)"
            }}>{l}</button>
        ))}
      </div>
    </div>
  );
}
