import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { format } from "date-fns";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { useAppData } from "@/hooks/use-app-data";
import { useAuth } from "@/hooks/use-auth";
import { fetchMessages } from "@/lib/supabase/api";
import type { Message } from "@/lib/types";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages — Hearth" }] }),
  component: Messages,
});

function Messages() {
  const { projects, userById, sendProjectMessage } = useAppData();
  const { user } = useAuth();
  const [active, setActive] = useState(projects[0]?.id || "");
  const [list, setList] = useState<Message[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (projects.length && !active) setActive(projects[0].id);
  }, [projects, active]);

  useEffect(() => {
    if (!active) return;
    fetchMessages(active).then(setList).catch(() => setList([]));
  }, [active]);

  const thread = list.filter((m) => m.projectId === active);

  const send = async () => {
    if (!text.trim() || !active || !user) return;
    const msg = await sendProjectMessage(active, text.trim());
    setList((l) => [...l, { id: crypto.randomUUID(), projectId: active, userId: user.id, body: text.trim(), createdAt: new Date().toISOString() }]);
    setText("");
    void msg;
    fetchMessages(active).then(setList);
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
            {thread.map((m) => {
              const u = userById(m.userId);
              const mine = m.userId === user?.id;
              return (
                <div key={m.id} className={`flex gap-2.5 ${mine ? "flex-row-reverse" : ""}`}>
                  <UserAvatar user={u} size="sm" />
                  <div className={`max-w-[70%] ${mine ? "text-right" : ""}`}>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium">{u?.name}</span>
                      <span className="text-[10px] text-muted-foreground">{format(new Date(m.createdAt), "HH:mm")}</span>
                    </div>
                    <p className={`mt-1 inline-block rounded-2xl px-3.5 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{m.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 border-t p-3">
            <Input placeholder="Write a message…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
            <Button size="icon" className="rounded-full" onClick={send}><Send className="h-4 w-4" /></Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
