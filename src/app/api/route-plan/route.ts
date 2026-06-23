import { NextResponse } from "next/server";
import { optimizeRoute } from "@/lib/route";
import type { BusinessLead } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    leads: BusinessLead[];
    start: { lat: number; lng: number };
  };

  const route = optimizeRoute(body.leads, body.start);

  return NextResponse.json({ route });
}
