import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — SENTINEL SOC" }] }),
  component: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      </div>
      <p className="text-sm text-muted-foreground">Theme, MFA, API keys, AI models, integrations, profile.</p>
    </div>
  ),
});