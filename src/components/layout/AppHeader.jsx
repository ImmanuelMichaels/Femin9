import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JOURNEY_CONFIG } from '../../data/journey';
import { useNotifications } from '../../pages/NotificationsContext';

export default function AppHeader() {
  const { journeyType } = useApp();
  const { notifications, markAllRead, unreadCount } = useNotifications();
  const [lang, setLang] = useState("EN");
  const [showNotifs, setShowNotifs] = useState(false);

  const today = new Date();
  const cfg = JOURNEY_CONFIG[journeyType] || JOURNEY_CONFIG.pregnant;
  const greetingName = journeyType === "menopause" ? "Amara" : "Adaeze";

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleBellClick = () => {
    setShowNotifs(p => !p);
    markAllRead();
  };

  return (
    <div style={{
      background: "#fdf6ff",
      padding: "16px 20px 0",
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* ── Row 1: Greeting + EN/SOS ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
      }}>
        {/* Greeting */}
        <h1 style={{
          margin: 0,
          fontSize: "clamp(20px, 5vw, 24px)",
          fontWeight: 700,
          color: "#1a1a1a",
          letterSpacing: "-0.3px",
          lineHeight: 1.2,
          flex: 1,
          paddingRight: 12,
        }}>
          {getGreeting()}, {greetingName}&nbsp;
          <span role="img" aria-label="wave" style={{ fontSize: "0.95em" }}>👋</span>
        </h1>

        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>

          {/* Language toggle — globe + dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowNotifs(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px 2px",
              }}
            >
              {/* Globe SVG */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b21a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>{lang}</span>
              {/* Chevron */}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Language dropdown (hidden by default, can be wired up) */}
            <div style={{ display: "none" }}>
              {["EN", "YO", "IG", "HA", "PID"].map(l => (
                <button key={l} onClick={() => setLang(l)}>{l}</button>
              ))}
            </div>
          </div>

          {/* SOS Button */}
          <button
            style={{
              background: "#ffe4ef",
              border: "none",
              borderRadius: 20,
              padding: "7px 16px",
              fontSize: 13,
              fontWeight: 700,
              color: "#e91e8c",
              cursor: "pointer",
              letterSpacing: "0.5px",
              lineHeight: 1,
            }}
          >
            SOS
          </button>
        </div>
      </div>

      {/* ── Row 2: Status pills ── */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        paddingBottom: 16,
      }}>
        {cfg.pills.map((p, i) => (
          <div
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: p.bg || "#f3e8ff",
              borderRadius: 20,
              padding: "6px 13px",
              fontSize: 13,
              fontWeight: 500,
              color: "#4a1d6e",
              whiteSpace: "nowrap",
            }}
          >
            {p.icon && <span style={{ fontSize: 14 }}>{p.icon}</span>}
            {p.dot && (
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: p.dot, flexShrink: 0, display: "inline-block"
              }} />
            )}
            {p.label}
          </div>
        ))}
      </div>

      {/* ── Notification dropdown (bell-triggered, kept from original) ── */}
      {showNotifs && (
        <div style={{
          position: "absolute", top: 70, right: 20,
          width: 270, background: "#fff",
          borderRadius: 14, boxShadow: "0 8px 28px rgba(0,0,0,0.13)",
          border: "1px solid #e8f5ec", zIndex: 100, overflow: "hidden"
        }}>
          <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid #f0faf3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#1a1a1a" }}>Today's Activity</span>
            <span style={{ fontSize: 11, color: "#888" }}>{today.toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</span>
          </div>

          <div style={{ maxHeight: 260, overflowY: "auto" }}>
            {["done", "upcoming"].map(section => (
              <div key={section}>
                <div style={{ padding: "6px 14px 4px", fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.8, background: "#fafafa" }}>
                  {section === "done" ? "✔ Completed" : "⏳ Coming Up"}
                </div>
                {notifications.filter(n => n.type === section).map(n => (
                  <div key={n.id} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 14px", borderBottom: "1px solid #f5f5f5",
                    background: section === "done" ? "#fafff9" : "#fff"
                  }}>
                    <span style={{ fontSize: 18 }}>{n.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: section === "done" ? "#6ab04c" : "#1a1a1a", lineHeight: 1.3 }}>{n.label}</div>
                      <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{n.time}</div>
                    </div>
                    {section === "done" && <span style={{ fontSize: 11, color: "#6ab04c", fontWeight: 700 }}>Done</span>}
                    {section === "upcoming" && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffb300", flexShrink: 0, display: "inline-block" }} />}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ padding: "8px 14px", textAlign: "center", borderTop: "1px solid #f0faf3" }}>
            <button onClick={() => setShowNotifs(false)} style={{ background: "none", border: "none", color: "#6b21a8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              View full schedule →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}