// src/hooks/useHealthData.js
// Complete refactored version with secure AI via Cloud Function

import { useState, useEffect, useCallback } from 'react';
import {
  collection, doc, getDoc, getDocs,
  setDoc, updateDoc, serverTimestamp,
  query, orderBy, limit, onSnapshot,
} from 'firebase/firestore';
import { db, auth } from '../context/firebase';
import { sendToBloom } from './useBloom';
import { lsGet } from '../utils/storage';

// ─── Journey-aware symptom catalogues ────────────────────────────────────────

export const SYMPTOM_CATALOGUE = {
  pregnant: [
    { id: 'nausea',        label: 'Nausea / vomiting',   icon: '🤢' },
    { id: 'back_pain',     label: 'Back pain',            icon: '🔩' },
    { id: 'swelling',      label: 'Swelling / oedema',    icon: '💧' },
    { id: 'headache',      label: 'Headache',             icon: '🤕' },
    { id: 'fatigue',       label: 'Fatigue',              icon: '😴' },
    { id: 'heartburn',     label: 'Heartburn',            icon: '🔥' },
    { id: 'cramps',        label: 'Cramping',             icon: '⚡' },
    { id: 'breathless',    label: 'Breathlessness',       icon: '💨' },
    { id: 'vision',        label: 'Blurred vision',       icon: '👁️' },
    { id: 'insomnia',      label: 'Insomnia',             icon: '🌙' },
  ],
  ttc: [
    { id: 'cramping',      label: 'Pelvic cramping',      icon: '⚡' },
    { id: 'spotting',      label: 'Spotting',             icon: '🩸' },
    { id: 'mood',          label: 'Mood changes',         icon: '🎭' },
    { id: 'bloating',      label: 'Bloating',             icon: '💧' },
    { id: 'breast_tender', label: 'Breast tenderness',    icon: '🔴' },
    { id: 'fatigue',       label: 'Fatigue',              icon: '😴' },
    { id: 'cm_change',     label: 'Cervical mucus change',icon: '🌡️' },
    { id: 'headache',      label: 'Headache',             icon: '🤕' },
  ],
  ivf: [
    { id: 'injection_site',label: 'Injection site pain',  icon: '💉' },
    { id: 'bloating',      label: 'Bloating / fullness',  icon: '💧' },
    { id: 'mood',          label: 'Mood swings',          icon: '🎭' },
    { id: 'fatigue',       label: 'Fatigue',              icon: '😴' },
    { id: 'headache',      label: 'Headache',             icon: '🤕' },
    { id: 'hot_flushes',   label: 'Hot flushes',          icon: '🔥' },
    { id: 'spotting',      label: 'Spotting',             icon: '🩸' },
    { id: 'cramping',      label: 'Cramping',             icon: '⚡' },
  ],
  mom: [
    { id: 'fatigue',       label: 'Fatigue',              icon: '😴' },
    { id: 'breast_pain',   label: 'Breast pain / engorgement', icon: '🔴' },
    { id: 'mood',          label: 'Low mood / baby blues',icon: '🎭' },
    { id: 'back_pain',     label: 'Back pain',            icon: '🔩' },
    { id: 'perineal_pain', label: 'Perineal pain',        icon: '⚡' },
    { id: 'headache',      label: 'Headache',             icon: '🤕' },
    { id: 'insomnia',      label: 'Sleep disruption',     icon: '🌙' },
    { id: 'appetite',      label: 'Appetite change',      icon: '🍽️' },
  ],
  menopause: [
    { id: 'hot_flushes',   label: 'Hot flushes',          icon: '🔥' },
    { id: 'night_sweats',  label: 'Night sweats',         icon: '💦' },
    { id: 'insomnia',      label: 'Sleep disruption',     icon: '🌙' },
    { id: 'mood',          label: 'Mood / anxiety',       icon: '🎭' },
    { id: 'brain_fog',     label: 'Brain fog',            icon: '🌫️' },
    { id: 'joint_pain',    label: 'Joint pain',           icon: '🔩' },
    { id: 'vaginal_dry',   label: 'Vaginal dryness',      icon: '🌵' },
    { id: 'fatigue',       label: 'Fatigue',              icon: '😴' },
    { id: 'headache',      label: 'Headache',             icon: '🤕' },
    { id: 'palpitations',  label: 'Palpitations',         icon: '💓' },
  ],
  menstrual: [
    { id: 'cramping',      label: 'Cramping',             icon: '⚡' },
    { id: 'bloating',      label: 'Bloating',             icon: '💧' },
    { id: 'mood',          label: 'Mood changes',         icon: '🎭' },
    { id: 'fatigue',       label: 'Fatigue',              icon: '😴' },
    { id: 'headache',      label: 'Headache / migraine',  icon: '🤕' },
    { id: 'back_pain',     label: 'Back pain',            icon: '🔩' },
    { id: 'breast_tender', label: 'Breast tenderness',    icon: '🔴' },
    { id: 'flow_heavy',    label: 'Heavy flow',           icon: '🩸' },
    { id: 'acne',          label: 'Acne / skin changes',  icon: '🫧' },
    { id: 'insomnia',      label: 'Sleep disruption',     icon: '🌙' },
  ],
};

