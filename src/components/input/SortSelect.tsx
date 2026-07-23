'use client';

import { Label, ListBox, Select } from '@heroui/react';
import type { Key } from 'react';

export type SortOption = 'relevance' | 'latest' | 'fare-high' | 'fare-low' | 'count';
export type HomeSortOption = 'fare-high' | 'fare-low' | 'count';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: '관련성' },
  { value: 'latest', label: '최신순' },
  { value: 'fare-high', label: '운임 높은순' },
  { value: 'fare-low', label: '운임 낮은순' },
  { value: 'count', label: '건수순' },
];

const HOME_SORT_OPTIONS: { value: HomeSortOption; label: string }[] = [
  { value: 'fare-high', label: '운임 높은순' },
  { value: 'fare-low', label: '운임 낮은순' },
  { value: 'count', label: '건수순' },
];

interface SortControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  options: { value: T; label: string }[];
  label: string;
}

function SortControl<T extends string>({
  value,
  onChange,
  disabled = false,
  options,
  label,
}: SortControlProps<T>) {
  return (
    <Select
      className="w-full sm:w-[168px]"
      isDisabled={disabled}
      value={value}
      onChange={(key: Key | Key[] | null) => key && !Array.isArray(key) && onChange(key as T)}
    >
      <Label className="sr-only">{label}</Label>
      <Select.Trigger className="min-h-11 rounded-[10px] border border-border bg-white px-3 text-sm font-bold">
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {options.map((option) => (
            <ListBox.Item key={option.value} id={option.value} textValue={option.label}>
              {option.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

export function SortSelect({
  value,
  onChange,
  disabled,
}: Omit<SortControlProps<SortOption>, 'options' | 'label'>) {
  return (
    <SortControl
      value={value}
      onChange={onChange}
      disabled={disabled}
      options={SORT_OPTIONS}
      label="검색 결과 정렬"
    />
  );
}

export function HomeSortSelect({
  value,
  onChange,
  disabled,
}: Omit<SortControlProps<HomeSortOption>, 'options' | 'label'>) {
  return (
    <SortControl
      value={value}
      onChange={onChange}
      disabled={disabled}
      options={HOME_SORT_OPTIONS}
      label="배차현황 정렬"
    />
  );
}
