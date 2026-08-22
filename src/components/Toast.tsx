import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  tipo: 'sucesso' | 'erro' | 'info';
  mensagem: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        onDismiss(toasts[0].id);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
            toast.tipo === 'sucesso'
              ? 'bg-emerald-900/90 text-emerald-100 border-emerald-700/50'
              : toast.tipo === 'erro'
              ? 'bg-rose-900/90 text-rose-100 border-rose-700/50'
              : 'bg-slate-900/90 text-slate-100 border-slate-700/50'
          }`}
        >
          <div className="flex items-center gap-3">
            {toast.tipo === 'sucesso' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.tipo === 'erro' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toast.tipo === 'info' && <Info className="w-5 h-5 text-teal-400 shrink-0" />}
            <span className="text-xs font-semibold">{toast.mensagem}</span>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
