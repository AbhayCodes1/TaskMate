import React from 'react';
import {
  Bell,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface TopbarProps {
  onOpenMobileMenu: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileMenu,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 px-4 sm:px-8 flex items-center justify-between glass-topbar border-b border-slate-200/70 transition-all">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Open mobile navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb Path */}
        <nav className="flex items-center gap-1.5 text-sm text-slate-400" aria-label="Breadcrumb">
          <span className="hover:text-slate-600 transition cursor-default">Workspace</span>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="font-semibold text-slate-800">Overview</span>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* Supabase Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 border-slate-200 text-slate-600">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
            }`}
          />
          <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Demo Mode'}</span>
        </div>

        {/* Notification Bell */}
        <button
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition focus:outline-none"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* Topbar User Avatar */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-slate-100 cursor-pointer hover:ring-indigo-200 transition">
          AT
        </div>
      </div>
    </header>
  );
};
