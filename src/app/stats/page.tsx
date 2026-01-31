'use client';

import { useState, useCallback } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Route, Hash, Package, Banknote, AlertCircle, RefreshCw } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { StatCard } from '@/components/data-display';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useStats, useMonthlyStats, useCountUp } from '@/hooks';
import { cn, formatCurrencyAbbreviated } from '@/lib/utils';

function AnimatedStatCard({
  label,
  value,
  icon,
  formatFn,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  formatFn?: (v: number) => string;
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
        <Skeleton key={id} className="h-20 rounded-xl" />
      ))}
    </div>
  );
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function StatsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const selectedDateString = format(selectedDate, 'yyyyMMdd');
  const yearMonth = format(currentMonth, 'yyyyMM');
  const { data: stats, isLoading, error } = useStats({ date: selectedDateString });
  const { data: monthlyStats } = useMonthlyStats({ yearMonth });

   const handlePrevMonth = useCallback(() => {
     setCurrentMonth(prev => subMonths(prev, 1));
   }, []);

   const handleNextMonth = useCallback(() => {
     setCurrentMonth(prev => addMonths(prev, 1));
   }, []);

   const handleDateClick = useCallback((date: Date) => {
     setSelectedDate(date);
   }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = monthStart.getDay();
  const emptyDays = Array(startDayOfWeek).fill(null);

  return (
    <AppShell title="통계">
      <div className="px-4 py-4 space-y-6 page-enter">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            aria-label="이전 달"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <h2 className="text-lg font-semibold">
            {format(currentMonth, 'yyyy년 M월', { locale: ko })}
          </h2>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            aria-label="다음 달"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="rounded-xl bg-card border border-border/50 p-3">
          <div className="grid grid-cols-7 gap-1 mb-2">
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
              <div key={`empty-start-${startDayOfWeek - index}`} className="aspect-square" />
            ))}

            {daysInMonth.map((date) => {
              const isSelected = isSameDay(date, selectedDate);
              const isTodayDate = isToday(date);
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const dayOfWeek = date.getDay();
              const dateKey = format(date, 'yyyyMMdd');
              const dayStats = monthlyStats?.days[dateKey];
              const count = dayStats?.totalCount;

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => handleDateClick(date)}
                  className={cn(
                    'aspect-square min-w-[44px] min-h-[44px] flex flex-col items-center justify-center rounded-lg text-sm font-medium',
                    'touch-feedback transition-colors',
                    !isCurrentMonth && 'text-muted-foreground/50',
                    dayOfWeek === 0 && 'text-destructive',
                    dayOfWeek === 6 && 'text-blue-500',
                    isSelected && 'bg-accent text-white',
                    !isSelected && isTodayDate && 'ring-2 ring-accent ring-inset',
                    !isSelected && 'hover:bg-secondary'
                  )}
                >
                  <span>{format(date, 'd')}</span>
                  {count !== undefined && count > 0 && (
                    <span 
                      className={cn(
                        'text-[10px] leading-none',
                        isSelected ? 'text-white/80' : 'text-muted-foreground'
                      )}
                      title="배송 건수"
                    >
                      {count}건
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            {format(selectedDate, 'M월 d일 (eee)', { locale: ko })}
          </h3>

          {isLoading ? (
            <StatsSkeleton />
          ) : error ? (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-6 text-center">
              <AlertCircle className="h-10 w-10 text-destructive/70 mx-auto mb-3" />
              <p className="text-sm font-medium text-destructive mb-1">통계를 불러올 수 없습니다</p>
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
                formatFn={formatCurrencyAbbreviated}
              />
            </div>
          ) : (
            <div className="rounded-xl bg-muted/50 border border-border/50 p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">통계 데이터가 없습니다</p>
              <p className="text-xs text-muted-foreground">선택한 날짜에 배송 기록이 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
