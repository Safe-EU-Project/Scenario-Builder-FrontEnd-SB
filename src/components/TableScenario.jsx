import { useMemo } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { FiArrowRight, FiPlay, FiShield } from "react-icons/fi";
import "ag-grid-community/styles/ag-theme-material.css";
import Swal from "sweetalert2";
import "./styles/TableScenario.css";

ModuleRegistry.registerModules([AllCommunityModule]);

function TableScenario({ scenarios, simulationActivator }) {
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

  const columnDefs = useMemo(() => [
    {
      field: "scenario_name",
      headerName: "Scenario",
      flex: 2,
      minWidth: 240,
    },
    {
      headerName: "Action",
      width: 160,
      filter: false,
      sortable: false,
      editable: false,
      cellRenderer: (params) => (
        <button
          onClick={() => handleClick(params)}
          className="scenario-launch-btn"
        >
          <FiPlay /> Launch <FiArrowRight />
        </button>
      ),
    },
  ], []);

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
    <div className="scenario-catalog">
      <header className="scenario-catalog-header">
        <div>
          <p>Simulation Library</p>
          <h1>Start an exercise</h1>
          <span>Select a scenario and enter the live decision environment.</span>
        </div>
        <div className="scenario-catalog-status">
          <FiShield />
          <div><strong>{scenarios?.length ?? 0}</strong><span>Available scenarios</span></div>
        </div>
      </header>
      <div className="ag-theme-material scenario-catalog-grid">
        <AgGridReact
          rowData={scenarios}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={25}
          paginationPageSizeSelector={[10, 25, 50]}
        />
      </div>
    </div>
  );
}

export default TableScenario;
