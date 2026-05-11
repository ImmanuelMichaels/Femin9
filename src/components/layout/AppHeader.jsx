import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JOURNEY_CONFIG } from '../../data/journey';
import { useNotifications } from '../../pages/NotificationsContext'; // ← once you create it

export default function AppHeader() {
  const { journeyType } = useApp();
  const { notifications, markAllRead, unreadCount } = useNotifications();
  const [lang, setLang] = useState("EN");
  const [showNotifs, setShowNotifs] = useState(false);

  const today = new Date();
  // const dateStr = today.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const cfg = JOURNEY_CONFIG[journeyType] || JOURNEY_CONFIG.pregnant;
  const greetingName = journeyType === "menopause" ? "Amara" : "Hilda White";

  const handleBellClick = () => {
    setShowNotifs(p => !p);
    markAllRead();
  };

  return (
    <div className="app-header">
      <div className="header-top">
        <div style={{ flex: 1, display: "flex", flexDirection: "row", minWidth: 0, paddingRight: "var(--sp-3)", alignItems: "center" }}>
          <div style={{
            width: "50px", height: "50px", borderRadius: "20%",
            background: "#E8F5EC", border: "1px solid",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginRight: "var(--sp-3)", flexShrink: 0, overflow: "hidden"
          }}>
            <img src="/images/mama.png" alt="Mama" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div className="serif header-greeting" style={{ color: "var(--dp)", display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span style={{ color: "#000", fontSize: "var(--fs-lg)", fontWeight: 400, fontFamily: "inter" }}>{greetingName}</span>
            <span style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", marginTop: 2, fontFamily: "inter" }}>user</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--gap-sm)", flexShrink: 0 }}>

          {/* Bell + Dropdown — needs position:relative as the anchor */}
          <div style={{ position: "relative" }}>
            <button
              onClick={handleBellClick}
              style={{
                background: showNotifs ? "var(--t)" : "#ffffff",
                // border: `1.5px solid ${showNotifs ? "var(--t)" : unreadCount > 0 ? "#e53935" : "#b6dfc4"}`,
                borderRadius: 20,
                padding: "clamp(5px,1.2vw,7px) clamp(10px,2.5vw,14px)",
                cursor: "pointer",
                minHeight: "var(--touch)",
                display: "flex", alignItems: "center", gap: 5,
                transition: "all 0.2s ease"
              }}
            >
              <img
                src="/icons/bell.png"
                alt="Notifications"
                style={{
                  width: 20, height: 20, objectFit: "contain",
                  // CSS filter to tint red when unread, white when panel open
                  filter: showNotifs
                    ? "brightness(0) invert(1)"
                    : unreadCount > 0
                      ? "invert(18%) sepia(99%) saturate(7481%) hue-rotate(1deg) brightness(97%) contrast(115%)"
                      : "none"
                }}
              />
              {unreadCount > 0 && (
                <span style={{
                  background: "#e53935", color: "#fff",
                  borderRadius: "50%", width: 16, height: 16,
                  fontSize: 10, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
            {/* time showing */}
          {/* <p className="header-date">{dateStr}</p> */}


            {showNotifs && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                width: 270, background: "#fff",
                borderRadius: 14, boxShadow: "0 8px 28px rgba(0,0,0,0.13)",
                border: "1px solid #e8f5ec", zIndex: 100, overflow: "hidden"
              }}>
                <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid #f0faf3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#1a1a1a" }}>Today's Activity</span>
                  <span style={{ fontSize: 11, color: "var(--mt)" }}>{today.toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</span>
                </div>

                <div style={{ maxHeight: 260, overflowY: "auto" }}>
                  {["done", "upcoming"].map(section => (
                    <div key={section}>
                      <div style={{ padding: "6px 14px 4px", fontSize: 10, fontWeight: 700, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.8, background: "#fafafa" }}>
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
                            <div style={{ fontSize: 11, color: "var(--mt)", marginTop: 2 }}>{n.time}</div>
                          </div>
                          {section === "done" && <span style={{ fontSize: 11, color: "#6ab04c", fontWeight: 700 }}>Done</span>}
                          {section === "upcoming" && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffb300", flexShrink: 0, display: "inline-block" }} />}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div style={{ padding: "8px 14px", textAlign: "center", borderTop: "1px solid #f0faf3" }}>
                  <button onClick={() => setShowNotifs(false)} style={{ background: "none", border: "none", color: "var(--t)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    View full schedule →
                  </button>
                </div>
              </div>
            )}
          </div>
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