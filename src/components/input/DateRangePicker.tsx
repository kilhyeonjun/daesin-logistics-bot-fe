'use client';

import * as React from 'react';
import { format, parse, isValid, isBefore, startOfDay, subMonths, subYears, addMonths, addYears, setMonth, setYear } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

function parseInputDate(input: string): Date | null {
  // Support formats: YYYY.MM.DD, YYYY-MM-DD, YYYYMMDD
  const cleaned = input.replace(/[.\-\/]/g, '');
  if (cleaned.length !== 8) return null;
  const parsed = parse(cleaned, 'yyyyMMdd', new Date());
  return isValid(parsed) ? parsed : null;
}

export function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
  disabled = false,
  className,
}: DateRangePickerProps) {
  const today = startOfDay(new Date());
  
  // Calendar month state (for navigation)
  const [displayMonth, setDisplayMonth] = React.useState<Date>(() => {
    const from = parseYYYYMMDD(startDate);
    return from || today;
  });

  // Direct input states
  const [startInput, setStartInput] = React.useState('');
  const [endInput, setEndInput] = React.useState('');

  // Update display month when startDate changes externally
  React.useEffect(() => {
    const from = parseYYYYMMDD(startDate);
    if (from) {
      setDisplayMonth(from);
    }
  }, [startDate]);

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

  // Navigation handlers
  const handlePrevYear = () => setDisplayMonth(prev => addYears(prev, -1));
  const handleNextYear = () => {
    const next = addYears(displayMonth, 1);
    if (isBefore(next, addMonths(today, 1))) {
      setDisplayMonth(next);
    }
  };
  const handlePrevMonth = () => setDisplayMonth(prev => addMonths(prev, -1));
  const handleNextMonth = () => {
    const next = addMonths(displayMonth, 1);
    if (isBefore(next, addMonths(today, 1))) {
      setDisplayMonth(next);
    }
  };

  // Month/Year dropdown handlers
  const handleMonthChange = (month: string) => {
    setDisplayMonth(prev => setMonth(prev, parseInt(month)));
  };

  const handleYearChange = (year: string) => {
    let newDate = setYear(displayMonth, parseInt(year));
    // If the new date is in the future, adjust to today's month
    if (isBefore(today, newDate)) {
      newDate = setMonth(newDate, today.getMonth());
    }
    setDisplayMonth(newDate);
  };

  // Generate year options (last 10 years to current year)
  const yearOptions = React.useMemo(() => {
    const currentYear = today.getFullYear();
    const years: number[] = [];
    for (let y = currentYear - 10; y <= currentYear; y++) {
      years.push(y);
    }
    return years;
  }, [today]);

  // Month options
  const monthOptions = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: format(new Date(2000, i, 1), 'M월', { locale: ko }),
    }));
  }, []);

  // Preset handlers
  const applyPreset = (months: number) => {
    const end = today;
    const start = subMonths(end, months);
    onDateChange(formatToYYYYMMDD(start), formatToYYYYMMDD(end));
    setDisplayMonth(start);
  };

  // Direct input handlers
  const handleStartInputBlur = () => {
    const date = parseInputDate(startInput);
    if (date && !isBefore(today, startOfDay(date))) {
      const newStart = formatToYYYYMMDD(date);
      onDateChange(newStart, endDate);
      setDisplayMonth(date);
    }
    setStartInput('');
  };

  const handleEndInputBlur = () => {
    const date = parseInputDate(endInput);
    if (date && !isBefore(today, startOfDay(date))) {
      const newEnd = formatToYYYYMMDD(date);
      onDateChange(startDate, newEnd);
    }
    setEndInput('');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent, type: 'start' | 'end') => {
    if (e.key === 'Enter') {
      if (type === 'start') handleStartInputBlur();
      else handleEndInputBlur();
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Selected range display */}
      <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
        <span className="text-muted-foreground">선택된 기간: </span>
        <span className="font-medium">{displayText}</span>
      </div>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => applyPreset(1)}
          disabled={disabled}
        >
          최근 1개월
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => applyPreset(6)}
          disabled={disabled}
        >
          최근 6개월
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => applyPreset(12)}
          disabled={disabled}
        >
          최근 1년
        </Button>
      </div>

      {/* Direct date input */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="시작일 (YYYY.MM.DD)"
            value={startInput}
            onChange={(e) => setStartInput(e.target.value)}
            onBlur={handleStartInputBlur}
            onKeyDown={(e) => handleInputKeyDown(e, 'start')}
            disabled={disabled}
            className="text-sm"
          />
        </div>
        <div className="flex-1">
          <Input
            type="text"
            placeholder="종료일 (YYYY.MM.DD)"
            value={endInput}
            onChange={(e) => setEndInput(e.target.value)}
            onBlur={handleEndInputBlur}
            onKeyDown={(e) => handleInputKeyDown(e, 'end')}
            disabled={disabled}
            className="text-sm"
          />
        </div>
      </div>

      {/* Year/Month navigation */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={handlePrevYear}
            disabled={disabled}
            title="이전 연도"
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={handlePrevMonth}
            disabled={disabled}
            title="이전 월"
          >
            <ChevronLeft className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={displayMonth.getFullYear().toString()}
            onValueChange={handleYearChange}
            disabled={disabled}
          >
            <SelectTrigger className="h-8 w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}년
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={displayMonth.getMonth().toString()}
            onValueChange={handleMonthChange}
            disabled={disabled}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={handleNextMonth}
            disabled={disabled || isBefore(today, addMonths(displayMonth, 1))}
            title="다음 월"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={handleNextYear}
            disabled={disabled || isBefore(today, addYears(displayMonth, 1))}
            title="다음 연도"
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <Calendar
        mode="range"
        selected={selected}
        onSelect={handleSelect}
        month={displayMonth}
        onMonthChange={setDisplayMonth}
        disabled={(date) => disabled || isBefore(today, startOfDay(date))}
        numberOfMonths={1}
        className="rounded-lg border border-border"
      />
      
      {/* Reset button */}
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
