import React from 'react';
import { clsx } from 'clsx';
import { UserRole, ReservationStatus } from '@/types';

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const styles = {
    admin: 'bg-red-500/20 text-red-400 border-red-500/30',
    premium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    normal: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  const labels = { admin: '👑 Admin', premium: '⭐ Premium', normal: '👤 Normal' };
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium border', styles[role])}>
      {labels[role]}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: ReservationStatus }> = ({ status }) => {
  const styles = {
    confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium border capitalize', styles[status])}>
      {status}
    </span>
  );
};

export const RoomTypeBadge: React.FC<{ type: string }> = ({ type }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-violet-500/20 text-violet-400 border border-violet-500/30 capitalize">
    {type.replace('_', ' ')}
  </span>
);
