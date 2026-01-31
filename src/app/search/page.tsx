'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { RouteCard, RouteDetail } from '@/components/data-display';
import { SearchBar, SearchTabs } from '@/components/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useRoutes } from '@/hooks';
import type { SearchType, RouteDto, RecentSearch } from '@/types/api';

const SKELETON_IDS = ['s1', 's2', 's3'] as const;

function SearchSkeleton() {
  return (
    <div className="space-y-3">
      {SKELETON_IDS.map((id) => (
        <Skeleton key={id} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <p className="text-muted-foreground">
        {query ? `"${query}"에 대한 검색 결과가 없습니다` : '검색어를 입력하세요'}
      </p>
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialType = (searchParams.get('type') as SearchType) || 'code';
  const initialQuery = searchParams.get('q') || '';

  const [searchType, setSearchType] = useState<SearchType>(initialType);
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedRoute, setSelectedRoute] = useState<RouteDto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchType !== 'code') params.set('type', searchType);
    if (query) params.set('q', query);
    const queryString = params.toString();
    router.replace(`/search${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [searchType, query, router]);

  const saveRecentSearch = useCallback((type: SearchType, q: string) => {
    if (!q.trim()) return;

    try {
      const stored = localStorage.getItem('recentSearches');
      const searches: RecentSearch[] = stored ? JSON.parse(stored) : [];

      const filtered = searches.filter(
        (s) => !(s.type === type && s.query === q)
      );

      const newSearch: RecentSearch = {
        type,
        query: q,
        timestamp: Date.now(),
      };

      const updated = [newSearch, ...filtered].slice(0, 10);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  }, []);

  const { data: routes, isLoading, error } = useRoutes({
    type: searchType,
    query: debouncedQuery,
  });

  useEffect(() => {
    if (routes && routes.length > 0 && debouncedQuery) {
      saveRecentSearch(searchType, debouncedQuery);
    }
  }, [routes, debouncedQuery, searchType, saveRecentSearch]);

  const handleRouteClick = useCallback((route: RouteDto) => {
    setSelectedRoute(route);
    setDetailOpen(true);
  }, []);

  const handleClear = () => {
    setQuery('');
  };

  const handleTypeChange = (type: SearchType) => {
    setSearchType(type);
  };

  return (
    <AppShell title="검색" leftAction="back">
      <div className="px-4 py-4 space-y-4 page-enter">
        <SearchBar
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={handleClear}
          placeholder="검색어 입력"
          autoFocus
        />

        <SearchTabs value={searchType} onChange={handleTypeChange} />

        <div className="pt-2">
          {isLoading ? (
            <SearchSkeleton />
          ) : error ? (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-center">
              <p className="text-sm text-destructive">
                검색 중 오류가 발생했습니다
              </p>
            </div>
          ) : routes && routes.length > 0 ? (
            <div className="space-y-3 list-stagger">
              {routes.map((route) => (
                <RouteCard
                  key={`${route.searchDate}-${route.lineCode}`}
                  route={route}
                  onRouteClick={handleRouteClick}
                />
              ))}
            </div>
          ) : (
            <EmptyState query={debouncedQuery} />
          )}
        </div>
      </div>

      <RouteDetail
        route={selectedRoute}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </AppShell>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <AppShell title="검색" leftAction="back">
        <div className="px-4 py-4">
          <SearchSkeleton />
        </div>
      </AppShell>
    }>
      <SearchContent />
    </Suspense>
  );
}
