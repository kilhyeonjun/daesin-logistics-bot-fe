'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useRecentSearches, type SearchFrequency } from '@/hooks/useRecentSearches';
import type { SearchType, RecentSearch } from '@/types/api';

const SEARCH_TYPE_LABELS: Record<SearchType, string> = {
  code: '노선코드',
  name: '노선명',
  car: '차량번호',
};

interface SearchAutocompleteProps {
  value: string;
  searchType: SearchType;
  onChange: (value: string) => void;
  onSelect?: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function SearchAutocomplete({
  value,
  searchType,
  onChange,
  onSelect,
  placeholder = '검색어 입력',
  autoFocus = false,
  className,
}: SearchAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { 
    getSearchesByType, 
    getPopularSearches, 
    removeSearch 
  } = useRecentSearches();

  const recentSearches = getSearchesByType(searchType).slice(0, 5);
  const popularSearches = getPopularSearches(searchType, 5);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = useCallback((newValue: string) => {
    onChange(newValue);
    if (!open) setOpen(true);
  }, [onChange, open]);

  const handleSelect = useCallback((query: string) => {
    onChange(query);
    onSelect?.(query);
    setOpen(false);
    inputRef.current?.blur();
  }, [onChange, onSelect]);

  const handleRemoveRecent = useCallback((e: React.MouseEvent, search: RecentSearch) => {
    e.stopPropagation();
    removeSearch(search.type, search.query);
  }, [removeSearch]);

  const handleClear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  const handleFocus = useCallback(() => {
    setOpen(true);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === 'Enter' && value) {
      handleSelect(value);
    }
  }, [value, handleSelect]);

  const filteredRecent = value
    ? recentSearches.filter((s) => 
        s.query.toLowerCase().includes(value.toLowerCase())
      )
    : recentSearches;

  const filteredPopular = value
    ? popularSearches.filter((s) => 
        s.query.toLowerCase().includes(value.toLowerCase())
      )
    : popularSearches;

  const showDropdown = open && (filteredRecent.length > 0 || filteredPopular.length > 0 || !value);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Command shouldFilter={false} className="overflow-visible bg-transparent">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
          <CommandInput
            ref={inputRef}
            value={value}
            onValueChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={cn(
              'flex h-11 w-full rounded-xl border border-input bg-card pl-10 pr-10',
              'text-base placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
              'transition-shadow duration-200',
              '[&_[data-slot=command-input-wrapper]]:border-0',
              '[&_[data-slot=command-input-wrapper]]:px-0',
              '[&_[data-slot=command-input-wrapper]_svg]:hidden'
            )}
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 text-muted-foreground hover:text-foreground touch-feedback rounded-full z-10"
              aria-label="검색어 지우기"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {showDropdown && (
          <CommandList className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border bg-popover shadow-lg">
            <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">
              {value ? `"${value}" 검색 결과가 없습니다` : '검색어를 입력하세요'}
            </CommandEmpty>

            {filteredRecent.length > 0 && (
              <CommandGroup heading="최근 검색">
                {filteredRecent.map((search) => (
                  <CommandItem
                    key={`${search.type}-${search.query}-${search.timestamp}`}
                    value={search.query}
                    onSelect={() => handleSelect(search.query)}
                    className="flex items-center justify-between gap-2 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <HighlightedText text={search.query} highlight={value} />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveRecent(e, search)}
                      className="p-1 text-muted-foreground hover:text-foreground rounded-sm shrink-0"
                      aria-label="삭제"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {filteredPopular.length > 0 && filteredPopular.some((p) => p.count > 1) && (
              <CommandGroup heading="자주 검색">
                {filteredPopular
                  .filter((p) => p.count > 1)
                  .map((search) => (
                    <CommandItem
                      key={`popular-${search.type}-${search.query}`}
                      value={`popular-${search.query}`}
                      onSelect={() => handleSelect(search.query)}
                      className="flex items-center gap-2 px-3 py-2.5"
                    >
                      <TrendingUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <HighlightedText text={search.query} highlight={value} />
                      <span className="ml-auto text-xs text-muted-foreground">
                        {search.count}회
                      </span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}

            {!value && (
              <div className="px-3 py-2 text-xs text-muted-foreground border-t">
                {SEARCH_TYPE_LABELS[searchType]}(으)로 검색
              </div>
            )}
          </CommandList>
        )}
      </Command>
    </div>
  );
}

function HighlightedText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight) {
    return <span className="truncate">{text}</span>;
  }

  const parts = text.split(new RegExp(`(${escapeRegExp(highlight)})`, 'gi'));

  return (
    <span className="truncate">
      {parts.map((part, i) => (
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-accent/30 text-foreground rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      ))}
    </span>
  );
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
