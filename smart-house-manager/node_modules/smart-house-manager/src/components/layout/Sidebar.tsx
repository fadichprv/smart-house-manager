'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { LayoutDashboard, DoorOpen, CalendarDays, BookOpen, Heart, User, LogOut, X, Shield, Home } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/ui/Avatar';
import { RoleBadge } from '@/components/ui/Badge';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/rooms', label: 'Rooms', icon: <DoorOpen className="w-5 h-5" /> },
  { href: '/reservations', label: 'My Reservations', icon: <BookOpen className="w-5 h-5" /> },
  { href: '/calendar', label: 'Calendar', icon: <CalendarDays className="w-5 h-5" /> },
  { href: '/donations', label: 'Donations', icon: <Heart className="w-5 h-5" /> },
  { href: '/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  { href: '/admin', label: 'Admin Panel', icon: <Shield className="w-5 h-5" />, adminOnly: true },
];

interface SidebarProps { isOpen: boolean; onClose: () => void; }

const SidebarContent = ({ onClose }: { onClose: () => void }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const items = navItems.filter(i => !i.adminOnly || user?.role === 'admin');

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center flex-shrink-0">
          <Home className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-white">Smart House</h1>
          <p className="text-xs text-slate-400">Manager</p>
        </div>
        <button onClick={onClose} className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      {user && (
        <div className="px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-700/50">
            <Avatar name={user.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <RoleBadge role={user.role} />
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {items.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} onClick={onClose}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-gradient-to-r from-violet-600/20 to-blue-600/20 text-white border border-violet-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              )}
            >
              <span className={isActive ? 'text-violet-400' : ''}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-slate-700">
        <button onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => (
  <>
    <aside className="hidden lg:flex flex-col w-64 bg-slate-800 border-r border-slate-700 h-screen sticky top-0 flex-shrink-0">
      <SidebarContent onClose={onClose} />
    </aside>
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />
          <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 z-50 w-64 h-full bg-slate-800 border-r border-slate-700 lg:hidden">
            <SidebarContent onClose={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  </>
);

export default Sidebar;
