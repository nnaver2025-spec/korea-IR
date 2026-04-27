import type { EventWithCompany } from "@/lib/types";

export interface KindAdapterOptions {
  beginDate: string;
  endDate: string;
}

export async function listKindIrEvents(_options: KindAdapterOptions): Promise<EventWithCompany[]> {
  // TODO: KIND has multiple public pages and parameters whose stability must be verified before production crawling.
  // Keep this skeleton explicit so the UI and crawl log contract can ship without pretending coverage is complete.
  return [];
}
