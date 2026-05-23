import { useState, useEffect } from 'react';
import { WCard, Tag } from '../../components/ui';
import DrugSafetyChecker from '../../components/cards/DrugSafetyChecker';
import { DV_CONTACTS, SEXUAL_HEALTH, REPORT_STEPS, FREE_CLINICS } from '../../data/safety';
import { useApp } from '../../context/AppContext';

const HUB_TABS = [
  { id:"dv",     label:"🆘 DV Help" },
  { id:"sexual", label:"🩺 Sexual Health" },
  { id:"report", label:"📋 Report Incident" },
  { id:"condoms",label:"🩹 Free Clinics" },
  { id:"drugs",  label:"💊 Safety Check" },
  { id:"crisis", label:"🚨 Crisis" },
];

// Nigerian emergency contacts
const EMERGENCY_CONTACTS = [
  { 
    name: "National Emergency Number", 
    number: "112", 
    description: "Police, Ambulance, Fire Service",
    bg: "var(--rd)",
    color: "#fff"
  },
  { 
    name: "Lagos State Emergency", 
    number: "767", 
    description: "Lagos State Emergency Management Agency",
    bg: "var(--rdl)",
    color: "var(--rd)"
  },
  { 
    name: "Nigerian Police Force", 
    number: "199", 
    description: "Emergency police response",
    bg: "var(--rdl)",
    color: "var(--rd)"
  },
  { 
    name: "Domestic Violence Helpline", 
    number: "0800 333 333", 
    description: "24/7 confidential support",
    bg: "var(--gdl)",
    color: "var(--gd)"
  },
  { 
    name: "Rape Crisis Helpline", 
    number: "0800 111 222", 
    description: "Free and confidential",
    bg: "var(--bll)",
    color: "var(--bl)"
  }
];

// Crisis warning signs
const CRISIS_WARNING_SIGNS = [
  { sign: "Talking about wanting to die", action: "Call 112 or go to nearest hospital immediately" },
  { sign: "Feeling hopeless or trapped", action: "Speak to a mental health professional" },
  { sign: "Withdrawing from family and friends", action: "Reach out to someone you trust" },
  { sign: "Extreme mood swings", action: "Consult a doctor for evaluation" },
  { sign: "Talking about being a burden", action: "You are not alone. Help is available" },
  { sign: "Increased substance use", action: "Contact addiction support services" }
];

