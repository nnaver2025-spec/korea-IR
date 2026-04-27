import { NextResponse } from "next/server";
import { listRecentDartFilings } from "@/lib/adapters/dart";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const beginDate = searchParams.get("beginDate");
  const endDate = searchParams.get("endDate") ?? undefined;

  if (!beginDate) {
    return NextResponse.json({ error: "beginDate is required in YYYYMMDD format." }, { status: 400 });
  }

  try {
    const filings = await listRecentDartFilings({
      beginDate,
      endDate
    });
    return NextResponse.json({ mode: "live", filings });
  } catch (error) {
    return NextResponse.json(
      {
        mode: "unavailable",
        error: error instanceof Error ? error.message : "Unknown DART error"
      },
      { status: 503 }
    );
  }
}
