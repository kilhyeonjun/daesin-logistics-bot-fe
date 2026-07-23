'use client';

import { memo, useCallback, ReactNode } from 'react';
import { Truck, Star } from 'lucide-react';
import type { RouteDto } from '@/types/api';
import { cn, formatCurrencyAbbreviated } from '@/lib/utils';
import { highlightText } from '@/lib/highlightText';

interface RouteCardProps {
  route: RouteDto;
  onRouteClick?: (route: RouteDto) => void;
  onFavoriteToggle?: (lineCode: string) => void;
  isFavorite?: boolean;
  highlightQuery?: string;
  className?: string;
}

export const RouteCard = memo(function RouteCard({
  route,
  onRouteClick,
  onFavoriteToggle,
  isFavorite = false,
  highlightQuery = '',
  className,
}: RouteCardProps) {
  const handleClick = useCallback(() => {
    onRouteClick?.(route);
  }, [onRouteClick, route]);

  const handleFavoriteClick = useCallback(() => {
    onFavoriteToggle?.(route.lineCode);
  }, [onFavoriteToggle, route.lineCode]);

  const highlight = (text: string | null): ReactNode => {
    if (!text) return null;
    if (!highlightQuery) return text;
    return highlightText(text, highlightQuery);
  };

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-xl bg-card shadow-sm',
        'border border-border/50',
        'transition-shadow hover:shadow-md',
        className
      )}
    >
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'w-full p-4 text-left touch-feedback focus-ring',
          onFavoriteToggle && 'pr-16'
        )}
      >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground font-mono-num">
              {highlight(route.lineCode)}
            </span>
          </div>

          {route.lineName && (
            <p className="mt-1 text-sm text-muted-foreground truncate">
              {highlight(route.lineName)}
            </p>
          )}

          {route.carNumber && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Truck className="h-3.5 w-3.5" />
              <span>{highlight(route.carNumber)}</span>
            </div>
          )}
        </div>

        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-accent font-mono-num">
            ₩{formatCurrencyAbbreviated(route.totalFare)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">건수</span>
          <span className="font-semibold font-mono-num">{route.count.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">수량</span>
          <span className="font-semibold font-mono-num">{route.quantity.toLocaleString()}</span>
        </div>
      </div>
      </button>

      {onFavoriteToggle && (
        <button
          type="button"
          onClick={handleFavoriteClick}
          className="absolute right-2 top-2 flex min-h-11 min-w-11 items-center justify-center rounded-lg touch-feedback focus-ring hover:bg-secondary"
          aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        >
          <Star
            className={cn(
              'h-4 w-4 transition-colors',
              isFavorite
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground hover:text-yellow-400'
            )}
          />
        </button>
      )}
    </div>
  );
});

RouteCard.displayName = 'RouteCard';
