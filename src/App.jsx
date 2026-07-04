import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import SideBar from "./components/SideBar";
import NavBar from "./components/NavBar";
import SearchExercise from "./components/SearchExercise";
import UserStats from "./components/UserStats";
import TableAssignment from "./components/TableAssignment";
import TrainerScenarios from "./components/TrainerScenarios";

import "./Main.css";
import HomePage from "./components/HomePage";

function App() {
  const [simulationMode, setSimulationMode] = useState(false);
  
  // Load simulationMode from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('simulationMode');
    if (savedMode === 'true') {
      setSimulationMode(true);
    }
  }, []);

  const handleSimulationMode = (forceOff = false) => {
    const newMode = forceOff ? false : !simulationMode;
    setSimulationMode(newMode);
    localStorage.setItem('simulationMode', newMode.toString());
  };
  // const handleSimulationMode = () => {
  //   setSimulationMode(!simulationMode);
  // };
  const data = [1, 3, 10, 11, 12, 15, 18, 2, 39, 20, 25, 3, 10, 11, 12, 15, 18, 30]; // your numeric list
  const valueOfInterest = 9; // your target value
  return (
    <BrowserRouter>
      {/* NAVBAR FIXED AT TOP */}
      {!simulationMode && <NavBar />}

      {/* MAIN PAGE LAYOUT */}
      <div
        className={
          simulationMode
            ? "flex h-[calc(100vh-0px)]"
            : "flex h-[calc(100vh-58px)]"
        }
      >
        <div className="side-bar">{!simulationMode && <SideBar />}</div>

        {/* MAIN CONTENT */}
        {/* <div className={simulationMode ? "main-simulation" : "main"}> */}
        <div className="main">
          <Routes>
            <Route
              path="/start-exercise"
              element={
                <SearchExercise handleSimulationStart={handleSimulationMode} />
              }
            />
            <Route path="/" element={<HomePage />} />
            <Route path="/my-assignments" element={<TableAssignment />} />
            <Route path="/user-stats" element={<UserStats data={data} highlightValue={valueOfInterest} />} />
            <Route path="/trainer/scenarios" element={<TrainerScenarios />} />
            <Route path="/guide" element={<Navigate to="/" replace />} />
          </Routes>
          {/* <TableScenario data={rows} /> */}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
