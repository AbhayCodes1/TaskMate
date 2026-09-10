import { useMemo, useEffect, useRef } from 'react';
import type { Task } from '../types/task';
import type { Achievement, AchievementId } from '../types/achievement';
import { ACHIEVEMENT_DEFINITIONS } from '../types/achievement';

const STREAK_KEY = 'taskmate_streak';
const UNLOCKED_KEY = 'taskmate_unlocked_achievements';

interface StreakData {
  count: number;
  lastDate: string; // YYYY-MM-DD
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function loadStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) return JSON.parse(raw) as StreakData;
  } catch { /* ignore */ }
  return { count: 0, lastDate: '' };
}

function loadUnlockedDates(): Record<AchievementId, string> {
  try {
    const raw = localStorage.getItem(UNLOCKED_KEY);
    if (raw) return JSON.parse(raw) as Record<AchievementId, string>;
  } catch { /* ignore */ }
  return {} as Record<AchievementId, string>;
}

function saveUnlockedDates(data: Record<AchievementId, string>) {
  try {
    localStorage.setItem(UNLOCKED_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

function saveStreak(data: StreakData) {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export function useAchievements(tasks: Task[]): {
  achievements: Achievement[];
  points: number;
  streak: number;
  newlyUnlocked: Achievement[];
} {
  const unlockedDatesRef = useRef(loadUnlockedDates());
  const streakDataRef = useRef(loadStreak());

  // Compute streak based on completed tasks
  const streak = useMemo(() => {
    const today = getToday();
    const completedDates = tasks
      .filter((t) => t.status === 'done' && t.completed_at)
      .map((t) => t.completed_at!.split('T')[0])
      .filter(Boolean);

    const uniqueDates = [...new Set(completedDates)].sort().reverse();
    if (uniqueDates.length === 0) return 0;

    let currentStreak = 0;
    const checkDate = new Date(today);

    for (let i = 0; i < 30; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (uniqueDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // Today has no completion — check if yesterday does (ongoing streak)
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterday = checkDate.toISOString().split('T')[0];
        if (!uniqueDates.includes(yesterday)) break;
      } else {
        break;
      }
    }

    // Update persistent streak
    const stored = streakDataRef.current;
    if (stored.lastDate !== today && currentStreak > stored.count) {
      const newData = { count: currentStreak, lastDate: today };
      streakDataRef.current = newData;
      saveStreak(newData);
    }

    return currentStreak;
  }, [tasks]);

  const achievements = useMemo<Achievement[]>(() => {
    const completedTasks = tasks.filter((t) => t.status === 'done');
    const completedCount = completedTasks.length;
    const highPriorityDone = completedTasks.filter((t) => t.priority === 'high').length;

    // Early finisher: completed before due date
    const earlyFinisher = completedTasks.some((t) => {
      const due = new Date(t.due_at).getTime();
      const completedTime = t.completed_at ? new Date(t.completed_at).getTime() : Date.now();
      return completedTime < due;
    });

    // Speed runner: 3+ completed tasks on same day
    const completionsByDate: Record<string, number> = {};
    completedTasks.forEach((t) => {
      const date = (t.completed_at ?? t.created_at).split('T')[0];
      completionsByDate[date] = (completionsByDate[date] ?? 0) + 1;
    });
    const speedRunner = Object.values(completionsByDate).some((count) => count >= 3);

    const unlockedDates = unlockedDatesRef.current;
    const now = new Date().toISOString();

    function isUnlocked(id: AchievementId): boolean {
      if (unlockedDates[id]) return true;
      let unlocked = false;
      switch (id) {
        case 'early_finisher': unlocked = earlyFinisher; break;
        case 'streak_3':       unlocked = streak >= 3;    break;
        case 'streak_7':       unlocked = streak >= 7;    break;
        case 'tasks_10':       unlocked = completedCount >= 10; break;
        case 'tasks_25':       unlocked = completedCount >= 25; break;
        case 'tasks_50':       unlocked = completedCount >= 50; break;
        case 'priority_pro':   unlocked = highPriorityDone >= 5; break;
        case 'speed_runner':   unlocked = speedRunner; break;
      }
      if (unlocked) {
        unlockedDates[id] = now;
      }
      return unlocked;
    }

    function getProgress(id: AchievementId): { progress: number; label: string } {
      switch (id) {
        case 'early_finisher': return { progress: earlyFinisher ? 100 : 0, label: earlyFinisher ? 'Unlocked!' : 'Complete a task before its deadline' };
        case 'streak_3':       return { progress: Math.min(100, (streak / 3) * 100),  label: `${streak}/3 days` };
        case 'streak_7':       return { progress: Math.min(100, (streak / 7) * 100),  label: `${streak}/7 days` };
        case 'tasks_10':       return { progress: Math.min(100, (completedCount / 10) * 100), label: `${completedCount}/10 tasks` };
        case 'tasks_25':       return { progress: Math.min(100, (completedCount / 25) * 100), label: `${completedCount}/25 tasks` };
        case 'tasks_50':       return { progress: Math.min(100, (completedCount / 50) * 100), label: `${completedCount}/50 tasks` };
        case 'priority_pro':   return { progress: Math.min(100, (highPriorityDone / 5) * 100), label: `${highPriorityDone}/5 high-priority` };
        case 'speed_runner':   return { progress: speedRunner ? 100 : 0, label: speedRunner ? 'Unlocked!' : 'Complete 3 tasks in one day' };
        default:               return { progress: 0, label: '' };
      }
    }

    return ACHIEVEMENT_DEFINITIONS.map((def) => {
      const unlocked = isUnlocked(def.id);
      const { progress, label } = getProgress(def.id);
      return {
        ...def,
        unlocked,
        unlockedAt: unlockedDates[def.id] ?? null,
        progress,
        progressLabel: label,
      };
    });
  }, [tasks, streak]);

  // Persist newly unlocked achievements
  useEffect(() => {
    saveUnlockedDates(unlockedDatesRef.current);
  }, [achievements]);

  const points = useMemo(
    () => achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.points, 0),
    [achievements]
  );

  // Newly unlocked = unlocked in this session (unlockedAt in last 10 seconds)
  const newlyUnlocked = useMemo(() => {
    const cutoff = Date.now() - 10_000;
    return achievements.filter(
      (a) => a.unlocked && a.unlockedAt && new Date(a.unlockedAt).getTime() > cutoff
    );
  }, [achievements]);

  return { achievements, points, streak, newlyUnlocked };
}
