'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Shield, UserCheck, UserX, Trash2 } from 'lucide-react';
import { User } from '@/types';
import Avatar from '@/components/ui/Avatar';
import { RoleBadge } from '@/components/ui/Badge';
import { adminApi } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { clsx } from 'clsx';

interface UserTableProps {
  users: User[];
}

const UserTable: React.FC<UserTableProps> = ({ users }) => {
  const queryClient = useQueryClient();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, role: string) => {
    setLoadingId(userId);
    try {
      await adminApi.updateUserRole(userId, role);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Role updated.');
    } catch {
      // handled by interceptor
    } finally {
      setLoadingId(null);
      setOpenMenuId(null);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    setLoadingId(userId);
    try {
      await adminApi.toggleUserStatus(userId);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User status updated.');
    } catch {
      // handled by interceptor
    } finally {
      setLoadingId(null);
      setOpenMenuId(null);
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setLoadingId(userId);
    try {
      await adminApi.deleteUser(userId);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted.');
    } catch {
      // handled by interceptor
    } finally {
      setLoadingId(null);
      setOpenMenuId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left text-xs font-medium text-slate-400 pb-3 pl-2">User</th>
            <th className="text-left text-xs font-medium text-slate-400 pb-3">Role</th>
            <th className="text-left text-xs font-medium text-slate-400 pb-3 hidden md:table-cell">Joined</th>
            <th className="text-left text-xs font-medium text-slate-400 pb-3 hidden lg:table-cell">Donations</th>
            <th className="text-left text-xs font-medium text-slate-400 pb-3">Status</th>
            <th className="text-right text-xs font-medium text-slate-400 pb-3 pr-2">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {users.map((user, index) => (
            <motion.tr
              key={user.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              className="hover:bg-slate-700/20 transition-colors"
            >
              <td className="py-3 pl-2">
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} src={user.avatar_url} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-3">
                <RoleBadge role={user.role} />
              </td>
              <td className="py-3 hidden md:table-cell">
                <span className="text-xs text-slate-400">
                  {format(new Date(user.created_at), 'MMM d, yyyy')}
                </span>
              </td>
              <td className="py-3 hidden lg:table-cell">
                <span className="text-sm text-emerald-400 font-medium">
                  ${parseFloat(user.total_donations as any).toFixed(2)}
                </span>
              </td>
              <td className="py-3">
                <span className={clsx(
                  'text-xs font-medium px-2 py-0.5 rounded-full',
                  user.is_active
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-red-500/20 text-red-300'
                )}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="py-3 pr-2">
                <div className="relative flex justify-end">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                    disabled={loadingId === user.id}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {openMenuId === user.id && (
                    <div className="absolute right-0 top-8 z-10 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                      <div className="p-1">
                        <p className="text-xs text-slate-500 px-3 py-1.5">Change Role</p>
                        {['normal', 'premium', 'admin'].map(role => (
                          <button
                            key={role}
                            onClick={() => handleRoleChange(user.id, role)}
                            className={clsx(
                              'flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg transition-colors',
                              user.role === role
                                ? 'text-violet-400 bg-violet-500/10'
                                : 'text-slate-300 hover:bg-slate-700'
                            )}
                          >
                            <Shield className="w-3.5 h-3.5" />
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </button>
                        ))}
                        <div className="border-t border-slate-700 my-1" />
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          {user.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete User
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
