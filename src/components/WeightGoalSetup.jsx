import React, { useState, useEffect } from 'react';
import { WCard, SectionTitle } from '../../components/ui';

export default function WeightGoalSetup({ onComplete, onSkip }) {
  const [startWeight, setStartWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [prePregnancyWeight, setPrePregnancyWeight] = useState('');
  const [journeyType, setJourneyType] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('journeyType');
      setJourneyType(saved || '');
      
      const goals = JSON.parse(localStorage.getItem('weightGoals') || '{}');
      if (goals.startWeight) setStartWeight(goals.startWeight);
      if (goals.targetWeight) setTargetWeight(goals.targetWeight);
      if (goals.prePregnancyWeight) setPrePregnancyWeight(goals.prePregnancyWeight);
    } catch (error) {
      console.error('Failed to load weight goals:', error);
    }
  }, []);

  const handleSave = () => {
    const goals = {
      startWeight: startWeight ? parseFloat(startWeight) : null,
      targetWeight: targetWeight ? parseFloat(targetWeight) : null,
      prePregnancyWeight: prePregnancyWeight ? parseFloat(prePregnancyWeight) : null,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('weightGoals', JSON.stringify(goals));
    window.dispatchEvent(new Event('weightGoalsUpdated'));
    
    if (onComplete) onComplete();
  };

  return (
    <div className="page-pad">
      <SectionTitle title="⚖️ Weight Goals" subtitle="Set your personalized weight targets" />
      
      <WCard style={{ marginBottom: 'var(--gap-md)' }}>
        {journeyType === 'pregnant' && (
          <>
            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--sp-1)', fontWeight: 600 }}>
                Pre-pregnancy weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={prePregnancyWeight}
                onChange={(e) => setPrePregnancyWeight(e.target.value)}
                placeholder="e.g., 65"
                className="form-input"
                style={{ width: '100%' }}
              />
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginTop: 'var(--sp-1)' }}>
                This helps track healthy pregnancy weight gain
              </p>
            </div>
            
            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--sp-1)', fontWeight: 600 }}>
                Current weight (kg) - Optional
              </label>
              <input
                type="number"
                step="0.1"
                value={startWeight}
                onChange={(e) => setStartWeight(e.target.value)}
                placeholder="e.g., 67"
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
          </>
        )}
        
        {journeyType !== 'pregnant' && (
          <>
            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--sp-1)', fontWeight: 600 }}>
                Starting weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={startWeight}
                onChange={(e) => setStartWeight(e.target.value)}
                placeholder="e.g., 70"
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--sp-1)', fontWeight: 600 }}>
                Target weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder="e.g., 65"
                className="form-input"
                style={{ width: '100%' }}
              />
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', marginTop: 'var(--sp-1)' }}>
                Your goal weight
              </p>
            </div>
          </>
        )}
        
        <div style={{ display: 'flex', gap: 'var(--gap-md)', marginTop: 'var(--sp-4)' }}>
          <button
            onClick={handleSave}
            style={{ flex: 1, padding: 'var(--sp-3)', background: 'var(--sg)', color: '#fff', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer' }}
          >
            Save Goals
          </button>
          {onSkip && (
            <button
              onClick={onSkip}
              style={{ flex: 1, padding: 'var(--sp-3)', background: 'var(--warm)', border: '1px solid var(--border)', borderRadius: 'var(--r)', cursor: 'pointer' }}
            >
              Skip for Now
            </button>
          )}
        </div>
      </WCard>
      
      <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--mt)', textAlign: 'center' }}>
        You can always update these in Settings later
      </p>
    </div>
  );
}