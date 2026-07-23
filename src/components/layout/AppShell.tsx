'use client';

import { BarChart3, Home, MoreHorizontal, Search, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: ReactNode;
  title?: string;
  leftAction?: 'back' | 'menu' | ReactNode;
  rightAction?: ReactNode;
  hideHeader?: boolean;
  hideBottomNav?: boolean;
  className?: string;
  transparentHeader?: boolean;
}

export function AppShell({
  children,
  title,
  leftAction,
  rightAction,
  hideHeader = false,
  hideBottomNav = false,
  className,
  transparentHeader = false,
}: AppShellProps) {
  const pathname = usePathname();
  const pageTitle = title === '대신물류' ? '배차현황' : title;
  const navItems = [
    { href: '/', label: '배차현황', icon: Home },
    { href: '/search', label: '검색', icon: Search },
    { href: '/stats', label: '통계', icon: BarChart3 },
    { href: '/more', label: '더보기', icon: MoreHorizontal },
  ] as const;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">본문으로 건너뛰기</a>

      <aside className="ledger-sidebar" aria-label="데스크톱 주요 탐색">
        <Link className="sidebar-brand" href="/">
          <span className="sidebar-mark" aria-hidden="true">대신</span>
          <span>
            <strong>대신물류</strong>
            <span>배차 운영 원장</span>
          </span>
        </Link>
        <p className="sidebar-label">주요 메뉴</p>
        <nav className="sidebar-nav">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                className="sidebar-link"
                href={href}
                aria-current={active ? 'page' : undefined}
              >
                <Icon aria-hidden="true" className="size-5" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-admin">
          <Link
            className="sidebar-link"
            href="/admin/login"
            aria-current={pathname.startsWith('/admin') ? 'page' : undefined}
          >
            <Shield aria-hidden="true" className="size-5" />
            관리자
          </Link>
        </div>
      </aside>

      <div className="ledger-workspace">
      {!hideHeader && (
        <Header
          title={title}
          leftAction={leftAction}
          rightAction={rightAction}
          transparent={transparentHeader}
        />
      )}

      <div className="ledger-page-heading">
        <p>DISPATCH CONTROL LEDGER</p>
        <h1>{pageTitle}</h1>
      </div>

      <main
        id="main-content"
        className={cn(
          'ledger-main',
          className
        )}
      >
        {children}
      </main>

      {!hideBottomNav && <BottomNav />}
      </div>
    </div>
  );
}
