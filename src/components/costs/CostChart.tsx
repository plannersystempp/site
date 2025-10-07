
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CostChartProps {
  data: Array<{
    name: string;
    baseCost: number;
    overtimeCost: number;
    totalCost: number;
    date: string;
  }>;
}

export const CostChart: React.FC<CostChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTooltip = (value: number, name: string) => {
    const labels: { [key: string]: string } = {
      totalCost: 'Custo Total',
      overtimeCost: 'Horas Extras'
    };
    return [formatCurrency(value), labels[name] || name];
  };

  const formatLabel = (label: string) => {
    // Truncate long event names for better display
    return label.length > 12 ? label.substring(0, 12) + '...' : label;
  };

  return (
    <div className="w-full h-[300px] sm:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 10,
            left: 10,
            bottom: 80,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            fontSize={10}
            tickFormatter={formatLabel}
            tick={{ fontSize: 10 }}
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value)}
            fontSize={10}
            tick={{ fontSize: 10 }}
            width={80}
          />
          <Tooltip 
            formatter={formatTooltip}
            labelStyle={{ color: '#000', fontSize: '12px' }}
            contentStyle={{ 
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '12px'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Bar 
            dataKey="totalCost" 
            fill="#3b82f6" 
            name="Custo Total"
            radius={[4, 4, 4, 4]}
          />
          <Bar 
            dataKey="overtimeCost" 
            fill="#f97316" 
            name="Horas Extras"
            radius={[4, 4, 4, 4]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
