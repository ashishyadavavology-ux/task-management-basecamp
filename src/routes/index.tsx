import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Flame,
  LayoutDashboard,
  KanbanSquare,
  MessagesSquare,
  CalendarDays,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hearth — Project management for modern teams" },
      {
        name: "description",
        content:
          "Hearth is a clean, fast project management workspace with kanban boards, real-time chat, calendars, and AI insights for high-performing teams.",
      },
      { property: "og:title", content: "Hearth — Project management for modern teams" },
      {
        property: "og:description",
        content: "Kanban boards, real-time collaboration, calendars and AI insights in one calm workspace.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: KanbanSquare, title: "Kanban & lists", desc: "Drag-and-drop boards, list and calendar views that stay in sync." },
  { icon: MessagesSquare, title: "Real-time chat", desc: "Project conversations, @mentions and activity timelines built in." },
  { icon: CalendarDays, title: "Calendar & deadlines", desc: "Plan sprints, schedule meetings and never miss a due date." },
  { icon: LayoutDashboard, title: "Insightful dashboards", desc: "Track progress, workload and team performance at a glance." },
  { icon: Sparkles, title: "AI insights", desc: "Auto-summaries, smart prioritization and productivity nudges." },
  { icon: ShieldCheck, title: "Roles & security", desc: "Admin, manager and member roles with row-level security." },
];

const plans = [
  { name: "Starter", price: "$0", tagline: "For small teams getting started", features: ["Up to 5 members", "3 projects", "Kanban & lists", "Community support"] },
  { name: "Pro", price: "$12", tagline: "Per user / month", featured: true, features: ["Unlimited projects", "Real-time chat", "AI insights", "Calendar & files", "Priority support"] },
  { name: "Enterprise", price: "Custom", tagline: "For organizations at scale", features: ["SSO & SAML", "Advanced roles", "Audit logs", "Dedicated success"] },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Flame className="h-4.5 w-4.5" />
            </div>
            <span className="font-display text-lg font-semibold">Hearth</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_14%,transparent),transparent)]" />
        <div className="mx-auto max-w-4xl px-4 pb-16 pt-20 text-center sm:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Now with AI project insights
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              The calm home for your team's work
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              Plan projects, run kanban boards, chat in real time and stay ahead of every deadline —
              all in one beautifully simple workspace.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/auth">
                  Start for free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/dashboard">View live demo</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-16"
          >
            <Card className="overflow-hidden p-2 shadow-[var(--shadow-card)]">
              <div className="grid grid-cols-4 gap-2 rounded-xl bg-muted/40 p-3 text-left">
                {["To Do", "In Progress", "Review", "Done"].map((col, ci) => (
                  <div key={col} className="space-y-2">
                    <p className="px-1 text-xs font-semibold text-muted-foreground">{col}</p>
                    {Array.from({ length: 3 - (ci % 2) }).map((_, i) => (
                      <div key={i} className="rounded-lg bg-card p-2.5 shadow-[var(--shadow-soft)]">
                        <div className="h-2 w-3/4 rounded bg-foreground/10" />
                        <div className="mt-2 flex items-center justify-between">
                          <div className="h-1.5 w-10 rounded bg-foreground/10" />
                          <div className="h-5 w-5 rounded-full bg-primary/30" />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Everything your team needs</h2>
          <p className="mt-3 text-muted-foreground">
            From idea to shipped — Hearth brings planning, execution and collaboration together.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <Card className="h-full gap-3 p-6 transition-shadow hover:shadow-[var(--shadow-card)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Simple, fair pricing</h2>
          <p className="mt-3 text-muted-foreground">Start free. Upgrade when your team grows.</p>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {plans.map((p) => (
            <Card
              key={p.name}
              className={`relative gap-5 p-7 ${p.featured ? "ring-2 ring-primary shadow-[var(--shadow-card)]" : ""}`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                  Most popular
                </span>
              )}
              <div>
                <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
              </div>
              <p className="font-display text-4xl font-semibold">{p.price}</p>
              <ul className="space-y-2.5 text-sm">
                {p.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" /> {feat}
                  </li>
                ))}
              </ul>
              <Button asChild variant={p.featured ? "default" : "outline"} className="w-full">
                <Link to="/auth">Get started</Link>
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary" />
            <span>Hearth © {new Date().getFullYear()}</span>
          </div>
          <span>Built for teams that ship.</span>
        </div>
      </footer>
    </div>
  );
}
