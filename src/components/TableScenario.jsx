"use client";
import React, { StrictMode, useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { MdOutlinePlayCircle } from "react-icons/md";
import "ag-grid-community/styles/ag-theme-material.css";
import Swal from "sweetalert2";

ModuleRegistry.registerModules([AllCommunityModule]);
const rowSelection = {
  mode: "multiRow",
  headerCheckbox: false,
};

function TableScenario({ scenarios, simulationActivator }) {
  console.log(scenarios);
  const [rowData, setRowData] = useState(scenarios);

  const showQuizStartPopup = (parameters) => {
    Swal.fire({
      title: "Launch Simulation",
      html: "<span style='font-size:0.85rem;color:var(--color-text-secondary)'>You are about to enter the simulation. Once started, the clock begins.</span>",
      confirmButtonText: "Launch →",
      showCancelButton: true,
      cancelButtonText: "Cancel",
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        simulationActivator(parameters.data);
      }
    });
  };

  const [columnDefs, setColumnDefs] = useState([
    {
      field: "_id",
      flex: 2,
    },
    {
      field: "scenario_name",
      flex: 2,
    },
    {
      headerName: "Start Simulation",
      flex: 1,
      filter: false,
      sortable: false,
      editable: false,
      cellRenderer: (params) => (
        <button
          onClick={() => handleClick(params)}
          style={{
            padding: "6px 6px",
            fontWeight: "bold",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "84px",
            textAlign: "center",
            fontSize: "26px",
            color: "green",
          }}
        >
          <MdOutlinePlayCircle />
        </button>
      ),
    },
  ]);

  function handleClick(parameters) {
    // show quiz start pop-up
    showQuizStartPopup(parameters);
  }

  const defaultColDef = useMemo(() => {
    return {
      filter: "agTextColumnFilter",
      floatingFilter: true,
    };
  }, []);

  return (
    <div
      className="ag-theme-material"
      style={{ width: "98%", height: "95%", margin: "10px", marginTop: "12px" }}
    >
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={25}
        paginationPageSizeSelector={[10, 25, 50]}
      />
    </div>
  );
}

export default TableScenario;
