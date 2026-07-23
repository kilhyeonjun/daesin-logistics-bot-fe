'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AppShell } from '@/components/layout';

function MigrationSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-24 rounded-xl" />
    </div>
  );
}

const MigrationManager = dynamic(
  () => import('@/components/migration').then((mod) => mod.MigrationManager),
  {
    loading: () => <MigrationSkeleton />,
    ssr: false,
  }
);

export default function AdminMigrationPage() {
  const router = useRouter();
  const { admin, isLoading, isAuthenticated, logout } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.replace('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background" aria-label="인증 상태 확인 중">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppShell
      title="데이터 마이그레이션"
      leftAction="back"
      hideBottomNav
      rightAction={
        <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            aria-label="로그아웃"
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="size-4" />
          </Button>
      }
    >
      <div className="px-4 py-5 lg:px-8 lg:py-5">
        <p className="mb-4 text-sm text-muted-foreground">
          로그인 계정: <strong className="text-foreground">{admin?.name || admin?.email}</strong>
        </p>
        <MigrationManager />
      </div>
    </AppShell>
  );
}
