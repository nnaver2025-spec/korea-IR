import { BellPlus, CalendarClock, ExternalLink, FileText, Star } from "lucide-react";
import Link from "next/link";
import { SourceBadge, StatusBadge, TypeBadge } from "@/components/Badge";
import { formatKoreanDateTime } from "@/lib/date";
import type { EventWithCompany } from "@/lib/types";

interface EventCardProps {
  event: EventWithCompany;
  isWatched: boolean;
  onToggleWatch: (companyId: string) => void;
}

export default function EventCard({ event, isWatched, onToggleWatch }: EventCardProps) {
  const hasMaterials = event.materials.length > 0;

  return (
    <article className="rounded-lg border border-line bg-white p-4 shadow-sm transition hover:border-teal-300">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={event.status} />
            <TypeBadge type={event.eventType} />
            <SourceBadge source={event.source} />
            {hasMaterials ? (
              <span className="inline-flex h-6 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 text-xs font-semibold text-amber-800">
                <FileText size={13} />
                자료 있음
              </span>
            ) : (
              <span className="inline-flex h-6 items-center rounded-full border border-zinc-200 bg-zinc-50 px-2 text-xs font-semibold text-zinc-600">자료 대기</span>
            )}
          </div>
          <Link className="focus-ring block rounded-md" href={`/events/${event.id}`}>
            <h3 className="truncate text-lg font-bold text-ink">{event.title}</h3>
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <span className="font-semibold text-ink">
              {event.company.name} · {event.company.ticker}
            </span>
            <span>{event.company.market}</span>
            {event.company.sector ? <span>{event.company.sector}</span> : null}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock size={16} />
              {formatKoreanDateTime(event.startsAt)}
            </span>
            {event.location ? <span>{event.location}</span> : null}
            {event.fiscalPeriod ? <span>{event.fiscalPeriod}</span> : null}
          </div>
        </div>
        <button
          className={`focus-ring inline-flex h-10 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-semibold ${
            isWatched ? "border-amber-300 bg-amber-50 text-amber-800" : "border-line bg-white text-ink hover:border-teal-300"
          }`}
          onClick={() => onToggleWatch(event.companyId)}
          type="button"
        >
          {isWatched ? <Star fill="currentColor" size={16} /> : <BellPlus size={16} />}
          관심
        </button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-3 text-sm">
        <Link className="focus-ring rounded-md font-semibold text-primary hover:underline" href={`/events/${event.id}`}>
          상세 보기
        </Link>
        <a className="focus-ring inline-flex items-center gap-1 rounded-md text-muted hover:text-primary" href={event.sourceUrl} rel="noreferrer" target="_blank">
          원문 링크
          <ExternalLink size={14} />
        </a>
      </div>
    </article>
  );
}
