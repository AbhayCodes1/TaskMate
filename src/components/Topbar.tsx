import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  ChevronRight,
  CircleUserRound,
  CreditCard,
  LogOut,
  Menu,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import type { Task } from '../types/task';
import { isSupabaseConfigured } from '../lib/supabase';

interface TopbarProps {
  onOpenMobileMenu: () => void;
  tasks: Task[];
  onOpenSettings: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  accent: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileMenu,
  tasks,
  onOpenSettings,
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const notifications = useMemo<NotificationItem[]>(() => {
    const items: NotificationItem[] = [];
    const dueToday = tasks.filter((task) => {
      if (task.status === 'done') return false;
      const due = new Date(task.due_at);
      const now = new Date();
      const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours <= 24 && diffHours >= 0;
    });

    const highPriority = tasks.filter((task) => task.priority === 'high' && task.status !== 'done');
    const dueSoon = tasks.filter((task) => {
      if (task.status === 'done') return false;
      const due = new Date(task.due_at);
      const now = new Date();
      const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays > 0 && diffDays <= 2;
    });
    const completed = tasks.filter((task) => task.status === 'done' && task.completed_at);

    if (dueToday.length > 0) {
      items.push({
        id: 'due-today',
        title: `${dueToday.length} task${dueToday.length > 1 ? 's are' : ' is'} due today`,
        description: dueToday[0].title,
        time: 'Today',
        read: false,
        accent: 'bg-amber-100 text-amber-700',
      });
    }

    if (highPriority.length > 0) {
      items.push({
        id: 'high-priority',
        title: `${highPriority.length} high-priority task${highPriority.length > 1 ? 's' : ''}`,
        description: 'Your most important work needs attention.',
        time: 'Priority',
        read: false,
        accent: 'bg-rose-100 text-rose-700',
      });
    }

    if (dueSoon.length > 0) {
      const nextTask = dueSoon[0];
      items.push({
        id: 'due-soon',
        title: `Task due soon: ${nextTask.title}`,
        description: 'Review this before it slips past the deadline.',
        time: 'Soon',
        read: false,
        accent: 'bg-indigo-100 text-indigo-700',
      });
    }

    if (completed.length > 0) {
      items.push({
        id: 'completed',
        title: 'Great! You completed a task before the deadline.',
        description: 'That momentum is helping you stay on track.',
        time: 'Recent',
        read: true,
        accent: 'bg-emerald-100 text-emerald-700',
      });
    }

    const streakBase = Math.min(2, Math.max(1, Math.floor(completed.length / 2)));
    items.push({
      id: 'streak',
      title: `You are on a ${streakBase}-day productivity streak.`,
      description: 'Keep building consistency to unlock more momentum.',
      time: 'Streak',
      read: true,
      accent: 'bg-violet-100 text-violet-700',
    });

    return items.slice(0, 5);
  }, [tasks]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

        <nav className="flex items-center gap-1.5 text-sm text-slate-400" aria-label="Breadcrumb">
          <span className="hover:text-slate-600 transition cursor-default">Workspace</span>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="font-semibold text-slate-800">Overview</span>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 border-slate-200 text-slate-600">
          <span
            className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
              }`}
          />
          <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Demo Mode'}</span>
        </div>

        <div ref={notificationRef} className="relative">
          <button
            onClick={() => setIsNotificationsOpen((open) => !open)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Notifications"
            aria-expanded={isNotificationsOpen}
          >
            <Bell size={18} />
            {notifications.some((notification) => !notification.read) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-full z-40 mt-3 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/80 animate-slide-up">
              <div className="flex items-center justify-between px-2 py-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Alerts</p>
                  <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {notifications.filter((item) => !item.read).length} new
                </span>
              </div>

              <div className="mt-1 max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-3 py-8 text-center text-sm text-slate-500">
                    No new notifications right now.
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex gap-3 rounded-xl border px-3 py-2.5 ${notification.read ? 'border-slate-200 bg-slate-50' : 'border-indigo-100 bg-indigo-50/40'
                        }`}
                    >
                      <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${notification.accent}`}>
                        <Sparkles size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-800">{notification.title}</p>
                          {!notification.read && (
                            <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" aria-label="Unread notification" />
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{notification.description}</p>
                        <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div ref={profileRef} className="relative">
          <button
            onClick={() => setIsProfileOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-xs font-bold text-white shadow-sm ring-2 ring-slate-100 cursor-pointer hover:ring-indigo-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Open profile menu"
            aria-expanded={isProfileOpen}
          >
            AT
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full z-40 mt-3 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/80 animate-slide-up">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-sm font-bold text-white">
                  AT
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">Alex Thompson</p>
                  <p className="truncate text-xs text-slate-500">Personal Workspace</p>
                </div>
              </div>

              <div className="mt-1 border-t border-slate-200 px-2 pt-2">
                {[
                  { label: 'Profile', icon: CircleUserRound },
                  { label: 'My Workspace', icon: Target },
                  { label: 'Productivity', icon: Trophy },
                  { label: 'Achievements', icon: Trophy },
                ].map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    <Icon size={15} className="text-slate-500" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-2 border-t border-slate-200 px-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onOpenSettings();
                    setIsProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  <CreditCard size={15} className="text-slate-500" />
                  <span>Settings</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-500 transition hover:bg-slate-100"
                >
                  <LogOut size={15} className="text-slate-400" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
