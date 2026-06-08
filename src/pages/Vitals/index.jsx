import React, { useState, useEffect, useMemo, useCallback, useReducer, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { WCard, SectionTitle, Tag } from '../../components/ui';
import EmergencyRedFlags from '../../components/EmergencyRedFlags';
import { useApp } from '../../context/useApp';

// ==============================
// CONSTANTS & TYPES
// ==============================

const VITALS_STORAGE_KEY = 'vitalsHistory';
const MAX_HISTORY_SIZE = 30;
const DEBOUNCE_DELAY_MS = 500;

const BP_RANGES = {
  MIN_SYS: 80,
  MAX_SYS: 180,
  MIN_DIA: 40,
  MAX_DIA: 120,
  HIGH_SYS: 140,
  HIGH_DIA: 90,
  LOW_SYS: 90,
};

const TEMP_RANGES = {
  MIN: 35,
  MAX: 42,
  FEVER: 38.5,
  ELEVATED: 37.5,
};

const WEIGHT_RANGES = {
  MIN: 40,
  MAX: 120,
};

const JOURNEY_LABELS = {
  pregnant: 'Pregnancy',
  conceive: 'Fertility',
  ivf: 'IVF',
  mom: 'Motherhood',
  menopause: 'Menopause',
};

// ==============================
// REDUCERS
// ==============================

const vitalsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_BP_SYS':
      return { ...state, bpSys: action.payload };
    case 'SET_BP_DIA':
      return { ...state, bpDia: action.payload };
    case 'SET_WEIGHT':
      return { ...state, weight: action.payload };
    case 'SET_TEMP':
      return { ...state, temp: action.payload };
    case 'SET_BLEEDING':
      return { ...state, bleeding: action.payload };
    case 'SET_FETAL_MOVEMENT':
      return { ...state, fetalMovement: action.payload };
    case 'LOAD_FROM_HISTORY':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

const uiReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_CARD':
      return { ...state, [action.card]: action.isVisible };
    case 'RESET_ALL_CARDS':
      return {
        showBP: true,
        showWeight: true,
        showTemp: true,
        showPregnancyMonitor: true,
        showBPTrend: true,
        showSaveFeedback: false,
      };
    case 'SET_SAVE_FEEDBACK':
      return { ...state, showSaveFeedback: action.payload };
    default:
      return state;
  }
};

// ==============================
// CUSTOM HOOKS
// ==============================

