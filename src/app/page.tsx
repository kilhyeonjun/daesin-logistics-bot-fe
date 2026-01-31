'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Calendar,
  Route,
  Package,
  Hash,
  Banknote,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Star,
  AlertCircle,
  RefreshCw,
  Truck,
} from 'lucide-react';
import { AppShell } from '@/components/layout';
import { StatCard, RouteCard, RouteDetail } from '@/components/data-display';
import { SearchBar } from '@/components/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useStats, useCountUp, useRoutesByDate, useFavorites } from '@/hooks';
import { cn, formatCurrencyAbbreviated } from '@/lib/utils';
import type { RouteDto } from '@/types/api';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const ITEMS_PER_PAGE = 20;

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

function RouteListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [selectedRoute, setSelectedRoute] = useState<RouteDto | null>(null);

  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const selectedDateString = format(selectedDate, 'yyyyMMdd');
  const { data: stats, isLoading: statsLoading, error: statsError } = useStats({ date: selectedDateString });
  const { data: routes, isLoading: routesLoading } = useRoutesByDate({ date: selectedDateString });

  const favoriteRoutes = useMemo(() => {
    if (!routes) return [];
    return routes.filter((route) => favorites.includes(route.lineCode));
  }, [routes, favorites]);

  const nonFavoriteRoutes = useMemo(() => {
    if (!routes) return [];
    return routes.filter((route) => !favorites.includes(route.lineCode));
  }, [routes, favorites]);

  const visibleRoutes = useMemo(() => {
    return nonFavoriteRoutes.slice(0, visibleCount);
  }, [nonFavoriteRoutes, visibleCount]);

  const hasMore = visibleCount < nonFavoriteRoutes.length;

   const handleSearchFocus = useCallback(() => {
     router.push('/search');
   }, [router]);

   const handleLoadMore = useCallback(() => {
     setVisibleCount(prev => prev + ITEMS_PER_PAGE);
   }, []);

   const handleRouteClick = useCallback((route: RouteDto) => {
     setSelectedRoute(route);
   }, []);

   const formattedDate = format(selectedDate, 'yyyy.MM.dd (eee)', { locale: ko });

   const handlePrevMonth = useCallback(() => setCurrentMonth(prev => subMonths(prev, 1)), []);
   const handleNextMonth = useCallback(() => setCurrentMonth(prev => addMonths(prev, 1)), []);

   const handleDateSelect = useCallback((date: Date) => {
     setSelectedDate(date);
     setIsCalendarOpen(false);
     setVisibleCount(ITEMS_PER_PAGE);
   }, []);

   const handleTodayClick = useCallback(() => {
     const today = new Date();
     setSelectedDate(today);
     setCurrentMonth(today);
     setIsCalendarOpen(false);
     setVisibleCount(ITEMS_PER_PAGE);
   }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay();
  const emptyDays = Array(startDayOfWeek).fill(null);

  return (
    <AppShell title="대신물류">
      <div className="px-4 py-4 space-y-6 page-enter">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors touch-feedback"
            >
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">{formattedDate}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handlePrevMonth}
                  aria-label="이전 달"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-semibold">
                  {format(currentMonth, 'yyyy년 M월', { locale: ko })}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleNextMonth}
                  aria-label="다음 달"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS.map((day, index) => (
                  <div
                    key={day}
                    className={cn(
                      'text-center text-xs font-medium py-1',
                      index === 0 && 'text-destructive',
                      index === 6 && 'text-blue-500'
                    )}
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {emptyDays.map((_, index) => (
                  <div key={`empty-${startDayOfWeek - index}`} className="aspect-square" />
                ))}
                {daysInMonth.map((date) => {
                  const isSelected = isSameDay(date, selectedDate);
                  const isTodayDate = isToday(date);
                  const isCurrentMonth = isSameMonth(date, currentMonth);
                  const dayOfWeek = date.getDay();

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => handleDateSelect(date)}
                      className={cn(
                        'aspect-square flex items-center justify-center rounded-full text-xs font-medium',
                        'touch-feedback transition-colors',
                        !isCurrentMonth && 'text-muted-foreground/50',
                        dayOfWeek === 0 && 'text-destructive',
                        dayOfWeek === 6 && 'text-blue-500',
                        isSelected && 'bg-accent text-white',
                        !isSelected && isTodayDate && 'ring-2 ring-accent ring-inset',
                        !isSelected && 'hover:bg-secondary'
                      )}
                    >
                      {format(date, 'd')}
                    </button>
                  );
                })}
              </div>

              {!isToday(selectedDate) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleTodayClick}
                >
                  오늘로 이동
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {statsLoading ? (
          <StatsSkeleton />
        ) : statsError ? (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-6 text-center">
            <AlertCircle className="h-10 w-10 text-destructive/70 mx-auto mb-3" />
            <p className="text-sm font-medium text-destructive mb-1">연결에 문제가 있습니다</p>
            <p className="text-xs text-muted-foreground mb-3">네트워크 상태를 확인하고 다시 시도해 주세요</p>
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
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 list-stagger">
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
              format={formatCurrencyAbbreviated}
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

        {favoriteRoutes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <h2 className="text-sm font-medium text-muted-foreground">
                즐겨찾기 ({favoriteRoutes.length})
              </h2>
            </div>
            <div className="space-y-3">
              {favoriteRoutes.map((route) => (
                <RouteCard
                  key={`fav-${route.lineCode}`}
                  route={route}
                  onRouteClick={handleRouteClick}
                  onFavoriteToggle={toggleFavorite}
                  isFavorite
                />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            전체 노선 {routes ? `(${nonFavoriteRoutes.length})` : ''}
          </h2>

          {routesLoading ? (
            <RouteListSkeleton />
          ) : visibleRoutes.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {visibleRoutes.map((route) => (
                  <RouteCard
                    key={route.lineCode}
                    route={route}
                    onRouteClick={handleRouteClick}
                    onFavoriteToggle={toggleFavorite}
                    isFavorite={isFavorite(route.lineCode)}
                  />
                ))}
              </div>

              {hasMore && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLoadMore}
                >
                  더 보기 ({nonFavoriteRoutes.length - visibleCount}개 남음)
                </Button>
              )}
            </>
          ) : (
            <div className="rounded-xl bg-muted/50 border border-border/50 p-8 text-center">
              <Truck className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">배송 데이터가 없습니다</p>
              <p className="text-xs text-muted-foreground">선택한 날짜에 등록된 배송 기록이 없습니다</p>
            </div>
          )}
        </div>
      </div>

      <RouteDetail
        route={selectedRoute}
        open={!!selectedRoute}
        onClose={() => setSelectedRoute(null)}
      />
    </AppShell>
  );
}
