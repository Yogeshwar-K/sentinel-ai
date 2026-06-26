import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/assets")({
  head: () => ({ meta: [{ title: "Asset Inventory — SENTINEL SOC" }] }),
  component: AssetsPage,
});

function AssetsPage() {
  const { data = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("assets").select("*").order("risk_score", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Asset Inventory</h1>
        <p className="text-sm text-muted-foreground">{data.length} assets · sorted by risk</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Host</th>
              <th className="px-3 py-2 text-left">IP</th>
              <th className="px-3 py-2 text-left">OS</th>
              <th className="px-3 py-2 text-left">Owner</th>
              <th className="px-3 py-2 text-left">Dept</th>
              <th className="px-3 py-2 text-left">Criticality</th>
              <th className="px-3 py-2 text-right">Risk</th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a) => (
              <tr key={a.id} className="border-t border-border/60 hover:bg-muted/20">
                <td className="px-3 py-2 font-medium">{a.hostname}</td>
                <td className="px-3 py-2 text-mono text-xs">{a.ip ?? "—"}</td>
                <td className="px-3 py-2 text-xs">{a.os}</td>
                <td className="px-3 py-2 text-xs">{a.owner}</td>
                <td className="px-3 py-2 text-xs">{a.department}</td>
                <td className="px-3 py-2 text-xs capitalize">{a.criticality}</td>
                <td className="px-3 py-2 text-right text-mono tabular-nums">
                  <span className={cn(
                    a.risk_score >= 80 ? "text-critical" : a.risk_score >= 60 ? "text-high" : a.risk_score >= 40 ? "text-medium" : "text-low",
                  )}>{a.risk_score}</span>
                </td>
                <td className="px-3 py-2 text-xs">
                  <span className={cn("inline-flex items-center gap-1.5", a.online ? "text-success" : "text-muted-foreground")}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", a.online ? "bg-success" : "bg-muted-foreground")} />
                    {a.online ? "online" : "offline"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}