import { useState, useCallback, useEffect, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import './Signup.css';

// ─── Icons ────────────────────────────────────────────────────────────────────

const GoogleG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const UserIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#d63a6e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const MailIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#d63a6e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="3"/>
    <polyline points="2,4 12,13 22,4"/>
  </svg>
);

const LockIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#d63a6e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="10" rx="2"/>
    <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#d63a6e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)              score++;
  if (/[A-Z]/.test(pw))           score++;
  if (/[0-9]/.test(pw))           score++;
  if (/[^A-Za-z0-9]/.test(pw))    score++;

  if (score <= 1) return { score, label: 'Too weak',  color: '#f43f5e' };
  if (score === 2) return { score, label: 'Fair',       color: '#f59e0b' };
  if (score === 3) return { score, label: 'Good',       color: '#10b981' };
  return               { score, label: 'Strong 🔒',  color: '#059669' };
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Success splash shown right before navigation ────────────────────────────

function SuccessSplash({ name }) {
  return (
    <div className="su-splash">
      <div className="su-splash-ring" />
      <div className="su-splash-emoji">🌸</div>
      <p className="su-splash-title">Welcome, {name || 'Mama'}!</p>
      <p className="su-splash-sub">Setting up your journey…</p>
    </div>
  );
}

// ─── Password rule row ────────────────────────────────────────────────────────
function PasswordRule({ met, text }) {
  return (
    <div className={`su-rule ${met ? 'su-rule--met' : ''}`}>
      <div className="su-rule-dot" />
      <span>{text}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Signup() {
  const navigate    = useNavigate();
  const { setUserName } = useApp();

  // Form state
  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed,      setAgreed]      = useState(false);
  const [focused,     setFocused]     = useState(null);

  // UX state
  const [touched,   setTouch]   = useState({});
  const [loading,   setLoading] = useState(false);
  const [animOut,   setAnimOut] = useState(false);
  const [success,   setSuccess] = useState(false);

  // Clear localStorage when component mounts
  useEffect(() => {
    localStorage.removeItem('userAuth');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
  }, []);

  // ── Derived validation ──────────────────────────────────────────────────────
  const strength    = getPasswordStrength(password);
  const emailOk     = validateEmail(email);
  const passwordsOk = password && confirm && password === confirm;
  const nameOk      = name.trim().length >= 2;

  const errors = {
    name:    touched.name    && !nameOk         ? 'Please enter your full name'             : '',
    email:   touched.email   && !emailOk        ? 'Enter a valid email address'             : '',
    password: touched.password && password.length < 8 ? 'Password must be at least 8 characters' : '',
    confirm: touched.confirm && !passwordsOk    ? "Passwords don't match"                  : '',
  };

  const formReady = nameOk && emailOk && strength.score >= 2 && passwordsOk && agreed;

  const touch = (field) => setTouch((p) => ({ ...p, [field]: true }));

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!formReady) {
      setTouch({ name: true, email: true, password: true, confirm: true });
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Persist basics
      const firstName = name.trim().split(' ')[0];
      localStorage.setItem('userAuth',  'true');
      localStorage.setItem('userName',  firstName);
      localStorage.setItem('userEmail', email);
      if (setUserName) setUserName(firstName);

      setLoading(false);
      setSuccess(true);

      // Brief success moment then navigate to onboarding
      setTimeout(() => {
        setAnimOut(true);
        setTimeout(() => navigate('/verify-email'), 380);
      }, 1400);
    }, 1200);
  }, [formReady, name, email, navigate, setUserName]);

  // ── Quick social sign-up ────────────────────────────────────────────────────
  const handleSocial = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('userAuth', 'true');
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setAnimOut(true);
        setTimeout(() => navigate('/onboarding'), 380);
      }, 1400);
    }, 800);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (success) return <SuccessSplash name={name.trim().split(' ')[0]} />;

  return (
    <div
      className="su-root"
      style={{
        opacity:    animOut ? 0 : 1,
        transform:  animOut ? 'translateY(18px)' : 'translateY(0)',
        transition: 'opacity 0.38s ease, transform 0.38s ease',
      }}
    >
      <div className="su-card">

        {/* ── Brand header ─────────────────────────────────────────────────── */}
        <div className="su-header">
          <h1 className="su-title">Create your account</h1>
          <p className="su-sub">Your journey to better health starts here.</p>
        </div>

        {/* ── Social sign-up ────────────────────────────────────────────────── */}
        <div className="su-socials">
          <button className="su-social-btn" onClick={handleSocial} disabled={loading}>
            <GoogleG />
            <span>Continue with Google</span>
          </button>
          <button className="su-social-btn su-social-apple" onClick={handleSocial} disabled={loading}>
            <AppleIcon />
            <span>Continue with Apple</span>
          </button>
        </div>

        {/* ── Divider ──────────────────────────────────────────────────────── */}
        <div className="su-divider">
          <div className="su-divider-line" />
          <span className="su-divider-text">or sign up with email</span>
          <div className="su-divider-line" />
        </div>

        {/* ── Form ─────────────────────────────────────────────────────────── */}
        <div className="su-form">

          {/* Full name */}
          <div className="su-field">
            <label className="su-label">Full Name</label>
            <div className={[
              'su-input-wrap',
              focused === 'name'  ? 'su-input-wrap--focus' : '',
              errors.name         ? 'su-input-wrap--error' : '',
              touched.name && nameOk ? 'su-input-wrap--valid' : '',
            ].join(' ')}>
              <div className="su-icon"><UserIcon /></div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocused('name')}
                onBlur={() => { setFocused(null); touch('name'); }}
                placeholder="Full Name"
                className="su-input"
                autoComplete="name"
              />
              {touched.name && nameOk && (
                <div className="su-valid-tick"><CheckIcon /></div>
              )}
            </div>
            {errors.name && <p className="su-error">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="su-field">
            <label className="su-label">Email Address</label>
            <div className={[
              'su-input-wrap',
              focused === 'email'       ? 'su-input-wrap--focus' : '',
              errors.email              ? 'su-input-wrap--error' : '',
              touched.email && emailOk  ? 'su-input-wrap--valid' : '',
            ].join(' ')}>
              <div className="su-icon"><MailIcon /></div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => { setFocused(null); touch('email'); }}
                placeholder="email@example.com"
                className="su-input"
                autoComplete="email"
              />
              {touched.email && emailOk && (
                <div className="su-valid-tick"><CheckIcon /></div>
              )}
            </div>
            {errors.email && <p className="su-error">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="su-field">
            <label className="su-label">Password</label>
            <div className={[
              'su-input-wrap',
              focused === 'pass'  ? 'su-input-wrap--focus' : '',
              errors.password     ? 'su-input-wrap--error' : '',
            ].join(' ')}>
              <div className="su-icon"><LockIcon /></div>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('pass')}
                onBlur={() => { setFocused(null); touch('password'); }}
                placeholder="At least 8 characters"
                className="su-input"
                autoComplete="new-password"
              />
              <button className="su-eye" onClick={() => setShowPass((v) => !v)} tabIndex={-1}>
                <EyeIcon open={showPass} />
              </button>
            </div>
            {errors.password && <p className="su-error">{errors.password}</p>}

            {/* Password strength meter */}
            {password && (
              <div className="su-strength">
                <div className="su-strength-bars">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="su-strength-bar"
                      style={{
                        background: n <= strength.score ? strength.color : '#f0e0ea',
                        transition: 'background 0.3s',
                      }}
                    />
                  ))}
                </div>
                <span className="su-strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}

            {/* Password rules */}
            {(focused === 'pass' || touched.password) && password && (
              <div className="su-rules">
                <PasswordRule met={password.length >= 8}   text="At least 8 characters" />
                <PasswordRule met={/[A-Z]/.test(password)} text="One uppercase letter" />
                <PasswordRule met={/[0-9]/.test(password)} text="One number" />
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="su-field">
            <label className="su-label">Confirm Password</label>
            <div className={[
              'su-input-wrap',
              focused === 'confirm'       ? 'su-input-wrap--focus' : '',
              errors.confirm              ? 'su-input-wrap--error' : '',
              touched.confirm && passwordsOk ? 'su-input-wrap--valid' : '',
            ].join(' ')}>
              <div className="su-icon"><LockIcon /></div>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onFocus={() => setFocused('confirm')}
                onBlur={() => { setFocused(null); touch('confirm'); }}
                placeholder="Re-enter password"
                className="su-input"
                autoComplete="new-password"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <button className="su-eye" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1}>
                <EyeIcon open={showConfirm} />
              </button>
              {touched.confirm && passwordsOk && (
                <div className="su-valid-tick" style={{ right: 42 }}><CheckIcon /></div>
              )}
            </div>
            {errors.confirm && <p className="su-error">{errors.confirm}</p>}
          </div>

          {/* Terms */}
          <label className="su-terms">
            <div
              className={`su-checkbox ${agreed ? 'su-checkbox--checked' : ''}`}
              onClick={() => setAgreed((v) => !v)}
              role="checkbox"
              aria-checked={agreed}
              tabIndex={0}
              onKeyDown={(e) => e.key === ' ' && setAgreed((v) => !v)}
            >
              {agreed && <CheckIcon />}
            </div>
            <span className="su-terms-text">
              I agree to the{' '}
              <button className="su-link" onClick={(e) => e.preventDefault()}>Terms of Service</button>
              {' '}and{' '}
              <button className="su-link" onClick={(e) => e.preventDefault()}>Privacy Policy</button>
            </span>
          </label>

          {/* Submit */}
          <button
            className={`su-submit ${formReady ? '' : 'su-submit--dim'}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <span className="su-spinner" />
              : <><span>Create Account</span><span className="su-submit-arrow">→</span></>
            }
          </button>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <p className="su-footer">
          Already have an account?{' '}
          <button className="su-login-link" onClick={() => navigate('/login')}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}