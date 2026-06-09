// Domain types for Hearth — shared across UI and (future) Supabase server fns.

export type Role = "admin" | "manager" | "member";
export type ProjectStatus = "planning" | "active" | "on_hold" | "completed";
export type Priority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "review" | "done";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarColor: string;
  initials: string;
  title: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  color: string;
  dueDate: string;
  progress: number;
  memberIds: string[];
  tags: string[];
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string | null;
  dueDate: string | null;
  tags: string[];
  subtasks: Subtask[];
  commentCount: number;
  attachmentCount: number;
  order: number;
}

export interface Activity {
  id: string;
  userId: string;
  action: string;
  target: string;
  projectId?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  projectId: string;
  userId: string;
  body: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: "assigned" | "mention" | "deadline" | "comment" | "system";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "deadline" | "meeting" | "event";
  projectId?: string;
}

export const TASK_COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
];

export const PRIORITY_META: Record<Priority, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-muted font-semibold text-muted-foreground" },
  medium: { label: "Medium", className: "bg-secondary font-semibold text-secondary-foreground" },
  high: { label: "High", className: "bg-warning/20 font-semibold text-warning-foreground" },
  urgent: { label: "Urgent", className: "bg-destructive/12 font-bold text-destructive" },
};

export const STATUS_META: Record<ProjectStatus, { label: string; className: string }> = {
  planning: { label: "Planning", className: "bg-chart-4/15 font-semibold text-chart-4" },
  active: { label: "Active", className: "bg-success/12 font-semibold text-success" },
  on_hold: { label: "On Hold", className: "bg-warning/15 font-semibold text-warning-foreground" },
  completed: { label: "Completed", className: "bg-muted font-semibold text-muted-foreground" },
};
