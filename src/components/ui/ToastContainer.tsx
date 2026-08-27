import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '../../stores/useToastStore';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/format';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#34C759] shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#FF9F0A] shrink-0" />,
    error: <XCircle className="w-5 h-5 text-[#FF3B30] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#0071E3] shrink-0" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-3.5 bg-white/90 dark:bg-[#2C2C2E]/90 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-[16px] shadow-lg text-sm text-[#1D1D1F] dark:text-[#F5F5F7]'
            )}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0 pr-1">
              <p className="font-semibold text-xs leading-snug">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-[#6E6E73] dark:text-[#98989D] mt-0.5 leading-normal">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
