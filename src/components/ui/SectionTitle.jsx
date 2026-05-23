// src/components/ui/SectionTitle.jsx
export default function SectionTitle({ title, subtitle, action, onAction, icon, align = "left" }) {
  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "flex-start",
      marginBottom: "var(--sp-4)",
      textAlign: align
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
          {icon && <span style={{ fontSize: "var(--fs-xl)" }}>{icon}</span>}
          <h2 style={{ 
            fontSize: "var(--fs-xl)", 
            fontWeight: 800, 
            color: "var(--dp)",
            margin: 0
          }}>
            {title}
          </h2>
        </div>
        {subtitle && (
          <p style={{ 
            fontSize: "var(--fs-sm)", 
            color: "var(--mt)", 
            marginTop: "var(--sp-1)",
            marginBottom: 0
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <button 
          onClick={onAction} 
          style={{
            background: "none", 
            border: "none", 
            color: "var(--t)",
            fontSize: "var(--fs-sm)", 
            fontWeight: 700, 
            cursor: "pointer",
            padding: "var(--sp-1) var(--sp-2)",
            borderRadius: "var(--r)",
            transition: "all 0.2s",
            minHeight: "44px"
          }}
        >
          {action} →
        </button>
      )}
    </div>
  );
}