'use client';

import { ExternalLink, Info, RefreshCw } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';

const EXTERNAL_LINKS = [
  {
    id: 'original',
    label: '기존 PC 사이트',
    href: 'http://logistics.ds3211.co.kr',
    description: '대신물류 배차현황 PC 버전',
  },
  {
    id: 'mobile',
    label: '모바일 경유지 조회',
    href: 'http://www.ds3211.co.kr/mobile/loadPlan/list.jsp',
    description: '경유지 목록 조회 (모바일)',
  },
] as const;

export default function MorePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <AppShell title="더보기">
      <div className="px-4 py-4 space-y-6 page-enter">
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">외부 링크</h2>
          <div className="space-y-2">
            {EXTERNAL_LINKS.map((link) => (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl bg-card border border-border/50 p-4 touch-feedback hover:shadow-sm"
              >
                <div>
                  <p className="font-medium">{link.label}</p>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </div>
                <ExternalLink className="h-5 w-5 text-muted-foreground" />
              </a>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">앱 정보</h2>
          <div className="rounded-xl bg-card border border-border/50 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">대신물류 배차현황</p>
                <p className="text-sm text-muted-foreground">버전 1.0.0</p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
              새로고침
            </Button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
