import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp' 
import './Onboarding.css';

/* ── per-card config ── */
const CARDS = [
  {
    id: 'pregnant',
    label: "I'm Pregnant",
    description: "Track your pregnancy and prepare for baby's arrival",
    imgSrc: 'pregnancy.png',
    imgAlt: 'pregnant woman',
    bg: '#fce8ef',
    iconColor: '#d63a6e',
    titleColor: '#bf1650',
    arrowBg: '#f5c0d2',
  },
  {
    id: 'conceive',
    label: 'Trying to Conceive',
    description: 'Get support, track ovulation and boost your fertility',
    imgSrc: 'conceive.png',
    imgAlt: 'woman thinking',
    bg: '#e8f0fb',
    iconColor: '#3b7de9',
    titleColor: '#1759d3',
    arrowBg: '#c4d8f8',
  },
  {
    id: 'ivf',
    label: 'IVF & Fertility',
    description:
      'Medication schedules, scan tracking, embryo grading, and the two-week wait — every step organised so you can focus on hope.',
    imgSrc: 'ivf.png',
    imgAlt: 'woman undergoing fertility treatment',
    bg: '#fff3e8',
    iconColor: '#f08c2e',
    titleColor: '#c96a10',
    arrowBg: '#ffd7b0',
  },
  {
    id: 'mom',
    label: "I'm already a Mom",
    description: 'Care for your baby and yourself with confidence',
    imgSrc: 'mum.png',
    imgAlt: 'mother with baby',
    bg: '#e6f5ee',
    iconColor: '#2e9e67',
    titleColor: '#1a6e45',
    arrowBg: '#b6e4cb',
  },
  {
    id: 'menopause',
    label: 'Cycle & Menopause Support',
    description: 'Understand your body and thrive through every stage',
    imgSrc: 'menopause.png',
    imgAlt: 'woman in calm pose',
    bg: '#f0e8fb',
    iconColor: '#9a3dde',
    titleColor: '#7a1db5',
    arrowBg: '#dcc4f7',
  },
];

// Cultural background options for personalized nutrition
const CULTURES = [
  { id: 'west_central_african', label: 'West & Central African', emoji: '🌍', flag: '🇳🇬🇬🇭' },
  { id: 'east_african', label: 'East African', emoji: '🌍', flag: '🇰🇪🇹🇿' },
  { id: 'south_asian', label: 'South Asian', emoji: '🕌', flag: '🇮🇳🇵🇰' },
  { id: 'caribbean', label: 'Caribbean', emoji: '🏝️', flag: '🇯🇲🇹🇹' },
  { id: 'east_asian', label: 'East & Southeast Asian', emoji: '🥢', flag: '🇨🇳🇻🇳' },
  { id: 'mena', label: 'Middle Eastern & North African', emoji: '🌙', flag: '🇪🇬🇲🇦' },
  { id: 'latin_american', label: 'Latin American', emoji: '💃', flag: '🇧🇷🇲🇽' },
  { id: 'white_european', label: 'White European', emoji: '🏰', flag: '🇬🇧🇪🇺' },
  { id: 'prefer_not', label: 'Prefer not to say', emoji: '🤐', flag: '' }
];

