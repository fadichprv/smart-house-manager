'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  subscribeToNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification as deleteNotificationDoc,
} from '@/lib/firestore';
import { AppNotification } from '@/types';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!user) { setNotifications([]); return; }
    const unsub = subscribeToNotifications(user.id, (notifs) => {
      setNotifications(notifs as AppNotification[]);
    });
    return unsub;
  }, [user]);

  const markRead = async (id: string) => {
    await markNotificationRead(id);
  };

  const markAllRead = async () => {
    if (user) await markAllNotificationsRead(user.id);
  };

  const deleteNotification = async (id: string) => {
    await deleteNotificationDoc(id);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount: notifications.filter(n => !n.isRead).length,
      markRead,
      markAllRead,
      deleteNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
