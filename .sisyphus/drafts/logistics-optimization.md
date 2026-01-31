# Draft: 물류 배차 웹앱 최적화

## Requirements (confirmed)
- **반응형**: Tailwind 기본 breakpoint (sm:640px, md:768px, lg:1024px) 사용
- **레이아웃 변화**: 카드 그리드화만 (2-3열) - 최소 변경
- **에러 메시지**: 인라인 Alert 형태
- **테스트 전략**: 수동 검증 (빌드 성공 확인)
- **빈 상태 디자인**: 텍스트 + 아이콘 (미니멀)
- **작업 방식**: 병렬 처리로 동시 진행
- **추가 요구사항**: 기존 코드베이스 패턴 유지, 최소한의 변경, 빌드 실패 없이 안정적 진행

## Technical Decisions

### 1. 반응형 Breakpoint 전략
- Tailwind 기본값 사용 (별도 설정 불필요)
- md: (768px+) 카드 2열 그리드
- lg: (1024px+) 카드 3열 그리드
- 적용 대상: StatCard 그리드, RouteCard 리스트

### 2. DateRangePicker 동적 import
- Next.js dynamic() 사용
- NewMigrationForm.tsx에서만 사용됨
- 무거운 의존성 (react-day-picker, date-fns) lazy load

### 3. useCallback 최적화
- 52개 인라인 핸들러 중 49개 최적화 필요
- 우선순위: DateRangePicker > stats/page > page > 나머지
- 기존 패턴 참고: RouteCard.tsx (이미 memo + useCallback 적용)

### 4. 미사용 코드 정리
- 삭제 대상: src/proxy.ts (미사용 middleware)
- __tests__ 디렉토리: 유지 (정상 테스트 파일)
- 나머지 import/상수: 실제 사용 중 (오분석)

### 5. UX 개선 - 로딩 상태
- globals.css에 skeleton-shimmer 이미 정의됨
- Skeleton 컴포넌트에 shimmer 클래스 추가

### 6. UX 개선 - 에러 메시지
- 기존 패턴: `bg-destructive/10 border border-destructive/20`
- 인라인 Alert 형태로 통일

### 7. UX 개선 - 빈 상태
- 미니멀: 아이콘 + 텍스트
- 기존 EmptyState 패턴 참고 (search/page.tsx)

### 8. UX 개선 - 터치 타겟
- 최소 44px 확보
- 현재 문제: h-8(32px), h-9(36px), p-1(24px)
- 해결: 터치 영역만 확대 (min-h-11, min-w-11)

### 9. UX 개선 - 인터랙션 피드백
- BottomNav hover 강화
- Calendar dates hover 추가
- 기존 touch-feedback 클래스 활용

## Research Findings

### useCallback 분석 결과
- **DateRangePicker.tsx**: 16개 핸들러 (CRITICAL)
- **stats/page.tsx**: 6개 핸들러 (HIGH)
- **page.tsx**: 12개 핸들러 (1개 이미 최적화) (HIGH)
- **search/page.tsx**: 7개 핸들러 (2개 이미 최적화) (MEDIUM)
- **Header.tsx**: 1개 핸들러 (LOW)
- **MigrationManager.tsx**: 3개 핸들러 (MEDIUM)
- **NewMigrationForm.tsx**: 3개 핸들러 (MEDIUM)
- **MigrationJobCard.tsx**: 1개 핸들러 (LOW)

### 기존 패턴 분석
- RouteCard.tsx: memo() + useCallback 조합 사용
- globals.css: touch-feedback, skeleton-shimmer 유틸리티 존재
- Button 컴포넌트: size variants (xs, sm, default, lg, icon 시리즈)

### 미사용 코드 검증 결과
- src/proxy.ts: **미사용 확인** → 삭제
- Calendar icon (page.tsx): 사용 중 → 유지
- Route/Hash/Package/Banknote (stats): 사용 중 → 유지
- TOKEN_COOKIE (api.ts): 사용 중 → 유지
- __tests__ 디렉토리: 정상 테스트 → 유지

## Scope Boundaries
- **INCLUDE**: 
  - 반응형 breakpoint (카드 그리드)
  - DateRangePicker 동적 import
  - useCallback 최적화 (8개 파일)
  - 미사용 코드 삭제 (proxy.ts만)
  - Skeleton shimmer 개선
  - 에러 메시지 통일
  - 빈 상태 추가 (stats, routes)
  - 터치 타겟 44px 확보
  - BottomNav/Calendar hover 개선
  
- **EXCLUDE**:
  - 사이드바 네비게이션 (scope 외)
  - recharts 동적 import (미사용)
  - 테스트 파일 삭제 (__tests__ 유지)
  - 새로운 컴포넌트 생성 (최소 변경)

## Open Questions
- [x] breakpoint 전략 → Tailwind 기본값
- [x] 에러 메시지 스타일 → 인라인 Alert
- [x] 빈 상태 디자인 → 미니멀 (텍스트+아이콘)
- [x] 테스트 전략 → 수동 검증 (빌드 확인)
- [x] 백그라운드 에이전트 결과 → 모두 완료

## Additional Research Findings

### 터치 타겟 분석 결과
- **Button (default)**: h-9 (36px) - WCAG 44px 미만
- **Button (lg)**: h-10 (40px) - WCAG 44px 미만
- **Icon Button**: size-9 (36px) - WCAG 44px 미만
- **Calendar nav**: size-7 (28px) - 가장 작음
- **Calendar day**: size-9 (36px) - WCAG 44px 미만
- **SearchBar**: h-11 (44px) - WCAG 충족
- **BottomNav**: h-14 (56px) - WCAG 충족

### 기존 패턴 확인
- CVA (Class Variance Authority) 기반 Button 컴포넌트
- Compound Component 패턴 (Card)
- memo() + useCallback 조합 (RouteCard)
- touch-feedback 클래스 활용 (globals.css)
- skeleton-shimmer 정의됨 but 미사용

### 동적 import 패턴
- `ssr: false` 옵션 사용
- NODE_ENV 체크 패턴 존재

## Verification Strategy
- **수동 검증**: 빌드 성공 확인 (`npm run build` or `bun build`)
- **UI 검증**: 개발 서버에서 시각적 확인 (선택적)
