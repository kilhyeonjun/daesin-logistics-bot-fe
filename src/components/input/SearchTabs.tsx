'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SearchType } from '@/types/api';

interface SearchTabsProps {
  value: SearchType;
  onChange: (type: SearchType) => void;
}

const tabOptions: { value: SearchType; label: string }[] = [
  { value: 'code', label: '노선코드' },
  { value: 'name', label: '노선명' },
  { value: 'car', label: '차량번호' },
];

export function SearchTabs({ value, onChange }: SearchTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as SearchType)}>
      <TabsList className="w-full grid grid-cols-3">
        {tabOptions.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="text-sm"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
