import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface NotificationToastProps {
  message: string;
  subMessage?: string;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  subMessage,
  onClose,
}) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full bg-slate-900 text-white rounded-xl p-4 shadow-xl border border-slate-800 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200">
      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-5 h-5" />
      </div>
      <div className="flex-1 text-xs">
        <div className="font-semibold text-sm text-white">{message}</div>
        {subMessage && <div className="text-slate-300 mt-0.5 leading-relaxed">{subMessage}</div>}
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white p-1 rounded-lg"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
