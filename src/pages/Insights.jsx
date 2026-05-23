// src/pages/Insights.jsx
import { useState, useEffect } from 'react';
import { WCard, SectionTitle, Tag } from '../components/ui';
import { useApp } from '../context/AppContext';

export default function Insights() {
  const { journeyType } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [insights, setInsights] = useState([]);
  const [symptomHeatmap, setSymptomHeatmap] = useState([]);
  
  useEffect(() => {
    // Mock data - replace with API calls
    setInsights([
      { 
        title: 'Blood Pressure', 
        value: '118/76', 
 trend: 'Stable', 
        change: '+0%', 
        color: 'var(--sg)',
        recommendation: 'Continue monitoring daily'
      },
      { 
        title: 'Sleep Quality', 
        value: '7.2 hrs', 
        trend: 'Improving', 
        change: '+0.5 hrs', 
        color: 'var(--bl)',
        recommendation: 'Keep consistent bedtime'
      },
      { 
        title: 'Mood Average', 
        value: 'Good', 
        trend: 'Stable', 
        change: '↑', 
        color: 'var(--t)',
        recommendation: 'Continue daily check-ins'
      },
      { 
        title: 'Kick Count', 
        value: '12/2hr', 
        trend: 'Normal', 
        change: '↑2', 
        color: 'var(--sg)',
        recommendation: 'Great consistency!'
      }
    ]);
    
    // Generate symptom heatmap (last 30 days)
    const heatmap = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      heatmap.push({
        date: date,
        symptoms: ['Nausea', 'Fatigue'].slice(0, Math.floor(Math.random() * 3) + 1),
        severity: Math.floor(Math.random() * 5) + 1
      });
    }
    setSymptomHeatmap(heatmap);
  }, []);
  
  const getSeverityColor = (severity) => {
    if (severity <= 2) return 'var(--sgl)';
    if (severity <= 4) return 'var(--gdl)';
    return 'var(--rdl)';
  };
  
  return (
    <div className="page-pad">
      <SectionTitle 
        title="📊 Health Insights" 
        subtitle="Your personal health patterns and trends" 
      />
      
      {/* Period Selector */}
      <div style={{ display: 'flex', gap: 'var(--gap-sm)', marginBottom: 'var(--sp-4)' }}>
        {['week', 'month', 'year'].map(p => (
          <button
            key={p}
            onClick={() => setSelectedPeriod(p)}
            style={{
              padding: '8px 20px',
              borderRadius: 30,
              background: selectedPeriod === p ? 'var(--t)' : 'var(--warm)',
              color: selectedPeriod === p ? '#fff' : 'var(--md)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              textTransform: 'capitalize'
            }}
          >
            {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'This Year'}
          </button>
        ))}
      </div>
      
      {/* Summary Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
        gap: 'var(--gap-md)',
        marginBottom: 'var(--sp-4)'
      }}>
        {insights.map((insight, i) => (
          <WCard key={i} style={{ textAlign: 'center', padding: 'var(--sp-3)' }}>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginBottom: 'var(--sp-1)' }}>
              {insight.title}
            </p>
            <p style={{ fontSize: 'var(--fs-xl)', fontWeight: 800, color: insight.color, marginBottom: 'var(--sp-1)' }}>
              {insight.value}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--gap-sm)', alignItems: 'center' }}>
              <Tag 
                label={insight.trend} 
                bg={insight.trend === 'Improving' ? 'var(--sgl)' : 'var(--warm)'}
                tc={insight.trend === 'Improving' ? 'var(--sg)' : 'var(--mt)'}
              />
              <span style={{ fontSize: 'var(--fs-2xs)', color: 'var(--mt)' }}>
                {insight.change}
              </span>
            </div>
          </WCard>
        ))}
      </div>
      
      {/* Symptom Heatmap */}
      <SectionTitle title="📅 Symptom Heatmap" subtitle="30-day symptom intensity" />
      <WCard>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 4, minWidth: 600 }}>
            {symptomHeatmap.map((day, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div
                  style={{
                    aspectRatio: 1,
                    background: getSeverityColor(day.severity),
                    borderRadius: 'var(--r)',
                    marginBottom: 4,
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                  title={`${day.date.toLocaleDateString()}: ${day.symptoms.join(', ')}`}
                >
                  <div style={{
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    fontSize: 8,
                    color: day.severity > 3 ? '#fff' : 'var(--mt)'
                  }}>
                    {day.severity}
                  </div>
                </div>
                <div style={{ fontSize: 'var(--fs-2xs)', color: 'var(--mt)' }}>
                  {day.date.getDate()}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--gap-md)', marginTop: 'var(--sp-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--sgl)' }} />
            <span style={{ fontSize: 'var(--fs-2xs)' }}>Mild</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--gdl)' }} />
            <span style={{ fontSize: 'var(--fs-2xs)' }}>Moderate</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--rdl)' }} />
            <span style={{ fontSize: 'var(--fs-2xs)' }}>Severe</span>
          </div>
        </div>
      </WCard>
      
      {/* AI-Powered Recommendations */}
      <SectionTitle title="🤖 AI Recommendations" subtitle="Based on your patterns" />
      <WCard style={{ background: 'linear-gradient(135deg, var(--lvl), #F8F6FE)' }}>
        {[
          { icon: '💤', text: 'Your sleep has improved 15% this week. Keep your 10 PM bedtime consistent.' },
          { icon: '💧', text: 'You\'re drinking 1.8L water daily. Aim for 2.3L during pregnancy.' },
          { icon: '🥗', text: 'Iron-rich foods detected 4/7 days. Add spinach to one more meal.' }
        ].map((rec, i) => (
          <div key={i} style={{ display: 'flex', gap: 'var(--gap-md)', padding: 'var(--sp-3) 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: 24 }}>{rec.icon}</div>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--dp)', flex: 1 }}>{rec.text}</p>
          </div>
        ))}
      </WCard>
      
      {/* Export Button */}
      <WCard>
        <button style={{
          width: '100%',
          padding: 'var(--sp-3)',
          background: 'var(--dp)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--r)',
          fontSize: 'var(--fs-sm)',
          fontWeight: 800,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--gap-sm)'
        }}>
          📄 Export Health Report (PDF)
        </button>
        <p style={{ fontSize: 'var(--fs-2xs)', color: 'var(--mt)', textAlign: 'center', marginTop: 'var(--sp-2)' }}>
          Share with your GP, midwife, or health visitor
        </p>
      </WCard>
    </div>
  );
}