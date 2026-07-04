import "./styles/GradePanel.css";

/**
 * GradePanel — shows per-step grade feedback after trainee submits an answer.
 */
export default function GradePanel({ grade, prediction, onContinue, isLoading }) {
  if (isLoading) {
    return (
      <div className="grade-panel grade-panel--loading">
        <div className="grade-spinner" />
        <p>Analysing your response…</p>
      </div>
    );
  }

  if (!grade) return null;

  const levelColor = {
    excellent: "var(--color-success)",
    good:      "var(--color-info)",
    partial:   "var(--color-warning)",
    missing:   "var(--color-danger)",
  }[grade.level] ?? "var(--color-text-muted)";

  return (
    <div className="grade-panel">

      {/* Score header */}
      <div className="grade-header" style={{ borderColor: levelColor, color: levelColor }}>
        <div className="grade-score-block">
          <span className="grade-score" style={{ color: levelColor }}>{grade.score}/100</span>
          <span className="grade-level" style={{ color: levelColor }}>{grade.level?.toUpperCase()}</span>
        </div>

        {grade.feedback && (
          <>
            <div className="grade-divider" />
            <p className="grade-feedback-inline">{grade.feedback}</p>
          </>
        )}
      </div>

      {/* Matched actions */}
      {grade.matched_actions?.length > 0 && (
        <div className="grade-section">
          <h4 className="grade-section-title grade-section-title--good">✓ What you covered</h4>
          <ul>
            {grade.matched_actions.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}

      {/* Missed actions */}
      {grade.missed_actions?.length > 0 && (
        <div className="grade-section">
          <h4 className="grade-section-title grade-section-title--bad">✗ What was missing</h4>
          <ul>
            {grade.missed_actions.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}

      {/* Threat prediction */}
      {prediction && (prediction.predicted_threat_vector || prediction.predicted_impact) && (
        <div className="grade-section grade-section--threat">
          <h4 className="grade-section-title">⚡ Threat Prediction</h4>
          {prediction.predicted_threat_vector && (
            <p><strong>Next threat vector:</strong> {prediction.predicted_threat_vector}</p>
          )}
          {prediction.predicted_impact && (
            <p><strong>Potential impact:</strong> {prediction.predicted_impact}</p>
          )}
        </div>
      )}

      <button className="grade-continue-button" onClick={onContinue}>
        Continue →
      </button>
    </div>
  );
}
