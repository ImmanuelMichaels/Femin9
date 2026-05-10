import { useState } from 'react';
import { WCard, Tag } from '../../components/ui';
import DrugSafetyChecker from '../../components/cards/DrugSafetyChecker';
import { DV_CONTACTS, SEXUAL_HEALTH, REPORT_STEPS, FREE_CLINICS } from '../../data/safety';

const HUB_TABS = [
  { id:"dv",     label:"🆘 DV Help" },
  { id:"sexual", label:"🩺 Sexual Health" },
  { id:"report", label:"📋 Report Incident" },
  { id:"condoms",label:"🩹 Free Clinics" },
  { id:"drugs",  label:"💊 Safety Check" },
];

export default function Safety() {
  const [tab, setTab] = useState("dv");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "var(--pad-y) var(--pad-x) 0" }}>
        <div style={{ fontWeight: 800, fontSize: "var(--fs-xl)", color: "var(--dp)" }}>🛡️ Safety Hub</div>
        <div style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", marginTop: 3 }}>Support, rights & health safety</div>
      </div>
      <div style={{ display: "flex", overflowX: "auto", gap: 8, padding: "var(--sp-3) var(--pad-x)", scrollbarWidth: "none" }}>
        {HUB_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "8px 14px", borderRadius: 22, flexShrink: 0, fontSize: "var(--fs-xs)", fontWeight: 700, background: tab === t.id ? "var(--dp)" : "var(--card)", color: tab === t.id ? "#fff" : "var(--mt)", border: `1.5px solid ${tab === t.id ? "var(--dp)" : "var(--border)"}`, cursor: "pointer", minHeight: "var(--touch)" }}>{t.label}</button>
        ))}
      </div>

      <div className="fu" style={{ flex: 1, overflowY: "auto", padding: "0 var(--pad-x) calc(var(--nav-h) + var(--sp-4))" }}>
        {tab === "dv" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
            <WCard style={{ background: "var(--rdl)", border: "1.5px solid var(--rdm)33" }}>
              <div style={{ fontWeight: 800, fontSize: "var(--fs-md)", color: "var(--rd)", marginBottom: 6 }}>🆘 You Are Not Alone</div>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>Domestic violence affects 1 in 3 women in Nigeria. Help is available — free, confidential, and open to all women.</div>
            </WCard>
            {DV_CONTACTS.map((c, i) => (
              <WCard key={i}>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 8 }}>{c.flag} {c.country}</div>
                {c.lines.map((l, j) => (
                  <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: j < c.lines.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)" }}>{l.name}</div>
                    <a href={`tel:${l.num.replace(/\s/g,"")}`} style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--rd)", background: "var(--rdl)", padding: "5px 10px", borderRadius: 12, textDecoration: "none" }}>{l.num}</a>
                  </div>
                ))}
              </WCard>
            ))}
          </div>
        )}

        {tab === "sexual" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
            {SEXUAL_HEALTH.map((s, i) => (
              <WCard key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: "var(--bll)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{s.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{s.title}</div>
                    <Tag label={s.tag} bg="var(--bll)" tc="var(--bl)" />
                  </div>
                  <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </WCard>
            ))}
          </div>
        )}

        {tab === "report" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
            <WCard style={{ background: "var(--gdl)" }}>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--gd)", marginBottom: 4 }}>📋 6-Step Incident Guide</div>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)" }}>Follow these steps to report domestic violence safely and effectively.</div>
            </WCard>
            {REPORT_STEPS.map((s, i) => (
              <WCard key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: "var(--t)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-sm)", fontWeight: 800, color: "#fff" }}>{s.n}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>{s.body}</div>
                </div>
              </WCard>
            ))}
          </div>
        )}

        {tab === "condoms" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
            <WCard style={{ background: "var(--sgl)" }}>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--sg)", marginBottom: 4 }}>🩹 Free & Low-Cost Care</div>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)" }}>Free condoms, STI testing, and contraception near you.</div>
            </WCard>
            {FREE_CLINICS.map((c, i) => (
              <WCard key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{c.flag} {c.name}</div>
                  <Tag label={c.area} bg="var(--sgl)" tc="var(--sg)" />
                </div>
                <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)" }}>{c.detail}</div>
              </WCard>
            ))}
          </div>
        )}

        {tab === "drugs" && <DrugSafetyChecker />}
      </div>
    </div>
  );
}
