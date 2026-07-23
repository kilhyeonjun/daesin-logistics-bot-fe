'use client';

import { Home, Search, BarChart3, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: '홈', ariaLabel: '홈 페이지' },
  { href: '/search', icon: Search, label: '검색', ariaLabel: '검색 페이지' },
  { href: '/stats', icon: BarChart3, label: '통계', ariaLabel: '통계 페이지' },
  { href: '/more', icon: MoreHorizontal, label: '더보기', ariaLabel: '더보기 메뉴' },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-navigation" aria-label="모바일 주요 탐색">
        {navItems.map(({ href, icon: Icon, label, ariaLabel }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              aria-label={ariaLabel}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex-col touch-feedback',
                !isActive && 'hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5'
                )}
                strokeWidth={isActive ? 2.4 : 2}
                aria-hidden="true"
              />
              <span>{label}</span>
            </Link>
          );
        })}
    </nav>
  );
}
