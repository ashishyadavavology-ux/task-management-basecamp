import { createFileRoute } from "@tanstack/react-router";
import { Bell, AtSign, CalendarClock, MessageSquare, UserPlus, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/hooks/use-app-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Basecamp" }] }),
  component: Notifications,
});

const icons = { assigned: UserPlus, mention: AtSign, deadline: CalendarClock, comment: MessageSquare, system: Bell };

function Notifications() {
  const { notifications, markAllNotificationsRead } = useAppData();

  return (
    <AppShell
      title="Notifications"
      action={
        <Button size="sm" variant="outline" className="rounded-full" onClick={markAllNotificationsRead}>
          <Check className="h-4 w-4" />Mark all read
        </Button>
      }
    >
      <div className="mx-auto max-w-2xl space-y-2.5">
        {notifications.length === 0 ? (
          <Card className="rounded-2xl border-2 p-8 text-center text-muted-foreground">No notifications yet.</Card>
        ) : (
          notifications.map((n) => {
            const Icon = icons[n.type] || Bell;
            return (
              <Card key={n.id} className={cn("flex-row items-start gap-3 rounded-2xl border-2 p-4 transition-all hover:shadow-[var(--shadow-soft)]", !n.read && "border-primary/25 bg-primary/[0.04]")}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground"><Icon className="h-4.5 w-4.5" /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                </div>
                {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </Card>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
