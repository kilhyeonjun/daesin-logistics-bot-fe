# Vitest Testing Infrastructure & Test Implementation

## TL;DR

> **Quick Summary**: Set up vitest testing environment (missing dependencies & scripts) and implement comprehensive tests for 6 hooks, 2 utility modules, and 6 business components with edge case coverage.
> 
> **Deliverables**:
> - Updated package.json with test scripts
> - Enhanced vitest.setup.ts with @testing-library/jest-dom
> - Test utilities (React Query wrapper, mock helpers)
> - 14 test files covering hooks, utils, and components
> 
> **Estimated Effort**: Medium (4-6 hours)
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Setup (Wave 1) -> Test Utils (Wave 2) -> Tests (Wave 3) -> Verification (Wave 4)

---

## Context

### Original Request
사용자가 요청한 것:
1. vitest 설정 확인 및 셋업
2. 테스트할 대상 우선순위 정하기
3. 테스트 추가 (커스텀 훅, 유틸 함수, 컴포넌트)
4. 테스트 통과 확인 후 커밋 & 푸시

### Interview Summary
**Key Discussions**:
- 테스트 범위: 훅, 유틸, 주요 컴포넌트 모두 (선택 1.2)
- 컴포넌트 범위: 비즈니스 로직 컴포넌트만 (선택 2.1)
- API 테스트: fetch mock만, MSW 제외 (선택 3.1)
- 커버리지: edge case 포함 (선택 4.2)
- 스크립트: test + test:watch (선택 5.2)

**Research Findings**:
- vitest 4.0.18, @testing-library/react 16.3.2 이미 설치됨
- vitest.config.ts, vitest.setup.ts 존재 (기본 설정 완료)
- @testing-library/jest-dom 누락 (toBeInTheDocument 등 매처 필요)
- @testing-library/user-event 누락 (폼 테스트에 필요)
- package.json에 test 스크립트 없음
- React Query 테스트는 retry: false 설정 필요

### Metis Review
**Identified Gaps** (addressed):
- 누락 패키지: @testing-library/jest-dom, @testing-library/user-event 추가
- 비즈니스 로직 정의: RouteCard, StatCard, SearchTabs는 프레젠테이션으로 분류
- Edge case 구체화: 각 테스트 대상별 구체적인 케이스 정의
- React Query 래퍼: createTestWrapper() 헬퍼 생성
- 타이머 전략: vi.useFakeTimers() 사용 (useCountUp)

---

## Work Objectives

### Core Objective
vitest 테스트 환경을 완성하고, 커스텀 훅 6개, 유틸 함수 2개, 비즈니스 컴포넌트 3개에 대한 테스트를 작성하여 코드 신뢰성을 확보한다.

### Concrete Deliverables
1. `package.json` - test, test:watch 스크립트 추가
2. `vitest.setup.ts` - @testing-library/jest-dom import 추가
3. `src/__tests__/test-utils.tsx` - React Query wrapper, mock helpers
4. `src/lib/__tests__/utils.test.ts` - cn() 함수 테스트
5. `src/lib/__tests__/api.test.ts` - 토큰 관리 + fetch helpers 테스트
6. `src/hooks/__tests__/useCountUp.test.ts`
7. `src/hooks/__tests__/useFavorites.test.ts`
8. `src/hooks/__tests__/useAuth.test.ts`
9. `src/hooks/__tests__/useStats.test.ts`
10. `src/hooks/__tests__/useRoutes.test.ts`
11. `src/hooks/__tests__/useMigration.test.ts`
12. `src/components/migration/__tests__/MigrationManager.test.tsx`
13. `src/components/migration/__tests__/NewMigrationForm.test.tsx`
14. `src/components/input/__tests__/SearchBar.test.tsx`

### Definition of Done
- [ ] `npm run test` 실행 시 모든 테스트 통과
- [ ] `npm run test:watch` 실행 시 watch 모드 정상 작동
- [ ] 각 테스트 파일에 최소 3개 이상의 테스트 케이스 포함
- [ ] Happy path + Error path + Edge case 테스트 포함

### Must Have
- @testing-library/jest-dom matchers (toBeInTheDocument, toHaveTextContent 등)
- @testing-library/user-event (폼 인터랙션 테스트)
- React Query test wrapper (retry: false, gcTime: 0)
- fetch mock helper
- localStorage mock (기존 setup.ts 활용)
- requestAnimationFrame mock (기존 setup.ts 활용)

