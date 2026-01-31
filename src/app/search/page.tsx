'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      <Search className="h-12 w-12 text-muted-foreground/40 mb-4" />
      {query ? (
        <>
          <p className="text-sm font-medium text-foreground mb-1">검색 결과가 없습니다</p>
          <p className="text-xs text-muted-foreground mb-1">"{query}"와 일치하는 노선이 없습니다</p>
          <p className="text-xs text-muted-foreground">다른 검색어로 시도해 보세요</p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-foreground mb-1">노선을 검색해 보세요</p>
          <p className="text-xs text-muted-foreground">노선번호, 차량번호, 지역명으로 검색할 수 있습니다</p>
        </>
      )}
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
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-6 text-center">
              <AlertCircle className="h-10 w-10 text-destructive/70 mx-auto mb-3" />
              <p className="text-sm font-medium text-destructive mb-1">검색 중 문제가 발생했습니다</p>
              <p className="text-xs text-muted-foreground mb-3">잠시 후 다시 시도해 주세요</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                다시 시도
              </Button>
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
