export type Priority = 'high' | 'medium' | 'low';
export type Status = 'todo' | 'in_progress' | 'done';
export type Filter = 'all' | 'todo' | 'in_progress' | 'done';
export type Reminder = 'Once' | 'Daily' | 'Every 2 days' | 'Weekly';

// ─── Task List / Category ──────────────────────────────────────────────────

export type TaskList = {
  id: string;
  name: string;
  icon: string;   // emoji character
  color: string;  // tailwind color class prefix, e.g. 'indigo', 'rose'
};

export const DEFAULT_LISTS: TaskList[] = [
  { id: 'personal-growth',    name: 'Personal Growth',   icon: '🌱', color: 'emerald' },
  { id: 'daily-essentials',   name: 'Daily Essentials',  icon: '⚡', color: 'amber'   },
  { id: 'body-fitness',       name: 'Body Fitness',      icon: '💪', color: 'rose'    },
  { id: 'work',               name: 'Work',              icon: '💼', color: 'blue'    },
  { id: 'study',              name: 'Study',             icon: '📚', color: 'violet'  },
  { id: 'personal',           name: 'Personal',          icon: '🏠', color: 'orange'  },
  { id: 'projects',           name: 'Projects',          icon: '🚀', color: 'indigo'  },
];

export const LIST_COLOR_MAP: Record<string, { bg: string; text: string; border: string; dot: string; badge: string }> = {
  emerald: { bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
  amber:   { bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500',   badge: 'bg-amber-100 text-amber-700'   },
  rose:    { bg: 'bg-rose-50',     text: 'text-rose-700',    border: 'border-rose-200',    dot: 'bg-rose-500',    badge: 'bg-rose-100 text-rose-700'    },
  blue:    { bg: 'bg-blue-50',     text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500',    badge: 'bg-blue-100 text-blue-700'    },
  violet:  { bg: 'bg-violet-50',   text: 'text-violet-700',  border: 'border-violet-200',  dot: 'bg-violet-500',  badge: 'bg-violet-100 text-violet-700' },
  orange:  { bg: 'bg-orange-50',   text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-500',  badge: 'bg-orange-100 text-orange-700' },
  indigo:  { bg: 'bg-indigo-50',   text: 'text-indigo-700',  border: 'border-indigo-200',  dot: 'bg-indigo-500',  badge: 'bg-indigo-100 text-indigo-700' },
};

// ─── Task ──────────────────────────────────────────────────────────────────

export type Task = {
  id: string;
  title: string;
  priority: Priority;
  status: Status;
  due_at: string;
  reminder_frequency: Reminder;
  created_at: string;
  list_id?: string | null;
  completed_at?: string | null;
};

export type TaskDraft = {
  title: string;
  priority: Priority;
  due_at: string;
  reminder_frequency: Reminder;
  list_id?: string | null;
};

// ─── Display Meta ──────────────────────────────────────────────────────────

export const priorityMeta: Record<Priority, { label: string; bg: string; text: string; border: string; dot: string }> = {
  high: {
    label: 'High',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  medium: {
    label: 'Medium',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  low: {
    label: 'Low',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
};

export const statusMeta: Record<Status, { label: string; bg: string; text: string; border: string; badge: string }> = {
  todo: {
    label: 'To Do',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  done: {
    label: 'Done',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

// ─── Demo Data ─────────────────────────────────────────────────────────────

export const demoTasks: Omit<Task, 'id' | 'created_at'>[] = [
  { title: 'Review weekly lesson plans',       priority: 'high',   status: 'in_progress', due_at: '2026-09-08T16:00:00', reminder_frequency: 'Daily',       list_id: 'work' },
  { title: 'Submit assessment reports',        priority: 'high',   status: 'todo',        due_at: '2026-09-09T11:30:00', reminder_frequency: 'Every 2 days', list_id: 'work' },
  { title: 'Prepare science activity materials', priority: 'medium', status: 'todo',      due_at: '2026-09-10T09:00:00', reminder_frequency: 'Daily',       list_id: 'study' },
  { title: 'Reply to parent messages',         priority: 'low',    status: 'todo',        due_at: '2026-09-11T15:30:00', reminder_frequency: 'Weekly',      list_id: 'personal' },
  { title: 'Set up classroom reading corner',  priority: 'low',    status: 'done',        due_at: '2026-09-07T13:00:00', reminder_frequency: 'Once',        list_id: 'work', completed_at: new Date().toISOString() },
];

export const emptyDraft: TaskDraft = {
  title: '',
  priority: 'medium',
  due_at: '2026-09-12T09:00',
  reminder_frequency: 'Daily',
  list_id: null,
};
