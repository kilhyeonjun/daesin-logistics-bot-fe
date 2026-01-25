'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, Route, Package, Hash, Banknote, Clock, X } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { StatCard } from '@/components/data-display';
import { SearchBar } from '@/components/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useStats } from '@/hooks';
import { useCountUp } from '@/hooks';
import type { RecentSearch } from '@/types/api';

function getTodayDateString(): string {
  return format(new Date(), 'yyyyMMdd');
}

function formatCurrency(value: number): string {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(1)}억`;
  }
  if (value >= 10000) {
    return `${Math.floor(value / 10000).toLocaleString()}만`;
  }
  return value.toLocaleString();
}

function AnimatedStatCard({
  label,
  value,
  icon,
  format: formatFn,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  format?: (v: number) => string;
}) {
  const { count } = useCountUp(value, { duration: 800 });
  const displayValue = formatFn ? formatFn(count) : count.toLocaleString();

  return <StatCard label={label} value={displayValue} icon={icon} />;
}

const SKELETON_IDS = ['routes', 'count', 'quantity', 'fare'] as const;

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {SKELETON_IDS.map((id) => (
        <Skeleton key={id} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

const SEARCH_TYPE_LABELS: Record<string, string> = {
  code: '노선',
  name: '노선명',
  car: '차량',
};

export default function HomePage() {
  const router = useRouter();
  const today = getTodayDateString();
  const { data: stats, isLoading, error } = useStats({ date: today });

  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('recentSearches');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const handleSearchFocus = () => {
    router.push('/search');
  };

  const handleRecentSearchClick = (search: RecentSearch) => {
    router.push(`/search?type=${search.type}&q=${encodeURIComponent(search.query)}`);
  };

  const handleRemoveRecentSearch = (timestamp: number) => {
    const updated = recentSearches.filter((s) => s.timestamp !== timestamp);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const formattedDate = format(new Date(), 'yyyy.MM.dd (eee)', { locale: ko });

  return (
    <AppShell title="대신물류" leftAction="menu">
      <div className="px-4 py-4 space-y-6 page-enter">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-medium">{formattedDate}</span>
        </div>

        {isLoading ? (
          <StatsSkeleton />
        ) : error ? (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-center">
            <p className="text-sm text-destructive">데이터를 불러올 수 없습니다</p>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-3 list-stagger">
            <AnimatedStatCard
              label="노선"
              value={stats.totalRoutes}
              icon={<Route className="h-4 w-4" />}
            />
            <AnimatedStatCard
              label="건수"
              value={stats.totalCount}
              icon={<Hash className="h-4 w-4" />}
            />
            <AnimatedStatCard
              label="수량"
              value={stats.totalQuantity}
              icon={<Package className="h-4 w-4" />}
            />
            <AnimatedStatCard
              label="운임"
              value={stats.totalFare}
              icon={<Banknote className="h-4 w-4" />}
              format={formatCurrency}
            />
          </div>
        ) : null}

        <div>
          <SearchBar
            placeholder="노선, 차량, 지역 검색"
            onFocus={handleSearchFocus}
            readOnly
          />
        </div>

        {recentSearches.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">최근 검색</h2>
            <div className="space-y-2">
              {recentSearches.slice(0, 5).map((search) => (
                <div
                  key={search.timestamp}
                  className="flex items-center justify-between rounded-lg bg-card border border-border/50 px-3 py-2.5"
                >
                  <button
                    type="button"
                    onClick={() => handleRecentSearchClick(search)}
                    className="flex items-center gap-2 flex-1 text-left touch-feedback"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="text-muted-foreground">
                        {SEARCH_TYPE_LABELS[search.type]}
                      </span>{' '}
                      <span className="font-medium">{search.query}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveRecentSearch(search.timestamp)}
                    className="p-1 text-muted-foreground hover:text-foreground touch-feedback"
                    aria-label="삭제"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
