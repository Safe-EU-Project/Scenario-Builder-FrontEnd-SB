import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import SideBar from "./components/SideBar";
import NavBar from "./components/NavBar";
import SearchExercise from "./components/SearchExercise";
import UserStats from "./components/UserStats";
import TableAssignment from "./components/TableAssignment";
import TrainerScenarios from "./components/TrainerScenarios";

import "./Main.css";
import HomePage from "./components/HomePage";
import GuidePage from "./components/GuidePage";
import NotFoundPage from "./components/NotFoundPage";

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("safeTheme") || "dark");
  const [simulationMode, setSimulationMode] = useState(
    () => localStorage.getItem("simulationMode") === "true",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("safeTheme", theme);
  }, [theme]);

  const handleSimulationMode = (forceOff = false) => {
    const newMode = forceOff ? false : !simulationMode;
    setSimulationMode(newMode);
    localStorage.setItem('simulationMode', newMode.toString());
  };
  // const handleSimulationMode = () => {
  //   setSimulationMode(!simulationMode);
  // };
  return (
    <BrowserRouter>
      {/* NAVBAR FIXED AT TOP */}
      {!simulationMode && (
        <NavBar
          theme={theme}
          onToggleTheme={() => setTheme((current) => current === "dark" ? "light" : "dark")}
        />
      )}

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
            <Route path="/user-stats" element={<UserStats />} />
            <Route path="/trainer/scenarios" element={<TrainerScenarios />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          {/* <TableScenario data={rows} /> */}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
