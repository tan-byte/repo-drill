import React from "react";
import { IconArrowLeft } from "./Icons";
import Mascot from "./Mascot";

export default function Navbar({
  currentView = "home",
  onNavigateHome,
  activeChallengeTitle = null,
}) {
  return (
    <header
      style={{
        height: "56px",
        background: "rgba(7, 9, 18, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand Identity */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={onNavigateHome}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "var(--text-main)",
          }}
          title="RepoDrill Home"
        >
          <Mascot size="sm" interactive={false} />
          <span
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              fontFamily: "var(--font-heading)",
              letterSpacing: "-0.02em",
              color: "#ffffff",
            }}
          >
            Repo<span style={{ color: "var(--cosmic-violet)" }}>Drill</span>
          </span>
        </button>

        {currentView === "workspace" && activeChallengeTitle && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginLeft: "8px",
              paddingLeft: "14px",
              borderLeft: "1px solid var(--border-subtle)",
            }}
          >
            <button
              onClick={onNavigateHome}
              className="btn-ghost"
              style={{ fontSize: "0.82rem", padding: "4px 8px" }}
            >
              <IconArrowLeft size={14} /> Catalog
            </button>
            <span style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>/</span>
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--text-main)",
                maxWidth: "280px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {activeChallengeTitle}
            </span>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {currentView === "workspace" ? (
          <button
            onClick={onNavigateHome}
            className="btn-secondary"
            style={{ fontSize: "0.82rem", padding: "6px 12px" }}
          >
            All Challenges
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <a
              href="#challenges"
              style={{
                fontSize: "0.86rem",
                color: "var(--text-muted)",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-main)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              Challenges
            </a>
            <a
              href="#how-it-works"
              style={{
                fontSize: "0.86rem",
                color: "var(--text-muted)",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-main)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              How It Works
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
