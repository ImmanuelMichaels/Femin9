// src/pages/Partner/index.jsx
import { useState } from 'react';
import { WCard, SectionTitle } from '../../components/ui';
import { useApp } from '../../context/useApp';

// ─── Icons ────────────────────────────────────────────────────────────────────
const MaleIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4108a5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="14" r="5"/>
    <path d="M19 5l-5.5 5.5"/>
    <path d="M15 5h4v4"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

// ─── SA Result Decoder ────────────────────────────────────────────────────────
const SA_PARAMS = [
  {
    id: 'count',
    label: 'Sperm Count',
    unit: 'million/ml',
    normal: '≥ 16 million/ml',
    normalMin: 16,
    tip: 'Total sperm per millilitre of semen. Low count (oligospermia) is one of the most common male fertility issues — often treatable.',
    low: 'Below normal. Can still achieve pregnancy naturally or with IUI/IVF. Discuss with a urologist.',
    normal_msg: 'Within normal WHO reference range. Good baseline.',
    high: 'Above normal. Generally positive — higher count improves natural conception odds.',
  },
  {
    id: 'motility',
    label: 'Total Motility',
    unit: '%',
    normal: '≥ 42%',
    normalMin: 42,
    tip: 'Percentage of sperm that are moving. Motility matters more than count for reaching the egg.',
    low: 'Below normal (asthenospermia). Antioxidants, CoQ10, and lifestyle changes can help. IVF/ICSI bypasses this.',
    normal_msg: 'Normal motility. Good indicator for natural or assisted conception.',
    high: 'Excellent motility — a strong positive sign.',
  },
  {
    id: 'progressive',
    label: 'Progressive Motility',
    unit: '%',
    normal: '≥ 30%',
    normalMin: 30,
    tip: 'Sperm moving in a forward direction. This is the sub-group most likely to fertilise an egg.',
    low: 'Below normal. ICSI (a type of IVF) can still achieve fertilisation with low progressive motility.',
    normal_msg: 'Normal progressive motility. Good for fertilisation potential.',
    high: 'Excellent. Strong forward swimmers.',
  },
  {
    id: 'morphology',
    label: 'Morphology (Kruger)',
    unit: '%',
    normal: '≥ 4%',
    normalMin: 4,
    tip: 'Percentage of sperm with normal shape. Even a healthy male has mostly abnormal-shaped sperm — 4% normal is all that\'s needed.',
    low: 'Below normal (teratospermia). ICSI can select the best-shaped sperm directly. Don\'t panic — 4% is a low bar intentionally.',
    normal_msg: 'Normal morphology. Meets WHO criteria for fertility.',
    high: 'Above average morphology — excellent.',
  },
  {
    id: 'volume',
    label: 'Semen Volume',
    unit: 'ml',
    normal: '≥ 1.4 ml',
    normalMin: 1.4,
    tip: 'Total volume of the ejaculate. Low volume can mean fewer sperm reaching the cervix.',
    low: 'Below normal (hypospermia). May indicate hormonal or anatomical issues. Discuss with a urologist.',
    normal_msg: 'Normal volume. Good carrier for sperm transport.',
    high: 'High volume — generally fine, though very high volume can dilute concentration.',
  },
];

