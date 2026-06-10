import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertOwnerAccess, getAdminClient } from "@/lib/supabase/admin-server";
import { normalizeEmail } from "@/lib/permissions";

const memberInput = z.object({
  accessToken: z.string().min(1),
  workspaceId: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).optional(),
  phone: z.string().optional(),
});

export const createTeamMember = createServerFn({ method: "POST" })
  .inputValidator(
    memberInput.extend({ password: z.string().min(8) }),
  )
  .handler(async ({ data }) => {
    await assertOwnerAccess(data.accessToken);
    const admin = getAdminClient();
    const email = normalizeEmail(data.email);
    const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();

    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        phone: data.phone?.trim() || "",
      },
    });
    if (error) throw new Error(error.message);

    const userId = created.user.id;

    await admin.from("profiles").upsert({
      id: userId,
      email,
      full_name: fullName,
      first_name: data.firstName.trim(),
      last_name: data.lastName.trim(),
      phone: data.phone?.trim() || "",
    });

    await admin.from("user_roles").upsert(
      { user_id: userId, role: "member" },
      { onConflict: "user_id,role" },
    );

    const { error: memberError } = await admin.from("workspace_members").upsert(
      { workspace_id: data.workspaceId, user_id: userId, role: "member" },
      { onConflict: "workspace_id,user_id" },
    );
    if (memberError) throw new Error(memberError.message);

    await admin.from("workspace_invites").delete().eq("email", email);

    return { id: userId };
  });

export const updateTeamMember = createServerFn({ method: "POST" })
  .inputValidator(
    memberInput.extend({
      userId: z.string().uuid(),
      password: z.string().min(8).optional(),
    }),
  )
  .handler(async ({ data }) => {
    await assertOwnerAccess(data.accessToken);
    const admin = getAdminClient();
    const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();

    const authPatch: { email?: string; password?: string; user_metadata?: Record<string, string> } = {
      user_metadata: {
        full_name: fullName,
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        phone: data.phone?.trim() || "",
      },
    };
    if (data.password) authPatch.password = data.password;

    const { error: authError } = await admin.auth.admin.updateUserById(data.userId, authPatch);
    if (authError) throw new Error(authError.message);

    const { error: profileError } = await admin.from("profiles").update({
      full_name: fullName,
      first_name: data.firstName.trim(),
      last_name: data.lastName.trim(),
      phone: data.phone?.trim() || "",
    }).eq("id", data.userId);
    if (profileError) throw new Error(profileError.message);

    return { ok: true };
  });

export const deleteTeamMember = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string().min(1),
      workspaceId: z.string().uuid(),
      userId: z.string().uuid(),
    }),
  )
  .handler(async ({ data }) => {
    const owner = await assertOwnerAccess(data.accessToken);
    if (data.userId === owner.id) throw new Error("Cannot delete the workspace owner.");

    const admin = getAdminClient();

    const { data: projects } = await admin
      .from("projects")
      .select("id")
      .eq("workspace_id", data.workspaceId);
    const projectIds = (projects || []).map((p) => p.id);
    if (projectIds.length) {
      await admin.from("project_members").delete().eq("user_id", data.userId).in("project_id", projectIds);
    }

    await admin.from("workspace_members").delete()
      .eq("workspace_id", data.workspaceId)
      .eq("user_id", data.userId);

    await admin.from("direct_messages").delete()
      .eq("workspace_id", data.workspaceId)
      .or(`sender_id.eq.${data.userId},recipient_id.eq.${data.userId}`);

    const { error } = await admin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);

    return { ok: true };
  });