const useVitalsHistory = () => {
  const [history, setHistory] = useState([]);
  const saveTimeoutRef = useRef(null);

  // Load history on mount with error handling
  useEffect(() => {
    try {
      const saved = localStorage.getItem(VITALS_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      setHistory(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      console.error('Failed to load vitals history:', error);
      setHistory([]);
    }
  }, []);

  const saveVitals = useCallback((vitalsData) => {
    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save
    saveTimeoutRef.current = setTimeout(() => {
      try {
        setHistory(prev => {
          const newHistory = [vitalsData, ...prev].slice(0, MAX_HISTORY_SIZE);
          localStorage.setItem(VITALS_STORAGE_KEY, JSON.stringify(newHistory));
          return newHistory;
        });
      } catch (error) {
        console.error('Failed to save vitals:', error);
      }
    }, DEBOUNCE_DELAY_MS);
  }, []);

  const getCurrentVitals = useCallback(() => {
    return history[0] || null;
  }, [history]);

  const getHistoryForTrend = useCallback(() => {
    return history.slice(0, 7).reverse();
  }, [history]);

  return { history, saveVitals, getCurrentVitals, getHistoryForTrend };
};

const useInputValidation = () => {
  const validateBP = useCallback((sys, dia) => {
    return sys >= BP_RANGES.MIN_SYS && sys <= BP_RANGES.MAX_SYS &&
           dia >= BP_RANGES.MIN_DIA && dia <= BP_RANGES.MAX_DIA;
  }, []);

  const validateWeight = useCallback((weight) => {
    return weight >= WEIGHT_RANGES.MIN && weight <= WEIGHT_RANGES.MAX;
  }, []);

  const validateTemp = useCallback((temp) => {
    return temp >= TEMP_RANGES.MIN && temp <= TEMP_RANGES.MAX;
  }, []);

  return { validateBP, validateWeight, validateTemp };
};

// ==============================
// COMPONENTS
// ==============================

const ToggleSwitch = React.memo(({ isOn, onToggle, label, ariaLabel }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <button
      onClick={onToggle}
      onKeyPress={handleKeyPress}
      aria-label={ariaLabel || `${label} blood pressure section`}
      aria-pressed={isOn}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sp-2)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <span style={{
        fontSize: 'var(--fs-xs)',
        color: 'var(--mt)',
        marginRight: 'var(--sp-1)',
      }}>
        {label}
      </span>
      <div
        style={{
          width: 44,
          height: 24,
          borderRadius: 30,
          background: isOn ? 'var(--sg)' : 'var(--border)',
          transition: 'background 0.25s',
          position: 'relative',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{
          position: 'absolute',
          top: 2,
          left: isOn ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.25s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
    </button>
  );
});

ToggleSwitch.displayName = 'ToggleSwitch';

const BPCard = React.memo(({ 
  bpSys, bpDia, onSysChange, onDiaChange, 
  bpStatus, isVisible, onHide 
}) => {
  if (!isVisible) return null;

  return React.createElement(WCard, {
    style: {
      background: "linear-gradient(135deg, #fff, #f8f9fa)",
      borderRadius: "20px",
      padding: "24px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
      border: "none",
      marginBottom: "20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "normal",
      fontFamily: "Poppins, sans-serif",
    }
  },
    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "var(--sp-4)" } },
      React.createElement("p", { style: { fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)" } }, "Blood Pressure"),
      React.createElement("div", { style: { display: "flex", gap: "var(--gap-sm)", alignItems: "center" } },
        React.createElement(Tag, { 
          label: bpStatus, 
          bg: bpStatus === "NORMAL" ? "var(--sgl)" : bpStatus === "HIGH" ? "var(--rdl)" : "var(--bll)", 
          tc: bpStatus === "NORMAL" ? "var(--sg)" : bpStatus === "HIGH" ? "var(--rd)" : "var(--bl)" 
        }),
        React.createElement(ToggleSwitch, { 
          isOn: isVisible, 
          onToggle: onHide, 
          label: "Hide",
          ariaLabel: "Hide blood pressure section"
        })
      )
    ),
    React.createElement("div", { style: { textAlign: "center", marginBottom: "var(--sp-4)" } },
      React.createElement("span", { style: { fontSize: "var(--fs-3xl)", fontWeight: 900, color: bpStatus === "HIGH" ? "var(--rd)" : "var(--sg)" } }, bpSys),
      React.createElement("span", { style: { fontSize: "var(--fs-xl)", color: "var(--mt)", fontWeight: 500 } }, "/", bpDia),
      React.createElement("span", { style: { fontSize: "var(--fs-sm)", color: "var(--mt)", marginLeft: "var(--sp-1)" } }, "mmHg")
    ),
    [
      ["Systolic", bpSys, onSysChange, BP_RANGES.MIN_SYS, BP_RANGES.MAX_SYS, bpSys > BP_RANGES.HIGH_SYS ? "var(--rd)" : "var(--sg)"],
      ["Diastolic", bpDia, onDiaChange, BP_RANGES.MIN_DIA, BP_RANGES.MAX_DIA, bpDia > BP_RANGES.HIGH_DIA ? "var(--rd)" : "var(--sg)"]
    ].map(([label, value, onChange, min, max, color], i) => 
      React.createElement("div", { key: i, style: { marginBottom: "var(--sp-3)" } },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "var(--sp-2)" } },
          React.createElement("span", { style: { fontSize: "var(--fs-sm)", color: "var(--mt)", fontWeight: 600 } }, label),
          React.createElement("span", { style: { fontSize: "var(--fs-md)", fontWeight: 800, color } }, value, " mmHg")
        ),
        React.createElement("input", { 
          type: "range", 
          min: min, 
          max: max, 
          value: value, 
          onChange: (e) => onChange(Number(e.target.value)), 
          style: { accentColor: color },
          "aria-label": `${label} slider`
        })
      )
    ),
    bpStatus === "HIGH" && React.createElement("div", { className: "fu", style: { background: "var(--rdl)", borderRadius: "var(--r)", padding: "var(--sp-3) var(--card-p)", marginTop: "var(--sp-3)" } },
      React.createElement("p", { style: { fontSize: "var(--fs-sm)", color: "var(--rd)", fontWeight: 700 } }, "⚠️ High blood pressure detected. Monitor closely and contact your healthcare provider if persistent.")
    )
  );
});

