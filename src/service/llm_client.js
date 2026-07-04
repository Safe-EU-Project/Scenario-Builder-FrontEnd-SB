/**
 * LLM Service API client.
 * Uses VITE_LLM_API_URL env variable (defaults to relative /api for proxied deployments).
 * All endpoints match the scenario-builder-llm service routes.
 */
import axios from "axios";
import keycloak from "../keycloak";

const LLM_BASE = import.meta.env.VITE_LLM_API_URL || "/api";

const llmApi = axios.create({ baseURL: LLM_BASE });

llmApi.interceptors.request.use(async (config) => {
  if (keycloak.authenticated) {
    try {
      await keycloak.updateToken(30);
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    } catch (_) {}
  }
  return config;
});

/** Convert BackEnd scenario (scenario_name + context[]) → LLM format (scenario_title + incidents[]) */
export function toLLMScenario(backendScenario) {
  return {
    scenario_title: backendScenario.scenario_name,
    incidents: backendScenario.context || [],
  };
}

/**
 * Grade a single trainee action against expected actions.
 * @returns { score (0-100), level, feedback, matched_actions, missed_actions }
 */
export async function gradeStep({ scenarioTitle, incidentTitle, expectedActions, userAction }) {
  const { data } = await llmApi.post("/v1/grade_step", {
    scenario_title: scenarioTitle,
    incident_title: incidentTitle,
    expected_actions: expectedActions,
    user_action: userAction,
  });
  return { ...data, score: Math.round(data.score * 100) };
}

/**
 * Get the next incident index + optional adapted inject + predictions.
 * @returns NextStepResponse fields
 */
export async function nextStep({
  scenario,
  currentIncidentIndex,
  visited,
  userAction,
  historySummary = "",
  adaptInject = true,
}) {
  const { data } = await llmApi.post("/v1/next_step", {
    scenario,
    current_incident_index: currentIncidentIndex,
    visited_incident_indices: visited,
    user_action: userAction,
    history_summary: historySummary,
    use_llm: true,
    adapt_inject: adaptInject,
  });
  return data;
}

/**
 * Generate an end-of-simulation debrief report.
 * @returns { overall_score, overall_level, summary, strengths, gaps, recommendations }
 */
export async function debrief({ scenario, history }) {
  const { data } = await llmApi.post("/v1/debrief", { scenario, history });
  return data;
}
