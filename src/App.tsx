import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  Flag,
  LayoutDashboard,
  ListTodo,
  Menu,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  Trash2,
  X,
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type Priority = 'high' | 'medium' | 'low';
type Status = 'todo' | 'in_progress' | 'done';
type Filter = 'all' | 'todo' | 'in_progress' | 'done';
type Reminder = 'Once' | 'Daily' | 'Every 2 days' | 'Weekly';

type Task = {
  id: string;
  title: string;
  priority: Priority;
  status: Status;
  due_at: string;
  reminder_frequency: Reminder;
  created_at: string;
};

type TaskDraft = {
  title: string;
  priority: Priority;
  due_at: string;
  reminder_frequency: Reminder;
};

const demoTasks: Omit<Task, 'id' | 'created_at'>[] = [
  { title: 'Review weekly lesson plans', priority: 'high', status: 'in_progress', due_at: '2026-09-08T16:00:00', reminder_frequency: 'Daily' },
  { title: 'Submit assessment reports', priority: 'high', status: 'todo', due_at: '2026-09-09T11:30:00', reminder_frequency: 'Every 2 days' },
  { title: 'Prepare science activity materials', priority: 'medium', status: 'todo', due_at: '2026-09-10T09:00:00', reminder_frequency: 'Daily' },
  { title: 'Reply to parent messages', priority: 'low', status: 'todo', due_at: '2026-09-11T15:30:00', reminder_frequency: 'Weekly' },
  { title: 'Set up classroom reading corner', priority: 'low', status: 'done', due_at: '2026-09-07T13:00:00', reminder_frequency: 'Once' },
];

const priorityMeta: Record<Priority, { label: string; className: string; dot: string }> = {
  high: { label: 'High', className: 'priority-high', dot: 'bg-rose-500' },
  medium: { label: 'Medium', className: 'priority-medium', dot: 'bg-amber-400' },
  low: { label: 'Low', className: 'priority-low', dot: 'bg-emerald-500' },
};

const statusMeta: Record<Status, { label: string; className: string }> = {
  todo: { label: 'To Do', className: 'status-todo' },
  in_progress: { label: 'In Progress', className: 'status-progress' },
  done: { label: 'Done', className: 'status-done' },
};

const emptyDraft: TaskDraft = {
  title: '',
  priority: 'medium',
  due_at: '2026-09-12T09:00',
  reminder_frequency: 'Daily',
};

function createDemoTasks(): Task[] {
  return demoTasks.map((task, index) => ({
    ...task,
    id: `demo-task-${index + 1}`,
    created_at: new Date().toISOString(),
  }));
}

function formatDueDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
}

