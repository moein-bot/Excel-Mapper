import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

interface ToastProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
};

const colors = {
  success: 'border-success/30 bg-success-dim text-success',
  error: 'border-error/30 bg-error-dim text-error',
  warning: 'border-warning/30 bg-yellow-900/20 text-warning',
};

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: () => void }) {
  const Icon = icons[toast.type];

  useEffect(() => {
    const t = setTimeout(onRemove, 4000);
    return () => clearTimeout(t);
  }, [onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm ${colors[toast.type]}`}
    >
      <Icon size={18} />
      <span className="text-sm font-medium flex-1">{toast.message}</span>
      <button onClick={onRemove} className="opacity-60 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </motion.div>
  );
}

export default function ToastContainer({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={() => onRemove(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}
