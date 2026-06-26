export type Severity = "critical" | "high" | "medium" | "low" | "info";

export const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low", "info"];

export const severityClasses: Record<Severity, string> = {
  critical: "bg-critical/15 text-critical border-critical/40",
  high: "bg-high/15 text-high border-high/40",
  medium: "bg-medium/15 text-medium border-medium/40",
  low: "bg-low/15 text-low border-low/40",
  info: "bg-info/15 text-info border-info/40",
};

export const severityDot: Record<Severity, string> = {
  critical: "bg-critical",
  high: "bg-high",
  medium: "bg-medium",
  low: "bg-low",
  info: "bg-info",
};

export function parseSeverity(s: string | null | undefined): Severity {
  if (!s) return "info";
  const lower = s.toLowerCase();
  if (lower === "critical" || lower === "high" || lower === "medium" || lower === "low" || lower === "info") {
    return lower;
  }
  return "info";
}