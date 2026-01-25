'use client';

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
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {!hideHeader && (
        <Header
          title={title}
          leftAction={leftAction}
          rightAction={rightAction}
          transparent={transparentHeader}
        />
      )}

      <main
        className={cn(
          'flex-1',
          !hideHeader && 'pt-0',
          !hideBottomNav && 'pb-14',
          className
        )}
      >
        {children}
      </main>

      {!hideBottomNav && <BottomNav />}
    </div>
  );
}