export default function Safety() {
  const { setShowSOS, journeyType } = useApp();
  const [tab, setTab] = useState("dv");
  const [showCrisisChecklist, setShowCrisisChecklist] = useState(false);
  const [selectedCrisis, setSelectedCrisis] = useState(null);
  
  // Quick emergency action
  const handleEmergencyCall = (number) => {
    window.location.href = `tel:${number.replace(/\s/g, "")}`;
  };
  
  // Open SOS modal from header
  const handleSOS = () => {
    setShowSOS(true);
  };
  
  // Get journey-specific resources
  const getJourneyResources = () => {
    if (journeyType === 'pregnant') {
      return {
        title: "Pregnancy Emergency Resources",
        resources: [
          "Maternity Triage: Call your hospital's maternity unit immediately",
          "Early Pregnancy Unit: For bleeding or pain in early pregnancy",
          "Midwife: Contact your community midwife for urgent concerns"
        ]
      };
    } else if (journeyType === 'mom') {
      return {
        title: "Postpartum Emergency Resources",
        resources: [
          "Postnatal Depression: Speak to your health visitor",
          "Breastfeeding Support: Call your local breastfeeding helpline",
          "Perinatal Mental Health Team: Urgent mental health support"
        ]
      };
    }
    return null;
  };
  
  const journeyResources = getJourneyResources();
  
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Emergency SOS Banner - Always visible */}
      <div style={{ 
        padding: "var(--pad-y) var(--pad-x) 0",
        marginBottom: "var(--sp-2)"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "var(--sp-2)"
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: "var(--fs-xl)", color: "var(--dp)" }}>🛡️ Safety Hub</div>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", marginTop: 3 }}>Support, rights & health safety</div>
          </div>
          <button
            onClick={handleSOS}
            style={{
              background: "var(--rd)",
              color: "#fff",
              border: "none",
              borderRadius: 30,
              padding: "8px 20px",
              fontSize: "var(--fs-sm)",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              animation: "pulse 2s infinite"
            }}
          >
            🚨 SOS
          </button>
        </div>
        
        {/* Quick Emergency Numbers Banner */}
        <div style={{ 
          background: "var(--rdl)", 
          borderRadius: "var(--r)", 
          padding: "var(--sp-2) var(--sp-3)",
          marginBottom: "var(--sp-3)",
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--gap-sm)",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span style={{ fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--rd)" }}>
            ⚡ Emergency Numbers:
          </span>
          <div style={{ display: "flex", gap: "var(--gap-sm)", flexWrap: "wrap" }}>
            <button 
              onClick={() => handleEmergencyCall("112")}
              style={{ background: "var(--rd)", color: "#fff", border: "none", borderRadius: 20, padding: "4px 12px", fontSize: "var(--fs-xs)", fontWeight: 700, cursor: "pointer" }}
            >
              112 (National)
            </button>
            <button 
              onClick={() => handleEmergencyCall("767")}
              style={{ background: "var(--gdl)", border: "none", borderRadius: 20, padding: "4px 12px", fontSize: "var(--fs-xs)", fontWeight: 700, cursor: "pointer", color: "var(--gd)" }}
            >
              767 (LASEMA)
            </button>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div style={{ display: "flex", overflowX: "auto", gap: 8, padding: "var(--sp-3) var(--pad-x)", scrollbarWidth: "none" }}>
        {HUB_TABS.map(t => (
          <button 
            key={t.id} 
            onClick={() => setTab(t.id)} 
            style={{ 
              padding: "8px 14px", 
              borderRadius: 22, 
              flexShrink: 0, 
              fontSize: "var(--fs-xs)", 
              fontWeight: 700, 
              background: tab === t.id ? "var(--dp)" : "var(--card)", 
              color: tab === t.id ? "#fff" : "var(--mt)", 
              border: `1.5px solid ${tab === t.id ? "var(--dp)" : "var(--border)"}`, 
              cursor: "pointer", 
              minHeight: "var(--touch)" 
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="fu" style={{ flex: 1, overflowY: "auto", padding: "0 var(--pad-x) calc(var(--nav-h) + var(--sp-4))" }}>
        
        {/* Journey-specific emergency resources */}
        {journeyResources && (
          <WCard style={{ background: "var(--lvl)", border: "1.5px solid var(--lvm)44", marginBottom: "var(--gap-md)" }}>
            <div style={{ fontWeight: 800, fontSize: "var(--fs-sm)", color: "var(--lv)", marginBottom: 8 }}>
              🤰 {journeyResources.title}
            </div>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>
              {journeyResources.resources.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </WCard>
        )}
        
        {/* DV Help Tab */}
        {tab === "dv" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
            <WCard style={{ background: "var(--rdl)", border: "1.5px solid var(--rdm)33" }}>
              <div style={{ fontWeight: 800, fontSize: "var(--fs-md)", color: "var(--rd)", marginBottom: 6 }}>🆘 You Are Not Alone</div>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>Domestic violence affects 1 in 3 women in Nigeria. Help is available — free, confidential, and open to all women.</div>
            </WCard>
            
            {/* Safety Planning Tips */}
            <WCard style={{ background: "var(--bll)" }}>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 8 }}>📋 Safety Planning Tips</div>
              <ul style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6, margin: 0, paddingLeft: 20 }}>
                <li>Have a code word with trusted friends/family</li>
                <li>Keep important documents in a safe place</li>
                <li>Charge your phone and keep emergency numbers saved</li>
                <li>Plan an escape route and safe place to go</li>
                <li>Use incognito browsing to hide your search history</li>
              </ul>
            </WCard>
            
            {DV_CONTACTS.map((c, i) => (
              <WCard key={i}>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 8 }}>{c.flag} {c.country}</div>
                {c.lines.map((l, j) => (
                  <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: j < c.lines.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)" }}>{l.name}</div>
                    <a href={`tel:${l.num.replace(/\s/g,"")}`} style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--rd)", background: "var(--rdl)", padding: "5px 10px", borderRadius: 12, textDecoration: "none" }}>{l.num}</a>
                  </div>
                ))}
              </WCard>
            ))}
            
            {/* Quick Escape Button - Hidden but functional */}
            <button 
              onClick={() => window.location.href = "https://www.google.com"}
              style={{
                width: "100%",
                padding: "var(--sp-3)",
                background: "var(--warm)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r)",
                fontSize: "var(--fs-sm)",
                cursor: "pointer",
                color: "var(--mt)"
              }}
            >
              🚪 Quick Escape (Opens Google)
            </button>
          </div>
        )}

        {/* Sexual Health Tab */}
        {tab === "sexual" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
            {SEXUAL_HEALTH.map((s, i) => (
              <WCard key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: "var(--bll)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{s.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{s.title}</div>
                    <Tag label={s.tag} bg="var(--bll)" tc="var(--bl)" />
                  </div>
                  <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </WCard>
            ))}
            
            {/* STI Testing Reminder */}
            <WCard>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>🩺 STI Testing Reminder</div>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", marginBottom: 12 }}>Regular testing is recommended if you have new or multiple partners.</p>
              <button style={{ background: "var(--t)", color: "#fff", border: "none", borderRadius: 20, padding: "8px 16px", cursor: "pointer" }}>
                Set Testing Reminder
              </button>
            </WCard>
          </div>
        )}

        {/* Report Incident Tab */}
        {tab === "report" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
            <WCard style={{ background: "var(--gdl)" }}>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--gd)", marginBottom: 4 }}>📋 6-Step Incident Guide</div>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)" }}>Follow these steps to report domestic violence safely and effectively.</div>
            </WCard>
            {REPORT_STEPS.map((s, i) => (
              <WCard key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: "var(--t)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-sm)", fontWeight: 800, color: "#fff" }}>{s.n}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>{s.body}</div>
                </div>
              </WCard>
            ))}
          </div>
        )}

        {/* Free Clinics Tab */}
        {tab === "condoms" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
            <WCard style={{ background: "var(--sgl)" }}>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--sg)", marginBottom: 4 }}>🩹 Free & Low-Cost Care</div>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)" }}>Free condoms, STI testing, and contraception near you.</div>
            </WCard>
            {FREE_CLINICS.map((c, i) => (
              <WCard key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{c.flag} {c.name}</div>
                  <Tag label={c.area} bg="var(--sgl)" tc="var(--sg)" />
                </div>
                <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)" }}>{c.detail}</div>
              </WCard>
            ))}
          </div>
        )}

        {/* Drug Safety Tab */}
        {tab === "drugs" && <DrugSafetyChecker />}
        
        {/* Crisis Tab - Mental Health Crisis Support */}
        {tab === "crisis" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
            <WCard style={{ background: "var(--rdl)", border: "2px solid var(--rd)" }}>
              <div style={{ fontWeight: 800, fontSize: "var(--fs-md)", color: "var(--rd)", marginBottom: 8 }}>
                🚨 Mental Health Crisis Support
              </div>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>
                If you're thinking about harming yourself or others, please reach out immediately.
                <strong> You are not alone. Help is available 24/7.</strong>
              </div>
            </WCard>
            
            {/* Crisis Helplines */}
            {EMERGENCY_CONTACTS.map((contact, i) => (
              <WCard key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{contact.name}</div>
                    <div style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>{contact.description}</div>
                  </div>
                  <button 
                    onClick={() => handleEmergencyCall(contact.number)}
                    style={{
                      background: contact.bg,
                      color: contact.color,
                      border: "none",
                      borderRadius: 20,
                      padding: "8px 16px",
                      fontSize: "var(--fs-sm)",
                      fontWeight: 800,
                      cursor: "pointer"
                    }}
                  >
                    Call {contact.number}
                  </button>
                </div>
              </WCard>
            ))}
            
            {/* Warning Signs Checklist */}
            <WCard>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", marginBottom: 8 }}>⚠️ Crisis Warning Signs</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {CRISIS_WARNING_SIGNS.map((item, i) => (
                  <div key={i} style={{ padding: "var(--sp-2) 0", borderBottom: i < CRISIS_WARNING_SIGNS.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--rd)", flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{item.sign}</span>
                    </div>
                    <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginLeft: 16 }}>{item.action}</p>
                  </div>
                ))}
              </div>
            </WCard>
            
            {/* Self-Care Tips */}
            <WCard style={{ background: "var(--lvl)" }}>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--lv)", marginBottom: 8 }}>💚 Immediate Self-Care</div>
              <ul style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6, margin: 0, paddingLeft: 20 }}>
                <li>Breathe deeply: Inhale for 4 seconds, hold for 7, exhale for 8</li>
                <li>Reach out to one person you trust</li>
                <li>Remove yourself from stressful environments if possible</li>
                <li>Stay hydrated and try to eat something small</li>
                <li>Remember: This feeling is temporary, help is available</li>
              </ul>
            </WCard>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}