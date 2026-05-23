// src/components/ui/ProgBar.jsx
export default function ProgBar({ val, max, col = "var(--t)", height = "8px", showLabel = false }) {
  const percentage = Math.min((val / max) * 100, 100);
  
  return (
    <div style={{ width: "100%" }}>
      {showLabel && (
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          marginBottom: "var(--sp-1)",
          fontSize: "var(--fs-xs)",
          color: "var(--mt)"
        }}>
          <span>{val}</span>
          <span>{max}</span>
        </div>
      )}
      <div style={{
        background: "var(--border)",
        borderRadius: 30,
        height: height,
        overflow: "hidden"
      }}>
        <div style={{
          width: `${percentage}%`,
          background: col,
          height: "100%",
          borderRadius: 30,
          transition: "width 0.3s ease"
        }} />
      </div>
    </div>
  );
}