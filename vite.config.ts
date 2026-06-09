import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import netlify from "@netlify/vite-plugin-tanstack-start";
import { loadEnv } from "vite";

const env = loadEnv(process.env.NODE_ENV ?? "production", process.cwd(), "");

export default defineConfig({
  nitro: { preset: "netlify" },
  vite: {
    envDir: process.cwd(),
    plugins: [netlify()],
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(env.VITE_SUPABASE_URL ?? ""),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(
        env.VITE_SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
      ),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
        env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.VITE_SUPABASE_ANON_KEY ?? "",
      ),
    },
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});
