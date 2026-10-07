import { Cell, Label, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["var(--color-primary)", "var(--color-border)"];

export default function PieChartComparison({ isAnimationActive = true, scenariosCompleted }) {
  const completed = Number(scenariosCompleted?.solved_by_current_user) || 0;
  const total = Number(scenariosCompleted?.total_scenarios) || 0;

  if (total <= 0) {
    return (
      <div className="analytics-empty">
        <strong>No completion data yet</strong>
        <p>Coverage will appear after scenarios are available and at least one exercise is completed.</p>
      </div>
    );
  }

  const remaining = Math.max(total - completed, 0);
  const completionRate = Math.min(100, Math.round((completed / total) * 100));
  const data = [
    { name: "Completed", value: completed },
    { name: "Remaining", value: remaining },
  ];

  return (
    <div className="completion-chart">
      <div className="completion-chart-visual">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={94}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
              stroke="none"
              isAnimationActive={isAnimationActive}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index]} />
              ))}
              <Label
                value={`${completionRate}%`}
                position="center"
                fill="var(--color-text)"
                style={{ fontSize: "24px", fontWeight: 700 }}
              />
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "5px",
                color: "var(--color-text)",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="completion-legend">
        <span><i className="is-complete" />Completed <strong>{completed}</strong></span>
        <span><i />Remaining <strong>{remaining}</strong></span>
      </div>
    </div>
  );
}