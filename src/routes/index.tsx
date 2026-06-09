import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  KanbanSquare,
  MessagesSquare,
  CalendarDays,
  LayoutDashboard,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Check,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";
import { BrandLogo } from "@/components/brand-logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hearth — Project management for modern teams" },
      {
        name: "description",
        content:
          "Hearth is a calm, warm workspace for teams — kanban boards, real-time chat, calendars, and collaboration without the chaos.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: KanbanSquare, title: "Kanban & lists", desc: "Drag cards between columns. Switch to list or calendar when you need a different view.", color: "bg-kanban-todo" },
  { icon: MessagesSquare, title: "Built-in chat", desc: "Every project has its own conversation thread. No more hunting through Slack.", color: "bg-kanban-progress" },
  { icon: CalendarDays, title: "Deadlines that stick", desc: "See what's due this week, this month, or way out on the horizon.", color: "bg-kanban-review" },
  { icon: LayoutDashboard, title: "Team pulse", desc: "Workload charts, activity feeds, and progress at a glance — no spreadsheet required.", color: "bg-kanban-done" },
  { icon: Sparkles, title: "Smart nudges", desc: "Get alerted when projects slip, tasks pile up, or deadlines sneak up on you.", color: "bg-accent" },
  { icon: ShieldCheck, title: "Roles & privacy", desc: "Admin, manager, member — everyone sees exactly what they should.", color: "bg-secondary" },
];

const plans = [
  { name: "Starter", price: "$0", tagline: "For small teams", features: ["Up to 5 members", "3 projects", "Kanban & lists", "Community support"] },
  { name: "Pro", price: "$12", tagline: "Per person / month", featured: true, features: ["Unlimited projects", "Real-time chat", "Smart alerts", "Calendar & files", "Priority support"] },
  { name: "Enterprise", price: "Custom", tagline: "For bigger orgs", features: ["SSO & SAML", "Advanced roles", "Audit logs", "Dedicated success"] },
];

const demoTasks = [
  { col: "To Do", color: "var(--color-kanban-todo)", items: ["User research plan", "API spec draft"] },
  { col: "In Progress", color: "var(--color-kanban-progress)", items: ["Design system v2", "Auth migration"] },
  { col: "Review", color: "var(--color-kanban-review)", items: ["QA sign-off"] },
  { col: "Done", color: "var(--color-kanban-done)", items: ["Sprint retro", "Deploy checklist", "Docs update"] },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background paper-texture">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <BrandLogo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full px-5 shadow-[var(--shadow-soft)]">
              <Link to="/auth">Get started free</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary/8 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-[300px] w-[300px] rounded-full bg-success/6 blur-3xl" />

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-16 lg:grid-cols-2 lg:gap-16 lg:pb-28 lg:pt-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
          >
            <span className="sticker gap-1.5 text-foreground/80">
              <Zap className="h-3.5 w-3.5 text-primary" />
              Less noise. More shipped work.
            </span>

            <h1 className="mt-7 font-display text-[2.75rem] font-semibold leading-[1.08] sm:text-5xl lg:text-[3.25rem]">
              Project management that feels{" "}
              <em className="not-italic text-primary">human</em>
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Hearth is the calm home for your team's work — boards, chat, calendars, and deadlines
              in one warm workspace. No clutter. No learning curve. Just get things done.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-12 rounded-full px-7 text-base shadow-[var(--shadow-card)]">
                <Link to="/auth">
                  Start for free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-7 text-base">
                <Link to="/auth">Sign in to your workspace</Link>
              </Button>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Free forever for small teams · No credit card needed
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-success/10" />
            <Card className="relative overflow-hidden rounded-2xl border-2 p-3 shadow-[var(--shadow-lift)]">
              <div className="mb-3 flex items-center gap-2 border-b border-border/60 pb-3">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-success/70" />
                <span className="ml-2 text-xs font-medium text-muted-foreground">Mobile App Redesign</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {demoTasks.map((col) => (
                  <div key={col.col} className="rounded-xl p-2" style={{ background: col.color }}>
                    <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                      {col.col}
                    </p>
                    <div className="space-y-1.5">
                      {col.items.map((item) => (
                        <div
                          key={item}
                          className="rounded-lg border border-foreground/5 bg-card p-2.5 shadow-[var(--shadow-soft)]"
                        >
                          <p className="text-[11px] font-medium leading-tight">{item}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                              medium
                            </span>
                            <div className="h-4 w-4 rounded-full bg-primary/30" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <section id="features" className="border-y border-border/60 bg-card/50 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Features</p>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              Everything you need.<br />Nothing you don't.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We built Hearth for teams who are tired of bloated tools. Simple, focused, and actually pleasant to use.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <Card className="group h-full gap-4 rounded-2xl border-2 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[var(--shadow-card)]">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${f.color}`}>
                    <f.icon className="h-5 w-5 text-foreground/80" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Pricing</p>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Straightforward pricing</h2>
            <p className="mt-3 text-muted-foreground">Start free. Pay when your team outgrows it.</p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {plans.map((p) => (
              <Card
                key={p.name}
                className={`relative gap-5 rounded-2xl border-2 p-8 transition-all ${
                  p.featured
                    ? "border-primary bg-primary/[0.03] shadow-[var(--shadow-lift)] lg:-translate-y-2"
                    : "hover:border-border"
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground shadow-[var(--shadow-soft)]">
                    Most popular
                  </span>
                )}
                <div>
                  <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
                </div>
                <p className="font-display text-5xl font-semibold tracking-tight">
                  {p.price}
                  {p.price !== "Custom" && p.price !== "$0" && (
                    <span className="text-base font-normal text-muted-foreground">/mo</span>
                  )}
                </p>
                <ul className="space-y-3 text-sm">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15">
                        <Check className="h-3 w-3 text-success" />
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={p.featured ? "default" : "outline"}
                  className="mt-2 w-full rounded-full"
                >
                  <Link to="/auth">Get started</Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-primary py-20 text-primary-foreground">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Ready to bring calm to your team's work?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-primary-foreground/80">
            Join teams who've ditched the chaos. Set up your workspace in under two minutes.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 h-12 rounded-full bg-primary-foreground px-8 text-base text-primary hover:bg-primary-foreground/90"
          >
            <Link to="/auth">
              Create your workspace <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-muted-foreground sm:flex-row">
          <BrandLogo size="sm" />
          <span>Built for teams that ship — not teams that sit in meetings.</span>
          <span>© {new Date().getFullYear()} Hearth</span>
        </div>
      </footer>
    </div>
  );
}
