import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { AppShell, PageHeaderAction } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AvatarStack } from "@/components/user-avatar";
import { ProjectStatusBadge, PriorityBadge } from "@/components/badges";
import { projects, userById } from "@/lib/mock-data";

export const Route = createFileRoute("/projects")({
  head: () => ({ meta: [{ title: "Projects — Hearth" }] }),
  component: Projects,
});

function Projects() {
  return (
    <AppShell title="Projects" action={<PageHeaderAction label="New project" />}>
      <div className="mx-auto max-w-7xl space-y-6">
        <p className="text-sm text-muted-foreground">{projects.length} projects in your workspace.</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to="/projects/$projectId" params={{ projectId: p.id }}>
                <Card className="h-full gap-3 p-5 transition-shadow hover:shadow-[var(--shadow-card)]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="h-3 w-3 rounded-full" style={{ background: p.color }} />
                      <span className="font-medium">{p.name}</span>
                    </div>
                    <ProjectStatusBadge status={p.status} />
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <PriorityBadge priority={p.priority} />
                    {p.tags.map((t) => (
                      <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">#{t}</span>
                    ))}
                  </div>
                  <div className="mt-auto space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progress</span><span>{p.progress}%</span>
                    </div>
                    <Progress value={p.progress} className="h-1.5" />
                    <div className="flex items-center justify-between pt-1">
                      <AvatarStack users={p.memberIds.map(userById)} />
                      <span className="text-xs text-muted-foreground">Due {format(new Date(p.dueDate), "MMM d")}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
