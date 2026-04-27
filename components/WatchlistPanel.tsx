import { Star, Trash2 } from "lucide-react";
import type { Company, EventWithCompany } from "@/lib/types";

interface WatchlistPanelProps {
  events: EventWithCompany[];
  watchedCompanyIds: string[];
  onRemove: (companyId: string) => void;
}

export default function WatchlistPanel({ events, watchedCompanyIds, onRemove }: WatchlistPanelProps) {
  const companies = watchedCompanyIds
    .map((companyId) => events.find((event) => event.companyId === companyId)?.company)
    .filter((company): company is Company => Boolean(company));

  return (
    <aside className="rounded-lg border border-line bg-white p-4 shadow-panel">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-ink">관심종목</h2>
        <span className="rounded-full bg-surface px-2 py-1 text-xs font-semibold text-muted">{companies.length}개</span>
      </div>

      {companies.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-surface p-4 text-sm text-muted">
          관심종목을 추가하면 새 IR/실적 이벤트 알림 대상이 됩니다.
        </div>
      ) : (
        <div className="space-y-2">
          {companies.map((company) => (
            <div className="flex items-center justify-between rounded-md border border-line bg-white p-3" key={company.id}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Star className="text-amber-600" fill="currentColor" size={15} />
                  <span className="truncate text-sm font-bold text-ink">{company.name}</span>
                </div>
                <div className="mt-1 text-xs text-muted">
                  {company.ticker} · {company.market}
                </div>
              </div>
              <button
                aria-label={`${company.name} 관심종목 삭제`}
                className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-md border border-line text-muted hover:border-rose-200 hover:text-rose-700"
                onClick={() => onRemove(company.id)}
                type="button"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 rounded-md bg-teal-50 p-3 text-xs leading-5 text-teal-800">
        Telegram 알림은 skeleton 단계입니다. `TELEGRAM_BOT_TOKEN`과 `TELEGRAM_CHAT_ID`를 설정하면 발송 함수에 연결할 수 있습니다.
      </div>
    </aside>
  );
}
