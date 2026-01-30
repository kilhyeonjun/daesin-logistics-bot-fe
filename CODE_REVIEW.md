# 대신물류 배차현황 프론트엔드 - 종합 코드 리뷰

> **리뷰 일시**: 2026년 1월 30일  
> **프로젝트**: daesin-logistics-bot-fe  
> **코드량**: 3,422 lines (48 TypeScript 파일)

---

## 목차

1. [Executive Summary](#1-executive-summary)
2. [프로젝트 구조](#2-프로젝트-구조)
3. [컴포넌트 설계](#3-컴포넌트-설계)
4. [커스텀 훅 패턴](#4-커스텀-훅-패턴)
5. [API 레이어](#5-api-레이어)
6. [타입 안전성](#6-타입-안전성)
7. [성능 분석](#7-성능-분석)
8. [개선 권장사항](#8-개선-권장사항)
9. [결론](#9-결론)

---

## 1. Executive Summary

### 종합 점수: **8.1/10** ⭐⭐⭐⭐

| 영역 | 점수 | 상태 |
|------|------|------|
| 프로젝트 구조 | 9/10 | 🟢 우수 |
| 컴포넌트 설계 | 8.5/10 | 🟢 우수 |
| 커스텀 훅 | 8.5/10 | 🟢 우수 |
| API 레이어 | 8/10 | 🟢 양호 |
| 타입 안전성 | 9.3/10 | 🟢 우수 |
| 성능 최적화 | 6.3/10 | 🟡 개선 필요 |

### 핵심 강점
- ✅ TypeScript strict mode 완벽 적용 (any 사용 0건)
- ✅ React Query 기반 서버 상태 관리
- ✅ shadcn/ui + Tailwind CSS 일관된 스타일링
- ✅ 명확한 디렉토리 구조 (Feature-based + Atomic Design 하이브리드)
- ✅ 훅의 의존성 배열 관리 우수

### 핵심 개선점
- ⚠️ React.memo 미적용으로 불필요한 리렌더링 발생
- ⚠️ 인라인 함수 핸들러로 메모이제이션 무효화
- ⚠️ 코드 스플리팅 미적용
- ⚠️ Error Boundary 부재

---

## 2. 프로젝트 구조

### 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | 16.1.4 |
| UI 라이브러리 | React | 19.2.3 |
| 언어 | TypeScript | 5.x |
| 패키지 매니저 | pnpm | - |
| 스타일링 | Tailwind CSS | 4.x |
| 컴포넌트 | shadcn/ui (Radix UI) | - |
| 상태관리 | React Query | 5.90.20 |
| 아이콘 | Lucide React | - |
| 차트 | Recharts | - |
| 배포 | Vercel | - |

### 디렉토리 구조

```
src/
├── app/                      # Next.js App Router 페이지
│   ├── layout.tsx            # 루트 레이아웃 (프로바이더 설정)
│   ├── page.tsx              # 홈페이지 (메인 대시보드)
│   ├── globals.css           # 전역 스타일
│   ├── admin/                # 관리자 섹션
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── migration/page.tsx
│   ├── search/page.tsx       # 검색 페이지
│   ├── stats/page.tsx        # 통계 페이지
│   └── more/page.tsx         # 더보기 페이지
├── components/               # React 컴포넌트
│   ├── ui/                   # shadcn/ui 기본 컴포넌트
│   ├── layout/               # 레이아웃 컴포넌트
│   ├── input/                # 입력 컴포넌트
│   ├── data-display/         # 데이터 표시 컴포넌트
│   └── migration/            # 마이그레이션 전용 컴포넌트
├── hooks/                    # 커스텀 React 훅
├── providers/                # Context 프로바이더
├── lib/                      # 유틸리티
│   ├── api.ts                # API 클라이언트
│   └── utils.ts              # 헬퍼 함수
└── types/                    # TypeScript 타입 정의
    └── api.ts                # API 타입 정의
```

### 구조 평가: 9/10 🟢

**강점:**
- ✅ 명확한 관심사 분리 (UI primitives vs features)
- ✅ 단일 타입 정의 파일로 API 계약 중앙화
- ✅ Barrel exports (`index.ts`)로 깔끔한 import
- ✅ 경로 별칭 (`@/*`) 설정으로 가독성 향상

**개선 가능:**
- 테스트 디렉토리 부재 (`__tests__/`, `*.test.tsx`)
- Storybook 등 컴포넌트 문서화 도구 없음

---

## 3. 컴포넌트 설계

### 컴포넌트 조직 패턴: Feature-based + Atomic Design 하이브리드

```
components/
├── ui/              ← Atomic: 기본 프리미티브 (Button, Card, Input)
├── layout/          ← Feature: 레이아웃 컨테이너
├── input/           ← Feature: 입력 관련 컴포넌트
├── data-display/    ← Feature: 데이터 표시 컴포넌트
└── migration/       ← Feature: 도메인 특화 컴포넌트
```

### 주요 컴포넌트 목록

| 컴포넌트 | 유형 | 용도 | Props 패턴 |
|----------|------|------|------------|
| Button | UI Primitive | 버튼 (variant, size) | CVA variants |
| Card | UI Compound | 카드 컨테이너 | Compound children |
| Header | Layout | 앱 헤더 | optional title, actions |
| AppShell | Layout | 메인 레이아웃 래퍼 | children, hide options |
| BottomNav | Layout | 하단 네비게이션 | 라우터 연동 |
| SearchBar | Input | 검색 입력 | forwardRef, onClear |
| DateRangePicker | Input | 날짜 범위 선택 | controlled state |
| RouteCard | Data Display | 노선 카드 | route, callbacks |
| StatCard | Data Display | 통계 카드 | label, value, trend |
| RouteDetail | Data Display | 노선 상세 시트 | Sheet 기반 |
| MigrationManager | Feature | 마이그레이션 관리 | hooks 기반 |

### Props 패턴

**1. Interface 기반 Props (일관적 사용)**
```typescript
interface HeaderProps {
  title?: string;
  leftAction?: 'back' | 'menu' | ReactNode;
  rightAction?: ReactNode;
  className?: string;
  transparent?: boolean;
}
```

**2. forwardRef 패턴**
```typescript
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, value, onClear, ...props }, ref) => {
    return <input ref={ref} {...props} />;
  }
);
```

**3. CVA (Class Variance Authority) 패턴**
```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center...",
  {
    variants: {
      variant: { default: "...", destructive: "...", outline: "..." },
      size: { default: "h-9", sm: "h-8", lg: "h-10", icon: "size-9" },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);
```

### 컴포지션 패턴

**Compound Components (Card):**
```tsx
<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
    <CardDescription>설명</CardDescription>
  </CardHeader>
  <CardContent>내용</CardContent>
  <CardFooter>푸터</CardFooter>
</Card>
```

**Props 기반 컴포지션 (AppShell):**
```tsx
<AppShell 
  title="대신물류" 
  hideHeader={false}
  hideBottomNav={false}
>
  {children}
</AppShell>
```

### 컴포넌트 평가: 8.5/10 🟢

**강점:**
- ✅ Radix UI 기반 접근성 보장
- ✅ CVA로 유지보수 용이한 variant 스타일링
- ✅ 일관된 interface 기반 props 정의
- ✅ Barrel exports로 깔끔한 import

**개선 가능:**
- ⚠️ React.memo 미사용 (RouteCard 등)
- ⚠️ displayName 일부 누락
- ⚠️ JSDoc 주석 부재

---

## 4. 커스텀 훅 패턴

### 훅 인벤토리

| 훅 이름 | 파일 | 용도 | 유형 |
|---------|------|------|------|
| `useCountUp` | useCountUp.ts | 숫자 애니메이션 | Animation |
| `useAuth` | useAuth.ts | 인증 컨텍스트 소비 | Context |
| `useFavorites` | useFavorites.ts | 즐겨찾기 관리 | State/Storage |
| `useRoutes` | useRoutes.ts | 노선 검색 | Data Fetching |
| `useRoutesByDate` | useRoutes.ts | 날짜별 노선 조회 | Data Fetching |
| `useStats` | useStats.ts | 통계 데이터 조회 | Data Fetching |
| `useMigrationJobs` | useMigration.ts | 마이그레이션 목록 | Data Fetching |
| `useActiveMigration` | useMigration.ts | 활성 마이그레이션 (폴링) | Data Fetching |
| `useMigrationJob` | useMigration.ts | 단일 마이그레이션 조회 | Data Fetching |
| `useStartMigration` | useMigration.ts | 마이그레이션 시작 | Mutation |
| `useCancelMigration` | useMigration.ts | 마이그레이션 취소 | Mutation |

### 훅 패턴 분석

**1. React Query 래퍼 훅 (8개)**
```typescript
export function useStats({ date, enabled = true }: UseStatsParams) {
  return useQuery<StatsDto>({
    queryKey: ['stats', date],
    queryFn: () => api.stats.getByDate(date),
    enabled: enabled && date.length === 8,
    staleTime: 60 * 1000,
  });
}
```

**2. 컨텍스트 소비자 훅**
```typescript
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

**3. localStorage + State 훅**
```typescript
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setFavorites(JSON.parse(stored));
  }, []);
  
  const toggleFavorite = useCallback((lineCode: string) => {
    setFavorites((prev) => {
      const next = prev.includes(lineCode)
        ? prev.filter((c) => c !== lineCode)
        : [...prev, lineCode];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  
  return { favorites, toggleFavorite, isFavorite, addFavorite, removeFavorite };
}
```

**4. 애니메이션 훅 (requestAnimationFrame)**
```typescript
export function useCountUp(end: number, options: UseCountUpOptions = {}) {
  const { duration = 1000, startOnMount = true } = options;
  const [count, setCount] = useState(startOnMount ? 0 : end);
  const frameRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!startOnMount) return;
    // requestAnimationFrame 기반 애니메이션
    // easeOutQuart 이징 함수 적용
    // cleanup에서 cancelAnimationFrame
  }, [end, duration, startOnMount]);
  
  return { count, isAnimating };
}
```

### 의존성 배열 관리: 우수 ✅

- 모든 useEffect, useCallback, useMemo에 올바른 의존성 배열
- 조건부 훅 호출 없음 (Rules of Hooks 준수)
- 무한 루프 없음
- stale closure 없음

### 훅 평가: 8.5/10 🟢

**강점:**
- ✅ React Query 활용한 서버 상태 관리
- ✅ 의존성 배열 100% 올바르게 관리
- ✅ 적절한 cleanup 함수
- ✅ 명확한 네이밍 컨벤션

**개선 가능:**
- 제네릭 React Query 래퍼 훅으로 중복 감소 가능
- JSDoc 문서화 부재
- 훅 간 컴포지션 패턴 없음

---

## 5. API 레이어

### 아키텍처 개요

```
┌─────────────────────────────────────────────────────────┐
│                    Components                            │
├─────────────────────────────────────────────────────────┤
│               Custom Hooks (useRoutes, etc.)             │
├─────────────────────────────────────────────────────────┤
│                   React Query                            │
├─────────────────────────────────────────────────────────┤
│              API Client (lib/api.ts)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  fetchApi   │  │fetchApiAuth │  │ Token Mgmt  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│                  Native Fetch API                        │
└─────────────────────────────────────────────────────────┘
```

### API 클라이언트 구조

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// 제네릭 API 함수
async function fetchApi<T>(endpoint: string, options?: FetchOptions): Promise<T>
async function fetchApiWithAuth<T>(endpoint: string, options?: FetchOptions): Promise<T>

// 토큰 관리
function getToken(): string | null
function setToken(token: string): void
function clearToken(): void

// API 엔드포인트
export const api = {
  routes: {
    searchByCode: (code) => fetchApi<RouteDto[]>(`/api/routes/code/${code}`),
    searchByName: (name) => fetchApi<RouteDto[]>(`/api/routes/name/${name}`),
    searchByCar: (car) => fetchApi<RouteDto[]>(`/api/routes/car/${car}`),
    getByDate: (date) => fetchApi<RouteDto[]>(`/api/routes/date/${date}`),
  },
  stats: {
    getByDate: (date) => fetchApi<StatsDto>(`/api/stats/${date}`),
  },
  auth: {
    login: (email, password) => fetchApi<LoginResponseDto>(...),
    me: () => fetchApiWithAuth<MeResponseDto>(...),
  },
  migration: {
    getAll: () => fetchApiWithAuth<ApiResponse<MigrationJobDto[]>>(...),
    getActive: () => fetchApiWithAuth<ApiResponse<MigrationJobDto | null>>(...),
    start: (startDate, endDate) => fetchApiWithAuth<ApiResponse<MigrationJobDto>>(...),
    cancel: (id) => fetchApiWithAuth<ApiResponse<MigrationJobDto>>(...),
  },
};
```

### 인증 흐름

```
[로그인] → api.auth.login() → setToken() → localStorage + Cookie
                                              │
[앱 시작] → AuthProvider → getToken() ← ────────┘
               │
               ├── 토큰 있음 → api.auth.me() → 유효 → setAdmin()
               │                            → 무효 → clearToken()
               └── 토큰 없음 → isAuthenticated: false
```

### 캐싱 전략 (React Query)

| 훅 | staleTime | refetchInterval | 설명 |
|------|-----------|-----------------|------|
| useRoutes | 60s | - | 일반 캐시 |
| useStats | 60s | - | 일반 캐시 |
| useMigrationJobs | 30s | - | 짧은 캐시 |
| useActiveMigration | 0s | 3s (조건부) | running/pending 시만 폴링 |
| useMigrationJob | 0s | 3s (조건부) | running/pending 시만 폴링 |

### API 평가: 8/10 🟢

**강점:**
- ✅ 타입 안전한 제네릭 API 클라이언트
- ✅ 명확한 엔드포인트 네임스페이스
- ✅ 스마트 폴링 전략 (상태 기반)
- ✅ 적절한 캐시 무효화

**개선 가능:**
- ⚠️ 재시도 로직 없음
- ⚠️ 요청 타임아웃 없음
- ⚠️ 요청 인터셉터/미들웨어 패턴 없음
- ⚠️ 에러 타입 정의 없음

---

## 6. 타입 안전성

### TypeScript 설정

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,           // ✅ 모든 strict 옵션 활성화
    "noEmit": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "target": "ES2017",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### 타입 정의 구조

```typescript
// types/api.ts - 중앙화된 타입 정의

// Discriminated Union
export type MigrationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type SearchType = 'code' | 'name' | 'car';

// DTO Interfaces
export interface RouteDto {
  lineCode: string;
  lineName: string | null;
  departureTime: string;
  arrivalTime: string | null;
  carNumber: string;
  driverName: string | null;
  // ... 16 properties with proper null handling
}

export interface MigrationJobDto {
  id: number;
  status: MigrationStatus;  // ← Discriminated Union 사용
  progress: number;
  totalCount: number;
  processedCount: number;
  errorMessage: string | null;
  // ...
}

// Generic Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
```

### 타입 안전성 통계

| 메트릭 | 값 | 상태 |
|--------|-----|------|
| `any` 사용 | 0건 | 🟢 |
| `unknown` 사용 | 0건 | 🟢 |
| Type Assertion (`as`) | 1건 (안전) | 🟢 |
| `@ts-ignore` | 0건 | 🟢 |
| `@ts-expect-error` | 0건 | 🟢 |
| Strict Mode | 활성화 | 🟢 |

### 패턴별 타입 안전성

**1. Generic API Client**
```typescript
async function fetchApi<T>(endpoint: string, options?: FetchOptions): Promise<T>
// 모든 API 호출에서 타입 추론 작동
```

**2. React Query Hooks**
```typescript
useQuery<StatsDto>({ queryKey: [...], queryFn: () => api.stats.getByDate(date) })
// 명시적 타입 파라미터로 타입 안전성 보장
```

**3. Discriminated Union + Record**
```typescript
const STATUS_CONFIG: Record<MigrationStatus, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
}> = {
  pending: { ... },
  running: { ... },
  // TypeScript가 모든 status 값 구현 강제
};
```

**4. Null Safety Patterns**
```typescript
// Optional Chaining
admin?.name || admin?.email

// Null Check Early Return
if (!route) return null;

// Conditional Rendering
{route.lineName && <p>{route.lineName}</p>}
```

### 타입 안전성 평가: 9.3/10 🟢

**강점:**
- ✅ Zero `any` types - 완벽한 타입 커버리지
- ✅ Strict mode 완전 활성화
- ✅ 중앙화된 타입 정의
- ✅ Discriminated Union 적절한 활용
- ✅ 제네릭 API 클라이언트
- ✅ 철저한 null 처리

**개선 가능:**
- 런타임 검증 라이브러리 없음 (Zod, io-ts 고려)
- silent catch 블록 2건 (에러 로깅 필요)

---

## 7. 성능 분석

### 메모이제이션 현황

**useMemo 사용 (5건)**
```typescript
// page.tsx - 노선 필터링
const favoriteRoutes = useMemo(() => 
  routes?.filter((route) => favorites.includes(route.lineCode)) ?? [],
  [routes, favorites]
);

// DateRangePicker.tsx - 날짜 파싱
const displayText = useMemo(() => { ... }, [startDate, endDate]);

// MigrationManager.tsx - 작업 정렬
const recentJobs = useMemo(() => { ... }, [jobs]);
```

**useCallback 사용 (6건)**
```typescript
// useFavorites.ts - 4개 함수
const toggleFavorite = useCallback((lineCode: string) => { ... }, []);
const isFavorite = useCallback((lineCode: string) => { ... }, [favorites]);

// AuthProvider.tsx - 2개 함수
const login = useCallback(async (email, password) => { ... }, []);
const logout = useCallback(() => { ... }, []);
```

**React.memo 사용: 0건 ⚠️**

### 리렌더링 문제점

**문제 1: RouteCard 미메모이제이션**
```tsx
// ❌ 현재 상태 - RouteCard가 모든 부모 리렌더에 영향 받음
<RouteCard 
  route={route}
  onClick={() => handleRouteClick(route)}  // 인라인 함수
  onFavoriteToggle={() => toggleFavorite(route.lineCode)}  // 인라인 함수
  isFavorite={isFavorite(route.lineCode)}
/>
```

**문제 2: 인라인 함수 핸들러**
```tsx
// ❌ 매 렌더마다 새 함수 생성
onClick={() => handleRouteClick(route)}

// ✅ 개선안
const handleClick = useCallback(() => handleRouteClick(route), [route]);
```

### Suspense & Concurrent Features

**현재 구현:**
```tsx
// search/page.tsx - Suspense 경계
export default function SearchPage() {
  return (
    <Suspense fallback={<AppShell><SearchSkeleton /></AppShell>}>
      <SearchContent />
    </Suspense>
  );
}
```

**미사용 기능:**
- ❌ useTransition
- ❌ useDeferredValue
- ❌ startTransition

### 코드 스플리팅

**현재 상태:**
- ❌ React.lazy 미사용
- ❌ next/dynamic 미사용
- ❌ 라우트 기반 코드 스플리팅 없음

**개선 기회:**
```tsx
// Admin 라우트 lazy loading
const AdminMigration = dynamic(() => import('./admin/migration/page'), {
  loading: () => <AdminSkeleton />
});
```

### 성능 점수표

| 카테고리 | 점수 | 상태 |
|----------|------|------|
| 메모이제이션 (useMemo/useCallback) | 6/10 | 🟡 |
| 컴포넌트 메모이제이션 (React.memo) | 2/10 | 🔴 |
| 코드 스플리팅 | 2/10 | 🔴 |
| 리스트 최적화 | 7/10 | 🟡 |
| 데이터 페칭 최적화 | 8/10 | 🟢 |
| 애니메이션 | 9/10 | 🟢 |
| **전체** | **6.3/10** | **🟡** |

### 성능 평가: 6.3/10 🟡

**강점:**
- ✅ requestAnimationFrame 기반 애니메이션
- ✅ React Query 스마트 폴링
- ✅ 검색 입력 디바운싱 (300ms)
- ✅ 스켈레톤 로더 UX
- ✅ 리스트 키 올바른 사용

**개선 필요:**
- ⚠️ RouteCard React.memo 래핑 필요
- ⚠️ 인라인 핸들러 → useCallback 전환
- ⚠️ Admin 라우트 코드 스플리팅
- ⚠️ Error Boundary 추가

---

## 8. 개선 권장사항

### 🔴 Critical (즉시 수정 권장)

#### 1. RouteCard에 React.memo 적용

**현재:**
```tsx
export function RouteCard({ route, onClick, onFavoriteToggle, isFavorite }: RouteCardProps) {
  // ...
}
```

**개선:**
```tsx
export const RouteCard = memo(function RouteCard({ 
  route, onClick, onFavoriteToggle, isFavorite 
}: RouteCardProps) {
  // ...
});
```

**영향:** 20+ 카드 불필요 리렌더링 방지

#### 2. 인라인 함수 핸들러 제거

**현재:**
```tsx
// page.tsx
{routes.map((route) => (
  <RouteCard 
    onClick={() => handleRouteClick(route)}
    onFavoriteToggle={() => toggleFavorite(route.lineCode)}
  />
))}
```

**개선:**
```tsx
const RouteCardWrapper = memo(function RouteCardWrapper({ 
  route, onRouteClick, onToggleFavorite, isFavorite 
}: { ... }) {
  const handleClick = useCallback(() => onRouteClick(route), [route, onRouteClick]);
  const handleToggle = useCallback(() => onToggleFavorite(route.lineCode), [route.lineCode, onToggleFavorite]);
  
  return (
    <RouteCard 
      route={route}
      onClick={handleClick}
      onFavoriteToggle={handleToggle}
      isFavorite={isFavorite}
    />
  );
});
```

#### 3. Error Boundary 추가

```tsx
// components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
```

### 🟡 Medium (개선 권장)

#### 4. Admin 라우트 코드 스플리팅

```tsx
// app/admin/migration/page.tsx
import dynamic from 'next/dynamic';

const MigrationManager = dynamic(
  () => import('@/components/migration/MigrationManager'),
  { loading: () => <MigrationSkeleton /> }
);
```

#### 5. localStorage 디바운싱

```typescript
// useFavorites.ts
import { useDebouncedCallback } from 'use-debounce';

const debouncedSave = useDebouncedCallback(
  (favorites: string[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  },
  300
);
```

#### 6. API 재시도 로직

```typescript
// lib/api.ts
async function fetchWithRetry<T>(
  url: string, 
  options: FetchOptions, 
  retries = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchApi<T>(url, options);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

### 🟢 Low (선택적 개선)

#### 7. JSDoc 문서화

```typescript
/**
 * 노선 검색 훅
 * @param type - 검색 유형 ('code' | 'name' | 'car')
 * @param query - 검색 쿼리
 * @param enabled - 쿼리 활성화 여부
 * @returns React Query 결과 객체
 * @example
 * const { data, isLoading } = useRoutes({ type: 'code', query: '1234' });
 */
export function useRoutes({ type, query, enabled = true }: UseRoutesParams) {
  // ...
}
```

#### 8. 테스트 인프라 구축

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

```typescript
// __tests__/hooks/useFavorites.test.ts
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from '@/hooks/useFavorites';

describe('useFavorites', () => {
  it('should toggle favorite', () => {
    const { result } = renderHook(() => useFavorites());
    
    act(() => {
      result.current.toggleFavorite('LINE001');
    });
    
    expect(result.current.isFavorite('LINE001')).toBe(true);
  });
});
```

#### 9. 런타임 타입 검증 (Zod)

```typescript
import { z } from 'zod';

const RouteSchema = z.object({
  lineCode: z.string(),
  lineName: z.string().nullable(),
  departureTime: z.string(),
  // ...
});

// API 응답 검증
const routes = RouteSchema.array().parse(response.data);
```

---

## 9. 결론

### 프로젝트 성숙도: 양호 (Production-Ready)

이 프로젝트는 **전반적으로 잘 설계된 Next.js 애플리케이션**입니다. TypeScript strict mode를 완벽히 활용하고, React Query를 통한 서버 상태 관리, shadcn/ui 기반의 일관된 UI 시스템을 갖추고 있습니다.

### 우선순위별 액션 아이템

| 우선순위 | 항목 | 예상 효과 | 소요 시간 |
|----------|------|----------|----------|
| 🔴 P0 | RouteCard React.memo | 리렌더링 50%+ 감소 | 30분 |
| 🔴 P0 | 인라인 핸들러 제거 | 메모이제이션 활성화 | 1시간 |
| 🔴 P0 | Error Boundary 추가 | 앱 안정성 향상 | 1시간 |
| 🟡 P1 | Admin 코드 스플리팅 | 초기 번들 10%+ 감소 | 30분 |
| 🟡 P1 | localStorage 디바운싱 | UI 버벅임 방지 | 30분 |
| 🟡 P1 | API 재시도 로직 | 네트워크 안정성 | 1시간 |
| 🟢 P2 | 테스트 인프라 | 코드 신뢰도 | 2시간 |
| 🟢 P2 | JSDoc 문서화 | 유지보수성 | 지속적 |

### 최종 평가

```
┌────────────────────────────────────────────────────────┐
│                    종합 평가: 8.1/10                    │
├────────────────────────────────────────────────────────┤
│  ██████████████████████████████████░░░░░░░░░░░░░░░░░░  │
│                                                        │
│  ✅ 타입 안전성    ████████████████████████░  9.3/10   │
│  ✅ 프로젝트 구조  ██████████████████████████  9.0/10   │
│  ✅ 컴포넌트 설계  ████████████████████████░  8.5/10   │
│  ✅ 커스텀 훅     ████████████████████████░  8.5/10   │
│  ✅ API 레이어    ████████████████████████   8.0/10   │
│  ⚠️ 성능 최적화   ██████████████░░░░░░░░░░  6.3/10   │
└────────────────────────────────────────────────────────┘
```

**이 프로젝트는 production 배포에 적합하며**, 위 권장사항을 적용하면 더욱 견고하고 성능이 뛰어난 애플리케이션이 될 것입니다.

---

*Generated by Claude Code Review Agent - 2026.01.30*
