import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useMonthlyStats } from '@/hooks/useMonthlyStats';
import { api } from '@/lib/api';
import type { MonthlyStatsDto } from '@/types/api';

vi.mock('@/lib/api', () => ({
  api: {
    stats: {
      getMonthly: vi.fn(),
    },
  },
}));

const mockGetMonthly = api.stats.getMonthly as ReturnType<typeof vi.fn>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

const mockMonthlyStats: MonthlyStatsDto = {
  days: {
    '01': { totalRoutes: 10, totalCount: 100, totalQuantity: 500, totalFare: 50000 },
    '02': { totalRoutes: 15, totalCount: 150, totalQuantity: 750, totalFare: 75000 },
    '15': { totalRoutes: 20, totalCount: 200, totalQuantity: 1000, totalFare: 100000 },
  },
};

describe('useMonthlyStats hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch monthly stats successfully', async () => {
    mockGetMonthly.mockResolvedValueOnce(mockMonthlyStats);

    const { result } = renderHook(
      () => useMonthlyStats({ yearMonth: '202501' }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockMonthlyStats);
    expect(mockGetMonthly).toHaveBeenCalledWith('202501');
    expect(mockGetMonthly).toHaveBeenCalledTimes(1);
  });

  it('should handle loading state', async () => {
    let resolvePromise: (value: MonthlyStatsDto) => void;
    const pendingPromise = new Promise<MonthlyStatsDto>((resolve) => {
      resolvePromise = resolve;
    });
    mockGetMonthly.mockReturnValueOnce(pendingPromise);

    const { result } = renderHook(
      () => useMonthlyStats({ yearMonth: '202501' }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isFetching).toBe(true);
    expect(result.current.data).toBeUndefined();

    resolvePromise!(mockMonthlyStats);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle error state', async () => {
    const errorMessage = 'Failed to fetch monthly stats';
    mockGetMonthly.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(
      () => useMonthlyStats({ yearMonth: '202501' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(errorMessage);
    expect(result.current.data).toBeUndefined();
  });

  it('should not fetch when enabled is false', async () => {
    const { result } = renderHook(
      () => useMonthlyStats({ yearMonth: '202501', enabled: false }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetMonthly).not.toHaveBeenCalled();
  });

  it('should not fetch when yearMonth is invalid (less than 6 characters)', async () => {
    const { result } = renderHook(
      () => useMonthlyStats({ yearMonth: '2025' }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetMonthly).not.toHaveBeenCalled();
  });

  it('should not fetch when yearMonth is empty', async () => {
    const { result } = renderHook(
      () => useMonthlyStats({ yearMonth: '' }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetMonthly).not.toHaveBeenCalled();
  });

  it('should fetch when yearMonth is exactly 6 characters', async () => {
    mockGetMonthly.mockResolvedValueOnce(mockMonthlyStats);

    const { result } = renderHook(
      () => useMonthlyStats({ yearMonth: '202501' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetMonthly).toHaveBeenCalledWith('202501');
  });

  it('should not fetch when yearMonth is more than 6 characters', async () => {
    const { result } = renderHook(
      () => useMonthlyStats({ yearMonth: '2025010' }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetMonthly).not.toHaveBeenCalled();
  });

  it('should use correct query key', async () => {
    mockGetMonthly.mockResolvedValueOnce(mockMonthlyStats);

    const { result } = renderHook(
      () => useMonthlyStats({ yearMonth: '202502' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetMonthly).toHaveBeenCalledWith('202502');
  });

  it('should refetch when yearMonth changes', async () => {
    mockGetMonthly.mockResolvedValue(mockMonthlyStats);

    const { result, rerender } = renderHook(
      ({ yearMonth }) => useMonthlyStats({ yearMonth }),
      { 
        wrapper: createWrapper(),
        initialProps: { yearMonth: '202501' },
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetMonthly).toHaveBeenCalledWith('202501');

    rerender({ yearMonth: '202502' });

    await waitFor(() => {
      expect(mockGetMonthly).toHaveBeenCalledWith('202502');
    });

    expect(mockGetMonthly).toHaveBeenCalledTimes(2);
  });

  it('should handle empty days in response', async () => {
    const emptyStats: MonthlyStatsDto = { days: {} };
    mockGetMonthly.mockResolvedValueOnce(emptyStats);

    const { result } = renderHook(
      () => useMonthlyStats({ yearMonth: '202501' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(emptyStats);
    expect(result.current.data?.days).toEqual({});
  });
});
