import { createEventDedupeKey } from "@/lib/dedupe";
import type { Company, CrawlLog, EventWithCompany, IrEvent, Material } from "@/lib/types";

export const companies: Company[] = [
  {
    id: "company-samsung-electronics",
    ticker: "005930",
    name: "삼성전자",
    market: "KOSPI",
    sector: "반도체/전자",
    homepageUrl: "https://www.samsung.com/sec/",
    irUrl: "https://www.samsung.com/global/ir/",
    dartCorpCode: "00126380"
  },
  {
    id: "company-sk-hynix",
    ticker: "000660",
    name: "SK하이닉스",
    market: "KOSPI",
    sector: "반도체",
    homepageUrl: "https://www.skhynix.com/",
    irUrl: "https://www.skhynix.com/ir",
    dartCorpCode: "00164779"
  },
  {
    id: "company-naver",
    ticker: "035420",
    name: "NAVER",
    market: "KOSPI",
    sector: "인터넷",
    homepageUrl: "https://www.navercorp.com/",
    irUrl: "https://www.navercorp.com/investment",
    dartCorpCode: "00266961"
  },
  {
    id: "company-lg-energy",
    ticker: "373220",
    name: "LG에너지솔루션",
    market: "KOSPI",
    sector: "2차전지",
    homepageUrl: "https://www.lgensol.com/",
    irUrl: "https://www.lgensol.com/kr/ir",
    dartCorpCode: "01515323"
  },
  {
    id: "company-kakao",
    ticker: "035720",
    name: "카카오",
    market: "KOSPI",
    sector: "플랫폼",
    homepageUrl: "https://www.kakaocorp.com/",
    irUrl: "https://www.kakaocorp.com/ir/main",
    dartCorpCode: "00258801"
  }
];

const now = "2026-04-27T09:00:00+09:00";

const rawEvents: Array<Omit<IrEvent, "dedupeKey" | "materials" | "createdAt" | "updatedAt"> & { materials?: Omit<Material, "eventId">[] }> = [
  {
    id: "event-samsung-q1-earnings",
    companyId: "company-samsung-electronics",
    title: "2026년 1분기 실적발표 컨퍼런스콜",
    eventType: "earnings_release",
    source: "company_ir",
    sourceUrl: "https://www.samsung.com/global/ir/events-presentations/",
    startsAt: "2026-04-27T10:00:00+09:00",
    timezone: "Asia/Seoul",
    status: "confirmed",
    location: "온라인 컨퍼런스콜",
    fiscalPeriod: "2026 Q1",
    description: "실적 발표 후 질의응답이 예정되어 있습니다.",
    materials: [
      {
        id: "material-samsung-q1-pdf",
        title: "2026년 1분기 실적발표 자료",
        type: "pdf",
        source: "company_ir",
        sourceUrl: "https://www.samsung.com/global/ir/events-presentations/",
        publishedAt: "2026-04-27T08:30:00+09:00",
        fileUrl: "https://www.samsung.com/global/ir/events-presentations/",
        summaryStatus: "not_requested"
      }
    ]
  },
  {
    id: "event-sk-provisional",
    companyId: "company-sk-hynix",
    title: "매출액 또는 손익구조 30% 이상 변경 공시",
    eventType: "provisional_earnings",
    source: "dart",
    sourceUrl: "https://dart.fss.or.kr/",
    startsAt: "2026-04-27T15:30:00+09:00",
    timezone: "Asia/Seoul",
    status: "scheduled",
    fiscalPeriod: "2026 Q1",
    description: "DART 잠정실적 관련 공시로 수집된 일정입니다."
  },
  {
    id: "event-naver-ir",
    companyId: "company-naver",
    title: "국내 기관투자자 대상 NDR",
    eventType: "ir_meeting",
    source: "kind",
    sourceUrl: "https://kind.krx.co.kr/",
    startsAt: "2026-04-29T13:00:00+09:00",
    timezone: "Asia/Seoul",
    status: "confirmed",
    location: "서울 여의도",
    description: "KIND 기업설명회 일정 수집 예시입니다."
  },
  {
    id: "event-lg-webcast",
    companyId: "company-lg-energy",
    title: "배터리 사업전략 업데이트 웹캐스트",
    eventType: "webcast",
    source: "company_ir",
    sourceUrl: "https://www.lgensol.com/kr/ir",
    startsAt: "2026-05-04T11:00:00+09:00",
    timezone: "Asia/Seoul",
    status: "scheduled",
    location: "온라인",
    materials: [
      {
        id: "material-lg-webcast",
        title: "웹캐스트 접속 링크",
        type: "webcast",
        source: "company_ir",
        sourceUrl: "https://www.lgensol.com/kr/ir",
        summaryStatus: "not_requested"
      }
    ]
  },
  {
    id: "event-kakao-report",
    companyId: "company-kakao",
    title: "분기보고서 제출",
    eventType: "business_report",
    source: "dart",
    sourceUrl: "https://dart.fss.or.kr/",
    startsAt: "2026-05-08T17:00:00+09:00",
    timezone: "Asia/Seoul",
    status: "unknown",
    fiscalPeriod: "2026 Q1",
    description: "정확한 제출 시각은 공시 접수 후 확정됩니다."
  }
];

export const events: EventWithCompany[] = rawEvents.map((event) => {
  const materials = (event.materials ?? []).map((material) => ({
    ...material,
    eventId: event.id
  }));
  const fullEvent: IrEvent = {
    ...event,
    materials,
    dedupeKey: createEventDedupeKey(event),
    createdAt: now,
    updatedAt: now
  };
  const company = companies.find((item) => item.id === event.companyId);
  if (!company) {
    throw new Error(`Missing mock company for ${event.companyId}`);
  }
  return { ...fullEvent, company };
});

export const crawlLogs: CrawlLog[] = [
  {
    id: "crawl-log-dart-mock",
    source: "dart",
    status: "partial",
    startedAt: "2026-04-27T08:45:00+09:00",
    finishedAt: "2026-04-27T08:45:04+09:00",
    fetchedCount: 18,
    insertedCount: 1,
    updatedCount: 0,
    skippedDuplicateCount: 17,
    errorMessage: "OPEN_DART_API_KEY가 없어 mock fixture를 사용했습니다."
  },
  {
    id: "crawl-log-kind-mock",
    source: "kind",
    status: "skipped",
    startedAt: "2026-04-27T08:46:00+09:00",
    finishedAt: "2026-04-27T08:46:00+09:00",
    fetchedCount: 0,
    insertedCount: 0,
    updatedCount: 0,
    skippedDuplicateCount: 0,
    errorMessage: "KIND adapter는 skeleton 상태입니다."
  }
];
