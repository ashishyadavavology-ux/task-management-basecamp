import { supabase } from "@/integrations/supabase/client";
import type { Priority, ProjectStatus, TaskStatus } from "@/lib/types";
import {
  mapActivity,
  mapMessage,
  mapNotification,
  mapProfile,
  mapProject,
  mapTask,
} from "./mappers";

export async function ensureWorkspace(userId: string, userName?: string) {
  const { data: existing } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(id, name, plan, owner_id)")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (existing?.workspaces) {
    const ws = existing.workspaces as { id: string; name: string; plan: string | null };
    return { id: ws.id, name: ws.name, plan: ws.plan || "Starter" };
  }

  const name = `${userName?.trim() || "My"}'s Workspace`;
  const { data: workspace, error } = await supabase
    .from("workspaces")
    .insert({ name, owner_id: userId })
    .select("id, name, plan")
    .single();

  if (error) throw error;

  await supabase.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: userId,
    role: "admin",
  });

  return workspace;
}

export async function fetchWorkspaceData(userId: string) {
  const workspace = await ensureWorkspace(userId);

  const { data: memberRows } = await supabase
    .from("workspace_members")
    .select("user_id, role")
    .eq("workspace_id", workspace.id);

  const memberIds = (memberRows || []).map((m) => m.user_id);

  const { data: profileRows } = await supabase
    .from("profiles")
    .select("id, full_name, email, title, avatar_color")
    .in("id", memberIds.length ? memberIds : [userId]);

  const roleByUser = new Map((memberRows || []).map((m) => [m.user_id, m.role]));
  const team = (profileRows || []).map((p) =>
    mapProfile(p, (roleByUser.get(p.id) as "admin" | "manager" | "member") || "member"),
  );

  const { data: projectRows } = await supabase
    .from("projects")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  const projectIds = (projectRows || []).map((p) => p.id);

  let memberMap: Record<string, string[]> = {};
  if (projectIds.length) {
    const { data: pmRows } = await supabase
      .from("project_members")
      .select("project_id, user_id")
      .in("project_id", projectIds);
    memberMap = (pmRows || []).reduce<Record<string, string[]>>((acc, row) => {
      (acc[row.project_id] ||= []).push(row.user_id);
      return acc;
    }, {});
  }

  const projects = (projectRows || []).map((p) =>
    mapProject(p, memberMap[p.id] || [userId]),
  );

  let tasks: ReturnType<typeof mapTask>[] = [];
  if (projectIds.length) {
    const { data: taskRows } = await supabase
      .from("tasks")
      .select("*")
      .in("project_id", projectIds)
      .order("position");
    tasks = (taskRows || []).map((t) => mapTask(t));
  }

  let activities: ReturnType<typeof mapActivity>[] = [];
  if (projectIds.length) {
    const { data: activityRows } = await supabase
      .from("activities")
      .select("*")
      .in("project_id", projectIds)
      .order("created_at", { ascending: false })
      .limit(20);
    activities = (activityRows || []).map(mapActivity);
  }

  const { data: notificationRows } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  const notifications = (notificationRows || []).map(mapNotification);

  const me = team.find((u) => u.id === userId) || mapProfile({
    id: userId,
    full_name: "You",
    email: "",
    title: "",
    avatar_color: null,
  });

  return {
    workspace: { ...workspace, memberCount: team.length },
    me,
    team,
    projects,
    tasks,
    activities,
    notifications,
  };
}

export async function createProject(
  workspaceId: string,
  userId: string,
  input: {
    name: string;
    description?: string;
    status?: ProjectStatus;
    priority?: Priority;
    dueDate?: string;
  },
) {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      workspace_id: workspaceId,
      name: input.name,
      description: input.description || "",
      status: input.status || "planning",
      priority: input.priority || "medium",
      due_date: input.dueDate || null,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("project_members").insert({
    project_id: data.id,
    user_id: userId,
  });

  await supabase.from("activities").insert({
    project_id: data.id,
    user_id: userId,
    action: "created",
    target: input.name,
  });

  return mapProject(data, [userId]);
}

export async function createTask(
  projectId: string,
  userId: string,
  input: {
    title: string;
    status?: TaskStatus;
    priority?: Priority;
    dueDate?: string | null;
  },
) {
  const { data: existing } = await supabase
    .from("tasks")
    .select("position")
    .eq("project_id", projectId)
    .eq("status", input.status || "todo")
    .order("position", { ascending: false })
    .limit(1);

  const position = (existing?.[0]?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id: projectId,
      title: input.title,
      status: input.status || "todo",
      priority: input.priority || "medium",
      due_date: input.dueDate || null,
      position,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("activities").insert({
    project_id: projectId,
    user_id: userId,
    action: "created",
    target: input.title,
  });

  return mapTask(data);
}

export async function updateTaskInDb(
  taskId: string,
  patch: Partial<{ status: TaskStatus; position: number; title: string; priority: Priority }>,
) {
  const dbPatch: Record<string, unknown> = {};
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.position !== undefined) dbPatch.position = patch.position;
  if (patch.title !== undefined) dbPatch.title = patch.title;
  if (patch.priority !== undefined) dbPatch.priority = patch.priority;

  const { error } = await supabase.from("tasks").update(dbPatch).eq("id", taskId);
  if (error) throw error;
}

export async function fetchMessages(projectId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at");
  if (error) throw error;
  return (data || []).map(mapMessage);
}

export async function sendMessage(projectId: string, userId: string, body: string) {
  const { data, error } = await supabase
    .from("messages")
    .insert({ project_id: projectId, user_id: userId, body })
    .select()
    .single();
  if (error) throw error;
  return mapMessage(data);
}

export async function updateProfile(
  userId: string,
  patch: { full_name?: string; title?: string },
) {
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) throw error;
}

export async function markNotificationsRead(userId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) throw error;
}