### Must NOT Have (Guardrails)
- MSW (Mock Service Worker) 설치 금지 - fetch mock만 사용
- Snapshot 테스트 금지 - 명시적 assertion만 사용
- test.skip() 또는 test.todo() 커밋 금지
- UI 컴포넌트 테스트 금지 (button, card, input 등 Shadcn 컴포넌트)
- 커버리지 리포팅 설정 금지 (5.2 선택으로 제외)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (vitest, @testing-library/react 설치됨)
- **User wants tests**: YES (TDD는 아님, tests-after 방식)
- **Framework**: vitest + @testing-library/react

### Automated Verification (AGENT-EXECUTABLE)

**모든 테스트 파일에 대해:**
```bash
# Agent runs:
npm run test -- --run
# Assert: Exit code 0
# Assert: Output contains "Tests:" and "passed"
```

**개별 테스트 검증:**
```bash
# Agent runs:
npm run test -- src/lib/__tests__/utils.test.ts --run
# Assert: Exit code 0
# Assert: Output contains "PASS"
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately) - Setup:
├── Task 1: Install missing dependencies (@testing-library/jest-dom, user-event)
├── Task 2: Add test scripts to package.json
└── Task 3: Update vitest.setup.ts

Wave 2 (After Wave 1) - Test Utilities:
└── Task 4: Create test-utils.tsx (React Query wrapper, mock helpers)

Wave 3 (After Wave 2) - Tests (Parallel):
├── Task 5: Utils tests (cn, api.ts)
├── Task 6: Hook tests - Part 1 (useCountUp, useFavorites, useAuth)
├── Task 7: Hook tests - Part 2 (useStats, useRoutes, useMigration)
└── Task 8: Component tests (MigrationManager, NewMigrationForm, SearchBar)

Wave 4 (After Wave 3) - Verification:
├── Task 9: Run all tests and fix failures
└── Task 10: Commit and push
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 4, 5-10 | 2, 3 |
| 2 | None | 9, 10 | 1, 3 |
| 3 | None | 4, 5-10 | 1, 2 |
| 4 | 1, 3 | 5-10 | None |
| 5 | 4 | 9 | 6, 7, 8 |
| 6 | 4 | 9 | 5, 7, 8 |
| 7 | 4 | 9 | 5, 6, 8 |
| 8 | 4 | 9 | 5, 6, 7 |
| 9 | 5-8 | 10 | None |
| 10 | 9 | None | None |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2, 3 | quick (parallel) |
| 2 | 4 | quick (sequential) |
| 3 | 5, 6, 7, 8 | quick (parallel) |
| 4 | 9, 10 | quick (sequential) |

---

## TODOs

- [ ] 1. Install missing test dependencies

  **What to do**:
  - Install @testing-library/jest-dom (toBeInTheDocument, toHaveTextContent 등 매처)
  - Install @testing-library/user-event (폼 인터랙션 시뮬레이션)
  - Verify installation with `npm ls @testing-library/jest-dom`

  **Must NOT do**:
  - MSW 설치 금지
  - vitest 버전 변경 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단순 npm install 명령어 실행
  - **Skills**: None required
  - **Skills Evaluated but Omitted**:
    - `git-master`: 설치만 하고 커밋 아직 안함

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Task 4
  - **Blocked By**: None

  **References**:
  - `package.json:30-47` - 현재 devDependencies 확인
  - Librarian Research - @testing-library/jest-dom 설치 방법

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  npm install --save-dev @testing-library/jest-dom @testing-library/user-event
  # Assert: Exit code 0

  npm ls @testing-library/jest-dom @testing-library/user-event
  # Assert: Output shows installed versions
  ```

  **Commit**: NO (groups with Task 10)

---

