import { createEventDedupeKey } from "@/lib/dedupe";
import type { EventType, EventWithCompany, IrEvent } from "@/lib/types";

const dartListEndpoint = "https://opendart.fss.or.kr/api/list.json";

export interface DartFiling {
  corp_code: string;
  corp_name: string;
  stock_code: string;
  corp_cls: string;
  report_nm: string;
  rcept_no: string;
  flr_nm: string;
  rcept_dt: string;
  rm?: string;
}

interface DartListResponse {
  status: string;
  message: string;
  list?: DartFiling[];
  page_no?: number;
  page_count?: number;
  total_count?: number;
  total_page?: number;
}

export interface DartAdapterOptions {
  apiKey?: string;
  beginDate: string;
  endDate?: string;
  pageNo?: number;
  pageCount?: number;
}

export async function listRecentDartFilings(options: DartAdapterOptions): Promise<DartFiling[]> {
  const apiKey = options.apiKey ?? process.env.OPEN_DART_API_KEY;
  if (!apiKey) {
    throw new Error("OPEN_DART_API_KEY is required for live DART calls.");
  }

  const params = new URLSearchParams({
    crtfc_key: apiKey,
    bgn_de: options.beginDate,
    page_no: String(options.pageNo ?? 1),
    page_count: String(options.pageCount ?? 100)
  });

  if (options.endDate) {
    params.set("end_de", options.endDate);
  }

  const response = await fetch(`${dartListEndpoint}?${params.toString()}`, {
    headers: {
      Accept: "application/json"
    },
    next: {
      revalidate: 300
    }
  });

  if (!response.ok) {
    throw new Error(`DART request failed: ${response.status}`);
  }

  const payload = (await response.json()) as DartListResponse;
  if (payload.status !== "000") {
    throw new Error(`DART returned ${payload.status}: ${payload.message}`);
  }

  return payload.list ?? [];
}

export function classifyDartEventType(reportName: string): EventType {
  if (reportName.includes("잠정") || reportName.includes("매출액또는손익구조")) return "provisional_earnings";
  if (reportName.includes("실적") || reportName.includes("영업실적")) return "earnings_release";
  if (reportName.includes("기업설명회") || reportName.includes("IR")) return "ir_meeting";
  if (reportName.includes("분기보고서") || reportName.includes("반기보고서") || reportName.includes("사업보고서")) return "business_report";
  return "unknown";
}

export function dartReceiptUrl(receiptNo: string) {
  return `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${encodeURIComponent(receiptNo)}`;
}

export function mapDartFilingToEventDraft(filing: DartFiling, companyId: string): Omit<IrEvent, "id" | "materials" | "createdAt" | "updatedAt"> {
  const startsAt = `${filing.rcept_dt.slice(0, 4)}-${filing.rcept_dt.slice(4, 6)}-${filing.rcept_dt.slice(6, 8)}T17:00:00+09:00`;
  const sourceUrl = dartReceiptUrl(filing.rcept_no);
  const eventType = classifyDartEventType(filing.report_nm);
  const draft = {
    companyId,
    title: filing.report_nm,
    eventType,
    source: "dart" as const,
    sourceUrl,
    startsAt,
    timezone: "Asia/Seoul" as const,
    status: "unknown" as const,
    fiscalPeriod: undefined,
    description: `${filing.corp_name} DART 접수 공시입니다.`,
    dedupeKey: ""
  };

  return {
    ...draft,
    dedupeKey: createEventDedupeKey(draft)
  };
}

export function mergeDartEventsWithoutDuplicates(existing: EventWithCompany[], incoming: EventWithCompany[]) {
  const existingKeys = new Set(existing.map((event) => event.dedupeKey));
  return [...existing, ...incoming.filter((event) => !existingKeys.has(event.dedupeKey))];
}
