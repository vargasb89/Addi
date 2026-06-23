"use client";

import {
  Building2,
  CheckCircle2,
  Crosshair,
  Radar,
  RefreshCw,
  Route,
  Search,
  Sparkles
} from "lucide-react";
import { useMemo, useState } from "react";
import { TerritoryMap } from "@/components/TerritoryMap";
import { cities, leadStatuses, type BusinessLead } from "@/lib/types";

const categories = [
  "Ropa y moda",
  "Calzado",
  "Belleza",
  "Electrodomesticos",
  "Hogar y muebles",
  "Deportes"
];

export default function Home() {
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [territoryCenter, setTerritoryCenter] = useState({
    lat: cities[0].lat,
    lng: cities[0].lng
  });
  const [category, setCategory] = useState(categories[0]);
  const [radiusMeters, setRadiusMeters] = useState(cities[0].radiusMeters);
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [message, setMessage] = useState("Listo para escanear un territorio.");

  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) ?? leads[0];
  const routedLeads = leads
    .filter((lead) => lead.routeOrder)
    .sort((a, b) => (a.routeOrder ?? 0) - (b.routeOrder ?? 0));

  const stats = useMemo(() => {
    const routed = leads.filter((lead) => lead.routeOrder).length;
    const interested = leads.filter((lead) =>
      ["interested", "onboarding"].includes(lead.status)
    ).length;
    const average =
      leads.length > 0
        ? Math.round(
            leads.reduce((sum, lead) => sum + lead.potentialScore, 0) / leads.length
          )
        : 0;

    return { total: leads.length, routed, interested, average };
  }, [leads]);

  async function scanTerritory() {
    setIsScanning(true);
    setMessage("Escaneando comercios del territorio...");

    const response = await fetch("/api/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lat: territoryCenter.lat,
        lng: territoryCenter.lng,
        radiusMeters,
        category,
        city: selectedCity.name
      })
    });

    const data = (await response.json()) as { leads: BusinessLead[]; source: string };
    setLeads(data.leads);
    setSelectedLeadId(data.leads[0]?.id ?? null);
    setMessage(
      data.source === "demo"
        ? "Modo demo activo: agrega GOOGLE_PLACES_API_KEY para datos reales."
        : "Comercios detectados desde Google Places."
    );
    setIsScanning(false);
  }

  async function buildRoute() {
    setIsRouting(true);
    setMessage("Calculando ruta diaria por cercania y potencial...");

    const response = await fetch("/api/route-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leads: leads.slice(0, 10),
        start: territoryCenter
      })
    });

    const data = (await response.json()) as { route: BusinessLead[] };
    const routeById = new Map(data.route.map((lead) => [lead.id, lead]));
    const updated = leads.map((lead) => routeById.get(lead.id) ?? lead);

    setLeads(updated);
    setMessage(`Ruta generada con ${data.route.length} visitas sugeridas.`);
    setIsRouting(false);

    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    });
  }

  async function updateLead(id: string, patch: Partial<BusinessLead>) {
    setLeads((current) =>
      current.map((lead) => (lead.id === id ? { ...lead, ...patch } : lead))
    );

    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brandMark">A</span>
          <div>
            <strong>ADDI SMB GTM</strong>
            <span>Territorio, ruta y pipeline</span>
          </div>
        </div>

        <section className="panel">
          <div className="panelTitle">
            <Crosshair size={18} />
            Territorio
          </div>

          <label>
            Ciudad
            <select
              value={selectedCity.name}
              onChange={(event) => {
                const city = cities.find((item) => item.name === event.target.value);
                if (!city) return;
                setSelectedCity(city);
                setTerritoryCenter({ lat: city.lat, lng: city.lng });
                setRadiusMeters(city.radiusMeters);
              }}
            >
              {cities.map((city) => (
                <option key={city.name}>{city.name}</option>
              ))}
            </select>
          </label>

          <label>
            Categoria comercial
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label>
            Radio: {(radiusMeters / 1000).toFixed(1)} km
            <input
              type="range"
              min="800"
              max="5000"
              step="100"
              value={radiusMeters}
              onChange={(event) => setRadiusMeters(Number(event.target.value))}
            />
          </label>

          <button className="primary" onClick={scanTerritory} disabled={isScanning}>
            {isScanning ? <RefreshCw className="spin" size={18} /> : <Radar size={18} />}
            Escanear comercios
          </button>
        </section>

        <section className="panel compact">
          <div className="panelTitle">
            <Sparkles size={18} />
            Indicadores
          </div>
          <Metric label="Leads" value={stats.total} />
          <Metric label="En ruta" value={stats.routed} />
          <Metric label="Interesados" value={stats.interested} />
          <Metric label="Score prom." value={stats.average} />
        </section>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Sales Manager SMB</p>
            <h1>Planificador de visitas para adquisicion de comercios</h1>
          </div>
          <button className="secondary" onClick={buildRoute} disabled={!leads.length || isRouting}>
            {isRouting ? <RefreshCw className="spin" size={18} /> : <Route size={18} />}
            Generar ruta del dia
          </button>
        </header>

        <section className="mapArea">
          <TerritoryMap
            city={selectedCity.name}
            category={category}
            radiusMeters={radiusMeters}
            center={territoryCenter}
            leads={leads}
            selectedLeadId={selectedLead?.id}
            onCenterChange={setTerritoryCenter}
            onLeadSelect={setSelectedLeadId}
          />

          <div className="leadDetail">
            {selectedLead ? (
              <>
                <div className="leadHeader">
                  <Building2 size={22} />
                  <div>
                    <h2>{selectedLead.name}</h2>
                    <span>{selectedLead.category}</span>
                  </div>
                </div>
                <p>{selectedLead.address}</p>
                <div className="scoreRow">
                  <strong>{selectedLead.potentialScore}</strong>
                  <span>score comercial</span>
                </div>
                <label>
                  Estado del lead
                  <select
                    value={selectedLead.status}
                    onChange={(event) =>
                      updateLead(selectedLead.id, {
                        status: event.target.value as BusinessLead["status"]
                      })
                    }
                  >
                    {leadStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>
                <textarea
                  placeholder="Notas de visita, objeciones o siguiente paso"
                  value={selectedLead.notes ?? ""}
                  onChange={(event) =>
                    updateLead(selectedLead.id, { notes: event.target.value })
                  }
                />
              </>
            ) : (
              <div className="emptyState">
                <Search size={24} />
                <span>Escanea un territorio para ver leads.</span>
              </div>
            )}
          </div>
        </section>

        <section className="split">
          <div className="tableWrap">
            <div className="sectionTitle">Comercios detectados</div>
            <table>
              <thead>
                <tr>
                  <th>Comercio</th>
                  <th>Categoria</th>
                  <th>Score</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} onClick={() => setSelectedLeadId(lead.id)}>
                    <td>{lead.name}</td>
                    <td>{lead.category}</td>
                    <td>{lead.potentialScore}</td>
                    <td>
                      <span className={`status ${lead.status}`}>{statusLabel(lead.status)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!leads.length && <p className="hint">No hay comercios escaneados aun.</p>}
          </div>

          <div className="routeList">
            <div className="sectionTitle">Ruta sugerida</div>
            {routedLeads.map((lead) => (
              <div className="routeItem" key={lead.id}>
                <span>{lead.routeOrder}</span>
                <div>
                  <strong>{lead.name}</strong>
                  <small>{lead.address}</small>
                </div>
                <CheckCircle2 size={18} />
              </div>
            ))}
            {!routedLeads.length && <p className="hint">Genera una ruta para ordenar visitas.</p>}
          </div>
        </section>

        <footer>{message}</footer>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function statusLabel(status: BusinessLead["status"]) {
  return leadStatuses.find((item) => item.value === status)?.label ?? status;
}
