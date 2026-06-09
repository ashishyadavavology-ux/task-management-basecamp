import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My Supabase App" },
      { name: "description", content: "App connected to my own Supabase project." },
    ],
  }),
  component: Index,
});

function Index() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["supabase-health"],
    queryFn: async () => {
      const { error } = await supabase.auth.getSession();
      if (error) throw error;
      return true;
    },
  });

  const status = isLoading
    ? { label: "Checking connection…", tone: "muted" as const }
    : isError
      ? { label: "Connection failed", tone: "error" as const }
      : { label: "Connected to your Supabase", tone: "ok" as const };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">My Supabase App</h1>
        <p className="text-muted-foreground">Connected to your own project (not Lovable Cloud).</p>
      </div>

      <div
        className={
          "flex items-center gap-3 rounded-full border px-5 py-2.5 text-sm font-medium " +
          (status.tone === "ok"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
            : status.tone === "error"
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-border bg-muted text-muted-foreground")
        }
      >
        <span
          className={
            "h-2.5 w-2.5 rounded-full " +
            (status.tone === "ok"
              ? "bg-emerald-500"
              : status.tone === "error"
                ? "bg-destructive"
                : "bg-muted-foreground animate-pulse")
          }
        />
        {status.label}
      </div>

      <p className="max-w-md text-xs text-muted-foreground">
        Project: jvcfllhvjaymvubmkzki.supabase.co
      </p>
    </main>
  );
}
