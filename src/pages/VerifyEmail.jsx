// src/pages/VerifyEmail.jsx
// FIXED: removed const isValid = true bypass.
// Uses Firebase's built-in email verification — no custom OTP needed.

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../context/firebase';
import { sendEmailVerification, reload } from 'firebase/auth';
import './VerifyEmail.css';

const RESEND_COOLDOWN = 60; // seconds — increased from 30 to reduce spam

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

function VerifiedSplash() {
  return (
    <div className="ve-splash">
      <div className="ve-splash-ring ve-splash-ring--1" />
      <div className="ve-splash-ring ve-splash-ring--2" />
      <div className="ve-splash-icon"><CheckCircle /></div>
      <p className="ve-splash-title">Email Verified!</p>
      <p className="ve-splash-sub">Taking you to your journey…</p>
    </div>
  );
}

export default function VerifyEmail() {
  const navigate = useNavigate();

  const user        = auth.currentUser;
  const email       = user?.email || localStorage.getItem('userEmail') || '';
  const maskedEmail = maskEmail(email);

  const [verified,   setVerified]   = useState(false);
  const [checking,   setChecking]   = useState(false);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [resendSent, setResendSent] = useState(false);
  const [cooldown,   setCooldown]   = useState(0);
  const [animOut,    setAnimOut]    = useState(false);

  const timerRef  = useRef(null);
  const pollRef   = useRef(null);

  // ── Send verification email on mount if not already sent ────────────────
  useEffect(() => {
    if (!user) {
      // No Firebase user — redirect back to signup
      navigate('/signup');
      return;
    }
    if (!user.emailVerified) {
      sendEmailVerification(user).catch(e => {
        // Too many requests is common — safe to ignore on mount
        if (e.code !== 'auth/too-many-requests') {
          console.warn('[VerifyEmail] sendEmailVerification:', e.code);
        }
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Poll Firebase for email verification (every 5 seconds) ──────────────
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      if (!auth.currentUser) return;
      try {
        await reload(auth.currentUser);         // re-fetch user from Firebase
        if (auth.currentUser.emailVerified) {
          clearInterval(pollRef.current);
          localStorage.setItem('emailVerified', 'true');
          setVerified(true);
          setTimeout(() => {
            setAnimOut(true);
            setTimeout(() => navigate('/onboarding'), 380);
          }, 1600);
        }
      } catch (e) {
        console.warn('[VerifyEmail] reload error:', e.code);
      }
    }, 5000);

    return () => clearInterval(pollRef.current);
  }, [navigate]);

  // ── Cooldown ticker ──────────────────────────────────────────────────────
  useEffect(() => {
    if (cooldown <= 0) return;
    timerRef.current = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [cooldown]);

  // ── Manual check button ──────────────────────────────────────────────────
  const handleManualCheck = async () => {
    if (checking) return;
    setChecking(true);
    setErrorMsg('');
    try {
      await reload(auth.currentUser);
      if (auth.currentUser.emailVerified) {
        clearInterval(pollRef.current);
        localStorage.setItem('emailVerified', 'true');
        setVerified(true);
        setTimeout(() => {
          setAnimOut(true);
          setTimeout(() => navigate('/onboarding'), 380);
        }, 1600);
      } else {
        setErrorMsg("Not verified yet — please click the link in your email. Check spam too.");
      }
    } catch {
      setErrorMsg('Could not check status. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  // ── Resend ───────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (cooldown > 0 || !user) return;
    try {
      await sendEmailVerification(user);
      setResendSent(true);
      setCooldown(RESEND_COOLDOWN);
      setTimeout(() => setResendSent(false), 4000);
    } catch (e) {
      if (e.code === 'auth/too-many-requests') {
        setErrorMsg('Too many attempts. Please wait a few minutes before resending.');
        setCooldown(RESEND_COOLDOWN);
      } else {
        setErrorMsg('Could not resend. Please try again.');
      }
    }
  };

  if (verified) return <VerifiedSplash />;

  return (
    <div
      className="ve-root"
      style={{ opacity: animOut ? 0 : 1, transform: animOut ? 'translateY(18px)' : 'translateY(0)', transition: 'opacity 0.38s ease, transform 0.38s ease' }}
    >
      <div className="ve-card">
        <button className="ve-back" onClick={() => navigate('/signup')}>← Back</button>

        <div className="ve-header">
          <div className="ve-icon-ring"><MailOpenIcon /></div>
          <h1 className="ve-title">Check your email</h1>
          <p className="ve-sub">
            We sent a verification link to<br />
            <strong className="ve-email">{maskedEmail || 'your email address'}</strong>
          </p>
          <p style={{ fontSize: 13, color: 'var(--mt)', marginTop: 8 }}>
            Click the link in the email, then come back here.
            The page will update automatically.
          </p>
        </div>

        {errorMsg && <p className="ve-error">{errorMsg}</p>}

        {/* Manual check for users who already clicked the link */}
        <button
          className={`ve-submit${checking ? ' ve-submit--dim' : ''}`}
          onClick={handleManualCheck}
          disabled={checking}
          style={{ marginBottom: 16 }}
        >
          {checking
            ? <span className="ve-spinner" />
            : <><span>I've clicked the link</span><span className="ve-arrow"> ✓</span></>
          }
        </button>

        <div className="ve-resend-wrap">
          {resendSent ? (
            <p className="ve-resend-sent">✓ New verification email sent!</p>
          ) : (
            <p className="ve-resend-text">
              Didn't receive it?{' '}
              <button
                className={`ve-resend-btn${cooldown > 0 ? ' ve-resend-btn--disabled' : ''}`}
                onClick={handleResend}
                disabled={cooldown > 0}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend email'}
              </button>
            </p>
          )}
        </div>

        <p className="ve-wrong-email">
          Wrong email?{' '}
          <button className="ve-change-email" onClick={() => navigate('/signup')}>Change it</button>
        </p>
      </div>
    </div>
  );
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return email;
  const [user, domain] = email.split('@');
  const visible = user.slice(0, 2);
  const masked  = '*'.repeat(Math.max(0, user.length - 2));
  return `${visible}${masked}@${domain}`;
}
