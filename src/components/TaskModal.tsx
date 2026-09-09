import React from 'react';
import type { FormEvent } from 'react';
import {
  Loader2,
  Plus,
  Sparkles,
  X,
} from 'lucide-react';
import type { Priority, Reminder, TaskDraft } from '../types/task';
import { priorityMeta } from '../types/task';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: TaskDraft;
  setDraft: React.Dispatch<React.SetStateAction<TaskDraft>>;
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void> | void;
  isSaving: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  draft,
  setDraft,
  onSubmit,
  isSaving,
}) => {
  if (!isOpen) return null;

  const priorities: Priority[] = ['low', 'medium', 'high'];
  const reminders: Reminder[] = ['Once', 'Daily', 'Every 2 days', 'Weekly'];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-all"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-soft-xl border border-slate-100 overflow-hidden animate-scale-up"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Plus size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-slate-900">
                Add New Task
              </h2>
              <p className="text-xs text-slate-500">
                Plan and schedule your next important task.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {/* Task Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              required
              value={draft.title}
              onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Review weekly lesson plans"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-soft-xs transition"
            />
          </div>

          {/* Priority Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Priority Level
            </label>
            <select
              value={draft.priority}
              onChange={(e) => setDraft((prev) => ({ ...prev, priority: e.target.value as Priority }))}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-soft-xs transition mb-2"
            >
              <option value="high">High priority</option>
              <option value="medium">Medium priority</option>
              <option value="low">Low priority</option>
            </select>
            <div className="grid grid-cols-3 gap-2.5">
              {priorities.map((p) => {
                const isSelected = draft.priority === p;
                const meta = priorityMeta[p];
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, priority: p }))}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all ${
                      isSelected
                        ? `${meta.bg} ${meta.text} ${meta.border} ring-2 ring-offset-1 ring-indigo-500/30 font-bold shadow-soft-xs`
                        : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deadline & Reminder Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Due Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={draft.due_at}
                onChange={(e) => setDraft((prev) => ({ ...prev, due_at: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-soft-xs transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Reminder Frequency
              </label>
              <select
                value={draft.reminder_frequency}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, reminder_frequency: e.target.value as Reminder }))
                }
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-soft-xs transition"
              >
                {reminders.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Smart scheduling callout */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-900">
            <Sparkles size={16} className="text-indigo-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-700 leading-relaxed">
              TaskMate will automatically calculate deadlines and remind you based on your selected priority level.
            </p>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white text-xs font-semibold shadow-sm hover:shadow transition cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus size={15} strokeWidth={2.5} />
                  <span>Save Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
