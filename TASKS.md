# Korea IR Calendar MVP Tasks

## 1. 저장소 분석

- [x] 현재 폴더가 빈 신규 프로젝트에 가까운 상태인지 확인
- [x] 기존 스택이 없어 Next.js App Router + TypeScript + Tailwind 기준으로 구성 결정
- [x] git 저장소가 아직 초기화되지 않았음을 확인

## 2. 아키텍처와 데이터 모델

- [x] Supabase Postgres 기준 `companies`, `events`, `materials`, `watchlist`, `alerts`, `crawl_logs` 스키마 작성
- [x] TypeScript 공통 타입 작성
- [x] 이벤트 타입과 소스 enum 정리
- [x] `source_url` 필수 보존
- [x] 중복 이벤트 방지용 `dedupe_key` 유틸과 DB unique 제약 추가

## 3. Mock mode

- [x] 외부 키 없이 동작하는 mock companies/events/materials/crawl logs 작성
- [x] 오늘/이번 주/다음 주 UI 검증 가능한 날짜 샘플 구성
- [x] 자료 있음 여부와 원문 링크 포함

## 4. UI

- [x] 한국어 PC 우선 대시보드 구현
- [x] 검색/필터 구현
- [x] 오늘/이번 주/다음 주 섹션 구현
- [x] 상태 badge, 원문 링크, 자료 있음 표시
- [x] 관심종목 추가/해제 UI 구현
- [x] 이벤트 상세 UI 구현
- [x] empty/loading/error state 구현

## 5. Adapters and skeletons

- [x] `OPEN_DART_API_KEY` 기반 DART 실제 호출 adapter 작성
- [x] KIND adapter skeleton 작성
- [x] Telegram alert skeleton 작성
- [x] PDF summary skeleton 작성
- [x] crawl log 타입/표시 구조 작성

## 6. Documentation and validation

- [x] README 작성
- [x] `npm install`
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] 빌드 오류 발생 시 수정

## 추후 작업

- [ ] Supabase client 연결 및 RLS 정책 추가
- [ ] DART corp code 전체 목록 동기화
- [ ] KIND 일정 페이지 안정 파서 구현
- [ ] 기업 IR 사이트별 PDF discovery adapter 추가
- [ ] Telegram bot token/chat id 설정 후 alert job 구현
- [ ] OpenAI 기반 PDF 요약 queue/worker 구현
