import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
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

/* ── small corner icons ── */
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
        {/* Left ovary */}
        <circle cx="4" cy="10" r="2" />
        {/* Right ovary */}
        <circle cx="20" cy="10" r="2" />
        {/* Left fallopian tube */}
        <path d="M6 10 C8 9, 9 11, 10 12" />
        {/* Right fallopian tube */}
        <path d="M18 10 C16 9, 15 11, 14 12" />
        {/* Uterine body */}
        <path d="M10 12 Q10 16 12 17 Q14 16 14 12" />
        {/* Cervix / lower outlet */}
        <line x1="12" y1="17" x2="12" y2="20" />
        {/* Central embryo dot — small filled circle to suggest the retrieved egg */}
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

  /* menopause — lotus */
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

/* ── component ── */
export default function Onboarding() {
  const { setJourneyType } = useApp();
  const navigate = useNavigate();

  const handleSelect = (id) => {
    setJourneyType(id);
    setTimeout(() => navigate('/app'), 400);
  };

  return (
    <div className="ob-root">
      {/* Logo */}
      <div className="ob-logo">
        <Logo />
        <span className="ob-logo-text">Femin9</span>
      </div>

      {/* Heading */}
      <h1 className="ob-heading">
        What brings <span className="ob-highlight">you</span> here?
      </h1>
      <p className="ob-sub">
        Choose your journey so we can personalise support just for you.
      </p>

      {/* Card grid
          With 5 cards the natural 2-column grid produces a 2-2-1 layout.
          The inline tweak below centres the lone fifth card on wider viewports
          without touching the existing .ob-grid CSS rules for mobile. */}
      <div
        className="ob-grid ob-grid--five"
        style={{
          /* Last card spans both columns and caps its own width so it sits
             centred rather than stretching edge-to-edge. Targets only the
             fifth-child at the grid level; all other sizing comes from CSS. */
        }}
      >
        {CARDS.map((card, i) => (
          <button
            key={card.id}
            onClick={() => handleSelect(card.id)}
            className={`ob-card${i === CARDS.length - 1 && CARDS.length % 2 !== 0 ? ' ob-card--last-odd' : ''}`}
            style={{ background: card.bg, animationDelay: `${i * 0.08}s` }}
          >
            {/* Top-left icon bubble */}
            {/* <div className="ob-icon-bubble">
              <Icon id={card.id} color={card.iconColor} />
            </div> */}

              {/* Text */}
              <span className="ob-card-title" style={{ color: card.titleColor }}>
                {card.label}
              </span>

              {/* Arrow */}
              <div
                className="ob-arrow"
                style={{ background: card.arrowBg, color: card.titleColor }}
              >
                <ArrowRight />
              </div>

              {/* Illustration */}
              <div className="ob-illus">
                <img src={card.imgSrc} alt={card.imgAlt} />
              </div>
            </button>
        ))}
      </div>

      {/* Privacy note */}
      <div className="ob-privacy">
        <ShieldIcon />
        <span>Your privacy is important to us</span>
      </div>
    </div>
  );
}