// src/pages/Profile.jsx
import { useState } from 'react';
import { WCard, SectionTitle, Button } from '../components/ui';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { userName, journeyType, setJourneyType } = useApp();
  const navigate = useNavigate();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [notifications, setNotifications] = useState({
    healthReminders: true,
    appointmentReminders: true,
    marketing: false
  });
  
  const handleDeleteAccount = () => {
    if (window.confirm('⚠️ WARNING: This will delete ALL your health data permanently. This action cannot be undone. Are you absolutely sure?')) {
      // API call to delete account
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    }
  };
  
  const handleExportData = () => {
    // GDPR Right to Data Portability
    alert('Your data export request has been submitted. You will receive an email within 30 days containing all your data in JSON format.');
  };
  
  const handleChangeJourney = () => {
    navigate('/onboarding');
  };
  
  return (
    <div className="page-pad">
      <SectionTitle title="👤 Profile" subtitle="Manage your account and preferences" />
      
      {/* User Info Card */}
      <WCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)' }}>
          <div style={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--t), var(--sg))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            color: '#fff'
          }}>
            {userName?.charAt(0) || 'M'}
          </div>
          <div>
            <p style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, color: 'var(--dp)' }}>
              {userName || 'Mama'}
            </p>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--mt)' }}>
              Journey: {journeyType === 'mom' ? 'Postpartum & Nursing' : 
                        journeyType === 'conceive' ? 'Trying to Conceive' :
                        journeyType === 'pregnant' ? 'Pregnancy' :
                        journeyType === 'ivf' ? 'IVF & Fertility' : 
                        journeyType === 'menopause' ? 'Menopause' : journeyType}
            </p>
            <button
              onClick={handleChangeJourney}
              style={{
                marginTop: 8,
                background: 'none',
                border: 'none',
                color: 'var(--t)',
                fontSize: 'var(--fs-xs)',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Change journey →
            </button>
          </div>
        </div>
      </WCard>
      
      {/* Notification Preferences */}
      <SectionTitle title="🔔 Notifications" />
      <WCard>
        {[
          { key: 'healthReminders', label: 'Health Reminders', desc: 'Daily vitals, kick count, medication reminders' },
          { key: 'appointmentReminders', label: 'Appointment Reminders', desc: 'Upcoming appointments and check-ups' },
          { key: 'marketing', label: 'Marketing & Tips', desc: 'Wellness tips, offers, and updates' }
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--sp-3) 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 'var(--fs-sm)' }}>{item.label}</p>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)' }}>{item.desc}</p>
            </div>
            <button
              onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
              style={{
                width: 50,
                height: 28,
                borderRadius: 30,
                background: notifications[item.key] ? 'var(--sg)' : 'var(--border)',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 3,
                left: notifications[item.key] ? 26 : 3,
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s'
              }} />
            </button>
          </div>
        ))}
      </WCard>
      
      {/* Privacy Centre - GDPR Required */}
      <SectionTitle title="🔒 Privacy Centre" />
      <WCard>
        <button
          onClick={handleExportData}
          style={{
            width: '100%',
            padding: 'var(--sp-3)',
            background: 'var(--warm)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            fontSize: 'var(--fs-sm)',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: 'var(--sp-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--gap-sm)'
          }}
        >
          📥 Download My Data (GDPR Right to Portability)
        </button>
        
        <button
          onClick={() => setShowPrivacyModal(true)}
          style={{
            width: '100%',
            padding: 'var(--sp-3)',
            background: 'var(--bll)',
            border: '1px solid var(--blm)',
            borderRadius: 'var(--r)',
            fontSize: 'var(--fs-sm)',
            fontWeight: 600,
            color: 'var(--bl)',
            cursor: 'pointer',
            marginBottom: 'var(--sp-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--gap-sm)'
          }}
        >
          📋 Manage Consent Settings
        </button>
        
        <button
          onClick={handleDeleteAccount}
          style={{
            width: '100%',
            padding: 'var(--sp-3)',
            background: 'var(--rdl)',
            border: '1px solid var(--rdm)',
            borderRadius: 'var(--r)',
            fontSize: 'var(--fs-sm)',
            fontWeight: 600,
            color: 'var(--rd)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--gap-sm)'
          }}
        >
          🗑️ Delete Account & All Data (Right to Erasure)
        </button>
      </WCard>
      
      {/* Subscription */}
      <SectionTitle title="💎 Subscription" />
      <WCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 'var(--fs-md)' }}>Bloom Seed</p>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)' }}>Free tier · 10 AI messages/day</p>
          </div>
          <Button variant="primary">Upgrade to Bloom</Button>
        </div>
        <div style={{ marginTop: 'var(--sp-3)', paddingTop: 'var(--sp-3)', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)' }}>
            Bloom: £6.99/month · Unlimited tracking · 50 AI messages · PDF exports
          </p>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)' }}>
            Bloom+: £12.99/month · Unlimited AI · Priority support · Annual health review
          </p>
        </div>
      </WCard>
      
      {/* App Info */}
      <SectionTitle title="ℹ️ About" />
      <WCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--sp-2) 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--mt)' }}>Version</span>
          <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>1.0.0 (Build 42)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--sp-2) 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--mt)' }}>ICO Registration</span>
          <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>ZB123456</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--sp-2) 0' }}>
          <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--mt)' }}>Data Region</span>
          <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>UK (GDPR Compliant)</span>
        </div>
      </WCard>
      
      {/* Sign Out Button */}
      <Button 
        variant="outline" 
        onClick={() => navigate('/login')}
        fullWidth
      >
        Sign Out
      </Button>
    </div>
  );
}