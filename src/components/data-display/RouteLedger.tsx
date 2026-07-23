'use client';

import { Table } from '@heroui/react';
import { Star } from 'lucide-react';
import type { ReactNode } from 'react';

import { highlightText } from '@/lib/highlightText';
import { cn, formatCurrencyFull } from '@/lib/utils';
import type { RouteDto } from '@/types/api';
import { RouteCard } from './RouteCard';

interface RouteLedgerProps {
  routes: RouteDto[];
  onRouteClick: (route: RouteDto) => void;
  onFavoriteToggle?: (lineCode: string) => void;
  isFavorite?: (lineCode: string) => boolean;
  highlightQuery?: string;
  ariaLabel?: string;
}

export function RouteLedger({
  routes,
  onRouteClick,
  onFavoriteToggle,
  isFavorite,
  highlightQuery = '',
  ariaLabel = '배차 노선 목록',
}: RouteLedgerProps) {
  const highlight = (text: string | null): ReactNode => {
    if (!text) return '-';
    return highlightQuery ? highlightText(text, highlightQuery) : text;
  };

  return (
    <>
      <div className="desktop-route-ledger route-table-shell">
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label={ariaLabel} className="min-w-[880px]">
              <Table.Header>
                {onFavoriteToggle && <Table.Column>즐겨찾기</Table.Column>}
                <Table.Column isRowHeader>노선코드</Table.Column>
                <Table.Column>노선명</Table.Column>
                <Table.Column>차량번호</Table.Column>
                <Table.Column>건수</Table.Column>
                <Table.Column>수량</Table.Column>
                <Table.Column>구간운임</Table.Column>
                <Table.Column>총 운임</Table.Column>
              </Table.Header>
              <Table.Body>
                {routes.map((route) => (
                  <Table.Row key={`${route.searchDate}-${route.lineCode}-${route.carCode ?? ''}`}>
                    {onFavoriteToggle && (
                      <Table.Cell>
                        <button
                          type="button"
                          className="flex size-11 items-center justify-center rounded-lg hover:bg-secondary"
                          aria-label={isFavorite?.(route.lineCode) ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                          onClick={() => onFavoriteToggle(route.lineCode)}
                        >
                          <Star
                            aria-hidden="true"
                            className={cn(
                              'size-4',
                              isFavorite?.(route.lineCode)
                                ? 'fill-[#9d6800] text-[#9d6800]'
                                : 'text-muted-foreground'
                            )}
                          />
                        </button>
                      </Table.Cell>
                    )}
                    <Table.Cell>
                      <button
                        type="button"
                        className="min-h-11 w-full text-left font-mono-num font-bold text-[#075f52]"
                        onClick={() => onRouteClick(route)}
                      >
                        {highlight(route.lineCode)}
                      </button>
                    </Table.Cell>
                    <Table.Cell>{highlight(route.lineName)}</Table.Cell>
                    <Table.Cell><span className="font-mono-num">{highlight(route.carNumber)}</span></Table.Cell>
                    <Table.Cell><span className="font-mono-num">{route.count.toLocaleString()}</span></Table.Cell>
                    <Table.Cell><span className="font-mono-num">{route.quantity.toLocaleString()}</span></Table.Cell>
                    <Table.Cell><span className="font-mono-num">{formatCurrencyFull(route.sectionFare)}</span></Table.Cell>
                    <Table.Cell><strong className="font-mono-num">{formatCurrencyFull(route.totalFare)}</strong></Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>

      <div className="mobile-route-cards">
        {routes.map((route) => (
          <RouteCard
            key={`${route.searchDate}-${route.lineCode}-${route.carCode ?? ''}`}
            route={route}
            onRouteClick={onRouteClick}
            onFavoriteToggle={onFavoriteToggle}
            isFavorite={isFavorite?.(route.lineCode)}
            highlightQuery={highlightQuery}
          />
        ))}
      </div>
    </>
  );
}
