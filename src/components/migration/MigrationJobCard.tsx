'use client';

import * as React from 'react';
import { format, parse, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';
import { X, Loader2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { MigrationJobDto, MigrationStatus } from '@/types/api';

interface MigrationJobCardProps {
  job: MigrationJobDto;
  onCancel?: (id: number) => void;
  isCancelling?: boolean;
}

function formatDate(dateStr: string): string {
  const parsed = parse(dateStr, 'yyyyMMdd', new Date());
  if (!isValid(parsed)) return dateStr;
  return format(parsed, 'yy.MM.dd', { locale: ko });
}

const STATUS_CONFIG: Record<MigrationStatus, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
}> = {
  pending: {
    label: '대기 중',
    icon: Clock,
    className: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  },
  running: {
    label: '진행 중',
    icon: Loader2,
    className: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  completed: {
    label: '완료',
    icon: CheckCircle,
    className: 'text-green-600 bg-green-50 border-green-200',
  },
  failed: {
    label: '실패',
    icon: XCircle,
    className: 'text-red-600 bg-red-50 border-red-200',
  },
  cancelled: {
    label: '취소됨',
    icon: AlertCircle,
    className: 'text-gray-600 bg-gray-50 border-gray-200',
  },
};

export function MigrationJobCard({ job, onCancel, isCancelling }: MigrationJobCardProps) {
  const config = STATUS_CONFIG[job.status];
  const StatusIcon = config.icon;
  const isActive = job.status === 'pending' || job.status === 'running';

  return (
    <div className={cn(
      'rounded-lg border p-3 space-y-2',
      config.className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon className={cn(
            'size-4',
            job.status === 'running' && 'animate-spin'
          )} />
          <span className="text-sm font-medium">{config.label}</span>
        </div>
        
        {isActive && onCancel && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onCancel(job.id)}
            disabled={isCancelling}
            className="text-muted-foreground hover:text-destructive"
          >
            {isCancelling ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <X className="size-3" />
            )}
          </Button>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        {formatDate(job.startDate)} ~ {formatDate(job.endDate)}
        {job.currentDate && (
          <span className="ml-2 text-foreground">
            (현재: {formatDate(job.currentDate)})
          </span>
        )}
      </div>

      {isActive && (
        <div className="space-y-1">
          <Progress value={job.progressPercent} className="h-1.5" />
          <div className="text-xs text-muted-foreground text-right">
            {job.completedDays} / {job.totalDays}일 ({job.progressPercent}%)
          </div>
        </div>
      )}

      {job.status === 'failed' && job.errorMessage && (
        <div className="text-xs text-destructive bg-destructive/10 rounded px-2 py-1">
          {job.errorMessage}
        </div>
      )}
    </div>
  );
}
