import React from 'react';
import { cn } from '../../utils/format';

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-black/[0.06] dark:bg-white/[0.08] rounded-[10px]',
        className
      )}
    />
  );
};
