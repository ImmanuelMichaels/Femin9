import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flower2, Baby, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { journeyType } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [animOut, setAnimOut] = useState(false);

  const meta = {
    pregnant:  { label: "Pregnant Mama",       Icon: Flower2, color: "var(--t)" },
    conceive:  { label: "Trying to Conceive",  Icon: Flower2, color: "var(--sg)" },
    mom:       { label: "Mama",                Icon: Baby, color: "var(--rd)" },
    menopause: { label: "Cycle & Menopause",   Icon: Moon, color: "var(--lv)" },
  }[journeyType] || { label: "Mama", Icon: Flower2, color: "var(--t)" };

  const handleLogin = () => {
    if (!email || !password) return;
    setLoading(true);
    setTimeout(() => {
      setAnimOut(true);
      setTimeout(() => navigate('/app'), 420);
    }, 1000);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "var(--cream)",
      display: "flex", flexDirection: "column", alignItems: "center",
      zIndex: 900, maxWidth: 480, margin: "0 auto", overflowY: "auto",
      opacity: animOut ? 0 : 1,
      transform: animOut ? "translateY(20px)" : "translateY(0)",
      transition: "opacity 0.4s, transform 0.4s"
    }}>
      <div style={{
        width: "100%", background: "#2A1200",
        padding: "clamp(40px,10vw,60px) var(--pad-x) clamp(48px,12vw,70px)",
        borderRadius: "0 0 var(--r3) var(--r3)",
        position: "relative", overflow: "hidden"
      }}>
        <button onClick={() => navigate('/onboarding')} style={{
          background: "rgba(255,255,255,0.14)", border: "none", borderRadius: 20,
          padding: "clamp(6px,1.5vw,9px) clamp(12px,3vw,16px)",
          color: "#fff", fontSize: "var(--fs-sm)", fontWeight: 700,
          cursor: "pointer", marginBottom: "var(--sp-5)", display: "block",
          minHeight: "var(--touch)"
        }}>← Back</button>
        <div className="serif" style={{ fontSize: "var(--fs-3xl)", color: "#fff", fontStyle: "italic", marginBottom: "var(--sp-2)" }}>
          Mama<b style={{ fontStyle: "normal", color: "#F2A07A" }}>Bloom</b>
        </div>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "var(--fs-xs)", letterSpacing: 2.5, textTransform: "uppercase" }}>
          Maternal AI · Nigeria-First
        </p>
      </div>

      <div style={{ marginTop: "clamp(-18px,-4.5vw,-22px)", marginBottom: "var(--sp-5)", zIndex: 2 }}>
        <div style={{
          background: "var(--card)", borderRadius: 30,
          padding: "clamp(8px,2vw,12px) clamp(16px,4vw,22px)",
          boxShadow: "var(--sh2)",
          display: "flex", alignItems: "center", gap: "var(--gap-md)",
          border: `2px solid ${meta.color}44`
        }}>
          <meta.Icon size={28} strokeWidth={2} style={{ color: meta.color }} />
          <span style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--dp)" }}>{meta.label}</span>
        </div>
      </div>

      <div style={{ width: "100%", padding: "0 var(--pad-x)" }}>
        <h2 className="serif" style={{ fontSize: "var(--fs-2xl)", fontWeight: 600, color: "var(--dp)", marginBottom: "var(--sp-1)", textAlign: "center", fontStyle: "italic" }}>Welcome back</h2>
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", textAlign: "center", marginBottom: "var(--sp-5)", fontWeight: 500 }}>Sign in to continue your journey</p>

        <div style={{ marginBottom: "var(--sp-4)" }}>
          <label style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--md)", display: "block", marginBottom: "var(--sp-2)", letterSpacing: 0.3 }}>Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="mama@example.com" className="form-input"
            onFocus={e => e.target.style.borderColor = "var(--t)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"} />
        </div>

        <div style={{ marginBottom: "var(--sp-5)" }}>
          <label style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--md)", display: "block", marginBottom: "var(--sp-2)", letterSpacing: 0.3 }}>Password</label>
          <div style={{ position: "relative" }}>
            <input type={showPass ? "text" : "password"} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" className="form-input"
              style={{ paddingRight: "clamp(42px,10vw,54px)" }}
              onFocus={e => e.target.style.borderColor = "var(--t)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"} />
            <button onClick={() => setShowPass(v => !v)} style={{
              position: "absolute", right: "clamp(12px,3vw,16px)", top: "50%",
              transform: "translateY(-50%)", background: "none", border: "none",
              cursor: "pointer", fontSize: "var(--fs-lg)", color: "var(--mt)",
              padding: 0, minWidth: "var(--touch)", minHeight: "var(--touch)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>{showPass ? "🙈" : "👁️"}</button>
          </div>
          <div style={{ textAlign: "right", marginTop: "var(--sp-2)" }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "var(--fs-sm)", color: "var(--t)", fontWeight: 700, minHeight: "var(--touch)" }}>Forgot password?</button>
          </div>
        </div>

        <button onClick={handleLogin} className="btn-primary" style={{
          background: (!email || !password) ? "var(--border)" : "var(--dp)",
          color: (!email || !password) ? "var(--mt)" : "#fff",
          cursor: (!email || !password) ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "var(--gap-md)", marginBottom: "var(--sp-5)"
        }}>
          {loading ? (
            <>
              <div style={{ width: "clamp(14px,3.5vw,18px)", height: "clamp(14px,3.5vw,18px)", border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "sp 0.7s linear infinite" }} />
              Signing in…
            </>
          ) : "Sign In →"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", marginBottom: "var(--sp-5)" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", fontWeight: 700, letterSpacing: 0.5 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        {[["G","#4285F4","Continue with Google"],["📱","var(--dp)","Continue with Phone"]].map(([ic,col,label],i) => (
          <button key={i} onClick={handleLogin} style={{
            width: "100%", padding: "clamp(12px,3vw,15px)",
            borderRadius: "var(--r)", marginBottom: "var(--gap-md)",
            border: "1.5px solid var(--border)", background: "var(--card)",
            cursor: "pointer", fontSize: "var(--fs-sm)", fontWeight: 700,
            color: "var(--dp)", display: "flex", alignItems: "center",
            justifyContent: "center", gap: "var(--gap-md)",
            boxShadow: "var(--sh)", minHeight: "var(--touch)"
          }}>
            <span style={{ fontSize: "var(--fs-lg)", fontWeight: 900, color: col, lineHeight: 1 }}>{ic}</span>
            {label}
          </button>
        ))}

        <p style={{ textAlign: "center", fontSize: "var(--fs-sm)", color: "var(--mt)", marginTop: "var(--sp-5)" }}>
          New here?{" "}
          <button onClick={handleLogin} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--t)", fontWeight: 800, fontSize: "var(--fs-sm)", minHeight: "var(--touch)"
          }}>Create your free account</button>
        </p>
        <div style={{ height: "var(--sp-6)" }} />
      </div>
    </div>
  );
}
