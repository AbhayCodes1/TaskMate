import React, { useState } from 'react';
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  LayoutDashboard,
  ListTodo,
  Plus,
  Settings,
  Sparkles,
  Target,
  Trophy,
  X,
} from 'lucide-react';
import type { Filter, Task, TaskList } from '../types/task';
import { LIST_COLOR_MAP } from '../types/task';

type SidebarView = 'overview' | 'calendar' | 'reminders' | 'settings' | 'achievements';

interface SidebarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  filter: Filter;
  setFilter: (filter: Filter) => void;
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  onOpenNewTask: () => void;
  // Lists
  lists: TaskList[];
  tasks: Task[];
  activeListId: string | null;
  setActiveListId: (id: string | null) => void;
  onAddList: (name: string) => void;
  // Achievements
  points: number;
  streak: number;
  unlockedAchievementsCount: number;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
  activeView: SidebarView;
  onSelectView: (view: SidebarView) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
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
  lists,
  tasks,
  activeListId,
  setActiveListId,
  onAddList,
  points,
  streak,
  unlockedAchievementsCount,
  onOpenAchievements,
  onOpenSettings,
  activeView,
  onSelectView,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
}) => {
  const [isListsExpanded, setIsListsExpanded] = useState(true);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');

  function getListTaskCount(listId: string) {
    return tasks.filter((t) => t.list_id === listId).length;
  }
  function getListDoneCount(listId: string) {
    return tasks.filter((t) => t.list_id === listId && t.status === 'done').length;
  }

  function handleCreateList() {
    if (!newListName.trim()) return;
    onAddList(newListName.trim());
    setNewListName('');
    setIsCreatingList(false);
  }

  function handleListSelect(listId: string | null) {
    setActiveListId(listId);
    setIsMenuOpen(false);
  }

  const navItemBase =
    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400';
  const navItemActive = 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/25';
  const navItemInactive = 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-[2px] md:hidden transition-opacity animate-fade-in"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 flex-shrink-0 bg-slate-950 border-r border-slate-800/70 text-slate-300 flex flex-col transition-transform duration-300 ease-spring md:translate-x-0 ${isMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Target size={20} strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-display font-bold text-[17px] text-white tracking-tight flex items-center gap-2">
                TaskMate
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/25">
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

        {/* User Profile + Quick Stats */}
        <div className="px-4 py-4 border-b border-slate-800/50 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                AT
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Alex Thompson</p>
              <p className="text-xs text-slate-400 truncate">Personal Workspace</p>
            </div>
            <button className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Gamification Quick Stats */}
          <button
            onClick={() => {
              onOpenAchievements();
              setIsMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:border-amber-400/40 hover:from-amber-500/15 hover:to-orange-500/15 transition group"
          >
            <div className="text-lg">⭐</div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-amber-400 group-hover:text-amber-300 transition">
                {points} points • {unlockedAchievementsCount} badges
              </p>
              <p className="text-[11px] text-slate-500 group-hover:text-slate-400 transition">
                {streak > 0 ? `🔥 ${streak}-day streak` : 'Complete tasks to earn rewards'}
              </p>
            </div>
            <Trophy size={14} className="text-amber-500/60 group-hover:text-amber-400 transition flex-shrink-0" />
          </button>
        </div>

        {/* Scrollable Nav */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5 sidebar-scroll">

          {/* Overview Section */}
          <div>
            <p className="px-3 text-[11px] font-bold tracking-widest text-slate-500 uppercase mb-2">
              Overview
            </p>
            <nav className="space-y-0.5" aria-label="Main navigation">
              <button
                onClick={() => {
                  onSelectView('overview');
                  setFilter('all');
                  setActiveListId(null);
                  setIsMenuOpen(false);
                }}
                className={`${navItemBase} ${activeView === 'overview' && filter === 'all' && !activeListId ? navItemActive : navItemInactive}`}
              >
                <LayoutDashboard
                  size={17}
                  className={filter === 'all' && !activeListId ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}
                />
                <span className="flex-1 text-left">All Tasks</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold tnum">
                  {totalTasks}
                </span>
              </button>

              <button
                onClick={() => {
                  onSelectView('overview');
                  setFilter('todo');
                  setActiveListId(null);
                  setIsMenuOpen(false);
                }}
                className={`${navItemBase} ${activeView === 'overview' && filter === 'todo' && !activeListId ? navItemActive : navItemInactive}`}
              >
                <ListTodo
                  size={17}
                  className={filter === 'todo' && !activeListId ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}
                />
                <span className="flex-1 text-left">To Do</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold tnum">
                  {activeTasks}
                </span>
              </button>

              <button
                onClick={() => {
                  onSelectView('overview');
                  setFilter('done');
                  setActiveListId(null);
                  setIsMenuOpen(false);
                }}
                className={`${navItemBase} ${activeView === 'overview' && filter === 'done' && !activeListId ? navItemActive : navItemInactive}`}
              >
                <CheckCircle2
                  size={17}
                  className={filter === 'done' && !activeListId ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}
                />
                <span className="flex-1 text-left">Completed</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-bold tnum">
                  {completedTasks}
                </span>
              </button>
            </nav>
          </div>

          {/* My Lists Section */}
          <div>
            <button
              onClick={() => setIsListsExpanded(!isListsExpanded)}
              className="w-full flex items-center justify-between px-3 py-1 mb-1 group"
            >
              <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase group-hover:text-slate-400 transition">
                My Lists
              </p>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-600 font-semibold">{lists.length}</span>
                <ChevronRight
                  size={13}
                  className={`text-slate-600 transition-transform duration-200 ${isListsExpanded ? 'rotate-90' : ''}`}
                />
              </div>
            </button>

            {isListsExpanded && (
              <div className="space-y-0.5">
                {lists.map((list, index) => {
                  const colorMeta = LIST_COLOR_MAP[list.color] ?? LIST_COLOR_MAP['indigo'];
                  const count = getListTaskCount(list.id);
                  const doneCount = getListDoneCount(list.id);
                  const isActive = activeListId === list.id;
                  const progressPct = count > 0 ? Math.round((doneCount / count) * 100) : 0;

                  return (
                    <button
                      key={list.id}
                      onClick={() => {
                        onSelectView('overview');
                        handleListSelect(list.id);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group animate-list-item-in ${isActive
                        ? 'bg-slate-800/80 text-slate-100 border border-slate-700/60'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        }`}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <span className="text-base flex-shrink-0">{list.icon}</span>
                      <span className="flex-1 text-left truncate text-sm">{list.name}</span>
                      {count > 0 && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {progressPct > 0 && (
                            <div className="w-12 h-1 bg-slate-700 rounded-full overflow-hidden hidden sm:block">
                              <div
                                className={`h-1 rounded-full progress-animated ${colorMeta.dot}`}
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          )}
                          <span className="text-xs px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 font-bold tnum">
                            {count}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}

                {/* New list form / button */}
                {isCreatingList ? (
                  <div className="px-2 pt-1 pb-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateList();
                          if (e.key === 'Escape') { setIsCreatingList(false); setNewListName(''); }
                        }}
                        placeholder="List name..."
                        className="flex-1 px-2.5 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                        maxLength={32}
                      />
                      <button
                        type="button"
                        onClick={handleCreateList}
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsCreatingList(false); setNewListName(''); }}
                        className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsCreatingList(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition group"
                  >
                    <div className="w-5 h-5 rounded-md border border-dashed border-slate-700 group-hover:border-slate-500 flex items-center justify-center transition">
                      <Plus size={11} />
                    </div>
                    <span>New list</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Workspace Section */}
          <div>
            <p className="px-3 text-[11px] font-bold tracking-widest text-slate-500 uppercase mb-2">
              Workspace
            </p>
            <nav className="space-y-0.5">
              <button
                onClick={() => { onSelectView('calendar'); setIsMenuOpen(false); }}
                className={`${navItemBase} ${activeView === 'calendar' ? navItemActive : navItemInactive}`}
              >
                <CalendarDays size={17} className={activeView === 'calendar' ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'} />
                <span className="flex-1 text-left">Calendar</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700/50">Soon</span>
              </button>

              <button
                onClick={() => { onSelectView('reminders'); setIsMenuOpen(false); }}
                className={`${navItemBase} ${activeView === 'reminders' ? navItemActive : navItemInactive}`}
              >
                <Bell size={17} className={activeView === 'reminders' ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'} />
                <span className="flex-1 text-left">Reminders</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
              </button>

              <button
                onClick={() => {
                  onSelectView('achievements');
                  onOpenAchievements();
                  setIsMenuOpen(false);
                }}
                className={`${navItemBase} ${activeView === 'achievements' ? navItemActive : navItemInactive}`}
              >
                <Trophy size={17} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
                <span className="flex-1 text-left">Achievements</span>
                {unlockedAchievementsCount > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-md bg-amber-900/40 text-amber-400 border border-amber-800/40 font-bold">
                    {unlockedAchievementsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  onSelectView('settings');
                  onOpenSettings();
                  setIsMenuOpen(false);
                }}
                className={`${navItemBase} ${activeView === 'settings' ? navItemActive : navItemInactive}`}
              >
                <Settings size={17} className={activeView === 'settings' ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'} />
                <span className="flex-1 text-left">Settings</span>
              </button>
            </nav>
          </div>

          {/* Productivity Tip */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-1.5">
              <Sparkles size={14} />
              <span>Productivity Tip</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Focus on your highest-priority items first to build momentum through your day.
            </p>
          </div>

          {/* Lists section with "All Tasks" for active list */}
          {activeListId && (
            <button
              onClick={() => {
                onSelectView('overview');
                setActiveListId(null);
                setFilter('all');
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold hover:bg-indigo-600/15 transition"
            >
              <FolderOpen size={13} />
              <span>Clear list filter</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
