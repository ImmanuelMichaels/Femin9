import { Home, Menu, User } from 'lucide-react';
import { useApp } from '../../context/useApp';
import './BottomNav.css';

export default function BottomNav({ active, setActive }) {
  const handleTabClick = (id) => {
    setActive(id);
    if (window.navigator?.vibrate) window.navigator.vibrate(8);
  };

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      <button
        onClick={() => handleTabClick('home')}
        className={`bottom-nav-item ${active === 'home' ? 'active' : ''}`}
        aria-label="Home"
        aria-current={active === 'home' ? 'page' : undefined}
      >
        <div className="bottom-nav-icon-wrapper">
          <Home size={24} strokeWidth={active === 'home' ? 2.75 : 2} />
          {active === 'home' && <div className="bottom-nav-active-dot" />}
        </div>
        <span className="bottom-nav-label">Home</span>
      </button>

      <button
        onClick={() => handleTabClick('menu')}
        className={`bottom-nav-item ${active === 'menu' ? 'active' : ''}`}
        aria-label="Menu"
        aria-current={active === 'menu' ? 'page' : undefined}
      >
        <div className="bottom-nav-icon-wrapper">
          <Menu size={24} strokeWidth={active === 'menu' ? 2.75 : 2} />
          {active === 'menu' && <div className="bottom-nav-active-dot" />}
        </div>
        <span className="bottom-nav-label">Menu</span>
      </button>

      <button
        onClick={() => handleTabClick('profile')}
        className={`bottom-nav-item ${active === 'profile' ? 'active' : ''}`}
        aria-label="Profile"
        aria-current={active === 'profile' ? 'page' : undefined}
      >
        <div className="bottom-nav-icon-wrapper">
          <User size={24} strokeWidth={active === 'profile' ? 2.75 : 2} />
          {active === 'profile' && <div className="bottom-nav-active-dot" />}
        </div>
        <span className="bottom-nav-label">Profile</span>
      </button>
    </nav>
  );
}