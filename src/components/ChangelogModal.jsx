import { useEffect } from "react";
import { FiX, FiTag, FiCheckCircle, FiZap } from "react-icons/fi";
import CHANGELOG from "../data/changelog";
import "./styles/ChangelogModal.css";

const SECTION_ICON = {
  "What's New": FiZap,
  "Bug Fixes": FiCheckCircle,
};

export default function ChangelogModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="cl-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cl-modal" role="dialog" aria-modal="true" aria-label="Changelog">

        {/* Header */}
        <div className="cl-header">
          <div className="cl-header-left">
            <FiTag className="cl-header-icon" />
            <div>
              <div className="cl-header-title">Release Notes</div>
              <div className="cl-header-sub">{import.meta.env.VITE_APP_NAME || "Scenario Builder"}</div>
            </div>
          </div>
          <button className="cl-close" onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>

        {/* Content */}
        <div className="cl-body">
          {CHANGELOG.map((release) => (
            <div key={release.version} className="cl-release">
              {/* Version badge row */}
              <div className="cl-release-header">
                <span className="cl-version-badge">v{release.version}</span>
                <span className="cl-release-label">{release.label}</span>
                <span className="cl-release-date">{release.date}</span>
              </div>

              {/* Sections */}
              {release.sections.map((section) => {
                const Icon = SECTION_ICON[section.title] || FiZap;
                return (
                  <div key={section.title} className="cl-section">
                    <div className="cl-section-title">
                      <Icon className="cl-section-icon" />
                      {section.title}
                    </div>
                    <ul className="cl-items">
                      {section.items.map((item) => (
                        <li key={item.heading} className="cl-item">
                          <span className="cl-item-heading">{item.heading}</span>
                          <span className="cl-item-body">{item.body}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
