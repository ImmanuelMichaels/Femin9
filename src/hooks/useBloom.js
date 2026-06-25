// src/hooks/useBloom.js
// Replaces the direct fetch('https://api.anthropic.com/v1/messages') in useHealthData.js
// Calls the Cloud Function proxy — API key never leaves the server.

import { getFunctions, httpsCallable } from 'firebase/functions';
import { canUseAI } from '../utils/storage';
import { detectCrisisTier, bloomResp } from '../data/bloomKnowledge';

const functions   = getFunctions(undefined, 'europe-west2');
const bloomChatFn = httpsCallable(functions, 'bloomChat');

/**
 * Send a message to Bloom AI.
 *
 * @param {string}   userMessage  - latest user message
 * @param {Array}    history      - [{role, content}] conversation history
 * @param {string}   journeyType  - canonical journey key
 * @param {string}   [systemPrompt] - optional extra system context
 * @returns {Promise<string>}     - Bloom's response text
 */
export async function sendToBloom(userMessage, history = [], journeyType = 'pregnant', systemPrompt = '') {
  // ── 1. Client-side crisis check — respond immediately, no API latency ────
  const crisisTier = detectCrisisTier(userMessage);
  if (crisisTier === 1 || crisisTier === 2) {
    // Also call the function in background to log the crisis event server-side
    bloomChatFn({
      messages:    [...history, { role: 'user', content: '[CRISIS DETECTED - AUTO FLAGGED]' }],
      journeyType,
      systemPrompt: 'LOG_CRISIS_ONLY',
    }).catch(() => {}); // fire-and-forget

    return bloomResp(userMessage, journeyType);
  }

  // ── 2. AI consent gate ───────────────────────────────────────────────────
  if (!canUseAI()) {
    return '💡 To use Bloom AI insights, please enable AI Processing in **Settings → Privacy & Consent**. Your other app features are unaffected.';
  }

  // ── 3. Call Cloud Function (API key server-side) ─────────────────────────
  try {
    const messages = [
      ...history.slice(-20), // last 20 turns max — controls context window cost
      { role: 'user', content: userMessage },
    ];

    const result = await bloomChatFn({ messages, journeyType, systemPrompt });
    return result.data.text;

  } catch (err) {
    // resource-exhausted = rate limited
    if (err.code === 'functions/resource-exhausted') {
      return "You've reached Bloom's hourly limit. Please try again in an hour. 💙";
    }
    // Fallback to local KB on any network / server error
    console.error('[useBloom] Cloud Function error:', err);
    return bloomResp(userMessage, journeyType);
  }
}
