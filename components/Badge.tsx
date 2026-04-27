import type { EventSource, EventStatus, EventType } from "@/lib/types";
import { eventTypeLabels, sourceLabels, statusLabels } from "@/lib/labels";

const statusClassName: Record<EventStatus, string> = {
  scheduled: "border-blue-200 bg-blue-50 text-blue-700",
  confirmed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  changed: "border-amber-200 bg-amber-50 text-amber-800",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
  completed: "border-slate-200 bg-slate-100 text-slate-600",
  unknown: "border-zinc-200 bg-zinc-50 text-zinc-700"
};

export function StatusBadge({ status }: { status: EventStatus }) {
  return <span className={`inline-flex h-6 items-center rounded-full border px-2 text-xs font-semibold ${statusClassName[status]}`}>{statusLabels[status]}</span>;
}

export function TypeBadge({ type }: { type: EventType }) {
  return <span className="inline-flex h-6 items-center rounded-full border border-line bg-white px-2 text-xs font-semibold text-ink">{eventTypeLabels[type]}</span>;
}

export function SourceBadge({ source }: { source: EventSource }) {
  return <span className="inline-flex h-6 items-center rounded-full border border-teal-200 bg-teal-50 px-2 text-xs font-semibold text-primary">{sourceLabels[source]}</span>;
}