// Personalisation questions based on journey
const getPersonalisationQuestions = (journeyType) => {
  const questions = {
    pregnant: [
      { id: 'edd', label: 'What is your estimated due date?', type: 'date', placeholder: 'Select date' },
      { id: 'babyNumber', label: 'Which baby number is this?', type: 'select', options: ['1st', '2nd', '3rd', '4th+'] }
    ],
    conceive: [
      { id: 'cycleLength', label: 'What is your average cycle length?', type: 'number', placeholder: '28 days', suffix: 'days' },
      { id: 'periodLength', label: 'How many days does your period last?', type: 'number', placeholder: '5 days', suffix: 'days' }
    ],
    ivf: [
      { id: 'treatmentType', label: 'What type of treatment are you undergoing?', type: 'select', options: ['IVF', 'ICSI', 'FET', 'IUI', 'Egg Freezing'] },
      { id: 'cycleNumber', label: 'Which cycle number is this?', type: 'select', options: ['1st', '2nd', '3rd', '4th+'] }
    ],
    mom: [
      { id: 'babyBirthDate', label: 'When was your baby born?', type: 'date', placeholder: 'Select date' },
      { id: 'feedingMethod', label: 'How are you feeding?', type: 'select', options: ['Breastfeeding', 'Bottle feeding', 'Mixed', 'Pumping'] }
    ],
    menopause: [
      { id: 'stage', label: 'Which stage are you in?', type: 'select', options: ['Perimenopause', 'Menopause', 'Post-menopause', 'Not sure'] },
      { id: 'symptoms', label: 'Key symptoms (select all that apply)', type: 'multiselect', options: ['Hot flashes', 'Night sweats', 'Sleep issues', 'Brain fog', 'Mood changes', 'Joint pain'] }
    ]
  };
  return questions[journeyType] || [];
};

// Simple spinner component
const Spinner = () => (
  <div style={{ 
    width: 20, height: 20, 
    border: '2px solid #fff', 
    borderTopColor: 'transparent', 
    borderRadius: '50%', 
    animation: 'spin 0.6s linear infinite' 
  }} />
);

