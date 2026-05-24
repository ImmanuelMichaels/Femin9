import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './VerifyEmail.css';

// ─── Icons ────────────────────────────────────────────────────────────────────

const MailOpenIcon = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6z"/>
    <path d="M22 10l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/>
  </svg>
);

const CheckCircle = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
);

// ─── Success splash ───────────────────────────────────────────────────────────

function VerifiedSplash() {
  return (
    <div className="ve-splash">
      <div className="ve-splash-ring ve-splash-ring--1" />
      <div className="ve-splash-ring ve-splash-ring--2" />
      <div className="ve-splash-icon">
        <CheckCircle />
      </div>
      <p className="ve-splash-title">Email Verified!</p>
      <p className="ve-splash-sub">Taking you to your journey…</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 30; // seconds

export default function VerifyEmail() {
  const navigate = useNavigate();

  // Read email from localStorage (set during signup)
  const storedEmail = localStorage.getItem('userEmail') || '';
  const maskedEmail = maskEmail(storedEmail);

  // OTP digit state
  const [digits, setDigits]       = useState(Array(CODE_LENGTH).fill(''));
  const [shaking, setShaking]     = useState(false);
  const [verified, setVerified]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');
  const [animOut, setAnimOut]     = useState(false);

  // Resend cooldown
  const [cooldown, setCooldown]   = useState(0);
  const [resendSent, setResendSent] = useState(false);
  const timerRef                  = useRef(null);

  const inputRefs = useRef([]);

  // ── Focus first box on mount ────────────────────────────────────────────────
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // ── Cooldown ticker ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (cooldown <= 0) return;
    timerRef.current = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [cooldown]);

  // ── Digit input handler ─────────────────────────────────────────────────────
  const handleChange = (index, value) => {
    // Allow only digits
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    setErrorMsg('');

    if (cleaned && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // ── Paste handler — fill all boxes from clipboard ───────────────────────────
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = Array(CODE_LENGTH).fill('');
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    setErrorMsg('');
    // Focus last filled box
    const focusIdx = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  // ── Backspace handler ───────────────────────────────────────────────────────
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // ── Verify ──────────────────────────────────────────────────────────────────
  const handleVerify = useCallback(() => {
    const code = digits.join('');
    if (code.length < CODE_LENGTH) {
      setErrorMsg('Please enter all 6 digits.');
      shake();
      return;
    }

    setLoading(true);
    setErrorMsg('');

    // Simulate verification — accept any 6-digit code for now
    // Replace this block with your real API call
    setTimeout(() => {
      const isValid = true; // swap with: code === serverCode

      if (isValid) {
        localStorage.setItem('emailVerified', 'true');
        setLoading(false);
        setVerified(true);
        setTimeout(() => {
          setAnimOut(true);
          setTimeout(() => navigate('/onboarding'), 380);
        }, 1600);
      } else {
        setLoading(false);
        setErrorMsg('Incorrect code. Please try again.');
        setDigits(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
        shake();
      }
    }, 1100);
  }, [digits, navigate]);

  // ── Enter key submits ───────────────────────────────────────────────────────
  const handleLastKeyDown = (e) => {
    if (e.key === 'Enter') handleVerify();
  };

  // ── Shake animation ─────────────────────────────────────────────────────────
  const shake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  // ── Resend ──────────────────────────────────────────────────────────────────
  const handleResend = () => {
    if (cooldown > 0) return;
    // TODO: trigger your real resend API call here
    setResendSent(true);
    setCooldown(RESEND_COOLDOWN);
    setDigits(Array(CODE_LENGTH).fill(''));
    setErrorMsg('');
    inputRefs.current[0]?.focus();
    setTimeout(() => setResendSent(false), 3000);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (verified) return <VerifiedSplash />;

  const codeComplete = digits.every((d) => d !== '');

  return (
    <div
      className="ve-root"
      style={{
        opacity:    animOut ? 0 : 1,
        transform:  animOut ? 'translateY(18px)' : 'translateY(0)',
        transition: 'opacity 0.38s ease, transform 0.38s ease',
      }}
    >
      <div className="ve-card">

        {/* ── Back link ──────────────────────────────────────────────────── */}
        <button className="ve-back" onClick={() => navigate('/signup')}>
          <BackIcon />
          <span>Back</span>
        </button>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="ve-header">
          <div className="ve-icon-ring">
            <MailOpenIcon />
          </div>
          <h1 className="ve-title">Check your email</h1>
          <p className="ve-sub">
            We sent a 6-digit code to
            <br />
            <strong className="ve-email">{maskedEmail || 'your email address'}</strong>
          </p>
        </div>

        {/* ── OTP boxes ──────────────────────────────────────────────────── */}
        <div
          className={`ve-otp-row ${shaking ? 've-otp-row--shake' : ''} ${errorMsg ? 've-otp-row--error' : ''}`}
          onPaste={handlePaste}
        >
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              className={`ve-otp-box ${digit ? 've-otp-box--filled' : ''}`}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={i === CODE_LENGTH - 1 ? (e) => { handleKeyDown(i, e); handleLastKeyDown(e); } : (e) => handleKeyDown(i, e)}
              autoComplete="one-time-code"
            />
          ))}
        </div>

        {/* ── Error message ───────────────────────────────────────────────── */}
        {errorMsg && <p className="ve-error">{errorMsg}</p>}

        {/* ── Verify button ───────────────────────────────────────────────── */}
        <button
          className={`ve-submit ${codeComplete && !loading ? '' : 've-submit--dim'}`}
          onClick={handleVerify}
          disabled={loading || !codeComplete}
        >
          {loading
            ? <span className="ve-spinner" />
            : <><span>Verify Email</span><span className="ve-arrow">→</span></>
          }
        </button>

        {/* ── Resend section ──────────────────────────────────────────────── */}
        <div className="ve-resend-wrap">
          {resendSent ? (
            <p className="ve-resend-sent">✓ New code sent!</p>
          ) : (
            <p className="ve-resend-text">
              Didn't get it?{' '}
              <button
                className={`ve-resend-btn ${cooldown > 0 ? 've-resend-btn--disabled' : ''}`}
                onClick={handleResend}
                disabled={cooldown > 0}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
              </button>
            </p>
          )}
        </div>

        {/* ── Wrong email ─────────────────────────────────────────────────── */}
        <p className="ve-wrong-email">
          Wrong email?{' '}
          <button className="ve-change-email" onClick={() => navigate('/signup')}>
            Change it
          </button>
        </p>

      </div>
    </div>
  );
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function maskEmail(email) {
  if (!email || !email.includes('@')) return email;
  const [user, domain] = email.split('@');
  const visible = user.slice(0, 2);
  const masked  = '*'.repeat(Math.max(0, user.length - 2));
  return `${visible}${masked}@${domain}`;
}
