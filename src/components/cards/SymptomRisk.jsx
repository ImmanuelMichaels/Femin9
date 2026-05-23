import { useState, useEffect } from 'react';
import { WCard, Tag, Button } from '../ui';
import { useApp } from '../../context/AppContext';
import { SYMPTOMS_RISK } from '../../data/drugs';

const RISK_COL = {
  "EMERGENCY": ["var(--rdl)", "var(--rd)"],
  "HIGH":      ["var(--rdl)", "var(--rd)"],
  "MEDIUM":    ["var(--gdl)", "var(--gd)"],
  "LOW":       ["var(--sgl)", "var(--sg)"],
  "CRITICAL":  ["var(--rdl)", "var(--rd)"]
};

// Comprehensive symptom list by category
const SYMPTOMS_BY_CATEGORY = {
  pregnancy: [
    "Headache", "Swelling", "High BP", "Blurry vision", "Upper abdominal pain",
    "Reduced kicks", "No movement 2hr", "Vaginal bleeding", "Cramping", 
    "Water breaking", "Contractions", "Nausea", "Fatigue", "Back pain", "Leg swelling"
  ],
  general: [
    "Fever", "Chills", "Chest pain", "Shortness of breath", "Dizziness",
    "Fainting", "Rapid heartbeat", "Confusion", "Severe anxiety"
  ],
  postpartum: [
    "Heavy bleeding", "Fever >38°C", "Pain when peeing", "Breast pain",
    "C-section incision redness", "Depressed mood", "Thoughts of harming self"
  ],
  ttc: [
    "Irregular periods", "No period", "Pelvic pain", "Unusual discharge",
    "Pain during intercourse"
  ]
};

const ALL_SYMPTOMS = [...SYMPTOMS_BY_CATEGORY.pregnancy, ...SYMPTOMS_BY_CATEGORY.general];

// Helper to check if symptoms indicate emergency
const getEmergencyAction = (riskLevel) => {
  switch(riskLevel) {
    case 'EMERGENCY':
    case 'CRITICAL':
      return {
        action: "Seek immediate medical attention. Call 999/112 or go to A&E now.",
        callNumber: "999",
        urgency: "immediate"
      };
    case 'HIGH':
      return {
        action: "Contact your GP or midwife today. Do not wait until tomorrow.",
        callNumber: "111",
        urgency: "today"
      };
    case 'MEDIUM':
      return {
        action: "Monitor symptoms. See a doctor within 48 hours if no improvement.",
        callNumber: null,
        urgency: "soon"
      };
    default:
      return {
        action: "Rest, stay hydrated. Contact doctor if symptoms persist or worsen.",
        callNumber: null,
        urgency: "monitor"
      };
  }
};

