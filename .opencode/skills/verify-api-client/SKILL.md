---
name: verify-api-client
description: API 클라이언트의 패턴 일관성과 인증 처리를 검증합니다. API 엔드포인트 추가/수정 후 사용.
---

# API 클라이언트 검증

## Purpose

`src/lib/api.ts`의 API 클라이언트 패턴 일관성을 검증합니다:

1. **인증 구분** — 공개 엔드포인트는 `fetchApi`, 인증 필요 엔드포인트는 `fetchApiWithAuth` 사용
2. **토큰 관리** — localStorage + cookie 이중 저장 패턴 준수
3. **에러 처리** — 모든 API 호출에 일관된 에러 핸들링 적용
4. **타입 안전성** — 모든 API 메서드에 제네릭 타입 파라미터 지정

## When to Run

- `src/lib/api.ts`를 수정한 후
- 새로운 API 엔드포인트를 추가한 후
- 인증 로직을 변경한 후

## Related Files

| File | Purpose |
|------|---------|
| `src/lib/api.ts` | API 클라이언트 모듈 |
| `src/types/api.ts` | API 타입 정의 |
| `src/providers/AuthProvider.tsx` | 인증 컨텍스트 (토큰 관리 소비처) |

## Workflow

### Step 1: fetchApi vs fetchApiWithAuth 사용 구분

**파일:** `src/lib/api.ts`

**검사:** 인증이 필요한 엔드포인트(`/api/migration`, `/api/auth/me`)는 `fetchApiWithAuth`를, 공개 엔드포인트(`/api/routes`, `/api/stats`, `/api/auth/login`, `/health`)는 `fetchApi`를 사용해야 합니다.

**도구:** Grep

```
pattern: "fetchApi<|fetchApiWithAuth<"
path: "src/lib/api.ts"
```

**기준:**
- `routes.*` → `fetchApi` 사용
- `stats.*` → `fetchApi` 사용
- `auth.login` → `fetchApi` 사용
- `auth.me` → `fetchApiWithAuth` 사용
- `migration.*` → `fetchApiWithAuth` 사용
- `health` → `fetchApi` 사용

**PASS:** 각 엔드포인트가 올바른 fetch 함수를 사용.

**FAIL:** 인증 함수가 잘못 적용된 엔드포인트 발견.

**수정:** 올바른 fetch 함수로 교체.

### Step 2: API 메서드 타입 파라미터

**파일:** `src/lib/api.ts`

**검사:** 모든 `fetchApi` 및 `fetchApiWithAuth` 호출에 제네릭 타입 파라미터가 지정되어야 합니다.

**도구:** Grep

```
pattern: "fetchApi\(|fetchApiWithAuth\("
path: "src/lib/api.ts"
```

**PASS:** 매칭 없음 (모든 호출이 `fetchApi<T>()` 형태).

**FAIL:** 타입 파라미터 없는 호출 발견 (`fetchApi(...)` 형태).

**수정:** 적절한 타입 파라미터 추가.

### Step 3: API 키 헤더 일관성

**파일:** `src/lib/api.ts`

**검사:** `fetchApi`와 `fetchApiWithAuth` 모두 `x-api-key` 헤더를 동일한 패턴으로 설정해야 합니다.

**도구:** Grep

```
pattern: "x-api-key"
path: "src/lib/api.ts"
```

**PASS:** 두 함수 모두 동일한 API 키 헤더 설정 로직을 포함.

**FAIL:** API 키 처리가 불일치하거나 누락됨.

### Step 4: 토큰 관리 이중 저장

**파일:** `src/lib/api.ts`

**검사:** `setToken`은 localStorage와 cookie에 모두 저장하고, `clearToken`은 양쪽 모두 삭제해야 합니다.

**도구:** Read

```
filePath: "src/lib/api.ts"
```

**기준:**
- `setToken`: `localStorage.setItem` + `document.cookie = ...` (둘 다 포함)
- `clearToken`: `localStorage.removeItem` + `document.cookie = ...; max-age=0` (둘 다 포함)

**PASS:** 이중 저장/삭제 패턴이 양쪽 모두에 적용됨.

**FAIL:** 한쪽만 처리되거나 패턴이 불일치.

### Step 5: 에러 응답 파싱

**파일:** `src/lib/api.ts`

**검사:** `fetchApi`와 `fetchApiWithAuth` 모두 동일한 에러 처리 패턴을 사용해야 합니다:
1. `response.ok` 검사
2. `response.json()` 에러 파싱 with `.catch(() => ({}))`
3. `throw new Error(errorData.error || ...)` 패턴

**도구:** AST-grep

```
pattern: "if (!response.ok) { $$$ }"
lang: "typescript"
paths: ["src/lib/api.ts"]
```

**PASS:** 두 함수 모두 동일한 에러 처리 패턴.

**FAIL:** 에러 처리 로직이 불일치.

## Output Format

| # | 검사 | 상태 | 상세 |
|---|------|------|------|
| 1 | 인증 함수 구분 | PASS/FAIL | 상세... |
| 2 | 타입 파라미터 | PASS/FAIL | 상세... |
| 3 | API 키 헤더 | PASS/FAIL | 상세... |
| 4 | 토큰 이중 저장 | PASS/FAIL | 상세... |
| 5 | 에러 처리 일관성 | PASS/FAIL | 상세... |

## Exceptions

1. **health 엔드포인트** — 간단한 상태 체크로 인라인 타입 사용 허용.
2. **FetchOptions 타입** — 내부 유틸리티 타입으로 `src/types/api.ts`에 정의할 필요 없음.
3. **TOKEN_KEY/TOKEN_COOKIE 상수** — 모듈 내부 상수로 export하지 않아도 됨.
