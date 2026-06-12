import { Home, Grip, User } from 'lucide-react';

const TABS = [
  { id: 'home',    Icon: Home },
  { id: 'menu',    Icon: Grip },
  { id: 'profile', Icon: User },
];

export default function BottomNav({ active, setActive }) {
  const handleTabClick = (id) => {
    setActive(id);
    if (window.navigator?.vibrate) window.navigator.vibrate(10);
  };

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      background: 'var(--card)',
      borderTop: '1px solid var(--border)',
      padding: 'var(--sp-2) var(--sp-4)',
      paddingBottom: 'max(var(--sp-2), env(safe-area-inset-bottom))',
      zIndex: 100,
    }}>
      {TABS.map(({ id, Icon, label }) => {
        const on = active === id;
        return (
          <button
            key={id}
            onClick={() => handleTabClick(id)}
            aria-label={label}
            aria-current={on ? 'page' : undefined}
            style={{
              flex: 1,
              maxWidth: 90,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--sp-1)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--sp-1) var(--sp-2)',
              borderRadius: 'var(--r)',
              color: on ? '#7C3AED' : 'var(--mt)',
              transition: 'all 0.2s',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* Icon + active indicator dot */}
            <div style={{ position: 'relative' }}>
              <Icon size={22} strokeWidth={on ? 2.5 : 1.8} style={{ transition: 'all 0.2s' }} />
              {on && (
                <div style={{
                  position: 'absolute',
                  bottom: -4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 20,
                  height: 3,
                  background: '#7C3AED',
                  borderRadius: 3,
                }} />
              )}
            </div>
            <span style={{
              fontSize: 'var(--fs-2xs)',
              fontWeight: on ? 700 : 500,
              transition: 'all 0.2s',
            }}>
              {label}
            </span>
          </button>
        );
      })}

      <style>{`
        nav button:active { transform: scale(0.93); opacity: 0.7; }
        @media (max-width: 480px) {
          nav { padding-bottom: max(var(--sp-1), env(safe-area-inset-bottom)); }
        }
      `}</style>
    </nav>
  );
}