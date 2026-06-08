// WeightLogging.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/useApp';
import './WeightLogging.css';

export default function WeightLogging() {
  const { journeyType, setActiveTab, userPreferences } = useApp();
  
  // Get unit from user preferences or default to metric
  const unitSystem = userPreferences?.unitSystem || 'metric';
  const weightUnit = unitSystem === 'metric' ? 'kg' : 'lbs';
  const step = unitSystem === 'metric' ? '0.1' : '0.5';
  
  const [weight, setWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [prePregnancyWeight, setPrePregnancyWeight] = useState('');
  const [startWeight, setStartWeight] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loadError, setLoadError] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadWeightData();
  }, []);

  // Auto-dismiss messages
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  const loadWeightData = useCallback(() => {
    try {
      setLoadError(false);
      
      // Load current weight
      const currentWeight = localStorage.getItem('currentWeight');
      if (currentWeight) {
        const weightData = JSON.parse(currentWeight);
        setWeight(weightData.value?.toString() || '');
      } else {
        setWeight('');
      }
      
      // Load goals
      const goals = JSON.parse(localStorage.getItem('weightGoals') || '{}');
      if (goals.targetWeight) setGoalWeight(goals.targetWeight.toString());
      if (goals.prePregnancyWeight) setPrePregnancyWeight(goals.prePregnancyWeight.toString());
      if (goals.startWeight) setStartWeight(goals.startWeight);
      
    } catch (error) {
      console.error('Failed to load weight data:', error);
      setLoadError(true);
      setMessageType('error');
      setSaveMessage('Failed to load weight data. Tap to retry.');
    }
  }, []);

  const showMessage = (msg, type = 'success') => {
    setMessageType(type);
    setSaveMessage(msg);
  };

  const saveWeight = () => {
    if (!weight) {
      showMessage(`Please enter a weight value in ${weightUnit}`, 'error');
      return;
    }
    
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      showMessage(`Please enter a valid weight in ${weightUnit}`, 'error');
      return;
    }
    
    // Save current weight
    const weightData = {
      value: weightNum,
      unit: weightUnit,
      recordedAt: new Date().toISOString()
    };
    
    localStorage.setItem('currentWeight', JSON.stringify(weightData));
    
    // Also append to history if needed elsewhere
    const history = JSON.parse(localStorage.getItem('vitalsHistory') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const todayIndex = history.findIndex(entry => 
      entry.recordedAt?.split('T')[0] === today
    );
    
    if (todayIndex !== -1) {
      history[todayIndex] = { weight: weightNum, recordedAt: new Date().toISOString(), unit: weightUnit };
    } else {
      history.unshift({ weight: weightNum, recordedAt: new Date().toISOString(), unit: weightUnit });
    }
    
    localStorage.setItem('vitalsHistory', JSON.stringify(history));
    window.dispatchEvent(new Event('vitalsUpdated'));
    loadWeightData();
    showMessage('Weight saved successfully!', 'success');
  };

  const saveGoals = () => {
    const goals = JSON.parse(localStorage.getItem('weightGoals') || '{}');
    
    // Validate and save goal weight
    if (goalWeight !== '') {
      const goalNum = parseFloat(goalWeight);
      if (isNaN(goalNum) || goalNum <= 0) {
        showMessage(`Please enter a valid target weight in ${weightUnit}`, 'error');
        return;
      }
      goals.targetWeight = goalNum;
    } else {
      delete goals.targetWeight;
    }
    
    // Validate and save pre-pregnancy weight
    if (journeyType === 'pregnant' && prePregnancyWeight !== '') {
      const prePregNum = parseFloat(prePregnancyWeight);
      if (isNaN(prePregNum) || prePregNum <= 0) {
        showMessage(`Please enter a valid pre-pregnancy weight in ${weightUnit}`, 'error');
        return;
      }
      goals.prePregnancyWeight = prePregNum;
    } else if (journeyType === 'pregnant') {
      delete goals.prePregnancyWeight;
    }
    
    // Save start weight if we have current weight and no start weight exists
    if (!goals.startWeight && weight) {
      const weightNum = parseFloat(weight);
      if (!isNaN(weightNum) && weightNum > 0) {
        goals.startWeight = weightNum;
        setStartWeight(weightNum);
      }
    }
    
    goals.unit = weightUnit;
    localStorage.setItem('weightGoals', JSON.stringify(goals));
    window.dispatchEvent(new Event('weightGoalsUpdated'));
    loadWeightData();
    showMessage('Goals saved successfully!', 'success');
  };

  const calculateChange = () => {
    const weightNum = parseFloat(weight);
    if (!startWeight || isNaN(weightNum)) return null;
    const change = weightNum - startWeight;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0,
      isNegative: change < 0,
      absolute: change
    };
  };

  const calculateTotalGain = () => {
    const weightNum = parseFloat(weight);
    const prePregNum = parseFloat(prePregnancyWeight);
    if (!prePregNum || isNaN(weightNum) || journeyType !== 'pregnant') return null;
    const gain = weightNum - prePregNum;
    return {
      value: Math.abs(gain).toFixed(1),
      isPositive: gain > 0,
      isNegative: gain < 0
    };
  };

  const calculateProgressToGoal = () => {
    const weightNum = parseFloat(weight);
    const goalNum = parseFloat(goalWeight);
    const startNum = startWeight;
    
    if (!weightNum || !goalNum || !startNum) return null;
    
    const totalToChange = Math.abs(goalNum - startNum);
    const changedSoFar = Math.abs(weightNum - startNum);
    const percentage = (changedSoFar / totalToChange) * 100;
    
    return {
      percentage: Math.min(100, Math.max(0, percentage)).toFixed(0),
      isLosing: goalNum < startNum
    };
  };

  const change = calculateChange();
  const totalGain = calculateTotalGain();
  const progress = calculateProgressToGoal();

  return (
    <div className="weight-logging-container">
      <div className="weight-header">
        <button onClick={() => setActiveTab('home')} className="back-btn">
          {'<'}
        </button>
        <h2>Track Your Weight</h2>
      </div>

      {saveMessage && (
        <div className={`message-banner ${messageType}`}>
          {saveMessage}
          {loadError && (
            <button onClick={loadWeightData} className="retry-link">
              Tap to retry
            </button>
          )}
        </div>
      )}
      
      {loadError && !saveMessage && (
        <div className="message-banner error">
          Failed to load data
          <button onClick={loadWeightData} className="retry-link">
            Retry
          </button>
        </div>
      )}
      
      <div className="weight-card">
        <div className="weight-section">
          <h3>Current Weight</h3>
          <div className="weight-input-group">
            <input
              type="number"
              step={step}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={`Enter your weight in ${weightUnit}`}
              className="weight-input"
            />
            <button onClick={saveWeight} className="save-btn">
              Save Weight
            </button>
          </div>
          <p className="weight-hint">
            Log your weight regularly to track your progress
          </p>
          
          {startWeight && change && (
            <>
              <p className="weight-stats">
                Starting weight: <strong>{startWeight} {weightUnit}</strong> · 
                Change: <strong className={change.isPositive ? 'positive-change' : 'negative-change'}>
                  {change.isPositive ? '+' : '-'}{change.value} {weightUnit}
                </strong>
              </p>
              
              {progress && (
                <div className="progress-section">
                  <p className="weight-stats">
                    Progress to goal: <strong>{progress.percentage}%</strong>
                  </p>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="weight-section">
          <h3>Weight Goals</h3>
          <div className="weight-input-group">
            <label>Target Weight ({weightUnit})</label>
            <input
              type="number"
              step={step}
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
              placeholder={`Enter your goal weight in ${weightUnit}`}
              className="weight-input"
            />
          </div>
          
          {journeyType === 'pregnant' && (
            <div className="weight-input-group">
              <label>Pre-pregnancy Weight ({weightUnit})</label>
              <input
                type="number"
                step={step}
                value={prePregnancyWeight}
                onChange={(e) => setPrePregnancyWeight(e.target.value)}
                placeholder={`Enter your pre-pregnancy weight in ${weightUnit}`}
                className="weight-input"
              />
              {totalGain && (
                <p className="weight-stats">
                  Total gain: <strong className={totalGain.isPositive ? 'positive-change' : 'negative-change'}>
                    {totalGain.isPositive ? '+' : '-'}{totalGain.value} {weightUnit}
                  </strong>
                </p>
              )}
            </div>
          )}
          
          <button onClick={saveGoals} className="save-btn">
            Save Goals
          </button>
        </div>
      </div>
    </div>
  );
}