function SADecoder() {
  const [values, setValues] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const getResult = (param, val) => {
    const n = parseFloat(val);
    if (isNaN(n)) return null;
    if (n < param.normalMin) return { status: 'low', color: '#EF4444', bg: '#FEE2E2', msg: param.low };
    if (n >= param.normalMin) return { status: 'normal', color: '#10B981', bg: '#D1FAE5', msg: param.normal_msg };
    return null;
  };

  return (
    <WCard>
      <p style={{ fontSize: 'var(--fs-md)', fontWeight: 800, color: 'var(--dp)', marginBottom: 4 }}>
        🔬 Semen Analysis Decoder
      </p>
      <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginBottom: 16, lineHeight: 1.5 }}>
        Enter values from your semen analysis report to understand what they mean. Based on WHO 2021 reference values.
      </p>

      {SA_PARAMS.map(param => {
        const result = submitted ? getResult(param, values[param.id]) : null;
        return (
          <div key={param.id} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--t)' }}>
                {param.label}
              </label>
              <span style={{ fontSize: 'var(--fs-2xs)', color: 'var(--mt)' }}>
                Normal: {param.normal}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="number"
                placeholder={`Enter ${param.unit}`}
                value={values[param.id] || ''}
                onChange={e => {
                  setValues(prev => ({ ...prev, [param.id]: e.target.value }));
                  setSubmitted(false);
                }}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  fontSize: 'var(--fs-sm)',
                  background: 'var(--card)',
                  color: 'var(--t)',
                }}
              />
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', minWidth: 48 }}>
                {param.unit}
              </span>
            </div>
            <p style={{ fontSize: 'var(--fs-2xs)', color: 'var(--mt)', marginTop: 4, lineHeight: 1.4 }}>
              {param.tip}
            </p>
            {result && (
              <div style={{
                marginTop: 8,
                padding: '10px 12px',
                background: result.bg,
                borderRadius: 8,
                fontSize: 'var(--fs-xs)',
                color: result.color,
                fontWeight: 600,
                lineHeight: 1.5,
              }}>
                {result.status === 'low' ? '⚠️' : '✅'} {result.msg}
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={() => setSubmitted(true)}
        style={{
          width: '100%',
          padding: '12px',
          background: 'var(--dp)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--r)',
          fontSize: 'var(--fs-sm)',
          fontWeight: 700,
          cursor: 'pointer',
          marginTop: 8,
        }}
      >
        Decode My Results
      </button>

      <p style={{ fontSize: 'var(--fs-2xs)', color: 'var(--mt)', marginTop: 12, textAlign: 'center', lineHeight: 1.5 }}>
        This tool is for educational purposes only. Always discuss results with a urologist or fertility specialist.
      </p>
    </WCard>
  );
}

// ─── Content data ─────────────────────────────────────────────────────────────
const LIFESTYLE_FACTORS = [
  {
    icon: '🌡️',
    title: 'Heat Exposure',
    impact: 'High impact',
    color: '#EF4444',
    bg: '#FEE2E2',
    detail: 'Sperm production requires a temperature 2–4°C below body temperature. Avoid hot baths, saunas, and laptops on the lap for extended periods. Loose-fitting underwear helps.',
  },
  {
    icon: '🚬',
    title: 'Smoking',
    impact: 'High impact',
    color: '#EF4444',
    bg: '#FEE2E2',
    detail: 'Smoking reduces sperm count, motility, and DNA integrity. Quitting improves parameters within 3 months — one full sperm production cycle.',
  },
  {
    icon: '🍺',
    title: 'Alcohol',
    impact: 'Moderate impact',
    color: '#F59E0B',
    bg: '#FEF3C7',
    detail: 'Heavy drinking lowers testosterone and sperm quality. Moderate consumption (1–2 units/day) has less impact but reducing intake during active TTC or IVF cycles is advisable.',
  },
  {
    icon: '🏃',
    title: 'Exercise',
    impact: 'Positive',
    color: '#10B981',
    bg: '#D1FAE5',
    detail: 'Moderate aerobic exercise improves testosterone, reduces oxidative stress, and boosts sperm quality. Avoid extreme endurance training and anabolic steroids — both harm fertility.',
  },
  {
    icon: '😴',
    title: 'Sleep',
    impact: 'Positive',
    color: '#10B981',
    bg: '#D1FAE5',
    detail: '7–9 hours of quality sleep optimises testosterone production, which peaks during deep sleep. Chronic sleep deprivation is linked to lower sperm count and motility.',
  },
  {
    icon: '🥗',
    title: 'Diet',
    impact: 'Positive',
    color: '#10B981',
    bg: '#D1FAE5',
    detail: 'A Mediterranean-style diet rich in antioxidants (zinc, selenium, vitamin C, vitamin E) supports sperm DNA integrity. Processed meats, trans fats, and excessive soy may reduce quality.',
  },
  {
    icon: '💊',
    title: 'Supplements',
    impact: 'Supportive',
    color: '#6366F1',
    bg: '#EEF2FF',
    detail: 'Evidence-backed options: CoQ10 (200–600mg/day), zinc, selenium, folic acid, vitamin D, and omega-3. Always discuss with a GP before starting — some interact with medications.',
  },
    {
    icon: '🌿',
    title: 'Traditional Foods & Male Fertility',
    impact: 'Cultural Intelligence',
    color: '#6366F1',
    bg: '#EEF2FF',
    detail: 'Traditional West African, Caribbean, and South Asian foods can support male fertility. Moringa (high in zinc), egusi (rich in antioxidants), bitter leaf (anti-inflammatory), and pumpkin seeds (high in zinc) may improve sperm quality and DNA integrity. This is Femin9\'s unique differentiator — no other app provides culturally specific nutritional guidance for male fertility. Always discuss dietary changes with your GP or fertility specialist.',
  },
  {
    icon: '🧪',
    title: 'Medications & Steroids',
    impact: 'High impact',
    color: '#EF4444',
    bg: '#FEE2E2',
    detail: 'Anabolic steroids, testosterone supplements, some antidepressants, and chemotherapy can severely impair sperm production. Always tell your fertility specialist about all medications.',
  },
];

const JOURNEY_CONTENT = {
  conceive: {
    headline: 'Fertility is a team effort',
    sub: 'Male factor contributes to roughly 50% of fertility challenges. Understanding sperm health gives your journey the complete picture.',
    tips: [
      {
        icon: '📅',
        title: 'Timing intercourse',
        body: 'Sperm survive 3–5 days in the female reproductive tract. Having sex every 1–2 days during the fertile window maximises the chance of sperm being present at ovulation.',
      },
      {
        icon: '⏱️',
        title: 'Abstinence period',
        body: 'Optimal abstinence before a semen analysis or timed intercourse is 2–5 days. Too short reduces count; too long reduces motility.',
      },
      {
        icon: '🩺',
        title: 'When to get tested',
        body: 'If you\'ve been trying for 12 months (6 months if over 35), both partners should be evaluated simultaneously — not sequentially. A semen analysis is simple, non-invasive, and inexpensive.',
      },
      {
        icon: '🔄',
        title: 'Sperm takes 72 days to mature',
        body: 'One full sperm production cycle (spermatogenesis) takes approximately 72–74 days. Lifestyle changes made today won\'t show in a semen analysis for 3 months.',
      },
    ],
  },
  ivf: {
    headline: 'Your role in the IVF cycle',
    sub: 'IVF success depends on egg and sperm quality equally. Here\'s what the male partner can do to optimise outcomes.',
    tips: [
      {
        icon: '📋',
        title: 'Sperm collection day',
        body: 'Aim for 2–5 days abstinence before collection. Attend well-rested, well-hydrated, and avoid alcohol and heavy exercise for 48 hours beforehand.',
      },
      {
        icon: '🧬',
        title: 'ICSI — when it\'s needed',
        body: 'Intracytoplasmic Sperm Injection (ICSI) injects a single sperm directly into an egg. Used when motility, count, or morphology is below threshold, or after failed fertilisation in standard IVF.',
      },
      {
        icon: '🌡️',
        title: '3 months before retrieval',
        body: 'Start optimising 3 months before egg retrieval — that\'s when the sperm being produced now will be used. Quit smoking, reduce alcohol, start supplements, and avoid saunas.',
      },
      {
        icon: '💉',
        title: 'Sperm freezing (banking)',
        body: 'If there\'s concern about collection day performance or travel, sperm can be frozen in advance. Speak to your clinic about banking a backup sample.',
      },
    ],
  },
  pregnant: {
    headline: 'Supporting your partner',
    sub: 'Pregnancy is a shared journey. Here\'s how a partner can provide meaningful support through each trimester.',
    tips: [
      {
        icon: '🏥',
        title: 'Attend appointments',
        body: 'Being present at scans and midwife appointments matters enormously. It signals shared investment and helps you understand what your partner is experiencing medically.',
      },
      {
        icon: '🍳',
        title: 'Practical support',
        body: 'Take over tasks that carry risk (heavy lifting, cleaning with harsh chemicals, cat litter). Cook when nausea strikes. These aren\'t small gestures — they\'re health interventions.',
      },
      {
        icon: '🧠',
        title: 'Understand the trimesters',
        body: 'First trimester: exhaustion and nausea are real even when invisible. Second: often easier — enjoy it. Third: discomfort returns and birth anxiety builds. Adjust your support accordingly.',
      },
      {
        icon: '💬',
        title: 'Paternal mental health',
        body: 'Up to 10% of partners experience antenatal or postnatal depression. You\'re allowed to find this hard. Talk to your GP if you\'re struggling — your wellbeing matters for your family\'s wellbeing.',
      },
    ],
  },
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function Partner() {
  const { journeyType } = useApp();
  const [expandedFactor, setExpandedFactor] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const content = JOURNEY_CONTENT[journeyType] || JOURNEY_CONTENT.conceive;
  const showSADecoder = journeyType === 'conceive' || journeyType === 'ivf';

  const tabs = [
    { id: 'overview', label: 'Overview' },
    ...(showSADecoder ? [{ id: 'decoder', label: 'SA Decoder' }] : []),
    { id: 'lifestyle', label: 'Lifestyle' },
  ];

  return (
    <div className="page-pad">

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--lvl) 0%, var(--sgl) 100%)',
        borderRadius: 'var(--r2)',
        padding: '20px var(--card-p)',
        marginBottom: 'var(--gap-md)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <MaleIcon />
        </div>
        <div>
          <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, color: 'var(--t)', marginBottom: 4 }}>
            {content.headline}
          </h2>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--md)', lineHeight: 1.5 }}>
            {content.sub}
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 'var(--gap-md)',
        overflowX: 'auto',
        paddingBottom: 4,
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: 'none',
              background: activeTab === t.id ? 'var(--dp)' : 'var(--lvl)',
              color: activeTab === t.id ? '#fff' : 'var(--t)',
              fontSize: 'var(--fs-sm)',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview tab ─────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <>
          <SectionTitle title={journeyType === 'pregnant' ? 'Partner Support Tips' : 'Key Facts'} />
          {content.tips.map((tip, i) => (
            <WCard key={i} style={{ marginBottom: 'var(--gap-md)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--r)',
                  background: 'var(--lvl)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  flexShrink: 0,
                }}>
                  {tip.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 800, color: 'var(--dp)', marginBottom: 4 }}>
                    {tip.title}
                  </p>
                  <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--md)', lineHeight: 1.6 }}>
                    {tip.body}
                  </p>
                </div>
              </div>
            </WCard>
          ))}

          {/* Male factor stat callout — shown on TTC and IVF only */}
          {showSADecoder && (
            <WCard style={{ background: 'var(--lvl)', border: '1px solid var(--lv)' }}>
              <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 800, color: 'var(--t)', marginBottom: 8 }}>
                📊 Did you know?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  '~50% of fertility challenges involve a male factor',
                  '1 in 20 men have a low sperm count',
                  'Male fertility declines from age 40 but rarely stops entirely',
                  'Most male factor causes are treatable or workable-around',
                ].map((fact, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--lv)', flexShrink: 0, marginTop: 2 }}>•</span>
                    <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--md)', lineHeight: 1.5 }}>{fact}</p>
                  </div>
                ))}
              </div>
            </WCard>
          )}
        </>
      )}

      {/* ── SA Decoder tab ───────────────────────────────────────────────── */}
      {activeTab === 'decoder' && showSADecoder && (
        <>
          <SectionTitle title="Understand Your Results" />
          <SADecoder />
          <WCard style={{ background: 'var(--warm)', border: '1px solid var(--border)', marginTop: 'var(--gap-md)' }}>
            <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--t)', marginBottom: 8 }}>
              📋 What happens after an abnormal result?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { step: '1', text: 'A second semen analysis is usually requested 2–3 months later to confirm results.' },
                { step: '2', text: 'Referral to a urologist or andrologist for hormonal blood tests (FSH, LH, testosterone).' },
                { step: '3', text: 'Ultrasound to check for varicocele (enlarged testicular veins) — present in 40% of infertile men and often correctable.' },
                { step: '4', text: 'Depending on results: lifestyle interventions, medication, IUI, IVF, or ICSI.' },
              ].map(item => (
                <div key={item.step} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: 'var(--dp)',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 1,
                  }}>
                    {item.step}
                  </div>
                  <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--md)', lineHeight: 1.5 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </WCard>
        </>
      )}

      {/* ── Lifestyle tab ────────────────────────────────────────────────── */}
      {activeTab === 'lifestyle' && (
        <>
          <SectionTitle title="Lifestyle & Sperm Health" />
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginBottom: 16, lineHeight: 1.5, padding: '0 4px' }}>
            Sperm takes 72–74 days to mature. Changes made today affect results in 3 months.
            Tap any factor to learn more.
          </p>
          {LIFESTYLE_FACTORS.map((factor, i) => (
            <WCard
              key={i}
              style={{ marginBottom: 'var(--gap-md)', cursor: 'pointer' }}
              onClick={() => setExpandedFactor(expandedFactor === i ? null : i)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--r)',
                  background: factor.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                }}>
                  {factor.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 800, color: 'var(--t)' }}>
                    {factor.title}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    marginTop: 2,
                    padding: '2px 8px',
                    borderRadius: 10,
                    background: factor.bg,
                    color: factor.color,
                    fontSize: 'var(--fs-2xs)',
                    fontWeight: 700,
                  }}>
                    {factor.impact}
                  </span>
                </div>
                <span style={{ color: 'var(--mt)', fontSize: 18, flexShrink: 0 }}>
                  {expandedFactor === i ? '▲' : '▼'}
                </span>
              </div>
              {expandedFactor === i && (
                <p style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: '1px solid var(--border)',
                  fontSize: 'var(--fs-sm)',
                  color: 'var(--md)',
                  lineHeight: 1.6,
                }}>
                  {factor.detail}
                </p>
              )}
            </WCard>
          ))}
        </>
      )}

      {/* Clinical disclaimer */}
      <div style={{
        marginTop: 8,
        padding: 14,
        background: 'var(--warm)',
        borderRadius: 'var(--r)',
        fontSize: 'var(--fs-2xs)',
        color: 'var(--mt)',
        lineHeight: 1.6,
        textAlign: 'center',
      }}>
        Content is educational only and does not constitute medical advice.
        Always consult a GP, urologist, or fertility specialist for personal guidance.
      </div>
    </div>
  );
}