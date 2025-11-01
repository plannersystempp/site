import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ConversionFunnelChartProps {
  trialCount: number;
  activeCount: number;
}

const COLORS = ['hsl(var(--chart-2))', 'hsl(var(--chart-1))'];

export function ConversionFunnelChart({ trialCount, activeCount }: ConversionFunnelChartProps) {
  const data = [
    { name: 'Trial', value: trialCount },
    { name: 'Ativo', value: activeCount }
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
