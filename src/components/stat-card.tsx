import { motion } from "framer-motion";
import { type LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ICON_COLORS = [
  "bg-primary/12 text-primary",
  "bg-success/12 text-success",
  "bg-warning/15 text-warning-foreground",
  "bg-chart-4/15 text-chart-4",
];

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  index = 0,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; up: boolean };
  index?: number;
}) {
  const iconStyle = ICON_COLORS[index % ICON_COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <Card className="group flex flex-col gap-4 rounded-2xl border-2 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/15 hover:shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
              iconStyle,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <span className="font-display text-4xl font-semibold tabular-nums tracking-tight">
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold",
                trend.up ? "bg-success/12 text-success" : "bg-destructive/12 text-destructive",
              )}
            >
              {trend.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {trend.value}
            </span>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
