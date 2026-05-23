// src/components/ui/Input.jsx
export default function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  required,
  disabled,
  icon,
  onIconClick
}) {
  return (
    <div style={{ marginBottom: "var(--sp-3)" }}>
      {label && (
        <label style={{
          display: "block",
          fontSize: "var(--fs-sm)",
          fontWeight: 700,
          color: "var(--dp)",
          marginBottom: "var(--sp-2)"
        }}>
          {label}
          {required && <span style={{ color: "var(--rd)", marginLeft: 4 }}>*</span>}
        </label>
      )}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: "100%",
            padding: "var(--sp-3)",
            paddingRight: icon ? "var(--sp-6)" : "var(--sp-3)",
            borderRadius: "var(--r)",
            border: `1.5px solid ${error ? "var(--rd)" : "var(--border)"}`,
            fontSize: "var(--fs-sm)",
            background: disabled ? "var(--warm)" : "var(--bg)",
            color: "var(--dp)",
            outline: "none",
            transition: "border-color 0.2s"
          }}
          onFocus={(e) => e.target.style.borderColor = "var(--t)"}
          onBlur={(e) => e.target.style.borderColor = error ? "var(--rd)" : "var(--border)"}
        />
        {icon && (
          <button
            type="button"
            onClick={onIconClick}
            style={{
              position: "absolute",
              right: "var(--sp-3)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "var(--fs-lg)",
              padding: 0
            }}
          >
            {icon}
          </button>
        )}
      </div>
      {error && (
        <p style={{
          fontSize: "var(--fs-xs)",
          color: "var(--rd)",
          marginTop: "var(--sp-1)",
          marginBottom: 0
        }}>
          {error}
        </p>
      )}
    </div>
  );
}