'use client';

import { Label, SearchField } from '@heroui/react';
import { forwardRef, type ChangeEvent, type InputHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, value = '', onClear, onChange, placeholder, ...props }, ref) => (
    <SearchField
      fullWidth
      value={String(value)}
      onChange={(nextValue: string) => {
        onChange?.({ target: { value: nextValue } } as ChangeEvent<HTMLInputElement>);
      }}
      onClear={onClear}
    >
      <Label className="sr-only">노선 검색</Label>
      <SearchField.Group className="min-h-12 rounded-[10px] border border-input bg-white">
        <SearchField.SearchIcon />
        <SearchField.Input
          ref={ref}
          className={cn('min-h-12 w-full text-base', className)}
          placeholder={placeholder}
          {...props}
        />
        {onClear && <SearchField.ClearButton aria-label="검색어 지우기" />}
      </SearchField.Group>
    </SearchField>
  )
);

SearchBar.displayName = 'SearchBar';
