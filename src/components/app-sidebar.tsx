import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  Users,
  MessageSquare,
  Bell,
  Settings,
  Shield,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { UserAvatar } from "@/components/user-avatar";
import { BrandLogo } from "@/components/brand-logo";
import { useAppData } from "@/hooks/use-app-data";
import { useAuth } from "@/hooks/use-auth";

const mainNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Calendar", url: "/calendar", icon: CalendarDays },
  { title: "Team", url: "/team", icon: Users },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

const settingsNav = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Admin Panel", url: "/admin", icon: Shield },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { me, workspace, isOwner } = useAppData();
  const { signOut } = useAuth();
  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon" className="border-r-2 border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link to="/dashboard" className="block px-1 py-0.5">
          <BrandLogo size="sm" />
          <p className="mt-2 truncate px-1 text-[11px] font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
            {workspace?.name || "Workspace"}
          </p>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="rounded-xl font-medium data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:shadow-none"
                  >
                    <Link to={item.url}>
                      <item.icon className={isActive(item.url) ? "text-primary" : ""} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Manage
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNav
                .filter((item) => item.url !== "/admin" || isOwner)
                .map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="rounded-xl font-medium"
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Sign out"
                  className="rounded-xl font-medium text-destructive hover:text-destructive"
                  onClick={async () => {
                    await signOut();
                    navigate({ to: "/auth" });
                  }}
                >
                  <LogOut />
                  <span>Sign out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <Link
          to="/settings"
          className="flex items-center gap-3 rounded-xl border-2 border-transparent p-2.5 transition-colors hover:border-border hover:bg-sidebar-accent"
        >
          <UserAvatar user={me} size="sm" />
          <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold">{me?.name}</span>
            <span className="truncate text-xs capitalize text-muted-foreground">
              {isOwner ? "owner · admin" : me?.role}
            </span>
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
