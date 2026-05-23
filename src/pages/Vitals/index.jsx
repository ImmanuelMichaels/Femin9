import { useState } from 'react';
import { WCard, SectionTitle, Tag } from '../../components/ui';
import EmergencyRedFlags from '../../components/EmergencyRedFlags';
import { useApp } from '../../context/AppContext';

export default function Vitals() {
  const { journeyType, getCurrentWeek } = useApp();
  const [bpSys, setBpSys] = useState(118);
  const [bpDia, setBpDia] = useState(76);
  const [weight, setWeight] = useState(68.4);
  const [temp, setTemp] = useState(37.1);
  const [logged, setLogged] = useState(false);
  const [bleeding, setBleeding] = useState("none");
  const [fetalMovement, setFetalMovement] = useState("normal");

  const bpStatus = bpSys > 140 || bpDia > 90 ? "HIGH" : bpSys < 90 ? "LOW" : "NORMAL";
  const tempStatus = temp > 38.5 ? "FEVER" : temp > 37.5 ? "ELEVATED" : "NORMAL";
  
  // Get current week for pregnancy (default to 26 if not pregnant)
  const currentWeek = journeyType === 'pregnant' ? getCurrentWeek() : 26;

  const history = [
    {date:"22",sys:118},{date:"23",sys:116},{date:"24",sys:124},
    {date:"25",sys:119},{date:"26",sys:122},{date:"27",sys:120},{date:"28",sys:118}
  ];

  return (
    <div className="page-pad">
      {/* EMERGENCY RED FLAGS - NEVER PAYWALLED - MUST BE VISIBLE AT ALL TIMES */}
      <EmergencyRedFlags 
        bpSys={bpSys}
        bpDia={bpDia}
        bleeding={bleeding}
        fetalMovement={fetalMovement}
        week={currentWeek}
      />
      
      <SectionTitle title="Vital Signs" />
      
      <WCard>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"var(--sp-4)" }}>
          <p style={{ fontSize:"var(--fs-lg)", fontWeight:800, color:"var(--dp)" }}>Blood Pressure</p>
          <Tag label={bpStatus} bg={bpStatus==="NORMAL"?"var(--sgl)":bpStatus==="HIGH"?"var(--rdl)":"var(--bll)"} tc={bpStatus==="NORMAL"?"var(--sg)":bpStatus==="HIGH"?"var(--rd)":"var(--bl)"} />
        </div>
        <div style={{ textAlign:"center", marginBottom:"var(--sp-4)" }}>
          <span style={{ fontSize:"var(--fs-3xl)", fontWeight:900, color:bpStatus==="HIGH"?"var(--rd)":"var(--sg)" }}>{bpSys}</span>
          <span style={{ fontSize:"var(--fs-xl)", color:"var(--mt)", fontWeight:500 }}>/{bpDia}</span>
          <span style={{ fontSize:"var(--fs-sm)", color:"var(--mt)", marginLeft:"var(--sp-1)" }}>mmHg</span>
        </div>
        {[["Systolic",bpSys,setBpSys,80,180,bpSys>140?"var(--rd)":"var(--sg)"],["Diastolic",bpDia,setBpDia,40,120,bpDia>90?"var(--rd)":"var(--sg)"]].map(([l,v,sv,mn,mx,col],i) => (
          <div key={i} style={{ marginBottom:"var(--sp-3)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"var(--sp-2)" }}>
              <span style={{ fontSize:"var(--fs-sm)", color:"var(--mt)", fontWeight:600 }}>{l}</span>
              <span style={{ fontSize:"var(--fs-md)", fontWeight:800, color:col }}>{v} mmHg</span>
            </div>
            <input type="range" min={mn} max={mx} value={v} onChange={e => sv(+e.target.value)} style={{ accentColor:col }} />
          </div>
        ))}
        
        {/* Warning message for high BP - already shown in EmergencyRedFlags but keep for context */}
        {bpStatus==="HIGH" && (
          <div className="fu" style={{ background:"var(--rdl)", borderRadius:"var(--r)", padding:"var(--sp-3) var(--card-p)", marginTop:"var(--sp-3)" }}>
            <p style={{ fontSize:"var(--fs-sm)", color:"var(--rd)", fontWeight:700 }}>⚠️ High blood pressure detected. Monitor closely and contact your healthcare provider if persistent.</p>
          </div>
        )}
      </WCard>

      <div className="stat-grid">
        <WCard style={{ padding:"var(--card-p)" }}>
          <p style={{ fontSize:"var(--fs-xs)", fontWeight:800, color:"var(--mt)", marginBottom:"var(--sp-2)", textTransform:"uppercase" }}>Weight</p>
          <div style={{ fontSize:"var(--fs-2xl)", fontWeight:900, color:"var(--t)", marginBottom:"var(--sp-2)" }}>{weight.toFixed(1)}<span style={{ fontSize:"var(--fs-sm)", fontWeight:600 }}> kg</span></div>
          <input type="range" min={40} max={120} step={0.1} value={weight} onChange={e => setWeight(+e.target.value)} style={{ accentColor:"var(--t)", marginBottom:"var(--sp-2)" }} />
          <p style={{ fontSize:"var(--fs-xs)", color:"var(--mt)" }}>+0.8kg this week</p>
        </WCard>
        
        <WCard style={{ padding:"var(--card-p)" }}>
          <p style={{ fontSize:"var(--fs-xs)", fontWeight:800, color:"var(--mt)", marginBottom:"var(--sp-2)", textTransform:"uppercase" }}>Temperature</p>
          <div style={{ fontSize:"var(--fs-2xl)", fontWeight:900, color:tempStatus==="NORMAL"?"var(--sg)":"var(--rd)", marginBottom:"var(--sp-2)" }}>{temp.toFixed(1)}<span style={{ fontSize:"var(--fs-sm)", fontWeight:600 }}>°C</span></div>
          <input type="range" min={35} max={42} step={0.1} value={temp} onChange={e => setTemp(+e.target.value)} style={{ accentColor:tempStatus==="NORMAL"?"var(--sg)":"var(--rd)", marginBottom:"var(--sp-2)" }} />
          <Tag label={tempStatus} bg={tempStatus==="NORMAL"?"var(--sgl)":"var(--rdl)"} tc={tempStatus==="NORMAL"?"var(--sg)":"var(--rd)"} />
        </WCard>
      </div>

      {/* Pregnancy-specific bleeding and movement tracking */}
      {journeyType === 'pregnant' && (
        <WCard>
          <p style={{ fontSize:"var(--fs-md)", fontWeight:800, color:"var(--dp)", marginBottom:"var(--sp-3)" }}>🤰 Pregnancy Monitoring</p>
          
          <div style={{ marginBottom:"var(--sp-3)" }}>
            <p style={{ fontSize:"var(--fs-sm)", fontWeight:700, marginBottom:"var(--sp-2)" }}>Vaginal Bleeding</p>
            <div style={{ display:"flex", gap:"var(--gap-sm)" }}>
              {[
                { id: "none", label: "None", color: "var(--sg)" },
                { id: "spotting", label: "Spotting", color: "var(--gd)" },
                { id: "light", label: "Light", color: "var(--t)" },
                { id: "heavy", label: "Heavy", color: "var(--rd)" }
              ].map(option => (
                <button
                  key={option.id}
                  onClick={() => setBleeding(option.id)}
                  style={{
                    flex: 1,
                    padding: "var(--sp-2)",
                    borderRadius: "var(--r)",
                    background: bleeding === option.id ? option.color : "var(--warm)",
                    color: bleeding === option.id ? "#fff" : "var(--mt)",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "var(--fs-xs)"
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <p style={{ fontSize:"var(--fs-sm)", fontWeight:700, marginBottom:"var(--sp-2)" }}>Fetal Movement</p>
            <div style={{ display:"flex", gap:"var(--gap-sm)" }}>
              {[
                { id: "normal", label: "Normal", color: "var(--sg)" },
                { id: "reduced", label: "Reduced", color: "var(--gd)" },
                { id: "none", label: "None", color: "var(--rd)" }
              ].map(option => (
                <button
                  key={option.id}
                  onClick={() => setFetalMovement(option.id)}
                  style={{
                    flex: 1,
                    padding: "var(--sp-2)",
                    borderRadius: "var(--r)",
                    background: fetalMovement === option.id ? option.color : "var(--warm)",
                    color: fetalMovement === option.id ? "#fff" : "var(--mt)",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "var(--fs-xs)"
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </WCard>
      )}

      <WCard>
        <p style={{ fontSize:"var(--fs-md)", fontWeight:800, color:"var(--dp)", marginBottom:"var(--sp-4)" }}>7-Day BP Trend</p>
        <div className="chart-wrap">
          {history.map((h,i) => (
            <div key={i} className="chart-col">
              <span className="chart-val">{h.sys}</span>
              <div className="chart-bar" style={{ height:`${((h.sys-90)/80)*100}%`, background:h.sys>135?"var(--rd)":h.sys>125?"var(--gd)":"var(--sg)" }} />
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:"var(--gap-sm)" }}>
          {history.map((h,i) => <div key={i} className="chart-lbl" style={{ flex:1 }}>Jan {h.date}</div>)}
        </div>
        <p style={{ fontSize:"var(--fs-xs)", color:"var(--mt)", marginTop:"var(--sp-3)", lineHeight:1.5 }}>BP trending slightly upward over 7 days. Monitor daily.</p>
      </WCard>

      <button onClick={() => setLogged(true)} className="btn-primary" style={{ background:"var(--dp)", color:"#fff", marginBottom:"var(--sp-3)" }}>Save Today Vitals</button>
      {logged && <p className="fu" style={{ fontSize:"var(--fs-sm)", color:"var(--sg)", textAlign:"center", fontWeight:800 }}>Vitals saved. AI trend updated.</p>}
    </div>
  );
}