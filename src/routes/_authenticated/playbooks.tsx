import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpenCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/playbooks")({
  head: () => ({ meta: [{ title: "Playbooks — SENTINEL SOC" }] }),
  component: PlaybooksPage,
});

function PlaybooksPage() {
  const { data = [] } = useQuery({
    queryKey: ["playbooks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("playbooks").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Playbooks</h1>
        <p className="text-sm text-muted-foreground">Standard operating procedures for SOC responders.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {data.map((p) => {
          const steps = Array.isArray(p.steps) ? (p.steps as Array<{ step: string }>) : [];
          return (
            <div key={p.id} className="glass rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-md bg-primary/15 text-primary"><BookOpenCheck className="h-4 w-4" /></div>
                <div>
                  <div className="text-mono text-[11px] uppercase tracking-widest text-muted-foreground">{p.category}</div>
                  <h3 className="font-semibold">{p.title}</h3>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
              <ol className="mt-3 space-y-1.5 text-sm">
                {steps.map((s, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-mono w-6 shrink-0 text-primary">{(idx + 1).toString().padStart(2, "0")}</span>
                    <span>{s.step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-3 flex flex-wrap gap-1">
                {(p.mitre_techniques ?? []).map((t: string) => (
                  <span key={t} className="text-mono rounded bg-secondary/60 px-1.5 py-0.5 text-[10px]">{t}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}