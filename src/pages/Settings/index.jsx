import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { WCard } from '../../components/ui';
import { useApp } from '../../context/useApp';
import { auth, db, storage } from '../../context/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import WeightGoalSetup from '../../components/WeightGoalSetup';
import { lsGet, lsSet, lsRemove } from '../../utils/storage';

const Toggle = ({ value, onChange, label, desc, color = "var(--sg)", disabled = false }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "var(--sp-4) 0", borderBottom: "1px solid var(--border)", opacity: disabled ? 0.5 : 1 }}>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: "var(--fs-base)", fontWeight: 700, color: "var(--dp)", marginBottom: 2 }}>{label}</p>
      {desc && <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>{desc}</p>}
    </div>
    <button 
      onClick={() => !disabled && onChange(!value)} 
      disabled={disabled}
      style={{
        width: "clamp(44px,11vw,54px)", 
        height: "clamp(24px,6vw,30px)",
        borderRadius: 30, 
        border: "none", 
        cursor: disabled ? "not-allowed" : "pointer",
        background: value ? color : "var(--border2)",
        position: "relative", 
        flexShrink: 0, 
        transition: "background 0.25s"
      }}
    >
      <div style={{
        position: "absolute", 
        top: "50%", 
        transform: "translateY(-50%)",
        left: value ? "calc(100% - clamp(22px,5.5vw,27px))" : "3px",
        width: "clamp(18px,4.5vw,24px)", 
        height: "clamp(18px,4.5vw,24px)",
        borderRadius: "50%", 
        background: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.18)", 
        transition: "left 0.25s"
      }} />
    </button>
  </div>
);