- [ ] 2. Add test scripts to package.json

  **What to do**:
  - Add `"test": "vitest run"` script
  - Add `"test:watch": "vitest"` script
  - Verify scripts work with `npm run test -- --help`

  **Must NOT do**:
  - test:coverage 추가 금지 (사용자 선택 5.2)
  - 기존 스크립트 수정 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단순 JSON 수정
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Task 9, 10
  - **Blocked By**: None

  **References**:
  - `package.json:5-10` - 현재 scripts 섹션

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  cat package.json | grep -A5 '"scripts"'
  # Assert: Contains "test": "vitest run"
  # Assert: Contains "test:watch": "vitest"

  npm run test -- --help
  # Assert: Exit code 0
  # Assert: Output contains vitest help
  ```

  **Commit**: NO (groups with Task 10)

---

- [ ] 3. Update vitest.setup.ts with jest-dom

  **What to do**:
  - Import '@testing-library/jest-dom/vitest' at top of file
  - Keep existing localStorage mock
  - Keep existing requestAnimationFrame mock
  - Add cleanup() from @testing-library/react in afterEach

  **Must NOT do**:
  - 기존 mock 삭제 금지
  - vitest.config.ts 수정 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단순 import 추가
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Task 4
  - **Blocked By**: None

  **References**:
  - `vitest.setup.ts:1-24` - 현재 setup 파일 전체
  - Librarian Research - @testing-library/jest-dom 설정 방법

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  head -5 vitest.setup.ts
  # Assert: Contains "import '@testing-library/jest-dom/vitest'"
  # Assert: Contains "import { cleanup }"
  ```

  **Commit**: NO (groups with Task 10)

---

- [ ] 4. Create test utilities (test-utils.tsx)

  **What to do**:
  - Create `src/__tests__/test-utils.tsx`
  - Implement `createTestQueryClient()` with retry: false, gcTime: 0
  - Implement `createWrapper()` for React Query hooks
  - Implement `renderWithQueryClient()` for components
  - Implement `mockFetch()` helper for API mocking
  - Export all utilities

  **Must NOT do**:
  - MSW 설정 금지
  - 실제 API 호출 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 테스트 유틸리티 생성, 복잡하지 않음
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential)
  - **Blocks**: Tasks 5, 6, 7, 8
  - **Blocked By**: Tasks 1, 3

  **References**:
  - Librarian Research - React Query 테스트 wrapper 패턴
  - `src/hooks/useStats.ts:3-4` - React Query 사용 패턴 확인
  - `src/lib/api.ts:38-66` - fetchApi 함수 구조 확인

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  test -f src/__tests__/test-utils.tsx && echo "File exists"
  # Assert: Output "File exists"

  grep -l "createTestQueryClient" src/__tests__/test-utils.tsx
  # Assert: Exit code 0

  grep -l "mockFetch" src/__tests__/test-utils.tsx
  # Assert: Exit code 0
  ```

  **Commit**: NO (groups with Task 10)

---

- [ ] 5. Write utility function tests (utils.ts, api.ts)

  **What to do**:
  
  **5a. src/lib/__tests__/utils.test.ts**:
  - Test cn() with empty input → returns ''
  - Test cn() with single class → returns class
  - Test cn() with multiple classes → returns merged
  - Test cn() with conditional classes (false, null, undefined)
  - Test cn() with conflicting Tailwind classes (tw-merge)

  **5b. src/lib/__tests__/api.test.ts**:
  - Test getToken() when token exists/missing
  - Test setToken() stores in localStorage and cookie
  - Test clearToken() removes from localStorage and cookie
  - Test fetchApi() success response
  - Test fetchApi() error response (non-200)
  - Test fetchApi() network error
  - Test fetchApiWithAuth() includes Authorization header
  - Test api.routes.searchByCode() calls correct endpoint
  - Test api.stats.getByDate() calls correct endpoint

  **Must NOT do**:
  - 실제 API 호출 금지
  - localStorage 직접 조작 금지 (mock 사용)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 유틸 함수 테스트, 단순 로직
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 7, 8)
  - **Blocks**: Task 9
  - **Blocked By**: Task 4

  **References**:
  - `src/lib/utils.ts:1-7` - cn() 함수 전체
  - `src/lib/api.ts:16-31` - 토큰 관리 함수들
  - `src/lib/api.ts:38-101` - fetch helpers
  - `src/lib/api.ts:103-156` - api 객체

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  npm run test -- src/lib/__tests__/utils.test.ts --run
  # Assert: Exit code 0
  # Assert: Output contains "PASS"

  npm run test -- src/lib/__tests__/api.test.ts --run
  # Assert: Exit code 0
  # Assert: Output contains "PASS"
  ```

  **Commit**: NO (groups with Task 10)

---

