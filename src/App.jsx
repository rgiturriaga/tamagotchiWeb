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
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <div
          style={{
            width: "3rem",
            height: "3rem",
            border: "3px solid rgba(255,255,255,0.1)",
            borderTopColor: "#FF6B35",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
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
