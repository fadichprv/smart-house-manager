'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface StatsCardProps {
  title: string; value: string | number; icon: React.ReactNode;
  color?: 'purple' | 'blue' | 'green' | 'red' | 'orange';
  subtitle?: string; index?: number;
}

const colors = {
  purple: { bg: 'bg-violet-500/10', icon: 'text-violet-400', border: 'border-violet-500/20' },
  blue:   { bg: 'bg-blue-500/10',   icon: 'text-blue-400',   border: 'border-blue-500/20'   },
  green:  { bg: 'bg-green-500/10',  icon: 'text-green-400',  border: 'border-green-500/20'  },
  red:    { bg: 'bg-red-500/10',    icon: 'text-red-400',    border: 'border-red-500/20'    },
  orange: { bg: 'bg-orange-500/10', icon: 'text-orange-400', border: 'border-orange-500/20' },
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color = 'purple', subtitle, index = 0 }) => {
  const c = colors[color];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
      className={clsx('bg-slate-800/80 backdrop-blur border rounded-2xl p-5', c.border)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={clsx('p-3 rounded-xl', c.bg, c.icon)}>{icon}</div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
