'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCalendarReservations, tsToDate } from '@/lib/firestore';
import { Reservation } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selected, setSelected] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getCalendarReservations(currentDate.getFullYear(), currentDate.getMonth() + 1)
      .then(r => { setReservations(r as Reservation[]); setIsLoading(false); });
  }, [currentDate]);

  const days = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
  const startPad = startOfMonth(currentDate).getDay();

  const getDayReservations = (day: Date) =>
    reservations.filter(r => isSameDay(tsToDate(r.startTime), day));

  const selectedReservations = selected ? getDayReservations(selected) : [];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Reservation Calendar</h1>
        <p className="text-slate-400 mt-1">View all reservations across the house.</p>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">{format(currentDate, 'MMMM yyyy')}</h2>
          <div className="flex gap-2">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
              Today
            </button>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-slate-500 py-2">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map(day => {
            const dayRes = getDayReservations(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = selected && isSameDay(day, selected);
            return (
              <button key={day.toISOString()} onClick={() => setSelected(isSelected ? null : day)}
                className={`relative p-2 rounded-xl text-sm transition-all min-h-[52px] flex flex-col items-center ${
                  isSelected ? 'bg-violet-600 text-white' :
                  isToday ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40' :
                  'text-slate-300 hover:bg-slate-700/50'
                }`}>
                <span className="font-medium">{format(day, 'd')}</span>
                {dayRes.length > 0 && (
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                    {dayRes.slice(0, 3).map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-violet-400'}`} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day reservations */}
      {selected && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-4">{format(selected, 'EEEE, MMMM d')}</h3>
          {selectedReservations.length === 0 ? (
            <p className="text-slate-500 text-sm">No reservations on this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedReservations.map(r => (
                <div key={r.id} className="flex items-center justify-between bg-slate-700/50 rounded-xl p-3">
                  <div>
                    <p className="text-sm font-medium text-white">{r.roomName}</p>
                    <p className="text-xs text-slate-400">{r.userName} · {format(tsToDate(r.startTime), 'HH:mm')} – {format(tsToDate(r.endTime), 'HH:mm')}</p>
                  </div>
                  <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-lg capitalize">{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
