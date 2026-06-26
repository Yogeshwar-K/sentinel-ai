import { createFileRoute } from "@tanstack/react-router";
import { FileBarChart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports — SENTINEL SOC" }] }),
  component: () => (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {["Executive", "Technical", "SOC Weekly", "Incident", "Compliance"].map((t) => (
          <div key={t} className="glass rounded-xl p-4">
            <FileBarChart className="h-5 w-5 text-primary" />
            <h3 className="mt-2 font-semibold">{t} Report</h3>
            <p className="mt-1 text-sm text-muted-foreground">Generate a {t.toLowerCase()} report — PDF · CSV · Excel.</p>
          </div>
        ))}
      </div>
    </div>
  ),
});