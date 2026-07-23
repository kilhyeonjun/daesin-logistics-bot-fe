'use client';

import {
  addMonths,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  setMonth,
  setYear,
  startOfDay,
  startOfMonth,
  subMonths,
  subDays,
  subYears,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  AlertCircle,
  Banknote,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Hash,
  Package,
  RefreshCw,
  Route,
  Star,
  Truck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';

import { RouteDetail, RouteLedger, StatCard } from '@/components/data-display';
import { HomeSortSelect, SearchBar, type HomeSortOption } from '@/components/input';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useCountUp, useFavorites, useRoutesByDate, useStats } from '@/hooks';
import { cn, formatCurrencyAbbreviated } from '@/lib/utils';
import type { RouteDto } from '@/types/api';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const ITEMS_PER_PAGE = 20;
const STABLE_DATE = new Date(2000, 0, 1);
const subscribeToClient = () => () => {};

interface HomeDateState {
  selectedDate: Date;
  currentMonth: Date;
  today: Date;
}

function AnimatedStatCard({
  label,
  value,
  icon,
  formatValue,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  formatValue?: (value: number) => string;
}) {
  const { count } = useCountUp(value, { duration: 500 });
  return (
    <StatCard
      label={label}
      value={formatValue ? formatValue(count) : count.toLocaleString()}
      icon={icon}
    />
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3" aria-label="요약 불러오는 중">
      {['routes', 'count', 'quantity', 'fare'].map((id) => (
        <Skeleton key={id} className="h-24 rounded-xl lg:h-[108px]" />
      ))}
    </div>
  );
}

