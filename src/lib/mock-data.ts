import type {
  Activity,
  CalendarEvent,
  Message,
  Notification,
  Project,
  Task,
  User,
} from "./types";

// Seed data — mirrors the Supabase schema so the UI is fully functional
// before the live database is wired in.

export const currentUserId = "u1";

export const users: User[] = [
  { id: "u1", name: "Ashish Yadav", firstName: "Ashish", lastName: "Yadav", phone: "", email: "ashish@basecamp.app", role: "admin", avatarColor: "oklch(0.58 0.17 252)", initials: "AY", title: "Basecamp Project Management" },
  { id: "u2", name: "Marcus Reed", firstName: "Marcus", lastName: "Reed", phone: "", email: "marcus@hearth.app", role: "manager", avatarColor: "oklch(0.65 0.16 155)", initials: "MR", title: "Product Lead" },
  { id: "u3", name: "Lena Okafor", firstName: "Lena", lastName: "Okafor", phone: "", email: "lena@hearth.app", role: "member", avatarColor: "oklch(0.62 0.2 300)", initials: "LO", title: "Designer" },
  { id: "u4", name: "Diego Torres", firstName: "Diego", lastName: "Torres", phone: "", email: "diego@hearth.app", role: "member", avatarColor: "oklch(0.78 0.15 75)", initials: "DT", title: "Engineer" },
  { id: "u5", name: "Priya Nair", firstName: "Priya", lastName: "Nair", phone: "", email: "priya@hearth.app", role: "manager", avatarColor: "oklch(0.65 0.21 20)", initials: "PN", title: "Ops Manager" },
  { id: "u6", name: "Sam Whitfield", firstName: "Sam", lastName: "Whitfield", phone: "", email: "sam@hearth.app", role: "member", avatarColor: "oklch(0.55 0.12 200)", initials: "SW", title: "QA Engineer" },
];

export const workspace = {
  id: "w1",
  name: "Basecamp Project Management",
  plan: "Pro",
  memberCount: users.length,
};

export const projects: Project[] = [
  {
    id: "p1",
    name: "Mobile App Redesign",
    description: "Refresh the onboarding flow and introduce a new design system across iOS and Android.",
    status: "active",
    priority: "high",
    color: "oklch(0.58 0.17 252)",
    dueDate: "2026-07-15",
    progress: 62,
    memberIds: ["u1", "u2", "u3", "u4"],
    tags: ["design", "mobile"],
  },
  {
    id: "p2",
    name: "Q3 Marketing Launch",
    description: "Plan and execute the multi-channel campaign for the summer product launch.",
    status: "planning",
    priority: "medium",
    color: "oklch(0.65 0.16 155)",
    dueDate: "2026-08-01",
    progress: 28,
    memberIds: ["u1", "u5", "u3"],
    tags: ["marketing", "growth"],
  },
  {
    id: "p3",
    name: "API Platform v2",
    description: "Migrate core services to the new gateway and ship public developer docs.",
    status: "active",
    priority: "urgent",
    color: "oklch(0.62 0.2 300)",
    dueDate: "2026-06-25",
    progress: 47,
    memberIds: ["u2", "u4", "u6"],
    tags: ["backend", "infra"],
  },
  {
    id: "p4",
    name: "Customer Success Playbook",
    description: "Document onboarding, escalation, and renewal workflows for the CS team.",
    status: "on_hold",
    priority: "low",
    color: "oklch(0.78 0.15 75)",
    dueDate: "2026-09-10",
    progress: 15,
    memberIds: ["u5", "u6"],
    tags: ["ops"],
  },
];

const t = (
  id: string,
  projectId: string,
  title: string,
  status: Task["status"],
  priority: Task["priority"],
  assigneeId: string | null,
  dueDate: string | null,
  order: number,
  extra: Partial<Task> = {},
): Task => ({
  id,
  projectId,
  title,
  description: extra.description ?? "",
  status,
  priority,
  assigneeId,
  dueDate,
  tags: extra.tags ?? [],
  subtasks: extra.subtasks ?? [],
  commentCount: extra.commentCount ?? 0,
  attachmentCount: extra.attachmentCount ?? 0,
  order,
});

