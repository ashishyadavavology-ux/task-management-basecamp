import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { AppShell, PageHeaderAction } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/user-avatar";
import { users } from "@/lib/mock-data";

export const Route = createFileRoute("/team")({
  head: () => ({ meta: [{ title: "Team — Hearth" }] }),
  component: Team,
});

const roleColor: Record<string, string> = {
  admin: "bg-primary/15 text-primary",
  manager: "bg-accent text-accent-foreground",
  member: "bg-muted text-muted-foreground",
};

function Team() {
  return (
    <AppShell title="Team" action={<PageHeaderAction label="Invite member" />}>
      <div className="mx-auto max-w-6xl space-y-6">
        <p className="text-sm text-muted-foreground">{users.length} members in Northwind Studio.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <Card key={u.id} className="items-center gap-3 p-6 text-center">
              <UserAvatar user={u} size="lg" />
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-sm text-muted-foreground">{u.title}</p>
              </div>
              <Badge variant="secondary" className={`border-0 capitalize ${roleColor[u.role]}`}>{u.role}</Badge>
              <a href={`mailto:${u.email}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <Mail className="h-3.5 w-3.5" /> {u.email}
              </a>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
