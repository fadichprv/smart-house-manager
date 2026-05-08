'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { getMyReservations, cancelReservation, tsToDate } from '@/lib/firestore';
import { Reservation } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Calendar, Clock, Trash2 } from 'lucide-react';

export default function ReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const load = async () => {
    if (!user) return;
    const res = await getMyReservations(user.id);
    setReservations(res as Reservation[]);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const handleCancel = async (id: string) => {
    if (!user) return;
    setCancelling(id);
    try {
      await cancelReservation(id, user.id);
      toast.success('Reservation cancelled.');
      load();
    } catch (err: any) {
      toast.error(err.message);
    } finally { setCancelling(null); }
  };

  const filtered = filter === 'all' ? reservations : reservations.filter(r => r.status === filter);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">My Reservations</h1>
        <p className="text-slate-400 mt-1">View and manage your bookings.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'confirmed', 'cancelled', 'completed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all capitalize ${filter === s ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-slate-800 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center text-slate-500">
          No reservations found.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-white">{r.roomName}</h3>
                  <StatusBadge status={r.status} />
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{format(tsToDate(r.startTime), 'MMM d, yyyy')}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{format(tsToDate(r.startTime), 'HH:mm')} – {format(tsToDate(r.endTime), 'HH:mm')}</span>
                </div>
                {r.notes && <p className="text-xs text-slate-500 italic">"{r.notes}"</p>}
              </div>
              {r.status === 'confirmed' && tsToDate(r.startTime) > new Date() && (
                <Button variant="danger" size="sm" leftIcon={<Trash2 className="w-4 h-4" />}
                  isLoading={cancelling === r.id} onClick={() => handleCancel(r.id)}>
                  Cancel
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
