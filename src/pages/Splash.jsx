export default function Splash() {
  return (
    <div className="fi" style={{
      position: "fixed", inset: 0,
      background: "linear-gradient(160deg,#2A1200 0%,#6B3018 50%,#E07840 100%)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", zIndex: 9999, padding: "var(--pad-x)"
    }}>
      <div style={{
        width: "clamp(72px,18vw,96px)", height: "clamp(72px,18vw,96px)",
        borderRadius: "clamp(20px,5vw,28px)",
        background: "rgba(255,255,255,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "var(--sp-5)",
        border: "1px solid rgba(255,255,255,0.2)",
        fontSize: "clamp(34px,9vw,48px)"
      }}>🌸</div>
      <div className="serif" style={{
        fontSize: "var(--fs-3xl)", color: "#fff",
        fontStyle: "italic", marginBottom: "var(--sp-1)", letterSpacing: -0.5
      }}>Mama<b style={{ fontStyle: "normal", color: "#F2A07A" }}>Bloom</b></div>
      <p style={{
        color: "rgba(255,255,255,0.45)", fontSize: "var(--fs-xs)",
        letterSpacing: 3, textTransform: "uppercase", marginBottom: "var(--sp-6)"
      }}>Maternal AI · UK & Nigeria-First</p>
      <div style={{
        width: "clamp(30px,7vw,40px)", height: "clamp(30px,7vw,40px)",
        border: "2.5px solid rgba(255,255,255,0.15)", borderTopColor: "#F2A07A",
        borderRadius: "50%", animation: "sp 0.8s linear infinite"
      }} />
      <div style={{
        position: "absolute", bottom: "clamp(32px,8vw,52px)",
        display: "flex", flexWrap: "wrap", justifyContent: "center",
        gap: "var(--gap-sm)", maxWidth: "clamp(260px,65vw,340px)",
        padding: "0 var(--pad-x)"
      }}>
        {["20 Features", "AI-Powered", "QR Scanner", "Offline-First", "Nigeria DB"].map(t => (
          <span key={t} style={{
            background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)",
            padding: "clamp(4px,1vw,6px) clamp(10px,2.5vw,14px)",
            borderRadius: 20, fontSize: "var(--fs-xs)", fontWeight: 700,
            border: "1px solid rgba(255,255,255,0.1)"
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
}
