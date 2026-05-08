'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { tsToDate } from '@/lib/firestore';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';

interface Props { isOpen: boolean; onClose: () => void; }

const typeColors: Record<string, string> = {
  success: 'bg-green-500/20 border-green-500/30 text-green-400',
  warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
  error: 'bg-red-500/20 border-red-500/30 text-red-400',
  info: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
};

const NotificationsPanel: React.FC<Props> = ({ isOpen, onClose }) => {
  const { notifications, markRead, markAllRead } = useNotifications();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="fixed right-4 top-16 z-50 w-80 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-semibold text-white">Notifications</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={markAllRead} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" title="Mark all read">
                  <CheckCheck className="w-4 h-4" />
                </button>
                <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-700/50">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-slate-500 text-sm">No notifications</div>
              ) : notifications.map(n => (
                <div key={n.id}
                  onClick={() => !n.isRead && markRead(n.id)}
                  className={clsx('px-4 py-3 cursor-pointer hover:bg-slate-700/30 transition-colors', !n.isRead && 'bg-violet-500/5')}
                >
                  <div className="flex items-start gap-3">
                    <div className={clsx('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', !n.isRead ? 'bg-violet-400' : 'bg-slate-600')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{n.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {n.createdAt ? formatDistanceToNow(tsToDate(n.createdAt), { addSuffix: true }) : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationsPanel;
