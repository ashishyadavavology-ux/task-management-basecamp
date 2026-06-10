import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, Lock, User as UserIcon, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  supabase,
  formatAuthError,
  supabaseConfigError,
  isSupabaseConfigured,
} from "@/integrations/supabase/client";
import { BrandLogo } from "@/components/brand-logo";
import { AlertCircle } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Basecamp" },
      { name: "description", content: "Sign in or create your Basecamp Project Management account." },
    ],
  }),
  component: AuthPage,
});

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (error) return toast.error(formatAuthError(error.message));
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name },
        emailRedirectTo: window.location.origin + "/dashboard",
      },
    });
    setLoading(false);
    if (error) return toast.error(formatAuthError(error.message));
    if (data.session) {
      toast.success("Account created!");
      navigate({ to: "/dashboard" });
      return;
    }
    toast.success("Account created! Check your email to confirm, or ask admin to disable email confirmation in Supabase.");
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/dashboard" },
    });
    if (error) toast.error(formatAuthError(error.message));
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setLoading(false);
    if (error) return toast.error(formatAuthError(error.message));
    toast.success("Password reset link sent to your email.");
    setMode("signin");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div className="pointer-events-none absolute inset-0 paper-texture opacity-30" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

        <Link to="/" className="relative">
          <BrandLogo className="text-primary-foreground [&_div]:bg-primary-foreground [&_div]:text-primary [&_span]:text-primary-foreground" />
        </Link>

        <div className="relative space-y-6">
          <blockquote className="font-display text-4xl font-semibold leading-[1.15]">
            "Finally, a tool our team actually wants to open every morning."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 font-display font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-semibold">Ashis</p>
              <p className="text-sm text-primary-foreground/70">Basecamp Project Management</p>
            </div>
          </div>
        </div>

        <p className="relative text-sm text-primary-foreground/60">© {new Date().getFullYear()} Basecamp Project Management</p>
      </div>

      <div className="flex items-center justify-center bg-background p-6 paper-texture">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <BrandLogo />
          </div>

          {!isSupabaseConfigured && supabaseConfigError && (
            <div className="mb-4 flex gap-3 rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-4 text-sm">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">Supabase not configured</p>
                <p className="mt-1 text-muted-foreground">{supabaseConfigError}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Edit <code className="rounded bg-muted px-1">.env</code> in the project folder, then restart{" "}
                  <code className="rounded bg-muted px-1">npm run dev</code>.
                </p>
              </div>
            </div>
          )}

          {mode === "forgot" ? (
            <Card className="gap-5 rounded-2xl border-2 p-7">
              <button
                onClick={() => setMode("signin")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </button>
              <div>
                <h1 className="font-display text-2xl font-semibold">Reset password</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">We'll send a link to your email.</p>
              </div>
              <form onSubmit={handleForgot} className="space-y-4">
                <Field icon={Mail} type="email" placeholder="you@company.com" value={form.email} onChange={set("email")} label="Email" />
                <Button type="submit" className="w-full rounded-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />} Send reset link
                </Button>
              </form>
            </Card>
          ) : (
            <Card className="gap-5 rounded-2xl border-2 p-7 shadow-[var(--shadow-card)]">
              <div>
                <h1 className="font-display text-2xl font-semibold">Welcome back</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">Sign in or create your workspace.</p>
              </div>

              <Button variant="outline" className="w-full rounded-full border-2" onClick={handleGoogle}>
                <GoogleIcon /> Continue with Google
              </Button>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
              </div>

              <Tabs defaultValue="signin">
                <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted p-1">
                  <TabsTrigger value="signin" className="rounded-lg">Sign in</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-lg">Sign up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4 pt-3">
                    <Field icon={Mail} type="email" placeholder="you@company.com" value={form.email} onChange={set("email")} label="Email" />
                    <Field icon={Lock} type="password" placeholder="••••••••" value={form.password} onChange={set("password")} label="Password" />
                    <button type="button" onClick={() => setMode("forgot")} className="text-xs font-medium text-primary hover:underline">
                      Forgot password?
                    </button>
                    <Button type="submit" className="w-full rounded-full" disabled={loading}>
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4 pt-3">
                    <Field icon={UserIcon} type="text" placeholder="Your name" value={form.name} onChange={set("name")} label="Full name" />
                    <Field icon={Mail} type="email" placeholder="you@company.com" value={form.email} onChange={set("email")} label="Email" />
                    <Field icon={Lock} type="password" placeholder="At least 8 characters" value={form.password} onChange={set("password")} label="Password" />
                    <Button type="submit" className="w-full rounded-full" disabled={loading}>
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <p className="text-center text-xs text-muted-foreground">
                By signing up you get your own workspace with projects &amp; tasks.
              </p>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  ...props
}: { icon: typeof Mail; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="h-11 rounded-xl border-2 pl-10" required {...props} />
      </div>
    </div>
  );
}
