import React, { forwardRef } from 'react';
import { cn } from '../../utils/format';
import { sound } from '../../utils/audio';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tonal' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      onClick,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !isLoading) {
        sound.playClick();
        if (onClick) onClick(e);
      }
    };

    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] select-none disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6F5A]/40';

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 rounded-[8px] gap-1.5 h-8',
      md: 'text-sm px-4 py-2.5 rounded-[12px] gap-2 h-10',
      lg: 'text-base px-5 py-3 rounded-[14px] gap-2.5 h-12',
      xl: 'text-base px-6 py-4 rounded-[16px] gap-3 h-14 font-semibold'
    };

    const variantStyles = {
      primary:
        'bg-[#1D1D1F] text-white hover:bg-[#2C2C2E] active:bg-[#000000] dark:bg-[#F5F5F7] dark:text-[#1D1D1F] dark:hover:bg-[#FFFFFF] shadow-sm',
      secondary:
        'bg-black/[0.04] text-[#1D1D1F] hover:bg-black/[0.07] active:bg-black/[0.10] dark:bg-white/[0.08] dark:text-[#F5F5F7] dark:hover:bg-white/[0.12] dark:active:bg-white/[0.16]',
      tonal:
        'bg-[#8B6F5A] text-white hover:bg-[#795F4C] active:bg-[#684F3D] shadow-sm',
      outline:
        'bg-transparent border border-black/10 text-[#1D1D1F] hover:bg-black/[0.03] dark:border-white/15 dark:text-[#F5F5F7] dark:hover:bg-white/[0.05]',
      ghost:
        'bg-transparent text-[#1D1D1F] hover:bg-black/[0.04] active:bg-black/[0.08] dark:text-[#F5F5F7] dark:hover:bg-white/[0.06]',
      destructive:
        'bg-[#FF3B30] text-white hover:bg-[#E03126] active:bg-[#C92920] shadow-sm'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        onClick={handleClick}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
