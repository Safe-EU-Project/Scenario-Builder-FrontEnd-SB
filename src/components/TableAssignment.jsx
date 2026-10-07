"use client";
import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { FiActivity, FiClipboard } from "react-icons/fi";
import { Progress } from "flowbite-react";
import apiFetch from "../service/api_client";
import AssignmentAnalytics from "./AssignmentAnalytics.jsx";
import "ag-grid-community/styles/ag-theme-material.css";
import "./styles/TableAssignment.css";

ModuleRegistry.registerModules([AllCommunityModule]);

const ProgressCellRenderer = (props) => {
  const score = Math.round(props.data.grade || 0);
  const color = score < 50 ? "red" : score < 80 ? "blue" : "green";
  return (
    <div style={{ width: "100%", padding: "0 0", marginBottom: "4px" }}>
      <Progress
        progress={score}
        progressLabelPosition="inside"
        color={color}
        textLabel="Score"
        size="lg"
        labelProgress
        labelText
        style={{ marginTop: "15px" }}
      />
    </div>
  );
};

function TableAssignment() {
  const [rowData, setRowData] = useState(null);
  const [assignmentData, setAssignmentData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Use a ref so the AG Grid cell renderer always has the latest callback
  const doTheAnalyticsRef = useRef(null);

  const doTheAnalytics = useCallback(async (params) => {
    try {
      setLoadingDetails(true);
      setAssignmentData(null);
      const response = await apiFetch.post(
        "/v1/assignment/trainee/assignments/specific",
        { assignment_id: params.data.id },
      );
      setAssignmentData(response.data);
    } catch (error) {
      console.error("Error fetching assignment details:", error);
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  doTheAnalyticsRef.current = doTheAnalytics;

  useEffect(() => {
    async function fetchAssignments() {
      try {
        const response = await apiFetch.get("/v1/assignment/trainee/assignments");
        setRowData(response.data);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    }
    fetchAssignments();
  }, []);

  const columnDefs = useMemo(() => [
    {
      field: "scenario_name",
      headerName: "Scenario",
      flex: 2,
    },
    {
      headerName: "Details",
      flex: 1,
      filter: false,
      sortable: false,
      editable: false,
      floatingFilter: false,
      cellRenderer: (params) => (
        <button
          onClick={() => doTheAnalyticsRef.current?.(params)}
          title="View details"
          style={{
            padding: "6px",
            background: "var(--color-surface-elevated, #1a2540)",
            color: "var(--color-accent, #2dd4bf)",
            border: "1px solid var(--color-border, #1e3a5f)",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "40px",
            height: "32px",
            fontSize: "18px",
          }}
        >
          <TbBrandGoogleAnalytics />
        </button>
      ),
    },
    {
      headerName: "Overall Score",
      flex: 2,
      filter: false,
      sortable: false,
      editable: false,
      floatingFilter: false,
      cellRenderer: ProgressCellRenderer,
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    filter: "agTextColumnFilter",
    floatingFilter: true,
  }), []);

  return (
    <div className="assignments-page">
      <header className="assignments-page-header">
        <div>
          <p>Performance History</p>
          <h1>My assignments</h1>
          <span>Review completed simulations, scores and incident-level decisions.</span>
        </div>
        <div className="assignments-page-badge"><FiClipboard /> Exercise record</div>
      </header>

      <div className="ag-theme-material assignments-grid">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowHeight={60}
          pagination={true}
          paginationPageSize={25}
          paginationPageSizeSelector={[10, 25, 50]}
        />
      </div>

      {loadingDetails && (
        <div className="assignments-loading">
          <FiActivity /> Loading assignment details…
        </div>
      )}

      {assignmentData && !loadingDetails && (
        <div className="assignments-details">
          <AssignmentAnalytics assignmentData={assignmentData} />
        </div>
      )}
    </div>
  );
}

export default TableAssignment;
