---
name: verify-barrel-exports
description: barrel export 파일과 실제 모듈의 동기화를 검증합니다. 파일 추가/삭제/이동 후 사용.
---

# Barrel Export 검증

## Purpose

프로젝트의 barrel export(`index.ts`) 파일이 실제 모듈과 동기화되어 있는지 검증합니다:

1. **누락된 export** — 디렉토리에 파일이 있지만 barrel export에 등록되지 않은 경우
2. **잔여 export** — barrel export에 등록되어 있지만 실제 파일이 삭제된 경우
3. **export 형식 일관성** — named export 패턴의 일관성

## When to Run

- `src/hooks/` 또는 `src/components/*/` 디렉토리에 파일을 추가/삭제/이동한 후
- barrel export 파일을 직접 수정한 후
- 리팩토링으로 파일 구조가 변경된 후

## Related Files

| File | Purpose |
|------|---------|
| `src/hooks/index.ts` | hooks barrel export |
| `src/components/data-display/index.ts` | 데이터 표시 컴포넌트 barrel export |
| `src/components/input/index.ts` | 입력 컴포넌트 barrel export |
| `src/components/layout/index.ts` | 레이아웃 컴포넌트 barrel export |
| `src/components/migration/index.ts` | 마이그레이션 컴포넌트 barrel export |

## Workflow

### Step 1: hooks barrel export 검증

**파일:** `src/hooks/index.ts`

**검사:** `src/hooks/` 디렉토리의 모든 `use*.ts` 파일이 `index.ts`에서 export되어야 합니다.

**도구:** Glob

```
pattern: "src/hooks/use*.ts"
```

그리고 Read:

```
filePath: "src/hooks/index.ts"
```

파일 목록의 각 `use*.ts`에 대해 `index.ts`에서 해당 모듈을 export하는 라인이 있는지 확인.

**PASS:** 모든 `use*.ts` 파일이 `index.ts`에서 export됨.

**FAIL:** `index.ts`에 등록되지 않은 hook 파일이 존재하거나, 삭제된 파일을 export하는 잔여 라인 존재.

**수정:**
- 누락: `export { <hookName> } from './<fileName>';` 추가
- 잔여: 해당 export 라인 삭제

### Step 2: 컴포넌트 barrel export 검증

**파일:** `src/components/*/index.ts`

**검사:** 각 서브 디렉토리(`data-display`, `input`, `layout`, `migration`)의 `index.ts`가 해당 디렉토리의 모든 `.tsx` 파일을 export해야 합니다.

**도구:** 각 디렉토리별 Glob + Read

디렉토리 목록: `data-display`, `input`, `layout`, `migration`

각 디렉토리에 대해:

```
glob: "src/components/<dir>/*.tsx"
read: "src/components/<dir>/index.ts"
```

**PASS:** 모든 `.tsx` 파일이 해당 `index.ts`에서 export됨.

**FAIL:** `index.ts`에 등록되지 않은 컴포넌트가 존재하거나, 삭제된 파일을 export하는 잔여 라인 존재.

**수정:**
- 누락: `export { <ComponentName> } from './<FileName>';` 추가
- 잔여: 해당 export 라인 삭제

### Step 3: export 형식 일관성

**파일:** 모든 `index.ts` barrel export 파일

**검사:** named re-export 형식이 일관되어야 합니다:
- `export { Name } from './Module';` 형태 사용
- `export * from './Module';` 형태는 사용하지 않음 (명시적 export 선호)
- type export는 `export type { TypeName } from './Module';` 또는 인라인 `export { type TypeName } from './Module';` 사용

**도구:** Grep

```
pattern: "export \*"
path: "src/hooks/index.ts"
```

```
pattern: "export \*"
path: "src/components"
include: "index.ts"
```

**PASS:** `export *` 사용 없음, 모든 export가 명시적 named export.

**FAIL:** `export *` 패턴 발견.

**수정:** `export *`를 명시적 named export로 변경.

## Output Format

| # | 디렉토리 | 상태 | 누락 | 잔여 | 상세 |
|---|----------|------|------|------|------|
| 1 | hooks | PASS/FAIL | N개 | N개 | 상세... |
| 2 | data-display | PASS/FAIL | N개 | N개 | 상세... |
| 3 | input | PASS/FAIL | N개 | N개 | 상세... |
| 4 | layout | PASS/FAIL | N개 | N개 | 상세... |
| 5 | migration | PASS/FAIL | N개 | N개 | 상세... |

## Exceptions

1. **ui/ 디렉토리** — shadcn/ui 컴포넌트는 barrel export를 사용하지 않으며, 개별 import 패턴을 따릅니다 (예: `import { Button } from '@/components/ui/button'`).
2. **type export** — SortSelect.tsx처럼 컴포넌트와 타입을 함께 export하는 경우 `export { Component, type TypeName } from './Module'` 패턴은 정상입니다.
3. **다중 export** — 하나의 파일에서 여러 함수/컴포넌트를 export하는 경우 (예: `useMigration.ts`의 5개 hook) 하나의 export 라인에 여러 항목을 나열하는 것은 정상입니다.
