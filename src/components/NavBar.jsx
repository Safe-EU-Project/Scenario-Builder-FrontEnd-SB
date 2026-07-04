import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiShield, FiBell, FiChevronDown, FiLogOut, FiUser, FiSettings } from "react-icons/fi";
import keycloak from "../keycloak";
import "./styles/NavBar.css";

export function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const username = keycloak?.tokenParsed?.preferred_username || keycloak?.tokenParsed?.name || "User";
  const email = keycloak?.tokenParsed?.email || "";
  const initials = username.slice(0, 2).toUpperCase();
  const roles = keycloak?.tokenParsed?.realm_access?.roles || [];
  const displayRole = roles.includes("trainer") ? "Trainer" : "Trainee";

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="topbar">
      {/* Brand */}
      <Link to="/" className="topbar-brand">
        <div className="topbar-brand-icon">
          <FiShield />
        </div>
        <div className="topbar-brand-text">
          <span className="topbar-brand-name">{import.meta.env.VITE_APP_NAME || "Scenario Builder"}</span>
          <span className="topbar-brand-sub">{import.meta.env.VITE_APP_SUBTITLE || "Cyber Training Platform"}</span>
        </div>
      </Link>

      {/* Right side */}
      <div className="topbar-right">
        {/* Status indicator */}
        <div className="topbar-status">
          <span className="live-dot" />
          <span className="topbar-status-text">LIVE</span>
        </div>

        {/* User menu */}
        <div className="topbar-user-wrap" ref={menuRef}>
          <button
            className="topbar-user-btn"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <div className="topbar-avatar">{initials}</div>
            <div className="topbar-user-info">
              <span className="topbar-username">{username}</span>
              <span className="topbar-role">{displayRole}</span>
            </div>
            <FiChevronDown className={`topbar-chevron ${menuOpen ? "topbar-chevron--open" : ""}`} />
          </button>

          {menuOpen && (
            <div className="topbar-dropdown">
              <div className="topbar-dropdown-header">
                <span className="topbar-dropdown-name">{username}</span>
                <span className="topbar-dropdown-email">{email}</span>
              </div>
              <div className="topbar-dropdown-divider" />
              <button className="topbar-dropdown-item">
                <FiUser /> Profile
              </button>
              <button className="topbar-dropdown-item">
                <FiSettings /> Settings
              </button>
              <div className="topbar-dropdown-divider" />
              <button
                className="topbar-dropdown-item topbar-dropdown-item--danger"
                onClick={() => keycloak.logout({ redirectUri: window.location.origin + "/" })}
              >
                <FiLogOut /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default NavBar;
