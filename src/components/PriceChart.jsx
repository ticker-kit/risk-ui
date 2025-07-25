import { memo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Memoized chart component to prevent unnecessary re-renders
const PriceChart = memo(({
    chartData,
    xAxisFormatter,
    yAxisFormatter
}) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={chartData}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="date"
                    type="number"
                    scale="time"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={xAxisFormatter}
                    tick={{ fontSize: 12 }}
                />
                <YAxis
                    tick={{ fontSize: 12 }}
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={yAxisFormatter}
                />
                <Tooltip
                    labelFormatter={xAxisFormatter}
                    formatter={(value, name) => [
                        yAxisFormatter(value),
                        name === 'close' ? 'Actual Price' : 'Fitted Price'
                    ]}
                />
                <Legend
                    formatter={(value) => value === 'close' ? 'Actual Price' : 'Fitted Price'}
                />
                <Line
                    type="monotone"
                    dataKey="close"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                    name="close"
                />
                <Line
                    type="monotone"
                    dataKey="closeFitted"
                    stroke="#dc2626"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="closeFitted"
                />
            </LineChart>
        </ResponsiveContainer>
    );
});

PriceChart.displayName = 'PriceChart';

export default PriceChart