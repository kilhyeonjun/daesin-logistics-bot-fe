---
name: verify-components
description: React 컴포넌트의 구조, 패턴, 접근성 규칙을 검증합니다. 컴포넌트 추가/수정 후 사용.
---

# 컴포넌트 검증

## Purpose

`src/components/` 디렉토리의 React 컴포넌트 패턴을 검증합니다:

1. **'use client' 지시어** — 클라이언트 컴포넌트에 지시어 포함
2. **컴포넌트 디렉토리 구조** — 도메인별 디렉토리 분류 규칙 준수
3. **barrel export 등록** — 각 디렉토리의 `index.ts`에 컴포넌트 등록
4. **접근성 기본 규칙** — 인터랙티브 요소에 aria-label, 이미지에 alt 텍스트
5. **memo/forwardRef 패턴** — 리스트 렌더링 컴포넌트의 memo 적용

## When to Run

- `src/components/` 디렉토리에 컴포넌트를 추가/수정한 후
- 컴포넌트 디렉토리 구조를 변경한 후
- 접근성 관련 코드를 수정한 후

## Related Files

| File | Purpose |
|------|---------|
| `src/components/data-display/index.ts` | 데이터 표시 컴포넌트 barrel export |
| `src/components/data-display/StatCard.tsx` | 통계 카드 컴포넌트 |
| `src/components/data-display/RouteCard.tsx` | 노선 카드 컴포넌트 (memo) |
| `src/components/data-display/RouteDetail.tsx` | 노선 상세 Sheet 컴포넌트 |
| `src/components/input/index.ts` | 입력 컴포넌트 barrel export |
| `src/components/input/SearchBar.tsx` | 검색바 컴포넌트 (forwardRef) |
| `src/components/input/SearchAutocomplete.tsx` | 검색 자동완성 컴포넌트 |
| `src/components/input/SearchTabs.tsx` | 검색 탭 컴포넌트 |
| `src/components/input/SortSelect.tsx` | 정렬 셀렉트 컴포넌트 |
| `src/components/input/DateRangePicker.tsx` | 날짜 범위 선택 컴포넌트 |
| `src/components/layout/index.ts` | 레이아웃 컴포넌트 barrel export |
| `src/components/layout/AppShell.tsx` | 앱 쉘 레이아웃 |
| `src/components/layout/Header.tsx` | 헤더 컴포넌트 |
| `src/components/layout/BottomNav.tsx` | 하단 네비게이션 |
| `src/components/migration/index.ts` | 마이그레이션 컴포넌트 barrel export |
| `src/components/migration/MigrationManager.tsx` | 마이그레이션 관리자 |
| `src/components/migration/MigrationJobCard.tsx` | 마이그레이션 작업 카드 |
| `src/components/migration/NewMigrationForm.tsx` | 새 마이그레이션 폼 |
| `src/components/ErrorBoundary.tsx` | 에러 바운더리 (클래스 컴포넌트) |
| `src/lib/highlightText.tsx` | 텍스트 하이라이트 유틸리티 컴포넌트 |

## Workflow

### Step 1: 'use client' 지시어

**파일:** `src/components/**/*.tsx`

**검사:** 모든 `.tsx` 컴포넌트 파일의 첫 줄이 `'use client';`이어야 합니다 (barrel export `index.ts` 제외).

**도구:** Grep

```
pattern: "^'use client'"
path: "src/components"
include: "*.tsx"
```

매칭된 파일 수와 전체 `.tsx` 파일 수를 비교.

**PASS:** 모든 `.tsx` 파일이 `'use client';`로 시작.

**FAIL:** `'use client';`가 누락된 컴포넌트 파일 발견.

**수정:** 파일 첫 줄에 `'use client';` 추가.

### Step 2: 디렉토리 구조 규칙

**검사:** 컴포넌트는 다음 디렉토리 구조를 따라야 합니다:
- `data-display/` — 데이터 표시용 (카드, 리스트, 상세)
- `input/` — 사용자 입력용 (검색, 선택, 날짜 등)
- `layout/` — 레이아웃 구성 (쉘, 헤더, 네비게이션)
- `migration/` — 마이그레이션 관련
- `ui/` — shadcn/ui 기반 기본 UI 컴포넌트

