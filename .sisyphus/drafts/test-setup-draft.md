# Draft: Vitest 테스트 환경 구축 및 테스트 작성

## Requirements (confirmed)

### 프로젝트 현황 (발견된 사실)
- **vitest 설치됨**: `vitest: ^4.0.18`
- **testing-library 설치됨**: `@testing-library/react: ^16.3.2`, `@testing-library/dom: ^10.4.1`
- **vitest.config.ts 존재**: jsdom 환경, globals: true, setupFiles 설정 완료
- **vitest.setup.ts 존재**: localStorage mock, requestAnimationFrame mock 포함
- **test 스크립트 없음**: package.json에 test 관련 스크립트 없음
- **테스트 파일 없음**: `__tests__/` 디렉토리는 있으나 비어있음

### 테스트 대상 파일

**Hooks (7개):**
1. `useCountUp.ts` - requestAnimationFrame 애니메이션 (setup에 mock 있음)
2. `useStats.ts` - React Query 훅 (api.stats.getByDate 호출)
3. `useRoutes.ts` - React Query 훅 2개 함수 (`useRoutes`, `useRoutesByDate`)
4. `useFavorites.ts` - localStorage 기반 (setup에 mock 있음)
5. `useAuth.ts` - Context consumer (AuthProvider 의존)
6. `useMigration.ts` - React Query 훅 5개 (Query 3개, Mutation 2개)
7. `index.ts` - 단순 re-export (테스트 불필요)

**Utilities (2개):**
1. `utils.ts` - `cn()` 함수만 (간단)
2. `api.ts` - 토큰 관리 + fetch 헬퍼 + API 객체 (복잡)

**Components (23개):**
- ui/ - 9개 (Shadcn 기반, 테스트 우선순위 낮음)
- layout/ - 3개 (Header, AppShell, BottomNav)
- input/ - 3개 (SearchBar, DateRangePicker, SearchTabs)
- data-display/ - 3개 (RouteCard, StatCard, RouteDetail)
- migration/ - 3개 (MigrationManager, NewMigrationForm, MigrationJobCard)
- ErrorBoundary.tsx

## Technical Decisions

### 기존 설정 유지
- vitest.config.ts: 현재 설정 충분
- vitest.setup.ts: localStorage, requestAnimationFrame mock 이미 있음

### 추가 필요 사항
- package.json test 스크립트 추가 필요
- `@testing-library/jest-dom` 설치 여부 확인 필요 (toBeInTheDocument 등)

## Research Findings

### Explore 에이전트 결과 (완료)
- 프로젝트 구조 완전 파악
- 테스트 인프라 이미 구성됨 (vitest + testing-library)
- 테스트 파일만 없는 상태

### Librarian 에이전트 (진행 중)
- vitest + Next.js 베스트 프랙티스
- React Query 훅 테스트 방법
- requestAnimationFrame 테스트 패턴

## Decisions Made (사용자 확정)

1. **테스트 범위**: 1.2 - 훅, 유틸, 주요 컴포넌트 모두 테스트
2. **컴포넌트 범위**: 2.1 - 비즈니스 로직 컴포넌트만 (MigrationManager, SearchBar 등)
3. **API 테스트**: 3.1 - fetch mock으로 단위 테스트
4. **커버리지 목표**: 4.2 - edge case 포함한 적정 커버리지
5. **test 스크립트**: 5.2 - `"test": "vitest run"` + `"test:watch": "vitest"`

## Scope Boundaries

### INCLUDE (확정)
- vitest.config.ts 확인 및 필요시 수정
- vitest.setup.ts 확인 및 필요시 확장  
- package.json test 스크립트 추가
- Hook 테스트 (6개): useCountUp, useStats, useRoutes, useFavorites, useAuth, useMigration
- Utility 테스트 (2개): utils.ts (cn), api.ts (token + fetch + api)
- 비즈니스 컴포넌트 테스트: MigrationManager, SearchBar, 기타 로직 있는 컴포넌트

### EXCLUDE (확정)
- index.ts (단순 re-export)
- UI 컴포넌트 (Shadcn 기반: button, card, input 등)
- MSW 통합 테스트 (fetch mock만 사용)
- 커버리지 리포팅 (5.2 선택으로 제외)
