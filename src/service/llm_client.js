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

async function authHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (keycloak.authenticated) {
    try {
      await keycloak.updateToken(30);
      headers.Authorization = `Bearer ${keycloak.token}`;
    } catch (_) {}
  }
  return headers;
}

/**
 * Same grade as gradeStep, but calls onFeedback with the text as the model writes it.
 * Falls back to the non-streaming call if the stream fails.
 */
export async function gradeStepStream({ scenarioTitle, incidentTitle, expectedActions, userAction, onFeedback }) {
  try {
    const response = await fetch(`${LLM_BASE}/v1/grade_step_stream`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({
        scenario_title: scenarioTitle,
        incident_title: incidentTitle,
        expected_actions: expectedActions,
        user_action: userAction,
      }),
    });
    if (!response.ok || !response.body) {
      throw new Error(`grade stream HTTP ${response.status}`);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let grade = null;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split("\n\n");
      buffer = chunks.pop() || "";
      for (const chunk of chunks) {
        const line = chunk.split("\n").find((item) => item.startsWith("data: "));
        if (!line) continue;
        const message = JSON.parse(line.slice(6));
        if (message.error) throw new Error(message.error);
        if (typeof message.feedback === "string") onFeedback?.(message.feedback);
        if (message.done && message.grade) {
          grade = { ...message.grade, score: Math.round(message.grade.score * 100) };
        }
      }
    }
    if (!grade) throw new Error("grade stream ended without a result");
    return grade;
  } catch (error) {
    console.warn("grade stream failed, using full response", error);
    return gradeStep({ scenarioTitle, incidentTitle, expectedActions, userAction });
  }
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
  includeExploitPath = false,
}) {
  const { data } = await llmApi.post("/v1/next_step", {
    scenario,
    current_incident_index: currentIncidentIndex,
    visited_incident_indices: visited,
    user_action: userAction,
    history_summary: historySummary,
    use_llm: true,
    adapt_inject: adaptInject,
    include_exploit_path: includeExploitPath,
  });
  return data;
}

/**
 * Build the final attack-chain analysis shown in the debrief dashboard.
 * This is intentionally separate from nextStep so exercise latency stays low.
 */
export async function exploitPath({ scenario, useRag = false }) {
  const { data } = await llmApi.post(
    "/v1/exploit_path",
    { scenario, use_rag: useRag },
    { timeout: 300000 },
  );
  return data;
}

/**
 * Generate an end-of-simulation debrief report.
 * @returns { overall_score, overall_level, summary, strengths, gaps, recommendations }
 */
/** Load the model if Ollama has unloaded it. Returns immediately; the load continues on the server. */
export function wakeModel() {
  return llmApi.post("/v1/warmup", {}, { timeout: 15000 }).catch((error) => {
    console.warn("model warmup failed", error);
  });
}

/**
 * Generate an end-of-simulation debrief report.
 * @returns { overall_score, overall_level, summary, strengths, gaps, recommendations }
 */
export async function debrief({ scenario, history }) {
  const { data } = await llmApi.post("/v1/debrief", { scenario, history });
  return data;
}
