"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          color: "#fafafa",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 300,
              marginBottom: "0.75rem",
            }}
          >
            Something broke
          </h1>
          <p
            style={{
              color: "#71717a",
              fontSize: "0.875rem",
              marginBottom: "1.5rem",
            }}
          >
            A critical error stopped the app from loading. Try reloading.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#fafafa",
              color: "#18181b",
              border: "none",
              borderRadius: "1rem",
              padding: "0.75rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
