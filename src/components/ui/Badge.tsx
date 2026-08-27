import React from 'react';
import { cn } from '../../utils/format';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'error' | 'coffee' | 'blue';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className,
  dot = false
}) => {
  const variantStyles = {
    neutral: 'bg-black/[0.05] text-[#1D1D1F] dark:bg-white/[0.1] dark:text-[#F5F5F7]',
    success: 'bg-[#34C759]/15 text-[#248A3D] dark:bg-[#34C759]/20 dark:text-[#30D158]',
    warning: 'bg-[#FF9F0A]/15 text-[#C97B00] dark:bg-[#FF9F0A]/20 dark:text-[#FF9F0A]',
    error: 'bg-[#FF3B30]/15 text-[#D70015] dark:bg-[#FF3B30]/20 dark:text-[#FF453A]',
    coffee: 'bg-[#8B6F5A]/15 text-[#6B5342] dark:bg-[#8B6F5A]/25 dark:text-[#D4BBA5]',
    blue: 'bg-[#0071E3]/15 text-[#0071E3] dark:bg-[#0071E3]/25 dark:text-[#409CFF]'
  };

  const dotColors = {
    neutral: 'bg-neutral-500',
    success: 'bg-[#34C759]',
    warning: 'bg-[#FF9F0A]',
    error: 'bg-[#FF3B30]',
    coffee: 'bg-[#8B6F5A]',
    blue: 'bg-[#0071E3]'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-[6px] font-medium gap-1',
    md: 'text-xs px-2.5 py-1 rounded-[8px] font-medium gap-1.5'
  };

  return (
    <span className={cn('inline-flex items-center select-none font-medium', sizeStyles[size], variantStyles[variant], className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
};
