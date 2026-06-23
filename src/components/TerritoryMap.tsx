"use client";

import { Navigation } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { BusinessLead } from "@/lib/types";
import type * as Leaflet from "leaflet";

type TerritoryMapProps = {
  city: string;
  category: string;
  radiusMeters: number;
  center: { lat: number; lng: number };
  leads: BusinessLead[];
  selectedLeadId?: string | null;
  onCenterChange: (center: { lat: number; lng: number }) => void;
  onLeadSelect: (id: string) => void;
};

export function TerritoryMap({
  city,
  category,
  radiusMeters,
  center,
  leads,
  selectedLeadId,
  onCenterChange,
  onLeadSelect
}: TerritoryMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<typeof Leaflet | null>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const centerMarkerRef = useRef<Leaflet.Marker | null>(null);
  const radiusRef = useRef<Leaflet.Circle | null>(null);
  const leadLayerRef = useRef<Leaflet.LayerGroup | null>(null);
  const onCenterChangeRef = useRef(onCenterChange);
  const initialCenterRef = useRef(center);
  const initialRadiusRef = useRef(radiusMeters);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    onCenterChangeRef.current = onCenterChange;
  }, [onCenterChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let isMounted = true;

    async function createMap() {
      const L = await import("leaflet");
      if (!isMounted || !containerRef.current || mapRef.current) return;

      leafletRef.current = L;
      const initialCenter = initialCenterRef.current;
      const initialRadius = initialRadiusRef.current;
      const centerIcon = L.divIcon({
        className: "territoryCenterIcon",
        html: '<span class="territoryCenterGlyph"></span>',
        iconSize: [46, 46],
        iconAnchor: [23, 42]
      });

      const map = L.map(containerRef.current, {
        center: [initialCenter.lat, initialCenter.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: "topright" }).addTo(map);
      L.control
        .attribution({ position: "bottomright", prefix: false })
        .addAttribution("&copy; OpenStreetMap")
        .addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
      }).addTo(map);

      const radius = L.circle([initialCenter.lat, initialCenter.lng], {
        radius: initialRadius,
        color: "#0f8a67",
        dashArray: "8 8",
        fillColor: "#20c997",
        fillOpacity: 0.11,
        weight: 2
      }).addTo(map);

      const marker = L.marker([initialCenter.lat, initialCenter.lng], {
        draggable: true,
        icon: centerIcon,
        zIndexOffset: 1000
      }).addTo(map);

      marker.on("dragend", () => {
        const latLng = marker.getLatLng();
        onCenterChangeRef.current({ lat: latLng.lat, lng: latLng.lng });
      });

      map.on("click", (event: Leaflet.LeafletMouseEvent) => {
        onCenterChangeRef.current({ lat: event.latlng.lat, lng: event.latlng.lng });
      });

      mapRef.current = map;
      centerMarkerRef.current = marker;
      radiusRef.current = radius;
      leadLayerRef.current = L.layerGroup().addTo(map);
      setIsMapReady(true);
    }

    createMap();

    return () => {
      isMounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
      centerMarkerRef.current = null;
      radiusRef.current = null;
      leadLayerRef.current = null;
      leafletRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = centerMarkerRef.current;
    const radius = radiusRef.current;
    if (!map || !marker || !radius) return;

    const latLng: Leaflet.LatLngExpression = [center.lat, center.lng];
    marker.setLatLng(latLng);
    radius.setLatLng(latLng);
    radius.setRadius(radiusMeters);
    map.panTo(latLng, { animate: true, duration: 0.35 });
  }, [center.lat, center.lng, radiusMeters, isMapReady]);

  useEffect(() => {
    const L = leafletRef.current;
    const layer = leadLayerRef.current;
    if (!L || !layer) return;

    layer.clearLayers();

    leads.forEach((lead) => {
      const isSelected = lead.id === selectedLeadId;
      const marker = L.marker([lead.lat, lead.lng], {
        icon: L.divIcon({
          className: `businessLeadIcon ${isSelected ? "selected" : ""}`,
          html: `<span>${lead.routeOrder ?? ""}</span>`,
          iconSize: isSelected ? [34, 34] : [28, 28],
          iconAnchor: isSelected ? [17, 17] : [14, 14]
        })
      });

      marker.bindTooltip(
        `<strong>${escapeHtml(lead.name)}</strong><br/>Score ${lead.potentialScore}`,
        { direction: "top", offset: [0, -10] }
      );
      marker.on("click", () => onLeadSelect(lead.id));
      marker.addTo(layer);
    });
  }, [isMapReady, leads, onLeadSelect, selectedLeadId]);

  return (
    <div className="realMapShell">
      <div ref={containerRef} className="realMap" />
      <div className="mapInfo">
        <Navigation size={18} />
        {city} | {category} | {(radiusMeters / 1000).toFixed(1)} km
      </div>
      <div className="pinHint">Haz clic en el mapa o arrastra el pin para fijar zona</div>
    </div>
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
