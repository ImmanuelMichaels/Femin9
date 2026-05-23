// src/components/EmergencyRedFlags.jsx
import { AlertTriangle } from 'lucide-react';

export default function EmergencyRedFlags({ bpSys, bpDia, bleeding, fetalMovement, week }) {
  const alerts = [];
  
  // NEVER PAYWALL THESE CHECKS - These are critical safety features
  
  // Severe hypertension check
  if (bpSys >= 160 || bpDia >= 110) {
    alerts.push({
      type: "emergency",
      title: "🚨 EMERGENCY: Severe Hypertension",
      message: "Call 999 or go to A&E immediately",
      action: "Do not drive yourself. Get someone to take you or call an ambulance."
    });
  }
  // Moderate hypertension check
  else if (bpSys >= 140 || bpDia >= 90) {
    alerts.push({
      type: "urgent",
      title: "⚠️ High Blood Pressure",
      message: "Call your midwife or GP today",
      action: "High blood pressure in pregnancy needs medical review within 24 hours."
    });
  }
  
  // Reduced fetal movement (24+ weeks)
  if (week >= 24 && (fetalMovement === "reduced" || fetalMovement === "none")) {
    alerts.push({
      type: "urgent",
      title: "⚠️ Reduced Fetal Movement",
      message: "Contact your maternity unit immediately",
      action: "Do not wait until tomorrow. Call your midwife or maternity unit now."
    });
  }
  
  // Heavy bleeding
  if (bleeding === "heavy") {
    alerts.push({
      type: "emergency",
      title: "🚨 EMERGENCY: Heavy Bleeding",
      message: "Call 999 or go to A&E now",
      action: "Heavy bleeding during pregnancy requires immediate medical attention."
    });
  }
  // Any bleeding in pregnancy
  else if (bleeding !== "none" && week < 37) {
    alerts.push({
      type: "warning",
      title: "⚠️ Vaginal Bleeding",
      message: "Contact your early pregnancy unit or midwife",
      action: "Any bleeding during pregnancy should be assessed by a healthcare professional."
    });
  }
  
  if (alerts.length === 0) return null;
  
  return (
    <div style={{ marginBottom: "var(--gap-md)" }}>
      {alerts.map((alert, i) => (
        <div
          key={i}
          style={{
            background: alert.type === "emergency" ? "var(--rdl)" : alert.type === "urgent" ? "var(--gdl)" : "var(--bll)",
            borderLeft: `4px solid ${alert.type === "emergency" ? "var(--rd)" : alert.type === "urgent" ? "var(--gd)" : "var(--bl)"}`,
            borderRadius: "var(--r)",
            padding: "var(--sp-3) var(--card-p)",
            marginBottom: i < alerts.length - 1 ? "var(--sp-2)" : 0
          }}
        >
          <div style={{ display: "flex", gap: "var(--gap-sm)", alignItems: "flex-start" }}>
            <AlertTriangle size={20} color={alert.type === "emergency" ? "var(--rd)" : alert.type === "urgent" ? "var(--gd)" : "var(--bl)"} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 800, color: alert.type === "emergency" ? "var(--rd)" : alert.type === "urgent" ? "var(--gd)" : "var(--bl)", marginBottom: 2 }}>
                {alert.title}
              </p>
              <p style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--dp)", marginBottom: 2 }}>
                {alert.message}
              </p>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--md)" }}>
                {alert.action}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}