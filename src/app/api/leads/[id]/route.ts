import { NextResponse } from "next/server";
import { getSql, hasDatabase, rowToLead } from "@/lib/db";
import type { LeadStatus } from "@/lib/types";

type LeadUpdate = {
  status?: LeadStatus;
  notes?: string;
  routeOrder?: number | null;
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = (await request.json()) as LeadUpdate;

  if (!hasDatabase) {
    return NextResponse.json({ mode: "demo", id, ...body });
  }

  const sql = getSql();
  const rows = await sql`
    update leads
    set
      status = coalesce(${body.status ?? null}, status),
      notes = coalesce(${body.notes ?? null}, notes),
      route_order = ${body.routeOrder ?? null},
      updated_at = now()
    where id = ${id}
    returning *
  `;

  if (!rows[0]) {
    return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ mode: "database", lead: rowToLead(rows[0]) });
}
