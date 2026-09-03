import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar({ page, onNavigate }) {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">🥚</span>
        <span className="navbar-title">TomagochiWeb</span>
      </div>

      <div className="navbar-links">
        <button
          id="nav-my-pets"
          className={`nav-link ${page === "home" ? "active" : ""}`}
          onClick={() => onNavigate?.("home")}
        >
          🐾 My Pets
        </button>
        <button
          id="nav-community"
          className={`nav-link ${page === "community" ? "active" : ""}`}
          onClick={() => onNavigate?.("community")}
        >
          🌍 Community
        </button>
      </div>

      <div className="navbar-user">
        <span className="navbar-username">👤 {user?.username}</span>
        <button id="btn-logout" className="nav-logout" onClick={logout}>
          Sign Out
        </button>
      </div>
    </nav>
  );
}
