import type { ReactNode } from "react";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Plus } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useAppData } from "@/hooks/use-app-data";

export function AppShell({
  children,
  title,
  action,
  requireAuth = true,
}: {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
  requireAuth?: boolean;
}) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { loading: dataLoading } = useAppData();

  useEffect(() => {
    if (requireAuth && !authLoading && !user) {
      navigate({ to: "/auth" });
    }
  }, [requireAuth, authLoading, user, navigate]);

  if (requireAuth && (authLoading || dataLoading || !user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-sm text-muted-foreground">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background paper-texture">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-[3.75rem] items-center gap-3 border-b-2 border-border/60 bg-background/90 px-4 backdrop-blur-md sm:px-6">
            <SidebarTrigger className="rounded-lg" />
            {title && (
              <h1 className="font-display text-lg font-semibold tracking-tight">{title}</h1>
            )}
            <div className="relative ml-auto hidden max-w-sm flex-1 md:block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects, tasks, people…"
                className="h-10 rounded-full border-2 bg-card pl-10"
              />
            </div>
            <div className="ml-auto flex items-center gap-2 md:ml-0">
              {action}
              <ModeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export function PageHeaderAction({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <Button size="sm" onClick={onClick} className="rounded-full shadow-[var(--shadow-soft)]">
      <Plus className="h-4 w-4" /> {label}
    </Button>
  );
}
