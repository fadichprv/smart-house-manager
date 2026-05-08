'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { Room } from '@/types';
import { RoomTypeBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

const roomEmojis: Record<string, string> = {
  living_room: '🛋️', study: '📚', kitchen: '🍳', gym: '💪',
  laundry: '🧺', common: '🌿', bedroom: '🛏️', bathroom: '🚿',
};

interface Props { room: Room; onBook: (room: Room) => void; index?: number; }

const RoomCard: React.FC<Props> = ({ room, onBook, index = 0 }) => {
  const { user } = useAuth();
  const maxHours = user?.role === 'normal' ? room.maxHoursNormal : room.maxHoursPremium;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all duration-200 group">
      <div className="h-32 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-5xl relative">
        {roomEmojis[room.roomType] || '🏠'}
        <div className="absolute top-3 right-3">
          {room.isAvailable
            ? <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-lg"><CheckCircle className="w-3 h-3" />Available</span>
            : <span className="flex items-center gap-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded-lg"><XCircle className="w-3 h-3" />Occupied</span>
          }
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white">{room.name}</h3>
            <RoomTypeBadge type={room.roomType} />
          </div>
          {room.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{room.description}</p>}
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{room.capacity} people</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Max {maxHours}h</span>
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Floor {room.floor}</span>
        </div>
        {room.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {room.amenities.slice(0, 3).map(a => (
              <span key={a} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-lg">{a}</span>
            ))}
            {room.amenities.length > 3 && <span className="text-xs text-slate-500">+{room.amenities.length - 3}</span>}
          </div>
        )}
        <Button variant="primary" fullWidth size="sm" onClick={() => onBook(room)} disabled={!room.isAvailable}>
          {room.isAvailable ? 'Book Now' : 'Unavailable'}
        </Button>
      </div>
    </motion.div>
  );
};

export default RoomCard;
