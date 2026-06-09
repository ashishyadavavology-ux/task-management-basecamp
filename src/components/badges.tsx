import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRIORITY_META, STATUS_META, type Priority, type ProjectStatus } from "@/lib/types";

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const meta = PRIORITY_META[priority];
  return (
    <Badge variant="secondary" className={cn("border-0 font-medium", meta.className, className)}>
      {meta.label}
    </Badge>
  );
}

export function ProjectStatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <Badge variant="secondary" className={cn("border-0 font-medium", meta.className, className)}>
      {meta.label}
    </Badge>
  );
}
