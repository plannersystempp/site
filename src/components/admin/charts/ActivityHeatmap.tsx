import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ActivityHeatmapProps {
  topTeams: Array<{
    team_name: string;
    event_count: number;
    member_count: number;
  }>;
}

export function ActivityHeatmap({ topTeams }: ActivityHeatmapProps) {
  const getColor = (index: number) => {
    const colors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))'
    ];
    return colors[index % colors.length];
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={topTeams} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          type="number" 
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis 
          type="category" 
          dataKey="team_name" 
          width={120}
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
          formatter={(value: number, name: string) => {
            if (name === 'event_count') return [value, 'Eventos'];
            if (name === 'member_count') return [value, 'Membros'];
            return [value, name];
          }}
        />
        <Bar dataKey="event_count" radius={[0, 8, 8, 0]}>
          {topTeams.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(index)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
