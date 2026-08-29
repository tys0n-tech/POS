import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { sound } from '../../utils/audio';
import { cn } from '../../utils/format';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface SelectProps<T extends string = string> {
  label?: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function Select<T extends string = string>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select option...',
  disabled = false,
  className,
  triggerClassName,
  menuClassName,
  icon: LeftIcon
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    sound.playClick();
    setIsOpen(!isOpen);
  };

  const handleSelect = (optionValue: T) => {
    sound.playClick();
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative w-full select-none', className)} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D] mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-[12px] bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs transition-all duration-200 focus:outline-none',
          isOpen
            ? 'border-[#8B6F5A] ring-2 ring-[#8B6F5A]/20 dark:border-[#D4BBA5] dark:ring-[#D4BBA5]/20'
            : 'hover:border-black/20 dark:hover:border-white/20',
          disabled && 'opacity-50 cursor-not-allowed bg-black/[0.02] dark:bg-white/[0.02]',
          triggerClassName
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {LeftIcon && <LeftIcon className="w-4 h-4 text-[#8B6F5A] dark:text-[#D4BBA5] shrink-0" />}
          {selectedOption?.icon && (
            <selectedOption.icon className="w-4 h-4 text-[#8B6F5A] dark:text-[#D4BBA5] shrink-0" />
          )}
          <span className={cn('truncate', !selectedOption && 'text-[#6E6E73] dark:text-[#98989D]')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="shrink-0 text-[#6E6E73] dark:text-[#98989D]"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Floating Popup Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute left-0 right-0 top-full mt-1.5 z-50 p-1.5 bg-[#FFFFFF]/95 dark:bg-[#2C2C2E]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-[16px] shadow-2xl max-h-60 overflow-y-auto space-y-0.5',
              menuClassName
            )}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              const OptionIcon = option.icon;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 px-3 py-2 rounded-[10px] text-xs font-medium transition-all text-left group',
                    isSelected
                      ? 'bg-[#8B6F5A]/10 text-[#8B6F5A] dark:text-[#D4BBA5] font-semibold'
                      : 'text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.04] dark:hover:bg-white/[0.08]'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {OptionIcon && (
                      <OptionIcon
                        className={cn(
                          'w-4 h-4 shrink-0 transition-colors',
                          isSelected
                            ? 'text-[#8B6F5A] dark:text-[#D4BBA5]'
                            : 'text-[#6E6E73] dark:text-[#98989D] group-hover:text-[#1D1D1F] dark:group-hover:text-white'
                        )}
                      />
                    )}
                    <div className="min-w-0">
                      <p className="truncate">{option.label}</p>
                      {option.description && (
                        <p className="text-[10px] text-[#6E6E73] dark:text-[#98989D] truncate font-normal">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#8B6F5A] dark:text-[#D4BBA5] shrink-0" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
