import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, LayoutGrid, List, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { AppShell, PageHeaderAction } from "@/components/app-shell";
import { KanbanBoard } from "@/components/kanban-board";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AvatarStack, UserAvatar } from "@/components/user-avatar";
import { ProjectStatusBadge, PriorityBadge } from "@/components/badges";
import { projectById, userById } from "@/lib/mock-data";
import { useBoardStore } from "@/lib/board-store";

export const Route = createFileRoute("/projects/$projectId")({
  head: () => ({ meta: [{ title: "Board — Hearth" }] }),
  loader: ({ params }) => {
    const project = projectById(params.projectId);
    if (!project) throw notFound();
    return { project };
  },
  component: ProjectDetail,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-sm text-muted-foreground">{error.message}</div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-center">
      <p className="text-sm text-muted-foreground">Project not found.</p>
      <Link to="/projects" className="text-primary hover:underline">Back to projects</Link>
    </div>
  ),
});

function ProjectDetail() {
  const { project } = Route.useLoaderData();
  const tasks = useBoardStore((s) => s.tasks).filter((t) => t.projectId === project.id);

  return (
    <AppShell action={<PageHeaderAction label="Add task" />}>
      <div className="mx-auto max-w-7xl space-y-5">
        <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Projects
        </Link>

        <Card className="gap-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full" style={{ background: project.color }} />
              <h1 className="font-display text-2xl font-semibold">{project.name}</h1>
              <ProjectStatusBadge status={project.status} />
              <PriorityBadge priority={project.priority} />
            </div>
            <div className="flex items-center gap-3">
              <AvatarStack users={project.memberIds.map(userById)} size="md" />
              <span className="text-sm text-muted-foreground">Due {format(new Date(project.dueDate), "MMM d, yyyy")}</span>
            </div>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">{project.description}</p>
          <div className="max-w-md space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground"><span>Progress</span><span>{project.progress}%</span></div>
            <Progress value={project.progress} className="h-2" />
          </div>
        </Card>

        <Tabs defaultValue="board">
          <TabsList>
            <TabsTrigger value="board"><LayoutGrid className="mr-1.5 h-4 w-4" />Board</TabsTrigger>
            <TabsTrigger value="list"><List className="mr-1.5 h-4 w-4" />List</TabsTrigger>
            <TabsTrigger value="calendar"><CalendarDays className="mr-1.5 h-4 w-4" />Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="mt-4">
            <KanbanBoard projectId={project.id} />
          </TabsContent>

          <TabsContent value="list" className="mt-4">
            <Card className="divide-y p-0">
              {tasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="text-xs capitalize text-muted-foreground">{t.status.replace("_", " ")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <PriorityBadge priority={t.priority} />
                    {t.dueDate && <span className="text-xs text-muted-foreground">{format(new Date(t.dueDate), "MMM d")}</span>}
                    <UserAvatar user={userById(t.assigneeId)} size="sm" />
                  </div>
                </div>
              ))}
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="mt-4">
            <Card className="p-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tasks.filter((t) => t.dueDate).map((t) => (
                  <div key={t.id} className="rounded-lg border p-3">
                    <p className="text-xs font-medium text-primary">{format(new Date(t.dueDate!), "EEE, MMM d")}</p>
                    <p className="mt-1 text-sm">{t.title}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
