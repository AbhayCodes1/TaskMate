import React from 'react';
import {
  AlertCircle,
  Bell,
  Check,
  Clock3,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import type { Task } from '../types/task';
import { priorityMeta, statusMeta } from '../types/task';

interface TaskCardProps {
  task: Task;
  onUpdateStatus: (task: Task) => void;
  onSelectTask: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

function formatDueDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function getDueDateStatus(value: string) {
  const diffDays = Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);
  if (diffDays < 0) {
    return { label: 'Overdue', isOverdue: true, isToday: false, badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' };
  }
  if (diffDays === 0) {
    return { label: 'Due today', isOverdue: false, isToday: true, badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' };
  }
  if (diffDays === 1) {
    return { label: 'Due tomorrow', isOverdue: false, isToday: false, badgeClass: 'bg-slate-50 text-slate-600 border-slate-200' };
  }
  return { label: `Due in ${diffDays}d`, isOverdue: false, isToday: false, badgeClass: 'bg-slate-50 text-slate-600 border-slate-200' };
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onUpdateStatus,
  onSelectTask,
  onDeleteTask,
}) => {
  const isDone = task.status === 'done';
  const isInProgress = task.status === 'in_progress';
  const priority = priorityMeta[task.priority];
  const status = statusMeta[task.status];
  const dueStatus = getDueDateStatus(task.due_at);

  return (
    <div
      onClick={() => onSelectTask(task)}
      className={`group relative flex items-start sm:items-center gap-3.5 p-4 sm:px-5 sm:py-4 transition-all duration-150 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80 cursor-pointer ${
        isDone ? 'bg-slate-50/40' : 'bg-white'
      }`}
    >
      {/* Interactive Status Checkbox */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onUpdateStatus(task);
        }}
        aria-label={`Mark task status (currently ${status.label})`}
        className={`mt-0.5 sm:mt-0 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-150 ${
          isDone
            ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
            : isInProgress
            ? 'border-amber-400 bg-amber-50 text-amber-500 hover:border-amber-500'
            : 'border-slate-300 bg-white hover:border-indigo-500 hover:bg-indigo-50/50'
        }`}
      >
        {isDone ? (
          <Check size={12} strokeWidth={3} />
        ) : isInProgress ? (
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        ) : null}
      </button>

      {/* Main Task Content */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <h3
            className={`text-sm font-semibold tracking-tight transition truncate ${
              isDone ? 'line-through text-slate-400 font-normal' : 'text-slate-900 group-hover:text-indigo-600'
            }`}
          >
            {task.title}
          </h3>
        </div>

        {/* Task Metadata Chips */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap text-xs text-slate-500">
          {/* Priority Pill */}
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${priority.bg} ${priority.text} ${priority.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
            {priority.label}
          </span>

          <span className="text-slate-300">•</span>

          {/* Due Date & Relative Urgency */}
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
            <Clock3 size={12} className="text-slate-400" />
            <span>{formatDueDate(task.due_at)}</span>
          </span>

          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${dueStatus.badgeClass}`}
          >
            {dueStatus.isOverdue && <AlertCircle size={10} />}
            {dueStatus.label}
          </span>

          {/* Reminder pill (hidden on small mobile to save space) */}
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400">
            <Bell size={11} className="text-slate-300" />
            {task.reminder_frequency}
          </span>
        </div>
      </div>

      {/* Right side: Status badge & Actions */}
      <div className="flex items-center gap-2.5 flex-shrink-0 self-center">
        {/* Status Pill */}
        <span
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${status.badge}`}
        >
          {status.label}
        </span>

        {/* Delete Quick Action (visible on hover) */}
        {onDeleteTask && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTask(task.id);
            }}
            aria-label="Delete task"
            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <Trash2 size={15} />
          </button>
        )}

        {/* Details arrow / more */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectTask(task);
          }}
          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          aria-label="View task details"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
};
