'use client';

import { Share2, Truck, Package, Hash, Banknote, ExternalLink, MapPin, FileText, Route } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { RouteDto } from '@/types/api';
import { formatCurrencyFull, formatDateString } from '@/lib/utils';

interface RouteDetailProps {
  route: RouteDto | null;
  open: boolean;
  onClose: () => void;
}

export function RouteDetail({ route, open, onClose }: RouteDetailProps) {
  if (!route) return null;

  const handleShare = async () => {
    const shareData = {
      title: `노선 ${route.lineCode}`,
      text: `${route.lineName || route.lineCode}\n총운임: ${formatCurrencyFull(route.totalFare)}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled or share failed - not critical
        console.debug('Share cancelled or failed:', error);
      }
    } else {
      await navigator.clipboard.writeText(
        `${shareData.title}\n${shareData.text}`
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh]" showCloseButton={false}>
        <div className="mx-auto w-12 h-1.5 rounded-full bg-muted mb-4" />

        <SheetHeader className="p-0 pb-4">
          <SheetTitle className="text-xl font-bold font-mono-num">
            {route.lineCode}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {route.lineName || `노선 ${route.lineCode} 상세 정보`}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 overflow-y-auto">
          <div className="text-xs text-muted-foreground">
            조회일: {formatDateString(route.searchDate)}
          </div>

          {(route.carNumber || route.carCode) && (
            <div className="rounded-lg bg-secondary/50 p-3">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <Truck className="h-4 w-4" />
                차량정보
              </div>
              <div className="space-y-1 text-sm">
                {route.carNumber && (
                  <p>
                    <span className="text-muted-foreground">차량번호:</span>{' '}
                    <span className="font-medium">{route.carNumber}</span>
                  </p>
                )}
                {route.carCode && (
                  <p>
                    <span className="text-muted-foreground">차량코드:</span>{' '}
                    <span className="font-mono-num">{route.carCode}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="rounded-lg bg-secondary/50 p-3">
            <div className="flex items-center gap-2 text-sm font-medium mb-3">
              <Package className="h-4 w-4" />
              배송현황
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                  <Hash className="h-3 w-3" />
                  건수
                </div>
                <p className="text-lg font-bold font-mono-num">
                  {route.count.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                  <Package className="h-3 w-3" />
                  수량
                </div>
                <p className="text-lg font-bold font-mono-num">
                  {route.quantity.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                  <Banknote className="h-3 w-3" />
                  구간운임
                </div>
                <p className="text-lg font-bold font-mono-num">
                  {formatCurrencyFull(route.sectionFare)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-accent/10 border border-accent/20 p-4">
            <p className="text-sm text-muted-foreground mb-1">총 운임</p>
            <p className="text-2xl font-bold text-accent font-mono-num">
              {formatCurrencyFull(route.totalFare)}
            </p>
          </div>

          {(route.raceInfoUrl || route.carDetailUrl || route.trackingUrl || route.waypointUrl) && (
            <div className="rounded-lg bg-secondary/50 p-3">
              <div className="flex items-center gap-2 text-sm font-medium mb-3">
                <ExternalLink className="h-4 w-4" />
                바로가기
              </div>
              <div className="grid grid-cols-2 gap-2">
                {route.raceInfoUrl && (
                  <a
                    href={route.raceInfoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg bg-card border border-border/50 p-3 text-sm font-medium touch-feedback hover:bg-secondary transition-colors"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    운행기록
                  </a>
                )}
                {route.carDetailUrl && (
                  <a
                    href={route.carDetailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg bg-card border border-border/50 p-3 text-sm font-medium touch-feedback hover:bg-secondary transition-colors"
                  >
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    차량상세
                  </a>
                )}
                {route.trackingUrl && (
                  <a
                    href={route.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg bg-card border border-border/50 p-3 text-sm font-medium touch-feedback hover:bg-secondary transition-colors"
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    관제/위치
                  </a>
                )}
                {route.waypointUrl && (
                  <a
                    href={route.waypointUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg bg-card border border-border/50 p-3 text-sm font-medium touch-feedback hover:bg-secondary transition-colors"
                  >
                    <Route className="h-4 w-4 text-muted-foreground" />
                    경유지
                  </a>
                )}
              </div>
            </div>
          )}

          <Button
            onClick={handleShare}
            variant="outline"
            className="w-full gap-2"
          >
            <Share2 className="h-4 w-4" />
            공유하기
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
