import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiShield,
  FiChevronDown,
  FiLogOut,
  FiLock,
  FiMoon,
  FiSun,
  FiGrid,
  FiExternalLink,
  FiDatabase,
} from "react-icons/fi";
import keycloak from "../keycloak";
import "./styles/NavBar.css";

export function NavBar({ theme = "dark", onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const menuRef = useRef(null);
  const toolsRef = useRef(null);

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
      if (toolsRef.current && !toolsRef.current.contains(e.target)) {
        setToolsOpen(false);
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
        <div className="topbar-environment">
          <FiLock />
          <span>Protected workspace</span>
        </div>

        {/* Status indicator */}
        <div className="topbar-status">
          <span className="live-dot" />
          <span className="topbar-status-text">LIVE</span>
        </div>

        <button
          type="button"
          className="topbar-theme-toggle"
          onClick={onToggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <FiSun /> : <FiMoon />}
        </button>

        <div className="topbar-tools-wrap" ref={toolsRef}>
          <button
            type="button"
            className="topbar-tools-button"
            onClick={() => setToolsOpen((open) => !open)}
            title="SAFE tools"
            aria-label="Open SAFE tools"
            aria-expanded={toolsOpen}
          >
            <FiGrid />
          </button>

          {toolsOpen && (
            <div className="topbar-tools-panel">
              <div className="topbar-tools-header">
                <span>SAFE ecosystem</span>
                <strong>Other SAFE tools</strong>
              </div>
              <a
                className="topbar-tool-card"
                href="http://10.111.114.138:9020"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="topbar-tool-icon"><FiDatabase /></span>
                <span className="topbar-tool-copy">
                  <strong>CTI Enrichment Tool</strong>
                  <small>OpenCTI intelligence enrichment</small>
                  <em><FiLock /> NetBird / VPN required</em>
                </span>
                <FiExternalLink className="topbar-tool-external" />
              </a>
            </div>
          )}
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
