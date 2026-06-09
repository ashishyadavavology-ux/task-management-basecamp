import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, isSameMonth, isSameDay, parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/hooks/use-app-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Hearth" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  const { tasks } = useAppData();
  const [cursor, setCursor] = useState(new Date());
  const monthStart = startOfMonth(cursor);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(endOfMonth(cursor));
  const days: Date[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d);

  const events = tasks
    .filter((t) => t.dueDate)
    .map((t) => ({ id: t.id, title: t.title, date: t.dueDate! }));

  return (
    <AppShell title="Calendar">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">{format(cursor, "MMMM yyyy")}</h2>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => setCursor(addMonths(cursor, -1))}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => setCursor(addMonths(cursor, 1))}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
        <Card className="rounded-2xl border-2 p-3">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dayEvents = events.filter((e) => isSameDay(parseISO(e.date), day));
              return (
                <div key={day.toISOString()} className={cn(
                  "min-h-[92px] rounded-lg border p-1.5 text-left",
                  !isSameMonth(day, cursor) && "opacity-40",
                  isSameDay(day, new Date()) && "ring-2 ring-primary",
                )}>
                  <span className="text-xs text-muted-foreground">{format(day, "d")}</span>
                  <div className="mt-1 space-y-1">
                    {dayEvents.map((e) => (
                      <div key={e.id} className="truncate rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">{e.title}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
