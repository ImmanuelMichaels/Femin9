import { useState } from 'react';
import { WCard, Tag } from '../../components/ui';
import DrugSafetyChecker from '../../components/cards/DrugSafetyChecker';
import { useApp } from '../../context/useApp';

const HUB_TABS = [
  { id:"dv",     label:"🆘 DV Help" },
  { id:"sexual", label:"🩺 Sexual Health" },
  { id:"report", label:"📋 Report Incident" },
  { id:"condoms",label:"🩹 Free Clinics" },
  { id:"drugs",  label:"💊 Safety Check" },
  { id:"crisis", label:"🚨 Crisis" },
];

// UK/GB emergency contacts (official)
const EMERGENCY_CONTACTS = [
  { 
    name: "999 Emergency Services", 
    number: "999", 
    description: "Police, Ambulance, Fire Brigade - Life-threatening emergencies only",
    bg: "var(--rd)",
    color: "#fff"
  },
  { 
    name: "NHS 111", 
    number: "111", 
    description: "Medical advice when it's not an emergency",
    bg: "var(--bll)",
    color: "var(--bl)"
  },
  { 
    name: "Samaritans", 
    number: "116 123", 
    description: "24/7 confidential emotional support",
    bg: "var(--gdl)",
    color: "var(--gd)"
  },
  { 
    name: "National Domestic Abuse Helpline", 
    number: "0808 2000 247", 
    description: "24/7 confidential support for domestic abuse",
    bg: "var(--rdl)",
    color: "var(--rd)"
  },
  { 
    name: "NHS Mental Health Crisis Line", 
    number: "111 (option 2)", 
    description: "24/7 mental health support - select option 2",
    bg: "var(--lvl)",
    color: "var(--lv)"
  }
];

// UK Domestic Violence Contacts by region
const DV_CONTACTS_UK = [
  {
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    country: "England",
    lines: [
      { name: "National Domestic Abuse Helpline", num: "0808 2000 247" },
      { name: "Men's Advice Line", num: "0808 801 0327" },
      { name: "Respect (for perpetrators seeking help)", num: "0808 802 4040" }
    ]
  },
  {
    flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    country: "Scotland",
    lines: [
      { name: "Scotland Domestic Abuse Helpline", num: "0800 027 1234" },
      { name: "FearFree (support for men)", num: "0808 802 0030" }
    ]
  },
  {
    flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
    country: "Wales",
    lines: [
      { name: "Live Fear Free Helpline", num: "0808 80 10 800" },
      { name: "Dyn Wales (support services)", num: "01792 644 683" }
    ]
  },
  {
    flag: "🇬🇧",
    country: "Northern Ireland",
    lines: [
      { name: "Domestic & Sexual Abuse Helpline", num: "0808 802 1414" },
      { name: "Men's Advisory Project", num: "028 9024 1929" }
    ]
  }
];

// UK Sexual Health Services
const SEXUAL_HEALTH_UK = [
  {
    icon: "🏥",
    title: "NHS Sexual Health Services",
    desc: "Free STI testing, contraception, and advice available at local clinics. Search 'NHS sexual health clinic near me'.",
    tag: "Free NHS"
  },
  {
    icon: "📦",
    title: "SH:24",
    desc: "Free at-home STI testing kits delivered discreetly. Results via text within days.",
    tag: "Online"
  },
  {
    icon: "💊",
    title: "Brook",
    desc: "Free and confidential sexual health services for under-25s. Clinics nationwide and online consultations.",
    tag: "Under 25"
  },
  {
    icon: "🩺",
    title: "Terrence Higgins Trust",
    desc: "HIV and sexual health charity offering testing, support, and advice.",
    tag: "Charity"
  }
];

