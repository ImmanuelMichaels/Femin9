import { useState } from 'react';
import { Heart, Droplets, Wind, Droplet, Pill, Zap, AlertCircle, Thermometer, Lightbulb, CalendarDays, Settings, Stethoscope } from 'lucide-react';
import { WCard, SectionTitle, Tag, Pill as PillComponent } from '../../components/ui';
import { isSameDay, isBetween, daysInMonth, firstDayOfMonth } from '../../utils/helpers';

const SYMPTOMS = [
  "Cramping","Spotting","Heavy flow","Discharge (white)","Egg white CM",
  "Watery CM","Nausea","Fatigue","Hot flashes","Cravings",
  "Mood swings","Breast tenderness","Increased libido"
];

const TAB_ICONS = {
  calendar: CalendarDays,
  setup: Settings,
  symptoms: Stethoscope,
  bbt: Thermometer,
  insights: Lightbulb
};

const DAY_COLS = {
  period:    ["#FDEEEC","#D0524A","🩸"],
  fertile:   ["#E3F5EA","#5A9E6E","💞"],
  ovulation: ["#EDE9F8","#8B7EC8","🥚"],
  free:      ["#E4EFF9","#3A78C4","✨"],
  other:     ["transparent","var(--border)",""]
};

function computeCycle(startStr, cLen, pLen) {
  if (!startStr) return null;
  const start = new Date(startStr);
  const periodEnd = new Date(start); periodEnd.setDate(start.getDate() + pLen - 1);
  const ovDay = new Date(start); ovDay.setDate(start.getDate() + cLen - 14);
  const fertStart = new Date(ovDay); fertStart.setDate(ovDay.getDate() - 5);
  const fertEnd = new Date(ovDay); fertEnd.setDate(ovDay.getDate() + 1);
  const nextPeriod = new Date(start); nextPeriod.setDate(start.getDate() + cLen);
  const freeStart = new Date(periodEnd); freeStart.setDate(periodEnd.getDate() + 1);
  const freeEnd = new Date(fertStart); freeEnd.setDate(fertStart.getDate() - 1);
  return { start, periodEnd, ovDay, fertStart, fertEnd, nextPeriod, freeStart, freeEnd };
}

function fmt(d) { return d?.toLocaleDateString("en-NG", { day: "numeric", month: "short" }) || "—"; }

