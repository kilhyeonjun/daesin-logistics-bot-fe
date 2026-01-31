'use client';

import { ArrowUpDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type SortOption = 'relevance' | 'latest' | 'fare-high' | 'fare-low' | 'count';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: '관련성' },
  { value: 'latest', label: '최신순' },
  { value: 'fare-high', label: '운임 높은순' },
  { value: 'fare-low', label: '운임 낮은순' },
  { value: 'count', label: '건수순' },
];

export type HomeSortOption = 'fare-high' | 'fare-low' | 'count';

const HOME_SORT_OPTIONS: { value: HomeSortOption; label: string }[] = [
  { value: 'fare-high', label: '운임 높은순' },
  { value: 'fare-low', label: '운임 낮은순' },
  { value: 'count', label: '건수순' },
];

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  disabled?: boolean;
}

export function SortSelect({ value, onChange, disabled = false }: SortSelectProps) {
  return (
    <Select value={value} onValueChange={onChange as (value: string) => void} disabled={disabled}>
      <SelectTrigger className="w-[130px] h-9 text-sm">
        <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface HomeSortSelectProps {
  value: HomeSortOption;
  onChange: (value: HomeSortOption) => void;
  disabled?: boolean;
}

export function HomeSortSelect({ value, onChange, disabled = false }: HomeSortSelectProps) {
  return (
    <Select value={value} onValueChange={onChange as (value: string) => void} disabled={disabled}>
      <SelectTrigger className="w-[120px] h-8 text-xs">
        <ArrowUpDown className="h-3 w-3 mr-1 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {HOME_SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
