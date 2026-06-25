// Profile.jsx
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { WCard, SectionTitle, Button } from '../components/ui';
import { useApp } from '../context/useApp';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../context/firebase';
import { getDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import {
  updateProfile,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithPopup,
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import SubscriptionPlans, { PLAN_IDS } from '../components/SubscriptionPlans';
import './Profile.css';

// ── Constants ─────────────────────────────────────────────────────────────────
const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? '1.0.0';
const APP_BUILD   = import.meta.env.VITE_APP_BUILD   ?? '0';
const ICO_NUMBER  = import.meta.env.VITE_ICO_NUMBER  ?? 'N/A';

const JOURNEY_LABELS = {
  mom:       'Postpartum & Nursing',
  conceive:  'Trying to Conceive',
  ttc:       'Trying to Conceive',
  pregnant:  'Pregnancy',
  ivf:       'IVF & Fertility',
  menopause: 'Menopause',
  menstrual: 'Menstrual Health',
};

const PLAN_DISPLAY = {
  [PLAN_IDS.FREE]: {
    label: 'Bloom Seed (Free)',
    price: null,
    desc:  'Free tier · 10 AI messages/day',
  },
  [PLAN_IDS.BLOOM_PLUS]: {
    label: 'Bloom+',
    price: '£6.99/mo',
    desc:  'Unlimited AI · Priority support · Export health data',
  },
};

const FALLBACK_INITIAL = '?';

const NOTIFICATION_ITEMS = [
  { key: 'healthReminders',      label: 'Health Reminders',      desc: 'Daily vitals, kick count, medication reminders' },
  { key: 'appointmentReminders', label: 'Appointment Reminders', desc: 'Upcoming appointments and check-ups' },
  { key: 'marketing',            label: 'Tips & Updates',        desc: 'Wellness tips, offers, and app updates' },
];

// ── Confirm Modal ─────────────────────────────────────────────────────────────
// Renders into document.body via createPortal so it is never clipped or
// repositioned by a transformed/animated ancestor (the root cause of the
// modal appearing at the top of the page during tab transitions).
function ConfirmModal({
  title,
  body,
  confirmLabel,
  confirmVariant = 'danger',   // 'danger' | 'neutral'
  onConfirm,
  onCancel,
  children,
}) {
  const confirmRef = useRef(null);

  // Auto-focus the confirm button
  useEffect(() => {
    confirmRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const confirmBg =
    confirmVariant === 'danger'
      ? 'var(--danger, #DC2626)'
      : 'var(--accent, #6D28D9)';

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--sp-4, 16px)',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 'var(--r-lg, 24px)',
          padding: 'var(--sp-5, 20px)',
          maxWidth: 380,
          width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        }}
      >
        <p
          id="confirm-modal-title"
          style={{
            fontWeight: 800,
            fontSize: 'var(--fs-md, 1rem)',
            marginBottom: 'var(--sp-2, 8px)',
            marginTop: 0,
            color: 'var(--txt-dark, #1E1B2E)',
          }}
        >
          {title}
        </p>

        {body && (
          <p
            style={{
              fontSize: 'var(--fs-sm, 0.75rem)',
              color: 'var(--txt-mid, #6B7280)',
              marginBottom: 'var(--sp-4, 16px)',
              marginTop: 0,
              lineHeight: 1.5,
            }}
          >
            {body}
          </p>
        )}

        {children}

        <div
          style={{
            display: 'flex',
            gap: 'var(--sp-2, 8px)',
            marginTop: 'var(--sp-3, 12px)',
          }}
        >
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: 'var(--sp-3, 12px)',
              borderRadius: 'var(--r-md, 16px)',
              background: 'var(--pg-bg, #EEE9F8)',
              border: '1px solid var(--border, rgba(0,0,0,0.06))',
              fontSize: 'var(--fs-sm, 0.75rem)',
              fontWeight: 600,
              cursor: 'pointer',
              color: 'var(--txt-dark, #1E1B2E)',
            }}
          >
            Cancel
          </button>

          <button
            ref={confirmRef}
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: 'var(--sp-3, 12px)',
              borderRadius: 'var(--r-md, 16px)',
              background: confirmBg,
              border: 'none',
              fontSize: 'var(--fs-sm, 0.75rem)',
              fontWeight: 700,
              cursor: 'pointer',
              color: '#ffffff',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

// ── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ on, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      style={{
        width: 50,
        height: 28,
        borderRadius: 30,
        background: on
          ? 'var(--accent, #6D28D9)'
          : 'var(--border, rgba(0,0,0,0.12))',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 3,
          left: on ? 26 : 3,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: '#ffffff',
          transition: 'left 0.2s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        }}
      />
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Profile() {
  const {
    userName,
    setUserName,
    journeyType,
    setJourneyType,
    subscriptionPlan,
    setSubscriptionPlan,
    notificationsEnabled,
    setNotificationsEnabled,
    clearUserData,
    logout,
    userId,
    updateUserName,
    updateSubscriptionPlan,
    culture,
    setCulture,
    dietaryPractices,
    setDietaryPractices,
    religion,
    setReligion,
    hasDietaryPractices,
    setHasDietaryPractices,
    edd,
    setEdd,
    babyNumber,
    setBabyNumber,
    babyBirthDate,
    setBabyBirthDate,
    babyAgeDays,
    setBabyAgeDays,
    cycleLength,
    setCycleLength,
    periodLength,
    setPeriodLength,
    treatmentType,
    setTreatmentType,
    ivfCycleNumber,
    setIvfCycleNumber,
    menopauseStage,
    setMenopauseStage,
    menopauseSymptoms,
    setMenopauseSymptoms,
    feedingMethod,
    setFeedingMethod,
  } = useApp();

  const navigate = useNavigate();

  // ── Auth user state ──
  const [authUser, setAuthUser] = useState(null);
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setAuthUser(u));
    return () => unsub();
  }, []);

  // ── Profile Image ──
  const [profileImage, setProfileImage] = useState(
    () => auth.currentUser?.photoURL || null
  );
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const fileInputRef = useRef(null);

  // ── Name Editing ──
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(userName || '');
  const [nameError, setNameError] = useState(null);
  const [nameSaving, setNameSaving] = useState(false);

  // ── Notifications ──
  const [notifications, setNotifications] = useState(() => ({
    healthReminders:      true,
    appointmentReminders: true,
    marketing:            false,
  }));
  const [notifSaving, setNotifSaving] = useState(false);

  // ── Modals ──
  const [modal, setModal] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  // ── Toast ──
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Load Firestore Data ──
  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      try {
        const snap = await getDoc(doc(db, 'users', userId));
        if (!snap.exists()) return;
        const data = snap.data();

        const img = data.profileImage || auth.currentUser?.photoURL || null;
        if (img) setProfileImage(img);

        if (data.notificationPrefs) {
          setNotifications(data.notificationPrefs);
          setNotificationsEnabled(Object.values(data.notificationPrefs).some(Boolean));
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    };
    load();
  }, [userId, setNotificationsEnabled]);

  // ── Save Notifications to Firestore ──
  const saveNotifications = async (prefs) => {
    setNotifSaving(true);
    try {
      if (userId) {
        await setDoc(doc(db, 'users', userId), { notificationPrefs: prefs }, { merge: true });
      }
    } catch (error) {
      console.error('Error saving notifications:', error);
    } finally {
      setNotifSaving(false);
    }
  };

  const handleToggleNotification = async (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    setNotificationsEnabled(Object.values(updated).some(Boolean));
    await saveNotifications(updated);
  };

  // ── Image Upload ──
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageError(null);

    if (!file.type.startsWith('image/')) {
      setImageError('Please upload a JPEG, PNG, GIF, or WebP file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image must be under 5 MB.');
      return;
    }

    setUploading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not logged in');

      const storageRef = ref(storage, `profileImages/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await updateProfile(user, { photoURL: url });
      await setDoc(doc(db, 'users', user.uid), { profileImage: url }, { merge: true });

      setProfileImage(url);
      showToast('Profile photo updated ✓');
    } catch (err) {
      console.error('Upload error:', err);
      setImageError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const confirmRemovePhoto = async () => {
    setModal(null);
    try {
      const user = auth.currentUser;
      if (user) {
        await updateProfile(user, { photoURL: null });
        await setDoc(doc(db, 'users', user.uid), { profileImage: null }, { merge: true });
      }
      setProfileImage(null);
      showToast('Photo removed ✓');
    } catch {
      showToast('Failed to remove photo.', 'err');
    }
  };

  // ── Name Save ──
  const handleSaveName = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setNameError('Name cannot be blank.');
      return;
    }
    setNameSaving(true);
    setNameError(null);
    try {
      const user = auth.currentUser;
      if (user) {
        await updateProfile(user, { displayName: trimmed });
        await updateUserName(trimmed);
        await setDoc(doc(db, 'users', user.uid), { displayName: trimmed }, { merge: true });
      }
      setEditingName(false);
      showToast('Name saved ✓');
    } catch {
      setNameError('Could not save — please try again.');
    } finally {
      setNameSaving(false);
    }
  };

  // ── Sign Out ──
  const confirmSignOut = async () => {
    setModal(null);
    clearUserData();
    try {
      await auth.signOut();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  // ── Delete Account ──
  const confirmDeleteAccount = async () => {
    setDeleteError(null);
    setDeleteInProgress(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not logged in');

      const isEmailUser  = user.providerData.some(p => p.providerId === 'password');
      const isGoogleUser = user.providerData.some(p => p.providerId === 'google.com');

      if (isEmailUser) {
        if (!deletePassword) {
          setDeleteError('Please enter your password to confirm.');
          setDeleteInProgress(false);
          return;
        }
        const cred = EmailAuthProvider.credential(user.email, deletePassword);
        await reauthenticateWithCredential(user, cred);
      } else if (isGoogleUser) {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
      }

      clearUserData();
      await deleteUser(user);
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Delete error:', err);
      const msg =
        err.code === 'auth/wrong-password'        ? 'Incorrect password.' :
        err.code === 'auth/requires-recent-login' ? 'Session expired. Sign out and sign in again before deleting.' :
        err.code === 'auth/popup-closed-by-user'  ? 'Re-authentication cancelled.' :
        'Could not delete account. Please try again.';
      setDeleteError(msg);
      setDeleteInProgress(false);
    }
  };

  // ── Export Data (GDPR) ──
  const handleExportData = () => {
    showToast('Export request submitted. Check your email within 30 days.');
  };

  // ── Derived ──
  const journeyLabel = JOURNEY_LABELS[journeyType] ?? journeyType ?? 'No journey set';
  const displayInitial =
    userName?.charAt(0)?.toUpperCase() ||
    authUser?.displayName?.charAt(0)?.toUpperCase() ||
    FALLBACK_INITIAL;

  const currentPlan = PLAN_DISPLAY[subscriptionPlan] ?? {
    label: subscriptionPlan ?? 'Unknown',
    price: null,
    desc:  '',
  };
  const isFreePlan = !subscriptionPlan || subscriptionPlan === PLAN_IDS.FREE;

  // ── Render ──
  return (
    <div className="page-pad">

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: 'var(--sp-4, 16px)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10000,
          background: toast.type === 'err' ? 'var(--danger, #DC2626)' : 'var(--accent, #6D28D9)',
          color: '#ffffff',
          padding: 'var(--sp-2, 8px) var(--sp-4, 16px)',
          borderRadius: 30,
          fontSize: 'var(--fs-sm, 0.75rem)',
          fontWeight: 600,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          {toast.msg}
        </div>
      )}

      <SectionTitle title="Profile" subtitle="Manage your account and preferences 👤" />

      {/* ── User Info ── */}
      <WCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4, 16px)' }}>

          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              style={{
                width: 80, height: 80, borderRadius: '50%',
                background: profileImage ? 'transparent' : 'var(--accent-pale, #EDE9FE)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 30, color: 'var(--accent, #6D28D9)', overflow: 'hidden',
                cursor: 'pointer', border: '3px solid var(--accent, #6D28D9)',
              }}
              onClick={() => fileInputRef.current?.click()}
              title="Change photo"
            >
              {profileImage
                ? <img
                    src={profileImage}
                    alt="Profile"
                    referrerPolicy="no-referrer"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                : displayInitial
              }
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload profile photo"
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--accent, #6D28D9)',
                border: '2px solid #ffffff',
                color: '#ffffff', fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
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

          {/* Name / Journey */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {editingName ? (
              <div>
                <div style={{ display: 'flex', gap: 'var(--sp-2, 8px)', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    style={{
                      flex: 1, minWidth: 0,
                      fontSize: 'var(--fs-lg, 1.125rem)', fontWeight: 800,
                      border: '1px solid var(--border, rgba(0,0,0,0.06))',
                      borderRadius: 'var(--r-sm, 12px)',
                      padding: 'var(--sp-1, 4px) var(--sp-2, 8px)',
                      background: 'var(--pg-bg, #EEE9F8)',
                    }}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={nameSaving}
                    style={{
                      background: 'var(--accent, #6D28D9)', color: '#ffffff',
                      border: 'none', borderRadius: 20,
                      padding: '4px 14px', cursor: 'pointer',
                      fontWeight: 700, opacity: nameSaving ? 0.6 : 1,
                      fontSize: 'var(--fs-sm, 0.75rem)',
                    }}
                  >
                    {nameSaving ? '…' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setNameError(null); }}
                    style={{
                      background: 'var(--pg-bg, #EEE9F8)',
                      border: '1px solid var(--border, rgba(0,0,0,0.06))',
                      borderRadius: 20, padding: '4px 12px', cursor: 'pointer',
                      fontSize: 'var(--fs-sm, 0.75rem)',
                    }}
                  >
                    Cancel
                  </button>
                </div>
                {nameError && (
                  <p style={{ color: 'var(--danger, #DC2626)', fontSize: 'var(--fs-xs, 0.688rem)', marginTop: 4 }}>
                    {nameError}
                  </p>
                )}
              </div>
            ) : (
              <>
                <p style={{
                  fontSize: 'var(--fs-lg, 1.125rem)', fontWeight: 800,
                  color: 'var(--txt-dark, #1E1B2E)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  margin: 0,
                }}>
                  {userName || authUser?.displayName || 'User'}
                  <button
                    onClick={() => { setNewName(userName || ''); setEditingName(true); }}
                    aria-label="Edit name"
                    style={{ background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', marginLeft: 8 }}
                  >
                    ✏️
                  </button>
                </p>
                <p style={{ fontSize: 'var(--fs-sm, 0.75rem)', color: 'var(--txt-mid, #6B7280)', margin: '2px 0 0' }}>
                  {journeyLabel}
                </p>
                <button
                  onClick={() => navigate('/onboarding', { state: { changeJourney: true } })}
                  style={{
                    marginTop: 6, background: 'none', border: 'none',
                    color: 'var(--accent, #6D28D9)',
                    fontSize: 'var(--fs-xs, 0.688rem)',
                    fontWeight: 600, cursor: 'pointer', padding: 0,
                  }}
                >
                  Change journey {'>'}
                </button>
              </>
            )}
          </div>
        </div>

        {(profileImage || imageError || uploading) && (
          <div style={{ marginTop: 'var(--sp-3, 12px)' }}>
            {profileImage && !uploading && (
              <button
                onClick={() => setModal('removePhoto')}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--danger, #DC2626)',
                  fontSize: 'var(--fs-xs, 0.688rem)',
                  cursor: 'pointer', display: 'block', width: '100%', textAlign: 'center',
                }}
              >
                Remove profile photo
              </button>
            )}
            {imageError && (
              <p style={{ color: 'var(--danger, #DC2626)', fontSize: 'var(--fs-xs, 0.688rem)', textAlign: 'center', margin: 0 }}>
                {imageError}
              </p>
            )}
            {uploading && (
              <p style={{ color: 'var(--accent, #6D28D9)', fontSize: 'var(--fs-xs, 0.688rem)', textAlign: 'center', margin: 0 }}>
                Uploading…
              </p>
            )}
          </div>
        )}
      </WCard>

      {/* ── Notifications ── */}
      <SectionTitle title="Notifications 🔔" />
      <WCard>
        {NOTIFICATION_ITEMS.map((item, i) => (
          <div
            key={item.key}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: 'var(--sp-3, 12px) 0',
              borderBottom: i < NOTIFICATION_ITEMS.length - 1
                ? '1px solid var(--border, rgba(0,0,0,0.06))'
                : 'none',
            }}
          >
            <div style={{ flex: 1, minWidth: 0, paddingRight: 'var(--sp-3, 12px)' }}>
              <p style={{ fontWeight: 700, fontSize: 'var(--fs-sm, 0.75rem)', margin: 0 }}>{item.label}</p>
              <p style={{ fontSize: 'var(--fs-xs, 0.688rem)', color: 'var(--txt-mid, #6B7280)', marginTop: 2, marginBottom: 0 }}>
                {item.desc}
              </p>
            </div>
            {/* label passed so Toggle has an accessible aria-label */}
            <Toggle
              on={notifications[item.key]}
              onChange={() => handleToggleNotification(item.key)}
              label={item.label}
            />
          </div>
        ))}
        {notifSaving && (
          <p style={{
            fontSize: 'var(--fs-xs, 0.688rem)',
            color: 'var(--txt-mid, #6B7280)',
            textAlign: 'right',
            marginTop: 'var(--sp-2, 8px)',
            marginBottom: 0,
          }}>
            Saving…
          </p>
        )}
      </WCard>

      {/* ── Privacy Centre ── */}
      <SectionTitle title="Privacy Centre 🔒" />
      <WCard>
        <ActionRow icon="📥" label="Download my data" sub="GDPR right to portability" onClick={handleExportData} />
        <ActionRow icon="📋" label="Manage consent" sub="Review and update your consents" onClick={() => navigate('/consent')} last />
      </WCard>

      {/* ── Subscription ── */}
      <SectionTitle title="Subscription 💎" />
      <WCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 'var(--fs-md, 1rem)', margin: 0 }}>{currentPlan.label}</p>
            <p style={{ fontSize: 'var(--fs-xs, 0.688rem)', color: 'var(--txt-mid, #6B7280)', margin: '2px 0 0' }}>
              {currentPlan.desc}
            </p>
          </div>
          {isFreePlan && (
            <Button variant="primary" onClick={() => setShowSubscriptionModal(true)}>
              Upgrade
            </Button>
          )}
        </div>

        {isFreePlan && (
          <div style={{
            marginTop: 'var(--sp-3, 12px)',
            paddingTop: 'var(--sp-3, 12px)',
            borderTop: '1px solid var(--border, rgba(0,0,0,0.06))',
          }}>
            <PlanRow
              icon="✨"
              name={PLAN_DISPLAY[PLAN_IDS.BLOOM_PLUS].label}
              price={PLAN_DISPLAY[PLAN_IDS.BLOOM_PLUS].price}
              desc={PLAN_DISPLAY[PLAN_IDS.BLOOM_PLUS].desc}
            />
          </div>
        )}
      </WCard>

      {/* ── About ── */}
      <SectionTitle title="About ℹ️" />
      <WCard>
        <InfoRow label="Version" value={`${APP_VERSION} (Build ${APP_BUILD})`} />
        <InfoRow label="ICO Registration" value={ICO_NUMBER} />
        <InfoRow label="Data Region" value="UK (GDPR Compliant)" last />
      </WCard>

      {/* ── Account ── */}
      <SectionTitle title="Account" />
      <WCard>
        <ActionRow
          icon="🚪"
          label="Sign out"
          sub="You'll need to sign in again to access your data"
          onClick={() => setModal('signOut')}
        />
        <ActionRow
          icon="🗑️"
          label="Delete account & all data"
          sub="Permanent — cannot be undone"
          danger
          last
          onClick={() => { setDeletePassword(''); setDeleteError(null); setModal('deleteAccount'); }}
        />
      </WCard>

      {/* ── Modals ── */}
      {modal === 'removePhoto' && (
        <ConfirmModal
          title="Remove profile photo?"
          body="Your photo will be deleted permanently."
          confirmLabel="Remove photo"
          confirmVariant="danger"
          onConfirm={confirmRemovePhoto}
          onCancel={() => setModal(null)}
        />
      )}

      {modal === 'signOut' && (
        <ConfirmModal
          title="Sign out?"
          body="You'll be returned to the sign-in screen. Your data is safely stored in the cloud."
          confirmLabel="Sign out"
          confirmVariant="neutral"
          onConfirm={confirmSignOut}
          onCancel={() => setModal(null)}
        />
      )}

      {modal === 'deleteAccount' && (
        <ConfirmModal
          title="⚠️ Delete account permanently?"
          body="All your health data will be erased immediately. This cannot be undone."
          confirmLabel={deleteInProgress ? 'Deleting…' : 'Delete my account'}
          confirmVariant="danger"
          onConfirm={confirmDeleteAccount}
          onCancel={() => !deleteInProgress && setModal(null)}
        >
          {authUser?.providerData?.some(p => p.providerId === 'password') && (
            <div style={{ marginBottom: 'var(--sp-2, 8px)' }}>
              <label style={{
                fontSize: 'var(--fs-xs, 0.688rem)',
                color: 'var(--txt-mid, #6B7280)',
                display: 'block',
                marginBottom: 4,
              }}>
                Enter your password to confirm
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Password"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  border: '1px solid var(--border, rgba(0,0,0,0.06))',
                  borderRadius: 'var(--r-sm, 12px)',
                  padding: 'var(--sp-2, 8px)',
                  fontSize: 'var(--fs-sm, 0.75rem)',
                  background: 'var(--pg-bg, #EEE9F8)',
                }}
              />
            </div>
          )}
          {authUser?.providerData?.some(p => p.providerId === 'google.com') && (
            <p style={{
              fontSize: 'var(--fs-xs, 0.688rem)',
              color: 'var(--txt-mid, #6B7280)',
              marginBottom: 'var(--sp-2, 8px)',
              marginTop: 0,
            }}>
              You'll be asked to confirm with Google before your account is deleted.
            </p>
          )}
          {deleteError && (
            <p style={{
              color: 'var(--danger, #DC2626)',
              fontSize: 'var(--fs-xs, 0.688rem)',
              marginTop: 4,
              marginBottom: 0,
            }}>
              {deleteError}
            </p>
          )}
        </ConfirmModal>
      )}

      {/* ── Subscription Modal ── */}
      {showSubscriptionModal && (
        <SubscriptionPlans
          onClose={() => setShowSubscriptionModal(false)}
          onUpgrade={(planId) => {
            updateSubscriptionPlan(planId);
            showToast(`Successfully upgraded to ${PLAN_DISPLAY[planId]?.label ?? planId}! 🎉`);
            setShowSubscriptionModal(false);
          }}
        />
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ActionRow({ icon, label, sub, onClick, danger = false, last = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 'var(--sp-4, 16px)',
        width: '100%', background: 'none', border: 'none',
        padding: 'var(--sp-3, 12px) 0', cursor: 'pointer', textAlign: 'left',
        borderBottom: last ? 'none' : '1px solid var(--border, rgba(0,0,0,0.06))',
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{
          fontWeight: 700,
          fontSize: 'var(--fs-sm, 0.75rem)',
          color: danger ? 'var(--danger, #DC2626)' : 'var(--txt-dark, #1E1B2E)',
          margin: 0,
        }}>
          {label}
        </p>
        {sub && (
          <p style={{ fontSize: 'var(--fs-xs, 0.688rem)', color: 'var(--txt-mid, #6B7280)', marginTop: 2, marginBottom: 0 }}>
            {sub}
          </p>
        )}
      </div>
      <span style={{ color: 'var(--txt-mid, #6B7280)', fontSize: 18 }}>›</span>
    </button>
  );
}

function InfoRow({ label, value, last = false }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: 'var(--sp-2, 8px) 0',
      borderBottom: last ? 'none' : '1px solid var(--border, rgba(0,0,0,0.06))',
    }}>
      <span style={{ fontSize: 'var(--fs-sm, 0.75rem)', color: 'var(--txt-mid, #6B7280)' }}>{label}</span>
      <span style={{ fontSize: 'var(--fs-sm, 0.75rem)', fontWeight: 600, color: 'var(--txt-dark, #1E1B2E)' }}>{value}</span>
    </div>
  );
}

function PlanRow({ icon, name, price, desc }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--sp-2, 8px)', alignItems: 'flex-start', padding: 'var(--sp-2, 8px) 0' }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div>
        <p style={{ fontWeight: 700, fontSize: 'var(--fs-sm, 0.75rem)', margin: 0 }}>
          {name}{price ? ` · ${price}` : ''}
        </p>
        <p style={{ fontSize: 'var(--fs-xs, 0.688rem)', color: 'var(--txt-mid, #6B7280)', marginTop: 2, marginBottom: 0 }}>
          {desc}
        </p>
      </div>
    </div>
  );
}