function RouteListSkeleton() {
  return (
    <div className="grid gap-2" aria-label="배차현황 불러오는 중">
      {['route-1', 'route-2', 'route-3', 'route-4'].map((id) => (
        <Skeleton key={id} className="h-28 rounded-xl lg:h-16" />
      ))}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const isClient = useSyncExternalStore(subscribeToClient, () => true, () => false);
  const [dateState, setDateState] = useState<HomeDateState>(() => {
    const today = startOfDay(new Date());
    return { selectedDate: today, currentMonth: today, today };
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [selectedRoute, setSelectedRoute] = useState<RouteDto | null>(null);
  const [sortOption, setSortOption] = useState<HomeSortOption>('fare-high');
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const selectedDate = isClient ? dateState.selectedDate : STABLE_DATE;
  const currentMonth = isClient ? dateState.currentMonth : STABLE_DATE;
  const today = isClient ? dateState.today : STABLE_DATE;
  const selectedDateString = format(selectedDate, 'yyyyMMdd');

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useStats({ date: selectedDateString, enabled: isClient });
  const {
    data: routes,
    isLoading: routesLoading,
    error: routesError,
    refetch: refetchRoutes,
  } = useRoutesByDate({ date: selectedDateString, enabled: isClient });

  const favoriteRoutes = useMemo(
    () => routes?.filter((route) => favorites.includes(route.lineCode)) ?? [],
    [routes, favorites]
  );
  const nonFavoriteRoutes = useMemo(
    () => routes?.filter((route) => !favorites.includes(route.lineCode)) ?? [],
    [routes, favorites]
  );
  const sortedNonFavoriteRoutes = useMemo(() => {
    const sorted = [...nonFavoriteRoutes];
    if (sortOption === 'fare-low') return sorted.sort((a, b) => a.totalFare - b.totalFare);
    if (sortOption === 'count') return sorted.sort((a, b) => b.count - a.count);
    return sorted.sort((a, b) => b.totalFare - a.totalFare);
  }, [nonFavoriteRoutes, sortOption]);
  const visibleRoutes = sortedNonFavoriteRoutes.slice(0, visibleCount);
  const hasMore = visibleCount < sortedNonFavoriteRoutes.length;
  const hasSummaryData = !!stats && (
    stats.totalRoutes > 0 ||
    stats.totalCount > 0 ||
    stats.totalQuantity > 0 ||
    stats.totalFare > 0
  );

  const updateCurrentMonth = useCallback((nextMonth: Date) => {
    setDateState((previous) => ({ ...previous, currentMonth: nextMonth }));
  }, []);
  const handlePrevYear = useCallback(
    () => updateCurrentMonth(subYears(currentMonth, 1)),
    [currentMonth, updateCurrentMonth]
  );
  const handleNextYear = useCallback(() => {
    const next = addYears(currentMonth, 1);
    if (isBefore(next, addMonths(today, 1))) updateCurrentMonth(next);
  }, [currentMonth, today, updateCurrentMonth]);
  const handlePrevMonth = useCallback(
    () => updateCurrentMonth(subMonths(currentMonth, 1)),
    [currentMonth, updateCurrentMonth]
  );
  const handleNextMonth = useCallback(() => {
    const next = addMonths(currentMonth, 1);
    if (isBefore(next, addMonths(today, 1))) updateCurrentMonth(next);
  }, [currentMonth, today, updateCurrentMonth]);
  const handleYearChange = useCallback((year: string) => {
    let next = setYear(currentMonth, Number(year));
    if (isBefore(today, next)) next = setMonth(next, today.getMonth());
    updateCurrentMonth(next);
  }, [currentMonth, today, updateCurrentMonth]);
  const handleDateSelect = useCallback((date: Date) => {
    setDateState((previous) => ({
      ...previous,
      selectedDate: date,
      currentMonth: date,
    }));
    setIsCalendarOpen(false);
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);
  const handleTodayClick = useCallback(() => {
    setDateState((previous) => ({
      ...previous,
      selectedDate: previous.today,
      currentMonth: previous.today,
    }));
    setIsCalendarOpen(false);
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const yearOptions = useMemo(() => {
    const currentYear = today.getFullYear();
    return Array.from({ length: 11 }, (_, index) => currentYear - 10 + index);
  }, [today]);
  const monthStart = startOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: endOfMonth(currentMonth) });
  const emptyDays = Array.from({ length: monthStart.getDay() }, (_, index) => `empty-${index}`);

  return (
    <AppShell title="대신물류">
      <div className="space-y-6 px-4 py-5 page-enter lg:px-8 lg:py-5">
        <section
          className="grid gap-2 rounded-xl border border-border bg-white p-3 lg:grid-cols-[220px_minmax(280px,1fr)_174px]"
          aria-label="날짜 및 검색"
        >
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={!isClient}
                className="flex min-h-12 items-center gap-2 rounded-[10px] border border-input bg-white px-3 text-left text-sm font-bold hover:bg-secondary disabled:opacity-60"
              >
                <Calendar aria-hidden="true" className="size-4 text-muted-foreground" />
                <span className="font-mono-num">
                  {isClient ? format(selectedDate, 'yyyy.MM.dd (eee)', { locale: ko }) : '날짜 준비 중'}
                </span>
                <ChevronDown aria-hidden="true" className="ml-auto size-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[min(360px,calc(100vw-32px))] p-3" align="start">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex">
                    <Button variant="ghost" size="icon" onClick={handlePrevYear} aria-label="이전 연도">
                      <ChevronsLeft className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth} aria-label="이전 달">
                      <ChevronLeft className="size-4" />
                    </Button>
                  </div>
                  <label className="flex min-h-11 items-center gap-2">
                    <span className="sr-only">연도</span>
                    <select
                      className="min-h-11 rounded-lg border border-border bg-white px-2 text-sm font-bold"
                      value={currentMonth.getFullYear()}
                      onChange={(event) => handleYearChange(event.target.value)}
                    >
                      {yearOptions.map((year) => <option key={year} value={year}>{year}년</option>)}
                    </select>
                    <strong>{format(currentMonth, 'M월', { locale: ko })}</strong>
                  </label>
                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleNextMonth}
                      disabled={!isBefore(addMonths(currentMonth, 1), addMonths(today, 1))}
                      aria-label="다음 달"
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleNextYear}
                      disabled={!isBefore(addYears(currentMonth, 1), addMonths(today, 1))}
                      aria-label="다음 연도"
                    >
                      <ChevronsRight className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {WEEKDAYS.map((day, index) => (
                    <span
                      key={day}
                      className={cn(
                        'grid min-h-8 place-items-center text-xs font-bold text-muted-foreground',
                        index === 0 && 'text-destructive'
                      )}
                    >
                      {day}
                    </span>
                  ))}
                  {emptyDays.map((id) => <span key={id} />)}
                  {daysInMonth.map((date) => {
                    const selected = isSameDay(date, selectedDate);
                    return (
                      <button
                        key={date.toISOString()}
                        type="button"
                        onClick={() => handleDateSelect(date)}
                        aria-label={format(date, 'yyyy년 M월 d일')}
                        aria-pressed={selected}
                        className={cn(
                          'grid size-11 place-items-center rounded-lg text-sm font-bold hover:bg-secondary',
                          !isSameMonth(date, currentMonth) && 'text-muted-foreground',
                          selected && 'bg-accent text-white hover:bg-accent',
                          !selected && isToday(date) && 'ring-2 ring-accent ring-inset'
                        )}
                      >
                        {format(date, 'd')}
                      </button>
                    );
                  })}
                </div>
                <Button variant="outline" className="w-full" onClick={handleTodayClick}>오늘로 이동</Button>
              </div>
            </PopoverContent>
          </Popover>

          <SearchBar
            placeholder="노선코드, 노선명, 차량번호 검색"
            onFocus={() => router.push('/search')}
            readOnly
          />
          <HomeSortSelect
            value={sortOption}
            onChange={setSortOption}
            disabled={!routes || nonFavoriteRoutes.length === 0}
          />
        </section>

        {statsLoading ? (
          <StatsSkeleton />
        ) : stats && hasSummaryData ? (
          <section className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3" aria-label="선택일 요약">
            <AnimatedStatCard label="노선" value={stats.totalRoutes} icon={<Route className="size-4" />} />
            <AnimatedStatCard label="건수" value={stats.totalCount} icon={<Hash className="size-4" />} />
            <AnimatedStatCard label="수량" value={stats.totalQuantity} icon={<Package className="size-4" />} />
            <AnimatedStatCard
              label="운임"
              value={stats.totalFare}
              icon={<Banknote className="size-4" />}
              formatValue={formatCurrencyAbbreviated}
            />
          </section>
        ) : null}

        {(statsError || routesError) ? (
          <section className="status-panel" aria-live="polite">
            <div>
              <AlertCircle className="mx-auto mb-3 size-10 text-destructive" />
              <h2 className="text-lg font-bold">배차현황을 불러오지 못했습니다</h2>
              <p className="mt-1 text-sm text-muted-foreground">잠시 후 다시 시도해 주세요. 선택한 날짜는 유지됩니다.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => void Promise.all([refetchStats(), refetchRoutes()])}
              >
                <RefreshCw className="size-4" />
                다시 시도
              </Button>
            </div>
          </section>
        ) : routesLoading ? (
          <RouteListSkeleton />
        ) : routes && routes.length === 0 ? (
          <section className="status-panel">
            <div>
              <Truck className="mx-auto mb-3 size-10 text-muted-foreground" />
              <h2 className="text-lg font-bold">선택한 날짜의 배차 기록이 없습니다</h2>
              <p className="mt-1 text-sm text-muted-foreground">이전 날짜를 선택하거나 검색에서 다른 노선을 확인해 주세요.</p>
              <Button variant="outline" className="mt-4" onClick={() => handleDateSelect(subDays(selectedDate, 1))}>
                이전 날짜 보기
              </Button>
            </div>
          </section>
        ) : (
          <>
            {favoriteRoutes.length > 0 && (
              <section className="space-y-2" aria-labelledby="favorite-routes-title">
                <div className="flex min-h-11 items-center gap-2">
                  <Star aria-hidden="true" className="size-4 fill-[#9d6800] text-[#9d6800]" />
                  <h2 id="favorite-routes-title" className="text-base font-bold">
                    즐겨찾기 <span className="text-xs text-muted-foreground">{favoriteRoutes.length}개</span>
                  </h2>
                </div>
                <RouteLedger
                  routes={favoriteRoutes}
                  onRouteClick={setSelectedRoute}
                  onFavoriteToggle={toggleFavorite}
                  isFavorite={isFavorite}
                  ariaLabel="즐겨찾기 배차 노선"
                />
              </section>
            )}

            <section className="space-y-2" aria-labelledby="all-routes-title">
              <div className="flex min-h-11 items-center justify-between">
                <h2 id="all-routes-title" className="text-base font-bold">
                  전체 노선 <span className="text-xs text-muted-foreground">{nonFavoriteRoutes.length}개</span>
                </h2>
              </div>
              <RouteLedger
                routes={visibleRoutes}
                onRouteClick={setSelectedRoute}
                onFavoriteToggle={toggleFavorite}
                isFavorite={isFavorite}
              />
              {hasMore && (
                <Button variant="outline" className="w-full" onClick={() => setVisibleCount((count) => count + ITEMS_PER_PAGE)}>
                  더 보기 ({sortedNonFavoriteRoutes.length - visibleCount}개 남음)
                </Button>
              )}
            </section>
          </>
        )}
      </div>

      <RouteDetail route={selectedRoute} open={!!selectedRoute} onClose={() => setSelectedRoute(null)} />
    </AppShell>
  );
}
