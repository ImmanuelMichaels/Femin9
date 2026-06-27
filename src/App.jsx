// src/App.jsx
import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './context/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import Consent from './pages/Consent';
import Signup from './pages/Signup';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import JourneySelect from './pages/Journeyselect';
import AppShell from './pages/AppShell';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/useApp';

// ─── Splash ───────────────────────────────────────────────────────────────────
function SplashRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/onboarding'), 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return <Splash />;
}

// ─── Check whether a valid consent record exists ──────────────────────────────
// Checks Firestore first (authoritative), falls back to localStorage.
async function hasValidConsent(uid) {
  // 1. Firestore check (only possible if authenticated)
  if (uid) {
    try {
      const consentRef = doc(db, 'users', uid, 'consent', 'record');
      const consentSnap = await getDoc(consentRef);
      if (consentSnap.exists()) {
        const data = consentSnap.data();
        return data.healthData === true && data.privacyPolicyAccepted === true;
      }
    } catch (err) {
      console.error('[Femin9] Firestore consent check failed, falling back to localStorage:', err);
    }
  }

  // 2. localStorage fallback (pre-auth or Firestore unavailable)
  try {
    const raw = localStorage.getItem('userConsents');
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed.healthData === true && parsed.privacyPolicyAccepted === true;
  } catch {
    return false;
  }
}

// ─── Protected wrapper ────────────────────────────────────────────────────────
function ProtectedApp() {
  const { journeyType } = useApp();
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [consentOk, setConsentOk] = useState(null); // null = not yet checked

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const ok = await hasValidConsent(currentUser.uid);
        setConsentOk(ok);
      } else {
        // Not logged in — check localStorage so the consent screen is only shown once
        const ok = await hasValidConsent(null);
        setConsentOk(ok);
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading || consentOk === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.1rem',
        color: '#666',
      }}>
        Loading your journey…
      </div>
    );
  }

  if (!user)                  return <Navigate to="/login"        replace />;
  if (!user.emailVerified)    return <Navigate to="/verify-email" replace />;
  if (!consentOk)             return <Navigate to="/consent"      replace />;
  if (!journeyType)           return <Navigate to="/onboarding"   replace />;

  return <AppShell />;
}

// ─── Fallback redirect inside /app ────────────────────────────────────────────
function AppRedirect() {
  const { journeyType } = useApp();
  return <Navigate to={`/app/${journeyType || 'pregnant'}`} replace />;
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/"               element={<SplashRoute />} />
        <Route path="/onboarding"     element={<Onboarding />} />
        <Route path="/consent"        element={<Consent />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/signup"         element={<Signup />} />
        <Route path="/verify-email"   element={<VerifyEmail />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/journey-select" element={<JourneySelect />} />

        <Route path="/app/:journey"   element={<ProtectedApp />} />
        <Route path="/app"            element={<AppRedirect />} />
        <Route path="*"              element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
}