# FE Improvements: Agentation 제거, 관리자 링크, Middleware→Proxy 마이그레이션

## Context

### Original Request
3가지 프론트엔드 개선사항:
1. 프로덕션에서 Agentation dev toolbar 제거 (하단 네비게이션 클릭 방해)
2. 더보기 페이지에 관리자 로그인 링크 추가
3. Next.js 16 middleware.ts → proxy.ts 마이그레이션

### Interview Summary
**Key Findings from Research:**
- `AgentationProvider.tsx`는 이미 `NODE_ENV !== 'development'` 가드가 있으나, 번들에 포함되어 프로덕션에서도 DOM을 차지할 가능성 있음. 완전 제거 또는 dynamic import 필요.
- `더보기` 페이지(`src/app/more/page.tsx`)는 외부 링크 목록 + 버전 정보만 표시. 관리자 진입점 없음.
- `src/middleware.ts`는 `/admin/*` 경로에 대한 쿠키 기반 인증 체크. Next.js 16에서 deprecated된 `middleware` convention 사용 중.
- Next.js 16 공식 마이그레이션: 파일명 `middleware.ts` → `proxy.ts`, export `middleware` → `proxy`, config `matcher` 그대로 사용 가능. `npx @next/codemod@latest middleware-to-proxy .` 코드모드 제공.

---

## Work Objectives

### Core Objective
프로덕션 품질 개선 3건: toolbar 간섭 제거, 관리자 접근성 개선, deprecated API 제거.

### Concrete Deliverables
- Agentation 의존성 및 Provider 프로덕션 번들에서 완전 제거
- 더보기 페이지에 관리자 로그인 링크 UI 추가
- `middleware.ts` → `proxy.ts` 마이그레이션 완료 (deprecation 경고 제거)

### Definition of Done
- [ ] 프로덕션 빌드(`next build`)에서 agentation 관련 코드 없음
- [ ] 더보기 페이지에서 "관리자" 링크 클릭 → `/admin/login`으로 이동
- [ ] `middleware.ts` 파일이 존재하지 않고 `proxy.ts`로 동작
- [ ] `next build` 성공, deprecation 경고 없음

### Must Have
- 하단 네비게이션이 Agentation toolbar에 의해 가려지지 않아야 함
- 관리자 링크는 일반 사용자에게 눈에 띄지 않되, 접근 가능해야 함
- 기존 `/admin/*` 인증 보호 동작이 proxy 전환 후에도 동일하게 유지

### Must NOT Have (Guardrails)
- Agentation 개발 모드 기능은 유지 (dev에서는 계속 사용 가능)
- 관리자 링크에 비밀번호/인증 보호 불필요 (로그인 페이지 자체가 보호)
- middleware 로직 변경 없음 (단순 convention 마이그레이션만)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (테스트 프레임워크 미설정)
- **User wants tests**: Manual-only
- **Framework**: none

### Manual QA
각 TODO에 수동 검증 절차 포함. 주요 검증:
- `next build` 성공 여부
- 브라우저에서 UI 동작 확인
- DevTools Network/Elements 탭으로 번들 크기 및 DOM 확인

---

## Task Flow

```
Task 1 (Agentation 제거) ─┐
Task 2 (관리자 링크)      ├─→ Task 4 (빌드 검증)
Task 3 (Proxy 마이그레이션) ─┘
```

## Parallelization

| Group | Tasks | Reason |
|-------|-------|--------|
| A | 1, 2, 3 | 독립적인 파일 변경 |

| Task | Depends On | Reason |
|------|------------|--------|
| 4 | 1, 2, 3 | 전체 빌드 검증 |

---

## TODOs

