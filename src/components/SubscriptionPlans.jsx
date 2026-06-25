import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/useApp';
import { auth, db } from '../context/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

// ── Design tokens ─────────────────────────────────────────────────────────────
const PURPLE = '#4108a5';
const GREEN  = '#2E9E67';

// ── Single source of truth for plan IDs ───────────────────────────────────────
// Keep in sync with Profile.jsx. Use 'bloom_plus' everywhere — no spaces or +.
export const PLAN_IDS = {
  FREE:       'free',
  BLOOM_PLUS: 'bloom_plus',
};

const BASE_FEATURES = [
  '10 AI messages per day',
  'Basic symptom tracking',
  'Cultural food database',
  'Medication safety checker',
  'Emergency resources',
  'Unlimited AI messages',
  'Export health data',
  'Priority 24/7 support',
  'Birth plan builder',
  'Partner access',
];

const PLANS = {
  [PLAN_IDS.FREE]: {
    id: PLAN_IDS.FREE,
    name: 'Free',
    monthlyPrice: '£0',
    yearlyPrice: '£0',
    period: { monthly: '/month', yearly: '/year' },
    tagline: 'Essential support for your journey',
    included: [
      '10 AI messages per day',
      'Basic symptom tracking',
      'Cultural food database',
      'Medication safety checker',
      'Emergency resources',
    ],
    buttonText: 'Current Plan',
    popular: false,
  },
  [PLAN_IDS.BLOOM_PLUS]: {
    id: PLAN_IDS.BLOOM_PLUS,
    name: 'Bloom+',
    monthlyPrice: '£6.99',
    yearlyPrice: '£69.99',
    period: { monthly: '/month', yearly: '/year' },
    tagline: 'Complete care for your entire journey',
    included: BASE_FEATURES,
    buttonText: 'Upgrade to Bloom+',
    popular: true,
  },
};

