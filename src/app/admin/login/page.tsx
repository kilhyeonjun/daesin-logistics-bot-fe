'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/admin/migration');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.replace('/admin/migration');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background" aria-label="인증 상태 확인 중">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <main className="admin-login-shell grid lg:grid-cols-[minmax(420px,42%)_1fr]">
      <section className="bg-primary px-5 py-7 text-white lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div>
          <Link href="/" className="inline-flex min-h-11 items-center gap-3 font-bold">
            <span className="grid size-10 place-items-center rounded-[10px] bg-accent text-xs">대신</span>
            대신물류
          </Link>
          <h1 className="mt-6 max-w-md text-[25px] font-bold leading-tight lg:mt-28 lg:text-4xl">
            배차 운영 데이터를 안전하게 관리합니다
          </h1>
          <p className="mt-3 max-w-md text-sm text-[#aebad0]">
            관리자 인증 후 기간별 마이그레이션 작업을 생성하고 상태를 확인할 수 있습니다.
          </p>
        </div>
        <small className="mt-6 hidden text-xs text-[#8493aa] lg:block">Daesin Dispatch Control Ledger</small>
      </section>

      <section className="grid place-items-start px-4 py-6 md:place-items-center md:p-8">
        <div className="w-full max-w-[420px] rounded-2xl border border-border bg-white p-5 lg:p-7">
          <div className="mb-5 grid size-11 place-items-center rounded-xl bg-[#e7f6f2]">
            <Lock className="size-5 text-[#075f52]" />
          </div>
          <h2 className="text-2xl font-bold">관리자 로그인</h2>
          <p className="mt-1 text-sm text-muted-foreground">관리자 계정으로 로그인하세요.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-bold">이메일</label>
            <Input
              id="email"
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-12"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-bold">비밀번호</label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="h-12"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12"
            disabled={isSubmitting || !email || !password}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                로그인 중...
              </>
            ) : (
              '로그인'
            )}
          </Button>
          </form>

          <div className="mt-3 text-center">
            <Link href="/" className="inline-flex min-h-11 items-center text-sm font-bold text-muted-foreground hover:text-foreground">
            ← 메인으로 돌아가기
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
