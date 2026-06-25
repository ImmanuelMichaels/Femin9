import { useState, useEffect } from 'react';
import { useApp } from '../../context/useApp';
import { lsGet, lsSet, lsAppend } from '../../utils/storage';

export default function EmergencyModal({ onClose }) {
  const { userName, journeyType, setShowSOS } = useApp();
  const [sent, setSent] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [calling, setCalling] = useState(false);
  
  // UK Emergency Contacts
  const emergencyContacts = {
    ambulance: { name: "Ambulance", number: "999", description: "Life-threatening emergencies" },
    police: { name: "Police", number: "999", description: "Emergency Police Response" },
    fire: { name: "Fire Brigade", number: "999", description: "Fire emergencies" },
    nhs111: { name: "NHS 111", number: "111", description: "Medical advice when it's not an emergency" },
    samaritans: { name: "Samaritans", number: "116 123", description: "24/7 confidential emotional support" },
    mentalHealth: { name: "NHS Mental Health Crisis Line", number: "111 (option 2)", description: "24/7 mental health support" },
    domesticAbuse: { name: "National Domestic Abuse Helpline", number: "0808 2000 247", description: "24/7 confidential support" },
    hospital: { name: "Nearest A&E", number: "999", description: "Accident & Emergency" }
  };
  
  // Get GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error("Location error:", error);
          setLocationError("Unable to get your location. Please share manually.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationError("Geolocation not supported by your browser");
    }
  }, []);
  
  // Countdown timer for auto-call
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      makeEmergencyCall();
      setCountdown(null);
    }
  }, [countdown]);
  
  const makeEmergencyCall = () => {
    setCalling(true);
    const phoneNumber = selectedEmergency === 'ambulance' ? emergencyContacts.ambulance.number :
                        selectedEmergency === 'police' ? emergencyContacts.police.number :
                        selectedEmergency === 'hospital' ? emergencyContacts.hospital.number :
                        selectedEmergency === 'mentalHealth' ? emergencyContacts.mentalHealth.number :
                        emergencyContacts.ambulance.number;
    
    // For web, we can only open tel: link
    const cleanNumber = phoneNumber.replace(/\s/g, '').replace(/\(option.*\)/g, '').trim();
    window.location.href = `tel:${cleanNumber}`;
    
    setTimeout(() => {
      setCalling(false);
    }, 3000);
  };
  
  const handleEmergencySelect = async (type, label) => {
    setSelectedEmergency(type);
    setSent(true);
    
    // Start countdown for auto-call
    setCountdown(3);
    
    // Simulate sending alerts
    console.log(`🚨 EMERGENCY ALERT: ${label}`);
    console.log(`👤 User: ${userName}`);
    console.log(`📍 Location: ${location ? `${location.lat}, ${location.lng}` : 'Unknown'}`);
    console.log(`📱 Journey: ${journeyType}`);
    
    // Store emergency log using safe storage
    const emergencyLog = {
      id: Date.now(),
      type: type,
      label: label,
      timestamp: new Date().toISOString(),
      location: location,
      journeyType: journeyType
    };
    
    // Use lsAppend to safely add to emergency logs with cap
    lsAppend('emergencyLogs', emergencyLog, 50);
  };
  
  const handleCallNow = (number, name) => {
    const cleanNumber = number.replace(/\s/g, '').replace(/\(option.*\)/g, '').trim();
    window.location.href = `tel:${cleanNumber}`;
  };
  
  const handleShareLocation = () => {
    if (location) {
      const locationText = `I need help! My location: https://maps.google.com/?q=${location.lat},${location.lng}`;
      
      // Try to share via Web Share API
      if (navigator.share) {
        navigator.share({
          title: 'Emergency - Share Location',
          text: locationText,
        }).catch(console.error);
      } else {
        navigator.clipboard.writeText(locationText);
        alert("Location copied to clipboard. Please share with your emergency contact.");
      }
    } else {
      alert("Getting location... Please wait or share manually.");
    }
  };
  
  const emergencyOptions = [
    { icon: "🩸", label: "Heavy Bleeding", type: "ambulance", bg: "var(--rdl)", color: "var(--rd)", urgent: true },
    { icon: "💔", label: "Chest Pain / High BP", type: "ambulance", bg: "var(--rdl)", color: "var(--rd)", urgent: true },
    { icon: "🤰", label: "Labour Signs", type: "ambulance", bg: "var(--gdl)", color: "var(--gd)", urgent: false },
    { icon: "🧠", label: "Severe Headache", type: "nhs111", bg: "var(--gdl)", color: "var(--gd)", urgent: false },
    { icon: "👶", label: "Baby Not Moving", type: "ambulance", bg: "var(--rdl)", color: "var(--rd)", urgent: true },
    { icon: "🌡️", label: "High Fever", type: "nhs111", bg: "var(--gdl)", color: "var(--gd)", urgent: false },
    { icon: "😰", label: "Mental Health Crisis", type: "mentalHealth", bg: "var(--lvl)", color: "var(--lv)", urgent: true },
    { icon: "🚗", label: "Accident / Injury", type: "ambulance", bg: "var(--rdl)", color: "var(--rd)", urgent: true }
  ];
  
  return (
    <div className="fi" style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
      zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center"
    }}>
      <div className="slideUp" style={{
        background: "var(--card)",
        borderRadius: "var(--r3) var(--r3) 0 0",
        padding: "var(--sp-5) var(--pad-x) var(--sp-6)",
        width: "100%", maxWidth: 500,
        maxHeight: "90vh",
        overflowY: "auto"
      }}>
        <div style={{ 
          width: 50, 
          height: 5, 
          borderRadius: 3, 
          background: "var(--border)", 
          margin: "0 auto var(--sp-5)" 
        }} />
        
        <div style={{ textAlign: "center", marginBottom: "var(--sp-4)" }}>
          <div style={{
            width: "clamp(56px,14vw,72px)", 
            height: "clamp(56px,14vw,72px)",
            borderRadius: "50%", 
            background: "var(--rdl)",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            fontSize: "clamp(24px,6vw,32px)", 
            margin: "0 auto var(--sp-3)",
            border: "2.5px solid var(--rdm)", 
            animation: "pulse 1.2s infinite"
          }}>🚨</div>
          <h2 className="serif" style={{ 
            fontSize: "var(--fs-xl)", 
            color: "var(--rd)", 
            marginBottom: "var(--sp-2)", 
            fontStyle: "italic" 
          }}>Emergency Help</h2>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", lineHeight: 1.6 }}>
            Select your emergency type. We will alert emergency services with your location.
          </p>
        </div>
        
        {/* Location Status */}
        {location && (
          <div style={{
            background: "var(--sgl)",
            borderRadius: "var(--r)",
            padding: "var(--sp-2) var(--sp-3)",
            marginBottom: "var(--sp-3)",
            display: "flex",
            alignItems: "center",
            gap: "var(--gap-sm)",
            fontSize: "var(--fs-xs)"
          }}>
            <span>📍</span>
            <span style={{ color: "var(--sg)" }}>Location shared</span>
            <button 
              onClick={handleShareLocation}
              style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--t)", cursor: "pointer" }}
            >
              Share Now →
            </button>
          </div>
        )}
        
        {locationError && (
          <div style={{
            background: "var(--gdl)",
            borderRadius: "var(--r)",
            padding: "var(--sp-2) var(--sp-3)",
            marginBottom: "var(--sp-3)",
            fontSize: "var(--fs-xs)",
            color: "var(--gd)"
          }}>
            ⚠️ {locationError}
          </div>
        )}
        
        {/* Emergency Options Grid */}
        <div className="emrg-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "var(--gap-md)",
          marginBottom: "var(--sp-4)"
        }}>
          {emergencyOptions.map((opt, i) => (
            <button 
              key={i} 
              className="emrg-btn"
              onClick={() => handleEmergencySelect(opt.type, opt.label)}
              disabled={sent}
              style={{ 
                background: opt.bg, 
                border: `1.5px solid ${opt.color}44`, 
                color: opt.color,
                padding: "var(--sp-3)",
                borderRadius: "var(--r)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "var(--sp-2)",
                cursor: sent ? "not-allowed" : "pointer",
                opacity: sent ? 0.6 : 1,
                transition: "all 0.2s"
              }}
            >
              <span style={{ fontSize: "var(--fs-xl)" }}>{opt.icon}</span>
              <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{opt.label}</span>
            </button>
          ))}
        </div>
        
        {/* Alert Sent Confirmation */}
        {sent && (
          <div className="fu" style={{
            background: "var(--rdl)", 
            border: "1.5px solid var(--rd)",
            borderRadius: "var(--r)", 
            padding: "var(--card-p)", 
            marginBottom: "var(--sp-4)"
          }}>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--rd)", fontWeight: 800, marginBottom: "var(--sp-2)" }}>
              ✅ Emergency Alert Sent
            </p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)", marginBottom: "var(--sp-1)" }}>
              📍 GPS location shared with emergency services
            </p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)", marginBottom: "var(--sp-1)" }}>
              🏥 Alerting {emergencyContacts.hospital.name}
            </p>
            {countdown !== null && (
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--rd)", fontWeight: 700 }}>
                📞 Auto-calling in {countdown}...
              </p>
            )}
            {calling && (
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--sg)" }}>
                📞 Dialling emergency services...
              </p>
            )}
          </div>
        )}
        
        {/* Direct Call Buttons - UK Emergency Numbers */}
        <div style={{ marginBottom: "var(--sp-4)" }}>
          <p style={{ fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--mt)", marginBottom: "var(--sp-2)" }}>
            📞 UK Emergency Helplines
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-sm)" }}>
            <button 
              onClick={() => handleCallNow(emergencyContacts.ambulance.number, emergencyContacts.ambulance.name)}
              style={{ background: "var(--rd)", color: "#fff", border: "none", borderRadius: 30, padding: "8px 16px", cursor: "pointer", fontSize: "var(--fs-xs)" }}
            >
              🚑 999 (Emergency)
            </button>
            <button 
              onClick={() => handleCallNow(emergencyContacts.nhs111.number, emergencyContacts.nhs111.name)}
              style={{ background: "var(--bll)", color: "var(--bl)", border: "none", borderRadius: 30, padding: "8px 16px", cursor: "pointer", fontSize: "var(--fs-xs)" }}
            >
              🏥 111 (NHS)
            </button>
            <button 
              onClick={() => handleCallNow(emergencyContacts.samaritans.number, emergencyContacts.samaritans.name)}
              style={{ background: "var(--gdl)", color: "var(--gd)", border: "none", borderRadius: 30, padding: "8px 16px", cursor: "pointer", fontSize: "var(--fs-xs)" }}
            >
              💚 116 123 (Samaritans)
            </button>
            <button 
              onClick={() => handleCallNow(emergencyContacts.domesticAbuse.number, emergencyContacts.domesticAbuse.name)}
              style={{ background: "var(--rdl)", color: "var(--rd)", border: "none", borderRadius: 30, padding: "8px 16px", cursor: "pointer", fontSize: "var(--fs-xs)" }}
            >
              🛡️ DV Helpline
            </button>
          </div>
        </div>
        
        {/* Additional UK Support */}
        <div style={{ 
          background: "var(--warm)", 
          borderRadius: "var(--r)", 
          padding: "var(--sp-3)", 
          marginBottom: "var(--sp-4)",
          border: "1px solid var(--border)"
        }}>
          <p style={{ fontSize: "var(--fs-xs)", fontWeight: 700, marginBottom: "var(--sp-1)" }}>
            🇬🇧 Other UK Support
          </p>
          <div style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", lineHeight: 1.8 }}>
            <div>• <strong>Mental Health:</strong> NHS 111 (option 2) - 24/7 crisis support</div>
            <div>• <strong>Shout:</strong> Text "SHOUT" to 85258 (24/7 crisis text line)</div>
            <div>• <strong>CALM:</strong> 0800 58 58 58 (5pm-midnight, men's mental health)</div>
            <div>• <strong>Mind Infoline:</strong> 0300 123 3393 (Mon-Fri, 9am-6pm)</div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "var(--gap-md)" }}>
          {!sent && (
            <button 
              onClick={() => handleCallNow(emergencyContacts.ambulance.number, emergencyContacts.ambulance.name)} 
              className="btn-primary"
              style={{ flex: 1, background: "var(--rd)", color: "#fff", border: "none", borderRadius: "var(--r)", padding: "var(--sp-3)", fontWeight: 800, cursor: "pointer" }}
            >
              📞 Call 999 Now
            </button>
          )}
          <button 
            onClick={onClose} 
            className="btn-primary"
            style={{ flex: 1, background: "var(--warm)", color: "var(--md)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "var(--sp-3)", fontWeight: 700, cursor: "pointer" }}
          >
            Close
          </button>
        </div>
        
        <p style={{ fontSize: "var(--fs-2xs)", color: "var(--mt)", textAlign: "center", marginTop: "var(--sp-4)" }}>
          By using this feature, you agree to share your location with emergency services.
        </p>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        
        .slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}