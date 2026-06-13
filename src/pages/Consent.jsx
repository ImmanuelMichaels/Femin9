// src/pages/Consent.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ShieldIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c46db0" strokeWidth="1.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CONSENT_DETAILS = {
  healthData: 'Your health data includes symptoms, vitals, and tracking information. This is stored encrypted and only used to provide you with personalised insights. You can delete all your data at any time from Settings.',
  aiProcessing: 'Bloom AI analyses your data to provide personalised responses and insights. Your conversations are encrypted. You can delete chat history at any time.',
  analytics: 'Anonymous usage data helps us improve the app. This never includes your health data or personal information.',
  marketing: 'Occasional emails with tips and offers. You can unsubscribe at any time.',
};

// ConsentToggle component moved outside
const ConsentToggle = ({ 
  id, 
  title, 
  description, 
  required = false, 
  isChecked, 
  onToggle, 
  expandedItem, 
  onExpand 
}) => (
  <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <div>
        <span style={{ fontWeight: 700, fontSize: 'var(--fs-base)' }}>{title}</span>
        {required && (
          <span style={{ color: 'var(--rd)', marginLeft: 8, fontSize: 'var(--fs-xs)' }}>Required</span>
        )}
      </div>
      <button
        onClick={onToggle}
        style={{
          width: 50,
          height: 28,
          borderRadius: 30,
          background: isChecked ? 'var(--sg)' : 'var(--border)',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.2s'
        }}
      >
        <div style={{
          position: 'absolute',
          top: 3,
          left: isChecked ? 26 : 3,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s'
        }} />
      </button>
    </div>
    <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--mt)', lineHeight: 1.5 }}>
      {description}
    </p>
    <button
      onClick={onExpand}
      style={{
        background: 'none',
        border: 'none',
        color: 'var(--t)',
        fontSize: 'var(--fs-xs)',
        marginTop: 8,
        cursor: 'pointer',
        textDecoration: 'underline'
      }}
    >
      {expandedItem === id ? 'Hide details' : 'Learn more'}
    </button>
    {expandedItem === id && (
      <div style={{
        marginTop: 12,
        padding: 12,
        background: 'var(--warm)',
        borderRadius: 'var(--r)',
        fontSize: 'var(--fs-xs)',
        color: 'var(--md)',
        lineHeight: 1.5
      }}>
        {CONSENT_DETAILS[id]}
      </div>
    )}
  </div>
);

export default function Consent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [consents, setConsents] = useState({
    healthData: false,
    aiProcessing: false,
    analytics: false,
    marketing: false,
  });

  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);

  const allRequired = consents.healthData && privacyAccepted;

  const handleAcceptAll = () => {
    setConsents({
      healthData: true,
      aiProcessing: true,
      analytics: true,
      marketing: true,
    });
    setPrivacyAccepted(true);
  };

  const handleSave = async () => {
    if (!allRequired) return;

    setLoading(true);

    localStorage.setItem('userConsents', JSON.stringify({
      ...consents,
      privacyAccepted,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }));

    setTimeout(() => {
      setLoading(false);
      navigate('/login');
    }, 500);
  };

  const handleToggleConsent = (id) => {
    setConsents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExpandItem = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  return (
    <div className="ob-root">
      <div className="ob-logo">
        <ShieldIcon />
      </div>

      <h1 className="ob-heading" style={{ fontSize: 'var(--fs-2xl)' }}>
        Your <span className="ob-highlight">privacy</span> matters
      </h1>
      <p className="ob-sub" style={{ marginBottom: 32 }}>
        Femin9 is GDPR compliant. You're always in control of your data.
      </p>

      <div style={{ maxWidth: 500, margin: '0 auto', width: '100%', textAlign: 'left' }}>
        <ConsentToggle
          id="healthData"
          title="Health Data Processing"
          description="Store and process your health logs, symptoms, and tracking data to provide personalised insights and recommendations."
          required
          isChecked={consents.healthData}
          onToggle={() => handleToggleConsent('healthData')}
          expandedItem={expandedItem}
          onExpand={() => handleExpandItem('healthData')}
        />
        <ConsentToggle
          id="aiProcessing"
          title="AI Processing"
          description="Allow Bloom AI to analyse your data for personalised responses and health insights."
          isChecked={consents.aiProcessing}
          onToggle={() => handleToggleConsent('aiProcessing')}
          expandedItem={expandedItem}
          onExpand={() => handleExpandItem('aiProcessing')}
        />
        <ConsentToggle
          id="analytics"
          title="Anonymous Analytics"
          description="Help us improve Femin9 by sharing anonymous usage data."
          isChecked={consents.analytics}
          onToggle={() => handleToggleConsent('analytics')}
          expandedItem={expandedItem}
          onExpand={() => handleExpandItem('analytics')}
        />
        <ConsentToggle
          id="marketing"
          title="Marketing Communications"
          description="Receive tips, offers, and updates about Femin9."
          isChecked={consents.marketing}
          onToggle={() => handleToggleConsent('marketing')}
          expandedItem={expandedItem}
          onExpand={() => handleExpandItem('marketing')}
        />

        {/* Privacy Policy Acceptance */}
        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setPrivacyAccepted(prev => !prev)}
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: privacyAccepted ? 'var(--sg)' : 'transparent',
                border: `2px solid ${privacyAccepted ? 'var(--sg)' : 'var(--border)'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              {privacyAccepted && '✓'}
            </button>
            <span style={{ fontSize: 'var(--fs-sm)' }}>
              I have read and agree to the{' '}
              <button
                onClick={() => window.open('/privacy-policy.pdf', '_blank')}
                style={{ background: 'none', border: 'none', color: 'var(--t)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Privacy Policy
              </button>
            </span>
          </div>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginTop: 8, marginLeft: 36 }}>
            We never sell your data. You can withdraw consent at any time in Settings.
          </p>
        </div>

        <button
          onClick={handleAcceptAll}
          style={{
            width: '100%',
            padding: 'var(--sp-3)',
            background: 'var(--warm)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            fontSize: 'var(--fs-sm)',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: 12
          }}
        >
          Accept All
        </button>

        <button
          onClick={handleSave}
          disabled={!allRequired || loading}
          style={{
            width: '100%',
            padding: 'var(--sp-4)',
            background: allRequired ? 'var(--dp)' : 'var(--border)',
            color: allRequired ? '#fff' : 'var(--mt)',
            border: 'none',
            borderRadius: 'var(--r)',
            fontSize: 'var(--fs-md)',
            fontWeight: 800,
            cursor: allRequired ? 'pointer' : 'not-allowed',
            opacity: loading ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12
          }}
        >
          {loading ? 'Saving...' : 'Continue to Login >'}
        </button>

        <p style={{ fontSize: 'var(--fs-2xs)', color: 'var(--mt)', textAlign: 'center', marginTop: 24 }}>
          Femin9 is not a medical device. Always consult your GP or midwife for medical advice.
        </p>
      </div>
    </div>
  );
}