// UK Reporting Steps
const REPORT_STEPS_UK = [
  {
    n: 1,
    title: "Get to a Safe Place",
    body: "If you're in immediate danger, call 999. Find somewhere you feel safe, whether that's with a friend, family member, or in a public space."
  },
  {
    n: 2,
    title: "Speak to a Specialist",
    body: "Call the National Domestic Abuse Helpline (0808 2000 247) for confidential advice. They can help you understand your options."
  },
  {
    n: 3,
    title: "Document Everything",
    body: "Save messages, photos of injuries (with dates), and record incidents in a log. This evidence helps with police reports and protection orders."
  },
  {
    n: 4,
    title: "Contact the Police",
    body: "Call 101 for non-emergency reporting, or visit your local police station. Ask to speak to specially trained domestic abuse officers."
  },
  {
    n: 5,
    title: "Apply for a Protection Order",
    body: "Through a court, you can get a Non-Molestation Order or Occupation Order. Your local domestic abuse service can help with paperwork."
  },
  {
    n: 6,
    title: "Access Ongoing Support",
    body: "Get linked with an Independent Domestic Violence Advisor (IDVA), refuge accommodation, or counselling through local services."
  }
];

// UK Free Clinics & Services
const FREE_CLINICS_UK = [
  {
    flag: "🏥",
    name: "NHS Sexual Health Clinic",
    area: "England/Wales/Scotland/NI",
    detail: "Free STI testing, contraception, HPV vaccine, PrEP, and emergency contraception. Find your nearest via NHS website."
  },
  {
    flag: "📦",
    name: "SH:24",
    area: "Online",
    detail: "Free STI testing kits delivered to your home. Covers chlamydia, gonorrhoea, syphilis, and HIV."
  },
  {
    flag: "💊",
    name: "Brook",
    area: "Nationwide",
    detail: "Free and confidential sexual health services for under-25s. Offers contraception, STI testing, and pregnancy advice."
  },
  {
    flag: "🩺",
    name: "C-Card Scheme",
    area: "Various Locations",
    detail: "Free condoms for young people (typically under-25) through participating pharmacies and youth centres."
  },
  {
    flag: "🏳️‍🌈",
    name: "HIV Prevention England",
    area: "Nationwide",
    detail: "Free PrEP (pre-exposure prophylaxis) available through NHS sexual health clinics for HIV prevention."
  }
];

// Crisis warning signs with severity levels
const CRISIS_WARNING_SIGNS = [
  { id: 1, sign: "Talking about wanting to die or harm yourself", action: "Call 999 immediately or go to A&E", severity: "critical" },
  { id: 2, sign: "Feeling hopeless or trapped", action: "Call Samaritans (116 123) 24/7", severity: "high" },
  { id: 3, sign: "Withdrawing from family and friends", action: "Reach out to someone you trust or call NHS 111 (option 2)", severity: "medium" },
  { id: 4, sign: "Extreme mood swings or agitation", action: "Contact your GP for urgent mental health assessment", severity: "high" },
  { id: 5, sign: "Feeling like a burden to others", action: "Call Samaritans - you matter and help is available", severity: "critical" },
  { id: 6, sign: "Increased alcohol or drug use", action: "Contact FRANK (0300 123 6600) for substance support", severity: "high" }
];

// Crisis action checklist
const CRISIS_ACTION_CHECKLIST = [
  { id: 1, action: "Call emergency helpline (999 or 111 option 2)", completed: false, icon: "📞" },
  { id: 2, action: "Reach out to a trusted friend or family member", completed: false, icon: "👥" },
  { id: 3, action: "Remove yourself from immediate danger", completed: false, icon: "🚶" },
  { id: 4, action: "Practice grounding technique (5-4-3-2-1 method)", completed: false, icon: "🧘" },
  { id: 5, action: "Go to nearest hospital A&E department", completed: false, icon: "🏥" },
  { id: 6, action: "Contact your GP or mental health team", completed: false, icon: "💬" }
];

