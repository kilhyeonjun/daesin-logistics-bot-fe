'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/layout';
import { RouteCard, RouteDetail } from '@/components/data-display';
import { SearchAutocomplete, SearchTabs, SortSelect, type SortOption } from '@/components/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useRoutes, useRecentSearches } from '@/hooks';
import type { SearchType, RouteDto } from '@/types/api';

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

function sortRoutes(routes: RouteDto[], sortOption: SortOption, query: string): RouteDto[] {
  const sorted = [...routes];
  
  switch (sortOption) {
    case 'relevance': {
      if (!query) return sorted;
      const lowerQuery = query.toLowerCase();
      return sorted.sort((a, b) => {
        const aExact = a.lineCode.toLowerCase() === lowerQuery || 
                       a.lineName?.toLowerCase() === lowerQuery ||
                       a.carNumber?.toLowerCase() === lowerQuery;
        const bExact = b.lineCode.toLowerCase() === lowerQuery || 
                       b.lineName?.toLowerCase() === lowerQuery ||
                       b.carNumber?.toLowerCase() === lowerQuery;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        const aStarts = a.lineCode.toLowerCase().startsWith(lowerQuery) || 
                        a.lineName?.toLowerCase().startsWith(lowerQuery) ||
                        a.carNumber?.toLowerCase().startsWith(lowerQuery);
        const bStarts = b.lineCode.toLowerCase().startsWith(lowerQuery) || 
                        b.lineName?.toLowerCase().startsWith(lowerQuery) ||
                        b.carNumber?.toLowerCase().startsWith(lowerQuery);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        return b.totalFare - a.totalFare;
      });
    }
    case 'latest':
      return sorted.sort((a, b) => b.searchDate.localeCompare(a.searchDate));
    case 'fare-high':
      return sorted.sort((a, b) => b.totalFare - a.totalFare);
    case 'fare-low':
      return sorted.sort((a, b) => a.totalFare - b.totalFare);
    default:
      return sorted;
  }
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialType = (searchParams.get('type') as SearchType) || 'code';
  const initialQuery = searchParams.get('q') || '';

  const [searchType, setSearchType] = useState<SearchType>(initialType);
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [selectedRoute, setSelectedRoute] = useState<RouteDto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { addSearch } = useRecentSearches();

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

  const { data: routes, isLoading, error } = useRoutes({
    type: searchType,
    query: debouncedQuery,
  });

  useEffect(() => {
    if (routes && routes.length > 0 && debouncedQuery) {
      addSearch(searchType, debouncedQuery);
    }
  }, [routes, debouncedQuery, searchType, addSearch]);

  const sortedRoutes = useMemo(() => {
    if (!routes) return [];
    return sortRoutes(routes, sortOption, debouncedQuery);
  }, [routes, sortOption, debouncedQuery]);

  const handleRouteClick = useCallback((route: RouteDto) => {
    setSelectedRoute(route);
    setDetailOpen(true);
  }, []);

  const handleTypeChange = useCallback((type: SearchType) => {
    setSearchType(type);
  }, []);

  const handleSearchSelect = useCallback((selectedQuery: string) => {
    setQuery(selectedQuery);
  }, []);

  return (
    <AppShell title="검색" leftAction="back">
      <div className="px-4 py-4 space-y-4 page-enter">
        <SearchAutocomplete
          value={query}
          searchType={searchType}
          onChange={setQuery}
          onSelect={handleSearchSelect}
          placeholder="검색어 입력"
          autoFocus
        />

        <div className="flex items-center justify-between gap-2">
          <SearchTabs value={searchType} onChange={handleTypeChange} />
          <SortSelect 
            value={sortOption} 
            onChange={setSortOption}
            disabled={!routes || routes.length === 0}
          />
        </div>

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
          ) : sortedRoutes.length > 0 ? (
            <div className="space-y-3 list-stagger">
              {sortedRoutes.map((route) => (
                <RouteCard
                  key={`${route.searchDate}-${route.lineCode}`}
                  route={route}
                  onRouteClick={handleRouteClick}
                  highlightQuery={debouncedQuery}
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
