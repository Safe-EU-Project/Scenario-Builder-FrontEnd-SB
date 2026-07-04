import "./styles/DebriefScreen.css";

/**
 * DebriefScreen — final simulation debrief shown after all incidents completed.
 * Props:
 *   debrief: { overall_score (0-1), overall_level, summary, strengths[], gaps[], recommendations[] }
 *   isLoading: bool
 *   onFinish: () => void  — called when trainee submits for final scoring
 */
export default function DebriefScreen({ debrief, isLoading, onFinish }) {
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

      <button className="finish-button bg-green-500 debrief-finish-btn" onClick={onFinish}>
        Submit & Save Score
      </button>
    </div>
  );
}