const Icon = ({ id, color }) => {
  const s = { width: 18, height: 18 };

  if (id === 'pregnant')
    return (
      <svg
        {...s}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    );

  if (id === 'conceive')
    return (
      <svg
        {...s}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="10" y1="11" x2="14" y2="11" />
      </svg>
    );

  if (id === 'ivf')
    return (
      <svg
        {...s}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="4" cy="10" r="2" />
        <circle cx="20" cy="10" r="2" />
        <path d="M6 10 C8 9, 9 11, 10 12" />
        <path d="M18 10 C16 9, 15 11, 14 12" />
        <path d="M10 12 Q10 16 12 17 Q14 16 14 12" />
        <line x1="12" y1="17" x2="12" y2="20" />
        <circle cx="12" cy="12" r="1.2" fill={color} stroke="none" />
      </svg>
    );

  if (id === 'mom')
    return (
      <svg
        {...s}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="5" r="2" />
        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <circle cx="17" cy="13" r="2" />
      </svg>
    );

  return (
    <svg
      {...s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c0-6-6-9-6-14a6 6 0 0 1 12 0c0 5-6 8-6 14z" />
      <path d="M6 10c-2-1-5 1-4 5" />
      <path d="M18 10c2-1 5 1 4 5" />
    </svg>
  );
};

const ArrowRight = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#aaa"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const Logo = () => (
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
    <path
      d="M16 4c-3 0-7 3-7 8s7 12 7 12 7-7 7-12-4-8-7-8z"
      fill="#c46db0"
      opacity="0.9"
    />
    <path
      d="M10 12c-2-1.5-5 0-5 4s3 6 5 7"
      stroke="#c46db0"
      strokeWidth="1.6"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M22 12c2-1.5 5 0 5 4s-3 6-5 7"
      stroke="#c46db0"
      strokeWidth="1.6"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

// Step indicator
const StepIndicator = ({ currentStep, totalSteps }) => (
  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
    {Array.from({ length: totalSteps }).map((_, i) => (
      <div
        key={i}
        style={{
          width: i === currentStep ? 24 : 8,
          height: 8,
          borderRadius: 4,
          background: i === currentStep ? 'var(--t)' : 'var(--border)',
          transition: 'all 0.3s'
        }}
      />
    ))}
  </div>
);

/* ── MAIN COMPONENT ── */
export default function Onboarding() {
  const { 
    setJourneyType, 
    setUserName, 
    setCulture,
    setEdd,
    setBabyNumber,
    setCycleLength,
    setPeriodLength,
    setTreatmentType,
    setIvfCycleNumber,
    setBabyAgeDays,
    setBabyBirthDate,
    setMenopauseStage,
    setMenopauseSymptoms,
    setFeedingMethod
  } = useApp();
  const navigate = useNavigate();
  
  // Step management
  const [step, setStep] = useState(1); // 1=Journey, 2=Culture, 3=Personalisation
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [selectedCulture, setSelectedCulture] = useState('west_central_african');
  const [personalisation, setPersonalisation] = useState({});
  const [loading, setLoading] = useState(false);
  const [userName, setLocalName] = useState('');
  const [clickedCard, setClickedCard] = useState(null);
  
  const personalisationQuestions = selectedJourney 
    ? getPersonalisationQuestions(selectedJourney) 
    : [];
  
  const totalSteps = selectedJourney === 'pregnant' || selectedJourney === 'conceive' || 
                     selectedJourney === 'ivf' || selectedJourney === 'mom' || 
                     selectedJourney === 'menopause' ? 3 : 2;
  
  const handleJourneySelect = (id) => {
    setClickedCard(id);
    
    // Add pop animation class
    setTimeout(() => {
      setSelectedJourney(id);
      setClickedCard(null);
      setTimeout(() => setStep(2), 300);
    }, 200);
  };
  
  const handleCultureSelect = (cultureId) => {
    setSelectedCulture(cultureId);
  };
  
  const handlePersonalisationChange = (id, value) => {
    setPersonalisation(prev => ({ ...prev, [id]: value }));
  };
  
  const handleComplete = async () => {
    setLoading(true);
    
    // Save all data to context (context effects will handle localStorage automatically)
    setJourneyType(selectedJourney);
    setCulture(selectedCulture);
    if (userName) setUserName(userName);
    
    // Journey-specific data - set in context (effects will persist)
    if (selectedJourney === 'pregnant') {
      if (personalisation.edd) setEdd(personalisation.edd);
      if (personalisation.babyNumber) setBabyNumber(personalisation.babyNumber);
    }
    
    if (selectedJourney === 'mom') {
      if (personalisation.babyBirthDate) {
        const birthDate = new Date(personalisation.babyBirthDate);
        const today = new Date();
        const daysOld = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));
        setBabyAgeDays(daysOld);
        setBabyBirthDate(personalisation.babyBirthDate);
      }
      if (personalisation.feedingMethod) setFeedingMethod(personalisation.feedingMethod);
    }
    
    if (selectedJourney === 'conceive') {
      if (personalisation.cycleLength) setCycleLength(personalisation.cycleLength);
      if (personalisation.periodLength) setPeriodLength(personalisation.periodLength);
    }
    
    if (selectedJourney === 'ivf') {
      if (personalisation.treatmentType) setTreatmentType(personalisation.treatmentType);
      if (personalisation.cycleNumber) setIvfCycleNumber(personalisation.cycleNumber);
    }
    
    if (selectedJourney === 'menopause') {
      if (personalisation.stage) setMenopauseStage(personalisation.stage);
      if (personalisation.symptoms) setMenopauseSymptoms(personalisation.symptoms);
    }
    
    // Save journey to localStorage
    localStorage.setItem('userJourney', selectedJourney);
    
    // Check existing session and navigate accordingly
    const hasConsents = localStorage.getItem('userConsents');
    const isLoggedIn = localStorage.getItem('userAuth');
    
    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
      
      if (hasConsents && isLoggedIn) {
        navigate(`/app/${selectedJourney}`);
      } else if (hasConsents) {
        navigate('/login');
      } else {
        navigate('/consent');
      }
    }, 800);
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  // Render Journey Selection Step
  const renderJourneyStep = () => (
    <>
      <h1 className="ob-heading">
        What brings <span className="ob-highlight">you</span> here?
      </h1>
      <p className="ob-sub">
        Choose your journey so we can personalise support just for you.
      </p>
      
      <div className="ob-grid ob-grid--five">
        {CARDS.map((card, i) => (
          <button
            key={card.id}
            onClick={() => handleJourneySelect(card.id)}
            className={`ob-card ${clickedCard === card.id ? 'ob-card-pop' : ''}${
              i === CARDS.length - 1 && CARDS.length % 2 !== 0 ? ' ob-card--last-odd' : ''
            }`}
            style={{ 
              background: card.bg, 
              animationDelay: `${i * 0.08}s`,
              transition: 'all 0.2s cubic-bezier(0.34, 1.2, 0.64, 1)'
            }}
          >
            <span className="ob-card-title" style={{ color: card.titleColor }}>
              {card.label}
            </span>
            <div className="ob-arrow" style={{ background: card.arrowBg, color: card.titleColor }}>
              <ArrowRight />
            </div>
            <div className="ob-illus">
              <img src={card.imgSrc} alt={card.imgAlt} />
            </div>
          </button>
        ))}
      </div>
    </>
  );
  
  // Render Culture Selection Step
  const renderCultureStep = () => (
    <div style={{ maxWidth: 500, margin: '0 auto', width: '100%' }}>
      <button 
        onClick={handleBack}
        style={{
          background: 'none',
          border: 'none',
          fontSize: 'var(--fs-sm)',
          color: 'var(--mt)',
          marginBottom: 24,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}
      >
        ← Back
      </button>
      
      <h1 className="ob-heading" style={{ fontSize: 'var(--fs-2xl)' }}>
        Your <span className="ob-highlight">culture</span>
      </h1>
      <p className="ob-sub" style={{ marginBottom: 32 }}>
        This helps us personalise food recommendations from your own kitchen.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {CULTURES.map(culture => (
          <button
            key={culture.id}
            onClick={() => handleCultureSelect(culture.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '16px 20px',
              borderRadius: 'var(--r)',
              background: selectedCulture === culture.id ? 'var(--sgl)' : 'var(--card)',
              border: selectedCulture === culture.id ? `2px solid var(--sg)` : '1px solid var(--border)',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left'
            }}
          >
            <span style={{ fontSize: 28 }}>{culture.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 'var(--fs-base)' }}>{culture.label}</span>
                {culture.flag && <span style={{ fontSize: 'var(--fs-sm)' }}>{culture.flag}</span>}
              </div>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginTop: 4 }}>
                {culture.id === 'west_central_african' && 'Jollof, Egusi, Plantain, Moi Moi'}
                {culture.id === 'east_african' && 'Ugali, Sukuma Wiki, Nyama Chara'}
                {culture.id === 'south_asian' && 'Dal, Roti, Curry, Samosas'}
                {culture.id === 'caribbean' && 'Callaloo, Rice and Peas, Jerk'}
                {culture.id === 'prefer_not' && 'We\'ll use general NHS guidance'}
              </p>
            </div>
            {selectedCulture === culture.id && (
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--sg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                ✓
              </div>
            )}
          </button>
        ))}
      </div>
      
      <button
        onClick={() => setStep(3)}
        style={{
          width: '100%',
          padding: 'var(--sp-4)',
          background: 'var(--dp)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--r)',
          fontSize: 'var(--fs-md)',
          fontWeight: 800,
          cursor: 'pointer',
          marginTop: 32,
          minHeight: 'var(--touch)'
        }}
      >
        Continue →
      </button>
    </div>
  );
  
  // Render Personalisation Step
  const renderPersonalisationStep = () => (
    <div style={{ maxWidth: 500, margin: '0 auto', width: '100%' }}>
      <button 
        onClick={handleBack}
        style={{
          background: 'none',
          border: 'none',
          fontSize: 'var(--fs-sm)',
          color: 'var(--mt)',
          marginBottom: 24,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}
      >
        ← Back
      </button>
      
      <h1 className="ob-heading" style={{ fontSize: 'var(--fs-2xl)' }}>
        Just a few <span className="ob-highlight">details</span>
      </h1>
      <p className="ob-sub" style={{ marginBottom: 32 }}>
        This helps us give you the most relevant support.
      </p>
      
      {/* Name input */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--dp)', display: 'block', marginBottom: 8 }}>
          What should we call you?
        </label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setLocalName(e.target.value)}
          placeholder="e.g., Adaeze, Mama, Sarah"
          style={{
            width: '100%',
            padding: 'var(--sp-3)',
            borderRadius: 'var(--r)',
            border: '1px solid var(--border)',
            fontSize: 'var(--fs-base)',
            background: 'var(--bg)'
          }}
        />
      </div>
      
      {/* Journey-specific questions */}
      {personalisationQuestions.map(q => (
        <div key={q.id} style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--dp)', display: 'block', marginBottom: 8 }}>
            {q.label}
          </label>
          
          {q.type === 'date' && (
            <input
              type="date"
              value={personalisation[q.id] || ''}
              onChange={(e) => handlePersonalisationChange(q.id, e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--sp-3)',
                borderRadius: 'var(--r)',
                border: '1px solid var(--border)',
                fontSize: 'var(--fs-base)',
                background: 'var(--bg)'
              }}
            />
          )}
          
          {q.type === 'number' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number"
                value={personalisation[q.id] || ''}
                onChange={(e) => handlePersonalisationChange(q.id, parseInt(e.target.value) || '')}
                placeholder={q.placeholder}
                style={{
                  flex: 1,
                  padding: 'var(--sp-3)',
                  borderRadius: 'var(--r)',
                  border: '1px solid var(--border)',
                  fontSize: 'var(--fs-base)',
                  background: 'var(--bg)'
                }}
              />
              {q.suffix && <span style={{ color: 'var(--mt)' }}>{q.suffix}</span>}
            </div>
          )}
          
          {q.type === 'select' && (
            <select
              value={personalisation[q.id] || ''}
              onChange={(e) => handlePersonalisationChange(q.id, e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--sp-3)',
                borderRadius: 'var(--r)',
                border: '1px solid var(--border)',
                fontSize: 'var(--fs-base)',
                background: 'var(--bg)'
              }}
            >
              <option value="">Select one</option>
              {q.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}
          
          {q.type === 'multiselect' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {q.options.map(opt => {
                const selected = personalisation[q.id]?.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      const current = personalisation[q.id] || [];
                      const updated = selected 
                        ? current.filter(s => s !== opt)
                        : [...current, opt];
                      handlePersonalisationChange(q.id, updated);
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 30,
                      background: selected ? 'var(--t)' : 'var(--warm)',
                      color: selected ? '#fff' : 'var(--md)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 'var(--fs-sm)'
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
      
      <button
        onClick={handleComplete}
        disabled={loading}
        style={{
          width: '100%',
          padding: 'var(--sp-4)',
          background: 'var(--dp)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--r)',
          fontSize: 'var(--fs-md)',
          fontWeight: 800,
          cursor: loading ? 'not-allowed' : 'pointer',
          marginTop: 16,
          minHeight: 'var(--touch)',
          opacity: loading ? 0.7 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12
        }}
      >
        {loading ? <Spinner /> : 'Continue →'}
      </button>
    </div>
  );
  
  return (
    <div className="ob-root">
      <div className="ob-logo">
        <Logo />
        <span className="ob-logo-text">Femin9</span>
      </div>
      
      <StepIndicator currentStep={step - 1} totalSteps={totalSteps} />
      
      {step === 1 && renderJourneyStep()}
      {step === 2 && renderCultureStep()}
      {step === 3 && renderPersonalisationStep()}
      
      <div className="ob-privacy">
        <ShieldIcon />
        <span>Your privacy is important to us</span>
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Pop animation for journey cards */
        .ob-card-pop {
          animation: pop 0.3s cubic-bezier(0.34, 1.2, 0.64, 1) forwards !important;
        }
        
        @keyframes pop {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
          }
          100% {
            transform: scale(0.98);
            opacity: 0.8;
          }
        }
        
        /* Hover effect for cards */
        .ob-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        }
        
        .ob-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }
        
        .ob-card:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}