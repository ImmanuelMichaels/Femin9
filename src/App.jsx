// src/App.jsx
import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './context/firebase';
import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import Consent from './pages/Consent';
import Signup from './pages/Signup';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import JourneySelect from './pages/JourneySelect';
import AppShell from './pages/AppShell';
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

// ─── Protected wrapper ────────────────────────────────────────────────────────
function ProtectedApp() {
  const { journeyType } = useApp();
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Read consent from localStorage — same key used by saveConsent() in storage.js
  const hasConsents = localStorage.getItem('userConsents');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
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
  if (!journeyType)           return <Navigate to="/onboarding"   replace />;
  if (!hasConsents)           return <Navigate to="/consent"      replace />;

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
        <Route path="/"             element={<SplashRoute />} />
        <Route path="/onboarding"   element={<Onboarding />} />
        <Route path="/consent"      element={<Consent />} />
        <Route path="/signup"       element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/journey-select" element={<JourneySelect />} />

        <Route path="/app/:journey" element={<ProtectedApp />} />
        <Route path="/app"          element={<AppRedirect />} />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
}