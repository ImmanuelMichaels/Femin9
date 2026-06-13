// src/pages/Splash.jsx
import { useEffect, useState } from 'react';

export default function Splash() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation after a brief delay
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fi"
      style={{
        position: 'fixed', inset: 0,
        background: 'FEFEFE',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', zIndex: 9999, padding: 'var(--pad-x)',
        overflow: 'hidden',
      }}
    >
      {/* Animated content wrapper */}
      <div
        style={{
          position: 'absolute',
          top: animate ? '30px' : '50%',
          left: '50%',
          transform: animate ? 'translate(-50%, 0)' : 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          width: '100%',
          padding: '0 var(--pad-x)',
        }}
      >

        {/* Brand name */}
        <div
          className="serif"
          style={{
            width: '250px',
            marginBottom: animate ? 'var(--sp-0)' : 'var(--sp-1)',
            letterSpacing: -0.5,
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <img src="../../public/logo.png" alt="logo" />
        </div>


        {/* Spinner - fades out as it moves up */}
        <div
          style={{
            width: 'clamp(30px,7vw,40px)',
            height: 'clamp(30px,7vw,40px)',
            border: '2.5px solid rgba(255,255,255,0.15)',
            borderTopColor: '#e8a0f0',
            borderRadius: '50%',
            animation: 'sp 0.8s linear infinite',
            opacity: animate ? 0 : 1,
            transition: 'opacity 0.4s ease',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Feature chips - fade in after animation */}
      <div
        style={{
          position: 'absolute',
          bottom: 'clamp(32px,8vw,52px)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 'var(--gap-sm)',
          maxWidth: 'clamp(260px,65vw,340px)',
          padding: '0 var(--pad-x)',
          opacity: animate ? 1 : 0,
          transform: animate ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s',
        }}
      >
      </div>

      {/* Add keyframes for spinner */}
      <style>
        {`
          @keyframes sp {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}