export default function Settings() {
  const navigate = useNavigate();
  const { 
    userName, 
    setUserName,
    journeyType, 
    culture,
    getCurrentWeek,
    getTrimester,
    subscriptionPlan,
    setSubscriptionPlan,
    clearUserData,
    notificationsEnabled,
    setNotificationsEnabled,
  } = useApp();
  
  // Local state - using safe storage
  const [lang, setLang] = useState(() => lsGet('appLanguage', "EN"));
  const [notifications, setNotifications] = useState(notificationsEnabled);
  const [darkMode, setDarkMode] = useState(() => lsGet('darkMode', false));
  const [kickAlerts, setKickAlerts] = useState(() => lsGet('kickAlerts', true));
  const [bpReminders, setBpReminders] = useState(() => lsGet('bpReminders', true));
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showWeightGoals, setShowWeightGoals] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  
  // Profile picture state - using safe storage
  const [profileImage, setProfileImage] = useState(() => lsGet('profileImage', null));
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(userName || '');
  const fileInputRef = useRef(null);
  
  // Load profile image from Firebase on mount
  useEffect(() => {
    const loadProfileImage = async () => {
      const user = auth.currentUser;
      if (user?.photoURL) {
        setProfileImage(user.photoURL);
        lsSet('profileImage', user.photoURL);
      } else {
        const saved = lsGet('profileImage', null);
        if (saved) setProfileImage(saved);
      }
    };
    loadProfileImage();
  }, []);
  
  // Apply dark mode to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.style.backgroundColor = '#1a1a2e';
    } else {
      document.body.classList.remove('dark-mode');
      document.body.style.backgroundColor = '';
    }
  }, [darkMode]);
  
  // Handle profile picture upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setImageError('Please upload an image file (JPEG, PNG, GIF)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image must be less than 5MB');
      return;
    }
    
    setUploading(true);
    setImageError(null);
    
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
      
      const storageRef = ref(storage, `profileImages/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      await updateProfile(user, { photoURL: downloadURL });
      
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { profileImage: downloadURL }, { merge: true });
      
      setProfileImage(downloadURL);
      lsSet('profileImage', downloadURL);
      
    } catch (err) {
      console.error('Upload error:', err);
      setImageError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  // Handle remove profile picture
  const handleRemoveImage = async () => {
    if (!window.confirm('Remove your profile picture?')) return;
    
    try {
      const user = auth.currentUser;
      if (user) {
        await updateProfile(user, { photoURL: null });
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { profileImage: null }, { merge: true });
      }
      setProfileImage(null);
      lsRemove('profileImage');
    } catch (err) {
      console.error('Remove error:', err);
      setImageError('Failed to remove image');
    }
  };
  
  // Handle save name
  const handleSaveName = async () => {
    if (!newName.trim()) return;
    
    try {
      const user = auth.currentUser;
      if (user) {
        await updateProfile(user, { displayName: newName });
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { displayName: newName }, { merge: true });
      }
      setUserName(newName);
      setEditingName(false);
    } catch (err) {
      console.error('Save name error:', err);
      setImageError('Failed to save name');
    }
  };
  
  // Get journey-specific display info
  const getJourneyDisplay = () => {
    switch(journeyType) {
      case 'pregnant': {
        const week = getCurrentWeek();
        const trimester = getTrimester();
        if (week && trimester) {
          return `Week ${week} · ${trimester}${trimester === 1 ? 'st' : trimester === 2 ? 'nd' : 'rd'} Trimester`;
        }
        return 'Pregnancy Journey';
      }
      case 'conceive': return 'Trying to Conceive';
      case 'ivf': return 'IVF & Fertility Treatment';
      case 'mom': {
        const days = lsGet('babyAgeDays', null);
        if (days && parseInt(days) < 42) return `Postpartum · Week ${Math.floor(parseInt(days) / 7)}`;
        return 'Postpartum & Nursing';
      }
      case 'menopause': return 'Menopause Support';
      default: return 'Health Journey';
    }
  };
  
  // Get initials for fallback avatar
  const getInitials = () => {
    if (userName) return userName.charAt(0).toUpperCase();
    const user = auth.currentUser;
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    return 'M';
  };
  
  // Save notification preferences
  const handleNotificationsChange = async (value) => {
    setNotifications(value);
    setNotificationsEnabled(value);
    lsSet('notificationsEnabled', value);
    
    if (value && 'Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
    
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { notificationsEnabled: value }, { merge: true });
    }
  };
  
  // Save kick alerts preference
  const handleKickAlertsChange = async (value) => {
    setKickAlerts(value);
    lsSet('kickAlerts', value);
    
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { kickAlerts: value }, { merge: true });
    }
  };
  
  // Save BP reminders preference
  const handleBpRemindersChange = async (value) => {
    setBpReminders(value);
    lsSet('bpReminders', value);
    
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { bpReminders: value }, { merge: true });
    }
  };
  
  // Save language preference
  const handleLanguageChange = async (newLang) => {
    setLang(newLang);
    lsSet('appLanguage', newLang);
    
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { language: newLang }, { merge: true });
    }
  };
  
  // Handle upgrade
  const handleUpgrade = async () => {
    setUpgrading(true);
    alert('Upgrade to Bloom for £6.99/month or Bloom+ for £12.99/month');
    setUpgrading(false);
  };
  
  // GDPR Data Export - using safe storage for all reads
  const handleExportData = async () => {
    setExporting(true);
    
    try {
      const user = auth.currentUser;
      const userId = user?.uid || 'anonymous';
      
      const userData = {
        exportDate: new Date().toISOString(),
        user: {
          uid: userId,
          email: user?.email,
          name: userName,
          journeyType: journeyType,
          culture: culture,
          subscriptionPlan: subscriptionPlan,
        },
        healthData: {
          vitals: lsGet('vitalsHistory', []),
          symptoms: lsGet('symptomsHistory', []),
          cycleData: {
            cycleLength: lsGet('cycleLength', null),
            periodLength: lsGet('periodLength', null),
            lastPeriodStart: lsGet('lastPeriodStart', null),
            cycleHistory: lsGet('cycleHistory', []),
          },
          pregnancyData: {
            edd: lsGet('edd', null),
            babyNumber: lsGet('babyNumber', null),
          },
          postpartumData: {
            babyBirthDate: lsGet('babyBirthDate', null),
            babyAgeDays: lsGet('babyAgeDays', null),
            feedingMethod: lsGet('feedingMethod', null),
          },
          intercourseLogs: lsGet('intercourseLog', []),
          lhLogs: lsGet('lhLogs', []),
          bbtLogs: lsGet('bbtLogs', []),
          nursingFeeds: lsGet('nursingFeedLog', []),
          nursingPump: lsGet('nursingPumpLog', []),
          nursingSleep: lsGet('nursingSleepLog', []),
          menopauseSymptoms: lsGet('menopauseSymptoms', {}),
          menopauseChecklist: lsGet('menopauseChecklist', []),
        },
        consents: lsGet('userConsents', {}),
        appPreferences: {
          language: lang,
          notificationsEnabled: notifications,
          kickAlerts: kickAlerts,
          bpReminders: bpReminders,
          darkMode: darkMode,
        },
        chatHistory: lsGet('chatHistory', []),
      };
      
      const dataStr = JSON.stringify(userData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `femin9_export_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      alert('✅ Your data has been exported successfully.');
    } catch (err) {
      console.error('Export error:', err);
      alert('❌ Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };
  
  // GDPR Account Deletion
  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    
    try {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { deleted: true, deletedAt: new Date().toISOString() });
        await user.delete();
      }
      
      clearUserData();
      localStorage.clear();
      sessionStorage.clear();
      
      navigate('/login');
    } catch (err) {
      console.error('Delete account error:', err);
      alert('Failed to delete account. Please sign in again and retry.');
    }
  };
  
  // Manage consents
  const handleManageConsents = () => {
    setShowPrivacyModal(true);
  };
  
  // Save consent preferences
  const saveConsents = (consents) => {
    lsSet('userConsents', consents);
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      setDoc(userRef, { consents }, { merge: true });
    }
  };
  
  return (
    <div className="page-pad">
      <div style={{ marginBottom: "var(--sp-5)" }}>
        <h2 className="serif" style={{ fontSize: "var(--fs-2xl)", fontWeight: 600, color: "var(--dp)", fontStyle: "italic", marginBottom: 4 }}>Settings</h2>
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)" }}>Manage your account and preferences</p>
      </div>

      {/* Profile Section with Picture Upload */}
      <WCard style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-3)" }}>Profile</p>
        
        <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-lg)", marginBottom: "var(--sp-4)" }}>
          <div style={{ position: "relative" }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: profileImage ? "transparent" : "linear-gradient(135deg, var(--t), var(--sg))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                color: "#fff",
                overflow: "hidden",
                cursor: "pointer",
                border: "3px solid var(--t)",
              }}
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                getInitials()
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "var(--t)",
                border: "2px solid #fff",
                color: "#fff",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              📷
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              style={{ display: "none" }}
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </div>
          
          <div style={{ flex: 1 }}>
            {editingName ? (
              <div style={{ display: "flex", gap: "var(--gap-sm)", alignItems: "center", flexWrap: "wrap" }}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{
                    fontSize: "var(--fs-lg)",
                    fontWeight: 800,
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r)",
                    padding: "var(--sp-1) var(--sp-2)",
                    background: "var(--warm)",
                    flex: 1
                  }}
                  autoFocus
                />
                <button onClick={handleSaveName} style={{ background: "var(--sg)", color: "#fff", border: "none", borderRadius: 20, padding: "6px 16px", cursor: "pointer" }}>Save</button>
                <button onClick={() => setEditingName(false)} style={{ background: "var(--warm)", border: "1px solid var(--border)", borderRadius: 20, padding: "6px 16px", cursor: "pointer" }}>Cancel</button>
              </div>
            ) : (
              <>
                <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)" }}>
                  {userName || 'Mama'}
                  <button onClick={() => setEditingName(true)} style={{ background: "none", border: "none", fontSize: 14, cursor: "pointer", marginLeft: 8 }}>✏️</button>
                </p>
                <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)" }}>{getJourneyDisplay()}</p>
                <p style={{ fontSize: "var(--fs-xs)", color: "var(--t)", fontWeight: 700, marginTop: 4 }}>
                  Cultural background: {culture?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not set'}
                </p>
              </>
            )}
          </div>
        </div>
        
        {profileImage && (
          <button onClick={handleRemoveImage} style={{ background: "none", border: "none", color: "var(--rd)", fontSize: "var(--fs-xs)", cursor: "pointer", textDecoration: "underline", marginBottom: "var(--sp-2)" }}>
            Remove profile picture
          </button>
        )}
        
        {imageError && <p style={{ color: "var(--rd)", fontSize: "var(--fs-xs)", marginTop: "var(--sp-2)" }}>{imageError}</p>}
        {uploading && <p style={{ color: "var(--sg)", fontSize: "var(--fs-xs)", marginTop: "var(--sp-2)" }}>Uploading...</p>}
        
        <button onClick={() => navigate('/onboarding')} style={{ width: "100%", marginTop: "var(--sp-3)", background: "var(--warm)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "var(--sp-2) var(--sp-3)", fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--md)", cursor: "pointer" }}>
          Edit Journey Settings →
        </button>
      </WCard>

      {/* Health Section with Weight Goals */}
      <WCard style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-3)" }}>Health</p>
        
        <button 
          onClick={() => setShowWeightGoals(true)} 
          style={{
            width: "100%",
            padding: "var(--sp-3)",
            background: "var(--lvl)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r)",
            fontSize: "var(--fs-sm)",
            fontWeight: 600,
            color: "var(--dp)",
            cursor: "pointer",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <span>⚖️ Weight Goals</span>
          <ChevronRight size={16} color="var(--mt)" />
        </button>
      </WCard>

      {/* Language Section */}
      <WCard style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-3)" }}>Language</p>
        <div style={{ display: "flex", gap: "var(--gap-sm)" }}>
          {["EN", "YO", "IG", "HA", "PID"].map(l => (
            <button key={l} onClick={() => handleLanguageChange(l)} style={{ flex: 1, textAlign: "center", padding: "var(--sp-2)", borderRadius: "var(--r)", background: lang === l ? "var(--t)" : "transparent", color: lang === l ? "#fff" : "var(--mt)", border: lang === l ? "none" : "1px solid var(--border)", cursor: "pointer" }}>
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
        <Toggle value={kickAlerts} onChange={handleKickAlertsChange} label="Kick Count Reminders" desc="Alert when kick session is due" color="var(--lv)" />
        <Toggle value={bpReminders} onChange={handleBpRemindersChange} label="BP Log Reminders" desc="Evening reminder to log blood pressure" color="var(--rd)" />
      </WCard>

      {/* Appearance Section */}
      <WCard style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-1)" }}>Appearance</p>
        <Toggle value={darkMode} onChange={setDarkMode} label="Dark Mode" desc="Dark theme for the app" color="var(--dp)" />
      </WCard>

      {/* Privacy Centre */}
      <WCard style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-3)" }}>Privacy Centre</p>
        
        <button onClick={handleManageConsents} style={{ width: "100%", padding: "var(--sp-3)", background: "var(--bll)", border: "1px solid var(--blm)", borderRadius: "var(--r)", fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--bl)", cursor: "pointer", marginBottom: "var(--sp-2)", textAlign: "left", display: "flex", alignItems: "center", gap: "var(--gap-sm)" }}>
          <span style={{ fontSize: 20 }}>📋</span>
          <div><p style={{ fontWeight: 700 }}>Manage Consent Settings</p><p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>Review and update your data processing preferences</p></div>
        </button>
        
        <button onClick={handleExportData} disabled={exporting} style={{ width: "100%", padding: "var(--sp-3)", background: "var(--sgl)", border: "1px solid var(--sgm)", borderRadius: "var(--r)", fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--sg)", cursor: exporting ? "not-allowed" : "pointer", marginBottom: "var(--sp-2)", textAlign: "left", display: "flex", alignItems: "center", gap: "var(--gap-sm)", opacity: exporting ? 0.6 : 1 }}>
          <span style={{ fontSize: 20 }}>📥</span>
          <div><p style={{ fontWeight: 700 }}>Download My Data (GDPR Right to Portability)</p><p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>Export all your health data in JSON format</p></div>
        </button>
        
        <button onClick={() => setShowDeleteConfirm(true)} style={{ width: "100%", padding: "var(--sp-3)", background: "var(--rdl)", border: "1px solid var(--rdm)", borderRadius: "var(--r)", fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--rd)", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "var(--gap-sm)" }}>
          <span style={{ fontSize: 20 }}>🗑️</span>
          <div><p style={{ fontWeight: 700 }}>Delete Account & All Data (Right to Erasure)</p><p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>Permanently remove all your personal data</p></div>
        </button>
      </WCard>

      {/* Subscription Section */}
      <WCard style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-3)" }}>Subscription</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: "var(--fs-md)" }}>{subscriptionPlan === 'free' ? 'Bloom Seed' : subscriptionPlan === 'bloom' ? 'Bloom' : 'Bloom+'}</p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>{subscriptionPlan === 'free' ? 'Free tier · 10 AI messages/day' : subscriptionPlan === 'bloom' ? '£6.99/month · 50 AI messages/day · PDF exports' : '£12.99/month · Unlimited AI messages · Priority support'}</p>
          </div>
          <button onClick={handleUpgrade} disabled={upgrading} style={{ background: "var(--dp)", color: "#fff", border: "none", borderRadius: "var(--r)", padding: "var(--sp-2) var(--sp-4)", cursor: upgrading ? "not-allowed" : "pointer", fontWeight: 600, opacity: upgrading ? 0.6 : 1 }}>{upgrading ? 'Processing...' : (subscriptionPlan === 'free' ? 'Upgrade' : 'Manage')}</button>
        </div>
      </WCard>

      {/* About Section */}
      <WCard style={{ marginBottom: "var(--gap-md)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-3)" }}>About</p>
        {[["Version","1.0.0 (Beta)"],["Region","UK + Nigeria"],["Data","Encrypted & GDPR Compliant"],["ICO Registration","Pending (Month 5)"],["Support","support@femin9.com"],["Privacy Policy","View Policy"],["Terms of Service","View Terms"]].map(([l,v]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "var(--sp-2) 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", fontWeight: 600 }}>{l}</span>
            {l === "Privacy Policy" || l === "Terms of Service" ? (
              <button onClick={() => window.open(`/${l.toLowerCase().replace(/ /g, '-')}.pdf`, '_blank')} style={{ background: "none", border: "none", color: "var(--t)", cursor: "pointer", fontSize: "var(--fs-sm)", fontWeight: 700 }}>{v}</button>
            ) : (
              <span style={{ fontSize: "var(--fs-sm)", color: "var(--dp)", fontWeight: 700 }}>{v}</span>
            )}
          </div>
        ))}
      </WCard>

      {/* Sign Out Button */}
      <button onClick={() => navigate('/login')} style={{ width: "100%", padding: "var(--sp-4)", background: "var(--rdl)", border: "1.5px solid var(--rdm)44", borderRadius: "var(--r2)", color: "var(--rd)", fontSize: "var(--fs-md)", fontWeight: 800, cursor: "pointer", minHeight: "var(--touch)" }}>Sign Out</button>

      {/* Weight Goals Modal */}
      {showWeightGoals && (
        <WeightGoalSetup onComplete={() => setShowWeightGoals(false)} onSkip={() => setShowWeightGoals(false)} />
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--pad-x)" }}>
          <div style={{ background: "var(--card)", borderRadius: "var(--r2)", maxWidth: 400, width: "100%", padding: "var(--sp-5)" }}>
            <div style={{ textAlign: "center", marginBottom: "var(--sp-4)" }}>
              <div style={{ fontSize: 48, marginBottom: "var(--sp-2)" }}>⚠️</div>
              <h3 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, color: "var(--rd)", marginBottom: "var(--sp-2)" }}>Delete Account?</h3>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", lineHeight: 1.5 }}>This action is <strong>permanent</strong> and cannot be undone. All your health data, logs, and personal information will be permanently erased.</p>
            </div>
            <div style={{ display: "flex", gap: "var(--gap-md)" }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: "var(--sp-3)", background: "var(--warm)", border: "1px solid var(--border)", borderRadius: "var(--r)", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
              <button onClick={handleDeleteAccount} style={{ flex: 1, padding: "var(--sp-3)", background: "var(--rd)", color: "#fff", border: "none", borderRadius: "var(--r)", cursor: "pointer", fontWeight: 600 }}>Yes, Delete Forever</button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Consent Modal */}
      {showPrivacyModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--pad-x)" }}>
          <div style={{ background: "var(--card)", borderRadius: "var(--r2)", maxWidth: 500, width: "100%", maxHeight: "80vh", overflowY: "auto", padding: "var(--sp-5)" }}>
            <div style={{ marginBottom: "var(--sp-4)" }}>
              <h3 style={{ fontSize: "var(--fs-lg)", fontWeight: 800, marginBottom: "var(--sp-2)" }}>Manage Consent</h3>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>You can change your consent preferences at any time.</p>
            </div>
            
            {[
              { id: "healthData", label: "Health Data Processing", desc: "Store and process my health data" },
              { id: "aiProcessing", label: "AI Processing", desc: "Allow AI to analyse my data" },
              { id: "analytics", label: "Anonymous Analytics", desc: "Share anonymous usage data" },
              { id: "marketing", label: "Marketing Communications", desc: "Receive tips and offers" }
            ].map(item => {
              const savedConsents = lsGet('userConsents', {});
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
                      const consents = lsGet('userConsents', {}); 
                      consents[item.id] = val; 
                      lsSet('userConsents', consents); 
                      saveConsents(consents); 
                    }} 
                    label="" 
                  />
                </div>
              );
            })}
            
            <button onClick={() => setShowPrivacyModal(false)} style={{ width: "100%", padding: "var(--sp-3)", background: "var(--dp)", color: "#fff", border: "none", borderRadius: "var(--r)", marginTop: "var(--sp-4)", cursor: "pointer", fontWeight: 600 }}>Save Preferences</button>
          </div>
        </div>
      )}
    </div>
  );
}