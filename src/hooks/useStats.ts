'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { StatsDto } from '@/types/api';

interface UseStatsParams {
  date: string;
  enabled?: boolean;
}

export function useStats({ date, enabled = true }: UseStatsParams) {
  return useQuery<StatsDto>({
    queryKey: ['stats', date],
    queryFn: () => api.stats.getByDate(date),
    enabled: enabled && date.length === 8,
    staleTime: 60 * 1000,
  });
}
