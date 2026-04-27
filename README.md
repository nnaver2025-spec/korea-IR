# Korea IR Calendar

한국 상장사의 실적발표, 기업설명회, 컨퍼런스콜, IR 자료, DART 공시를 통합해서 보여주는 투자자용 IR 캘린더 MVP입니다.

## MVP 목표

- 오늘/이번 주/다음 주에 예정된 한국 기업 IR/실적 이벤트를 한눈에 확인
- 관심종목을 로컬 watchlist에 등록
- DART/KIND/기업 IR 원문 링크 보존
- IR 자료 PDF를 추후 AI 요약할 수 있는 구조 확보
- 외부 API 키가 없어도 mock mode로 UI 동작

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 검증

```bash
npm run typecheck
npm run build
```

## 환경 변수

`.env.local`에 필요한 값만 선택적으로 설정합니다. 값이 없으면 mock/stub mode로 동작합니다.

```bash
OPEN_DART_API_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
OPENAI_API_KEY=
NEXT_PUBLIC_DATA_MODE=mock
```

## 데이터 모델

Supabase Postgres 스키마는 `supabase/schema.sql`에 있습니다.

- `companies`: 종목코드, 회사명, 시장, 업종, IR URL, DART corp code
- `events`: 이벤트 일정, 타입, 소스, 원문 URL, 상태, 중복 방지 키
- `materials`: PDF/웹캐스트/자료 링크와 요약 상태
- `watchlist`: 관심종목과 알림 선호
- `alerts`: 이벤트별 알림 발송 상태
- `crawl_logs`: 수집 결과, 중복 건수, 오류 메시지

## 구조

```text
app/
  events/[eventId]/page.tsx
  page.tsx
components/
  Dashboard.tsx
  EventCard.tsx
  EventDetail.tsx
  WatchlistPanel.tsx
lib/
  adapters/
  alerts/
  data/
  summary/
  types.ts
  mock-data.ts
supabase/schema.sql
```

## Adapter 상태

- DART: `OPEN_DART_API_KEY`가 있으면 `listRecentDartFilings()`로 실제 `list.json` 호출 가능
- KIND: 공식/안정 API 확정 전까지 skeleton 유지
- Telegram: token/chat id가 있을 때만 `sendTelegramAlert()` 사용
- PDF summary: OpenAI 연결 전까지 queue contract skeleton 유지

## 유지보수 원칙

- API 키는 코드에 하드코딩하지 않습니다.
- 모든 이벤트와 자료는 `source_url`을 보존합니다.
- 중복 이벤트는 `companyId + eventType + source + date + normalized sourceUrl` 기반 `dedupe_key`로 방지합니다.
- 불확실한 외부 크롤링은 mock/stub로 두고 TODO에 이유를 남깁니다.
