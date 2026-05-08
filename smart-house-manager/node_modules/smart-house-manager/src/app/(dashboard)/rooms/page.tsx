'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { getRooms, subscribeToRooms } from '@/lib/firestore';
import RoomCard from '@/components/rooms/RoomCard';
import ReservationModal from '@/components/rooms/ReservationModal';
import Input from '@/components/ui/Input';
import { Room } from '@/types';

const roomTypes = [
  { value: '', label: 'All' }, { value: 'living_room', label: 'Living Room' },
  { value: 'study', label: 'Study' }, { value: 'kitchen', label: 'Kitchen' },
  { value: 'gym', label: 'Gym' }, { value: 'laundry', label: 'Laundry' },
  { value: 'common', label: 'Common' },
];

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Real-time subscription
    const unsub = subscribeToRooms(r => { setRooms(r as Room[]); setIsLoading(false); });
    return unsub;
  }, []);

  const filtered = rooms.filter(r =>
    (!type || r.roomType === type) &&
    (!search || r.name.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Rooms</h1>
        <p className="text-slate-400 mt-1">Browse and book available rooms in your shared home.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input placeholder="Search rooms..." value={search} onChange={e => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />} className="sm:max-w-xs" />
        <div className="flex gap-2 flex-wrap">
          {roomTypes.map(t => (
            <button key={t.value} onClick={() => setType(t.value)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${type === t.value ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-slate-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <p>No rooms found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((room, i) => <RoomCard key={room.id} room={room} onBook={setSelectedRoom} index={i} />)}
        </div>
      )}

      <ReservationModal room={selectedRoom} isOpen={!!selectedRoom} onClose={() => setSelectedRoom(null)} />
    </div>
  );
}
