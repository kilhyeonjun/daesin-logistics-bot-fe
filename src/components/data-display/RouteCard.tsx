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

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle?.(route.lineCode);
  }, [onFavoriteToggle, route.lineCode]);

  const highlight = (text: string | null): ReactNode => {
    if (!text) return null;
    if (!highlightQuery) return text;
    return highlightText(text, highlightQuery);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'w-full text-left rounded-xl bg-card p-4 shadow-sm',
        'border border-border/50',
        'touch-feedback transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground font-mono-num">
              {highlight(route.lineCode)}
            </span>
            {onFavoriteToggle && (
              <button
                type="button"
                onClick={handleFavoriteClick}
                className="flex items-center justify-center min-w-[44px] min-h-[44px] -m-2 touch-feedback"
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
  );
});

RouteCard.displayName = 'RouteCard';
