import { neon } from "@neondatabase/serverless";
import type { BusinessLead, LeadStatus } from "./types";

export const hasDatabase = Boolean(process.env.DATABASE_URL);

export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  return neon(process.env.DATABASE_URL);
}

export function rowToLead(row: Record<string, unknown>): BusinessLead {
  return {
    id: String(row.id),
    name: String(row.name),
    category: String(row.category),
    address: String(row.address),
    lat: Number(row.lat),
    lng: Number(row.lng),
    rating: row.rating === null ? null : Number(row.rating),
    reviewCount: Number(row.review_count ?? 0),
    phone: row.phone === null ? null : String(row.phone),
    status: row.status as LeadStatus,
    potentialScore: Number(row.potential_score ?? 50),
    city: String(row.city),
    source: row.source as BusinessLead["source"],
    notes: row.notes === null ? null : String(row.notes ?? ""),
    routeOrder: row.route_order === null ? null : Number(row.route_order)
  };
}
