// src/components/ui/Button.jsx
export default function Button({ 
  children, 
  onClick, 
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  icon,
  type = "button"
}) {
  const variants = {
    primary: { background: "var(--dp)", color: "#fff", border: "none" },
    secondary: { background: "var(--sg)", color: "#fff", border: "none" },
    outline: { background: "transparent", color: "var(--dp)", border: "1.5px solid var(--dp)" },
    danger: { background: "var(--rd)", color: "#fff", border: "none" },
    warning: { background: "var(--gd)", color: "#fff", border: "none" },
    ghost: { background: "transparent", color: "var(--mt)", border: "none" }
  };
  
  const sizeStyles = {
    sm: { padding: "6px 12px", fontSize: "var(--fs-xs)" },
    md: { padding: "10px 20px", fontSize: "var(--fs-sm)" },
    lg: { padding: "14px 28px", fontSize: "var(--fs-md)" }
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        borderRadius: "var(--r)",
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? "100%" : "auto",
        transition: "all 0.2s",
        minHeight: "var(--touch)",
        ...variants[variant],
        ...sizeStyles[size]
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}