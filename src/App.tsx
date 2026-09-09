import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Inbox,
  Plus,
  Sparkles,
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import type { Filter, Status, Task, TaskDraft } from './types/task';
import { demoTasks, emptyDraft } from './types/task';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { StatCards } from './components/StatCards';
import { TaskToolbar } from './components/TaskToolbar';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { Toast } from './components/Toast';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate(): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());
}

export function App() {
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
    const timer = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function loadTasks() {
    setIsLoading(true);
    if (!isSupabaseConfigured) {
      setTasks(
        demoTasks.map((task, index) => ({
          ...task,
          id: `demo-${index}`,
          created_at: new Date().toISOString(),
        }))
      );
      setNotice('Showing demo tasks while workspace data connects.');
      setIsLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('taskmate_tasks')
        .select('*')
        .order('due_at', { ascending: true });
      if (error) throw error;
      if (!data || data.length === 0) {
        const { data: seeded, error: seedError } = await supabase
          .from('taskmate_tasks')
          .insert(demoTasks)
          .select();
        if (seedError) throw seedError;
        setTasks((seeded ?? []) as Task[]);
      } else {
        setTasks(data as Task[]);
      }
    } catch {
      setTasks(
        demoTasks.map((task, index) => ({
          ...task,
          id: `demo-${index}`,
          created_at: new Date().toISOString(),
        }))
      );
      setNotice('Showing demo tasks while workspace data connects.');
    }
    setIsLoading(false);
  }

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    setIsSaving(true);
    if (!isSupabaseConfigured) {
      const localTask: Task = {
        ...draft,
        title: draft.title.trim(),
        status: 'todo',
        id: `demo-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      setTasks((current) =>
        [...current, localTask].sort(
          (a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
        )
      );
      setDraft(emptyDraft);
      setIsModalOpen(false);
      setNotice('Task added to this demo session.');
      setIsSaving(false);
      return;
    }
    const { data, error } = await supabase
      .from('taskmate_tasks')
      .insert({ ...draft, title: draft.title.trim(), status: 'todo' })
      .select()
      .maybeSingle();

    if (error || !data) {
      setNotice('That task could not be saved. Please try again.');
    } else {
      setTasks((current) =>
        [...current, data as Task].sort(
          (a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
        )
      );
      setDraft(emptyDraft);
      setIsModalOpen(false);
      setNotice('Task added to your workspace.');
    }
    setIsSaving(false);
  }

  async function updateStatus(task: Task) {
    const nextStatus: Status =
      task.status === 'todo'
        ? 'in_progress'
        : task.status === 'in_progress'
        ? 'done'
        : 'todo';

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('taskmate_tasks')
        .update({ status: nextStatus })
        .eq('id', task.id);
      if (error) {
        setNotice('The task status could not be updated.');
        return;
      }
    }
    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, status: nextStatus } : item))
    );
    if (selectedTask?.id === task.id) {
      setSelectedTask({ ...task, status: nextStatus });
    }
  }

  async function deleteTask(taskId: string) {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('taskmate_tasks')
        .delete()
        .eq('id', taskId);
      if (error) {
        setNotice('The task could not be removed.');
        return;
      }
    }
    setTasks((current) => current.filter((task) => task.id !== taskId));
    setSelectedTask(null);
    setNotice('Task removed from your workspace.');
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesFilter = filter === 'all' || task.status === filter;
      const matchesSearch = task.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery, tasks]);

  const completedCount = tasks.filter((task) => task.status === 'done').length;
  const activeCount = tasks.filter((task) => task.status !== 'done').length;
  const highPriorityCount = tasks.filter(
    (task) => task.priority === 'high' && task.status !== 'done'
  ).length;
  const completionPercent = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        filter={filter}
        setFilter={setFilter}
        totalTasks={tasks.length}
        completedTasks={completedCount}
        activeTasks={activeCount}
        onOpenNewTask={() => setIsModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          onOpenMobileMenu={() => setIsMenuOpen(true)}
          onOpenNewTask={() => setIsModalOpen(true)}
        />

        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto">
          {/* Welcome / Hero Banner */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
                {getFormattedDate()}
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
                {getGreeting()}, Alex<span className="text-indigo-600">.</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {activeCount === 0
                  ? 'All caught up! No pending tasks right now.'
                  : `You have ${activeCount} active ${
                      activeCount === 1 ? 'task' : 'tasks'
                    } to accomplish today. Let's make it count.`}
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold shadow-soft-sm hover:shadow-soft-md transition-all duration-150 flex-shrink-0"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Add Task</span>
            </button>
          </div>

          {/* Metric Cards */}
          <StatCards
            activeCount={activeCount}
            completedCount={completedCount}
            highPriorityCount={highPriorityCount}
            completionPercent={completionPercent}
            totalTasks={tasks.length}
          />

          {/* Task Management Panel */}
          <section className="bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs overflow-hidden">
            {/* Panel Header */}
            <div className="px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 tracking-tight">
                  Your Workspace Tasks
                </h2>
                <p className="text-xs text-slate-500">
                  Prioritize, filter, and track progress across your daily goals.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  <Plus size={14} strokeWidth={2.5} />
                  <span>New task</span>
                </button>
              </div>
            </div>

            {/* Task Toolbar (Filters & Search) */}
            <TaskToolbar
              filter={filter}
              setFilter={setFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              tasks={tasks}
            />

            {/* Task Items List */}
            <div className="divide-y divide-slate-100 min-h-[220px]">
              {isLoading ? (
                /* Shimmer loading skeleton */
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4 animate-pulse">
                      <div className="w-5 h-5 rounded-full bg-slate-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-1/3" />
                        <div className="h-3 bg-slate-100 rounded w-1/4" />
                      </div>
                      <div className="w-16 h-6 bg-slate-100 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : filteredTasks.length === 0 ? (
                /* Empty state */
                <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3">
                    <Inbox size={26} strokeWidth={1.75} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">
                    No tasks found
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mb-4">
                    {searchQuery
                      ? `No tasks match your search "${searchQuery}". Try a different keyword or reset filters.`
                      : filter !== 'all'
                      ? `No tasks currently in the "${filter.replace('_', ' ')}" status.`
                      : 'You do not have any tasks yet. Create your first task to get started.'}
                  </p>
                  <button
                    onClick={() => {
                      if (searchQuery) setSearchQuery('');
                      else if (filter !== 'all') setFilter('all');
                      else setIsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
                  >
                    {searchQuery || filter !== 'all' ? (
                      'Clear Filters'
                    ) : (
                      <>
                        <Plus size={14} strokeWidth={2.5} />
                        <span>Create Task</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdateStatus={updateStatus}
                    onSelectTask={setSelectedTask}
                    onDeleteTask={deleteTask}
                  />
                ))
              )}
            </div>

            {/* Bottom Summary Bar */}
            <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing <strong className="text-slate-800 font-semibold">{filteredTasks.length}</strong> of{' '}
                <strong className="text-slate-800 font-semibold">{tasks.length}</strong> total tasks
              </span>
              <span className="hidden sm:inline text-slate-400">
                Click any task row to view details or press checkmark to advance status
              </span>
            </div>
          </section>

          {/* Smart Scheduling Tip Callout */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-blue-50/80 border border-indigo-100/80 text-xs text-slate-600 shadow-soft-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} />
              </div>
              <p>
                <strong className="text-slate-800 font-semibold">Smart reminders are active.</strong>{' '}
                TaskMate prioritizes your workflow and nudges you ahead of deadlines.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 whitespace-nowrap self-start sm:self-auto"
            >
              Configure Reminders →
            </button>
          </div>
        </main>
      </div>

      {/* Modals & Popups */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        draft={draft}
        setDraft={setDraft}
        onSubmit={addTask}
        isSaving={isSaving}
      />

      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateStatus={updateStatus}
        onDeleteTask={deleteTask}
      />

      <Toast message={notice} onClose={() => setNotice('')} />
    </div>
  );
}

export default App;