// ─── Journey-aware traditional practices ─────────────────────────────────────

export const TRADITIONAL_BY_JOURNEY = {
  pregnant: [
    { practice: 'Ginger tea for nausea',        safe: true,  status: 'SAFE',    reason: 'Evidence supports ginger (up to 1g/day) as effective for pregnancy nausea with no known harm to baby.' },
    { practice: 'Shea butter for stretch marks', safe: true,  status: 'SAFE',    reason: 'Topical shea butter is safe and may help with skin elasticity, though evidence for preventing stretch marks is limited.' },
    { practice: 'Drinking palm wine',            safe: false, status: 'AVOID',   reason: 'No level of alcohol is safe during pregnancy. Palm wine contains alcohol and should be completely avoided.' },
    { practice: 'Herbal steam baths',            safe: false, status: 'CAUTION', reason: 'Raising core body temperature above 39°C in early pregnancy is linked to neural tube defects. Short, mild steam exposure is lower risk but caution is advised.' },
    { practice: 'Eating bitter leaf (Vernonia)', safe: false, status: 'CAUTION', reason: 'Bitter leaf in food quantities is generally fine, but medicinal doses have been associated with uterine contractions.' },
    { practice: 'Cocoa butter massage',          safe: true,  status: 'SAFE',    reason: 'Topical cocoa butter is safe during pregnancy. Soothing for dry or stretched skin.' },
  ],
  mom: [
    { practice: 'Fenugreek for milk supply',     safe: true,  status: 'SAFE',    reason: 'Fenugreek is widely used and generally safe for increasing milk supply, though evidence is mixed. Monitor baby for fussiness.' },
    { practice: 'Herbal binding (oja/bengkung)', safe: true,  status: 'SAFE',    reason: 'Postpartum belly binding is a traditional practice across many cultures. It can support posture and core recovery when done correctly.' },
    { practice: 'Salt bath for perineal healing',safe: true,  status: 'SAFE',    reason: 'Warm saline sitz baths can soothe perineal discomfort and support healing after birth.' },
    { practice: 'Spicy foods while breastfeeding',safe: true, status: 'SAFE',    reason: 'Most spices pass into breast milk in only trace amounts. The majority of babies are unaffected, though watch for signs of sensitivity.' },
    { practice: 'Camphor/alcohol rubs on baby',  safe: false, status: 'DANGEROUS', reason: 'Camphor is toxic to infants and can cause seizures. Never apply to babies.' },
    { practice: 'Pre-chewing food for baby',     safe: false, status: 'AVOID',   reason: 'Pre-chewing transfers bacteria including H. pylori and herpes simplex from parent to child. Use appropriate weaning foods instead.' },
  ],
  menopause: [
    { practice: 'Black cohosh supplements',      safe: false, status: 'CAUTION', reason: 'Some evidence for reducing hot flushes, but rare cases of liver toxicity reported. Consult your GP before use, especially with existing liver conditions.' },
    { practice: 'Phytoestrogen-rich foods (soy)',safe: true,  status: 'SAFE',    reason: 'Dietary soy (tofu, edamame, soy milk) contains phytoestrogens that may mildly ease hot flushes. Food sources are safe; supplements need GP guidance.' },
    { practice: 'Shea butter / natural lubricants',safe: true,status: 'SAFE',    reason: 'Natural oil-based lubricants can safely relieve vaginal dryness. Note: oil-based products are not compatible with latex condoms.' },
    { practice: 'Evening primrose oil',          safe: false, status: 'CAUTION', reason: 'May help with hot flushes for some women, but can interact with blood thinners and anticoagulants. Check with your doctor.' },
    { practice: 'Seed cycling',                  safe: true,  status: 'SAFE',    reason: 'Eating flaxseed and pumpkin seeds in the first half of the cycle and sesame and sunflower in the second is nutritionally sound, though direct hormonal evidence is limited.' },
    { practice: 'Red clover tea',                safe: false, status: 'CAUTION', reason: 'Contains isoflavones; some evidence for mild symptom relief but interactions with hormone-sensitive conditions possible. Discuss with GP first.' },
  ],
  ttc: [
    { practice: 'Vitex / chaste tree berry',     safe: false, status: 'CAUTION', reason: 'May support luteal phase length in some women, but evidence is limited and it can interfere with fertility medications. Discuss with your fertility specialist.' },
    { practice: 'Fertility massage',             safe: true,  status: 'SAFE',    reason: 'Abdominal fertility massage is generally safe before ovulation and may support relaxation. Avoid during the two-week wait.' },
    { practice: 'Maca root supplements',         safe: false, status: 'CAUTION', reason: 'Limited evidence for improving fertility. Safety in early pregnancy is unknown — stop if pregnancy is confirmed.' },
    { practice: 'Pineapple core post-ovulation', safe: true,  status: 'SAFE',    reason: 'Pineapple core contains bromelain, popularised as supporting implantation. Evidence is anecdotal but food quantities are safe.' },
    { practice: 'Castor oil packs',              safe: false, status: 'AVOID',   reason: 'Castor oil can stimulate the uterus. Avoid during the two-week wait and if pregnancy is suspected.' },
  ],
  ivf: [
    { practice: 'Acupuncture alongside IVF',     safe: true,  status: 'SAFE',    reason: 'Some studies show modest benefit for IVF success rates. Generally safe when performed by a qualified practitioner; inform your clinic.' },
    { practice: 'DHEA supplements',              safe: false, status: 'CAUTION', reason: 'Some clinics recommend DHEA for poor ovarian responders, but it should only be taken under direct supervision of your fertility doctor.' },
    { practice: 'Meditation / mind-body work',   safe: true,  status: 'SAFE',    reason: 'Stress reduction techniques are safe and beneficial during IVF, though they do not directly improve success rates.' },
    { practice: 'Herbal teas during stimulation',safe: false, status: 'AVOID',   reason: 'Many herbs interact with IVF medications or affect hormone levels. Avoid all herbal supplements unless explicitly approved by your clinic.' },
  ],
  menstrual: [
    { practice: 'Heat therapy for cramps',       safe: true,  status: 'SAFE',    reason: 'Applying heat (hot water bottle, heat patch) to the lower abdomen is evidence-backed for reducing period pain and is completely safe.' },
    { practice: 'Magnesium supplementation',     safe: true,  status: 'SAFE',    reason: 'Magnesium (200–360mg/day) has good evidence for reducing period pain and PMS symptoms. Generally safe at recommended doses.' },
    { practice: 'Avoiding cold foods/drinks',    safe: true,  status: 'SAFE',    reason: 'No strong evidence this affects period pain, but it is a long-standing cultural practice and avoiding very cold foods causes no harm.' },
    { practice: 'Raspberry leaf tea',            safe: true,  status: 'SAFE',    reason: 'Traditionally used for menstrual cramps. Small amounts are generally safe, though large doses may have uterine-stimulating effects.' },
    { practice: 'Restriction from activities',   safe: false, status: 'CAUTION', reason: 'Light to moderate exercise during menstruation is evidence-backed to reduce cramps and improve mood. Complete restriction is not recommended.' },
  ],
};

