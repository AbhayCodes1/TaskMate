// ─── Achievement Types & Definitions ────────────────────────────────────────

export type AchievementId =
  | 'early_finisher'
  | 'streak_3'
  | 'streak_7'
  | 'tasks_10'
  | 'tasks_25'
  | 'tasks_50'
  | 'priority_pro'
  | 'speed_runner';

export type Achievement = {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;        // emoji
  color: string;       // tailwind accent color key
  unlocked: boolean;
  unlockedAt: string | null;
  progress: number;    // 0-100 for display
  progressLabel: string;
  rarity: 'common' | 'rare' | 'legendary';
  points: number;
};

export type AchievementDefinition = {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  color: string;
  rarity: 'common' | 'rare' | 'legendary';
  points: number;
};

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'early_finisher',
    title: 'Early Finisher',
    description: 'Completed a task before its deadline.',
    icon: '⭐',
    color: 'amber',
    rarity: 'common',
    points: 15,
  },
  {
    id: 'streak_3',
    title: '3-Day Streak',
    description: 'Completed tasks consistently for 3 days.',
    icon: '🔥',
    color: 'orange',
    rarity: 'common',
    points: 25,
  },
  {
    id: 'streak_7',
    title: '7-Day Streak',
    description: 'Maintained a 7-day task completion streak.',
    icon: '🔥',
    color: 'rose',
    rarity: 'rare',
    points: 75,
  },
  {
    id: 'tasks_10',
    title: 'Getting Things Done',
    description: 'Completed 10 tasks total.',
    icon: '🏅',
    color: 'blue',
    rarity: 'common',
    points: 30,
  },
  {
    id: 'tasks_25',
    title: 'Momentum Builder',
    description: 'Completed 25 tasks total.',
    icon: '🚀',
    color: 'violet',
    rarity: 'rare',
    points: 75,
  },
  {
    id: 'tasks_50',
    title: 'Productivity Master',
    description: 'Completed 50 tasks. You are a legend.',
    icon: '🏆',
    color: 'indigo',
    rarity: 'legendary',
    points: 200,
  },
  {
    id: 'priority_pro',
    title: 'Priority Pro',
    description: 'Completed 5 high-priority tasks.',
    icon: '🎯',
    color: 'rose',
    rarity: 'rare',
    points: 50,
  },
  {
    id: 'speed_runner',
    title: 'Speed Runner',
    description: 'Completed 3 or more tasks in a single day.',
    icon: '⚡',
    color: 'emerald',
    rarity: 'rare',
    points: 50,
  },
];

export const RARITY_LABELS: Record<string, string> = {
  common: 'Common',
  rare: 'Rare',
  legendary: 'Legendary',
};

export const RARITY_COLORS: Record<string, string> = {
  common: 'text-slate-500 bg-slate-100',
  rare: 'text-violet-600 bg-violet-50',
  legendary: 'text-amber-600 bg-amber-50',
};
