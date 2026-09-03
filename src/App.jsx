import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import CommunityPage from "./pages/CommunityPage";
import "./index.css";

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState("home");

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "0.7rem",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ fontSize: "4rem", animation: "spin 1s linear infinite" }}>🥚</div>
        <span>Loading...</span>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  if (page === "community") {
    return <CommunityPage onNavigate={setPage} />;
  }

  return <HomePage page={page} onNavigate={setPage} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
