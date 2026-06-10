import type {
  Activity,
  Message,
  Notification,
  Priority,
  Project,
  ProjectStatus,
  Role,
  Task,
  TaskStatus,
  User,
} from "@/lib/types";

/** Replace legacy Lovable branding with Basecamp in user-visible text. */
export function sanitizeBrandText(text: string): string {
  if (!text) return text;
  return text
    .replace(/\blovable\s+project\b/gi, "Basecamp Project")
    .replace(/\blovable\b/gi, "Basecamp");
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function mapProfile(
  row: {
    id: string;
    full_name: string | null;
    first_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
    email: string | null;
    title: string | null;
    avatar_color: string | null;
  },
  role: Role = "member",
): User {
  const firstName = row.first_name || row.full_name?.split(" ")[0] || "";
  const lastName =
    row.last_name ||
    (row.full_name?.includes(" ") ? row.full_name.split(" ").slice(1).join(" ") : "");
  const name = row.full_name || `${firstName} ${lastName}`.trim() || row.email || "User";
  return {
    id: row.id,
    name,
    firstName,
    lastName,
    phone: row.phone || "",
    email: row.email || "",
    role,
    avatarColor: row.avatar_color || "oklch(0.52 0.14 42)",
    initials: initials(name),
    title: row.title || "",
  };
}

export function mapProject(
  row: {
    id: string;
    name: string;
    description: string | null;
    status: ProjectStatus;
    priority: Priority;
    color: string | null;
    due_date: string | null;
    progress: number;
    tags: string[] | null;
  },
  memberIds: string[],
): Project {
  return {
    id: row.id,
    name: sanitizeBrandText(row.name),
    description: sanitizeBrandText(row.description || ""),
    status: row.status,
    priority: row.priority,
    color: row.color || "oklch(0.52 0.14 42)",
    dueDate: row.due_date || new Date().toISOString().slice(0, 10),
    progress: row.progress,
    memberIds,
    tags: row.tags || [],
  };
}

export function mapTask(
  row: {
    id: string;
    project_id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: Priority;
    assignee_id: string | null;
    due_date: string | null;
    tags: string[] | null;
    position: number;
  },
  extras?: { commentCount?: number; attachmentCount?: number },
): Task {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description || "",
    status: row.status,
    priority: row.priority,
    assigneeId: row.assignee_id,
    dueDate: row.due_date,
    tags: row.tags || [],
    subtasks: [],
    commentCount: extras?.commentCount ?? 0,
    attachmentCount: extras?.attachmentCount ?? 0,
    order: row.position,
  };
}

export function mapActivity(row: {
  id: string;
  user_id: string;
  action: string;
  target: string;
  project_id: string | null;
  created_at: string;
}): Activity {
  return {
    id: row.id,
    userId: row.user_id,
    action: row.action,
    target: row.target,
    projectId: row.project_id || undefined,
    createdAt: row.created_at,
  };
}

export function mapMessage(row: {
  id: string;
  project_id: string;
  user_id: string;
  body: string;
  created_at: string;
  is_pinned?: boolean;
  edited_at?: string | null;
  attachment_url?: string | null;
  attachment_name?: string | null;
  attachment_type?: string | null;
}): Message {
  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id,
    body: row.body,
    createdAt: row.created_at,
    isPinned: row.is_pinned ?? false,
    editedAt: row.edited_at ?? null,
    attachmentUrl: row.attachment_url ?? null,
    attachmentName: row.attachment_name ?? null,
    attachmentType: (row.attachment_type as Message["attachmentType"]) ?? null,
  };
}

export function mapNotification(row: {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
}): Notification {
  return {
    id: row.id,
    type: row.type as Notification["type"],
    title: row.title,
    body: row.body || "",
    read: row.read,
    createdAt: row.created_at,
  };
}
