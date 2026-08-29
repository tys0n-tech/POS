import React from 'react';
import { motion } from 'framer-motion';
import { sound } from '../../utils/audio';
import { cn } from '../../utils/format';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string | React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  layoutId = 'segmented-control-active',
  size = 'md',
  fullWidth = false,
  className
}: SegmentedControlProps<T>) {
  const sizeClasses = {
    sm: 'p-0.5 gap-0.5 rounded-[10px]',
    md: 'p-1 gap-1 rounded-[12px]',
    lg: 'p-1.5 gap-1.5 rounded-[14px]'
  };

  const itemSizeClasses = {
    sm: 'px-2 py-1 text-[11px] rounded-[8px]',
    md: 'px-3.5 py-1.5 text-xs rounded-[9px]',
    lg: 'px-4 py-2 text-sm rounded-[10px]'
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center bg-black/[0.05] dark:bg-white/[0.08] backdrop-blur-md select-none',
        sizeClasses[size],
        fullWidth && 'w-full flex',
        className
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              if (!isSelected) {
                sound.playClick();
                onChange(option.value);
              }
            }}
            className={cn(
              'relative z-10 flex items-center justify-center gap-1.5 font-semibold transition-colors duration-150 whitespace-nowrap',
              itemSizeClasses[size],
              fullWidth && 'flex-1',
              isSelected
                ? 'text-[#1D1D1F] dark:text-[#F5F5F7]'
                : 'text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white'
            )}
          >
            {/* Sliding Pill Active Background */}
            {isSelected && (
              <motion.div
                layoutId={layoutId}
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 35,
                  mass: 0.8
                }}
                className="absolute inset-0 bg-[#FFFFFF] dark:bg-[#2C2C2E] rounded-[inherit] shadow-xs dark:shadow-sm"
              />
            )}

            <span className="relative z-10 flex items-center justify-center gap-1.5 whitespace-nowrap">
              {Icon && <Icon className="w-3 h-3 shrink-0" />}
              <span className="whitespace-nowrap">{option.label}</span>
              {option.badge !== undefined && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 text-[10px] font-bold rounded-full transition-colors whitespace-nowrap',
                    isSelected
                      ? 'bg-black/[0.08] dark:bg-white/[0.12] text-[#1D1D1F] dark:text-white'
                      : 'bg-black/[0.05] dark:bg-white/[0.08] text-[#6E6E73] dark:text-[#98989D]'
                  )}
                >
                  {option.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
