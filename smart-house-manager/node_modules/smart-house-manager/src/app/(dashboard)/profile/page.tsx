'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Heart, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import { RoleBadge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser, firebaseUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [isChangingPw, setIsChangingPw] = useState(false);

  if (!user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUser({ name, phone });
      toast.success('Profile updated.');
    } catch { toast.error('Failed to update profile.'); }
    finally { setIsSaving(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 6) { toast.error('New password must be at least 6 characters.'); return; }
    if (!firebaseUser?.email) return;
    setIsChangingPw(true);
    try {
      const cred = EmailAuthProvider.credential(firebaseUser.email, currentPw);
      await reauthenticateWithCredential(firebaseUser, cred);
      await updatePassword(firebaseUser, newPw);
      toast.success('Password changed successfully.');
      setCurrentPw(''); setNewPw('');
    } catch (err: any) {
      toast.error(err.code === 'auth/wrong-password' ? 'Current password is incorrect.' : 'Failed to change password.');
    } finally { setIsChangingPw(false); }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-slate-400 mt-1">Manage your account settings.</p>
      </div>

      {/* Profile card */}
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={user.name} size="lg" />
          <div>
            <h2 className="text-lg font-semibold text-white">{user.name}</h2>
            <p className="text-slate-400 text-sm">{user.email}</p>
            <div className="mt-1"><RoleBadge role={user.role} /></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-700/50 rounded-xl p-3 text-center">
            <Shield className="w-5 h-5 text-violet-400 mx-auto mb-1" />
            <p className="text-xs text-slate-400">Role</p>
            <p className="text-sm font-medium text-white capitalize">{user.role}</p>
          </div>
          <div className="bg-slate-700/50 rounded-xl p-3 text-center">
            <Heart className="w-5 h-5 text-pink-400 mx-auto mb-1" />
            <p className="text-xs text-slate-400">Total Donated</p>
            <p className="text-sm font-medium text-white">${(user.totalDonations || 0).toFixed(2)}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <CardHeader><CardTitle>Edit Profile</CardTitle></CardHeader>
          <Input label="Full Name" value={name} onChange={e => setName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />} required />
          <Input label="Email" value={user.email} disabled leftIcon={<Mail className="w-4 h-4" />}
            className="opacity-50 cursor-not-allowed" />
          <Input label="Phone (optional)" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 234 567 8900" />
          <Button type="submit" variant="primary" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        </form>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input label="Current Password" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required />
          <Input label="New Password" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min. 6 characters" required />
          <Button type="submit" variant="secondary" isLoading={isChangingPw}>Update Password</Button>
        </form>
      </Card>
    </div>
  );
}
