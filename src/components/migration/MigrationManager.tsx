'use client';

import { AlertCircle, Database, Loader2, RefreshCw } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import {
  useActiveMigration,
  useCancelMigration,
  useMigrationJobs,
  useStartMigration,
} from '@/hooks/useMigration';
import { MigrationJobCard } from './MigrationJobCard';
import { NewMigrationForm } from './NewMigrationForm';

export function MigrationManager() {
  const {
    data: jobs,
    isLoading: isLoadingJobs,
    error: jobsError,
    refetch: refetchJobs,
  } = useMigrationJobs();
  const {
    data: activeJob,
    isLoading: isLoadingActive,
    error: activeError,
    refetch: refetchActive,
  } = useActiveMigration();
  const startMigration = useStartMigration();
  const cancelMigration = useCancelMigration();
  const hasActiveJob = !!activeJob && (
    activeJob.status === 'pending' || activeJob.status === 'running'
  );
  const recentJobs = useMemo(
    () => jobs ? [...jobs].sort((a, b) => b.id - a.id).slice(0, 5) : [],
    [jobs]
  );

  const handleCancel = (id: number) => {
    if (window.confirm('마이그레이션을 취소하시겠습니까?')) {
      cancelMigration.mutate(id);
    }
  };

  if (isLoadingJobs || isLoadingActive) {
    return (
      <div className="status-panel min-h-[420px]" aria-live="polite">
        <div>
          <Loader2 className="mx-auto mb-3 size-8 animate-spin text-accent" />
          <h2 className="text-lg font-bold">마이그레이션 작업을 불러오는 중입니다</h2>
        </div>
      </div>
    );
  }

  if (jobsError || activeError) {
    return (
      <div className="status-panel min-h-[420px]" aria-live="polite">
        <div>
          <AlertCircle className="mx-auto mb-3 size-10 text-destructive" />
          <h2 className="text-lg font-bold">마이그레이션 작업을 불러올 수 없습니다</h2>
          <p className="mt-1 text-sm text-muted-foreground">관리자 인증과 네트워크 상태를 확인해 주세요.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => Promise.all([refetchJobs(), refetchActive()])}
          >
            <RefreshCw className="size-4" />
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(320px,.72fr)_minmax(0,1.28fr)]">
      <section className="overflow-hidden rounded-xl border border-border bg-white" aria-labelledby="new-migration-title">
        <div className="flex min-h-[60px] items-center justify-between gap-3 border-b border-border bg-[#f0f3f7] px-4 py-3">
          <h2 id="new-migration-title" className="text-lg font-bold">새 작업</h2>
          <span className="rounded-lg border border-border bg-white px-2 py-1 text-xs font-bold text-muted-foreground">
            {hasActiveJob ? `${activeJob.progressPercent}% 진행 중` : '대기 중'}
          </span>
        </div>
        <div className="p-4">
          <p className="mb-4 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
            과거 날짜의 데이터를 다시 수집합니다. 한 번에 하나의 작업만 실행할 수 있습니다.
          </p>
          <NewMigrationForm
            onSubmit={(startDate, endDate) => startMigration.mutate({ startDate, endDate })}
            isSubmitting={startMigration.isPending}
            disabled={hasActiveJob}
            error={startMigration.error?.message}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-white" aria-labelledby="migration-jobs-title">
        <div className="flex min-h-[60px] items-center justify-between gap-3 border-b border-border bg-[#f0f3f7] px-4 py-3">
          <div className="flex items-center gap-2">
            <Database className="size-5 text-muted-foreground" />
            <h2 id="migration-jobs-title" className="text-lg font-bold">최근 작업</h2>
          </div>
          <span className="text-xs font-bold text-muted-foreground">최근 5개</span>
        </div>

        {cancelMigration.error && (
          <p className="m-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {cancelMigration.error.message}
          </p>
        )}

        {recentJobs.length > 0 ? (
          <div className="grid">
            {recentJobs.map((job) => (
              <MigrationJobCard
                key={job.id}
                job={job}
                onCancel={handleCancel}
                isCancelling={cancelMigration.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="status-panel min-h-[320px] border-0">
            <div>
              <Database className="mx-auto mb-3 size-10 text-muted-foreground" />
              <h3 className="font-bold">마이그레이션 작업이 없습니다</h3>
              <p className="mt-1 text-sm text-muted-foreground">왼쪽 양식에서 기간을 선택해 새 작업을 시작하세요.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
