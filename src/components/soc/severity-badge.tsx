import { parseSeverity, severityClasses, severityDot, type Severity } from "@/lib/severity";
import { cn } from "@/lib/utils";

export function SeverityBadge({ severity, className }: { severity: string | Severity; className?: string }) {
  const s = parseSeverity(typeof severity === "string" ? severity : severity);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider",
        severityClasses[s],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", severityDot[s], s === "critical" && "pulse-critical")} />
      {s}
    </span>
  );
}