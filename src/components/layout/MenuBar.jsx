// ============================================================
// MamaBloom — Sidebar Menu
// src/components/layout/MenuBar.jsx
// ============================================================

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const MENU_ITEMS = [
  { section: "Main",    items: [
    { id: "home",       icon: "🏠", label: "Home",              tab: "home"      },
    { id: "assistant",  icon: "🤖", label: "AI Daily Briefing", tab: "assistant" },
    { id: "chat",       icon: "🌿", label: "Bloom AI Chat",     tab: "chat"      },
  ]},
  { section: "Health",  items: [
    { id: "vitals",     icon: "❤️", label: "Vital Signs",       tab: "vitals"    },
    { id: "health",     icon: "🩺", label: "Health Tools & QR", tab: "health"    },
    { id: "mental",     icon: "💚", label: "Mental Health",     tab: "mental"    },
  ]},
  { section: "Baby",    items: [
    { id: "kicks",      icon: "👶", label: "Kick Counter",      tab: "kicks"     },
    { id: "baby",       icon: "🍼", label: "Baby Tracker",      tab: "baby"      },
  ]},
  { section: "Nutrition", items: [
    { id: "nutrition",  icon: "🥗", label: "Nigerian Nutrition",tab: "nutrition" },
  ]},
  { section: "Support", items: [
    { id: "partner",    icon: "👨‍👩‍👧", label: "Partner Mode",   tab: "partner"   },
  ]},
];

export default function MenuBar({ active, setActive, onClose, onSOS }) {
  const { user, profile, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleNav = (tab) => {
    setActive(tab);
    onClose();
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    // Page will re-render to AuthScreen via App.jsx
  };

  const initials = profile
    ? `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase()
    : "MB";

  const weekBadge = profile?.currentWeek ? `Week ${profile.currentWeek}` : null;
  const trimBadge = profile?.trimester ? `Trimester ${profile.trimester}` : null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 800, animation: "fi 0.2s ease" }}
        className="fi"
      />

      {/* Drawer */}
      <div
        className="fi"
        style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 290, background: "#fff", zIndex: 900, display: "flex", flexDirection: "column", overflowY: "auto", boxShadow: "4px 0 32px rgba(0,0,0,0.2)", animation: "slideIn 0.3s cubic-bezier(0.25,0.46,0.45,0.94)" }}
      >
        {/* Profile header */}
        <div style={{ background: "linear-gradient(145deg,#3D1A0A,#7C3A1E,#C4603A)", padding: "44px 20px 24px", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>×</button>

          <div style={{ width: 58, height: 58, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            {profile?.avatarUrl
              ? <img src={profile.avatarUrl} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              : initials}
          </div>

          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#fff", fontWeight: 400, marginBottom: 2 }}>
            {profile ? `${profile.firstName} ${profile.lastName}` : "Welcome"}
          </p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginBottom: weekBadge ? 10 : 0 }}>
            {user?.email}
          </p>

          {(weekBadge || trimBadge) && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {weekBadge  && <span style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)", padding: "3px 9px", borderRadius: 10, fontSize: 10, fontWeight: 600 }}>{weekBadge}</span>}
              {trimBadge  && <span style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)", padding: "3px 9px", borderRadius: 10, fontSize: 10, fontWeight: 600 }}>{trimBadge}</span>}
              {user?.role && <span style={{ background: "rgba(232,149,109,0.3)", color: "#E8956D", padding: "3px 9px", borderRadius: 10, fontSize: 10, fontWeight: 600 }}>{user.role}</span>}
            </div>
          )}
        </div>

        {/* SOS Button */}
        <button onClick={() => { onClose(); onSOS(); }}
          style={{ margin: "16px 16px 4px", padding: "11px", background: "#FDECEA", border: "1.5px solid #E74C3C", borderRadius: 12, fontSize: 13, fontWeight: 700, color: "#C0392B", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, animation: "pu 2s infinite" }}>
          🚨 Emergency / SOS
        </button>

        {/* Navigation sections */}
        <div style={{ flex: 1, padding: "8px 12px", overflowY: "auto" }}>
          {MENU_ITEMS.map((section) => (
            <div key={section.section} style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#9B7260", letterSpacing: 1, padding: "8px 8px 4px", textTransform: "uppercase" }}>
                {section.section}
              </p>
              {section.items.map((item) => {
                const isActive = active === item.tab;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.tab)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 11, border: "none", background: isActive ? "#FDF6EE" : "none", cursor: "pointer", textAlign: "left", transition: "background 0.15s", marginBottom: 2 }}
                  >
                    <span style={{ fontSize: 19, width: 28, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? "#C4603A" : "#1A0A00" }}>{item.label}</span>
                    {isActive && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#C4603A" }} />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div style={{ padding: "12px 16px 32px", borderTop: "1px solid #EAD5C0" }}>
          <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 11, border: "none", background: "none", cursor: "pointer", marginBottom: 4, textAlign: "left" }}>
            <span style={{ fontSize: 19, width: 28, textAlign: "center" }}>⚙️</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#1A0A00" }}>Settings</span>
          </button>
          <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 11, border: "none", background: "none", cursor: "pointer", marginBottom: 4, textAlign: "left" }}>
            <span style={{ fontSize: 19, width: 28, textAlign: "center" }}>📁</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#1A0A00" }}>Health Records</span>
          </button>
          <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 11, border: "none", background: "none", cursor: "pointer", marginBottom: 4, textAlign: "left" }}>
            <span style={{ fontSize: 19, width: 28, textAlign: "center" }}>🔔</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#1A0A00" }}>Notifications</span>
          </button>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 11, border: "1.5px solid #EAD5C0", background: loggingOut ? "#f5f5f5" : "#fff", cursor: loggingOut ? "not-allowed" : "pointer", marginTop: 8 }}>
            <span style={{ fontSize: 19, width: 28, textAlign: "center" }}>🚪</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#C0392B" }}>{loggingOut ? "Signing out..." : "Sign Out"}</span>
          </button>

          <p style={{ textAlign: "center", fontSize: 10, color: "#9B7260", marginTop: 14 }}>
            MamaBloom v1.0 · Nigeria-First 🌍
          </p>
        </div>
      </div>
    </>
  );
}
