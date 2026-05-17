import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import AppShell from './pages/AppShell';

function SplashRoute() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate('/login'), 2000);
    return () => clearTimeout(t);
  }, [navigate]);
  return <Splash />;
}

function ProtectedApp() {
  const { journeyType } = useApp();
  if (!journeyType) return <Navigate to="/onboarding" replace />;
  return <AppShell />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/"           element={<SplashRoute />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login"      element={<Login />} />
      <Route path="/app"        element={<ProtectedApp />} />
      <Route path="*"           element={<Navigate to="/" replace />} />
    </Routes>
  );
}