import Dashboard from "@/components/Dashboard";
import { listCrawlLogs, listEvents } from "@/lib/data/events";

export default async function Home() {
  const [events, crawlLogs] = await Promise.all([listEvents(), listCrawlLogs()]);
  return <Dashboard events={events} crawlLogs={crawlLogs} />;
}
