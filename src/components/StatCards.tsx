import React from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  Flag,
  ListTodo,
  Sparkles,
  Target,
} from 'lucide-react';

interface StatCardsProps {
  activeCount: number;
  completedCount: number;
  highPriorityCount: number;
  completionPercent: number;
  totalTasks: number;
}

export const StatCards: React.FC<StatCardsProps> = ({
  activeCount,
  completedCount,
  highPriorityCount,
  completionPercent,
  totalTasks,
}) => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8" aria-label="Task Statistics">
      {/* 1. Active Tasks */}
      <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-slate-300 transition-all duration-200 group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Tasks
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <ListTodo size={18} strokeWidth={2.4} />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tnum">
            {activeCount}
          </span>
          <span className="text-xs text-slate-400 font-medium">pending</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium mt-2">
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[11px]">
            <ArrowUpRight size={12} />
            +2
          </span>
          <span className="text-slate-400 text-[11px]">from yesterday</span>
        </div>
      </div>

      {/* 2. Completed Tasks */}
      <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-slate-300 transition-all duration-200 group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Completed
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <CheckCircle2 size={18} strokeWidth={2.4} />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tnum">
            {completedCount}
          </span>
          <span className="text-xs text-slate-400 font-medium">of {totalTasks} total</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
            {completionPercent}%
          </span>
          <span className="text-slate-400 text-[11px]">overall completion</span>
        </div>
      </div>

      {/* 3. High Priority */}
      <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-slate-300 transition-all duration-200 group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            High Priority
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <Flag size={18} strokeWidth={2.4} />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tnum">
            {highPriorityCount}
          </span>
          <span className="text-xs text-slate-400 font-medium">urgent tasks</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium mt-2">
          {highPriorityCount > 0 ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold text-[11px]">
              Needs attention
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 font-medium text-[11px]">
              All clear
            </span>
          )}
          <span className="text-slate-400 text-[11px]">in queue</span>
        </div>
      </div>

      {/* 4. Weekly Progress */}
      <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-slate-300 transition-all duration-200 group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Weekly Progress
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <Target size={18} strokeWidth={2.4} />
          </div>
        </div>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tnum">
            {completionPercent}%
          </span>
          <span className="text-[11px] font-medium text-indigo-600 flex items-center gap-0.5">
            <Sparkles size={12} />
            Keep going!
          </span>
        </div>
        {/* Progress Track */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
          <div
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.max(5, completionPercent)}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400 truncate">
          {completionPercent >= 100
            ? 'All tasks completed! Great job.'
            : `${totalTasks - completedCount} remaining to hit this week's target`}
        </p>
      </div>
    </section>
  );
};
