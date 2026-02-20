---
name: verify-types
description: API 타입 정의의 일관성과 완전성을 검증합니다. 타입 추가/수정 후 사용.
---

# API 타입 검증

## Purpose

`src/types/api.ts`에 정의된 API 타입의 일관성과 완전성을 검증합니다:

1. **DTO 타입 네이밍 규칙** — 모든 API 응답 타입은 `*Dto` 접미사를 사용하는지 확인
2. **필드 타입 안전성** — `any`, `unknown` 사용 금지, nullable 필드는 `| null`로 명시
3. **타입 export** — 모든 타입이 export되어 다른 모듈에서 사용 가능한지 확인
4. **API 응답 래퍼 일관성** — `ApiResponse<T>` 래퍼 사용 패턴의 일관성 확인

## When to Run

- `src/types/api.ts`를 수정한 후
- 새로운 API 엔드포인트를 추가한 후
- API 응답 구조가 변경된 후

## Related Files

| File | Purpose |
|------|---------|
| `src/types/api.ts` | API 타입 정의 |
| `src/lib/api.ts` | API 클라이언트 (타입 소비처) |
| `src/hooks/useRoutes.ts` | 라우트 훅 (타입 소비처) |
| `src/hooks/useStats.ts` | 통계 훅 (타입 소비처) |
| `src/hooks/useMigration.ts` | 마이그레이션 훅 (타입 소비처) |
| `src/hooks/useMonthlyStats.ts` | 월간 통계 훅 (타입 소비처) |

## Workflow

### Step 1: DTO 네이밍 규칙 검증

**파일:** `src/types/api.ts`

**검사:** 인터페이스 중 API 응답에 사용되는 타입은 `Dto` 접미사를 사용해야 합니다. 단, `ApiResponse`, `RecentSearch` 같은 클라이언트 전용 타입은 예외입니다.

**도구:** Grep

```
pattern: "export interface"
path: "src/types/api.ts"
```

**PASS:** 모든 API 응답 인터페이스가 `*Dto` 또는 `*ResponseDto` 접미사를 사용하거나, 클라이언트 전용 타입인 경우.

**FAIL:** API 응답용 인터페이스가 `*Dto` 접미사 없이 정의된 경우.

**수정:** 인터페이스 이름에 `Dto` 접미사를 추가하고, 해당 타입을 import하는 모든 파일을 업데이트.

### Step 2: any/unknown 사용 금지

**파일:** `src/types/api.ts`

**검사:** `any` 또는 `unknown` 타입이 사용되지 않아야 합니다.

**도구:** Grep

```
pattern: ": any|: unknown"
path: "src/types/api.ts"
```

**PASS:** 매칭 결과 없음.

**FAIL:** `any` 또는 `unknown` 타입이 발견됨.

**수정:** 구체적인 타입으로 교체.

### Step 3: nullable 필드 일관성

**파일:** `src/types/api.ts`

**검사:** nullable 필드는 `| null`을 사용해야 하며, `?` optional과 `| null`의 의미 차이를 올바르게 사용해야 합니다.
- `?`: 서버 응답에 해당 필드가 없을 수 있음 (optional)
- `| null`: 필드는 항상 존재하지만 값이 null일 수 있음

**도구:** Read

```
filePath: "src/types/api.ts"
```

**PASS:** optional(`?`)과 nullable(`| null`)이 의미에 맞게 사용됨.

**FAIL:** `?`와 `| null`이 혼용되어 의미가 불분명한 경우.

### Step 4: 타입 export 검증

**파일:** `src/types/api.ts`

**검사:** 모든 `interface`와 `type`이 `export` 키워드와 함께 정의되어야 합니다.

**도구:** Grep

```
pattern: "^(interface|type) "
path: "src/types/api.ts"
```

**PASS:** 매칭 결과 없음 (모든 선언이 `export`로 시작).

**FAIL:** `export` 없이 정의된 타입 발견.

**수정:** `export` 키워드 추가.

### Step 5: API 클라이언트와 타입 동기화

**검사:** `src/lib/api.ts`에서 사용하는 모든 타입이 `src/types/api.ts`에서 import되는지 확인합니다.

**도구:** Grep

```
pattern: "from '@/types/api'"
path: "src/lib/api.ts"
```

**PASS:** api.ts의 모든 제네릭 타입 파라미터가 `src/types/api.ts`에 정의된 타입을 참조.

**FAIL:** 인라인 타입 리터럴이나 로컬 타입 정의가 API 응답에 사용됨.

**수정:** 타입을 `src/types/api.ts`로 이동하고 import.

## Output Format

| # | 검사 | 상태 | 상세 |
|---|------|------|------|
| 1 | DTO 네이밍 규칙 | PASS/FAIL | 상세... |
| 2 | any/unknown 금지 | PASS/FAIL | 상세... |
| 3 | nullable 일관성 | PASS/FAIL | 상세... |
| 4 | 타입 export | PASS/FAIL | 상세... |
| 5 | 클라이언트 동기화 | PASS/FAIL | 상세... |

## Exceptions

1. **클라이언트 전용 타입** — `ApiResponse`, `RecentSearch`, `SearchType` 등 서버 DTO가 아닌 클라이언트 유틸리티 타입은 `Dto` 접미사가 불필요합니다.
2. **Record 타입의 유연성** — `Record<string, DayStatsDto>` 같은 동적 키 타입은 `any` 사용이 아닙니다.
3. **health 엔드포인트** — 간단한 health check 응답은 인라인 타입 리터럴 허용 (`{ status: string; timestamp: string }`).
