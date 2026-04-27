import { createEventDedupeKey } from "@/lib/dedupe";
import { classifyDartEventType } from "@/lib/normalize";
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
  corpCode?: string;
  finalReportOnly?: boolean;
}

export async function listRecentDartFilings(options: DartAdapterOptions): Promise<DartFiling[]> {
  const apiKey = options.apiKey ?? getOpenDartApiKey();
  if (!apiKey) {
    throw new Error("OPEN_DART_API_KEY or DART_API_KEY is required for live DART calls.");
  }
  assertDartDate(options.beginDate, "beginDate");
  if (options.endDate) {
    assertDartDate(options.endDate, "endDate");
  }

  const params = new URLSearchParams({
    crtfc_key: apiKey,
    bgn_de: options.beginDate,
    page_no: String(options.pageNo ?? 1),
    page_count: String(options.pageCount ?? 100),
    last_reprt_at: options.finalReportOnly === false ? "N" : "Y"
  });

  if (options.endDate) {
    params.set("end_de", options.endDate);
  }
  if (options.corpCode) {
    params.set("corp_code", options.corpCode);
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
  if (payload.status === "013") {
    return [];
  }
  if (payload.status !== "000") {
    throw new Error(`DART returned ${payload.status}: ${payload.message}`);
  }

  return payload.list ?? [];
}

export { classifyDartEventType };

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

export function hasOpenDartApiKey() {
  return Boolean(getOpenDartApiKey());
}

export function getOpenDartApiKey() {
  return process.env.OPEN_DART_API_KEY || process.env.DART_API_KEY;
}

export function toDartDate(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return formatter.format(date).replaceAll("-", "");
}

export function getDefaultDartDateRange(daysBack = 14) {
  const end = new Date();
  const begin = new Date(end);
  begin.setDate(begin.getDate() - daysBack);

  return {
    beginDate: toDartDate(begin),
    endDate: toDartDate(end)
  };
}

function assertDartDate(value: string, label: string) {
  if (!/^\d{8}$/.test(value)) {
    throw new Error(`${label} must be YYYYMMDD.`);
  }
}
