import React from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  Flag,
  ListTodo,
  Target,
  TrendingUp,
} from 'lucide-react';

interface StatCardsProps {
  activeCount: number;
  completedCount: number;
  highPriorityCount: number;
  completionPercent: number;
  totalTasks: number;
  points?: number;
  streak?: number;
}

export const StatCards: React.FC<StatCardsProps> = ({
  activeCount,
  completedCount,
  highPriorityCount,
  completionPercent,
  totalTasks,
  points = 0,
  streak = 0,
}) => {
  return (
    <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4" aria-label="Task Statistics">
      {/* 1. Active Tasks */}
      <div className="relative overflow-hidden bg-white p-4 sm:p-5 rounded-2xl border-t-2 border-t-blue-400 border border-slate-200/80 shadow-soft-xs hover:shadow-soft-md hover:border-slate-300 transition-all duration-200 group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Active
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <ListTodo size={16} strokeWidth={2.4} />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tnum">
            {activeCount}
          </span>
          <span className="text-xs text-slate-400 font-medium">pending</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium mt-2">
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-xs">
            <ArrowUpRight size={11} />
            Active
          </span>
          <span className="text-slate-400 text-xs">this session</span>
        </div>
      </div>

      {/* 2. Completed Tasks */}
      <div className="relative overflow-hidden bg-white p-4 sm:p-5 rounded-2xl border-t-2 border-t-emerald-400 border border-slate-200/80 shadow-soft-xs hover:shadow-soft-md hover:border-slate-300 transition-all duration-200 group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Done
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <CheckCircle2 size={16} strokeWidth={2.4} />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tnum">
            {completedCount}
          </span>
          <span className="text-xs text-slate-400 font-medium">of {totalTasks}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium mt-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-xs">
            {completionPercent}%
          </span>
          <span className="text-slate-400 text-xs">completion</span>
        </div>
      </div>

      {/* 3. High Priority */}
      <div className="relative overflow-hidden bg-white p-4 sm:p-5 rounded-2xl border-t-2 border-t-rose-400 border border-slate-200/80 shadow-soft-xs hover:shadow-soft-md hover:border-slate-300 transition-all duration-200 group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Urgent
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <Flag size={16} strokeWidth={2.4} />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tnum">
            {highPriorityCount}
          </span>
          <span className="text-xs text-slate-400 font-medium">high priority</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium mt-2">
          {highPriorityCount > 0 ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold text-xs">
              Needs attention
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 font-medium text-xs">
              All clear ✓
            </span>
          )}
        </div>
      </div>

      {/* 4. Progress / Streak */}
      <div className="relative overflow-hidden bg-white p-4 sm:p-5 rounded-2xl border-t-2 border-t-indigo-400 border border-slate-200/80 shadow-soft-xs hover:shadow-soft-md hover:border-slate-300 transition-all duration-200 group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Progress
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            {streak >= 3 ? <Target size={16} strokeWidth={2.4} /> : <TrendingUp size={16} strokeWidth={2.4} />}
          </div>
        </div>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tnum">
            {completionPercent}%
          </span>
          {streak > 0 && (
            <span className="text-sm font-bold text-orange-500 flex items-center gap-1">
              🔥 {streak}d
            </span>
          )}
        </div>
        {/* Animated Progress Track */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-2">
          <div
            className="bg-gradient-to-r from-indigo-500 to-violet-500 h-1.5 rounded-full progress-animated"
            style={{ width: `${Math.max(4, completionPercent)}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 truncate">
          {completionPercent >= 100
            ? '🎉 All tasks completed!'
            : points > 0
              ? `⭐ ${points} pts earned`
              : `${totalTasks - completedCount} remaining`}
        </p>
      </div>
    </section>
  );
};
