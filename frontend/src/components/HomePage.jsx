import React, { useState, useMemo } from "react";
import {
  IconPlay,
  IconCode,
  IconFileCode,
  IconSearch,
  IconCheckCircle,
  IconShield,
} from "./Icons";
import Mascot from "./Mascot";

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
    <div style={{ paddingBottom: "80px", position: "relative", zIndex: 1 }}>
      {/* Clean, Breathable Hero */}
      <section style={{ paddingTop: "48px", paddingBottom: "36px" }}>
        <div className="container">
          <div className="hero-clean-card">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                gap: "36px",
              }}
            >
              {/* Left Column */}
              <div>
                <h1
                  style={{
                    fontSize: "clamp(2rem, 3.8vw, 3.2rem)",
                    fontWeight: 700,
                    lineHeight: 1.18,
                    marginBottom: "16px",
                    color: "#ffffff",
                    letterSpacing: "-0.025em",
                  }}
                >
                  Practice coding on{" "}
                  <span
                    style={{
                      background: "linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #38bdf8 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    real codebases
                  </span>
                  .
                </h1>

                <p
                  style={{
                    fontSize: "1.06rem",
                    color: "var(--text-muted)",
                    maxWidth: "620px",
                    lineHeight: 1.6,
                    marginBottom: "26px",
                  }}
                >
                  Instead of single-file puzzle questions, RepoDrill drops you into small,
                  authentic multi-file projects. Fix bugs, read error logs, and build features —
                  tested safely inside an isolated browser sandbox.
                </p>

                {/* Primary Actions */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "28px" }}>
                  <button
                    onClick={() => {
                      if (challenges.length > 0) {
                        onSelectChallenge(challenges[0].id);
                      }
                    }}
                    className="btn-primary"
                    style={{ padding: "11px 22px", fontSize: "0.95rem" }}
                  >
                    <IconPlay size={16} />
                    <span>Start First Challenge</span>
                  </button>

                  <a
                    href="#challenges"
                    className="btn-secondary"
                    style={{ padding: "11px 18px", fontSize: "0.92rem" }}
                  >
                    <IconCode size={16} />
                    <span>Browse All ({challenges.length})</span>
                  </a>
                </div>

                {/* Subtle Value Badges */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "20px",
                    fontSize: "0.82rem",
                    color: "var(--text-dim)",
                    paddingTop: "18px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="status-dot" /> Multi-file projects
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="status-dot" /> Safe sandbox testing
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="status-dot" /> Real pytest &amp; error logs
                  </span>
                </div>
              </div>

              {/* Right Column: Friendly Mascot */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px",
                }}
              >
                <Mascot size="lg" withBubble={true} interactive={true} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges Section */}
      <section id="challenges" style={{ paddingTop: "24px" }}>
        <div className="container">
          {/* Header & Search */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.65rem", fontWeight: 700, color: "#ffffff" }}>
                Choose a Challenge
              </h2>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Select a category or search by topic to load a workspace.
              </p>
            </div>

            {/* Clean Search Input */}
            <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
              <div
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-dim)",
                }}
              >
                <IconSearch size={15} />
              </div>
              <input
                type="text"
                placeholder="Search by keyword, tag, file..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "8px 12px 8px 34px",
                  fontSize: "0.85rem",
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
              gap: "10px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "10px",
              padding: "8px 14px",
              marginBottom: "22px",
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
                      padding: "5px 12px",
                      borderRadius: "6px",
                      fontSize: "0.82rem",
                      fontWeight: active ? 600 : 500,
                      background: active ? "var(--cosmic-purple)" : "transparent",
                      color: active ? "#ffffff" : "var(--text-muted)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Difficulty Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "0.76rem", color: "var(--text-dim)", fontWeight: 600 }}>
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
                      border: active ? "1px solid var(--border-cosmic)" : "1px solid transparent",
                    }}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Challenge Cards Grid */}
          {filteredChallenges.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 20px",
                background: "var(--bg-surface)",
                borderRadius: "12px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <h3 style={{ fontSize: "1.15rem", fontWeight: 600, color: "var(--text-main)" }}>
                No challenges match your search
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "4px" }}>
                Try adjusting keywords or clearing category filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedDifficulty("All");
                  setSearchQuery("");
                }}
                className="btn-secondary"
                style={{ marginTop: "14px", fontSize: "0.85rem" }}
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
                  <div key={challenge.id} className="drill-clean-card">
                    {/* Top Row: Badges & Time */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className={`badge ${badgeClass}`}>
                          {challenge.difficulty}
                        </span>
                        <span className="badge badge-tag">
                          {challenge.mode}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-dim)",
                        }}
                      >
                        ~{challenge.estimated_minutes || 15} min
                      </span>
                    </div>

                    {/* Challenge Title */}
                    <h3
                      style={{
                        fontSize: "1.12rem",
                        fontWeight: 600,
                        color: "#ffffff",
                        lineHeight: 1.35,
                        marginBottom: "6px",
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
                        marginBottom: "14px",
                        flex: 1,
                      }}
                    >
                      {challenge.description}
                    </p>

                    {/* File Peek Bar */}
                    <div
                      style={{
                        background: "var(--bg-editor)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "6px",
                        padding: "7px 10px",
                        marginBottom: "14px",
                        fontSize: "0.76rem",
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
                          <span>
                            <strong>{challenge.files_count || (challenge.file_names && challenge.file_names.length) || 1} files</strong> in project
                          </span>
                        </span>
                        <button
                          onClick={() => setPreviewFilesId(isPreviewing ? null : challenge.id)}
                          style={{
                            color: "var(--cosmic-violet)",
                            fontWeight: 600,
                            fontSize: "0.74rem",
                          }}
                        >
                          {isPreviewing ? "Hide files ▲" : "Peek files ▼"}
                        </button>
                      </div>

                      {/* File preview list */}
                      {isPreviewing && challenge.file_names && (
                        <div
                          style={{
                            marginTop: "8px",
                            paddingTop: "8px",
                            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "3px",
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

                    {/* Open Button */}
                    <button
                      onClick={() => onSelectChallenge(challenge.id)}
                      className="btn-primary"
                      style={{
                        width: "100%",
                        justifyContent: "center",
                        padding: "9px",
                        fontSize: "0.88rem",
                      }}
                    >
                      <IconPlay size={14} />
                      <span>Open Workspace</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Clean "How It Works" Section */}
      <section id="how-it-works" style={{ paddingTop: "52px" }}>
        <div className="container">
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "14px",
              padding: "32px 28px",
            }}
          >
            <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 28px auto" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ffffff" }}>
                How RepoDrill Works
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "4px" }}>
                Practice real engineering tasks in 3 simple steps without installing anything locally.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "20px",
              }}
            >
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "10px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    background: "rgba(139, 92, 246, 0.15)",
                    color: "var(--cosmic-violet)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    marginBottom: "12px",
                  }}
                >
                  1
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "6px" }}>
                  Pick a Project
                </h3>
                <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Choose from e-commerce carts, authentication services, rate limiters, or data exporters.
                </p>
              </div>

              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "10px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    background: "rgba(56, 189, 248, 0.15)",
                    color: "var(--cosmic-cyan)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    marginBottom: "12px",
                  }}
                >
                  2
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "6px" }}>
                  Edit the Files
                </h3>
                <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Explore the multi-file codebase in the browser editor and write your fix or feature.
                </p>
              </div>

              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "10px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#34d399",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    marginBottom: "12px",
                  }}
                >
                  3
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "6px" }}>
                  Test in Sandbox
                </h3>
                <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Run hidden pytest unit tests and PEP8 style checks inside an isolated container.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