- [ ] 1. Agentation 프로덕션 번들에서 완전 제거

  **What to do**:
  - `src/providers/AgentationProvider.tsx` 수정: 현재 `process.env.NODE_ENV !== 'development'`로 null 반환하지만, `agentation` 패키지가 프로덕션 번들에 포함됨
  - **방법 A (권장)**: dynamic import + dev-only 로딩
    ```tsx
    'use client';
    import dynamic from 'next/dynamic';

    const Agentation = dynamic(
      () => import('agentation').then(mod => ({ default: mod.Agentation })),
      { ssr: false }
    );

    export function AgentationProvider() {
      if (process.env.NODE_ENV !== 'development') return null;
      return <Agentation />;
    }
    ```
  - **방법 B (더 확실)**: `agentation` 패키지를 `devDependencies`로 이동 + 조건부 import
    - `package.json`: `"agentation"` → `devDependencies`로 이동
    - Provider에서 try/catch 또는 optional require 사용
  - **방법 C (가장 단순, 권장)**: `agentation`을 `devDependencies`로 이동하고, Provider 파일을 dev 전용으로 조건부 렌더링
    - `package.json`에서 `agentation`을 `devDependencies`로 이동
    - `AgentationProvider.tsx`는 현재 코드 유지 (NODE_ENV 체크 이미 있음)
    - Next.js는 `devDependencies`를 프로덕션 빌드에서 tree-shake 함

  **결정**: 방법 A (dynamic import) 사용. 가장 안전하고 확실하게 번들에서 제거됨. 추가로 `agentation`을 `devDependencies`로 이동.

  **Must NOT do**:
  - dev 모드에서 Agentation 기능 제거하지 않기
  - layout.tsx에서 AgentationProvider 자체를 제거하지 않기 (dev에서 필요)

  **Parallelizable**: YES (with 2, 3)

  **References**:
  - `src/providers/AgentationProvider.tsx` - 현재 Provider 구현 (12줄). NODE_ENV 가드 있지만 static import로 번들 포함됨
  - `src/app/layout.tsx:37` - `<AgentationProvider />` 사용 위치. body 닫는 태그 직전에 위치
  - `package.json:19` - `"agentation": "^1.3.2"` 현재 dependencies에 위치

  **Acceptance Criteria**:
  - [ ] `pnpm build` 성공
  - [ ] 프로덕션 빌드 결과물에서 "agentation" 문자열 검색 → 번들에 포함되지 않음 확인
  - [ ] `pnpm dev`에서 Agentation toolbar 정상 표시 확인

  **Commit**: YES
  - Message: `fix: remove agentation from production bundle`
  - Files: `src/providers/AgentationProvider.tsx`, `package.json`, `pnpm-lock.yaml`

---

- [ ] 2. 더보기 페이지에 관리자 로그인 링크 추가

  **What to do**:
  - `src/app/more/page.tsx` 수정
  - 버전 정보 섹션 아래에 관리자 진입 링크 추가
  - 디자인: 기존 카드 스타일과 일관되게, 그러나 눈에 띄지 않는 위치 (페이지 하단)
  - `Shield` 또는 `Settings` 아이콘 (lucide-react) + "관리자" 텍스트
  - Link 컴포넌트로 `/admin/login` 연결
  - 코드 예시:
    ```tsx
    import { Shield } from 'lucide-react';
    import Link from 'next/link';

    // 버전 정보 div 아래에 추가:
    <Link
      href="/admin/login"
      className="flex items-center justify-between rounded-xl bg-card border border-border/50 p-4 touch-feedback hover:shadow-sm"
    >
      <div className="flex items-center gap-3">
        <Shield className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="font-medium">관리자</p>
          <p className="text-sm text-muted-foreground">관리자 페이지로 이동</p>
        </div>
      </div>
    </Link>
    ```

  **Must NOT do**:
  - 관리자 링크를 너무 눈에 띄게 만들지 않기 (accent 색상 등 사용 금지)
  - 링크에 인증 로직 추가하지 않기 (middleware/proxy가 처리)

  **Parallelizable**: YES (with 1, 3)

  **References**:
  - `src/app/more/page.tsx` - 현재 더보기 페이지 (49줄). `EXTERNAL_LINKS` 배열 + 버전 정보 카드로 구성
  - `src/app/admin/login/page.tsx` - 관리자 로그인 페이지. 이메일/비밀번호 폼 + "메인으로 돌아가기" 링크
  - `src/components/layout/AppShell.tsx` - 더보기 페이지에서 사용하는 레이아웃 쉘
  - 기존 외부 링크 카드 UI 패턴 (`rounded-xl bg-card border border-border/50 p-4 touch-feedback`) 참고

  **Acceptance Criteria**:
  - [ ] 더보기 페이지 하단에 "관리자" 링크 카드 표시됨
  - [ ] 링크 클릭 시 `/admin/login` 페이지로 이동
  - [ ] 기존 UI 스타일과 일관됨
  - [ ] 모바일 뷰포트(390x844)에서 정상 표시

  **Commit**: YES
  - Message: `feat(more): add admin login link to more page`
  - Files: `src/app/more/page.tsx`

---

