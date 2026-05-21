export default function App() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#000",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      gap: 16,
    }}>
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&display=swap"
        rel="stylesheet"
      />
      <p style={{ margin: 0, fontSize: 14, color: "#888", letterSpacing: "0.06em" }}>
        Vercel was just a deployment tool FYI
      </p>
      <p style={{ margin: 0, fontSize: 13, color: "#444", letterSpacing: "0.04em" }}>
        Security breach lel
      </p>
    </div>
  );
}
