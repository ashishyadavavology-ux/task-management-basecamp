import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { FolderKanban, CheckCircle2, Clock, Users, ArrowRight, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { ActivityFeed } from "@/components/activity-feed";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AvatarStack } from "@/components/user-avatar";
import { ProjectStatusBadge } from "@/components/badges";
import { projects, activities, events, userById, currentUserId } from "@/lib/mock-data";
import { useBoardStore } from "@/lib/board-store";
import { format } from "date-fns";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Hearth" }] }),
  component: Dashboard,
});

const completionData = [
  { week: "W1", done: 8 },
  { week: "W2", done: 12 },
  { week: "W3", done: 9 },
  { week: "W4", done: 16 },
  { week: "W5", done: 14 },
  { week: "W6", done: 21 },
];

function Dashboard() {
  const tasks = useBoardStore((s) => s.tasks);
  const me = userById(currentUserId)!;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;

  const workloadData = [
    { name: "To Do", value: tasks.filter((t) => t.status === "todo").length, color: "var(--color-chart-3)" },
    { name: "In Progress", value: inProgress, color: "var(--color-chart-1)" },
    { name: "Review", value: tasks.filter((t) => t.status === "review").length, color: "var(--color-chart-4)" },
    { name: "Done", value: doneCount, color: "var(--color-chart-2)" },
  ];

  return (
    <AppShell title="Dashboard">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-2xl font-semibold">Good to see you, {me.name.split(" ")[0]} 👋</h2>
          <p className="text-sm text-muted-foreground">Here's what's happening across your workspace today.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active projects" value={projects.filter((p) => p.status === "active").length} icon={FolderKanban} trend={{ value: "+2", up: true }} index={0} />
          <StatCard label="Tasks completed" value={doneCount} icon={CheckCircle2} trend={{ value: "+18%", up: true }} index={1} />
          <StatCard label="In progress" value={inProgress} icon={Clock} index={2} />
          <StatCard label="Team members" value={6} icon={Users} trend={{ value: "+1", up: true }} index={3} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
            <Card className="h-full p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Tasks completed</h3>
                  <p className="text-xs text-muted-foreground">Last 6 weeks</p>
                </div>
                <Badge variant="secondary" className="bg-success/15 text-success">Trending up</Badge>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={completionData} margin={{ left: -20, right: 8 }}>
                  <defs>
                    <linearGradient id="fillDone" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="done" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#fillDone)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="h-full p-5">
              <h3 className="mb-1 font-semibold">Workload</h3>
              <p className="mb-4 text-xs text-muted-foreground">Tasks by status</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={workloadData} margin={{ left: -20, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} interval={0} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "var(--color-muted)" }} contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {workloadData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Active projects</h3>
              <Link to="/projects" className="flex items-center gap-1 text-sm text-primary hover:underline">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.slice(0, 4).map((p) => (
                <Link key={p.id} to="/projects/$projectId" params={{ projectId: p.id }}>
                  <Card className="h-full gap-3 p-5 transition-shadow hover:shadow-[var(--shadow-card)]">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="h-3 w-3 rounded-full" style={{ background: p.color }} />
                        <span className="font-medium">{p.name}</span>
                      </div>
                      <ProjectStatusBadge status={p.status} />
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                    <div className="mt-auto space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{p.progress}%</span>
                      </div>
                      <Progress value={p.progress} className="h-1.5" />
                      <div className="flex items-center justify-between pt-1">
                        <AvatarStack users={p.memberIds.map(userById)} />
                        <span className="text-xs text-muted-foreground">Due {format(new Date(p.dueDate), "MMM d")}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-5">
              <h3 className="mb-4 font-semibold">Recent activity</h3>
              <ActivityFeed items={activities.slice(0, 5)} />
            </Card>

            <Card className="gap-3 p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">AI insight</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">API Platform v2</span> is at risk — 3 urgent tasks
                are due within 5 days. Consider reassigning load from Diego to Sam.
              </p>
            </Card>

            <Card className="p-5">
              <h3 className="mb-3 font-semibold">Upcoming deadlines</h3>
              <ul className="space-y-3">
                {events.filter((e) => e.type === "deadline").slice(0, 4).map((e) => (
                  <li key={e.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{e.title}</span>
                    <Badge variant="secondary">{format(new Date(e.date), "MMM d")}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
