import { createClient } from "@supabase/supabase-js";
import { OWNER_EMAIL } from "@/lib/permissions";

function getServiceConfig() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) {
    throw new Error(
      "Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env (server only, never VITE_).",
    );
  }
  return { url, serviceKey };
}

export function getAdminClient() {
  const { url, serviceKey } = getServiceConfig();
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function assertOwnerAccess(accessToken: string) {
  const admin = getAdminClient();
  const { data, error } = await admin.auth.getUser(accessToken);
  if (error || !data.user) throw new Error("Unauthorized");
  const email = data.user.email?.trim().toLowerCase() || "";
  if (email !== OWNER_EMAIL.toLowerCase()) {
    throw new Error("Only Ashish (workspace owner) can manage team members.");
  }
  return data.user;
}
