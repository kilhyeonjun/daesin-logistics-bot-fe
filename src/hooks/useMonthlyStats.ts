'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { MonthlyStatsDto } from '@/types/api';

interface UseMonthlyStatsParams {
  yearMonth: string;
  enabled?: boolean;
}

export function useMonthlyStats({ yearMonth, enabled = true }: UseMonthlyStatsParams) {
  return useQuery<MonthlyStatsDto>({
    queryKey: ['monthlyStats', yearMonth],
    queryFn: () => api.stats.getMonthly(yearMonth),
    enabled: enabled && yearMonth.length === 6,
    staleTime: 5 * 60 * 1000,
  });
}
