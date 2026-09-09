import React from 'react';
import {
  Bell,
  CalendarDays,
  Check,
  Clock,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import type { Task } from '../types/task';
import { priorityMeta, statusMeta } from '../types/task';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdateStatus: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

function formatDetailDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onUpdateStatus,
  onDeleteTask,
}) => {
  if (!task) return null;

  const priority = priorityMeta[task.priority];
  const status = statusMeta[task.status];
  const isDone = task.status === 'done';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-all"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-soft-xl border border-slate-100 overflow-hidden animate-scale-up"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${priority.bg} ${priority.text} ${priority.border}`}
          >
            <span className={`w-2 h-2 rounded-full ${priority.dot}`} />
            {priority.label} Priority
          </span>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div>
            <h2
              className={`text-lg sm:text-xl font-bold font-display leading-snug tracking-tight mb-2 ${
                isDone ? 'line-through text-slate-400' : 'text-slate-900'
              }`}
            >
              {task.title}
            </h2>
            <p className="text-xs text-slate-500">
              Review details and track progression on this workspace task.
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <CalendarDays size={14} className="text-slate-400" />
                Deadline
              </span>
              <span className="font-semibold text-slate-800">
                {formatDetailDate(task.due_at)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Bell size={14} className="text-slate-400" />
                Reminder
              </span>
              <span className="font-semibold text-slate-800">
                {task.reminder_frequency}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Clock size={14} className="text-slate-400" />
                Current Status
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${status.badge}`}
              >
                {status.label}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => onDeleteTask(task.id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition"
            >
              <Trash2 size={15} />
              <span>Delete Task</span>
            </button>

            <button
              onClick={() => onUpdateStatus(task)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition shadow-sm ${
                isDone
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white'
              }`}
            >
              {isDone ? (
                <>
                  <RotateCcw size={14} />
                  <span>Reopen Task</span>
                </>
              ) : (
                <>
                  <Check size={14} strokeWidth={2.5} />
                  <span>Mark as Completed</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
