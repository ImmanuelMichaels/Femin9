import { useState, useEffect, useRef } from 'react';
import { WCard, SectionTitle, Button } from '../components/ui';
import { useApp } from '../context/useApp';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../context/firebase';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { updateProfile, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import SubscriptionPlans from '../components/SubscriptionPlans';

// ── Constants ─────────────────────────────────────────────────────────────────
const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? '1.0.0';
const APP_BUILD   = import.meta.env.VITE_APP_BUILD   ?? '42';
const ICO_NUMBER  = import.meta.env.VITE_ICO_NUMBER  ?? '—';

const JOURNEY_LABELS = {
  mom:        'Postpartum & Nursing',
  conceive:   'Trying to Conceive',
  ttc:        'Trying to Conceive',
  pregnant:   'Pregnancy',
  ivf:        'IVF & Fertility',
  menopause:  'Menopause',
  menstrual:  'Menstrual Health',
};

const FALLBACK_NAME    = 'Mama';
const FALLBACK_INITIAL = '?';

const NOTIFICATION_ITEMS = [
  { key: 'healthReminders',      label: 'Health Reminders',     desc: 'Daily vitals, kick count, medication reminders' },
  { key: 'appointmentReminders', label: 'Appointment Reminders', desc: 'Upcoming appointments and check-ups' },
  { key: 'marketing',            label: 'Tips & Updates',        desc: 'Wellness tips, offers, and app updates' },
];

// Single source of truth for subscription plan pricing/copy.
// Update here only — referenced by PLAN_LABELS, PLAN_DESCRIPTIONS, and PlanRow.
const PLANS = {
  free: {
    label: 'Bloom Seed (Free)',
    price: null,
    desc: 'Free tier · 10 AI messages/day',
  },
  bloom: {
    label: 'Bloom',
    price: '£4.99/mo',
    desc: '50 AI messages · PDF exports · Unlimited tracking',
  },
  'bloom+': {
    label: 'Bloom+',
    price: '£7.99/mo',
    desc: 'Unlimited AI · Priority support · Annual health review',
  },
};

