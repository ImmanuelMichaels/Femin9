// ============================================================
// MamaBloom — App Header (with menu button)
// src/components/layout/Header.jsx
// ============================================================

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Header({ onSOS, onMenuOpen }) {
  const [lang, setLang] = useState("EN");
  const { profile }     = useAuth();

  const firstName = profile?.firstName || "Mama";
  const week      = profile?.currentWeek;
  const pills     = [
    week ? `Week ${week} · ${profile?.trimester === 1 ? "1st" : profile?.trimester === 2 ? "2nd" : "3rd"} Trimester` : "Pregnancy Tracker",
    "3/6 supplements",
    week ? `Baby: ${week >= 24 ? "600g 🌽" : "Growing 🌱"}` : "Track Baby",
  ];

  return (
    <div style={{ background: "linear-gradient(145deg,#3D1A0A 0%,#7C3A1E 45%,#C4603A 100%)", padding: "20px 16px 26px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
      {/* Decorative bg circle */}
      <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>

          {/* Left: Hamburger + Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Hamburger menu button */}
            <button
              onClick={onMenuOpen}
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 10, width: 38, height: 38, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", padding: 8, flexShrink: 0 }}
              aria-label="Open menu"
            >
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: i === 1 ? 14 : 18, height: 2, background: "rgba(255,255,255,0.9)", borderRadius: 1 }} />
              ))}
            </button>

            <div className="sf" style={{ fontSize: 22, color: "#fff", fontStyle: "italic" }}>
              Mama<b style={{ fontStyle: "normal", color: "#E8956D" }}>Bloom</b>
            </div>
          </div>

          {/* Right: Language switcher + SOS */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: 3 }}>
              {["EN", "YO", "IG", "HA", "PID"].map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{ padding: "3px 7px", borderRadius: 14, fontSize: 9, fontWeight: 700, background: lang === l ? "rgba(255,255,255,0.9)" : "none", color: lang === l ? "#C4603A" : "rgba(255,255,255,0.7)", border: "none", cursor: "pointer" }}
                >{l}</button>
              ))}
            </div>
            <button
              onClick={onSOS}
              style={{ background: "rgba(192,57,43,0.85)", border: "1px solid rgba(255,100,80,0.4)", borderRadius: 20, padding: "5px 11px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", animation: "pu 2s infinite" }}
            >🚨 SOS</button>
          </div>
        </div>

        <p className="sf" style={{ fontSize: 17, color: "rgba(255,255,255,0.95)", marginBottom: 3 }}>
          Good morning, <b>{firstName}</b> 🌸
        </p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>
          Lagos, NG · Your AI companion is ready
        </p>

        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {[["#E8956D", pills[0]], ["#6AAB7C", pills[1]], ["#E8956D", pills[2]]].map(([dot, txt], i) => (
            <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,255,255,0.18)", padding: "3px 9px", borderRadius: 14, fontSize: 10, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: dot }} />{txt}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
