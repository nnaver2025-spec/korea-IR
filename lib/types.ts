export type EventType =
  | "earnings_release"
  | "provisional_earnings"
  | "ir_meeting"
  | "conference_call"
  | "material_update"
  | "webcast"
  | "business_report"
  | "unknown";

export type EventSource = "dart" | "kind" | "kirs" | "company_ir" | "manual";

export type EventStatus = "scheduled" | "confirmed" | "changed" | "cancelled" | "completed" | "unknown";

export type MaterialType = "pdf" | "html" | "webcast" | "transcript" | "presentation" | "other";

export type CrawlStatus = "success" | "partial" | "failed" | "skipped";

export interface Company {
  id: string;
  ticker: string;
  name: string;
  market: "KOSPI" | "KOSDAQ" | "KONEX" | "UNKNOWN";
  sector?: string;
  homepageUrl?: string;
  irUrl?: string;
  dartCorpCode?: string;
}

export interface Material {
  id: string;
  eventId: string;
  title: string;
  type: MaterialType;
  source: EventSource;
  sourceUrl: string;
  publishedAt?: string;
  fileUrl?: string;
  summaryStatus: "not_requested" | "queued" | "completed" | "failed";
  summaryText?: string;
}

export interface IrEvent {
  id: string;
  companyId: string;
  title: string;
  eventType: EventType;
  source: EventSource;
  sourceUrl: string;
  disclosedAt?: string;
  startsAt: string;
  endsAt?: string;
  timezone: "Asia/Seoul";
  status: EventStatus;
  location?: string;
  fiscalPeriod?: string;
  description?: string;
  materials: Material[];
  dedupeKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventWithCompany extends IrEvent {
  company: Company;
}

export interface WatchlistItem {
  id: string;
  companyId: string;
  company: Company;
  notifyTelegram: boolean;
  notifyEmail: boolean;
  createdAt: string;
}

export interface Alert {
  id: string;
  watchlistId: string;
  eventId: string;
  channel: "telegram" | "email" | "in_app";
  status: "pending" | "sent" | "failed" | "skipped";
  errorMessage?: string;
  sentAt?: string;
  createdAt: string;
}

export interface CrawlLog {
  id: string;
  source: EventSource;
  status: CrawlStatus;
  startedAt: string;
  finishedAt?: string;
  fetchedCount: number;
  insertedCount: number;
  updatedCount: number;
  skippedDuplicateCount: number;
  errorMessage?: string;
}
