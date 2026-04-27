import type { IrEvent } from "@/lib/types";

export function createEventDedupeKey(input: Pick<IrEvent, "companyId" | "eventType" | "source" | "startsAt" | "sourceUrl">) {
  const dateKey = input.startsAt.slice(0, 10);
  const normalizedUrl = normalizeSourceUrl(input.sourceUrl);
  return [input.companyId, input.eventType, input.source, dateKey, normalizedUrl].join("|");
}

export function normalizeSourceUrl(sourceUrl: string) {
  try {
    const url = new URL(sourceUrl);
    url.hash = "";
    url.searchParams.sort();
    return url.toString().replace(/\/$/, "");
  } catch {
    return sourceUrl.trim().replace(/\/$/, "");
  }
}
