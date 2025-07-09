import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

// name: x축 (e.g., '1회'), 그 외 key는 각 그룹의 값 (e.g., male: 50)
export type GroupedBarChartDataItem = {
  name: string;
  [key: string]: string | number;
};

type GroupedBarChartProps = {
  data: GroupedBarChartDataItem[];
  // keys: 'male', 'female' 등 그룹을 나타내는 key 배열
  // colors: 각 그룹에 할당할 색상 배열 (key 순서와 일치)
  keys: string[];
  colors: string[];
  showTooltip?: boolean; // 툴팁 표시 여부
  isDark?: boolean;
};

export const GroupedBarChart: React.FC<GroupedBarChartProps> = ({ data, keys, colors, showTooltip = true, isDark }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#333' : '#e5e7eb'} />
        <XAxis
          dataKey="name"
          stroke={isDark ? '#bbb' : '#888888'}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fill: isDark ? '#bbb' : '#333' }}
        />
        <YAxis
          stroke={isDark ? '#bbb' : '#888888'}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fill: isDark ? '#bbb' : '#333' }}
          tickFormatter={(value) => `${value}명`}
          domain={[0, (dataMax) => Math.ceil(dataMax / 5) * 5]}
        />
        {showTooltip && (
          <Tooltip
            wrapperClassName="rounded-md border bg-background/80 backdrop-blur-sm p-2 shadow-sm"
            contentStyle={{
              backgroundColor: isDark ? '#222' : 'white',
              color: isDark ? '#eee' : '#333',
              border: isDark ? '1px solid #444' : '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '13px',
            }}
            cursor={{ fill: isDark ? '#444' : 'hsl(var(--muted))', opacity: 0.1 }}
          />
        )}
        <Legend wrapperStyle={{ fontSize: "14px", color: isDark ? '#eee' : '#333' }} />
        {keys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={colors[index % colors.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};