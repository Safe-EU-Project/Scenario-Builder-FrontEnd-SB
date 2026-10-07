import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import {
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiEdit3,
  FiFileText,
  FiLayers,
  FiLoader,
  FiLock,
  FiPlus,
  FiSearch,
  FiSend,
  FiUsers,
} from "react-icons/fi";
import "ag-grid-community/styles/ag-theme-material.css";
import apiFetch from "../service/api_client";
import keycloak from "../keycloak";
import PolicyDraftModal from "./PolicyDraftModal";
import CreateScenarioModal from "./CreateScenarioModal";
import ScenarioEditorModal from "./ScenarioEditorModal";
import PublishScenarioModal from "./PublishScenarioModal";
import { PageHeader, ProductButton, StatePanel } from "./ui/ProductUI";
import "./styles/TrainerScenarios.css";

ModuleRegistry.registerModules([AllCommunityModule]);

/* ── Generating spinner cell ──────────────────────────────────────────────── */
const GeneratingCell = () => (
  <span className="ts-generating">
    <FiLoader className="ts-spin" /> Generating…
  </span>
);

function TrainerScenarios() {
  const roles = keycloak?.tokenParsed?.realm_access?.roles ?? [];
  const isTrainer = roles.includes("trainer");

  const [rowData, setRowData] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [loadingDraft, setLoadingDraft] = useState(null); // scenario_id being generated
  const [activeDraft, setActiveDraft] = useState(null);   // draft to show in modal
  const [gridQuery, setGridQuery] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [publishTarget, setPublishTarget] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  // editorTarget: { scenarioId, initialScenario? } — initialScenario present right after creation
  const [editorTarget, setEditorTarget] = useState(null);

  /* stable ref so AG Grid cell renderers always see the latest handler */
  const generateRef = useRef(null);
  const editRef = useRef(null);
  const statusRef = useRef(null);

  const refreshStats = useCallback(() => {
    apiFetch
      .get("/v1/scenario/trainer/stats")
      .then((res) => {
        setRowData(res.data);
        setFetchError(null);
      })
      .catch((err) => {
        console.error("Failed to load scenarios:", err);
        const status = err.response?.status;
        setFetchError(
          status === 401
            ? "Not authenticated. Please refresh the page and log in again."
            : `Could not load scenarios (${status ?? "network error"}).`
        );
        setRowData([]);
      });
  }, []);

  const openEditor = useCallback((scenarioId) => {
    setEditorTarget({ scenarioId, initialScenario: null });
  }, []);
  editRef.current = openEditor;

  const generateDraft = useCallback(async (scenarioId, scenarioName) => {
    if (loadingDraft) return; // prevent double-click
    setLoadingDraft(scenarioId);
    try {
      const res = await apiFetch.post(`/v1/scenario/${scenarioId}/policy_draft`);
      setActiveDraft(res.data);
    } catch (err) {
      console.error("Policy draft error:", err);
      const detail =
        err.response?.data?.detail || err.message || "Unknown error";
      alert(`Failed to generate policy draft for "${scenarioName}":\n${detail}`);
    } finally {
      setLoadingDraft(null);
    }
  }, [loadingDraft]);

  generateRef.current = generateDraft;

  const updateScenarioStatus = useCallback(async (scenarioId, nextStatus) => {
    setUpdatingStatus(scenarioId);
    try {
      const response = await apiFetch.patch(`/v1/scenario/${scenarioId}/status`, {
        status: nextStatus,
      });
      setRowData((rows) =>
        (rows || []).map((row) =>
          row._id === scenarioId ? { ...row, status: response.data.status } : row
        )
      );
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || "Status update failed";
      alert(detail);
    } finally {
      setUpdatingStatus(null);
    }
  }, []);
  statusRef.current = updateScenarioStatus;

  /* fetch trainer's scenarios with run/trainee stats on mount */
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  /* called by CreateScenarioModal right after the LLM finishes generating */
  const handleScenarioCreated = useCallback((newScenario) => {
    const scenarioId = newScenario?._id || newScenario?.id;
    setShowCreateModal(false);
    refreshStats();
    if (!scenarioId) {
      console.error("Created scenario missing id", newScenario);
      return;
    }
    // Immediately open the human-in-the-loop editor for review
    setEditorTarget({ scenarioId, initialScenario: newScenario });
  }, [refreshStats]);

  const handleScenarioSaved = useCallback(() => {
    setEditorTarget(null);
    refreshStats();
  }, [refreshStats]);

  const columnDefs = useMemo(
    () => [
      {
        field: "scenario_name",
        headerName: "Scenario Name",
        flex: 3,
      },
      {
        headerName: "Phases",
        field: "context_length",
        flex: 1,
        filter: false,
        floatingFilter: false,
        sortable: true,
      },
      {
        headerName: "Runs",
        field: "total_runs",
        flex: 1,
        filter: false,
        floatingFilter: false,
        sortable: true,
        cellRenderer: (params) => {
          const n = params.value ?? 0;
          return (
            <span style={{
              fontWeight: 700,
              color: n === 0
                ? "var(--color-text-muted)"
                : n < 5
                ? "var(--color-warning)"
                : "var(--color-success)",
            }}>
              {n}
            </span>
          );
        },
      },
      {
        headerName: "Trainees",
        field: "unique_trainees",
        flex: 1,
        filter: false,
        floatingFilter: false,
        sortable: true,
        cellRenderer: (params) => {
          const n = params.value ?? 0;
          return (
            <span style={{
              fontWeight: 700,
              color: n === 0 ? "var(--color-text-muted)" : "var(--color-info, #38bdf8)",
            }}>
              {n}
            </span>
          );
        },
      },
      {
        headerName: "Status",
        field: "status",
        flex: 1,
        filter: false,
        sortable: true,
        minWidth: 150,
        cellClass: "ts-status-cell",
        cellRenderer: (params) => {
          const current = params.value || "published";
          const transitions = {
            draft: ["draft"],
            reviewed: ["reviewed", "published", "archived"],
            published: ["published", "reviewed", "archived"],
            archived: ["archived", "reviewed"],
          }[current] || ["published"];
          return (
            <select
              className={`ts-lifecycle-select ts-lifecycle-select--${current}`}
              value={current}
              disabled={current === "draft" || updatingStatus === params.data._id}
              onChange={(event) => {
                if (event.target.value === "published") {
                  setPublishTarget(params.data);
                } else {
                  statusRef.current?.(params.data._id, event.target.value);
                }
              }}
              title={current === "draft" ? "Open Edit and save the scenario to complete review" : "Change lifecycle status"}
            >
              {transitions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          );
        },
      },
      {
        headerName: "Audience",
        flex: 1,
        minWidth: 125,
        filter: false,
        sortable: false,
        cellRenderer: (params) => {
          const status = params.data.status || "published";
          if (!["reviewed", "published"].includes(status)) return "—";
          return (
            <button
              className="ts-assign-btn"
              title={status === "published" ? "Manage assigned audience" : "Publish and assign"}
              onClick={() => setPublishTarget(params.data)}
            >
              <FiSend /> {status === "published" ? "Audience" : "Publish"}
            </button>
          );
        },
      },
      {
        headerName: "Edit",
        flex: 1,
        filter: false,
        sortable: false,
        editable: false,
        floatingFilter: false,
        cellRenderer: (params) => (
          <button
            className="ts-edit-btn"
            title="Review / edit incidents"
            onClick={() => editRef.current?.(params.data._id)}
          >
            <FiEdit3 /> Edit
          </button>
        ),
      },
      {
        headerName: "Policy Draft",
        flex: 1,
        filter: false,
        sortable: false,
        editable: false,
        floatingFilter: false,
        cellRenderer: (params) => {
          const id = params.data._id;
          const isLoading = loadingDraft === id;
          return isLoading ? (
            <GeneratingCell />
          ) : (
            <button
              className="ts-draft-btn"
              title="Generate Policy Draft"
              onClick={() =>
                generateRef.current?.(id, params.data.scenario_name)
              }
            >
              <FiFileText /> Generate
            </button>
          );
        },
      },
    ],
    [loadingDraft, updatingStatus]
  );

  const defaultColDef = useMemo(
    () => ({ filter: "agTextColumnFilter", floatingFilter: false }),
    []
  );

  const summary = useMemo(() => {
    const rows = rowData ?? [];
    return {
      scenarios: rows.length,
      ready: rows.filter((row) => ["reviewed", "published"].includes(row.status || "published")).length,
      runs: rows.reduce((total, row) => total + (row.total_runs ?? 0), 0),
      trainees: rows.reduce((total, row) => total + (row.unique_trainees ?? 0), 0),
    };
  }, [rowData]);

  if (!isTrainer) {
    return (
      <div className="trainer-scenarios">
        <div className="ts-access-denied">
          <FiLock className="ts-access-denied-icon" />
          <h2>Access Restricted</h2>
          <p>
            The <strong>My Scenarios</strong> section is only available to
            users with the <strong>Trainer</strong> role.
          </p>
          <p className="ts-access-denied-sub">
            If you believe this is an error, please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="trainer-scenarios">

      {/* ── Page header ───────────────────────────────────────────── */}
      <PageHeader
        eyebrow="Trainer dashboard"
        title="My Scenarios"
        description="Create AI-generated scenarios, review incidents, publish exercises, and draft formal policies."
        actions={(
          <ProductButton variant="primary" className="ts-create-btn" onClick={() => setShowCreateModal(true)}>
            <FiPlus /> Create Scenario
          </ProductButton>
        )}
      />

      {/* ── Error banner ──────────────────────────────────────────── */}
      {fetchError && (
        <StatePanel
          icon={FiAlertTriangle}
          tone="danger"
          title="Scenario catalog unavailable"
          description={fetchError}
          compact
        />
      )}

      <div className="ts-summary-grid">
        <article><FiLayers /><div><span>Scenarios</span><strong>{summary.scenarios}</strong></div></article>
        <article><FiCheckCircle /><div><span>Ready</span><strong>{summary.ready}</strong></div></article>
        <article><FiActivity /><div><span>Completed runs</span><strong>{summary.runs}</strong></div></article>
        <article><FiUsers /><div><span>Unique trainees</span><strong>{summary.trainees}</strong></div></article>
      </div>

      {/* ── Scenarios table ────────────────────────────────────────── */}
      <div className="ts-catalog-panel">
        <div className="ts-catalog-toolbar">
          <div><span>Scenario library</span><strong>Operational catalog</strong></div>
          <label className="ts-search">
            <FiSearch />
            <input
              value={gridQuery}
              onChange={(event) => setGridQuery(event.target.value)}
              placeholder="Search scenarios"
              aria-label="Search scenarios"
            />
          </label>
        </div>
        <div className="ag-theme-material ts-grid">
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            quickFilterText={gridQuery}
            rowHeight={50}
            pagination
            paginationPageSize={20}
            paginationPageSizeSelector={[10, 20, 50]}
            overlayLoadingTemplate={`<span class="ts-loading-overlay">Loading scenarios…</span>`}
          />
        </div>
      </div>

      {/* ── Global generating indicator ────────────────────────────── */}
      {loadingDraft && (
        <div className="ts-generating-banner">
          <FiLoader className="ts-spin" />
          Generating policy draft… This may take 20–40 seconds.
        </div>
      )}

      {/* ── Policy Draft Modal ──────────────────────────────────────── */}
      {activeDraft && (
        <PolicyDraftModal
          draft={activeDraft}
          onClose={() => setActiveDraft(null)}
        />
      )}

      {/* ── Create Scenario Modal ────────────────────────────────────── */}
      {showCreateModal && (
        <CreateScenarioModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleScenarioCreated}
        />
      )}

      {/* ── Scenario Editor Modal (human-in-the-loop) ────────────────── */}
      {editorTarget && (
        <ScenarioEditorModal
          scenarioId={editorTarget.scenarioId}
          initialScenario={editorTarget.initialScenario}
          onClose={() => setEditorTarget(null)}
          onSaved={handleScenarioSaved}
        />
      )}

      {publishTarget && (
        <PublishScenarioModal
          scenario={publishTarget}
          onClose={() => setPublishTarget(null)}
          onPublished={(publishedScenario) => {
            setRowData((rows) =>
              (rows || []).map((row) =>
                row._id === publishTarget._id
                  ? {
                      ...row,
                      status: publishedScenario.status,
                      assignment_scope: publishedScenario.assignment_scope,
                      assignment_targets: publishedScenario.assignment_targets,
                    }
                  : row
              )
            );
            setPublishTarget(null);
          }}
        />
      )}
    </div>
  );
}

export default TrainerScenarios;
