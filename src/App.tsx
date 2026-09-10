import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Inbox,
  Plus,
  Sparkles,
  Trophy,
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
import { AchievementBanner } from './components/AchievementBanner';
import { AchievementsPanel } from './components/AchievementsPanel';
import { useLists } from './hooks/useLists';
import { useAchievements } from './hooks/useAchievements';

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
  // ─── Core task state ───────────────────────────────────────────────────────
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

  // ─── Lists / Category state ────────────────────────────────────────────────
  const { lists, addList } = useLists();
  const [activeListId, setActiveListId] = useState<string | null>(null);

  // ─── Achievement state ─────────────────────────────────────────────────────
  const { achievements, points, streak, newlyUnlocked } = useAchievements(tasks);
  const [shownAchievementIds, setShownAchievementIds] = useState<Set<string>>(new Set());
  const [currentBannerAchievement, setCurrentBannerAchievement] = useState<(typeof achievements)[0] | null>(null);
  const [isAchievementsPanelOpen, setIsAchievementsPanelOpen] = useState(false);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  // ─── Toast auto-dismiss ────────────────────────────────────────────────────
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  // ─── Show achievement banner when newly unlocked ───────────────────────────
  useEffect(() => {
    const toShow = newlyUnlocked.find((a) => !shownAchievementIds.has(a.id));
    if (toShow && !currentBannerAchievement) {
      setCurrentBannerAchievement(toShow);
      setShownAchievementIds((prev) => new Set([...prev, toShow.id]));
    }
  }, [newlyUnlocked, shownAchievementIds, currentBannerAchievement]);

  // ─── Data loading ──────────────────────────────────────────────────────────
  useEffect(() => {
    void loadTasks();
  }, []);

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
        // Seed with demo data (without list_id — not in schema yet)
        const seedData = demoTasks.map(({ list_id: _listId, ...rest }) => rest);
        const { data: seeded, error: seedError } = await supabase
          .from('taskmate_tasks')
          .insert(seedData)
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

  // ─── Add task ──────────────────────────────────────────────────────────────
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

    // NOTE: list_id is omitted from Supabase insert — schema does not have that column yet.
    // When backend schema is updated, add list_id back to this insert.
    const { list_id: _listId, ...supabasePayload } = draft;
    const { data, error } = await supabase
      .from('taskmate_tasks')
      .insert({ ...supabasePayload, title: supabasePayload.title.trim(), status: 'todo' })
      .select()
      .maybeSingle();

    if (error || !data) {
      setNotice('That task could not be saved. Please try again.');
    } else {
      // Re-attach the list_id in local state even though it's not persisted to Supabase
      const newTask: Task = { ...(data as Task), list_id: draft.list_id };
      setTasks((current) =>
        [...current, newTask].sort(
          (a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
        )
      );
      setDraft(emptyDraft);
      setIsModalOpen(false);
      setNotice('Task added to your workspace.');
    }
    setIsSaving(false);
  }

  // ─── Update status ─────────────────────────────────────────────────────────
  async function updateStatus(task: Task) {
    const nextStatus: Status =
      task.status === 'todo'
        ? 'in_progress'
        : task.status === 'in_progress'
        ? 'done'
        : 'todo';

    // Optimistic update first
    const updatedTask: Task = {
      ...task,
      status: nextStatus,
      completed_at: nextStatus === 'done' ? new Date().toISOString() : null,
    };

    setTasks((current) =>
      current.map((item) => (item.id === task.id ? updatedTask : item))
    );
    if (selectedTask?.id === task.id) {
      setSelectedTask(updatedTask);
    }

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('taskmate_tasks')
        .update({ status: nextStatus })
        .eq('id', task.id);
      if (error) {
        // Revert on error
        setTasks((current) =>
          current.map((item) => (item.id === task.id ? task : item))
        );
        setNotice('The task status could not be updated.');
      }
    }
  }

  // ─── Delete task ───────────────────────────────────────────────────────────
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

  // ─── Filtered tasks ────────────────────────────────────────────────────────
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesFilter = filter === 'all' || task.status === filter;
      const matchesSearch = task.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesList = activeListId === null || task.list_id === activeListId;
      return matchesFilter && matchesSearch && matchesList;
    });
  }, [filter, searchQuery, tasks, activeListId]);

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const completedCount = tasks.filter((task) => task.status === 'done').length;
  const activeCount = tasks.filter((task) => task.status !== 'done').length;
  const highPriorityCount = tasks.filter(
    (task) => task.priority === 'high' && task.status !== 'done'
  ).length;
  const completionPercent = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  // Derive active list info for header
  const activeList = activeListId ? lists.find((l) => l.id === activeListId) : null;

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
        lists={lists}
        tasks={tasks}
        activeListId={activeListId}
        setActiveListId={setActiveListId}
        onAddList={addList}
        points={points}
        streak={streak}
        unlockedAchievementsCount={unlockedCount}
        onOpenAchievements={() => setIsAchievementsPanelOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          onOpenMobileMenu={() => setIsMenuOpen(true)}
        />

        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-5xl w-full mx-auto">

          {/* Welcome / Hero Banner */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-1.5">
                {getFormattedDate()}
              </p>
              <h1 className="text-2xl sm:text-[28px] font-extrabold font-display text-slate-900 tracking-tight leading-tight mb-1">
                {getGreeting()}, Alex
                <span className="text-indigo-600">.</span>
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                {activeList
                  ? `Viewing tasks in ${activeList.icon} ${activeList.name}`
                  : activeCount === 0
                  ? 'All caught up! No pending tasks right now. 🎉'
                  : `You have ${activeCount} active ${activeCount === 1 ? 'task' : 'tasks'} — let's make it count.`}
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              {/* Achievement quick glance */}
              {unlockedCount > 0 && (
                <button
                  onClick={() => setIsAchievementsPanelOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-700 text-xs font-bold transition group"
                >
                  <Trophy size={14} className="group-hover:scale-110 transition-transform" />
                  <span>{points} pts</span>
                  {streak > 0 && <span className="text-amber-600">• 🔥{streak}d</span>}
                </button>
              )}

              {/* Primary CTA */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold shadow-soft-sm hover:shadow-glow-indigo transition-all duration-150 active:scale-95 flex-shrink-0"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <StatCards
            activeCount={activeCount}
            completedCount={completedCount}
            highPriorityCount={highPriorityCount}
            completionPercent={completionPercent}
            totalTasks={tasks.length}
            points={points}
            streak={streak}
          />

          {/* Task Management Panel */}
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-xs overflow-hidden">
            {/* Panel Header */}
            <div className="px-5 py-4 sm:px-6 sm:py-4 flex items-center justify-between gap-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold font-display text-slate-900 tracking-tight flex items-center gap-2">
                  {activeList ? (
                    <>
                      <span>{activeList.icon}</span>
                      <span>{activeList.name}</span>
                    </>
                  ) : (
                    'Your Tasks'
                  )}
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold tnum">
                    {filteredTasks.length}
                  </span>
                </h2>
                {!activeList && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Prioritize, filter, and track progress across your goals.
                  </p>
                )}
              </div>
              {/* No duplicate Add Task button here — removed per plan */}
            </div>

            {/* Task Toolbar (Filters & Search & Category Pills) */}
            <TaskToolbar
              filter={filter}
              setFilter={setFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              tasks={tasks}
              lists={lists}
              activeListId={activeListId}
              setActiveListId={setActiveListId}
            />

            {/* Task Items List */}
            <div className="divide-y divide-slate-50 min-h-[200px]">
              {isLoading ? (
                /* Shimmer loading skeleton */
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4 animate-pulse">
                      <div className="w-5 h-5 rounded-full bg-slate-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded-lg shimmer-bg animate-shimmer w-2/5" />
                        <div className="h-3 bg-slate-100 rounded-lg shimmer-bg animate-shimmer w-1/3" />
                      </div>
                      <div className="w-20 h-6 bg-slate-100 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : filteredTasks.length === 0 ? (
                /* Empty state */
                <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-400 flex items-center justify-center mb-4">
                    <Inbox size={26} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">
                    No tasks found
                  </h3>
                  <p className="text-sm text-slate-500 max-w-xs mb-5 leading-relaxed">
                    {searchQuery
                      ? `No tasks match "${searchQuery}". Try a different keyword or clear filters.`
                      : activeListId
                      ? `No tasks in this list yet. Add one to get started.`
                      : filter !== 'all'
                      ? `No tasks in the "${filter.replace('_', ' ')}" status yet.`
                      : 'You have no tasks yet. Create your first task to get started.'}
                  </p>
                  <button
                    onClick={() => {
                      if (searchQuery) setSearchQuery('');
                      else if (filter !== 'all') setFilter('all');
                      else if (activeListId) setActiveListId(null);
                      else setIsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-soft-xs transition active:scale-95"
                  >
                    {searchQuery || filter !== 'all' || activeListId ? (
                      'Clear Filters'
                    ) : (
                      <>
                        <Plus size={15} strokeWidth={2.5} />
                        <span>Create Task</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                filteredTasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdateStatus={updateStatus}
                    onSelectTask={setSelectedTask}
                    onDeleteTask={deleteTask}
                    animationDelay={index * 35}
                  />
                ))
              )}
            </div>

            {/* Bottom Summary Bar */}
            <div className="px-5 py-3 bg-slate-50/40 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing{' '}
                <strong className="text-slate-700 font-bold">{filteredTasks.length}</strong>{' '}
                of{' '}
                <strong className="text-slate-700 font-bold">{tasks.length}</strong>{' '}
                tasks
              </span>
              <span className="hidden sm:inline text-slate-400">
                Click a task to view details · Click ○ to advance status
              </span>
            </div>
          </section>

          {/* Achievements Strip (if any unlocked) */}
          {unlockedCount > 0 && (
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-50/80 via-white to-orange-50/80 border border-amber-100/80 shadow-soft-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Trophy size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {unlockedCount} Achievement{unlockedCount !== 1 ? 's' : ''} unlocked · ⭐ {points} points
                    {streak > 0 && ` · 🔥 ${streak}-day streak`}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Keep completing tasks to unlock more rewards.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAchievementsPanelOpen(true)}
                className="text-sm font-semibold text-amber-600 hover:text-amber-800 whitespace-nowrap self-start sm:self-auto transition"
              >
                View all →
              </button>
            </div>
          )}

          {/* Smart Scheduling Tip */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/70 border border-indigo-100/70 text-xs text-slate-600 shadow-soft-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <Sparkles size={15} />
              </div>
              <p className="text-sm text-slate-600">
                <strong className="text-slate-800 font-semibold">Smart reminders are active.</strong>{' '}
                TaskMate prioritizes your workflow and nudges you ahead of deadlines.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 whitespace-nowrap self-start sm:self-auto transition"
            >
              Add Task →
            </button>
          </div>
        </main>
      </div>

      {/* Mobile FAB — single Add Task button on mobile */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden z-40 flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg animate-fab-pulse transition-all active:scale-95"
        aria-label="Add new task"
      >
        <Plus size={18} strokeWidth={2.5} />
        <span>Add Task</span>
      </button>

      {/* Modals & Popups */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        draft={draft}
        setDraft={setDraft}
        onSubmit={addTask}
        isSaving={isSaving}
        lists={lists}
      />

      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateStatus={updateStatus}
        onDeleteTask={deleteTask}
      />

      <AchievementsPanel
        achievements={achievements}
        points={points}
        streak={streak}
        isOpen={isAchievementsPanelOpen}
        onClose={() => setIsAchievementsPanelOpen(false)}
      />

      {currentBannerAchievement && (
        <AchievementBanner
          achievement={currentBannerAchievement}
          onClose={() => setCurrentBannerAchievement(null)}
        />
      )}

      <Toast message={notice} onClose={() => setNotice('')} />
    </div>
  );
}

export default App;
