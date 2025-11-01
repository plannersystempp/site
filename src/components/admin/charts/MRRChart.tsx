import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MRRChartProps {
  data: Array<{ month: string; mrr: number }>;
}

export function MRRChart({ data }: MRRChartProps) {
  const formattedData = data.map(item => ({
    month: item.month,
    mrr: Number(item.mrr)
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="month" 
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis 
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'MRR']}
        />
        <Bar 
          dataKey="mrr" 
          fill="hsl(var(--primary))" 
          radius={[8, 8, 0, 0]}
          name="MRR"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
