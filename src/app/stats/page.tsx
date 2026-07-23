'use client';

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isToday,
  setDate,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  AlertCircle,
  Banknote,
  ChevronLeft,
  ChevronRight,
  Hash,
  Package,
  RefreshCw,
  Route,
} from 'lucide-react';
import { useCallback, useState, useSyncExternalStore } from 'react';

import { StatCard } from '@/components/data-display';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCountUp, useMonthlyStats, useStats } from '@/hooks';
import { cn, formatCurrencyAbbreviated } from '@/lib/utils';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const STABLE_DATE = new Date(2000, 0, 1);
const subscribeToClient = () => () => {};
type CalendarDisplayMode = 'count' | 'fare';

interface StatsSelection {
  currentMonth: Date;
  selectedDate: Date;
}

function moveSelectionMonth(selection: StatsSelection, amount: number): StatsSelection {
  const currentMonth = addMonths(selection.currentMonth, amount);
  const selectedDay = Math.min(
    selection.selectedDate.getDate(),
    endOfMonth(currentMonth).getDate()
  );

  return {
    currentMonth,
    selectedDate: setDate(currentMonth, selectedDay),
  };
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
    <div className="grid grid-cols-2 gap-2" aria-label="선택일 통계 불러오는 중">
      {['routes', 'count', 'quantity', 'fare'].map((id) => (
        <Skeleton key={id} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

export default function StatsPage() {
  const isClient = useSyncExternalStore(subscribeToClient, () => true, () => false);
  const [selection, setSelection] = useState<StatsSelection>(() => {
    const today = startOfDay(new Date());
    return { currentMonth: today, selectedDate: today };
  });
  const [displayMode, setDisplayMode] = useState<CalendarDisplayMode>('count');

  const currentMonth = isClient ? selection.currentMonth : STABLE_DATE;
  const selectedDate = isClient ? selection.selectedDate : STABLE_DATE;
  const selectedDateString = format(selectedDate, 'yyyyMMdd');
  const yearMonth = format(currentMonth, 'yyyyMM');
  const {
    data: stats,
    isLoading,
    error,
    refetch: refetchDay,
  } = useStats({ date: selectedDateString, enabled: isClient });
  const {
    data: monthlyStats,
    isLoading: monthlyLoading,
    error: monthlyError,
    refetch: refetchMonth,
  } = useMonthlyStats({ yearMonth, enabled: isClient });

  const handlePrevMonth = useCallback(() => {
    setSelection((previous) => moveSelectionMonth(previous, -1));
  }, []);
  const handleNextMonth = useCallback(() => {
    setSelection((previous) => moveSelectionMonth(previous, 1));
  }, []);
  const handleDateClick = useCallback((date: Date) => {
    setSelection((previous) => ({ ...previous, selectedDate: date }));
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: endOfMonth(currentMonth) });
  const emptyDays = Array.from({ length: monthStart.getDay() }, (_, index) => `empty-${index}`);
  const hasMonthlyData = !!monthlyStats && Object.keys(monthlyStats.days).length > 0;

  return (
    <AppShell title="통계">
      <div className="space-y-4 px-4 py-5 page-enter lg:px-8 lg:py-5">
        <section className="flex flex-col gap-3 rounded-xl border border-border bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth} aria-label="이전 달">
              <ChevronLeft className="size-5" />
            </Button>
            <h2 className="min-w-36 text-center text-lg font-bold font-mono-num">
              {format(currentMonth, 'yyyy년 M월', { locale: ko })}
            </h2>
            <Button variant="ghost" size="icon" onClick={handleNextMonth} aria-label="다음 달">
              <ChevronRight className="size-5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-1 rounded-[10px] border border-border bg-secondary p-1 sm:w-52">
            {(['count', 'fare'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                className={cn(
                  'min-h-11 rounded-lg px-3 text-sm font-bold',
                  displayMode === mode ? 'bg-white text-[#075f52]' : 'text-muted-foreground'
                )}
                aria-pressed={displayMode === mode}
                onClick={() => setDisplayMode(mode)}
              >
                {mode === 'count' ? '건수' : '운임'}
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,.8fr)]">
          <section className="rounded-xl border border-border bg-white p-2.5 lg:p-4" aria-label="월간 통계 달력">
            {monthlyLoading ? (
              <Skeleton className="h-[430px] rounded-lg" />
            ) : monthlyError ? (
              <div className="status-panel min-h-[430px]">
                <div>
                  <AlertCircle className="mx-auto mb-3 size-10 text-destructive" />
                  <h3 className="text-lg font-bold">월간 통계를 불러올 수 없습니다</h3>
                  <Button variant="outline" className="mt-4" onClick={() => refetchMonth()}>
                    <RefreshCw className="size-4" />
                    다시 시도
                  </Button>
                </div>
              </div>
            ) : !hasMonthlyData ? (
              <div className="status-panel min-h-[430px]">
                <div>
                  <Package className="mx-auto mb-3 size-10 text-muted-foreground" />
                  <h3 className="text-lg font-bold">이 달의 통계가 없습니다</h3>
                  <p className="mt-1 text-sm text-muted-foreground">다른 달을 선택해 통계를 확인해 주세요.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="calendar-grid border-l border-t border-border">
                  {WEEKDAYS.map((day, index) => (
                    <span
                      key={day}
                      className={cn(
                        'grid min-h-9 place-items-center border-b border-r border-border bg-[#f0f3f7] text-xs font-bold text-muted-foreground',
                        index === 0 && 'text-destructive'
                      )}
                    >
                      {day}
                    </span>
                  ))}
                  {emptyDays.map((id) => (
                    <span key={id} className="calendar-day border-b border-r border-border bg-[#fafbfc]" />
                  ))}
                  {daysInMonth.map((date) => {
                    const selected = isSameDay(date, selectedDate);
                    const dateKey = format(date, 'yyyyMMdd');
                    const dayStats = monthlyStats.days[dateKey];
                    const displayValue = displayMode === 'count'
                      ? dayStats?.totalCount
                      : dayStats?.totalFare;
                    const hasData = displayValue !== undefined && displayValue > 0;
                    const displayLabel = displayMode === 'count'
                      ? `${displayValue ?? 0}건`
                      : formatCurrencyAbbreviated(displayValue ?? 0);

                    return (
                      <button
                        key={date.toISOString()}
                        type="button"
                        className={cn(
                          'calendar-day flex flex-col items-start border-b border-r border-border p-2 text-left hover:bg-[#f7fbfa]',
                          selected && 'bg-accent text-white hover:bg-accent',
                          !selected && isToday(date) && 'ring-2 ring-inset ring-accent'
                        )}
                        aria-label={`${format(date, 'yyyy년 M월 d일')} ${hasData ? displayLabel : '데이터 없음'}`}
                        aria-pressed={selected}
                        onClick={() => handleDateClick(date)}
                      >
                        <strong className="font-mono-num text-sm">{format(date, 'd')}</strong>
                        <span className={cn(
                          'mt-1 font-mono-num text-xs text-muted-foreground lg:mt-3',
                          selected && 'text-white/85'
                        )}>
                          {hasData ? displayLabel : '-'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          <aside className="rounded-xl border border-border bg-white p-4">
            <h3 className="font-mono-num text-lg font-bold">
              {format(selectedDate, 'M월 d일 (eee)', { locale: ko })}
            </h3>
            <p className="mb-4 mt-1 text-sm text-muted-foreground">선택일 배차 요약</p>

            {isLoading ? (
              <StatsSkeleton />
            ) : error ? (
              <div className="status-panel min-h-72">
                <div>
                  <AlertCircle className="mx-auto mb-3 size-10 text-destructive" />
                  <h4 className="font-bold">통계를 불러올 수 없습니다</h4>
                  <Button variant="outline" className="mt-4" onClick={() => refetchDay()}>
                    <RefreshCw className="size-4" />
                    다시 시도
                  </Button>
                </div>
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 gap-2">
                <AnimatedStatCard label="노선" value={stats.totalRoutes} icon={<Route className="size-4" />} />
                <AnimatedStatCard label="건수" value={stats.totalCount} icon={<Hash className="size-4" />} />
                <AnimatedStatCard label="수량" value={stats.totalQuantity} icon={<Package className="size-4" />} />
                <AnimatedStatCard
                  label="운임"
                  value={stats.totalFare}
                  icon={<Banknote className="size-4" />}
                  formatValue={formatCurrencyAbbreviated}
                />
              </div>
            ) : (
              <div className="status-panel min-h-72">
                <div>
                  <Package className="mx-auto mb-3 size-10 text-muted-foreground" />
                  <h4 className="font-bold">선택일 통계가 없습니다</h4>
                  <p className="mt-1 text-sm text-muted-foreground">다른 날짜를 선택해 주세요.</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
