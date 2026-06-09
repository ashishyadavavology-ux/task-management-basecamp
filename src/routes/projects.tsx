import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { AppShell, PageHeaderAction } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AvatarStack } from "@/components/user-avatar";
import { ProjectStatusBadge, PriorityBadge } from "@/components/badges";
import { useAppData } from "@/hooks/use-app-data";

export const Route = createFileRoute("/projects")({
  head: () => ({ meta: [{ title: "Projects — Hearth" }] }),
  component: Projects,
});

function Projects() {
  const { projects, userById, createProject } = useAppData();

  const handleNew = () => {
    const name = window.prompt("Project name");
    if (name?.trim()) createProject({ name: name.trim() });
  };

  return (
    <AppShell title="Projects" action={<PageHeaderAction label="New project" onClick={handleNew} />}>
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Workspace</p>
          <p className="mt-1 text-muted-foreground">{projects.length} projects</p>
        </div>
        {projects.length === 0 ? (
          <Card className="rounded-2xl border-2 border-dashed p-12 text-center">
            <p className="text-muted-foreground">No projects yet. Create your first one!</p>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to="/projects/$projectId" params={{ projectId: p.id }}>
                  <Card className="h-full gap-3 rounded-2xl border-2 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/15 hover:shadow-[var(--shadow-card)]">
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
                        <AvatarStack users={p.memberIds.map((id) => userById(id))} />
                        {p.dueDate && (
                          <span className="text-xs text-muted-foreground">Due {format(new Date(p.dueDate), "MMM d")}</span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
