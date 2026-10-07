import { useEffect, useRef, useState } from "react";
import {
  FiX,
  FiZap,
  FiLoader,
  FiAlertTriangle,
  FiCpu,
  FiDatabase,
  FiCheckCircle,
} from "react-icons/fi";
import apiFetch from "../service/api_client";
import "./styles/CreateScenarioModal.css";

/* ── Sector options ───────────────────────────────────────────────────────
   Hints contain the exact keywords the LLM service's sector detector looks
   for, so an explicit trainer choice reliably steers RAG retrieval even
   before the backend's own auto-detection runs on the combined text. */
const SECTOR_OPTIONS = [
  { value: "auto", label: "Auto-detect from description", hint: "" },
  {
    value: "banking",
    label: "Banking & Financial Services",
    hint: "This scenario targets the banking and financial sector (bank, financial transaction, fraud, wire transfer).",
  },
  {
    value: "energy",
    label: "Energy & Critical Infrastructure",
    hint: "This scenario targets the energy and critical infrastructure sector (power grid, SCADA, ICS, utilities).",
  },
  {
    value: "health",
    label: "Healthcare",
    hint: "This scenario targets the healthcare sector (hospital, patient, EHR, clinical systems).",
  },
  {
    value: "telecom",
    label: "Telecommunications",
    hint: "This scenario targets the telecom sector (mobile network operator, telecom, SIM, roaming).",
  },
  {
    value: "lea",
    label: "Law Enforcement",
    hint: "This scenario targets a law enforcement agency (police, CERT, CSIRT, government agency).",
  },
  {
    value: "general",
    label: "General / Cross-sector",
    hint: "This is a general, cross-sector scenario.",
  },
];

const GENERATION_STEPS = [
  { icon: FiDatabase, label: "Retrieving relevant context from RAG knowledge base…" },
  { icon: FiCpu, label: "Drafting incident timeline with the LLM…" },
  { icon: FiCheckCircle, label: "Validating structure & expected actions…" },
];

export default function CreateScenarioModal({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [sector, setSector] = useState("auto");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState(null);
  const titleRef = useRef(null);
  const stepTimerRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
    const handler = (e) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
      clearInterval(stepTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isValid = title.trim().length >= 4 && description.trim().length >= 20;

  async function handleGenerate() {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError(null);
    setStepIndex(0);

    // Cosmetic progress — cycles through steps while the single LLM call is in flight.
    stepTimerRef.current = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, GENERATION_STEPS.length - 1));
    }, 7000);

    const sectorHint = SECTOR_OPTIONS.find((s) => s.value === sector)?.hint || "";
    const instructions = sectorHint ? `${sectorHint}\n\n${description.trim()}` : description.trim();

    try {
      const res = await apiFetch.post(
        "/v1/scenario",
        {
          scenario_name: title.trim(),
          instructions,
        },
        { timeout: 300000 }
      );
      clearInterval(stepTimerRef.current);
      const created = res.data;
      const scenarioId = created?._id || created?.id;
      if (!scenarioId) {
        throw new Error("Scenario was created but response had no id. Refresh My Scenarios.");
      }
      onCreated({ ...created, _id: scenarioId });
    } catch (err) {
      clearInterval(stepTimerRef.current);
      let detail = err.response?.data?.detail || err.message || "Unknown error";
      if (err.code === "ECONNABORTED" || /timeout/i.test(String(detail))) {
        detail =
          "Timed out waiting for the LLM (5 min). The scenario may still have been created — refresh My Scenarios, or try again.";
      } else if (!err.response && err.message === "Network Error") {
        detail =
          "Network error talking to the SAFE backend. Check VPN/network to 10.240.138.254 and try again.";
      }
      setError(typeof detail === "string" ? detail : JSON.stringify(detail));
      setSubmitting(false);
    }
  }

  return (
    <div className="csm-overlay" onClick={(e) => !submitting && e.target === e.currentTarget && onClose()}>
      <div className="csm-modal">
        {/* ── Header ── */}
        <div className="csm-header">
          <div className="csm-header-left">
            <FiZap className="csm-header-icon" />
            <div>
              <p className="csm-eyebrow">New Training Scenario</p>
              <h2 className="csm-title">Generate with AI + RAG</h2>
            </div>
          </div>
          {!submitting && (
            <button className="csm-close-btn" onClick={onClose} title="Close">
              <FiX />
            </button>
          )}
        </div>

        {/* ── Body ── */}
        {!submitting ? (
          <div className="csm-body">
            <div className="csm-field">
              <label className="csm-label" htmlFor="csm-title">
                Scenario Title <span className="csm-required">*</span>
              </label>
              <input
                id="csm-title"
                ref={titleRef}
                className="csm-input"
                type="text"
                placeholder="e.g. SWIFT Wire Fraud at a Retail Bank"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={140}
              />
            </div>

            <div className="csm-field">
              <label className="csm-label" htmlFor="csm-sector">
                Sector Focus
              </label>
              <select
                id="csm-sector"
                className="csm-select"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
              >
                {SECTOR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="csm-hint">
                Steers RAG retrieval toward domain-relevant reference material. Leave on
                auto-detect if unsure.
              </p>
            </div>

            <div className="csm-field">
              <label className="csm-label" htmlFor="csm-description">
                Briefing / Description <span className="csm-required">*</span>
              </label>
              <textarea
                id="csm-description"
                className="csm-textarea"
                rows={6}
                placeholder="Describe the threat actor, target organization, attack vector, and any specific elements you want covered (e.g. financial impact, regulatory notification, media pressure)…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
              />
              <p className="csm-charcount">{description.length}/2000</p>
            </div>

            {error && (
              <div className="csm-error">
                <FiAlertTriangle /> {error}
              </div>
            )}
          </div>
        ) : (
          <div className="csm-generating">
            <div className="csm-generating-spinner">
              <FiLoader className="csm-spin" />
            </div>
            <h3>Generating your scenario…</h3>
            <p className="csm-generating-sub">
              Usually 20–60 seconds. Keep this tab open — do not close the modal.
            </p>

            <div className="csm-steps">
              {GENERATION_STEPS.map((step, i) => {
                const Icon = step.icon;
                const state = i < stepIndex ? "done" : i === stepIndex ? "active" : "pending";
                return (
                  <div key={i} className={`csm-step csm-step--${state}`}>
                    <Icon className="csm-step-icon" />
                    <span>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        {!submitting && (
          <div className="csm-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              disabled={!isValid}
              onClick={handleGenerate}
              title={!isValid ? "Add a title (4+ chars) and a description (20+ chars)" : ""}
            >
              <FiZap /> Generate Scenario
            </button>
            {!isValid && (
              <p className="csm-hint" style={{ margin: 0, width: "100%" }}>
                Need title ≥ 4 characters and description ≥ 20 characters.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
