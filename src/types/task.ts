export type Priority = 'high' | 'medium' | 'low';
export type Status = 'todo' | 'in_progress' | 'done';
export type Filter = 'all' | 'todo' | 'in_progress' | 'done';
export type Reminder = 'Once' | 'Daily' | 'Every 2 days' | 'Weekly';

export type Task = {
  id: string;
  title: string;
  priority: Priority;
  status: Status;
  due_at: string;
  reminder_frequency: Reminder;
  created_at: string;
};

export type TaskDraft = {
  title: string;
  priority: Priority;
  due_at: string;
  reminder_frequency: Reminder;
};

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

export const demoTasks: Omit<Task, 'id' | 'created_at'>[] = [
  { title: 'Review weekly lesson plans', priority: 'high', status: 'in_progress', due_at: '2026-09-08T16:00:00', reminder_frequency: 'Daily' },
  { title: 'Submit assessment reports', priority: 'high', status: 'todo', due_at: '2026-09-09T11:30:00', reminder_frequency: 'Every 2 days' },
  { title: 'Prepare science activity materials', priority: 'medium', status: 'todo', due_at: '2026-09-10T09:00:00', reminder_frequency: 'Daily' },
  { title: 'Reply to parent messages', priority: 'low', status: 'todo', due_at: '2026-09-11T15:30:00', reminder_frequency: 'Weekly' },
  { title: 'Set up classroom reading corner', priority: 'low', status: 'done', due_at: '2026-09-07T13:00:00', reminder_frequency: 'Once' },
];

export const emptyDraft: TaskDraft = {
  title: '',
  priority: 'medium',
  due_at: '2026-09-12T09:00',
  reminder_frequency: 'Daily',
};
