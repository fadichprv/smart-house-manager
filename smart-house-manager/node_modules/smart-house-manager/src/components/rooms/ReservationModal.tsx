'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input, { Textarea } from '@/components/ui/Input';
import { Room } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { createReservation, RULES } from '@/lib/firestore';
import toast from 'react-hot-toast';
import { format, addHours } from 'date-fns';
import { Clock, Calendar } from 'lucide-react';

interface Props { room: Room | null; isOpen: boolean; onClose: () => void; onSuccess?: () => void; }

const ReservationModal: React.FC<Props> = ({ room, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!room || !user) return null;

  const rules = RULES[user.role] || RULES.normal;
  const maxHours = user.role === 'normal' ? room.maxHoursNormal : room.maxHoursPremium;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const start = new Date(`${date}T${startTime}`);
      const end = new Date(`${date}T${endTime}`);
      await createReservation({
        userId: user.id,
        userRole: user.role,
        userName: user.name,
        roomId: room.id,
        roomName: room.name,
        startTime: start,
        endTime: end,
        notes,
      });
      toast.success('Reservation confirmed!');
      onClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create reservation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Book — ${room.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-700/50 rounded-xl p-3 text-sm text-slate-300 space-y-1">
          <p>👤 Your plan: <span className="text-white font-medium capitalize">{user.role}</span></p>
          <p>⏱️ Max duration: <span className="text-white font-medium">{maxHours} hours</span></p>
          <p>📅 Max advance: <span className="text-white font-medium">{rules.advanceDays} days</span></p>
          <p>🔢 Daily limit: <span className="text-white font-medium">{rules.maxPerDay}/day</span></p>
        </div>

        <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)}
          min={format(new Date(), 'yyyy-MM-dd')} leftIcon={<Calendar className="w-4 h-4" />} required />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Start Time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
            leftIcon={<Clock className="w-4 h-4" />} required />
          <Input label="End Time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
            leftIcon={<Clock className="w-4 h-4" />} required />
        </div>

        <Textarea label="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Any special requirements..." rows={2} />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>Confirm Booking</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReservationModal;
