import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Activity, Bot, ShieldAlert, Globe2, Crosshair, Siren, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SENTINEL — AI-Powered Cybersecurity SOC Assistant" },
      { name: "description", content: "Enterprise SOC platform: real-time alerts, incident response, MITRE ATT&CK mapping, threat hunting (KQL/Sigma/YARA), and an AI Security Copilot." },
      { property: "og:title", content: "SENTINEL — AI-Powered SOC Assistant" },
      { property: "og:description", content: "24/7 AI Security Operations Center built for modern SOC teams." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: ShieldAlert, title: "Real-time Alerts", body: "Triaged, MITRE-mapped alerts with AI-generated summaries and risk scoring." },
  { icon: Crosshair, title: "Threat Hunting", body: "Hunt across logs with KQL, Sigma, YARA, and Splunk SPL — translated automatically." },
  { icon: Siren, title: "Incident Response", body: "Investigations, timelines, evidence and AI-written executive briefings." },
  { icon: Globe2, title: "Threat Intelligence", body: "Enriched IP/hash/domain lookups with actor, family, ASN, and KEV context." },
  { icon: Bot, title: "AI SOC Copilot", body: "Detection engineering, log explanation, IOC extraction, playbook generation." },
  { icon: Sparkles, title: "Executive Reports", body: "One-click reports for execs, auditors, and compliance teams." },
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-24 top-1/2 h-[28rem] w-[28rem] rounded-full bg-chart-5/15 blur-3xl" />
      </div>
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/15 text-primary glow-cyan">
            <Activity className="h-4 w-4" />
          </div>
          <span className="text-mono font-semibold tracking-wider">SENTINEL</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/auth"><Button variant="ghost">Sign in</Button></Link>
          <Link to="/auth"><Button>Launch SOC</Button></Link>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-10 md:pt-20">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
          <span className="text-mono inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-widest text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-critical" />
            24/7 AI Security Operations
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Your AI SOC, <br />
            <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-5 bg-clip-text text-transparent">
              already on shift.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            SENTINEL fuses SIEM-grade telemetry, MITRE ATT&amp;CK mapping, and an AI Security Copilot into one operations console — for analysts, incident responders, and CISOs.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/auth"><Button size="lg" className="gap-2">Enter SOC Console <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/auth"><Button size="lg" variant="outline">Create account</Button></Link>
          </div>
        </motion.div>
        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="glass rounded-xl p-5">
              <f.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
