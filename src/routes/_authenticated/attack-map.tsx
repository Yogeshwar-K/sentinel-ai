import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/attack-map")({
  head: () => ({ meta: [{ title: "Attack Map — SENTINEL SOC" }] }),
  component: AttackMapPage,
});

// Approximate centroids by ISO country code for demo purposes.
const COUNTRY_LATLNG: Record<string, [number, number]> = {
  US: [37.0902, -95.7129], DE: [51.1657, 10.4515], CN: [35.8617, 104.1954],
  RU: [61.524, 105.3188], NL: [52.1326, 5.2913], NG: [9.082, 8.6753],
  IN: [20.5937, 78.9629], BR: [-14.235, -51.9253], NZ: [-40.9006, 174.886],
};
const HOME: [number, number] = [37.7749, -122.4194]; // SOC HQ

function AttackMapPage() {
  const { data = [] } = useQuery({
    queryKey: ["map-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("alerts").select("country,severity,title").not("country", "is", null);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Force resize fix
  useEffect(() => { setTimeout(() => window.dispatchEvent(new Event("resize")), 100); }, []);

  const byCountry = data.reduce<Record<string, { count: number; critical: number }>>((acc, a) => {
    if (!a.country) return acc;
    acc[a.country] ??= { count: 0, critical: 0 };
    acc[a.country].count += 1;
    if (a.severity === "critical") acc[a.country].critical += 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Live Attack Map</h1>
        <p className="text-sm text-muted-foreground">Geo-distribution of inbound threats.</p>
      </div>
      <div className="glass overflow-hidden rounded-xl" style={{ height: "70vh" }}>
        <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom style={{ height: "100%", width: "100%", background: "#06121f" }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {Object.entries(byCountry).map(([cc, v]) => {
            const pos = COUNTRY_LATLNG[cc];
            if (!pos) return null;
            const color = v.critical > 0 ? "#ff3b5c" : "#ffb02e";
            return (
              <CircleMarker key={cc} center={pos} radius={6 + Math.min(v.count * 2, 24)} pathOptions={{ color, fillColor: color, fillOpacity: 0.4, weight: 1.5 }}>
                <LeafletTooltip>{cc} · {v.count} alert{v.count > 1 ? "s" : ""}{v.critical ? ` (${v.critical} critical)` : ""}</LeafletTooltip>
                <Polyline positions={[pos, HOME]} pathOptions={{ color, weight: 1, dashArray: "4 6", opacity: 0.6 }} />
              </CircleMarker>
            );
          })}
          <CircleMarker center={HOME} radius={8} pathOptions={{ color: "#22d3ee", fillColor: "#22d3ee", fillOpacity: 0.8 }}>
            <LeafletTooltip permanent direction="top" offset={[0, -8]}>SOC HQ</LeafletTooltip>
          </CircleMarker>
        </MapContainer>
      </div>
    </div>
  );
}