// src/components/ui/Spinner.jsx
export default function Spinner({ size = "md", color = "var(--t)" }) {
  const sizeStyles = {
    sm: { width: 20, height: 20, borderWidth: 2 },
    md: { width: 32, height: 32, borderWidth: 3 },
    lg: { width: 48, height: 48, borderWidth: 4 }
  };
  
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: 1
    }}>
      <div style={{
        ...sizeStyles[size],
        border: `${sizeStyles[size].borderWidth}px solid var(--border)`,
        borderTopColor: color,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite"
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}