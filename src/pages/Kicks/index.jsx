import { useState, useEffect } from 'react';
import { WCard, SectionTitle, Tag } from '../../components/ui';
import { formatTime } from '../../utils/helpers';

export default function Kicks() {
  const [kicks, setKicks] = useState(7);
  const [session, setSession] = useState(false);
  const [sessionKicks, setSessionKicks] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const history = [
    { date: "Today", kicks: 7, status: "normal" }, { date: "Yesterday", kicks: 10, status: "normal" },
    { date: "2d ago", kicks: 4, status: "low" }, { date: "3d ago", kicks: 11, status: "normal" },
    { date: "4d ago", kicks: 9, status: "normal" }, { date: "5d ago", kicks: 12, status: "high" },
    { date: "6d ago", kicks: 8, status: "normal" },
  ];
  const maxKick = Math.max(...history.map(h => h.kicks));

  useEffect(() => {
    let t;
    if (session) t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [session, startTime]);

  const startSession = () => { setSession(true); setSessionKicks(0); setStartTime(Date.now()); setElapsed(0); };
  const logKick = () => { setSessionKicks(k => k + 1); setKicks(k => k + 1); };
  const stopSession = () => setSession(false);

  const status = kicks >= 10 ? "GOOD" : kicks >= 6 ? "MONITOR" : "LOW";
  const [bg, border] = kicks >= 10
    ? ["linear-gradient(135deg,var(--sgl),#D4F0DD)", "var(--sgm)"]
    : kicks >= 6
    ? ["linear-gradient(135deg,var(--gdl),#FEE8C8)", "var(--gdm)"]
    : ["linear-gradient(135deg,var(--rdl),#FCE0DE)", "var(--rdm)"];

  return (
    <div className="page-pad">
      <SectionTitle title="👶 Kick Counter" />

      <WCard style={{ background: bg, border: `1.5px solid ${border}44` }}>
        <div style={{ textAlign: "center", padding: "var(--sp-3) 0 var(--sp-4)" }}>
          <div style={{ fontSize: "var(--fs-hero)", fontWeight: 900, color: kicks >= 10 ? "var(--sg)" : kicks >= 6 ? "var(--gd)" : "var(--rd)", lineHeight: 1, marginBottom: "var(--sp-2)" }}>
            {sessionKicks || kicks}
          </div>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", fontWeight: 600, marginBottom: "var(--sp-2)" }}>kicks logged today</p>
          <Tag
            label={status === "GOOD" ? "✅ Normal" : status === "MONITOR" ? "⚠️ Keep watching" : "🚨 Seek help"}
            bg={kicks >= 10 ? "var(--sgl)" : kicks >= 6 ? "var(--gdl)" : "var(--rdl)"}
            tc={kicks >= 10 ? "var(--sg)" : kicks >= 6 ? "var(--gd)" : "var(--rd)"}
          />
          {session && <p style={{ fontSize: "var(--fs-2xl)", fontWeight: 800, color: "var(--dp)", marginTop: "var(--sp-3)" }}>{formatTime(elapsed)}</p>}
        </div>
        {!session ? (
          <button onClick={startSession} className="btn-primary" style={{ background: "var(--dp)", color: "#fff" }}>▶ Start Session</button>
        ) : (
          <div style={{ display: "flex", gap: "var(--gap-md)" }}>
            <button onClick={logKick} style={{ flex: 2, padding: "var(--sp-4)", background: "var(--sg)", color: "#fff", border: "none", borderRadius: "var(--r)", fontSize: "var(--fs-md)", fontWeight: 800, cursor: "pointer", minHeight: "var(--touch)" }}>👶 Kick! ({sessionKicks})</button>
            <button onClick={stopSession} style={{ flex: 1, padding: "var(--sp-4)", background: "var(--warm)", color: "var(--md)", border: "1px solid var(--border)", borderRadius: "var(--r)", fontSize: "var(--fs-sm)", fontWeight: 700, cursor: "pointer", minHeight: "var(--touch)" }}>⏹ Stop</button>
          </div>
        )}
      </WCard>

      <WCard style={{ background: "var(--lvl)", border: "1px solid var(--lvm)44" }}>
        <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--lv)", marginBottom: "var(--sp-3)" }}>🤖 AI Movement Intelligence</p>
        {[
          { l: "Today's pattern", v: "Normal — moderate activity", dot: "var(--sg)" },
          { l: "Best movement time", v: "10 AM–12 PM (predicted)", dot: "var(--lv)" },
          { l: "Your baseline", v: "9.7 kicks/2hr", dot: "var(--bl)" },
          { l: "Alert threshold", v: "Below 7 → investigate", dot: "var(--rd)" }
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "clamp(6px,1.5vw,9px) 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
            <span style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", flex: 1 }}>{s.l}</span>
            <span style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: "var(--dp)" }}>{s.v}</span>
          </div>
        ))}
      </WCard>

      <SectionTitle title="7-Day History" />
      <WCard>
        <div className="chart-wrap">
          {history.map((h, i) => (
            <div key={i} className="chart-col">
              <span className="chart-val">{h.kicks}</span>
              <div className="chart-bar" style={{ height: `${(h.kicks / (maxKick + 2)) * 100}%`, background: h.status === "normal" ? "var(--sg)" : h.status === "low" ? "var(--rd)" : "var(--t)" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "var(--gap-sm)" }}>
          {history.map((h, i) => (
            <div key={i} className="chart-lbl" style={{ flex: 1 }}>
              {h.date.replace("days ago","d").replace("Yesterday","Yst").replace("Today","Now")}
            </div>
          ))}
        </div>
        <div style={{ marginTop: "var(--sp-3)", padding: "var(--sp-3)", background: "var(--rdl)", borderRadius: "var(--r)", display: "flex", gap: "var(--gap-sm)", alignItems: "center" }}>
          <span style={{ fontSize: "var(--fs-md)" }}>⚠️</span>
          <p style={{ fontSize: "var(--fs-xs)", color: "var(--rd)", fontWeight: 600 }}>2 days ago: Only 4 kicks. AI flagged as reduced movement.</p>
        </div>
      </WCard>
    </div>
  );
}
