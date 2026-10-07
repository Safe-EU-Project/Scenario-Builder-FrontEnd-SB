import jStat from "jstat";

function rankLabel(percentile) {
  if (percentile >= 98) return "Exceptional";
  if (percentile >= 84) return "Strong";
  if (percentile >= 50) return "Above median";
  if (percentile >= 16) return "Developing";
  return "Needs attention";
}

export default function PerformancePercentile({ data, highlightValue }) {
  const values = (data || []).map(Number).filter(Number.isFinite);
  const score = Number(highlightValue) || 0;

  if (values.length < 2) {
    return (
      <div className="analytics-empty">
        <strong>More results are required</strong>
        <p>The percentile benchmark becomes available when at least two participants have graded exercises.</p>
      </div>
    );
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(1, values.length - 1);
  const standardDeviation = Math.sqrt(variance);
  const zScore = standardDeviation > 0 ? (score - mean) / standardDeviation : 0;
  const percentile = (values.filter((value) => value < score).length / values.length) * 100;

  const width = 680;
  const height = 270;
  const left = 48;
  const right = 22;
  const top = 32;
  const bottom = 42;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const xScale = (z) => left + ((z + 3) / 6) * plotWidth;
  const yScale = (density) => top + plotHeight - (density / 0.4) * plotHeight;
  const points = Array.from({ length: 97 }, (_, index) => {
    const z = -3 + (index / 96) * 6;
    return { z, density: jStat.normal.pdf(z, 0, 1) };
  });
  const curve = points.map((point, index) => `${index ? "L" : "M"} ${xScale(point.z)} ${yScale(point.density)}`).join(" ");
  const area = `${curve} L ${xScale(3)} ${top + plotHeight} L ${xScale(-3)} ${top + plotHeight} Z`;
  const markerZ = Math.max(-3, Math.min(3, zScore));
  const markerX = xScale(markerZ);

  return (
    <div className="performance-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Participant performance percentile distribution">
        <defs>
          <linearGradient id="performanceArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0.1, 0.2, 0.3, 0.4].map((density) => (
          <line
            key={density}
            x1={left}
            x2={width - right}
            y1={yScale(density)}
            y2={yScale(density)}
            stroke="var(--color-border)"
            strokeWidth="1"
            strokeDasharray="4 5"
          />
        ))}

        <path d={area} fill="url(#performanceArea)" />
        <path d={curve} fill="none" stroke="var(--color-info)" strokeWidth="2.2" />
        <line x1={left} x2={width - right} y1={top + plotHeight} y2={top + plotHeight} stroke="var(--color-border-hover)" />

        {[-3, -2, -1, 0, 1, 2, 3].map((tick) => (
          <g key={tick}>
            <line
              x1={xScale(tick)}
              x2={xScale(tick)}
              y1={top + plotHeight}
              y2={top + plotHeight + 6}
              stroke="var(--color-text-muted)"
            />
            <text x={xScale(tick)} y={height - 15} textAnchor="middle" fill="var(--color-text-muted)" fontSize="11">
              {tick}σ
            </text>
          </g>
        ))}

        <line
          x1={markerX}
          x2={markerX}
          y1={top + 8}
          y2={top + plotHeight}
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
        <circle cx={markerX} cy={top + 8} r="5" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="3" />
        <text
          x={markerX > width - 100 ? markerX - 10 : markerX + 10}
          y={top + 3}
          textAnchor={markerX > width - 100 ? "end" : "start"}
          fill="var(--color-text)"
          fontSize="13"
          fontWeight="700"
        >
          Your score: {score}
        </text>
      </svg>

      <div className="performance-summary">
        <div><span>Percentile</span><strong>{percentile.toFixed(0)}th</strong></div>
        <div><span>Cohort mean</span><strong>{mean.toFixed(1)}</strong></div>
        <div><span>Position</span><strong>{rankLabel(percentile)}</strong></div>
      </div>
    </div>
  );
}
