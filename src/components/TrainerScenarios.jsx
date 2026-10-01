import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { FiFileText, FiLoader, FiLock, FiPlus, FiEdit3 } from "react-icons/fi";
import "ag-grid-community/styles/ag-theme-material.css";
import apiFetch from "../service/api_client";
import keycloak from "../keycloak";
import PolicyDraftModal from "./PolicyDraftModal";
import CreateScenarioModal from "./CreateScenarioModal";
import ScenarioEditorModal from "./ScenarioEditorModal";
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

  const [showCreateModal, setShowCreateModal] = useState(false);
  // editorTarget: { scenarioId, initialScenario? } — initialScenario present right after creation
  const [editorTarget, setEditorTarget] = useState(null);

  /* stable ref so AG Grid cell renderers always see the latest handler */
  const generateRef = useRef(null);
  const editRef = useRef(null);

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

  /* fetch trainer's scenarios with run/trainee stats on mount */
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  /* called by CreateScenarioModal right after the LLM finishes generating */
  const handleScenarioCreated = useCallback((newScenario) => {
    setShowCreateModal(false);
    refreshStats();
    // Immediately open the human-in-the-loop editor for review
    setEditorTarget({ scenarioId: newScenario._id, initialScenario: newScenario });
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
    [loadingDraft]
  );

  const defaultColDef = useMemo(
    () => ({ filter: "agTextColumnFilter", floatingFilter: true }),
    []
  );

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
      <div className="ts-page-header">
        <div>
          <p className="ts-eyebrow">TRAINER DASHBOARD</p>
          <h1 className="ts-title">My Scenarios</h1>
          <p className="ts-subtitle">
            Create AI-generated scenarios, review incidents, and draft formal policies for LEA review.
          </p>
        </div>
        <button className="btn btn-primary ts-create-btn" onClick={() => setShowCreateModal(true)}>
          <FiPlus /> Create Scenario
        </button>
      </div>

      {/* ── Error banner ──────────────────────────────────────────── */}
      {fetchError && (
        <div className="ts-error-banner">
          ⚠ {fetchError}
        </div>
      )}

      {/* ── Scenarios table ────────────────────────────────────────── */}
      <div
        className="ag-theme-material ts-grid"
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowHeight={54}
          pagination
          paginationPageSize={20}
          paginationPageSizeSelector={[10, 20, 50]}
          overlayLoadingTemplate={`<span class="ts-loading-overlay">Loading scenarios…</span>`}
        />
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
    </div>
  );
}

export default TrainerScenarios;
