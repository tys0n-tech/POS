import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/format';
import { Search, X } from 'lucide-react';

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  shortcutHint?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, shortcutHint = '/', placeholder = 'Search...', className, ...props }, ref) => {
    return (
      <div className={cn('relative flex items-center w-full', className)}>
        <Search className="absolute left-3.5 w-4 h-4 text-[#6E6E73] dark:text-[#98989D] pointer-events-none" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.06] dark:hover:bg-white/[0.12] focus:bg-[#FFFFFF] dark:focus:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-medium rounded-[12px] border border-transparent focus:border-[#8B6F5A]/40 pl-10 pr-12 py-2 transition-all duration-150 placeholder:text-[#6E6E73] dark:placeholder:text-[#98989D] focus:outline-none focus:ring-2 focus:ring-[#8B6F5A]/15"
          {...props}
        />
        {value ? (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 w-4 h-4 rounded-full bg-black/10 dark:bg-white/15 flex items-center justify-center text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
        ) : shortcutHint ? (
          <div className="absolute right-3 px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px] font-mono text-[#6E6E73] dark:text-[#98989D] pointer-events-none">
            {shortcutHint}
          </div>
        ) : null}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
