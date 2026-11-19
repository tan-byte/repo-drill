import React, { useState, useMemo } from "react";
import {
  IconPlay,
  IconShield,
  IconCode,
  IconFileCode,
  IconSearch,
  IconCpu,
  IconCheckCircle,
  IconTerminal,
  IconLock,
} from "./Icons";

export default function HomePage({
  challenges = [],
  onSelectChallenge,
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewFilesId, setPreviewFilesId] = useState(null);

  // Derive categories list dynamically
  const categories = useMemo(() => {
    const set = new Set(["All"]);
    challenges.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [challenges]);

  // Filtered challenges
  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      const matchCat =
        selectedCategory === "All" || c.category === selectedCategory;
      const matchDiff =
        selectedDifficulty === "All" ||
        c.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
      const matchSearch =
        searchQuery.trim() === "" ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.tags &&
          c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        (c.file_names &&
          c.file_names.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase())));

      return matchCat && matchDiff && matchSearch;
    });
  }, [challenges, selectedCategory, selectedDifficulty, searchQuery]);

  return (
    <div style={{ paddingBottom: "80px" }}>
      {/* Hero Section */}
      <section style={{ paddingTop: "40px", paddingBottom: "36px" }}>
        <div className="container">
          <div className="hero-glow-card">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(59, 130, 246, 0.12)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                padding: "6px 14px",
                borderRadius: "30px",
                fontSize: "0.8rem",
                color: "#60a5fa",
                fontWeight: 600,
                marginBottom: "20px",
              }}
            >
              <IconShield size={15} />
              <span>PRACTICE REAL REPOSITORIES INSIDE A LOCKED-DOWN SANDBOX</span>
            </div>

            <h1
              style={{
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                marginBottom: "16px",
                maxWidth: "840px",
              }}
            >
              The safe practice gym for{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #93c5fd 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                real software jobs
              </span>
              .
            </h1>

            <p
              style={{
                fontSize: "1.1rem",
                color: "var(--text-muted)",
                maxWidth: "760px",
                lineHeight: 1.6,
                marginBottom: "28px",
              }}
            >
              Solving single-file algorithm puzzles doesn't prepare you for real developer jobs.
              RepoDrill loads authentic, multi-file codebases in your browser where you navigate
              imports, diagnose stack traces, fix edge-case bugs, and add features safely inside
              an isolated sandbox container.
            </p>

            {/* Quick Actions */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginBottom: "36px" }}>
              <button
                onClick={() => {
                  if (challenges.length > 0) {
                    onSelectChallenge(challenges[0].id);
                  }
                }}
                className="btn-primary"
                style={{ padding: "12px 24px", fontSize: "1rem" }}
              >
                <IconPlay size={18} />
                <span>Start Featured Drill</span>
              </button>

              <a
                href="#drills"
                className="btn-secondary"
                style={{ padding: "12px 20px", fontSize: "0.95rem" }}
              >
                <IconCode size={18} />
                <span>Explore All {challenges.length} Drills</span>
              </a>

              <a
                href="#sandbox-architecture"
                className="btn-ghost"
                style={{ padding: "12px 18px", fontSize: "0.92rem", color: "var(--text-muted)" }}
              >
                <IconShield size={16} />
                <span>How Sandbox Works</span>
              </a>
            </div>

            {/* Metrics Ribbon */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "16px",
                paddingTop: "24px",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-main)" }}>
                  Multi-File Repos
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>
                  Cross-file imports & models
                </div>
              </div>

              <div>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#34d399" }}>
                  100% Locked Sandbox
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>
                  Network cut, 128MB RAM cap
                </div>
              </div>

              <div>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#60a5fa" }}>
                  Real Error Traces
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>
                  Pytest & PEP8 linter feedback
                </div>
              </div>

              <div>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#c084fc" }}>
                  Zero Local Setup
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>
                  Runs instantly in your browser
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sandbox Architecture Flow Visualization */}
      <section
        id="sandbox-architecture"
        style={{
          padding: "24px 0 40px 0",
        }}
      >
        <div className="container">
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "14px",
              padding: "28px 24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "var(--brand-blue)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  <IconLock size={14} /> Security by Design
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "4px" }}>
                  How Untrusted Code Runs Safely
                </h3>
              </div>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-dim)",
                  background: "var(--bg-elevated)",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                Ephemeral Docker Container Isolation
              </span>
            </div>

            {/* Architecture Steps Flow */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
                position: "relative",
              }}
            >
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "10px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "rgba(59, 130, 246, 0.2)",
                      color: "#60a5fa",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    1
                  </span>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Browser Editor</span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  You inspect and edit repository files in the formal workspace without installing dependencies locally.
                </p>
              </div>

              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "10px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "rgba(16, 185, 129, 0.2)",
                      color: "#34d399",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    2
                  </span>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Ephemeral Scratchpad</span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Your modified files are safely mounted into an ephemeral temporary workspace with path traversal guards.
                </p>
              </div>

              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "10px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "rgba(245, 158, 11, 0.2)",
                      color: "#fbbf24",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    3
                  </span>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Locked Container</span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Execution occurs with <code>network_disabled=True</code>, 128MB RAM limit, 0.5 CPU cap, and zero host disk access.
                </p>
              </div>

              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "10px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "rgba(168, 85, 247, 0.2)",
                      color: "#c084fc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    4
                  </span>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Hidden Test Engine</span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Read-only hidden pytest suite evaluates regressions while linters check PEP8 formatting and code safety.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Drills Section */}
      <section id="drills" style={{ paddingTop: "20px" }}>
        <div className="container">
          {/* Header & Search */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "var(--brand-blue)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                <IconCode size={14} /> Repository Catalog
              </div>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, marginTop: "2px" }}>
                Select Your Drill Workspace
              </h2>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Choose a category, inspect the repository files, and jump into the minimal workspace.
              </p>
            </div>

            {/* Search Input */}
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "320px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-dim)",
                }}
              >
                <IconSearch size={16} />
              </div>
              <input
                type="text"
                placeholder="Search drills, tags, or files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "9px 12px 9px 36px",
                  fontSize: "0.88rem",
                  color: "var(--text-main)",
                  outline: "none",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-dim)",
                    fontSize: "0.75rem",
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar: Categories + Difficulty */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "10px",
              padding: "10px 16px",
              marginBottom: "24px",
            }}
          >
            {/* Category Pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "0.82rem",
                      fontWeight: active ? 600 : 500,
                      background: active ? "var(--brand-blue)" : "transparent",
                      color: active ? "#ffffff" : "var(--text-muted)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Difficulty Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-dim)", fontWeight: 600 }}>
                DIFFICULTY:
              </span>
              {["All", "Easy", "Medium", "Hard"].map((diff) => {
                const active = selectedDifficulty === diff;
                return (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "0.78rem",
                      fontWeight: active ? 600 : 500,
                      background: active ? "var(--bg-elevated)" : "transparent",
                      color: active ? "var(--text-main)" : "var(--text-dim)",
                      border: active ? "1px solid var(--border-strong)" : "1px solid transparent",
                    }}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drills Grid */}
          {filteredChallenges.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "var(--bg-surface)",
                borderRadius: "12px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ color: "var(--text-dim)", marginBottom: "12px" }}>
                <IconSearch size={36} />
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>No matching drills found</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "4px" }}>
                Try adjusting your search query or reset category filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedDifficulty("All");
                  setSearchQuery("");
                }}
                className="btn-secondary"
                style={{ marginTop: "16px" }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="drill-grid">
              {filteredChallenges.map((challenge) => {
                const isPreviewing = previewFilesId === challenge.id;
                const diffLower = challenge.difficulty.toLowerCase();
                const badgeClass =
                  diffLower === "easy"
                    ? "badge-easy"
                    : diffLower === "hard"
                    ? "badge-hard"
                    : "badge-medium";

                return (
                  <div key={challenge.id} className="drill-card">
                    {/* Card Top: Badges & Time */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className={`badge ${badgeClass}`}>
                          {challenge.difficulty}
                        </span>
                        <span className="badge badge-mode">
                          {challenge.mode}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-dim)",
                          fontWeight: 500,
                        }}
                      >
                        ⏱ ~{challenge.estimated_minutes || 15} min
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      style={{
                        fontSize: "1.18rem",
                        fontWeight: 700,
                        color: "var(--text-main)",
                        lineHeight: 1.3,
                        marginBottom: "8px",
                      }}
                    >
                      {challenge.title}
                    </h3>

                    {/* Description */}
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                        lineHeight: 1.5,
                        marginBottom: "16px",
                        flex: 1,
                      }}
                    >
                      {challenge.description}
                    </p>

                    {/* Repository Files Preview Bar */}
                    <div
                      style={{
                        background: "var(--bg-editor)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "6px",
                        padding: "8px 10px",
                        marginBottom: "16px",
                        fontSize: "0.78rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          color: "var(--text-dim)",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <IconFileCode size={13} />
                          <strong>{challenge.files_count || (challenge.file_names && challenge.file_names.length) || 1} files</strong> in repository
                        </span>
                        <button
                          onClick={() => setPreviewFilesId(isPreviewing ? null : challenge.id)}
                          style={{
                            color: "var(--brand-blue)",
                            fontWeight: 600,
                            fontSize: "0.74rem",
                          }}
                        >
                          {isPreviewing ? "Hide files ▲" : "Peek files ▼"}
                        </button>
                      </div>

                      {/* Expanded file list */}
                      {isPreviewing && challenge.file_names && (
                        <div
                          style={{
                            marginTop: "8px",
                            paddingTop: "8px",
                            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                          }}
                        >
                          {challenge.file_names.map((fn) => (
                            <div
                              key={fn}
                              className="mono"
                              style={{
                                color: fn.endsWith(".py") ? "#93c5fd" : "#cbd5e1",
                                fontSize: "0.74rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <span>•</span>
                              <span>{fn}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {challenge.tags && challenge.tags.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                          marginBottom: "18px",
                        }}
                      >
                        {challenge.tags.map((t) => (
                          <span
                            key={t}
                            style={{
                              fontSize: "0.7rem",
                              color: "var(--text-dim)",
                              background: "rgba(255, 255, 255, 0.04)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => onSelectChallenge(challenge.id)}
                      className="btn-primary"
                      style={{
                        width: "100%",
                        justifyContent: "center",
                        padding: "10px",
                        fontSize: "0.9rem",
                      }}
                    >
                      <IconPlay size={15} />
                      <span>Launch Workspace</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Comparison: Why Multi-file Repos Matter */}
      <section style={{ paddingTop: "60px" }}>
        <div className="container">
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "16px",
              padding: "36px",
            }}
          >
            <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 32px auto" }}>
              <span
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "var(--brand-blue)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Beyond Algorithm Puzzles
              </span>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "4px" }}>
                Why Multi-File Drills Prepare You for Real Jobs
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginTop: "8px" }}>
                Standard interview platforms test academic algorithms. Real software jobs require
                diagnosing interactions between services, models, and tests.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "10px",
                  padding: "22px",
                }}
              >
                <div style={{ color: "var(--danger-rose)", fontWeight: 700, marginBottom: "8px" }}>
                  Traditional Coding Sites
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    fontSize: "0.86rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <li style={{ display: "flex", gap: "8px" }}>
                    <span style={{ color: "var(--danger-rose)" }}>✗</span>
                    Single file, single function isolated sandbox
                  </li>
                  <li style={{ display: "flex", gap: "8px" }}>
                    <span style={{ color: "var(--danger-rose)" }}>✗</span>
                    Abstract puzzles with zero real business logic
                  </li>
                  <li style={{ display: "flex", gap: "8px" }}>
                    <span style={{ color: "var(--danger-rose)" }}>✗</span>
                    No exposure to error tracebacks or linters
                  </li>
                  <li style={{ display: "flex", gap: "8px" }}>
                    <span style={{ color: "var(--danger-rose)" }}>✗</span>
                    Doesn't test how code changes affect other files
                  </li>
                </ul>
              </div>

              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  borderRadius: "10px",
                  padding: "22px",
                  boxShadow: "0 4px 20px rgba(16, 185, 129, 0.08)",
                }}
              >
                <div style={{ color: "#34d399", fontWeight: 700, marginBottom: "8px" }}>
                  RepoDrill Practice Gym
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    fontSize: "0.86rem",
                    color: "var(--text-main)",
                  }}
                >
                  <li style={{ display: "flex", gap: "8px" }}>
                    <span style={{ color: "#34d399" }}>✓</span>
                    Realistic multi-file codebases with models & utils
                  </li>
                  <li style={{ display: "flex", gap: "8px" }}>
                    <span style={{ color: "#34d399" }}>✓</span>
                    Authentic bug tickets, memory spikes, & auth holes
                  </li>
                  <li style={{ display: "flex", gap: "8px" }}>
                    <span style={{ color: "#34d399" }}>✓</span>
                    Pytest assertion logs, stack traces & style checks
                  </li>
                  <li style={{ display: "flex", gap: "8px" }}>
                    <span style={{ color: "#34d399" }}>✓</span>
                    100% locked-down sandbox safe for experimentation
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