export const tasks: Task[] = [
  t("t1", "p1", "Audit current onboarding screens", "done", "medium", "u3", "2026-06-05", 0, { commentCount: 4, tags: ["research"] }),
  t("t2", "p1", "Design new welcome flow", "in_progress", "high", "u3", "2026-06-18", 0, { commentCount: 2, attachmentCount: 3, subtasks: [{ id: "s1", title: "Wireframes", done: true }, { id: "s2", title: "Hi-fi mockups", done: false }] }),
  t("t3", "p1", "Build reusable component library", "in_progress", "high", "u4", "2026-06-22", 1, { commentCount: 1, tags: ["dev"] }),
  t("t4", "p1", "Usability test with 5 users", "todo", "medium", "u2", "2026-06-28", 0, {}),
  t("t5", "p1", "Ship to TestFlight", "review", "urgent", "u4", "2026-06-30", 0, { commentCount: 6 }),
  t("t6", "p1", "Update marketing screenshots", "todo", "low", "u1", "2026-07-02", 1, {}),

  t("t7", "p3", "Define gateway routing rules", "done", "high", "u2", "2026-06-02", 0, {}),
  t("t8", "p3", "Migrate auth service", "in_progress", "urgent", "u4", "2026-06-20", 0, { commentCount: 3, attachmentCount: 1 }),
  t("t9", "p3", "Write developer docs", "todo", "medium", "u6", "2026-06-24", 0, { tags: ["docs"] }),
  t("t10", "p3", "Load test new endpoints", "review", "high", "u6", "2026-06-23", 0, {}),

  t("t11", "p2", "Draft campaign brief", "in_progress", "medium", "u5", "2026-06-19", 0, {}),
  t("t12", "p2", "Source creative assets", "todo", "low", "u3", "2026-07-10", 0, {}),
  t("t13", "p2", "Set up analytics tracking", "todo", "medium", "u1", "2026-07-05", 1, {}),

  t("t14", "p4", "Outline escalation matrix", "todo", "low", "u5", "2026-08-01", 0, {}),
];

export const activities: Activity[] = [
  { id: "a1", userId: "u3", action: "completed", target: "Audit current onboarding screens", projectId: "p1", createdAt: "2026-06-08T09:12:00Z" },
  { id: "a2", userId: "u4", action: "moved", target: "Migrate auth service to In Progress", projectId: "p3", createdAt: "2026-06-08T08:40:00Z" },
  { id: "a3", userId: "u2", action: "commented on", target: "Ship to TestFlight", projectId: "p1", createdAt: "2026-06-07T17:05:00Z" },
  { id: "a4", userId: "u5", action: "created", target: "Draft campaign brief", projectId: "p2", createdAt: "2026-06-07T14:20:00Z" },
  { id: "a5", userId: "u1", action: "added", target: "Priya Nair to Q3 Marketing Launch", projectId: "p2", createdAt: "2026-06-07T11:00:00Z" },
  { id: "a6", userId: "u6", action: "uploaded", target: "loadtest-results.pdf", projectId: "p3", createdAt: "2026-06-06T16:32:00Z" },
];

export const messages: Message[] = [
  { id: "m1", projectId: "p1", userId: "u2", body: "Morning team! Reviewed the new welcome flow — looking sharp 🔥", createdAt: "2026-06-08T08:30:00Z", isPinned: false, editedAt: null, attachmentUrl: null, attachmentName: null, attachmentType: null },
  { id: "m2", projectId: "p1", userId: "u3", body: "Thanks @Marcus! Pushing hi-fi mockups by EOD.", createdAt: "2026-06-08T08:34:00Z", isPinned: false, editedAt: null, attachmentUrl: null, attachmentName: null, attachmentType: null },
  { id: "m3", projectId: "p1", userId: "u4", body: "Component library is ~70% done. Need final tokens from design.", createdAt: "2026-06-08T09:01:00Z", isPinned: false, editedAt: null, attachmentUrl: null, attachmentName: null, attachmentType: null },
  { id: "m4", projectId: "p1", userId: "u1", body: "Great pace everyone. Let's sync at 2pm on TestFlight timing.", createdAt: "2026-06-08T09:15:00Z", isPinned: true, editedAt: null, attachmentUrl: null, attachmentName: null, attachmentType: null },
];

export const notifications: Notification[] = [
  { id: "n1", type: "assigned", title: "New task assigned", body: "Marcus assigned you 'Usability test with 5 users'", read: false, createdAt: "2026-06-08T09:20:00Z" },
  { id: "n2", type: "mention", title: "You were mentioned", body: "Lena mentioned you in Mobile App Redesign", read: false, createdAt: "2026-06-08T08:34:00Z" },
  { id: "n3", type: "deadline", title: "Deadline approaching", body: "'Ship to TestFlight' is due in 2 days", read: false, createdAt: "2026-06-08T07:00:00Z" },
  { id: "n4", type: "comment", title: "New comment", body: "Diego commented on 'Migrate auth service'", read: true, createdAt: "2026-06-07T16:10:00Z" },
  { id: "n5", type: "system", title: "Welcome to Basecamp", body: "Your workspace Basecamp Project Management is ready.", read: true, createdAt: "2026-06-01T10:00:00Z" },
];

export const events: CalendarEvent[] = [
  { id: "e1", title: "Ship to TestFlight", date: "2026-06-30", type: "deadline", projectId: "p1" },
  { id: "e2", title: "API v2 launch", date: "2026-06-25", type: "deadline", projectId: "p3" },
  { id: "e3", title: "Design sync", date: "2026-06-12", type: "meeting", projectId: "p1" },
  { id: "e4", title: "Sprint planning", date: "2026-06-15", type: "meeting" },
  { id: "e5", title: "Campaign brief due", date: "2026-06-19", type: "deadline", projectId: "p2" },
  { id: "e6", title: "Team offsite", date: "2026-06-20", type: "event" },
];

export const userById = (id: string | null) => users.find((u) => u.id === id);
export const projectById = (id: string) => projects.find((p) => p.id === id);
