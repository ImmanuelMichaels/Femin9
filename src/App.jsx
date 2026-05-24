// src/App.jsx
import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import Consent from './pages/Consent';
import Signup from './pages/Signup';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import JourneySelect from './pages/Journeyselect';
import AppShell from './pages/AppShell';

function SplashRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const savedJourney = localStorage.getItem('userJourney');
      const hasConsents  = localStorage.getItem('userConsents');
      const isLoggedIn   = localStorage.getItem('userAuth'); 

      if (savedJourney && hasConsents && isLoggedIn) {
        navigate('/app');
      } else if (savedJourney && hasConsents) {
        navigate('/login');      
      } else if (savedJourney) {
        navigate('/consent');
      } else {
        navigate('/onboarding');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return <Splash />;
}

function ProtectedApp() {
  const savedJourney = localStorage.getItem('userJourney');
  const hasConsents  = localStorage.getItem('userConsents');
  const isLoggedIn   = localStorage.getItem('userAuth');

  if (!savedJourney)      return <Navigate to="/onboarding" replace />;
  if (!hasConsents)       return <Navigate to="/consent" replace />;
  if (!isLoggedIn)        return <Navigate to="/login" replace />;
  return <AppShell />;    // ← was missing
}

export default function App() {
  return (
    <Routes>
      <Route path="/"              element={<SplashRoute />} />
      <Route path="/onboarding"    element={<Onboarding />} />
      <Route path="/consent"       element={<Consent />} />
      <Route path="/signup"        element={<Signup />} />       {/* fixed duplicate */}
      <Route path="/verify-email"  element={<VerifyEmail />} />
      <Route path="/login"         element={<Login />} />
      <Route path="/journey-select" element={<JourneySelect />} />
      <Route path="/app"           element={<ProtectedApp />} />
      <Route path="*"              element={<Navigate to="/" replace />} /> {/* last */}
    </Routes>
  );
}