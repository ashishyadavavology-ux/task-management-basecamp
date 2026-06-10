import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Send, Paperclip, FileText, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { EmojiPicker } from "@/components/emoji-picker";
import { MessageAttachment } from "@/components/message-attachment";
import { useAppData } from "@/hooks/use-app-data";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchDirectMessages,
  getChatAttachmentType,
  sendDirectMessage,
  uploadChatFile,
} from "@/lib/supabase/api";
import { supabase } from "@/integrations/supabase/client";
import type { DirectMessage, User } from "@/lib/types";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages — Basecamp" }] }),
  component: Messages,
});

function Messages() {
  const { team, workspace, me, userById } = useAppData();
  const { user } = useAuth();
  const peers = team.filter((u) => u.id !== me?.id);
  const [activePeer, setActivePeer] = useState<User | null>(peers[0] || null);
  const [list, setList] = useState<DirectMessage[]>([]);
  const [text, setText] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (peers.length && !activePeer) setActivePeer(peers[0]);
    if (activePeer && !peers.find((p) => p.id === activePeer.id)) setActivePeer(peers[0] || null);
  }, [peers, activePeer]);

  const loadMessages = useCallback(async () => {
    if (!workspace || !user || !activePeer) return;
    try {
      const msgs = await fetchDirectMessages(workspace.id, user.id, activePeer.id);
      setList(msgs);
    } catch {
      setList([]);
    }
  }, [workspace, user, activePeer]);

  useEffect(() => {
    if (!workspace || !activePeer) return;
    loadMessages();

    const channel = supabase
      .channel(`dm:${workspace.id}:${activePeer.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "direct_messages", filter: `workspace_id=eq.${workspace.id}` },
        () => loadMessages(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspace, activePeer, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [list]);

  const send = async () => {
    if ((!text.trim() && !pendingFile) || !workspace || !user || !activePeer || sending) return;
    setSending(true);
    try {
      let attachment: { url: string; name: string; type: "image" | "pdf" } | undefined;
      if (pendingFile) {
        attachment = await uploadChatFile(`dm-${workspace.id}`, user.id, pendingFile);
      }
      await sendDirectMessage(workspace.id, user.id, activePeer.id, text.trim(), attachment);
      setText("");
      setPendingFile(null);
      await loadMessages();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const renderMessage = (m: DirectMessage) => {
    const u = userById(m.senderId);
    const mine = m.senderId === user?.id;
    const asMessage = {
      id: m.id,
      projectId: "",
      userId: m.senderId,
      body: m.body,
      createdAt: m.createdAt,
      isPinned: m.isPinned,
      editedAt: m.editedAt,
      attachmentUrl: m.attachmentUrl,
      attachmentName: m.attachmentName,
      attachmentType: m.attachmentType,
    };

    return (
      <div key={m.id} className={`flex gap-2.5 ${mine ? "flex-row-reverse" : ""}`}>
        <UserAvatar user={u} size="sm" />
        <div className={`max-w-[70%] ${mine ? "text-right" : ""}`}>
          <div className={`flex items-baseline gap-2 ${mine ? "flex-row-reverse" : ""}`}>
            <span className="text-xs font-medium">{u?.name}</span>
            <span className="text-[10px] text-muted-foreground">{format(new Date(m.createdAt), "HH:mm")}</span>
          </div>
          {m.body && (
            <p className={`mt-1 inline-block rounded-2xl px-3.5 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {m.body}
            </p>
          )}
          <MessageAttachment message={asMessage} />
        </div>
      </div>
    );
  };

  return (
    <AppShell title="Messages">
      <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[260px_1fr]">
        <Card className="h-fit gap-1 rounded-2xl border-2 p-2">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Team members
          </p>
          {peers.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">No other members yet.</p>
          ) : (
            peers.map((u) => (
              <button
                key={u.id}
                onClick={() => setActivePeer(u)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${activePeer?.id === u.id ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`}
              >
                <UserAvatar user={u} size="sm" />
                <div className="min-w-0">
                  <p className="truncate font-medium">{u.firstName} {u.lastName}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
              </button>
            ))
          )}
        </Card>

        <Card className="flex h-[70vh] flex-col overflow-hidden rounded-2xl border-2 p-0 shadow-[var(--shadow-card)]">
          {activePeer ? (
            <>
              <div className="border-b px-5 py-3">
                <p className="font-medium">{activePeer.firstName} {activePeer.lastName}</p>
                <p className="text-xs text-muted-foreground">{activePeer.email}</p>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                {list.map(renderMessage)}
                <div ref={bottomRef} />
              </div>
              {pendingFile && (
                <div className="flex items-center gap-2 border-t bg-muted/40 px-3 py-2">
                  {getChatAttachmentType(pendingFile) === "image" ? (
                    <img src={URL.createObjectURL(pendingFile)} alt="Preview" className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-5 w-5 text-destructive" />
                    </div>
                  )}
                  <span className="flex-1 truncate text-sm">{pendingFile.name}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPendingFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-2 border-t p-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!getChatAttachmentType(file)) {
                      toast.error("Only images and PDF allowed");
                      return;
                    }
                    setPendingFile(file);
                    e.target.value = "";
                  }}
                />
                <Button type="button" variant="ghost" size="icon" className="shrink-0 rounded-full" onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="h-4 w-4" />
                </Button>
                <EmojiPicker onPick={(e) => setText((t) => t + e)} />
                <Input
                  placeholder="Write a message…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                />
                <Button size="icon" className="rounded-full" onClick={send} disabled={sending || (!text.trim() && !pendingFile)}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-muted-foreground">
              Select a team member to start chatting.
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
