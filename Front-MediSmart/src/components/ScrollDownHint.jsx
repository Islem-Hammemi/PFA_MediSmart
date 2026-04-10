import { useEffect, useState } from "react";

export default function ScrollDownHint({
  threshold = 80,
  label = "Scroll",
  color = "rgba(48, 25, 223, 0.9)",
}) {
  const [visible, setVisible] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const key = `scrollHint_${window.location.pathname}`;
    if (sessionStorage.getItem(key)) return;

    setVisible(true);

    const handleScroll = () => {
      if (window.scrollY > threshold) {
        hide(key);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const hide = (key) => {
    const k = key || `scrollHint_${window.location.pathname}`;
    setHiding(true);
    sessionStorage.setItem(k, "1");
    setTimeout(() => setVisible(false), 500);
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes shFadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes shFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes shBounce {
          0%, 100% { transform: translateY(-6px); }
          50%       { transform: translateY(6px); }
        }
        @keyframes shPulseRing {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes shGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(96,165,250,0.5), 0 4px 24px rgba(59,130,246,0.4); }
          50%       { box-shadow: 0 0 0 12px rgba(96,165,250,0), 0 4px 24px rgba(59,130,246,0.6); }
        }
      `}</style>

      <div
        onClick={() => hide()}
        style={{
          position: "absolute",
          bottom: "-5px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
          zIndex: 9999,
          userSelect: "none",
          animation: hiding
            ? "shFadeOut 0.5s ease forwards"
            : "shFadeInUp 0.8s ease forwards",
        }}
      >
        {/* Pulse ring + main circle */}
        <div style={{ position: "relative", width: "56px", height: "56px" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "2px solid rgba(96,165,250,0.6)",
              animation: "shPulseRing 1.8s ease-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "2px solid rgba(255,255,255,0.35)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "shGlow 2s ease-in-out infinite",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              style={{ animation: "shBounce 1.4s ease-in-out infinite" }}
            >
              <path
                d="M11 3v16M4 12l7 7 7-7"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Label */}
        <span
          style={{
            fontSize: "11px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
            fontWeight: 600,
            fontFamily: "Inter, sans-serif",
          }}
        >
          {label}
        </span>
      </div>
    </>
  );
}