import { ExternalLink, Info, Shield } from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout';
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
      <div className="grid gap-4 px-4 py-5 page-enter lg:grid-cols-[1.15fr_.85fr] lg:px-8 lg:py-5">
        <section className="overflow-hidden rounded-xl border border-border bg-white" aria-labelledby="service-links-title">
          <h2 id="service-links-title" className="border-b border-border bg-[#f0f3f7] px-4 py-4 text-lg font-bold">
            서비스
          </h2>
          {EXTERNAL_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[82px] items-center justify-between gap-4 border-b border-border p-4 touch-feedback hover:bg-secondary"
            >
              <div>
                <p className="font-medium">{link.label}</p>
                <p className="text-sm text-muted-foreground">{link.description}</p>
              </div>
              <ExternalLink className="h-5 w-5 text-muted-foreground" />
            </a>
          ))}
          <Link
            href="/admin/login"
            className="flex min-h-[82px] items-center justify-between gap-4 p-4 touch-feedback hover:bg-secondary"
          >
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">관리자</p>
                <p className="text-sm text-muted-foreground">인증 후 마이그레이션 작업 관리</p>
              </div>
            </div>
          </Link>
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-white" aria-labelledby="product-info-title">
          <h2 id="product-info-title" className="border-b border-border bg-[#f0f3f7] px-4 py-4 text-lg font-bold">
            제품 정보
          </h2>
          <div className="flex min-h-[82px] items-center gap-3 p-4">
            <Info className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">대신물류 배차현황</p>
              <p className="text-sm text-muted-foreground">버전 {packageJson.version}</p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
