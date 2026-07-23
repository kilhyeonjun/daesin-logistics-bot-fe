'use client';

import { Drawer } from '@heroui/react';
import { ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

import { formatCurrencyFull, formatDateString } from '@/lib/utils';
import type { RouteDto } from '@/types/api';

interface RouteDetailProps {
  route: RouteDto | null;
  open: boolean;
  onClose: () => void;
}

const ACTIONS = [
  ['raceInfoUrl', '운행기록'],
  ['carDetailUrl', '차량상세'],
  ['trackingUrl', '관제/위치'],
  ['waypointUrl', '경유지'],
] as const;

export function RouteDetail({ route, open, onClose }: RouteDetailProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  if (!route) return null;

  return (
    <Drawer.Backdrop
      isOpen={open}
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen) onClose();
      }}
      className="bg-[#172033]/35"
    >
      <Drawer.Content
        placement={isDesktop ? 'right' : 'bottom'}
        className={isDesktop ? 'w-[430px]' : 'max-h-[76dvh] rounded-t-2xl'}
      >
        <Drawer.Dialog>
          {!isDesktop && <Drawer.Handle />}
          <Drawer.CloseTrigger aria-label="상세 닫기" />
          <Drawer.Header className="border-b border-border px-5 py-4">
            <div>
              <p className="font-mono-num text-xs font-bold text-[#075f52]">{route.lineCode}</p>
              <Drawer.Heading className="mt-1 text-xl font-bold">
                {route.lineName || `노선 ${route.lineCode}`}
              </Drawer.Heading>
            </div>
          </Drawer.Header>
          <Drawer.Body className="space-y-5 px-5 py-5">
            <section aria-labelledby="route-basis-title">
              <h3 id="route-basis-title" className="mb-2 text-xs font-bold text-muted-foreground">
                배차 기준
              </h3>
              <dl className="detail-grid">
                <div className="detail-item">
                  <dt>조회일</dt>
                  <dd className="font-mono-num">{formatDateString(route.searchDate)}</dd>
                </div>
                <div className="detail-item">
                  <dt>노선코드</dt>
                  <dd className="font-mono-num">{route.lineCode}</dd>
                </div>
                <div className="detail-item">
                  <dt>노선명</dt>
                  <dd>{route.lineName || '-'}</dd>
                </div>
                <div className="detail-item">
                  <dt>차량코드</dt>
                  <dd className="font-mono-num">{route.carCode || '-'}</dd>
                </div>
                <div className="detail-item">
                  <dt>차량번호</dt>
                  <dd className="font-mono-num">{route.carNumber || '-'}</dd>
                </div>
                <div className="detail-item">
                  <dt>건수 / 수량</dt>
                  <dd className="font-mono-num">
                    {route.count.toLocaleString()} / {route.quantity.toLocaleString()}
                  </dd>
                </div>
                <div className="detail-item">
                  <dt>구간운임</dt>
                  <dd className="font-mono-num">{formatCurrencyFull(route.sectionFare)}</dd>
                </div>
              </dl>
              <div className="detail-total mt-3">
                <span>총 운임</span>
                <strong className="font-mono-num">{formatCurrencyFull(route.totalFare)}</strong>
              </div>
            </section>

            {ACTIONS.some(([key]) => route[key]) && (
              <section aria-labelledby="route-actions-title">
                <h3 id="route-actions-title" className="mb-2 text-xs font-bold text-muted-foreground">
                  외부 바로가기
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {ACTIONS.map(([key, label]) => route[key] && (
                    <a
                      key={key}
                      href={route[key] ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-border bg-white px-3 text-sm font-bold hover:bg-secondary"
                    >
                      <ExternalLink aria-hidden="true" className="size-4" />
                      {label}
                    </a>
                  ))}
                </div>
              </section>
            )}
          </Drawer.Body>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}
