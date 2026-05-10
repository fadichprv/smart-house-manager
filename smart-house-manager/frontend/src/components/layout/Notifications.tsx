'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { AppNotification } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const notificationIcons: Record<string, string> = {
  info: '💡',
  success: '✅',
  warning: '⚠️',
  error: '❌',
  reservation: '📅',
  donation: '💝',
};

const NotificationItem: React.FC<{
  notification: AppNotification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ notification, onRead, onDelete }) => {
  const createdAt = notification.createdAt?.toDate?.() ?? notification.createdAt ?? new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={clsx(
        'flex gap-3 p-4 rounded-xl border transition-colors',
        notification.isRead
          ? 'bg-slate-800/50 border-slate-700/50'
          : 'bg-slate-700/50 border-violet-500/20'
      )}
    >
      <span className="text-xl flex-shrink-0 mt-0.5">
        {notificationIcons[notification.type] || '🔔'}
      </span>
      <div className="flex-1 min-w-0">
        <p className={clsx('text-sm font-medium', notification.isRead ? 'text-slate-300' : 'text-white')}>
          {notification.title}
        </p>
        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-xs text-slate-500 mt-1">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </p>
      </div>
      <div className="flex flex-col gap-1 flex-shrink-0">
        {!notification.isRead && (
          <button
            onClick={() => onRead(notification.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
            title="Mark as read"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={() => onDelete(notification.id)}
          className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markRead, markAllRead, deleteNotification } = useNotifications();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed right-4 top-16 z-50 w-96 max-h-[80vh] bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-violet-400" />
                <h3 className="font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-violet-600 text-white text-xs rounded-full font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <AnimatePresence>
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <Bell className="w-10 h-10 mb-3 opacity-30" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={markRead}
                      onDelete={deleteNotification}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationsPanel;
