'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import NotificationsPanel from '@/components/layout/NotificationsPanel';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login');
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 animate-pulse" />
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  );

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} onNotificationsClick={() => setNotifOpen(!notifOpen)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <NotificationsPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
