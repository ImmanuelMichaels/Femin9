// src/pages/Consent.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../context/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import PrivacyPolicy from './PrivacyPolicy';

const CONSENT_VERSION = '1.0.0';

const ShieldIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c46db0" strokeWidth="1.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CONSENT_DETAILS = {
  healthData: 'Your health data includes symptoms, vitals, and tracking information. This is stored encrypted in the UK (Google Cloud, London region) and only used to provide you with personalised insights. You can delete all your data at any time from Settings.',
  aiProcessing: 'Bloom AI analyses your data to provide personalised responses and insights. Your conversations are encrypted and stored in the UK. Anthropic (the AI provider) does not retain your data beyond the request. You can delete chat history at any time.',
  analytics: 'Anonymous usage data helps us improve the app. This is fully anonymised before collection and never includes your health data or personal information.',
  marketing: 'Occasional emails with tips, updates, and offers relevant to your health journey. You can unsubscribe at any time from the email or from Settings.',
};

const ConsentToggle = ({
  id,
  title,
  description,
  required = false,
  isChecked,
  onToggle,
  expandedItem,
  onExpand,
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
        onClick={required ? undefined : onToggle}
        aria-pressed={isChecked}
        aria-label={`${title} consent toggle`}
        style={{
          width: 50,
          height: 28,
          borderRadius: 30,
          background: isChecked ? 'var(--sg)' : 'var(--border)',
          border: 'none',
          cursor: required ? 'not-allowed' : 'pointer',
          position: 'relative',
          transition: 'background 0.2s',
          opacity: required ? 0.75 : 1,
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
          transition: 'left 0.2s',
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
        textDecoration: 'underline',
        padding: 0,
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
        lineHeight: 1.5,
      }}>
        {CONSENT_DETAILS[id]}
      </div>
    )}
  </div>
);

// ── Persists consent record to both localStorage and Firestore ────────────────
async function persistConsent(consents, privacyAccepted) {
  const record = {
    healthData: consents.healthData,
    aiProcessing: consents.aiProcessing,
    analytics: consents.analytics,
    marketing: consents.marketing,
    privacyPolicyAccepted: privacyAccepted,
    consentVersion: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
  };

  // Always write to localStorage first — works pre-auth and as a fast cache
  localStorage.setItem('userConsents', JSON.stringify(record));

  // Write to Firestore if user is already authenticated
  const user = auth.currentUser;
  if (user) {
    try {
      await setDoc(
        doc(db, 'users', user.uid, 'consent', 'record'),
        {
          ...record,
          serverTimestamp: serverTimestamp(),
          uid: user.uid,
        },
        { merge: false }
      );
    } catch (err) {
      // Non-blocking — localStorage ensures the user can proceed
      console.error('Firestore consent write failed:', err);
    }
  }
  // If no auth yet (pre-login flow), AppContext will migrate localStorage → Firestore
  // after the user signs in. See migrateConsentToFirestore() in AppContext.jsx.
}

export default function Consent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  const [consents, setConsents] = useState({
    healthData: false,
    aiProcessing: false,
    analytics: false,
    marketing: false,
  });

  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const [error, setError] = useState('');

  const allRequired = consents.healthData && privacyAccepted;

  const handleAcceptAll = () => {
    setConsents({ healthData: true, aiProcessing: true, analytics: true, marketing: true });
    setPrivacyAccepted(true);
    setError('');
  };

  const handleSave = async () => {
    if (!allRequired) {
      setError('Please enable Health Data Processing and accept the Privacy Policy to continue.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await persistConsent(consents, privacyAccepted);
      navigate('/login');
    } catch (err) {
      console.error('Consent save error:', err);
      setError('Something went wrong saving your preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConsent = (id) => {
    setConsents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExpandItem = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  // ── Privacy Policy overlay ──────────────────────────────────────────────────
  if (showPolicy) {
    return (
      <div className="ob-root" style={{ padding: 0, overflowY: 'auto' }}>
        <PrivacyPolicy onBack={() => setShowPolicy(false)} />
      </div>
    );
  }

  // ── Main consent screen ─────────────────────────────────────────────────────
  return (
    <div className="ob-root">
      <div className="ob-logo">
        <ShieldIcon />
      </div>

      <h1 className="ob-heading" style={{ fontSize: 'var(--fs-2xl)' }}>
        Your <span className="ob-highlight">privacy</span> matters
      </h1>
      <p className="ob-sub" style={{ marginBottom: 32 }}>
        Femin9 is UK GDPR compliant. Your health data stays in the UK. You are always in control.
      </p>

      <div style={{ maxWidth: 500, margin: '0 auto', width: '100%', textAlign: 'left' }}>

        <ConsentToggle
          id="healthData"
          title="Health Data Processing"
          description="Store and process your health logs, symptoms, and tracking data to provide personalised insights and recommendations. Required for the app to function."
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
          description="Help us improve Femin9 by sharing fully anonymous usage data. No health data is included."
          isChecked={consents.analytics}
          onToggle={() => handleToggleConsent('analytics')}
          expandedItem={expandedItem}
          onExpand={() => handleExpandItem('analytics')}
        />
        <ConsentToggle
          id="marketing"
          title="Marketing Communications"
          description="Receive tips, offers, and updates about Femin9 by email."
          isChecked={consents.marketing}
          onToggle={() => handleToggleConsent('marketing')}
          expandedItem={expandedItem}
          onExpand={() => handleExpandItem('marketing')}
        />

        {/* Privacy Policy checkbox */}
        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <button
              onClick={() => {
                setPrivacyAccepted(prev => !prev);
                setError('');
              }}
              aria-pressed={privacyAccepted}
              aria-label="Accept Privacy Policy"
              style={{
                flexShrink: 0,
                width: 24,
                height: 24,
                borderRadius: 6,
                background: privacyAccepted ? 'var(--sg)' : 'transparent',
                border: `2px solid ${privacyAccepted ? 'var(--sg)' : 'var(--border)'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 14,
                marginTop: 2,
              }}
            >
              {privacyAccepted && '✓'}
            </button>
            <span style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.5 }}>
              I have read and agree to the{' '}
              <button
                onClick={() => setShowPolicy(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--dp)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  fontSize: 'inherit',
                  fontWeight: 600,
                }}
              >
                Privacy Policy
              </button>
              . I understand Femin9 will process my health data to provide personalised support.
            </span>
          </div>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginTop: 8, marginLeft: 36 }}>
            We never sell your data. Your data stays in the UK. You can withdraw consent at any time in Settings.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            padding: 12,
            background: '#FEE2E2',
            borderRadius: 'var(--r)',
            fontSize: 'var(--fs-xs)',
            color: '#B91C1C',
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {/* Accept All */}
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
            marginBottom: 12,
          }}
        >
          Accept All &amp; Continue
        </button>

        {/* Continue button */}
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
            gap: 12,
            transition: 'background 0.2s, opacity 0.2s',
          }}
        >
          {loading ? 'Saving your preferences…' : 'Continue to Login →'}
        </button>

        <p style={{ fontSize: 'var(--fs-2xs)', color: 'var(--mt)', textAlign: 'center', marginTop: 24 }}>
          Femin9 is not a medical device. Always consult your GP or midwife for medical advice.
          Operated by Arvenue UK Ltd · Data stored in UK (europe-west2)
        </p>
      </div>
    </div>
  );
}