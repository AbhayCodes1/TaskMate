import React from 'react';
import { Search, X } from 'lucide-react';
import type { Filter, Task, TaskList } from '../types/task';
import { LIST_COLOR_MAP } from '../types/task';

interface TaskToolbarProps {
  filter: Filter;
  setFilter: (filter: Filter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  tasks: Task[];
  // List filtering
  lists: TaskList[];
  activeListId: string | null;
  setActiveListId: (id: string | null) => void;
}

export const TaskToolbar: React.FC<TaskToolbarProps> = ({
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
  tasks,
  lists,
  activeListId,
  setActiveListId,
}) => {
  const filterCounts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  const tabs: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: filterCounts.all },
    { id: 'todo', label: 'To Do', count: filterCounts.todo },
    { id: 'in_progress', label: 'In Progress', count: filterCounts.in_progress },
    { id: 'done', label: 'Done', count: filterCounts.done },
  ];

  // Lists that have tasks (for mobile pill row)
  const activeLists = lists.filter((l) => tasks.some((t) => t.list_id === l.id));

  return (
    <div className="border-b border-slate-200/70 bg-slate-50/60">
      {/* Status filter tabs + search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-5 py-3" >
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none" role="tablist">
          {tabs.map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
                  isActive
                    ? 'bg-white text-indigo-600 shadow-soft-xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-xs font-bold tnum ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div className="relative flex-shrink-0 sm:w-56 lg:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={14} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-8 pr-8 py-2 text-sm bg-white border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 shadow-soft-xs transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 transition"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile: List category pills (visible when lists exist with tasks) */}
      {activeLists.length > 0 && (
        <div className="px-4 sm:px-5 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveListId(null)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              !activeListId
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            All lists
          </button>
          {activeLists.map((list) => {
            const colorMeta = LIST_COLOR_MAP[list.color] ?? LIST_COLOR_MAP['indigo'];
            const isActive = activeListId === list.id;
            const count = tasks.filter((t) => t.list_id === list.id).length;
            return (
              <button
                key={list.id}
                onClick={() => setActiveListId(isActive ? null : list.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  isActive
                    ? `${colorMeta.bg} ${colorMeta.text} ${colorMeta.border}`
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <span>{list.icon}</span>
                <span>{list.name}</span>
                <span className={`px-1 py-0.5 rounded text-[10px] font-bold ${isActive ? colorMeta.badge : 'text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
