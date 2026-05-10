'use client';

import React from 'react';
import { Users, DoorOpen, BookOpen, Heart } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import { AdminStats } from '@/types';

interface StatsOverviewProps {
  stats: AdminStats;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatsCard
        title="Total Users"
        value={stats.users.total}
        icon={<Users className="w-6 h-6" />}
        color="purple"
        subtitle={`${stats.users.premium} premium · ${stats.users.admins} admin`}
        index={0}
      />
      <StatsCard
        title="Rooms"
        value={stats.rooms.total}
        icon={<DoorOpen className="w-6 h-6" />}
        color="blue"
        subtitle={`${stats.rooms.available} available`}
        index={1}
      />
      <StatsCard
        title="Total Reservations"
        value={stats.reservations.total}
        icon={<BookOpen className="w-6 h-6" />}
        color="green"
        subtitle={`${stats.reservations.upcoming} upcoming`}
        index={2}
      />
      <StatsCard
        title="Total Donations"
        value={`$${parseFloat(stats.donations.total_amount as any || '0').toFixed(2)}`}
        icon={<Heart className="w-6 h-6" />}
        color="orange"
        subtitle={`$${parseFloat(stats.donations.this_month as any || '0').toFixed(2)} this month`}
        index={3}
      />
    </div>
  );
};

export default StatsOverview;
