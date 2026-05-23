// src/App.jsx
import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import Consent from './pages/Consent';
// import Signup from './pages/Signup';
import Login from './pages/Login';
import AppShell from './pages/AppShell';

function SplashRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      // ✅ FIX: Read localStorage INSIDE the effect, not outside it.
      // Reading outside creates a stale closure captured at render time.
      const savedJourney = localStorage.getItem('userJourney');
      const hasConsents  = localStorage.getItem('userConsents');
      const isLoggedIn   = localStorage.getItem('userAuth'); // ✅ Add this check

      if (savedJourney && hasConsents && isLoggedIn) {
        navigate('/app');
      } else if (savedJourney && hasConsents) {
        navigate('/login');       // ✅ Had journey+consent but no auth → Login
      } else if (savedJourney) {
        navigate('/consent');
      } else {
        navigate('/onboarding');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]); // ✅ No localStorage values in deps — they're read fresh inside

  return <Splash />;
}

function ProtectedApp() {
  const savedJourney = localStorage.getItem('userJourney');
  const hasConsents  = localStorage.getItem('userConsents');
  const isLoggedIn   = localStorage.getItem('userAuth'); // ✅ Add this check

  if (!savedJourney) return <Navigate to="/onboarding" replace />;
  if (!hasConsents)  return <Navigate to="/consent" replace />;
  if (!isLoggedIn)   return <Navigate to="/login" replace />;  // ✅ Add this guard
  return <AppShell />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/"           element={<SplashRoute />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/consent"    element={<Consent />} />
      <Route path="/signup" element={<Onboarding />} />
      <Route path="/login"      element={<Login />} />
      <Route path="/app"        element={<ProtectedApp />} />
      <Route path="*"           element={<Navigate to="/" replace />} />
    </Routes>
  );
}