import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import HomePage from '@/app/page';

const replaceMock = vi.fn();
let populatedStatsDates = new Set(['20260723']);
let populatedRouteDates = new Set(['20260723']);
let monthlyDays: Record<string, Record<string, {
  totalRoutes: number;
  totalCount: number;
  totalQuantity: number;
  totalFare: number;
}>> = {};
const populatedStats = { totalRoutes: 1, totalCount: 2, totalQuantity: 3, totalSectionFare: 4, totalFare: 5 };
const emptyStats = { totalRoutes: 0, totalCount: 0, totalQuantity: 0, totalSectionFare: 0, totalFare: 0 };
const useStatsMock = vi.fn(({ date }: { date: string }) => ({
  data: populatedStatsDates.has(date) ? populatedStats : emptyStats,
  isLoading: false,
  error: null,
  refetch: vi.fn(),
}));
const useRoutesByDateMock = vi.fn(({ date }: { date: string }) => ({
  data: populatedRouteDates.has(date) ? [{
    searchDate: date, lineCode: '101102', lineName: '서울', carCode: null,
    carNumber: null, count: 2, quantity: 3, sectionFare: 4, totalFare: 5,
  }] : [],
  isLoading: false,
  error: null,
  refetch: vi.fn(),
}));
const useMonthlyStatsMock = vi.fn(({ yearMonth }: { yearMonth: string }) => ({
  data: { days: monthlyDays[yearMonth] ?? {} },
  isLoading: false,
  error: null,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: replaceMock }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/hooks', () => ({
  useStats: (params: { date: string }) => useStatsMock(params),
  useRoutesByDate: (params: { date: string }) => useRoutesByDateMock(params),
  useMonthlyStats: (params: { yearMonth: string; enabled?: boolean }) => useMonthlyStatsMock(params),
  useCountUp: (value: number) => ({ count: value }),
  useFavorites: () => ({ favorites: [], isFavorite: vi.fn(() => false), toggleFavorite: vi.fn() }),
}));

vi.mock('@/components/layout', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/data-display', () => ({
  RouteDetail: () => null,
  RouteLedger: ({ routes }: { routes: Array<{ lineCode: string }> }) => (
    <div>{routes.map((route) => <span key={route.lineCode}>{route.lineCode}</span>)}</div>
  ),
  StatCard: ({ label, value }: { label: string; value: string | number }) => <div>{label}: {value}</div>,
}));
vi.mock('@/components/input', () => ({
  SearchBar: () => <input aria-label="검색" />,
  HomeSortSelect: () => <div />,
}));
vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
}));
vi.mock('@/components/ui/skeleton', () => ({ Skeleton: () => <div /> }));

describe('HomePage latest available date', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 6, 24, 9, 0, 0));
    window.history.replaceState({}, '', '/');
    populatedStatsDates = new Set(['20260723']);
    populatedRouteDates = new Set(['20260723']);
    monthlyDays = {
      '202607': {
        '20260723': { totalRoutes: 1, totalCount: 2, totalQuantity: 3, totalFare: 5 },
      },
    };
    replaceMock.mockClear();
    useStatsMock.mockClear();
    useRoutesByDateMock.mockClear();
    useMonthlyStatsMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('selects the latest monthly date when today is empty and keeps the URL and freshness basis in sync', async () => {
    render(<HomePage />);

    await waitFor(() => {
      expect(useRoutesByDateMock).toHaveBeenLastCalledWith({ date: '20260723', enabled: true });
    });

    expect(screen.getByText('기준일 2026.07.23 · 최신 수집 데이터')).toBeTruthy();
    expect(screen.getByText('101102')).toBeTruthy();
    expect(replaceMock).toHaveBeenLastCalledWith('/?date=20260723', { scroll: false });
  });

  it('preserves an explicit URL date instead of applying the automatic latest fallback', async () => {
    window.history.replaceState({}, '', '/?date=20260722');

    render(<HomePage />);

    await waitFor(() => {
      expect(useRoutesByDateMock).toHaveBeenLastCalledWith({ date: '20260722', enabled: true });
    });
    expect(screen.getByText('기준일 2026.07.22 · 선택일')).toBeTruthy();
    expect(replaceMock).not.toHaveBeenCalled();
    expect(useMonthlyStatsMock).toHaveBeenCalledWith({ yearMonth: '202607', enabled: false });
  });

  it('restores a history date on popstate without reapplying the latest fallback', async () => {
    window.history.replaceState({}, '', '/?date=20260722');
    render(<HomePage />);

    act(() => {
      window.history.pushState({}, '', '/?date=20260721');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    await waitFor(() => {
      expect(useRoutesByDateMock).toHaveBeenLastCalledWith({ date: '20260721', enabled: true });
    });
    expect(screen.getByText('기준일 2026.07.21 · 선택일')).toBeTruthy();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('restores a missing history date through the automatic latest fallback', async () => {
    window.history.replaceState({}, '', '/?date=20260722');
    render(<HomePage />);

    act(() => {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    await waitFor(() => {
      expect(useRoutesByDateMock).toHaveBeenLastCalledWith({ date: '20260723', enabled: true });
    });
    expect(screen.getByText('기준일 2026.07.23 · 최신 수집 데이터')).toBeTruthy();
  });

  it('finds the latest populated day across a month boundary', async () => {
    vi.setSystemTime(new Date(2026, 7, 1, 9, 0, 0));
    populatedStatsDates = new Set(['20260731']);
    populatedRouteDates = new Set(['20260731']);
    monthlyDays = {
      '202607': {
        '20260731': { totalRoutes: 1, totalCount: 2, totalQuantity: 3, totalFare: 5 },
      },
      '202608': {},
    };

    render(<HomePage />);

    await waitFor(() => {
      expect(useRoutesByDateMock).toHaveBeenLastCalledWith({ date: '20260731', enabled: true });
    });
    expect(screen.getByText('기준일 2026.07.31 · 최신 수집 데이터')).toBeTruthy();
    expect(replaceMock).toHaveBeenLastCalledWith('/?date=20260731', { scroll: false });
  });

  it('keeps today selected when today summary data exists', async () => {
    populatedStatsDates = new Set(['20260724', '20260723']);
    populatedRouteDates = new Set(['20260723']);

    render(<HomePage />);

    await waitFor(() => {
      expect(useRoutesByDateMock).toHaveBeenLastCalledWith({ date: '20260724', enabled: true });
    });
    expect(screen.getByText('기준일 2026.07.24 · 오늘')).toBeTruthy();
    expect(useRoutesByDateMock).not.toHaveBeenCalledWith({ date: '20260723', enabled: true });
  });

  it('keeps today selected when today routes exist without summary totals', async () => {
    populatedStatsDates = new Set(['20260723']);
    populatedRouteDates = new Set(['20260724', '20260723']);

    render(<HomePage />);

    await waitFor(() => {
      expect(useRoutesByDateMock).toHaveBeenLastCalledWith({ date: '20260724', enabled: true });
    });
    expect(screen.getByText('기준일 2026.07.24 · 오늘')).toBeTruthy();
    expect(useRoutesByDateMock).not.toHaveBeenCalledWith({ date: '20260723', enabled: true });
  });
});
