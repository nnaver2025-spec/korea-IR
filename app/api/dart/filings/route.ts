import { NextResponse } from "next/server";
import { getDefaultDartDateRange, hasOpenDartApiKey, listRecentDartFilings } from "@/lib/adapters/dart";
import { createCrawlLog } from "@/lib/crawl/logs";
import { normalizeDartFilingsToEvents } from "@/lib/normalize";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const defaultRange = getDefaultDartDateRange();
  const beginDate = searchParams.get("beginDate") ?? defaultRange.beginDate;
  const endDate = searchParams.get("endDate") ?? defaultRange.endDate;
  const pageNo = Number(searchParams.get("pageNo") ?? "1");
  const pageCount = Number(searchParams.get("pageCount") ?? "100");
  const startedAt = new Date().toISOString();

  if (!/^\d{8}$/.test(beginDate) || !/^\d{8}$/.test(endDate)) {
    return NextResponse.json({ error: "beginDate and endDate must be YYYYMMDD format." }, { status: 400 });
  }

  if (!hasOpenDartApiKey()) {
    const crawlLog = createCrawlLog({
      source: "dart",
      status: "skipped",
      startedAt,
      finishedAt: new Date().toISOString(),
      errorMessage: "OPEN_DART_API_KEY 또는 DART_API_KEY가 없어 DART live 수집을 건너뛰었습니다."
    });

    return NextResponse.json({
      mode: "missing_key",
      hasApiKey: false,
      dateRange: { beginDate, endDate },
      filings: [],
      events: [],
      crawlLog,
      message: "OPEN_DART_API_KEY 또는 DART_API_KEY를 설정하면 DART 실제 공시를 불러옵니다."
    });
  }

  try {
    const filings = await listRecentDartFilings({
      beginDate,
      endDate,
      pageNo,
      pageCount
    });
    const normalized = normalizeDartFilingsToEvents(filings);
    const crawlLog = createCrawlLog({
      source: "dart",
      status: "success",
      startedAt,
      finishedAt: new Date().toISOString(),
      fetchedCount: filings.length,
      insertedCount: normalized.events.length,
      skippedDuplicateCount: normalized.skippedDuplicateCount
    });

    return NextResponse.json({
      mode: "live",
      hasApiKey: true,
      dateRange: { beginDate, endDate },
      filings,
      events: normalized.events,
      crawlLog,
      message: normalized.events.length === 0 ? "선택한 기간에 조회된 DART 공시가 없습니다." : undefined
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown DART error";
    const crawlLog = createCrawlLog({
      source: "dart",
      status: "failed",
      startedAt,
      finishedAt: new Date().toISOString(),
      errorMessage
    });

    return NextResponse.json({
      mode: "unavailable",
      hasApiKey: true,
      dateRange: { beginDate, endDate },
      filings: [],
      events: [],
      crawlLog,
      error: errorMessage
    });
  }
}
