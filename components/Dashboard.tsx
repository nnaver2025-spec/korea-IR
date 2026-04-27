"use client";

import { AlertCircle, CalendarDays, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import CrawlLogPanel from "@/components/CrawlLogPanel";
import EventCard from "@/components/EventCard";
import WatchlistPanel from "@/components/WatchlistPanel";
import { getEventBucket } from "@/lib/date";
import { eventTypeLabels, sourceLabels } from "@/lib/labels";
import type { CrawlLog, EventSource, EventType, EventWithCompany } from "@/lib/types";

const watchlistStorageKey = "korea-ir-watchlist";

interface DashboardProps {
  events: EventWithCompany[];
  crawlLogs: CrawlLog[];
}

export default function Dashboard({ events, crawlLogs }: DashboardProps) {
  const [query, setQuery] = useState("");
  const [eventType, setEventType] = useState<EventType | "all">("all");
  const [source, setSource] = useState<EventSource | "all">("all");
  const [watchedCompanyIds, setWatchedCompanyIds] = useState<string[]>([]);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(watchlistStorageKey);
      setWatchedCompanyIds(stored ? JSON.parse(stored) : []);
    } catch {
      setLoadError("관심종목을 불러오지 못했습니다. 브라우저 저장소를 확인하세요.");
    } finally {
      setIsLoadingWatchlist(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoadingWatchlist) {
      window.localStorage.setItem(watchlistStorageKey, JSON.stringify(watchedCompanyIds));
    }
  }, [isLoadingWatchlist, watchedCompanyIds]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return events.filter((event) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        event.title.toLowerCase().includes(normalizedQuery) ||
        event.company.name.toLowerCase().includes(normalizedQuery) ||
        event.company.ticker.includes(normalizedQuery);
      const matchesType = eventType === "all" || event.eventType === eventType;
      const matchesSource = source === "all" || event.source === source;
      return matchesQuery && matchesType && matchesSource;
    });
  }, [eventType, events, query, source]);

  const buckets = useMemo(() => {
    return {
      today: filteredEvents.filter((event) => getEventBucket(event.startsAt) === "today"),
      thisWeek: filteredEvents.filter((event) => getEventBucket(event.startsAt) === "thisWeek"),
      nextWeek: filteredEvents.filter((event) => getEventBucket(event.startsAt) === "nextWeek")
    };
  }, [filteredEvents]);

  function toggleWatch(companyId: string) {
    setWatchedCompanyIds((current) => (current.includes(companyId) ? current.filter((id) => id !== companyId) : [...current, companyId]));
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
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                className="focus-ring h-11 w-full rounded-md border border-line bg-white pl-10 pr-3 text-sm"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="회사명, 종목코드, 이벤트 검색"
                value={query}
              />
            </label>
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
        </section>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <EventSection events={buckets.today} isWatched={(companyId) => watchedCompanyIds.includes(companyId)} onToggleWatch={toggleWatch} title="오늘" />
            <EventSection events={buckets.thisWeek} isWatched={(companyId) => watchedCompanyIds.includes(companyId)} onToggleWatch={toggleWatch} title="이번 주" />
            <EventSection events={buckets.nextWeek} isWatched={(companyId) => watchedCompanyIds.includes(companyId)} onToggleWatch={toggleWatch} title="다음 주" />
          </div>
          <div className="space-y-5">
            {isLoadingWatchlist ? (
              <div className="rounded-lg border border-line bg-white p-4 text-sm text-muted shadow-panel">관심종목을 불러오는 중입니다.</div>
            ) : (
              <WatchlistPanel events={events} onRemove={toggleWatch} watchedCompanyIds={watchedCompanyIds} />
            )}
            <CrawlLogPanel logs={crawlLogs} />
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
  events,
  isWatched,
  onToggleWatch,
  title
}: {
  events: EventWithCompany[];
  isWatched: (companyId: string) => boolean;
  onToggleWatch: (companyId: string) => void;
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
            <EventCard event={event} isWatched={isWatched(event.companyId)} key={event.id} onToggleWatch={onToggleWatch} />
          ))}
        </div>
      )}
    </section>
  );
}