- [ ] 6. Write hook tests - Part 1 (useCountUp, useFavorites, useAuth)

  **What to do**:
  
  **6a. src/hooks/__tests__/useCountUp.test.ts**:
  - Test initial count is 0 when startOnMount=true
  - Test count reaches end value after duration
  - Test isAnimating is true during animation
  - Test isAnimating is false after completion
  - Test startOnMount=false sets count to end immediately
  - Test end=0 sets count to 0 immediately
  - Use vi.useFakeTimers() for timing control

  **6b. src/hooks/__tests__/useFavorites.test.ts**:
  - Test initial favorites is empty array
  - Test addFavorite() adds item to list
  - Test addFavorite() with duplicate does nothing
  - Test removeFavorite() removes item
  - Test toggleFavorite() adds/removes correctly
  - Test isFavorite() returns true/false correctly
  - Test localStorage persistence on each action

  **6c. src/hooks/__tests__/useAuth.test.ts**:
  - Test throws error when used outside AuthProvider
  - Test returns context value when inside AuthProvider
  - Create mock AuthProvider for testing

  **Must NOT do**:
  - 실제 API 호출 금지
  - 실제 타이머 사용 금지 (fake timers 사용)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 훅 테스트, renderHook 패턴 사용
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 5, 7, 8)
  - **Blocks**: Task 9
  - **Blocked By**: Task 4

  **References**:
  - `src/hooks/useCountUp.ts:1-63` - useCountUp 전체
  - `src/hooks/useFavorites.ts:1-61` - useFavorites 전체
  - `src/hooks/useAuth.ts:1-13` - useAuth 전체
  - `src/providers/AuthProvider.tsx:1-68` - AuthContext 구조
  - `vitest.setup.ts:16-23` - requestAnimationFrame mock

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  npm run test -- src/hooks/__tests__/useCountUp.test.ts --run
  # Assert: Exit code 0

  npm run test -- src/hooks/__tests__/useFavorites.test.ts --run
  # Assert: Exit code 0

  npm run test -- src/hooks/__tests__/useAuth.test.ts --run
  # Assert: Exit code 0
  ```

  **Commit**: NO (groups with Task 10)

---

- [ ] 7. Write hook tests - Part 2 (useStats, useRoutes, useMigration)

  **What to do**:
  
  **7a. src/hooks/__tests__/useStats.test.ts**:
  - Test returns loading state initially
  - Test returns data on success
  - Test returns error on failure
  - Test enabled=false prevents fetch
  - Test date validation (length !== 8 prevents fetch)
  - Mock api.stats.getByDate()

  **7b. src/hooks/__tests__/useRoutes.test.ts**:
  - Test useRoutes() with type='code'
  - Test useRoutes() with type='name'
  - Test useRoutes() with type='car'
  - Test useRoutes() with empty query returns []
  - Test useRoutesByDate() success
  - Test useRoutesByDate() with invalid date
  - Mock api.routes methods

  **7c. src/hooks/__tests__/useMigration.test.ts**:
  - Test useMigrationJobs() returns job list
  - Test useActiveMigration() returns active job
  - Test useMigrationJob(id) returns specific job
  - Test useStartMigration() mutation calls API
  - Test useCancelMigration() mutation calls API
  - Test cache invalidation after mutations
  - Mock api.migration methods

  **Must NOT do**:
  - 실제 API 호출 금지
  - React Query 내부 테스트 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: React Query 훅 테스트, 패턴화된 작업
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 5, 6, 8)
  - **Blocks**: Task 9
  - **Blocked By**: Task 4

  **References**:
  - `src/hooks/useStats.ts:1-20` - useStats 전체
  - `src/hooks/useRoutes.ts:1-48` - useRoutes, useRoutesByDate 전체
  - `src/hooks/useMigration.ts:1-85` - useMigration 훅들 전체
  - `src/__tests__/test-utils.tsx` - createWrapper() 사용
  - `src/types/api.ts:1-78` - DTO 타입 정의

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  npm run test -- src/hooks/__tests__/useStats.test.ts --run
  # Assert: Exit code 0

  npm run test -- src/hooks/__tests__/useRoutes.test.ts --run
  # Assert: Exit code 0

  npm run test -- src/hooks/__tests__/useMigration.test.ts --run
  # Assert: Exit code 0
  ```

  **Commit**: NO (groups with Task 10)

---

