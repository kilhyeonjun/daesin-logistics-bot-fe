import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import StatsPage from '@/app/stats/page';

const useStatsMock = vi.fn((params: { date: string; enabled?: boolean }) => {
  void params;
  return {
  data: {
    totalRoutes: 1,
    totalCount: 2,
    totalQuantity: 3,
    totalSectionFare: 4000,
    totalFare: 5000,
  },
  isLoading: false,
  error: null,
  };
});

vi.mock('@/hooks', () => ({
  useStats: (params: { date: string; enabled?: boolean }) => useStatsMock(params),
  useMonthlyStats: () => ({ data: { days: {} }, isLoading: false, error: null }),
  useCountUp: (value: number) => ({ count: value }),
}));

vi.mock('@/components/layout', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/data-display', () => ({
  StatCard: ({ label, value }: { label: string; value: string | number }) => (
    <div>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} />,
}));

describe('StatsPage month selection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 6, 23, 12, 0, 0));
    useStatsMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('moves the selected detail date into the displayed month atomically', () => {
    render(<StatsPage />);

    fireEvent.click(screen.getByRole('button', { name: '이전 달' }));

    expect(screen.getByRole('heading', { name: '2025년 6월' })).toBeTruthy();
    expect(useStatsMock).toHaveBeenLastCalledWith({ date: '20250623', enabled: true });
    expect(screen.getByText('6월 23일 (월)')).toBeTruthy();
  });
});
