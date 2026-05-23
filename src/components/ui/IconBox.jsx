// src/components/ui/IconBox.jsx
export default function IconBox({ emoji, bg, size = "var(--icon-sm)", onClick }) {
  return (
    <div 
      className="icon-box"
      style={{
        width: size, 
        height: size, 
        flexShrink: 0,
        borderRadius: "28%", 
        background: bg || "var(--warm)",
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        fontSize: `calc(${size} * 0.46)`,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s"
      }}
      onClick={onClick}
    >
      {emoji}
    </div>
  );
}