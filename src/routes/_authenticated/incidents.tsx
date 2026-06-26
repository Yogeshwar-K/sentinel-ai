import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SeverityBadge } from "@/components/soc/severity-badge";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/incidents")({
  head: () => ({ meta: [{ title: "Incident Response — SENTINEL SOC" }] }),
  component: IncidentsPage,
});

function IncidentsPage() {
  const { data = [] } = useQuery({
    queryKey: ["incidents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("incidents").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Incident Response</h1>
        <p className="text-sm text-muted-foreground">{data.length} incidents · sorted by recency</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {data.map((i) => (
          <div key={i.id} className="glass rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-mono text-[11px] uppercase tracking-widest text-muted-foreground">{i.status}</div>
                <h3 className="mt-0.5 font-semibold">{i.title}</h3>
              </div>
              <SeverityBadge severity={i.severity} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{i.description}</p>
            <div className="mt-3 text-xs text-muted-foreground">Opened {formatDistanceToNow(new Date(i.created_at), { addSuffix: true })}</div>
          </div>
        ))}
        {data.length === 0 && <div className="glass rounded-xl p-6 text-sm text-muted-foreground">No incidents yet.</div>}
      </div>
    </div>
  );
}