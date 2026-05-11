import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Onboarding.css';

const OnboardingIllustration = ({ type }) => {
  if (type === "pregnant") return <img src="pregnancy.png" alt="pregnant" width="100" height="100" />;
  if (type === "conceive") return <img src="conceive.png" alt="conceive" width="100" height="100" />;
  if (type === "menopause") return <img src="menopause.png" alt="menopause" width="100" height="100" />;
  return <img src="mum.png" alt="mom" width="120" height="120" />;
};

export default function Onboarding() {
  const { setJourneyType } = useApp();
  const navigate = useNavigate();

  const options = [
    { id: "pregnant", label: "I'm Pregnant", bg: "linear-gradient(135deg,#C4603A)", shadow: "rgba(196,96,58,0.4)", type: "pregnant" },
    { id: "conceive", label: "Trying to Conceive", bg: "#2F610F", shadow: "rgba(74,124,89,0.4)", type: "conceive" },
    { id: "mom", label: "I'm already a Mom", bg: "linear-gradient(135deg,#C04A42,#D0524A,#E07070)", shadow: "rgba(192,57,43,0.4)", type: "mom" },
    { id: "menopause", label: "Cycle & Menopause Support", bg: "#9A0DC5", shadow: "rgba(106,74,140,0.4)", type: "menopause" },
  ];

  const handleSelect = (id) => {
    setJourneyType(id);
    setTimeout(() => navigate('/login'), 480);
  };

  return (
    <div className='container'>
      <h1 className="serif" style={{
        fontSize: "var(--fs-2xl)", fontWeight: 600, color: "var(--dp)",
        marginBottom: "var(--sp-4)", textAlign: "center", lineHeight: 1.2,
        padding: "0 var(--pad-x)", fontFamily: "inter",
      }}>What brings you here?</h1>
      <div style={{ width: "80%", height: "250", padding: "0 var(--pad-x)", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--gap-md)" }}>
        {options.map((opt, i) => (
        <button
          key={opt.id}
          onClick={() => handleSelect(opt.id)}
          className="ob-btn fu"
          style={{
            background: opt.bg,
            boxShadow: `0 8px 28px ${opt.shadow}`,
            animationDelay: `${i * 0.09}s`,

            aspectRatio: "1 / 1",
            width: "100%",
            height: 200,
            borderRadius: "28px",

            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",

            position: "relative",
            overflow: "hidden",
            padding: "var(--sp-5)"
          }}
        >

          {/* Illustration */}
          <div
            style={{
              zIndex: 2,
              marginBottom: "var(--sp-4)",
              transform: "scale(1.1)"
            }}
          >
            <OnboardingIllustration type={opt.type} />
          </div>

          {/* Text */}
          <span
            style={{
              zIndex: 2,
              fontSize: "var(--fs-md)",
              fontWeight: 800,
              color: "#fff",
              textAlign: "center",
              lineHeight: 1.3,
              textShadow: "0 1px 6px rgba(0,0,0,0.2)"
            }}
          >
            {opt.label}
          </span>
        </button> 
        ))}
      </div>
      <div style={{ height: "var(--sp-5)" }} />
    </div>
  );
}
