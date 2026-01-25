import { ExternalLink } from 'lucide-react';
import { AppShell } from '@/components/layout';

const EXTERNAL_LINKS = [
  {
    id: 'original',
    label: '기존 PC 사이트',
    href: 'http://logistics.ds3211.co.kr/daesin/servlet/total.TotServlet?mode=0&work=0&menuid=27&level=01',
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
  return (
    <AppShell title="더보기">
      <div className="px-4 py-4 page-enter">
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
      </div>
    </AppShell>
  );
}
