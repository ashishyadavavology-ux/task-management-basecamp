import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, AtSign, CalendarClock, MessageSquare, UserPlus, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { notifications as seed } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Hearth" }] }),
  component: Notifications,
});

const icons = { assigned: UserPlus, mention: AtSign, deadline: CalendarClock, comment: MessageSquare, system: Bell };

function Notifications() {
  const [items, setItems] = useState(seed);
  const markAll = () => setItems((l) => l.map((n) => ({ ...n, read: true })));

  return (
    <AppShell title="Notifications" action={<Button size="sm" variant="outline" onClick={markAll}><Check className="h-4 w-4" />Mark all read</Button>}>
      <div className="mx-auto max-w-2xl space-y-2.5">
        {items.map((n) => {
          const Icon = icons[n.type];
          return (
            <Card key={n.id} className={cn("flex-row items-start gap-3 p-4", !n.read && "border-primary/30 bg-accent/30")}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground"><Icon className="h-4.5 w-4.5" /></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.body}</p>
                <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
              </div>
              {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
