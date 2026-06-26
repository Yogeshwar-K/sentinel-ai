import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SeverityBadge } from "@/components/soc/severity-badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/alerts")({
  head: () => ({ meta: [{ title: "Alerts — SENTINEL SOC" }] }),
  component: AlertsPage,
});

function AlertsPage() {
  const qc = useQueryClient();
  const [sev, setSev] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [q, setQ] = useState("");
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("alerts").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = alerts.filter((a) => {
    if (sev !== "all" && a.severity !== sev) return false;
    if (status !== "all" && a.status !== status) return false;
    if (q && !`${a.title} ${a.source ?? ""} ${a.hostname ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  async function explain(id: string, title: string, description: string | null, mitre: string[] | null) {
    setAnalyzing(id);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [{
            id: crypto.randomUUID(),
            role: "user",
            parts: [{
              type: "text",
              text: `Explain this SOC alert in 4-6 bullets. Include severity rationale, attacker objective, MITRE techniques (${(mitre ?? []).join(", ") || "none"}), and 3 immediate containment actions.\n\nTitle: ${title}\nDescription: ${description ?? "(none)"}`,
            }],
          }],
        }),
      });
      if (!res.ok || !res.body) throw new Error("AI gateway error");
      const text = await res.text();
      // Extract text from streamed UI message format
      const summary = text.split("\n").filter(Boolean).map((line) => {
        try { const j = JSON.parse(line.replace(/^data: /, "")); return j?.delta ?? ""; } catch { return ""; }
      }).join("");
      const final = summary || "AI summary unavailable.";
      const { error } = await supabase.from("alerts").update({ ai_summary: final }).eq("id", id);
      if (error) throw error;
      toast.success("AI explanation saved");
      qc.invalidateQueries({ queryKey: ["alerts"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setAnalyzing(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} of {alerts.length} alerts</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, source, host…" className="max-w-sm" />
        <Select value={sev} onValueChange={setSev}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="false_positive">False positive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Severity</th>
              <th className="px-3 py-2 text-left">Alert</th>
              <th className="px-3 py-2 text-left">Source</th>
              <th className="px-3 py-2 text-left">Host</th>
              <th className="px-3 py-2 text-left">MITRE</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-right">When</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">Loading…</td></tr>}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">No alerts match the filter.</td></tr>
            )}
            {filtered.map((a) => (
              <tr key={a.id} className="border-t border-border/60 align-top hover:bg-muted/20">
                <td className="px-3 py-3"><SeverityBadge severity={a.severity} /></td>
                <td className="px-3 py-3">
                  <div className="font-medium">{a.title}</div>
                  {a.description && <div className="text-xs text-muted-foreground line-clamp-2">{a.description}</div>}
                  {a.ai_summary && (
                    <div className="mt-1 rounded border border-primary/30 bg-primary/5 p-2 text-xs">
                      <div className="text-[10px] uppercase tracking-wider text-primary">AI Summary</div>
                      <div className="mt-1 whitespace-pre-wrap">{a.ai_summary}</div>
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 text-mono text-xs">{a.source_ip ?? a.source ?? "—"}</td>
                <td className="px-3 py-3 text-mono text-xs">{a.hostname ?? "—"}</td>
                <td className="px-3 py-3"><div className="flex flex-wrap gap-1">{(a.mitre_techniques ?? []).slice(0, 3).map((t: string) => (
                  <span key={t} className="text-mono rounded bg-secondary/60 px-1.5 py-0.5 text-[10px]">{t}</span>
                ))}</div></td>
                <td className="px-3 py-3 text-xs uppercase tracking-wider text-muted-foreground">{a.status}</td>
                <td className="px-3 py-3 text-right text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</td>
                <td className="px-3 py-3">
                  <Button size="sm" variant="ghost" disabled={analyzing === a.id} onClick={() => explain(a.id, a.title, a.description, a.mitre_techniques)}>
                    {analyzing === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}