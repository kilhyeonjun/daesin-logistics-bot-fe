---
name: verify-hooks
description: React hooks의 패턴 일관성과 queryKey 규칙을 검증합니다. 훅 추가/수정 후 사용.
---

# React Hooks 검증

## Purpose

`src/hooks/` 디렉토리의 React hooks 패턴 일관성을 검증합니다:

1. **'use client' 지시어** — 모든 hook 파일에 `'use client'` 지시어 포함
2. **React Query 패턴** — queryKey 네이밍, staleTime 설정, enabled 조건의 일관성
3. **barrel export 등록** — `src/hooks/index.ts`에 모든 hook이 등록되어 있는지 확인
4. **localStorage hook 패턴** — localStorage 사용 시 try-catch와 SSR 안전성 보장
5. **Hook 네이밍 규칙** — `use*` 접두사와 파일명-함수명 일치

## When to Run

- `src/hooks/` 디렉토리에 파일을 추가/수정한 후
- React Query 관련 패턴을 변경한 후
- barrel export를 업데이트한 후

## Related Files

| File | Purpose |
|------|---------|
| `src/hooks/index.ts` | hooks barrel export |
| `src/hooks/useAuth.ts` | 인증 컨텍스트 hook |
| `src/hooks/useRoutes.ts` | 노선 검색 hook (React Query) |
| `src/hooks/useStats.ts` | 일간 통계 hook (React Query) |
| `src/hooks/useMonthlyStats.ts` | 월간 통계 hook (React Query) |
| `src/hooks/useMigration.ts` | 마이그레이션 hook (React Query) |
| `src/hooks/useFavorites.ts` | 즐겨찾기 hook (localStorage) |
| `src/hooks/useRecentSearches.ts` | 최근 검색 hook (localStorage) |
| `src/hooks/useCountUp.ts` | 카운트업 애니메이션 hook |

## Workflow

### Step 1: 'use client' 지시어

**파일:** `src/hooks/*.ts`

**검사:** 모든 hook 파일의 첫 줄이 `'use client';`이어야 합니다.

**도구:** Glob + Read

```
glob: "src/hooks/*.ts"
```

각 파일의 첫 줄을 확인:

```
filePath: "src/hooks/<file>.ts"
offset: 0
limit: 1
```

**PASS:** 모든 hook 파일이 `'use client';`로 시작 (index.ts 제외).

**FAIL:** `'use client';`가 누락된 hook 파일 발견.

**수정:** 파일 첫 줄에 `'use client';` 추가.

### Step 2: React Query queryKey 규칙

**파일:** `src/hooks/useRoutes.ts`, `src/hooks/useStats.ts`, `src/hooks/useMonthlyStats.ts`, `src/hooks/useMigration.ts`

**검사:** React Query를 사용하는 hook은 다음 규칙을 준수해야 합니다:
- `queryKey`는 배열 형태이며 도메인 키로 시작 (예: `['routes', ...]`, `['stats', ...]`)
- `staleTime`이 명시적으로 설정됨
- `enabled` 조건이 유효성 검사를 포함

**도구:** Grep

```
pattern: "queryKey:"
path: "src/hooks"
include: "*.ts"
```

**PASS:** 모든 useQuery 호출에 queryKey, staleTime이 설정되고 enabled 조건이 존재.

**FAIL:** queryKey 패턴 불일치, staleTime 누락, 또는 enabled 조건 미비.

### Step 3: localStorage hook 안전성

**파일:** `src/hooks/useFavorites.ts`, `src/hooks/useRecentSearches.ts`

**검사:** localStorage를 사용하는 hook은 다음을 준수해야 합니다:
- `useEffect` 내에서 초기 로드 (SSR 안전)
- `try-catch`로 감싸진 localStorage 접근
- 파싱 실패 시 기본값 설정

**도구:** Grep

```
pattern: "localStorage"
path: "src/hooks"
include: "*.ts"
```

**기준:**
- localStorage 접근이 `useEffect` 또는 콜백 내부에서만 발생
- 모든 localStorage 접근에 try-catch 존재
- catch 블록에서 기본값 설정 또는 에러 로깅

**PASS:** 모든 localStorage 접근이 안전하게 감싸져 있음.

**FAIL:** try-catch 없는 localStorage 접근, 또는 useEffect 외부에서 직접 접근.

### Step 4: barrel export 동기화

**파일:** `src/hooks/index.ts`

**검사:** `src/hooks/` 디렉토리의 모든 hook 파일이 `index.ts`에서 export되어야 합니다.

**도구:** Glob

```
pattern: "src/hooks/use*.ts"
```

`index.ts` 내용과 비교하여 누락된 export가 없는지 확인.

**PASS:** 모든 hook 파일이 barrel export에 등록됨.

**FAIL:** `index.ts`에 등록되지 않은 hook 파일 발견.

**수정:** `index.ts`에 누락된 export 추가.

### Step 5: Hook 네이밍 규칙

**파일:** `src/hooks/use*.ts`

**검사:**
- 파일명은 `use*.ts` 패턴
- 파일의 주요 export 함수명이 파일명과 일치 (예: `useFavorites.ts` → `export function useFavorites`)
- Hook 함수는 `use` 접두사로 시작

**도구:** AST-grep

```
pattern: "export function use$NAME($$$) { $$$ }"
lang: "typescript"
paths: ["src/hooks"]
```

**PASS:** 파일명과 함수명이 일치하고 `use` 접두사 사용.

**FAIL:** 네이밍 불일치 발견.

## Output Format

| # | 검사 | 상태 | 상세 |
|---|------|------|------|
| 1 | 'use client' 지시어 | PASS/FAIL | 상세... |
| 2 | queryKey 규칙 | PASS/FAIL | 상세... |
| 3 | localStorage 안전성 | PASS/FAIL | 상세... |
| 4 | barrel export | PASS/FAIL | 상세... |
| 5 | 네이밍 규칙 | PASS/FAIL | 상세... |

## Exceptions

1. **index.ts** — barrel export 파일 자체는 `'use client'` 지시어가 불필요합니다.
2. **useCountUp** — React Query를 사용하지 않는 순수 애니메이션 hook으로 queryKey/staleTime 규칙이 적용되지 않습니다.
3. **useAuth** — Context hook으로 React Query 규칙이 적용되지 않으며, localStorage에 직접 접근하지 않습니다.
4. **useMigration의 refetchInterval** — 동적 폴링 간격은 `staleTime: 0`과 함께 사용될 수 있으며, 이는 의도된 실시간 데이터 패턴입니다.
