import React from 'react';
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  LayoutDashboard,
  ListTodo,
  Plus,
  Settings,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import type { Filter } from '../types/task';

interface SidebarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  filter: Filter;
  setFilter: (filter: Filter) => void;
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  onOpenNewTask: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMenuOpen,
  setIsMenuOpen,
  filter,
  setFilter,
  totalTasks,
  completedTasks,
  activeTasks,
  onOpenNewTask,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 flex-shrink-0 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-transform duration-300 ease-out md:translate-x-0 ${
          isMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Target size={20} strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                TaskMate
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Pro
                </span>
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Workspace Switcher */}
        <div className="px-4 py-4">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-700 transition text-left group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              AT
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate group-hover:text-indigo-200 transition">
                Alex Thompson
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                Personal Workspace
              </p>
            </div>
            <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-200 transition" />
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="px-4 pb-2">
          <button
            onClick={() => {
              onOpenNewTask();
              setIsMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition duration-150"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Create New Task</span>
          </button>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
              Overview
            </p>
            <nav className="space-y-1">
              <button
                onClick={() => {
                  setFilter('all');
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition group ${
                  filter === 'all'
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard size={17} className={filter === 'all' ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'} />
                <span className="flex-1 text-left font-medium">Dashboard</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold tnum">
                  {totalTasks}
                </span>
              </button>

              <button
                onClick={() => {
                  setFilter('todo');
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition group ${
                  filter === 'todo'
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <ListTodo size={17} className={filter === 'todo' ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'} />
                <span className="flex-1 text-left">Active Tasks</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold tnum">
                  {activeTasks}
                </span>
              </button>

              <button
                onClick={() => {
                  setFilter('done');
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition group ${
                  filter === 'done'
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <CheckCircle2 size={17} className={filter === 'done' ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'} />
                <span className="flex-1 text-left">Completed</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 font-semibold tnum">
                  {completedTasks}
                </span>
              </button>
            </nav>
          </div>

          <div>
            <p className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
              Workspace
            </p>
            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition group">
                <CalendarDays size={17} className="text-slate-400 group-hover:text-slate-200" />
                <span className="flex-1 text-left">Calendar</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Soon</span>
              </button>

              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition group">
                <Bell size={17} className="text-slate-400 group-hover:text-slate-200" />
                <span className="flex-1 text-left">Reminders</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              </button>

              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition group">
                <Settings size={17} className="text-slate-400 group-hover:text-slate-200" />
                <span className="flex-1 text-left">Settings</span>
              </button>
            </nav>
          </div>

          {/* Productivity Tip Widget */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-800/50 border border-slate-700/60 text-slate-300">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-1.5">
              <Sparkles size={15} />
              <span>Productivity Tip</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Focus on your highest-priority items first to maintain momentum throughout your day.
            </p>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                AT
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                Alex Thompson
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                Teacher Account
              </p>
            </div>
            <button
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="User menu"
            >
              <ChevronDown size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
