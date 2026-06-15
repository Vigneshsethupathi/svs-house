import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LangProvider, useLang } from './context/LangContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Materials from './pages/Materials';
import Payments from './pages/Payments';
import Photos from './pages/Photos';
import UsersPage from './pages/UsersPage';
import BottomNav from './components/BottomNav';
import LogButton from './components/LogButton';
import './App.css';

function AppInner() {
  const { user, loading } = useAuth();
  const { t } = useLang();
  const [tab, setTab] = useState('dashboard');

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #1a5276', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#888', fontSize: 14 }}>{t.loading}</p>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const pages = {
    dashboard: <Dashboard />,
    materials: <Materials />,
    payments: <Payments />,
    photos: <Photos />,
    users: <UsersPage />
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#f4f6f9', position: 'relative' }}>
      {pages[tab]}
      <BottomNav active={tab} setActive={setTab} />
      <LogButton />
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </LangProvider>
  );
}
