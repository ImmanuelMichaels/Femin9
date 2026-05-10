import { useState, useRef, useEffect } from 'react';
import { bloomResp } from '../../utils/helpers';

const QUICK_TIPS = ["What to eat today?","Iron-rich foods","Is paracetamol safe?","I feel anxious","Baby not moving","Breastfeeding tips"];

export default function AIAssistant() {
  const [msgs, setMsgs] = useState([
    { r: "bot", t: "Hi mama 🌸 I'm Bloom, your AI companion. Ask me anything about your pregnancy, Nigerian foods, medications, or how you're feeling today. I understand English, Yoruba, Igbo, Hausa, and Pidgin." }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  const send = (text) => {
    const t = text || input;
    if (!t.trim()) return;
    setMsgs(m => [...m, { r: "user", t }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { r: "bot", t: bloomResp(t) }]);
    }, 800 + Math.random() * 600);
  };

  return (
    <div className="chat-wrap">
      {/* Header */}
      <div style={{ padding: "var(--sp-4) var(--pad-x)", borderBottom: "1px solid var(--border)", background: "var(--cream)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)" }}>
          <div style={{ width: "var(--icon-md)", height: "var(--icon-md)", borderRadius: "var(--r)", background: "linear-gradient(135deg,var(--t),var(--gd))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-xl)", flexShrink: 0 }}>🌸</div>
          <div>
            <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)" }}>Bloom AI</p>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--sg)", animation: "pu 2s infinite" }} />
              <span style={{ fontSize: "var(--fs-xs)", color: "var(--sg)", fontWeight: 700 }}>Online · Week 24 mode</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick tips */}
      <div style={{ display: "flex", gap: "var(--gap-sm)", overflowX: "auto", padding: "var(--sp-3) var(--pad-x)", scrollbarWidth: "none", flexShrink: 0, background: "var(--cream)" }}>
        {QUICK_TIPS.map(q => (
          <button key={q} onClick={() => send(q)} style={{ flexShrink: 0, padding: "clamp(5px,1.2vw,7px) clamp(12px,3vw,16px)", background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: 20, fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--t)", cursor: "pointer", whiteSpace: "nowrap", minHeight: "var(--touch)" }}>{q}</button>
        ))}
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {msgs.map((m, i) => (
          <div key={i} className="fu" style={{ display: "flex", gap: "var(--gap-sm)", marginBottom: "var(--sp-4)", flexDirection: m.r === "user" ? "row-reverse" : "row", alignItems: "flex-end" }}>
            {m.r === "bot" && (
              <div style={{ width: "clamp(28px,7vw,36px)", height: "clamp(28px,7vw,36px)", background: "linear-gradient(135deg,var(--t),var(--gd))", borderRadius: "var(--r)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-base)", flexShrink: 0 }}>🌸</div>
            )}
            <div style={{ maxWidth: "78%", padding: "var(--sp-3) var(--card-p)", borderRadius: m.r === "user" ? "var(--r2) var(--r2) 4px var(--r2)" : "var(--r2) var(--r2) var(--r2) 4px", background: m.r === "user" ? "var(--dp)" : "var(--card)", color: m.r === "user" ? "#fff" : "var(--dp)", border: m.r === "bot" ? "1px solid var(--border)" : "none", fontSize: "var(--fs-sm)", lineHeight: 1.65, boxShadow: "var(--sh)" }}>
              {m.t}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", gap: "var(--gap-sm)", alignItems: "flex-end", marginBottom: "var(--sp-4)" }}>
            <div style={{ width: "clamp(28px,7vw,36px)", height: "clamp(28px,7vw,36px)", background: "linear-gradient(135deg,var(--t),var(--gd))", borderRadius: "var(--r)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-base)" }}>🌸</div>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r2) var(--r2) var(--r2) 4px", padding: "var(--sp-3) var(--sp-4)", display: "flex", gap: "var(--sp-2)", alignItems: "center", boxShadow: "var(--sh)" }}>
              {[0,1,2].map(j => <div key={j} style={{ width: "clamp(5px,1.2vw,7px)", height: "clamp(5px,1.2vw,7px)", borderRadius: "50%", background: "var(--t)", animation: `bl 1.2s infinite ${j * 0.2}s` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="chat-input-bar">
        {listening && (
          <div style={{ background: "var(--rdl)", borderRadius: "var(--r)", padding: "var(--sp-2) var(--card-p)", marginBottom: "var(--sp-2)", display: "flex", alignItems: "center", gap: "var(--gap-sm)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--rd)", animation: "pu 0.8s infinite" }} />
            <span style={{ fontSize: "var(--fs-sm)", color: "var(--rd)", fontWeight: 700 }}>Listening… speak now</span>
          </div>
        )}
        <div style={{ display: "flex", gap: "var(--gap-sm)", alignItems: "flex-end" }}>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask Bloom anything…" rows={1}
            style={{ flex: 1, padding: "clamp(10px,2.5vw,13px) clamp(13px,3.2vw,17px)", borderRadius: 22, border: "1.5px solid var(--border)", background: "var(--warm)", fontSize: "var(--fs-sm)", color: "var(--dp)", resize: "none", outline: "none", maxHeight: 90, lineHeight: 1.5, transition: "border-color 0.2s" }}
            onFocus={e => e.target.style.borderColor = "var(--t)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"} />
          <button onClick={() => setListening(l => !l)} className="btn-icon" style={{ background: listening ? "var(--rd)" : "var(--warm)", border: "1.5px solid var(--border)" }}>🎤</button>
          <button onClick={() => send()} className="btn-icon" style={{ background: "var(--dp)", color: "#fff" }}>➤</button>
        </div>
        <p style={{ fontSize: "var(--fs-2xs)", color: "var(--mt)", textAlign: "center", marginTop: "var(--sp-2)" }}>Bloom is AI only. For emergencies call 199 or tap SOS.</p>
      </div>
    </div>
  );
}