// ─── Constants ─────────────────────────────────────────────────────────────────

const MAX_INSIGHT_DAYS = 14;
const JOURNEY_LABELS = {
  pregnant: 'pregnancy',
  ttc: 'trying to conceive',
  ivf: 'IVF treatment',
  mom: 'postpartum',
  menopause: 'menopause',
  menstrual: 'menstrual health',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function todayKey() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function dateKey(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function entryRef(userId, key) {
  return doc(db, 'healthLogs', userId, 'entries', key);
}

function buildInsightPrompt(entries, journeyType) {
  const journeyLabel = JOURNEY_LABELS[journeyType] || 'reproductive health';

  // Build summary of entries
  const summary = entries.map((e) => {
    const syms = (e.symptoms || [])
      .map((s) => `${s.label} (severity ${s.severity}/5)`)
      .join(', ');
    const vitals = [
      e.bp ? `BP ${e.bp.sys}/${e.bp.dia}` : null,
      e.weight ? `Weight ${e.weight.kg}kg` : null,
      e.mood ? `Mood: ${e.mood}` : null,
    ].filter(Boolean).join(', ');
    return `${e.id}: symptoms=[${syms || 'none'}]${vitals ? `, vitals=[${vitals}]` : ''}`;
  }).join('\n');

  return `You are a compassionate women's health assistant supporting a user on their ${journeyLabel} journey.

The user has logged the following health data over the past ${entries.length} day(s):

${summary}

Based ONLY on this real logged data:
1. Write a brief, warm 2-sentence summary of their recent symptom patterns.
2. List up to 3 specific flags or observations worth noting (be clinical but gentle).
3. Provide up to 3 practical, evidence-based tips tailored to their most common symptoms.

Respond in JSON only, exactly this shape:
{
  "summary": "...",
  "flags": ["...", "...", "..."],
  "tips": ["...", "...", "..."]
}`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useHealthData({ journeyType = '' } = {}) {
  const userId = auth.currentUser?.uid;
  const today = todayKey();

  const [todayEntry, setTodayEntry] = useState(null);
  const [recentEntries, setRecent] = useState([]);
  const [loadingToday, setLoadingT] = useState(true);
  const [loadingRecent, setLoadingR] = useState(true);
  const [saving, setSaving] = useState(false);
  const [insightLoading, setInsLoading] = useState(false);
  const [insightError, setInsError] = useState(null);

  // ── Real-time listener for today's entry ─────────────────────────────────
  useEffect(() => {
    if (!userId) {
      setLoadingT(false);
      return;
    }

    const unsub = onSnapshot(
      entryRef(userId, today),
      (snap) => {
        setTodayEntry(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setLoadingT(false);
      },
      (err) => {
        console.error('[useHealthData today]', err);
        setLoadingT(false);
      }
    );

    return () => unsub();
  }, [userId, today]);

  // ── One-time fetch for recent days (for heatmap / trends) ──────────────
  useEffect(() => {
    if (!userId) {
      setLoadingR(false);
      return;
    }

    const keys = Array.from({ length: MAX_INSIGHT_DAYS }, (_, i) => dateKey(i));

    Promise.all(keys.map((k) => getDoc(entryRef(userId, k))))
      .then((snaps) => {
        setRecent(
          snaps
            .filter((s) => s.exists())
            .map((s) => ({ id: s.id, ...s.data() }))
        );
        setLoadingR(false);
      })
      .catch((err) => {
        console.error('[useHealthData recent]', err);
        setLoadingR(false);
      });
  }, [userId]);

  // ── Log symptoms for today ────────────────────────────────────────────────
  const logSymptoms = useCallback(
    async (symptoms) => {
      if (!userId) return;
      setSaving(true);
      try {
        await setDoc(
          entryRef(userId, today),
          {
            symptoms,
            journeyType,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (e) {
        console.error('[logSymptoms]', e);
      } finally {
        setSaving(false);
      }
    },
    [userId, today, journeyType]
  );

  // ── Log a single vitals field for today ──────────────────────────────────
  const logVital = useCallback(
    async (field, value) => {
      if (!userId) return;
      setSaving(true);
      try {
        await setDoc(
          entryRef(userId, today),
          {
            [field]: value,
            journeyType,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (e) {
        console.error('[logVital]', e);
      } finally {
        setSaving(false);
      }
    },
    [userId, today, journeyType]
  );

  // ── Generate AI health insight from real logged data ──────────────────────
  const generateInsight = useCallback(async () => {
    if (!userId) {
      setInsError('Please sign in to generate health insights.');
      return;
    }

    setInsLoading(true);
    setInsError(null);

    try {
      // Fetch recent entries
      const keys = Array.from({ length: MAX_INSIGHT_DAYS }, (_, i) => dateKey(i));
      const snaps = await Promise.all(keys.map((k) => getDoc(entryRef(userId, k))));
      const entries = snaps
        .filter((s) => s.exists())
        .map((s) => ({ id: s.id, ...s.data() }));

      if (entries.length === 0) {
        setInsError(
          'No health data logged yet. Start logging symptoms today and your AI insight will reflect your real health patterns.'
        );
        setInsLoading(false);
        return;
      }

      // Build prompt
      const prompt = buildInsightPrompt(entries, journeyType);

      // ─── SECURE: Use Cloud Function proxy via useBloom ──────────────────
      const insightText = await sendToBloom(
        prompt,
        [], // No history needed for insight generation
        journeyType,
        'Generate structured health insight from user symptom logs.'
      );

      // Parse JSON response (handle markdown code blocks)
      const clean = insightText.replace(/```json|```/g, '').trim();
      const insight = JSON.parse(clean);

      // Add metadata
      insight.generatedAt = new Date().toISOString();
      insight.basedOnDays = entries.length;

      // Persist to today's entry
      await setDoc(
        entryRef(userId, today),
        {
          aiInsight: insight,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      return insight;

    } catch (e) {
      console.error('[generateInsight]', e);

      if (e instanceof SyntaxError) {
        setInsError('I received a response I couldn\'t understand. Please try again.');
      } else {
        setInsError(e.message || 'Could not generate insight right now. Please try again shortly.');
      }
      return null;
    } finally {
      setInsLoading(false);
    }
  }, [userId, today, journeyType]);

  // ── Heatmap data: severity totals per day over recent days ──────────────
  const heatmapData = recentEntries.map((entry) => {
    const totalSeverity = (entry.symptoms || []).reduce((sum, s) => sum + (s.severity || 1), 0);
    const symptomCount = (entry.symptoms || []).length;
    return {
      date: entry.id,
      totalSeverity,
      symptomCount,
      dominantSymptom: entry.symptoms?.sort((a, b) => b.severity - a.severity)?.[0]?.label || null,
      mood: entry.mood || null,
    };
  });

  return {
    todayEntry,
    recentEntries,
    heatmapData,
    loadingToday,
    loadingRecent,
    saving,
    insightLoading,
    insightError,
    logSymptoms,
    logVital,
    generateInsight,
    symptoms: SYMPTOM_CATALOGUE[journeyType] || SYMPTOM_CATALOGUE.menstrual,
    traditionalPractices: TRADITIONAL_BY_JOURNEY[journeyType] || TRADITIONAL_BY_JOURNEY.menstrual,
  };
}