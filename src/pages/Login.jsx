// src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import { auth, db } from '../context/firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import './Login.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_ATTEMPTS   = 5;
const LOCKOUT_MS     = 5 * 60 * 1000; // 5 minutes
const LOCKOUT_KEY    = 'loginLockout';
const ATTEMPTS_KEY   = 'loginAttempts';

// ─── Icons ────────────────────────────────────────────────────────────────────
const GoogleG = () => (
  <svg width="22" height="22" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84-.81-.62-.38-.13z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
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

// ─── Inline error banner ───────────────────────────────────────────────────────
function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 10,
      padding: '12px 14px',
      background: '#FEE2E2',
      border: '1px solid #FECACA',
      borderRadius: 10,
      marginBottom: 16,
      fontSize: 13,
      color: '#B91C1C',
      lineHeight: 1.5,
    }}>
      <span>{message}</span>
      <button
        onClick={onDismiss}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B91C1C', fontSize: 16, lineHeight: 1, flexShrink: 0 }}
      >
        ✕
      </button>
    </div>
  );
}

// ─── Success banner ────────────────────────────────────────────────────────────
function SuccessBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{
      padding: '12px 14px',
      background: '#D1FAE5',
      border: '1px solid #A7F3D0',
      borderRadius: 10,
      marginBottom: 16,
      fontSize: 13,
      color: '#065F46',
      lineHeight: 1.5,
    }}>
      {message}
    </div>
  );
}

// ─── Lockout helpers ──────────────────────────────────────────────────────────
function getLockoutState() {
  try {
    const lockoutUntil = parseInt(localStorage.getItem(LOCKOUT_KEY) || '0', 10);
    const attempts     = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10);
    const now          = Date.now();
    if (lockoutUntil && now < lockoutUntil) {
      return { locked: true, remainingMs: lockoutUntil - now, attempts };
    }
    // Expired lockout — clear it
    if (lockoutUntil && now >= lockoutUntil) {
      localStorage.removeItem(LOCKOUT_KEY);
      localStorage.removeItem(ATTEMPTS_KEY);
    }
    return { locked: false, remainingMs: 0, attempts };
  } catch {
    return { locked: false, remainingMs: 0, attempts: 0 };
  }
}

function recordFailedAttempt() {
  try {
    const attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10) + 1;
    localStorage.setItem(ATTEMPTS_KEY, String(attempts));
    if (attempts >= MAX_ATTEMPTS) {
      localStorage.setItem(LOCKOUT_KEY, String(Date.now() + LOCKOUT_MS));
    }
    return attempts;
  } catch {
    return 0;
  }
}

function clearAttempts() {
  try {
    localStorage.removeItem(LOCKOUT_KEY);
    localStorage.removeItem(ATTEMPTS_KEY);
  } catch { /* silent */ }
}

function formatMs(ms) {
  const mins = Math.ceil(ms / 60000);
  return `${mins} minute${mins !== 1 ? 's' : ''}`;
}

