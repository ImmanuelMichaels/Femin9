import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Login.css';


const GoogleG = () => (
  <svg width="22" height="22" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84-.81-.62-.38-.13z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e84393" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="3"/>
    <polyline points="2,4 12,13 22,4"/>
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e84393" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="10" rx="2"/>
    <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e84393" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

const PhoneIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7b2ff7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="3"/>
    <line x1="12" y1="18" x2="12" y2="18"/>
  </svg>
);

export default function Login() {
  const navigate = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [animOut,  setAnimOut]  = useState(false);
  const [focused,  setFocused]  = useState(null);

  const ready = email && password;

  const handleLogin = () => {
    if (!ready) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAnimOut(true);
      setTimeout(() => navigate('/onboarding'), 420);
    }, 1000);
  };

  return (
    <div
      className="lg-root"
      style={{
        opacity: animOut ? 0 : 1,
        transform: animOut ? 'translateY(20px)' : 'none',
        transition: 'opacity 0.4s, transform 0.4s'
      }}
    >

      {/* Form card */}
      <div className="lg-card">
      {/* Hero */}
      <div className="lg-hero">
        <div className="lg-brand">
          {/* <div>
            <p className="lg-brand-name">Femin<span>9</span></p>
            <p className="lg-brand-tag">Your journey, our care</p>
          </div> */}
        </div>
      </div>
        <h1 className="lg-title">Welcome</h1>
        <p className="lg-sub">Sign in to continue your journey</p>

        {/* Email */}
        <div className="lg-field">
          <label className="lg-label">Email Address</label>
          <div className={`lg-input-wrap${focused === 'email' ? ' lg-input-wrap--focus' : ''}`}>
            <div className="lg-icon-box"><MailIcon /></div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="mama@example.com"
              className="lg-input"
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
            />
          </div>
        </div>

        {/* Password */}
        <div className="lg-field">
          <label className="lg-label">Password</label>
          <div className={`lg-input-wrap${focused === 'pass' ? ' lg-input-wrap--focus' : ''}`}>
            <div className="lg-icon-box"><LockIcon /></div>
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="lg-input"
              onFocus={() => setFocused('pass')}
              onBlur={() => setFocused(null)}
            />
            <button className="lg-eye" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
              <EyeIcon open={showPass} />
            </button>
          </div>
          <div style={{ textAlign: 'right', marginTop: 8 }}>
            <button className="lg-forgot">Forgot password?</button>
          </div>
        </div>

        {/* Sign In */}
        <button
          className={`lg-signin${ready ? '' : ' lg-signin--dim'}`}
          onClick={handleLogin}
          disabled={!ready || loading}
        >
          {loading ? <span className="lg-spinner" /> : <>Sign In &nbsp;→</>}
        </button>

        {/* Divider */}
        <div className="lg-or">
          <div className="lg-or-line" />
          <span className="lg-or-text">OR</span>
          <div className="lg-or-line" />
        </div>

        {/* Social */}
        <button className="lg-social" onClick={handleLogin}>
          <GoogleG />
          <span>Continue with Google</span>
        </button>
        <button className="lg-social" onClick={handleLogin}>
          <PhoneIcon />
          <span>Continue with Phone</span>
        </button>

        {/* Footer */}
        <p className="lg-footer">
          New here?{' '}
          <button className="lg-signup-link" onClick={() => navigate('/signup')}>
            Create your free account
          </button>
        </p>
      </div>
    </div>
  );
}