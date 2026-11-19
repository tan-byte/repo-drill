import React, { useEffect, useState, useRef } from "react";
import {
  IconPlay,
  IconArrowLeft,
  IconRotateCcw,
  IconShield,
  IconFileCode,
  IconFile,
  IconTerminal,
  IconLightbulb,
  IconCheckCircle,
  IconXCircle,
  IconLock,
} from "./Icons";

const API = "http://localhost:8000";

export default function Workspace({
  challengeId = "01-fix-discount-bug",
  onNavigateHome,
  allChallenges = [],
}) {
  const [meta, setMeta] = useState(null);
  const [initialFiles, setInitialFiles] = useState({});
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState("");
  const [openTabs, setOpenTabs] = useState([]);
  const [sidebarTab, setSidebarTab] = useState("spec"); // "spec" | "files"
  const [showHints, setShowHints] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sandboxMode, setSandboxMode] = useState("isolated_sandbox");

  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  // Load challenge data
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setResult(null);

    // Try fetching from backend first
    fetch(`${API}/challenges/${challengeId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Backend not available");
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        setMeta(data.meta || {});
        const fileMap = data.files || {};
        setFiles(fileMap);
        setInitialFiles(JSON.parse(JSON.stringify(fileMap)));

        const names = Object.keys(fileMap);
        if (names.length > 0) {
          // Prefer opening the primary code file or README
          const defaultFile = names.find((n) => n.endsWith(".py")) || names[0];
          setActiveFile(defaultFile);
          setOpenTabs(names.slice(0, 3));
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback to embedded challenge data from props
        if (!isMounted) return;
        const local = allChallenges.find((c) => c.id === challengeId);
        if (local) {
          setMeta(local);
          const fileMap = local.files || {};
          setFiles(fileMap);
          setInitialFiles(JSON.parse(JSON.stringify(fileMap)));
          const names = Object.keys(fileMap);
          if (names.length > 0) {
            const defaultFile = names.find((n) => n.endsWith(".py")) || names[0];
            setActiveFile(defaultFile);
            setOpenTabs(names.slice(0, 3));
          }
        }
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [challengeId, allChallenges]);

  // Synchronize line numbers scroll with textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Keyboard shortcut Ctrl+Enter to submit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [files, challengeId, loading]);

  // Tab key & auto-indent support in textarea
  const handleEditorKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentVal = files[activeFile] || "";
      const updatedVal =
        currentVal.substring(0, start) + "    " + currentVal.substring(end);

      setFiles({ ...files, [activeFile]: updatedVal });
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleOpenFile = (fileName) => {
    setActiveFile(fileName);
    if (!openTabs.includes(fileName)) {
      setOpenTabs([...openTabs, fileName]);
    }
  };

  const handleCloseTab = (e, fileName) => {
    e.stopPropagation();
    const remaining = openTabs.filter((t) => t !== fileName);
    setOpenTabs(remaining);
    if (activeFile === fileName) {
      if (remaining.length > 0) {
        setActiveFile(remaining[0]);
      } else {
        const allKeys = Object.keys(files);
        if (allKeys.length > 0) setActiveFile(allKeys[0]);
      }
    }
  };

  const handleResetFiles = () => {
    if (window.confirm("Reset all modified files to initial starter state?")) {
      setFiles(JSON.parse(JSON.stringify(initialFiles)));
      setResult(null);
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API}/challenges/${challengeId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
      });

      if (!res.ok) throw new Error("HTTP error " + res.status);
      const data = await res.json();
      setResult(data);
      if (data.mode) setSandboxMode(data.mode);
    } catch {
      // Local client fallback evaluation
      setResult({
        passed: false,
        mode: "local_sandbox",
        logs:
          "[BACKEND OFFLINE] Could not connect to RepoDrill backend at http://localhost:8000.\n" +
          "To run tests inside the Docker container or isolated Python sandbox:\n" +
          "1. Start the backend: 'cd backend && uvicorn app.main:app --reload'\n" +
          "2. Ensure Docker Desktop or Python 3.11 is running.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to colorize terminal logs
  const renderLogLines = (rawLogs) => {
    if (!rawLogs) return null;
    return rawLogs.split("\n").map((line, idx) => {
      let className = "log-dim";
      if (line.includes("✓ PASSED") || line.includes("SUCCESS") || line.includes("ALL TESTS")) {
        className = "log-pass";
      } else if (
        line.includes("✗ FAILED") ||
        line.includes("CRITICAL ERROR") ||
        line.includes("AssertionError") ||
        line.includes("VERIFICATION FAILED") ||
        line.includes("TIMEOUT ERROR") ||
        line.includes("SYNTAX ERROR")
      ) {
        className = "log-fail";
      } else if (line.includes("===") || line.includes("--- STEP")) {
        className = "log-header";
      } else if (line.includes("WARNING") || line.includes("[STYLE WARNING]")) {
        className = "log-warn";
      } else if (line.trim().startsWith("File ") || line.includes("line ")) {
        className = "mono";
      }

      return (
        <div key={idx} className={className}>
          {line || "\u00A0"}
        </div>
      );
    });
  };

  const fileContent = files[activeFile] || "";
  const lineCount = fileContent.split("\n").length;
  const lineNumbersArray = Array.from({ length: lineCount }, (_, i) => i + 1);

  // Check if active file has changes
  const isFileModified = (fn) => {
    return initialFiles[fn] !== undefined && initialFiles[fn] !== files[fn];
  };

  return (
    <div className="workspace-wrapper">
      {/* Workspace Header - Formal & Minimal */}
      <header className="workspace-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={onNavigateHome}
            className="btn-ghost"
            style={{ fontSize: "0.82rem", padding: "4px 8px" }}
            title="Return to Catalog"
          >
            <IconArrowLeft size={14} /> Catalog
          </button>

          <span style={{ color: "var(--border-strong)" }}>|</span>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "var(--text-main)",
                letterSpacing: "-0.01em",
              }}
            >
              {meta?.title || challengeId}
            </span>

            {meta?.difficulty && (
              <span
                className={`badge ${
                  meta.difficulty.toLowerCase() === "easy"
                    ? "badge-easy"
                    : meta.difficulty.toLowerCase() === "hard"
                    ? "badge-hard"
                    : "badge-medium"
                }`}
                style={{ fontSize: "0.68rem", padding: "2px 6px" }}
              >
                {meta.difficulty}
              </span>
            )}

            {meta?.mode && (
              <span className="badge badge-mode" style={{ fontSize: "0.68rem", padding: "2px 6px" }}>
                {meta.mode}
              </span>
            )}
          </div>
        </div>

        {/* Center / Right: Sandbox Guard & Primary Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.75rem",
              color: "#34d399",
              padding: "3px 8px",
            }}
            title="Isolated sandbox active"
          >
            <span className="status-dot" />
            <span>Sandbox</span>
          </div>

          <button
            onClick={() => setShowHints(!showHints)}
            className="btn-ghost"
            style={{
              fontSize: "0.8rem",
              padding: "5px 10px",
              color: showHints ? "var(--warning-amber)" : "var(--text-muted)",
              background: showHints ? "rgba(245, 158, 11, 0.1)" : "transparent",
            }}
            title="Toggle hints drawer"
          >
            <IconLightbulb size={14} /> Hints
          </button>

          <button
            onClick={handleResetFiles}
            className="btn-ghost"
            style={{ fontSize: "0.8rem", padding: "5px 10px" }}
            title="Reset repository to starter state"
          >
            <IconRotateCcw size={14} /> Reset
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary"
            style={{ fontSize: "0.82rem", padding: "6px 14px" }}
            title="Run tests and PEP8 check in sandbox (Ctrl+Enter)"
          >
            <IconPlay size={13} />
            <span>{loading ? "Running Sandbox..." : "Run Tests & Lint"}</span>
            <span
              style={{
                fontSize: "0.68rem",
                opacity: 0.7,
                marginLeft: "4px",
                background: "rgba(0, 0, 0, 0.25)",
                padding: "1px 5px",
                borderRadius: "3px",
              }}
            >
              Ctrl+↵
            </span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body: 3-Column IDE */}
      <div className="workspace-main">
        {/* Left Sidebar: Brief & File Explorer */}
        <aside className="sidebar-panel">
          {/* Sidebar Tab Switcher */}
          <div
            style={{
              height: "36px",
              background: "var(--bg-canvas)",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              padding: "0 8px",
              gap: "4px",
            }}
          >
            <button
              onClick={() => setSidebarTab("spec")}
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: "4px",
                color: sidebarTab === "spec" ? "var(--text-main)" : "var(--text-dim)",
                background: sidebarTab === "spec" ? "var(--bg-elevated)" : "transparent",
              }}
            >
              Drill Spec
            </button>
            <button
              onClick={() => setSidebarTab("files")}
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: "4px",
                color: sidebarTab === "files" ? "var(--text-main)" : "var(--text-dim)",
                background: sidebarTab === "files" ? "var(--bg-elevated)" : "transparent",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span>Files</span>
              <span
                style={{
                  fontSize: "0.68rem",
                  background: "rgba(255, 255, 255, 0.08)",
                  padding: "1px 5px",
                  borderRadius: "10px",
                }}
              >
                {Object.keys(files).length}
              </span>
            </button>
          </div>

          {/* Sidebar Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
            {sidebarTab === "spec" ? (
              <div>
                <h4
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--text-dim)",
                    marginBottom: "10px",
                  }}
                >
                  Scenario Brief
                </h4>

                {files["README.md"] ? (
                  <div
                    style={{
                      fontSize: "0.82rem",
                      lineHeight: 1.6,
                      color: "var(--text-muted)",
                      whiteSpace: "pre-wrap",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {files["README.md"]}
                  </div>
                ) : (
                  <p style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
                    {meta?.description || "Read repository files to diagnose the requirements."}
                  </p>
                )}

                {/* Progressive Hints Drawer */}
                {showHints && meta?.hints && meta.hints.length > 0 && (
                  <div
                    style={{
                      marginTop: "20px",
                      background: "rgba(245, 158, 11, 0.06)",
                      border: "1px solid rgba(245, 158, 11, 0.25)",
                      borderRadius: "8px",
                      padding: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "var(--warning-amber)",
                        marginBottom: "8px",
                      }}
                    >
                      <IconLightbulb size={14} /> Progressive Hints
                    </div>
                    <ul
                      style={{
                        listStyle: "disc",
                        paddingLeft: "16px",
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        lineHeight: 1.5,
                      }}
                    >
                      {meta.hints.map((hint, i) => (
                        <li key={i} style={{ marginBottom: "6px" }}>
                          {hint}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h4
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--text-dim)",
                    marginBottom: "10px",
                  }}
                >
                  Repository Explorer
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {Object.keys(files).map((name) => {
                    const isActive = activeFile === name;
                    const isModified = isFileModified(name);
                    const isPy = name.endsWith(".py");

                    return (
                      <div
                        key={name}
                        onClick={() => handleOpenFile(name)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 8px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.82rem",
                          color: isActive ? "var(--text-main)" : "var(--text-muted)",
                          background: isActive ? "var(--bg-elevated)" : "transparent",
                          border: isActive ? "1px solid var(--border-subtle)" : "1px solid transparent",
                          transition: "all 0.1s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {isPy ? (
                            <span style={{ color: "#60a5fa" }}>
                              <IconFileCode size={14} />
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-dim)" }}>
                              <IconFile size={14} />
                            </span>
                          )}
                          <span className="mono">{name}</span>
                        </div>

                        {isModified && (
                          <span
                            title="File modified"
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: "var(--cosmic-purple)",
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Center: Code Editor */}
        <section className="editor-panel">
          {/* File Tabs Bar */}
          <div
            style={{
              height: "36px",
              background: "var(--bg-canvas)",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              overflowX: "auto",
            }}
          >
            {openTabs.map((tab) => {
              const isActive = activeFile === tab;
              const isModified = isFileModified(tab);

              return (
                <div
                  key={tab}
                  onClick={() => setActiveFile(tab)}
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "0 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    userSelect: "none",
                    background: isActive ? "var(--bg-editor)" : "transparent",
                    color: isActive ? "var(--text-main)" : "var(--text-dim)",
                    borderRight: "1px solid var(--border-subtle)",
                    borderTop: isActive ? "2px solid var(--cosmic-purple)" : "2px solid transparent",
                  }}
                >
                  <span className="mono">{tab}</span>
                  {isModified && (
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "var(--cosmic-purple)",
                      }}
                    />
                  )}
                  {openTabs.length > 1 && (
                    <button
                      onClick={(e) => handleCloseTab(e, tab)}
                      style={{
                        color: "var(--text-dim)",
                        fontSize: "0.75rem",
                        padding: "0 2px",
                      }}
                      title="Close tab"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Editor Workspace (Line Numbers + Textarea) */}
          <div style={{ flex: 1, display: "flex", position: "relative", overflow: "hidden" }}>
            <div ref={lineNumbersRef} className="line-numbers">
              {lineNumbersArray.map((n) => (
                <div key={n}>{n}</div>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              value={files[activeFile] || ""}
              onChange={(e) => setFiles({ ...files, [activeFile]: e.target.value })}
              onScroll={handleScroll}
              onKeyDown={handleEditorKeyDown}
              className="code-textarea"
              spellCheck="false"
              autoCapitalize="off"
              autoComplete="off"
            />
          </div>

          {/* Editor Status Bar */}
          <div
            style={{
              height: "24px",
              background: "var(--bg-surface)",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 12px",
              fontSize: "0.72rem",
              color: "var(--text-dim)",
              userSelect: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span className="mono">{activeFile}</span>
              <span>{activeFile.endsWith(".py") ? "Python 3.11" : "Markdown / Text"}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span>{lineCount} lines</span>
              <span>UTF-8</span>
              <span>Spaces: 4</span>
              <span>Sandbox: {sandboxMode}</span>
            </div>
          </div>
        </section>

        {/* Right Panel: Sandbox Console & Test Output */}
        <aside className="console-panel">
          {/* Console Header */}
          <div
            style={{
              height: "36px",
              background: "var(--bg-canvas)",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", fontWeight: 600 }}>
              <IconTerminal size={14} />
              <span>Sandbox Console</span>
            </div>

            {result && (
              <button
                onClick={() => setResult(null)}
                style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Result Status Banner */}
          <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border-subtle)" }}>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.82rem",
                  color: "#60a5fa",
                  background: "rgba(59, 130, 246, 0.1)",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid rgba(59, 130, 246, 0.25)",
                }}
              >
                <span className="status-dot" style={{ backgroundColor: "#3b82f6" }} />
                <span>Mounting into sandbox container and running pytest...</span>
              </div>
            ) : result ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  padding: "10px 12px",
                  borderRadius: "6px",
                  background: result.passed
                    ? "rgba(16, 185, 129, 0.12)"
                    : "rgba(244, 63, 94, 0.12)",
                  border: result.passed
                    ? "1px solid rgba(16, 185, 129, 0.35)"
                    : "1px solid rgba(244, 63, 94, 0.35)",
                  color: result.passed ? "#34d399" : "#fb7185",
                }}
              >
                {result.passed ? (
                  <>
                    <IconCheckCircle size={18} />
                    <div>
                      <div>ALL TESTS PASSED & LINTER CLEAN!</div>
                      <div style={{ fontSize: "0.72rem", fontWeight: 400, opacity: 0.85 }}>
                        Ready for production merge. Drill completed!
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <IconXCircle size={18} />
                    <div>
                      <div>VERIFICATION FAILED</div>
                      <div style={{ fontSize: "0.72rem", fontWeight: 400, opacity: 0.85 }}>
                        Check terminal tracebacks below for failed assertions.
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-dim)",
                  background: "var(--bg-surface)",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <IconShield size={14} />
                <span>Click &quot;Run Tests &amp; Lint&quot; or press Ctrl+Enter to test your changes.</span>
              </div>
            )}
          </div>

          {/* Terminal Logs Window */}
          <div className="terminal-window">
            {result ? (
              renderLogLines(result.logs)
            ) : (
              <div style={{ color: "var(--text-dim)", fontSize: "0.8rem", paddingTop: "12px" }}>
                <div>$ repodrill test --suite=hidden_tests</div>
                <div style={{ marginTop: "6px", color: "#475569" }}>
                  Awaiting execution. Sandbox is idle and ready.
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
