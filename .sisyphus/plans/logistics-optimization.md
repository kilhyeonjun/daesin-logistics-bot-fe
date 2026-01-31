# 물류 배차 웹앱 최적화 작업 계획

## TL;DR

> **Quick Summary**: Next.js 16 물류 배차 모바일 웹앱의 반응형 확장, 성능 최적화(동적 import, useCallback), 미사용 코드 정리, UX 개선(shimmer, 터치 타겟, 빈 상태) 작업
> 
> **Deliverables**:
> - 태블릿/데스크탑 반응형 그리드 레이아웃 (md:2열, lg:3열)
> - DateRangePicker 동적 import (lazy load)
> - 8개 파일 useCallback 최적화 (49개 핸들러)
> - 미사용 코드 삭제 (src/proxy.ts)
> - Skeleton shimmer 애니메이션 적용
> - 터치 타겟 44px 확보
> - 빈 상태/에러 메시지 통일
> 
> **Estimated Effort**: Medium (4-6시간)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 → Task 7 → Task 8

---

## Context

### Original Request
물류 배차 현황 모바일 웹앱에 대해:
1. 반응형 디자인 확장 (태블릿/데스크탑)
2. 성능 최적화 (동적 import, useCallback)
3. 코드 정리 (미사용 코드 삭제)
4. UX 개선 (로딩, 에러, 빈 상태, 터치 타겟, 인터랙션)

### Interview Summary
**Key Discussions**:
- Tailwind 기본 breakpoint 사용 (sm, md, lg, xl)
- 카드 그리드화만 (최소 변경)
- 인라인 Alert 형태로 에러 메시지
- 수동 검증 (빌드 성공 확인)
- 미니멀 빈 상태 (텍스트 + 아이콘)
- 병렬 처리로 동시 진행

**Research Findings**:
- useCallback 필요: 52개 핸들러 중 49개 (3개 이미 최적화됨)
- 터치 타겟: Button h-9(36px), Calendar size-7(28px) → WCAG 44px 미만
- skeleton-shimmer: globals.css에 정의되어 있으나 미사용
- 동적 import 패턴: `ssr: false` 사용 중
- 미사용 코드: src/proxy.ts만 확인됨

### Self-Review (Metis 대체)
**Identified Gaps**:
- 터치 타겟 증가 범위 명확화 필요 → 핵심 인터랙티브 요소만 적용
- Button variant 전체 수정 vs 개별 적용 → 개별 클래스 오버라이드 방식
- useCallback 의존성 배열 정확도 → 각 파일별 명시

---

## Work Objectives

### Core Objective
Next.js 16 물류 배차 웹앱의 반응형 확장, 성능 최적화, 코드 정리, UX 개선을 최소한의 변경으로 안정적으로 구현

### Concrete Deliverables
- 반응형: src/app/page.tsx, src/app/stats/page.tsx 카드 그리드 적용
- 동적 import: src/components/migration/NewMigrationForm.tsx
- useCallback: 8개 파일 최적화
- 삭제: src/proxy.ts
- Skeleton: skeleton-shimmer 클래스 적용
- 터치 타겟: Header, Calendar nav, 즐겨찾기 버튼 등
- 빈 상태: stats/page.tsx, routes 영역
- 에러 메시지: 일관된 스타일 적용

### Definition of Done
- [ ] `bun build` 또는 `npm run build` 성공 (exit code 0)
- [ ] TypeScript 타입 에러 없음
- [ ] 개발 서버 정상 실행

### Must Have
- 기존 코드베이스 패턴 유지
- 최소한의 변경
- 빌드 실패 없이 안정적 진행

### Must NOT Have (Guardrails)
- Button 컴포넌트 전역 수정 (개별 오버라이드만)
- 새로운 컴포넌트 생성 (기존 패턴 활용)
- 사이드바/대시보드 레이아웃 변경
- 테스트 파일(__tests__) 삭제
- 불필요한 추상화

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (테스트 인프라 없음)
- **User wants tests**: NO (수동 검증)
- **Framework**: none
- **QA approach**: Manual verification (빌드 성공 확인)

### Automated Verification (Agent-Executable)

각 TODO 완료 후:
```bash
# 타입 체크
bun tsc --noEmit

# 빌드 확인
bun build
```

