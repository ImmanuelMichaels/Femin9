import { useState, useEffect } from 'react';
import AIAssistant from './AIAssistant';
import { WCard, Pill, Tag } from '../../components/ui';
import { useApp } from '../../context/AppContext';

export default function Chat() {
  const { subscriptionPlan, getAiMessageLimit, userName, journeyType } = useApp();
  const [activeTab, setActiveTab] = useState("chat");
  const [messageCount, setMessageCount] = useState(() => {
    const saved = localStorage.getItem('dailyMessageCount');
    const date = localStorage.getItem('messageCountDate');
    const today = new Date().toDateString();
    if (date === today && saved) {
      return parseInt(saved);
    }
    return 0;
  });
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  
  const dailyLimit = getAiMessageLimit();
  const remainingMessages = dailyLimit === Infinity ? 'Unlimited' : Math.max(0, dailyLimit - messageCount);
  const isNearLimit = dailyLimit !== Infinity && remainingMessages <= 3 && remainingMessages > 0;
  const isAtLimit = dailyLimit !== Infinity && messageCount >= dailyLimit;
  
  // Track message count across sessions
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem('dailyMessageCount', messageCount.toString());
    localStorage.setItem('messageCountDate', today);
  }, [messageCount]);
  
  // Reset message count at midnight
  useEffect(() => {
    const checkMidnight = setInterval(() => {
      const today = new Date().toDateString();
      const savedDate = localStorage.getItem('messageCountDate');
      if (savedDate !== today) {
        setMessageCount(0);
        setShowLimitWarning(false);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(checkMidnight);
  }, []);
  
  const incrementMessageCount = () => {
    const newCount = messageCount + 1;
    setMessageCount(newCount);
    if (dailyLimit !== Infinity && newCount >= dailyLimit - 2) {
      setShowLimitWarning(true);
    }
  };
  
  // Human support professionals
  const supportStaff = [
    { name: "Nurse Chiamaka Obi", spec: "Midwife & Lactation Consultant", status: "Available", lang: "EN, IG", available: true, videoReady: true },
    { name: "Nurse Fatima Al-Hassan", spec: "Antenatal & Postnatal Care", status: "Available", lang: "EN, HA", available: true, videoReady: false },
    { name: "Dr. Segun Adeyemi", spec: "Obstetrician (Video Consult)", status: "In 30 mins", lang: "EN, YO", available: false, videoReady: true }
  ];
  
  // Medical records
  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('medicalRecords');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, icon: "🧪", label: "Blood Test Results", date: "Jan 28, 2025", status: "Uploaded", fileType: "pdf" },
      { id: 2, icon: "🔬", label: "Ultrasound Report (Week 22)", date: "Jan 15, 2025", status: "Uploaded", fileType: "pdf" },
      { id: 3, icon: "📋", label: "Antenatal Care Card", date: "Dec 20, 2024", status: "Uploaded", fileType: "image" },
      { id: 4, icon: "💉", label: "Vaccination Record", date: "Jan 12, 2025", status: "Partial", fileType: "pdf" },
      { id: 5, icon: "📊", label: "Growth Chart", date: "Jan 28, 2025", status: "Auto-generated", fileType: "chart" }
    ];
  });
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const handleUpload = () => {
    // Simulate file upload
    const newRecord = {
      id: records.length + 1,
      icon: "📄",
      label: selectedFile?.name || "New Document",
      date: new Date().toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: "Uploaded",
      fileType: "document"
    };
    setRecords([newRecord, ...records]);
    localStorage.setItem('medicalRecords', JSON.stringify([newRecord, ...records]));
    setShowUploadModal(false);
    setSelectedFile(null);
  };
  
  const handleExportChat = () => {
    // Export conversation as PDF (simulated)
    alert("Chat export feature will be available in the premium version. Upgrade to Bloom+ for unlimited exports.");
  };
  
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Message Limit Banner */}
      {dailyLimit !== Infinity && (
        <div style={{ 
          padding: "var(--sp-2) var(--pad-x)", 
          background: isAtLimit ? "var(--rdl)" : isNearLimit ? "var(--gdl)" : "var(--sgl)",
          borderBottom: `1px solid ${isAtLimit ? "var(--rd)" : isNearLimit ? "var(--gd)" : "var(--sg)"}44`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--gap-sm)"
        }}>
          <span style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: isAtLimit ? "var(--rd)" : isNearLimit ? "var(--gd)" : "var(--sg)" }}>
            {isAtLimit ? "🔒 Daily limit reached" : `💬 ${remainingMessages} messages remaining today`}
          </span>
          {isAtLimit && (
            <button 
              onClick={() => alert("Upgrade to Bloom+ for unlimited messages")}
              style={{ background: "var(--dp)", color: "#fff", border: "none", borderRadius: 20, padding: "4px 12px", fontSize: "var(--fs-2xs)", cursor: "pointer" }}
            >
              Upgrade
            </button>
          )}
        </div>
      )}
      
      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "var(--gap-sm)", padding: "var(--sp-4) var(--pad-x) var(--sp-3)", overflowX: "auto", scrollbarWidth: "none", flexShrink: 0 }}>
        {[
          { id: "chat", label: "💬 Bloom AI", premium: false },
          { id: "support", label: "👩‍⚕️ Human Support", premium: false },
          { id: "records", label: "📋 Medical Records", premium: false },
          { id: "offline", label: "📴 Offline Mode", premium: false }
        ].map(t => (
          <Pill 
            key={t.id} 
            label={t.label} 
            active={activeTab === t.id} 
            onClick={() => setActiveTab(t.id)} 
          />
        ))}
      </div>

      {/* Chat Tab - AI Assistant */}
      {activeTab === "chat" && (
        <AIAssistant 
          onMessageSent={incrementMessageCount}
          isAtLimit={isAtLimit}
          remainingMessages={remainingMessages}
        />
      )}

      {/* Human Support Tab */}
      {activeTab === "support" && (
        <div className="scroll-area" style={{ padding: "0 var(--pad-x) calc(var(--nav-h) + var(--sp-5))" }}>
          <WCard style={{ background: "var(--bll)", marginBottom: "var(--gap-md)" }}>
            <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--bl)", marginBottom: 4 }}>🏥 NHS Support Available</p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)" }}>
              For urgent medical concerns, call NHS 111 or your GP. For emergencies, call 999.
            </p>
          </WCard>
          
          {supportStaff.map((p, i) => (
            <WCard key={i} style={{ padding: "var(--card-p)" }}>
              <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "center" }}>
                <div style={{ 
                  width: "var(--icon-md)", 
                  height: "var(--icon-md)", 
                  flexShrink: 0, 
                  borderRadius: "var(--r)", 
                  background: p.available ? "var(--sgl)" : "var(--warm)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  fontSize: "var(--fs-xl)" 
                }}>
                  {p.videoReady ? "🩺" : "👩‍⚕️"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-1)" }}>{p.name}</p>
                  <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginBottom: "var(--sp-2)" }}>{p.spec}</p>
                  <div style={{ display: "flex", gap: "var(--gap-sm)", flexWrap: "wrap" }}>
                    <Tag 
                      label={p.status} 
                      bg={p.status === "Available" ? "var(--sgl)" : "var(--gdl)"} 
                      tc={p.status === "Available" ? "var(--sg)" : "var(--gd)"} 
                    />
                    <Tag label={p.lang} bg="var(--bll)" tc="var(--bl)" />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-sm)", flexShrink: 0 }}>
                  <button 
                    style={{ 
                      background: p.available ? "var(--dp)" : "var(--border)", 
                      color: p.available ? "#fff" : "var(--mt)", 
                      border: "none", 
                      borderRadius: 20, 
                      padding: "6px 14px", 
                      fontSize: "var(--fs-xs)", 
                      fontWeight: 800, 
                      cursor: p.available ? "pointer" : "not-allowed" 
                    }}
                    disabled={!p.available}
                  >
                    💬 Chat
                  </button>
                  {p.videoReady && (
                    <button 
                      style={{ 
                        background: p.available ? "var(--sg)" : "var(--border)", 
                        color: p.available ? "#fff" : "var(--mt)", 
                        border: "none", 
                        borderRadius: 20, 
                        padding: "6px 14px", 
                        fontSize: "var(--fs-xs)", 
                        fontWeight: 800, 
                        cursor: p.available ? "pointer" : "not-allowed" 
                      }}
                      disabled={!p.available}
                    >
                      📹 Video
                    </button>
                  )}
                </div>
              </div>
            </WCard>
          ))}
        </div>
      )}

      {/* Medical Records Tab */}
      {activeTab === "records" && (
        <div className="scroll-area" style={{ padding: "0 var(--pad-x) calc(var(--nav-h) + var(--sp-5))" }}>
          <WCard style={{ background: "var(--gdl)", marginBottom: "var(--gap-md)" }}>
            <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--gd)", marginBottom: 4 }}>🔒 Your Records Are Private</p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)" }}>
              All medical records are encrypted and stored securely. You can delete any record at any time.
            </p>
          </WCard>
          
          {records.map((r, i) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "var(--sp-4) 0", borderBottom: i < records.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div style={{ width: "var(--icon-sm)", height: "var(--icon-sm)", flexShrink: 0, borderRadius: "var(--r)", background: "var(--warm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-xl)" }}>{r.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: "var(--dp)" }}>{r.label}</p>
                <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>{r.date}</p>
              </div>
              <Tag 
                label={r.status} 
                bg={r.status === "Uploaded" ? "var(--sgl)" : r.status === "Auto-generated" ? "var(--bll)" : "var(--gdl)"} 
                tc={r.status === "Uploaded" ? "var(--sg)" : r.status === "Auto-generated" ? "var(--bl)" : "var(--gd)"} 
              />
              <button 
                onClick={() => {
                  if (confirm("Delete this record?")) {
                    const newRecords = records.filter(rec => rec.id !== r.id);
                    setRecords(newRecords);
                    localStorage.setItem('medicalRecords', JSON.stringify(newRecords));
                  }
                }}
                style={{ background: "none", border: "none", color: "var(--mt)", cursor: "pointer", fontSize: "var(--fs-lg)" }}
              >
                🗑️
              </button>
            </div>
          ))}
          
          <div style={{ display: "flex", gap: "var(--gap-md)", marginTop: "var(--sp-5)" }}>
            <button 
              className="btn-primary" 
              style={{ background: "var(--dp)", color: "#fff", flex: 1, cursor: "pointer", padding: "var(--sp-3)", borderRadius: "var(--r)", border: "none", fontWeight: 700 }}
              onClick={() => setShowUploadModal(true)}
            >
              + Upload Record
            </button>
            <button 
              className="btn-primary" 
              style={{ background: "var(--sg)", color: "#fff", flex: 1, cursor: "pointer", padding: "var(--sp-3)", borderRadius: "var(--r)", border: "none", fontWeight: 700 }}
              onClick={handleExportChat}
            >
              📤 Export All
            </button>
          </div>
        </div>
      )}

      {/* Offline Mode Tab */}
      {activeTab === "offline" && (
        <div className="scroll-area" style={{ padding: "var(--sp-4) var(--pad-x) calc(var(--nav-h) + var(--sp-5))" }}>
          <WCard style={{ background: "var(--sgl)", border: "1px solid var(--sgm)44" }}>
            <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--sg)", marginBottom: "var(--sp-2)" }}>📴 Offline AI Mode — Active</p>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.6 }}>On-device intelligence is active. Core features work without internet. Data syncs automatically when connected.</p>
          </WCard>
          
          {[
            "Emergency contacts stored locally",
            "Nigerian foods database: 340 foods",
            "Symptom checker available offline",
            "Kick counter works offline",
            "Medication reminders (local notifications)",
            "Last sync: Today 9:41 AM",
            "Storage used: 42 MB / 500 MB"
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "var(--gap-md)", alignItems: "center", padding: "var(--sp-3) 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--sg)", flexShrink: 0 }} />
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--dp)", fontWeight: 500 }}>{item}</p>
            </div>
          ))}
          
          <WCard style={{ marginTop: "var(--sp-4)", background: "var(--bll)" }}>
            <p style={{ fontWeight: 700, marginBottom: "var(--sp-1)" }}>🔄 Sync Status</p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)" }}>
              When you reconnect to the internet, your data will automatically sync to the cloud.
            </p>
            <button style={{ marginTop: "var(--sp-2)", background: "var(--bl)", color: "#fff", border: "none", borderRadius: 20, padding: "6px 16px", cursor: "pointer" }}>
              Sync Now
            </button>
          </WCard>
        </div>
      )}
      
      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.8)",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--pad-x)"
        }}>
          <div style={{
            background: "var(--card)",
            borderRadius: "var(--r2)",
            maxWidth: 400,
            width: "100%",
            padding: "var(--sp-5)"
          }}>
            <h3 style={{ fontSize: "var(--fs-lg)", fontWeight: 800, marginBottom: "var(--sp-3)" }}>Upload Medical Record</h3>
            <input
              type="file"
              accept=".pdf,.jpg,.png,.heic"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              style={{ marginBottom: "var(--sp-3)", width: "100%" }}
            />
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginBottom: "var(--sp-4)" }}>
              Supported formats: PDF, JPG, PNG. Max size: 10MB
            </p>
            <div style={{ display: "flex", gap: "var(--gap-md)" }}>
              <button 
                onClick={() => setShowUploadModal(false)}
                style={{ flex: 1, padding: "var(--sp-3)", background: "var(--warm)", border: "1px solid var(--border)", borderRadius: "var(--r)", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button 
                onClick={handleUpload}
                disabled={!selectedFile}
                style={{ 
                  flex: 1, 
                  padding: "var(--sp-3)", 
                  background: selectedFile ? "var(--dp)" : "var(--border)", 
                  color: selectedFile ? "#fff" : "var(--mt)", 
                  border: "none", 
                  borderRadius: "var(--r)", 
                  cursor: selectedFile ? "pointer" : "not-allowed" 
                }}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}