BPCard.displayName = 'BPCard';

const HiddenCardButton = React.memo(({ title, onShow, isVisible }) => {
  if (isVisible) return null;
  
  return React.createElement("button", {
    onClick: onShow,
    style: {
      width: '100%',
      padding: 'var(--sp-2)',
      background: 'var(--bll)',
      border: '1px solid var(--blm)',
      borderRadius: 'var(--r)',
      color: 'var(--bl)',
      fontWeight: 600,
      cursor: 'pointer',
      marginBottom: 'var(--gap-md)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }
  },
    React.createElement("span", null, title),
    React.createElement(ToggleSwitch, { isOn: false, onToggle: onShow, label: "Show" })
  );
});

HiddenCardButton.displayName = 'HiddenCardButton';

// ==============================
// MAIN COMPONENT
// ==============================

const Vitals = () => {
  const navigate = useNavigate();
  const { journeyType, getCurrentWeek } = useApp();
  const { getCurrentVitals, saveVitals, getHistoryForTrend } = useVitalsHistory();
  const { validateBP, validateWeight, validateTemp } = useInputValidation();
  
  // Load initial data once
  const initialVitals = useMemo(() => {
    const current = getCurrentVitals();
    return {
      bpSys: current?.bpSys ?? 118,
      bpDia: current?.bpDia ?? 76,
      weight: current?.weight ?? 68.4,
      temp: current?.temp ?? 37.1,
      bleeding: current?.bleeding ?? "none",
      fetalMovement: current?.fetalMovement ?? "normal",
    };
  }, [getCurrentVitals]);

  // State management with reducers
  const [vitals, dispatchVitals] = useReducer(vitalsReducer, initialVitals);
  const [uiState, dispatchUi] = useReducer(uiReducer, {
    showBP: true,
    showWeight: true,
    showTemp: true,
    showPregnancyMonitor: true,
    showBPTrend: true,
    showSaveFeedback: false,
  });

  // Memoized status calculations
  const bpStatus = useMemo(() => {
    if (vitals.bpSys > BP_RANGES.HIGH_SYS || vitals.bpDia > BP_RANGES.HIGH_DIA) return "HIGH";
    if (vitals.bpSys < BP_RANGES.LOW_SYS) return "LOW";
    return "NORMAL";
  }, [vitals.bpSys, vitals.bpDia]);

  const tempStatus = useMemo(() => {
    if (vitals.temp > TEMP_RANGES.FEVER) return "FEVER";
    if (vitals.temp > TEMP_RANGES.ELEVATED) return "ELEVATED";
    return "NORMAL";
  }, [vitals.temp]);

  const currentWeek = useMemo(() => {
    return journeyType === 'pregnant' ? getCurrentWeek() : null;
  }, [journeyType, getCurrentWeek]);

  // Get history for trend
  const history = useMemo(() => {
    const last7 = getHistoryForTrend();
    if (last7.length) {
      return last7.map(v => ({
        date: new Date(v.date).getDate().toString(),
        sys: v.bpSys
      }));
    }
    // Fallback mock data for first-time users
    return [
      { date: "22", sys: 118 }, { date: "23", sys: 116 }, { date: "24", sys: 124 },
      { date: "25", sys: 119 }, { date: "26", sys: 122 }, { date: "27", sys: 120 }, 
      { date: "28", sys: 118 }
    ];
  }, [getHistoryForTrend]);

  // Handlers with validation
  const handleSysChange = useCallback((value) => {
    if (validateBP(value, vitals.bpDia)) {
      dispatchVitals({ type: 'SET_BP_SYS', payload: value });
    }
  }, [validateBP, vitals.bpDia]);

  const handleDiaChange = useCallback((value) => {
    if (validateBP(vitals.bpSys, value)) {
      dispatchVitals({ type: 'SET_BP_DIA', payload: value });
    }
  }, [validateBP, vitals.bpSys]);

  const handleWeightChange = useCallback((value) => {
    if (validateWeight(value)) {
      dispatchVitals({ type: 'SET_WEIGHT', payload: value });
    }
  }, [validateWeight]);

  const handleTempChange = useCallback((value) => {
    if (validateTemp(value)) {
      dispatchVitals({ type: 'SET_TEMP', payload: value });
    }
  }, [validateTemp]);

  const handleSaveVitals = useCallback(() => {
    const vitalsData = {
      bpSys: vitals.bpSys,
      bpDia: vitals.bpDia,
      weight: vitals.weight,
      temp: vitals.temp,
      bleeding: vitals.bleeding,
      fetalMovement: vitals.fetalMovement,
      date: new Date().toISOString(),
      version: '1.0',
    };
    
    saveVitals(vitalsData);
    
    dispatchUi({ type: 'SET_SAVE_FEEDBACK', payload: true });
    setTimeout(() => {
      dispatchUi({ type: 'SET_SAVE_FEEDBACK', payload: false });
    }, 3000);
  }, [vitals, saveVitals]);

  const handleBack = useCallback(() => {
    const journey = journeyType || localStorage.getItem('userJourney');
    if (journey && JOURNEY_LABELS[journey]) {
      navigate(`/app/${journey}`);
    } else {
      navigate('/');
    }
  }, [journeyType, navigate]);

  const resetAllCards = useCallback(() => {
    dispatchUi({ type: 'RESET_ALL_CARDS' });
  }, []);

  const getBackButtonLabel = useCallback(() => {
    const journey = journeyType || localStorage.getItem('userJourney');
    return `Back to ${JOURNEY_LABELS[journey] || 'Home'}`;
  }, [journeyType]);

  // Auto-save effect (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const vitalsData = {
        bpSys: vitals.bpSys,
        bpDia: vitals.bpDia,
        weight: vitals.weight,
        temp: vitals.temp,
        bleeding: vitals.bleeding,
        fetalMovement: vitals.fetalMovement,
        date: new Date().toISOString(),
        version: '1.0',
        isAutoSave: true,
      };
      saveVitals(vitalsData);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [vitals, saveVitals]);

  // Check if any card is hidden
  const anyCardHidden = useMemo(() => {
    return !uiState.showBP || !uiState.showWeight || !uiState.showTemp || 
           (journeyType === 'pregnant' && !uiState.showPregnancyMonitor) || 
           !uiState.showBPTrend;
  }, [uiState, journeyType]);

  return React.createElement("div", { className: "page-pad" },
    // Back Button
    React.createElement("button", {
      onClick: handleBack,
      style: {
        background: 'none',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sp-2)',
        color: 'var(--t)',
        fontSize: 'var(--fs-sm)',
        fontWeight: 600,
        cursor: 'pointer',
        marginBottom: 'var(--sp-4)',
        padding: 0,
        fontFamily: "Poppins, sans-serif",
      },
      "aria-label": "Go back"
    },
      React.createElement("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement("line", { x1: "19", y1: "12", x2: "5", y2: "12" }),
        React.createElement("polyline", { points: "12 19 5 12 12 5" })
      ),
      getBackButtonLabel()
    ),
    
    // Emergency Red Flags
    React.createElement(EmergencyRedFlags, {
      bpSys: vitals.bpSys,
      bpDia: vitals.bpDia,
      bleeding: vitals.bleeding,
      fetalMovement: vitals.fetalMovement,
      week: currentWeek
    }),
    
    React.createElement(SectionTitle, { title: "Vital Signs" }),
    
    // Blood Pressure Card
    React.createElement(BPCard, {
      bpSys: vitals.bpSys,
      bpDia: vitals.bpDia,
      onSysChange: handleSysChange,
      onDiaChange: handleDiaChange,
      bpStatus: bpStatus,
      isVisible: uiState.showBP,
      onHide: () => dispatchUi({ type: 'TOGGLE_CARD', card: 'showBP', isVisible: false })
    }),
    
    React.createElement(HiddenCardButton, {
      title: "Blood Pressure",
      onShow: () => dispatchUi({ type: 'TOGGLE_CARD', card: 'showBP', isVisible: true }),
      isVisible: uiState.showBP
    }),

    // Weight Card
    uiState.showWeight && React.createElement(WCard, {
      style: {
        padding: "var(--card-p)",
        background: "linear-gradient(135deg, #fff, #f8f9fa)",
        borderRadius: "20px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        border: "none",
        marginBottom: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        fontFamily: "Poppins, sans-serif",
      }
    },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-2)" } },
        React.createElement("p", { style: { fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase" } }, "Weight"),
        React.createElement(ToggleSwitch, {
          isOn: uiState.showWeight,
          onToggle: () => dispatchUi({ type: 'TOGGLE_CARD', card: 'showWeight', isVisible: false }),
          label: "Hide"
        })
      ),
      React.createElement("div", { style: { fontSize: "var(--fs-2xl)", fontWeight: 900, color: "var(--t)", marginBottom: "var(--sp-2)" } },
        vitals.weight.toFixed(1),
        React.createElement("span", { style: { fontSize: "var(--fs-sm)", fontWeight: 600 } }, " kg")
      ),
      React.createElement("input", {
        type: "range",
        min: WEIGHT_RANGES.MIN,
        max: WEIGHT_RANGES.MAX,
        step: 0.1,
        value: vitals.weight,
        onChange: (e) => handleWeightChange(Number(e.target.value)),
        style: { accentColor: "var(--t)", marginBottom: "var(--sp-2)", width: '100%' },
        "aria-label": "Weight slider"
      }),
      React.createElement("p", { style: { fontSize: "var(--fs-xs)", color: "var(--mt)" } }, "+0.8kg this week")
    ),

    React.createElement(HiddenCardButton, {
      title: "Weight",
      onShow: () => dispatchUi({ type: 'TOGGLE_CARD', card: 'showWeight', isVisible: true }),
      isVisible: uiState.showWeight
    }),

    // Temperature Card
    uiState.showTemp && React.createElement(WCard, {
      style: {
        padding: "var(--card-p)",
        background: "linear-gradient(135deg, #fff, #f8f9fa)",
        borderRadius: "20px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        border: "none",
        marginBottom: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "normal",
        fontFamily: "Poppins, sans-serif",
      }
    },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-2)" } },
        React.createElement("p", { style: { fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--mt)", textTransform: "uppercase" } }, "Temperature"),
        React.createElement(ToggleSwitch, {
          isOn: uiState.showTemp,
          onToggle: () => dispatchUi({ type: 'TOGGLE_CARD', card: 'showTemp', isVisible: false }),
          label: "Hide"
        })
      ),
      React.createElement("div", { style: { fontSize: "var(--fs-2xl)", fontWeight: 900, color: tempStatus === "NORMAL" ? "var(--sg)" : "var(--rd)", marginBottom: "var(--sp-2)" } },
        vitals.temp.toFixed(1),
        React.createElement("span", { style: { fontSize: "var(--fs-sm)", fontWeight: 600 } }, "°C")
      ),
      React.createElement("input", {
        type: "range",
        min: TEMP_RANGES.MIN,
        max: TEMP_RANGES.MAX,
        step: 0.1,
        value: vitals.temp,
        onChange: (e) => handleTempChange(Number(e.target.value)),
        style: { accentColor: tempStatus === "NORMAL" ? "var(--sg)" : "var(--rd)", marginBottom: "var(--sp-2)" },
        "aria-label": "Temperature slider"
      }),
      React.createElement(Tag, {
        label: tempStatus,
        bg: tempStatus === "NORMAL" ? "var(--sgl)" : "var(--rdl)",
        tc: tempStatus === "NORMAL" ? "var(--sg)" : "var(--rd)"
      })
    ),

    React.createElement(HiddenCardButton, {
      title: "Temperature",
      onShow: () => dispatchUi({ type: 'TOGGLE_CARD', card: 'showTemp', isVisible: true }),
      isVisible: uiState.showTemp
    }),

    // Pregnancy Monitoring
    journeyType === 'pregnant' && uiState.showPregnancyMonitor && React.createElement(WCard, {
      style: {
        background: "linear-gradient(135deg, #fff, #f8f9fa)",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        border: "none",
        marginBottom: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "normal",
        fontFamily: "Poppins, sans-serif"
      }
    },
      React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-3)' } },
        React.createElement("p", { style: { fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--dp)" } }, "🤰 Pregnancy Monitoring"),
        React.createElement(ToggleSwitch, {
          isOn: uiState.showPregnancyMonitor,
          onToggle: () => dispatchUi({ type: 'TOGGLE_CARD', card: 'showPregnancyMonitor', isVisible: false }),
          label: "Hide"
        })
      ),
      React.createElement("div", { style: { marginBottom: "var(--sp-3)" } },
        React.createElement("p", { style: { fontSize: "var(--fs-sm)", fontWeight: 700, marginBottom: "var(--sp-2)" } }, "Vaginal Bleeding"),
        React.createElement("div", { style: { display: "flex", gap: "var(--gap-sm)" } },
          [
            { id: "none", label: "None", color: "var(--sg)" },
            { id: "spotting", label: "Spotting", color: "var(--gd)" },
            { id: "light", label: "Light", color: "var(--t)" },
            { id: "heavy", label: "Heavy", color: "var(--rd)" }
          ].map(option => React.createElement("button", {
            key: option.id,
            onClick: () => dispatchVitals({ type: 'SET_BLEEDING', payload: option.id }),
            style: {
              flex: 1,
              padding: "var(--sp-2)",
              borderRadius: "var(--r)",
              background: vitals.bleeding === option.id ? option.color : "var(--warm)",
              color: vitals.bleeding === option.id ? "#fff" : "var(--mt)",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "var(--fs-xs)"
            },
            "aria-label": `Set bleeding to ${option.label}`
          }, option.label))
        )
      ),
      React.createElement("div", null,
        React.createElement("p", { style: { fontSize: "var(--fs-sm)", fontWeight: 700, marginBottom: "var(--sp-2)" } }, "Fetal Movement"),
        React.createElement("div", { style: { display: "flex", gap: "var(--gap-sm)" } },
          [
            { id: "normal", label: "Normal", color: "var(--sg)" },
            { id: "reduced", label: "Reduced", color: "var(--gd)" },
            { id: "none", label: "None", color: "var(--rd)" }
          ].map(option => React.createElement("button", {
            key: option.id,
            onClick: () => dispatchVitals({ type: 'SET_FETAL_MOVEMENT', payload: option.id }),
            style: {
              flex: 1,
              padding: "var(--sp-2)",
              borderRadius: "var(--r)",
              background: vitals.fetalMovement === option.id ? option.color : "var(--warm)",
              color: vitals.fetalMovement === option.id ? "#fff" : "var(--mt)",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "var(--fs-xs)"
            },
            "aria-label": `Set fetal movement to ${option.label}`
          }, option.label))
        )
      )
    ),

    React.createElement(HiddenCardButton, {
      title: "Pregnancy Monitoring",
      onShow: () => dispatchUi({ type: 'TOGGLE_CARD', card: 'showPregnancyMonitor', isVisible: true }),
      isVisible: uiState.showPregnancyMonitor
    }),

    // BP Trend Card
    uiState.showBPTrend && React.createElement(WCard, {
      style: {
        background: "linear-gradient(135deg, #fff, #f8f9fa)",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        border: "none",
        marginBottom: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "normal",
        fontFamily: "Poppins, sans-serif",
      }
    },
      React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' } },
        React.createElement("p", { style: { fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--dp)" } }, "7-Day BP Trend"),
        React.createElement(ToggleSwitch, {
          isOn: uiState.showBPTrend,
          onToggle: () => dispatchUi({ type: 'TOGGLE_CARD', card: 'showBPTrend', isVisible: false }),
          label: "Hide"
        })
      ),
      history.length === 0 ?
        React.createElement("div", { style: { textAlign: 'center', padding: 'var(--sp-5)', color: 'var(--mt)', fontFamily: "Poppins, sans-serif" } },
          React.createElement("p", null, "📊 No BP data yet"),
          React.createElement("p", { style: { fontSize: 'var(--fs-xs)', marginTop: 'var(--sp-2)' } }, "Start logging your blood pressure daily to see your trend here.")
        ) :
        React.createElement(React.Fragment, null,
          React.createElement("div", { className: "chart-wrap" },
            history.map((h, i) => React.createElement("div", { key: i, className: "chart-col" },
              React.createElement("div", { className: "chart-bar", style: {
                height: `${Math.max(4, ((h.sys - 90) / 80) * 100)}%`,
                background: h.sys > 135 ? "var(--rd)" : h.sys > 125 ? "var(--gd)" : "var(--sg)"
              } })
            ))
          ),
          React.createElement("div", { style: { display: "flex", gap: "var(--gap-sm)" } },
            history.map((h, i) => React.createElement("div", { key: i, className: "chart-lbl", style: { flex: 1, fontSize: "var(--fs-2xs)", textAlign: "center" } }, h.date))
          ),
          React.createElement("p", { style: { fontSize: "var(--fs-xs)", color: "var(--mt)", marginTop: "var(--sp-3)", lineHeight: 1.5 } },
            "BP trending over last 7 days. Monitor daily."
          )
        )
    ),

    React.createElement(HiddenCardButton, {
      title: "7-Day BP Trend",
      onShow: () => dispatchUi({ type: 'TOGGLE_CARD', card: 'showBPTrend', isVisible: true }),
      isVisible: uiState.showBPTrend
    }),

    // Reset All Cards Button
    anyCardHidden && React.createElement("button", {
      onClick: resetAllCards,
      style: {
        width: '100%',
        padding: 'var(--sp-3)',
        background: 'var(--dp)',
        border: 'none',
        borderRadius: 'var(--r)',
        color: '#fff',
        fontWeight: 600,
        cursor: 'pointer',
        marginBottom: 'var(--sp-3)'
      },
      "aria-label": "Reset all hidden cards"
    }, "Reset All Cards"),

    // Save Button
    React.createElement("button", {
      onClick: handleSaveVitals,
      className: "btn-primary",
      style: {
        background: "var(--dp)",
        color: "#fff",
        marginBottom: "var(--sp-3)",
        width: '100%',
        padding: 'var(--sp-3)',
        borderRadius: 'var(--r)',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 700
      },
      "aria-label": "Save today's vitals"
    }, "Save Today Vitals"),
    
    // Save Feedback
    uiState.showSaveFeedback && React.createElement("p", { className: "fu", style: { fontSize: "var(--fs-sm)", color: "var(--sg)", textAlign: "center", fontWeight: 800 } },
      "✅ Vitals saved. AI trend updated."
    )
  );
};

export default Vitals;