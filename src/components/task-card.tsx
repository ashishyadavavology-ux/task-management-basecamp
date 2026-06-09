import { MessageSquare, Paperclip, CheckSquare, CalendarClock } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { PriorityBadge } from "@/components/badges";
import { UserAvatar } from "@/components/user-avatar";
import { userById } from "@/lib/mock-data";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TaskCard({ task, dragging }: { task: Task; dragging?: boolean }) {
  const assignee = userById(task.assigneeId);
  const doneSubtasks = task.subtasks.filter((s) => s.done).length;
  return (
    <Card
      className={cn(
        "cursor-grab gap-2.5 rounded-xl p-3.5 shadow-[var(--shadow-soft)] transition-all active:cursor-grabbing",
        dragging && "rotate-1 shadow-[var(--shadow-card)] ring-2 ring-primary/30",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug">{task.title}</p>
        <PriorityBadge priority={task.priority} className="shrink-0 text-[10px]" />
      </div>

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
          {task.subtasks.length > 0 && (
            <span className="flex items-center gap-1">
              <CheckSquare className="h-3.5 w-3.5" />
              {doneSubtasks}/{task.subtasks.length}
            </span>
          )}
          {task.commentCount > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {task.commentCount}
            </span>
          )}
          {task.attachmentCount > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="h-3.5 w-3.5" />
              {task.attachmentCount}
            </span>
          )}
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" />
              {format(new Date(task.dueDate), "MMM d")}
            </span>
          )}
        </div>
        <UserAvatar user={assignee} size="sm" />
      </div>
    </Card>
  );
}
