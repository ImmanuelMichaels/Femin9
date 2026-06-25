import { useState, useEffect, useRef } from 'react';
import { WCard, SectionTitle, Button } from '../components/ui';
import { useApp } from '../context/useApp';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../context/firebase';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { updateProfile, deleteUser, reauthenticateWithCredential, EmailAuthProvider, GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
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
  ttc:       'Trying to Conceive', // legacy alias
  pregnant:  'Pregnancy',
  ivf:       'IVF & Fertility',
  menopause: 'Menopause',
  menstrual: 'Menstrual Health',
};

// Single source of truth for displayed plan copy — keyed by PLAN_IDS
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
  { key: 'marketing',            label: 'Tips & Updates',         desc: 'Wellness tips, offers, and app updates' },
];

// ── Confirmation modal ─────────────────────────────────────────────────────────
function ConfirmModal({ title, body, confirmLabel, confirmVariant = 'danger', onConfirm, onCancel, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--sp-4)',
    }}>
      <div style={{
        background: '#fff', borderRadius: 'var(--r, 16px)',
        padding: 'var(--sp-5)', maxWidth: 380, width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      }}>
        <p style={{ fontWeight: 800, fontSize: 'var(--fs-md)', marginBottom: 'var(--sp-2)', color: 'var(--dp)' }}>
          {title}
        </p>
        {body && (
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--mt)', marginBottom: 'var(--sp-4)', lineHeight: 1.5 }}>
            {body}
          </p>
        )}
        {children}
        <div style={{ display: 'flex', gap: 'var(--gap-sm)', marginTop: 'var(--sp-3)' }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: 'var(--sp-3)', borderRadius: 'var(--r)',
            background: 'var(--warm)', border: '1px solid var(--border)',
            fontSize: 'var(--fs-sm)', fontWeight: 600, cursor: 'pointer', color: 'var(--dp)',
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: 'var(--sp-3)', borderRadius: 'var(--r)',
            background: confirmVariant === 'danger' ? 'var(--rd, #DC2626)' : 'var(--pl, #724C9D)',
            border: 'none', fontSize: 'var(--fs-sm)', fontWeight: 700,
            cursor: 'pointer', color: '#fff',
          }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ on, onChange }) {
  return (
    <button
      role="switch" aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        width: 50, height: 28, borderRadius: 30,
        background: on ? 'var(--sg)' : 'var(--border)',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 3,
        left: on ? 26 : 3, width: 22, height: 22,
        borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
      }} />
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Profile() {
  const {
    userName, setUserName,
    journeyType,
    notificationsEnabled, setNotificationsEnabled,
    subscriptionPlan, setSubscriptionPlan,
    logout, clearUserData,
  } = useApp();
  const navigate = useNavigate();

  // ── Auth user state — never read auth.currentUser synchronously at render ──
  const [authUser, setAuthUser] = useState(null);
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setAuthUser(u));
    return () => unsub();
  }, []);

  // ── Profile image ──────────────────────────────────────────────────────────
  const [profileImage, setProfileImage] = useState(() => {
    // Seed from auth.currentUser.photoURL (Google OAuth) if localStorage is empty
    try {
      return localStorage.getItem('profileImage') || auth.currentUser?.photoURL || null;
    } catch { return null; }
  });
  const [uploading,  setUploading]  = useState(false);
  const [imageError, setImageError] = useState(null);
  const fileInputRef = useRef(null);

  // ── Name editing ───────────────────────────────────────────────────────────
  const [editingName, setEditingName] = useState(false);
  const [newName,     setNewName]     = useState(userName || '');
  const [nameError,   setNameError]   = useState(null);
  const [nameSaving,  setNameSaving]  = useState(false);

  // ── Notifications ──────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('notificationPrefs');
      return saved
        ? JSON.parse(saved)
        : { healthReminders: true, appointmentReminders: true, marketing: false };
    } catch {
      return { healthReminders: true, appointmentReminders: true, marketing: false };
    }
  });
  const [notifSaving, setNotifSaving] = useState(false);

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [modal,                 setModal]                 = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [deletePassword,        setDeletePassword]        = useState('');
  const [deleteError,           setDeleteError]           = useState(null);
  const [deleteInProgress,      setDeleteInProgress]      = useState(false);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Load Firestore data on mount ───────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (!snap.exists()) return;
        const data = snap.data();

        // Profile image: Firestore > Google OAuth photoURL > localStorage
        const img = data.profileImage || user.photoURL || null;
        if (img) {
          setProfileImage(img);
          try { localStorage.setItem('profileImage', img); } catch { /* silent */ }
        }

        // Subscription plan: Firestore is the source of truth
        if (data.plan && data.plan !== subscriptionPlan) {
          setSubscriptionPlan(data.plan);
          try { localStorage.setItem('subscriptionPlan', data.plan); } catch { /* silent */ }
        }

        // Notification prefs from Firestore
        if (data.notificationPrefs) {
          setNotifications(data.notificationPrefs);
          try { localStorage.setItem('notificationPrefs', JSON.stringify(data.notificationPrefs)); } catch { /* silent */ }
        }
      } catch { /* silent */ }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Notification helpers ───────────────────────────────────────────────────
  const saveNotifications = async (prefs) => {
    setNotifSaving(true);
    try { localStorage.setItem('notificationPrefs', JSON.stringify(prefs)); } catch { /* silent */ }
    const user = auth.currentUser;
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { notificationPrefs: prefs }, { merge: true });
      } catch { /* silent */ }
    }
    setNotifSaving(false);
  };

  const handleToggleNotification = async (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    setNotificationsEnabled(Object.values(updated).some(Boolean));
    await saveNotifications(updated);
  };

  // ── Image upload ───────────────────────────────────────────────────────────
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
      try { localStorage.setItem('profileImage', url); } catch { /* silent */ }
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
      try { localStorage.removeItem('profileImage'); } catch { /* silent */ }
      showToast('Photo removed ✓');
    } catch {
      showToast('Failed to remove photo.', 'err');
    }
  };

  // ── Name save ──────────────────────────────────────────────────────────────
  const handleSaveName = async () => {
    const trimmed = newName.trim();
    if (!trimmed) { setNameError('Name cannot be blank.'); return; }
    setNameSaving(true);
    setNameError(null);
    try {
      const user = auth.currentUser;
      if (user) {
        await updateProfile(user, { displayName: trimmed });
        await setDoc(doc(db, 'users', user.uid), { displayName: trimmed }, { merge: true });
      }
      setUserName(trimmed);
      setEditingName(false);
      showToast('Name saved ✓');
    } catch {
      setNameError('Could not save — please try again.');
    } finally {
      setNameSaving(false);
    }
  };

  // ── Sign out ───────────────────────────────────────────────────────────────
  const confirmSignOut = async () => {
    setModal(null);
    clearUserData?.();
    logout?.();
    try { await auth.signOut(); } finally {
      navigate('/login', { replace: true });
    }
  };

  // ── Delete account ─────────────────────────────────────────────────────────
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
        // Google users must also re-authenticate before deletion
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
      }

      try { await clearUserData(); }
      catch (cleanupErr) { console.warn('clearUserData failed:', cleanupErr); }

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

  // ── Export data ────────────────────────────────────────────────────────────
  // TODO: wire to a Cloud Function / Firestore request queue before launch.
  // This is a GDPR Article 20 obligation — the current toast is a placeholder only.
  const handleExportData = () => {
    showToast('Export request submitted. Check your email within 30 days.');
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const journeyLabel   = JOURNEY_LABELS[journeyType] ?? journeyType ?? 'No journey set';
  const displayInitial =
    userName?.charAt(0)?.toUpperCase() ||
    authUser?.displayName?.charAt(0)?.toUpperCase() ||
    FALLBACK_INITIAL;

  // Use PLAN_DISPLAY keyed by PLAN_IDS — no string literals in logic
  const currentPlan = PLAN_DISPLAY[subscriptionPlan] ?? { label: subscriptionPlan ?? 'Unknown', price: null, desc: '' };
  const isFreePlan  = !subscriptionPlan || subscriptionPlan === PLAN_IDS.FREE;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page-pad">

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 'var(--sp-4)', left: '50%', transform: 'translateX(-50%)',
          zIndex: 10000, background: toast.type === 'err' ? 'var(--rd, #DC2626)' : 'var(--sg)',
          color: '#fff', padding: 'var(--sp-2) var(--sp-4)', borderRadius: 30,
          fontSize: 'var(--fs-sm)', fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          pointerEvents: 'none',
        }}>
          {toast.msg}
        </div>
      )}

      <SectionTitle title="Profile" subtitle="Manage your account and preferences 👤" />

      {/* ── User info ── */}
      <WCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              style={{
                width: 80, height: 80, borderRadius: '50%',
                background: profileImage ? 'transparent' : 'var(--pll, #ede9f7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 30, color: 'var(--pl, #724C9D)', overflow: 'hidden',
                cursor: 'pointer', border: '3px solid var(--pl, #724C9D)',
              }}
              onClick={() => fileInputRef.current?.click()}
              title="Change photo"
            >
              {profileImage
                ? <img src={profileImage} alt="Profile" referrerPolicy="no-referrer"
                       style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : displayInitial
              }
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload profile photo"
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--pl, #724c9d)', border: '2px solid #fff',
                color: '#fff', fontSize: 14, display: 'flex',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
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

          <div style={{ flex: 1, minWidth: 0 }}>
            {editingName ? (
              <div>
                <div style={{ display: 'flex', gap: 'var(--gap-sm)', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    style={{
                      flex: 1, minWidth: 0,
                      fontSize: 'var(--fs-lg)', fontWeight: 800,
                      border: '1px solid var(--border)', borderRadius: 'var(--r)',
                      padding: 'var(--sp-1) var(--sp-2)', background: 'var(--warm)',
                    }}
                    autoFocus
                  />
                  <button onClick={handleSaveName} disabled={nameSaving} style={{
                    background: 'var(--sg)', color: '#fff', border: 'none',
                    borderRadius: 20, padding: '4px 14px', cursor: 'pointer',
                    fontWeight: 700, opacity: nameSaving ? 0.6 : 1,
                  }}>
                    {nameSaving ? '…' : 'Save'}
                  </button>
                  <button onClick={() => { setEditingName(false); setNameError(null); }} style={{
                    background: 'var(--warm)', border: '1px solid var(--border)',
                    borderRadius: 20, padding: '4px 12px', cursor: 'pointer',
                  }}>
                    Cancel
                  </button>
                </div>
                {nameError && <p style={{ color: 'var(--rd)', fontSize: 'var(--fs-xs)', marginTop: 4 }}>{nameError}</p>}
              </div>
            ) : (
              <>
                <p style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, color: 'var(--dp)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userName || authUser?.displayName || 'User'}
                  <button
                    onClick={() => { setNewName(userName || ''); setEditingName(true); }}
                    aria-label="Edit name"
                    style={{ background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', marginLeft: 8 }}
                  >
                    ✏️
                  </button>
                </p>
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--mt)' }}>{journeyLabel}</p>
                <button
                  onClick={() => navigate('/onboarding', { state: { changeJourney: true } })}
                  style={{
                    marginTop: 6, background: 'none', border: 'none',
                    color: 'var(--pl, #724C9D)', fontSize: 'var(--fs-xs)',
                    fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Change journey {'>'}
                </button>
              </>
            )}
          </div>
        </div>

        {(profileImage || imageError || uploading) && (
          <div style={{ marginTop: 'var(--sp-3)' }}>
            {profileImage && !uploading && (
              <button
                onClick={() => setModal('removePhoto')}
                style={{
                  background: 'none', border: 'none', color: 'var(--rd)',
                  fontSize: 'var(--fs-xs)', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'center',
                }}
              >
                Remove profile photo
              </button>
            )}
            {imageError && <p style={{ color: 'var(--rd)', fontSize: 'var(--fs-xs)', textAlign: 'center' }}>{imageError}</p>}
            {uploading && <p style={{ color: 'var(--sg)', fontSize: 'var(--fs-xs)', textAlign: 'center' }}>Uploading…</p>}
          </div>
        )}
      </WCard>

      {/* ── Notifications ── */}
      <SectionTitle title="Notifications 🔔" />
      <WCard>
        {NOTIFICATION_ITEMS.map((item, i) => (
          <div key={item.key} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: 'var(--sp-3) 0',
            borderBottom: i < NOTIFICATION_ITEMS.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ flex: 1, minWidth: 0, paddingRight: 'var(--sp-3)' }}>
              <p style={{ fontWeight: 700, fontSize: 'var(--fs-sm)' }}>{item.label}</p>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginTop: 2 }}>{item.desc}</p>
            </div>
            <Toggle on={notifications[item.key]} onChange={() => handleToggleNotification(item.key)} />
          </div>
        ))}
        {notifSaving && (
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', textAlign: 'right', marginTop: 'var(--sp-2)' }}>
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
            <p style={{ fontWeight: 800, fontSize: 'var(--fs-md)' }}>{currentPlan.label}</p>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)' }}>{currentPlan.desc}</p>
          </div>
          {/* Button always renders for free users — condition uses PLAN_IDS constant */}
          {isFreePlan && (
            <Button variant="primary" onClick={() => setShowSubscriptionModal(true)}>
              Upgrade
            </Button>
          )}
        </div>

        {isFreePlan && (
          <div style={{
            marginTop: 'var(--sp-3)', paddingTop: 'var(--sp-3)',
            borderTop: '1px solid var(--border)',
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
        <InfoRow label="Version"          value={`${APP_VERSION} (Build ${APP_BUILD})`} />
        <InfoRow label="ICO Registration" value={ICO_NUMBER} />
        <InfoRow label="Data Region"      value="UK (GDPR Compliant)" last />
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
          danger last
          onClick={() => { setDeletePassword(''); setDeleteError(null); setModal('deleteAccount'); }}
        />
      </WCard>

      {/* ── Modals ── */}
      {modal === 'removePhoto' && (
        <ConfirmModal
          title="Remove profile photo?"
          body="Your photo will be deleted permanently."
          confirmLabel="Remove photo"
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
          onConfirm={confirmDeleteAccount}
          onCancel={() => !deleteInProgress && setModal(null)}
        >
          {/* Show password field for email users; Google users will get a popup */}
          {authUser?.providerData?.some(p => p.providerId === 'password') && (
            <div style={{ marginBottom: 'var(--sp-2)' }}>
              <label style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', display: 'block', marginBottom: 4 }}>
                Enter your password to confirm
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Password"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  border: '1px solid var(--border)', borderRadius: 'var(--r)',
                  padding: 'var(--sp-2)', fontSize: 'var(--fs-sm)',
                  background: 'var(--warm)',
                }}
              />
            </div>
          )}
          {authUser?.providerData?.some(p => p.providerId === 'google.com') && (
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginBottom: 'var(--sp-2)' }}>
              You'll be asked to confirm with Google before your account is deleted.
            </p>
          )}
          {deleteError && (
            <p style={{ color: 'var(--rd)', fontSize: 'var(--fs-xs)', marginTop: 4 }}>{deleteError}</p>
          )}
        </ConfirmModal>
      )}

      {/* ── Subscription Modal ── */}
      {showSubscriptionModal && (
        <SubscriptionPlans
          onClose={() => setShowSubscriptionModal(false)}
          onUpgrade={(planId) => {
            // Context + localStorage already updated inside SubscriptionPlans.handleUpgrade
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
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 'var(--gap-md)',
      width: '100%', background: 'none', border: 'none',
      padding: 'var(--sp-3) 0', cursor: 'pointer', textAlign: 'left',
      borderBottom: last ? 'none' : '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: danger ? 'var(--rd)' : 'var(--dp)' }}>{label}</p>
        {sub && <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginTop: 2 }}>{sub}</p>}
      </div>
      <span style={{ color: 'var(--mt)', fontSize: 18 }}>›</span>
    </button>
  );
}

function InfoRow({ label, value, last = false }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: 'var(--sp-2) 0',
      borderBottom: last ? 'none' : '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--mt)' }}>{label}</span>
      <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--dp)' }}>{value}</span>
    </div>
  );
}

function PlanRow({ icon, name, price, desc }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--gap-sm)', alignItems: 'flex-start', padding: 'var(--sp-2) 0' }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div>
        <p style={{ fontWeight: 700, fontSize: 'var(--fs-sm)' }}>{name}{price ? ` · ${price}` : ''}</p>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginTop: 2 }}>{desc}</p>
      </div>
    </div>
  );
}