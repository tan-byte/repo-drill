import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import Workspace from "./components/Workspace";
import { DEFAULT_CHALLENGES } from "./mockData";

const API = "http://localhost:8000";

export default function App() {
  const [currentView, setCurrentView] = useState("home"); // "home" | "workspace"
  const [selectedChallengeId, setSelectedChallengeId] = useState("01-fix-discount-bug");
  const [challenges, setChallenges] = useState(DEFAULT_CHALLENGES);
  const [systemStatus, setSystemStatus] = useState("healthy");

  // Fetch challenge list and status from backend
  useEffect(() => {
    fetch(`${API}/challenges`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch challenges");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge API data with default hints/files if needed
          const merged = data.map((item) => {
            const fallback = DEFAULT_CHALLENGES.find((c) => c.id === item.id);
            return {
              ...fallback,
              ...item,
              files: fallback ? fallback.files : item.files,
              hints: fallback ? fallback.hints : item.hints,
            };
          });
          setChallenges(merged);
        }
      })
      .catch(() => {
        // Backend not reached: keep DEFAULT_CHALLENGES
      });

    fetch(`${API}/system/status`)
      .then((res) => res.json())
      .then((status) => {
        if (status.status) setSystemStatus(status.status);
      })
      .catch(() => {
        setSystemStatus("local_sandbox");
      });
  }, []);

  // Sync with window.location.hash
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#drill/")) {
        const id = hash.replace("#drill/", "");
        setSelectedChallengeId(id);
        setCurrentView("workspace");
      } else if (hash === "#home" || hash === "" || hash === "#") {
        setCurrentView("home");
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleSelectChallenge = (id) => {
    setSelectedChallengeId(id);
    setCurrentView("workspace");
    window.location.hash = `#drill/${id}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigateHome = () => {
    setCurrentView("home");
    window.location.hash = "#home";
  };

  const activeChallenge = challenges.find((c) => c.id === selectedChallengeId);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Subtle Starry Universe Background */}
      <div className="starry-universe">
        <div className="star-layer-1" />
        <div className="star-layer-2" />
      </div>

      <Navbar
        currentView={currentView}
        onNavigateHome={handleNavigateHome}
        activeChallengeTitle={activeChallenge?.title}
        sandboxStatus={systemStatus}
      />

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {currentView === "home" ? (
          <HomePage
            challenges={challenges}
            onSelectChallenge={handleSelectChallenge}
          />
        ) : (
          <Workspace
            challengeId={selectedChallengeId}
            onNavigateHome={handleNavigateHome}
            allChallenges={challenges}
          />
        )}
      </main>
    </div>
  );
}
