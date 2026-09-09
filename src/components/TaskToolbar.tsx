import React from 'react';
import { Search, X } from 'lucide-react';
import type { Filter, Task } from '../types/task';

interface TaskToolbarProps {
  filter: Filter;
  setFilter: (filter: Filter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  tasks: Task[];
}

export const TaskToolbar: React.FC<TaskToolbarProps> = ({
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
  tasks,
}) => {
  const filterCounts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  const tabs: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: 'All Tasks', count: filterCounts.all },
    { id: 'todo', label: 'To Do', count: filterCounts.todo },
    { id: 'in_progress', label: 'In Progress', count: filterCounts.in_progress },
    { id: 'done', label: 'Completed', count: filterCounts.done },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 bg-slate-50/70 border-b border-slate-200/80">
      {/* Filter Tabs (Horizontal scrollable on mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none" role="tablist">
        {tabs.map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setFilter(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-white text-indigo-600 shadow-soft-xs border border-slate-200/90'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold tnum ${
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
      <div className="relative flex-1 sm:max-w-xs">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search size={15} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks..."
          className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-200/90 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-soft-xs transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
