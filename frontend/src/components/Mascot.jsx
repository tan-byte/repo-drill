import React, { useState } from "react";

const MASCOT_TIPS = [
  "Hi! I'm Drilly. Ready to fix some real-world bugs?",
  "Pick any project below — changes run in an isolated sandbox!",
  "Multi-file projects test what companies actually pay you for.",
  "Check README.md in any workspace for reproduction steps.",
];

export default function Mascot({
  size = "md", // "sm" | "md" | "lg"
  withBubble = false,
  interactive = true,
}) {
  const [tipIdx, setTipIdx] = useState(0);

  const dimensions = {
    sm: { width: 36, height: 42 },
    md: { width: 68, height: 78 },
    lg: { width: 110, height: 126 },
  }[size] || { width: 68, height: 78 };

  const handleNextTip = () => {
    if (!interactive) return;
    setTipIdx((prev) => (prev + 1) % MASCOT_TIPS.length);
  };

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: interactive ? "pointer" : "default",
        userSelect: "none",
      }}
      onClick={handleNextTip}
      title={interactive ? "Click Drilly for a tip" : "Drilly the Cosmonaut"}
    >
      {/* Speech Bubble */}
      {withBubble && (
        <div
          className="mascot-bubble"
          style={{
            maxWidth: "260px",
            marginBottom: "14px",
            textAlign: "left",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "3px",
            }}
          >
            <span
              style={{
                fontSize: "0.76rem",
                fontWeight: 700,
                color: "var(--cosmic-violet)",
                letterSpacing: "0.02em",
              }}
            >
              Drilly says:
            </span>
            <span
              style={{
                fontSize: "0.68rem",
                color: "var(--text-dim)",
              }}
            >
              (click)
            </span>
          </div>
          <p
            style={{
              fontSize: "0.84rem",
              color: "var(--text-main)",
              lineHeight: 1.45,
              margin: 0,
            }}
          >
            &quot;{MASCOT_TIPS[tipIdx]}&quot;
          </p>
        </div>
      )}

      {/* Retro Pixel Mascot SVG */}
      <div className="float-zero-g" style={{ filter: "drop-shadow(0 0 14px rgba(139, 92, 246, 0.3))" }}>
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox="0 0 80 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top Drill Antenna */}
          <path d="M38 4h4v6h-4z" fill="#facc15" />
          <path d="M36 10h8v4h-8z" fill="#eab308" />
          <path d="M34 14h12v4h-12z" fill="#ca8a04" />
          <circle cx="40" cy="3" r="2.5" fill="#fef08a" />

          {/* Helmet Dome */}
          <rect x="20" y="18" width="40" height="34" rx="10" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2" />
          <rect x="22" y="20" width="36" height="30" rx="8" fill="#0f172a" />

          {/* Visor */}
          <rect x="25" y="23" width="30" height="20" rx="5" fill="#030712" />
          <path d="M26 24h12v3H26z M44 24h8v3h-8z" fill="#38bdf8" opacity="0.85" />

          {/* Pixel Eyes */}
          <rect x="31" y="29" width="4" height="6" rx="1" fill="#38bdf8" />
          <rect x="45" y="29" width="4" height="6" rx="1" fill="#38bdf8" />
          <rect x="29" y="37" width="4" height="2" fill="#c084fc" opacity="0.6" />
          <rect x="47" y="37" width="4" height="2" fill="#c084fc" opacity="0.6" />

          {/* Collar */}
          <rect x="26" y="50" width="28" height="5" rx="2" fill="#94a3b8" />
          <circle cx="33" cy="52" r="1.5" fill="#06b6d4" />
          <circle cx="47" cy="52" r="1.5" fill="#a855f7" />

          {/* Body */}
          <rect x="24" y="55" width="32" height="24" rx="4" fill="#f1f5f9" />
          <rect x="30" y="58" width="20" height="13" rx="2" fill="#0b0f19" />
          <text
            x="40"
            y="67"
            fill="#38bdf8"
            fontSize="8"
            fontWeight="bold"
            fontFamily="monospace"
            textAnchor="middle"
          >
            &lt;/&gt;
          </text>

          {/* Left Arm with Drill Tool */}
          <path d="M16 57h8v14h-4v6h-4v-12h4v-8z" fill="#cbd5e1" />
          <path d="M12 77h4v4h-4z" fill="#facc15" />
          <path d="M13 81h2v3h-2z" fill="#eab308" />

          {/* Right Arm */}
          <path d="M56 57h8v10h4v-6h4v12h-8v-8h-4z" fill="#cbd5e1" />
          <rect x="68" y="59" width="4" height="4" fill="#94a3b8" />

          {/* Jetpack */}
          <rect x="18" y="57" width="6" height="18" rx="2" fill="#64748b" />
          <rect x="56" y="57" width="6" height="18" rx="2" fill="#64748b" />

          {/* Boots */}
          <rect x="28" y="79" width="9" height="10" rx="2" fill="#cbd5e1" />
          <rect x="43" y="79" width="9" height="10" rx="2" fill="#cbd5e1" />
          <rect x="27" y="87" width="11" height="4" rx="1" fill="#475569" />
          <rect x="42" y="87" width="11" height="4" rx="1" fill="#475569" />

          {/* Thrusters */}
          <path d="M30 92h5l-2.5 4z" fill="#f97316" opacity="0.9" />
          <path d="M45 92h5l-2.5 4z" fill="#f97316" opacity="0.9" />
        </svg>
      </div>
    </div>
  );
}
