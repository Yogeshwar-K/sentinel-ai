import { createFileRoute } from "@tanstack/react-router";
import { Crosshair } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/threat-hunting")({
  head: () => ({ meta: [{ title: "Threat Hunting — SENTINEL SOC" }] }),
  component: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Crosshair className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold tracking-tight">Threat Hunting</h1>
      </div>
      <p className="text-sm text-muted-foreground">Run KQL, Sigma, YARA, Splunk SPL, or Elastic queries against your data plane.</p>
      <Textarea className="text-mono min-h-[200px]" placeholder="SecurityEvent | where EventID == 4625 | summarize count() by Account" />
      <p className="text-xs text-muted-foreground">Execution engine wires into your SIEM connector — configure in Settings.</p>
    </div>
  ),
});