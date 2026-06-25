// src/utils/storage.js
// Drop-in replacements for all localStorage.getItem / setItem calls in the app.
// Fixes: unguarded JSON.parse crashes, QuotaExceededError silent failures.

/**
 * Safe JSON read from localStorage.
 * Returns defaultValue on any error (corrupted, missing, XSS-injected).
 */
export function lsGet(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

/**
 * Safe JSON write to localStorage.
 * Returns true on success, false on QuotaExceededError.
 * Shows a console warning on failure so it is never silent.
 */
export function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.warn(`[storage] localStorage quota exceeded writing "${key}". Consider pruning old data.`);
    } else {
      console.warn(`[storage] failed to write "${key}":`, e);
    }
    return false;
  }
}

/**
 * Safe remove.
 */
export function lsRemove(key) {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

/**
 * Append item to a localStorage array, capped at maxLength.
 * Prevents unbounded growth (e.g. vitalsHistory).
 */
export function lsAppend(key, item, maxLength = 365) {
  const existing = lsGet(key, []);
  const arr = Array.isArray(existing) ? existing : [];
  arr.unshift(item);
  if (arr.length > maxLength) arr.splice(maxLength);
  return lsSet(key, arr);
}


// ─── Consent: write to localStorage AND Firestore ─────────────────────────
// src/utils/saveConsent.js (add to this file or separate)

import { db, auth } from '../context/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Saves consent record to localStorage (fast local read) AND
 * Firestore (GDPR audit trail you control).
 *
 * @param {object} consents  - { healthData, aiProcessing, analytics, marketing }
 * @param {boolean} privacyAccepted
 * @param {string}  version  - consent schema version e.g. '1.0.0'
 */
export async function saveConsent(consents, privacyAccepted, version = '1.0.0') {
  const record = {
    ...consents,
    privacyAccepted,
    version,
    timestamp: new Date().toISOString(),
  };

  // 1. Local cache (fast read for UI gates)
  lsSet('userConsents', record);

  // 2. Server audit trail (GDPR Article 7 — you must be able to demonstrate consent)
  const user = auth.currentUser;
  if (!user) return; // pre-auth consent: write after login in onAuthStateChanged

  try {
    await setDoc(
      doc(db, 'users', user.uid, 'consents', new Date().toISOString()),
      {
        ...record,
        uid: user.uid,
        userAgent: navigator.userAgent,
        // Never log IP client-side; do it server-side in a Cloud Function trigger
        createdAt: serverTimestamp(),
      }
    );
  } catch (e) {
    // Firestore write failure must NOT block the user — local copy is the fallback.
    // Log to your error tracker (Sentry etc.) but don't throw.
    console.error('[saveConsent] Firestore write failed:', e);
  }
}

/**
 * Read the active consent record (localStorage first, fast path).
 */
export function getConsent() {
  return lsGet('userConsents', {
    healthData: false,
    aiProcessing: false,
    analytics: false,
    marketing: false,
    privacyAccepted: false,
  });
}

/**
 * Gate: returns true only if aiProcessing consent was given.
 * Use this before every Anthropic API call.
 */
export function canUseAI() {
  return getConsent().aiProcessing === true;
}
