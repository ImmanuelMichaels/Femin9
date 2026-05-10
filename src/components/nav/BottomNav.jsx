import { Home, Menu, Settings } from 'lucide-react';

export default function BottomNav({ active, setActive }) {
  const tabs = [
    { id: "home",     Icon: Home,     label: "Home"     },
    { id: "menu",     Icon: Menu,     label: "Menu"     },
    { id: "settings", Icon: Settings, label: "Settings" },
  ];

  const NAV_TAB_IDS = ["home", "menu", "settings"];
  
  const isActive = (id) => {
    if (active === id) return true;
    if (id === "menu" && !NAV_TAB_IDS.includes(active)) return true;
    return false;
  };

  return (
    <nav className="bottom-nav" style={{ justifyContent: "space-around" }}>
      {tabs.map(t => (
        <button key={t.id} className="nav-btn" onClick={() => setActive(t.id)}>
          <div className={`nav-icon${isActive(t.id) ? " active" : ""}`}>
            <t.Icon size={20} strokeWidth={2.5} />
          </div>
          <span className={`nav-label${isActive(t.id) ? " active" : ""}`}>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
