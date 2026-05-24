import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WCard } from '../../components/ui';
import { useApp } from '../../context/useApp';

const Toggle = ({ value, onChange, label, desc, color = "var(--sg)" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "var(--sp-4) 0", borderBottom: "1px solid var(--border)" }}>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: "var(--fs-base)", fontWeight: 700, color: "var(--dp)", marginBottom: 2 }}>{label}</p>
      {desc && <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>{desc}</p>}
    </div>
    <button onClick={() => onChange(!value)} style={{
      width: "clamp(44px,11vw,54px)", height: "clamp(24px,6vw,30px)",
      borderRadius: 30, border: "none", cursor: "pointer",
      background: value ? color : "var(--border2)",
      position: "relative", flexShrink: 0, transition: "background 0.25s"
    }}>
      <div style={{
        position: "absolute", top: "50%", transform: "translateY(-50%)",
        left: value ? "calc(100% - clamp(22px,5.5vw,27px))" : "3px",
        width: "clamp(18px,4.5vw,24px)", height: "clamp(18px,4.5vw,24px)",
        borderRadius: "50%", background: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.18)", transition: "left 0.25s"
      }} />
    </button>
  </div>
);

export default function Settings() {
  const navigate = useNavigate();
  const { 
    userName, 
    journeyType, 
    culture,
    getCurrentWeek,
    getTrimester,
    subscriptionPlan,
    clearUserData,
    notificationsEnabled,
    setNotificationsEnabled
  } = useApp();
  
  // Local state
  const [lang, setLang] = useState(() => localStorage.getItem('appLanguage') || "EN");
  const [notifications, setNotifications] = useState(notificationsEnabled);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [kickAlerts, setKickAlerts] = useState(() => localStorage.getItem('kickAlerts') !== 'false');
  const [bpReminders, setBpReminders] = useState(() => localStorage.getItem('bpReminders') !== 'false');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Get journey-specific display info
  const getJourneyDisplay = () => {
    switch(journeyType) {
      case 'pregnant': {
        const week = getCurrentWeek();
        const trimester = getTrimester();
        return `Week ${week} · ${trimester}${trimester === 1 ? 'st' : trimester === 2 ? 'nd' : 'rd'} Trimester`;
      }
      case 'conceive': {
        return 'Trying to Conceive';
      }
      case 'ivf': {
        return 'IVF & Fertility Treatment';
      }
      case 'mom': {
        const days = localStorage.getItem('babyAgeDays');
        if (days && parseInt(days) < 42) return `Postpartum · Week ${Math.floor(parseInt(days) / 7)}`;
        return 'Postpartum & Nursing';
      }
      case 'menopause': {
        return 'Menopause Support';
      }
      default: {
        return 'Health Journey';
      }
    }
  };
  
  // Save notification preferences
  const handleNotificationsChange = (value) => {
    setNotifications(value);
    setNotificationsEnabled(value);
    localStorage.setItem('notificationsEnabled', value);
  };
  
  // Save language preference
  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem('appLanguage', newLang);
    // In a real app, you'd trigger i18n change here
  };
  
  // GDPR Data Export (Right to Portability)
  const handleExportData = async () => {
    setExporting(true);
    
    // Collect all user data
    const userData = {
      exportDate: new Date().toISOString(),
      user: {
        name: userName,
        journeyType: journeyType,
        culture: culture,
        subscriptionPlan: subscriptionPlan,
      },
      healthData: {
        vitals: JSON.parse(localStorage.getItem('vitalsHistory') || '[]'),
        symptoms: JSON.parse(localStorage.getItem('symptomsHistory') || '[]'),
        cycleData: {
          cycleLength: localStorage.getItem('cycleLength'),
          periodLength: localStorage.getItem('periodLength'),
          lastPeriodStart: localStorage.getItem('lastPeriodStart'),
          cycleHistory: JSON.parse(localStorage.getItem('cycleHistory') || '[]'),
        },
        pregnancyData: {
          edd: localStorage.getItem('edd'),
          babyNumber: localStorage.getItem('babyNumber'),
        },
        postpartumData: {
          babyBirthDate: localStorage.getItem('babyBirthDate'),
          babyAgeDays: localStorage.getItem('babyAgeDays'),
          feedingMethod: localStorage.getItem('feedingMethod'),
        },
        intercourseLogs: JSON.parse(localStorage.getItem('intercourseLog') || '[]'),
        lhLogs: JSON.parse(localStorage.getItem('lhLogs') || '[]'),
        bbtLogs: JSON.parse(localStorage.getItem('bbtLogs') || '[]'),
      },
      consents: JSON.parse(localStorage.getItem('userConsents') || '{}'),
      appPreferences: {
        language: lang,
        notificationsEnabled: notifications,
        kickAlerts: kickAlerts,
        bpReminders: bpReminders,
        darkMode: darkMode,
      }
    };
    
    // Create JSON file and download
    const dataStr = JSON.stringify(userData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `femin9_export_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setExporting(false);
    
    // Show success message
    alert('Your data has been exported successfully. The file has been downloaded.');
  };
  
  // GDPR Account Deletion (Right to Erasure)
  const handleDeleteAccount = () => {
    clearUserData();
    navigate('/login');
  };
  
  // Manage consents
  const handleManageConsents = () => {
    setShowPrivacyModal(true);
  };
  
  // Get journey icon
  const getJourneyIcon = () => {
    switch(journeyType) {
      case 'pregnant': return '🤰';
      case 'conceive': return '🌸';
      case 'ivf': return '💜';
      case 'mom': return '🍼';
      case 'menopause': return '🦋';
      default: return '👩';
    }
  };
  
  return (
    <div className="page-pad">
      <div style={{ marginBottom: "var(--sp-5)" }}>
        <h2 className="serif" style={{ fontSize: "var(--fs-2xl)", fontWeight: 600, color: "var(--dp)", fontStyle: "italic", marginBottom: 4 }}>Settings</h2>
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)" }}>Manage your account and preferences</p>
      </div>

      {/* Profile Section - Connected to AppContext */}
      <WCard style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-3)" }}>Profile</p>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-lg)" }}>
          <div style={{ width: "var(--icon-lg)", height: "var(--icon-lg)", borderRadius: "50%", background: "linear-gradient(145deg,#FDE8DB,#E8F5EC)", border: "2.5px solid var(--t)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(24px,6vw,32px)", flexShrink: 0 }}>
            {getJourneyIcon()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)", marginBottom: 2 }}>{userName || 'Mama'}</p>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)" }}>{getJourneyDisplay()}</p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--t)", fontWeight: 700, marginTop: 4 }}>Cultural background: {culture?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not set'}</p>
          </div>
          <button 
            onClick={() => navigate('/onboarding')}
            style={{ background: "var(--warm)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "var(--sp-2) var(--sp-3)", fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--md)", cursor: "pointer" }}
          >
            Edit
          </button>
        </div>
      </WCard>

      {/* Language Section */}
      <WCard style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-3)" }}>Language</p>
        <div className="lang-switch" style={{ width: "100%", justifyContent: "space-between", display: "flex", gap: "var(--gap-sm)" }}>
          {["EN", "YO", "IG", "HA", "PID"].map(l => (
            <button 
              key={l} 
              onClick={() => handleLanguageChange(l)} 
              className="lang-btn" 
              style={{ 
                flex: 1, 
                textAlign: "center", 
                padding: "var(--sp-2)",
                borderRadius: "var(--r)",
                background: lang === l ? "var(--t)" : "transparent", 
                color: lang === l ? "#fff" : "var(--mt)",
                border: lang === l ? "none" : "1px solid var(--border)",
                cursor: "pointer"
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginTop: "var(--sp-2)" }}>
          {lang === "EN" ? "English" : lang === "YO" ? "Yorùbá" : lang === "IG" ? "Igbo" : lang === "HA" ? "Hausa" : "Nigerian Pidgin"}
        </p>
      </WCard>

      {/* Notifications Section */}
      <WCard style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-1)" }}>Notifications</p>
        <Toggle value={notifications} onChange={handleNotificationsChange} label="Push Notifications" desc="Daily wellness reminders and alerts" color="var(--sg)" />
        <Toggle value={kickAlerts} onChange={setKickAlerts} label="Kick Count Reminders" desc="Alert when kick session is due" color="var(--lv)" />
        <Toggle value={bpReminders} onChange={setBpReminders} label="BP Log Reminders" desc="Evening reminder to log blood pressure" color="var(--rd)" />
      </WCard>

      {/* Appearance Section */}
      <WCard style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-1)" }}>Appearance</p>
        <Toggle value={darkMode} onChange={setDarkMode} label="Dark Mode" desc="Coming soon — save your eyes at night" color="var(--dp)" />
      </WCard>

      {/* Privacy Centre - GDPR Required */}
      <WCard style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-3)" }}>Privacy Centre</p>
        
        <button 
          onClick={handleManageConsents}
          style={{
            width: "100%",
            padding: "var(--sp-3)",
            background: "var(--bll)",
            border: "1px solid var(--blm)",
            borderRadius: "var(--r)",
            fontSize: "var(--fs-sm)",
            fontWeight: 600,
            color: "var(--bl)",
            cursor: "pointer",
            marginBottom: "var(--sp-2)",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: "var(--gap-sm)"
          }}
        >
          <span style={{ fontSize: 20 }}>📋</span>
          <div>
            <p style={{ fontWeight: 700 }}>Manage Consent Settings</p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>Review and update your data processing preferences</p>
          </div>
        </button>
        
        <button 
          onClick={handleExportData}
          disabled={exporting}
          style={{
            width: "100%",
            padding: "var(--sp-3)",
            background: "var(--sgl)",
            border: "1px solid var(--sgm)",
            borderRadius: "var(--r)",
            fontSize: "var(--fs-sm)",
            fontWeight: 600,
            color: "var(--sg)",
            cursor: exporting ? "not-allowed" : "pointer",
            marginBottom: "var(--sp-2)",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: "var(--gap-sm)",
            opacity: exporting ? 0.6 : 1
          }}
        >
          <span style={{ fontSize: 20 }}>📥</span>
          <div>
            <p style={{ fontWeight: 700 }}>Download My Data (GDPR Right to Portability)</p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>Export all your health data in JSON format</p>
          </div>
        </button>
        
        <button 
          onClick={() => setShowDeleteConfirm(true)}
          style={{
            width: "100%",
            padding: "var(--sp-3)",
            background: "var(--rdl)",
            border: "1px solid var(--rdm)",
            borderRadius: "var(--r)",
            fontSize: "var(--fs-sm)",
            fontWeight: 600,
            color: "var(--rd)",
            cursor: "pointer",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: "var(--gap-sm)"
          }}
        >
          <span style={{ fontSize: 20 }}>🗑️</span>
          <div>
            <p style={{ fontWeight: 700 }}>Delete Account & All Data (Right to Erasure)</p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>Permanently remove all your personal data</p>
          </div>
        </button>
      </WCard>

      {/* Subscription Section */}
      <WCard style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-3)" }}>Subscription</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: "var(--fs-md)" }}>
              {subscriptionPlan === 'free' ? 'Bloom Seed' : subscriptionPlan === 'bloom' ? 'Bloom' : 'Bloom+'}
            </p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>
              {subscriptionPlan === 'free' ? 'Free tier · 10 AI messages/day' : 
               subscriptionPlan === 'bloom' ? '£6.99/month · 50 AI messages/day' : 
               '£12.99/month · Unlimited AI messages'}
            </p>
          </div>
          <button style={{ 
            background: "var(--dp)", 
            color: "#fff", 
            border: "none", 
            borderRadius: "var(--r)", 
            padding: "var(--sp-2) var(--sp-4)", 
            cursor: "pointer",
            fontWeight: 600
          }}>
            {subscriptionPlan === 'free' ? 'Upgrade' : 'Manage'}
          </button>
        </div>
      </WCard>

      {/* About Section */}
      <WCard style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-3)" }}>About</p>
        {[
          ["Version","1.0.0 (Beta)"],
          ["Region","Nigeria + UK"],
          ["Data","Stored securely on-device"],
          ["ICO Registration","ZB123456"],
          ["Support","support@mamabloom.app"],
          ["Privacy Policy","View Policy"],
          ["Terms of Service","View Terms"]
        ].map(([l,v]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "var(--sp-2) 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", fontWeight: 600 }}>{l}</span>
            {l === "Privacy Policy" || l === "Terms of Service" ? (
              <button 
                onClick={() => window.open(`/${l.toLowerCase().replace(/ /g, '-')}.pdf`, '_blank')}
                style={{ background: "none", border: "none", color: "var(--t)", cursor: "pointer", fontSize: "var(--fs-sm)", fontWeight: 700 }}
              >
                {v}
              </button>
            ) : (
              <span style={{ fontSize: "var(--fs-sm)", color: "var(--dp)", fontWeight: 700 }}>{v}</span>
            )}
          </div>
        ))}
      </WCard>

      {/* Sign Out Button */}
      <button 
        onClick={() => navigate('/login')}
        style={{ 
          width: "100%", 
          padding: "var(--sp-4)", 
          background: "var(--rdl)", 
          border: "1.5px solid var(--rdm)44", 
          borderRadius: "var(--r2)", 
          color: "var(--rd)", 
          fontSize: "var(--fs-md)", 
          fontWeight: 800, 
          cursor: "pointer", 
          minHeight: "var(--touch)" 
        }}
      >
        Sign Out
      </button>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
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
            <div style={{ textAlign: "center", marginBottom: "var(--sp-4)" }}>
              <div style={{ fontSize: 48, marginBottom: "var(--sp-2)" }}>⚠️</div>
              <h3 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, color: "var(--rd)", marginBottom: "var(--sp-2)" }}>
                Delete Account?
              </h3>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", lineHeight: 1.5 }}>
                This action is <strong>permanent</strong> and cannot be undone. 
                All your health data, logs, and personal information will be permanently erased.
              </p>
            </div>
            <div style={{ display: "flex", gap: "var(--gap-md)" }}>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  padding: "var(--sp-3)",
                  background: "var(--warm)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r)",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                style={{
                  flex: 1,
                  padding: "var(--sp-3)",
                  background: "var(--rd)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--r)",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                Yes, Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Consent Modal */}
      {showPrivacyModal && (
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
            maxWidth: 500,
            width: "100%",
            maxHeight: "80vh",
            overflowY: "auto",
            padding: "var(--sp-5)"
          }}>
            <div style={{ marginBottom: "var(--sp-4)" }}>
              <h3 style={{ fontSize: "var(--fs-lg)", fontWeight: 800, marginBottom: "var(--sp-2)" }}>Manage Consent</h3>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>
                You can change your consent preferences at any time.
              </p>
            </div>
            
            {[
              { id: "healthData", label: "Health Data Processing", desc: "Store and process my health data" },
              { id: "aiProcessing", label: "AI Processing", desc: "Allow AI to analyse my data" },
              { id: "analytics", label: "Anonymous Analytics", desc: "Share anonymous usage data" },
              { id: "marketing", label: "Marketing Communications", desc: "Receive tips and offers" }
            ].map(item => {
              const savedConsents = JSON.parse(localStorage.getItem('userConsents') || '{}');
              const isChecked = savedConsents[item.id];
              return (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--sp-3) 0", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <p style={{ fontWeight: 700 }}>{item.label}</p>
                    <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>{item.desc}</p>
                  </div>
                  <Toggle 
                    value={isChecked} 
                    onChange={(val) => {
                      const consents = JSON.parse(localStorage.getItem('userConsents') || '{}');
                      consents[item.id] = val;
                      localStorage.setItem('userConsents', JSON.stringify(consents));
                    }} 
                    label="" 
                  />
                </div>
              );
            })}
            
            <button 
              onClick={() => setShowPrivacyModal(false)}
              style={{
                width: "100%",
                padding: "var(--sp-3)",
                background: "var(--dp)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--r)",
                marginTop: "var(--sp-4)",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}