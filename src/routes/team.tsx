import { createFileRoute } from "@tanstack/react-router";
import { Mail, Pencil, Phone, UserPlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { MemberFormDialog } from "@/components/member-form-dialog";
import { useAppData } from "@/hooks/use-app-data";
import type { User } from "@/lib/types";
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
  const { team, workspace, isOwner, addMember, editMember, removeMember } = useAppData();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (u: User) => {
    setEditing(u);
    setFormOpen(true);
  };

  const handleSubmit = async (input: Parameters<typeof addMember>[0]) => {
    if (editing) await editMember(editing.id, input);
    else await addMember(input);
  };

  const confirmRemove = async () => {
    if (!removingId) return;
    await removeMember(removingId);
    setRemovingId(null);
  };

  return (
    <AppShell
      title="Team"
      action={
        isOwner ? (
          <Button className="rounded-full" onClick={handleAdd}>
            <UserPlus className="mr-2 h-4 w-4" /> Add member
          </Button>
        ) : undefined
      }
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <p className="text-sm text-muted-foreground">
          {team.length} members in {workspace?.name}.
          {isOwner && " Add members with name, email, password & mobile — they sign in to their own dashboard."}
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((u) => {
            const isWsOwner = u.id === workspace?.ownerId;
            return (
              <Card key={u.id} className="relative items-center gap-3 rounded-2xl border-2 p-6 text-center">
                {isOwner && !isWsOwner && (
                  <div className="absolute right-2 top-2 flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(u)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setRemovingId(u.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <UserAvatar user={u} size="lg" />
                <div>
                  <p className="font-medium">{u.firstName} {u.lastName}</p>
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
                {u.phone && (
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> {u.phone}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {isOwner && (
        <MemberFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          member={editing}
          onSubmit={handleSubmit}
        />
      )}

      <AlertDialog open={!!removingId} onOpenChange={(o) => !o && setRemovingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete member?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes their account and access to all projects and messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
