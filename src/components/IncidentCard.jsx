import "./styles/IncidentCard.css";

export default function IncidentCard({ exercise }) {
  return (
    <div className="card-container">
      <div className="card-header">
        <span className="card-header-label">⚠ Incident Alert</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
          {exercise.message_timestamp}
        </span>
      </div>

      <div className="info-row">
        <span><b>Incident</b>{exercise.title}</span>
      </div>

      <div className="card-body">
        <div className="description">
          <h3>Situation Report</h3>
          <p>{exercise.description}</p>
        </div>

        {exercise.inject && (
          <div className="inject-block">
            <h3>Inject</h3>
            <p>{exercise.inject}</p>
          </div>
        )}
      </div>
    </div>
  );
}
