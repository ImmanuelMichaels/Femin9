import { useState } from 'react';
import { WCard, SectionTitle, Tag, IconBox } from '../../components/ui';

export default function Baby() {
  const [feeds, setFeeds] = useState({ left: 12, right: 10, total: 8, last: "right" });
  const [diapers, setDiapers] = useState([
    { t: "7:20 AM", type: "Wet" },
    { t: "5:45 AM", type: "Dirty" }
  ]);
  const [pumpMode, setPumpMode] = useState(false);

  return (
    <div className="page-pad">
      <SectionTitle title="Baby Tracker" />

      {/* Breastfeeding */}
      <WCard>
        <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-4)" }}>🤱 Breastfeeding</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap-md)", marginBottom: "var(--sp-4)" }}>
          {[
            { side: "Left", mins: feeds.left, bg: "var(--gdl)", tc: "var(--gd)" },
            { side: "Right", mins: feeds.right, bg: "var(--sgl)", tc: "var(--sg)" }
          ].map(b => (
            <div key={b.side} style={{ background: b.bg, borderRadius: "var(--r)", padding: "var(--card-p)", textAlign: "center", border: `1.5px solid ${b.tc}44` }}>
              <div style={{ fontSize: "var(--fs-xl)", marginBottom: "var(--sp-2)" }}>{b.side === "Left" ? "◀" : "▶"}</div>
              <div style={{ fontSize: "var(--fs-xl)", fontWeight: 900, color: b.tc }}>{b.mins}<span style={{ fontSize: "var(--fs-sm)" }}> min</span></div>
              <div style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginTop: "var(--sp-1)", fontWeight: 600 }}>{b.side} breast</div>
            </div>
          ))}
        </div>
        <div style={{ background: "var(--bll)", borderRadius: "var(--r)", padding: "var(--sp-3) var(--card-p)", marginBottom: "var(--sp-3)" }}>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--bl)", fontWeight: 800 }}>🔄 Start next feed: {feeds.last === "right" ? "LEFT" : "RIGHT"} breast</p>
        </div>
        <div style={{ display: "flex", gap: "var(--gap-md)", marginBottom: "var(--sp-3)" }}>
          {["Start Left","Start Right"].map((btn, i) => (
            <button key={i} onClick={() => setFeeds(f => ({ ...f, total: f.total + 1, last: i === 0 ? "left" : "right" }))} style={{ flex: 1, padding: "var(--sp-3)", background: i === 0 ? "var(--t)" : "var(--sg)", color: "#fff", border: "none", borderRadius: "var(--r)", fontSize: "var(--fs-sm)", fontWeight: 800, cursor: "pointer", minHeight: "var(--touch)" }}>{btn}</button>
          ))}
        </div>
        <button onClick={() => setPumpMode(!pumpMode)} style={{ width: "100%", padding: "var(--sp-3)", background: pumpMode ? "var(--lv)" : "var(--lvl)", color: pumpMode ? "#fff" : "var(--lv)", border: "1.5px solid var(--lvm)44", borderRadius: "var(--r)", fontSize: "var(--fs-sm)", fontWeight: 800, cursor: "pointer", minHeight: "var(--touch)" }}>🍼 {pumpMode ? "Stop Pumping" : "Start Pumping"}</button>
        {pumpMode && <p className="fu" style={{ fontSize: "var(--fs-xs)", color: "var(--lv)", textAlign: "center", marginTop: "var(--sp-3)", lineHeight: 1.5 }}>AI: Pump 15–20 mins each side. Best time: 30 mins after morning feed.</p>}
        <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", textAlign: "center", marginTop: "var(--sp-3)" }}>Total feeds today: {feeds.total} · AI milk supply: Optimal ✓</p>
      </WCard>

      {/* Sleep Predictor */}
      <WCard style={{ background: "linear-gradient(135deg,var(--lvl),#F8F6FE)", border: "1px solid var(--lvm)33" }}>
        <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--lv)", marginBottom: "var(--sp-4)" }}>😴 AI Sleep Predictor</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--gap-md)", marginBottom: "var(--sp-3)" }}>
          {[
            { v: "2:30 AM", l: "Last woke", tc: "var(--lv)" },
            { v: "6:45 AM", l: "Next predicted", tc: "var(--sg)" },
            { v: "14h 20m", l: "Total today", tc: "var(--t)" }
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", background: "rgba(255,255,255,0.8)", borderRadius: "var(--r)", padding: "var(--sp-3) var(--sp-2)" }}>
              <div style={{ fontSize: "var(--fs-base)", fontWeight: 900, color: s.tc, marginBottom: "var(--sp-1)" }}>{s.v}</div>
              <div style={{ fontSize: "var(--fs-2xs)", color: "var(--mt)", fontWeight: 600 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "var(--fs-xs)", color: "#5A5078", lineHeight: 1.55 }}>💜 Pattern confidence: 83%. AI alerts 15 mins before predicted next wake window.</p>
      </WCard>

      {/* Diaper Log */}
      <WCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-4)" }}>
          <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)" }}>🚼 Diaper Log</p>
          <button onClick={() => setDiapers(d => [{ t: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), type: "Wet" }, ...d])} style={{ background: "var(--dp)", color: "#fff", border: "none", borderRadius: 20, padding: "clamp(5px,1.2vw,7px) clamp(12px,3vw,16px)", fontSize: "var(--fs-xs)", fontWeight: 800, cursor: "pointer", minHeight: "var(--touch)" }}>+ Log</button>
        </div>
        {diapers.slice(0,3).map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "var(--sp-3) 0", borderBottom: i < diapers.length - 1 ? "1px solid var(--border)" : "none" }}>
            <div style={{ width: "var(--icon-sm)", height: "var(--icon-sm)", flexShrink: 0, borderRadius: "var(--r)", background: d.type === "Wet" ? "var(--bll)" : "var(--gdl)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-xl)" }}>{d.type === "Wet" ? "💧" : "💩"}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: "var(--dp)" }}>{d.type} diaper</p>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>{d.t}</p>
            </div>
            <Tag label="Normal" bg={d.type === "Wet" ? "var(--bll)" : "var(--gdl)"} tc={d.type === "Wet" ? "var(--bl)" : "var(--gd)"} />
          </div>
        ))}
        <p style={{ fontSize: "var(--fs-xs)", color: "var(--sg)", marginTop: "var(--sp-3)", fontWeight: 700 }}>✅ 2 wet + 1 dirty — Normal for 3-week-old</p>
      </WCard>

      {/* Milestones */}
      <SectionTitle title="Week 3 Milestones" />
      <WCard style={{ padding: `var(--sp-2) var(--card-p)` }}>
        {[
          { m: "Eye response to light", done: true },
          { m: "Startle reflex (Moro)", done: true },
          { m: "Responds to your voice", done: true },
          { m: "Social smile", done: false },
          { m: "Head control attempt", done: false }
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "var(--sp-3) 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
            <div style={{ width: "clamp(24px,6vw,30px)", height: "clamp(24px,6vw,30px)", flexShrink: 0, borderRadius: "50%", background: item.done ? "var(--sg)" : "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: item.done ? "#fff" : "var(--mt)", fontSize: "var(--fs-sm)", fontWeight: 800 }}>{item.done ? "✓" : "○"}</div>
            <p style={{ fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--dp)", flex: 1 }}>{item.m}</p>
            <Tag label={item.done ? "✓ Done" : "Soon"} bg={item.done ? "var(--sgl)" : "var(--warm)"} tc={item.done ? "var(--sg)" : "var(--mt)"} />
          </div>
        ))}
      </WCard>
    </div>
  );
}
