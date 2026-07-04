import jStat from 'jstat';

const CumulativePercentile = ({ data, highlightValue }) => {
  if (!data || data.length < 2) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: '14px' }}>
        Not enough data to display the percentile chart yet.
      </div>
    );
  }

  const n = data.length;

  // 1. EMPIRICAL PERCENTILE (correct rank)
  const valuesBelow = data.filter(v => v < highlightValue).length;
  const empiricalPercentile = (valuesBelow / n) * 100;

  //2. THEORETICAL PERCENTILE (normal approximation)
  const mean = data.reduce((sum, v) => sum + v, 0) / n;
  const stdDev = Math.sqrt(
    data.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (n - 1 || 1)
  );
  const zScore = (highlightValue - mean) / stdDev;
  const absZ = Math.abs(zScore);
  // High-resolution curve points
  const generateCurve = () => {
    const points = [];
    const steps = 400;
    for (let i = 0; i <= steps; i++) {
      const x = -3.5 + 7 * (i / steps);
      const y = jStat.normal.pdf(x, 0, 1) * 450; // Taller curve (was 200)
      points.push({ x, y });
    }
    return points;
  };

  const curvePoints = generateCurve();

  // DISTINCT COLORS (unchanged)
  const bands = [
    { z: -3, label: '<0.1%', rankName: 'Very Poor', color: '#ebf3fd' },
    { z: -2, label: '0.1-2.3%', rankName: 'Poor', color: '#8ac8f8' },
    { z: -1, label: '2.3-15.9%', rankName: 'Below Average', color: '#379df1' },
    { z: -0.5, label: '15.9-50%', rankName: 'Average', color: '#050d7c' },
    { z: 0.5, label: '50-84.1%', rankName: 'Above Average', color: '#379df1' },
    { z: 1, label: '84.1-97.7%', rankName: 'Good', color: '#8ac8f8' },
    { z: 2, label: '97.7-99.9%', rankName: 'Excellent', color: '#ebf3fd' },
    { z: 3, label: '>99.9%', rankName: 'Elite', color: '#ebf3fd' },

  ];

  // Replace the highlightBandIdx logic (around line 28) with:
  const percentile = jStat.normal.cdf(zScore, 0, 1) * 100;  // Exact: 99.36 for z=2.49, ~5th for value=1

  // Find band containing this percentile
  const highlightBandIdx = bands.findIndex((b, i) => {
    const nextBand = bands[i + 1];
    const bandLow = i === 0 ? -Infinity : jStat.normal.cdf(b.z, 0, 1) * 100;
    const bandHigh = nextBand ? jStat.normal.cdf(nextBand.z, 0, 1) * 100 : Infinity;
    return percentile >= bandLow && percentile < bandHigh;
  });

  const highlightBand = bands[highlightBandIdx] || bands[0];

  // SVG dimensions (unchanged)
  const svgWidth = 550;
  const svgHeight = 280;
  const plotLeft = 60;
  const plotWidth = 420;
  const plotBottom = 200;
  const xScale = (z) => plotLeft + (z + 3) / 6 * plotWidth;
  const yScale = (y) => plotBottom - y;

  // Band paths (unchanged)
  const createBandPath = (bandZ, nextZ, color) => {
    const pathPoints = [];
    pathPoints.push({ x: xScale(bandZ), y: plotBottom });
    curvePoints.forEach(point => {
      if (point.x >= bandZ && point.x <= nextZ) {
        pathPoints.push({ x: xScale(point.x), y: yScale(point.y) });
      } { 0 }
    });
    pathPoints.push({ x: xScale(nextZ), y: plotBottom });
    pathPoints.push({ x: xScale(bandZ), y: plotBottom });
    return pathPoints.map(p => `${p.x},${p.y}`).join(' L ');
  };

  return (
    <div >
      <svg style={{ marginTop: 0, borderRadius: "5px", }} width={svgWidth} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        {/* COLORED AREAS (unchanged) */}
        {bands.map((band, i) => {
          const nextZ = bands[i + 1]?.z || 3.5;
          const isHighlight = i === highlightBandIdx;
          const pathD = createBandPath(band.z, nextZ, band.color);

          return (
            <path
              key={`band-${i}`}
              d={`M ${pathD} Z`}
              fill={isHighlight ? '#ff4444' : band.color}
              opacity={isHighlight ? 0.9 : 0.75}
              stroke={isHighlight ? '#d32f2f' : '#e8f0fe'}  // Subtle blue stroke
              strokeWidth={isHighlight ? 2 : 0.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
        {/* Grid (unchanged) */}
        <g stroke="#e8ecef" strokeWidth="1.2" strokeDasharray="4,4">
          {[-0.4, 0, 0.25, 0.5].map(gy => (
            <line key={gy} x1={plotLeft} x2={plotLeft + plotWidth} y1={yScale(gy * 350)} y2={yScale(gy * 350)} />
          ))}
        </g>

        {/* X-axis (unchanged) */}
        <g fill="#555" fontSize="13" fontWeight="500">
          {[-3, -2, -1, 0, 1, 2, 3].map(z => (
            <g key={z}>
              <line
                x1={xScale(z)} x2={xScale(z)}
                y1={plotBottom} y2={plotBottom + 16}
                stroke="#666" strokeWidth="2.5"
              />
              <text
                x={xScale(z)}
                y={plotBottom + 42}
                textAnchor="middle"
                fontSize="15"
                fontWeight="600"
                fill="#444"
              >
                {z}σ
              </text>
            </g>
          ))}
        </g>

        <defs>
          <linearGradient id="curveFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6b7280" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#9ca3af" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* MUCH LESS PROMINENT CURVE */}
        <path
          d={`M ${curvePoints.map(p => `${xScale(p.x)},${yScale(p.y)}`).join(' L ')} L ${xScale(3.5)},${plotBottom} Z`}
          fill="none"
          stroke="#000000"
          strokeWidth="1.8"  // Thinner
          strokeOpacity="0.7" // Faded
          opacity="0.55"      // Overall subtle
        />

        {(() => {
          const clampedZ = Math.max(-3.5, Math.min(3.5, zScore));  // Clamp to visible range
          return (
            <>
              <line
                x1={xScale(clampedZ)} x2={xScale(clampedZ)}
                y1={yScale(0.08)} y2={yScale(0.45)}
                stroke="#ef4444"
                strokeWidth="3"
                strokeOpacity="0.95"
                strokeDasharray="8,4"
                strokeLinecap="round"
              />
              <circle
                cx={xScale(clampedZ)} cy={yScale(0.45)}
                r="6"
                fill="#fef2f2"
                stroke="#ef4444"
                strokeWidth="2.5"
                opacity="1"
              />
              <text
                x={xScale(clampedZ) + (clampedZ < 0 ? -15 : 8)}  // Offset left for neg, right for pos
                y={yScale(10)}
                textAnchor={clampedZ < 0 ? "end" : "start"}
                fill="black"
                fontSize="20"
                fontWeight="700"

              >
                {highlightValue}
                {Math.abs(zScore) > 3.5 && (
                  <tspan x={xScale(clampedZ) + (clampedZ < 0 ? -15 : 8)} dy="24" fontSize="14" fill="#9ca3af">
                    {zScore > 0 ? '→' : '←'}
                  </tspan>
                )}
              </text>
            </>
          );
        })()}

        {/* Labels (unchanged) */}
        {bands.map((band, i) => {
          const nextZ = bands[i + 1]?.z || 3.5;
          const isHighlight = i === highlightBandIdx;
          const labelX = 0.7 * (xScale(band.z) + xScale(nextZ)) - 150;
          const labelY = yScale(0.1) + (isHighlight ? -20 : 18);  // FARTHER + BIGGER spacing

          return (
            <g key={`label-${i}`}>
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                fill={isHighlight ? 'white' : '#555'}
                fontSize={0}      // BIGGER (was 11)
                fontWeight={isHighlight ? 'bold' : '600'}  // BOLDER
                textShadow="0 1px 2px rgba(0,0,0,0.3)"    // Shadow for clarity
              >
                {band.label}
              </text>
              {/* Optional: Thin tick mark above label */}
              {isHighlight && (
                <line
                  x1={labelX} x2={labelX}
                  y1={labelY - 8} y2={labelY + 4}
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="1.2"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Summary (unchanged) */}
      <div style={{
        fontSize: '15px',
        marginTop: '5px',
        padding: '5px',
        borderRadius: '24px',
        textAlign: 'center',
      }}>
        <div style={{ color: 'grey', fontWeight: 'bold', marginBottom: '16px' }}>
          Your Score: <b>{highlightValue}</b>
        </div>
        <div style={{ color: 'grey', marginBottom: '5px' }}>
          You have scored better than <b>{empiricalPercentile.toFixed(1)}%</b> of the participants
        </div>
        {/* Keep band label based on zScore for visualization consistency */}
        <div style={{ color: 'grey' }}>
          Exact rank: {highlightBand.rankName}
        </div>
      </div>
    </div>
  );
};

export default CumulativePercentile;
