// src/components/ui/Modal.jsx
export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;
  
  const sizeStyles = {
    sm: { maxWidth: 300 },
    md: { maxWidth: 500 },
    lg: { maxWidth: 700 },
    full: { maxWidth: "90vw", width: "90vw" }
  };
  
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.8)",
      zIndex: 2000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--pad-x)"
    }}>
      <div style={{
        background: "var(--card)",
        borderRadius: "var(--r2)",
        width: "100%",
        ...sizeStyles[size],
        maxHeight: "90vh",
        overflowY: "auto"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "var(--sp-4) var(--sp-5)",
          borderBottom: "1px solid var(--border)"
        }}>
          <h3 style={{ fontSize: "var(--fs-lg)", fontWeight: 800, margin: 0 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "var(--fs-xl)",
              cursor: "pointer",
              padding: "var(--sp-1)",
              color: "var(--mt)"
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: "var(--sp-5)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}