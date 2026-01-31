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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm safe-bottom" aria-label="메인 네비게이션">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-around">
        {navItems.map(({ href, icon: Icon, label, ariaLabel }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              aria-label={ariaLabel}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-1 touch-feedback',
                'transition-colors duration-200',
                isActive
                  ? 'text-accent'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-transform duration-200',
                  isActive && 'scale-110'
                )}
                strokeWidth={isActive ? 2.5 : 2}
                aria-hidden="true"
              />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
