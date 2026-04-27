"use client";

import { AlertCircle, CalendarDays, Database, RefreshCw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import CrawlLogPanel from "@/components/CrawlLogPanel";
import EventCard from "@/components/EventCard";
import WatchlistPanel from "@/components/WatchlistPanel";
import { getEventBucket } from "@/lib/date";
import { eventTypeLabels, sourceLabels } from "@/lib/labels";
import type { CrawlLog, EventSource, EventType, EventWithCompany } from "@/lib/types";

const watchlistStorageKey = "korea-ir-watchlist";

type DataMode = "mock" | "dart";

interface DartFilingsApiResponse {
  mode: "live" | "missing_key" | "unavailable";
  hasApiKey: boolean;
  dateRange: {
    beginDate: string;
    endDate: string;
  };
  events: EventWithCompany[];
  crawlLog: CrawlLog;
  message?: string;
  error?: string;
}

interface DartStatus {
  tone: "idle" | "loading" | "success" | "warning" | "error" | "empty";
  message: string;
}

interface DashboardProps {
  events: EventWithCompany[];
  crawlLogs: CrawlLog[];
}

export default function Dashboard({ events, crawlLogs }: DashboardProps) {
  const initialDateRange = getInitialDateRange();
  const [query, setQuery] = useState("");
  const [eventType, setEventType] = useState<EventType | "all">("all");
  const [source, setSource] = useState<EventSource | "all">("all");
  const [dataMode, setDataMode] = useState<DataMode>("mock");
  const [watchedOnly, setWatchedOnly] = useState(false);
  const [watchedCompanyKeys, setWatchedCompanyKeys] = useState<string[]>([]);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dartBeginDate, setDartBeginDate] = useState(initialDateRange.beginDate);
  const [dartEndDate, setDartEndDate] = useState(initialDateRange.endDate);
  const [dartEvents, setDartEvents] = useState<EventWithCompany[]>([]);
  const [dartCrawlLogs, setDartCrawlLogs] = useState<CrawlLog[]>([]);
  const [dartStatus, setDartStatus] = useState<DartStatus>({
    tone: "idle",
    message: "DART live 모드를 선택하면 실제 공시를 불러옵니다."
  });

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(watchlistStorageKey);
      setWatchedCompanyKeys(stored ? JSON.parse(stored) : []);
    } catch {
      setLoadError("관심종목을 불러오지 못했습니다. 브라우저 저장소를 확인하세요.");
    } finally {
      setIsLoadingWatchlist(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoadingWatchlist) {
      window.localStorage.setItem(watchlistStorageKey, JSON.stringify(watchedCompanyKeys));
    }
  }, [isLoadingWatchlist, watchedCompanyKeys]);

  useEffect(() => {
    if (dataMode !== "dart") return;
    const controller = new AbortController();
    loadDartEvents(controller.signal);
    return () => controller.abort();
  }, [dataMode, dartBeginDate, dartEndDate]);

  const displayedEvents = dataMode === "mock" ? events : dartEvents;
  const displayedCrawlLogs = dataMode === "mock" ? crawlLogs : dartCrawlLogs;
  const watchlistEvents = [...events, ...dartEvents];

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return displayedEvents.filter((event) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        event.title.toLowerCase().includes(normalizedQuery) ||
        event.company.name.toLowerCase().includes(normalizedQuery) ||
        event.company.ticker.includes(normalizedQuery);
      const matchesType = eventType === "all" || event.eventType === eventType;
      const matchesSource = source === "all" || event.source === source;
      const matchesWatchlist = !watchedOnly || isWatchedCompany(event);
      return matchesQuery && matchesType && matchesSource && matchesWatchlist;
    });
  }, [displayedEvents, eventType, query, source, watchedCompanyKeys, watchedOnly]);

  const buckets = useMemo(() => {
    return {
      today: filteredEvents.filter((event) => getEventBucket(event.startsAt) === "today"),
      thisWeek: filteredEvents.filter((event) => getEventBucket(event.startsAt) === "thisWeek"),
      nextWeek: filteredEvents.filter((event) => getEventBucket(event.startsAt) === "nextWeek"),
      later: filteredEvents.filter((event) => getEventBucket(event.startsAt) === "later")
    };
  }, [filteredEvents]);

  async function loadDartEvents(signal?: AbortSignal) {
    setDartStatus({
      tone: "loading",
      message: "DART 공시를 불러오는 중입니다."
    });

    try {
      const params = new URLSearchParams({
        beginDate: dateInputToDartDate(dartBeginDate),
        endDate: dateInputToDartDate(dartEndDate),
        pageCount: "100"
      });
      const response = await fetch(`/api/dart/filings?${params.toString()}`, { signal });
      const payload = (await response.json()) as DartFilingsApiResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "DART API 요청이 실패했습니다.");
      }

      setDartEvents(payload.events);
      setDartCrawlLogs([payload.crawlLog]);
      setDartStatus({
        tone: getDartStatusTone(payload),
        message: payload.error ?? payload.message ?? `DART 공시 ${payload.events.length}건을 불러왔습니다.`
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setDartEvents([]);
      setDartStatus({
        tone: "error",
        message: error instanceof Error ? error.message : "DART API 요청 중 알 수 없는 오류가 발생했습니다."
      });
    }
  }

  function isWatchedCompany(event: EventWithCompany) {
    const keys = getCompanyWatchKeys(event);
    return keys.some((key) => watchedCompanyKeys.includes(key));
  }

  function toggleWatch(event: EventWithCompany) {
    const keys = getCompanyWatchKeys(event);
    const primaryKey = event.company.ticker || event.company.id;
    setWatchedCompanyKeys((current) => (keys.some((key) => current.includes(key)) ? current.filter((key) => !keys.includes(key)) : [...current, primaryKey]));
  }

  function removeWatch(companyKey: string) {
    setWatchedCompanyKeys((current) => current.filter((key) => key !== companyKey));
  }

  return (
    <main className="min-h-screen bg-surface px-6 py-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold text-primary">한국판 StockNow MVP</p>
            <h1 className="mt-1 text-3xl font-bold tracking-normal text-ink">한국 IR 캘린더</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              실적발표, 기업설명회, 컨퍼런스콜, DART 공시와 IR 자료를 한 화면에서 추적합니다.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <SummaryMetric label="오늘" value={buckets.today.length} />
            <SummaryMetric label="이번 주" value={buckets.thisWeek.length} />
            <SummaryMetric label="다음 주" value={buckets.nextWeek.length} />
          </div>
        </header>

        {loadError ? (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            <AlertCircle size={17} />
            {loadError}
          </div>
        ) : null}

        <section className="mb-5 rounded-lg border border-line bg-white p-4 shadow-panel">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_180px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                className="focus-ring h-11 w-full rounded-md border border-line bg-white pl-10 pr-3 text-sm"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="회사명, 종목코드, 이벤트 검색"
                value={query}
              />
            </label>
            <select className="focus-ring h-11 rounded-md border border-line bg-white px-3 text-sm" onChange={(event) => setDataMode(event.target.value as DataMode)} value={dataMode}>
              <option value="mock">Mock 데이터</option>
              <option value="dart">DART live</option>
            </select>
            <select className="focus-ring h-11 rounded-md border border-line bg-white px-3 text-sm" onChange={(event) => setEventType(event.target.value as EventType | "all")} value={eventType}>
              <option value="all">전체 이벤트</option>
              {Object.entries(eventTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select className="focus-ring h-11 rounded-md border border-line bg-white px-3 text-sm" onChange={(event) => setSource(event.target.value as EventSource | "all")} value={source}>
              <option value="all">전체 소스</option>
              {Object.entries(sourceLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line pt-3">
            {dataMode === "dart" ? (
              <>
                <label className="text-xs font-semibold text-muted">
                  시작일
                  <input className="focus-ring ml-2 h-9 rounded-md border border-line px-2 text-sm text-ink" onChange={(event) => setDartBeginDate(event.target.value)} type="date" value={dartBeginDate} />
                </label>
                <label className="text-xs font-semibold text-muted">
                  종료일
                  <input className="focus-ring ml-2 h-9 rounded-md border border-line px-2 text-sm text-ink" onChange={(event) => setDartEndDate(event.target.value)} type="date" value={dartEndDate} />
                </label>
                <button
                  className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink hover:border-teal-300"
                  disabled={dartStatus.tone === "loading"}
                  onClick={() => loadDartEvents()}
                  type="button"
                >
                  <RefreshCw className={dartStatus.tone === "loading" ? "animate-spin" : ""} size={15} />
                  새로고침
                </button>
              </>
            ) : null}
            <label className="ml-auto inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink">
              <input checked={watchedOnly} className="h-4 w-4 accent-teal-700" onChange={(event) => setWatchedOnly(event.target.checked)} type="checkbox" />
              관심종목만
            </label>
          </div>
        </section>

        {dataMode === "dart" ? (
          <div className={`mb-4 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold ${getStatusClassName(dartStatus.tone)}`}>
            <Database size={17} />
            {dartStatus.message}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <EventSection detailEnabled={dataMode === "mock"} events={buckets.today} isWatched={isWatchedCompany} onToggleWatch={toggleWatch} title="오늘" />
            <EventSection detailEnabled={dataMode === "mock"} events={buckets.thisWeek} isWatched={isWatchedCompany} onToggleWatch={toggleWatch} title="이번 주" />
            <EventSection detailEnabled={dataMode === "mock"} events={buckets.nextWeek} isWatched={isWatchedCompany} onToggleWatch={toggleWatch} title="다음 주" />
            {dataMode === "dart" ? <EventSection detailEnabled={false} events={buckets.later} isWatched={isWatchedCompany} onToggleWatch={toggleWatch} title="선택 기간 기타" /> : null}
          </div>
          <div className="space-y-5">
            {isLoadingWatchlist ? (
              <div className="rounded-lg border border-line bg-white p-4 text-sm text-muted shadow-panel">관심종목을 불러오는 중입니다.</div>
            ) : (
              <WatchlistPanel events={watchlistEvents} onRemove={removeWatch} watchedCompanyKeys={watchedCompanyKeys} />
            )}
            <CrawlLogPanel logs={displayedCrawlLogs} />
          </div>
        </div>
      </div>
    </main>
  );
}

function SummaryMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-24 rounded-lg border border-line bg-white px-4 py-3 shadow-sm">
      <div className="text-2xl font-bold text-ink">{value}</div>
      <div className="mt-1 text-xs font-semibold text-muted">{label}</div>
    </div>
  );
}

function EventSection({
  detailEnabled,
  events,
  isWatched,
  onToggleWatch,
  title
}: {
  detailEnabled: boolean;
  events: EventWithCompany[];
  isWatched: (event: EventWithCompany) => boolean;
  onToggleWatch: (event: EventWithCompany) => void;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-line bg-white/60 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
          <CalendarDays className="text-primary" size={19} />
          {title}
        </h2>
        <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-muted">{events.length}건</span>
      </div>
      {events.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-white p-6 text-center text-sm text-muted">조건에 맞는 IR/실적 이벤트가 없습니다.</div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <EventCard detailEnabled={detailEnabled} event={event} isWatched={isWatched(event)} key={event.id} onToggleWatch={onToggleWatch} />
          ))}
        </div>
      )}
    </section>
  );
}

function getCompanyWatchKeys(event: EventWithCompany) {
  return [event.company.id, event.company.ticker, event.companyId].filter(Boolean);
}

function getInitialDateRange() {
  const end = new Date();
  const begin = new Date(end);
  begin.setDate(begin.getDate() - 14);
  return {
    beginDate: toDateInputValue(begin),
    endDate: toDateInputValue(end)
  };
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateInputToDartDate(value: string) {
  return value.replaceAll("-", "");
}

function getDartStatusTone(payload: DartFilingsApiResponse): DartStatus["tone"] {
  if (payload.mode === "missing_key") return "warning";
  if (payload.mode === "unavailable") return "error";
  if (payload.events.length === 0) return "empty";
  return "success";
}

function getStatusClassName(tone: DartStatus["tone"]) {
  if (tone === "loading") return "border-blue-200 bg-blue-50 text-blue-700";
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-800";
  if (tone === "error") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}
