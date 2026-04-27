import { sourceLabels } from "@/lib/labels";
import type { CrawlLog } from "@/lib/types";

export default function CrawlLogPanel({ logs }: { logs: CrawlLog[] }) {
  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-ink">수집 로그</h2>
        <span className="text-xs font-semibold text-muted">최근 {logs.length}건</span>
      </div>
      {logs.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-surface p-4 text-sm text-muted">아직 수집 로그가 없습니다.</div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div className="rounded-md border border-line p-3" key={log.id}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-ink">{sourceLabels[log.source]}</span>
                <span className="rounded-full bg-surface px-2 py-1 text-xs font-semibold text-muted">{log.status}</span>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs">
                <Metric label="수집" value={log.fetchedCount} />
                <Metric label="추가" value={log.insertedCount} />
                <Metric label="갱신" value={log.updatedCount} />
                <Metric label="중복" value={log.skippedDuplicateCount} />
              </div>
              {log.errorMessage ? <p className="mt-2 text-xs leading-5 text-muted">{log.errorMessage}</p> : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-surface px-2 py-2">
      <div className="font-bold text-ink">{value}</div>
      <div className="mt-0.5 text-muted">{label}</div>
    </div>
  );
}
