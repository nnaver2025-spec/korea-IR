import { CalendarClock, ExternalLink, FileText, MapPin } from "lucide-react";
import { SourceBadge, StatusBadge, TypeBadge } from "@/components/Badge";
import { formatKoreanDateTime } from "@/lib/date";
import { sourceLabels } from "@/lib/labels";
import type { EventWithCompany } from "@/lib/types";

export default function EventDetail({ event }: { event: EventWithCompany }) {
  return (
    <article className="overflow-hidden rounded-lg border border-line bg-white shadow-panel">
      <div className="border-b border-line bg-white p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={event.status} />
          <TypeBadge type={event.eventType} />
          <SourceBadge source={event.source} />
        </div>
        <h1 className="text-2xl font-bold tracking-normal text-ink">{event.title}</h1>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
          <span className="font-semibold text-ink">
            {event.company.name} · {event.company.ticker}
          </span>
          <span>{event.company.market}</span>
          {event.company.sector ? <span>{event.company.sector}</span> : null}
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="space-y-5">
          <div className="rounded-lg border border-line p-4">
            <h2 className="mb-3 text-base font-bold text-ink">이벤트 정보</h2>
            <div className="space-y-3 text-sm text-muted">
              <InfoRow icon={<CalendarClock size={17} />} label="일시" value={formatKoreanDateTime(event.startsAt)} />
              {event.location ? <InfoRow icon={<MapPin size={17} />} label="장소" value={event.location} /> : null}
              {event.fiscalPeriod ? <InfoRow label="대상 기간" value={event.fiscalPeriod} /> : null}
              <InfoRow label="데이터 출처" value={sourceLabels[event.source]} />
              <InfoRow label="중복 키" value={event.dedupeKey} />
            </div>
          </div>

          <div className="rounded-lg border border-line p-4">
            <h2 className="mb-3 text-base font-bold text-ink">설명</h2>
            {event.description ? <p className="text-sm leading-6 text-muted">{event.description}</p> : <p className="text-sm text-muted">추가 설명이 없습니다.</p>}
          </div>

          <div className="rounded-lg border border-line p-4">
            <h2 className="mb-3 text-base font-bold text-ink">자료</h2>
            {event.materials.length === 0 ? (
              <div className="rounded-md border border-dashed border-line bg-surface p-4 text-sm text-muted">아직 연결된 IR 자료가 없습니다.</div>
            ) : (
              <div className="space-y-3">
                {event.materials.map((material) => (
                  <a
                    className="focus-ring flex items-center justify-between gap-4 rounded-md border border-line p-3 hover:border-teal-300"
                    href={material.fileUrl ?? material.sourceUrl}
                    key={material.id}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <FileText className="shrink-0 text-amber-700" size={18} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-ink">{material.title}</span>
                        <span className="mt-1 block text-xs text-muted">요약 상태: {material.summaryStatus}</span>
                      </span>
                    </span>
                    <ExternalLink className="shrink-0 text-muted" size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-lg border border-line p-4">
            <h2 className="mb-3 text-base font-bold text-ink">원문</h2>
            <a className="focus-ring inline-flex items-center gap-2 rounded-md font-semibold text-primary hover:underline" href={event.sourceUrl} rel="noreferrer" target="_blank">
              원문 링크 열기
              <ExternalLink size={15} />
            </a>
            <p className="mt-3 text-xs leading-5 text-muted">원문 URL은 이벤트 레코드에 필수 저장됩니다.</p>
          </div>
          <div className="rounded-lg border border-line p-4">
            <h2 className="mb-3 text-base font-bold text-ink">회사 IR</h2>
            {event.company.irUrl ? (
              <a className="focus-ring inline-flex items-center gap-2 rounded-md font-semibold text-primary hover:underline" href={event.company.irUrl} rel="noreferrer" target="_blank">
                IR 페이지
                <ExternalLink size={15} />
              </a>
            ) : (
              <p className="text-sm text-muted">회사 IR 페이지가 등록되지 않았습니다.</p>
            )}
          </div>
        </aside>
      </div>
    </article>
  );
}

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[120px_1fr]">
      <div className="flex items-center gap-2 font-semibold text-ink">
        {icon}
        {label}
      </div>
      <div className="break-words">{value}</div>
    </div>
  );
}
