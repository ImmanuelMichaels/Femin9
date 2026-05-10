import { useState } from 'react';
import { WCard, SectionTitle, Tag, Pill, IconBox } from '../../components/ui';

export default function Nursing() {
  const [activeTab, setActiveTab] = useState("breastfeeding");
  const [feedLog, setFeedLog] = useState([
    { time:"7:10 AM", side:"Left",  duration:14 },
    { time:"9:45 AM", side:"Right", duration:12 },
    { time:"12:30 PM",side:"Left",  duration:16 },
  ]);
  const [pumpLog, setPumpLog] = useState([{ time:"8:00 AM", amount:90, side:"Both" }]);
  const [pumpAmount, setPumpAmount] = useState(80);
  const [showPumpForm, setShowPumpForm] = useState(false);
  const [checks, setChecks] = useState({ latch:true, colour:true, weight:false, milestone:false });
  const totalMl = pumpLog.reduce((a,b) => a+b.amount, 0);

  return (
    <div className="page-pad">
      <div style={{ display:"flex", gap:"var(--gap-sm)", marginBottom:"var(--sp-4)", overflowX:"auto", scrollbarWidth:"none" }}>
        {[["breastfeeding","Feeding"],["pumping","Pumping"],["recovery","Recovery"],["nutrition","Nutrition"]].map(([id,label]) => (
          <Pill key={id} label={label} active={activeTab===id} onClick={() => setActiveTab(id)} color="var(--t)" />
        ))}
      </div>

      {activeTab==="breastfeeding" && (
        <div className="fu">
          <WCard style={{ background:"linear-gradient(135deg,var(--gdl),#FEF0DA)", border:"1px solid var(--border2)" }}>
            <p style={{ fontWeight:800, fontSize:"var(--fs-lg)", color:"var(--gd)", marginBottom:"var(--sp-3)" }}>Today Feeds</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"var(--gap-sm)", marginBottom:"var(--sp-4)" }}>
              {[{v:feedLog.length,l:"Feeds",c:"var(--gd)"},{v:feedLog.reduce((a,b)=>a+b.duration,0)+"m",l:"Total time",c:"var(--t)"},{v:feedLog[feedLog.length-1]?.side||"—",l:"Last side",c:"var(--sg)"}].map((s,i) => (
                <div key={i} style={{ textAlign:"center", background:"rgba(255,255,255,0.7)", borderRadius:"var(--r)", padding:"var(--sp-3) var(--sp-2)" }}>
                  <div style={{ fontSize:"var(--fs-xl)", fontWeight:900, color:s.c }}>{s.v}</div>
                  <div style={{ fontSize:"var(--fs-2xs)", color:"var(--mt)", fontWeight:600 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:"var(--gap-md)", marginBottom:"var(--sp-3)" }}>
              {["Left","Right","Both"].map(side => (
                <button key={side} onClick={() => setFeedLog(l => [...l,{time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),side,duration:Math.floor(Math.random()*8)+10}])} style={{ flex:1, padding:"var(--sp-3)", background:side==="Left"?"var(--t)":side==="Right"?"var(--sg)":"var(--lv)", color:"#fff", border:"none", borderRadius:"var(--r)", fontWeight:800, fontSize:"var(--fs-xs)", cursor:"pointer", minHeight:"var(--touch)" }}>
                  {side==="Left"?"Left":side==="Right"?"Right":"Both"}
                </button>
              ))}
            </div>
            <p style={{ fontSize:"var(--fs-xs)", color:"var(--md)", fontWeight:700 }}>Next: {feedLog[feedLog.length-1]?.side==="Left"?"RIGHT":"LEFT"} breast</p>
          </WCard>
          <WCard style={{ marginTop:"var(--gap-md)", padding:"var(--sp-2) var(--card-p)" }}>
            <p style={{ fontWeight:800, fontSize:"var(--fs-md)", color:"var(--dp)", marginBottom:"var(--sp-3)" }}>Recent Feeds</p>
            {feedLog.slice(-4).reverse().map((f,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:"var(--gap-md)", padding:"var(--sp-3) 0", borderBottom:i<3?"1px solid var(--border)":"none" }}>
                <IconBox emoji="🤱" bg="var(--gdl)" size="var(--icon-sm)" />
                <div style={{ flex:1 }}><p style={{ fontWeight:700, fontSize:"var(--fs-sm)", color:"var(--dp)" }}>{f.side} breast</p><p style={{ fontSize:"var(--fs-xs)", color:"var(--mt)" }}>{f.time} · {f.duration} mins</p></div>
                <Tag label={f.duration+"m"} bg="var(--gdl)" tc="var(--gd)" />
              </div>
            ))}
          </WCard>
          <WCard style={{ marginTop:"var(--gap-md)", background:"var(--sgl)", border:"1px solid var(--sgm)44" }}>
            <p style={{ fontWeight:800, color:"var(--sg)", marginBottom:"var(--sp-3)", fontSize:"var(--fs-sm)" }}>Good Latch Checklist</p>
            {[["latch","Baby mouth covers most of areola"],["colour","Nipple looks rounded after latch"],["weight","Baby gaining 150-200g per week"],["milestone","No cracked or bleeding nipples"]].map(([k,label]) => (
              <div key={k} style={{ display:"flex", gap:"var(--gap-md)", alignItems:"center", padding:"var(--sp-2) 0", borderBottom:k!=="milestone"?"1px solid var(--border)":"none" }}>
                <button onClick={() => setChecks(p => ({...p,[k]:!p[k]}))} style={{ width:24, height:24, borderRadius:"50%", flexShrink:0, border:"2px solid "+(checks[k]?"var(--sg)":"var(--border2)"), background:checks[k]?"var(--sg)":"transparent", color:"#fff", fontSize:"var(--fs-xs)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>{checks[k]?"✓":""}</button>
                <span style={{ fontSize:"var(--fs-sm)", color:"var(--md)", flex:1 }}>{label}</span>
              </div>
            ))}
          </WCard>
        </div>
      )}

      {activeTab==="pumping" && (
        <div className="fu">
          <WCard style={{ background:"linear-gradient(135deg,var(--bll),#ECF4FD)", border:"1px solid var(--blm)33" }}>
            <p style={{ fontWeight:800, fontSize:"var(--fs-lg)", color:"var(--bl)", marginBottom:"var(--sp-3)" }}>Pump Log</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"var(--gap-sm)", marginBottom:"var(--sp-4)" }}>
              {[{v:totalMl+"ml",l:"Total today",c:"var(--bl)"},{v:pumpLog.length,l:"Sessions",c:"var(--sg)"}].map((s,i) => (
                <div key={i} style={{ background:"rgba(255,255,255,0.8)", borderRadius:"var(--r)", padding:"var(--sp-3)", textAlign:"center" }}>
                  <div style={{ fontSize:"var(--fs-xl)", fontWeight:900, color:s.c }}>{s.v}</div>
                  <div style={{ fontSize:"var(--fs-2xs)", color:"var(--mt)" }}>{s.l}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowPumpForm(!showPumpForm)} className="btn-primary" style={{ background:"var(--bl)", color:"#fff", marginBottom:showPumpForm?"var(--sp-3)":0 }}>+ Log Pump Session</button>
            {showPumpForm && (
              <div className="fu">
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"var(--sp-2)" }}>
                  <label style={{ fontSize:"var(--fs-xs)", fontWeight:700, color:"var(--md)" }}>Amount (ml)</label>
                  <span style={{ fontSize:"var(--fs-md)", fontWeight:800, color:"var(--bl)" }}>{pumpAmount} ml</span>
                </div>
                <input type="range" min={10} max={300} step={5} value={pumpAmount} onChange={e => setPumpAmount(+e.target.value)} style={{ accentColor:"var(--bl)", marginBottom:"var(--sp-3)" }} />
                <button onClick={() => { setPumpLog(l => [...l,{time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),amount:pumpAmount,side:"Both"}]); setShowPumpForm(false); }} style={{ width:"100%", padding:"var(--sp-3)", background:"var(--sg)", color:"#fff", border:"none", borderRadius:"var(--r)", fontWeight:800, cursor:"pointer", minHeight:"var(--touch)" }}>Save Session</button>
              </div>
            )}
          </WCard>
          <WCard style={{ marginTop:"var(--gap-md)", background:"var(--sgl)", border:"1px solid var(--sgm)44" }}>
            <p style={{ fontWeight:800, color:"var(--sg)", marginBottom:"var(--sp-3)", fontSize:"var(--fs-sm)" }}>Pumping Tips</p>
            {["Pump 15-20 mins each side OR until milk stops","Best time: 30 mins after morning feed","Hand-express 5 mins before pumping","Store: 4h room temp · 4 days fridge · 6mo freezer","Label bags with date and amount"].map((tip,i) => (
              <div key={i} style={{ display:"flex", gap:"var(--gap-sm)", padding:"var(--sp-2) 0", borderBottom:i<4?"1px solid var(--border)":"none" }}>
                <span style={{ color:"var(--sg)", fontWeight:800 }}>✓</span>
                <span style={{ fontSize:"var(--fs-sm)", color:"var(--md)", lineHeight:1.5 }}>{tip}</span>
              </div>
            ))}
          </WCard>
        </div>
      )}

      {activeTab==="recovery" && (
        <div className="fu">
          {[
            { icon:"🩹", title:"Perineal Care", bg:"var(--rdl)", tc:"var(--rd)", tips:["Peri-bottle warm water after toilet","Change pads every 3-4 hours","Ice pack 10 mins reduces swelling","Sitz bath 2-3x daily accelerates healing"] },
            { icon:"🔵", title:"C-Section Recovery", bg:"var(--bll)", tc:"var(--bl)", tips:["Keep wound dry 48 hours","Hold abdomen when coughing","No lifting heavier than baby 6-8 weeks","Redness/discharge/fever → hospital"] },
            { icon:"💪", title:"Pelvic Floor", bg:"var(--sgl)", tc:"var(--sg)", tips:["Gentle Kegels from day 2-3","3 sets of 10, hold 3s, 3x daily","Stop if pain — see pelvic physio","No high-impact until 12 weeks postpartum"] },
            { icon:"🩸", title:"Lochia", bg:"var(--gdl)", tc:"var(--gd)", tips:["Day 1-4: Bright red, heavy (normal)","Day 4-10: Pink/brownish, lighter","Day 10-28: Yellow or white","Soaking a pad per hour → hospital"] },
          ].map((s,i) => (
            <WCard key={i} style={{ marginBottom:"var(--gap-md)", background:s.bg, border:"1.5px solid "+s.tc+"33" }}>
              <div style={{ display:"flex", gap:"var(--gap-md)", alignItems:"center", marginBottom:"var(--sp-3)" }}>
                <div style={{ width:"var(--icon-sm)", height:"var(--icon-sm)", borderRadius:"var(--r)", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"var(--fs-xl)" }}>{s.icon}</div>
                <p style={{ fontWeight:800, fontSize:"var(--fs-md)", color:s.tc }}>{s.title}</p>
              </div>
              {s.tips.map((tip,j) => (
                <div key={j} style={{ display:"flex", gap:"var(--gap-sm)", padding:"var(--sp-2) 0", borderBottom:j<s.tips.length-1?"1px solid rgba(0,0,0,0.06)":"none" }}>
                  <span style={{ color:s.tc, fontWeight:800, flexShrink:0 }}>·</span>
                  <span style={{ fontSize:"var(--fs-sm)", color:"var(--md)", lineHeight:1.5 }}>{tip}</span>
                </div>
              ))}
            </WCard>
          ))}
        </div>
      )}

      {activeTab==="nutrition" && (
        <div className="fu">
          <WCard style={{ background:"linear-gradient(135deg,var(--sgl),#D4F0DD)", border:"1px solid var(--sgm)44" }}>
            <p style={{ fontWeight:800, fontSize:"var(--fs-lg)", color:"var(--sg)", marginBottom:"var(--sp-2)" }}>Nursing Nutrition</p>
            <p style={{ fontSize:"var(--fs-sm)", color:"var(--md)", lineHeight:1.55 }}>Breastfeeding burns ~500 extra calories/day. Focus on quality, not restriction.</p>
          </WCard>
          <SectionTitle title="Milk-Boosting Nigerian Foods" />
          {[
            { icon:"🌿", name:"Garden Egg Leaf", benefit:"Galactagogue — stimulates prolactin. Rich in folate.", tag:"Milk booster" },
            { icon:"🌰", name:"Tiger Nuts (Aya)", benefit:"Calcium, iron, Vitamin E. Make tiger nut milk.", tag:"Superfood" },
            { icon:"🌾", name:"Oats (with warm milk)", benefit:"Beta-glucan boosts oxytocin — key for letdown.", tag:"Letdown" },
            { icon:"🥜", name:"Groundnut Soup", benefit:"Healthy fats for milk fat. B vitamins replenish stores.", tag:"Fat content" },
            { icon:"🐟", name:"Catfish Pepper Soup", benefit:"Traditional galactagogue. DHA for breastmilk.", tag:"DHA" },
            { icon:"🫙", name:"Fenugreek (Eru)", benefit:"1-3g/day increases supply within 24-72 hours.", tag:"Supplement" },
            { icon:"🥬", name:"Ugu (Fluted Pumpkin)", benefit:"Iron and folate — replenish postpartum blood loss.", tag:"Iron" },
          ].map((f,i) => (
            <WCard key={i} style={{ padding:"var(--card-p)", marginBottom:"var(--gap-sm)" }}>
              <div style={{ display:"flex", gap:"var(--gap-md)", alignItems:"flex-start" }}>
                <div style={{ width:"var(--icon-md)", height:"var(--icon-md)", flexShrink:0, borderRadius:"var(--r)", background:"var(--sgl)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"var(--fs-2xl)" }}>{f.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4, flexWrap:"wrap", gap:6 }}>
                    <p style={{ fontWeight:800, fontSize:"var(--fs-sm)", color:"var(--dp)" }}>{f.name}</p>
                    <Tag label={f.tag} bg="var(--sgl)" tc="var(--sg)" />
                  </div>
                  <p style={{ fontSize:"var(--fs-xs)", color:"var(--md)", lineHeight:1.55 }}>{f.benefit}</p>
                </div>
              </div>
            </WCard>
          ))}
          <WCard style={{ marginTop:"var(--gap-md)", background:"var(--rdl)", border:"1.5px solid var(--rdm)33" }}>
            <p style={{ fontWeight:800, color:"var(--rd)", marginBottom:"var(--sp-3)", fontSize:"var(--fs-sm)" }}>Avoid While Breastfeeding</p>
            {["Alcohol (passes into milk within 30 mins)","More than 2 cups coffee/day","Excess zobo — can suppress milk","Raw fish and unpasteurised dairy","Strong herbal mixtures (Agbo)"].map((item,i) => (
              <div key={i} style={{ display:"flex", gap:"var(--gap-sm)", padding:"var(--sp-2) 0", borderBottom:i<4?"1px solid rgba(208,82,74,0.15)":"none" }}>
                <span style={{ color:"var(--rd)", fontWeight:800, flexShrink:0 }}>✗</span>
                <span style={{ fontSize:"var(--fs-sm)", color:"var(--md)", lineHeight:1.5 }}>{item}</span>
              </div>
            ))}
          </WCard>
        </div>
      )}
    </div>
  );
}
