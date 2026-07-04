import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/SearchExercise.css";
import "./styles/ClockCountDown.css";
import IncidentCard from "./IncidentCard";
import GradePanel from "./GradePanel";
import DebriefScreen from "./DebriefScreen";
import { Label, Textarea } from "flowbite-react";
import TableScenario from "./TableScenario";
import ClockCountDown from "./ClockCountDown";
import Swal from "sweetalert2";
import React from "react";
import keycloak from "../keycloak";
import apiFetch from "../service/api_client";
import { gradeStep, nextStep, debrief, toLLMScenario } from "../service/llm_client";
import { FaCheckCircle } from "react-icons/fa";

export default function SearchExercise({ handleSimulationStart }) {
  const navigate = useNavigate();

  // ── BackEnd assignment state ──────────────────────────────────────────────
  const [exercise, setExercise] = useState(null);       // BackEnd assignment object
  const [scenarios, setScenarios] = useState(null);
  const [incidentIndex, setIncidentIndex] = useState(-1); // current incident index (LLM-driven)
  const [draft, setDraft] = useState({});

  // ── Full scenario (with expected_actions) for LLM calls ──────────────────
  const [scenario, setScenario] = useState(null);

  // ── LLM simulation state ──────────────────────────────────────────────────
  const [visited, setVisited] = useState([]);             // visited incident indices
  const [historyLines, setHistoryLines] = useState([]);   // "Step N: action" for history_summary
  const [gradeHistory, setGradeHistory] = useState([]);   // full grade history for debrief

  // ── UI state ─────────────────────────────────────────────────────────────
  const [gradeResult, setGradeResult] = useState(null);  // current step grade
  const [nextStepPrediction, setNextStepPrediction] = useState(null); // threat predictions
  const [showGrade, setShowGrade] = useState(false);      // whether grade panel is visible
  const [isLLMLoading, setIsLLMLoading] = useState(false);
  const [debriefData, setDebriefData] = useState(null);
  const [isDebriefLoading, setIsDebriefLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);   // simulation complete flag

  const commentRef = useRef();

  // ── Restore from localStorage on mount ───────────────────────────────────
  useEffect(() => {
    try {
      const savedExercise = localStorage.getItem("exerciseState");
      const savedDraft = localStorage.getItem("exerciseDraft");
      const savedVisited = localStorage.getItem("exerciseVisited");
      const savedScenario = localStorage.getItem("exerciseScenario");

      if (!savedExercise) return;

      const parsedExercise = JSON.parse(savedExercise);
      const parsedDraft = savedDraft ? JSON.parse(savedDraft) : {};
      const parsedVisited = savedVisited ? JSON.parse(savedVisited) : [];
      const parsedScenario = savedScenario ? JSON.parse(savedScenario) : null;

      if (parsedExercise?.context_solution) {
        const context = parsedExercise.context_solution;
        const draftIndices = Object.keys(parsedDraft).map(Number).filter((i) => i < context.length);

        let resumeIndex;
        if (draftIndices.length > 0) {
          resumeIndex = Math.max(...draftIndices);
        } else {
          resumeIndex = context.findIndex((incident) => {
            const action = incident.expected_actions?.[0] || "";
            return action.trim() === "" || action.trim() === "add your solution here ...";
          });
          if (resumeIndex === -1) resumeIndex = context.length;
          resumeIndex = Math.max(0, resumeIndex);
        }

        setExercise(parsedExercise);
        setIncidentIndex(resumeIndex);
        setDraft(parsedDraft);
        if (parsedVisited.length > 0) setVisited(parsedVisited);
        if (parsedScenario) setScenario(parsedScenario);
      }
    } catch (error) {
      console.error("Load failed:", error);
      localStorage.clear();
    }
  }, []);

  // ── Fetch scenario list ───────────────────────────────────────────────────
  useEffect(() => {
    async function fetchScenarios() {
      try {
        const response = await apiFetch.get("/v1/scenario");
        setScenarios(response.data);
      } catch (error) {
        console.error("Error fetching scenarios", error);
      }
    }
    fetchScenarios();
  }, []);

  // ── Sync textarea with current incident ──────────────────────────────────
  useEffect(() => {
    if (!commentRef.current) return;

    let fillValue = "";
    if (draft[incidentIndex]) {
      fillValue = draft[incidentIndex];
    } else if (exercise?.context_solution?.[incidentIndex]?.expected_actions?.[0]) {
      fillValue = exercise.context_solution[incidentIndex].expected_actions[0];
    }

    const trimmed = fillValue.trim();
    commentRef.current.value =
      trimmed && trimmed !== "add your solution here ..." ? fillValue : "";
  }, [exercise, incidentIndex, draft]);

  // ── Start exercise ────────────────────────────────────────────────────────
  async function handleSetExercise(scenarioExercise) {
    try {
      const response = await apiFetch.post("/v1/assignment/trainee/create_assignment", {
        scenario_id: scenarioExercise._id,
      });

      const newExercise = response.data;
      const initialVisited = [0];

      localStorage.setItem("exerciseState", JSON.stringify(newExercise));
      localStorage.setItem("exerciseVisited", JSON.stringify(initialVisited));
      localStorage.setItem("exerciseScenario", JSON.stringify(scenarioExercise));

      setExercise(newExercise);
      setScenario(scenarioExercise);
      setIncidentIndex(0);
      setVisited(initialVisited);
      setHistoryLines([]);
      setGradeHistory([]);
      setShowGrade(false);
      setGradeResult(null);
      setNextStepPrediction(null);
      setDebriefData(null);
      setIsComplete(false);

      handleSimulationStart();
    } catch (error) {
      console.error("Error creating assignment", error);
    }
  }

  // ── Popups ────────────────────────────────────────────────────────────────
  const showLoadingPopup = () =>
    Swal.fire({
      title: "Submitting…",
      html: "Please wait",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

  const closeLoadingPopup = () => Swal.close();

  const errorPopup = () =>
    Swal.fire({
      title: "An error occurred",
      allowOutsideClick: false,
      confirmButtonText: "OK",
      confirmButtonColor: "#3b82f6",
    });

  function handleTimeIsFinished() {
    handleExit();
  }

  // ── Final submit to BackEnd ───────────────────────────────────────────────
  async function handleExit() {
    try {
      showLoadingPopup();
      await apiFetch.post("/v1/assignment/trainee/solve", exercise);
      localStorage.removeItem("exerciseState");
      localStorage.removeItem("exerciseDraft");
      localStorage.removeItem("simulationMode");
      localStorage.removeItem("exerciseVisited");
      localStorage.removeItem("exerciseScenario");
      setExercise(null);
      setIncidentIndex(-1);
      setDraft({});
      setScenarios(null);
      setScenario(null);
      setVisited([]);
      setHistoryLines([]);
      setGradeHistory([]);
      setShowGrade(false);
      setDebriefData(null);
      setIsComplete(false);
      handleSimulationStart(true);
      closeLoadingPopup();
      navigate("/");
    } catch (error) {
      console.error("Error submitting assignment", error);
      handleSimulationStart();
      errorPopup();
      navigate("/");
    }
  }

  // ── Save answer locally ───────────────────────────────────────────────────
  function saveAnswerLocally(userAction) {
    setExercise((prev) => {
      const updatedContext = prev.context_solution.map((incident, idx) => {
        if (idx !== incidentIndex) return incident;
        return { ...incident, expected_actions: [userAction] };
      });
      const newExercise = { ...prev, context_solution: updatedContext };
      localStorage.setItem("exerciseState", JSON.stringify(newExercise));
      return newExercise;
    });

    setDraft((prevDraft) => {
      const newDraft = { ...prevDraft };
      delete newDraft[incidentIndex];
      localStorage.setItem("exerciseDraft", JSON.stringify(newDraft));
      return newDraft;
    });
  }

  // ── Main "Next" handler — calls LLM grade + next_step ────────────────────
  async function handleNext() {
    const userAction = (commentRef.current?.value || draft[incidentIndex] || "").trim();

    // Skip if no real answer
    if (!userAction || userAction === "add your solution here ...") {
      Swal.fire({
        title: "Empty response",
        text: "Please describe your response actions before continuing.",
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    // Save answer locally
    saveAnswerLocally(userAction);
    commentRef.current.value = "";

    // Show LLM loading state
    setIsLLMLoading(true);
    setShowGrade(true);
    setGradeResult(null);
    setNextStepPrediction(null);

    try {
      const currentIncident = scenario?.context?.[incidentIndex];
      const llmScenario = scenario ? toLLMScenario(scenario) : null;

      // Build updated history before parallel LLM calls
      const newHistoryLines = [...historyLines, `Step ${incidentIndex}: ${userAction}`];
      setHistoryLines(newHistoryLines);

      // ── Grade + Next Step in parallel ───────────────────────────────────
      const [grade, nextStepResp] = await Promise.all([
        currentIncident && llmScenario
          ? gradeStep({
              scenarioTitle: scenario.scenario_name,
              incidentTitle: currentIncident.title,
              expectedActions: currentIncident.expected_actions || [],
              userAction,
            }).catch((e) => { console.warn("grade_step failed, continuing without grade", e); return null; })
          : Promise.resolve(null),

        llmScenario
          ? nextStep({
              scenario: llmScenario,
              currentIncidentIndex: incidentIndex,
              visited: visited.includes(incidentIndex) ? visited : [...visited, incidentIndex],
              userAction,
              historySummary: newHistoryLines.join("\n"),
              adaptInject: false,
            }).catch((e) => { console.warn("next_step failed, using linear fallback", e); return null; })
          : Promise.resolve(null),
      ]);

      const newGradeEntry = {
        incident_index: incidentIndex,
        incident_title: currentIncident?.title ?? `Incident ${incidentIndex}`,
        user_action: userAction,
        grade_score: grade ? grade.score / 100 : null,
        grade_level: grade ? grade.level : null,
      };
      const newGradeHistory = [...gradeHistory, newGradeEntry];
      setGradeHistory(newGradeHistory);

      setGradeResult(grade);
      setNextStepPrediction(
        nextStepResp
          ? {
              predicted_threat_vector: nextStepResp.predicted_threat_vector,
              predicted_impact: nextStepResp.predicted_impact,
            }
          : null
      );
      setIsLLMLoading(false);

      // ── Check if scenario complete ──────────────────────────────────────
      const scenarioComplete =
        nextStepResp?.is_scenario_complete ||
        visited.length + 1 >= (scenario?.context?.length ?? 0);

      if (scenarioComplete) {
        // Generate debrief
        setIsDebriefLoading(true);
        try {
          if (llmScenario && newGradeHistory.length > 0) {
            const debriefResp = await debrief({ scenario: llmScenario, history: newGradeHistory });
            setDebriefData(debriefResp);
          }
        } catch (e) {
          console.warn("debrief failed", e);
        }
        setIsDebriefLoading(false);
        setIsComplete(true);
        return;
      }

      // Determine next index (LLM or linear fallback)
      const nextIdx =
        nextStepResp?.next_incident_index ??
        (incidentIndex + 1 < (exercise?.context_solution?.length ?? 0)
          ? incidentIndex + 1
          : null);

      if (nextIdx !== null) {
        const newVisited = [...visited, nextIdx];
        setVisited(newVisited);
        localStorage.setItem("exerciseVisited", JSON.stringify(newVisited));
      }

      // The grade panel will call onContinue to advance to next incident
      // (see handleContinueAfterGrade below)
      if (!grade) {
        // No grade to show → go immediately
        handleContinueAfterGrade(nextIdx);
      }
    } catch (err) {
      console.error("LLM flow error", err);
      setIsLLMLoading(false);
      // Fallback: advance linearly
      setIncidentIndex((prev) => prev + 1);
      setShowGrade(false);
    }
  }

  // Called when trainee clicks "Continue" in the GradePanel
  function handleContinueAfterGrade(overrideNextIdx) {
    setShowGrade(false);
    setGradeResult(null);
    setNextStepPrediction(null);

    // Find the next unvisited index
    const nextIdx =
      overrideNextIdx ??
      visited.find((_, i, arr) => i === arr.length - 1) + 1 ??
      incidentIndex + 1;

    setIncidentIndex(typeof nextIdx === "number" ? nextIdx : incidentIndex + 1);
  }

  // ── Confirmation popup before advancing ──────────────────────────────────
  const showNextIncidentPopup = () => {
    Swal.fire({
      title: "Step into next incident",
      text: "Are you sure?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#ef4444",
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then((result) => {
      if (result.isConfirmed) handleNext();
    });
  };

  // ── Derive next index from visited state for GradePanel's onContinue ─────
  const latestVisitedIdx = visited[visited.length - 1];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Scenario picker */}
      {scenarios && !exercise && (
        <TableScenario scenarios={scenarios} simulationActivator={handleSetExercise} />
      )}

      {/* Active simulation */}
      {exercise?.context_solution &&
        incidentIndex >= 0 &&
        incidentIndex < exercise.context_solution.length &&
        !isComplete && (
          <div className="incident-container">
            <div className="clock-countdown">
              <ClockCountDown handleTimeFinish={handleTimeIsFinished} />
            </div>

            {/* Grade panel (shown after each step while waiting for LLM or after grading) */}
            {showGrade ? (
              <GradePanel
                grade={gradeResult}
                prediction={nextStepPrediction}
                isLoading={isLLMLoading}
                onContinue={() => handleContinueAfterGrade(latestVisitedIdx)}
              />
            ) : (
              <>
                <IncidentCard exercise={exercise.context_solution[incidentIndex]} />
                <br />
                <div className="w-[80%] max-w-[800px] flex flex-col">
                  <Textarea
                    ref={commentRef}
                    id="comment"
                    className="mt-[5px]"
                    placeholder="Describe your response actions…"
                    required
                    rows={4}
                    onChange={(e) => {
                      const value = e.target.value;
                      commentRef.current.value = value;
                      setDraft((prev) => {
                        const newDraft = { ...prev, [incidentIndex]: value };
                        localStorage.setItem("exerciseDraft", JSON.stringify(newDraft));
                        return newDraft;
                      });
                    }}
                  />
                  <button className="next-button" onClick={handleNext}>
                    Next
                  </button>
                  <button
                    className="next-button"
                    style={{ background: "#6b7280", marginTop: "8px" }}
                    onClick={() => {
                      Swal.fire({
                        title: "Abandon Exercise?",
                        text: "Your progress will not be saved.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: "Yes, exit",
                        cancelButtonText: "Continue",
                        confirmButtonColor: "#ef4444",
                        cancelButtonColor: "#3b82f6",
                      }).then((result) => {
                        if (result.isConfirmed) {
                          localStorage.removeItem("exerciseState");
                          localStorage.removeItem("exerciseDraft");
                          localStorage.removeItem("simulationMode");
                          localStorage.removeItem("exerciseVisited");
                          localStorage.removeItem("exerciseScenario");
                          handleSimulationStart(true);
                          navigate("/");
                        }
                      });
                    }}
                  >
                    Exit Exercise
                  </button>
                </div>
              </>
            )}
          </div>
        )}

      {/* Simulation complete — show debrief */}
      {(isComplete ||
        (exercise && incidentIndex >= exercise.context_solution.length)) && (
        <>
          {debriefData || isDebriefLoading ? (
            <DebriefScreen
              debrief={debriefData}
              isLoading={isDebriefLoading}
              onFinish={handleExit}
            />
          ) : (
            <div className="finish-exercise">
              <h2>You have completed the simulation!</h2>
              <FaCheckCircle style={{ fontSize: "80px", color: "#22c55e", margin: "24px auto", display: "block" }} />
              <h2>Press submit to save your score</h2>
              <button className="finish-button bg-green-500" onClick={handleExit}>
                Submit
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
