export type LeadStatus =
  | "new"
  | "routed"
  | "visited"
  | "interested"
  | "onboarding"
  | "lost";

export type BusinessLead = {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  reviewCount: number;
  phone: string | null;
  status: LeadStatus;
  potentialScore: number;
  city: string;
  source: "google_places" | "demo" | "manual";
  notes?: string | null;
  routeOrder?: number | null;
};

export type Territory = {
  city: string;
  center: {
    lat: number;
    lng: number;
  };
  radiusMeters: number;
  category: string;
};

export const leadStatuses: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "Nuevo" },
  { value: "routed", label: "En ruta" },
  { value: "visited", label: "Visitado" },
  { value: "interested", label: "Interesado" },
  { value: "onboarding", label: "Onboarding" },
  { value: "lost", label: "Perdido" }
];

export const cities = [
  {
    name: "Bogota",
    lat: 4.711,
    lng: -74.0721,
    radiusMeters: 2500
  },
  {
    name: "Medellin",
    lat: 6.2442,
    lng: -75.5812,
    radiusMeters: 2200
  },
  {
    name: "Cali",
    lat: 3.4516,
    lng: -76.532,
    radiusMeters: 2200
  },
  {
    name: "Barranquilla",
    lat: 10.9685,
    lng: -74.7813,
    radiusMeters: 2200
  }
];
