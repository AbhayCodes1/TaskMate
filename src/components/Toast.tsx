import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3.5 bg-slate-900 text-white rounded-2xl shadow-soft-xl border border-slate-800/80 animate-slide-up max-w-sm">
      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
        <CheckCircle2 size={15} />
      </div>
      <p className="text-sm font-medium text-slate-100 leading-snug flex-1">{message}</p>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition flex-shrink-0"
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>
    </div>
  );
};
