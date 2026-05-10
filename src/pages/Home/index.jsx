import { useState } from 'react';
import {
  Bell, Smile, Laugh, Frown, Meh, AlertCircle,
  CheckCircle2, Circle, TrendingUp, Zap, Hospital,
  Phone, Star, AlertTriangle, ChevronUp, ChevronDown
} from 'lucide-react';
import CalendarStrip from '../../components/ui/CalendarStrip';
import { WCard, SectionTitle, ProgBar, IconBox, Tag } from '../../components/ui';
import { JOURNEY_CONFIG, ALL_TASKS } from '../../data/journey';
import { useApp } from '../../context/AppContext';

export default function Home({ setTab }) {
  const { journeyType, setShowSOS } = useApp();
  const [mood, setMood] = useState(null);
  const [briefingOpen, setBriefingOpen] = useState(false);
  const cfg = JOURNEY_CONFIG[journeyType] || JOURNEY_CONFIG.pregnant;
  const [tasks, setTasks] = useState({ iron: false, water: false, vitals: false, kicks: false, meal: false, walk: false });

  const moods = [
    { Icon: Laugh,      l: "Happy",    v: 5, color: "#F59E0B" },
    { Icon: Smile,      l: "Calm",     v: 4, color: "#10B981" },
    { Icon: Frown,      l: "Low",      v: 2, color: "#6366F1" },
    { Icon: AlertCircle,l: "Anxious",  v: 1, color: "#F97316" },
    { Icon: Meh,        l: "Overwhelm",v: 0, color: "#EF4444" },
  ];

  const briefingItems = [
    { icon: <TrendingUp size={14} />,    text: "Your baby is 600g and growing well. Baby's hearing is developing rapidly — talk and sing today.",           color: "var(--gd)" },
    { icon: <AlertCircle size={14} />,   text: "You missed iron yesterday. Take it this morning with orange juice for maximum absorption.",                    color: "var(--rd)" },
    { icon: <Zap size={14} />,           text: "Baby's predicted active window: 10 AM–12 PM. Perfect time for kick counting.",                                color: "var(--lv)" },
    { icon: <CheckCircle2 size={14} />,  text: "Today's focus nutrient: Calcium. Eat Moi Moi + tiger nuts. Intake is 40% below target.",                      color: "var(--bl)" },
    { icon: <AlertTriangle size={14} />, text: "Mild risk flag: BP trend slightly elevated over 3 days. Monitor and log tonight.",                             color: "var(--rd)" },
    { icon: <Smile size={14} />,         text: "Mood tip: You logged 'anxious' twice this week. Gentle breathing exercise recommended.",                       color: "var(--sg)" },
  ];

  const todayTasks = ALL_TASKS.filter(t => cfg.taskIds.includes(t.id));
  const done = todayTasks.filter(t => tasks[t.id]).length;

  return (
    <div className="page-pad">
      <CalendarStrip />

      {/* AI Morning Briefing */}
      <div style={{
        background: "linear-gradient(135deg,#FEF0DA,#FDE8D0)",
        borderRadius: "var(--r2)", padding: "var(--card-p)",
        marginBottom: "var(--gap-md)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        border: "1px solid #F2D4A8", gap: "var(--gap-md)"
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--gd)", marginBottom: "var(--sp-1)", display: "flex", alignItems: "center", gap: 6 }}>
            <Bell size={16} color="var(--gd)" /> AI Morning Briefing
          </p>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.5, marginBottom: "var(--sp-3)" }}>Your personalised Week 24 summary is ready — baby updates, nutrition flags, mood insights.</p>
          <button onClick={() => setBriefingOpen(!briefingOpen)} style={{
            background: "var(--dp)", color: "#fff", border: "none", borderRadius: 20,
            padding: "clamp(6px,1.5vw,9px) clamp(14px,3.5vw,20px)",
            fontSize: "var(--fs-sm)", fontWeight: 800, cursor: "pointer", minHeight: "var(--touch)",
            display: "flex", alignItems: "center", gap: 6
          }}>
            {briefingOpen ? <><ChevronUp size={14} /> Close</> : "Read Now"}
          </button>
        </div>
        <Bell size={48} color="var(--gd)" strokeWidth={1.5} style={{ flexShrink: 0, opacity: 0.85 }} />
      </div>

      {briefingOpen && (
        <WCard className="fu" style={{ marginBottom: "var(--gap-md)" }}>
          {briefingItems.map((item, i) => (
            <div key={i} style={{
              display: "flex", gap: "var(--gap-sm)",
              marginBottom: "var(--sp-3)", paddingBottom: "var(--sp-3)",
              borderBottom: i < briefingItems.length - 1 ? "1px solid var(--border)" : "none"
            }}>
              <div style={{ width: 5, borderRadius: 3, background: item.color, flexShrink: 0 }} />
              <span style={{ color: item.color, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.65 }}>{item.text}</p>
            </div>
          ))}
        </WCard>
      )}

      {/* Mood Check */}
      {!mood ? (
        <WCard style={{ background: "linear-gradient(135deg,var(--cream),var(--warm))", border: "1px solid var(--border2)" }}>
          <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-3)", display: "flex", alignItems: "center", gap: 6 }}>
            <Smile size={18} color="var(--dp)" /> How are you feeling today?
          </p>
          <div className="mood-row">
            {moods.map(m => (
              <button key={m.v} className="mood-btn" onClick={() => setMood(m)}>
                <m.Icon size={28} color={m.color} strokeWidth={1.8} />
                <small>{m.l}</small>
              </button>
            ))}
          </div>
        </WCard>
      ) : (
        <WCard style={{ background: "var(--sgl)", border: "1px solid var(--sgm)" }}>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--sg)", fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
            <CheckCircle2 size={16} color="var(--sg)" /> Mood logged: {mood.l}
          </p>
          {mood.v <= 1 && <p style={{ fontSize: "var(--fs-xs)", color: "var(--sg)", marginTop: "var(--sp-2)", lineHeight: 1.5 }}>Tap <b>Mind</b> in Menu for emotional support or talk to Bloom AI.</p>}
        </WCard>
      )}

      {/* Daily Progress */}
      <WCard style={{ marginBottom: "var(--sp-2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-3)" }}>
          <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)", display: "flex", alignItems: "center", gap: 6 }}>
            <TrendingUp size={18} color="var(--dp)" /> Daily Progress
          </p>
          <span style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--t)" }}>{done}/{todayTasks.length}</span>
        </div>
        <ProgBar val={done} max={todayTasks.length} />
        <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginTop: "var(--sp-2)" }}>
          {done === 0 ? "Start your wellness journey for today!" : done === todayTasks.length ? "All done! Amazing mama!" : `${todayTasks.length - done} tasks left — you're doing great!`}
        </p>
      </WCard>

      {/* Daily Routine */}
      <SectionTitle title="Daily Routine" action="See all" />
      <WCard style={{ padding: `var(--sp-2) var(--card-p)` }}>
        {todayTasks.map(task => (
          <div key={task.id} className="habit-row fu">
            <button onClick={() => setTasks(t => ({ ...t, [task.id]: !t[task.id] }))} style={{
              width: "clamp(22px,5.5vw,28px)", height: "clamp(22px,5.5vw,28px)",
              borderRadius: "50%", flexShrink: 0,
              border: `2px solid ${tasks[task.id] ? "var(--sg)" : "var(--border2)"}`,
              background: tasks[task.id] ? "var(--sg)" : "transparent",
              color: "#fff", fontSize: "var(--fs-xs)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s"
            }}>
              {tasks[task.id] ? <CheckCircle2 size={14} color="#fff" /> : <Circle size={14} color="var(--border2)" />}
            </button>
            <IconBox emoji={task.icon} bg={task.bg} size="var(--icon-sm)" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "var(--fs-base)", fontWeight: 700, color: "var(--dp)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{task.title}</p>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)" }}>Streak {task.streak} days</p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", fontWeight: 600 }}>{task.time}</p>
            </div>
          </div>
        ))}
      </WCard>

      {/* Quick Actions */}
      <SectionTitle title="Quick Actions" />
      <div className="quick-grid">
        {cfg.quickActions.map(([ic, lb, tb, bg, tc], i) => (
          <button key={i} className="quick-btn"
            onClick={tb ? () => setTab(tb) : () => setShowSOS(true)}
            style={{ background: bg, border: `1.5px solid ${tc}33` }}>
            <span>{ic}</span>
            <small style={{ color: tc }}>{lb}</small>
          </button>
        ))}
      </div>

      {/* Anaemia Alert */}
      {cfg.showAlert && (
        <WCard style={{ background: "var(--rdl)", border: "1.5px solid var(--rdm)44" }}>
          <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "flex-start" }}>
            <div style={{ width: "var(--icon-sm)", height: "var(--icon-sm)", flexShrink: 0, borderRadius: "var(--r)", background: "var(--rd)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={20} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--rd)", marginBottom: "var(--sp-1)" }}>Anaemia Risk Detected</p>
              <p style={{ fontSize: "var(--fs-sm)", color: "#8B3030", lineHeight: 1.55 }}>Iron supplement missed 2 days. 68% of Nigerian pregnant women have iron deficiency. Take iron with orange juice today.</p>
              <button style={{ marginTop: "var(--sp-2)", background: "var(--rd)", color: "#fff", border: "none", borderRadius: 20, padding: "clamp(5px,1.2vw,8px) clamp(12px,3vw,18px)", fontSize: "var(--fs-xs)", fontWeight: 800, cursor: "pointer", minHeight: "var(--touch)", display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle2 size={14} color="#fff" /> Mark Iron Taken
              </button>
            </div>
          </div>
        </WCard>
      )}

      {/* Nearby Hospitals */}
      <SectionTitle title="Nearby Hospitals" />
      {[
        { n: "Lagos University Teaching Hospital", a: "Idi-Araba, Lagos", p: "+234-1-774-3747", d: "2.3km", r: 4.5, s: "Full obstetrics & NICU" },
        { n: "National Hospital Abuja", a: "CBD, Abuja", p: "+234-9-523-5050", d: "5.1km", r: 4.7, s: "High-risk pregnancy" }
      ].map((h, i) => (
        <WCard key={i} style={{ padding: "var(--card-p)" }}>
          <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "center" }}>
            <div style={{ width: "var(--icon-md)", height: "var(--icon-md)", flexShrink: 0, borderRadius: "var(--r)", background: "var(--bll)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Hospital size={24} color="var(--bl)" strokeWidth={1.8} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "var(--fs-base)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.n}</p>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginBottom: "var(--sp-2)" }}>{h.a}</p>
              <div style={{ display: "flex", gap: "var(--gap-sm)", flexWrap: "wrap" }}>
                <Tag label={h.s} bg="var(--sgl)" tc="var(--sg)" />
                <Tag label={`${h.r}`} bg="var(--gdl)" tc="var(--gd)" icon={<Star size={10} color="var(--gd)" fill="var(--gd)" />} />
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--t)", marginBottom: "var(--sp-2)" }}>{h.d}</p>
              <button onClick={() => window.open(`tel:${h.p}`)} style={{ background: "var(--dp)", color: "#fff", border: "none", borderRadius: 20, padding: "clamp(5px,1.2vw,7px) clamp(11px,2.8vw,15px)", fontSize: "var(--fs-xs)", fontWeight: 800, cursor: "pointer", minHeight: "var(--touch)", display: "flex", alignItems: "center", gap: 5 }}>
                <Phone size={13} color="#fff" /> Call
              </button>
            </div>
          </div>
        </WCard>
      ))}
    </div>
  );
}