'use client';

import React, { useState } from 'react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Reservation } from '@/types';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface ReservationCalendarProps {
  reservations: Reservation[];
  onDateClick?: (date: Date) => void;
}

const ReservationCalendar: React.FC<ReservationCalendarProps> = ({ reservations, onDateClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const getReservationsForDay = (date: Date) => {
    return reservations.filter(r => isSameDay(new Date(r.start_time), date));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick?.(date);
  };

  const selectedDayReservations = selectedDate ? getReservationsForDay(selectedDate) : [];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1.5 text-xs rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for start of month */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {days.map(day => {
          const dayReservations = getReservationsForDay(day);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const hasReservations = dayReservations.length > 0;

          return (
            <motion.button
              key={day.toISOString()}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDateClick(day)}
              className={clsx(
                'relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all duration-200',
                isSelected
                  ? 'bg-violet-600 text-white'
                  : isToday
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/50'
                  : 'text-slate-300 hover:bg-slate-700',
                hasReservations && !isSelected && 'font-semibold'
              )}
            >
              <span>{format(day, 'd')}</span>
              {hasReservations && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayReservations.slice(0, 3).map((_, i) => (
                    <div
                      key={i}
                      className={clsx(
                        'w-1 h-1 rounded-full',
                        isSelected ? 'bg-white' : 'bg-violet-400'
                      )}
                    />
                  ))}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected day reservations */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-2"
        >
          <h3 className="text-sm font-medium text-slate-300">
            {format(selectedDate, 'EEEE, MMMM d')}
          </h3>
          {selectedDayReservations.length === 0 ? (
            <p className="text-sm text-slate-500">No reservations on this day.</p>
          ) : (
            selectedDayReservations.map(res => (
              <div
                key={res.id}
                className="flex items-center gap-3 bg-slate-700/50 rounded-xl p-3"
              >
                <div className="w-1 h-10 rounded-full bg-violet-500" />
                <div>
                  <p className="text-sm font-medium text-white">{res.room_name}</p>
                  <p className="text-xs text-slate-400">
                    {format(new Date(res.start_time), 'HH:mm')} – {format(new Date(res.end_time), 'HH:mm')}
                    {res.user_name && ` · ${res.user_name}`}
                  </p>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ReservationCalendar;