function relativeDueDate(value: string) {
  const difference = Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);
  if (difference < 0) return 'Overdue';
  if (difference === 0) return 'Due today';
  if (difference === 1) return 'Due tomorrow';
  return `Due in ${difference} days`;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draft, setDraft] = useState<TaskDraft>(emptyDraft);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    void loadTasks();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 3000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function loadTasks() {
    setIsLoading(true);
    if (!supabase) {
      setTasks(createDemoTasks());
      setIsLoading(false);
      return;
    }
    const { data, error } = await supabase.from('taskmate_tasks').select('*').order('due_at', { ascending: true });
    if (error) {
      setNotice('We could not load the shared task list.');
      setIsLoading(false);
      return;
    }
    if (!data || data.length === 0) {
      const { data: seeded, error: seedError } = await supabase.from('taskmate_tasks').insert(demoTasks).select();
      if (seedError) {
        setNotice('Your task list is ready, but demo tasks could not be added.');
      } else {
        setTasks((seeded ?? []) as Task[]);
      }
    } else {
      setTasks(data as Task[]);
    }
    setIsLoading(false);
  }

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    setIsSaving(true);
    if (!supabase) {
      const task: Task = {
        ...draft,
        id: crypto.randomUUID(),
        title: draft.title.trim(),
        status: 'todo',
        created_at: new Date().toISOString(),
      };
      setTasks((current) => [...current, task].sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime()));
      setDraft(emptyDraft);
      setIsModalOpen(false);
      setIsSaving(false);
      setNotice('Task added for this session.');
      return;
    }
    const { data, error } = await supabase.from('taskmate_tasks').insert({ ...draft, title: draft.title.trim(), status: 'todo' }).select().maybeSingle();
    if (error || !data) {
      setNotice('That task could not be saved. Please try again.');
    } else {
      setTasks((current) => [...current, data as Task].sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime()));
      setDraft(emptyDraft);
      setIsModalOpen(false);
      setNotice('Task added to your workspace.');
    }
    setIsSaving(false);
  }

  async function updateStatus(task: Task) {
    const nextStatus: Status = task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'todo';
    if (!supabase) {
      setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: nextStatus } : item));
      if (selectedTask?.id === task.id) setSelectedTask({ ...task, status: nextStatus });
      return;
    }
    const { error } = await supabase.from('taskmate_tasks').update({ status: nextStatus }).eq('id', task.id);
    if (error) {
      setNotice('The task status could not be updated.');
      return;
    }
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: nextStatus } : item));
    if (selectedTask?.id === task.id) setSelectedTask({ ...task, status: nextStatus });
  }

  async function deleteTask(taskId: string) {
    if (!supabase) {
      setTasks((current) => current.filter((task) => task.id !== taskId));
      setSelectedTask(null);
      setNotice('Task removed from this session.');
      return;
    }
    const { error } = await supabase.from('taskmate_tasks').delete().eq('id', taskId);
    if (error) {
      setNotice('The task could not be removed.');
      return;
    }
    setTasks((current) => current.filter((task) => task.id !== taskId));
    setSelectedTask(null);
    setNotice('Task removed from your workspace.');
  }

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  }), [filter, searchQuery, tasks]);

  const completedCount = tasks.filter((task) => task.status === 'done').length;
  const activeCount = tasks.filter((task) => task.status !== 'done').length;
  const highPriorityCount = tasks.filter((task) => task.priority === 'high' && task.status !== 'done').length;
  const completionPercent = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${isMenuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-mark"><Target size={21} strokeWidth={2.4} /><span>TaskMate</span></div>
        <div className="workspace-switcher"><div className="workspace-avatar">AT</div><div><p>Alex Thompson</p><span>Personal workspace</span></div><ChevronDown size={15} /></div>
        <nav className="side-nav" aria-label="Main navigation">
          <button className="nav-item active"><LayoutDashboard size={18} /> Overview</button>
          <button className="nav-item" onClick={() => setFilter('all')}><ListTodo size={18} /> All tasks <span>{tasks.length}</span></button>
          <button className="nav-item" onClick={() => setFilter('done')}><CheckCircle2 size={18} /> Completed</button>
        </nav>
        <div className="side-section-label">Workspace</div>
        <nav className="side-nav">
          <button className="nav-item"><CalendarDays size={18} /> Calendar</button>
          <button className="nav-item"><Bell size={18} /> Reminders <span className="notification-dot" /></button>
          <button className="nav-item"><Settings size={18} /> Settings</button>
        </nav>
        <div className="sidebar-tip"><Sparkles size={16} /><div><strong>Stay on top</strong><p>Your highest priority task is due soon.</p></div></div>
        <div className="sidebar-footer"><div className="user-avatar">AT</div><div><strong>Alex Thompson</strong><span>Teacher account</span></div><button aria-label="Account menu"><ChevronDown size={15} /></button></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><button className="mobile-menu" onClick={() => setIsMenuOpen((open) => !open)} aria-label="Open menu"><Menu size={21} /></button><div className="breadcrumbs"><span>Workspace</span><span>/</span><strong>Overview</strong></div><div className="topbar-actions"><button className="icon-button" aria-label="Notifications"><Bell size={19} /><i /></button><div className="topbar-avatar">AT</div></div></header>
        <section className="page-content">
          <div className="welcome-row"><div><p className="eyebrow">Tuesday, September 8, 2026</p><h1>Good morning, Alex<span>.</span></h1><p className="welcome-copy">Here&apos;s what your day looks like. Let&apos;s make it count.</p></div><button className="primary-button" onClick={() => setIsModalOpen(true)}><Plus size={18} /> Add task</button></div>

          <div className="stat-grid">
            <div className="stat-card"><div className="stat-icon blue"><ListTodo size={19} /></div><div><span>Active tasks</span><strong>{activeCount}</strong><small><b>+2</b> from yesterday</small></div></div>
            <div className="stat-card"><div className="stat-icon green"><CheckCircle2 size={19} /></div><div><span>Completed</span><strong>{completedCount}</strong><small><b>{completionPercent}%</b> of all tasks</small></div></div>
            <div className="stat-card"><div className="stat-icon orange"><Flag size={19} /></div><div><span>High priority</span><strong>{highPriorityCount}</strong><small className="muted-small">Needs your attention</small></div></div>
            <div className="stat-card progress-card"><div className="stat-icon navy"><Target size={19} /></div><div className="progress-stat"><span>Weekly progress</span><strong>{completionPercent}%</strong><div className="progress-track"><div style={{ width: `${completionPercent}%` }} /></div><small>Keep going, you&apos;re doing great</small></div></div>
          </div>

          <section className="task-section"><div className="section-heading"><div><h2>Your tasks</h2><p>Everything you need to stay organised.</p></div><button className="secondary-button" onClick={() => setIsModalOpen(true)}><Plus size={17} /> New task</button></div>
            <div className="task-toolbar"><div className="filter-tabs">{(['all', 'todo', 'in_progress', 'done'] as Filter[]).map((item) => <button key={item} className={filter === item ? 'filter-tab active' : 'filter-tab'} onClick={() => setFilter(item)}>{item === 'all' ? 'All tasks' : item === 'todo' ? 'To do' : item === 'in_progress' ? 'In progress' : 'Completed'}<span>{item === 'all' ? tasks.length : tasks.filter((task) => task.status === item).length}</span></button>)}</div><label className="search-box"><Search size={17} /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search tasks..." /></label></div>
            <div className="task-list">{isLoading ? <div className="empty-state"><div className="spinner" /><p>Loading your workspace...</p></div> : filteredTasks.length === 0 ? <div className="empty-state"><Circle size={26} /><p>No tasks match this view.</p><button onClick={() => setIsModalOpen(true)}>Create a task</button></div> : filteredTasks.map((task) => <article className={`task-row ${task.status === 'done' ? 'task-complete' : ''}`} key={task.id} onClick={() => setSelectedTask(task)}><button className={`task-check ${task.status}`} aria-label={`Mark ${task.title} as ${task.status === 'done' ? 'to do' : 'done'}`} onClick={(event) => { event.stopPropagation(); void updateStatus(task); }}>{task.status === 'done' ? <Check size={14} /> : task.status === 'in_progress' ? <span /> : null}</button><div className="task-main"><h3>{task.title}</h3><div className="task-meta"><span className={`priority-pill ${priorityMeta[task.priority].className}`}><i className={priorityMeta[task.priority].dot} /> {priorityMeta[task.priority].label}</span><span className="meta-divider" /><span><Clock3 size={13} /> {formatDueDate(task.due_at)}</span><span className="due-label">{relativeDueDate(task.due_at)}</span></div></div><span className={`status-pill ${statusMeta[task.status].className}`}>{statusMeta[task.status].label}</span><button className="row-more" aria-label="Open task details" onClick={(event) => { event.stopPropagation(); setSelectedTask(task); }}>•••</button></article>)}</div>
          </section>
          <div className="bottom-note"><Sparkles size={16} /><span>{isSupabaseConfigured ? 'Smart reminders are on. We\'ll nudge you based on priority and deadline.' : 'Demo mode is active. Changes remain available until you refresh.'}</span><button>Manage reminders <ChevronDown size={14} /></button></div>
        </section>
      </main>

      {isModalOpen && <div className="modal-backdrop" onMouseDown={() => setIsModalOpen(false)}><div className="modal-card" onMouseDown={(event) => event.stopPropagation()}><div className="modal-header"><div><p className="eyebrow">New workspace item</p><h2>Add a task</h2><p>Capture the next thing you want to get done.</p></div><button className="close-button" onClick={() => setIsModalOpen(false)} aria-label="Close"><X size={19} /></button></div><form onSubmit={(event) => void addTask(event)}><label className="form-field full"><span>Task name</span><input autoFocus value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g. Review weekly lesson plans" required /></label><div className="form-grid"><label className="form-field"><span>Priority</span><select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as Priority })}><option value="high">High priority</option><option value="medium">Medium priority</option><option value="low">Low priority</option></select></label><label className="form-field"><span>Deadline</span><input type="datetime-local" value={draft.due_at} onChange={(event) => setDraft({ ...draft, due_at: event.target.value })} required /></label></div><label className="form-field full"><span>Reminder frequency</span><select value={draft.reminder_frequency} onChange={(event) => setDraft({ ...draft, reminder_frequency: event.target.value as Reminder })}><option>Once</option><option>Daily</option><option>Every 2 days</option><option>Weekly</option></select></label><div className="reminder-callout"><Bell size={17} /><div><strong>Smart scheduling enabled</strong><p>TaskMate will gently remind you based on the priority and deadline.</p></div></div><div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setIsModalOpen(false)}>Cancel</button><button type="submit" className="primary-button" disabled={isSaving}>{isSaving ? 'Saving...' : 'Add task'} <Plus size={17} /></button></div></form></div></div>}
      {selectedTask && <div className="modal-backdrop" onMouseDown={() => setSelectedTask(null)}><div className="detail-card" onMouseDown={(event) => event.stopPropagation()}><div className="detail-top"><span className={`priority-pill ${priorityMeta[selectedTask.priority].className}`}><i className={priorityMeta[selectedTask.priority].dot} /> {priorityMeta[selectedTask.priority].label} priority</span><button className="close-button" onClick={() => setSelectedTask(null)} aria-label="Close"><X size={19} /></button></div><h2>{selectedTask.title}</h2><p className="detail-description">Stay focused on the next small step. You can update progress whenever you make headway.</p><div className="detail-fields"><div><span>Deadline</span><strong><CalendarDays size={15} /> {formatDueDate(selectedTask.due_at)}</strong></div><div><span>Reminder</span><strong><Bell size={15} /> {selectedTask.reminder_frequency}</strong></div><div><span>Status</span><strong className={`status-pill ${statusMeta[selectedTask.status].className}`}>{statusMeta[selectedTask.status].label}</strong></div></div><div className="detail-actions"><button className="danger-button" onClick={() => void deleteTask(selectedTask.id)}><Trash2 size={16} /> Delete task</button><button className="primary-button" onClick={() => void updateStatus(selectedTask)}>{selectedTask.status === 'done' ? 'Reopen task' : 'Mark as done'} <Check size={17} /></button></div></div></div>}
      {notice && <div className="toast"><CheckCircle2 size={17} /> {notice}</div>}
    </div>
  );
}

export default App;
