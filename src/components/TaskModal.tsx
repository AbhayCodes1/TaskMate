import React from 'react';
import type { FormEvent } from 'react';
import {
  FolderOpen,
  Loader2,
  Plus,
  Sparkles,
  X,
} from 'lucide-react';
import type { Priority, Reminder, TaskDraft, TaskList } from '../types/task';
import { priorityMeta, LIST_COLOR_MAP } from '../types/task';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: TaskDraft;
  setDraft: React.Dispatch<React.SetStateAction<TaskDraft>>;
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void> | void;
  isSaving: boolean;
  lists: TaskList[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  draft,
  setDraft,
  onSubmit,
  isSaving,
  lists,
}) => {
  if (!isOpen) return null;

  const priorities: Priority[] = ['low', 'medium', 'high'];
  const reminders: Reminder[] = ['Once', 'Daily', 'Every 2 days', 'Weekly'];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in"
      onMouseDown={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white sm:rounded-2xl rounded-t-3xl shadow-soft-xl border border-slate-100 overflow-hidden animate-scale-up"
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
              <p className="text-xs text-slate-500 mt-0.5">
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
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          {/* Task Title */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              required
              value={draft.title}
              onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Review weekly lesson plans"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 shadow-soft-xs transition"
            />
          </div>

          {/* List Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              <FolderOpen size={12} className="inline mr-1 opacity-60" />
              List / Category
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, list_id: null }))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  !draft.list_id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-soft-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>No list</span>
              </button>
              {lists.map((list) => {
                const colorMeta = LIST_COLOR_MAP[list.color] ?? LIST_COLOR_MAP['indigo'];
                const isSelected = draft.list_id === list.id;
                return (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, list_id: list.id }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? `${colorMeta.bg} ${colorMeta.text} ${colorMeta.border} shadow-soft-xs`
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{list.icon}</span>
                    <span>{list.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {priorities.map((p) => {
                const isSelected = draft.priority === p;
                const meta = priorityMeta[p];
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, priority: p }))}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-semibold capitalize transition-all active:scale-95 ${
                      isSelected
                        ? `${meta.bg} ${meta.text} ${meta.border} ring-2 ring-offset-1 ring-indigo-400/30 shadow-soft-xs`
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
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Due Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={draft.due_at}
                onChange={(e) => setDraft((prev) => ({ ...prev, due_at: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 shadow-soft-xs transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Reminder
              </label>
              <select
                value={draft.reminder_frequency}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, reminder_frequency: e.target.value as Reminder }))
                }
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 shadow-soft-xs transition"
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
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-indigo-900">
            <Sparkles size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-700 leading-relaxed">
              TaskMate will automatically calculate deadlines and remind you based on your selected priority level.
            </p>
          </div>

          {/* Modal Actions */}
          <div className="pt-1 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white text-sm font-semibold shadow-soft-sm hover:shadow-glow-indigo transition-all active:scale-95 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus size={16} strokeWidth={2.5} />
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
