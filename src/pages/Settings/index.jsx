import { useState } from 'react';
import { WCard } from '../../components/ui';

const Toggle = ({ value, onChange, label, desc, color = "var(--sg)" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "var(--sp-4) 0", borderBottom: "1px solid var(--border)" }}>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: "var(--fs-base)", fontWeight: 700, color: "var(--dp)", marginBottom: 2 }}>{label}</p>
      {desc && <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>{desc}</p>}
    </div>
    <button onClick={() => onChange(!value)} style={{
      width: "clamp(44px,11vw,54px)", height: "clamp(24px,6vw,30px)",
      borderRadius: 30, border: "none", cursor: "pointer",
      background: value ? color : "var(--border2)",
      position: "relative", flexShrink: 0, transition: "background 0.25s"
    }}>
      <div style={{
        position: "absolute", top: "50%", transform: "translateY(-50%)",
        left: value ? "calc(100% - clamp(22px,5.5vw,27px))" : "3px",
        width: "clamp(18px,4.5vw,24px)", height: "clamp(18px,4.5vw,24px)",
        borderRadius: "50%", background: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.18)", transition: "left 0.25s"
      }} />
    </button>
  </div>
);

export default function Settings() {
  const [lang, setLang] = useState("EN");
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [kickAlerts, setKickAlerts] = useState(true);
  const [bpReminders, setBpReminders] = useState(true);

  return (
    <div className="page-pad">
      <div style={{ marginBottom: "var(--sp-5)" }}>
        <h2 className="serif" style={{ fontSize: "var(--fs-2xl)", fontWeight: 600, color: "var(--dp)", fontStyle: "italic", marginBottom: 4 }}>Settings</h2>
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)" }}>Manage your preferences</p>
      </div>

      <WCard style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-3)" }}>Profile</p>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-lg)" }}>
          <div style={{ width: "var(--icon-lg)", height: "var(--icon-lg)", borderRadius: "50%", background: "linear-gradient(145deg,#FDE8DB,#E8F5EC)", border: "2.5px solid var(--t)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(24px,6vw,32px)", flexShrink: 0 }}>👩🏾</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)", marginBottom: 2 }}>Adaeze Okafor</p>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)" }}>Week 24 · 2nd Trimester</p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--t)", fontWeight: 700, marginTop: 4 }}>adaeze@example.com</p>
          </div>
          <button style={{ background: "var(--warm)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "var(--sp-2) var(--sp-3)", fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--md)", cursor: "pointer" }}>Edit</button>
        </div>
      </WCard>

      <WCard style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-3)" }}>Language</p>
        <div className="lang-switch" style={{ width: "100%", justifyContent: "space-between" }}>
          {["EN", "YO", "IG", "HA", "PID"].map(l => (
            <button key={l} onClick={() => setLang(l)} className="lang-btn" style={{ flex: 1, textAlign: "center", background: lang === l ? "var(--t)" : "transparent", color: lang === l ? "#fff" : "var(--mt)" }}>{l}</button>
          ))}
        </div>
        <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginTop: "var(--sp-2)" }}>
          {lang === "EN" ? "English" : lang === "YO" ? "Yorùbá" : lang === "IG" ? "Igbo" : lang === "HA" ? "Hausa" : "Nigerian Pidgin"}
        </p>
      </WCard>

      <WCard style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-1)" }}>Notifications</p>
        <Toggle value={notifications} onChange={setNotifications} label="Push Notifications" desc="Daily wellness reminders and alerts" color="var(--sg)" />
        <Toggle value={kickAlerts} onChange={setKickAlerts} label="Kick Count Reminders" desc="Alert when kick session is due" color="var(--lv)" />
        <Toggle value={bpReminders} onChange={setBpReminders} label="BP Log Reminders" desc="Evening reminder to log blood pressure" color="var(--rd)" />
      </WCard>

      <WCard style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-1)" }}>Appearance</p>
        <Toggle value={darkMode} onChange={setDarkMode} label="Dark Mode" desc="Coming soon — save your eyes at night" color="var(--dp)" />
      </WCard>

      <WCard style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-3)" }}>About</p>
        {[["Version","1.0.0 (Beta)"],["Region","Nigeria + UK"],["Data","Stored securely on-device"],["Support","support@mamabloom.app"]].map(([l,v]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "var(--sp-2) 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", fontWeight: 600 }}>{l}</span>
            <span style={{ fontSize: "var(--fs-sm)", color: "var(--dp)", fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </WCard>

      <button style={{ width: "100%", padding: "var(--sp-4)", background: "var(--rdl)", border: "1.5px solid var(--rdm)44", borderRadius: "var(--r2)", color: "var(--rd)", fontSize: "var(--fs-md)", fontWeight: 800, cursor: "pointer", minHeight: "var(--touch)" }}>Sign Out</button>
    </div>
  );
}