- [ ] 8. Write component tests (MigrationManager, NewMigrationForm, SearchBar)

  **What to do**:
  
  **8a. src/components/migration/__tests__/MigrationManager.test.tsx**:
  - Test renders collapsed by default
  - Test expands on click
  - Test shows loading state
  - Test shows recent jobs list
  - Test handleStart() calls mutation
  - Test handleCancel() calls mutation with confirm
  - Mock all useMigration hooks

  **8b. src/components/migration/__tests__/NewMigrationForm.test.tsx**:
  - Test renders form fields
  - Test submit button disabled when dates empty
  - Test validation error: missing dates
  - Test validation error: end before start
  - Test validation error: > 365 days
  - Test successful submission
  - Test disabled state when migration active
  - Use @testing-library/user-event for interactions

  **8c. src/components/input/__tests__/SearchBar.test.tsx**:
  - Test renders input with search icon
  - Test onChange fires on input
  - Test clear button appears when has value
  - Test onClear fires when clear clicked
  - Test clear button hidden when empty
  - Use @testing-library/user-event for typing

  **Must NOT do**:
  - Snapshot 테스트 금지
  - 스타일 테스트 금지
  - E2E 테스트 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 컴포넌트 테스트, @testing-library 패턴 사용
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 5, 6, 7)
  - **Blocks**: Task 9
  - **Blocked By**: Task 4

  **References**:
  - `src/components/migration/MigrationManager.tsx:1-112` - MigrationManager 전체
  - `src/components/migration/NewMigrationForm.tsx:1-104` - NewMigrationForm 전체
  - `src/components/input/SearchBar.tsx:1-47` - SearchBar 전체
  - `src/__tests__/test-utils.tsx` - renderWithQueryClient() 사용

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  npm run test -- src/components/migration/__tests__/MigrationManager.test.tsx --run
  # Assert: Exit code 0

  npm run test -- src/components/migration/__tests__/NewMigrationForm.test.tsx --run
  # Assert: Exit code 0

  npm run test -- src/components/input/__tests__/SearchBar.test.tsx --run
  # Assert: Exit code 0
  ```

  **Commit**: NO (groups with Task 10)

---

- [ ] 9. Run all tests and fix any failures

  **What to do**:
  - Run `npm run test` to execute all tests
  - If any test fails:
    - Read error message carefully
    - Fix the failing test or source code
    - Re-run until all pass
  - Verify test count matches expected (14 test files)

  **Must NOT do**:
  - test.skip() 사용 금지
  - 테스트 삭제 금지
  - 소스 코드 로직 변경 금지 (테스트 수정만)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 테스트 실행 및 수정
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (sequential)
  - **Blocks**: Task 10
  - **Blocked By**: Tasks 5, 6, 7, 8

  **References**:
  - All test files created in Tasks 5-8

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  npm run test
  # Assert: Exit code 0
  # Assert: Output contains "Tests:" with 0 failed
  # Assert: Output shows all 14 test files passed
  ```

  **Commit**: NO (groups with Task 10)

---

- [ ] 10. Commit and push changes

  **What to do**:
  - Stage all new and modified files
  - Create commit with message: `test: add vitest testing infrastructure and comprehensive tests`
  - Push to remote

  **Must NOT do**:
  - 테스트 실패 상태에서 커밋 금지
  - Force push 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단순 git 명령어
  - **Skills**: `git-master`
    - `git-master`: 커밋 메시지 컨벤션, pre-commit 처리

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (sequential, final)
  - **Blocks**: None
  - **Blocked By**: Task 9

  **References**:
  - All files from Tasks 1-8

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  git status
  # Assert: No uncommitted changes after commit

  git log -1 --oneline
  # Assert: Contains "test: add vitest testing"

  git push
  # Assert: Exit code 0
  ```

  **Commit**: YES
  - Message: `test: add vitest testing infrastructure and comprehensive tests`
  - Files: 
    - package.json
    - vitest.setup.ts
    - src/__tests__/test-utils.tsx
    - src/lib/__tests__/*.test.ts
    - src/hooks/__tests__/*.test.ts
    - src/components/*/__tests__/*.test.tsx
  - Pre-commit: `npm run test`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 10 | `test: add vitest testing infrastructure and comprehensive tests` | All test files + setup | `npm run test` |

---

## Success Criteria

### Verification Commands
```bash
# All tests pass
npm run test                    # Expected: Exit 0, all tests pass

# Watch mode works
npm run test:watch -- --help    # Expected: Exit 0, shows help

# Test file count
find src -name "*.test.ts" -o -name "*.test.tsx" | wc -l  # Expected: 14
```

### Final Checklist
- [ ] All "Must Have" dependencies installed
- [ ] All "Must NOT Have" patterns absent (no MSW, no snapshots)
- [ ] All 14 test files created
- [ ] All tests pass with `npm run test`
- [ ] Changes committed and pushed
