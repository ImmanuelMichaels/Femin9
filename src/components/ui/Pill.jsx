// src/components/ui/Pill.jsx
export default function Pill({ label, active, onClick, color = "var(--t)", icon, disabled = false, size = "md" }) {
  const sizeStyles = {
    sm: { padding: "4px 12px", fontSize: "var(--fs-xs)", gap: 4 },
    md: { padding: "6px 16px", fontSize: "var(--fs-sm)", gap: 6 },
    lg: { padding: "8px 20px", fontSize: "var(--fs-md)", gap: 8 }
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: sizeStyles[size].gap,
        padding: sizeStyles[size].padding,
        borderRadius: 30,
        fontSize: sizeStyles[size].fontSize,
        fontWeight: 700,
        background: active ? color : "var(--card)",
        color: active ? "#fff" : "var(--mt)",
        border: `1.5px solid ${active ? color : "var(--border)"}`,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        flexShrink: 0,
        boxShadow: active ? `0 4px 14px ${color}44` : "none",
        minHeight: "var(--touch)",
        opacity: disabled ? 0.5 : 1,
        whiteSpace: "nowrap"
      }}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}