'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';

interface Props { data: { date: string; count: number }[]; title?: string; }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-sm">
      <p className="text-slate-300">{label}</p>
      <p className="text-violet-400 font-semibold">{payload[0].value} reservations</p>
    </div>
  );
};

const ReservationChart: React.FC<Props> = ({ data, title = 'Reservations (Last 7 Days)' }) => (
  <Card>
    <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139,92,246,0.1)' }} />
        <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  </Card>
);

export default ReservationChart;
