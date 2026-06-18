'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Metrics } from '@/lib/types';

interface MetricsChartProps {
  metrics: Metrics[];
}

export function MetricsChart({ metrics }: MetricsChartProps) {
  // Sort metrics by date (oldest first for chart)
  const chartData = [...metrics]
    .reverse()
    .map((m) => ({
      date: new Date(m.captured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: m.views,
      timestamp: new Date(m.captured_at).getTime(),
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="date" stroke="#999" style={{ fontSize: '12px' }} />
        <YAxis stroke="#999" style={{ fontSize: '12px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#222',
            border: '1px solid #333',
            borderRadius: '4px',
            color: '#fff',
          }}
          labelStyle={{ color: '#fff' }}
        />
        <Line
          type="monotone"
          dataKey="views"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
