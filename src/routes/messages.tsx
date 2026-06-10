import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Send, Pin, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { EmojiPicker } from "@/components/emoji-picker";
import { useAppData } from "@/hooks/use-app-data";
import { useAuth } from "@/hooks/use-auth";
import {
  deleteMessage,
  fetchMessages,
  sendMessage,
  toggleMessagePin,
  updateMessage,
} from "@/lib/supabase/api";
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/lib/types";
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

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages — Basecamp" }] }),
  component: Messages,
});

function Messages() {
  const { projects, userById } = useAppData();
  const { user } = useAuth();
  const [active, setActive] = useState(projects[0]?.id || "");
  const [list, setList] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async (projectId: string) => {
    try {
      const msgs = await fetchMessages(projectId);
      setList(msgs);
    } catch {
      setList([]);
    }
  }, []);

  useEffect(() => {
    if (projects.length && !active) setActive(projects[0].id);
  }, [projects, active]);

  useEffect(() => {
    if (!active) return;
    loadMessages(active);

    const channel = supabase
      .channel(`messages:${active}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `project_id=eq.${active}` },
        () => loadMessages(active),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [active, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [list]);

  const thread = list.filter((m) => m.projectId === active);
  const pinned = thread.filter((m) => m.isPinned);
  const regular = thread.filter((m) => !m.isPinned);

  const send = async () => {
    if (!text.trim() || !active || !user) return;
    try {
      await sendMessage(active, user.id, text.trim());
      setText("");
      await loadMessages(active);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send message");
    }
  };

  const startEdit = (m: Message) => {
    setEditingId(m.id);
    setEditText(m.body);
  };

  const saveEdit = async () => {
    if (!editingId || !editText.trim()) return;
    try {
      await updateMessage(editingId, editText.trim());
      setEditingId(null);
      setEditText("");
      await loadMessages(active);
      toast.success("Message updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update message");
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteMessage(deletingId);
      setDeletingId(null);
      await loadMessages(active);
      toast.success("Message deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete message");
    }
  };

  const handlePin = async (m: Message) => {
    try {
      await toggleMessagePin(m.id, !m.isPinned);
      await loadMessages(active);
      toast.success(m.isPinned ? "Message unpinned" : "Message pinned");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to pin message");
    }
  };

  const addEmoji = (emoji: string) => setText((t) => t + emoji);

  const renderMessage = (m: Message) => {
    const u = userById(m.userId);
    const mine = m.userId === user?.id;
    const isEditing = editingId === m.id;

    return (
      <div key={m.id} className={`group flex gap-2.5 ${mine ? "flex-row-reverse" : ""}`}>
        <UserAvatar user={u} size="sm" />
        <div className={`max-w-[70%] ${mine ? "text-right" : ""}`}>
          <div className={`flex items-baseline gap-2 ${mine ? "flex-row-reverse" : ""}`}>
            <span className="text-xs font-medium">{u?.name}</span>
            <span className="text-[10px] text-muted-foreground">
              {format(new Date(m.createdAt), "HH:mm")}
              {m.editedAt && " (edited)"}
            </span>
            {m.isPinned && <Pin className="h-3 w-3 text-primary" />}
          </div>
          {isEditing ? (
            <div className="mt-1 flex gap-2">
              <Input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                className="text-sm"
                autoFocus
              />
              <Button size="sm" onClick={saveEdit}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
            </div>
          ) : (
            <div className={`relative mt-1 inline-flex items-start gap-1 ${mine ? "flex-row-reverse" : ""}`}>
              <p className={`inline-block rounded-2xl px-3.5 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {m.body}
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={mine ? "end" : "start"}>
                  <DropdownMenuItem onClick={() => handlePin(m)}>
                    <Pin className="mr-2 h-4 w-4" />
                    {m.isPinned ? "Unpin" : "Pin message"}
                  </DropdownMenuItem>
                  {mine && (
                    <DropdownMenuItem onClick={() => startEdit(m)}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                  )}
                  {mine && (
                    <DropdownMenuItem className="text-destructive" onClick={() => setDeletingId(m.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AppShell title="Messages">
      <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[240px_1fr]">
        <Card className="h-fit gap-1 rounded-2xl border-2 p-2">
          {projects.map((p) => (
            <button key={p.id} onClick={() => setActive(p.id)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${active === p.id ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
              <span className="truncate">{p.name}</span>
            </button>
          ))}
        </Card>

        <Card className="flex h-[70vh] flex-col overflow-hidden rounded-2xl border-2 p-0 shadow-[var(--shadow-card)]">
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {pinned.length > 0 && (
              <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                  <Pin className="h-3.5 w-3.5" /> Pinned
                </p>
                {pinned.map(renderMessage)}
              </div>
            )}
            {regular.map(renderMessage)}
            <div ref={bottomRef} />
          </div>
          <div className="flex items-center gap-2 border-t p-3">
            <EmojiPicker onPick={addEmoji} />
            <Input
              placeholder="Write a message…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <Button size="icon" className="rounded-full" onClick={send} disabled={!text.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
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
