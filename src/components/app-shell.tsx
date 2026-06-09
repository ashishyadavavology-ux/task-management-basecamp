import type { ReactNode } from "react";
import { Search, Plus } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AppShell({
  children,
  title,
  action,
}: {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            {title && <h1 className="font-display text-base font-semibold">{title}</h1>}
            <div className="relative ml-auto hidden max-w-xs flex-1 md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search…" className="pl-9" />
            </div>
            <div className="ml-auto flex items-center gap-1.5 md:ml-0">
              {action}
              <ModeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export function PageHeaderAction({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <Button size="sm" onClick={onClick}>
      <Plus className="h-4 w-4" /> {label}
    </Button>
  );
}