export default function SymptomRisk() {
  const { journeyType, getCurrentWeek } = useApp();
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [showEmergencyContact, setShowEmergencyContact] = useState(false);
  const [savedLogs, setSavedLogs] = useState([]);
  
  const currentWeek = journeyType === 'pregnant' ? getCurrentWeek() : null;
  
  // Load saved symptom logs
  useEffect(() => {
    const saved = localStorage.getItem('symptomRiskLogs');
    if (saved) {
      setSavedLogs(JSON.parse(saved).slice(0, 5));
    }
  }, []);
  
  // Get journey-specific symptoms
  const getJourneySymptoms = () => {
    if (journeyType === 'pregnant') {
      return SYMPTOMS_BY_CATEGORY.pregnancy;
    }
    if (journeyType === 'mom') {
      return [...SYMPTOMS_BY_CATEGORY.postpartum, ...SYMPTOMS_BY_CATEGORY.general];
    }
    if (journeyType === 'conceive' || journeyType === 'ivf') {
      return [...SYMPTOMS_BY_CATEGORY.ttc, ...SYMPTOMS_BY_CATEGORY.general];
    }
    return ALL_SYMPTOMS;
  };
  
  const journeySymptoms = getJourneySymptoms();
  
  const analyse = () => {
    if (selected.length === 0) return;
    
    // Check for pregnancy-specific urgency based on week
    if (journeyType === 'pregnant' && currentWeek >= 20) {
      if (selected.includes('Headache') && selected.includes('Blurry vision')) {
        setResult({ 
          risk: "EMERGENCY", 
          condition: "Preeclampsia (Severe)", 
          action: "Call 999 immediately. This is a medical emergency. Do not drive yourself."
        });
        setShowEmergencyContact(true);
        return;
      }
      if (selected.includes('Vaginal bleeding') && selected.includes('Cramping')) {
        setResult({ 
          risk: "EMERGENCY", 
          condition: "Placental Abruption / Preterm Labour", 
          action: "Go to hospital immediately. Call 999 for ambulance."
        });
        setShowEmergencyContact(true);
        return;
      }
    }
    
    // Check against rules
    for (const rule of SYMPTOMS_RISK) {
      const matchCount = rule.combo.filter(s => selected.includes(s)).length;
      const requiredMatches = Math.min(2, rule.combo.length);
      if (matchCount >= requiredMatches) {
        const emergencyAction = getEmergencyAction(rule.risk);
        setResult({ 
          ...rule, 
          action: `${rule.action} ${emergencyAction.action}`,
          callNumber: emergencyAction.callNumber
        });
        setShowEmergencyContact(rule.risk === 'EMERGENCY' || rule.risk === 'HIGH');
        return;
      }
    }
    
    // No high-risk pattern
    setResult({ 
      risk: "LOW", 
      condition: "No high-risk pattern detected", 
      action: "Monitor symptoms. If they worsen, contact your healthcare provider.",
      callNumber: null
    });
    setShowEmergencyContact(false);
  };
  
  const clearSelection = () => {
    setSelected([]);
    setResult(null);
    setShowEmergencyContact(false);
  };
  
  const logSymptoms = () => {
    if (result) {
      const logEntry = {
        id: Date.now(),
        date: new Date().toISOString(),
        symptoms: selected,
        risk: result.risk,
        condition: result.condition,
        journeyType: journeyType
      };
      const updatedLogs = [logEntry, ...savedLogs].slice(0, 10);
      setSavedLogs(updatedLogs);
      localStorage.setItem('symptomRiskLogs', JSON.stringify(updatedLogs));
    }
  };
  
  const cols = RISK_COL[result?.risk] || ["var(--sgl)", "var(--sg)"];
  const isHighRisk = result?.risk === 'EMERGENCY' || result?.risk === 'HIGH' || result?.risk === 'CRITICAL';
  
  return (
    <WCard>
      <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-1)" }}>
        🧠 Symptom Risk Analyser
      </p>
      <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginBottom: "var(--sp-3)" }}>
        Tap all symptoms you're experiencing. AI will assess combined risk and provide guidance.
        {journeyType === 'pregnant' && currentWeek && (
          <span style={{ display: 'block', marginTop: 4 }}>
            🤰 Week {currentWeek} - Some symptoms are more concerning after 20 weeks.
          </span>
        )}
      </p>
      
      {/* Symptoms Grid */}
      <div style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: "var(--gap-sm)", 
        marginBottom: "var(--sp-4)",
        maxHeight: 200,
        overflowY: "auto",
        padding: "var(--sp-1)"
      }}>
        {journeySymptoms.map(s => (
          <button 
            key={s} 
            onClick={() => setSelected(sl => sl.includes(s) ? sl.filter(x => x !== s) : [...sl, s])} 
            style={{ 
              padding: "clamp(5px,1.2vw,7px) clamp(9px,2.2vw,13px)", 
              borderRadius: 20, 
              fontSize: "var(--fs-xs)", 
              fontWeight: 700, 
              background: selected.includes(s) ? "var(--dp)" : "var(--warm)", 
              color: selected.includes(s) ? "#fff" : "var(--md)", 
              border: `1.5px solid ${selected.includes(s) ? "var(--dp)" : "var(--border)"}`, 
              cursor: "pointer", 
              transition: "all 0.15s", 
              minHeight: "var(--touch)" 
            }}
          >
            {s}
          </button>
        ))}
      </div>
      
      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "var(--gap-sm)", marginBottom: "var(--sp-3)" }}>
        <button 
          onClick={analyse} 
          disabled={!selected.length} 
          className="btn-primary" 
          style={{ 
            flex: 2,
            background: selected.length ? "var(--dp)" : "var(--border)", 
            color: selected.length ? "#fff" : "var(--mt)", 
            cursor: selected.length ? "pointer" : "default", 
            padding: "var(--sp-3)",
            borderRadius: "var(--r)",
            fontWeight: 800,
            border: "none"
          }}
        >
          Analyse {selected.length > 0 ? `(${selected.length})` : ""}
        </button>
        {selected.length > 0 && (
          <button 
            onClick={clearSelection}
            style={{ 
              flex: 1,
              background: "var(--warm)", 
              border: "1px solid var(--border)", 
              borderRadius: "var(--r)", 
              cursor: "pointer",
              padding: "var(--sp-3)",
              fontWeight: 600
            }}
          >
            Clear
          </button>
        )}
      </div>
      
      {/* Result Display */}
      {result && (
        <div className="fu" style={{ 
          background: cols[0], 
          borderRadius: "var(--r)", 
          padding: "var(--card-p)", 
          border: `1.5px solid ${cols[1]}44`,
          marginBottom: "var(--sp-3)"
        }}>
          <div style={{ display: "flex", gap: "var(--gap-sm)", alignItems: "center", marginBottom: "var(--sp-2)", flexWrap: "wrap" }}>
            <span style={{ fontSize: "var(--fs-lg)" }}>
              {result.risk === "EMERGENCY" || result.risk === "HIGH" || result.risk === "CRITICAL" ? "🚨" : 
               result.risk === "MEDIUM" ? "⚠️" : "✅"}
            </span>
            <Tag label={result.risk} bg={cols[0]} tc={cols[1]} />
            <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: cols[1] }}>{result.condition}</p>
          </div>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.65, marginBottom: isHighRisk ? "var(--sp-3)" : 0 }}>
            {result.action}
          </p>
          
          {/* Emergency Call Button */}
          {isHighRisk && result.callNumber && (
            <div style={{ marginTop: "var(--sp-3)" }}>
              <Button 
                onClick={() => window.location.href = `tel:${result.callNumber}`}
                variant="danger"
                fullWidth
              >
                📞 Call {result.callNumber === '999' ? 'Emergency Services (999)' : result.callNumber === '111' ? 'NHS 111' : result.callNumber} Now
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Log Symptoms Button */}
      {result && !isHighRisk && (
        <button 
          onClick={logSymptoms}
          style={{ 
            width: "100%", 
            padding: "var(--sp-2)", 
            background: "var(--warm)", 
            border: "1px solid var(--border)", 
            borderRadius: "var(--r)", 
            cursor: "pointer",
            fontSize: "var(--fs-sm)",
            fontWeight: 600,
            marginBottom: "var(--sp-3)"
          }}
        >
          📋 Log This Assessment
        </button>
      )}
      
      {/* Recent Logs */}
      {savedLogs.length > 0 && (
        <div style={{ marginTop: "var(--sp-3)" }}>
          <p style={{ fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--mt)", marginBottom: "var(--sp-2)" }}>
            Recent Assessments
          </p>
          {savedLogs.map(log => (
            <div key={log.id} style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "var(--sp-2) 0",
              borderBottom: "1px solid var(--border)",
              fontSize: "var(--fs-xs)"
            }}>
              <span>{new Date(log.date).toLocaleDateString()}</span>
              <Tag 
                label={log.risk} 
                bg={RISK_COL[log.risk]?.[0] || "var(--warm)"} 
                tc={RISK_COL[log.risk]?.[1] || "var(--mt)"}
                size="sm"
              />
              <span style={{ color: "var(--mt)" }}>{log.symptoms.length} symptoms</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Disclaimer */}
      <p style={{ 
        fontSize: "var(--fs-2xs)", 
        color: "var(--mt)", 
        textAlign: "center", 
        marginTop: "var(--sp-3)",
        paddingTop: "var(--sp-2)",
        borderTop: "1px solid var(--border)"
      }}>
        ⚕️ This is an AI risk assessment tool, not a medical diagnosis. 
        Always consult a healthcare professional for medical advice.
      </p>
    </WCard>
  );
}