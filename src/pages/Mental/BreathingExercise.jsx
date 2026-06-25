// src/pages/Mental/BreathingExercise.jsx
// Drop-in replacement for the breathing section of Mental/index.jsx
// Fixes: memory leak, phantom updates after unmount, fake countdown, double-start

import { useState, useEffect, useRef, useCallback } from 'react';

const PHASES   = ['in', 'hold', 'out', 'rest'];
const DURATION = { in: 4, hold: 7, out: 8, rest: 2 }; // seconds

export default function BreathingExercise() {
  const [phase, setPhase]       = useState(null);   // null | 'in'|'hold'|'out'|'rest' | 'done'
  const [cycle, setCycle]       = useState(0);      // 0-based cycle number
  const [seconds, setSeconds]   = useState(0);      // countdown within current phase

  const mountedRef  = useRef(true);
  const runningRef  = useRef(false);   // guards against double-start
  const intervalRef = useRef(null);
  const timeoutRef  = useRef(null);

  // Cleanup on unmount — no phantom state updates
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  // Live countdown ticker for current phase
  useEffect(() => {
    if (!phase || phase === 'done') return;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!mountedRef.current) return;
      setSeconds(s => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [phase]);

  const runPhase = useCallback((phaseIdx, cycleNum) => {
    if (!mountedRef.current) return;
    const phaseName = PHASES[phaseIdx];
    const duration  = DURATION[phaseName];

    setPhase(phaseName);
    setSeconds(duration);
    setCycle(cycleNum);

    timeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      const nextPhaseIdx = (phaseIdx + 1) % 4;
      const nextCycle    = nextPhaseIdx === 0 ? cycleNum + 1 : cycleNum;

      if (nextCycle >= 4 && nextPhaseIdx === 0) {
        setPhase('done');
        runningRef.current = false;
        return;
      }
      runPhase(nextPhaseIdx, nextCycle);
    }, duration * 1000);
  }, []);

  const startBreath = () => {
    if (runningRef.current) return; // guard double-start
    runningRef.current = true;
    runPhase(0, 0);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    clearTimeout(timeoutRef.current);
    runningRef.current = false;
    setPhase(null);
    setCycle(0);
    setSeconds(0);
  };

  // Visual colour per phase
  const PHASE_STYLE = {
    in:   { bg: 'var(--sgl)', border: 'var(--sg)',  scale: '1.2', label: 'Breathe In'  },
    hold: { bg: 'var(--lvl)', border: 'var(--lv)',  scale: '1.2', label: 'Hold'        },
    out:  { bg: 'var(--bll)', border: 'var(--bl)',  scale: '1.0', label: 'Breathe Out' },
    rest: { bg: 'var(--warm)',border: 'var(--gd)',  scale: '1.0', label: 'Rest'        },
  };

  return (
    <div style={{ background: 'linear-gradient(135deg,var(--lvl),#F8F6FE)', border: '1px solid var(--lvm)33', borderRadius: 'var(--r2)', padding: 'var(--card-p)', marginBottom: 'var(--gap-md)' }}>
      <p style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, color: 'var(--lv)', marginBottom: 'var(--sp-2)' }}>
        🌬️ 4-7-8 Breathing
      </p>
      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--mt)', marginBottom: 'var(--sp-4)', lineHeight: 1.5 }}>
        Reduces anxiety and cortisol. Safe for everyone. 4 cycles recommended.
      </p>

      {/* Not started */}
      {!phase && (
        <button onClick={startBreath} className="btn-primary" style={{ background: 'var(--lv)', color: '#fff', padding: '20px' }}>
          ▶ Start Exercise
        </button>
      )}

      {/* Done */}
      {phase === 'done' && (
        <div style={{ textAlign: 'center', padding: 'var(--sp-4)' }}>
          <div style={{ fontSize: 'clamp(36px,9vw,48px)', marginBottom: 'var(--sp-2)' }}>✨</div>
          <p style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, color: 'var(--sg)' }}>
            Well done! 4 cycles complete.
          </p>
          <button
            onClick={reset}
            style={{ marginTop: 'var(--sp-3)', background: 'var(--sg)', color: '#fff', border: 'none', borderRadius: 20, padding: 'clamp(7px,1.8vw,10px) clamp(18px,4.5vw,24px)', fontSize: 'var(--fs-sm)', fontWeight: 800, cursor: 'pointer' }}
          >
            Done
          </button>
        </div>
      )}

      {/* Active */}
      {phase && phase !== 'done' && (() => {
        const ps = PHASE_STYLE[phase];
        return (
          <div style={{ textAlign: 'center', padding: 'var(--sp-4)' }}>
            <div style={{
              width: 'clamp(80px,20vw,110px)',
              height: 'clamp(80px,20vw,110px)',
              borderRadius: '50%',
              background: ps.bg,
              border: `3px solid ${ps.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto var(--sp-3)',
              transition: 'transform 1s ease',
              transform: `scale(${ps.scale})`,
            }}>
              <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 800, color: 'var(--dp)' }}>
                {ps.label}
              </p>
            </div>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--mt)' }}>
              Cycle {cycle + 1} of 4 · {seconds}s
            </p>
          </div>
        );
      })()}
    </div>
  );
}
