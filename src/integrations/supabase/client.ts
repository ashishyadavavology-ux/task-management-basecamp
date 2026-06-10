import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function readEnv(key: string): string {
  const val = import.meta.env[key as keyof ImportMetaEnv];
  return typeof val === "string" ? val.trim() : "";
}

export const supabaseUrl = readEnv("VITE_SUPABASE_URL");
export const supabaseAnonKey =
  readEnv("VITE_SUPABASE_ANON_KEY") || readEnv("VITE_SUPABASE_PUBLISHABLE_KEY");

/** Separate client for admin actions that must not touch the logged-in session. */
export function createEphemeralClient(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(supabaseConfigError ?? "Supabase is not configured");
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export const supabaseConfigError = (() => {
  if (!supabaseUrl) {
    return "Missing VITE_SUPABASE_URL in .env — copy Project URL from Supabase → Settings → API.";
  }
  if (!supabaseAnonKey) {
    return "Missing VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY) in .env.";
  }
  if (!supabaseUrl.includes("supabase.co") || supabaseUrl.includes("placeholder")) {
    return "Invalid VITE_SUPABASE_URL. Restart dev server after editing .env.";
  }
  return null;
})();

export const isSupabaseConfigured = supabaseConfigError === null;

function createSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(supabaseConfigError ?? "Supabase is not configured");
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) _client = createSupabaseClient();
  return _client;
}

/** @deprecated use getSupabase() — kept for existing imports */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return Reflect.get(getSupabase(), prop);
  },
});

export function formatAuthError(message: string): string {
  if (!isSupabaseConfigured) return supabaseConfigError!;
  if (message === "Failed to fetch" || message.includes("NetworkError")) {
    return `Cannot reach Supabase at ${supabaseUrl}. Restart dev server (npm run dev) after saving .env.`;
  }
  const lower = message.toLowerCase();
  if (lower.includes("rate limit") || lower.includes("email rate")) {
    return "Supabase email limit reached (free plan). Turn off “Confirm email” in Supabase → Authentication → Providers → Email, or add user manually in Authentication → Users.";
  }
  if (lower.includes("already registered") || lower.includes("already been registered")) {
    return "This email is already registered. Use Sign in instead.";
  }
  if (lower.includes("provider is not enabled") || lower.includes("unsupported provider")) {
    return "Google login is not enabled. Use email + password, or enable Google in Supabase → Authentication → Providers.";
  }
  if (lower.includes("invalid login credentials")) {
    return "Wrong email or password. Sign up first if you don’t have an account.";
  }
  if (lower.includes("email not confirmed") || lower.includes("email_not_confirmed")) {
    return "Email verification is still on. In Supabase: Authentication → Providers → Email → turn OFF “Confirm email”, then sign up again.";
  }
  return message;
}