export default function SubscriptionPlans({ onClose, onUpgrade }) {
  const { subscriptionPlan, setSubscriptionPlan } = useApp();
  const [billingCycle, setBillingCycle] = useState(() => {
    try { return localStorage.getItem('billingCycle') || 'monthly'; }
    catch { return 'monthly'; }
  });
  const [loading,      setLoading]      = useState(null);
  const [upgradeError, setUpgradeError] = useState(null);
  const [success,      setSuccess]      = useState(false);
  const [upgradedPlan, setUpgradedPlan] = useState(null);
  const scrollRef  = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const plansArray  = Object.values(PLANS);
  const currentPlanId = subscriptionPlan || PLAN_IDS.FREE;

  // Persist billing cycle selection
  const handleBillingCycle = (cycle) => {
    setBillingCycle(cycle);
    try { localStorage.setItem('billingCycle', cycle); } catch { /* silent */ }
  };

  // Sync dot indicator with scroll position
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setActiveIdx(Math.max(0, Math.min(idx, plansArray.length - 1)));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [plansArray.length]);

  const scrollTo = (idx) => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' });
    setActiveIdx(idx);
  };

  const handleUpgrade = async (planId) => {
    if (planId === currentPlanId || loading) return;
    // Free downgrades not permitted via this modal
    if (planId === PLAN_IDS.FREE) return;

    setLoading(planId);
    setUpgradeError(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      // ── TODO: Replace this block with a real payment gateway call ──────────
      // e.g. call your Cloud Function: await fetch('/api/create-checkout', ...)
      // Only write to Firestore AFTER payment is confirmed server-side.
      // The block below is a placeholder that bypasses payment — remove before launch.
      // ──────────────────────────────────────────────────────────────────────
      const planRef = doc(db, 'users', user.uid);
      await updateDoc(planRef, {
        plan:          planId,
        billingCycle,
        planUpdatedAt: serverTimestamp(), // fix: use server timestamp not client new Date()
        // messageCount reset must be done server-side — removed from client
      });
      // ── End placeholder ───────────────────────────────────────────────────

      // Update context and localStorage so Profile re-renders immediately
      setSubscriptionPlan(planId);
      try { localStorage.setItem('subscriptionPlan', planId); } catch { /* silent */ }

      setUpgradedPlan(PLANS[planId]);
      setSuccess(true);
      if (onUpgrade) onUpgrade(planId);

      setTimeout(() => {
        setSuccess(false);
        if (onClose) onClose();
      }, 2800);

    } catch (err) {
      console.error('Upgrade error:', err);
      setUpgradeError('Something went wrong. Please try again or contact support.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={!loading ? onClose : undefined}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 9998,
        }}
      />

      {/* ── Modal ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose your subscription plan"
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(94vw, 760px)',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#fff',
          borderRadius: 28,
          zIndex: 9999,
          boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
          animation: 'femin9-slide-up 0.28s ease-out both',
        }}
      >
        {/* Success overlay */}
        {success && upgradedPlan && (
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: 28,
            background: 'rgba(255,255,255,0.97)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 10,
            animation: 'femin9-fade-in 0.3s ease-out',
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h2 style={{ color: PURPLE, fontSize: 26, fontWeight: 700, margin: 0 }}>
              Welcome to {upgradedPlan.name}!
            </h2>
            <p style={{ color: '#555', fontSize: 15, marginTop: 8, textAlign: 'center', padding: '0 24px' }}>
              You now have unlimited access to all features.
            </p>
          </div>
        )}

        {/* ── Inner padding wrapper ── */}
        <div style={{ padding: '28px 24px 32px' }}>

          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button
              onClick={!loading ? onClose : undefined}
              disabled={!!loading}
              aria-label="Close"
              style={{
                width: 36, height: 36,
                borderRadius: '50%',
                border: '1.5px solid #e0d5f5',
                background: 'white',
                color: PURPLE,
                fontSize: 16,
                cursor: loading ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: loading ? 0.4 : 1,
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = PURPLE; e.currentTarget.style.color = '#fff'; } }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = PURPLE; }}
            >
              ✕
            </button>
          </div>

          {/* Billing toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 28 }}>
            {['monthly', 'yearly'].map(cycle => (
              <button
                key={cycle}
                onClick={() => handleBillingCycle(cycle)}
                style={{
                  padding: '9px 26px',
                  borderRadius: 30,
                  border: billingCycle === cycle ? `2px solid ${PURPLE}` : '1.5px solid #ddd',
                  background: billingCycle === cycle ? PURPLE : '#fff',
                  color: billingCycle === cycle ? '#fff' : '#777',
                  fontWeight: 600, fontSize: 14,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.18s',
                }}
              >
                {cycle === 'monthly' ? 'Monthly' : 'Yearly'}
                {cycle === 'yearly' && (
                  <span style={{
                    position: 'absolute', top: -10, right: -8,
                    background: GREEN, color: '#fff',
                    fontSize: 10, padding: '2px 7px',
                    borderRadius: 20, fontWeight: 700,
                    pointerEvents: 'none',
                  }}>
                    Save £14
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Error banner */}
          {upgradeError && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: 12, padding: '10px 16px',
              marginBottom: 16, fontSize: 13,
              color: '#991B1B', textAlign: 'center',
            }}>
              {upgradeError}
            </div>
          )}

          {/* ── Plan cards ── */}
          <div
            ref={scrollRef}
            style={{
              display: 'flex',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth',
              gap: 0,
              padding: '4px 0 16px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
            className="femin9-hide-scrollbar"
          >
            {plansArray.map((plan) => {
              const isCurrent   = plan.id === currentPlanId;
              const isUpgrading = loading === plan.id;
              const price       = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
              const period      = plan.period[billingCycle];

              return (
                <div
                  key={plan.id}
                  style={{
                    flex: '0 0 100%',
                    width: '100%',
                    scrollSnapAlign: 'start',
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '8px 16px',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{
                    width: '100%', maxWidth: 340,
                    background: '#fff', borderRadius: 22,
                    padding: '22px 20px 24px',
                    border: plan.popular ? `2px solid ${PURPLE}` : '1.5px solid #ede9f6',
                    boxShadow: plan.popular
                      ? '0 8px 32px rgba(65,8,165,0.13)'
                      : '0 2px 12px rgba(0,0,0,0.05)',
                    position: 'relative',
                    display: 'flex', flexDirection: 'column',
                    transition: 'box-shadow 0.2s',
                  }}>
                    {plan.popular && (
                      <div style={{
                        position: 'absolute', top: -12, left: '50%',
                        transform: 'translateX(-50%)',
                        background: PURPLE, color: '#fff',
                        fontSize: 11, fontWeight: 700,
                        padding: '3px 14px', borderRadius: 20,
                        letterSpacing: 0.5, whiteSpace: 'nowrap',
                      }}>
                        MOST POPULAR
                      </div>
                    )}

                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#222', margin: 0 }}>
                        {plan.name}
                      </h2>
                      <p style={{ fontSize: 12, color: '#888', margin: '5px 0 0' }}>
                        {plan.tagline}
                      </p>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                      <span style={{ fontSize: 38, fontWeight: 800, color: PURPLE, lineHeight: 1 }}>
                        {price}
                      </span>
                      <span style={{ fontSize: 13, color: '#999' }}>{period}</span>
                      {billingCycle === 'yearly' && plan.id === PLAN_IDS.BLOOM_PLUS && (
                        <p style={{ fontSize: 12, color: GREEN, margin: '4px 0 0' }}>
                          2 months free — save £13.89
                        </p>
                      )}
                    </div>

                    <ul style={{ flex: 1, listStyle: 'none', margin: '0 0 20px', padding: 0 }}>
                      {BASE_FEATURES.map((feat) => {
                        const on = plan.included.includes(feat);
                        return (
                          <li key={feat} style={{
                            display: 'flex', alignItems: 'center', gap: 9,
                            padding: '5px 0', opacity: on ? 1 : 0.38,
                          }}>
                            <span style={{
                              fontSize: 15, color: on ? GREEN : '#bbb',
                              width: 20, textAlign: 'center', flexShrink: 0,
                            }}>
                              {on ? '✓' : '○'}
                            </span>
                            <span style={{
                              fontSize: 13,
                              color: on ? '#444' : '#aaa',
                              textDecoration: on ? 'none' : 'line-through',
                            }}>
                              {feat}
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isCurrent || !!loading}
                      style={{
                        width: '100%', padding: '13px 18px',
                        borderRadius: 40,
                        fontSize: 14, fontWeight: 700,
                        cursor: isCurrent || loading ? 'default' : 'pointer',
                        background: isCurrent ? '#edf9f2'
                          : plan.id === PLAN_IDS.BLOOM_PLUS ? PURPLE : '#fff',
                        color: isCurrent ? GREEN
                          : plan.id === PLAN_IDS.BLOOM_PLUS ? '#fff' : PURPLE,
                        border: isCurrent ? `1.5px solid ${GREEN}`
                          : plan.id === PLAN_IDS.BLOOM_PLUS ? 'none' : `2px solid ${PURPLE}`,
                        opacity: isUpgrading ? 0.75 : 1,
                        transition: 'all 0.18s',
                      }}
                      onMouseEnter={e => {
                        if (!isCurrent && !loading) {
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 4px 14px rgba(65,8,165,0.18)';
                        }
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {isUpgrading ? (
                        <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            width: 16, height: 16,
                            border: `2px solid ${plan.id === PLAN_IDS.BLOOM_PLUS ? '#fff' : PURPLE}`,
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'femin9-spin 0.7s linear infinite',
                            display: 'inline-block',
                          }} />
                          Processing…
                        </span>
                      ) : isCurrent ? '✓ Current Plan' : plan.buttonText}
                    </button>

                    {plan.id === PLAN_IDS.FREE && (
                      <p style={{ textAlign: 'center', fontSize: 11, color: '#bbb', marginTop: 10 }}>
                        Free forever. No card required.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dot indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 22 }}>
            {plansArray.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                aria-label={`Go to plan ${i + 1}`}
                style={{
                  width: activeIdx === i ? 28 : 8, height: 8,
                  borderRadius: 4,
                  background: activeIdx === i ? PURPLE : '#ddd',
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.25s ease', padding: 0,
                }}
              />
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', margin: 0 }}>
            Bloom+ includes a 7-day free trial. Cancel anytime, no questions asked.
          </p>
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button
              onClick={!loading ? onClose : undefined}
              disabled={!!loading}
              style={{
                background: 'none', border: 'none',
                color: PURPLE, fontSize: 13,
                cursor: loading ? 'default' : 'pointer',
                textDecoration: 'underline',
                padding: '4px 12px',
                opacity: loading ? 0.4 : 0.75,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = loading ? '0.4' : '0.75'; }}
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes femin9-slide-up {
          from { opacity: 0; transform: translate(-50%, -46%) scale(0.96); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes femin9-fade-in {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes femin9-spin {
          to { transform: rotate(360deg); }
        }
        .femin9-hide-scrollbar::-webkit-scrollbar { display: none; }
        .femin9-hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}