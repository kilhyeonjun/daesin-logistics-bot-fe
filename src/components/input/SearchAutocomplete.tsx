'use client';

import { Label, SearchField } from '@heroui/react';
import { Clock, TrendingUp, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useRecentSearches } from '@/hooks/useRecentSearches';
import { cn } from '@/lib/utils';
import type { RecentSearch, SearchType } from '@/types/api';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const { getSearchesByType, getPopularSearches, removeSearch } = useRecentSearches();

  const recentSearches = getSearchesByType(searchType)
    .filter((item) => item.query.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 5);
  const popularSearches = getPopularSearches(searchType, 5)
    .filter((item) => item.count > 1 && item.query.toLowerCase().includes(value.toLowerCase()));

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const handleSelect = useCallback((query: string) => {
    onChange(query);
    onSelect?.(query);
    setOpen(false);
  }, [onChange, onSelect]);

  const handleRemove = useCallback((search: RecentSearch) => {
    removeSearch(search.type, search.query);
  }, [removeSearch]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <SearchField
        fullWidth
        name="route-search"
        value={value}
        onChange={onChange}
        onClear={() => onChange('')}
        onSubmit={handleSelect}
      >
        <Label className="sr-only">{SEARCH_TYPE_LABELS[searchType]} 검색</Label>
        <SearchField.Group className="min-h-12 rounded-[10px] border border-input bg-white">
          <SearchField.SearchIcon />
          <SearchField.Input
            autoFocus={autoFocus}
            className="min-h-12 w-full text-base"
            placeholder={placeholder}
            onFocus={() => setOpen(true)}
          />
          <SearchField.ClearButton aria-label="검색어 지우기" />
        </SearchField.Group>
      </SearchField>

      {open && (recentSearches.length > 0 || popularSearches.length > 0) && (
        <div
          className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-white shadow-[0_18px_48px_rgba(23,32,51,.16)]"
          aria-label="검색 기록"
        >
          {recentSearches.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-bold text-muted-foreground">최근 검색</p>
              {recentSearches.map((search) => (
                <div key={`${search.type}-${search.query}-${search.timestamp}`} className="flex items-center">
                  <button
                    type="button"
                    className="flex min-h-11 flex-1 items-center gap-2 rounded-lg px-2 text-left text-sm hover:bg-secondary"
                    onClick={() => handleSelect(search.query)}
                  >
                    <Clock aria-hidden="true" className="size-4 text-muted-foreground" />
                    <span className="truncate">{search.query}</span>
                  </button>
                  <button
                    type="button"
                    className="flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                    aria-label={`${search.query} 검색 기록 삭제`}
                    onClick={() => handleRemove(search)}
                  >
                    <X aria-hidden="true" className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {popularSearches.length > 0 && (
            <div className="border-t border-border p-2">
              <p className="px-2 py-1 text-xs font-bold text-muted-foreground">자주 검색</p>
              {popularSearches.map((search) => (
                <button
                  key={`${search.type}-${search.query}`}
                  type="button"
                  className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left text-sm hover:bg-secondary"
                  onClick={() => handleSelect(search.query)}
                >
                  <TrendingUp aria-hidden="true" className="size-4 text-muted-foreground" />
                  <span className="truncate">{search.query}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{search.count}회</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
