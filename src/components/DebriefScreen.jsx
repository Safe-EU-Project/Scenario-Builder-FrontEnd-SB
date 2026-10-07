import "./styles/DebriefScreen.css";
import {
  FiActivity,
  FiAlertTriangle,
  FiClock,
  FiCrosshair,
  FiDollarSign,
  FiShield,
  FiTarget,
} from "react-icons/fi";

const stageLabel = (value = "") =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

function AttackPathDashboard({ data, isLoading, error }) {
  if (isLoading) {
    return (
      <section className="attack-dashboard attack-dashboard--loading">
        <div className="attack-dashboard-loading-head">
          <div className="grade-spinner" />
          <div>
            <h3>Building attack-path analysis</h3>
            <p>Mapping techniques, exploited weaknesses and defensive opportunities…</p>
          </div>
        </div>
        <div className="attack-skeleton-row">
          <span /><span /><span />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="attack-dashboard attack-dashboard--error">
        <FiAlertTriangle />
        <div>
          <h3>Attack-path analysis unavailable</h3>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  const chain = data?.attack_chain;
  if (!chain) return null;
  const nodes = chain.nodes || [];
  const techniques = new Set(nodes.map((node) => node.mitre_technique_id).filter(Boolean)).size;

  return (
    <section className="attack-dashboard">
      <div className="attack-dashboard-header">
        <div>
          <p className="attack-dashboard-kicker">T7.4 Predictive Analysis</p>
          <h2>Attack Path & Defensive Opportunities</h2>
          <p>
            How the adversary progressed through the scenario and where defenders could
            have interrupted the chain.
          </p>
        </div>
        <span className="attack-dashboard-badge"><FiActivity /> Analysis complete</span>
      </div>

      <div className="attack-metrics">
        <article>
          <FiCrosshair />
          <div><strong>{chain.threat_actor || "Unknown"}</strong><span>Threat actor</span></div>
        </article>
        <article>
          <FiTarget />
          <div><strong>{techniques}</strong><span>ATT&CK techniques</span></div>
        </article>
        <article>
          <FiClock />
          <div><strong>{chain.total_dwell_time || "Not estimated"}</strong><span>Dwell time</span></div>
        </article>
        <article>
          <FiDollarSign />
          <div><strong>{chain.financial_impact_summary || "No direct loss stated"}</strong><span>Financial impact</span></div>
        </article>
      </div>

      <div className="attack-overview">
        <div>
          <span>Initial access</span>
          <p>{chain.initial_access_vector}</p>
        </div>
        <div>
          <span>Motivation</span>
          <p>{chain.threat_actor_motivation}</p>
        </div>
      </div>

      <div className="attack-chain">
        {nodes.map((node, index) => {
          const path = node.exploit_path;
          return (
            <article className="attack-node" key={`${node.incident_index}-${node.incident_title}`}>
              <div className="attack-node-rail">
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="attack-node-card">
                <div className="attack-node-head">
                  <div>
                    <span className="attack-stage">{stageLabel(node.attack_stage)}</span>
                    <h3>{node.incident_title}</h3>
                  </div>
                  <span className="attack-technique">
                    {node.mitre_technique_id} · {node.mitre_technique_name}
                  </span>
                </div>
                <p className="attack-objective">{node.attacker_objective}</p>

                {path && (
                  <details className="attack-details">
                    <summary>View exploitation path</summary>
                    <div className="attack-detail-grid">
                      <div><span>Current foothold</span><p>{path.current_foothold}</p></div>
                      <div><span>Weakness exploited</span><p>{path.vulnerability_exploited}</p></div>
                      <div><span>Movement technique</span><p>{path.lateral_movement_technique}</p></div>
                      <div><span>Pivot target</span><p>{path.pivot_target}</p></div>
                      <div><span>Capability gained</span><p>{path.new_capability_gained}</p></div>
                      <div><span>Containment window</span><p>{path.containment_window}</p></div>
                    </div>
                    {path.detection_indicators?.length > 0 && (
                      <div className="attack-iocs">
                        <span>Detection indicators</span>
                        <ul>{path.detection_indicators.map((ioc, i) => <li key={i}>{ioc}</li>)}</ul>
                      </div>
                    )}
                  </details>
                )}

                <div className="attack-defense">
                  <FiShield />
                  <div>
                    <span>Best defensive action</span>
                    <p>{node.best_defensive_action}</p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/**
 * DebriefScreen — final simulation debrief shown after all incidents completed.
 * Props:
 *   debrief: { overall_score (0-1), overall_level, summary, strengths[], gaps[], recommendations[] }
 *   isLoading: bool
 *   onFinish: () => void  — called when trainee submits for final scoring
 */
export default function DebriefScreen({
  debrief,
  isLoading,
  exploitPath,
  isExploitPathLoading,
  exploitPathError,
  onFinish,
}) {
  if (isLoading) {
    return (
      <div className="debrief-screen debrief-screen--loading">
        <div className="grade-spinner" />
        <p>Generating your debrief report…</p>
      </div>
    );
  }

  if (!debrief) return null;

  const levelColor = {
    excellent: "#22c55e",
    good: "#3b82f6",
    partial: "#f59e0b",
    missing: "#ef4444",
  }[debrief.overall_level] ?? "#6b7280";

  const pct = Math.round((debrief.overall_score ?? 0) * 100);

  return (
    <div className="debrief-screen">
      <p className="debrief-eyebrow">Simulation Complete</p>
      <h2 className="debrief-title">Debrief Report</h2>

      <div className="debrief-score-block" style={{ borderColor: levelColor, color: levelColor }}>
        <span className="debrief-score-number" style={{ color: levelColor }}>{pct}/100</span>
        <div className="debrief-score-divider" />
        <div className="debrief-score-meta">
          <span className="debrief-score-level" style={{ color: levelColor }}>
            {debrief.overall_level?.toUpperCase()}
          </span>
          <span className="debrief-score-label">Overall Score</span>
        </div>
      </div>

      <p className="debrief-summary">{debrief.summary}</p>

      <div className="debrief-columns">
        {debrief.strengths?.length > 0 && (
          <div className="debrief-section debrief-section--strengths">
            <h3>✓ Strengths</h3>
            <ul>
              {debrief.strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}

        {debrief.gaps?.length > 0 && (
          <div className="debrief-section debrief-section--gaps">
            <h3>✗ Gaps</h3>
            <ul>
              {debrief.gaps.map((g, i) => <li key={i}>{g}</li>)}
            </ul>
          </div>
        )}
      </div>

      {debrief.recommendations?.length > 0 && (
        <div className="debrief-columns">
          <div className="debrief-section debrief-section--recs">
            <h3>→ Recommendations</h3>
            <ul>
              {debrief.recommendations.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        </div>
      )}

      <AttackPathDashboard
        data={exploitPath}
        isLoading={isExploitPathLoading}
        error={exploitPathError}
      />

      <button className="finish-button bg-green-500 debrief-finish-btn" onClick={onFinish}>
        Submit & Save Score
      </button>
    </div>
  );
}
