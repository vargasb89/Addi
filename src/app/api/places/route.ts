import { NextResponse } from "next/server";
import { demoLeads } from "@/lib/demo-data";
import type { BusinessLead } from "@/lib/types";

type PlacesRequest = {
  lat: number;
  lng: number;
  radiusMeters: number;
  category: string;
  city: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as PlacesRequest;

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return NextResponse.json({
      source: "demo",
      leads: demoLeads.filter((lead) => lead.city === body.city).slice(0, 12)
    });
  }

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchNearby",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.primaryTypeDisplayName"
      },
      body: JSON.stringify({
        includedTypes: mapCategoryToPlaceTypes(body.category),
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: body.lat, longitude: body.lng },
            radius: body.radiusMeters
          }
        }
      })
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json(
      { error: "No se pudo consultar Google Places", detail },
      { status: response.status }
    );
  }

  const data = (await response.json()) as { places?: GooglePlace[] };
  const leads = (data.places ?? []).map((place): BusinessLead => {
    const rating = place.rating ?? null;
    const reviewCount = place.userRatingCount ?? 0;

    return {
      id: place.id,
      name: place.displayName?.text ?? "Comercio sin nombre",
      category: place.primaryTypeDisplayName?.text ?? body.category,
      address: place.formattedAddress ?? "Direccion no disponible",
      lat: place.location.latitude,
      lng: place.location.longitude,
      rating,
      reviewCount,
      phone: place.nationalPhoneNumber ?? null,
      status: "new",
      potentialScore: scoreLead(rating, reviewCount),
      city: body.city,
      source: "google_places"
    };
  });

  return NextResponse.json({ source: "google_places", leads });
}

type GooglePlace = {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  location: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  nationalPhoneNumber?: string;
  primaryTypeDisplayName?: { text: string };
};

function scoreLead(rating: number | null, reviews: number) {
  const ratingScore = rating ? (rating / 5) * 55 : 32;
  const reviewScore = Math.min(reviews, 300) / 300 * 35;
  return Math.round(Math.min(98, ratingScore + reviewScore + 10));
}

function mapCategoryToPlaceTypes(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes("ropa") || normalized.includes("moda")) return ["clothing_store"];
  if (normalized.includes("calzado")) return ["shoe_store"];
  if (normalized.includes("belleza")) return ["beauty_salon"];
  if (normalized.includes("electro")) return ["electronics_store"];
  if (normalized.includes("hogar") || normalized.includes("mueble")) return ["furniture_store"];
  return ["store"];
}