// ─── Migrate localStorage consent → Firestore ─────────────────────────────────
async function migrateConsentIfNeeded(uid) {
  try {
    const consentRef  = doc(db, 'users', uid, 'consent', 'record');
    const consentSnap = await getDoc(consentRef);
    if (consentSnap.exists()) return; // already there

    const raw = localStorage.getItem('userConsents');
    if (!raw) return;

    const parsed = JSON.parse(raw);
    await setDoc(consentRef, {
      ...parsed,
      uid,
      migratedFromLocalStorage: true,
      serverTimestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error('[Femin9] Consent migration failed:', err);
  }
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const { setJourneyType, setCulture } = useApp();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [animOut,  setAnimOut]  = useState(false);
  const [focused,  setFocused]  = useState(null);

  const [error,          setError]          = useState('');
  const [successMsg,     setSuccessMsg]     = useState('');
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [showForgot,     setShowForgot]     = useState(false);
  const [forgotEmail,    setForgotEmail]    = useState('');
  const [forgotLoading,  setForgotLoading]  = useState(false);

  // ── Check lockout on mount and tick countdown ─────────────────────────────
  useEffect(() => {
    const { locked, remainingMs } = getLockoutState();
    if (locked) setLockoutRemaining(remainingMs);
  }, []);

  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining(prev => {
        const next = prev - 1000;
        if (next <= 0) {
          clearAttempts();
          clearInterval(interval);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  const ready    = email.trim() && password.trim();
  const isLocked = lockoutRemaining > 0;

  // ── Resolve Firebase error code → user-friendly message ──────────────────
  const resolveAuthError = (code) => {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Incorrect email or password. Please try again.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Contact support at privacy@femin9.com.';
      case 'auth/too-many-requests':
        return 'Too many sign-in attempts. Please wait a few minutes and try again.';
      case 'auth/network-request-failed':
        return 'No internet connection. Please check your network and try again.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in window was closed. Please try again.';
      case 'auth/popup-blocked':
        return 'Pop-up was blocked by your browser. Please allow pop-ups for this site.';
      default:
        return 'Sign in failed. Please try again or contact support.';
    }
  };

  // ── Navigate after successful auth ────────────────────────────────────────
  const navigateAfterAuth = (journeyType) => {
    setAnimOut(true);
    setTimeout(() => navigate(`/app/${journeyType}`), 450);
  };

  // ── Email login ───────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!ready || loading || isLocked) return;
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);

      clearAttempts();

      // Migrate consent to Firestore now that we have a uid
      await migrateConsentIfNeeded(user.uid);

      const userSnap    = await getDoc(doc(db, 'users', user.uid));
      const userData    = userSnap.data() || {};
      const journey     = userData.journeyType || 'pregnant';
      const savedCulture = userData.culture;

      setJourneyType(journey);
      if (savedCulture) setCulture(savedCulture);

      navigateAfterAuth(journey);

    } catch (err) {
      const attempts = recordFailedAttempt();
      const { locked, remainingMs } = getLockoutState();

      if (locked) {
        setLockoutRemaining(remainingMs);
        setError(`Too many failed attempts. Please wait ${formatMs(remainingMs)} before trying again.`);
      } else {
        const remaining = MAX_ATTEMPTS - attempts;
        const base      = resolveAuthError(err.code);
        setError(remaining > 0 && remaining <= 2
          ? `${base} ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining before temporary lockout.`
          : base
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Google login ──────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    if (loading || isLocked) return;
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);

      clearAttempts();

      // Migrate consent
      await migrateConsentIfNeeded(user.uid);

      const userSnap = await getDoc(doc(db, 'users', user.uid));

      if (!userSnap.exists() || !userSnap.data()?.onboardingComplete) {
        setAnimOut(true);
        setTimeout(() => navigate('/onboarding'), 450);
        return;
      }

      const userData     = userSnap.data();
      const journey      = userData.journeyType || 'pregnant';
      const savedCulture = userData.culture;

      setJourneyType(journey);
      if (savedCulture) setCulture(savedCulture);

      navigateAfterAuth(journey);

    } catch (err) {
      setError(resolveAuthError(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password ───────────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    const target = forgotEmail.trim() || email.trim();
    if (!target) {
      setError('Please enter your email address first.');
      setShowForgot(false);
      return;
    }

    setForgotLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, target);
      setSuccessMsg(`Password reset email sent to ${target}. Check your inbox (and spam folder).`);
      setShowForgot(false);
      setForgotEmail('');
    } catch (err) {
      // Intentionally vague — don't confirm whether an email exists
      setSuccessMsg(`If an account exists for ${target}, a reset link has been sent.`);
      setShowForgot(false);
      setForgotEmail('');
    } finally {
      setForgotLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className={`lg-root ${animOut ? 'lg-root--out' : ''}`}
      style={{
        opacity:   animOut ? 0 : 1,
        transform: animOut ? 'translateY(30px) scale(0.97)' : 'none',
        transition: 'all 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div className="lg-card">
        <div className="lg-hero">
          <div className="lg-brand" />
        </div>

        <h1 className="lg-title">Welcome back</h1>
        <p className="lg-sub">Sign in to continue your journey</p>

        {/* Lockout warning */}
        {isLocked && (
          <div style={{
            padding: '12px 14px',
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            borderRadius: 10,
            marginBottom: 16,
            fontSize: 13,
            color: '#92400E',
            lineHeight: 1.5,
          }}>
            Account temporarily locked after {MAX_ATTEMPTS} failed attempts.
            Try again in <strong>{formatMs(lockoutRemaining)}</strong>.
          </div>
        )}

        <ErrorBanner message={error} onDismiss={() => setError('')} />
        <SuccessBanner message={successMsg} />

        {/* Forgot password panel */}
        {showForgot && (
          <div style={{
            padding: 16,
            background: 'var(--warm)',
            borderRadius: 10,
            marginBottom: 16,
            border: '1px solid var(--border)',
          }}>
            <p style={{ fontSize: 13, marginBottom: 10, color: 'var(--t)', fontWeight: 600 }}>
              Reset your password
            </p>
            <p style={{ fontSize: 12, color: 'var(--mt)', marginBottom: 12 }}>
              Enter your email and we'll send you a link to reset your password.
            </p>
            <input
              type="email"
              value={forgotEmail || email}
              onChange={e => setForgotEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                fontSize: 14,
                marginBottom: 10,
                boxSizing: 'border-box',
                background: 'var(--card)',
                color: 'var(--t)',
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleForgotPassword}
                disabled={forgotLoading}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'var(--dp)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity: forgotLoading ? 0.7 : 1,
                }}
              >
                {forgotLoading ? 'Sending…' : 'Send Reset Link'}
              </button>
              <button
                onClick={() => { setShowForgot(false); setForgotEmail(''); }}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 13,
                  cursor: 'pointer',
                  color: 'var(--mt)',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Email field */}
        <div className="lg-field">
          <label className="lg-label">Email Address</label>
          <div className={`lg-input-wrap${focused === 'email' ? ' lg-input-wrap--focus' : ''}`}>
            <div className="lg-icon-box"><MailIcon /></div>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="mama@example.com"
              className="lg-input"
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              disabled={isLocked}
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password field */}
        <div className="lg-field">
          <label className="lg-label">Password</label>
          <div className={`lg-input-wrap${focused === 'pass' ? ' lg-input-wrap--focus' : ''}`}>
            <div className="lg-icon-box"><LockIcon /></div>
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
              className="lg-input"
              onFocus={() => setFocused('pass')}
              onBlur={() => setFocused(null)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              disabled={isLocked}
              autoComplete="current-password"
            />
            <button className="lg-eye" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
              <EyeIcon open={showPass} />
            </button>
          </div>
          <div style={{ textAlign: 'right', marginTop: 8 }}>
            <button
              className="lg-forgot"
              onClick={() => { setShowForgot(v => !v); setError(''); setSuccessMsg(''); }}
            >
              Forgot password?
            </button>
          </div>
        </div>

        {/* Sign in button */}
        <button
          className={`lg-signin${ready && !isLocked ? '' : ' lg-signin--dim'}`}
          onClick={handleLogin}
          disabled={!ready || loading || isLocked}
        >
          {loading ? <span className="lg-spinner" /> : <>Sign In &nbsp;→</>}
        </button>

        {/* Divider */}
        <div className="lg-or">
          <div className="lg-or-line" />
          <span className="lg-or-text">OR</span>
          <div className="lg-or-line" />
        </div>

        {/* Social logins */}
        <button className="lg-social" onClick={handleGoogleLogin} disabled={loading || isLocked}>
          <GoogleG />
          <span>Continue with Google</span>
        </button>

        <button className="lg-social" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
          <AppleIcon />
          <span>Continue with Apple</span>
          <span style={{ fontSize: 11, color: 'var(--mt)', marginLeft: 'auto' }}>Coming soon</span>
        </button>

        {/* Footer */}
        <p className="lg-footer">
          New here?{' '}
          <button className="lg-signup-link" onClick={() => navigate('/onboarding')}>
            Create your free account
          </button>
        </p>
      </div>
    </div>
  );
}