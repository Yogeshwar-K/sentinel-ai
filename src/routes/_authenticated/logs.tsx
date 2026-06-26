import { createFileRoute } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/logs")({
  head: () => ({ meta: [{ title: "Log Management — SENTINEL SOC" }] }),
  component: () => (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Log Management</h1>
        <p className="text-sm text-muted-foreground">Upload Windows EVTX, Linux syslog, firewall, CSV/JSON — AI parser coming next.</p>
      </div>
      <div className="glass grid place-items-center rounded-xl p-12 text-center">
        <ScrollText className="h-10 w-10 text-primary" />
        <h3 className="mt-3 font-semibold">Drop logs here to ingest</h3>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">CSV · JSON · TXT · EVTX · Syslog. AI Log Analyzer auto-detects privilege escalation, brute force, SQLi, XSS, malware, exfil and maps to MITRE ATT&amp;CK.</p>
      </div>
    </div>
  ),
});