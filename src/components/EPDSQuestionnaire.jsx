// src/components/EPDSQuestionnaire.jsx
import { useState } from 'react';
import { WCard, Button } from './ui';

// EXACT EPDS questions - DO NOT MODIFY
const EPDS_QUESTIONS = [
  {
    id: 1,
    text: "I have been able to laugh and see the funny side of things",
    options: [
      { score: 0, text: "As much as I always could" },
      { score: 1, text: "Not quite so much now" },
      { score: 2, text: "Definitely not so much now" },
      { score: 3, text: "Not at all" }
    ]
  },
  {
    id: 2,
    text: "I have looked forward with enjoyment to things",
    options: [
      { score: 0, text: "As much as I ever did" },
      { score: 1, text: "Rather less than I used to" },
      { score: 2, text: "Definitely less than I used to" },
      { score: 3, text: "Hardly at all" }
    ]
  },
  {
    id: 3,
    text: "I have blamed myself unnecessarily when things went wrong",
    options: [
      { score: 0, text: "No, never" },
      { score: 1, text: "Not very often" },
      { score: 2, text: "Yes, some of the time" },
      { score: 3, text: "Yes, most of the time" }
    ]
  },
  {
    id: 4,
    text: "I have been anxious or worried for no good reason",
    options: [
      { score: 0, text: "No, not at all" },
      { score: 1, text: "Hardly ever" },
      { score: 2, text: "Yes, sometimes" },
      { score: 3, text: "Yes, very often" }
    ]
  },
  {
    id: 5,
    text: "I have felt scared or panicky for no very good reason",
    options: [
      { score: 0, text: "No, not at all" },
      { score: 1, text: "Hardly ever" },
      { score: 2, text: "Yes, sometimes" },
      { score: 3, text: "Yes, quite a lot" }
    ]
  },
  {
    id: 6,
    text: "Things have been getting on top of me",
    options: [
      { score: 0, text: "Yes, most of the time I haven't been able to cope at all" },
      { score: 1, text: "Yes, sometimes I haven't been coping as well as usual" },
      { score: 2, text: "No, most of the time I have coped quite well" },
      { score: 3, text: "No, I have been coping as well as ever" }
    ]
  },
  {
    id: 7,
    text: "I have been so unhappy that I have had difficulty sleeping",
    options: [
      { score: 0, text: "Yes, most of the time" },
      { score: 1, text: "Yes, sometimes" },
      { score: 2, text: "Not very often" },
      { score: 3, text: "No, not at all" }
    ]
  },
  {
    id: 8,
    text: "I have felt sad or miserable",
    options: [
      { score: 0, text: "Yes, most of the time" },
      { score: 1, text: "Yes, quite often" },
      { score: 2, text: "Not very often" },
      { score: 3, text: "No, not at all" }
    ]
  },
  {
    id: 9,
    text: "I have been so unhappy that I have been crying",
    options: [
      { score: 0, text: "Yes, most of the time" },
      { score: 1, text: "Yes, quite often" },
      { score: 2, text: "Only occasionally" },
      { score: 3, text: "No, never" }
    ]
  },
  {
    id: 10,
    text: "The thought of harming myself has occurred to me",
    options: [
      { score: 0, text: "Yes, quite often" },
      { score: 1, text: "Sometimes" },
      { score: 2, text: "Hardly ever" },
      { score: 3, text: "Never" }
    ]
  }
];

export default function EPDSQuestionnaire({ onComplete }) {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  
  const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
  
  const handleAnswer = (questionId, score) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
  };
  
  const handleSubmit = () => {
    if (Object.keys(answers).length < 10) return;
    setShowResults(true);
    if (onComplete) onComplete(totalScore);
  };
  
  const getResultMessage = () => {
    if (totalScore >= 13) {
      return {
        severity: "urgent",
        title: "Please speak to your GP or health visitor",
        message: "Your score suggests possible depression. This is common and treatable. Please make an appointment with your GP or health visitor this week. You don't have to go through this alone."
      };
    } else if (totalScore >= 10) {
      return {
        severity: "warning",
        title: "Consider speaking with a professional",
        message: "Your score suggests you might be experiencing some symptoms of depression. Consider speaking with your health visitor or GP for support."
      };
    } else {
      return {
        severity: "normal",
        title: "Your score is within the normal range",
        message: "Continue to monitor how you're feeling. Reach out for support if things change."
      };
    }
  };
  
  if (showResults) {
    const result = getResultMessage();
    return (
      <WCard>
        <h3 style={{ fontSize: "var(--fs-lg)", marginBottom: "var(--sp-3)" }}>Your EPDS Score: {totalScore}/30</h3>
        <div style={{
          background: result.severity === "urgent" ? "var(--rdl)" : result.severity === "warning" ? "var(--gdl)" : "var(--sgl)",
          padding: "var(--sp-4)",
          borderRadius: "var(--r)",
          marginBottom: "var(--sp-3)"
        }}>
          <p style={{ fontWeight: 800, marginBottom: "var(--sp-2)" }}>{result.title}</p>
          <p style={{ fontSize: "var(--fs-sm)" }}>{result.message}</p>
        </div>
        {result.severity === "urgent" && (
          <div style={{ background: "var(--rdl)", padding: "var(--sp-3)", borderRadius: "var(--r)" }}>
            <p style={{ fontWeight: 800, color: "var(--rd)" }}>📞 Immediate Support:</p>
            <p>Samaritans: 116 123 (24/7, free)</p>
            <p>NHS 111: For urgent medical advice</p>
            <p>999: If you're at immediate risk of harm</p>
          </div>
        )}
        <Button onClick={() => setShowResults(false)} fullWidth style={{ marginTop: "var(--sp-3)" }}>Retake Test</Button>
      </WCard>
    );
  }
  
  return (
    <WCard>
      <h3 style={{ fontSize: "var(--fs-lg)", marginBottom: "var(--sp-1)" }}>Edinburgh Postnatal Depression Scale</h3>
      <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginBottom: "var(--sp-4)" }}>
        Please select the answer that comes closest to how you have felt IN THE PAST 7 DAYS
      </p>
      
      {EPDS_QUESTIONS.map(q => (
        <div key={q.id} style={{ marginBottom: "var(--sp-4)", paddingBottom: "var(--sp-3)", borderBottom: "1px solid var(--border)" }}>
          <p style={{ fontWeight: 700, marginBottom: "var(--sp-2)", fontSize: "var(--fs-sm)" }}>{q.id}. {q.text}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-1)" }}>
            {q.options.map((opt, i) => (
              <label key={i} style={{ display: "flex", alignItems: "center", gap: "var(--gap-sm)", fontSize: "var(--fs-sm)" }}>
                <input
                  type="radio"
                  name={`q${q.id}`}
                  onChange={() => handleAnswer(q.id, opt.score)}
                  checked={answers[q.id] === opt.score}
                />
                {opt.text}
              </label>
            ))}
          </div>
        </div>
      ))}
      
      <Button onClick={handleSubmit} disabled={Object.keys(answers).length < 10} fullWidth>
        View Results
      </Button>
    </WCard>
  );
}