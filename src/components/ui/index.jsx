export const Tag = ({ label, bg = "var(--sgl)", tc = "var(--sg)" }) => (
  <span className="tag" style={{ background: bg, color: tc }}>{label}</span>
);

export const IconBox = ({ emoji, bg, size = "var(--icon-sm)" }) => (
  <div style={{
    width: size, height: size, flexShrink: 0,
    borderRadius: "28%", background: bg,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: `calc(${size} * 0.46)`
  }}>{emoji}</div>
);

export const WCard = ({ children, style = {}, onClick, className = "" }) => (
  <div onClick={onClick} className={`wcard ${className}`}
    style={{ cursor: onClick ? "pointer" : "default", ...style }}>
    {children}
  </div>
);

export const SectionTitle = ({ title, action, onAction }) => (
  <div className="sec-title">
    <h2>{title}</h2>
    {action && (
      <button onClick={onAction} style={{
        background: "none", border: "none", color: "var(--t)",
        fontSize: "var(--fs-sm)", fontWeight: 700, cursor: "pointer"
      }}>{action}</button>
    )}
  </div>
);

export const ProgBar = ({ val, max, col = "var(--t)" }) => (
  <div className="prog-track">
    <div className="prog-fill" style={{
      width: `${Math.min((val / max) * 100, 100)}%`,
      background: col
    }} />
  </div>
);

export const Pill = ({ label, active, onClick, color = "var(--t)" }) => (
  <button onClick={onClick} style={{
    padding: "clamp(6px,1.5vw,8px) clamp(13px,3.2vw,18px)",
    borderRadius: 30, fontSize: "var(--fs-sm)", fontWeight: 700,
    background: active ? color : "var(--card)",
    color: active ? "#fff" : "var(--mt)",
    border: `1.5px solid ${active ? color : "var(--border)"}`,
    cursor: "pointer", transition: "all 0.2s", flexShrink: 0,
    boxShadow: active ? `0 4px 14px ${color}44` : "none",
    minHeight: "var(--touch)"
  }}>{label}</button>
);
