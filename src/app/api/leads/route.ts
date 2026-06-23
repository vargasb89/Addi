import { NextResponse } from "next/server";
import { hasDatabase, getSql, rowToLead } from "@/lib/db";
import { demoLeads } from "@/lib/demo-data";
import type { BusinessLead } from "@/lib/types";

export async function GET() {
  if (!hasDatabase) {
    return NextResponse.json({ mode: "demo", leads: demoLeads });
  }

  const sql = getSql();
  const rows = await sql`
    select *
    from leads
    order by coalesce(route_order, 9999), potential_score desc, created_at desc
  `;

  return NextResponse.json({ mode: "database", leads: rows.map(rowToLead) });
}

export async function POST(request: Request) {
  const leads = (await request.json()) as BusinessLead[];

  if (!hasDatabase) {
    return NextResponse.json({ mode: "demo", leads });
  }

  const sql = getSql();

  for (const lead of leads) {
    await sql`
      insert into leads (
        id, name, category, address, lat, lng, rating, review_count, phone,
        status, potential_score, city, source, notes, route_order
      )
      values (
        ${lead.id}, ${lead.name}, ${lead.category}, ${lead.address}, ${lead.lat},
        ${lead.lng}, ${lead.rating}, ${lead.reviewCount}, ${lead.phone},
        ${lead.status}, ${lead.potentialScore}, ${lead.city}, ${lead.source},
        ${lead.notes ?? null}, ${lead.routeOrder ?? null}
      )
      on conflict (id) do update set
        name = excluded.name,
        category = excluded.category,
        address = excluded.address,
        lat = excluded.lat,
        lng = excluded.lng,
        rating = excluded.rating,
        review_count = excluded.review_count,
        phone = excluded.phone,
        potential_score = excluded.potential_score,
        city = excluded.city,
        source = excluded.source,
        route_order = excluded.route_order,
        updated_at = now()
    `;
  }

  return NextResponse.json({ mode: "database", leads });
}
