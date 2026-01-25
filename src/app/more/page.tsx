import { ExternalLink, Info } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { MigrationManager } from '@/components/migration';
import packageJson from '../../../package.json';

const EXTERNAL_LINKS = [
  {
    id: 'original',
    label: '기존 PC 사이트',
    href: 'http://logistics.ds3211.co.kr/daesin/servlet/total.TotServlet?mode=0&work=0&menuid=27&level=01',
    description: '대신물류 배차현황 PC 버전',
  },
] as const;

export default function MorePage() {
  return (
    <AppShell title="더보기">
      <div className="px-4 py-4 space-y-6 page-enter">
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

        <MigrationManager />

        <div className="rounded-xl bg-card border border-border/50 p-4">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">대신물류 배차현황</p>
              <p className="text-sm text-muted-foreground">버전 {packageJson.version}</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
