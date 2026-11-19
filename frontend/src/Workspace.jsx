import { useEffect, useState } from "react";

const API = "http://localhost:8000";

export default function Workspace({ challengeId = "01-fix-discount-bug" }) {
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState("README.md");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/challenges/${challengeId}`)
      .then((res) => res.json())
      .then((data) => {
        setFiles(data.files || {});
        const fileNames = Object.keys(data.files || {});
        if (fileNames.length > 0) setActiveFile(fileNames[0]);
      });
  }, [challengeId]);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch(`${API}/challenges/${challengeId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files }),
    });
    setResult(await res.json());
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", fontFamily: "monospace" }}>
      <div style={{ width: "220px", borderRight: "1px solid #ccc", padding: "12px" }}>
        <h4>Repository Files</h4>
        {Object.keys(files).map((name) => (
          <div
            key={name}
            onClick={() => setActiveFile(name)}
            style={{
              padding: "6px",
              cursor: "pointer",
              background: activeFile === name ? "#e0e7ff" : "transparent",
            }}
          >
            {name}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "12px" }}>
        <div style={{ marginBottom: "8px" }}>
          <strong>{activeFile}</strong>
          <button onClick={handleSubmit} disabled={loading} style={{ float: "right" }}>
            {loading ? "Running Sandbox..." : "Run Tests & Submit"}
          </button>
        </div>

        <textarea
          value={files[activeFile] || ""}
          onChange={(e) => setFiles({ ...files, [activeFile]: e.target.value })}
          style={{ flex: 1, fontFamily: "monospace", fontSize: "14px", padding: "10px" }}
        />

        {result && (
          <pre
            style={{
              marginTop: "12px",
              padding: "10px",
              background: result.passed ? "#dcfce7" : "#fee2e2",
            }}
          >
            {result.passed ? "PASSED ALL TESTS & LINTER!" : "FAILED:\n" + result.logs}
          </pre>
        )}
      </div>
    </div>
  );
}
