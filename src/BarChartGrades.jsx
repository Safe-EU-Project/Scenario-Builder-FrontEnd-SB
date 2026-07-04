import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

export default function BarChartGrades({
    gradePerIncident,
    isAnimationActive = true,
}) {

    // formatting to match data for chart
    // grade_per_incident entries can be:
    //   { "Incident Title": 75 }               (legacy plain number)
    //   { "Incident Title": { score: 75, ... } } (new LLM dict format)
    const transformData = (gradePerIncident) => {
        return gradePerIncident.map(incidentObj => {
            const name = Object.keys(incidentObj)[0];
            const raw = incidentObj[name];
            const value = (raw !== null && typeof raw === 'object')
                ? (raw.score ?? 0)
                : (raw ?? 0);
            return { name, value };
        });
    };

    if (!gradePerIncident || !gradePerIncident.length) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'grey' }}>
                No grades assigned yet
            </div>
        );
    }

    //we use this data in component
    const data = transformData(gradePerIncident);

    const COLORS = ['#0088FE', '#00ad00'];

    const tickFormatter = (name) =>
        name.length > 14 ? name.slice(0, 13) + "…" : name;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <b style={{ margin: '0.5rem', color: 'grey', textAlign: 'center' }}>
                Grade Per Incident
            </b>

            <div style={{ width: '100%', height: '360px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 16, right: 24, left: 8, bottom: 90 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="name"
                            interval={0}
                            angle={-40}
                            textAnchor="end"
                            height={100}
                            fontSize={11}
                            tickFormatter={tickFormatter}
                            tick={{ fill: '#9ca3af' }}
                        />
                        <YAxis domain={[0, 'auto']} tick={{ fill: '#9ca3af' }} fontSize={11} tickFormatter={(v) => `${v}`} />
                        <Tooltip
                            contentStyle={{
                                background: '#0d1424',
                                border: '1px solid #1e3a5f',
                                borderRadius: '6px',
                                color: '#e2e8f0',
                            }}
                            formatter={(value) => [`${value}`, 'Score']}
                        />
                        <Bar
                            dataKey="value"
                            isAnimationActive={isAnimationActive}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={48}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
