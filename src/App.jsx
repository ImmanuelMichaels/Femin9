// src/App.jsx
import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import Consent from './pages/Consent';
import Signup from './pages/Signup';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import JourneySelect from './pages/Journeyselect';
import AppShell from './pages/AppShell';
import { AppProvider } from './context/AppContext';

function SplashRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    const clearSession = async () => {
      try {
        await signOut(auth);
      } catch (e) {
        // Ignore errors
      }
      localStorage.removeItem('userJourney');
      localStorage.removeItem('userConsents');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
    };
    
    clearSession();
    
    const timer = setTimeout(() => navigate('/onboarding'), 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return <Splash />;
}

function ProtectedApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const savedJourney = localStorage.getItem('userJourney');
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
        color: '#666'
      }}>
        Loading your journey...
      </div>
    );
  }

  if (!savedJourney) return <Navigate to="/onboarding" replace />;
  if (!hasConsents) return <Navigate to="/consent" replace />;
  if (!user) return <Navigate to="/login" replace />;

  // Optional: Require email verification
  if (!user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <AppShell />;
}

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<SplashRoute />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/consent" element={<Consent />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/journey-select" element={<JourneySelect />} />

        {/* Journey-specific app routes */}
        <Route path="/app/:journey" element={<ProtectedApp />} />

        {/* Fallback */}
        <Route path="/app" element={<Navigate to="/app/pregnant" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
}