'use client';

import { Label, ProgressBar } from '@heroui/react';
import { AlertCircle, CheckCircle, Clock, Loader2, X, XCircle } from 'lucide-react';
import { format, isValid, parse } from 'date-fns';
import { ko } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MigrationJobDto, MigrationStatus } from '@/types/api';

interface MigrationJobCardProps {
  job: MigrationJobDto;
  onCancel?: (id: number) => void;
  isCancelling?: boolean;
}

function formatDate(dateStr: string): string {
  const parsed = parse(dateStr, 'yyyyMMdd', new Date(2000, 0, 1));
  return isValid(parsed) ? format(parsed, 'yy.MM.dd', { locale: ko }) : dateStr;
}

const STATUS_CONFIG: Record<MigrationStatus, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
}> = {
  pending: { label: '대기 중', icon: Clock, className: 'border-[#efd7b4] bg-[#fff6e8] text-[#9b5b10]' },
  running: { label: '진행 중', icon: Loader2, className: 'border-[#a9ddd2] bg-[#e7f6f2] text-[#075f52]' },
  completed: { label: '완료', icon: CheckCircle, className: 'border-[#b9dfcf] bg-[#eaf7f1] text-[#207553]' },
  failed: { label: '실패', icon: XCircle, className: 'border-[#efcaca] bg-[#fff0f0] text-destructive' },
  cancelled: { label: '취소됨', icon: AlertCircle, className: 'border-border bg-secondary text-muted-foreground' },
};

export function MigrationJobCard({ job, onCancel, isCancelling }: MigrationJobCardProps) {
  const config = STATUS_CONFIG[job.status];
  const StatusIcon = config.icon;
  const isActive = job.status === 'pending' || job.status === 'running';

  return (
    <article className="grid gap-3 border-b border-border p-4 last:border-b-0 lg:grid-cols-[112px_minmax(150px,1fr)_minmax(180px,1fr)_48px] lg:items-center">
      <span className={cn(
        'inline-flex min-h-8 w-fit items-center gap-2 rounded-lg border px-2 text-xs font-bold',
        config.className
      )}>
        <StatusIcon className={cn('size-4', job.status === 'running' && 'animate-spin')} />
        {config.label}
      </span>

      <div>
        <strong className="font-mono-num text-sm">
          {formatDate(job.startDate)} - {formatDate(job.endDate)}
        </strong>
        {job.currentDate && (
          <span className="mt-1 block text-xs text-muted-foreground">
            현재 {formatDate(job.currentDate)}
          </span>
        )}
        {job.status === 'failed' && job.errorMessage && (
          <p className="mt-1 text-xs text-destructive">{job.errorMessage}</p>
        )}
      </div>

      <div>
        <ProgressBar
          aria-label={`마이그레이션 진행률 ${job.progressPercent}%`}
          value={job.progressPercent}
        >
          <Label className="sr-only">진행률</Label>
          <ProgressBar.Track>
            <ProgressBar.Fill className="bg-accent" />
          </ProgressBar.Track>
        </ProgressBar>
        <span className="mt-1 block text-right font-mono-num text-xs text-muted-foreground">
          {job.completedDays} / {job.totalDays}일 ({job.progressPercent}%)
        </span>
      </div>

      {isActive && onCancel ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onCancel(job.id)}
          disabled={isCancelling}
          aria-label={`작업 ${job.id} 취소`}
          className="text-muted-foreground hover:text-destructive"
        >
          {isCancelling ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
        </Button>
      ) : <span aria-hidden="true" />}
    </article>
  );
}
