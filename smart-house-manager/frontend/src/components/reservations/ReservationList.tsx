'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Trash2, BookOpen } from 'lucide-react';
import { Reservation } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useCancelReservation } from '@/hooks/useReservations';

interface ReservationListProps {
  reservations: Reservation[];
  showUser?: boolean;
  emptyMessage?: string;
}

const ReservationList: React.FC<ReservationListProps> = ({
  reservations,
  showUser = false,
  emptyMessage = 'No reservations found.',
}) => {
  const { mutate: cancelReservation, isPending } = useCancelReservation();

  const handleCancel = (id: string) => {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      cancelReservation(id);
    }
  };

  if (reservations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <BookOpen className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {reservations.map((reservation, index) => (
          <motion.div
            key={reservation.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: index * 0.03 }}
            className="bg-slate-800 border border-slate-700 rounded-2xl p-4 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-white truncate">{reservation.roomName}</h3>
                  <StatusBadge status={reservation.status} />
                </div>

                {showUser && reservation.userName && (
                  <p className="text-sm text-slate-400 mb-2">
                    Booked by: <span className="text-slate-300">{reservation.userName}</span>
                  </p>
                )}

                <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-violet-400" />
                    <span>{format(new Date(reservation.startTime), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-violet-400" />
                    <span>
                      {format(new Date(reservation.startTime), 'HH:mm')} –{' '}
                      {format(new Date(reservation.endTime), 'HH:mm')}
                    </span>
                  </div>
                </div>

                {reservation.notes && (
                  <p className="text-xs text-slate-500 mt-2 italic">"{reservation.notes}"</p>
                )}
              </div>

              {(reservation.status === 'confirmed' || reservation.status === 'pending') &&
                new Date(reservation.startTime) > new Date() && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleCancel(reservation.id)}
                    isLoading={isPending}
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Cancel
                  </Button>
                )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ReservationList;
