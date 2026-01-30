'use client';

import * as React from 'react';
import { Loader2, Play } from 'lucide-react';
import { isBefore, parse, isValid } from 'date-fns';

import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/input/DateRangePicker';

interface NewMigrationFormProps {
  onSubmit: (startDate: string, endDate: string) => void;
  isSubmitting: boolean;
  disabled?: boolean;
  error?: string | null;
}

export function NewMigrationForm({
  onSubmit,
  isSubmitting,
  disabled = false,
  error,
}: NewMigrationFormProps) {
  const [startDate, setStartDate] = React.useState<string | null>(null);
  const [endDate, setEndDate] = React.useState<string | null>(null);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const handleDateChange = (start: string | null, end: string | null) => {
    setStartDate(start);
    setEndDate(end);
    setValidationError(null);
  };

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      setValidationError('시작일과 종료일을 모두 선택해주세요.');
      return;
    }

    const start = parse(startDate, 'yyyyMMdd', new Date());
    const end = parse(endDate, 'yyyyMMdd', new Date());

    if (!isValid(start) || !isValid(end)) {
      setValidationError('날짜 형식이 올바르지 않습니다.');
      return;
    }

    if (isBefore(end, start)) {
      setValidationError('종료일은 시작일 이후여야 합니다.');
      return;
    }

    // 날짜 제한 제거 - 백엔드에서 처리

    onSubmit(startDate, endDate);
  };

  const isFormDisabled = disabled || isSubmitting;

  return (
    <div className="space-y-4">
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
        disabled={isFormDisabled}
      />

      {(validationError || error) && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          {validationError || error}
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={isFormDisabled || !startDate || !endDate}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            시작 중...
          </>
        ) : (
          <>
            <Play className="size-4" />
            마이그레이션 시작
          </>
        )}
      </Button>

      {disabled && (
        <p className="text-xs text-muted-foreground text-center">
          진행 중인 마이그레이션이 있습니다. 완료 후 새로 시작할 수 있습니다.
        </p>
      )}
    </div>
  );
}
