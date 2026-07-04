import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { FiPlay, FiClipboard, FiBarChart2, FiBook, FiShield, FiFileText } from "react-icons/fi";
import keycloak from "../keycloak";
import ChangelogModal from "./ChangelogModal";
import "./styles/SideBar.css";

const baseNavItems = [
  { id: "home",              path: "/",                    icon: AiFillHome,  label: "Home",            trainerOnly: false },
  { id: "start-exercise",    path: "/start-exercise",      icon: FiPlay,      label: "Start Exercise",  trainerOnly: false },
  { id: "my-assignments",    path: "/my-assignments",      icon: FiClipboard, label: "My Assignments",  trainerOnly: false },
  { id: "user-stats",        path: "/user-stats",          icon: FiBarChart2, label: "User Analytics",  trainerOnly: false },
  { id: "trainer-scenarios", path: "/trainer/scenarios",   icon: FiFileText,  label: "Policy Drafts",   trainerOnly: true  },
  { id: "guide",             path: "/guide",               icon: FiBook,      label: "User Guide",      trainerOnly: false },
];

const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.0";

function SideBar() {
  const location = useLocation();
  const [showChangelog, setShowChangelog] = useState(false);

  const roles = keycloak?.tokenParsed?.realm_access?.roles ?? [];
  const isTrainer = roles.includes("trainer");
  const navItems = baseNavItems.filter((item) => !item.trainerOnly || isTrainer);

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <>
      <nav className="sidebar">
        {/* Nav section label */}
        <div className="sidebar-section-label">Navigation</div>

        <ul className="sidebar-nav">
          {navItems.map(({ id, path, icon: Icon, label }) => (
            <li key={id}>
              <Link
                to={path}
                className={`sidebar-item ${isActive(path) ? "sidebar-item--active" : ""}`}
              >
                <span className="sidebar-item-icon">
                  <Icon />
                </span>
                <span className="sidebar-item-label">{label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Bottom section */}
        <div className="sidebar-footer">
          <button
            className="sidebar-footer-badge sidebar-footer-badge--btn"
            onClick={() => setShowChangelog(true)}
            title="View release notes"
          >
            <FiShield className="sidebar-footer-icon" />
            <div>
              <div className="sidebar-footer-title">{import.meta.env.VITE_APP_NAME || "Scenario Builder"}</div>
              <div className="sidebar-footer-version">v{APP_VERSION} · Release Notes</div>
            </div>
          </button>
        </div>
      </nav>

      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
    </>
  );
}

export default SideBar;
