import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/useApp';
import { bloomResp } from '../../utils/helpers';
import { saveMessage, loadChatHistory } from '../../services/chatService';

const QUICK_TIPS = [
  "What to eat today?",
  "Iron-rich foods",
  "Is paracetamol safe?",
  "I feel anxious",
  "Baby not moving",
  "Breastfeeding tips"
];

// Crisis detection patterns
const CRISIS_PATTERNS = {
  suicide: [
    "want to die", "kill myself", "end it all", "no reason to live",
    "better off without me", "worthless", "hopeless"
  ],
  selfHarm: [
    "hurt myself", "cut myself", "self harm", "harm myself"
  ],
  abuse: [
    "hit me", "abusive", "scared to go home", "forced",
    "domestic violence", "partner hurt me", "afraid"
  ],
  urgent: [
    "bleeding heavily", "severe pain", "can't breathe", "chest pain",
    "unconscious", "seizure", "water broke early"
  ]
};

export default function AIAssistant({ onMessageSent, isAtLimit, remainingMessages }) {
  const { userName, journeyType, getCurrentWeek, setShowSOS, subscriptionPlan } = useApp();
  const [msgs, setMsgs] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [showCrisisWarning, setShowCrisisWarning] = useState(false);
  const [crisisType, setCrisisType] = useState(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Load chat history from Firestore on mount
  useEffect(() => {
    const loadHistory = async () => {
      if (!historyLoaded) {
        const history = await loadChatHistory();
        if (history.length > 0) {
          setMsgs(history);
        } else {
          // Default welcome message
          setMsgs([{
            role: "assistant",
            content: `Hi ${userName || 'mama'} 🌸 I'm Femin9, your AI companion. Ask me anything about your ${journeyType === 'pregnant' ? 'pregnancy' : journeyType === 'ttc' ? 'fertility journey' : journeyType === 'ivf' ? 'IVF treatment' : 'health'}, Nigerian foods, medications, or how you're feeling today. I understand English, Yoruba, Igbo, Hausa, and Pidgin.`
          }]);
        }
        setHistoryLoaded(true);
      }
    };
    loadHistory();
  }, [historyLoaded, userName, journeyType]);

  // Save chat history to localStorage as backup
  useEffect(() => {
    if (msgs.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(msgs.slice(-50)));
    }
  }, [msgs]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-NG';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setListening(false);
        send(transcript);
      };
      
      recognitionRef.current.onerror = () => {
        setListening(false);
      };
    }
  }, []);

  const checkForCrisis = (text) => {
    const lowerText = text.toLowerCase();
    
    for (const [type, patterns] of Object.entries(CRISIS_PATTERNS)) {
      for (const pattern of patterns) {
        if (lowerText.includes(pattern)) {
          return type;
        }
      }
    }
    return null;
  };

  const getCrisisResponse = (type) => {
    switch(type) {
      case 'suicide':
        return {
          title: "🚨 You're not alone",
          message: "I'm really glad you reached out. Please know that you matter and help is available right now.",
          resources: [
            "📞 Samaritans (24/7): 116 123 (Free, confidential)",
            "📞 Campaign Against Living Miserably (CALM): 0800 58 58 58",
            "💬 Text SHOUT to 85258 for crisis support",
            "🏥 Go to your nearest A&E if you're at immediate risk"
          ],
          urgent: true
        };
      case 'selfHarm':
        return {
          title: "🚨 Help is available",
          message: "You don't have to go through this alone. Please reach out for support.",
          resources: [
            "📞 NHS 111: For urgent medical advice",
            "📞 Samaritans: 116 123",
            "💬 Text SHOUT to 85258",
            "🏥 Go to A&E if you need immediate medical attention"
          ],
          urgent: true
        };
      case 'abuse':
        return {
          title: "🛡️ Your safety matters",
          message: "Domestic abuse is never your fault. There are people who can help you right now.",
          resources: [
            "📞 National Domestic Abuse Helpline: 0808 2000 247 (24/7)",
            "📞 Refuge: 0808 2000 247",
            "💬 Women's Aid Live Chat: womensaid.org.uk",
            "🚨 In immediate danger? Call 999 (press 55 if you can't speak)"
          ],
          urgent: true
        };
      case 'urgent':
        return {
          title: "🚨 URGENT: Seek Medical Care",
          message: "Your symptoms require immediate medical attention.",
          resources: [
            "📞 Call 999 for an ambulance now",
            "🏥 Go to your nearest A&E",
            "📞 Call your maternity unit if you're pregnant"
          ],
          urgent: true
        };
      default:
        return null;
    }
  };

  const send = async (text) => {
    const messageText = text || input;
    if (!messageText.trim()) return;
    
    // Check message limit
    if (isAtLimit) {
      const limitMsg = `🔒 You've reached your daily message limit (${remainingMessages} remaining). Upgrade to Femin9+ for unlimited messages.`;
      setMsgs(prev => [...prev, { role: "assistant", content: limitMsg }]);
      await saveMessage('assistant', limitMsg);
      return;
    }
    
    // Check for crisis
    const crisisDetected = checkForCrisis(messageText);
    
    // Add user message to UI and save to Firestore
    setMsgs(prev => [...prev, { role: "user", content: messageText }]);
    await saveMessage('user', messageText);
    setInput("");
    
    // Increment message count
    if (onMessageSent) onMessageSent();
    
    // Handle crisis response
    if (crisisDetected) {
      const crisisResponse = getCrisisResponse(crisisDetected);
      setCrisisType(crisisDetected);
      setShowCrisisWarning(true);
      
      const responseMsg = crisisResponse.message;
      const resourcesMsg = crisisResponse.resources.join("\n");
      
      setMsgs(prev => [...prev, 
        { role: "assistant", content: responseMsg },
        { role: "assistant", content: resourcesMsg }
      ]);
      
      await saveMessage('assistant', responseMsg);
      await saveMessage('assistant', resourcesMsg);
      return;
    }
    
    // Normal AI response
    setTyping(true);
    
    setTimeout(async () => {
      setTyping(false);
      const response = await generateResponse(messageText);
      setMsgs(prev => [...prev, { role: "assistant", content: response }]);
      await saveMessage('assistant', response);
    }, 800 + Math.random() * 600);
  };

  const generateResponse = async (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    const currentWeek = getCurrentWeek();
    
    // NHS signposting for specific symptoms
    if (lowerMessage.includes("baby not moving") || lowerMessage.includes("reduced movement")) {
      return `⚠️ **Important:** If you're ${currentWeek}+ weeks pregnant and have noticed reduced fetal movements, please contact your maternity unit immediately. Do not wait until tomorrow.\n\n${bloomResp(userMessage)}\n\n---\n📍 This is general information, not medical advice. Always consult your midwife or GP.`;
    }
    
    if (lowerMessage.includes("bleeding") && journeyType === 'pregnant') {
      return `⚠️ **Urgent:** Any bleeding during pregnancy should be assessed. If you're experiencing heavy bleeding or pain, call 999 or go to A&E immediately.\n\n${bloomResp(userMessage)}\n\n---\n📍 This is general information, not medical advice. Always consult your midwife or GP.`;
    }
    
    if (lowerMessage.includes("headache") || lowerMessage.includes("vision")) {
      return `⚠️ Severe headache or visual changes in pregnancy can be a sign of pre-eclampsia. Please contact your midwife or GP today.\n\n${bloomResp(userMessage)}\n\n---\n📍 This is general information, not medical advice. Always consult your midwife or GP.`;
    }
    
    // Normal response with disclaimer
    return `${bloomResp(userMessage)}\n\n---\n📍 This is general information, not medical advice. Always consult your GP or midwife.`;
  };

  const handleQuickTip = (tip) => {
    send(tip);
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setListening(true);
      recognitionRef.current.start();
    } else {
      alert("Speech recognition is not supported in your browser. Try Chrome or Safari.");
    }
  };

  return (
    <div className="chat-wrap">
      {/* Crisis Warning Modal */}
      {showCrisisWarning && crisisType && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.9)",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--pad-x)"
        }}>
          <div style={{
            background: "var(--card)",
            borderRadius: "var(--r2)",
            maxWidth: 500,
            width: "100%",
            padding: "var(--sp-5)",
            maxHeight: "80vh",
            overflowY: "auto"
          }}>
            <div style={{ textAlign: "center", marginBottom: "var(--sp-4)" }}>
              <div style={{ fontSize: 48, marginBottom: "var(--sp-2)" }}>🆘</div>
              <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, color: "var(--rd)", marginBottom: "var(--sp-2)" }}>
                {getCrisisResponse(crisisType)?.title}
              </h2>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>
                {getCrisisResponse(crisisType)?.message}
              </p>
            </div>
            
            <div style={{ marginBottom: "var(--sp-4)" }}>
              <p style={{ fontWeight: 800, marginBottom: "var(--sp-2)" }}>Available Support:</p>
              {getCrisisResponse(crisisType)?.resources.map((resource, i) => (
                <p key={i} style={{ fontSize: "var(--fs-sm)", padding: "var(--sp-2) 0", borderBottom: "1px solid var(--border)" }}>
                  {resource}
                </p>
              ))}
            </div>
            
            <div style={{ display: "flex", gap: "var(--gap-md)" }}>
              <button 
                onClick={() => setShowCrisisWarning(false)}
                style={{ flex: 1, padding: "var(--sp-3)", background: "var(--warm)", border: "1px solid var(--border)", borderRadius: "var(--r)", cursor: "pointer" }}
              >
                Dismiss
              </button>
              <button 
                onClick={() => setShowSOS(true)}
                style={{ flex: 1, padding: "var(--sp-3)", background: "var(--rd)", color: "#fff", border: "none", borderRadius: "var(--r)", cursor: "pointer" }}
              >
                Call Emergency SOS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: "var(--sp-4) var(--pad-x)", borderBottom: "1px solid var(--border)", background: "var(--cream)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)" }}>
          <div style={{ width: "var(--icon-md)", height: "var(--icon-md)", borderRadius: "var(--r)", background: "linear-gradient(135deg,var(--t),var(--gd))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-xl)", flexShrink: 0 }}>🌸</div>
          <div>
            <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)" }}>Femin9 AI</p>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--sg)", animation: "pu 2s infinite" }} />
              <span style={{ fontSize: "var(--fs-xs)", color: "var(--sg)", fontWeight: 700 }}>
                Online · {journeyType === 'pregnant' ? `Week ${getCurrentWeek()}` : journeyType === 'ttc' ? 'Fertility Mode' : journeyType === 'ivf' ? 'IVF Support' : 'Health Companion'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick tips */}
      <div style={{ display: "flex", gap: "var(--gap-sm)", overflowX: "auto", padding: "var(--sp-3) var(--pad-x)", scrollbarWidth: "none", flexShrink: 0, background: "var(--cream)" }}>
        {QUICK_TIPS.map(q => (
          <button 
            key={q} 
            onClick={() => handleQuickTip(q)} 
            style={{ 
              flexShrink: 0, 
              padding: "clamp(5px,1.2vw,7px) clamp(12px,3vw,16px)", 
              background: "var(--card)", 
              border: "1.5px solid var(--border)", 
              borderRadius: 20, 
              fontSize: "var(--fs-xs)", 
              fontWeight: 700, 
              color: "var(--t)", 
              cursor: "pointer", 
              whiteSpace: "nowrap", 
              minHeight: "var(--touch)" 
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {msgs.map((m, i) => (
          <div 
            key={i} 
            className="fu" 
            style={{ 
              display: "flex", 
              gap: "var(--gap-sm)", 
              marginBottom: "var(--sp-4)", 
              flexDirection: m.role === "user" ? "row-reverse" : "row", 
              alignItems: "flex-end" 
            }}
          >
            {m.role === "assistant" && (
              <div style={{ 
                width: "clamp(28px,7vw,36px)", 
                height: "clamp(28px,7vw,36px)", 
                background: "linear-gradient(135deg,var(--t),var(--gd))", 
                borderRadius: "var(--r)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                fontSize: "var(--fs-base)", 
                flexShrink: 0 
              }}>
                🌸
              </div>
            )}
            <div style={{ 
              maxWidth: "78%", 
              padding: "var(--sp-3) var(--card-p)", 
              borderRadius: m.role === "user" ? "var(--r2) var(--r2) 4px var(--r2)" : "var(--r2) var(--r2) var(--r2) 4px", 
              background: m.role === "user" ? "var(--dp)" : "var(--card)", 
              color: m.role === "user" ? "#fff" : "var(--dp)", 
              border: m.role === "assistant" ? "1px solid var(--border)" : "none", 
              fontSize: "var(--fs-sm)", 
              lineHeight: 1.65, 
              boxShadow: "var(--sh)",
              whiteSpace: "pre-wrap"
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", gap: "var(--gap-sm)", alignItems: "flex-end", marginBottom: "var(--sp-4)" }}>
            <div style={{ width: "clamp(28px,7vw,36px)", height: "clamp(28px,7vw,36px)", background: "linear-gradient(135deg,var(--t),var(--gd))", borderRadius: "var(--r)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-base)" }}>🌸</div>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r2) var(--r2) var(--r2) 4px", padding: "var(--sp-3) var(--sp-4)", display: "flex", gap: "var(--sp-2)", alignItems: "center", boxShadow: "var(--sh)" }}>
              {[0,1,2].map(j => (
                <div 
                  key={j} 
                  style={{ 
                    width: "clamp(5px,1.2vw,7px)", 
                    height: "clamp(5px,1.2vw,7px)", 
                    borderRadius: "50%", 
                    background: "var(--t)", 
                    animation: `bl 1.2s infinite ${j * 0.2}s` 
                  }} 
                />
              ))}
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
          <textarea 
            ref={inputRef}
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask Femin9 anything…" 
            rows={1}
            style={{ 
              flex: 1, 
              padding: "clamp(10px,2.5vw,13px) clamp(13px,3.2vw,17px)", 
              borderRadius: 22, 
              border: "1.5px solid var(--border)", 
              background: "var(--warm)", 
              fontSize: "var(--fs-sm)", 
              color: "var(--dp)", 
              resize: "none", 
              outline: "none", 
              maxHeight: 90, 
              lineHeight: 1.5, 
              transition: "border-color 0.2s" 
            }}
            onFocus={e => e.target.style.borderColor = "var(--t)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"} 
          />
          <button 
            onClick={startListening} 
            className="btn-icon" 
            style={{ 
              background: listening ? "var(--rd)" : "var(--warm)", 
              border: "1.5px solid var(--border)",
              padding: "clamp(10px,2.5vw,13px)",
              borderRadius: 30,
              cursor: "pointer",
              fontSize: "var(--fs-lg)"
            }}
          >
            🎤
          </button>
          <button 
            onClick={() => send()} 
            className="btn-icon" 
            style={{ 
              background: "var(--dp)", 
              color: "#fff",
              padding: "clamp(10px,2.5vw,13px)",
              borderRadius: 30,
              cursor: "pointer",
              border: "none",
              fontSize: "var(--fs-lg)"
            }}
          >
            ➤
          </button>
        </div>
        <p style={{ fontSize: "var(--fs-2xs)", color: "var(--mt)", textAlign: "center", marginTop: "var(--sp-2)" }}>
          Femin9 is AI only. For emergencies call <strong>999</strong> or tap <strong>SOS</strong>.
        </p>
      </div>

      <style>{`
        @keyframes pu {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes bl {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}