// ── Confirmation modal ─────────────────────────────────────────────────────────
function ConfirmModal({ title, body, confirmLabel, confirmVariant = 'danger', onConfirm, onCancel, children }) {
  return (
    <div style={{
      position: 'sticky', inset: 0, zIndex: 9999, bottom: '30%',
      background: '#fff', backdropFilter: 'blur(2px)',
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
        {body && <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--mt)', marginBottom: 'var(--sp-4)', lineHeight: 1.5 }}>{body}</p>}
        {children}
        <div style={{ display: 'flex', gap: 'var(--gap-sm)', marginTop: 'var(--sp-3)' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: 'var(--sp-3)', borderRadius: 'var(--r)',
              background: 'var(--warm)', border: '1px solid var(--border)',
              fontSize: 'var(--fs-sm)', fontWeight: 600, cursor: 'pointer', color: 'var(--dp)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: 'var(--sp-3)', borderRadius: 'var(--r)',
              background: confirmVariant === 'danger' ? 'var(--rd, #e53935)' : '#4108a5',
              border: 'none', fontSize: 'var(--fs-sm)', fontWeight: 700,
              cursor: 'pointer', color: '#fff',
            }}
          >
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
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        width: 50, height: 28, borderRadius: 30,
        background: on ? 'var(--sg)' : 'var(--border)',
        border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
        flexShrink: 0,
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
    subscriptionPlan,
    logout, clearUserData,
  } = useApp();
  const navigate = useNavigate();

  // ── Profile image ──────────────────────────────────────────────────────────
  const [profileImage, setProfileImage] = useState(() => localStorage.getItem('profileImage') || null);
  const [uploading,    setUploading]    = useState(false);
  const [imageError,   setImageError]   = useState(null);
  const fileInputRef = useRef(null);

  // ── Name editing ───────────────────────────────────────────────────────────
  const [editingName, setEditingName]   = useState(false);
  const [newName,     setNewName]       = useState(userName || '');
  const [nameError,   setNameError]     = useState(null);
  const [nameSaving,  setNameSaving]    = useState(false);

  // ── Notifications ──────────────────────────────────────────────────────────
  // notificationsEnabled (overall on/off) lives in AppContext; per-category
  // breakdown lives here and is persisted to localStorage + Firestore.
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('notificationPrefs');
      return saved ? JSON.parse(saved) : { healthReminders: true, appointmentReminders: true, marketing: false };
    } catch { return { healthReminders: true, appointmentReminders: true, marketing: false }; }
  });
  const [notifSaving, setNotifSaving] = useState(false);

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [modal, setModal] = useState(null); // 'removePhoto' | 'signOut' | 'deleteAccount'
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [deletePassword,    setDeletePassword]    = useState('');
  const [deleteError,       setDeleteError]       = useState(null);
  const [deleteInProgress,  setDeleteInProgress]  = useState(false);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Load profile image from Firestore on mount ─────────────────────────────
  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists() && snap.data().profileImage) {
          setProfileImage(snap.data().profileImage);
          localStorage.setItem('profileImage', snap.data().profileImage);
        }
      } catch { /* silent */ }
    };
    load();
  }, []);

  // ── Persist notification prefs ─────────────────────────────────────────────
  const saveNotifications = async (prefs) => {
    setNotifSaving(true);
    localStorage.setItem('notificationPrefs', JSON.stringify(prefs));
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
    const anyOn = Object.values(updated).some(Boolean);
    setNotificationsEnabled(anyOn);
    await saveNotifications(updated);
  };

  // ── Image upload ───────────────────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Please upload a JPEG, PNG, GIF, or WebP file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image must be under 5 MB.');
      return;
    }
    setUploading(true);
    setImageError(null);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not logged in');
      const storageRef = ref(storage, `profileImages/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateProfile(user, { photoURL: url });
      await setDoc(doc(db, 'users', user.uid), { profileImage: url }, { merge: true });
      setProfileImage(url);
      localStorage.setItem('profileImage', url);
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
      localStorage.removeItem('profileImage');
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
    try {
      await auth.signOut();
    } finally {
      // Clear local app state before navigating so no stale data
      // leaks into the next session / login screen.
      clearUserData?.();
      logout?.();
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

      const emailProvider = user.providerData.find(p => p.providerId === 'password');
      if (emailProvider) {
        if (!deletePassword) {
          setDeleteError('Please enter your password to confirm.');
          setDeleteInProgress(false);
          return;
        }
        const cred = EmailAuthProvider.credential(user.email, deletePassword);
        await reauthenticateWithCredential(user, cred);
      }

      await clearUserData();
      await deleteUser(user);
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Delete error:', err);
      const msg =
        err.code === 'auth/wrong-password'    ? 'Incorrect password.' :
        err.code === 'auth/requires-recent-login' ? 'Session expired. Please sign out and sign in again before deleting.' :
        'Could not delete account. Please try again.';
      setDeleteError(msg);
      setDeleteInProgress(false);
    }
  };

  // ── Export data ────────────────────────────────────────────────────────────
  const handleExportData = () => {
    showToast('Export request submitted. Check your email within 30 days.');
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const journeyLabel  = JOURNEY_LABELS[journeyType] ?? journeyType ?? 'No journey set';
  const displayInitial = userName?.charAt(0)?.toUpperCase() || FALLBACK_INITIAL;

  const currentPlan = PLANS[subscriptionPlan] ?? { label: subscriptionPlan, price: null, desc: '' };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page-pad">

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 'var(--sp-4)', left: '50%', transform: 'translateX(-50%)',
          zIndex: 10000, background: toast.type === 'err' ? 'var(--rd)' : 'var(--sg)',
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
          {/* Avatar */}
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
                ? <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

          {/* Name / journey */}
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
                  <button
                    onClick={handleSaveName}
                    disabled={nameSaving}
                    style={{
                      background: 'var(--sg)', color: '#fff', border: 'none',
                      borderRadius: 20, padding: '4px 14px', cursor: 'pointer',
                      fontWeight: 700, opacity: nameSaving ? 0.6 : 1,
                    }}
                  >
                    {nameSaving ? '…' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setNameError(null); }}
                    style={{
                      background: 'var(--warm)', border: '1px solid var(--border)',
                      borderRadius: 20, padding: '4px 12px', cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
                {nameError && (
                  <p style={{ color: 'var(--rd)', fontSize: 'var(--fs-xs)', marginTop: 4 }}>{nameError}</p>
                )}
              </div>
            ) : (
              <>
                <p style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, color: 'var(--dp)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userName || FALLBACK_NAME}
                  <button
                    onClick={() => { setNewName(userName || ''); setEditingName(true); }}
                    aria-label="Edit name"
                    style={{ background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', marginLeft: 8 }}
                  >
                    ✏️
                  </button>
                </p>
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--mt)' }}>
                  {journeyLabel}
                </p>
                <button
                  onClick={() => navigate('/onboarding')}
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
          <div
            key={item.key}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: 'var(--sp-3) 0',
              borderBottom: i < NOTIFICATION_ITEMS.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div style={{ flex: 1, minWidth: 0, paddingRight: 'var(--sp-3)' }}>
              <p style={{ fontWeight: 700, fontSize: 'var(--fs-sm)' }}>{item.label}</p>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginTop: 2 }}>{item.desc}</p>
            </div>
            <Toggle
              on={notifications[item.key]}
              onChange={() => handleToggleNotification(item.key)}
            />
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
        <ActionRow icon="📋" label="Manage consent"   sub="Review and update your consents" onClick={() => navigate('/consent')} last />
      </WCard>

      {/* ── Subscription ── */}
      <SectionTitle title="Subscription 💎" />
      <WCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 'var(--fs-md)' }}>{currentPlan.label}</p>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)' }}>{currentPlan.desc}</p>
          </div>
          {subscriptionPlan === 'free' && (
            <Button variant="primary" onClick={() => setShowSubscriptionModal(true)}>
              Upgrade
            </Button>
          )}
        </div>

        {subscriptionPlan === 'free' && (
          <div style={{
            marginTop: 'var(--sp-3)', paddingTop: 'var(--sp-3)',
            borderTop: '1px solid var(--border)',
          }}>
            <PlanRow icon="🌸" name={PLANS.bloom.label}  price={PLANS.bloom.price}  desc={PLANS.bloom.desc} />
            <PlanRow icon="✨" name={PLANS['bloom+'].label} price={PLANS['bloom+'].price} desc={PLANS['bloom+'].desc} />
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

      {/* ── Danger zone ── */}
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
          {auth.currentUser?.providerData?.some(p => p.providerId === 'password') && (
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
              {deleteError && (
                <p style={{ color: 'var(--rd)', fontSize: 'var(--fs-xs)', marginTop: 4 }}>{deleteError}</p>
              )}
            </div>
          )}
        </ConfirmModal>
      )}

      {/* ── Subscription Modal ── */}
      {showSubscriptionModal && (
        <SubscriptionPlans
          onClose={() => setShowSubscriptionModal(false)}
          onUpgrade={(planId) => {
            showToast(`Successfully upgraded to ${PLANS[planId]?.label ?? planId}! 🎉`);
          }}
        />
      )}
    </div>
  );
}

// ── Small shared sub-components ───────────────────────────────────────────────

function ActionRow({ icon, label, sub, onClick, danger = false, last = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 'var(--gap-md)',
        width: '100%', background: 'none', border: 'none',
        padding: 'var(--sp-3) 0', cursor: 'pointer', textAlign: 'left',
        borderBottom: last ? 'none' : '1px solid var(--border)',
      }}
    >
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
    <div style={{
      display: 'flex', gap: 'var(--gap-sm)', alignItems: 'flex-start',
      padding: 'var(--sp-2) 0',
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div>
        <p style={{ fontWeight: 700, fontSize: 'var(--fs-sm)' }}>{name} · {price}</p>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginTop: 2 }}>{desc}</p>
      </div>
    </div>
  );
}