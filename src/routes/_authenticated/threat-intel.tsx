import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Globe2, Shield, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/threat-intel")({
  head: () => ({ meta: [{ title: "Threat Intelligence — SENTINEL SOC" }] }),
  component: ThreatIntelPage,
});

function ThreatIntelPage() {
  const [q, setQ] = useState("");
  const { data = [] } = useQuery({
    queryKey: ["ti"],
    queryFn: async () => {
      const { data, error } = await supabase.from("threat_intel").select("*").order("risk_score", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const filtered = data.filter((d) => !q || `${d.ioc} ${d.malware_family ?? ""} ${d.threat_actor ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Threat Intelligence</h1>
          <p className="text-sm text-muted-foreground">IOC lookup · risk scoring · MITRE mapping</p>
        </div>
        <Input placeholder="Search IOC, actor, family…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {filtered.map((i) => (
          <div key={i.id} className="glass rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-mono text-xs uppercase tracking-widest text-primary">{i.ioc_type}</div>
                <div className="text-mono mt-0.5 break-all text-base font-semibold">{i.ioc}</div>
              </div>
              <div className="text-right">
                <div className="text-mono text-2xl font-bold tabular-nums text-critical">{i.risk_score}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">risk</div>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{i.description}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              {i.malware_family && <Tag icon={AlertTriangle} label="Family" value={i.malware_family} />}
              {i.threat_actor && <Tag icon={Shield} label="Actor" value={i.threat_actor} />}
              {i.country && <Tag icon={Globe2} label="Country" value={i.country} />}
              {i.asn && <Tag icon={Globe2} label="ASN" value={i.asn} />}
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {(i.mitre_techniques ?? []).map((t: string) => (
                <span key={t} className="text-mono rounded bg-secondary/60 px-1.5 py-0.5 text-[10px]">{t}</span>
              ))}
              {(i.tags ?? []).map((t: string) => (
                <span key={t} className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">#{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Tag({ icon: Icon, label, value }: { icon: typeof Globe2; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded border border-border/60 bg-background/40 px-2 py-1">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="ml-auto text-xs">{value}</span>
    </div>
  );
}