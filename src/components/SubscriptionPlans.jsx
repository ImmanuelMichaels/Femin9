import { useState } from 'react';
import { useApp } from '../context/useApp';
import { auth, db } from '../context/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: '£0',
    period: '/month',
    description: 'Essential support for your journey',
    features: [
      { text: '10 AI messages per day', included: true },
      { text: 'Basic symptom tracking', included: true },
      { text: 'Cultural food database', included: true },
      { text: 'Medication safety checker', included: true },
      { text: 'Emergency resources', included: true },
      { text: 'Unlimited AI messages', included: false },
      { text: 'Export health data', included: false },
      { text: 'Priority support', included: false },
      { text: 'Birth plan builder', included: false },
      { text: 'Partner access', included: false }
    ],
    buttonText: 'Current Plan',
    buttonClass: 'current',
    popular: false,
    priceId: null
  },
  bloom: {
    id: 'bloom',
    name: 'Bloom',
    price: '£4.99',
    period: '/month',
    description: 'For moms who want more support',
    features: [
      { text: '50 AI messages per day', included: true },
      { text: 'Advanced symptom tracking', included: true },
      { text: 'Cultural food database', included: true },
      { text: 'Medication safety checker', included: true },
      { text: 'Emergency resources', included: true },
      { text: 'Export health data', included: true },
      { text: 'Priority support', included: false },
      { text: 'Birth plan builder', included: false },
      { text: 'Partner access', included: false }
    ],
    buttonText: 'Upgrade to Bloom',
    buttonClass: 'upgrade',
    popular: false,
    priceId: 'price_bloom_monthly'
  },
  bloomPlus: {
    id: 'bloomPlus',
    name: 'Bloom+',
    price: '£9.99',
    period: '/month',
    description: 'Complete care for your entire journey',
    features: [
      { text: 'Unlimited AI messages', included: true },
      { text: 'Advanced symptom tracking', included: true },
      { text: 'Cultural food database', included: true },
      { text: 'Medication safety checker', included: true },
      { text: 'Emergency resources', included: true },
      { text: 'Export health data', included: true },
      { text: 'Priority 24/7 support', included: true },
      { text: 'Birth plan builder', included: true },
      { text: 'Partner access', included: true }
    ],
    buttonText: 'Upgrade to Bloom+',
    buttonClass: 'upgrade-popular',
    popular: true,
    priceId: 'price_bloom_plus_monthly'
  }
};

// Annual plans (discounted)
const ANNUAL_PLANS = {
  bloom: {
    ...PLANS.bloom,
    price: '£49.99',
    period: '/year',
    description: '2 months free • Save £9.89',
    priceId: 'price_bloom_yearly'
  },
  bloomPlus: {
    ...PLANS.bloomPlus,
    price: '£99.99',
    period: '/year',
    description: '2 months free • Save £19.89',
    priceId: 'price_bloom_plus_yearly'
  }
};

