import type { DartFiling } from "@/lib/adapters/dart";
import { createEventDedupeKey } from "@/lib/dedupe";
import type { Company, EventType, EventWithCompany, IrEvent } from "@/lib/types";

export interface NormalizedDartEventsResult {
  events: EventWithCompany[];
  skippedDuplicateCount: number;
}

export function classifyDartEventType(reportName: string): EventType {
  const normalized = normalizeReportName(reportName);

  if (normalized.includes("기업설명회") && normalized.includes("개최")) return "ir_meeting";
  if (normalized.includes("영업") && normalized.includes("잠정") && normalized.includes("실적")) return "provisional_earnings";
  if (normalized.includes("결산실적공시")) return "earnings_release";
  if (normalized.includes("매출액") && normalized.includes("손익구조") && normalized.includes("변경")) return "earnings_release";
  if (normalized.includes("분기보고서") || normalized.includes("반기보고서") || normalized.includes("사업보고서")) return "business_report";

  return "unknown";
}

export function normalizeDartFilingsToEvents(filings: DartFiling[]): NormalizedDartEventsResult {
  const seenDedupeKeys = new Set<string>();
  let skippedDuplicateCount = 0;
  const events: EventWithCompany[] = [];

  for (const filing of filings) {
    const event = normalizeDartFilingToEvent(filing);
    if (seenDedupeKeys.has(event.dedupeKey)) {
      skippedDuplicateCount += 1;
      continue;
    }
    seenDedupeKeys.add(event.dedupeKey);
    events.push(event);
  }

  return { events, skippedDuplicateCount };
}

export function normalizeDartFilingToEvent(filing: DartFiling): EventWithCompany {
  const company = normalizeDartCompany(filing);
  const disclosedAt = normalizeDartReceiptDate(filing.rcept_dt);
  const sourceUrl = `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${encodeURIComponent(filing.rcept_no)}`;
  const eventType = classifyDartEventType(filing.report_nm);
  const eventDraft = {
    companyId: company.id,
    title: filing.report_nm,
    eventType,
    source: "dart" as const,
    sourceUrl,
    disclosedAt,
    startsAt: disclosedAt,
    timezone: "Asia/Seoul" as const,
    status: "completed" as const,
    description: `${filing.corp_name} DART 공시입니다. 접수번호: ${filing.rcept_no}`,
    dedupeKey: ""
  };
  const now = new Date().toISOString();
  const event: IrEvent = {
    id: `dart-${filing.rcept_no}`,
    ...eventDraft,
    materials: [],
    dedupeKey: createEventDedupeKey(eventDraft),
    createdAt: now,
    updatedAt: now
  };

  return {
    ...event,
    company
  };
}

export function normalizeDartReceiptDate(receiptDate: string) {
  if (!/^\d{8}$/.test(receiptDate)) {
    return new Date().toISOString();
  }

  const year = receiptDate.slice(0, 4);
  const month = receiptDate.slice(4, 6);
  const day = receiptDate.slice(6, 8);
  return `${year}-${month}-${day}T00:00:00+09:00`;
}

function normalizeDartCompany(filing: DartFiling): Company {
  const ticker = filing.stock_code.trim() || filing.corp_code;

  return {
    id: ticker ? `company-${ticker}` : `dart-company-${filing.corp_code}`,
    ticker,
    name: filing.corp_name,
    market: mapDartCorpClassToMarket(filing.corp_cls),
    dartCorpCode: filing.corp_code
  };
}

function mapDartCorpClassToMarket(corpClass: string): Company["market"] {
  if (corpClass === "Y") return "KOSPI";
  if (corpClass === "K") return "KOSDAQ";
  if (corpClass === "N") return "KONEX";
  return "UNKNOWN";
}

function normalizeReportName(reportName: string) {
  return reportName.replace(/\s+/g, "").replace(/[［\[\]］]/g, "");
}
