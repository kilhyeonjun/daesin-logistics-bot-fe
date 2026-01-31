'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, value, onClear, ...props }, ref) => {
    const hasValue = value && String(value).length > 0;

    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={ref}
          type="text"
          value={value}
          className={cn(
            'flex h-11 w-full rounded-xl border border-input bg-card pl-10 pr-10',
            'text-base placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
            'transition-shadow duration-200',
            className
          )}
          {...props}
        />
        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 text-muted-foreground hover:text-foreground touch-feedback rounded-full"
            aria-label="검색어 지우기"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
