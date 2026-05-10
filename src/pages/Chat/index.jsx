import { useState } from 'react';
import AIAssistant from './AIAssistant';
import { WCard, Pill, Tag } from '../../components/ui';

export default function Chat() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", gap: "var(--gap-sm)", padding: "var(--sp-4) var(--pad-x) var(--sp-3)", overflowX: "auto", scrollbarWidth: "none", flexShrink: 0 }}>
        {["chat","support","records","offline"].map(t => (
          <Pill key={t} label={t === "chat" ? "💬 Chat" : t === "support" ? "👩‍⚕️ Human" : t === "records" ? "📋 Records" : "📴 Offline"} active={activeTab === t} onClick={() => setActiveTab(t)} />
        ))}
      </div>

      {activeTab === "chat" && <AIAssistant />}

      {activeTab === "support" && (
        <div className="scroll-area" style={{ padding: "0 var(--pad-x) calc(var(--nav-h) + var(--sp-5))" }}>
          {[
            { name: "Nurse Chiamaka Obi", spec: "Midwife & Lactation Consultant", status: "Available", lang: "EN, IG" },
            { name: "Nurse Fatima Al-Hassan", spec: "Antenatal & Postnatal Care", status: "Available", lang: "EN, HA" },
            { name: "Dr. Segun Adeyemi", spec: "Obstetrician (Video Consult)", status: "In 30 mins", lang: "EN, YO" }
          ].map((p, i) => (
            <WCard key={i} style={{ padding: "var(--card-p)" }}>
              <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "center" }}>
                <div style={{ width: "var(--icon-md)", height: "var(--icon-md)", flexShrink: 0, borderRadius: "var(--r)", background: "var(--sgl)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-xl)" }}>👩‍⚕️</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</p>
                  <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginBottom: "var(--sp-2)" }}>{p.spec}</p>
                  <div style={{ display: "flex", gap: "var(--gap-sm)" }}>
                    <Tag label={p.status} bg={p.status === "Available" ? "var(--sgl)" : "var(--gdl)"} tc={p.status === "Available" ? "var(--sg)" : "var(--gd)"} />
                    <Tag label={p.lang} bg="var(--bll)" tc="var(--bl)" />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-sm)", flexShrink: 0 }}>
                  <button style={{ background: "var(--dp)", color: "#fff", border: "none", borderRadius: 20, padding: "clamp(5px,1.2vw,7px) clamp(11px,2.8vw,15px)", fontSize: "var(--fs-xs)", fontWeight: 800, cursor: "pointer" }}>💬 Chat</button>
                  <button style={{ background: "var(--sg)", color: "#fff", border: "none", borderRadius: 20, padding: "clamp(5px,1.2vw,7px) clamp(11px,2.8vw,15px)", fontSize: "var(--fs-xs)", fontWeight: 800, cursor: "pointer" }}>📞 Call</button>
                </div>
              </div>
            </WCard>
          ))}
        </div>
      )}

      {activeTab === "records" && (
        <div className="scroll-area" style={{ padding: "0 var(--pad-x) calc(var(--nav-h) + var(--sp-5))" }}>
          {[
            { i:"🧪", l:"Blood Test Results", d:"Jan 28, 2025", s:"Uploaded" },
            { i:"🔬", l:"Ultrasound Report (Week 22)", d:"Jan 15, 2025", s:"Uploaded" },
            { i:"📋", l:"Antenatal Care Card", d:"Dec 20, 2024", s:"Uploaded" },
            { i:"💉", l:"Vaccination Record", d:"Jan 12, 2025", s:"Partial" },
            { i:"📊", l:"Growth Chart", d:"Jan 28, 2025", s:"Auto-generated" }
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "var(--sp-4) 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: "var(--icon-sm)", height: "var(--icon-sm)", flexShrink: 0, borderRadius: "var(--r)", background: "var(--warm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-xl)" }}>{r.i}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: "var(--dp)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.l}</p>
                <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>{r.d}</p>
              </div>
              <Tag label={r.s} bg={r.s === "Uploaded" ? "var(--sgl)" : r.s === "Auto-generated" ? "var(--bll)" : "var(--gdl)"} tc={r.s === "Uploaded" ? "var(--sg)" : r.s === "Auto-generated" ? "var(--bl)" : "var(--gd)"} />
            </div>
          ))}
          <div style={{ display: "flex", gap: "var(--gap-md)", marginTop: "var(--sp-5)" }}>
            <button className="btn-primary" style={{ background: "var(--dp)", color: "#fff" }}>+ Upload Record</button>
            <button className="btn-primary" style={{ background: "var(--sg)", color: "#fff" }}>📤 Share</button>
          </div>
        </div>
      )}

      {activeTab === "offline" && (
        <div className="scroll-area" style={{ padding: "var(--sp-4) var(--pad-x) calc(var(--nav-h) + var(--sp-5))" }}>
          <WCard style={{ background: "var(--sgl)", border: "1px solid var(--sgm)44" }}>
            <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--sg)", marginBottom: "var(--sp-2)" }}>📴 Offline AI Mode — Active</p>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>On-device intelligence is active. Core features work without internet. Data syncs automatically when connected.</p>
          </WCard>
          {[
            "Emergency contacts stored locally",
            "Nigerian foods database: 340 foods",
            "Symptom checker available offline",
            "Last sync: Today 9:41 AM",
            "Storage used: 42 MB / 500 MB"
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "var(--gap-md)", alignItems: "center", padding: "var(--sp-3) 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--sg)", flexShrink: 0 }} />
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--dp)", fontWeight: 500 }}>{item}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
