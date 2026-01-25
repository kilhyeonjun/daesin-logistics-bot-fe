'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  valueClassName?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  className,
  valueClassName,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-xl bg-card p-4 shadow-sm',
        'border border-border/50',
        'touch-feedback',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        {icon && (
          <span className="text-muted-foreground">{icon}</span>
        )}
      </div>

      <div className="flex items-end justify-between">
        <span
          className={cn(
            'text-2xl font-bold tracking-tight font-mono-num',
            valueClassName
          )}
        >
          {value}
        </span>

        {trend && (
          <span
            className={cn(
              'text-xs font-medium',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}
          >
            {trend.isPositive ? '+' : ''}
            {trend.value}%
          </span>
        )}
      </div>
    </div>
  );
}
