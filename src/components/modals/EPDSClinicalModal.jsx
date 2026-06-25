// src/components/modals/EPDSClinicalModal.jsx
// Replaces the browser alert() in AppShell.jsx handleEPDSComplete.
// Logs score to Firestore. Shows correct crisis resources.

import { useEffect } from 'react';
import { db, auth } from '../../context/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const THRESHOLDS = {
  low:      { min: 0,  max: 9,  label: 'Low concern',    color: '#2E9E67', bg: '#E8F7EE' },
  moderate: { min: 10, max: 12, label: 'Monitor closely', color: '#C87C30', bg: '#FEF2E0' },
  high:     { min: 13, max: 30, label: 'Needs support',   color: '#D0524A', bg: '#FDEEEC' },
};

function getTier(score) {
  if (score <= 9)  return 'low';
  if (score <= 12) return 'moderate';
  return 'high';
}

async function logEPDSScore(score, tier) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await setDoc(
      doc(db, 'users', user.uid, 'epdsScreenings', new Date().toISOString()),
      {
        score,
        tier,
        screenedAt: serverTimestamp(),
        requiresFollowUp: tier === 'high',
      }
    );
  } catch (e) {
    console.error('[EPDS] Firestore log failed:', e);
  }
}

export default function EPDSClinicalModal({ score, onClose }) {
  const tier    = getTier(score);
  const meta    = THRESHOLDS[tier];

  // Log to Firestore on mount (fire-and-forget)
  useEffect(() => {
    logEPDSScore(score, tier);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.75)',
      zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        maxWidth: 460,
        width: '100%',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Score header */}
        <div style={{ background: meta.bg, padding: '24px 24px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: meta.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            EPDS Screening Result
          </p>
          <div style={{ fontSize: 48, fontWeight: 800, color: meta.color, marginBottom: 4 }}>{score}</div>
          <p style={{ fontSize: 14, color: meta.color, fontWeight: 600 }}>{meta.label}</p>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          {/* Tier-specific messaging */}
          {tier === 'low' && (
            <p style={{ fontSize: 14, color: '#444', lineHeight: 1.6, marginBottom: 16 }}>
              Your score suggests low risk right now. How you feel can change — if things feel harder, reach out to your health visitor or GP any time. 💙
            </p>
          )}

          {tier === 'moderate' && (
            <p style={{ fontSize: 14, color: '#444', lineHeight: 1.6, marginBottom: 16 }}>
              Your score suggests you may be struggling. This is common and treatable. Please speak to your GP or health visitor at your next appointment, or sooner if needed.
            </p>
          )}

          {tier === 'high' && (
            <>
              <p style={{ fontSize: 14, color: '#333', lineHeight: 1.6, marginBottom: 16, fontWeight: 500 }}>
                Your score suggests you may need support right now. This is not your fault. Postnatal depression is a medical condition and treatment works.
              </p>
              <div style={{ background: '#FFF5F8', border: '1px solid #FFB3CC', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#D63A6E', marginBottom: 10 }}>
                  📞 Please reach out today
                </p>
                {[
                  ['PANDAS Foundation', '0808 1961 776', '24/7, free, postpartum crisis'],
                  ['Samaritans', '116 123', '24/7, free, confidential'],
                  ['NHS 111', '111', 'Urgent mental health support'],
                ].map(([name, number, desc]) => (
                  <div key={name} style={{ marginBottom: 8 }}>
                    <a href={`tel:${number}`} style={{ textDecoration: 'none' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>{name}: </span>
                      <span style={{ fontSize: 13, color: '#D63A6E', fontWeight: 700 }}>{number}</span>
                    </a>
                    <span style={{ fontSize: 11, color: '#888', marginLeft: 6 }}>{desc}</span>
                  </div>
                ))}
                <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                  Text <strong>SHOUT</strong> to <strong>85258</strong> if you prefer to text.
                </p>
              </div>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.5, marginBottom: 16 }}>
                <strong>Please book a GP appointment this week.</strong> Share this score with your doctor or health visitor.
              </p>
            </>
          )}

          {/* Dismiss */}
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '14px',
              background: tier === 'high' ? '#D63A6E' : '#1B2A4A',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {tier === 'high' ? 'I\'ll reach out for support' : 'Continue'}
          </button>

          <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: 12 }}>
            📍 This screening is a guide, not a diagnosis. Always speak to a healthcare professional.
          </p>
        </div>
      </div>
    </div>
  );
}
