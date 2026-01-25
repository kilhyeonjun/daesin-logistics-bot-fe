'use client';

import * as React from 'react';
import { ChevronDown, Database, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { MigrationJobCard } from './MigrationJobCard';
import { NewMigrationForm } from './NewMigrationForm';
import {
  useMigrationJobs,
  useActiveMigration,
  useStartMigration,
  useCancelMigration,
} from '@/hooks/useMigration';

export function MigrationManager() {
  const [isOpen, setIsOpen] = React.useState(false);

  const { data: jobs, isLoading: isLoadingJobs } = useMigrationJobs();
  const { data: activeJob } = useActiveMigration();
  const startMigration = useStartMigration();
  const cancelMigration = useCancelMigration();

  const hasActiveJob = activeJob && (activeJob.status === 'pending' || activeJob.status === 'running');

  const handleStart = (startDate: string, endDate: string) => {
    startMigration.mutate({ startDate, endDate });
  };

  const handleCancel = (id: number) => {
    if (confirm('마이그레이션을 취소하시겠습니까?')) {
      cancelMigration.mutate(id);
    }
  };

  const getStatusText = () => {
    if (isLoadingJobs) return '로딩 중...';
    if (hasActiveJob) return `진행 중 (${activeJob.progressPercent}%)`;
    return '대기 중';
  };

  const recentJobs = React.useMemo(() => {
    if (!jobs) return [];
    return [...jobs]
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);
  }, [jobs]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full rounded-xl bg-card border border-border/50 p-4 touch-feedback hover:shadow-sm">
        <div className="flex items-center gap-3">
          <Database className="size-5 text-muted-foreground" />
          <div className="text-left">
            <p className="font-medium">데이터 마이그레이션</p>
            <p className="text-sm text-muted-foreground">{getStatusText()}</p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'size-5 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 rounded-xl bg-card border border-border/50 p-4 space-y-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          과거 날짜의 데이터를 다시 크롤링합니다. 한 번에 하나의 작업만 실행할 수 있습니다.
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">새 마이그레이션</h4>
          <NewMigrationForm
            onSubmit={handleStart}
            isSubmitting={startMigration.isPending}
            disabled={!!hasActiveJob}
            error={startMigration.error?.message}
          />
        </div>

        {recentJobs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">최근 작업</h4>
            <div className="space-y-2">
              {recentJobs.map((job) => (
                <MigrationJobCard
                  key={job.id}
                  job={job}
                  onCancel={handleCancel}
                  isCancelling={cancelMigration.isPending}
                />
              ))}
            </div>
          </div>
        )}

        {isLoadingJobs && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
