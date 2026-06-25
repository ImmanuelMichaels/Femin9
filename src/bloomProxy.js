// functions/src/bloomProxy.js
// Firebase Cloud Function — server-side Anthropic proxy.
// Deploy: firebase deploy --only functions:bloomChat
//
// Replaces the direct fetch('https://api.anthropic.com/v1/messages') in useHealthData.js
// The Anthropic API key NEVER reaches the client.

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret }       = require('firebase-functions/params');
const { getAuth }            = require('firebase-admin/auth');
const admin                  = require('firebase-admin');

if (!admin.apps.length) admin.initializeApp();

// Store ANTHROPIC_API_KEY in Firebase Secret Manager:
//   firebase functions:secrets:set ANTHROPIC_API_KEY
const ANTHROPIC_KEY = defineSecret('ANTHROPIC_API_KEY');

// Per-user rate limit: max 20 AI calls per hour (stored in Firestore)
const RATE_LIMIT = 20;
const WINDOW_MS  = 60 * 60 * 1000; // 1 hour

async function checkRateLimit(uid) {
  const ref  = admin.firestore().doc(`rateLimits/bloom_${uid}`);
  const snap = await ref.get();
  const now  = Date.now();

  if (!snap.exists) {
    await ref.set({ count: 1, windowStart: now });
    return true;
  }

  const { count, windowStart } = snap.data();

  if (now - windowStart > WINDOW_MS) {
    // New window
    await ref.set({ count: 1, windowStart: now });
    return true;
  }

  if (count >= RATE_LIMIT) return false;

  await ref.update({ count: count + 1 });
  return true;
}

// Validate journey type server-side
const VALID_JOURNEYS = new Set(['pregnant', 'ivf', 'conceive', 'mom', 'menstrual', 'menopause']);

exports.bloomChat = onCall(
  { secrets: [ANTHROPIC_KEY], region: 'europe-west2' }, // London region for UK data residency
  async (request) => {
    // ── Auth guard ──────────────────────────────────────────────────────────
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Sign in required.');
    }

    const uid = request.auth.uid;

    // ── Rate limit ──────────────────────────────────────────────────────────
    const allowed = await checkRateLimit(uid);
    if (!allowed) {
      throw new HttpsError('resource-exhausted', 'Rate limit reached. Try again in an hour.');
    }

    // ── Input validation ────────────────────────────────────────────────────
    const { messages, journeyType, systemPrompt } = request.data;

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new HttpsError('invalid-argument', 'messages must be a non-empty array.');
    }

    if (messages.length > 50) {
      throw new HttpsError('invalid-argument', 'Conversation history too long.');
    }

    const safeJourney = VALID_JOURNEYS.has(journeyType) ? journeyType : 'pregnant';

    // Whitelist message structure — never pass arbitrary objects to Anthropic
    const safeMessages = messages.map(m => ({
      role:    m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content).slice(0, 4000), // hard cap per message
    }));

    // ── Anthropic call ──────────────────────────────────────────────────────
    const SAFE_SYSTEM = `You are Bloom, a compassionate women's health AI assistant for the Femin9 app.
The user's current journey is: ${safeJourney}.
You provide evidence-based information with Nigerian cultural context.
You understand English, Yoruba, Igbo, Hausa, and Nigerian Pidgin.

SAFETY RULES — follow these without exception:
1. If the user expresses suicidal ideation, self-harm intent, or crisis, immediately provide:
   - Samaritans: 116 123 (24/7, free, UK)
   - PANDAS Foundation: 0808 1961 776
   - NHS 111 for urgent mental health
   - Text SHOUT to 85258
   - A&E / 999 if at immediate risk
   - Nigeria Emergency: 112
2. If the user describes domestic abuse, provide the National Domestic Abuse Helpline: 0808 2000 247.
3. Never diagnose. Never prescribe. Always advise consulting a GP, midwife, or specialist.
4. Tailor advice to the user's journey (${safeJourney}) — postpartum users should not receive pregnancy-specific advice unless relevant.
5. Disclaimer: end every clinical response with: "📍 This is general information, not medical advice."

${systemPrompt ? String(systemPrompt).slice(0, 1000) : ''}`;

    let anthropicResponse;
    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method:  'POST',
        headers: {
          'Content-Type':      'application/json',
          'x-api-key':         ANTHROPIC_KEY.value(),
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model:      'claude-sonnet-4-6',
          max_tokens: 1000,
          system:     SAFE_SYSTEM,
          messages:   safeMessages,
        }),
      });

      if (!resp.ok) {
        const err = await resp.text();
        console.error('Anthropic API error:', resp.status, err);
        throw new HttpsError('internal', 'AI service unavailable. Please try again.');
      }

      anthropicResponse = await resp.json();
    } catch (e) {
      if (e instanceof HttpsError) throw e;
      console.error('Fetch error:', e);
      throw new HttpsError('internal', 'AI service unavailable.');
    }

    // ── Return only what the client needs ───────────────────────────────────
    const text = anthropicResponse?.content?.[0]?.text ?? '';
    return { text };
  }
);
