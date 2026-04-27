import { crawlLogs, events } from "@/lib/mock-data";
import type { CrawlLog, EventWithCompany } from "@/lib/types";

export async function listEvents(): Promise<EventWithCompany[]> {
  // Supabase integration will replace this branch. MVP keeps mock mode as the default.
  return events.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export async function getEventById(eventId: string): Promise<EventWithCompany | undefined> {
  return events.find((event) => event.id === eventId);
}

export async function listCrawlLogs(): Promise<CrawlLog[]> {
  return crawlLogs.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}
