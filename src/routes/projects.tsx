import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { AppShell, PageHeaderAction } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AvatarStack } from "@/components/user-avatar";
import { ProjectStatusBadge, PriorityBadge } from "@/components/badges";
import { ProjectFormDialog } from "@/components/project-form-dialog";
import { useAppData } from "@/hooks/use-app-data";
import type { Project } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/projects")({
  head: () => ({ meta: [{ title: "Projects — Basecamp" }] }),
  component: Projects,
});

function Projects() {
  const { projects, userById, team, isOwner, createProject, updateProject, deleteProject } = useAppData();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  const handleNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (p: Project) => {
    setEditing(p);
    setFormOpen(true);
  };

  const handleSubmit = async (input: {
    name: string;
    description?: string;
    status?: Project["status"];
    priority?: Project["priority"];
    dueDate?: string;
    memberIds?: string[];
  }) => {
    if (editing) {
      await updateProject(editing.id, input);
    } else {
      await createProject(input);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    await deleteProject(deleting.id);
    setDeleting(null);
  };

  return (
    <AppShell
      title="Projects"
      action={isOwner ? <PageHeaderAction label="New project" onClick={handleNew} /> : undefined}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Workspace</p>
          <p className="mt-1 text-muted-foreground">{projects.length} projects</p>
        </div>
        {projects.length === 0 ? (
          <Card className="rounded-2xl border-2 border-dashed p-12 text-center">
            <p className="text-muted-foreground">
              {isOwner ? "No projects yet. Create your first one!" : "No projects assigned to you yet."}
            </p>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="relative h-full gap-3 rounded-2xl border-2 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/15 hover:shadow-[var(--shadow-card)]">
                  {isOwner && (
                    <div className="absolute right-3 top-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.preventDefault()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(p)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleting(p)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                  <Link to="/projects/$projectId" params={{ projectId: p.id }} className="block">
                    <div className="flex items-start justify-between pr-8">
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
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {isOwner && (
        <ProjectFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          project={editing}
          team={team}
          onSubmit={handleSubmit}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleting?.name}&quot; and all its tasks and messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