export default function TTC() {
  const today = new Date();
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [lastPeriodStart, setLastPeriodStart] = useState("");
  const [savedCycle, setSavedCycle] = useState(null);
  const [activeMonth, setActiveMonth] = useState(new Date());
  const [notification, setNotification] = useState(null);
  const [bbt, setBbt] = useState("");
  const [bbtLog, setBbtLog] = useState([
    { day:"Mon",temp:36.3 },{ day:"Tue",temp:36.4 },{ day:"Wed",temp:36.4 },
    { day:"Thu",temp:36.6 },{ day:"Fri",temp:36.9 },{ day:"Sat",temp:37.1 },{ day:"Sun",temp:36.8 },
  ]);
  const [activeTab, setActiveTab] = useState("calendar");
  const [symptomSel, setSymptomSel] = useState([]);
  const [savedSymptoms, setSavedSymptoms] = useState({});

  const cycle = savedCycle ? computeCycle(savedCycle.lastPeriodStart, savedCycle.cycleLength, savedCycle.periodLength) : null;

  const getDayType = (d) => {
    if (!cycle) return null;
    if (isBetween(d, cycle.start, cycle.periodEnd)) return "period";
    if (isSameDay(d, cycle.ovDay)) return "ovulation";
    if (isBetween(d, cycle.fertStart, cycle.fertEnd)) return "fertile";
    if (isBetween(d, cycle.freeStart, cycle.freeEnd)) return "free";
    return "other";
  };

  const showNotif = (msg, col = "var(--sg)") => {
    setNotification({ msg, col });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSave = () => {
    if (!lastPeriodStart) { showNotif("Please enter your last period start date", "var(--rd)"); return; }
    setSavedCycle({ lastPeriodStart, cycleLength, periodLength });
    const c = computeCycle(lastPeriodStart, cycleLength, periodLength);
    const now = new Date(); now.setHours(0,0,0,0);
    if (c) {
      if (isSameDay(now, c.ovDay)) showNotif("Today is your Ovulation Day! Best time to conceive.", "var(--lv)");
      else if (isBetween(now, c.fertStart, c.fertEnd)) showNotif("You're in your Fertile Window!", "var(--sg)");
      else if (isBetween(now, c.start, c.periodEnd)) showNotif("Your period is active.", "var(--rd)");
      else showNotif("✅ Cycle saved! Calendar updated.", "var(--sg)");
    }
  };

  const y = activeMonth.getFullYear(), m = activeMonth.getMonth();
  const totalDays = daysInMonth(y, m);
  const firstDay = firstDayOfMonth(y, m);
  const bbtMax = Math.max(...bbtLog.map(b => b.temp));
  const bbtMin = Math.min(...bbtLog.map(b => b.temp));

  return (
    <div className="page-pad">
      {notification && (
        <div className="fu" style={{ position: "sticky", top: 0, zIndex: 50, background: notification.col, color: "#fff", padding: "var(--sp-3) var(--card-p)", borderRadius: "var(--r)", marginBottom: "var(--gap-md)", fontSize: "var(--fs-sm)", fontWeight: 700, boxShadow: "var(--sh2)" }}>
          {notification.msg}
        </div>
      )}

      <div style={{ display: "flex", gap: "var(--gap-sm)", marginBottom: "var(--sp-4)", overflowX: "auto", scrollbarWidth: "none" }}>
        {["calendar","setup","symptoms","bbt","insights"].map(id => {
          const Icon = TAB_ICONS[id];
          const labels = { calendar: "Calendar", setup: "Cycle Setup", symptoms: "Symptoms", bbt: "BBT", insights: "Insights" };
          return (
            <PillComponent key={id} label={<div style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon size={14} /><span>{labels[id]}</span></div>} active={activeTab === id} onClick={() => setActiveTab(id)} color="var(--lv)" />
          );
        })}
      </div>

      {/* ── SETUP ── */}
      {activeTab === "setup" && (
        <div className="fu">
          <WCard>
            <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-4)" }}>🌸 Set Up Your Cycle</p>
            <div style={{ marginBottom: "var(--sp-4)" }}>
              <label style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--md)", display: "block", marginBottom: "var(--sp-2)" }}>First day of your last period</label>
              <input type="date" value={lastPeriodStart} onChange={e => setLastPeriodStart(e.target.value)} className="form-input" />
            </div>
            <div style={{ marginBottom: "var(--sp-4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--sp-2)" }}>
                <label style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--md)" }}>Cycle Length</label>
                <span style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--lv)" }}>{cycleLength} days</span>
              </div>
              <input type="range" min={21} max={35} value={cycleLength} onChange={e => setCycleLength(+e.target.value)} style={{ accentColor: "var(--lv)" }} />
            </div>
            <div style={{ marginBottom: "var(--sp-5)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--sp-2)" }}>
                <label style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "var(--md)" }}>Period Duration</label>
                <span style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--rd)" }}>{periodLength} days</span>
              </div>
              <input type="range" min={2} max={8} value={periodLength} onChange={e => setPeriodLength(+e.target.value)} style={{ accentColor: "var(--rd)" }} />
            </div>
            <button onClick={handleSave} className="btn-primary" style={{ background: "var(--dp)", color: "#fff" }}>Save & Generate Calendar</button>
          </WCard>
          <WCard style={{ marginTop: "var(--gap-md)" }}>
            <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-3)" }}>Calendar Legend</p>
            {[["#FDEEEC","#D0524A","Period days"],["#E3F5EA","#5A9E6E","Fertile window"],["#EDE9F8","#8B7EC8","Ovulation day"],["#E4EFF9","#3A78C4","Free days"]].map(([bg,tc,label],i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--gap-md)", padding: "var(--sp-2) 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: bg, border: `2px solid ${tc}`, flexShrink: 0 }} />
                <span style={{ fontSize: "var(--fs-sm)", color: "var(--md)" }}>{label}</span>
              </div>
            ))}
          </WCard>
        </div>
      )}

      {/* ── CALENDAR ── */}
      {activeTab === "calendar" && (
        <div className="fu">
          {!savedCycle && (
            <WCard style={{ textAlign: "center", padding: "var(--sp-5)", background: "var(--lvl)", border: "1.5px solid var(--lvm)44" }}>
              <div style={{ fontSize: 40, marginBottom: "var(--sp-3)" }}>🌸</div>
              <p style={{ fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-2)" }}>Set up your cycle first</p>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)", marginBottom: "var(--sp-4)" }}>Enter your last period date to see your personalised fertility calendar.</p>
              <button onClick={() => setActiveTab("setup")} className="btn-primary" style={{ background: "var(--lv)", color: "#fff" }}>⚙️ Set Up Cycle</button>
            </WCard>
          )}
          {savedCycle && cycle && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap-sm)", marginBottom: "var(--gap-md)" }}>
                {[
                  { label:"🩸 Period", val:`${fmt(cycle.start)} – ${fmt(cycle.periodEnd)}`, bg:"var(--rdl)", tc:"var(--rd)" },
                  { label:"🥚 Ovulation", val:fmt(cycle.ovDay), bg:"var(--lvl)", tc:"var(--lv)" },
                  { label:"💞 Fertile Window", val:`${fmt(cycle.fertStart)} – ${fmt(cycle.fertEnd)}`, bg:"var(--sgl)", tc:"var(--sg)" },
                  { label:"📅 Next Period", val:fmt(cycle.nextPeriod), bg:"var(--gdl)", tc:"var(--gd)" },
                ].map((item, i) => (
                  <div key={i} style={{ background: item.bg, borderRadius: "var(--r)", padding: "var(--sp-3) var(--card-p)", border: `1.5px solid ${item.tc}33` }}>
                    <p style={{ fontSize: "var(--fs-xs)", fontWeight: 700, color: item.tc, marginBottom: 4 }}>{item.label}</p>
                    <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--dp)" }}>{item.val}</p>
                  </div>
                ))}
              </div>

              {/* Today's status card */}
              {(() => {
                const now = new Date(); now.setHours(0,0,0,0);
                const dt = getDayType(now);
                if (dt === "ovulation") return <WCard style={{ background: "linear-gradient(135deg,var(--lvl),#F8F6FE)", border: "2px solid var(--lvm)", marginBottom: "var(--gap-md)" }} className="fu"><div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "center" }}><div style={{ fontSize: 36 }}>💜</div><div><p style={{ fontWeight: 800, color: "var(--lv)", marginBottom: 4, fontSize: "var(--fs-md)" }}>Today is Ovulation Day!</p><p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.55 }}>Peak fertility day. Best time to conceive. 💞</p></div></div></WCard>;
                if (dt === "fertile") return <WCard style={{ background: "var(--sgl)", border: "2px solid var(--sgm)", marginBottom: "var(--gap-md)" }} className="fu"><div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "center" }}><div style={{ fontSize: 36 }}>💚</div><div><p style={{ fontWeight: 800, color: "var(--sg)", marginBottom: 4, fontSize: "var(--fs-md)" }}>You're in your Fertile Window!</p><p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.55 }}>Have sex today and every other day until ovulation passes.</p></div></div></WCard>;
                if (dt === "period") return <WCard style={{ background: "var(--rdl)", border: "1.5px solid var(--rdm)33", marginBottom: "var(--gap-md)" }} className="fu"><div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "center" }}><div style={{ fontSize: 36 }}>🩸</div><div><p style={{ fontWeight: 800, color: "var(--rd)", marginBottom: 4, fontSize: "var(--fs-md)" }}>Period Active</p><p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.55 }}>Rest and nourish yourself. Take iron supplements with orange juice.</p></div></div></WCard>;
                return <WCard style={{ background: "var(--bll)", border: "1.5px solid var(--blm)33", marginBottom: "var(--gap-md)" }} className="fu"><div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "center" }}><div style={{ fontSize: 36 }}>✨</div><div><p style={{ fontWeight: 800, color: "var(--bl)", marginBottom: 4, fontSize: "var(--fs-md)" }}>Low Fertility Phase</p><p style={{ fontSize: "var(--fs-sm)", color: "var(--md)", lineHeight: 1.55 }}>Use this time to rest, nourish, and prepare your body. 🌿</p></div></div></WCard>;
              })()}

              <WCard>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-3)" }}>
                  <button onClick={() => setActiveMonth(d => { const n = new Date(d); n.setMonth(n.getMonth()-1); return n; })} style={{ background: "var(--warm)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "var(--sp-2) var(--sp-3)", cursor: "pointer", fontSize: "var(--fs-sm)", fontWeight: 700 }}>‹</button>
                  <p style={{ fontWeight: 800, fontSize: "var(--fs-md)", color: "var(--dp)" }}>{activeMonth.toLocaleDateString("en-NG", { month: "long", year: "numeric" })}</p>
                  <button onClick={() => setActiveMonth(d => { const n = new Date(d); n.setMonth(n.getMonth()+1); return n; })} style={{ background: "var(--warm)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "var(--sp-2) var(--sp-3)", cursor: "pointer", fontSize: "var(--fs-sm)", fontWeight: 700 }}>›</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 6 }}>
                  {["M","T","W","T","F","S","S"].map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: "var(--fs-2xs)", fontWeight: 800, color: "var(--mt)", padding: "var(--sp-1)" }}>{d}</div>)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: totalDays }).map((_, i) => {
                    const dayDate = new Date(y, m, i+1);
                    const dtype = getDayType(dayDate);
                    const [bg, tc, icon] = DAY_COLS[dtype] || DAY_COLS.other;
                    const isToday = dayDate.toDateString() === today.toDateString();
                    return (
                      <div key={i} style={{ aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: "var(--r)", background: bg, border: isToday ? `2px solid ${tc || "var(--dp)"}` : "2px solid transparent", position: "relative", cursor: "pointer" }}>
                        <span style={{ fontSize: "var(--fs-xs)", fontWeight: isToday ? 900 : 700, color: tc || "var(--md)" }}>{i+1}</span>
                        {icon && <span style={{ fontSize: 8, lineHeight: 1 }}>{icon}</span>}
                        {isToday && <div style={{ position: "absolute", top: 2, right: 2, width: 5, height: 5, borderRadius: "50%", background: "var(--t)" }} />}
                      </div>
                    );
                  })}
                </div>
              </WCard>
            </>
          )}
        </div>
      )}

      {/* ── SYMPTOMS ── */}
      {activeTab === "symptoms" && (
        <div className="fu">
          <WCard>
            <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-1)" }}>🩺 Log Today's Symptoms</p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", marginBottom: "var(--sp-4)" }}>Select all that apply.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-sm)", marginBottom: "var(--sp-4)" }}>
              {SYMPTOMS.map(s => (
                <button key={s} onClick={() => setSymptomSel(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])} style={{ padding: "clamp(5px,1.2vw,7px) clamp(10px,2.5vw,14px)", borderRadius: 20, fontSize: "var(--fs-xs)", fontWeight: 700, background: symptomSel.includes(s) ? "var(--lv)" : "var(--warm)", color: symptomSel.includes(s) ? "#fff" : "var(--md)", border: `1.5px solid ${symptomSel.includes(s) ? "var(--lv)" : "var(--border)"}`, cursor: "pointer", minHeight: "var(--touch)" }}>{s}</button>
              ))}
            </div>
            <button onClick={() => { const key = new Date().toDateString(); setSavedSymptoms(p => ({...p,[key]:symptomSel})); showNotif("✅ Symptoms logged for today","var(--sg)"); setSymptomSel([]); }} disabled={!symptomSel.length} className="btn-primary" style={{ background: symptomSel.length ? "var(--lv)" : "var(--border)", color: symptomSel.length ? "#fff" : "var(--mt)" }}>✅ Log Symptoms ({symptomSel.length})</button>
          </WCard>
          <WCard style={{ marginTop: "var(--gap-md)", background: "var(--sgl)", border: "1px solid var(--sgm)44" }}>
            <p style={{ fontWeight: 800, color: "var(--sg)", marginBottom: "var(--sp-2)", fontSize: "var(--fs-sm)" }}>🥚 Cervical Mucus Guide</p>
            {[["Dry / None","Low fertility","var(--rdl)","var(--rd)"],["Sticky / Cloudy","Early cycle","var(--gdl)","var(--gd)"],["Creamy / White","Building fertility","var(--bll)","var(--bl)"],["Egg white / Stretchy","PEAK — Ovulation near!","var(--lvl)","var(--lv)"],["Watery","Fertile — ovulation occurring","var(--sgl)","var(--sg)"]].map(([type,desc,bg,tc],i) => (
              <div key={i} style={{ display: "flex", gap: "var(--gap-md)", alignItems: "center", padding: "var(--sp-2) 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
                <Tag label={type} bg={bg} tc={tc} />
                <span style={{ fontSize: "var(--fs-xs)", color: "var(--md)", flex: 1 }}>{desc}</span>
              </div>
            ))}
          </WCard>
        </div>
      )}

      {/* ── BBT ── */}
      {activeTab === "bbt" && (
        <div className="fu">
          <WCard>
            <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--dp)", marginBottom: "var(--sp-1)" }}>🌡️ Basal Body Temperature</p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--mt)", lineHeight: 1.5, marginBottom: "var(--sp-4)" }}>Take your temperature every morning before getting out of bed. A rise of 0.2–0.5°C confirms ovulation.</p>
            <div style={{ display: "flex", gap: "var(--gap-sm)", marginBottom: "var(--sp-4)" }}>
              <input value={bbt} onChange={e => setBbt(e.target.value)} type="number" step="0.1" min={35} max={38} placeholder="e.g. 36.7°C" className="form-input" style={{ flex: 1 }} />
              <button onClick={() => { if (!bbt) return; const day = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][new Date().getDay() === 0 ? 6 : new Date().getDay()-1]; setBbtLog(l => [...l.slice(-6), { day, temp: parseFloat(bbt) }]); setBbt(""); showNotif("✅ BBT logged","var(--sg)"); }} style={{ padding: "0 clamp(12px,3vw,18px)", background: "var(--t)", color: "#fff", border: "none", borderRadius: "var(--r)", fontWeight: 800, cursor: "pointer", minHeight: "var(--touch)", flexShrink: 0 }}>Log</button>
            </div>
          </WCard>
          <WCard>
            <p style={{ fontWeight: 800, fontSize: "var(--fs-md)", color: "var(--dp)", marginBottom: "var(--sp-4)" }}>📈 7-Day BBT Chart</p>
            <div style={{ display: "flex", gap: "var(--gap-sm)", alignItems: "flex-end", height: "clamp(80px,20vw,110px)", marginBottom: "var(--gap-sm)" }}>
              {bbtLog.slice(-7).map((b, i) => {
                const range = bbtMax - bbtMin || 0.5;
                const h = ((b.temp - bbtMin) / range) * 70 + 15;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: "var(--fs-2xs)", color: "var(--mt)", fontWeight: 700 }}>{b.temp}</span>
                    <div style={{ width: "100%", height: `${h}%`, borderRadius: "4px 4px 0 0", background: b.temp >= 36.7 ? "var(--lv)" : "var(--sg)", transition: "height 0.4s" }} />
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: "var(--gap-sm)" }}>
              {bbtLog.slice(-7).map((b, i) => <div key={i} style={{ flex: 1, textAlign: "center", fontSize: "var(--fs-2xs)", color: "var(--mt)", fontWeight: 600 }}>{b.day}</div>)}
            </div>
            <div style={{ marginTop: "var(--sp-3)", padding: "var(--sp-3)", background: "var(--lvl)", borderRadius: "var(--r)" }}>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--lv)", fontWeight: 700 }}>💜 Purple bars (≥36.7°C) indicate post-ovulation phase.</p>
            </div>
          </WCard>
        </div>
      )}

      {/* ── INSIGHTS ── */}
      {activeTab === "insights" && (
        <div className="fu">
          <WCard style={{ background: "linear-gradient(135deg,var(--lvl),#F8F6FE)", border: "1.5px solid var(--lvm)44" }}>
            <p style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--lv)", marginBottom: "var(--sp-3)" }}>💡 TTC Tips — Nigeria-Specific</p>
            {[
              { icon:"🥚", title:"Best time for sex", body:"Have sex every other day during your fertile window (5 days before + 1 day after ovulation). Daily sex is not more effective." },
              { icon:"🍃", title:"Boost fertility with food", body:"Eat: Ugu leaf, Tiger Nuts (Aya), Garden eggs, Avocado, Fish, Eggs. These boost progesterone, iron, and Omega-3." },
              { icon:"🚫", title:"Avoid in your cycle", body:"Avoid: Agbo (herbal mixtures), excessive zobo, strong pain killers around ovulation (NSAIDs suppress ovulation)." },
              { icon:"🌡️", title:"After sex", body:"Lie down for 15–20 minutes after sex. Sperm reach the fallopian tube within 90 seconds." },
              { icon:"💊", title:"Supplements to start now", body:"Folic acid (400mcg daily), Vitamin D3 (1000 IU), Zinc (for sperm quality if partner is involved)." },
              { icon:"😴", title:"Stress and TTC", body:"Chronic stress raises cortisol, suppressing LH (ovulation trigger). Sleep 7–9 hours. 4-7-8 breathing helps." },
              { icon:"🩺", title:"When to see a doctor", body:"If no pregnancy after 12 months of trying (6 months if over 35). Get hormonal panel, HSG scan, semen analysis." },
            ].map((tip, i) => (
              <WCard key={i} style={{ marginBottom: "var(--gap-sm)", padding: "var(--card-p)" }}>
                <div style={{ display: "flex", gap: "var(--gap-md)", alignItems: "flex-start" }}>
                  <div style={{ width: "var(--icon-sm)", height: "var(--icon-sm)", flexShrink: 0, borderRadius: "var(--r)", background: "var(--lvl)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-xl)" }}>{tip.icon}</div>
                  <div>
                    <p style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--dp)", marginBottom: 4 }}>{tip.title}</p>
                    <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)", lineHeight: 1.6 }}>{tip.body}</p>
                  </div>
                </div>
              </WCard>
            ))}
          </WCard>
          <WCard style={{ marginTop: "var(--gap-md)", background: "var(--sgl)", border: "1.5px solid var(--sgm)44" }}>
            <p style={{ fontWeight: 800, color: "var(--sg)", marginBottom: "var(--sp-3)", fontSize: "var(--fs-md)" }}>🇳🇬 Local Fertility Myths — Debunked</p>
            {[
              ["Eating unripe pawpaw boosts fertility","FALSE","Contains papain — disrupts implantation. Avoid."],
              ["Drinking Agbo increases chances","UNKNOWN","Most Agbo mixtures have unknown compositions. Avoid."],
              ["You can't get pregnant while breastfeeding","FALSE","You can — ovulation returns before your period."],
              ["Legs up after sex for 30 minutes is necessary","EXAGGERATED","15 mins resting is fine. Sperm reach the fallopian tube within 90 seconds."],
            ].map(([myth,status,fact],i) => (
              <div key={i} style={{ padding: "var(--sp-3) 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
                <div style={{ display: "flex", gap: "var(--gap-sm)", alignItems: "center", marginBottom: "var(--sp-1)" }}>
                  <Tag label={status} bg={status==="FALSE" ? "var(--rdl)" : "var(--gdl)"} tc={status==="FALSE" ? "var(--rd)" : "var(--gd)"} />
                  <p style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: "var(--dp)" }}>{myth}</p>
                </div>
                <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)", lineHeight: 1.55 }}>{fact}</p>
              </div>
            ))}
          </WCard>
        </div>
      )}
    </div>
  );
}
