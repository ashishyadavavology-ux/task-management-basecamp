import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { UserAvatar } from "@/components/user-avatar";
import { userById, currentUserId, workspace } from "@/lib/mock-data";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Hearth" }] }),
  component: Settings,
});

function Settings() {
  const me = userById(currentUserId)!;
  return (
    <AppShell title="Settings">
      <div className="mx-auto max-w-3xl space-y-6">
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="workspace">Workspace</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <Card className="gap-5 p-6">
              <div className="flex items-center gap-4">
                <UserAvatar user={me} size="lg" />
                <Button variant="outline" size="sm">Change photo</Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Full name</Label><Input defaultValue={me.name} /></div>
                <div className="space-y-1.5"><Label>Title</Label><Input defaultValue={me.title} /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Email</Label><Input defaultValue={me.email} type="email" /></div>
              </div>
              <Button className="w-fit" onClick={() => toast.success("Profile saved")}>Save changes</Button>
            </Card>
          </TabsContent>

          <TabsContent value="workspace" className="mt-4">
            <Card className="gap-5 p-6">
              <div className="space-y-1.5"><Label>Workspace name</Label><Input defaultValue={workspace.name} /></div>
              <div className="space-y-1.5"><Label>Plan</Label><Input defaultValue={workspace.plan} disabled /></div>
              <Button className="w-fit" onClick={() => toast.success("Workspace updated")}>Save</Button>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-4">
            <Card className="gap-1 p-6">
              {["Task assigned to me", "Mentions", "Deadline reminders", "Weekly digest email"].map((label, i) => (
                <div key={label} className="flex items-center justify-between border-b py-3 last:border-0">
                  <span className="text-sm">{label}</span>
                  <Switch defaultChecked={i < 3} />
                </div>
              ))}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