최종 검증:
```bash
# 개발 서버 실행 확인
bun dev &
sleep 5
curl -I http://localhost:3000
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately) - 독립 작업:
├── Task 1: 반응형 그리드 적용 (page.tsx, stats/page.tsx)
├── Task 2: DateRangePicker 동적 import
├── Task 3: 미사용 코드 삭제 (proxy.ts)
└── Task 4: Skeleton shimmer 적용

Wave 2 (After Wave 1) - useCallback 최적화:
├── Task 5: useCallback - DateRangePicker (CRITICAL - 16개 핸들러)
└── Task 6: useCallback - Pages & Components (33개 핸들러)

Wave 3 (After Wave 2) - UX 마무리:
├── Task 7: 터치 타겟 44px 확보
├── Task 8: 빈 상태/에러 메시지 통일
└── Task 9: 최종 빌드 검증
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 9 | 2, 3, 4 |
| 2 | None | 9 | 1, 3, 4 |
| 3 | None | 9 | 1, 2, 4 |
| 4 | None | 9 | 1, 2, 3 |
| 5 | None | 9 | 6 |
| 6 | None | 9 | 5 |
| 7 | 1 | 9 | 8 |
| 8 | 1 | 9 | 7 |
| 9 | 1-8 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2, 3, 4 | sisyphus-junior 또는 build (병렬) |
| 2 | 5, 6 | sisyphus-junior (병렬) |
| 3 | 7, 8, 9 | sisyphus-junior → build (순차) |

---

## TODOs

### Wave 1: 독립 작업 (병렬 실행)

- [ ] 1. 반응형 그리드 적용

  **What to do**:
  - src/app/page.tsx: StatCard 그리드에 `md:grid-cols-4` 추가
  - src/app/page.tsx: RouteCard 리스트에 `md:grid-cols-2 lg:grid-cols-3` 추가
  - src/app/stats/page.tsx: StatCard 그리드에 `md:grid-cols-4` 추가

  **Must NOT do**:
  - 새로운 breakpoint 정의
  - gap 값 변경
  - 기존 mobile 레이아웃 수정

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: 단순 클래스 추가 작업

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:
  - `src/app/page.tsx:255` - StatCard 그리드: `grid grid-cols-2 gap-3`
  - `src/app/page.tsx:319` - RouteCard 리스트: `space-y-3`
  - `src/app/stats/page.tsx:176` - StatCard 그리드: `grid grid-cols-2 gap-3`

  **Acceptance Criteria**:
  ```bash
  # 빌드 성공 확인
  bun build
  # Exit code 0
  ```

  **Commit**: YES
  - Message: `feat(responsive): add tablet/desktop breakpoints for card grids`
  - Files: `src/app/page.tsx`, `src/app/stats/page.tsx`

---

- [ ] 2. DateRangePicker 동적 import

  **What to do**:
  - src/components/migration/NewMigrationForm.tsx에서 DateRangePicker를 Next.js dynamic()으로 변경
  - `ssr: false` 옵션 적용
  - loading fallback으로 Skeleton 컴포넌트 사용

  **Must NOT do**:
  - DateRangePicker 컴포넌트 자체 수정
  - 다른 파일에서 DateRangePicker 사용 방식 변경

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: 기존 패턴 따라 동적 import 적용

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:
  - `src/components/migration/NewMigrationForm.tsx:8` - 현재 import 위치
  - `src/providers/AgentationProvider.tsx:3-6` - 동적 import 패턴 예시
  - `src/app/admin/migration/page.tsx:4-7` - 다른 동적 import 예시

  **Acceptance Criteria**:
  ```bash
  # 타입 체크
  bun tsc --noEmit
  # 빌드 성공
  bun build
  ```

  **Commit**: YES
  - Message: `perf(migration): lazy load DateRangePicker component`
  - Files: `src/components/migration/NewMigrationForm.tsx`

---

- [ ] 3. 미사용 코드 삭제

  **What to do**:
  - src/proxy.ts 파일 삭제

  **Must NOT do**:
  - __tests__ 디렉토리 삭제
  - 다른 파일의 import 수정 (proxy.ts는 어디서도 import되지 않음)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: 단순 파일 삭제

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:
  - `src/proxy.ts` - 삭제 대상 파일 (24줄, 미사용 middleware)

  **Acceptance Criteria**:
  ```bash
  # 파일 삭제 확인
  test ! -f src/proxy.ts && echo "File deleted"
  # 빌드 성공
  bun build
  ```

  **Commit**: YES
  - Message: `chore: remove unused proxy.ts middleware`
  - Files: `src/proxy.ts` (deleted)

---

- [ ] 4. Skeleton shimmer 적용

  **What to do**:
  - src/components/ui/skeleton.tsx: `animate-pulse` → `skeleton-shimmer` 클래스로 변경
  - 또는 둘 다 적용: `animate-pulse skeleton-shimmer`

  **Must NOT do**:
  - globals.css의 skeleton-shimmer 정의 수정
  - 개별 Skeleton 사용처 수정

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: 단일 파일 클래스 변경

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:
  - `src/components/ui/skeleton.tsx:7` - 현재: `bg-accent animate-pulse`
  - `src/app/globals.css:147-161` - skeleton-shimmer 정의

  **Acceptance Criteria**:
  ```bash
  # 빌드 성공
  bun build
  ```

  **Commit**: YES
  - Message: `style(skeleton): apply shimmer animation for better loading UX`
  - Files: `src/components/ui/skeleton.tsx`

---

### Wave 2: useCallback 최적화 (병렬 실행)

- [ ] 5. useCallback - DateRangePicker (CRITICAL)

  **What to do**:
  - src/components/input/DateRangePicker.tsx의 16개 핸들러에 useCallback 적용:
    - `handleSelect` (line 82-91) - deps: `[onDateChange]`
    - `handlePrevYear` (line 107) - deps: `[]` (setDisplayMonth 사용)
    - `handleNextYear` (line 108-113) - deps: `[displayMonth, today]`
    - `handlePrevMonth` (line 114) - deps: `[]`
    - `handleNextMonth` (line 115-120) - deps: `[displayMonth, today]`
    - `handleMonthChange` (line 123-125) - deps: `[]`
    - `handleYearChange` (line 127-134) - deps: `[displayMonth, today]`
    - `applyPreset` (line 155-160) - deps: `[today, onDateChange]`
    - `handleStartInputBlur` (line 163-171) - deps: `[startInput, today, endDate, onDateChange]`
    - `handleEndInputBlur` (line 173-180) - deps: `[endInput, today, startDate, onDateChange]`
    - `handleInputKeyDown` (line 182-187) - deps: `[handleStartInputBlur, handleEndInputBlur]`
  - JSX 내 인라인 함수는 유지 (preset buttons의 `() => applyPreset(n)`)

  **Must NOT do**:
  - 컴포넌트 로직 변경
  - props 인터페이스 변경
  - 새로운 state 추가

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: 패턴화된 useCallback 적용

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 6)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:
  - `src/components/input/DateRangePicker.tsx` - 전체 파일
  - `src/components/data-display/RouteCard.tsx:23-30` - useCallback 패턴 예시

  **Acceptance Criteria**:
  ```bash
  # 타입 체크 (의존성 배열 검증)
  bun tsc --noEmit
  # 빌드 성공
  bun build
  ```

  **Commit**: YES
  - Message: `perf(DateRangePicker): memoize handlers with useCallback`
  - Files: `src/components/input/DateRangePicker.tsx`

---

- [ ] 6. useCallback - Pages & Components (33개 핸들러)

  **What to do**:
  7개 파일의 핸들러에 useCallback 적용:

  **6.1 src/app/stats/page.tsx** (6개):
  - `handlePrevMonth` (line 54-56) - deps: `[currentMonth]`
  - `handleNextMonth` (line 58-60) - deps: `[currentMonth]`
  - `handleDateClick` (line 62-64) - deps: `[]`

  **6.2 src/app/page.tsx** (11개, 1개 이미 완료):
  - `handleSearchFocus` (line 110-112) - deps: `[router]`
  - `handleLoadMore` (line 114-116) - deps: `[]`
  - `handlePrevMonth` (line 124) - deps: `[currentMonth]`
  - `handleNextMonth` (line 125) - deps: `[currentMonth]`
  - `handleDateSelect` (line 127-131) - deps: `[]`
  - `handleTodayClick` (line 133-139) - deps: `[]`

  **6.3 src/app/search/page.tsx** (5개, 2개 이미 완료):
  - `handleClear` (line 104-106) - deps: `[]`
  - `handleTypeChange` (line 108-110) - deps: `[]`

  **6.4 src/components/layout/Header.tsx** (1개):
  - 인라인 `router.back()` (line 32) → useCallback으로 추출

  **6.5 src/components/migration/MigrationManager.tsx** (3개):
  - `handleStart` (line 31-33) - deps: `[startMigration]`
  - `handleCancel` (line 35-39) - deps: `[cancelMigration]`
  - `getStatusText` (line 41-45) → useMemo로 변경 - deps: `[isLoadingJobs, hasActiveJob, activeJob]`

  **6.6 src/components/migration/NewMigrationForm.tsx** (3개):
  - `handleDateChange` (line 27-31) - deps: `[]`
  - `handleSubmit` (line 33-59) - deps: `[startDate, endDate, onSubmit]`

  **6.7 src/components/migration/MigrationJobCard.tsx** (1개):
  - 인라인 `onCancel(job.id)` (line 80) → useCallback으로 추출

  **Must NOT do**:
  - 이미 useCallback이 적용된 핸들러 수정 (handleRouteClick in page.tsx, saveRecentSearch/handleRouteClick in search/page.tsx)
  - 컴포넌트 로직 변경

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - Reason: 다수 파일 수정, 의존성 배열 주의 필요

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 5)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:
  - 각 파일의 해당 라인 번호 (위 목록 참조)
  - `src/components/data-display/RouteCard.tsx:23-30` - useCallback 패턴 예시

  **Acceptance Criteria**:
  ```bash
  # 타입 체크 (의존성 배열 검증)
  bun tsc --noEmit
  # 빌드 성공
  bun build
  ```

  **Commit**: YES
  - Message: `perf(handlers): memoize inline handlers across pages and components`
  - Files: `src/app/stats/page.tsx`, `src/app/page.tsx`, `src/app/search/page.tsx`, `src/components/layout/Header.tsx`, `src/components/migration/MigrationManager.tsx`, `src/components/migration/NewMigrationForm.tsx`, `src/components/migration/MigrationJobCard.tsx`

---

### Wave 3: UX 마무리 (순차 실행)

- [ ] 7. 터치 타겟 44px 확보

  **What to do**:
  핵심 인터랙티브 요소에 최소 44px 터치 영역 확보:

  **7.1 src/components/layout/Header.tsx**:
  - 뒤로가기/메뉴 버튼: `h-10 w-10` → `h-11 w-11` (44px)

  **7.2 src/components/ui/calendar.tsx**:
  - 네비게이션 버튼: `size-7` → `size-9` (36px) 또는 터치 영역만 확대
  - 날짜 버튼: `size-9` 유지 (36px, 그리드 레이아웃상 확대 어려움)

  **7.3 src/components/data-display/RouteCard.tsx**:
  - 즐겨찾기 버튼: `p-1 -m-1` → `p-2 -m-2` (터치 영역 확대)

  **7.4 src/app/page.tsx & src/app/stats/page.tsx**:
  - 캘린더 팝오버 내 버튼: `h-8 w-8` → `h-10 w-10`
  - 날짜 버튼: 기존 유지 (그리드 레이아웃)

  **Must NOT do**:
  - Button 컴포넌트 전역 수정
  - 시각적 크기 증가 (터치 영역만 확대)
  - 레이아웃 깨짐 유발

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`frontend-ui-ux`]
  - Reason: 터치 영역 확대 작업, UI 감각 필요

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 8)
  - **Blocks**: Task 9
  - **Blocked By**: Task 1

  **References**:
  - `src/components/layout/Header.tsx:33,45` - 아이콘 버튼
  - `src/components/ui/calendar.tsx:55,65` - 네비게이션 버튼
  - `src/components/data-display/RouteCard.tsx:53` - 즐겨찾기 버튼
  - `src/app/page.tsx:167,179` - 캘린더 팝오버 버튼

  **Acceptance Criteria**:
  ```bash
  # 빌드 성공
  bun build
  ```

  **Commit**: YES
  - Message: `a11y(touch): increase touch targets to 44px minimum`
  - Files: `src/components/layout/Header.tsx`, `src/components/ui/calendar.tsx`, `src/components/data-display/RouteCard.tsx`, `src/app/page.tsx`, `src/app/stats/page.tsx`

---

- [ ] 8. 빈 상태/에러 메시지 통일

  **What to do**:

  **8.1 빈 상태 추가**:
  - src/app/stats/page.tsx: stats가 null일 때 빈 상태 표시
    - 패턴: `<div className="flex flex-col items-center justify-center py-16 text-center"><Icon /><p>...</p></div>`
  
  **8.2 에러 메시지 통일**:
  - 기존 패턴 유지: `bg-destructive/10 border border-destructive/20 p-4 text-center`
  - 메시지 개선:
    - "오류가 발생했습니다" → "데이터를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요."
    - 에러 유형별 구체적 메시지 (네트워크, 서버 등)

  **Must NOT do**:
  - 새로운 EmptyState 컴포넌트 생성
  - Toast/Snackbar 추가
  - 에러 boundary 수정

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: 기존 패턴 활용한 간단한 UI 추가

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 7)
  - **Blocks**: Task 9
  - **Blocked By**: Task 1

  **References**:
  - `src/app/search/page.tsx:25-33` - EmptyState 패턴 예시
  - `src/app/page.tsx:251-253` - 에러 메시지 패턴
  - `src/app/page.tsx:342-344` - 빈 상태 패턴

  **Acceptance Criteria**:
  ```bash
  # 빌드 성공
  bun build
  ```

  **Commit**: YES
  - Message: `ux(empty-state): add consistent empty states and improve error messages`
  - Files: `src/app/stats/page.tsx`, `src/app/page.tsx`

---

- [ ] 9. 최종 빌드 검증

  **What to do**:
  - 전체 타입 체크 실행
  - 프로덕션 빌드 실행
  - 개발 서버 정상 실행 확인

  **Must NOT do**:
  - 추가 코드 수정
  - 새로운 기능 추가

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: 빌드 검증만 수행

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (final)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 1-8

  **References**:
  - `package.json` - 빌드 스크립트

  **Acceptance Criteria**:
  ```bash
  # 타입 체크
  bun tsc --noEmit
  echo "TypeScript check passed"

  # 프로덕션 빌드
  bun build
  echo "Build successful"

  # 개발 서버 확인 (선택적)
  # bun dev &
  # sleep 5
  # curl -I http://localhost:3000
  ```

  **Commit**: NO (검증만)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(responsive): add tablet/desktop breakpoints for card grids` | page.tsx, stats/page.tsx | bun build |
