'use client';

import { Card } from '@heroui/react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
  valueClassName?: string;
}

export function StatCard({
  label,
  value,
  icon,
  className,
  valueClassName,
}: StatCardProps) {
  return (
    <Card className={cn('summary-card', className)}>
      <Card.Content className="flex h-full flex-col justify-between gap-3 p-0">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-muted-foreground">{label}</span>
          {icon && <span className="text-muted-foreground">{icon}</span>}
        </div>
        <strong
          className={cn(
            'font-mono-num text-[21px] font-bold leading-none tracking-tight lg:text-2xl',
            valueClassName
          )}
        >
          {value}
        </strong>
      </Card.Content>
    </Card>
  );
}
