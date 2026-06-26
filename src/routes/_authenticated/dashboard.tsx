import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShieldAlert, Activity, Server, Ban, Siren, CheckCircle2, Cpu, MemoryStick, HardDrive, Globe2 } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { KpiCard } from "@/components/soc/kpi-card";
import { SeverityBadge } from "@/components/soc/severity-badge";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SENTINEL SOC" }] }),
  component: Dashboard,
});

type Alert = { id: string; title: string; severity: string; status: string; source: string | null; country: string | null; created_at: string };
type Asset = { id: string; hostname: string; online: boolean };
type Cve = { cve_id: string; title: string | null; severity: string | null; cvss: number | null; published_at: string | null; kev: boolean | null };

function Dashboard() {
  const { data: alerts = [] } = useQuery({
    queryKey: ["dash-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alerts")
        .select("id,title,severity,status,source,country,created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as Alert[];
    },
  });

  const { data: assets = [] } = useQuery({
    queryKey: ["dash-assets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("assets").select("id,hostname,online");
      if (error) throw error;
      return (data ?? []) as Asset[];
    },
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ["dash-incidents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("incidents").select("id,status,severity,title,created_at").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: cves = [] } = useQuery({
    queryKey: ["dash-cves"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cves").select("cve_id,title,severity,cvss,published_at,kev").order("published_at", { ascending: false }).limit(8);
      if (error) throw error;
      return (data ?? []) as Cve[];
    },
  });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayAlerts = alerts.filter((a) => new Date(a.created_at) >= today);
  const count = (s: string) => alerts.filter((a) => a.severity === s).length;
  const onlineAssets = assets.filter((a) => a.online).length;
  const activeIncidents = incidents.filter((i: { status: string }) => i.status !== "closed").length;
  const resolvedIncidents = incidents.filter((i: { status: string }) => i.status === "closed").length;
  const blockedIps = new Set(alerts.filter((a) => a.status === "resolved" && a.source).map((a) => a.source)).size;

  // Timeline last 24h
  const buckets: { hour: string; count: number; critical: number }[] = [];
  for (let i = 23; i >= 0; i--) {
    const d = new Date(); d.setMinutes(0, 0, 0); d.setHours(d.getHours() - i);
    const next = new Date(d); next.setHours(next.getHours() + 1);
    const inBucket = alerts.filter((a) => { const t = new Date(a.created_at); return t >= d && t < next; });
    buckets.push({
      hour: d.getHours().toString().padStart(2, "0") + ":00",
      count: inBucket.length,
      critical: inBucket.filter((a) => a.severity === "critical").length,
    });
  }

  // Top countries
  const countryCounts = alerts.reduce<Record<string, number>>((acc, a) => {
    if (a.country) acc[a.country] = (acc[a.country] ?? 0) + 1;
    return acc;
  }, {});
  const topCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([country, value]) => ({ country, value }));

  // Mock system health
  const cpu = 42 + Math.round(Math.sin(Date.now() / 60000) * 10);
  const ram = 67;
  const disk = 54;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Operations Dashboard</h1>
          <p className="text-sm text-muted-foreground">Live posture across detections, incidents, and assets.</p>
        </div>
        <span className="text-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Last sync · {new Date().toLocaleTimeString()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard index={0} label="Today's Threats" value={todayAlerts.length} icon={ShieldAlert} accent="primary" />
        <KpiCard index={1} label="Critical" value={count("critical")} icon={Siren} accent="critical" delta="+5" trend="up" />
        <KpiCard index={2} label="High" value={count("high")} icon={ShieldAlert} accent="high" />
        <KpiCard index={3} label="Medium" value={count("medium")} icon={Activity} accent="medium" />
        <KpiCard index={4} label="Low" value={count("low")} icon={Activity} accent="low" />
        <KpiCard index={5} label="Devices Online" value={`${onlineAssets}/${assets.length}`} icon={Server} accent="success" />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Blocked IPs" value={blockedIps} icon={Ban} accent="info" />
        <KpiCard label="Active Incidents" value={activeIncidents} icon={Siren} accent="critical" />
        <KpiCard label="Resolved" value={resolvedIncidents} icon={CheckCircle2} accent="success" />
        <KpiCard label="Top Country" value={topCountries[0]?.country ?? "—"} icon={Globe2} accent="info" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="glass rounded-xl p-4 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Attack Timeline · last 24h</h2>
            <span className="text-mono text-[11px] text-muted-foreground">events/hour</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={buckets}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--critical)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--critical)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} fill="url(#g1)" />
                <Area type="monotone" dataKey="critical" stroke="var(--critical)" strokeWidth={2} fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-xl p-4">
          <h2 className="mb-3 text-sm font-semibold">Top Attack Countries</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={topCountries} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis dataKey="country" type="category" stroke="var(--muted-foreground)" fontSize={11} width={70} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="value" fill="var(--chart-5)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass rounded-xl p-4 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold">Recent Alerts</h2>
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Severity</th>
                  <th className="px-3 py-2 text-left">Title</th>
                  <th className="px-3 py-2 text-left">Source</th>
                  <th className="px-3 py-2 text-left">Country</th>
                  <th className="px-3 py-2 text-right">When</th>
                </tr>
              </thead>
              <tbody>
                {alerts.slice(0, 8).map((a) => (
                  <tr key={a.id} className="border-t border-border/60 hover:bg-muted/30">
                    <td className="px-3 py-2"><SeverityBadge severity={a.severity} /></td>
                    <td className="px-3 py-2 font-medium">{a.title}</td>
                    <td className="px-3 py-2 text-mono text-xs text-muted-foreground">{a.source ?? "—"}</td>
                    <td className="px-3 py-2 text-xs">{a.country ?? "—"}</td>
                    <td className="px-3 py-2 text-right text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</td>
                  </tr>
                ))}
                {alerts.length === 0 && (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-sm text-muted-foreground">No alerts yet. Run seed in Settings.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass rounded-xl p-4">
          <h2 className="mb-3 text-sm font-semibold">System Health</h2>
          <HealthRow icon={Cpu} label="CPU" value={cpu} />
          <HealthRow icon={MemoryStick} label="RAM" value={ram} />
          <HealthRow icon={HardDrive} label="Disk" value={disk} />

          <h3 className="mb-2 mt-6 text-xs uppercase tracking-wider text-muted-foreground">Latest CVEs</h3>
          <ul className="space-y-2">
            {cves.slice(0, 6).map((c) => (
              <li key={c.cve_id} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <div className="text-mono text-xs text-primary">{c.cve_id}{c.kev && <span className="ml-2 rounded bg-critical/15 px-1.5 py-0.5 text-[10px] uppercase text-critical">KEV</span>}</div>
                  <div className="text-xs text-muted-foreground">{c.title}</div>
                </div>
                <span className="text-mono text-xs">{c.cvss ?? "—"}</span>
              </li>
            ))}
            {cves.length === 0 && <li className="text-xs text-muted-foreground">No CVEs.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

function HealthRow({ icon: Icon, label, value }: { icon: typeof Cpu; label: string; value: number }) {
  return (
    <div className="mb-3">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</span>
        <span className="text-mono tabular-nums">{value}%</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}