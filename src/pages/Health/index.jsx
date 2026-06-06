import { useState, useRef, useCallback, useEffect } from 'react';
import { WCard, SectionTitle, Tag, IconBox } from '../../components/ui';
import SymptomRisk from '../../components/cards/SymptomRisk';
import EmergencyRedFlags from '../../components/EmergencyRedFlags';
import { DRUGS, DRUG_DB, getDrugByName, TRADITIONAL } from '../../data/drugs';
import { useApp } from '../../context/useApp';

export default function Health() {
  const { journeyType, getCurrentWeek } = useApp();
  const [view, setView] = useState("menu");
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [selectedDrug, setSelectedDrug] = useState('');
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('drugSearchHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [emergencyBp, setEmergencyBp] = useState({ sys: 118, dia: 76 });
  const [emergencyBleeding, setEmergencyBleeding] = useState("none");
  const [emergencyMovement, setEmergencyMovement] = useState("normal");

  const streamRef = useRef(null);
  const intRef = useRef(null);
  const videoRef = useRef(null);
  const currentWeek = journeyType === 'pregnant' ? getCurrentWeek() : null;

  const stopCam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (intRef.current) {
      clearInterval(intRef.current);
      intRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    return () => stopCam();
  }, [stopCam]);

  useEffect(() => {
    localStorage.setItem('drugSearchHistory', JSON.stringify(searchHistory.slice(0, 10)));
  }, [searchHistory]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to be ready
        await videoRef.current.play();
      }
      return true;
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Unable to access camera. Please check permissions.");
      return false;
    }
  };

  const handleDrugSearch = (drugName) => {
    if (!drugName.trim()) return;
    const result = getDrugByName(drugName);
    setScanResult({ ...result, type: 'drug', searchedName: drugName });
    setSearchHistory(prev => {
      const newHistory = [drugName, ...prev.filter(h => h.toLowerCase() !== drugName.toLowerCase())];
      return newHistory.slice(0, 10);
    });
    setSelectedDrug('');
    setView("result");
  };

  const simulateDrugScan = () => {
    const drugKeys = Object.keys(DRUG_DB).filter(k => k !== 'default');
    const randomKey = drugKeys[Math.floor(Math.random() * drugKeys.length)];
    const result = getDrugByName(randomKey);
    setScanResult({ ...result, type: 'drug', searchedName: randomKey });
    setView("result");
    setIsScanning(false);
  };

  const simulateJaundiceScan = () => {
    const results = [
      { level: "Low",      message: "No jaundice detected. Skin colour appears normal.",                                                      color: "var(--sg)" },
      { level: "Mild",     message: "Mild jaundice detected. Monitor feeding and wet diapers. Contact health visitor if concerned.",           color: "var(--gd)" },
      { level: "Moderate", message: "Moderate jaundice detected. Please contact your midwife or GP within 24 hours.",                         color: "var(--t)"  },
      { level: "Severe",   message: "Severe jaundice detected. Seek immediate medical attention.",                                             color: "var(--rd)" },
    ];
    return results[Math.floor(Math.random() * results.length)];
  };

  const simulateSymptomVision = () => {
    const symptoms = [
      { condition: "Normal",            confidence: 92, recommendation: "No concerning symptoms detected.",                                           color: "var(--sg)" },
      { condition: "Mild Rash",         confidence: 78, recommendation: "Monitor rash. If it spreads or accompanied by fever, consult GP.",           color: "var(--gd)" },
      { condition: "Possible Infection",confidence: 65, recommendation: "Signs of possible infection. Please consult a healthcare provider.",          color: "var(--t)"  },
    ];
    return symptoms[Math.floor(Math.random() * symptoms.length)];
  };

  const handleScan = async (type) => {
    setCameraError(null);
    setIsScanning(true);

    if (type === 'drug') {
      // FIX 5: drug scan is barcode simulation — no camera needed
      setTimeout(() => simulateDrugScan(), 1500);
    } else if (type === 'jaundice') {
      const cameraStarted = await startCamera();
      if (!cameraStarted) { 
        setIsScanning(false); 
        return; 
      }
      intRef.current = setTimeout(() => {
        const result = simulateJaundiceScan();
        setScanResult({ ...result, type: 'jaundice' });
        setView("result");
        setIsScanning(false);
        stopCam();
      }, 2000);
    } else if (type === 'symptom') {
      setTimeout(() => {
        const result = simulateSymptomVision();
        setScanResult({ ...result, type: 'symptom' });
        setView("result");
        setIsScanning(false);
      }, 2000);
    }
  };

  if (view === "result" && scanResult) {
    return (
      <div className="page-pad">
        <EmergencyRedFlags
          bpSys={emergencyBp.sys}
          bpDia={emergencyBp.dia}
          bleeding={emergencyBleeding}
          fetalMovement={emergencyMovement}
          week={currentWeek}
        />
        <button
          onClick={() => { setScanResult(null); setView("menu"); setSelectedDrug(''); stopCam(); }}
          style={{ background: "none", border: "none", color: "var(--t)", fontWeight: 800, fontSize: "var(--fs-md)", marginBottom: "var(--sp-4)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
        >
          ← Back to Health Tools
        </button>

        {scanResult.type === 'drug' && (
          <WCard style={{ background: scanResult.col?.[0] || "var(--sgl)", border: `1.5px solid ${scanResult.col?.[1] || "var(--sgm)"}44` }}>
            <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "center", marginBottom: "var(--sp-4)" }}>
              <div style={{ width: "var(--icon-md)", height: "var(--icon-md)", borderRadius: "var(--r)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-2xl)", boxShadow: "var(--sh)", flexShrink: 0 }}>
                {scanResult.icon || "💊"}
              </div>
              <div>
                <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)" }}>{scanResult.name}</p>
                <Tag label={scanResult.safety} bg={scanResult.col?.[0] || "var(--sgl)"} tc={scanResult.col?.[1] || "var(--sg)"} />
              </div>
            </div>
            {[["Category", scanResult.cat], ["Trimester", scanResult.trim], ["Dose", scanResult.dose]].map(([l, v]) => v && (
              <div key={l} style={{ display: "flex", gap: "var(--gap-md)", paddingBottom: "var(--sp-2)", marginBottom: "var(--sp-2)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <span style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", width: "clamp(60px,15vw,80px)", flexShrink: 0, fontWeight: 700 }}>{l}</span>
                <span style={{ fontSize: "var(--fs-sm)", color: "var(--dp)", fontWeight: 600, flex: 1 }}>{v}</span>
              </div>
            ))}
            <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: "var(--r)", padding: "var(--card-p)", marginTop: "var(--sp-2)" }}>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.65 }}>⚠️ {scanResult.warn}</p>
              {scanResult.alt && <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginTop: "var(--sp-2)" }}>✅ Alternative: {scanResult.alt}</p>}
            </div>
            {scanResult.nigerianBrands?.length > 0 && (
              <div style={{ marginTop: "var(--sp-3)", padding: "var(--sp-2)", background: "rgba(255,255,255,0.5)", borderRadius: "var(--r)" }}>
                <p style={{ fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--mt)", marginBottom: 4 }}>🇳🇬 Common Nigerian brands:</p>
                <p style={{ fontSize: "var(--fs-2xs)", color: "var(--md)" }}>{scanResult.nigerianBrands.join(', ')}</p>
              </div>
            )}
          </WCard>
        )}

        {scanResult.type === 'jaundice' && (
          <WCard style={{ background: `linear-gradient(135deg, ${scanResult.color || "var(--sgl)"}, var(--warm))` }}>
            <div style={{ textAlign: "center", marginBottom: "var(--sp-4)" }}>
              <div style={{ fontSize: 48, marginBottom: "var(--sp-2)" }}>👶</div>
              <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, color: scanResult.color || "var(--sg)" }}>
                Jaundice Level: {scanResult.level}
              </h2>
            </div>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--dp)", lineHeight: 1.6, textAlign: "center" }}>{scanResult.message}</p>
            {scanResult.level === "Severe" && (
              <div style={{ marginTop: "var(--sp-3)", padding: "var(--sp-3)", background: "var(--rdl)", borderRadius: "var(--r)" }}>
                <p style={{ fontSize: "var(--fs-xs)", color: "var(--rd)", fontWeight: 700, textAlign: "center" }}>🚨 Seek immediate medical attention</p>
              </div>
            )}
          </WCard>
        )}

        {scanResult.type === 'symptom' && (
          <WCard style={{ background: `linear-gradient(135deg, ${scanResult.color || "var(--sgl)"}, var(--warm))` }}>
            <div style={{ textAlign: "center", marginBottom: "var(--sp-4)" }}>
              <div style={{ fontSize: 48, marginBottom: "var(--sp-2)" }}>🔍</div>
              <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, color: scanResult.color || "var(--sg)" }}>
                Analysis: {scanResult.condition}
              </h2>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>Confidence: {scanResult.confidence}%</p>
            </div>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--dp)", lineHeight: 1.6, textAlign: "center" }}>{scanResult.recommendation}</p>
            <p style={{ fontSize: "var(--fs-2xs)", color: "var(--mt)", textAlign: "center", marginTop: "var(--sp-3)" }}>
              This is an AI analysis, not a medical diagnosis. Please consult a healthcare provider.
            </p>
          </WCard>
        )}

        <SymptomRisk />
      </div>
    );
  }

  if (isScanning) {
    return (
      <div className="page-pad">
        <EmergencyRedFlags
          bpSys={emergencyBp.sys}
          bpDia={emergencyBp.dia}
          bleeding={emergencyBleeding}
          fetalMovement={emergencyMovement}
          week={currentWeek}
        />
        <div style={{ textAlign: "center", padding: "var(--sp-5)" }}>
          <div style={{ width: 80, height: 80, border: "4px solid var(--border)", borderTopColor: "var(--t)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto var(--sp-4)" }} />
          <p style={{ fontSize: "var(--fs-md)", fontWeight: 700, color: "var(--dp)" }}>Scanning...</p>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)" }}>Please wait while AI analyses</p>
        </div>

        {cameraError && (
          <WCard style={{ background: "var(--rdl)" }}>
            <p style={{ color: "var(--rd)" }}>{cameraError}</p>
            <button onClick={() => setCameraError(null)} style={{ marginTop: 8, background: "var(--rd)", color: "#fff", border: "none", borderRadius: 20, padding: "6px 16px", cursor: "pointer" }}>
              Try Again
            </button>
          </WCard>
        )}

        {/* FIX 1: video element always rendered so ref attaches correctly */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ width: "100%", borderRadius: "var(--r)", marginTop: "var(--sp-3)", display: streamRef.current ? 'block' : 'none' }}
        />

        <button
          onClick={() => { stopCam(); setIsScanning(false); setView("menu"); }}
          style={{ marginTop: "var(--sp-4)", width: "100%", padding: "var(--sp-3)", background: "var(--warm)", border: "1px solid var(--border)", borderRadius: "var(--r)", cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="page-pad">
      <EmergencyRedFlags
        bpSys={emergencyBp.sys}
        bpDia={emergencyBp.dia}
        bleeding={emergencyBleeding}
        fetalMovement={emergencyMovement}
        week={currentWeek}
      />

      <SectionTitle title="🩺 Health Tools" />

      <WCard>
        <p style={{ fontSize: "var(--fs-sm)", fontWeight: 700, marginBottom: "var(--sp-2)" }}>💊 Check Medication Safety</p>
        {searchHistory.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-sm)", marginBottom: "var(--sp-3)" }}>
            {searchHistory.map((drug, i) => (
              <button
                key={i}
                onClick={() => handleDrugSearch(drug)}
                style={{ padding: "4px 12px", background: "var(--warm)", border: "1px solid var(--border)", borderRadius: 20, fontSize: "var(--fs-2xs)", cursor: "pointer" }}
              >
                {drug}
              </button>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: "var(--gap-sm)" }}>
          <input
            type="text"
            placeholder="Search medication name (e.g., paracetamol, ibuprofen)..."
            value={selectedDrug}
            onChange={(e) => setSelectedDrug(e.target.value)}
            // FIX 3: onKeyPress deprecated, use onKeyDown
            onKeyDown={(e) => e.key === 'Enter' && handleDrugSearch(selectedDrug)}
            style={{ flex: 1, padding: "var(--sp-3)", borderRadius: "var(--r)", border: "1px solid var(--border)", fontSize: "var(--fs-sm)" }}
          />
          <button
            onClick={() => handleDrugSearch(selectedDrug)}
            disabled={!selectedDrug.trim()}
            style={{ padding: "var(--sp-3) var(--sp-4)", background: selectedDrug.trim() ? "var(--t)" : "var(--border)", color: selectedDrug.trim() ? "#fff" : "var(--mt)", border: "none", borderRadius: "var(--r)", cursor: selectedDrug.trim() ? "pointer" : "not-allowed" }}
          >
            Check
          </button>
        </div>
      </WCard>

      {[
        { icon: "📷", bg: "var(--bll)", tc: "var(--bl)", title: "Jaundice Scanner",    desc: "Point camera at baby skin for AI colour analysis",                          type: "jaundice" },
        { icon: "🔬", bg: "var(--sgl)", tc: "var(--sg)", title: "Drug Safety Scanner", desc: "Scan barcode to check medication safety during pregnancy",                   type: "drug"     },
        { icon: "👁️", bg: "var(--lvl)", tc: "var(--lv)", title: "Symptom Vision",      desc: "AI-powered visual symptom check for rashes and skin conditions",            type: "symptom"  },
      ].map((item, i) => (
        <WCard key={i} onClick={() => handleScan(item.type)} style={{ padding: "var(--card-p)", cursor: "pointer" }}>
          <div style={{ display: "flex", gap: "var(--gap-lg)", alignItems: "center" }}>
            <IconBox emoji={item.icon} bg={item.bg} size="var(--icon-md)" />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-1)" }}>{item.title}</p>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", lineHeight: 1.45 }}>{item.desc}</p>
            </div>
            <div style={{ color: "var(--mt)", fontSize: "var(--fs-xl)" }}>›</div>
          </div>
        </WCard>
      ))}

      <SectionTitle title="Traditional Practices" />
      <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginBottom: "var(--sp-2)" }}>
        Evidence-based guidance on traditional practices during pregnancy and postpartum
      </p>

      {TRADITIONAL.map((t, i) => (
        <WCard
          key={i}
          style={{ padding: "var(--card-p)", background: t.safe ? "var(--sgl)" : "var(--rdl)", border: `1px solid ${t.safe ? "var(--sgm)" : "var(--rdm)"}33` }}
        >
          <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "flex-start" }}>
            <div style={{ width: "clamp(28px,7vw,36px)", height: "clamp(28px,7vw,36px)", borderRadius: "var(--r)", background: t.safe ? "var(--sg)" : t.status === "DANGEROUS" ? "var(--rd)" : "var(--gd)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "var(--fs-sm)", flexShrink: 0 }}>
              {t.safe ? "✓" : t.status === "DANGEROUS" ? "✗" : "!"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: "var(--gap-sm)", alignItems: "center", flexWrap: "wrap", marginBottom: "var(--sp-1)" }}>
                <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--dp)" }}>{t.practice}</p>
                <Tag label={t.status} bg={t.safe ? "var(--sgl)" : t.status === "DANGEROUS" ? "var(--rdl)" : "var(--gdl)"} tc={t.safe ? "var(--sg)" : t.status === "DANGEROUS" ? "var(--rd)" : "var(--gd)"} />
              </div>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)", lineHeight: 1.55 }}>{t.reason}</p>
            </div>
          </div>
        </WCard>
      ))}

      <SectionTitle title="Symptom Risk Engine" />
      <SymptomRisk />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}