| 2 | `perf(migration): lazy load DateRangePicker component` | NewMigrationForm.tsx | bun build |
| 3 | `chore: remove unused proxy.ts middleware` | proxy.ts (deleted) | bun build |
| 4 | `style(skeleton): apply shimmer animation for better loading UX` | skeleton.tsx | bun build |
| 5 | `perf(DateRangePicker): memoize handlers with useCallback` | DateRangePicker.tsx | bun tsc && bun build |
| 6 | `perf(handlers): memoize inline handlers across pages and components` | 7 files | bun tsc && bun build |
| 7 | `a11y(touch): increase touch targets to 44px minimum` | 5 files | bun build |
| 8 | `ux(empty-state): add consistent empty states and improve error messages` | 2 files | bun build |

---

## Success Criteria

### Verification Commands
```bash
# 타입 체크
bun tsc --noEmit  # Expected: 0 errors

# 프로덕션 빌드
bun build  # Expected: Build successful

# 빌드 결과물 확인
ls -la .next/  # Expected: Directory exists with build files
```

### Final Checklist
- [ ] All "Must Have" present (기존 패턴 유지, 최소 변경, 빌드 성공)
- [ ] All "Must NOT Have" absent (전역 Button 수정 없음, 새 컴포넌트 없음)
- [ ] 8개 커밋 생성 완료
- [ ] TypeScript 에러 0개
- [ ] 프로덕션 빌드 성공
