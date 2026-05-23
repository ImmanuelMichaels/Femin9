// src/components/ui/Tag.jsx
export default function Tag({ label, bg = "var(--sgl)", tc = "var(--sg)", size = "sm", icon, onClick }) {
  const sizeStyles = {
    sm: { padding: "4px 10px", fontSize: "var(--fs-xs)" },
    md: { padding: "6px 14px", fontSize: "var(--fs-sm)" },
    lg: { padding: "8px 18px", fontSize: "var(--fs-base)" }
  };
  
  return (
    <span 
      className={`tag ${onClick ? 'tag-clickable' : ''}`}
      style={{ 
        background: bg, 
        color: tc,
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        borderRadius: 30,
        fontWeight: 700,
        whiteSpace: "nowrap",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s",
        ...sizeStyles[size]
      }}
      onClick={onClick}
    >
      {icon && <span>{icon}</span>}
      {label}
    </span>
  );
}