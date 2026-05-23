// src/pages/Splash.jsx
export default function Splash() {
  return (
    <div
      className="fi"
      style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(160deg,#1a0533 0%,#4a1270 50%,#8b2fc9 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', zIndex: 9999, padding: 'var(--pad-x)',
      }}
    >
      {/* Logo mark */}
      <div style={{
        width: 'clamp(72px,18vw,96px)', height: 'clamp(72px,18vw,96px)',
        borderRadius: 'clamp(20px,5vw,28px)',
        background: 'rgba(255,255,255,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 'var(--sp-5)',
        border: '1px solid rgba(255,255,255,0.2)',
      }}>
        <svg
          width="clamp(38px,9vw,52px)"
          height="clamp(38px,9vw,52px)"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Uterus / bloom shape */}
          <path
            d="M16 4c-3 0-7 3-7 8s7 12 7 12 7-7 7-12-4-8-7-8z"
            fill="#e8a0f0"
            opacity="0.95"
          />
          <path
            d="M10 12c-2-1.5-5 0-5 4s3 6 5 7"
            stroke="#e8a0f0"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M22 12c2-1.5 5 0 5 4s-3 6-5 7"
            stroke="#e8a0f0"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Brand name */}
      <div
        className="serif"
        style={{
          fontSize: 'var(--fs-3xl)', color: '#fff',
          fontStyle: 'italic', marginBottom: 'var(--sp-1)', letterSpacing: -0.5,
        }}
      >
        Femin<b style={{ fontStyle: 'normal', color: '#e8a0f0' }}>9</b>
      </div>

      {/* Tagline */}
      <p style={{
        color: 'rgba(255,255,255,0.45)', fontSize: 'var(--fs-xs)',
        letterSpacing: 3, textTransform: 'uppercase', marginBottom: 'var(--sp-6)',
      }}>
        Maternal AI · UK First
      </p>

      {/* Spinner */}
      <div style={{
        width: 'clamp(30px,7vw,40px)', height: 'clamp(30px,7vw,40px)',
        border: '2.5px solid rgba(255,255,255,0.15)',
        borderTopColor: '#e8a0f0',
        borderRadius: '50%',
        animation: 'sp 0.8s linear infinite',
      }} />

      {/* Feature chips */}
      <div style={{
        position: 'absolute', bottom: 'clamp(32px,8vw,52px)',
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
        gap: 'var(--gap-sm)', maxWidth: 'clamp(260px,65vw,340px)',
        padding: '0 var(--pad-x)',
      }}>
        {['20 Features', 'AI-Powered', 'QR Scanner', 'Offline-First', 'Nigeria DB'].map(t => (
          <span key={t} style={{
            background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)',
            padding: 'clamp(4px,1vw,6px) clamp(10px,2.5vw,14px)',
            borderRadius: 20, fontSize: 'var(--fs-xs)', fontWeight: 700,
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}