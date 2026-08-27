import React, { forwardRef } from 'react';
import { cn } from '../../utils/format';
import { sound } from '../../utils/audio';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'tonal' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  badge?: number | string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, className, variant = 'ghost', size = 'md', badge, onClick, disabled, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled) {
        sound.playClick();
        if (onClick) onClick(e);
      }
    };

    const sizeStyles = {
      sm: 'w-8 h-8 rounded-[8px] text-xs',
      md: 'w-10 h-10 rounded-[10px] text-sm',
      lg: 'w-12 h-12 rounded-[14px] text-base'
    };

    const variantStyles = {
      primary: 'bg-[#1D1D1F] text-white hover:bg-[#2C2C2E] dark:bg-[#F5F5F7] dark:text-[#1D1D1F]',
      secondary: 'bg-black/[0.05] text-[#1D1D1F] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:text-[#F5F5F7] dark:hover:bg-white/[0.12]',
      ghost: 'bg-transparent text-[#1D1D1F] hover:bg-black/[0.05] dark:text-[#F5F5F7] dark:hover:bg-white/[0.08]',
      tonal: 'bg-[#8B6F5A] text-white hover:bg-[#795F4C]',
      outline: 'border border-black/10 text-[#1D1D1F] hover:bg-black/[0.03] dark:border-white/15 dark:text-[#F5F5F7]',
      destructive: 'bg-[#FF3B30] text-white hover:bg-[#E03126]'
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          'relative inline-flex items-center justify-center transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6F5A]/40',
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
        {badge !== undefined && (
          <span className="absolute -top-1 -right-1 bg-[#FF3B30] text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center shadow-sm">
            {badge}
          </span>
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
