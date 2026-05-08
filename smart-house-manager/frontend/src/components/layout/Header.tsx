'use client';

import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

interface HeaderProps { onMenuClick: () => void; onNotificationsClick: () => void; }

const Header: React.FC<HeaderProps> = ({ onMenuClick, onNotificationsClick }) => {
  const { unreadCount } = useNotifications();
  return (
    <header className="h-14 bg-slate-800/80 backdrop-blur border-b border-slate-700 flex items-center justify-between px-4 flex-shrink-0 sticky top-0 z-30">
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex-1" />
      <button onClick={onNotificationsClick} className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-violet-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </header>
  );
};

export default Header;
