import { Pie, PieChart, Tooltip, Cell, ResponsiveContainer, Legend, LabelList } from 'recharts';



const COLORS = ['#10B981', '#0e49c0'];



// #endregion
export default function PieChartComparison({isAnimationActive = true, defaultIndex = 0, scenariosCompleted})
{

    console.log("SCENARIOS COMPLETED IN PIECHART:", scenariosCompleted);
    const data01 = [
        { name: 'Scenarios Completed By You', value: scenariosCompleted.solved_by_current_user },
        { name: 'Scenarios Completed By Other', value: scenariosCompleted.total_scenarios },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
            <b style={{ margin: "0.5rem", color: "grey" }}>Comparison of Assignments Completed</b>
            <div style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
                width: "100%",
                maxWidth: "400px",
                height: "300px",
                margin: "0 auto"
            }}>
                <ResponsiveContainer width="100%" height={300} >
                    <PieChart>
                        <Pie
                            data={data01}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            outerRadius="100%"  // Slightly smaller for padding
                            innerRadius="50%"
                            isAnimationActive={isAnimationActive}

                        >
                            {data01.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                            <LabelList
                                dataKey="value"
                                position="inside"      // Outside pie edge
                                formatter={(value) => `${value}`}  // Show numbers only
                                style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}
                            />
                        </Pie>
                        <Tooltip defaultIndex={defaultIndex} />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            height={36}
                            iconSize={12}
                            wrapperStyle={{
                                paddingTop: '8px',
                                fontSize: '14px',
                                lineHeight: '22px'
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}