'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { SearchType, RouteDto } from '@/types/api';

interface UseRoutesParams {
  type: SearchType;
  query: string;
  enabled?: boolean;
}

export function useRoutes({ type, query, enabled = true }: UseRoutesParams) {
  return useQuery<RouteDto[]>({
    queryKey: ['routes', type, query],
    queryFn: async () => {
      if (!query.trim()) return [];

      switch (type) {
        case 'code':
          return api.routes.searchByCode(query);
        case 'name':
          return api.routes.searchByName(query);
        case 'car':
          return api.routes.searchByCar(query);
        default:
          return [];
      }
    },
    enabled: enabled && query.trim().length > 0,
    staleTime: 60 * 1000,
  });
}

interface UseRoutesByDateParams {
  date: string;
  enabled?: boolean;
}

export function useRoutesByDate({ date, enabled = true }: UseRoutesByDateParams) {
  return useQuery<RouteDto[]>({
    queryKey: ['routes', 'date', date],
    queryFn: () => api.routes.getByDate(date),
    enabled: enabled && date.length === 8,
    staleTime: 60 * 1000,
  });
}
