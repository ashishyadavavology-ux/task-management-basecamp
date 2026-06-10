import { createFileRoute } from "@tanstack/react-router";
import { Mail, UserPlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/user-avatar";
import { useAppData } from "@/hooks/use-app-data";
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

export const Route = createFileRoute("/team")({
  head: () => ({ meta: [{ title: "Team — Basecamp" }] }),
  component: Team,
});

const roleColor: Record<string, string> = {
  admin: "bg-primary/15 text-primary",
  manager: "bg-accent text-accent-foreground",
  member: "bg-muted text-muted-foreground",
};

function Team() {
  const { team, workspace, isOwner, pendingInvites, inviteMember, removeMember } = useAppData();
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setInviting(true);
    try {
      await inviteMember(email.trim());
      setEmail("");
    } finally {
      setInviting(false);
    }
  };

  const confirmRemove = async () => {
    if (!removingId) return;
    await removeMember(removingId);
    setRemovingId(null);
  };

  return (
    <AppShell title="Team">
      <div className="mx-auto max-w-6xl space-y-6">
        <p className="text-sm text-muted-foreground">
          {team.length} members in {workspace?.name}.
          {isOwner && " You are the admin — add or remove team members."}
        </p>

        {isOwner && (
          <Card className="rounded-2xl border-2 p-5">
            <form onSubmit={handleInvite} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="invite-email">Add team member by email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="member@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="rounded-full" disabled={inviting}>
                <UserPlus className="mr-2 h-4 w-4" />
                {inviting ? "Adding…" : "Add member"}
              </Button>
            </form>
            {pendingInvites.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Pending sign up
                </p>
                <div className="flex flex-wrap gap-2">
                  {pendingInvites.map((inv) => (
                    <Badge key={inv.id} variant="secondary" className="font-normal">
                      {inv.email} — waiting for first sign up
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((u) => {
            const isWsOwner = u.id === workspace?.ownerId;
            return (
              <Card key={u.id} className="relative items-center gap-3 rounded-2xl border-2 p-6 text-center">
                {isOwner && !isWsOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8 text-destructive"
                    onClick={() => setRemovingId(u.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <UserAvatar user={u} size="lg" />
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-muted-foreground">{u.title || "Team member"}</p>
                </div>
                <Badge variant="secondary" className={`border-0 capitalize ${roleColor[u.role]}`}>
                  {isWsOwner ? "owner" : u.role}
                </Badge>
                {u.email && (
                  <a href={`mailto:${u.email}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                    <Mail className="h-3.5 w-3.5" /> {u.email}
                  </a>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      <AlertDialog open={!!removingId} onOpenChange={(o) => !o && setRemovingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>
              They will lose access to all projects in this workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
