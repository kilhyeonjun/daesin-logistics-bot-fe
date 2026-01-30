'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { MigrationJobDto } from '@/types/api';

const MIGRATION_QUERY_KEY = ['migration'] as const;

export function useMigrationJobs() {
  return useQuery<MigrationJobDto[]>({
    queryKey: [...MIGRATION_QUERY_KEY, 'all'],
    queryFn: async () => {
      const response = await api.migration.getAll();
      return response.data;
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      // 진행 중인 작업이 있으면 3초마다 폴링
      const hasActiveJob = data?.some(
        job => job.status === 'running' || job.status === 'pending'
      );
      return hasActiveJob ? 3000 : false;
    },
    staleTime: 30 * 1000,
  });
}

export function useActiveMigration() {
  return useQuery<MigrationJobDto | null>({
    queryKey: [...MIGRATION_QUERY_KEY, 'active'],
    queryFn: async () => {
      const response = await api.migration.getActive();
      return response.data;
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === 'running' || data.status === 'pending')) {
        return 3000;
      }
      return false;
    },
    staleTime: 0,
  });
}

export function useMigrationJob(id: number | null) {
  return useQuery<MigrationJobDto | null>({
    queryKey: [...MIGRATION_QUERY_KEY, 'job', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.migration.getById(id);
      return response.data;
    },
    enabled: id !== null,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === 'running' || data.status === 'pending')) {
        return 3000;
      }
      return false;
    },
    staleTime: 0,
  });
}

export function useStartMigration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ startDate, endDate }: { startDate: string; endDate: string }) => {
      const response = await api.migration.start(startDate, endDate);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MIGRATION_QUERY_KEY });
    },
  });
}

export function useCancelMigration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.migration.cancel(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MIGRATION_QUERY_KEY });
    },
  });
}
