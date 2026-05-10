'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';
import { DonationLeaderboardEntry } from '@/types';
import Avatar from '@/components/ui/Avatar';
import { RoleBadge } from '@/components/ui/Badge';
import { clsx } from 'clsx';

interface DonationLeaderboardProps {
  entries: DonationLeaderboardEntry[];
}

const rankColors = ['text-yellow-400', 'text-slate-300', 'text-amber-600'];
const rankBgs = ['bg-yellow-500/10 border-yellow-500/20', 'bg-slate-500/10 border-slate-500/20', 'bg-amber-600/10 border-amber-600/20'];

const DonationLeaderboard: React.FC<DonationLeaderboardProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
        <Trophy className="w-10 h-10 mb-3 opacity-30" />
        <p className="text-sm">No donations yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, index) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className={clsx(
            'flex items-center gap-4 p-4 rounded-2xl border',
            index < 3 ? rankBgs[index] : 'bg-slate-800 border-slate-700'
          )}
        >
          {/* Rank */}
          <div className={clsx('w-8 text-center font-bold text-lg', index < 3 ? rankColors[index] : 'text-slate-500')}>
            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
          </div>

          {/* Avatar */}
          <Avatar name={entry.name} src={entry.avatarUrl} size="sm" />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white truncate">{entry.name}</p>
              <RoleBadge role={entry.role} />
            </div>
            <p className="text-xs text-slate-400">{entry.donationCount ?? 0} donations</p>
          </div>

          {/* Amount */}
          <div className="text-right">
            <p className={clsx('font-bold', index < 3 ? rankColors[index] : 'text-white')}>
              ${parseFloat(String(entry.totalDonations || 0)).toFixed(2)}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DonationLeaderboard;
