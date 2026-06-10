import { supabase } from "@/integrations/supabase/client";
import { isWorkspaceOwner, normalizeEmail, OWNER_EMAIL } from "@/lib/permissions";
import type { Priority, ProjectStatus, TaskStatus } from "@/lib/types";
import {
  mapActivity,
  mapMessage,
  mapNotification,
  mapProfile,
  mapProject,
  mapTask,
  sanitizeBrandText,
} from "./mappers";

export async function canSignUpWithEmail(email: string) {
  const { data, error } = await supabase.rpc("can_signup_with_email", {
    check_email: normalizeEmail(email),
  });
  if (error) throw error;
  return Boolean(data);
}

export async function ensureWorkspace(userId: string) {
  const { data: existing } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(id, name, plan, owner_id)")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (existing?.workspaces) {
    const ws = existing.workspaces as {
      id: string;
      name: string;
      plan: string | null;
      owner_id: string;
    };
    return {
      id: ws.id,
      name: sanitizeBrandText(ws.name),
      plan: ws.plan || "Starter",
      ownerId: ws.owner_id,
    };
  }

  throw new Error("You are not in a workspace. Ask Ashish (admin) to invite you.");
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

  let me = team.find((u) => u.id === userId) || mapProfile({
    id: userId,
    full_name: "You",
    email: "",
    title: "",
    avatar_color: null,
  });

  const isOwner = isWorkspaceOwner(userId, workspace.ownerId, me.email);
  if (isOwner) me = { ...me, role: "admin" };

  const visibleProjects = isOwner
    ? projects
    : projects.filter((p) => p.memberIds.includes(userId));

  const visibleProjectIds = new Set(visibleProjects.map((p) => p.id));
  const visibleTasks = tasks.filter((t) => visibleProjectIds.has(t.projectId));

  return {
    workspace: { ...workspace, memberCount: team.length, ownerId: workspace.ownerId },
    me,
    isOwner,
    team,
    projects: visibleProjects,
    tasks: visibleTasks,
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
    memberIds?: string[];
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

  const memberIds = [...new Set([userId, ...(input.memberIds || [])])];
  await supabase.from("project_members").insert(
    memberIds.map((uid) => ({ project_id: data.id, user_id: uid })),
  );

  await supabase.from("activities").insert({
    project_id: data.id,
    user_id: userId,
    action: "created",
    target: input.name,
  });

  return mapProject(data, memberIds);
}

export async function setProjectMembers(projectId: string, memberIds: string[]) {
  await supabase.from("project_members").delete().eq("project_id", projectId);
  if (memberIds.length) {
    const { error } = await supabase.from("project_members").insert(
      memberIds.map((user_id) => ({ project_id: projectId, user_id })),
    );
    if (error) throw error;
  }
}

export async function inviteTeamMember(workspaceId: string, email: string, invitedBy: string) {
  const normalized = normalizeEmail(email);
  if (normalized === normalizeEmail(OWNER_EMAIL)) {
    throw new Error("Owner is already the admin.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", normalized)
    .maybeSingle();

  if (profile?.id) {
    const { error } = await supabase.from("workspace_members").upsert({
      workspace_id: workspaceId,
      user_id: profile.id,
      role: "member",
    });
    if (error) throw error;
    return { type: "added" as const };
  }

  const { error } = await supabase.from("workspace_invites").upsert({
    workspace_id: workspaceId,
    email: normalized,
    invited_by: invitedBy,
  });
  if (error) throw error;
  return { type: "invited" as const };
}

export async function removeTeamMember(workspaceId: string, userId: string, ownerId: string) {
  if (userId === ownerId) throw new Error("Cannot remove the workspace owner.");

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId);
  if (error) throw error;

  const { data: projects } = await supabase
    .from("projects")
    .select("id")
    .eq("workspace_id", workspaceId);

  const projectIds = (projects || []).map((p) => p.id);
  if (projectIds.length) {
    await supabase
      .from("project_members")
      .delete()
      .eq("user_id", userId)
      .in("project_id", projectIds);
  }
}

export async function fetchPendingInvites(workspaceId: string) {
  const { data, error } = await supabase
    .from("workspace_invites")
    .select("id, email, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
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

const CHAT_BUCKET = "chat-files";
const MAX_CHAT_FILE_BYTES = 10 * 1024 * 1024;

export function getChatAttachmentType(file: File): "image" | "pdf" | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf") return "pdf";
  return null;
}

export async function uploadChatFile(projectId: string, userId: string, file: File) {
  const type = getChatAttachmentType(file);
  if (!type) throw new Error("Only images and PDF files are allowed");
  if (file.size > MAX_CHAT_FILE_BYTES) throw new Error("File must be under 10 MB");

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${projectId}/${userId}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from(CHAT_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(CHAT_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, name: file.name, type };
}

export async function sendMessage(
  projectId: string,
  userId: string,
  body: string,
  attachment?: { url: string; name: string; type: "image" | "pdf" },
) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      project_id: projectId,
      user_id: userId,
      body: body || "",
      attachment_url: attachment?.url ?? null,
      attachment_name: attachment?.name ?? null,
      attachment_type: attachment?.type ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapMessage(data);
}

export async function updateMessage(messageId: string, body: string) {
  const { data, error } = await supabase
    .from("messages")
    .update({ body, edited_at: new Date().toISOString() })
    .eq("id", messageId)
    .select()
    .single();
  if (error) throw error;
  return mapMessage(data);
}

export async function deleteMessage(messageId: string) {
  const { error } = await supabase.from("messages").delete().eq("id", messageId);
  if (error) throw error;
}

export async function toggleMessagePin(messageId: string, isPinned: boolean) {
  const { data, error } = await supabase
    .from("messages")
    .update({ is_pinned: isPinned })
    .eq("id", messageId)
    .select()
    .single();
  if (error) throw error;
  return mapMessage(data);
}

export async function updateProject(
  projectId: string,
  input: {
    name?: string;
    description?: string;
    status?: ProjectStatus;
    priority?: Priority;
    dueDate?: string | null;
    memberIds?: string[];
  },
) {
  const dbPatch: Record<string, unknown> = {};
  if (input.name !== undefined) dbPatch.name = input.name;
  if (input.description !== undefined) dbPatch.description = input.description;
  if (input.status !== undefined) dbPatch.status = input.status;
  if (input.priority !== undefined) dbPatch.priority = input.priority;
  if (input.dueDate !== undefined) dbPatch.due_date = input.dueDate;

  const { data, error } = await supabase
    .from("projects")
    .update(dbPatch)
    .eq("id", projectId)
    .select()
    .single();
  if (error) throw error;

  if (input.memberIds !== undefined) {
    await setProjectMembers(projectId, input.memberIds);
  }

  return data;
}

export async function deleteProject(projectId: string) {
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) throw error;
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