export default function SubscriptionPlans({ onClose, onUpgrade }) {
  const { subscriptionPlan, setSubscriptionPlan, userName } = useApp();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const currentPlanId = subscriptionPlan || 'free';
  const plans = billingCycle === 'monthly' 
    ? PLANS 
    : { free: PLANS.free, bloom: ANNUAL_PLANS.bloom, bloomPlus: ANNUAL_PLANS.bloomPlus };

  const handleUpgrade = async (planId) => {
    if (planId === currentPlanId) return;
    
    setLoading(planId);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update Firestore
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        plan: planId,
        planUpdatedAt: new Date(),
        messageCount: 0
      });
    }
    
    // Update context and localStorage
    setSubscriptionPlan(planId);
    localStorage.setItem('subscriptionPlan', planId);
    
    setLoading(null);
    setShowConfetti(true);
    
    if (onUpgrade) onUpgrade(planId);
    
    // Close modal after confetti
    setTimeout(() => {
      setShowConfetti(false);
      if (onClose) onClose();
    }, 3000);
  };

  const getFeatureStatus = (feature, plan) => {
    const planFeatures = plans[plan.id]?.features || PLANS[plan.id]?.features;
    const featureObj = planFeatures?.find(f => f.text === feature.text);
    return featureObj?.included || false;
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'fadeIn 0.3s ease-out'
        }}
      />
      
      {/* Modal Content */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: 1200,
        maxHeight: '90vh',
        overflowY: 'auto',
        background: 'linear-gradient(135deg, #FCE8EF 0%, #FFF0F5 100%)',
        borderRadius: 32,
        zIndex: 9999,
        animation: 'slideUp 0.3s ease-out',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'white',
            border: 'none',
            fontSize: 24,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D63A6E',
            transition: 'all 0.2s',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.backgroundColor = '#D63A6E';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.color = '#D63A6E';
          }}
        >
          ✕
        </button>

        {/* Confetti effect */}
        {showConfetti && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 1000,
            background: 'radial-gradient(circle, rgba(216,58,110,0.2) 0%, transparent 70%)',
            animation: 'pulse 1s ease-out'
          }}>
            <div style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 64, marginBottom: 16, animation: 'bounce 0.5s ease-out' }}>🎉</div>
              <h2 style={{ color: '#D63A6E', margin: 0, fontSize: 28 }}>Welcome to Bloom+!</h2>
              <p style={{ color: '#666', fontSize: 16, marginTop: 8 }}>You now have unlimited access to all features</p>
            </div>
          </div>
        )}

        <div style={{ padding: '40px 20px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🌸</div>
              <h1 style={{ fontSize: 'clamp(28px,5vw,40px)', color: '#D63A6E', marginBottom: 8 }}>
                Choose Your Journey
              </h1>
              <p style={{ fontSize: 18, color: '#666', maxWidth: 500, margin: '0 auto' }}>
                Hi {userName || 'Mama'}! Pick the plan that gives you the support you deserve.
              </p>
            </div>

            {/* Billing Toggle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40, gap: 12 }}>
              <button
                onClick={() => setBillingCycle('monthly')}
                style={{
                  padding: '10px 24px',
                  borderRadius: 30,
                  border: billingCycle === 'monthly' ? '2px solid #D63A6E' : '1px solid #ddd',
                  background: billingCycle === 'monthly' ? '#D63A6E' : 'white',
                  color: billingCycle === 'monthly' ? 'white' : '#666',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                style={{
                  padding: '10px 24px',
                  borderRadius: 30,
                  border: billingCycle === 'yearly' ? '2px solid #D63A6E' : '1px solid #ddd',
                  background: billingCycle === 'yearly' ? '#D63A6E' : 'white',
                  color: billingCycle === 'yearly' ? 'white' : '#666',
                  fontWeight: 600,
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                Yearly
                <span style={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  background: '#2E9E67',
                  color: 'white',
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 20,
                  fontWeight: 600
                }}>
                  Save £20
                </span>
              </button>
            </div>

            {/* Plans Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 24,
              alignItems: 'stretch'
            }}>
              {Object.values(plans).map((plan) => {
                const isCurrentPlan = plan.id === currentPlanId;
                const isPopular = plan.popular;
                const isUpgrading = loading === plan.id;

                return (
                  <div
                    key={plan.id}
                    style={{
                      background: 'white',
                      borderRadius: 32,
                      padding: '28px 24px 32px',
                      boxShadow: isPopular 
                        ? '0 20px 40px rgba(216,58,110,0.15), 0 0 0 2px #D63A6E' 
                        : '0 10px 30px rgba(0,0,0,0.08)',
                      position: 'relative',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      transform: isPopular ? 'scale(1.02)' : 'scale(1)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {isPopular && (
                      <div style={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#D63A6E',
                        color: 'white',
                        padding: '6px 16px',
                        borderRadius: 30,
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: 1
                      }}>
                        MOST POPULAR
                      </div>
                    )}

                    {/* Plan Name */}
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                      <h2 style={{ fontSize: 28, color: '#333', marginBottom: 8 }}>{plan.name}</h2>
                      <p style={{ color: '#888', fontSize: 14 }}>{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                      <span style={{ fontSize: 48, fontWeight: 800, color: '#D63A6E' }}>{plan.price}</span>
                      <span style={{ color: '#888' }}>{plan.period}</span>
                      {billingCycle === 'yearly' && plan.id !== 'free' && (
                        <p style={{ fontSize: 12, color: '#2E9E67', marginTop: 8 }}>
                          {plan.id === 'bloom' ? 'Save £9.89 vs monthly' : 'Save £19.89 vs monthly'}
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <div style={{ flex: 1, marginBottom: 32 }}>
                      {PLANS.free.features.map((feature, idx) => {
                        const isIncluded = getFeatureStatus(feature, plan);
                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '8px 0',
                              opacity: isIncluded ? 1 : 0.5
                            }}
                          >
                            <span style={{ 
                              fontSize: 18,
                              color: isIncluded ? '#2E9E67' : '#ccc'
                            }}>
                              {isIncluded ? '✓' : '○'}
                            </span>
                            <span style={{ color: '#555', fontSize: 14 }}>{feature.text}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Button */}
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isCurrentPlan || isUpgrading}
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: 40,
                        fontSize: 16,
                        fontWeight: 700,
                        cursor: isCurrentPlan ? 'default' : 'pointer',
                        background: isCurrentPlan
                          ? '#E8F7EE'
                          : plan.id === 'bloomPlus'
                          ? '#D63A6E'
                          : 'white',
                        color: isCurrentPlan
                          ? '#2E9E67'
                          : plan.id === 'bloomPlus'
                          ? 'white'
                          : '#D63A6E',
                        border: isCurrentPlan
                          ? '1px solid #2E9E67'
                          : plan.id === 'bloomPlus'
                          ? 'none'
                          : '2px solid #D63A6E',
                        transition: 'all 0.2s',
                        opacity: isUpgrading ? 0.7 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrentPlan && !isUpgrading) {
                          e.currentTarget.style.transform = 'scale(1.02)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrentPlan && !isUpgrading) {
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      {isUpgrading ? (
                        <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            width: 16,
                            height: 16,
                            border: `2px solid ${plan.id === 'bloomPlus' ? 'white' : '#D63A6E'}`,
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite'
                          }} />
                          Processing...
                        </span>
                      ) : (
                        plan.buttonText
                      )}
                    </button>

                    {plan.id === 'free' && (
                      <p style={{ textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 16 }}>
                        Free forever. No credit card required.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: 48, padding: 24 }}>
              <p style={{ fontSize: 12, color: '#aaa' }}>
                All plans include a 7-day free trial for Bloom and Bloom+.<br />
                Cancel anytime. No questions asked.
              </p>
              <button
                onClick={onClose}
                style={{
                  marginTop: 24,
                  background: 'transparent',
                  border: 'none',
                  color: '#D63A6E',
                  fontSize: 14,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
        
        @keyframes pulse {
          0% { opacity: 0; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.1); }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </>
  );
}