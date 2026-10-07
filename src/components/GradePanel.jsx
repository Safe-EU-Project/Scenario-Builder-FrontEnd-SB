import { useEffect, useState } from "react";
import { FiActivity, FiAlertCircle, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import "./styles/GradePanel.css";

const LOADING_LINES = [
  "Reading your response",
  "Comparing it with the expected actions",
  "Choosing the next step",
  "Writing feedback",
];

function GradeLoading() {
  const [lineIndex, setLineIndex] = useState(0);
  const [shown, setShown] = useState("");
  const line = LOADING_LINES[lineIndex];

  useEffect(() => {
    if (shown.length < line.length) {
      const timer = setTimeout(() => setShown(line.slice(0, shown.length + 1)), 32);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setLineIndex((index) => (index + 1) % LOADING_LINES.length);
      setShown("");
    }, 900);
    return () => clearTimeout(timer);
  }, [shown, line]);

  return (
    <div className="grade-panel grade-panel--loading">
      <div className="grade-spinner" />
      <p className="grade-loading-line">
        {shown}
        <span className="grade-caret" aria-hidden="true" />
      </p>
      <p className="grade-loading-hint">This usually takes a few seconds</p>
    </div>
  );
}

/**
 * GradePanel — shows per-step grade feedback after trainee submits an answer.
 */
export default function GradePanel({ grade, prediction, onContinue, isLoading }) {
  if (isLoading && !grade?.feedback) {
    return <GradeLoading />;
  }

  if (grade?.streaming) {
    return (
      <div className="grade-panel grade-panel--loading">
        <p className="grade-streaming-text">
          {grade.feedback}
          <span className="grade-caret" aria-hidden="true" />
        </p>
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
      <div className="grade-panel-kicker">
        <span>Response assessment</span>
        <em>Adaptive evaluation</em>
      </div>
      {/* Score header */}
      <div className="grade-header" style={{ borderColor: levelColor, color: levelColor }}>
        <div className="grade-score-block">
          <span className="grade-score-caption">Response score</span>
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
          <h4 className="grade-section-title grade-section-title--good"><FiCheckCircle /> What you covered</h4>
          <ul>
            {grade.matched_actions.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}

      {/* Missed actions */}
      {grade.missed_actions?.length > 0 && (
        <div className="grade-section">
          <h4 className="grade-section-title grade-section-title--bad"><FiAlertCircle /> What was missing</h4>
          <ul>
            {grade.missed_actions.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}

      {/* Threat prediction */}
      {prediction && (prediction.predicted_threat_vector || prediction.predicted_impact) && (
        <div className="grade-section grade-section--threat">
          <h4 className="grade-section-title"><FiActivity /> Next-step outlook</h4>
          {prediction.predicted_threat_vector && (
            <p><strong>Next threat vector:</strong> {prediction.predicted_threat_vector}</p>
          )}
          {prediction.predicted_impact && (
            <p><strong>Potential impact:</strong> {prediction.predicted_impact}</p>
          )}
        </div>
      )}

      <button className="grade-continue-button" onClick={onContinue} disabled={isLoading}>
        {isLoading ? "Finishing next step…" : <>Continue <FiArrowRight /></>}
      </button>
    </div>
  );
}
