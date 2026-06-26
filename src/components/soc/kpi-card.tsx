import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: number | string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  icon: LucideIcon;
  accent?: "primary" | "critical" | "high" | "medium" | "low" | "info" | "success";
  index?: number;
}

const accentMap = {
  primary: "text-primary",
  critical: "text-critical",
  high: "text-high",
  medium: "text-medium",
  low: "text-low",
  info: "text-info",
  success: "text-success",
} as const;

export function KpiCard({ label, value, delta, trend, icon: Icon, accent = "primary", index = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: "easeOut" }}
      className="glass relative overflow-hidden rounded-xl p-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className={cn("h-4 w-4", accentMap[accent])} />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-mono text-3xl font-semibold tabular-nums">{value}</span>
        {delta && (
          <span
            className={cn(
              "text-xs font-medium",
              trend === "up" && "text-critical",
              trend === "down" && "text-success",
              trend === "flat" && "text-muted-foreground",
            )}
          >
            {delta}
          </span>
        )}
      </div>
      <div
        aria-hidden
        className={cn("absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-40", accentMap[accent])}
      />
    </motion.div>
  );
}