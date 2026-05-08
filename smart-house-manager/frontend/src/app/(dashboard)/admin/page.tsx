'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Users, DoorOpen, BookOpen, Heart, Ban, Crown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getAllUsers, getAllReservations, getDonations, updateUserDoc, cancelReservation, createRoom, deleteRoom, getRooms, updateRoom } from '@/lib/firestore';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import { RoleBadge, StatusBadge } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import StatsCard from '@/components/dashboard/StatsCard';
import { format } from 'date-fns';
import { tsToDate } from '@/lib/firestore';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'overview' | 'users' | 'rooms' | 'reservations'>('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', description: '', capacity: 4, roomType: 'common', floor: 1, maxHoursNormal: 4, maxHoursPremium: 8 });

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') router.replace('/dashboard');
  }, [user, isLoading]);

  const load = async () => {
    setIsLoading(true);
    const [u, r, d, rm] = await Promise.all([getAllUsers(), getAllReservations(), getDonations(20), getRooms()]);
    setUsers(u); setReservations(r); setDonations(d); setRooms(rm as any[]);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleToggleRole = async (uid: string, currentRole: string) => {
    const newRole = currentRole === 'premium' ? 'normal' : 'premium';
    await updateUserDoc(uid, { role: newRole });
    toast.success(`User role updated to ${newRole}.`);
    load();
  };

  const handleToggleActive = async (uid: string, isActive: boolean) => {
    await updateUserDoc(uid, { isActive: !isActive });
    toast.success(`User ${isActive ? 'deactivated' : 'activated'}.`);
    load();
  };

  const handleCancelReservation = async (id: string, userId: string) => {
    await cancelReservation(id, userId, true);
    toast.success('Reservation cancelled.');
    load();
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRoom({ ...newRoom, isAvailable: true, amenities: [] });
    toast.success('Room created.');
    setShowRoomModal(false);
    load();
  };

  const handleDeleteRoom = async (id: string) => {
    await deleteRoom(id);
    toast.success('Room deleted.');
    load();
  };

  const handleToggleRoomAvailability = async (id: string, current: boolean) => {
    await updateRoom(id, { isAvailable: !current });
    toast.success(`Room ${current ? 'disabled' : 'enabled'}.`);
    load();
  };

  if (user?.role !== 'admin') return null;

  const totalDonations = donations.reduce((s, d) => s + (d.amount || 0), 0);
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Shield className="w-4 h-4" /> },
    { id: 'users', label: `Users (${users.length})`, icon: <Users className="w-4 h-4" /> },
    { id: 'rooms', label: `Rooms (${rooms.length})`, icon: <DoorOpen className="w-4 h-4" /> },
    { id: 'reservations', label: `Reservations (${reservations.length})`, icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-violet-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-400 text-sm">Full system management</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-slate-700 pb-0">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${tab === t.id ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-400 hover:text-white'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-800 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <>
          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Total Users" value={users.length} icon={<Users className="w-5 h-5" />} color="purple" index={0} />
                <StatsCard title="Total Rooms" value={rooms.length} icon={<DoorOpen className="w-5 h-5" />} color="blue" index={1} />
                <StatsCard title="Reservations" value={reservations.length} icon={<BookOpen className="w-5 h-5" />} color="green" index={2} />
                <StatsCard title="Total Donations" value={`$${totalDonations.toFixed(2)}`} icon={<Heart className="w-5 h-5" />} color="orange" index={3} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card><CardHeader><CardTitle>Users by Role</CardTitle></CardHeader>
                  <div className="space-y-2">
                    {(['admin','premium','normal'] as const).map(role => {
                      const count = users.filter(u => u.role === role).length;
                      return <div key={role} className="flex items-center justify-between"><RoleBadge role={role} /><span className="text-white font-semibold">{count}</span></div>;
                    })}
                  </div>
                </Card>
                <Card className="lg:col-span-2"><CardHeader><CardTitle>Recent Reservations</CardTitle></CardHeader>
                  <div className="space-y-2">
                    {reservations.slice(0, 5).map(r => (
                      <div key={r.id} className="flex items-center justify-between text-sm">
                        <div><p className="text-white">{r.roomName}</p><p className="text-xs text-slate-400">{r.userName}</p></div>
                        <StatusBadge status={r.status} />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* USERS */}
          {tab === 'users' && (
            <div className="space-y-3">
              {users.map(u => (
                <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">{u.name}</p>
                        <RoleBadge role={u.role} />
                        {!u.isActive && <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-lg">Banned</span>}
                      </div>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                  </div>
                  {u.id !== user.id && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" leftIcon={<Crown className="w-3.5 h-3.5" />}
                        onClick={() => handleToggleRole(u.id, u.role)}>
                        {u.role === 'premium' ? 'Demote' : 'Promote'}
                      </Button>
                      <Button size="sm" variant={u.isActive ? 'danger' : 'secondary'} leftIcon={<Ban className="w-3.5 h-3.5" />}
                        onClick={() => handleToggleActive(u.id, u.isActive)}>
                        {u.isActive ? 'Ban' : 'Unban'}
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* ROOMS */}
          {tab === 'rooms' && (
            <div className="space-y-4">
              <Button variant="primary" onClick={() => setShowRoomModal(true)} leftIcon={<DoorOpen className="w-4 h-4" />}>Add Room</Button>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map(r => (
                  <Card key={r.id} hover>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white">{r.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-lg border ${r.isAvailable ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                        {r.isAvailable ? 'Available' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{r.description}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" fullWidth onClick={() => handleToggleRoomAvailability(r.id, r.isAvailable)}>
                        {r.isAvailable ? 'Disable' : 'Enable'}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDeleteRoom(r.id)}>Delete</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* RESERVATIONS */}
          {tab === 'reservations' && (
            <div className="space-y-3">
              {reservations.map(r => (
                <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-white">{r.roomName}</p>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-xs text-slate-400">{r.userName} · {r.startTime ? format(tsToDate(r.startTime), 'MMM d, yyyy HH:mm') : ''} – {r.endTime ? format(tsToDate(r.endTime), 'HH:mm') : ''}</p>
                  </div>
                  {r.status === 'confirmed' && (
                    <Button size="sm" variant="danger" onClick={() => handleCancelReservation(r.id, r.userId)}>Cancel</Button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Room Modal */}
      <Modal isOpen={showRoomModal} onClose={() => setShowRoomModal(false)} title="Add New Room">
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <Input label="Room Name" value={newRoom.name} onChange={e => setNewRoom(p => ({ ...p, name: e.target.value }))} required />
          <Input label="Description" value={newRoom.description} onChange={e => setNewRoom(p => ({ ...p, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Capacity" type="number" value={newRoom.capacity} onChange={e => setNewRoom(p => ({ ...p, capacity: +e.target.value }))} min={1} required />
            <Input label="Floor" type="number" value={newRoom.floor} onChange={e => setNewRoom(p => ({ ...p, floor: +e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Room Type</label>
            <select value={newRoom.roomType} onChange={e => setNewRoom(p => ({ ...p, roomType: e.target.value }))}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50">
              {['living_room','study','kitchen','gym','laundry','common','bedroom','bathroom'].map(t => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Max Hours (Normal)" type="number" value={newRoom.maxHoursNormal} onChange={e => setNewRoom(p => ({ ...p, maxHoursNormal: +e.target.value }))} min={1} />
            <Input label="Max Hours (Premium)" type="number" value={newRoom.maxHoursPremium} onChange={e => setNewRoom(p => ({ ...p, maxHoursPremium: +e.target.value }))} min={1} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={() => setShowRoomModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" fullWidth>Create Room</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
