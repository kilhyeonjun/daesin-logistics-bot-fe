# 대신물류 배차현황 Frontend

대신물류 배차 데이터를 날짜·노선·차량 기준으로 조회하고, 통계와 관리자 마이그레이션 상태를 제공하는 Next.js frontend입니다.

- 서비스: <https://daesin.kilpenguin.com>
- Frontend repository: <https://github.com/kilhyeonjun/daesin-logistics-bot-fe>
- Backend repository: <https://github.com/kilhyeonjun/daesin-logistics-bot-be>

## Architecture

```text
Browser
  → Next.js App Router UI
  → same-origin /api/proxy route
  → authenticated backend REST API
  → crawler / SQLite
```

브라우저는 backend에 직접 연결하지 않습니다. Next.js proxy가 서버 환경의 API key를 추가하고, frontend에서 실제로 사용하는 HTTP method와 route만 허용합니다.

## Privacy boundary

이 서비스는 현장 실사용을 위해 링크를 아는 사람이 로그인 없이 조회하는 `unlisted public` 서비스입니다. 검색엔진 노출을 줄이기 위해 HTML metadata와 응답 헤더에 `noindex, nofollow`를 설정하지만, 이는 접근 제어가 아니므로 링크를 공유받은 사람은 누구나 조회할 수 있습니다.

공개 노선 응답은 proxy의 고정 public DTO만 통과합니다. 기준일·노선·건수·수량·운임·차량정보를 제공하며, 운행·차량·경유지 URL은 허용된 host·path·query contract와 일치할 때만 전달합니다. 내부 record ID·credential-bearing tracking URL·알 수 없는 추가 필드는 브라우저에 전달하지 않습니다. 동기화와 Kakao endpoint도 공개 proxy contract에 포함하지 않습니다. 관리자 login, session 확인, migration route만 각 화면에 필요한 method로 제한합니다.

## Environment variables

값이나 운영 endpoint는 저장소에 기록하지 않습니다.

### Server only

- `API_URL`
- `API_KEY`

### Optional routing configuration

- `NEXT_PUBLIC_API_BASE_PATH`
- `NEXT_PUBLIC_API_URL`

## Local development

Node.js와 pnpm이 필요합니다.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

개발 서버 기본 주소는 <http://localhost:3000>입니다.

## Verification

```bash
pnpm test
pnpm lint
pnpm build
pnpm audit --prod
```

Production build 확인:

```bash
pnpm build
pnpm start
```

배포와 운영 환경 변경은 이 저장소의 local verification 및 commit과 별도 절차로 수행합니다.
