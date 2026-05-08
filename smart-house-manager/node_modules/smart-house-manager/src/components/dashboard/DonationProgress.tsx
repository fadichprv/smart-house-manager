'use client';

import React from 'react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { Heart } from 'lucide-react';

interface Props { monthlyTotal: number; goal?: number; allTimeTotal?: number; }

const DonationProgress: React.FC<Props> = ({ monthlyTotal, goal = 500, allTimeTotal = 0 }) => {
  const pct = Math.min(100, (monthlyTotal / goal) * 100);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-pink-400" />
          <CardTitle>Monthly Donation Goal</CardTitle>
        </div>
      </CardHeader>
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Collected this month</span>
          <span className="text-white font-semibold">${monthlyTotal.toFixed(2)} / ${goal}</span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>{pct.toFixed(0)}% of goal</span>
          <span>All time: ${allTimeTotal.toFixed(2)}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { label: 'New Chairs', goal: 150, emoji: '🪑' },
            { label: 'Upgrade WiFi', goal: 200, emoji: '📶' },
            { label: 'Gaming Room', goal: 500, emoji: '🎮' },
          ].map(item => (
            <div key={item.label} className="bg-slate-700/50 rounded-xl p-2.5 text-center">
              <div className="text-lg">{item.emoji}</div>
              <div className="text-xs text-slate-300 mt-1">{item.label}</div>
              <div className="text-xs text-slate-500">${item.goal}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default DonationProgress;
