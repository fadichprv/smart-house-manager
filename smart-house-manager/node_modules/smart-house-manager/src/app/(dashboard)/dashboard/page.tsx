'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Heart, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import StatsCard from '@/components/dashboard/StatsCard';
import ReservationChart from '@/components/dashboard/ReservationChart';
import DonationProgress from '@/components/dashboard/DonationProgress';
import { StatusBadge } from '@/components/ui/Badge';
import { getMyReservations, getMonthlyDonationTotal, tsToDate } from '@/lib/firestore';
import { Reservation } from '@/types';
import { format, subDays, isSameDay } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [monthlyDonations, setMonthlyDonations] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getMyReservations(user.id),
      getMonthlyDonationTotal(),
    ]).then(([res, donations]) => {
      setReservations(res as Reservation[]);
      setMonthlyDonations(donations);
    }).finally(() => setIsLoading(false));
  }, [user]);

  const now = new Date();
  const upcoming = reservations.filter(r => r.status === 'confirmed' && tsToDate(r.endTime) > now);
  const confirmed = reservations.filter(r => r.status === 'confirmed').length;
  const cancelled = reservations.filter(r => r.status === 'cancelled').length;

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(now, 6 - i);
    return {
      date: format(date, 'MMM d'),
      count: reservations.filter(r => isSameDay(tsToDate(r.startTime), date)).length,
    };
  });

  const hour = now.getHours();
  const greeting = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">
          Good {greeting},{' '}
          <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
            {user?.name?.split(' ')[0]}
          </span>! 👋
        </h1>
        <p className="text-slate-400 mt-1">Here's what's happening in your shared home.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Upcoming" value={upcoming.length} icon={<Clock className="w-6 h-6" />} color="purple" index={0} />
        <StatsCard title="Total Bookings" value={reservations.length} icon={<BookOpen className="w-6 h-6" />} color="blue" subtitle={`${confirmed} confirmed`} index={1} />
        <StatsCard title="Cancelled" value={cancelled} icon={<CheckCircle className="w-6 h-6" />} color="red" index={2} />
        <StatsCard title="My Donations" value={`$${(user?.totalDonations || 0).toFixed(2)}`} icon={<Heart className="w-6 h-6" />} color="orange" index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReservationChart data={chartData} />
        <DonationProgress monthlyTotal={monthlyDonations} allTimeTotal={monthlyDonations} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Upcoming Reservations</h2>
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse" />)}</div>
        ) : upcoming.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center text-slate-500">
            No upcoming reservations. <a href="/rooms" className="text-violet-400 hover:underline">Book a room</a> to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 5).map(r => (
              <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-white">{r.roomName}</p>
                  <p className="text-sm text-slate-400">
                    {format(tsToDate(r.startTime), 'MMM d, yyyy')} · {format(tsToDate(r.startTime), 'HH:mm')} – {format(tsToDate(r.endTime), 'HH:mm')}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