**도구:** Glob

```
pattern: "src/components/**/*.tsx"
```

**기준:** 루트 레벨(`src/components/`)에는 `ErrorBoundary.tsx`만 존재 가능. 나머지는 서브 디렉토리에 위치.

**PASS:** 모든 컴포넌트가 적절한 서브 디렉토리에 위치.

**FAIL:** 서브 디렉토리 없이 루트에 위치한 새 컴포넌트 발견 (ErrorBoundary 제외).

### Step 3: barrel export 동기화

**파일:** `src/components/*/index.ts`

**검사:** 각 컴포넌트 서브 디렉토리의 `index.ts`가 해당 디렉토리의 모든 컴포넌트를 export해야 합니다.

**도구:** 각 서브 디렉토리별 Glob + Read

`data-display/`, `input/`, `layout/`, `migration/` 각각에 대해:
1. `src/components/<dir>/*.tsx` 파일 목록 수집
2. `src/components/<dir>/index.ts` 내용과 비교

**PASS:** 모든 `.tsx` 파일이 해당 `index.ts`에서 export됨.

**FAIL:** `index.ts`에 등록되지 않은 컴포넌트 발견.

**수정:** `index.ts`에 누락된 export 추가.

### Step 4: 접근성 기본 규칙

**파일:** `src/components/**/*.tsx`

**검사:**
- `<button>` 요소에 `type` 속성 명시 (`type="button"` 또는 `type="submit"`)
- 아이콘만 있는 버튼에 `aria-label` 포함
- `<nav>` 요소에 `aria-label` 포함

**도구:** Grep

```
pattern: "<button(?!.*type=)"
path: "src/components"
include: "*.tsx"
```

**PASS:** 모든 `<button>`에 `type` 속성이 있고, 아이콘 버튼에 `aria-label` 존재.

**FAIL:** `type` 속성 누락 또는 `aria-label` 없는 아이콘 버튼 발견.

**수정:** 누락된 속성 추가.

### Step 5: memo/forwardRef 패턴

**파일:** `src/components/data-display/RouteCard.tsx`, `src/components/input/SearchBar.tsx`

**검사:**
- 리스트 렌더링에 사용되는 카드 컴포넌트는 `memo`로 감싸야 합니다
- `memo` 사용 시 `displayName`을 설정해야 합니다
- `forwardRef` 사용 시 `displayName`을 설정해야 합니다

**도구:** Grep

```
pattern: "memo\(|forwardRef\("
path: "src/components"
include: "*.tsx"
```

각 매칭에 대해 동일 파일에서 `displayName` 설정 확인.

**PASS:** `memo`/`forwardRef` 사용하는 컴포넌트에 `displayName` 설정됨.

**FAIL:** `displayName` 누락.

**수정:** `ComponentName.displayName = 'ComponentName';` 추가.

## Output Format

| # | 검사 | 상태 | 상세 |
|---|------|------|------|
| 1 | 'use client' 지시어 | PASS/FAIL | 상세... |
| 2 | 디렉토리 구조 | PASS/FAIL | 상세... |
| 3 | barrel export | PASS/FAIL | 상세... |
| 4 | 접근성 | PASS/FAIL | 상세... |
| 5 | memo/forwardRef | PASS/FAIL | 상세... |

## Exceptions

1. **ui/ 디렉토리** — shadcn/ui 기반 컴포넌트는 자동 생성되므로 이 스킬의 검사 대상에서 제외합니다.
2. **ErrorBoundary** — 클래스 컴포넌트로 `'use client'`는 필요하지만 `memo`/`forwardRef`는 해당되지 않습니다.
3. **highlightText.tsx** — `src/lib/`에 위치한 유틸리티 컴포넌트로 컴포넌트 디렉토리 규칙이 적용되지 않습니다.
4. **index.ts 파일** — barrel export 파일로 `'use client'` 지시어가 불필요합니다.