- [ ] 3. middleware.ts → proxy.ts 마이그레이션 (Next.js 16)

  **What to do**:
  - **옵션 1 (자동, 권장)**: Next.js 공식 코드모드 실행
    ```bash
    npx @next/codemod@latest middleware-to-proxy .
    ```
    이 명령은 자동으로:
    - `src/middleware.ts` → `src/proxy.ts` 파일명 변경
    - `export function middleware()` → `export function proxy()` 함수명 변경
    - next.config 관련 플래그 업데이트 (해당사항 없음, 현재 config에 middleware 관련 설정 없음)

  - **옵션 2 (수동)**: 코드모드가 실패할 경우
    1. `src/middleware.ts`를 `src/proxy.ts`로 rename
    2. 파일 내용 수정:
       ```typescript
       import { NextResponse } from 'next/server';
       import type { NextRequest } from 'next/server';

       export function proxy(request: NextRequest) {
         const token = request.cookies.get('admin_token')?.value;
         const pathname = request.nextUrl.pathname;

         if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
           if (!token) {
             return NextResponse.redirect(new URL('/admin/login', request.url));
           }
         }

         if (pathname === '/admin/login' && token) {
           return NextResponse.redirect(new URL('/admin/migration', request.url));
         }

         return NextResponse.next();
       }

       export const config = {
         matcher: ['/admin/:path*'],
       };
       ```
    3. `next.config.ts` 확인: 현재 middleware 관련 설정 없으므로 변경 불필요

  **Must NOT do**:
  - 인증 로직 변경하지 않기 (동일 동작 유지)
  - `matcher` 패턴 변경하지 않기
  - edge runtime 관련 설정 추가하지 않기 (proxy는 nodejs 런타임만 지원)

  **Parallelizable**: YES (with 1, 2)

  **References**:
  - `src/middleware.ts` - 현재 middleware 파일 (24줄). `/admin/*` 경로 보호, `admin_token` 쿠키 체크
  - `next.config.ts` - 현재 빈 설정 (middleware 관련 플래그 없음)
  - Next.js 16 공식 마이그레이션 문서: `middleware` filename deprecated → `proxy` convention. `npx @next/codemod@latest middleware-to-proxy .` 사용 가능
  - proxy.ts는 `nodejs` 런타임 사용 (edge 미지원). NextRequest/NextResponse 그대로 사용 가능

  **Acceptance Criteria**:
  - [ ] `src/middleware.ts` 파일이 존재하지 않음
  - [ ] `src/proxy.ts` 파일이 존재하고, `export function proxy()` export
  - [ ] `pnpm build` 성공, middleware deprecation 경고 없음
  - [ ] `/admin/migration` URL 직접 접근 시 (로그인 안 한 상태) → `/admin/login`으로 리다이렉트
  - [ ] `/admin/login` URL 접근 시 (이미 로그인 상태) → `/admin/migration`으로 리다이렉트

  **Commit**: YES
  - Message: `refactor: migrate middleware.ts to proxy.ts convention (Next.js 16)`
  - Files: `src/proxy.ts` (new), `src/middleware.ts` (deleted)

---

- [ ] 4. 최종 빌드 검증

  **What to do**:
  - `pnpm build` 실행하여 전체 빌드 성공 확인
  - deprecation 경고 없음 확인
  - 빌드 출력에서 agentation 관련 번들 크기 확인

  **Parallelizable**: NO (depends on 1, 2, 3)

  **References**:
  - `package.json:7` - `"build": "next build"` 빌드 스크립트

  **Acceptance Criteria**:
  - [ ] `pnpm build` exit code 0
  - [ ] 빌드 출력에 deprecation warning 없음
  - [ ] 빌드 출력에 error 없음

  **Commit**: NO (검증 단계)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `fix: remove agentation from production bundle` | AgentationProvider.tsx, package.json | pnpm build |
| 2 | `feat(more): add admin login link to more page` | more/page.tsx | pnpm build |
| 3 | `refactor: migrate middleware.ts to proxy.ts convention (Next.js 16)` | proxy.ts, middleware.ts (del) | pnpm build |

---

## Success Criteria

### Verification Commands
```bash
pnpm build                    # Expected: Build 성공, 경고 없음
ls src/proxy.ts               # Expected: 파일 존재
ls src/middleware.ts 2>&1      # Expected: No such file
```

### Final Checklist
- [ ] Agentation이 프로덕션 번들에서 제거됨
- [ ] 더보기 페이지에 관리자 링크 표시됨
- [ ] middleware.ts → proxy.ts 마이그레이션 완료
- [ ] 전체 빌드 성공
- [ ] 하단 네비게이션 정상 클릭 가능
