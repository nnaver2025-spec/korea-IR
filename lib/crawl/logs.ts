import type { CrawlLog, CrawlStatus, EventSource } from "@/lib/types";

export interface CreateCrawlLogInput {
  source: EventSource;
  status: CrawlStatus;
  startedAt: string;
  finishedAt?: string;
  fetchedCount?: number;
  insertedCount?: number;
  updatedCount?: number;
  skippedDuplicateCount?: number;
  errorMessage?: string;
}

export function createCrawlLog(input: CreateCrawlLogInput): CrawlLog {
  return {
    id: `crawl-${input.source}-${input.startedAt}`,
    source: input.source,
    status: input.status,
    startedAt: input.startedAt,
    finishedAt: input.finishedAt,
    fetchedCount: input.fetchedCount ?? 0,
    insertedCount: input.insertedCount ?? 0,
    updatedCount: input.updatedCount ?? 0,
    skippedDuplicateCount: input.skippedDuplicateCount ?? 0,
    errorMessage: input.errorMessage
  };
}
