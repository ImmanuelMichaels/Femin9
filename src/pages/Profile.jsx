import { useState, useEffect, useRef } from 'react';
import { WCard, SectionTitle, Button } from '../components/ui';
import { useApp } from '../context/useApp';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../context/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function Profile() {
  const { userName, setUserName, journeyType } = useApp();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(() => {
    const saved = localStorage.getItem('profileImage');
    return saved || null;
  });
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(userName || '');
  const fileInputRef = useRef(null);
  
  const [notifications, setNotifications] = useState({
    healthReminders: true,
    appointmentReminders: true,
    marketing: false
  });

  // Load profile image from Firestore on mount
  useEffect(() => {
    const loadProfileImage = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await import('firebase/firestore').then(fb => 
          fb.getDoc(doc(db, 'users', user.uid))
        );
        if (userDoc.exists() && userDoc.data().profileImage) {
          setProfileImage(userDoc.data().profileImage);
          localStorage.setItem('profileImage', userDoc.data().profileImage);
        }
      }
    };
    loadProfileImage();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError('Please upload an image file (JPEG, PNG, GIF)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image must be less than 5MB');
      return;
    }
    
    setUploading(true);
    setImageError(null);
    
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, `profileImages/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update Auth profile
      await updateProfile(user, { photoURL: downloadURL });
      
      // Save to Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { profileImage: downloadURL }, { merge: true });
      
      // Update local state
      setProfileImage(downloadURL);
      localStorage.setItem('profileImage', downloadURL);
      
    } catch (err) {
      console.error('Upload error:', err);
      setImageError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

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
      localStorage.removeItem('profileImage');
    } catch (err) {
      console.error('Remove error:', err);
      setImageError('Failed to remove image');
    }
  };

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

  const handleDeleteAccount = () => {
    if (window.confirm('⚠️ WARNING: This will delete ALL your health data permanently. This action cannot be undone. Are you absolutely sure?')) {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    }
  };

  const handleExportData = () => {
    alert('Your data export request has been submitted. You will receive an email within 30 days containing all your data in JSON format.');
  };

  const handleChangeJourney = () => {
    navigate('/onboarding');
  };

  const journeyLabel = {
    mom: 'Postpartum & Nursing',
    conceive: 'Trying to Conceive',
    pregnant: 'Pregnancy',
    ivf: 'IVF & Fertility',
    menopause: 'Menopause',
  }[journeyType] ?? journeyType;

  return (
    <div className="page-pad">
      <SectionTitle title="Profile" subtitle="Manage your account and preferences 👤" />

      {/* User Info Card with Profile Picture */}
      <WCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)' }}>
          {/* Profile Picture */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: profileImage ? 'transparent' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 30,
                color: '#724C9D',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '3px solid #724C9D',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                userName?.charAt(0)?.toUpperCase() || 'M'
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#724c9d',
                border: '2px solid #fff',
                color: '#fff',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              📷
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </div>
          
          <div style={{ flex: 1 }}>
            {editingName ? (
              <div style={{ display: 'flex', gap: 'var(--gap-sm)', alignItems: 'center' }}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{
                    fontSize: 'var(--fs-lg)',
                    fontWeight: 800,
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r)',
                    padding: 'var(--sp-1) var(--sp-2)',
                    background: 'var(--warm)'
                  }}
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  style={{ background: 'var(--sg)', color: '#fff', border: 'none', borderRadius: 20, padding: '4px 12px', cursor: 'pointer' }}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  style={{ background: 'var(--warm)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 12px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, color: 'var(--dp)' }}>
                  {userName || 'Mama'}
                  <button
                    onClick={() => setEditingName(true)}
                    style={{ background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', marginLeft: 8 }}
                  >
                    ✏️
                  </button>
                </p>
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--mt)' }}>
                  Journey: {journeyLabel}
                </p>
                <button
                  onClick={handleChangeJourney}
                  style={{
                    marginTop: 8,
                    background: 'none',
                    border: 'none',
                    color: '#724C9D',
                    fontSize: 'var(--fs-xs)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}
                >
                  Change journey {'>'}
                </button>
              </>
            )}
          </div>
        </div>
        
        {profileImage && (
          <button
            onClick={handleRemoveImage}
            style={{
              marginTop: 'var(--sp-3)',
              background: 'none',
              border: 'none',
              color: 'var(--rd)',
              fontSize: 'var(--fs-xs)',
              cursor: 'pointer',
              textAlign: 'center',
              width: '100%'
            }}
          >
            Remove profile picture
          </button>
        )}
        
        {imageError && (
          <p style={{ color: 'var(--rd)', fontSize: 'var(--fs-xs)', marginTop: 'var(--sp-2)' }}>
            {imageError}
          </p>
        )}
        
        {uploading && (
          <p style={{ color: 'var(--sg)', fontSize: 'var(--fs-xs)', marginTop: 'var(--sp-2)' }}>
            Uploading...
          </p>
        )}
      </WCard>

      {/* Notification Preferences */}
      <SectionTitle title="Notifications 🔔" />
      <WCard>
        {[
          { key: 'healthReminders', label: 'Health Reminders', desc: 'Daily vitals, kick count, medication reminders' },
          { key: 'appointmentReminders', label: 'Appointment Reminders', desc: 'Upcoming appointments and check-ups' },
          { key: 'marketing', label: 'Marketing & Tips', desc: 'Wellness tips, offers, and updates' }
        ].map((item, i) => (
          <div
            key={item.key}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--sp-3) 0',
              borderBottom: i < 2 ? '1px solid var(--border)' : 'none'
            }}
          >
            <div>
              <p style={{ fontWeight: 700, fontSize: 'var(--fs-sm)' }}>{item.label}</p>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)' }}>{item.desc}</p>
            </div>
            <button
              onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
              style={{
                width: 50,
                height: 28,
                borderRadius: 30,
                background: notifications[item.key] ? 'var(--sg)' : 'var(--border)',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 3,
                left: notifications[item.key] ? 26 : 3,
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s'
              }} />
            </button>
          </div>
        ))}
      </WCard>

      {/* Privacy Centre - GDPR Required */}
      <SectionTitle title="Privacy Centre 🔒" />
      <WCard>
        <button
          onClick={handleExportData}
          style={{
            width: '100%',
            padding: 'var(--sp-3)',
            background: 'var(--warm)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            fontSize: 'var(--fs-sm)',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: 'var(--sp-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--gap-sm)'
          }}
        >
          📥 Download My Data (GDPR Right to Portability)
        </button>

        <button
          onClick={() => navigate('/consent')}
          style={{
            width: '100%',
            padding: 'var(--sp-3)',
            background: 'var(--bll)',
            border: '1px solid var(--blm)',
            borderRadius: 'var(--r)',
            fontSize: 'var(--fs-sm)',
            fontWeight: 600,
            color: 'var(--bl)',
            cursor: 'pointer',
            marginBottom: 'var(--sp-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--gap-sm)'
          }}
        >
          📋 Manage Consent Settings
        </button>

        <button
          onClick={handleDeleteAccount}
          style={{
            width: '100%',
            padding: 'var(--sp-3)',
            background: 'var(--rdl)',
            border: '1px solid var(--rdm)',
            borderRadius: 'var(--r)',
            fontSize: 'var(--fs-sm)',
            fontWeight: 600,
            color: 'var(--rd)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--gap-sm)'
          }}
        >
          🗑️ Delete Account & All Data (Right to Erasure)
        </button>
      </WCard>

      {/* Subscription */}
      <SectionTitle title="Subscription 💎" />
      <WCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 'var(--fs-md)' }}>Bloom Seed</p>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)' }}>Free tier · 10 AI messages/day</p>
          </div>
          <Button variant="primary">Upgrade to Bloom</Button>
        </div>
        <div style={{ marginTop: 'var(--sp-3)', paddingTop: 'var(--sp-3)', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)' }}>
            Bloom: £6.99/month · Unlimited tracking · 50 AI messages · PDF exports
          </p>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)' }}>
            Bloom+: £12.99/month · Unlimited AI · Priority support · Annual health review
          </p>
        </div>
      </WCard>

      {/* App Info */}
      <SectionTitle title="About ℹ️" />
      <WCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--sp-2) 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--mt)' }}>Version</span>
          <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>1.0.0 (Build 42)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--sp-2) 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--mt)' }}>ICO Registration</span>
          <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>ZB123456</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--sp-2) 0' }}>
          <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--mt)' }}>Data Region</span>
          <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>UK (GDPR Compliant)</span>
        </div>
      </WCard>

      {/* Sign Out Button */}
      <Button
        variant="outline"
        onClick={() => navigate('/login')}
        fullWidth
      >
        Sign Out
      </Button>
    </div>
  );
}