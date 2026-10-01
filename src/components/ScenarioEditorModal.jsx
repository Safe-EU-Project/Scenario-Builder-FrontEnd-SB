import { useEffect, useMemo, useState } from "react";
import {
  FiX,
  FiSave,
  FiLoader,
  FiChevronDown,
  FiChevronUp,
  FiTrash2,
  FiPlus,
  FiPlusCircle,
  FiAlertTriangle,
  FiClock,
  FiTarget,
  FiLayers,
  FiEdit3,
} from "react-icons/fi";
import Swal from "sweetalert2";
import apiFetch from "../service/api_client";
import "./styles/ScenarioEditorModal.css";

const BLANK_INCIDENT = {
  title: "",
  message_timestamp: "",
  description: "",
  inject: "",
  expected_actions: [""],
  attack_technique: "",
  target_asset: "",
  vulnerability_class: "",
  estimated_impact: "",
};

function cloneIncidents(context) {
  return (context || []).map((inc) => ({
    ...BLANK_INCIDENT,
    ...inc,
    expected_actions:
      inc.expected_actions && inc.expected_actions.length > 0 ? [...inc.expected_actions] : [""],
  }));
}

/**
 * Human-in-the-loop editor for an AI-generated scenario.
 * Loads the full scenario (with all incidents), lets the trainer edit / add /
 * remove incidents and expected actions, then persists via PATCH.
 */
