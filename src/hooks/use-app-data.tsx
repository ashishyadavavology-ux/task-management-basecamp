import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type {
  Activity,
  Notification,
  Priority,
  Project,
  ProjectStatus,
  Task,
  TaskStatus,
  User,
} from "@/lib/types";
import {
  createProject,
  createTask,
  deleteProject,
  fetchPendingInvites,
  fetchWorkspaceData,
  inviteTeamMember,
  markNotificationsRead,
  removeTeamMember,
  sendMessage,
  updateProfile,
  updateProject,
  updateTaskInDb,
} from "@/lib/supabase/api";
import { useAuth } from "./use-auth";
import { useBoardStore } from "@/lib/board-store";

type Workspace = { id: string; name: string; plan: string; memberCount: number; ownerId: string };

type AppDataContextValue = {
  loading: boolean;
  workspace: Workspace | null;
  me: User | null;
  isOwner: boolean;
  team: User[];
  pendingInvites: { id: string; email: string; created_at: string }[];
  projects: Project[];
  tasks: Task[];
  activities: Activity[];
  notifications: Notification[];
  userById: (id: string | null) => User | undefined;
  refresh: () => Promise<void>;
  createProject: (input: {
    name: string;
    description?: string;
    status?: ProjectStatus;
    priority?: Priority;
    dueDate?: string;
    memberIds?: string[];
  }) => Promise<void>;
  updateProject: (
    projectId: string,
    input: {
      name?: string;
      description?: string;
      status?: ProjectStatus;
      priority?: Priority;
      dueDate?: string | null;
      memberIds?: string[];
    },
  ) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  inviteMember: (email: string) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  createTask: (projectId: string, title: string) => Promise<void>;
  moveTask: (taskId: string, toStatus: TaskStatus, toIndex: number) => Promise<void>;
  sendProjectMessage: (projectId: string, body: string) => Promise<void>;
  saveProfile: (patch: { full_name?: string; title?: string }) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [me, setMe] = useState<User | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [team, setTeam] = useState<User[]>([]);
  const [pendingInvites, setPendingInvites] = useState<{ id: string; email: string; created_at: string }[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const setBoardTasks = useBoardStore((s) => s.setTasks);
  const boardMoveTask = useBoardStore((s) => s.moveTask);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchWorkspaceData(user.id);
      setWorkspace(data.workspace);
      setMe(data.me);
      setIsOwner(data.isOwner);
      setTeam(data.team);
      setProjects(data.projects);
      setTasks(data.tasks);
      setActivities(data.activities);
      setNotifications(data.notifications);
      setBoardTasks(data.tasks);

      if (data.isOwner) {
        const invites = await fetchPendingInvites(data.workspace.id);
        setPendingInvites(invites);
      } else {
        setPendingInvites([]);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load workspace");
    } finally {
      setLoading(false);
    }
  }, [user, setBoardTasks]);

  useEffect(() => {
    if (authLoading) return;
    if (user) refresh();
    else {
      setWorkspace(null);
      setMe(null);
      setIsOwner(false);
      setTeam([]);
      setPendingInvites([]);
      setProjects([]);
      setTasks([]);
      setBoardTasks([]);
    }
  }, [user, authLoading, refresh, setBoardTasks]);

  const userById = useCallback(
    (id: string | null) => (id ? team.find((u) => u.id === id) : undefined),
    [team],
  );

  const handleCreateProject = async (input: {
    name: string;
    description?: string;
    status?: ProjectStatus;
    priority?: Priority;
    dueDate?: string;
    memberIds?: string[];
  }) => {
    if (!user || !workspace) return;
    const project = await createProject(workspace.id, user.id, input);
    setProjects((p) => [project, ...p]);
    toast.success("Project created");
  };

  const handleUpdateProject = async (
    projectId: string,
    input: {
      name?: string;
      description?: string;
      status?: ProjectStatus;
      priority?: Priority;
      dueDate?: string | null;
      memberIds?: string[];
    },
  ) => {
    await updateProject(projectId, input);
    await refresh();
    toast.success("Project updated");
  };

  const handleDeleteProject = async (projectId: string) => {
    await deleteProject(projectId);
    setProjects((p) => p.filter((x) => x.id !== projectId));
    setTasks((t) => t.filter((x) => x.projectId !== projectId));
    toast.success("Project deleted");
  };

  const handleInviteMember = async (email: string) => {
    if (!user || !workspace) return;
    const result = await inviteTeamMember(workspace.id, email, user.id);
    await refresh();
    toast.success(
      result.type === "added"
        ? "Team member added to workspace"
        : "Invite sent — they can sign up once with this email",
    );
  };

  const handleRemoveMember = async (userId: string) => {
    if (!workspace) return;
    await removeTeamMember(workspace.id, userId, workspace.ownerId);
    await refresh();
    toast.success("Team member removed");
  };

  const handleCreateTask = async (projectId: string, title: string) => {
    if (!user) return;
    const task = await createTask(projectId, user.id, { title });
    setTasks((t) => [...t, task]);
    useBoardStore.getState().addTask(task);
    toast.success("Task added");
  };

  const handleMoveTask = async (taskId: string, toStatus: TaskStatus, toIndex: number) => {
    boardMoveTask(taskId, toStatus, toIndex);
    const updated = useBoardStore.getState().tasks;
    setTasks(updated);
    const moved = updated.find((t) => t.id === taskId);
    if (!moved) return;
    try {
      await updateTaskInDb(taskId, { status: toStatus, position: toIndex });
      const sameColumn = updated.filter(
        (t) => t.projectId === moved.projectId && t.status === toStatus,
      );
      await Promise.all(
        sameColumn.map((t, i) => updateTaskInDb(t.id, { position: i })),
      );
    } catch {
      toast.error("Failed to save task move");
      refresh();
    }
  };

  const handleSendMessage = async (projectId: string, body: string) => {
    if (!user) return;
    await sendMessage(projectId, user.id, body);
  };

  const handleSaveProfile = async (patch: { full_name?: string; title?: string }) => {
    if (!user) return;
    await updateProfile(user.id, patch);
    await refresh();
    toast.success("Profile saved");
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markNotificationsRead(user.id);
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  };

  const value = useMemo(
    () => ({
      loading: authLoading || loading,
      workspace,
      me,
      isOwner,
      team,
      pendingInvites,
      projects,
      tasks,
      activities,
      notifications,
      userById,
      refresh,
      createProject: handleCreateProject,
      updateProject: handleUpdateProject,
      deleteProject: handleDeleteProject,
      inviteMember: handleInviteMember,
      removeMember: handleRemoveMember,
      createTask: handleCreateTask,
      moveTask: handleMoveTask,
      sendProjectMessage: handleSendMessage,
      saveProfile: handleSaveProfile,
      markAllNotificationsRead: handleMarkAllRead,
    }),
    [
      authLoading,
      loading,
      workspace,
      me,
      isOwner,
      team,
      pendingInvites,
      projects,
      tasks,
      activities,
      notifications,
      userById,
      refresh,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

export function useAppDataOptional() {
  return useContext(AppDataContext);
}
