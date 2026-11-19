import React from "react";
import { IconDrill, IconShield, IconArrowLeft } from "./Icons";

export default function Navbar({
  currentView = "home",
  onNavigateHome,
  activeChallengeTitle = null,
  sandboxStatus = "healthy"
}) {
  return (
    <header
      style={{
        height: "60px",
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Left: Brand Identity */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          onClick={onNavigateHome}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "var(--text-main)",
          }}
          title="Return to Drill Catalog"
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 14px rgba(37, 99, 235, 0.4)",
            }}
          >
            <IconDrill size={20} className="" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                Repo<span style={{ color: "var(--brand-blue)" }}>Drill</span>
              </span>
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: "rgba(59, 130, 246, 0.15)",
                  color: "#60a5fa",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                }}
              >
                PRACTICE GYM
              </span>
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", lineHeight: 1 }}>
              Real-World Multi-File Software Drills
            </span>
          </div>
        </button>

        {currentView === "workspace" && activeChallengeTitle && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginLeft: "12px",
              paddingLeft: "16px",
              borderLeft: "1px solid var(--border-subtle)",
            }}
          >
            <button
              onClick={onNavigateHome}
              className="btn-ghost"
              style={{ fontSize: "0.85rem", padding: "4px 8px" }}
            >
              <IconArrowLeft size={14} /> Catalog
            </button>
            <span style={{ color: "var(--text-dim)" }}>/</span>
            <span
              style={{
                fontSize: "0.88rem",
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

      {/* Right: Sandbox Status & Quick Links */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {/* Sandbox Security Indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            padding: "5px 12px",
            borderRadius: "20px",
            fontSize: "0.78rem",
            color: "#34d399",
            fontWeight: 500,
          }}
          title="Sandbox isolated: network disabled, memory capped at 128MB, containerized runner"
        >
          <span className="status-dot" />
          <IconShield size={14} />
          <span>Locked Sandbox Active</span>
        </div>

        {currentView === "workspace" ? (
          <button
            onClick={onNavigateHome}
            className="btn-secondary"
            style={{ fontSize: "0.82rem", padding: "6px 12px" }}
          >
            Change Drill
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <a
              href="#drills"
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                padding: "6px 10px",
                borderRadius: "6px",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-main)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              Drill Catalog
            </a>
            <a
              href="#sandbox-architecture"
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                padding: "6px 10px",
                borderRadius: "6px",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-main)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              Sandbox Security
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
