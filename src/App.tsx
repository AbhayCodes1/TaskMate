import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Inbox,
  Plus,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import type { Filter, Reminder, Status, Task, TaskDraft } from './types/task';
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

type AppView = 'overview' | 'calendar' | 'reminders' | 'settings' | 'achievements';

type AppSettings = {
  theme: 'light' | 'dark' | 'system';
  density: 'comfortable' | 'compact';
  remindersEnabled: boolean;
  deadlineNotifications: boolean;
  defaultPriority: 'low' | 'medium' | 'high';
  defaultReminderFrequency: Reminder;
  showCompletedTasks: boolean;
  enableAnimations: boolean;
};

const defaultSettings: AppSettings = {
  theme: 'light',
  density: 'comfortable',
  remindersEnabled: true,
  deadlineNotifications: true,
  defaultPriority: 'medium',
  defaultReminderFrequency: 'Daily',
  showCompletedTasks: true,
  enableAnimations: true,
};

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<AppView>('overview');
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

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

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = settings.theme === 'system' ? (prefersDark ? 'dark' : 'light') : settings.theme;
    document.documentElement.style.colorScheme = theme;
  }, [settings.theme]);

  useEffect(() => {
    const savedSettings = window.localStorage.getItem('taskmate-settings');
    if (!savedSettings) return;

    try {
      const parsed = JSON.parse(savedSettings) as Partial<AppSettings>;
      setSettings({ ...defaultSettings, ...parsed });
    } catch {
      // Ignore malformed local settings and keep defaults.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('taskmate-settings', JSON.stringify(settings));
  }, [settings]);

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
  const isDarkTheme = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const openNewTask = () => {
    setDraft({
      ...emptyDraft,
      priority: settings.defaultPriority,
      reminder_frequency: settings.defaultReminderFrequency,
    });
    setIsModalOpen(true);
    navigateToView('overview');
  };

  const reminderBuckets = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrow = new Date(todayStart.getTime() + 86400000);

    const isDueToday = (task: Task) => {
      const due = new Date(task.due_at);
      return task.status !== 'done' && due >= todayStart && due < tomorrow;
    };

    const isDueSoon = (task: Task) => {
      const due = new Date(task.due_at);
      const diffDays = (due.getTime() - todayStart.getTime()) / 86400000;
      return task.status !== 'done' && diffDays >= 1 && diffDays <= 3;
    };

    const dueToday = tasks.filter(isDueToday);
    const dueSoon = tasks.filter(isDueSoon);
    const overdue = tasks.filter((task) => task.status !== 'done' && new Date(task.due_at) < todayStart);
    const upcoming = tasks.filter((task) => task.status !== 'done' && new Date(task.due_at) >= tomorrow);

    return { dueToday, dueSoon, overdue, upcoming };
  }, [tasks]);

  const navigateToView = (view: AppView) => {
    setActiveView(view);
    if (view !== 'achievements') {
      setIsAchievementsPanelOpen(false);
    }
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const taskSummaryCards = useMemo(() => {
    const cards = [
      { title: 'Due today', value: reminderBuckets.dueToday.length },
      { title: 'Due soon', value: reminderBuckets.dueSoon.length },
      { title: 'Overdue', value: reminderBuckets.overdue.length },
      { title: 'Upcoming', value: reminderBuckets.upcoming.length },
    ];
    return cards;
  }, [reminderBuckets]);

  return (
    <div className={`flex min-h-screen ${isDarkTheme ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      {/* Sidebar Navigation */}
      <Sidebar
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        filter={filter}
        setFilter={setFilter}
        totalTasks={tasks.length}
        completedTasks={completedCount}
        activeTasks={activeCount}
        onOpenNewTask={openNewTask}
        lists={lists}
        tasks={tasks}
        activeListId={activeListId}
        setActiveListId={setActiveListId}
        onAddList={addList}
        points={points}
        streak={streak}
        unlockedAchievementsCount={unlockedCount}
        onOpenAchievements={() => {
          setIsAchievementsPanelOpen(false);
          navigateToView('achievements');
        }}
        onOpenSettings={() => {
          navigateToView('settings');
        }}
        activeView={activeView}
        onSelectView={navigateToView}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          onOpenMobileMenu={() => setIsMenuOpen(true)}
          tasks={tasks}
          onOpenSettings={() => {
            navigateToView('settings');
          }}
        />

        <main className={`flex-1 w-full max-w-5xl mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 ${settings.enableAnimations ? '' : 'reduced-motion'}`}>

          {activeView === 'reminders' ? (
            <div className={`rounded-3xl border ${isDarkTheme ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-white'} p-5 shadow-soft-xs`}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">Reminders</p>
                  <h2 className={`mt-1 text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Your upcoming focus</h2>
                </div>
                <div className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                  {tasks.filter((task) => task.status !== 'done').length} active
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                {taskSummaryCards.map((card) => (
                  <div key={card.title} className={`rounded-2xl border p-3 ${isDarkTheme ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                    <p className={`text-xs uppercase tracking-[0.2em] ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>{card.title}</p>
                    <p className={`mt-2 text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{card.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-5">
                {[
                  { key: 'dueToday', label: 'Due today', tasks: reminderBuckets.dueToday },
                  { key: 'dueSoon', label: 'Due soon', tasks: reminderBuckets.dueSoon },
                  { key: 'overdue', label: 'Overdue', tasks: reminderBuckets.overdue },
                  { key: 'upcoming', label: 'Upcoming reminders', tasks: reminderBuckets.upcoming },
                ].map((group) => (
                  <div key={group.key}>
                    <h3 className={`mb-3 text-sm font-bold uppercase tracking-[0.18em] ${isDarkTheme ? 'text-slate-300' : 'text-slate-500'}`}>{group.label}</h3>
                    {group.tasks.length === 0 ? (
                      <div className={`rounded-2xl border border-dashed p-6 text-center text-sm ${isDarkTheme ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                        No upcoming reminders in this group.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {group.tasks.slice(0, 4).map((task) => (
                          <div key={task.id} className={`rounded-2xl border p-3.5 ${isDarkTheme ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-slate-50'}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className={`text-sm font-semibold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{task.title}</p>
                                <p className={`mt-1 text-xs ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {new Date(task.due_at).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                </p>
                              </div>
                              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${task.priority === 'high' ? 'border-rose-200 bg-rose-50 text-rose-700' : task.priority === 'medium' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                                {task.priority}
                              </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                              <span className={`${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>Reminder: {task.reminder_frequency}</span>
                              <span className={`rounded-full px-2 py-0.5 font-medium ${task.status === 'done' ? 'bg-emerald-100 text-emerald-700' : task.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>
                                {task.status === 'done' ? 'Done' : task.status === 'in_progress' ? 'In progress' : 'Active'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : activeView === 'calendar' ? (
            <div className={`rounded-3xl border ${isDarkTheme ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-white'} p-5 shadow-soft-xs`}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">Calendar</p>
              <h2 className={`mt-1 text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Upcoming timeline</h2>
              <div className="mt-5 space-y-3">
                {tasks
                  .filter((task) => task.status !== 'done')
                  .slice(0, 6)
                  .map((task) => (
                    <div key={task.id} className={`flex items-center justify-between rounded-2xl border p-3 ${isDarkTheme ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-slate-50'}`}>
                      <div>
                        <p className={`text-sm font-semibold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{task.title}</p>
                        <p className={`mt-1 text-xs ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                          {new Date(task.due_at).toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' })}
                        </p>
                      </div>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${task.priority === 'high' ? 'border-rose-200 bg-rose-50 text-rose-700' : task.priority === 'medium' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ) : activeView === 'settings' ? (
            <div className={`rounded-3xl border ${isDarkTheme ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-white'} p-5 shadow-soft-xs`}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">Settings</p>
              <h2 className={`mt-1 text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Workspace preferences</h2>
              <div className="mt-5 space-y-5">
                <section className={`rounded-2xl border p-4 ${isDarkTheme ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-slate-50'}`}>
                  <h3 className={`text-sm font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Appearance</h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <label className="text-sm text-slate-600">
                      <span className="mb-1.5 block font-medium">Theme</span>
                      <select value={settings.theme} onChange={(event) => updateSetting('theme', event.target.value as AppSettings['theme'])} className={`w-full rounded-xl border px-3 py-2.5 ${isDarkTheme ? 'border-slate-600 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800'}`}>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                      </select>
                    </label>
                    <label className="text-sm text-slate-600">
                      <span className="mb-1.5 block font-medium">Task density</span>
                      <select value={settings.density} onChange={(event) => updateSetting('density', event.target.value as AppSettings['density'])} className={`w-full rounded-xl border px-3 py-2.5 ${isDarkTheme ? 'border-slate-600 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800'}`}>
                        <option value="comfortable">Comfortable</option>
                        <option value="compact">Compact</option>
                      </select>
                    </label>
                  </div>
                </section>

                <section className={`rounded-2xl border p-4 ${isDarkTheme ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-slate-50'}`}>
                  <h3 className={`text-sm font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Notifications</h3>
                  <div className="mt-3 space-y-3">
                    <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                      <span className="text-slate-700">Task reminders</span>
                      <input type="checkbox" checked={settings.remindersEnabled} onChange={(event) => updateSetting('remindersEnabled', event.target.checked)} className="h-4 w-4 text-indigo-600" />
                    </label>
                    <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                      <span className="text-slate-700">Deadline notifications</span>
                      <input type="checkbox" checked={settings.deadlineNotifications} onChange={(event) => updateSetting('deadlineNotifications', event.target.checked)} className="h-4 w-4 text-indigo-600" />
                    </label>
                  </div>
                </section>

                <section className={`rounded-2xl border p-4 ${isDarkTheme ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-slate-50'}`}>
                  <h3 className={`text-sm font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Task preferences</h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <label className="text-sm text-slate-600">
                      <span className="mb-1.5 block font-medium">Default priority</span>
                      <select value={settings.defaultPriority} onChange={(event) => updateSetting('defaultPriority', event.target.value as AppSettings['defaultPriority'])} className={`w-full rounded-xl border px-3 py-2.5 ${isDarkTheme ? 'border-slate-600 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800'}`}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </label>
                    <label className="text-sm text-slate-600">
                      <span className="mb-1.5 block font-medium">Default reminder frequency</span>
                      <select value={settings.defaultReminderFrequency} onChange={(event) => updateSetting('defaultReminderFrequency', event.target.value as AppSettings['defaultReminderFrequency'])} className={`w-full rounded-xl border px-3 py-2.5 ${isDarkTheme ? 'border-slate-600 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800'}`}>
                        {['Once', 'Daily', 'Every 2 days', 'Weekly'].map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </section>

                <section className={`rounded-2xl border p-4 ${isDarkTheme ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-slate-50'}`}>
                  <h3 className={`text-sm font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Interface</h3>
                  <div className="mt-3 space-y-3">
                    <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                      <span className="text-slate-700">Show completed tasks</span>
                      <input type="checkbox" checked={settings.showCompletedTasks} onChange={(event) => updateSetting('showCompletedTasks', event.target.checked)} className="h-4 w-4 text-indigo-600" />
                    </label>
                    <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                      <span className="text-slate-700">Animations</span>
                      <input type="checkbox" checked={settings.enableAnimations} onChange={(event) => updateSetting('enableAnimations', event.target.checked)} className="h-4 w-4 text-indigo-600" />
                    </label>
                  </div>
                </section>
              </div>
            </div>
          ) : activeView === 'achievements' ? (
            <div className={`rounded-3xl border ${isDarkTheme ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-white'} p-5 shadow-soft-xs`}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">Achievements</p>
              <h2 className={`mt-1 text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Your progress</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`rounded-2xl border p-4 ${achievement.unlocked
                      ? isDarkTheme
                        ? 'border-amber-500/40 bg-amber-500/10'
                        : 'border-amber-200 bg-amber-50'
                      : isDarkTheme
                        ? 'border-slate-700 bg-slate-800/60'
                        : 'border-slate-200 bg-slate-50'
                      }`}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${achievement.unlocked ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'}`}>
                        {achievement.unlocked ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>
                    <p className={`text-sm font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{achievement.title}</p>
                    <p className={`mt-1 text-xs leading-relaxed ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                      {achievement.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Welcome / Hero Banner */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-1.5">
                    {getFormattedDate()}
                  </p>
                  <h1 className={`text-2xl sm:text-[28px] font-extrabold font-display tracking-tight leading-tight mb-1 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                    {getGreeting()}, Alex
                    <span className="text-indigo-600">.</span>
                  </h1>
                  <p className={`text-sm ${isDarkTheme ? 'text-slate-300' : 'text-slate-500'} leading-relaxed`}>
                    {activeList
                      ? `Viewing tasks in ${activeList.icon} ${activeList.name}`
                      : activeCount === 0
                        ? 'All caught up! No pending tasks right now. 🎉'
                        : `You have ${activeCount} active ${activeCount === 1 ? 'task' : 'tasks'} — let's make it count.`}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-shrink-0">
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

                  <button
                    onClick={openNewTask}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold shadow-soft-sm hover:shadow-glow-indigo transition-all duration-150 active:scale-95 flex-shrink-0"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>Add Task</span>
                  </button>
                </div>
              </div>

              <StatCards
                activeCount={activeCount}
                completedCount={completedCount}
                highPriorityCount={highPriorityCount}
                completionPercent={completionPercent}
                totalTasks={tasks.length}
                points={points}
                streak={streak}
              />

              <section className={`${isDarkTheme ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200/80'} mb-6 overflow-hidden rounded-2xl border shadow-soft-xs`}>
                {/* Panel Header */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
                  <div className="min-w-0 flex-1">
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
                <div className={`divide-y min-h-[200px] ${isDarkTheme ? 'divide-slate-700' : 'divide-slate-50'}`}>
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
                <div className={`px-5 py-3 border-t flex items-center justify-between text-xs ${isDarkTheme ? 'bg-slate-900/60 border-slate-700 text-slate-400' : 'bg-slate-50/40 border-slate-100 text-slate-500'}`}>
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
              </div>
            </>
          )}
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
