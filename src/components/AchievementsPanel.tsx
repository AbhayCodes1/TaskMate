import React from 'react';
import { Lock, X } from 'lucide-react';
import type { Achievement } from '../types/achievement';
import { RARITY_LABELS, RARITY_COLORS } from '../types/achievement';

interface AchievementsPanelProps {
  achievements: Achievement[];
  points: number;
  streak: number;
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsPanel: React.FC<AchievementsPanelProps> = ({
  achievements,
  points,
  streak,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

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
        <div className="px-6 pt-6 pb-5 border-b border-slate-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900 mb-1">
                🏆 Achievements
              </h2>
              <p className="text-sm text-slate-500">
                {unlockedCount} of {achievements.length} unlocked
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
              aria-label="Close achievements"
            >
              <X size={18} />
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 text-center">
              <p className="text-xl font-bold text-amber-700 tnum">⭐ {points}</p>
              <p className="text-xs text-amber-600 font-medium mt-0.5">Total Points</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 border border-orange-100 text-center">
              <p className="text-xl font-bold text-orange-700">{streak > 0 ? `🔥 ${streak}` : '—'}</p>
              <p className="text-xs text-orange-600 font-medium mt-0.5">Day Streak</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100 text-center">
              <p className="text-xl font-bold text-indigo-700">{unlockedCount}/{achievements.length}</p>
              <p className="text-xs text-indigo-600 font-medium mt-0.5">Unlocked</p>
            </div>
          </div>
        </div>

        {/* Achievement List */}
        <div className="overflow-y-auto max-h-[60vh] divide-y divide-slate-50 p-4 space-y-2">
          {achievements.map((achievement) => {
            const rarityColor = RARITY_COLORS[achievement.rarity];
            return (
              <div
                key={achievement.id}
                className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all duration-200 ${
                  achievement.unlocked
                    ? 'bg-white border-slate-200/80 hover:border-indigo-200 hover:shadow-soft-xs'
                    : 'bg-slate-50/60 border-slate-100 opacity-70'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100'
                      : 'bg-slate-100 grayscale'
                  }`}
                >
                  {achievement.unlocked ? achievement.icon : <Lock size={16} className="text-slate-400" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h3 className={`text-sm font-bold leading-snug ${achievement.unlocked ? 'text-slate-900' : 'text-slate-500'}`}>
                      {achievement.title}
                    </h3>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${rarityColor}`}>
                      {RARITY_LABELS[achievement.rarity]}
                    </span>
                    {achievement.unlocked && (
                      <span className="text-xs font-bold text-amber-600 ml-auto">
                        +{achievement.points} pts
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-2">
                    {achievement.description}
                  </p>

                  {/* Progress bar */}
                  {!achievement.unlocked && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">{achievement.progressLabel}</span>
                        <span className="text-xs font-semibold text-slate-500">{Math.round(achievement.progress)}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-1.5 bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full progress-animated"
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {achievement.unlocked && achievement.unlockedAt && (
                    <p className="text-xs text-emerald-600 font-medium">
                      ✓ Unlocked {new Date(achievement.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 text-center">
          <p className="text-xs text-slate-400">
            Complete tasks to earn points and unlock achievements. Keep up the momentum! 🚀
          </p>
        </div>
      </div>
    </div>
  );
};
