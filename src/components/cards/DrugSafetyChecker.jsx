import { useState, useEffect } from 'react';
import { WCard, Tag, Pill} from '../ui'; // Button kept
import { useApp } from '../../context/AppContext';
import { DRUG_DB, CONTEXT_KEYS, RATING_META, DRUG_SUGGESTIONS } from '../../data/drugs';

export default function DrugSafetyChecker() {
  const { journeyType, getTrimester } = useApp(); // getCurrentWeek kept
  const [query, setQuery] = useState("");
  const [ctx, setCtx] = useState(() => {
    if (journeyType === 'pregnant') {
      const trimester = getTrimester();
      return `Pregnancy — T${trimester}`;
    }
    if (journeyType === 'mom') return "Postpartum (Wk 1–12)";
    if (journeyType === 'conceive') return "Cycle: Ovulatory";
    if (journeyType === 'menstrual') return "Cycle: Menstrual";
    return "Pregnancy — T2";
  });
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showEmergencyNote, setShowEmergencyNote] = useState(false); // Kept
  
  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem('drugRecentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);
  
  const search = () => {
    if (!query.trim()) return;
    const q = query.toLowerCase().trim();
    
    let key = Object.keys(DRUG_DB).find(k => k === q);
    if (!key) {
      key = Object.keys(DRUG_DB).find(k => q.includes(k) || k.includes(q));
    }
    
    const foundResult = key ? DRUG_DB[key] : null;
    setResult(foundResult);
    setSearched(true);
    setShowEmergencyNote(foundResult?.rating === 'AVOID' || foundResult?.rating === 'EMERGENCY');
    
    // Save to recent searches - THIS WORKS FINE
    if (foundResult && !recentSearches.includes(query)) {
      const newRecent = [query, ...recentSearches].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem('drugRecentSearches', JSON.stringify(newRecent));
    }
  };
  
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setTimeout(() => {
      const q = suggestion.toLowerCase().trim();
      let key = Object.keys(DRUG_DB).find(k => k === q);
      if (!key) {
        key = Object.keys(DRUG_DB).find(k => q.includes(k) || k.includes(q));
      }
      const foundResult = key ? DRUG_DB[key] : null;
      setResult(foundResult);
      setSearched(true);
      setShowEmergencyNote(foundResult?.rating === 'AVOID' || foundResult?.rating === 'EMERGENCY');
      
      // Save to recent searches - THIS ALSO WORKS FINE
      if (foundResult && !recentSearches.includes(suggestion)) {
        const newRecent = [suggestion, ...recentSearches].slice(0, 5);
        setRecentSearches(newRecent);
        localStorage.setItem('drugRecentSearches', JSON.stringify(newRecent));
      }
    }, 100);
  };
  
  // Rest of your component remains exactly the same...
  const getContextInfo = () => {
    switch(ctx) {
      case "Pregnancy — T1":
        return "First trimester (weeks 1-13): Critical period for organ development";
      case "Pregnancy — T2":
        return "Second trimester (weeks 14-27): Baby is growing rapidly";
      case "Pregnancy — T3":
        return "Third trimester (weeks 28-40): Final preparation for birth";
      case "Postpartum (Wk 1–12)":
        return "Postpartum: First 12 weeks after birth. Some medications transfer to breast milk";
      case "Cycle: Menstrual":
        return "Menstrual phase: Body is shedding uterine lining";
      case "Cycle: Follicular":
        return "Follicular phase: Egg is maturing";
      case "Cycle: Ovulatory":
        return "Ovulatory phase: Peak fertility window";
      case "Cycle: Luteal":
        return "Luteal phase: Preparing for possible implantation";
      default:
        return "Please select your current context for personalised guidance";
    }
  };
  
  const ctxKey = CONTEXT_KEYS[ctx];
  const guidance = result?.guidance?.[ctxKey] || "No specific guidance available for this context. Always consult your healthcare provider.";
  const rm = result ? (RATING_META[result.rating] || RATING_META["CAUTION"]) : null;
  
  const isEmergency = result?.rating === 'EMERGENCY' || result?.rating === 'AVOID';
  
  return (
    <div className="fu" style={{ padding: "0", display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
      <div style={{ textAlign: "center", padding: "var(--sp-3) 0 var(--sp-2)" }}>
        <div style={{ fontSize: "clamp(32px,8vw,42px)", marginBottom: 6 }}>💊</div>
        <div style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)" }}>Drug & Substance Safety Checker</div>
        <div style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", marginTop: 4 }}>
          Check safety of medications, herbs, foods, and environmental exposures
        </div>
      </div>
      
      {/* Search Input */}
      <div style={{ display: "flex", gap: 8 }}>
        <input 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          onKeyDown={e => e.key === "Enter" && search()}
          placeholder="Search e.g. Panadol, zobo, paint fumes, ginger..."
          style={{ 
            flex: 1, 
            padding: "clamp(10px,2.5vw,13px) clamp(13px,3vw,16px)", 
            borderRadius: "var(--r)", 
            border: "1.5px solid var(--border2)", 
            fontSize: "var(--fs-sm)", 
            background: "var(--card)", 
            outline: "none", 
            color: "var(--dp)" 
          }} 
        />
        <button 
          onClick={search} 
          style={{ 
            padding: "0 clamp(14px,3.5vw,20px)", 
            borderRadius: "var(--r)", 
            background: "var(--t)", 
            color: "#fff", 
            fontWeight: 700, 
            fontSize: "var(--fs-sm)", 
            flexShrink: 0, 
            minHeight: "var(--touch)",
            border: "none",
            cursor: "pointer"
          }}
        >
          Check
        </button>
      </div>
      
      {/* Suggestions */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {DRUG_SUGGESTIONS.slice(0, 12).map(s => (
          <button 
            key={s} 
            onClick={() => handleSuggestionClick(s)} 
            style={{ 
              padding: "5px 11px", 
              borderRadius: 20, 
              fontSize: "var(--fs-xs)", 
              background: "var(--card)", 
              border: "1.5px solid var(--border)", 
              color: "var(--mt)", 
              cursor: "pointer", 
              fontWeight: 600 
            }}
          >
            {s}
          </button>
        ))}
      </div>
      
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-sm)", flexWrap: "wrap" }}>
          <span style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>Recent:</span>
          {recentSearches.map((s, i) => (
            <button 
              key={i} 
              onClick={() => handleSuggestionClick(s)}
              style={{ 
                fontSize: "var(--fs-xs)", 
                color: "var(--t)", 
                background: "none", 
                border: "none", 
                cursor: "pointer",
                textDecoration: "underline"
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
      
      {/* Context Selector */}
      <WCard>
        <div style={{ fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--mt)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Your Current Context
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: "var(--sp-2)" }}>
          {Object.keys(CONTEXT_KEYS).map(c => (
            <Pill 
              key={c} 
              label={c} 
              active={ctx === c} 
              onClick={() => setCtx(c)} 
              color="var(--rd)" 
            />
          ))}
        </div>
        <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginTop: "var(--sp-2)" }}>
          {getContextInfo()}
        </p>
      </WCard>
      
      {/* Not Found */}
      {searched && !result && (
        <WCard style={{ textAlign: "center", padding: "var(--sp-5)" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
          <div style={{ fontWeight: 700, color: "var(--dp)" }}>Not in Database</div>
          <div style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", marginTop: 6 }}>
            "{query}" not found. Always consult your doctor, pharmacist, or midwife.
          </div>
          <div style={{ marginTop: "var(--sp-3)" }}>
            <Tag label="Always verify with a healthcare professional" bg="var(--warm)" tc="var(--mt)" />
          </div>
        </WCard>
      )}
      
      {/* Result Display */}
      {result && rm && (
        <div className="slideUp" style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
          {/* Header Card */}
          <WCard style={{ background: rm.bg, border: `2px solid ${rm.col}33` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ 
                width: 52, 
                height: 52, 
                borderRadius: 14, 
                flexShrink: 0, 
                background: `${rm.col}22`, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                fontSize: 28 
              }}>
                {rm.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: "var(--fs-md)", color: "var(--dp)" }}>{result.name}</div>
                <Tag label={result.cat} bg={`${rm.col}22`} tc={rm.col} />
              </div>
              <div style={{ 
                padding: "6px 14px", 
                borderRadius: 30, 
                background: rm.col, 
                color: "#fff", 
                fontSize: "var(--fs-sm)", 
                fontWeight: 800, 
                flexShrink: 0 
              }}>
                {rm.label}
              </div>
            </div>
          </WCard>
          
          {/* Emergency Warning */}
          {isEmergency && (
            <WCard style={{ background: "var(--rdl)", border: "2px solid var(--rd)" }}>
              <div style={{ display: "flex", gap: "var(--gap-sm)", alignItems: "center" }}>
                <span style={{ fontSize: 28 }}>🚨</span>
                <div>
                  <p style={{ fontWeight: 800, color: "var(--rd)", marginBottom: 4 }}>
                    {result.rating === 'EMERGENCY' ? 'Seek Medical Attention Immediately' : 'Avoid During Current Context'}
                  </p>
                  <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)" }}>
                    {result.rating === 'EMERGENCY' 
                      ? 'This requires immediate medical evaluation. Do not delay.'
                      : 'This is not recommended for your current stage. Consult your doctor for alternatives.'}
                  </p>
                </div>
              </div>
            </WCard>
          )}
          
          {/* Guidance */}
          <WCard>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 18 }}>🎯</div>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--dp)" }}>Guidance for: {ctx}</div>
            </div>
            <div style={{ 
              padding: "var(--card-p)", 
              borderRadius: "var(--r)", 
              background: rm.bg, 
              fontSize: "var(--fs-sm)", 
              color: "var(--dp)", 
              lineHeight: 1.6 
            }}>
              {guidance}
            </div>
          </WCard>
          
          {/* Mechanism */}
          <WCard>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 18 }}>🔬</div>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>How It Works / Risk Profile</div>
            </div>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>
              {result.mechanism}
            </div>
          </WCard>
          
          {/* Nigerian Names */}
          {result.nigerian?.length > 0 && (
            <WCard>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ fontSize: 18 }}>🇳🇬</div>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>Nigerian / Local Names</div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.nigerian.map((n, i) => (
                  <Tag key={i} label={n} bg="var(--gdl)" tc="var(--gd)" />
                ))}
              </div>
            </WCard>
          )}
          
          {/* Safer Alternatives */}
          <WCard style={{ background: "var(--sgl)", border: "1.5px solid var(--sg)33" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 18 }}>💡</div>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--sg)" }}>Safer Alternatives</div>
            </div>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>
              {result.alt}
            </div>
          </WCard>
          
          {/* When to Contact Doctor */}
          {(result.rating === 'AVOID' || result.rating === 'CAUTION') && (
            <WCard style={{ background: "var(--bll)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 18 }}>🩺</div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>If You've Already Taken This</p>
                  <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)", marginTop: 4 }}>
                    Contact your GP, midwife, or pharmacist for advice. Do not stop prescribed medications without medical advice.
                  </p>
                </div>
              </div>
            </WCard>
          )}
          
          {/* Disclaimer */}
          <div style={{ 
            fontSize: "var(--fs-xs)", 
            color: "var(--mt)", 
            textAlign: "center", 
            padding: "var(--sp-2) var(--sp-3)", 
            lineHeight: 1.5,
            background: "var(--warm)",
            borderRadius: "var(--r)"
          }}>
            ⚕️ MamaBloom safety data is for educational use only. 
            Always confirm with a registered doctor, pharmacist, or midwife before taking any medication.
          </div>
        </div>
      )}
    </div>
  );
}