export default function Safety() {
  const { setShowSOS, journeyType } = useApp();
  const [tab, setTab] = useState("dv");
  const [showCrisisChecklist, setShowCrisisChecklist] = useState(false);
  const [selectedCrisis, setSelectedCrisis] = useState(null);
  const [checklistItems, setChecklistItems] = useState(CRISIS_ACTION_CHECKLIST);
  const [crisisPlan, setCrisisPlan] = useState("");
  
  // Quick emergency action
  const handleEmergencyCall = (number) => {
    window.location.href = `tel:${number.replace(/\s/g, "")}`;
  };
  
  // Open SOS modal from header
  const handleSOS = () => {
    setShowSOS(true);
  };
  
  // Handle crisis sign click - show action plan
  const handleCrisisSignClick = (sign) => {
    setSelectedCrisis(sign);
    setShowCrisisChecklist(true);
  };
  
  // Close crisis modal
  const closeCrisisModal = () => {
    setShowCrisisChecklist(false);
    setSelectedCrisis(null);
  };
  
  // Toggle checklist item completion
  const toggleChecklistItem = (id) => {
    setChecklistItems(items =>
      items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };
  
  // Save personal crisis plan
  const saveCrisisPlan = () => {
    if (crisisPlan.trim()) {
      localStorage.setItem('crisisPlan', crisisPlan);
      alert("Your crisis plan has been saved! You can access it anytime.");
    }
  };
  
  // Load saved crisis plan on mount
  useState(() => {
    const savedPlan = localStorage.getItem('crisisPlan');
    if (savedPlan) {
      setCrisisPlan(savedPlan);
    }
  }, []);
  
  // Get journey-specific resources
  const getJourneyResources = () => {
    if (journeyType === 'pregnant') {
      return {
        title: "Pregnancy Emergency Resources (UK)",
        resources: [
          "Maternity Triage: Call your hospital's maternity unit immediately for urgent concerns",
          "Early Pregnancy Unit: For bleeding or pain in early pregnancy - ask your GP for referral",
          "NHS 111: For urgent medical advice about pregnancy concerns",
          "Tommy's PregnancyLine: 0800 014 7800 (pregnancy complications support)"
        ]
      };
    } else if (journeyType === 'mom') {
      return {
        title: "Postpartum Emergency Resources (UK)",
        resources: [
          "Perinatal Mental Health Team: Urgent mental health support - ask your health visitor for referral",
          "Health Visitor: Contact your health visitor for postnatal concerns",
          "National Breastfeeding Helpline: 0300 100 0212",
          "Association for Postnatal Illness: 0207 386 0868"
        ]
      };
    }
    return null;
  };
  
  const journeyResources = getJourneyResources();
  
  // Get severity color
  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'var(--rd)';
      case 'high': return 'var(--rdl)';
      default: return 'var(--warm)';
    }
  };
  
  // Calculate checklist progress
  const completedCount = checklistItems.filter(item => item.completed).length;
  const progressPercentage = (completedCount / checklistItems.length) * 100;
  
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
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", marginTop: 3 }}>Support, rights & health safety - UK & GB services</div>
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
              onClick={() => handleEmergencyCall("999")}
              style={{ background: "var(--rd)", color: "#fff", border: "none", borderRadius: 20, padding: "4px 12px", fontSize: "var(--fs-xs)", fontWeight: 700, cursor: "pointer" }}
            >
              999 (Emergency)
            </button>
            <button 
              onClick={() => handleEmergencyCall("111")}
              style={{ background: "var(--bll)", border: "none", borderRadius: 20, padding: "4px 12px", fontSize: "var(--fs-xs)", fontWeight: 700, cursor: "pointer", color: "var(--bl)" }}
            >
              111 (NHS)
            </button>
            <button 
              onClick={() => handleEmergencyCall("116123")}
              style={{ background: "var(--gdl)", border: "none", borderRadius: 20, padding: "4px 12px", fontSize: "var(--fs-xs)", fontWeight: 700, cursor: "pointer", color: "var(--gd)" }}
            >
              116 123 (Samaritans)
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
        
        {/* DV Help Tab - UK Data */}
        {tab === "dv" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
            <WCard style={{ background: "var(--rdl)", border: "1.5px solid var(--rdm)33" }}>
              <div style={{ fontWeight: 800, fontSize: "var(--fs-md)", color: "var(--rd)", marginBottom: 6 }}>🆘 You Are Not Alone</div>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>Domestic abuse affects 1 in 4 women and 1 in 6 men in the UK. Free, confidential help is available 24/7 through national and local services.</div>
            </WCard>
            
            <WCard style={{ background: "var(--bll)" }}>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 8 }}>📋 Safety Planning Tips (UK)</div>
              <ul style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6, margin: 0, paddingLeft: 20 }}>
                <li>Have a code word with trusted friends/family to signal danger</li>
                <li>Keep important documents (passport, bank details) in a safe place</li>
                <li>Charge your phone and keep emergency numbers saved as contacts</li>
                <li>Plan an escape route and identify local refuge options</li>
                <li>Use incognito browsing to hide your search history</li>
                <li>Download the Bright Sky app for location-based support</li>
              </ul>
            </WCard>
            
            {DV_CONTACTS_UK.map((c, i) => (
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
            
            <button 
              onClick={() => window.location.href = "https://www.bbc.co.uk/news"}
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
              🚪 Quick Escape (Opens BBC News - covers your tracks)
            </button>
          </div>
        )}

        {/* Sexual Health Tab - UK Data */}
        {tab === "sexual" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
            {SEXUAL_HEALTH_UK.map((s, i) => (
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
            
            <WCard>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>🩺 STI Testing Reminder (UK)</div>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", marginBottom: 12 }}>NHS recommends annual STI testing if you have new or multiple partners. Testing is free and confidential.</p>
              <button style={{ background: "var(--t)", color: "#fff", border: "none", borderRadius: 20, padding: "8px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <span>📅</span> Set NHS Testing Reminder
              </button>
            </WCard>
          </div>
        )}

        {/* Report Incident Tab - UK Data */}
        {tab === "report" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
            <WCard style={{ background: "var(--gdl)" }}>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--gd)", marginBottom: 4 }}>📋 6-Step Incident Guide (UK)</div>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)" }}>Follow these steps to report domestic abuse safely and effectively in the UK.</div>
            </WCard>
            {REPORT_STEPS_UK.map((s, i) => (
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

        {/* Free Clinics Tab - UK Data */}
        {tab === "condoms" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
            <WCard style={{ background: "var(--sgl)" }}>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--sg)", marginBottom: 4 }}>🩹 Free NHS & Low-Cost Care</div>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)" }}>Free condoms, STI testing, contraception, and sexual health services available across the UK.</div>
            </WCard>
            {FREE_CLINICS_UK.map((c, i) => (
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
                🚨 Mental Health Crisis Support (UK)
              </div>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>
                If you're thinking about harming yourself or others, please reach out immediately.
                <strong> You are not alone. Help is available 24/7 across the UK.</strong>
              </div>
            </WCard>
            
            {/* Button to show crisis checklist */}
            <button
              onClick={() => setShowCrisisChecklist(true)}
              style={{
                background: "var(--t)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--r)",
                padding: "var(--sp-3)",
                fontSize: "var(--fs-sm)",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8
              }}
            >
              📋 View Crisis Action Checklist
            </button>
            
            {/* Crisis Helplines - UK */}
            {EMERGENCY_CONTACTS.map((contact, i) => (
              <WCard key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
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
            
            {/* Additional UK Mental Health Resources */}
            <WCard>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>📞 Other UK Mental Health Helplines</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div><strong>CALM (Campaign Against Living Miserably):</strong> 0800 58 58 58 (5pm-midnight)</div>
                <div><strong>Mind Infoline:</strong> 0300 123 3393 (9am-6pm, Mon-Fri)</div>
                <div><strong>SANEline:</strong> 0300 304 7000 (4pm-10pm daily)</div>
                <div><strong>Shout Crisis Text Line:</strong> Text "SHOUT" to 85258</div>
              </div>
            </WCard>
            
            {/* Warning Signs Checklist - Clickable */}
            <WCard>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", marginBottom: 8 }}>⚠️ Crisis Warning Signs</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {CRISIS_WARNING_SIGNS.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleCrisisSignClick(item)}
                    style={{ 
                      padding: "var(--sp-2) 0", 
                      borderBottom: `1px solid var(--border)`,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      background: selectedCrisis?.id === item.id ? "var(--warm)" : "transparent",
                      borderRadius: "var(--r)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <div style={{ 
                        width: 10, 
                        height: 10, 
                        borderRadius: "50%", 
                        background: getSeverityColor(item.severity), 
                        flexShrink: 0 
                      }} />
                      <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{item.sign}</span>
                    </div>
                    <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginLeft: 18 }}>{item.action}</p>
                  </div>
                ))}
              </div>
            </WCard>
            
            {/* Personal Crisis Plan */}
            <WCard style={{ background: "var(--lvl)" }}>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--lv)", marginBottom: 8 }}>📝 My Personal Crisis Plan</div>
              <textarea
                value={crisisPlan}
                onChange={(e) => setCrisisPlan(e.target.value)}
                placeholder="Write your personal crisis plan here... What helps you calm down? Who can you call? What makes you feel safe?"
                style={{
                  width: "100%",
                  minHeight: 120,
                  padding: "var(--sp-2)",
                  borderRadius: "var(--r)",
                  border: "1px solid var(--border)",
                  fontSize: "var(--fs-sm)",
                  fontFamily: "inherit",
                  marginBottom: "var(--sp-2)",
                  resize: "vertical"
                }}
              />
              <button
                onClick={saveCrisisPlan}
                style={{
                  background: "var(--t)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--r)",
                  padding: "var(--sp-2) var(--sp-3)",
                  fontSize: "var(--fs-xs)",
                  cursor: "pointer"
                }}
              >
                Save My Crisis Plan
              </button>
            </WCard>
            
            {/* Self-Care Tips */}
            <WCard style={{ background: "var(--lvl)" }}>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--lv)", marginBottom: 8 }}>💚 Immediate Self-Care</div>
              <ul style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6, margin: 0, paddingLeft: 20 }}>
                <li>Breathe deeply: Inhale for 4 seconds, hold for 7, exhale for 8</li>
                <li>Reach out to one person you trust</li>
                <li>Remove yourself from stressful environments if possible</li>
                <li>Stay hydrated and try to eat something small</li>
                <li>Remember: This feeling is temporary, help is available 24/7</li>
              </ul>
            </WCard>
          </div>
        )}
      </div>
      
      {/* Crisis Checklist Modal - Using showCrisisChecklist and selectedCrisis */}
      {showCrisisChecklist && (
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
          padding: "var(--pad-x)",
          overflowY: "auto"
        }}>
          <div style={{
            background: "var(--card)",
            borderRadius: "var(--r2)",
            maxWidth: 500,
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "var(--sp-5)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-4)" }}>
              <h3 style={{ fontSize: "var(--fs-lg)", fontWeight: 800, margin: 0 }}>
                {selectedCrisis ? "Crisis Action Plan" : "Crisis Action Checklist"}
              </h3>
              <button
                onClick={closeCrisisModal}
                style={{
                  background: "var(--warm)",
                  border: "none",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  fontSize: 18,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ✕
              </button>
            </div>
            
            {selectedCrisis && (
              <div style={{ 
                background: "var(--rdl)", 
                padding: "var(--sp-3)", 
                borderRadius: "var(--r)", 
                marginBottom: "var(--sp-4)" 
              }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Selected Warning Sign:</div>
                <div style={{ fontSize: "var(--fs-sm)", marginBottom: 8 }}>{selectedCrisis.sign}</div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Recommended Action:</div>
                <div style={{ fontSize: "var(--fs-sm)", color: "var(--rd)" }}>{selectedCrisis.action}</div>
              </div>
            )}
            
            <div style={{ marginBottom: "var(--sp-4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-2)" }}>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>
                  📋 Crisis Response Checklist
                </div>
                <div style={{ fontSize: "var(--fs-xs)", color: "var(--sg)" }}>
                  {completedCount}/{checklistItems.length} completed
                </div>
              </div>
              
              {/* Progress bar */}
              <div style={{
                width: "100%",
                height: 6,
                background: "var(--border)",
                borderRadius: 3,
                marginBottom: "var(--sp-3)",
                overflow: "hidden"
              }}>
                <div style={{
                  width: `${progressPercentage}%`,
                  height: "100%",
                  background: "var(--sg)",
                  transition: "width 0.3s"
                }} />
              </div>
              
              {checklistItems.map(item => (
                <div 
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--gap-sm)",
                    padding: "var(--sp-2)",
                    marginBottom: "var(--sp-1)",
                    background: item.completed ? "var(--sgl)" : "transparent",
                    borderRadius: "var(--r)",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    border: `2px solid ${item.completed ? "var(--sg)" : "var(--border)"}`,
                    background: item.completed ? "var(--sg)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 12,
                    flexShrink: 0
                  }}>
                    {item.completed && "✓"}
                  </div>
                  <span style={{ fontSize: "var(--fs-sm)", flex: 1 }}>{item.icon} {item.action}</span>
                </div>
              ))}
            </div>
            
            <button
              onClick={closeCrisisModal}
              style={{
                width: "100%",
                padding: "var(--sp-3)",
                background: "var(--t)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--r)",
                fontSize: "var(--fs-sm)",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Close Checklist
            </button>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}