import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Achievement } from '../types/achievement';
import { RARITY_LABELS, RARITY_COLORS } from '../types/achievement';

interface AchievementBannerProps {
  achievement: Achievement;
  onClose: () => void;
}

export const AchievementBanner: React.FC<AchievementBannerProps> = ({
  achievement,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slight delay so the mount animation plays cleanly
    const showTimer = setTimeout(() => setIsVisible(true), 50);
    const autoClose = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(autoClose);
    };
  }, [onClose]);

  function handleClose() {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }

  const rarityColor = RARITY_COLORS[achievement.rarity];

  return (
    <div
      className={`fixed bottom-20 right-4 sm:bottom-8 sm:right-6 z-50 w-80 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0 translate-x-0' : 'opacity-0 translate-y-4 translate-x-4'
      }`}
    >
      <div className="relative bg-white rounded-2xl border border-amber-200/80 shadow-soft-xl overflow-hidden animate-achievement-glow">
        {/* Gradient top bar */}
        <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />

        {/* Content */}
        <div className="px-4 py-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/70 flex items-center justify-center flex-shrink-0 text-2xl shadow-inner">
              {achievement.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  Achievement Unlocked!
                </p>
              </div>
              <h3 className="text-[15px] font-bold text-slate-900 leading-snug mb-1">
                {achievement.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-2">
                {achievement.description}
              </p>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rarityColor}`}>
                  {RARITY_LABELS[achievement.rarity]}
                </span>
                <span className="text-xs text-amber-600 font-bold">
                  +{achievement.points} pts
                </span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition flex-shrink-0"
              aria-label="Dismiss achievement"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Auto-dismiss progress bar */}
        <div className="h-0.5 bg-slate-100">
          <div
            className="h-0.5 bg-gradient-to-r from-amber-400 to-orange-400"
            style={{
              animation: 'progressDismiss 5s linear forwards',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes progressDismiss {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};
