// src/components/ui/WCard.jsx
export default function WCard({ children, style = {}, onClick, className = "" }) {
  return (
    <div 
      onClick={onClick} 
      className={`wcard ${className}`}
      style={{ 
        cursor: onClick ? "pointer" : "default",
        background: "var(--card)",
        borderRadius: "var(--r2)",
        padding: "var(--card-p)",
        boxShadow: "var(--sh)",
        border: "1px solid var(--border)",
        marginBottom: "var(--gap-md)",
        transition: "all 0.2s",
        ...style 
      }}
    >
      {children}
    </div>
  );
}