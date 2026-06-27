// src/pages/PrivacyPolicy.jsx
import { useNavigate } from 'react-router-dom';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 32 }}>
    <h2 style={{
      fontSize: 'var(--fs-lg)',
      fontWeight: 700,
      color: 'var(--t)',
      marginBottom: 12,
      paddingBottom: 8,
      borderBottom: '1px solid var(--border)',
    }}>
      {title}
    </h2>
    <div style={{
      fontSize: 'var(--fs-sm)',
      color: 'var(--md)',
      lineHeight: 1.8,
    }}>
      {children}
    </div>
  </div>
);

const P = ({ children }) => (
  <p style={{ marginBottom: 12 }}>{children}</p>
);

const Ul = ({ items }) => (
  <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
    {items.map((item, i) => (
      <li key={i} style={{ marginBottom: 6 }}>{item}</li>
    ))}
  </ul>
);

export default function PrivacyPolicy({ onBack }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div style={{
      maxWidth: 680,
      margin: '0 auto',
      padding: '24px var(--pad-x) 60px',
      fontFamily: 'var(--font)',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <button
          onClick={handleBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--t)',
            fontSize: 'var(--fs-sm)',
            cursor: 'pointer',
            padding: '8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 24,
          }}
        >
          ← Back
        </button>

        <h1 style={{
          fontSize: 'var(--fs-2xl)',
          fontWeight: 800,
          color: 'var(--t)',
          marginBottom: 8,
        }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)' }}>
          Femin9 — operated by Arvenue UK Ltd<br />
          Last updated: June 2025 · Version 1.0
        </p>

        <div style={{
          marginTop: 20,
          padding: 16,
          background: 'var(--warm)',
          borderRadius: 'var(--r)',
          borderLeft: '4px solid var(--dp)',
          fontSize: 'var(--fs-sm)',
          color: 'var(--md)',
          lineHeight: 1.7,
        }}>
          <strong style={{ color: 'var(--t)' }}>Plain English summary:</strong> Femin9 collects
          sensitive health information to support your reproductive and maternal wellbeing. We store
          your data securely in the UK (Google Cloud, London region). We never sell your data.
          You can delete everything at any time from Settings. This policy explains exactly what we
          collect, why, and your legal rights.
        </div>
      </div>

      {/* 1. Who we are */}
      <Section title="1. Who We Are">
        <P>
          Femin9 is a women's reproductive and maternal health platform operated by{' '}
          <strong>Arvenue UK Ltd</strong>, a company registered in England and Wales.
        </P>
        <P>
          For the purposes of UK data protection law, Arvenue UK Ltd is the{' '}
          <strong>data controller</strong> responsible for your personal data.
        </P>
        <P>
          <strong>Contact:</strong> For any privacy-related queries, email us at{' '}
          <a href="mailto:privacy@femin9.com" style={{ color: 'var(--dp)' }}>privacy@femin9.com</a>.
        </P>
      </Section>

      {/* 2. What data we collect */}
      <Section title="2. What Data We Collect">
        <P>
          We collect the following categories of personal data when you use Femin9:
        </P>

        <p style={{ fontWeight: 700, marginBottom: 6, color: 'var(--t)' }}>
          Account &amp; Identity Data
        </p>
        <Ul items={[
          'Email address and display name (collected at registration)',
          'Profile preferences including language, cultural background, and dietary practices',
          'Authentication data managed securely via Firebase Authentication',
        ]} />

        <p style={{ fontWeight: 700, marginBottom: 6, color: 'var(--t)' }}>
          Special Category Health Data (Article 9, UK GDPR)
        </p>
        <P>
          The following is classified as <strong>special category data</strong> under UK GDPR
          Article 9, and we collect it only with your <strong>explicit consent</strong>:
        </P>
        <Ul items={[
          'Reproductive health information (menstrual cycle data, ovulation tracking, fertility treatment records)',
          'Pregnancy data (estimated due date, gestational week, pregnancy number, birth records)',
          'Postnatal health data (birth date, feeding method, Edinburgh Postnatal Depression Scale screening results)',
          'Menopause stage and symptom logs',
          'IVF and fertility treatment details (treatment type, cycle number, scan and embryo records)',
          'Weight, nutrition, and general health vitals you choose to log',
          'Symptom logs and mood or wellness entries',
          'Conversations with the Bloom AI companion',
        ]} />

        <p style={{ fontWeight: 700, marginBottom: 6, color: 'var(--t)' }}>
          Usage &amp; Technical Data
        </p>
        <Ul items={[
          'App usage patterns (pages visited, features used) — collected anonymously for analytics',
          'Device type and browser type for performance optimisation',
          'Push notification preferences',
        ]} />
      </Section>

      {/* 3. Why we collect it and our lawful basis */}
      <Section title="3. Why We Collect Your Data and Our Lawful Basis">
        <P>
          Under UK GDPR, we must have a lawful basis for processing your data. For special
          category health data, we must additionally satisfy a condition under Article 9(2).
        </P>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 'var(--fs-xs)',
            marginBottom: 16,
          }}>
            <thead>
              <tr style={{ background: 'var(--warm)' }}>
                {['Purpose', 'Data Used', 'Lawful Basis', 'Article 9 Condition'].map(h => (
                  <th key={h} style={{
                    padding: '10px 12px',
                    textAlign: 'left',
                    borderBottom: '2px solid var(--border)',
                    fontWeight: 700,
                    color: 'var(--t)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Providing personalised health tracking and insights', 'Health data, journey data', 'Consent (Art. 6(1)(a))', 'Explicit consent (Art. 9(2)(a))'],
                ['AI companion (Bloom) responses', 'Conversation history, health context', 'Consent (Art. 6(1)(a))', 'Explicit consent (Art. 9(2)(a))'],
                ['Clinical screening (e.g. EPDS)', 'Questionnaire responses, postnatal data', 'Consent (Art. 6(1)(a))', 'Explicit consent (Art. 9(2)(a))'],
                ['Account management and authentication', 'Email, UID', 'Contract (Art. 6(1)(b))', 'N/A'],
                ['Improving the app via anonymous analytics', 'Anonymised usage data', 'Legitimate interests (Art. 6(1)(f))', 'Not applicable — data is anonymised'],
                ['Sending marketing emails (if opted in)', 'Email address', 'Consent (Art. 6(1)(a))', 'N/A'],
                ['Complying with legal obligations', 'As required by law', 'Legal obligation (Art. 6(1)(c))', 'N/A'],
              ].map(([purpose, data, basis, art9], i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {[purpose, data, basis, art9].map((cell, j) => (
                    <td key={j} style={{ padding: '10px 12px', verticalAlign: 'top' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* 4. Where your data is stored */}
      <Section title="4. Where Your Data Is Stored">
        <P>
          Your data is stored in <strong>Google Cloud Platform (Firebase)</strong>, configured to
          the <strong>europe-west2 (London, United Kingdom)</strong> region. This means your
          personal and health data does not leave the UK.
        </P>
        <P>
          Google LLC acts as our <strong>data processor</strong> under a Data Processing Agreement
          compliant with UK GDPR. Google's processing is governed by the{' '}
          <a
            href="https://cloud.google.com/terms/data-processing-addendum"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--dp)' }}
          >
            Google Cloud Data Processing Addendum
          </a>.
        </P>
        <P>
          We do not transfer your data to countries outside the UK or European Economic Area
          without appropriate safeguards in place.
        </P>
      </Section>

      {/* 5. How long we keep your data */}
      <Section title="5. How Long We Keep Your Data">
        <Ul items={[
          'Active account data: retained for as long as your account is active',
          'Health tracking data: retained until you delete it or close your account',
          'Conversation history with Bloom AI: retained until you delete it from Settings',
          'Consent records: retained for 6 years from the date of consent (legal requirement)',
          'Anonymous analytics data: retained for up to 26 months',
          'Backup copies: purged within 30 days of account deletion',
        ]} />
        <P>
          When you delete your account, all personally identifiable data is deleted within{' '}
          <strong>30 days</strong>, except where we are legally required to retain it.
        </P>
      </Section>

      {/* 6. Your rights */}
      <Section title="6. Your Rights Under UK GDPR">
        <P>You have the following rights regarding your personal data:</P>
        <Ul items={[
          'Right of access — request a copy of all data we hold about you',
          'Right to rectification — correct inaccurate or incomplete data',
          'Right to erasure ("right to be forgotten") — delete your account and all data',
          'Right to restrict processing — limit how we use your data',
          'Right to data portability — receive your data in a machine-readable format',
          'Right to withdraw consent — at any time, without affecting prior processing',
          'Right to object — object to processing based on legitimate interests',
          'Rights related to automated decision-making — we do not make solely automated decisions that have legal or significant effects on you',
        ]} />
        <P>
          To exercise any of these rights, email{' '}
          <a href="mailto:privacy@femin9.com" style={{ color: 'var(--dp)' }}>privacy@femin9.com</a>.
          We will respond within <strong>30 days</strong>.
        </P>
        <P>
          You also have the right to lodge a complaint with the{' '}
          <strong>Information Commissioner's Office (ICO)</strong> at{' '}
          <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--dp)' }}>
            ico.org.uk
          </a>{' '}
          or by calling 0303 123 1113.
        </P>
      </Section>

      {/* 7. Withdrawing consent */}
      <Section title="7. Withdrawing Consent">
        <P>
          You may withdraw any consent you have given at any time by going to{' '}
          <strong>Settings → Privacy &amp; Consent</strong> within the app. Withdrawing consent
          does not affect the lawfulness of processing carried out before withdrawal.
        </P>
        <P>
          Please note that withdrawing consent for <strong>Health Data Processing</strong> will
          prevent us from providing personalised health insights and recommendations, as this is
          the core function of the app.
        </P>
      </Section>

      {/* 8. Sharing your data */}
      <Section title="8. Who We Share Your Data With">
        <P>
          We do not sell, rent, or trade your personal data. We share data only with:
        </P>
        <Ul items={[
          'Google LLC (Firebase) — cloud infrastructure and data storage, as described above',
          'Anthropic PBC — AI model provider for Bloom AI responses (data is not retained by Anthropic beyond the request)',
          'Our clinical advisory team — only anonymised or aggregated data for clinical governance review',
          'Law enforcement or regulators — only where legally required to do so',
        ]} />
      </Section>

      {/* 9. Security */}
      <Section title="9. Security">
        <P>
          We implement appropriate technical and organisational measures to protect your data,
          including:
        </P>
        <Ul items={[
          'Encryption in transit (TLS 1.2+) and at rest (AES-256 via Firebase)',
          'Role-based access controls — only authorised personnel can access user data',
          'Firebase Security Rules restricting data access to the authenticated account owner',
          'Regular security reviews as part of our development process',
        ]} />
        <P>
          No system is completely secure. In the event of a data breach affecting your rights and
          freedoms, we will notify you and the ICO within 72 hours as required by UK GDPR.
        </P>
      </Section>

      {/* 10. Clinical disclaimer */}
      <Section title="10. Clinical Disclaimer">
        <P>
          Femin9 is a <strong>health and wellness tracking application</strong> and is not a
          regulated medical device under the UK Medical Devices Regulations 2002 (as amended).
          Content and AI responses are for informational purposes only and do not constitute
          medical advice, diagnosis, or treatment.
        </P>
        <P>
          Always consult your GP, midwife, or qualified healthcare professional for medical
          decisions. In an emergency, call 999 or attend your nearest A&amp;E.
        </P>
      </Section>

      {/* 11. Children */}
      <Section title="11. Children's Privacy">
        <P>
          Femin9 is intended for users aged <strong>18 and over</strong>. We do not knowingly
          collect data from anyone under 18. If you believe a minor has created an account,
          please contact us immediately at{' '}
          <a href="mailto:privacy@femin9.com" style={{ color: 'var(--dp)' }}>privacy@femin9.com</a>{' '}
          and we will delete the account and all associated data.
        </P>
      </Section>

      {/* 12. Changes */}
      <Section title="12. Changes to This Policy">
        <P>
          We may update this Privacy Policy from time to time. When we make material changes, we
          will notify you in-app and ask you to review and re-accept the updated policy before
          continuing to use Femin9. The version number and date at the top of this page reflect
          the current version.
        </P>
      </Section>

      {/* Footer */}
      <div style={{
        marginTop: 40,
        padding: 20,
        background: 'var(--warm)',
        borderRadius: 'var(--r)',
        fontSize: 'var(--fs-xs)',
        color: 'var(--mt)',
        textAlign: 'center',
        lineHeight: 1.7,
      }}>
        <strong style={{ color: 'var(--t)' }}>Arvenue UK Ltd</strong><br />
        Registered in England and Wales<br />
        privacy@femin9.com · femin9.com<br /><br />
        This policy is governed by the laws of England and Wales.
      </div>
    </div>
  );
}
