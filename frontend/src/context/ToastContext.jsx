import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;

  const typeStyles = {
    success: 'border-mint bg-forest-light text-forest',
    error: 'border-coral bg-red-50 text-coral',
    info: 'border-sky bg-blue-50 text-sky',
    warning: 'border-marigold bg-yellow-50 text-ink',
  };

  const iconMap = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-warm-md animate-slide-up
            min-w-[280px] max-w-[360px] ${typeStyles[t.type] || typeStyles.info}`}
        >
          <span className="font-bold text-base">{iconMap[t.type]}</span>
          <span className="text-sm font-medium flex-1">{t.message}</span>
          <button
            onClick={() => onRemove(t.id)}
            className="ml-auto text-current opacity-50 hover:opacity-100 transition-opacity text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
