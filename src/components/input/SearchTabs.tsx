'use client';

import { Tabs } from '@heroui/react';
import type { Key } from 'react';

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
    <Tabs
      className="w-full"
      selectedKey={value}
      onSelectionChange={(key: Key) => onChange(key as SearchType)}
    >
      <Tabs.ListContainer>
        <Tabs.List
          aria-label="검색 기준"
          className="grid min-h-12 w-full grid-cols-3 rounded-[10px] border border-border bg-secondary p-1"
        >
          {tabOptions.map((tab) => (
            <Tabs.Tab
              key={tab.value}
              id={tab.value}
              className="min-h-11 rounded-lg px-3 text-sm font-bold text-muted-foreground data-[selected=true]:bg-white data-[selected=true]:text-[#075f52]"
            >
              {tab.label}
              <Tabs.Indicator />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  );
}
