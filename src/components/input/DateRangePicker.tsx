'use client';

import * as React from 'react';
import { format, parse, isValid, isBefore, startOfDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';

interface DateRangePickerProps {
  startDate: string | null;
  endDate: string | null;
  onDateChange: (start: string | null, end: string | null) => void;
  disabled?: boolean;
  className?: string;
}

function parseYYYYMMDD(dateStr: string | null): Date | undefined {
  if (!dateStr || dateStr.length !== 8) return undefined;
  const parsed = parse(dateStr, 'yyyyMMdd', new Date());
  return isValid(parsed) ? parsed : undefined;
}

function formatToYYYYMMDD(date: Date | undefined): string | null {
  if (!date || !isValid(date)) return null;
  return format(date, 'yyyyMMdd');
}

export function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
  disabled = false,
  className,
}: DateRangePickerProps) {
  const selected: DateRange | undefined = React.useMemo(() => {
    const from = parseYYYYMMDD(startDate);
    const to = parseYYYYMMDD(endDate);
    if (!from && !to) return undefined;
    return { from, to };
  }, [startDate, endDate]);

  const handleSelect = (range: DateRange | undefined) => {
    if (!range) {
      onDateChange(null, null);
      return;
    }
    
    const start = formatToYYYYMMDD(range.from);
    const end = formatToYYYYMMDD(range.to);
    onDateChange(start, end);
  };

  const displayText = React.useMemo(() => {
    const from = parseYYYYMMDD(startDate);
    const to = parseYYYYMMDD(endDate);
    
    if (!from) return '날짜를 선택하세요';
    
    const fromStr = format(from, 'yyyy.MM.dd', { locale: ko });
    if (!to) return `${fromStr} ~ 종료일 선택`;
    
    const toStr = format(to, 'yyyy.MM.dd', { locale: ko });
    return `${fromStr} ~ ${toStr}`;
  }, [startDate, endDate]);

  const today = startOfDay(new Date());

  return (
    <div className={cn('space-y-3', className)}>
      <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
        <span className="text-muted-foreground">선택된 기간: </span>
        <span className="font-medium">{displayText}</span>
      </div>
      
      <Calendar
        mode="range"
        selected={selected}
        onSelect={handleSelect}
        disabled={(date) => disabled || isBefore(today, startOfDay(date))}
        numberOfMonths={1}
        className="rounded-lg border border-border"
      />
      
      {(startDate || endDate) && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDateChange(null, null)}
          disabled={disabled}
          className="w-full"
        >
          선택 초기화
        </Button>
      )}
    </div>
  );
}