export default function ScenarioEditorModal({ scenarioId, initialScenario, onClose, onSaved }) {
  const [scenario, setScenario] = useState(initialScenario || null);
  const [incidents, setIncidents] = useState(() => cloneIncidents(initialScenario?.context));
  const [expanded, setExpanded] = useState(() => new Set(initialScenario ? [0] : []));
  const [loading, setLoading] = useState(!initialScenario);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);

  /* ── Fetch full scenario when opened from the grid (no initial data) ── */
  useEffect(() => {
    if (initialScenario) return;
    let cancelled = false;
    setLoading(true);
    apiFetch
      .get(`/v1/scenario/${scenarioId}`)
      .then((res) => {
        if (cancelled) return;
        setScenario(res.data);
        setIncidents(cloneIncidents(res.data.context));
        setExpanded(new Set([0]));
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err.response?.data?.detail || err.message || "Failed to load scenario");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const isNewlyGenerated = Boolean(initialScenario);

  /* ── Incident field helpers ─────────────────────────────────────────── */
  function updateField(idx, field, value) {
    setIncidents((prev) => prev.map((inc, i) => (i === idx ? { ...inc, [field]: value } : inc)));
  }

  function updateAction(idx, actionIdx, value) {
    setIncidents((prev) =>
      prev.map((inc, i) => {
        if (i !== idx) return inc;
        const actions = [...inc.expected_actions];
        actions[actionIdx] = value;
        return { ...inc, expected_actions: actions };
      })
    );
  }

  function addAction(idx) {
    setIncidents((prev) =>
      prev.map((inc, i) => (i === idx ? { ...inc, expected_actions: [...inc.expected_actions, ""] } : inc))
    );
  }

  function removeAction(idx, actionIdx) {
    setIncidents((prev) =>
      prev.map((inc, i) => {
        if (i !== idx) return inc;
        const actions = inc.expected_actions.filter((_, ai) => ai !== actionIdx);
        return { ...inc, expected_actions: actions.length > 0 ? actions : [""] };
      })
    );
  }

  function addIncident() {
    setIncidents((prev) => {
      const next = [...prev, { ...BLANK_INCIDENT, expected_actions: [""] }];
      setExpanded((exp) => new Set([...exp, next.length - 1]));
      return next;
    });
  }

  function removeIncident(idx) {
    Swal.fire({
      title: "Remove this incident?",
      text: "This step will be deleted from the scenario timeline.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#3b82f6",
    }).then((result) => {
      if (!result.isConfirmed) return;
      setIncidents((prev) => prev.filter((_, i) => i !== idx));
      setExpanded((exp) => new Set([...exp].filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i))));
    });
  }

  function toggleExpand(idx) {
    setExpanded((exp) => {
      const next = new Set(exp);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  const allExpanded = incidents.length > 0 && expanded.size === incidents.length;
  function toggleExpandAll() {
    setExpanded(allExpanded ? new Set() : new Set(incidents.map((_, i) => i)));
  }

  /* ── Validation ──────────────────────────────────────────────────────── */
  const validationErrors = useMemo(() => {
    if (incidents.length === 0) return ["Scenario must have at least one incident."];
    const errs = [];
    incidents.forEach((inc, i) => {
      if (!inc.title?.trim()) errs.push(`Incident ${i + 1}: title is required.`);
      if (!inc.message_timestamp?.trim()) errs.push(`Incident ${i + 1}: timestamp is required.`);
      if (!inc.description?.trim()) errs.push(`Incident ${i + 1}: description is required.`);
    });
    return errs;
  }, [incidents]);

  const isValid = validationErrors.length === 0;

  /* ── Save ────────────────────────────────────────────────────────────── */
  async function handleSave() {
    if (!isValid || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const context = incidents.map((inc) => ({
        ...inc,
        expected_actions: inc.expected_actions.map((a) => a.trim()).filter(Boolean),
      }));
      const res = await apiFetch.patch(`/v1/scenario/incidents/${scenario._id || scenarioId}`, {
        context,
      });
      Swal.fire({
        title: "Scenario saved",
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
      });
      onSaved?.(res.data);
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || "Unknown error";
      setSaveError(typeof detail === "string" ? detail : JSON.stringify(detail));
      setSaving(false);
    }
  }

  function handleCloseAttempt() {
    if (saving) return;
    onClose();
  }

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div className="sem-overlay" onClick={(e) => e.target === e.currentTarget && handleCloseAttempt()}>
      <div className="sem-modal">
        {/* ── Header ── */}
        <div className="sem-header">
          <div className="sem-header-left">
            <FiEdit3 className="sem-header-icon" />
            <div>
              <p className="sem-eyebrow">
                {isNewlyGenerated ? "Review Generated Scenario" : "Edit Scenario"}
                {isNewlyGenerated && <span className="sem-badge-new">Human-in-the-loop</span>}
              </p>
              <h2 className="sem-title">{scenario?.scenario_name || "Loading…"}</h2>
            </div>
          </div>
          <button className="sem-close-btn" onClick={handleCloseAttempt} title="Close">
            <FiX />
          </button>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="sem-loading">
            <FiLoader className="sem-spin" />
            <span>Loading scenario…</span>
          </div>
        )}

        {/* ── Load error ── */}
        {loadError && (
          <div className="sem-body">
            <div className="sem-error">
              <FiAlertTriangle /> {loadError}
            </div>
          </div>
        )}

        {/* ── Body ── */}
        {!loading && !loadError && (
          <>
            <div className="sem-toolbar">
              <span className="sem-count">
                <FiLayers /> {incidents.length} incident{incidents.length !== 1 ? "s" : ""}
              </span>
              <div className="sem-toolbar-actions">
                <button className="sem-toolbar-btn" onClick={toggleExpandAll}>
                  {allExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  {allExpanded ? "Collapse All" : "Expand All"}
                </button>
                <button className="sem-toolbar-btn sem-toolbar-btn--primary" onClick={addIncident}>
                  <FiPlusCircle /> Add Incident
                </button>
              </div>
            </div>

            <div className="sem-body">
              {incidents.map((inc, idx) => {
                const isOpen = expanded.has(idx);
                return (
                  <div key={idx} className={`sem-incident ${isOpen ? "sem-incident--open" : ""}`}>
                    <div className="sem-incident-header" onClick={() => toggleExpand(idx)}>
                      <span className="sem-incident-num">{idx + 1}</span>
                      <div className="sem-incident-summary">
                        <span className="sem-incident-title">
                          {inc.title || <em className="sem-placeholder-text">Untitled incident</em>}
                        </span>
                        {inc.message_timestamp && (
                          <span className="sem-incident-ts">
                            <FiClock /> {inc.message_timestamp}
                          </span>
                        )}
                      </div>
                      <button
                        className="sem-incident-remove"
                        title="Remove incident"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeIncident(idx);
                        }}
                      >
                        <FiTrash2 />
                      </button>
                      <span className="sem-incident-chevron">
                        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                      </span>
                    </div>

                    {isOpen && (
                      <div className="sem-incident-body">
                        <div className="sem-row">
                          <div className="sem-field sem-field--grow">
                            <label>Title</label>
                            <input
                              type="text"
                              value={inc.title}
                              onChange={(e) => updateField(idx, "title", e.target.value)}
                              placeholder="e.g. Fraud Detection Alert: Suspicious SWIFT Transaction"
                            />
                          </div>
                          <div className="sem-field" style={{ maxWidth: 200 }}>
                            <label>Timestamp</label>
                            <input
                              type="text"
                              value={inc.message_timestamp}
                              onChange={(e) => updateField(idx, "message_timestamp", e.target.value)}
                              placeholder="T+15 (09:15)"
                            />
                          </div>
                        </div>

                        <div className="sem-field">
                          <label>Description</label>
                          <textarea
                            rows={3}
                            value={inc.description}
                            onChange={(e) => updateField(idx, "description", e.target.value)}
                            placeholder="What is happening at this moment…"
                          />
                        </div>

                        <div className="sem-field">
                          <label>Inject (artefact shown to trainee)</label>
                          <textarea
                            rows={3}
                            value={inc.inject || ""}
                            onChange={(e) => updateField(idx, "inject", e.target.value)}
                            placeholder="Email body, log excerpt, alert text…"
                          />
                        </div>

                        <div className="sem-field">
                          <label>
                            <FiTarget /> Expected Actions
                          </label>
                          <div className="sem-actions-list">
                            {inc.expected_actions.map((action, ai) => (
                              <div className="sem-action-row" key={ai}>
                                <input
                                  type="text"
                                  value={action}
                                  onChange={(e) => updateAction(idx, ai, e.target.value)}
                                  placeholder={`Action ${ai + 1}…`}
                                />
                                <button
                                  className="sem-action-remove"
                                  onClick={() => removeAction(idx, ai)}
                                  title="Remove action"
                                >
                                  <FiX />
                                </button>
                              </div>
                            ))}
                            <button className="sem-action-add" onClick={() => addAction(idx)}>
                              <FiPlus /> Add action
                            </button>
                          </div>
                        </div>

                        {/* ── Predictive metadata (optional / advanced) ── */}
                        <details className="sem-advanced">
                          <summary>Predictive metadata (attack technique, impact…)</summary>
                          <div className="sem-advanced-grid">
                            <div className="sem-field">
                              <label>Attack Technique</label>
                              <input
                                type="text"
                                value={inc.attack_technique || ""}
                                onChange={(e) => updateField(idx, "attack_technique", e.target.value)}
                                placeholder="e.g. T1566.001 — Spear-phishing Attachment"
                              />
                            </div>
                            <div className="sem-field">
                              <label>Target Asset</label>
                              <input
                                type="text"
                                value={inc.target_asset || ""}
                                onChange={(e) => updateField(idx, "target_asset", e.target.value)}
                                placeholder="e.g. SWIFT Alliance Access Terminal"
                              />
                            </div>
                            <div className="sem-field">
                              <label>Vulnerability Class</label>
                              <input
                                type="text"
                                value={inc.vulnerability_class || ""}
                                onChange={(e) => updateField(idx, "vulnerability_class", e.target.value)}
                                placeholder="e.g. Unpatched CVE, weak credentials"
                              />
                            </div>
                            <div className="sem-field">
                              <label>Estimated Impact</label>
                              <input
                                type="text"
                                value={inc.estimated_impact || ""}
                                onChange={(e) => updateField(idx, "estimated_impact", e.target.value)}
                                placeholder="e.g. €45,000 fraudulent transfer"
                              />
                            </div>
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                );
              })}

              {incidents.length === 0 && (
                <div className="sem-empty">
                  <FiAlertTriangle />
                  <p>No incidents yet. Add one to get started.</p>
                </div>
              )}
            </div>

            {/* ── Validation + save error banners ── */}
            {(validationErrors.length > 0 || saveError) && (
              <div className="sem-banner-stack">
                {saveError && (
                  <div className="sem-error">
                    <FiAlertTriangle /> {saveError}
                  </div>
                )}
                {validationErrors.length > 0 && (
                  <div className="sem-warning">
                    <FiAlertTriangle />
                    <span>{validationErrors[0]}{validationErrors.length > 1 ? ` (+${validationErrors.length - 1} more)` : ""}</span>
                  </div>
                )}
              </div>
            )}

            {/* ── Footer ── */}
            <div className="sem-footer">
              <span className="sem-footer-hint">
                Changes are saved directly to the scenario used by trainees.
              </span>
              <div className="sem-footer-actions">
                <button className="btn btn-secondary" onClick={handleCloseAttempt} disabled={saving}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={!isValid || saving}>
                  {saving ? (
                    <>
                      <FiLoader className="sem-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <FiSave /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
