'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/layout';
import { RouteDetail, RouteLedger } from '@/components/data-display';
import { SearchAutocomplete, SearchTabs, SortSelect, type SortOption } from '@/components/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useRoutes, useRecentSearches } from '@/hooks';
import type { SearchType, RouteDto } from '@/types/api';

const SKELETON_IDS = ['s1', 's2', 's3'] as const;

function isSearchType(value: string | null): value is SearchType {
  return value === 'code' || value === 'name' || value === 'car';
}

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
    <div className="status-panel">
      <div>
      <Search className="h-12 w-12 text-muted-foreground/40 mb-4" />
      {query ? (
        <>
          <p className="text-sm font-medium text-foreground mb-1">검색 결과가 없습니다</p>
          <p className="text-sm text-muted-foreground mb-1">&quot;{query}&quot;와 일치하는 노선이 없습니다</p>
          <p className="text-sm text-muted-foreground">다른 검색어로 시도해 보세요</p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-foreground mb-1">노선을 검색해 보세요</p>
          <p className="text-sm text-muted-foreground">노선코드, 노선명, 차량번호로 검색할 수 있습니다</p>
        </>
      )}
      </div>
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

  const rawType = searchParams.get('type');
  const urlType: SearchType = isSearchType(rawType) ? rawType : 'code';
  const urlQuery = searchParams.get('q') || '';

  const [searchType, setSearchType] = useState<SearchType>(urlType);
  const [query, setQuery] = useState(urlQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(urlQuery);
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [selectedRoute, setSelectedRoute] = useState<RouteDto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { addSearch } = useRecentSearches();

  const replaceSearchUrl = useCallback((type: SearchType, nextQuery: string) => {
    const params = new URLSearchParams();
    if (type !== 'code') params.set('type', type);
    if (nextQuery) params.set('q', nextQuery);
    const queryString = params.toString();
    router.replace(`/search${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reconcile browser history with controlled search and API state
    setSearchType(urlType);
    setQuery(urlQuery);
    setDebouncedQuery(urlQuery);
  }, [urlQuery, urlType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);


  const { data: routes, isLoading, error, refetch } = useRoutes({
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
    replaceSearchUrl(type, query);
  }, [query, replaceSearchUrl]);

  const handleQueryChange = useCallback((nextQuery: string) => {
    setQuery(nextQuery);
    replaceSearchUrl(searchType, nextQuery);
  }, [replaceSearchUrl, searchType]);

  const handleSearchSelect = useCallback((selectedQuery: string) => {
    handleQueryChange(selectedQuery);
  }, [handleQueryChange]);

  return (
    <AppShell title="검색" leftAction="back">
      <div className="space-y-4 px-4 py-5 page-enter lg:px-8 lg:py-5">
        <section
          className="grid gap-2 rounded-xl border border-border bg-white p-3 lg:grid-cols-[minmax(280px,1fr)_300px_168px] lg:items-end"
          aria-label="검색 조건"
        >
          <div>
            <span className="mb-1.5 block text-xs font-bold text-muted-foreground">검색어</span>
            <SearchAutocomplete
              value={query}
              searchType={searchType}
              onChange={handleQueryChange}
              onSelect={handleSearchSelect}
              placeholder="검색어 입력"
              autoFocus
            />
          </div>
          <div>
            <span className="mb-1.5 block text-xs font-bold text-muted-foreground">검색 기준</span>
            <SearchTabs value={searchType} onChange={handleTypeChange} />
          </div>
          <div>
            <span className="mb-1.5 block text-xs font-bold text-muted-foreground">정렬</span>
          <SortSelect 
            value={sortOption} 
            onChange={setSortOption}
            disabled={!routes || routes.length === 0}
          />
          </div>
        </section>

        <div className="flex min-h-11 items-center justify-between">
          <strong className="text-sm">
            검색 결과 <span className="font-mono-num text-[#075f52]">{sortedRoutes.length}</span>개
          </strong>
        </div>

        <div>
          {isLoading ? (
            <SearchSkeleton />
          ) : error ? (
            <div className="status-panel">
              <div>
              <AlertCircle className="h-10 w-10 text-destructive/70 mx-auto mb-3" />
              <p className="text-lg font-bold text-destructive mb-1">검색 중 문제가 발생했습니다</p>
              <p className="text-sm text-muted-foreground mb-3">입력한 검색 조건을 유지한 채 다시 시도할 수 있습니다.</p>
              <Button 
                variant="outline" 
                onClick={() => refetch()}
                className="gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                다시 시도
              </Button>
              </div>
            </div>
          ) : sortedRoutes.length > 0 ? (
            <RouteLedger
              routes={sortedRoutes}
              onRouteClick={handleRouteClick}
              highlightQuery={debouncedQuery}
              ariaLabel="검색된 배차 노선"
            />
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
