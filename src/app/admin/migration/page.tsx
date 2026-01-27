'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks';
import { MigrationManager } from '@/components/migration';
import { Button } from '@/components/ui/button';

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <a href="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-5" />
            </a>
            <div>
              <h1 className="font-semibold">데이터 마이그레이션</h1>
              <p className="text-xs text-muted-foreground">
                {admin?.name || admin?.email}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="size-4 mr-1" />
            로그아웃
          </Button>
        </div>
      </header>

      <main className="px-4 py-4">
        <MigrationManager />
      </main>
    </div>
  );
}
