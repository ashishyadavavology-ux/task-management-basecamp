import { createFileRoute } from "@tanstack/react-router";
import { Users, FolderKanban, Activity, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { users, projects, workspace } from "@/lib/mock-data";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — Hearth" }] }),
  component: Admin,
});

const roleColor: Record<string, string> = {
  admin: "bg-primary/15 text-primary",
  manager: "bg-accent text-accent-foreground",
  member: "bg-muted text-muted-foreground",
};

function Admin() {
  return (
    <AppShell title="Admin Panel">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total users" value={users.length} icon={Users} index={0} />
          <StatCard label="Projects" value={projects.length} icon={FolderKanban} index={1} />
          <StatCard label="Workspace plan" value={workspace.plan} icon={ShieldCheck} index={2} />
          <StatCard label="Active sessions" value={4} icon={Activity} index={3} />
        </div>

        <Card className="p-0">
          <div className="flex items-center justify-between p-5">
            <h3 className="font-semibold">Manage users</h3>
            <Button size="sm" variant="outline">Export</Button>
          </div>
          <div className="divide-y">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <UserAvatar user={u} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className={`border-0 capitalize ${roleColor[u.role]}`}>{u.role}</Badge>
                  <Button size="sm" variant="ghost">Manage</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
