import Link from "next/link";
import { notFound } from "next/navigation";
import EventDetail from "@/components/EventDetail";
import { getEventById, listEvents } from "@/lib/data/events";

interface EventPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export async function generateStaticParams() {
  const events = await listEvents();
  return events.map((event) => ({
    eventId: event.id
  }));
}

export default async function EventPage({ params }: EventPageProps) {
  const { eventId } = await params;
  const event = await getEventById(eventId);

  if (!event) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-surface px-6 py-6">
      <div className="mx-auto max-w-5xl">
        <Link className="focus-ring mb-5 inline-flex rounded-md px-1 py-1 text-sm font-semibold text-primary" href="/">
          대시보드로 돌아가기
        </Link>
        <EventDetail event={event} />
      </div>
    </main>
  );
}
