import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/format';
import { sound } from '../../utils/audio';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
  showCloseButton?: boolean;
  className?: string;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  showCloseButton = true,
  className,
  footer
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-[92vw]'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'relative w-full bg-[#FFFFFF] dark:bg-[#1C1C1E] rounded-[24px] shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden z-10 my-auto flex flex-col max-h-[90vh]',
              maxWidthStyles[maxWidth],
              className
            )}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
                <div>
                  {title && (
                    <h3 className="text-xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-xs text-[#6E6E73] dark:text-[#98989D] mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onClose();
                    }}
                    className="w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] flex items-center justify-center text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
